/* =========================================================================
   Cena do mundo: andar pela região, esbarrar no cenário, conversar com NPCs,
   atravessar portas — e, desde a Etapa 2, lembrar do que já aconteceu.

   A cena é criada UMA vez e vive a partida inteira: trocar de mapa troca o
   `Mapa` e os NPCs, mas o jogador, a câmera e os recursos assados continuam
   os mesmos. Remontar tudo a cada porta jogaria fora o canvas do cenário e
   apareceria como um tranco na tela.

   O menu de pausa e a loja NÃO são cenas: são sobreposições desenhadas por
   cima do mundo, que continua lá atrás. Trocar de cena apagaria o mapa.

   Esta classe coordena; os pedaços com vida própria moram ao lado:
     mundo/dialogo.ts    a caixa de conversa e a charada
     mundo/corteGuia.ts  o corte de câmera para a guia do terreiro
     mundo/pintor.ts     o desenho do mundo plano e do breu
     game/avisos.ts      o que placa, tranca e guia dizem ao A
     game/codigos.ts     os códigos secretos e os pulos de região
   ========================================================================= */
import { vista3D } from '../render3d/carregar.ts';
import { EM_3D } from '../render3d/relevo.ts';
import type { Vista3D } from '../render3d/vista3d.ts';
import { obterVisao3D } from '../game/config.ts';
import { assar, type Assado } from '../core/buf.ts';
import { LARGURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada, Acao } from '../core/input.ts';
import {
  Mapa, TS, objetoAtivo, type ContextoMapa, type DefMapa, type DefNPC, type DefSaida,
} from '../world/tilemap.ts';
import type { Mundo } from '../world/mundo.ts';
import { Camera } from '../world/camera.ts';
import { Ator, assarBicho, assarFolha, direcaoDe, DELTAS,
         type FolhaAssada } from '../world/actor.ts';
import { ESTILOS, type Direcao } from '../art/people.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import * as UI from '../art/ui.ts';
import { P } from '../art/palette.ts';
import { larguraTexto } from '../art/font.ts';
import { acaso } from '../core/rng.ts';
import {
  criar, evoluir, ficha, nome as nomeDe, sortearSelvagem, type Encantado,
} from '../battle/encantado.ts';
import type { Resultado, Treinador } from '../battle/engine.ts';
import type { Cenario } from '../art/battlebg.ts';
import { ITENS, adicionar, consumir, quantidade } from '../data/items.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { lugarNoMundo, regiaoDoMapa } from '../data/mundo.ts';
import { chegada, destinosDaCanoa, motivoParaNaoViajar } from '../game/viagem.ts';
import { talvezRaro } from '../game/raro.ts';
import { formaNoNivel, nivelEscalado } from '../game/escala.ts';
import { BENZE_A_CADA, fichasDaVitoria, gerarRomeiro, nivelDaRomaria } from '../game/romaria.ts';
import { gastarEncontro, podePrenderAqui, soltarDesmaiados } from '../game/desafio.ts';
import { periodo, sortearClima, tabelaDoMomento, type Clima } from '../game/tempo.ts';
import { desenharClima, tingir } from '../art/ceu.ts';
import { guardar, temTimeEmPe, curarTime, NIVEL_INICIAL, type EstadoJogo } from '../game/state.ts';
import {
  aplicarFala, contasAcesasDe, escolherFala, ligada, responder, serve, terreiroDaConta, type Condicionado, type Fala,
} from '../game/quests.ts';
import { montarAvisos, type Aviso } from '../game/avisos.ts';
import { LeitorCodigos, aplicarPulo } from '../game/codigos.ts';
import { sondarTesouro } from '../game/tesouro.ts';
import { escoltaAtiva, derrubarEscolta } from '../game/escolta.ts';
import { pisarLadrilho } from '../game/sequencia.ts';
import { avista, proximoDaRonda } from '../game/ronda.ts';
import { tracarFeixe } from '../game/feixe.ts';
import { avaliarCorrida, encerrar, type DefCorrida } from '../game/corrida.ts';
import { salvar } from '../game/save.ts';
import * as Som from '../audio/som.ts';
import { temaDaBatalha, temaDoMapa } from '../audio/temas.ts';
import type { IdMusica } from '../audio/musicas.ts';
import { raioDaLuz, RAIO_SEM_LUZ } from '../game/luz.ts';
import { empurrar, ocupadaPorPedra, posicoesIniciais, type Cova, type Pedra } from '../world/pedras.ts';
import { MenuPausa } from './menu.ts';
import { Loja } from './loja.ts';
import { EscolhaInicial } from './escolha.ts';
import { TelaCaixa } from './caixa.ts';
import { TelaRezador } from './rezador.ts';
import { TelaPoder } from './poder.ts';
import { Dialogo, type Conversa } from './mundo/dialogo.ts';
import { CorteDaGuia } from './mundo/corteGuia.ts';
import { PintorMundo } from './mundo/pintor.ts';

/* todas as corridas contra o sol do jogo, de qualquer mapa */
const CORRIDAS: readonly DefCorrida[] = Object.values(MAPAS).flatMap((d) => (d.corrida ? [d.corrida] : []));

/* um respiro de escuro entre um mapa e outro: sem isso a troca é um tranco */
const FADE = 0.18;
/* quanto tempo o "!" fica sobre a cabeça do treinador antes de ele vir */
const SUSTO = 0.7;
/* depois de uma cutscene de apresentação, a luta espera a troca de cena de
   volta terminar (o gerenciador ignora outra troca no meio de uma) */
const ESPERA_LUTA = 0.4;

interface NpcVivo {
  def: DefNPC;
  ator: Ator;
  /* quantas fugas o fujão ainda aguenta nesta visita ao mapa */
  folego: number;
  /* vigia de ronda: em que ponto do caminho está, e há quanto tempo parado */
  rondaI: number;
  rondaT: number;
}

/* quantas vezes um Sacizinho escapa antes de sentar e conversar */
const FOLEGO_PADRAO = 4;
/* a quantos passos a cutscene de encontro de um NPC dispara */
const DISTANCIA_ENCONTRO = 3;

/* um treinador que avistou o jogador e está vindo */
interface Duelo { npc: NpcVivo; fase: 'susto' | 'andando' | 'falando' | 'lutando'; t: number }

export interface PedidoBatalha {
  oponentes: Encantado[];
  /* o tema da luta (audio/temas.ts); ausente = bicho do mato */
  musica?: IdMusica;
  treinador?: Treinador | null;
  cenario?: Cenario;
  /* o bolso do treinador inimigo, nunca a mochila do jogador */
  itensIA?: Record<string, number>;
  /* o tempo que faz onde a luta começou */
  clima?: Clima;
  /* Modo Desafio: falso quando o primeiro bicho do lugar já passou */
  podePrender?: boolean;
}

export interface OpcoesCenaMundo {
  mundo: Mundo;
  estado: EstadoJogo;
  aoBatalhar: (p: PedidoBatalha) => void;
  /* o menu de pausa pode desistir da partida e voltar ao título */
  aoSair?: () => void;
  /* o campeão do Círculo Dourado vê os créditos; depois o mundo continua */
  aoCreditos?: () => void;
  /* uma cutscene da história (id em data/cutscenes.ts); depois o mundo continua */
  aoCutscene?: (id: string) => void;
}

export class CenaMundo implements Cena {
  private mapa!: Mapa;
  private def!: DefMapa;
  private camera = new Camera();
  private jogador!: Ator;
  private npcs: NpcVivo[] = [];
  private ocupados = new Set<string>();
  private avisos = new Map<string, Aviso>();

  private dialogo!: Dialogo<NpcVivo>;
  private faixaNome: Assado | null = null;
  private tempoFaixa = 0;
  private pintor!: PintorMundo;
  private tempoAnim = 0;

  private op: OpcoesCenaMundo;
  private montado = false;
  /* carência depois de uma batalha: sem isso o jogador volta ao mato e cai
     direto em outra luta, no mesmo passo */
  private carencia = 0;
  private tumPausa = 0;
  /* troca de mapa em andamento: some, troca, volta */
  private indo: DefSaida | null = null;
  /* venceu o campeão: os créditos esperam a fala de derrota fechar */
  private creditosPendentes = false;
  /* uma cutscene da história esperando a vez, como os créditos */
  private historiaPendente: string | null = null;
  /* a luta que espera a cutscene de apresentação acabar, e quanto falta
     para soltar (a troca de cena de volta precisa terminar antes) */
  private lutaDepois: NpcVivo | null = null;
  private esperaLuta = 0;
  private fade = 0;

