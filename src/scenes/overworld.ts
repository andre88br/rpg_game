/* =========================================================================
   Cena do mundo: andar pela região, esbarrar no cenário, conversar com NPCs,
   atravessar portas — e, desde a Etapa 2, lembrar do que já aconteceu.

   A cena é criada UMA vez e vive a partida inteira: trocar de mapa troca o
   `Mapa` e os NPCs, mas o jogador, a câmera e os recursos assados continuam
   os mesmos. Remontar tudo a cada porta jogaria fora o canvas do cenário e
   apareceria como um tranco na tela.

   O menu de pausa e a loja NÃO são cenas: são sobreposições desenhadas por
   cima do mundo, que continua lá atrás. Trocar de cena apagaria o mapa.
   ========================================================================= */
import { assar, assarSuave, larguraDe, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada, Acao } from '../core/input.ts';
import {
  Mapa, TS, objetoAtivo, type ContextoMapa, type DefMapa, type DefNPC, type DefSaida,
} from '../world/tilemap.ts';
import type { Mundo } from '../world/mundo.ts';
import { colunaPorta, CONTAS_NA_GUIA } from '../art/tiles.ts';
import { Camera } from '../world/camera.ts';
import { Ator, assarBicho, assarFolha, direcaoDe, DELTAS,
         type FolhaAssada } from '../world/actor.ts';
import { ESTILOS, type Direcao } from '../art/people.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import * as UI from '../art/ui.ts';
import * as T from '../art/tiles.ts';
import { P } from '../art/palette.ts';
import { quebrar, larguraTexto } from '../art/font.ts';
import { acaso } from '../core/rng.ts';
import {
  criar, evoluir, ficha, nome as nomeDe, sortearSelvagem, type Encantado,
} from '../battle/encantado.ts';
import type { Resultado, Treinador } from '../battle/engine.ts';
import type { Cenario } from '../art/battlebg.ts';
import { adicionar, consumir, quantidade } from '../data/items.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { lugarNoMundo } from '../data/mundo.ts';
import { guardar, temTimeEmPe, curarTime, type EstadoJogo } from '../game/state.ts';
import {
  aplicarFala, contasAcesasDe, contasFaltandoDe, escolherFala, ligada, preencher,
  responder, terreiroDaConta, TERREIROS, type Fala,
} from '../game/quests.ts';
import { sondarTesouro } from '../game/tesouro.ts';
import { escoltaAtiva, derrubarEscolta } from '../game/escolta.ts';
import { pisarLadrilho } from '../game/sequencia.ts';
import { avista, proximoDaRonda } from '../game/ronda.ts';
import { tracarFeixe } from '../game/feixe.ts';
import { avaliarCorrida, encerrar, type DefCorrida } from '../game/corrida.ts';

/* todas as corridas contra o sol do jogo, de qualquer mapa */
const CORRIDAS: readonly DefCorrida[] = Object.values(MAPAS).flatMap((d) => (d.corrida ? [d.corrida] : []));
import { salvar } from '../game/save.ts';
import { raioDaLuz, RAIO_SEM_LUZ } from '../game/luz.ts';
import { empurrar, ocupadaPorPedra, posicoesIniciais, type Cova, type Pedra } from '../world/pedras.ts';
import { multiplicadorVelocidade } from '../game/config.ts';
import { MenuPausa } from './menu.ts';
import { Loja } from './loja.ts';
import { EscolhaInicial, NIVEL_INICIAL } from './escolha.ts';
import { TelaCaixa } from './caixa.ts';
import { TelaPoder } from './poder.ts';

const LARG_DIALOGO = LARGURA - 12;
const CHARS_POR_SEG = 48;
/* quanto do sprite (de 20px de altura) fica visível nadando — corta bem no
   pescoço, água na altura do peito. O resto de baixo nem se desenha: quem
   mostra que é água ali é o próprio tile por baixo. */
const ALTURA_NADANDO = 14;
/* um respiro de escuro entre um mapa e outro: sem isso a troca é um tranco */
const FADE = 0.18;
/* quanto tempo o "!" fica sobre a cabeça do treinador antes de ele vir */
const SUSTO = 0.7;
/* corte de câmera para a guia do terreiro: tempo de entrada/saída do preto,
   e quanto tempo o recado fica na tela se ninguém apertar nada */
const CUT_FADE = 0.35;
const CUT_ESPERA = 3.2;

/* códigos secretos: digitados com os próprios botões do jogo, andando livre
   pelo mundo (não contam em conversa, batalha, loja ou qualquer menu). Cada
   um é conferido contra o fim do mesmo buffer de botões apertados — por
   isso nenhum pode ser sufixo de outro, senão os dois disparariam juntos. */
const CODIGO_REGIAO2: readonly Acao[] =
  ['cima', 'cima', 'baixo', 'baixo', 'esq', 'dir', 'esq', 'dir', 'b', 'a'];
/* o da região 3 é o mesmo de cabeça para baixo: nenhum é sufixo do outro */
const CODIGO_REGIAO3: readonly Acao[] =
  ['baixo', 'baixo', 'cima', 'cima', 'dir', 'esq', 'dir', 'esq', 'b', 'a'];
/* o da região 4 gira a bússola inteira duas vezes — nenhuma sequência de 7
   ou 10 elementos dela bate com o final de nenhum código acima */
const CODIGO_REGIAO4: readonly Acao[] =
  ['cima', 'dir', 'baixo', 'esq', 'cima', 'dir', 'baixo', 'esq', 'b', 'a'];
/* o da região 5 vai de um lado para o outro antes de subir e descer — a
   região que cresce para os lados. Nenhum final dele bate com os de cima. */
const CODIGO_REGIAO5: readonly Acao[] =
  ['esq', 'dir', 'esq', 'dir', 'cima', 'baixo', 'cima', 'baixo', 'b', 'a'];
/* o da região 6 desce e sobe antes de ir de lado — mesmo tamanho dos outros
   e diferente de todos, então nenhum é sufixo dele nem ele de nenhum */
const CODIGO_REGIAO6: readonly Acao[] =
  ['baixo', 'cima', 'baixo', 'cima', 'esq', 'dir', 'esq', 'dir', 'b', 'a'];
