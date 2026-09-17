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
import { assar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import {
  Mapa, TS, type ContextoMapa, type DefMapa, type DefNPC, type DefSaida,
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
import { criar, nome as nomeDe, sortearSelvagem, type Encantado } from '../battle/encantado.ts';
import type { Resultado, Treinador } from '../battle/engine.ts';
import type { Cenario } from '../art/battlebg.ts';
import { adicionar, consumir } from '../data/items.ts';
import { guardar, temTimeEmPe, curarTime, type EstadoJogo } from '../game/state.ts';
import {
  aplicarFala, contasAcesas, contasFaltando, escolherFala, ligada, preencher,
  type Fala,
} from '../game/quests.ts';
import { salvar } from '../game/save.ts';
import { MenuPausa } from './menu.ts';
import { Loja } from './loja.ts';
import { EscolhaInicial, NIVEL_INICIAL } from './escolha.ts';

const LARG_DIALOGO = LARGURA - 12;
const CHARS_POR_SEG = 48;
/* um respiro de escuro entre um mapa e outro: sem isso a troca é um tranco */
const FADE = 0.18;
/* quanto tempo o "!" fica sobre a cabeça do treinador antes de ele vir */
const SUSTO = 0.7;

interface NpcVivo {
  def: DefNPC;
  ator: Ator;
  /* quantas fugas o fujão ainda aguenta nesta visita ao mapa */
  folego: number;
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
  private emMenu = false;
  private emLoja = false;
  private emEscolha = false;
  /* deslizando numa poça: o passo continua sozinho até bater em alguma coisa */
  private deslizando = false;
  /* folhas de sprite assadas uma vez por estilo, valem para todos os mapas */
  private folhas = new Map<string, FolhaAssada>();
  /* resultado da última batalha, aplicado quando a cena volta a ser a da vez */
  private pendente: Resultado | null = null;

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
    this.rocadas = [assar(T.rocada(0)), assar(T.rocada(1)), assar(T.rocada(2))];
    this.menu = new MenuPausa({
      estado: this.op.estado,
      aoSalvar: () => salvar(this.op.estado),
    });
    this.loja = new Loja(this.op.estado);
    this.escolha = new EscolhaInicial();

    const pos = this.op.estado.posicao;
    this.jogador = new Ator(this.folhaDe('taina'), pos.tx, pos.ty, pos.dir);
    this.montarMapa(pos.mapa, { gravar: false });
    this.jogador.teleportar(pos.tx, pos.ty, pos.dir);
    this.centrarCamera();
  }

  /* o pouco que um mapa precisa saber da partida para se desenhar */
  private contexto(): ContextoMapa {
    const e = this.op.estado;
    return {
      contas: contasAcesas(e),
      nadar: ligada(e, 'dom_nadar'),
      ligada: (c) => ligada(e, c),
    };
  }

  /* troca o cenário, os NPCs e os avisos; o jogador continua sendo o mesmo */
  private montarMapa(id: string, opt: { gravar?: boolean } = {}): void {
    this.mapa = this.op.mundo.obter(id, this.contexto());
    this.def = this.op.mundo.def(id);
    this.conversa = null;
    this.duelo = null;

    this.npcs = this.def.npcs
      .filter((d) => this.condicoesValem(d.se, d.seNao))
      .map((d) => ({
        def: d,
        ator: new Ator(this.folhaDe(d.estilo), d.tx, d.ty, d.dir),
        folego: d.fujao?.folego ?? FOLEGO_PADRAO,
      }));
    this.recontarOcupados();
    this.montarAvisos();

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

    const novo = this.op.mundo.obter(this.def.id, this.contexto());
    if (novo === this.mapa) return;
    this.mapa = novo;
    this.montarAvisos();
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
      } else if (o.tipo === 'portao') {
        const acesas = o.contas ?? ctx.contas;
        const faltando = contasFaltando(this.op.estado);
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

    const e = this.op.estado;
    const antes = contasAcesas(e);
    const efeito = aplicarFala(e, c.fala, {
      adicionar: (id, n) => adicionar(e.mochila, id, n),
      consumir: (id, n) => consumir(e.mochila, id, n),
    });
    this.atualizarCenario();

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
    /* gravar depois de curar, de acender uma conta, de ganhar item de serviço
       ou de conquistar medalha: são os pontos em que perder progresso doeria
       de verdade */
    if (efeito.curou || efeito.deu || efeito.levou || efeito.medalha
        || contasAcesas(e) !== antes) {
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
    salvar(e);
    this.abrirConversa('DONA FIRMINA', [
      `${nomeDe(bicho)} é seu, ${e.nome}. Trate bem e ele trata melhor.`,
      'Agora chegue aqui outra vez, que eu tenho um serviço para vocês dois.',
    ]);
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
    this.op.aoBatalhar({
      oponentes,
      treinador: t.selvagem ? null : {
        nome: npc.def.nome, classe: t.classe,
        falaInicio: t.falaInicio, falaDerrota: t.falaDerrota, premio: t.premio,
      },
      cenario: this.def.cenario ?? 'praia',
    });
  }

  /* o main avisa como terminou; a cena aplica quando volta a ser a da vez */
  voltouDaBatalha(r: Resultado): void { this.pendente = r; }

  private resolverBatalha(): void {
    const r = this.pendente;
    this.pendente = null;
    if (r === null) return;

    const d = this.duelo;
    this.duelo = null;
    if (r === 'derrota') { this.socorrer(); return; }
    if (!d) return;
    // contra bicho, prender no patuá conta tanto quanto vencer
    const ganhou = r === 'vitoria' || (r === 'captura' && d.npc.def.treinador?.selvagem === true);
    if (!ganhou) return;

    const e = this.op.estado;
    const t = d.npc.def.treinador!;
    e.flags[`venceu_${d.npc.def.id}`] = true;
    const extras = t.liga === undefined ? []
                 : typeof t.liga === 'string' ? [t.liga] : t.liga;
    for (const f of extras) e.flags[f] = true;
    if (t.premio) e.dinheiro += t.premio;
    d.npc.ator.olharPara(this.jogador.tx, this.jogador.ty);
    this.atualizarCenario();
    /* bicho preso no patuá não fica mais parado no cais */
    if (r === 'captura') this.sumirNpc(d.npc);
    salvar(e);
    if (t.falaDerrota && r !== 'captura') this.abrirConversa(d.npc.def.nome, [t.falaDerrota]);
  }

  private sumirNpc(npc: NpcVivo): void {
    this.npcs = this.npcs.filter((n) => n !== npc);
    this.recontarOcupados();
  }

  /* ------------------------------------------------------------- entrada */

  private interagir(): void {
    const { tx, ty } = this.jogador.frente();

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
    if (this.emEscolha) {
      if (this.escolha!.atualizar(dt, entrada) === 'fechar') this.emEscolha = false;
      return;
    }

    // ---- atravessando uma porta: nada responde enquanto a tela escurece ----
    if (this.indo) { this.atravessar(dt); return; }

    // ---- conversa em andamento: trava o movimento ----
    if (this.conversa) {
      const total = this.textoDaPagina().length;
      this.conversa.revelados = Math.min(total, this.conversa.revelados + CHARS_POR_SEG * dt);
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

    // ---- treinador vindo: o jogador assiste ----
    if (this.duelo) {
      if (this.duelo.fase !== 'lutando') this.aproximar(dt);
      return;
    }

    // ---- deslizando numa poça: o passo segue sozinho ----
    if (this.deslizando) { this.deslizar(dt); return; }

    if (entrada.apertou('menu')) { this.emMenu = true; this.menu!.abrir(); return; }

    // ---- andar ----
    const { x, y } = entrada.direcao();
    const dir: Direcao | null = direcaoDe(x, y);
    this.jogador.comandar(this.mapa, dir, entrada.segurando('b'),
                          (tx, ty) => this.ocupados.has(`${tx},${ty}`));
    const chegou = this.jogador.atualizar(dt);

    if (this.carencia > 0) this.carencia -= dt;

    if (chegou) this.aoPisarNoTile();

    if (!this.duelo && !this.deslizando && entrada.apertou('a')) this.interagir();

    this.centrarCamera();
  }

  /* o jogador acabou de ocupar um tile novo: é aqui que o mundo reage */
  private aoPisarNoTile(): void {
    const p = this.op.estado.posicao;
    p.mapa = this.def.id; p.tx = this.jogador.tx; p.ty = this.jogador.ty;
    p.dir = this.jogador.dir;

    /* Poça com caminho livre à frente: o chão continua levando, e nada mais
       acontece até ele parar. Poça ENCOSTADA numa parede é chão comum —
       senão quem escorrega até o canto do salão nunca mais anda. */
    this.deslizando = this.mapa.escorrega(this.jogador.tx, this.jogador.ty)
                   && this.temCaminhoAFrente();
    if (this.deslizando) return;

    const saida = this.mapa.saidaEm(this.jogador.tx, this.jogador.ty);
    if (saida && saida.aoPisar !== false) { this.indo = saida; this.fade = 0; return; }

    this.espantarFujoes();
    this.olharTreinadores();
    if (!this.duelo && this.carencia <= 0
        && this.mapa.temEncontro(this.jogador.tx, this.jogador.ty)) {
      this.talvezEncontro();
    }
  }

  private temCaminhoAFrente(): boolean {
    const { tx, ty } = this.jogador.frente();
    return !this.mapa.solido(tx, ty) && !this.ocupados.has(`${tx},${ty}`);
  }

  /* Enquanto houver água adiante, o passo se repete sozinho na mesma
     direção. Quem decide se o escorregão continua é `aoPisarNoTile`. */
  private deslizar(dt: number): void {
    if (!this.jogador.movendo) {
      this.jogador.comandar(this.mapa, this.jogador.dir, true,
                            (tx, ty) => this.ocupados.has(`${tx},${ty}`));
    }
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
    const s = this.def.socorro;
    this.abrirConversa(s?.quem ?? 'ALGUÉM', [...(s?.falas ?? [
      'Você apagou no meio do mato, criança.',
      'Benzi seus Encantados e te trouxe de volta. Vá com mais juízo.',
    ])]);
  }

  /* ------------------------------------------------------------- desenho */

  desenhar(r: Renderizador): void {
    r.limpar('#101018');
    this.mapa.desenhar(r.ctx, this.camera.x, this.camera.y, LARGURA, ALTURA);

    // atores ordenados pela base: quem está mais abaixo passa na frente
    const todos = [this.jogador, ...this.npcs.map((n) => n.ator)];
    todos.sort((a, b) => a.py - b.py);
    for (const a of todos) {
      r.sprite(a.quadro(), a.desenhoX - this.camera.x, a.desenhoY - this.camera.y);
      if (this.mapa.temEncontro(a.tx, a.ty)) {
        const q = a.movendo ? 1 + (Math.floor(this.tempoAnim * 12) % 2) : 0;
        r.sprite(this.rocadas[q]!, a.px - this.camera.x, a.py + 8 - this.camera.y);
      }
    }

    if (this.duelo?.fase === 'susto') this.desenharSusto(r);

    // faixa com o nome do lugar, ao chegar
    if (this.tempoFaixa > 0 && this.faixaNome) {
      const t = Math.min(1, this.tempoFaixa / 0.4);
      r.ctx.globalAlpha = t;
      r.sprite(this.faixaNome, 6, 6);
      r.ctx.globalAlpha = 1;
    }

    if (this.conversa) this.desenharDialogo(r);

    if (this.indo) {
      const t = this.fade <= FADE ? this.fade / FADE : 1 - (this.fade - FADE) / FADE;
      r.ctx.globalAlpha = Math.max(0, Math.min(1, t));
      r.limpar('#000000');
      r.ctx.globalAlpha = 1;
    }

    if (this.emEscolha) { r.cortina(0.45); this.escolha!.desenhar(r); }
    else if (this.emLoja) { r.cortina(0.45); this.loja!.desenhar(r); }
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