  private duelo: Duelo | null = null;
  /* o tempo que faz, sorteado ao chegar numa região (não vai para o save) */
  private clima: Clima = 'limpo';
  /* a luta de agora é da Romaria; e o lugar do bicho do mato (Desafio) */
  private naRomaria = false;
  private lugarDoEncontro: string | null = null;
  /* recados que esperam a tela livre (os soltos do Desafio, o fim da Romaria) */
  private recados: { quem: string; linhas: string[] }[] = [];
  private regiaoDoTempo: string | null = null;
  private menu: MenuPausa | null = null;
  private loja: Loja | null = null;
  private escolha: EscolhaInicial | null = null;
  private telaCaixa: TelaCaixa | null = null;
  private telaRezador: TelaRezador | null = null;
  private telaPoder: TelaPoder | null = null;
  private emMenu = false;
  private emLoja = false;
  private emEscolha = false;
  private emCaixa = false;
  private emRezador = false;
  private emPoder = false;
  /* deslizando numa poça: o passo continua sozinho até bater em alguma coisa */
  private deslizando = false;
  /* quem está sendo escoltado anda um passo atrás do jogador (game/escolta.ts) */
  private seguidor: Ator | null = null;
  private seguidorId: string | null = null;
  /* os tiles por onde passa o feixe de luz deste mapa (vazio sem feixe) */
  private feixe: [number, number][] = [];
  /* segundos que faltam em cada corrida em andamento, pela flag `ativa` */
  private relogios = new Map<string, number>();
  /* quantos ladrilhos de memória certos seguidos, neste mapa, nesta visita */
  private progressoLadrilhos = 0;
  /* folhas de sprite assadas uma vez por estilo, valem para todos os mapas */
  private folhas = new Map<string, FolhaAssada>();
  /* pedras que se empurram: posição de cada uma, na sala atual */
  private pedras: Pedra[] = [];
  /* resultado da última batalha, aplicado quando a cena volta a ser a da vez */
  private pendente: Resultado | null = null;
  private pendenteEntrouNoTime = false;
  /* uma conta da guia acendeu: o corte de câmera espera a vez, sem interromper
     conversa, batalha ou qualquer outra coisa que já esteja tomando a tela */
  private corte = new CorteDaGuia();
  /* últimos botões apertados, andando livre — é contra isto que o código
     secreto é comparado a cada quadro */
  private codigos = new LeitorCodigos();

  constructor(op: OpcoesCenaMundo) {
    this.op = op;
  }

  /* conversa ou charada na tela: o mundo espera */
  private get falando(): boolean {
    return this.dialogo.conversa !== null || this.dialogo.pergunta !== null;
  }

  /* ------------------------------------------------------------- montagem */

  entrar(): void {
    if (this.montado) {
      this.tempoFaixa = 0;
      this.dialogo.conversa = null;
      this.carencia = 0.6;
      Som.musica(temaDoMapa(this.def));     // de volta da batalha ou da cutscene
      if (this.lutaDepois) this.esperaLuta = ESPERA_LUTA;
      this.resolverBatalha();
      return;
    }
    this.montado = true;

    // recursos visuais assados uma vez, valem para todos os mapas
    this.dialogo = new Dialogo(this.op.estado);
    this.pintor = new PintorMundo();
    this.menu = new MenuPausa({
      estado: this.op.estado,
      clima: () => this.climaAqui(),
      canoa: () => {
        const destinos = destinosDaCanoa(this.op.estado, MAPAS, lugarNoMundo(this.def.id, MAPAS));
        return { destinos, motivo: motivoParaNaoViajar(this.op.estado, { correndo: this.relogios.size > 0, destinos: destinos.length }) };
      },
      sondar: () => {
        const ctx = this.contexto();
        return sondarTesouro(this.def, (o) => objetoAtivo(o, ctx),
                             this.jogador.tx, this.jogador.ty).texto;
      },
    });
    this.loja = new Loja(this.op.estado);
    this.escolha = new EscolhaInicial();
    this.telaCaixa = new TelaCaixa(this.op.estado);
    this.telaRezador = new TelaRezador(this.op.estado);
    this.telaPoder = new TelaPoder(this.op.estado);

    /* o relógio de uma corrida não vai para o save: quem volta com uma
       corrida ativa perde ela (e os marcos) e recomeça quando quiser */
    for (const c of CORRIDAS) if (this.op.estado.flags[c.ativa]) encerrar(c, this.op.estado.flags, false);

    const pos = this.op.estado.posicao;
    this.jogador = new Ator(this.folhaDe(this.op.estado.personagem), pos.tx, pos.ty, pos.dir);
    this.montarMapa(pos.mapa, { gravar: false });
    // quem gravou dentro da arena já foi mandado para a entrada dela
    if (!this.def.zeraAoEntrar) this.jogador.teleportar(pos.tx, pos.ty, pos.dir);
    this.centrarCamera();
  }

  /* o pouco que um mapa precisa saber da partida para se desenhar */
  private contexto(): ContextoMapa {
    const e = this.op.estado;
    return {
      contas: (terreiro) => contasAcesasDe(e, terreiro),
      nadar: ligada(e, 'dom_nadar'),
      ligada: (c) => ligada(e, c),
    };
  }

  /* troca o cenário, os NPCs e os avisos; o jogador continua sendo o mesmo */
  private montarMapa(id: string, opt: { gravar?: boolean } = {}): void {
    /* o torneio recomeça toda vez que se entra na arena vindo de fora: as
       flags dele se apagam ANTES de montar o mapa, para as trancas fecharem.
       Quem carrega um save gravado lá dentro volta para a entrada. */
    const vindoDe = (this.def as DefMapa | undefined)?.id;
    const zera = this.op.mundo.def(id).zeraAoEntrar;
    if (zera && vindoDe !== id) {
      for (const f of zera) delete this.op.estado.flags[f];
      if (vindoDe === undefined) {
        const i = this.op.mundo.def(id).inicio;
        this.jogador.teleportar(i.tx, i.ty, i.dir);
      }
    }
    this.mapa = this.op.mundo.obter(id, this.contexto());
    this.def = this.op.mundo.def(id);
    Som.musica(temaDoMapa(this.def));       // o mesmo tema não recomeça
    /* sair do salão da Romaria encerra a sequência */
    if (id !== 'romariaCirculo' && this.op.estado.romaria.seq > 0) this.op.estado.romaria.seq = 0;
    this.talvezMudarTempo();
    this.marcarVisita(id);
    this.dialogo.conversa = null;
    this.duelo = null;

    this.npcs = this.def.npcs
      .filter((d) => serve(this.op.estado, d))
      .map((d) => ({
        def: d,
        ator: new Ator(this.folhaDe(d.estilo), d.tx, d.ty, d.dir),
        folego: d.fujao?.folego ?? FOLEGO_PADRAO,
        rondaI: 0,
        rondaT: 0,
      }));
    this.progressoLadrilhos = 0;
    this.pedras = posicoesIniciais(this.def.pedras, (f) => ligada(this.op.estado, f));
    this.recontarOcupados();
    this.montarAvisos();
    this.seguidor = null;          // o escoltado reaparece atrás de quem chegou
    this.sincronizarSeguidor();
    this.acenderFeixe();

    // quem chega pode ser recebido com uma conversa (as boas-vindas em casa)
    const chegada = this.def.aoChegar;
    if (chegada && serve(this.op.estado, chegada)) this.abrirConversa(chegada.quem, chegada.linhas, chegada);

    // faixa com o nome do lugar — dentro de casa ela só atrapalharia
    if (this.def.interior) {
      this.faixaNome = null;
      this.tempoFaixa = 0;
    } else {
      const faixa = UI.caixa(larguraTexto(this.mapa.nome) + 20, 20);
      UI.textoNaCaixa(faixa, this.mapa.nome, 10, 6);
      this.faixaNome = assar(faixa);
      this.tempoFaixa = 2.6;
    }

    // abrigo: é aqui que se acorda depois de apagar no mato
    if (this.def.refugio) {
      this.op.estado.refugio = { mapa: id, ...this.def.inicio };
    }
    this.op.estado.posicao = { mapa: id, tx: this.jogador.tx, ty: this.jogador.ty,
                               dir: this.jogador.dir };
    if (opt.gravar !== false) salvar(this.op.estado);
  }

  /* Uma flag mudou: a guia acendeu, a tranca do Zeca caiu. O cenário é
     remontado (o Mundo devolve um `Mapa` novo só quando de fato mudou) sem
     mexer no jogador nem nos NPCs, que continuam onde estavam. */
  private atualizarCenario(): void {
    /* quem só estava ali enquanto o serviço não estava feito vai embora na
       hora: o Sacizinho que largou a rede, o bicho do farol que perdeu */
    const antes = this.npcs.length;
    this.npcs = this.npcs.filter((n) => serve(this.op.estado, n.def));
    if (this.npcs.length !== antes) this.recontarOcupados();

    this.sincronizarSeguidor();

    const novo = this.op.mundo.obter(this.def.id, this.contexto());
    if (novo === this.mapa) return;
    this.mapa = novo;
    this.montarAvisos();
    this.acenderFeixe();
  }