/* o da região 7 é o da 6 com cada direção trocada pela oposta */
const CODIGO_REGIAO7: readonly Acao[] =
  ['cima', 'baixo', 'cima', 'baixo', 'dir', 'esq', 'dir', 'esq', 'b', 'a'];
/* o da região 8 gira a bússola ao contrário da 4, duas voltas */
const CODIGO_REGIAO8: readonly Acao[] =
  ['esq', 'baixo', 'dir', 'cima', 'esq', 'baixo', 'dir', 'cima', 'b', 'a'];
/* os dois de baixo só diferem na direção que repetem — sobe evolui, desce dá poder */
const CODIGO_EVOLUIR: readonly Acao[] = ['a', 'b', 'a', 'b', 'cima', 'cima', 'a'];
const CODIGO_POTENCIA: readonly Acao[] = ['a', 'b', 'a', 'b', 'baixo', 'baixo', 'a'];

interface Cutscene {
  mapa: Mapa;
  cam: Camera;
  t: number;
  fase: 'entra' | 'mostra' | 'sai';
  texto: string;
}

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

interface Conversa {
  falante: string;
  linhas: string[];
  indice: number;
  revelados: number;
  /* o que acontece quando a última página fecha */
  fala: Fala | null;
  npc: NpcVivo | null;
}

/* coisas do cenário que respondem ao botão A. As falas são condicionais como
   as de NPC — é o que deixa um caixote entregar item e acender flag. */
interface Aviso { nome: string; falas: readonly Fala[] }
const diz = (...linhas: string[]): readonly Fala[] => [{ linhas }];

/* um treinador que avistou o jogador e está vindo */
interface Duelo { npc: NpcVivo; fase: 'susto' | 'andando' | 'falando' | 'lutando'; t: number }

export interface PedidoBatalha {
  oponentes: Encantado[];
  treinador?: Treinador | null;
  cenario?: Cenario;
  /* o bolso do treinador inimigo, nunca a mochila do jogador */
  itensIA?: Record<string, number>;
}

export interface OpcoesCenaMundo {
  mundo: Mundo;
  estado: EstadoJogo;
  aoBatalhar: (p: PedidoBatalha) => void;
  /* o menu de pausa pode desistir da partida e voltar ao título */
  aoSair?: () => void;
}

export class CenaMundo implements Cena {
  private mapa!: Mapa;
  private def!: DefMapa;
  private camera = new Camera();
  private jogador!: Ator;
  private npcs: NpcVivo[] = [];
  private ocupados = new Set<string>();
  private avisos = new Map<string, Aviso>();

  private conversa: Conversa | null = null;
  private caixaDialogo!: Assado;
  private etiquetas = new Map<string, Assado>();
  private faixaNome: Assado | null = null;
  private tempoFaixa = 0;
  private rocadas: Assado[] = [];
  private ondas: Assado[] = [];
  private tempoAnim = 0;

  private op: OpcoesCenaMundo;
  private montado = false;
  /* carência depois de uma batalha: sem isso o jogador volta ao mato e cai
     direto em outra luta, no mesmo passo */
  private carencia = 0;
  /* troca de mapa em andamento: some, troca, volta */
  private indo: DefSaida | null = null;
  private fade = 0;

  private duelo: Duelo | null = null;
  private menu: MenuPausa | null = null;
  private loja: Loja | null = null;
  private escolha: EscolhaInicial | null = null;
  private telaCaixa: TelaCaixa | null = null;
  private telaPoder: TelaPoder | null = null;
  private emMenu = false;
  private emLoja = false;
  private emEscolha = false;
  private emCaixa = false;
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
  /* charada aberta: a pergunta já foi lida, falta escolher a resposta */
  private pergunta: { fala: Fala; npc: NpcVivo | null; falante: string;
                      linhas: string[]; sel: number } | null = null;
  /* folhas de sprite assadas uma vez por estilo, valem para todos os mapas */
  private folhas = new Map<string, FolhaAssada>();
  /* máscaras de escuridão, assadas uma vez por raio de luz já usado */
  private mascarasLuz = new Map<number, Assado>();
  /* pedras que se empurram: posição de cada uma, na sala atual */
  private pedras: Pedra[] = [];
  private pedraImg: Assado | null = null;
  /* resultado da última batalha, aplicado quando a cena volta a ser a da vez */
  private pendente: Resultado | null = null;
  private pendenteEntrouNoTime = false;
  /* uma conta da guia acendeu: o corte de câmera espera a vez, sem interromper
     conversa, batalha ou qualquer outra coisa que já esteja tomando a tela */
  private cutscenePendente: { terreiro: string; faltam: number } | null = null;
  private cutscene: Cutscene | null = null;
  /* últimos botões apertados, andando livre — é contra isto que o código
     secreto é comparado a cada quadro */
  private bufferCodigo: Acao[] = [];

  constructor(op: OpcoesCenaMundo) {
    this.op = op;
  }

  /* ------------------------------------------------------------- montagem */