  /* O Mapa do Mundo só mostra onde o jogador já pisou: cada lugar ao ar livre
     (ou o de onde se entra numa casa) ganha a flag `visitou_<id>`. E quem
     já escolheu o inicial tem o mapa — inclusive save de antes dele existir. */
  private marcarVisita(id: string): void {
    const e = this.op.estado;
    const lugar = lugarNoMundo(id, MAPAS);
    if (lugar) e.flags[`visitou_${lugar}`] = true;
    if (e.flags['escolheu_inicial'] && quantidade(e.mochila, 'mapa') === 0) adicionar(e.mochila, 'mapa');
  }

  /* Refaz o caminho do feixe de luz (depois de girar um espelho, ou ao
     chegar no mapa). Se ele chega ao cristal pela primeira vez, acende a
     flag do feixe — geralmente uma conta da guia. */
  private acenderFeixe(): void {
    this.feixe = [];
    const f = this.def.feixe;
    if (!f) return;
    const ativo = (o: Condicionado) => serve(this.op.estado, o);
    const fonte = this.def.objetos.find((o) => o.tipo === 'fonteLuz' && ativo(o));
    const alvo = this.def.objetos.find((o) => o.tipo === 'cristal' && ativo(o));
    if (!fonte || !alvo) return;
    const espelhos = new Map(this.def.objetos
      .filter((o) => o.tipo === 'espelho' && ativo(o))
      .map((o) => [`${o.tx},${o.ty}`, o.inclinacao ?? '/'] as const));
    const r = tracarFeixe(fonte, fonte.dir ?? 'dir', alvo, (x, y) => this.mapa.solido(x, y),
                          (x, y) => espelhos.get(`${x},${y}`) ?? null);
    this.feixe = r.caminho;
    const e = this.op.estado;
    if (!r.acertou || e.flags[f.flag]) return;
    e.flags[f.flag] = true;
    const terreiro = this.terreiroDaFala(f.flag);
    if (terreiro) this.corte.preparar(terreiro, contasAcesasDe(e, terreiro));
    salvar(e);
    this.atualizarCenario();
    this.abrirConversa('CRISTAL', ['O feixe bate no cristal, e o cristal acende inteiro, de dentro para fora.']);
  }

  /* O relógio das corridas contra o sol: corre enquanto o jogador anda (não
     em conversa, menu ou batalha), vence com todos os marcos acesos a
     tempo, e perde — apagando os marcos — quando o tempo acaba. */
  private andarCorridas(dt: number): void {
    const e = this.op.estado;
    for (const c of CORRIDAS) {
      let resta = this.relogios.get(c.ativa) ?? null;
      if (e.flags[c.ativa] && resta === null) resta = c.segundos;
      if (resta !== null) resta -= dt;
      const r = avaliarCorrida(c, e.flags, resta);
      if (r === 'parada') { this.relogios.delete(c.ativa); continue; }
      if (r === 'correndo') { this.relogios.set(c.ativa, resta!); continue; }
      this.relogios.delete(c.ativa);
      encerrar(c, e.flags, r === 'venceu');
      this.atualizarCenario();
      if (r === 'venceu') {
        const terreiro = this.terreiroDaFala(c.conta);
        if (terreiro) this.corte.preparar(terreiro, contasAcesasDe(e, terreiro));
        salvar(e);
        this.abrirConversa('LAMPIÕES', ['O último lampião acende, e o sol some no mesmo instante. Chegou a tempo!']);
      } else {
        this.abrirConversa('LAMPIÕES', [c.fim]);
      }
    }
  }

  /* A escolta é só flag: se há alguém sendo escoltado e ele ainda não está
     na tela, aparece um passo atrás do jogador (ou no próprio tile, se atrás
     for parede); se a escolta acabou, some. */
  private sincronizarSeguidor(): void {
    const d = escoltaAtiva(this.op.estado);
    if (!d) { this.seguidor = null; this.seguidorId = null; return; }
    if (this.seguidor && this.seguidorId === d.id) return;
    const [dx, dy] = DELTAS[this.jogador.dir];
    let tx = this.jogador.tx - dx, ty = this.jogador.ty - dy;
    if (this.mapa.solido(tx, ty)) { tx = this.jogador.tx; ty = this.jogador.ty; }
    this.seguidor = new Ator(this.folhaDe(d.estilo), tx, ty, this.jogador.dir);
    this.seguidorId = d.id;
  }

  /* o jogador acabou de sair de (tx,ty): o escoltado vai para lá */
  private puxarSeguidor(tx: number, ty: number, correr: boolean): void {
    this.seguidor?.andarPara(tx, ty, correr);
  }

  /* "bicho:sacizinho" desenha o Encantado; qualquer outro nome é gente.
     Assar custa canvas, então cada estilo é assado uma vez só na partida. */
  private folhaDe(estilo: string): FolhaAssada {
    let f = this.folhas.get(estilo);
    if (f) return f;
    if (estilo.startsWith('bicho:')) {
      const arte = ARTE_CRIATURAS[estilo.slice(6)];
      f = assarBicho(arte ? arte() : ARTE_CRIATURAS['sacizinho']!());
    } else {
      f = assarFolha(ESTILOS[estilo] ?? ESTILOS['aldeao']!);
    }
    this.folhas.set(estilo, f);
    return f;
  }

  /* quem está de emboscada fica fora da tela (e da conversa, e da vista)
     até a cutscene dele tocar — mas o tile continua ocupado */
  private oculto(n: NpcVivo): boolean {
    if (n.def.emboscada !== true || n.def.encontro === undefined) return false;
    // a flag liga ao PEDIR a cutscene: até ela entrar de fato, segue escondido
    return !this.op.estado.flags[`viu_cut_${n.def.encontro}`]
        || this.historiaPendente === n.def.encontro;
  }

  private visiveis(): NpcVivo[] { return this.npcs.filter((n) => !this.oculto(n)); }

  private recontarOcupados(): void {
    this.ocupados = new Set(this.npcs.map((n) => `${n.ator.tx},${n.ator.ty}`));
  }

  private montarAvisos(): void {
    this.avisos = montarAvisos(this.def, this.op.estado, this.contexto());
  }

  private centrarCamera(): void {
    this.camera.seguir(this.jogador.px + TS / 2, this.jogador.py + TS / 2,
                       this.mapa.larguraPx, this.mapa.alturaPx);
  }

  /* ------------------------------------------------------------ conversa */

  private abrirConversa(falante: string, falas: readonly string[],
                        fala: Fala | null = null, npc: NpcVivo | null = null): void {
    this.dialogo.abrir(falante, falas, fala, npc);
  }

  /* a última página fechou: só agora a fala mexe no mundo */
  private fecharConversa(c: Conversa<NpcVivo>): void {
    if (!c.fala) { this.duelo = null; return; }

    /* charada: nada acontece ainda — a última página fica na tela, e quem
       decide o que a fala faz é a resposta escolhida */
    if (c.fala.pergunta) { this.dialogo.perguntar(c); return; }

    const e = this.op.estado;
    const terreiro = this.terreiroDaFala(c.fala.liga);
    const efeito = aplicarFala(e, c.fala, {
      adicionar: (id, n) => adicionar(e.mochila, id, n),
      consumir: (id, n) => consumir(e.mochila, id, n),
    });
    this.atualizarCenario();
    if (terreiro) this.corte.preparar(terreiro, contasAcesasDe(e, terreiro));
    this.pedirHistoria(c.fala.cutscene);

    if (efeito.batalha && c.npc?.def.treinador) {
      /* primeiro encontro: a cutscene que apresenta o treinador vem antes */
      const apres = c.npc.def.treinador.apresentacao;
      if (apres && !e.flags[`viu_cut_${apres}`] && this.op.aoCutscene && temTimeEmPe(e)) {
        this.duelo = null;
        this.pedirHistoria(apres);
        this.lutaDepois = c.npc;
        this.esperaLuta = ESPERA_LUTA;
        return;
      }
      if (temTimeEmPe(e)) { this.lutarCom(c.npc); return; }
      // sem ninguém de pé não há luta: seria derrota automática
      this.duelo = null;
      this.abrirConversa(c.npc.def.nome,
                         ['...mas os seus Encantados não estão em pé. Vá se benzer primeiro.']);
      return;
    }
    this.duelo = null;
    // o balão: a tela escurece aqui e clareia no outro mapa, como numa porta
    if (c.fala.leva) {
      const l = c.fala.leva;
      this.indo = { tx: this.jogador.tx, ty: this.jogador.ty, para: l.mapa, destino: { tx: l.tx, ty: l.ty, dir: l.dir } };
      this.fade = 0;
    }
    if (efeito.loja) { this.emLoja = true; this.loja!.abrir(); }
    if (efeito.escolher) {
      this.emEscolha = true;
      this.escolha!.abrir((id) => this.receberInicial(id));
    }
    if (efeito.caixa) { this.emCaixa = true; this.telaCaixa!.abrir(); }
    if (efeito.rezador) { this.emRezador = true; this.telaRezador!.abrir(); }
    if (efeito.romaria) { this.lutarNaRomaria(); return; }
    /* um Encantado que acaba de entrar por fala é a mesma oferta de reordenar
       que uma captura dá — só que sem passar pela tela de batalha. Se ele
       chega com cutscene (a Mãe-do-Ouro descendo do teto), a oferta ficaria
       por cima dela: aí a ordem fica para o menu */
    if (efeito.encantado && e.time.length > 1 && !c.fala.cutscene) this.abrirReordenar();
    /* gravar depois de curar, de acender uma conta, de ganhar item de serviço
       ou de conquistar medalha: são os pontos em que perder progresso doeria
       de verdade */
    if (efeito.curou || efeito.deu || efeito.levou || efeito.medalha || efeito.encantado || terreiro) {
      salvar(e);
    }
    if (efeito.medalha) this.atualizarCenario();   // o Dom muda o mapa

    if (efeito.medalha) Som.vinheta('medalha');
    else if (efeito.curou) Som.vinheta('cura');
    else if (efeito.deu || efeito.encantado) Som.vinheta('item');
  }

  /* o patuá escolhido na mesa da Dona Firmina vira o primeiro do time */
  private receberInicial(id: string): void {
    const e = this.op.estado;
    const bicho = criar(id, NIVEL_INICIAL);
    guardar(e, bicho);
    e.flags['escolheu_inicial'] = true;
    /* qual foi o inicial, para o trunfo de Brás — sem isto, um save antigo
       (de antes desta flag existir) simplesmente cai no primeiro par do
       objeto `trunfo`, nunca num "!" que quebraria a luta */
    e.flags[`inicial_${id}`] = true;
    adicionar(e.mochila, 'mapa');
    salvar(e);
    this.abrirConversa('DONA FIRMINA', [
      `${nomeDe(bicho)} é seu, ${e.nome}. Trate bem e ele trata melhor.`,
      'E leva também este MAPA DO MUNDO. Ele vai se enchendo conforme você anda.',
      'O mapa de cada região, com a planta dos lugares, fica escondido nela mesma. Olhe pelos cantos.',
      'Agora sente um pouco. Tem uma coisa que você precisa saber antes de sair por aí.',
    ]);
    /* a cutscene da Companhia chegando à Foz entra quando essa conversa
       fecha — e é ela que termina chamando para o serviço da carta */
    this.pedirHistoria('firmina');
  }

  /* abre o menu de pausa direto na página do time, com o recém-chegado
     selecionado — é o convite para trocar a ordem assim que alguém entra */
  private abrirReordenar(): void {
    this.emMenu = true;
    this.menu!.abrirEmTime('Quer mudar a ordem do time? A troca de lugar, B sai.',
                           this.op.estado.time.length - 1);
  }

  /* ----------------------------------------------------------- treinador */

  private venceu(npc: NpcVivo): boolean {
    return this.op.estado.flags[`venceu_${npc.def.id}`] === true;
  }

  /* quem está de olho na estrada vê o jogador passar */
  private olharTreinadores(): void {
    if (this.duelo || this.dialogo.conversa || this.indo) return;
    // uma cutscene de encontro vem primeiro — e a emboscada já marcou a luta
    if (this.historiaPendente || this.lutaDepois) return;
    // sem ninguém de pé, ser avistado seria derrota na hora
    if (!temTimeEmPe(this.op.estado)) return;
    for (const n of this.visiveis()) {
      const t = n.def.treinador;
      if (!t?.visao || this.venceu(n)) continue;
      const [dx, dy] = DELTAS[n.ator.dir];
      for (let i = 1; i <= t.visao; i++) {
        const x = n.ator.tx + dx * i, y = n.ator.ty + dy * i;
        if (this.mapa.solido(x, y)) break;          // parede corta a vista
        if (x === this.jogador.tx && y === this.jogador.ty) {
          this.duelo = { npc: n, fase: 'susto', t: 0 };
          return;
        }
        if (this.ocupados.has(`${x},${y}`)) break;  // outro NPC na frente
      }
    }
  }

  /* o "!" e a caminhada até o jogador, antes da primeira fala */
  private aproximar(dt: number): void {
    const d = this.duelo!;
    if (d.fase === 'susto') {
      d.t += dt;
      if (d.t >= SUSTO) d.fase = 'andando';
      return;
    }
    if (d.fase !== 'andando') return;

    const a = d.npc.ator;
    const perto = Math.abs(a.tx - this.jogador.tx) + Math.abs(a.ty - this.jogador.ty) <= 1;
    if (perto && !a.movendo) {
      a.olharPara(this.jogador.tx, this.jogador.ty);
      this.jogador.olharPara(a.tx, a.ty);
      d.fase = 'falando';
      const t = d.npc.def.treinador!;
      this.abrirConversa(d.npc.def.nome,
                         [t.falaInicio ?? 'Parou! Vamos ver o que o seu time sabe fazer.'],
                         { linhas: [], batalha: true }, d.npc);
      return;
    }
    a.comandar(this.mapa, a.dir, false, (tx, ty) =>
      (tx === this.jogador.tx && ty === this.jogador.ty)
      || this.npcs.some((o) => o !== d.npc && o.ator.tx === tx && o.ator.ty === ty));
    if (a.atualizar(dt)) this.recontarOcupados();
  }

  private lutarCom(npc: NpcVivo): void {
    const t = npc.def.treinador!;
    this.duelo = { npc, fase: 'lutando', t: 0 };
    /* bicho não é treinador: sem painel de treinador, e o patuá funciona.
       Prender o Boitatá do farol vale tanto quanto derrubá-lo. */
    /* a revanche que cresce vem no nível do melhor do time do jogador */
    const nv = (c: { nivel: number }) => (t.escala ? nivelEscalado(this.op.estado, t.escala) : c.nivel);
    const oponentes = t.time.map((c) => {
      const nivel = nv(c);
      return criar(t.escala ? formaNoNivel(c.especie, nivel) : c.especie, nivel, { selvagem: t.selvagem });
    });
    if (t.trunfo) {
      const e = this.op.estado;
      const chave = Object.keys(t.trunfo).find((esp) => e.flags[`inicial_${esp}`] === true);
      const escolhido = (chave ? t.trunfo[chave] : undefined) ?? Object.values(t.trunfo)[0]!;
      oponentes.push(criar(escolhido.especie, escolhido.nivel));
    }
    this.op.aoBatalhar({
      oponentes,
      treinador: t.selvagem ? null : {
        nome: npc.def.nome, classe: t.classe,
        falaInicio: t.falaInicio, falaDerrota: t.falaDerrota, premio: t.premio,
        esperta: t.esperta,
      },
      itensIA: t.selvagem ? undefined : t.itens,
      cenario: this.def.cenario ?? 'praia',
      musica: temaDaBatalha(t),
      clima: this.climaAqui(),
    });
  }

  /* o main avisa como terminou; a cena aplica quando volta a ser a da vez */
  voltouDaBatalha(r: Resultado, entrouNoTime = false): void {
    this.pendente = r;
    this.pendenteEntrouNoTime = entrouNoTime;
  }

  private resolverBatalha(): void {
    const r = this.pendente;
    const entrouNoTime = this.pendenteEntrouNoTime;
    this.pendente = null;
    this.pendenteEntrouNoTime = false;
    if (r === null) return;

    const e0 = this.op.estado;
    /* Desafio: quem caiu é solto, e o lugar do bicho do mato fica gasto */
    const soltos = soltarDesmaiados(e0);
    if (soltos.length) {
      this.recados.push({ quem: 'DESAFIO', linhas: [`${soltos.join(', ')} ${soltos.length > 1 ? 'desmaiaram e foram soltos' : 'desmaiou e foi solto'}. Boa viagem.`] });
    }
    if (this.lugarDoEncontro) { gastarEncontro(e0, this.lugarDoEncontro); this.lugarDoEncontro = null; }
    if (this.naRomaria) { this.naRomaria = false; this.fimDaLutaDaRomaria(r); }

    const d = this.duelo;
    this.duelo = null;
    if (r === 'derrota') { this.socorrer(); return; }

    /* um Encantado capturado agora mesmo entrou no time: com mais de um, a
       ordem passa a valer, e é a hora certa de oferecer a troca */
    if (entrouNoTime && this.op.estado.time.length > 1) this.abrirReordenar();

    if (!d) {
      if (entrouNoTime) salvar(this.op.estado);
      return;
    }
    // contra bicho, prender no patuá conta tanto quanto vencer
    const ganhou = r === 'vitoria' || (r === 'captura' && d.npc.def.treinador?.selvagem === true);
    if (!ganhou) return;

    const e = this.op.estado;
    const t = d.npc.def.treinador!;
    const terreiro = this.terreiroDaFala(t.liga);
    e.flags[`venceu_${d.npc.def.id}`] = true;
    const extras = t.liga === undefined ? []
                 : typeof t.liga === 'string' ? [t.liga] : t.liga;
    for (const f of extras) e.flags[f] = true;
    if (t.premio) e.dinheiro += t.premio;
    if (t.da) adicionar(e.mochila, t.da.item, t.da.n ?? 1);
    if (t.creditos) this.creditosPendentes = true;
    // preso no patuá, ninguém larga nada e sai correndo: sem a cutscene
    if (r !== 'captura') this.pedirHistoria(t.cutscene);
    d.npc.ator.olharPara(this.jogador.tx, this.jogador.ty);
    this.atualizarCenario();
    /* bicho preso no patuá não fica mais parado no cais */
    if (r === 'captura') this.sumirNpc(d.npc);
    if (terreiro) this.corte.preparar(terreiro, contasAcesasDe(e, terreiro));
    salvar(e);
    if (t.falaDerrota && r !== 'captura') this.abrirConversa(d.npc.def.nome, [t.falaDerrota]);
    // preso no patuá, o bicho não fala: o que ele carregava fica no chão
    else if (t.da && r === 'captura') {
      const nome = ITENS[t.da.item]?.nome.toUpperCase() ?? t.da.item;
      this.abrirConversa(d.npc.def.nome, [`Ficou no chão o que ele carregava: ${nome}. Guardado na mochila.`]);
    }
  }