  entrar(): void {
    if (this.montado) {
      this.tempoFaixa = 0;
      this.conversa = null;
      this.carencia = 0.6;
      this.resolverBatalha();
      return;
    }
    this.montado = true;

    // recursos visuais assados uma vez, valem para todos os mapas
    this.caixaDialogo = assar(UI.caixa(LARG_DIALOGO, 14 + 3 * 10));
    this.rocadas = [assarSuave(T.rocada(0)), assarSuave(T.rocada(1)), assarSuave(T.rocada(2))];
    this.ondas = [assarSuave(T.ondaNado(0)), assarSuave(T.ondaNado(1))];
    this.menu = new MenuPausa({
      estado: this.op.estado,
      sondar: () => {
        const ctx = this.contexto();
        return sondarTesouro(this.def, (o) => objetoAtivo(o, ctx),
                             this.jogador.tx, this.jogador.ty).texto;
      },
    });
    this.loja = new Loja(this.op.estado);
    this.escolha = new EscolhaInicial();
    this.telaCaixa = new TelaCaixa(this.op.estado);
    this.telaPoder = new TelaPoder(this.op.estado);

    /* o relógio de uma corrida não vai para o save: quem volta com uma
       corrida ativa perde ela (e os marcos) e recomeça quando quiser */
    for (const c of CORRIDAS) if (this.op.estado.flags[c.ativa]) encerrar(c, this.op.estado.flags, false);

    const pos = this.op.estado.posicao;
    this.jogador = new Ator(this.folhaDe(this.op.estado.personagem), pos.tx, pos.ty, pos.dir);
    this.montarMapa(pos.mapa, { gravar: false });
    this.jogador.teleportar(pos.tx, pos.ty, pos.dir);
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
    this.mapa = this.op.mundo.obter(id, this.contexto());
    this.def = this.op.mundo.def(id);
    this.marcarVisita(id);
    this.conversa = null;
    this.duelo = null;

    this.npcs = this.def.npcs
      .filter((d) => this.condicoesValem(d.se, d.seNao))
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
    this.npcs = this.npcs.filter((n) => this.condicoesValem(n.def.se, n.def.seNao));
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
    const ativo = (o: { se?: string | readonly string[]; seNao?: string | readonly string[] }) =>
      this.condicoesValem(o.se, o.seNao);
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
    if (terreiro) this.prepararCutscene(terreiro, contasAcesasDe(e, terreiro));
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
        if (terreiro) this.prepararCutscene(terreiro, contasAcesasDe(e, terreiro));
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

  private recontarOcupados(): void {
    this.ocupados = new Set(this.npcs.map((n) => `${n.ator.tx},${n.ator.ty}`));
  }

  private montarAvisos(): void {
    this.avisos = new Map();
    const ctx = this.contexto();
    for (const o of this.def.objetos) {
      // objeto que saiu do mapa também não responde ao A
      if (!this.condicoesValem(o.se, o.seNao)) continue;
      /* objeto com fala própria manda em tudo: é o caixote, o pote, a brasa */
      if (o.falas) {
        for (let j = 0; j < (o.alt ?? 1); j++) {
          for (let i = 0; i < (o.larg ?? 1); i++) {
            this.avisos.set(`${o.tx + i},${o.ty + j}`,
                            { nome: o.placa ?? 'ACHADO', falas: o.falas });
          }
        }
      } else if (o.tipo === 'barreira') {
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'TRANCA', falas: diz('Uma tranca atravessada fecha a passagem.'),
          });
        }
      } else if (o.tipo === 'monteFolhas') {
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'MONTE DE FOLHAS', falas: diz('O vento ainda não abriu caminho aqui.'),
          });
        }
      } else if (o.tipo === 'cercaRaio') {
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'CERCA DE RAIO', falas: diz('A cerca estala de faísca. Alguma chave de para-raio a mantém ligada.'),
          });
        }
      } else if (o.tipo === 'cortinaLuz') {
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'CORTINA DE LUZ', falas: diz('Um clarão tão forte que o olho fecha sozinho. Falta o que desfaça a luz.'),
          });
        }
      } else if (o.tipo === 'veu') {
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'VÉU DE SOMBRA', falas: diz('Um breu grosso como pano. A mão atravessa, o corpo não.'),
          });
        }
      } else if (o.tipo === 'monteTerra') {
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'MONTE DE TERRA', falas: diz('Terra desmoronada tapa a passagem. Só cavando.'),
          });
        }
      } else if (o.tipo === 'pedraRachada') {
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'PEDRA RACHADA', falas: diz('Uma rachadura atravessa a pedra. Falta a faísca que a parta.'),
          });
        }
      } else if (o.tipo === 'portao') {
        const terreiro = o.terreiro ?? 'agua';
        const acesas = o.contas ?? ctx.contas(terreiro);
        const faltando = contasFaltandoDe(this.op.estado, terreiro);
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'GUIA DO TERREIRO',
            falas: acesas >= CONTAS_NA_GUIA
              ? diz('As cinco contas brilham, e a guia se abre sozinha ao seu passo.')
              : acesas === 0
                ? diz('Uma guia de cinco contas atravessa o pátio. Todas apagadas.',
                      'Cada serviço bem feito na região acende uma. Com as cinco acesas, a guia se abre.')
                : diz(`A guia tem ${acesas} de ${CONTAS_NA_GUIA} contas acesas.`,
                      `Ainda falta: ${faltando[0] ?? 'nada'}.`),
          });
        }
      } else if (o.tipo === 'placa' && o.placa) {
        this.avisos.set(`${o.tx},${o.ty}`, { nome: 'PLACA', falas: diz(o.placa) });
      } else if (o.trancada) {
        const col = colunaPorta(o.larg ?? 4, o.portaCol);
        this.avisos.set(`${o.tx + col},${o.ty + (o.alt ?? 3) - 1}`, {
          nome: 'PORTA', falas: diz('Está trancada. Não tem ninguém em casa.'),
        });
      }
    }
  }

  /* o vocabulário de condições de quests.ts, aplicado a objeto e a NPC */
  private condicoesValem(se?: string | readonly string[],
                         seNao?: string | readonly string[]): boolean {
    const e = this.op.estado;
    const lista = (v?: string | readonly string[]) =>
      v === undefined ? [] : typeof v === 'string' ? [v] : v;
    for (const c of lista(se)) if (!ligada(e, c)) return false;
    for (const c of lista(seNao)) if (ligada(e, c)) return false;
    return true;
  }

  private centrarCamera(): void {
    this.camera.seguir(this.jogador.px + TS / 2, this.jogador.py + TS / 2,
                       this.mapa.larguraPx, this.mapa.alturaPx);
  }

  /* ------------------------------------------------------------ conversa */

  private etiqueta(falante: string): Assado {
    let e = this.etiquetas.get(falante);
    if (e) return e;
    const w = larguraTexto(falante) + 10;
    const tag = UI.caixa(w, 17, { fundo: P.uiAcc, borda2: P.uiAccD });
    UI.textoNaCaixa(tag, falante, 5, 5);
    e = assar(tag);
    this.etiquetas.set(falante, e);
    return e;
  }

  private abrirConversa(falante: string, falas: readonly string[],
                        fala: Fala | null = null, npc: NpcVivo | null = null): void {
    const linhas: string[] = [];
    for (const f of falas) {
      const cheia = preencher(this.op.estado, f);
      linhas.push(...quebrar(cheia, LARG_DIALOGO - 18).join('\n').split('\n'));
    }
    this.conversa = { falante, linhas, indice: 0, revelados: 0, fala, npc };
  }

  private paginaAtual(): string[] {
    if (!this.conversa) return [];
    return this.conversa.linhas.slice(this.conversa.indice, this.conversa.indice + 3);
  }

  private textoDaPagina(): string { return this.paginaAtual().join(' '); }

  /* a última página fechou: só agora a fala mexe no mundo */
  private fecharConversa(): void {
    const c = this.conversa;
    this.conversa = null;
    if (!c || !c.fala) { this.duelo = null; return; }

    /* charada: nada acontece ainda — a última página fica na tela, e quem
       decide o que a fala faz é a resposta escolhida */
    if (c.fala.pergunta) {
      // fica na tela a última frase da fala — a própria pergunta
      const frase = c.fala.linhas[c.fala.linhas.length - 1] ?? '';
      const ultima = quebrar(preencher(this.op.estado, frase), LARG_DIALOGO - 18).slice(-3);
      this.pergunta = { fala: c.fala, npc: c.npc, falante: c.falante, linhas: ultima, sel: 0 };
      return;
    }

    const e = this.op.estado;
    const terreiro = this.terreiroDaFala(c.fala.liga);
    const efeito = aplicarFala(e, c.fala, {
      adicionar: (id, n) => adicionar(e.mochila, id, n),
      consumir: (id, n) => consumir(e.mochila, id, n),
    });
    this.atualizarCenario();
    if (terreiro) this.prepararCutscene(terreiro, contasAcesasDe(e, terreiro));

    if (efeito.batalha && c.npc?.def.treinador) {
      if (temTimeEmPe(e)) { this.lutarCom(c.npc); return; }
      // sem ninguém de pé não há luta: seria derrota automática
      this.duelo = null;
      this.abrirConversa(c.npc.def.nome,
                         ['...mas os seus Encantados não estão em pé. Vá se benzer primeiro.']);
      return;
    }
    this.duelo = null;
    if (efeito.loja) { this.emLoja = true; this.loja!.abrir(); }
    if (efeito.escolher) {
      this.emEscolha = true;
      this.escolha!.abrir((id) => this.receberInicial(id));
    }
    if (efeito.caixa) { this.emCaixa = true; this.telaCaixa!.abrir(); }
    /* um Encantado que acaba de entrar por fala é a mesma oferta de reordenar
       que uma captura dá — só que sem passar pela tela de batalha */
    if (efeito.encantado && e.time.length > 1) this.abrirReordenar();
    /* gravar depois de curar, de acender uma conta, de ganhar item de serviço
       ou de conquistar medalha: são os pontos em que perder progresso doeria
       de verdade */
    if (efeito.curou || efeito.deu || efeito.levou || efeito.medalha || efeito.encantado || terreiro) {
      salvar(e);
    }
    if (efeito.medalha) this.atualizarCenario();   // o Dom muda o mapa
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
      'Agora chegue aqui outra vez, que eu tenho um serviço para vocês dois.',
    ]);
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
    if (this.duelo || this.conversa || this.indo) return;
    // sem ninguém de pé, ser avistado seria derrota na hora
    if (!temTimeEmPe(this.op.estado)) return;
    for (const n of this.npcs) {
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
    const oponentes = t.time.map((c) => criar(c.especie, c.nivel, { selvagem: t.selvagem }));
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
    d.npc.ator.olharPara(this.jogador.tx, this.jogador.ty);
    this.atualizarCenario();
    /* bicho preso no patuá não fica mais parado no cais */
    if (r === 'captura') this.sumirNpc(d.npc);
    if (terreiro) this.prepararCutscene(terreiro, contasAcesasDe(e, terreiro));
    salvar(e);
    if (t.falaDerrota && r !== 'captura') this.abrirConversa(d.npc.def.nome, [t.falaDerrota]);
  }

  /* ------------------------------------------------------- corte de câmera

     Uma conta da guia acabou de acender. O corte não pode atropelar nada
     que já esteja na tela — conversa, batalha, loja — então ele só GUARDA o
     que precisa mostrar; é `atualizar()` que decide a hora certa de soltar. */
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

  private prepararCutscene(terreiro: string, contasAgora: number): void {
    const total = TERREIROS[terreiro]?.length ?? CONTAS_NA_GUIA;
    this.cutscenePendente = { terreiro, faltam: total - contasAgora };
  }

  /* acha a guia de UM terreiro específico entre os mapas do registro */
  private encontrarGuia(terreiro: string):
      { mapaId: string; tx: number; ty: number; larg: number } | null {
    for (const id of this.op.mundo.ids) {
      const o = this.op.mundo.def(id).objetos
        .find((x) => x.tipo === 'portao' && (x.terreiro ?? 'agua') === terreiro);
      if (o) return { mapaId: id, tx: o.tx, ty: o.ty, larg: o.larg ?? 4 };
    }
    return null;
  }

  private iniciarCutscene(): void {
    const pend = this.cutscenePendente;
    this.cutscenePendente = null;
    const g = pend && this.encontrarGuia(pend.terreiro);
    if (!pend || !g) return;

    const mapa = this.op.mundo.obter(g.mapaId, this.contexto());
    const cam = new Camera();
    cam.seguir(g.tx * TS + (g.larg * TS) / 2, g.ty * TS + TS / 2, mapa.larguraPx, mapa.alturaPx);

    const texto = pend.faltam > 0
      ? `Mais uma conta da guia do terreiro acendeu! Faltam ${pend.faltam} para ela se abrir.`
      : 'A guia se abriu! O Terreiro está livre — vá em frente.';
    this.cutscene = { mapa, cam, t: 0, fase: 'entra', texto };
  }

  private atualizarCutscene(dt: number, entrada: Entrada): void {
    const c = this.cutscene!;
    c.t += dt;
    if (c.fase === 'entra' && c.t >= CUT_FADE) { c.t = 0; c.fase = 'mostra'; }
    else if (c.fase === 'mostra'
             && (c.t >= CUT_ESPERA || entrada.apertou('a') || entrada.apertou('b'))) {
      c.t = 0; c.fase = 'sai';
    } else if (c.fase === 'sai' && c.t >= CUT_FADE) { this.cutscene = null; }
  }

  private desenharCutscene(r: Renderizador): void {
    const c = this.cutscene!;
    r.limpar('#101018');
    c.mapa.desenhar(r.ctx, c.cam.x, c.cam.y, LARGURA, ALTURA);

    if (c.fase === 'mostra') {
      const larg = LARGURA - 16;
      const linhas = quebrar(c.texto, larg - 12);
      const alt = 8 + linhas.length * 10;
      const y = ALTURA - alt - 10;
      r.retangulo(6, y - 2, larg + 4, alt + 4, P.ink!);
      r.retangulo(8, y, larg, alt, P.uiBg!);
      linhas.forEach((l, i) => r.texto(l, 14, y + 6 + i * 10, P.uiInk!));
    }

    const alfa = c.fase === 'entra' ? 1 - c.t / CUT_FADE : c.fase === 'sai' ? c.t / CUT_FADE : 0;
    if (alfa > 0) {
      r.ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
      r.limpar('#000000');
      r.ctx.globalAlpha = 1;
    }
  }

  private sumirNpc(npc: NpcVivo): void {
    this.npcs = this.npcs.filter((n) => n !== npc);
    this.recontarOcupados();
  }

  /* ------------------------------------------------------ código secreto */

  private bateCodigo(codigo: readonly Acao[]): boolean {
    if (this.bufferCodigo.length < codigo.length) return false;
    const cauda = this.bufferCodigo.slice(this.bufferCodigo.length - codigo.length);
    return codigo.every((a, i) => cauda[i] === a);
  }

  private verificarCodigoSecreto(entrada: Entrada): void {
    const apertados: Acao[] =
      (['cima', 'baixo', 'esq', 'dir', 'a', 'b'] as const)
        .filter((a) => entrada.apertouAgora(a));
    if (apertados.length === 0) return;

    this.bufferCodigo.push(...apertados);
    const maior = Math.max(CODIGO_REGIAO2.length, CODIGO_REGIAO3.length, CODIGO_REGIAO4.length,
                           CODIGO_REGIAO5.length, CODIGO_REGIAO6.length, CODIGO_REGIAO7.length, CODIGO_REGIAO8.length,
                           CODIGO_EVOLUIR.length, CODIGO_POTENCIA.length);
    const excesso = this.bufferCodigo.length - maior;
    if (excesso > 0) this.bufferCodigo.splice(0, excesso);

    // todo código termina em 'a' — sem consumi-lo aqui, o mesmo toque cairia
    // de novo em `entrada.apertou('a')` lá embaixo, no andar, e abriria
    // conversa com o que estiver na frente do jogador por cima da ativação
    if (this.bateCodigo(CODIGO_REGIAO2)) {
      this.bufferCodigo = [];
      entrada.apertou('a'); entrada.apertou('b');
      this.ativarCodigoRegiao2();
    } else if (this.bateCodigo(CODIGO_REGIAO3)) {
      this.bufferCodigo = [];
      entrada.apertou('a'); entrada.apertou('b');
      this.ativarCodigoRegiao3();
    } else if (this.bateCodigo(CODIGO_REGIAO4)) {
      this.bufferCodigo = [];
      entrada.apertou('a'); entrada.apertou('b');
      this.ativarCodigoRegiao4();
    } else if (this.bateCodigo(CODIGO_REGIAO5)) {
      this.bufferCodigo = [];
      entrada.apertou('a'); entrada.apertou('b');
      this.ativarCodigoRegiao5();
    } else if (this.bateCodigo(CODIGO_REGIAO6)) {
      this.bufferCodigo = [];
      entrada.apertou('a'); entrada.apertou('b');
      this.ativarCodigoRegiao6();
    } else if (this.bateCodigo(CODIGO_REGIAO7)) {
      this.bufferCodigo = [];
      entrada.apertou('a'); entrada.apertou('b');
      this.ativarCodigoRegiao7();
    } else if (this.bateCodigo(CODIGO_REGIAO8)) {
      this.bufferCodigo = [];
      entrada.apertou('a'); entrada.apertou('b');
      this.ativarCodigoRegiao8();
    } else if (this.bateCodigo(CODIGO_EVOLUIR)) {
      this.bufferCodigo = [];
      entrada.apertou('a'); entrada.apertou('b');
      this.ativarCodigoEvoluir();
    } else if (this.bateCodigo(CODIGO_POTENCIA)) {
      this.bufferCodigo = [];
      entrada.apertou('a'); entrada.apertou('b');
      this.ativarCodigoPotencia();
    }
  }

  /* pula direto para a Mata do Curupira: dá a Medalha Maré e o Dom "Nadar"
     de brinde (a travessia depende dos dois), um Curupinho se o time
     estiver vazio (para nenhum encontro ou treinador travar a partida), e a
     carta da Dona Firmina para a Tiê — sem ela, o Seu Elias não aceita nada
     e a primeira conta da guia fica impossível de acender, já que quem daria
     a carta (a própria Firmina, em Vila Aurora) ficou pra trás no pulo. */
  private ativarCodigoRegiao2(): void {
    const e = this.op.estado;
    if (!e.medalhas.includes('mare')) e.medalhas.push('mare');
    e.flags['dom_nadar'] = true;
    e.flags['escolheu_inicial'] = true;
    if (e.time.length === 0) {
      guardar(e, criar('curupinho', NIVEL_INICIAL));
      e.flags['inicial_curupinho'] = true;
    }
    if (!e.flags['deu_carta_tie'] && !e.flags['conta_recado_mata']) {
      e.flags['deu_carta_tie'] = true;
      adicionar(e.mochila, 'carta_tie');
    }

    const alvo = this.op.mundo.def('mataDoCurupira').inicio;
    this.jogador.teleportar(alvo.tx, alvo.ty, alvo.dir);
    this.montarMapa('mataDoCurupira');   // já grava: medalha, Dom e time mudaram
    this.centrarCamera();
    this.abrirConversa('???', ['Código aceito. A travessia para a Mata do Curupira se abre.']);
  }

  /* pula direto para a Serra Boitatá: leva as duas medalhas anteriores e os
     dois Dons que abrem o caminho até lá, um time se estiver vazio e cinco
     patuás bons — sem eles a conta do Mestre Patueiro (seis Encantados
     presos) ficaria impossível para quem pulou a economia das duas
     primeiras regiões. */
  private ativarCodigoRegiao3(): void {
    const e = this.op.estado;
    for (const m of ['mare', 'raiz']) if (!e.medalhas.includes(m)) e.medalhas.push(m);
    e.flags['dom_nadar'] = true;
    e.flags['dom_cortarCipo'] = true;
    e.flags['escolheu_inicial'] = true;
    if (e.time.length === 0) {
      guardar(e, criar('curupinho', NIVEL_INICIAL));
      e.flags['inicial_curupinho'] = true;
    }
    if (quantidade(e.mochila, 'patua_bom') < 5) adicionar(e.mochila, 'patua_bom', 5);

    const alvo = this.op.mundo.def('trilhaDaBrasa').inicio;
    this.jogador.teleportar(alvo.tx, alvo.ty, alvo.dir);
    this.montarMapa('trilhaDaBrasa');   // já grava: medalhas, Dons e time mudaram
    this.centrarCamera();
    this.abrirConversa('???', ['Código aceito. A subida para a Serra Boitatá se abre.']);
  }

  /* pula direto para o Campo do Saci: leva as três medalhas anteriores e os
     três Dons que abrem o caminho até lá, um time se estiver vazio e cinco
     patuás bons — mesma lógica do código da região 3. */
  private ativarCodigoRegiao4(): void {
    const e = this.op.estado;
    for (const m of ['mare', 'raiz', 'brasa']) if (!e.medalhas.includes(m)) e.medalhas.push(m);
    e.flags['dom_nadar'] = true;
    e.flags['dom_cortarCipo'] = true;
    e.flags['dom_tocha'] = true;
    e.flags['escolheu_inicial'] = true;
    if (e.time.length === 0) {
      guardar(e, criar('curupinho', NIVEL_INICIAL));
      e.flags['inicial_curupinho'] = true;
    }
    if (quantidade(e.mochila, 'patua_bom') < 5) adicionar(e.mochila, 'patua_bom', 5);

    const alvo = this.op.mundo.def('campoAberto').inicio;
    this.jogador.teleportar(alvo.tx, alvo.ty, alvo.dir);
    this.montarMapa('campoAberto');   // já grava: medalhas, Dons e time mudaram
    this.centrarCamera();
    this.abrirConversa('???', ['Código aceito. A entrada para o Campo do Saci se abre.']);
  }

  /* pula direto para a Aldeia Tupã, pela Campina dos Raios: leva as quatro
     medalhas anteriores e os quatro Dons, um time se estiver vazio e cinco
     patuás bons — mesma lógica dos códigos das regiões 3 e 4. */
  private ativarCodigoRegiao5(): void {
    const e = this.op.estado;
    for (const m of ['mare', 'raiz', 'brasa', 'rodamoinho']) if (!e.medalhas.includes(m)) e.medalhas.push(m);
    e.flags['dom_nadar'] = true;
    e.flags['dom_cortarCipo'] = true;
    e.flags['dom_tocha'] = true;
    e.flags['dom_rajada'] = true;
    e.flags['escolheu_inicial'] = true;
    if (e.time.length === 0) {
      guardar(e, criar('curupinho', NIVEL_INICIAL));
      e.flags['inicial_curupinho'] = true;
    }
    if (quantidade(e.mochila, 'patua_bom') < 5) adicionar(e.mochila, 'patua_bom', 5);

    const alvo = this.op.mundo.def('campinaDosRaios').inicio;
    this.jogador.teleportar(alvo.tx, alvo.ty, alvo.dir);
    this.montarMapa('campinaDosRaios');   // já grava: medalhas, Dons e time mudaram
    this.centrarCamera();
    this.abrirConversa('???', ['Código aceito. A estrada para a Aldeia Tupã se abre.']);
  }

  /* pula direto para as Minas da Caipora, pela Boca da Mina: leva as cinco
     medalhas anteriores e os cinco Dons — o Faísca é o que abre a estrada —,
     um time se estiver vazio e cinco patuás bons. */
  private ativarCodigoRegiao6(): void {
    const e = this.op.estado;
    for (const m of ['mare', 'raiz', 'brasa', 'rodamoinho', 'trovao']) if (!e.medalhas.includes(m)) e.medalhas.push(m);
    for (const d of ['nadar', 'cortarCipo', 'tocha', 'rajada', 'faisca']) e.flags[`dom_${d}`] = true;
    e.flags['escolheu_inicial'] = true;
    if (e.time.length === 0) {
      guardar(e, criar('curupinho', NIVEL_INICIAL));
      e.flags['inicial_curupinho'] = true;
    }
    if (quantidade(e.mochila, 'patua_bom') < 5) adicionar(e.mochila, 'patua_bom', 5);

    const alvo = this.op.mundo.def('bocaDaMina').inicio;
    this.jogador.teleportar(alvo.tx, alvo.ty, alvo.dir);
    this.montarMapa('bocaDaMina');   // já grava: medalhas, Dons e time mudaram
    this.centrarCamera();
    this.abrirConversa('???', ['Código aceito. A estrada para as Minas da Caipora se abre.']);
  }

  /* pula direto para o Bairro da Cuca, pela Rua do Breu: as seis medalhas
     anteriores e os seis Dons (o Escavar abre a estrada), um time se estiver
     vazio e cinco patuás bons. */
  private ativarCodigoRegiao7(): void {
    const e = this.op.estado;
    for (const m of ['mare', 'raiz', 'brasa', 'rodamoinho', 'trovao', 'pedra']) if (!e.medalhas.includes(m)) e.medalhas.push(m);
    for (const d of ['nadar', 'cortarCipo', 'tocha', 'rajada', 'faisca', 'escavar']) e.flags[`dom_${d}`] = true;
    e.flags['escolheu_inicial'] = true;
    if (e.time.length === 0) {
      guardar(e, criar('curupinho', NIVEL_INICIAL));
      e.flags['inicial_curupinho'] = true;
    }
    if (quantidade(e.mochila, 'patua_bom') < 5) adicionar(e.mochila, 'patua_bom', 5);

    const alvo = this.op.mundo.def('ruaDoBreu').inicio;
    this.jogador.teleportar(alvo.tx, alvo.ty, alvo.dir);
    this.montarMapa('ruaDoBreu');   // já grava: medalhas, Dons e time mudaram
    this.centrarCamera();
    this.abrirConversa('???', ['Código aceito. A estrada para o Bairro da Cuca se abre.']);
  }

  /* pula direto para o Caminho da Aurora: as sete medalhas e os sete Dons
     (o véu da saída sul do bairro só cede ao Dom Visão Noturna) */
  private ativarCodigoRegiao8(): void {
    const e = this.op.estado;
    for (const m of ['mare', 'raiz', 'brasa', 'rodamoinho', 'trovao', 'pedra', 'breu']) if (!e.medalhas.includes(m)) e.medalhas.push(m);
    for (const d of ['nadar', 'cortarCipo', 'tocha', 'rajada', 'faisca', 'escavar', 'visao']) e.flags[`dom_${d}`] = true;
    e.flags['escolheu_inicial'] = true;
    if (e.time.length === 0) {
      guardar(e, criar('curupinho', NIVEL_INICIAL));
      e.flags['inicial_curupinho'] = true;
    }
    if (quantidade(e.mochila, 'patua_bom') < 5) adicionar(e.mochila, 'patua_bom', 5);

    const alvo = this.op.mundo.def('caminhoAurora').inicio;
    this.jogador.teleportar(alvo.tx, alvo.ty, alvo.dir);
    this.montarMapa('caminhoAurora');   // já grava: medalhas, Dons e time mudaram
    this.centrarCamera();
    this.abrirConversa('???', ['Código aceito. O véu se abre, e o caminho da Cidade do Sol aparece.']);
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
      const atras = this.npcs.find((n) => n.ator.tx === tx + dx && n.ator.ty === ty + dy);
      if (atras) { tx += dx; ty += dy; }
    }

    const npc = this.npcs.find((n) => n.ator.tx === tx && n.ator.ty === ty);
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
    if (fala.batalha && this.venceu(npc)) {
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

    if (this.cutscene) { this.atualizarCutscene(dt, entrada); return; }

    // uma conta acendeu: o corte de câmera espera a vez, sem atropelar nada
    // que já esteja na tela (conversa, batalha, loja, menu, escolha, caixa, poder, porta)
    if (this.cutscenePendente && !this.conversa && !this.pergunta && !this.emLoja && !this.emMenu
        && !this.emEscolha && !this.emCaixa && !this.emPoder && !this.indo && !this.duelo) {
      this.iniciarCutscene();
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
    if (this.emCaixa) {
      if (this.telaCaixa!.atualizar(dt, entrada) === 'fechar') this.emCaixa = false;
      return;
    }

    // ---- atravessando uma porta: nada responde enquanto a tela escurece ----
    if (this.indo) { this.atravessar(dt); return; }

    // ---- conversa em andamento: trava o movimento ----
    if (this.conversa) {
      const total = this.textoDaPagina().length;
      this.conversa.revelados = Math.min(total,
        this.conversa.revelados + CHARS_POR_SEG * multiplicadorVelocidade() * dt);
      if (entrada.apertou('a')) {
        if (this.conversa.revelados < total) {
          this.conversa.revelados = total;            // primeiro A: revela tudo
        } else {
          this.conversa.indice += 3;                  // segundo A: próxima página
          this.conversa.revelados = 0;
          if (this.conversa.indice >= this.conversa.linhas.length) this.fecharConversa();
        }
      } else if (entrada.apertou('b')) {
        this.conversa.indice = this.conversa.linhas.length;
        this.fecharConversa();
      }
      return;
    }

    // ---- charada: escolher a resposta ----
    if (this.pergunta) { this.responderPergunta(entrada); return; }

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
    if (this.conversa) return;

    this.verificarCodigoSecreto(entrada);

    if (entrada.apertou('menu')) { this.emMenu = true; this.menu!.abrir(); return; }

    // ---- andar ----
    const { x, y } = entrada.direcao();
    const dir: Direcao | null = direcaoDe(x, y);
    if (dir) this.tentarEmpurrar(dir);
    const deX = this.jogador.tx, deY = this.jogador.ty;
    this.jogador.comandar(this.mapa, dir, entrada.segurando('b'),
                          (tx, ty) => this.ocupados.has(`${tx},${ty}`)
                                    || ocupadaPorPedra(this.pedras, tx, ty));
    if (this.jogador.tx !== deX || this.jogador.ty !== deY) {
      this.puxarSeguidor(deX, deY, entrada.segurando('b'));
    }
    this.seguidor?.atualizar(dt);
    const chegou = this.jogador.atualizar(dt);

    if (this.carencia > 0) this.carencia -= dt;

    if (chegou) this.aoPisarNoTile();

    if (!this.duelo && !this.deslizando && entrada.apertou('a')) this.interagir();

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
      if (terreiro) this.prepararCutscene(terreiro, contasAcesasDe(e, terreiro));
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

  /* um passo no mato alto: às vezes vira encontro */
  private talvezEncontro(): void {
    const tabela = this.def.encontros;
    if (!tabela || tabela.length === 0) return;
    if (!temTimeEmPe(this.op.estado)) return;

    const media = this.def.passosPorEncontro ?? 10;
    if (!acaso.chance(100 / media)) return;

    this.op.aoBatalhar({
      oponentes: [sortearSelvagem(tabela, acaso)],
      cenario: this.def.cenario ?? 'praia',
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
    if (this.cutscene) { this.desenharCutscene(r); return; }

    r.limpar('#101018');
    this.mapa.desenhar(r.ctx, this.camera.x, this.camera.y, LARGURA, ALTURA);

    // o feixe de luz, por cima do chão e por baixo de quem anda
    for (const [fx, fy] of this.feixe) {
      const px = fx * TS - this.camera.x, py = fy * TS - this.camera.y;
      r.retangulo(px + 5, py + 5, 6, 6, '#ffe860');
      r.retangulo(px + 7, py + 7, 2, 2, '#ffffff');
    }

    // atores e pedras, juntos, ordenados pela base: quem está mais abaixo
    // passa na frente — senão uma pedra numa fileira de baixo tampava
    // indevidamente quem andasse por cima dela na fileira de cima
    const todos = [this.jogador, ...this.npcs.map((n) => n.ator),
                   ...(this.seguidor ? [this.seguidor] : [])];
    const itens: { py: number; desenhar: () => void }[] = todos.map((a) => ({
      py: a.py,
      desenhar: () => {
        const x = a.desenhoX - this.camera.x, y = a.desenhoY - this.camera.y;
        if (this.mapa.agua(a.tx, a.ty)) {
          // nadando: só a cabeça de fora. O corpo nem se desenha — é a água
          // do próprio tile, já pintada por baixo, que faz o resto do trabalho
          const img = a.quadro();
          r.recorte(img, 0, 0, larguraDe(img), ALTURA_NADANDO, x, y);
          const q = Math.floor(this.tempoAnim * 2) % 2;
          r.sprite(this.ondas[q]!, a.px - this.camera.x, y + ALTURA_NADANDO - 3);
        } else {
          r.sprite(a.quadro(), x, y);
        }
        if (this.mapa.temEncontro(a.tx, a.ty)) {
          const q = a.movendo ? 1 + (Math.floor(this.tempoAnim * 12) % 2) : 0;
          r.sprite(this.rocadas[q]!, a.px - this.camera.x, a.py + 8 - this.camera.y);
        }
      },
    }));
    if (this.pedras.length > 0) {
      if (!this.pedraImg) this.pedraImg = assar(T.pedraRolante());
      for (const p of this.pedras) {
        itens.push({
          py: p.ty * TS,
          desenhar: () => r.sprite(this.pedraImg!, p.tx * TS - this.camera.x, p.ty * TS - this.camera.y),
        });
      }
    }
    itens.sort((a, b) => a.py - b.py);
    for (const it of itens) it.desenhar();

    if (this.duelo?.fase === 'susto') this.desenharSusto(r);

    if (this.def.escuro) this.desenharEscuridao(r);

    // faixa com o nome do lugar, ao chegar
    if (this.tempoFaixa > 0 && this.faixaNome) {
      const t = Math.min(1, this.tempoFaixa / 0.4);
      r.ctx.globalAlpha = t;
      r.sprite(this.faixaNome, 6, 6);
      r.ctx.globalAlpha = 1;
    }

    if (this.relogios.size > 0) this.desenharRelogio(r);
    if (this.conversa) this.desenharDialogo(r);
    if (this.pergunta) this.desenharPergunta(r);

    if (this.indo) {
      const t = this.fade <= FADE ? this.fade / FADE : 1 - (this.fade - FADE) / FADE;
      r.ctx.globalAlpha = Math.max(0, Math.min(1, t));
      r.limpar('#000000');
      r.ctx.globalAlpha = 1;
    }

    if (this.emEscolha) { r.cortina(0.45); this.escolha!.desenhar(r); }
    else if (this.emLoja) { r.cortina(0.45); this.loja!.desenhar(r); }
    else if (this.emCaixa) { r.cortina(0.45); this.telaCaixa!.desenhar(r); }
    else if (this.emPoder) { r.cortina(0.45); this.telaPoder!.desenhar(r); }
    else if (this.emMenu) { r.cortina(0.45); this.menu!.desenhar(r); }
  }

  /* o balão de espanto acima do treinador que acabou de te ver */
  private desenharSusto(r: Renderizador): void {
    const a = this.duelo!.npc.ator;
    const x = a.px - this.camera.x + 4;
    const y = a.py - this.camera.y - 14;
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
    let mascara = this.mascarasLuz.get(raio);
    if (!mascara) {
      mascara = assar(T.mascaraLuz(raio));
      this.mascarasLuz.set(raio, mascara);
    }
    const cx = this.jogador.px - this.camera.x + TS / 2;
    const cy = this.jogador.py - this.camera.y + TS / 2;
    r.escuridao(mascara, cx, cy);
  }

  /* ↑↓ escolhem, A responde, B desiste sem efeito nenhum (dá para voltar e
     perguntar de novo quando quiser) */
  private responderPergunta(entrada: Entrada): void {
    const p = this.pergunta!;
    const n = p.fala.pergunta!.opcoes.length;
    if (entrada.apertou('cima')) p.sel = (p.sel - 1 + n) % n;
    if (entrada.apertou('baixo')) p.sel = (p.sel + 1) % n;
    if (entrada.apertou('b')) { this.pergunta = null; this.duelo = null; return; }
    if (!entrada.apertou('a')) return;
    this.pergunta = null;
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

  private desenharPergunta(r: Renderizador): void {
    const p = this.pergunta!;
    const y = ALTURA - this.caixaDialogo.height - 6;
    r.sprite(this.caixaDialogo, 6, y);
    r.sprite(this.etiqueta(p.falante), 12, y - 11);
    p.linhas.forEach((l, i) => r.texto(l, 14, y + 8 + i * 10, P.uiInk!));

    const opcoes = p.fala.pergunta!.opcoes;
    const larg = Math.max(...opcoes.map((o) => r.larguraTexto(o))) + 26;
    const alt = 8 + opcoes.length * 12;
    const x = LARGURA - larg - 8, oy = y - alt - 4;
    r.retangulo(x - 2, oy - 2, larg + 4, alt + 4, P.ink!);
    r.retangulo(x, oy, larg, alt, P.uiBg!);
    opcoes.forEach((o, i) => {
      if (i === p.sel) r.texto('=', x + 5, oy + 5 + i * 12, P.uiAccD!);
      r.texto(o, x + 15, oy + 5 + i * 12, P.uiInk!);
    });
  }

  private desenharDialogo(r: Renderizador): void {
    const c = this.conversa!;
    const y = ALTURA - this.caixaDialogo.height - 6;
    r.sprite(this.caixaDialogo, 6, y);
    r.sprite(this.etiqueta(c.falante), 12, y - 11);

    // efeito de máquina de escrever: revela a página caractere a caractere
    let restantes = Math.floor(c.revelados);
    this.paginaAtual().forEach((linha, i) => {
      if (restantes <= 0) return;
      const visivel = linha.slice(0, restantes);
      restantes -= linha.length + 1;
      r.texto(visivel, 14, y + 8 + i * 10, P.uiInk!);
    });

    const completo = Math.floor(c.revelados) >= this.textoDaPagina().length;
    if (completo && Math.floor(this.tempoAnim * 3) % 2 === 0) {
      r.texto('v', LARGURA - 20, y + this.caixaDialogo.height - 12, P.uiAccD!);
    }
  }
}