  /* guarda a cutscene da história para tocar assim que nada estiver na tela.
     A flag é ligada já aqui, e é gravada junto com o resto do progresso:
     cada cutscene toca uma vez só por partida. */
  private pedirHistoria(id: string | undefined): void {
    if (!id || !this.op.aoCutscene) return;
    const e = this.op.estado;
    if (e.flags[`viu_cut_${id}`]) return;
    e.flags[`viu_cut_${id}`] = true;
    this.historiaPendente = id;
  }

  /* de qual terreiro é a conta que uma fala ou vitória acabou de ligar —
     nenhuma diferença de contagem: uma flag `conta_*` pertence a um único
     terreiro, e é ela que diz qual guia cortar a câmera para mostrar. */
  private terreiroDaFala(liga?: string | readonly string[]): string | null {
    const lista = liga === undefined ? [] : typeof liga === 'string' ? [liga] : liga;
    for (const f of lista) {
      const t = terreiroDaConta(f);
      if (t) return t;
    }
    return null;
  }

  private sumirNpc(npc: NpcVivo): void {
    this.npcs = this.npcs.filter((n) => n !== npc);
    this.recontarOcupados();
  }

  /* ------------------------------------------------------ código secreto */

  private verificarCodigoSecreto(entrada: Entrada): void {
    const apertados: Acao[] =
      (['cima', 'baixo', 'esq', 'dir', 'a', 'b'] as const)
        .filter((a) => entrada.apertouAgora(a));
    const codigo = this.codigos.ler(apertados);
    if (!codigo) return;

    // todo código termina em 'a' — sem consumi-lo aqui, o mesmo toque cairia
    // de novo em `entrada.apertou('a')` lá embaixo, no andar, e abriria
    // conversa com o que estiver na frente do jogador por cima da ativação
    entrada.apertou('a'); entrada.apertou('b');
    if (codigo === 'evoluir') this.ativarCodigoEvoluir();
    else if (codigo === 'potencia') this.ativarCodigoPotencia();
    else {
      // pula para o começo de uma região, com as medalhas e Dons de antes
      const pulo = aplicarPulo(this.op.estado, codigo);
      const alvo = this.op.mundo.def(pulo.destino).inicio;
      this.jogador.teleportar(alvo.tx, alvo.ty, alvo.dir);
      this.montarMapa(pulo.destino);   // já grava: medalhas, Dons e time mudaram
      this.centrarCamera();
      this.abrirConversa('???', [pulo.aviso]);
    }
  }

  /* evolui na hora todo Encantado do time que tiver pra onde evoluir,
     não importa o nível — é o código secreto, não a régua do jogo */
  private ativarCodigoEvoluir(): void {
    const e = this.op.estado;
    let evoluidos = 0;
    for (const bicho of e.time) {
      const alvo = ficha(bicho).evolui;
      if (!alvo) continue;
      evoluir(bicho, alvo.em);
      evoluidos++;
    }
    salvar(e);
    this.abrirConversa('???', evoluidos > 0
      ? [`Código aceito. ${evoluidos} do time evoluiu na hora.`]
      : ['Código aceito. Mas ninguém no time tinha pra onde evoluir agora.']);
  }

  /* abre a tela de poder máximo: escolhe quem do time, sobe pro nível 60 e
     deixa escolher os quatro golpes dentro de tudo que a espécie aprende */
  private ativarCodigoPotencia(): void {
    if (this.op.estado.time.length === 0) {
      this.abrirConversa('???', ['Código aceito. Mas o time está vazio — nada para potencializar.']);
      return;
    }
    this.emPoder = true;
    this.telaPoder!.abrir();
  }

  /* ------------------------------------------------------------- entrada */

  private interagir(): void {
    let { tx, ty } = this.jogador.frente();

    /* Balcão de loja, mesa de cozinha: o corpo é parede, mas a conversa
       passa por cima. Sem isto, quem fica atrás do próprio balcão vira
       enfeite — foi o que aconteceu com a Dona Firmina e com o lojista. */
    if (this.mapa.balcao(tx, ty)) {
      const [dx, dy] = DELTAS[this.jogador.dir];
      const atras = this.visiveis().find((n) => n.ator.tx === tx + dx && n.ator.ty === ty + dy);
      if (atras) { tx += dx; ty += dy; }
    }

    const npc = this.visiveis().find((n) => n.ator.tx === tx && n.ator.ty === ty);
    if (npc) {
      // quem foge não conversa: só depois de encurralado ou sem fôlego
      if (npc.def.fujao && this.tentarFugir(npc)) {
        this.abrirConversa(npc.def.nome,
                           ['Escapuliu por entre as suas canelas, rindo.']);
        return;
      }
      npc.ator.olharPara(this.jogador.tx, this.jogador.ty);
      this.falarCom(npc);
      return;
    }
    // saída que não dispara ao pisar: só com o A, de frente para ela
    const saida = this.mapa.saidaEm(tx, ty);
    if (saida && saida.aoPisar === false) { this.indo = saida; this.fade = 0; return; }

    const aviso = this.avisos.get(`${tx},${ty}`);
    if (!aviso) return;
    const fala = escolherFala(this.op.estado, aviso.falas);
    if (fala) this.abrirConversa(aviso.nome, fala.linhas, fala);
  }

  private falarCom(npc: NpcVivo): void {
    const fala = escolherFala(this.op.estado, npc.def.falas);
    if (!fala) return;                         // NPC sem nada a dizer agora
    // treinador já vencido repete a fala, mas não o desafio
    if (fala.batalha && this.venceu(npc) && !npc.def.treinador?.repete) {
      this.abrirConversa(npc.def.nome, fala.linhas);
      return;
    }
    this.abrirConversa(npc.def.nome, fala.linhas, fala, npc);
  }

  /* ------------------------------------------------------- quem foge

     O Sacizinho pula para longe de quem chega perto, enquanto tiver para
     onde ir e fôlego para isso. Sair do mapa devolve o fôlego dele: a caçada
     vale por visita, e assim ela nunca fica impossível nem eterna. */
  private tentarFugir(npc: NpcVivo): boolean {
    if (!npc.def.fujao || npc.folego <= 0 || npc.ator.movendo) return false;
    const a = npc.ator;
    const dx = Math.sign(a.tx - this.jogador.tx);
    const dy = Math.sign(a.ty - this.jogador.ty);

    // primeiro na direção contrária à do jogador; depois de lado; nunca para cima dele
    const tentativas: Direcao[] = [];
    const fugaDireta = direcaoDe(dx, dy);
    if (fugaDireta) tentativas.push(fugaDireta);
    for (const d of ['cima', 'baixo', 'esq', 'dir'] as Direcao[]) {
      if (!tentativas.includes(d)) tentativas.push(d);
    }

    for (const d of tentativas) {
      const [ex, ey] = DELTAS[d];
      const nx = a.tx + ex, ny = a.ty + ey;
      if (this.mapa.solido(nx, ny)) continue;
      if (nx === this.jogador.tx && ny === this.jogador.ty) continue;
      if (this.npcs.some((o) => o !== npc && o.ator.tx === nx && o.ator.ty === ny)) continue;
      if (this.mapa.saidaEm(nx, ny)) continue;    // não some pela porta
      a.dir = d;
      a.teleportar(nx, ny, d);
      npc.folego--;
      this.recontarOcupados();
      return true;
    }
    return false;                                 // encurralado
  }

  /* chegou perto de quem tem cutscene de encontro: ela toca uma vez só, e
     o mundo fica parado enquanto isso — a caçada começa quando ela acaba */
  private avistarEncontros(): void {
    for (const npc of this.npcs) {
      const id = npc.def.encontro;
      if (!id || this.op.estado.flags[`viu_cut_${id}`]) continue;
      const perto = Math.abs(npc.ator.tx - this.jogador.tx)
                  + Math.abs(npc.ator.ty - this.jogador.ty);
      if (perto > DISTANCIA_ENCONTRO) continue;
      // emboscada sem ninguém de pé seria derrota na hora: espera a benzedura
      if (npc.def.emboscada && !temTimeEmPe(this.op.estado)) continue;
      npc.ator.olharPara(this.jogador.tx, this.jogador.ty);
      this.pedirHistoria(id);
      if (npc.def.emboscada && npc.def.treinador && !this.venceu(npc)) {
        this.lutaDepois = npc;
        this.esperaLuta = ESPERA_LUTA;
      }
      return;
    }
  }

  /* chamado quando o jogador termina um passo: quem estiver do lado, foge */
  private espantarFujoes(): void {
    for (const npc of this.npcs) {
      if (!npc.def.fujao) continue;
      const perto = Math.abs(npc.ator.tx - this.jogador.tx)
                  + Math.abs(npc.ator.ty - this.jogador.ty);
      if (perto <= 1) this.tentarFugir(npc);
    }
  }

  atualizar(dt: number, entrada: Entrada): void {
    this.tempoAnim += dt;
    if (this.tempoFaixa > 0) this.tempoFaixa -= dt;

    if (this.corte.ativo) { this.corte.atualizar(dt, entrada); return; }

    // uma cutscene da história: entra assim que a conversa que a pediu fecha
    if (this.historiaPendente && !this.falando && !this.indo && !this.duelo
        && !this.emLoja && !this.emMenu && !this.emEscolha && !this.emCaixa && !this.emRezador && !this.emPoder) {
      const id = this.historiaPendente;
      this.historiaPendente = null;
      salvar(this.op.estado);
      this.op.aoCutscene?.(id);
      return;
    }

    // voltou da cutscene de apresentação: agora sim, a luta
    if (this.lutaDepois && !this.historiaPendente) {
      this.esperaLuta -= dt;
      if (this.esperaLuta <= 0) {
        const npc = this.lutaDepois;
        this.lutaDepois = null;
        this.lutarCom(npc);
      }
      return;
    }

    // o campeão caiu: os créditos entram assim que a fala dele fecha
    if (this.recados.length && !this.falando && !this.indo && !this.duelo && !this.creditosPendentes) {
      const rec = this.recados.shift()!;
      this.abrirConversa(rec.quem, rec.linhas);
    }
    if (this.creditosPendentes && !this.falando && !this.indo && !this.duelo) {
      this.creditosPendentes = false;
      this.op.aoCreditos?.();
      return;
    }

    // uma conta acendeu: o corte de câmera espera a vez, sem atropelar nada
    // que já esteja na tela (conversa, batalha, loja, menu, escolha, caixa, poder, porta)
    if (this.corte.esperando && !this.falando && !this.emLoja && !this.emMenu
        && !this.emEscolha && !this.emCaixa && !this.emRezador && !this.emPoder && !this.indo && !this.duelo) {
      this.corte.iniciar(this.op.mundo, this.contexto());
      return;
    }

    // ---- sobreposições: o mundo continua desenhado, mas congelado ----
    if (this.emLoja) {
      if (this.loja!.atualizar(dt, entrada) === 'fechar') this.emLoja = false;
      return;
    }
    if (this.emMenu) {
      const saida = this.menu!.atualizar(dt, entrada);
      if (saida === 'fechar') this.emMenu = false;
      else if (saida === 'viajar') { this.emMenu = false; this.remar(this.menu!.destinoViagem); }
      else if (saida === 'titulo') { this.emMenu = false; this.op.aoSair?.(); }
      return;
    }
    if (this.emPoder) {
      if (this.telaPoder!.atualizar(dt, entrada) === 'fechar') this.emPoder = false;
      return;
    }
    if (this.emEscolha) {
      if (this.escolha!.atualizar(dt, entrada) === 'fechar') this.emEscolha = false;
      return;
    }
    if (this.emRezador) {
      // a reza gasta dinheiro: grava ao sair, como depois de qualquer compra de serviço
      if (this.telaRezador!.atualizar(dt, entrada) === 'fechar') { this.emRezador = false; salvar(this.op.estado); }
      return;
    }
    if (this.emCaixa) {
      if (this.telaCaixa!.atualizar(dt, entrada) === 'fechar') this.emCaixa = false;
      return;
    }

    // ---- atravessando uma porta: nada responde enquanto a tela escurece ----
    if (this.indo) { this.atravessar(dt); return; }

    // ---- conversa em andamento: trava o movimento ----
    if (this.dialogo.conversa) {
      const fechou = this.dialogo.atualizar(dt, entrada);
      if (fechou) this.fecharConversa(fechou);
      return;
    }

    // ---- charada: escolher a resposta ----
    if (this.dialogo.pergunta) { this.responderPergunta(entrada); return; }

    // ---- treinador vindo: o jogador assiste ----
    if (this.duelo) {
      if (this.duelo.fase !== 'lutando') this.aproximar(dt);
      return;
    }

    // ---- deslizando numa poça: o passo segue sozinho ----
    if (this.deslizando) { this.deslizar(dt); this.andarRondas(dt); return; }

    // ---- vigias de ronda andam, e olham ----
    if (this.andarRondas(dt)) return;

    // ---- o relógio das corridas contra o sol ----
    this.andarCorridas(dt);
    if (this.dialogo.conversa) return;

    this.verificarCodigoSecreto(entrada);

    if (entrada.apertou('menu')) { this.emMenu = true; this.menu!.abrir(); return; }

    // ---- andar ----
    const { x, y } = entrada.direcao();
    const dir: Direcao | null = direcaoDe(x, y);
    if (dir) this.tentarEmpurrar(dir);
    const deX = this.jogador.tx, deY = this.jogador.ty;
    const bateu = this.jogador.comandar(this.mapa, dir, entrada.segurando('b'),
                          (tx, ty) => this.ocupados.has(`${tx},${ty}`)
                                    || ocupadaPorPedra(this.pedras, tx, ty));
    // encostado na parede, o "tum" se repete num compasso, não a cada quadro
    this.tumPausa = Math.max(0, this.tumPausa - dt);
    if (bateu && this.tumPausa === 0) { Som.efeito('parede'); this.tumPausa = 0.3; }
    if (this.jogador.tx !== deX || this.jogador.ty !== deY) {
      this.puxarSeguidor(deX, deY, entrada.segurando('b'));
    }
    this.seguidor?.atualizar(dt);
    const chegou = this.jogador.atualizar(dt);

    if (this.carencia > 0) this.carencia -= dt;

    if (chegou) this.aoPisarNoTile();

    // espia o A em vez de usá-lo: sem nada na frente, o A fica mudo. Uma
    // conversa que abriu neste mesmo quadro (o "Código aceito", que termina
    // num A) não é atropelada pelo que estiver na frente
    if (!this.duelo && !this.deslizando && !this.falando && entrada.apertouAgora('a')) this.interagir();

    this.centrarCamera();
  }

  /* toda cova AINDA ABERTA deste mapa — a lista que world/pedras.ts precisa
     para saber onde uma pedra empurrada se funde de vez */
  private covasDeste(): Cova[] {
    const abertas: Cova[] = [];
    for (const o of this.def.objetos) {
      if (o.tipo !== 'cova') continue;
      const flag = typeof o.seNao === 'string' ? o.seNao : null;
      if (!flag || ligada(this.op.estado, flag)) continue;
      abertas.push({ tx: o.tx, ty: o.ty, flag });
    }
    return abertas;
  }

  /* se há uma pedra na direção que o jogador está tentando andar, tenta
     empurrá-la antes do próprio passo — exatamente o que `bloqueado` faz
     pelo jogador, mas pela pedra. Encaixando numa cova, acende a flag,
     reassa o cenário (o `entulho` troca de lugar com a `cova`) e grava. */
  private tentarEmpurrar(dir: Direcao): void {
    if (this.jogador.movendo || this.jogador.dir !== dir) return;
    const [dx, dy] = DELTAS[dir];
    if (!ocupadaPorPedra(this.pedras, this.jogador.tx + dx, this.jogador.ty + dy)) return;

    const covas = this.covasDeste();
    const r = empurrar(this.pedras, this.jogador.tx, this.jogador.ty, dx, dy,
      (tx, ty) => {
        // a cova aberta é sólida para quem anda, mas é onde a pedra tem
        // que ir — sem esta ressalva nenhuma pedra jamais chegaria lá
        const naCova = covas.some((c) => c.tx === tx && c.ty === ty);
        return (naCova || !this.mapa.solido(tx, ty))
            && !ocupadaPorPedra(this.pedras, tx, ty) && !this.ocupados.has(`${tx},${ty}`);
      },
      covas);
    if (r.encaixou) {
      this.op.estado.flags[r.encaixou] = true;
      // todas as covas da sala tapadas: acende a conta que esse
      // quebra-cabeça resolve, se o mapa declarar uma
      if (this.def.pedrasConta && this.covasDeste().length === 0) {
        this.op.estado.flags[this.def.pedrasConta] = true;
      }
      this.atualizarCenario();
      salvar(this.op.estado);
    }
  }

  /* o jogador acabou de ocupar um tile novo: é aqui que o mundo reage */
  private aoPisarNoTile(): void {
    const p = this.op.estado.posicao;
    p.mapa = this.def.id; p.tx = this.jogador.tx; p.ty = this.jogador.ty;
    p.dir = this.jogador.dir;

    /* Poça com caminho livre à frente: o chão continua levando, e nada mais
       acontece até ele parar. Poça ENCOSTADA numa parede é chão comum —
       senão quem escorrega até o canto do salão nunca mais anda. */
    /* Trilho de vagonete: vira o jogador para onde o trilho leva e segue
       sozinho, pelo mesmo caminho do escorregão. Trilho que dá de cara com
       parede é chão comum — senão o fim da linha virava armadilha. */
    const trilho = this.mapa.trilho(this.jogador.tx, this.jogador.ty);
    if (trilho) {
      this.jogador.dir = trilho;
      this.deslizando = this.temCaminhoAFrente();
    } else {
      this.deslizando = this.mapa.escorrega(this.jogador.tx, this.jogador.ty)
                     && this.temCaminhoAFrente();
    }
    if (this.deslizando) return;

    const saida = this.mapa.saidaEm(this.jogador.tx, this.jogador.ty);
    if (saida && saida.aoPisar !== false) { this.indo = saida; this.fade = 0; return; }

    this.pisouLadrilho();
    this.avistarEncontros();
    this.espantarFujoes();
    this.olharTreinadores();
    if (!this.duelo && this.carencia <= 0
        && this.mapa.temEncontro(this.jogador.tx, this.jogador.ty)) {
      this.talvezEncontro();
    }
  }

  /* ladrilho de memória: conta, zera ou completa a sequência do mapa */
  private pisouLadrilho(): void {
    const seq = this.def.sequencia;
    if (!seq || ligada(this.op.estado, seq.flag)) return;
    const o = this.def.objetos.find((x) => x.tipo === 'ladrilho'
      && x.tx === this.jogador.tx && x.ty === this.jogador.ty);
    if (!o) return;
    const r = pisarLadrilho(seq.ordem, this.progressoLadrilhos, o.simbolo ?? '');
    this.progressoLadrilhos = r.progresso;
    if (r.completou) {
      const e = this.op.estado;
      e.flags[seq.flag] = true;
      const terreiro = this.terreiroDaFala(seq.flag);
      this.atualizarCenario();
      if (terreiro) this.corte.preparar(terreiro, contasAcesasDe(e, terreiro));
      salvar(e);
      this.abrirConversa('LADRILHOS', ['Os ladrilhos acendem um depois do outro, na ordem em que você pisou.',
                                       'Alguma coisa destrava lá na frente, com um estalo fundo.']);
    } else if (r.errou) {
      this.abrirConversa('LADRILHOS', ['O ladrilho afunda com um estalo seco, e os outros se apagam. A sequência recomeça.']);
    }
  }

  /* Os vigias de ronda andam um tile por vez pelo caminho deles, com uma
     pausa curta entre um passo e outro, e olham para onde andam. Se algum
     enxergar o jogador, ele é mandado de volta (devolve true). */
  private andarRondas(dt: number): boolean {
    let mexeu = false;
    for (const n of this.npcs) {
      const r = n.def.ronda;
      if (!r) continue;
      n.ator.atualizar(dt);
      if (n.ator.movendo) continue;
      n.rondaT += dt;
      if (n.rondaT < (r.passo ?? 0.45) - 0.2) continue;
      const i = proximoDaRonda(r.caminho.length, n.rondaI);
      const p = r.caminho[i]!;
      if (p.tx === this.jogador.tx && p.ty === this.jogador.ty) { n.ator.olharPara(p.tx, p.ty); continue; }
      n.rondaI = i; n.rondaT = 0;
      n.ator.andarPara(p.tx, p.ty, false);
      mexeu = true;
    }
    if (mexeu) this.recontarOcupados();
    const viu = this.npcs.find((n) => n.def.ronda
      && avista(n.ator, n.ator.dir, n.def.ronda.visao, this.jogador, (x, y) => this.mapa.solido(x, y)));
    if (!viu) return false;
    this.pego(viu);
    return true;
  }

  /* pego pela ronda: volta ao começo do trecho vigiado, e a ronda recomeça */
  private pego(n: NpcVivo): void {
    const r = n.def.ronda!;
    this.deslizando = false;
    this.jogador.teleportar(r.volta.tx, r.volta.ty, r.volta.dir);
    const p = this.op.estado.posicao;
    p.tx = r.volta.tx; p.ty = r.volta.ty; p.dir = r.volta.dir;
    for (const m of this.npcs) {
      if (!m.def.ronda) continue;
      m.rondaI = 0; m.rondaT = 0;
      m.ator.teleportar(m.def.tx, m.def.ty, m.def.dir);
    }
    this.recontarOcupados();
    this.seguidor = null;
    this.sincronizarSeguidor();
    this.centrarCamera();
    this.abrirConversa(n.def.nome, [r.fala]);
  }

  private temCaminhoAFrente(): boolean {
    const { tx, ty } = this.jogador.frente();
    return !this.mapa.solido(tx, ty) && !this.ocupados.has(`${tx},${ty}`);
  }

  /* Enquanto houver água adiante, o passo se repete sozinho na mesma
     direção. Quem decide se o escorregão continua é `aoPisarNoTile`. */
  private deslizar(dt: number): void {
    if (!this.jogador.movendo) {
      const deX = this.jogador.tx, deY = this.jogador.ty;
      this.jogador.comandar(this.mapa, this.jogador.dir, true,
                            (tx, ty) => this.ocupados.has(`${tx},${ty}`));
      if (this.jogador.tx !== deX || this.jogador.ty !== deY) this.puxarSeguidor(deX, deY, true);
    }
    this.seguidor?.atualizar(dt);
    if (this.jogador.atualizar(dt)) this.aoPisarNoTile();
    this.centrarCamera();
  }

  /* a passagem inteira: escurece, troca o mapa na metade, clareia */
  private atravessar(dt: number): void {
    const antes = this.fade;
    if (antes === 0) Som.efeito('porta');
    this.fade += dt;
    if (antes < FADE && this.fade >= FADE) {
      const s = this.indo!;
      this.jogador.teleportar(s.destino.tx, s.destino.ty, s.destino.dir);
      this.montarMapa(s.para);
      this.carencia = 0.4;
      this.centrarCamera();
    }
    if (this.fade >= FADE * 2) { this.indo = null; this.fade = 0; }
  }

  /* ------------------------------------------------------------ Romaria */

  private lutarNaRomaria(): void {
    const e = this.op.estado;
    this.duelo = null;
    if (!temTimeEmPe(e)) {
      this.abrirConversa('MESTRE DA ROMARIA', ['Com o time caído não tem romaria. Vá se benzer primeiro.']);
      return;
    }
    const { nome, time } = gerarRomeiro(acaso, nivelDaRomaria(e), e.romaria.seq);
    this.naRomaria = true;
    this.op.aoBatalhar({
      oponentes: time,
      treinador: { nome, classe: 'ROMEIRO', esperta: true,
                   falaDerrota: 'Vai com Deus, que a romaria segue.' },
      cenario: this.def.cenario ?? 'cidade',
      musica: 'batalhaTreinador',
      clima: 'limpo',
    });
  }

  private fimDaLutaDaRomaria(r: Resultado): void {
    const e = this.op.estado;
    const ro = e.romaria;
    if (r === 'vitoria') {
      ro.seq++;
      ro.recorde = Math.max(ro.recorde, ro.seq);
      const f = fichasDaVitoria(ro.seq);
      adicionar(e.mochila, 'ficha_romaria', f);
      const linhas = [`${ro.seq} vitória${ro.seq > 1 ? 's' : ''} seguida${ro.seq > 1 ? 's' : ''}! ${f} ficha${f > 1 ? 's' : ''} para você.`];
      if (ro.seq % BENZE_A_CADA === 0) {
        curarTime(e);
        linhas.push(`${BENZE_A_CADA} de uma vez: benzi o seu time. A romaria segue!`);
      }
      this.recados.push({ quem: 'MESTRE DA ROMARIA', linhas });
    } else {
      const fez = ro.seq;
      ro.seq = 0;
      this.recados.push({ quem: 'MESTRE DA ROMARIA',
                          linhas: [`A romaria acabou em ${fez} vitória${fez === 1 ? '' : 's'}. O recorde é ${ro.recorde}.`] });
    }
    salvar(e);
  }

  /* a Canoa Encantada: escurece como numa porta e clareia dentro do
     benzimento da cidade escolhida */
  private remar(cidade: string | null): void {
    const c = cidade ? chegada(cidade, MAPAS) : null;
    if (!c) return;
    this.indo = { tx: this.jogador.tx, ty: this.jogador.ty, para: c.mapa,
                  destino: { tx: c.tx, ty: c.ty, dir: c.dir } };
    this.fade = 0;
  }

  /* o céu deste mapa aparece? (casa, terreiro e caverna não têm céu) */
  private ceuAberto(): boolean { return !this.def.interior && !this.def.escuro; }

  /* o tempo só muda ao chegar ao ar livre numa região diferente: entrar e
     sair de casa não faz parar de chover */
  private talvezMudarTempo(): void {
    if (!this.ceuAberto()) return;
    const tipo = regiaoDoMapa(this.def.id)?.tipo ?? null;
    const chave = tipo ?? 'fora';
    if (chave === this.regiaoDoTempo) return;
    this.regiaoDoTempo = chave;
    this.clima = sortearClima(tipo, acaso);
  }

  /* o tempo que faz aqui agora (debaixo de teto, sempre limpo) */
  climaAqui(): Clima { return this.ceuAberto() ? this.clima : 'limpo'; }

  /* para o atalho de teste do navegador */
  forcarClima(c: Clima): void { this.clima = c; }

  /* um passo no mato alto: às vezes vira encontro */
  private talvezEncontro(): void {
    const tabela = this.def.encontros;
    if (!tabela || tabela.length === 0) return;
    if (!temTimeEmPe(this.op.estado)) return;

    const media = this.def.passosPorEncontro ?? 10;
    if (!acaso.chance(100 / media)) return;

    const agora = tabelaDoMomento(tabela, periodo(), this.climaAqui());
    const lugar = lugarNoMundo(this.def.id, MAPAS) ?? this.def.id;
    const podePrender = podePrenderAqui(this.op.estado, lugar);
    this.lugarDoEncontro = lugar;
    this.op.aoBatalhar({
      podePrender,
      oponentes: [talvezRaro(sortearSelvagem(agora, acaso), this.op.estado, acaso)],
      cenario: this.def.cenario ?? 'praia',
      clima: this.climaAqui(),
    });
  }

  /* o jogador perdeu: o time é benzido e ele acorda no último abrigo */
  socorrer(): void {
    curarTime(this.op.estado);
    const r = this.op.estado.refugio;
    this.jogador.teleportar(r.tx, r.ty, r.dir);
    if (r.mapa !== this.def.id) this.montarMapa(r.mapa, { gravar: false });
    this.centrarCamera();
    this.carencia = 1;
    salvar(this.op.estado);
    /* quem estava sendo escoltado não aguenta ver o time cair */
    const caiu = derrubarEscolta(this.op.estado);
    this.sincronizarSeguidor();
    if (caiu) salvar(this.op.estado);
    const s = this.def.socorro;
    this.abrirConversa(s?.quem ?? 'ALGUÉM', [...(s?.falas ?? [
      'Você apagou no meio do mato, criança.',
      'Benzi seus Encantados e te trouxe de volta. Vá com mais juízo.',
    ]), ...(caiu ? [caiu.aoFalhar] : [])]);
  }

  /* ------------------------------------------------------------- desenho */

  desenhar(r: Renderizador): void {
    if (this.corte.ativo) { this.corte.desenhar(r, (id) => this.vistaDo(id)); return; }

    r.limpar('#101018');
    const vista = this.vistaDo(this.def.id);
    if (vista) {
      vista.desenhar(r.ctx, {
        mapa: this.mapa, tempo: this.tempoAnim,
        alvoX: this.jogador.px / TS + 0.5, alvoY: this.jogador.py / TS + 0.5,
        atores: this.atoresNaTela().map((a) => ({ img: a.quadro(), x: a.px / TS, y: a.py / TS, nadando: this.mapa.agua(a.tx, a.ty) })),
        periodo: periodo(), clima: this.climaAqui(), regiao: regiaoDoMapa(this.def.id)?.tipo ?? null,
      });
    } else {
      this.pintor.plano(r, {
        mapa: this.mapa, camera: this.camera, atores: this.atoresNaTela(),
        pedras: this.pedras, feixe: this.feixe, tempo: this.tempoAnim,
      });
    }
    this.desenharPorCima(r);
  }

  /* quem anda pelo mapa agora: o jogador, os NPCs à vista e o escoltado */
  private atoresNaTela(): Ator[] {
    return [this.jogador, ...this.visiveis().map((n) => n.ator), ...(this.seguidor ? [this.seguidor] : [])];
  }

  /* a vista 3D, quando este mapa tem uma e ela está ligada e já carregou */
  private vistaDo(id: string): Vista3D | null {
    if (!obterVisao3D() || !EM_3D.has(id)) return null;
    return vista3D();
  }

  /* o que fica por cima do mundo, seja ele plano ou 3D */
  private desenharPorCima(r: Renderizador): void {
    if (this.duelo?.fase === 'susto') this.desenharSusto(r);

    if (this.def.escuro) this.desenharEscuridao(r);
    if (this.ceuAberto()) {
      // no 3D a hora já está na luz da cena; no plano, um filtro de cor
      if (!this.vistaDo(this.def.id)) tingir(r, periodo());
      desenharClima(r, this.clima, this.tempoAnim);
    }

    // faixa com o nome do lugar, ao chegar
    if (this.tempoFaixa > 0 && this.faixaNome) {
      const t = Math.min(1, this.tempoFaixa / 0.4);
      r.ctx.globalAlpha = t;
      r.sprite(this.faixaNome, 6, 6);
      r.ctx.globalAlpha = 1;
    }

    if (this.relogios.size > 0) this.desenharRelogio(r);
    this.dialogo.desenhar(r, this.tempoAnim);

    if (this.indo) {
      const t = this.fade <= FADE ? this.fade / FADE : 1 - (this.fade - FADE) / FADE;
      r.ctx.globalAlpha = Math.max(0, Math.min(1, t));
      r.limpar('#000000');
      r.ctx.globalAlpha = 1;
    }

    if (this.emEscolha) { r.cortina(0.45); this.escolha!.desenhar(r); }
    else if (this.emLoja) { r.cortina(0.45); this.loja!.desenhar(r); }
    else if (this.emCaixa) { r.cortina(0.45); this.telaCaixa!.desenhar(r); }
    else if (this.emRezador) { r.cortina(0.45); this.telaRezador!.desenhar(r); }
    else if (this.emPoder) { r.cortina(0.45); this.telaPoder!.desenhar(r); }
    else if (this.emMenu) { r.cortina(0.45); this.menu!.desenhar(r); }
  }

  /* o balão de espanto acima do treinador que acabou de te ver */
  private desenharSusto(r: Renderizador): void {
    const a = this.duelo!.npc.ator;
    let x = a.px - this.camera.x + 4;
    let y = a.py - this.camera.y - 14;
    const vista = this.vistaDo(this.def.id);
    if (vista) {
      // no 3D, o balão vai acima da cabeça, onde quer que ela caia na tela
      const p = vista.projetar(a.px / TS + 0.5, a.py / TS + 0.6, 1.5);
      x = Math.round(p.x) - 4; y = Math.round(p.y) - 16;
    }
    r.retangulo(x - 2, y - 2, 12, 16, P.ink!);
    r.retangulo(x - 1, y - 1, 10, 14, P.uiBg!);
    r.retangulo(x + 3, y + 1, 2, 7, P.hpRed!);
    r.retangulo(x + 3, y + 10, 2, 2, P.hpRed!);
  }

  /* breu com um disco de luz em volta do jogador: `escuro.raio`, quando
     fixo, trava o tamanho do disco (o breu do Terreiro de Brasa, que nem a
     Tocha ilumina); senão o raio vem do que o jogador carrega (candeia ou
     o próprio Dom "Tocha"), calculado em game/luz.ts. */
  private desenharEscuridao(r: Renderizador): void {
    const def = this.def.escuro!;
    const raio = def.fixo ? (def.raio ?? RAIO_SEM_LUZ) : raioDaLuz(this.op.estado);
    this.pintor.escuridao(r, raio, this.jogador.px - this.camera.x + TS / 2,
                          this.jogador.py - this.camera.y + TS / 2);
  }

  /* a charada: B desiste sem efeito; A responde */
  private responderPergunta(entrada: Entrada): void {
    const escolha = this.dialogo.escolher(entrada);
    if (escolha.k === 'desistiu') { this.duelo = null; return; }
    if (escolha.k !== 'respondeu') return;
    const p = escolha.pergunta;
    const r = responder(this.op.estado, p.fala, p.sel);
    // certa: diz o "acertou" e só ao fechar aplica a fala (liga, paga...);
    // errada: o progresso já foi desligado em `responder`, só resta ouvir
    this.abrirConversa(p.falante, [...r.linhas], r.fala, p.npc);
    if (!r.certa) this.atualizarCenario();
  }

  /* quanto falta para o sol se pôr, no canto de cima */
  private desenharRelogio(r: Renderizador): void {
    const resta = Math.max(0, Math.ceil(Math.min(...this.relogios.values())));
    const texto = `SOL: ${resta}s`;
    const w = r.larguraTexto(texto) + 10;
    r.retangulo(LARGURA - w - 6, 6, w, 14, P.ink!);
    r.retangulo(LARGURA - w - 5, 7, w - 2, 12, resta <= 10 ? '#8a2a1a' : '#5a3e24');
    r.texto(texto, LARGURA - w - 1, 10, P.bolt!);
  }
}
