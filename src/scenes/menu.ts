/* =========================================================================
   Menu de pausa — TIME, MOCHILA, MEDALHAS, SALVAR, SAIR.

   Não é uma Cena: é uma SOBREPOSIÇÃO. Trocar de cena apagaria o mapa atrás,
   e o menu ficaria boiando no preto; assim o mundo continua desenhado por
   baixo e a pausa parece uma janela aberta em cima dele, como no gênero.
   ========================================================================= */
import { assar, assarSuave, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import { MEDALHAS, medalha } from '../art/badges.ts';
import { ficha, nome, MAX_GOLPES, type Encantado } from '../battle/encantado.ts';
import { golpe as fichaGolpe } from '../data/moves.ts';
import { tracoDaEspecie } from '../data/tracos.ts';
import { NOME_CLIMA, NOME_PERIODO, periodo, type Clima } from '../game/tempo.ts';
import { compatibilidade, ensinar } from '../game/golpes.ts';
import { EscolhaEsquecer } from '../ui/esquecer.ts';
import * as L from '../ui/listas.ts';
import { quebrar } from '../art/font.ts';
import { TERREIROS, contasAcesasDe, terreiroEmAberto } from '../game/quests.ts';
import { item, quantidade } from '../data/items.ts';
import { especie, ESPECIES_ORDEM } from '../data/creatures.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import {
  trocarPosicoes, usarItemForaDeBatalha, usavelForaDeBatalha, type EstadoJogo,
} from '../game/state.ts';
import { obterSlotAtivo, salvar, salvarEmSlot, definirSlotAtivo } from '../game/save.ts';
import { codigoDoSave, jsonDoSave, nomeDoArquivo } from '../game/transferencia.ts';
import { baixar, copiar } from '../ui/arquivos.ts';
import { TelaSlots } from './slots.ts';
import { MAPAS } from '../data/mapas/index.ts';
import {
  POSICOES, conhecido, estradas, itemMapaDaRegiao, lugarNoMundo, regiaoDoMapa,
} from '../data/mundo.ts';
import { desenharMundo, desenharPlanta } from '../ui/mapas.ts';
import {
  VELOCIDADES, NOME_VELOCIDADE, obterVelocidade, definirVelocidade, obterVisao3D, definirVisao3D,
  NOME_VOLUME, obterVolume, definirVolume, proximoVolume,
} from '../game/config.ts';
import * as Som from '../audio/som.ts';

/* as linhas da página de OPÇÕES: as quatro primeiras trocam de valor com A
   ou com as setas para os lados; as duas de baixo são ações, só com A */
const OPCOES = ['VELOCIDADE', 'VISÃO', 'MÚSICA', 'EFEITOS', 'BAIXAR SAVE', 'COPIAR CÓDIGO'] as const;
type Opcao = (typeof OPCOES)[number];
const ACOES: ReadonlySet<Opcao> = new Set<Opcao>(['BAIXAR SAVE', 'COPIAR CÓDIGO']);

/* o que a sobreposição devolve a cada quadro */
export type SaidaMenu = 'aberto' | 'fechar' | 'titulo' | 'viajar';

type Pagina = 'raiz' | 'time' | 'caixa' | 'mochila' | 'mochilaAlvo' | 'cantigaEsquecer' | 'medalhas' | 'guia'
            | 'caderno' | 'velocidade' | 'slots' | 'sair' | 'mapaMundo' | 'mapaLocal' | 'canoa';

const RAIZ = ['TIME', 'MOCHILA', 'MEDALHAS', 'GUIA', 'OPÇÕES', 'SALVAR', 'SAIR'] as const;

const CADERNO_LINHAS_VISIVEIS = 10;
/* a página CAIXA só mostra quem está guardado: trocar é no baú do benzimento */
const CAIXA_LINHAS_VISIVEIS = 10;

export interface OpcoesMenu {
  estado: EstadoJogo;
  /* a forquilha de radiestesia: a cena do mundo sabe onde o jogador está e
     o que há enterrado no mapa; o menu só mostra o que ela responder */
  sondar?: () => string;
  /* o tempo que faz onde o jogador está, para o cantinho do menu */
  clima?: () => Clima;
  /* a Canoa Encantada: para onde dá para ir, ou por que não dá agora */
  canoa?: () => { destinos: string[]; motivo: string | null };
}

export class MenuPausa {
  private op: OpcoesMenu;
  private pagina: Pagina = 'raiz';
  private sel = 0;
  private selLista = 0;
  private recado: string | null = null;
  private tempoRecado = 0;
  /* índice do Encantado "pego" na mão, esperando trocar de lugar com outro */
  private peguei: number | null = null;
  /* item escolhido na mochila, esperando saber em quem vai ser usado */
  private itemUsando: string | null = null;
  private selAlvo = 0;

  /* qual golpe sai para a cantiga entrar */
  private esquecer = new EscolhaEsquecer();

  /* cursor e rolagem da página CAIXA */
  private selCaixa = 0;
  private topoCaixa = 0;

  /* cursor e rolagem do Caderno de Bichos */
  private selCaderno = 0;
  private topoCaderno = 0;
  /* a direita do Caderno mostra o que o Contador anotou ou o traço (← →) */
  private cadernoTraco = false;

  /* o Mapa do Mundo: o lugar apontado, a planta aberta e o relógio do pisca */
  private selMundo: string | null = null;
  /* a canoa: os destinos, o escolhido, e se está na pergunta "IR PARA?" */
  private destinosCanoa: string[] = [];
  private selCanoa = 0;
  private confirmaCanoa = false;
  /* para onde a canoa vai; a cena do mundo lê quando o menu devolve 'viajar' */
  destinoViagem: string | null = null;
  private plantaDe: string | null = null;
  private relogio = 0;
  private estradasMundo = estradas(MAPAS);

  private caixaCheia: Assado;
  private caixaRaiz: Assado;
  private medalhinhas = new Map<string, Assado>();
  private spritesCaderno = new Map<string, Assado>();
  private slots: TelaSlots;
  private velSel = 0;

  constructor(op: OpcoesMenu) {
    this.op = op;
    this.caixaCheia = assar(UI.caixa(LARGURA - 8, ALTURA - 8));
    this.caixaRaiz = assar(UI.caixa(92, 18 + RAIZ.length * 13));
    this.slots = new TelaSlots();
  }

  abrir(): void {
    this.pagina = 'raiz';
    this.sel = 0;
    this.selLista = 0;
    this.recado = null;
    this.peguei = null;
    this.itemUsando = null;
  }

  /* aberto direto na página do time, com um recado — é como a cena do mundo
     convida a reordenar assim que um Encantado novo entra no grupo. */
  abrirEmTime(recado: string, selecionado = 0): void {
    this.abrir();
    this.pagina = 'time';
    this.selLista = selecionado;
    this.avisar(recado, 3.2);
  }

  /* ------------------------------------------------------------ entrada */

  atualizar(dt: number, entrada: Entrada): SaidaMenu {
    this.relogio += dt;
    if (this.tempoRecado > 0) {
      this.tempoRecado -= dt;
      if (this.tempoRecado <= 0) this.recado = null;
    }
    if (this.pagina === 'raiz') return this.naRaiz(entrada);
    return this.naPagina(entrada);
  }

  private andar(entrada: Entrada, atual: number, total: number): number {
    if (total <= 0) return 0;
    if (entrada.apertou('cima')) return (atual - 1 + total) % total;
    if (entrada.apertou('baixo')) return (atual + 1) % total;
    return atual;
  }

  private naRaiz(entrada: Entrada): SaidaMenu {
    this.sel = this.andar(entrada, this.sel, RAIZ.length);
    if (entrada.apertou('b') || entrada.apertou('menu')) return 'fechar';
    if (!entrada.apertou('a')) return 'aberto';

    switch (RAIZ[this.sel]) {
      case 'TIME': this.pagina = 'time'; this.selLista = 0; break;
      case 'MOCHILA': this.pagina = 'mochila'; this.selLista = 0; break;
      case 'MEDALHAS': this.pagina = 'medalhas'; break;
      case 'GUIA': this.pagina = 'guia'; break;
      case 'OPÇÕES':
        this.pagina = 'velocidade';
        this.velSel = 0;
        break;
      case 'SALVAR':
        this.pagina = 'slots';
        this.slots.abrir('salvar', (slot) => {
          const ok = salvarEmSlot(this.op.estado, slot);
          if (ok) { definirSlotAtivo(slot); Som.efeito('salvar'); }
          this.avisar(ok
            ? `PARTIDA GRAVADA NO SLOT ${slot + 1}.`
            : 'ESTE NAVEGADOR NÃO DEIXA GRAVAR.', 2.2);
        }, obterSlotAtivo());
        break;
      /* o cursor começa no NÃO: largar a partida não pode ser um A distraído */
      case 'SAIR': this.pagina = 'sair'; this.sel = 1; break;
    }
    return 'aberto';
  }

  /* leva a partida para fora do navegador: grava no slot antes, para o
     arquivo e o slot dizerem a mesma coisa */
  private exportar(qual: 'BAIXAR SAVE' | 'COPIAR CÓDIGO'): void {
    const e = this.op.estado;
    salvar(e);
    if (qual === 'BAIXAR SAVE') {
      this.avisar(baixar(nomeDoArquivo(e), jsonDoSave(e))
        ? 'SAVE BAIXADO. GUARDE O ARQUIVO.' : 'ESTE NAVEGADOR NÃO DEIXOU BAIXAR.', 2.4);
      return;
    }
    this.avisar('COPIANDO...', 2.4);
    void copiar(codigoDoSave(e)).then((ok) => {
      this.avisar(ok ? 'CÓDIGO COPIADO. COLE ONDE QUISER GUARDAR.' : 'COPIE O CÓDIGO DA CAIXINHA.', 2.8);
    });
  }

  private mudarOpcao(qual: Opcao, passo: 1 | -1): void {
    switch (qual) {
      case 'VELOCIDADE': {
        const n = VELOCIDADES.length;
        const v = VELOCIDADES[(VELOCIDADES.indexOf(obterVelocidade()) + passo + n) % n]!;
        definirVelocidade(v);
        this.avisar(`VELOCIDADE: ${NOME_VELOCIDADE[v]}.`);
        break;
      }
      case 'VISÃO': {
        const em3d = !obterVisao3D();
        definirVisao3D(em3d);
        this.avisar(em3d ? 'VISÃO 3D: A FOZ SAI DO PAPEL.' : 'VISÃO PLANA.');
        break;
      }
      case 'MÚSICA': case 'EFEITOS': {
        const canal = qual === 'MÚSICA' ? 'musica' : 'efeitos';
        definirVolume(canal, proximoVolume(obterVolume(canal), passo));
        Som.aplicarVolumes();
        break;
      }
      case 'BAIXAR SAVE': case 'COPIAR CÓDIGO':
        this.exportar(qual);
        break;
    }
  }

  private naPagina(entrada: Entrada): SaidaMenu {
    if (this.pagina === 'sair') {
      this.sel = this.andar(entrada, this.sel, 2);
      // SIM e NÃO ficam lado a lado: as setas para os lados também escolhem
      if (entrada.apertou('esq') || entrada.apertou('dir')) this.sel = 1 - this.sel;
      if (entrada.apertou('b')) { this.pagina = 'raiz'; this.sel = 0; return 'aberto'; }
      if (entrada.apertou('a')) {
        if (this.sel === 0) return 'titulo';
        this.pagina = 'raiz'; this.sel = 0;
      }
      return 'aberto';
    }

    if (this.pagina === 'mochilaAlvo') return this.naMochilaAlvo(entrada);
    if (this.pagina === 'cantigaEsquecer') {
      const r = this.esquecer.atualizar(entrada, this.op.estado.time[this.selAlvo]!);
      if (r.k === 'desistiu') this.pagina = 'mochilaAlvo';
      else if (r.k === 'esquece') this.terminarCantiga(r.indice);
      return 'aberto';
    }

    if (this.pagina === 'slots') {
      if (this.slots.atualizar(entrada) === 'fechar') this.pagina = 'raiz';
      return 'aberto';
    }

    if (this.pagina === 'velocidade') {
      this.velSel = this.andar(entrada, this.velSel, OPCOES.length);
      const opcao = OPCOES[this.velSel]!;
      const passo = ACOES.has(opcao)
        ? (entrada.apertou('a') ? 1 : 0)
        : entrada.apertou('esq') ? -1 : entrada.apertou('dir') || entrada.apertou('a') ? 1 : 0;
      if (passo !== 0) this.mudarOpcao(opcao, passo);
      if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'raiz';
      return 'aberto';
    }

    if (this.pagina === 'time') {
      this.selLista = this.andar(entrada, this.selLista, this.op.estado.time.length);
      if (entrada.apertou('a')) this.tocarTime();
      if (this.peguei === null && entrada.apertou('dir')) {
        this.pagina = 'caixa'; this.selCaixa = 0; this.topoCaixa = 0;
        return 'aberto';
      }
      if (entrada.apertou('b') || entrada.apertou('menu')) {
        if (this.peguei !== null) this.peguei = null;
        else this.pagina = 'raiz';
      }
      return 'aberto';
    }

    if (this.pagina === 'caixa') {
      const n = this.op.estado.caixa.length;
      this.selCaixa = this.andar(entrada, this.selCaixa, n);
      if (this.selCaixa < this.topoCaixa) this.topoCaixa = this.selCaixa;
      if (this.selCaixa >= this.topoCaixa + CAIXA_LINHAS_VISIVEIS) {
        this.topoCaixa = this.selCaixa - CAIXA_LINHAS_VISIVEIS + 1;
      }
      if (entrada.apertou('esq') || entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'time';
      return 'aberto';
    }

    if (this.pagina === 'mochila') {
      for (const t of ['cima', 'baixo', 'esq', 'dir'] as const) {
        if (entrada.apertou(t)) this.selLista = L.andarNaMochila(this.selLista, this.itens().length, t);
      }
      if (entrada.apertou('a')) this.tentarUsarItem();
      if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'raiz';
      return 'aberto';
    }

    if (this.pagina === 'canoa') return this.naCanoa(entrada);
    if (this.pagina === 'mapaMundo') {
      const lista = this.lugaresConhecidos();
      const i = Math.max(0, lista.indexOf(this.selMundo ?? ''));
      if (entrada.apertou('dir') || entrada.apertou('baixo')) this.selMundo = lista[(i + 1) % lista.length] ?? null;
      if (entrada.apertou('esq') || entrada.apertou('cima')) this.selMundo = lista[(i - 1 + lista.length) % lista.length] ?? null;
      if (entrada.apertou('a')) this.abrirPlanta();
      if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'mochila';
      return 'aberto';
    }
    if (this.pagina === 'mapaLocal') {
      if (entrada.apertou('b') || entrada.apertou('a') || entrada.apertou('menu')) this.pagina = 'mapaMundo';
      return 'aberto';
    }

    if (this.pagina === 'caderno') {
      this.selCaderno = this.andar(entrada, this.selCaderno, ESPECIES_ORDEM.length);
      this.ajustarJanelaCaderno();
      if (entrada.apertou('dir') || entrada.apertou('esq')) this.cadernoTraco = !this.cadernoTraco;
      if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'mochila';
      return 'aberto';
    }

    if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'raiz';
    return 'aberto';
  }

  /* A pega um Encantado da lista; A de novo, em outra linha, troca os dois de
     lugar. É a ordem do time que decide quem entra em campo primeiro. */
  private tocarTime(): void {
    const time = this.op.estado.time;
    if (time.length < 2) return;
    if (this.peguei === null) { this.peguei = this.selLista; return; }
    if (this.peguei !== this.selLista) trocarPosicoes(this.op.estado, this.peguei, this.selLista);
    this.peguei = null;
  }

  private tentarUsarItem(): void {
    const id = this.itens()[this.selLista];
    if (!id) return;
    if (id === 'caderno') { this.abrirCaderno(); return; }
    if (id === 'canoa') { this.abrirCanoa(); return; }
    if (id === 'mapa' || id.startsWith('mapa_')) { this.abrirMapa(); return; }
    if (id === 'forquilha') {
      this.avisar(this.op.sondar?.() ?? 'A forquilha só serve com os pés no chão.', 3);
      return;
    }
    if (!usavelForaDeBatalha(id)) { this.avisar('Isso não se usa fora de batalha.'); return; }
    if (this.op.estado.time.length === 0) {
      this.avisar('Você ainda não tem nenhum Encantado.');
      return;
    }
    this.itemUsando = id;
    this.selAlvo = 0;
    this.pagina = 'mochilaAlvo';
  }

  /* -------------------------------------------------------------- Canoa */

  private abrirCanoa(): void {
    const c = this.op.canoa?.();
    if (!c) { this.avisar('A canoa só anda com os pés na beira.'); return; }
    if (c.motivo) { this.avisar(c.motivo, 2.4); return; }
    this.destinosCanoa = c.destinos;
    this.selCanoa = 0;
    this.confirmaCanoa = false;
    this.pagina = 'canoa';
  }

  private naCanoa(entrada: Entrada): SaidaMenu {
    const n = this.destinosCanoa.length;
    if (this.confirmaCanoa) {
      if (entrada.apertou('esq') || entrada.apertou('dir') || entrada.apertou('cima') || entrada.apertou('baixo')) {
        this.sel = 1 - this.sel;
      }
      if (entrada.apertou('b')) { this.confirmaCanoa = false; return 'aberto'; }
      if (entrada.apertou('a')) {
        if (this.sel === 0) {
          this.destinoViagem = this.destinosCanoa[this.selCanoa] ?? null;
          this.pagina = 'raiz'; this.sel = 0; this.confirmaCanoa = false;
          return this.destinoViagem ? 'viajar' : 'aberto';
        }
        this.confirmaCanoa = false;
      }
      return 'aberto';
    }
    if (entrada.apertou('dir') || entrada.apertou('baixo')) this.selCanoa = (this.selCanoa + 1) % n;
    if (entrada.apertou('esq') || entrada.apertou('cima')) this.selCanoa = (this.selCanoa - 1 + n) % n;
    if (entrada.apertou('a')) { this.confirmaCanoa = true; this.sel = 0; }
    if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'mochila';
    return 'aberto';
  }

  /* ------------------------------------------------------ Mapa do Mundo */

  private lugarAtual(): string | null { return lugarNoMundo(this.op.estado.posicao.mapa, MAPAS); }

  /* os lugares que o jogador já conhece, na ordem da grade (coluna, linha) */
  private lugaresConhecidos(): string[] {
    const e = this.op.estado, atual = this.lugarAtual();
    return Object.keys(POSICOES)
      .filter((id) => conhecido(e.flags, e.medalhas, atual, id))
      .sort((a, b) => POSICOES[a]![0] - POSICOES[b]![0] || POSICOES[a]![1] - POSICOES[b]![1]);
  }

  private abrirMapa(): void {
    if (quantidade(this.op.estado.mochila, 'mapa') === 0) {
      this.avisar('Sem o Mapa do Mundo, um pedaço de mapa sozinho não diz onde fica.', 2.4);
      return;
    }
    this.selMundo = this.lugarAtual();
    this.pagina = 'mapaMundo';
  }

  /* a planta só abre com o mapa da região daquele lugar na mochila */
  private abrirPlanta(): void {
    const id = this.selMundo;
    const reg = id ? regiaoDoMapa(id) : null;
    if (!id || !reg) return;
    if (quantidade(this.op.estado.mochila, itemMapaDaRegiao(reg)) === 0) {
      this.avisar(`O mapa de ${reg.nome} ainda está escondido em algum canto dela.`, 2.6);
      return;
    }
    // no lugar onde o jogador está, a planta é a do mapa de verdade (a casa,
    // a loja...), com ele marcado; nos outros, a do lugar ao ar livre
    this.plantaDe = id === this.lugarAtual() ? this.op.estado.posicao.mapa : id;
    this.pagina = 'mapaLocal';
  }

  private abrirCaderno(): void {
    this.pagina = 'caderno';
    this.selCaderno = 0;
    this.topoCaderno = 0;
  }

  /* mantém a espécie escolhida sempre visível na janela que rola */
  private ajustarJanelaCaderno(): void {
    if (this.selCaderno < this.topoCaderno) this.topoCaderno = this.selCaderno;
    if (this.selCaderno >= this.topoCaderno + CADERNO_LINHAS_VISIVEIS) {
      this.topoCaderno = this.selCaderno - CADERNO_LINHAS_VISIVEIS + 1;
    }
  }

  private naMochilaAlvo(entrada: Entrada): SaidaMenu {
    this.selAlvo = this.andar(entrada, this.selAlvo, this.op.estado.time.length);
    if (entrada.apertou('b')) { this.pagina = 'mochila'; return 'aberto'; }
    if (entrada.apertou('a') && this.ehCantiga()) { this.cantar(); return 'aberto'; }
    if (entrada.apertou('a')) {
      const r = usarItemForaDeBatalha(this.op.estado, this.itemUsando!, this.selAlvo);
      this.avisar(r.msg);
      if (r.usou) salvarEmSlot(this.op.estado, obterSlotAtivo());
      this.pagina = 'mochila';
      this.selLista = Math.min(this.selLista, Math.max(0, this.itens().length - 1));
    }
    return 'aberto';
  }

  /* ---------------------------------------------------------- cantigas */

  private ehCantiga(): boolean {
    return !!this.itemUsando && item(this.itemUsando).efeito.k === 'cantiga';
  }

  private golpeDaCantiga(): string {
    const ef = item(this.itemUsando!).efeito;
    return ef.k === 'cantiga' ? ef.golpe : '';
  }

  /* A em alguém, com uma cantiga na mão: ensina na hora se houver vaga, ou
     pergunta qual golpe esquecer. A cantiga não se gasta. */
  private cantar(): void {
    const e = this.op.estado.time[this.selAlvo];
    if (!e) return;
    const c = compatibilidade(e, this.itemUsando!);
    const golpe = fichaGolpe(this.golpeDaCantiga()).nome.toUpperCase();
    if (c === 'ja') { this.avisar(`${nome(e).toUpperCase()} JÁ SABE ${golpe}.`); return; }
    if (c === 'nao') { this.avisar(`${nome(e).toUpperCase()} NÃO APRENDE ESSA CANTIGA.`); return; }
    if (e.golpes.length < MAX_GOLPES) { this.terminarCantiga(); return; }
    this.esquecer.abrir();
    this.pagina = 'cantigaEsquecer';
  }

  private terminarCantiga(substituir?: number): void {
    const e = this.op.estado.time[this.selAlvo]!;
    const golpe = this.golpeDaCantiga();
    const saiu = substituir === undefined ? null : fichaGolpe(e.golpes[substituir]!.id).nome.toUpperCase();
    if (!ensinar(e, golpe, substituir)) return;
    Som.vinheta('item');
    const novo = fichaGolpe(golpe).nome.toUpperCase();
    this.avisar(saiu ? `${nome(e).toUpperCase()} ESQUECEU ${saiu} E APRENDEU ${novo}!`
                     : `${nome(e).toUpperCase()} APRENDEU ${novo}!`, 2.6);
    salvarEmSlot(this.op.estado, obterSlotAtivo());
    this.pagina = 'mochilaAlvo';
  }

  private avisar(s: string, duracao = 1.6): void { this.recado = s; this.tempoRecado = duracao; }

  private itens(): string[] { return L.itensDaMochila(this.op.estado.mochila); }

  /* ------------------------------------------------------------ desenho */

  desenhar(r: Renderizador): void {
    if (this.pagina === 'raiz' || this.pagina === 'sair') this.desenharRaiz(r);
    else if (this.pagina === 'slots') this.slots.desenhar(r);
    else this.desenharPagina(r);
    if (this.recado) {
      /* recado comprido (a resposta da forquilha) quebra em mais linhas,
         crescendo para cima a partir do mesmo lugar */
      const linhas = quebrar(this.recado, LARGURA - 36);
      const larg = Math.max(...linhas.map((l) => r.larguraTexto(l))) + 20;
      const alt = 6 + linhas.length * 10;
      const y0 = ALTURA - 24 - alt;
      r.retangulo((LARGURA - larg) / 2, y0, larg, alt, P.ink!);
      linhas.forEach((l, i) =>
        r.texto(l, (LARGURA - r.larguraTexto(l)) / 2, y0 + 4 + i * 10, P.gold!));
    }
  }

  private desenharRaiz(r: Renderizador): void {
    const x = LARGURA - 98, y = 6;
    r.sprite(this.caixaRaiz, x, y);
    RAIZ.forEach((item, i) => {
      const iy = y + 9 + i * 13;
      if (i === this.sel && this.pagina === 'raiz') r.texto('=', x + 8, iy, P.uiAccD!);
      r.texto(item, x + 18, iy, P.uiInk!);
    });

    // a hora e o tempo, no canto de cima à esquerda
    const c = this.op.clima?.() ?? 'limpo';
    const hora = c === 'limpo' ? NOME_PERIODO[periodo()] : `${NOME_PERIODO[periodo()]} - ${NOME_CLIMA[c]}`;
    const w = r.larguraTexto(hora) + 10;
    r.retangulo(6, 6, w, 13, P.ink!);
    r.retangulo(7, 7, w - 2, 11, P.uiBg!);
    r.texto(hora, 11, 9, P.uiInk!);

    if (this.pagina !== 'sair') return;
    /* a pergunta de sair fica por cima do próprio menu: quem apertou SAIR
       sem querer vê na hora que dá para voltar atrás */
    const larg = 150, alt = 50;
    const px = (LARGURA - larg) / 2, py = (ALTURA - alt) / 2;
    r.retangulo(px - 2, py - 2, larg + 4, alt + 4, P.ink!);
    r.retangulo(px, py, larg, alt, P.uiBg!);
    r.texto('VOLTAR AO TÍTULO?', px + 10, py + 8, P.uiInk!);
    r.texto('O que não foi gravado se perde.', px + 10, py + 20, P.uiBg3!);
    ['SIM', 'NÃO'].forEach((op, i) => {
      const ox = px + 20 + i * 60;
      if (i === this.sel) r.texto('=', ox - 10, py + 34, P.uiAccD!);
      r.texto(op, ox, py + 34, P.uiInk!);
    });
  }

  private desenharPagina(r: Renderizador): void {
    const est = this.op.estado;
    switch (this.pagina) {
      case 'time':
        L.telaCheia(r, this.caixaCheia, 'SEU TIME',
                   this.peguei !== null ? 'A TROCAR AQUI   B CANCELAR' : 'A PEGAR   > CAIXA   B VOLTAR');
        L.listaTime(r, est.time, this.selLista, { peguei: this.peguei ?? undefined });
        this.rodapeTime(r, est.time[this.selLista]);
        break;
      case 'caixa':
        this.desenharCaixa(r);
        break;
      case 'mochila': {
        const ids = this.itens();
        L.telaCheia(r, this.caixaCheia, 'MOCHILA', `A USAR   B VOLTAR   ${est.dinheiro} RÉIS`);
        L.listaMochila(r, est.mochila, ids, this.selLista);
        L.descricaoItem(r, ids[this.selLista], ALTURA - 42);
        break;
      }
      case 'mochilaAlvo': {
        const nomeItem = item(this.itemUsando!).nome.toUpperCase();
        if (this.ehCantiga()) {
          const golpe = fichaGolpe(this.golpeDaCantiga()).nome.toUpperCase();
          L.telaCheia(r, this.caixaCheia, `ENSINAR ${golpe} A QUEM?`, 'A ENSINAR   B VOLTAR');
          const ROTULOS = { pode: ['PODE', P.uiAccD!], nao: ['NÃO PODE', P.uiBg3!], ja: ['JÁ SABE', P.uiBg3!] } as const;
          L.listaTime(r, est.time, this.selAlvo, {
            etiqueta: (i) => {
              const [texto, cor] = ROTULOS[compatibilidade(est.time[i]!, this.itemUsando!)];
              return { texto, cor };
            },
          });
          break;
        }
        L.telaCheia(r, this.caixaCheia, `USAR ${nomeItem} EM QUEM?`, 'A USAR   B VOLTAR');
        L.listaTime(r, est.time, this.selAlvo);
        break;
      }
      case 'cantigaEsquecer': {
        const golpe = fichaGolpe(this.golpeDaCantiga()).nome.toUpperCase();
        L.telaCheia(r, this.caixaCheia, `PARA APRENDER ${golpe}`, 'A ESQUECE ESTE   B VOLTAR');
        this.esquecer.desenhar(r, est.time[this.selAlvo]!);
        break;
      }
      case 'medalhas':
        L.telaCheia(r, this.caixaCheia, 'MEDALHAS',
                    `B VOLTAR    ${est.medalhas.length} DE ${MEDALHAS.length}`);
        this.desenharMedalhas(r);
        break;
      case 'guia': {
        const terreiro = terreiroEmAberto(est);
        const contas = TERREIROS[terreiro] ?? [];
        const cidade = MEDALHAS.find((m) => m.tipo === terreiro)?.cidade ?? '';
        L.telaCheia(r, this.caixaCheia, `A GUIA DE ${cidade}`,
                    `B VOLTAR    ${contasAcesasDe(est, terreiro)} DE ${contas.length}`);
        contas.forEach((c, i) => {
          const acesa = est.flags[c.flag] === true;
          const y = 32 + i * 16;
          r.retangulo(16, y + 1, 6, 6, acesa ? P.water! : P.uiBg3!);
          r.texto(acesa ? c.servico.toUpperCase() : '? ? ?', 28, y,
                  acesa ? P.uiInk! : P.uiBg3!);
        });
        break;
      }
      case 'caderno':
        this.desenharCaderno(r);
        break;
      case 'mapaMundo': {
        L.telaCheia(r, this.caixaCheia, 'MAPA DO MUNDO', 'A PLANTA   B VOLTAR   <> LUGAR');
        const lista = this.lugaresConhecidos();
        const piscando = Math.floor(this.relogio * 3) % 2 === 0;
        desenharMundo(r, new Set(lista), this.estradasMundo, this.lugarAtual(), this.selMundo, piscando);
        const id = this.selMundo;
        const reg = id ? regiaoDoMapa(id) : null;
        if (id && reg) {
          r.texto(MAPAS[id]!.nome, 14, ALTURA - 42, P.uiInk!);
          const tem = quantidade(est.mochila, itemMapaDaRegiao(reg)) > 0;
          r.texto(tem ? reg.nome : `${reg.nome}: MAPA ESCONDIDO`, 14, ALTURA - 31, P.uiBg3!);
        }
        break;
      }
      case 'canoa': {
        L.telaCheia(r, this.caixaCheia, 'CANOA ENCANTADA', 'A REMAR   B VOLTAR   <> CIDADE');
        const id = this.destinosCanoa[this.selCanoa] ?? null;
        const piscando = Math.floor(this.relogio * 3) % 2 === 0;
        desenharMundo(r, new Set(this.destinosCanoa), this.estradasMundo, this.lugarAtual(), id, piscando);
        if (id) r.texto(`PARA ${MAPAS[id]!.nome}`.toUpperCase(), 14, ALTURA - 42, P.uiInk!);
        if (this.confirmaCanoa && id) {
          const larg = 150, alt = 40;
          const px = (LARGURA - larg) / 2, py = (ALTURA - alt) / 2;
          r.retangulo(px - 2, py - 2, larg + 4, alt + 4, P.ink!);
          r.retangulo(px, py, larg, alt, P.uiBg!);
          r.texto('REMAR ATÉ LÁ?', px + 10, py + 8, P.uiInk!);
          ['SIM', 'NÃO'].forEach((op, i) => {
            const ox = px + 20 + i * 60;
            if (i === this.sel) r.texto('=', ox - 10, py + 24, P.uiAccD!);
            r.texto(op, ox, py + 24, P.uiInk!);
          });
        }
        break;
      }
      case 'mapaLocal': {
        const def = MAPAS[this.plantaDe ?? ''];
        if (!def) break;
        L.telaCheia(r, this.caixaCheia, def.nome, 'B VOLTAR   AMARELO: SAÍDAS');
        const aqui = def.id === est.posicao.mapa ? est.posicao : null;
        desenharPlanta(r, def, aqui, Math.floor(this.relogio * 3) % 2 === 0);
        break;
      }
      case 'velocidade': {
        L.telaCheia(r, this.caixaCheia, 'OPÇÕES',
                    ACOES.has(OPCOES[this.velSel]!) ? 'A FAZ   B VOLTAR' : 'A OU < > MUDA   B VOLTAR');
        const valores: Record<Opcao, string> = {
          VELOCIDADE: NOME_VELOCIDADE[obterVelocidade()],
          VISÃO: obterVisao3D() ? '3D NA FOZ' : 'PLANA',
          MÚSICA: NOME_VOLUME[obterVolume('musica')],
          EFEITOS: NOME_VOLUME[obterVolume('efeitos')],
          'BAIXAR SAVE': '',
          'COPIAR CÓDIGO': '',
        };
        OPCOES.forEach((op, i) => {
          const y = 34 + i * 18;
          const sel = i === this.velSel;
          if (sel) r.texto('=', 16, y, P.uiAccD!);
          r.texto(op, 28, y, sel ? P.uiAccD! : P.uiInk!);
          const v = valores[op];
          if (!ACOES.has(op)) r.texto(sel ? `< ${v} >` : v, sel ? 112 : 124, y, sel ? P.uiAccD! : P.uiBg3!);
        });
        break;
      }
      default:
        break;
    }
  }

  private desenharCaixa(r: Renderizador): void {
    const caixa = this.op.estado.caixa;
    L.telaCheia(r, this.caixaCheia, `NA CAIXA (${caixa.length})`, '< TIME   B VOLTAR');
    if (caixa.length === 0) {
      r.texto('NINGUÉM NA CAIXA AINDA.', 22, 30, P.uiBg3!);
    }
    for (let i = 0; i < CAIXA_LINHAS_VISIVEIS; i++) {
      const idx = this.topoCaixa + i;
      const bicho = caixa[idx];
      if (!bicho) break;
      L.linhaBicho(r, bicho, 28 + i * 10, idx === this.selCaixa);
    }
    if (this.topoCaixa > 0) r.texto('...', LARGURA - 34, 28, P.uiBg3!);
    if (this.topoCaixa + CAIXA_LINHAS_VISIVEIS < caixa.length) {
      r.texto('...', LARGURA - 34, 28 + (CAIXA_LINHAS_VISIVEIS - 1) * 10, P.uiBg3!);
    }
    r.texto('TROCAR, SÓ NO BAÚ DO BENZIMENTO.', 14, ALTURA - 30, P.uiBg3!);
  }

  private rodapeTime(r: Renderizador, e: Encantado | undefined): void {
    if (!e) return;
    const f = ficha(e);
    r.texto(`${nome(e)} — ${f.nome}`, 14, ALTURA - 32, P.uiBg3!);
    const t = tracoDaEspecie(e.especie).nome.toUpperCase();
    r.texto(t, LARGURA - 14 - r.larguraTexto(t), ALTURA - 32, P.uiAccD!);
  }

  /* lista à esquerda, com o nome trocado por "? ? ?" para quem ainda não
     apareceu; a direita mostra o sprite e o que o Contador anotou dele. */
  private desenharCaderno(r: Renderizador): void {
    const est = this.op.estado;
    L.telaCheia(r, this.caixaCheia, 'CADERNO DE BICHOS',
                `B VOLTAR  ${this.cadernoTraco ? '< SOBRE' : '> TRAÇO'}  ${est.vistos.length} DE ${ESPECIES_ORDEM.length}`);

    for (let i = 0; i < CADERNO_LINHAS_VISIVEIS; i++) {
      const idx = this.topoCaderno + i;
      const id = ESPECIES_ORDEM[idx];
      if (!id) break;
      const vista = est.vistos.includes(id);
      const y = 30 + i * 10;
      if (idx === this.selCaderno) r.texto('=', 12, y, P.uiAccD!);
      r.texto(vista ? especie(id).nome.toUpperCase() : '? ? ?', 22, y,
              vista ? P.uiInk! : P.uiBg3!);
    }
    if (this.topoCaderno > 0) r.texto('...', 96, 30, P.uiBg3!);
    if (this.topoCaderno + CADERNO_LINHAS_VISIVEIS < ESPECIES_ORDEM.length) {
      r.texto('...', 96, 30 + (CADERNO_LINHAS_VISIVEIS - 1) * 10, P.uiBg3!);
    }

    const idSel = ESPECIES_ORDEM[this.selCaderno];
    if (!idSel) return;
    if (!est.vistos.includes(idSel)) {
      r.texto('AINDA NÃO VISTO.', 120, 40, P.uiBg3!);
      return;
    }
    const esp = especie(idSel);
    r.sprite(this.spriteCaderno(esp.arte), 160, 26);
    if (!this.cadernoTraco) {
      r.texto(esp.categoria, 120, 64, P.uiAccD!);
      L.paragrafo(r, esp.sobre, 120, 76, 112, 5, P.uiBg3!);
      return;
    }
    // o traço só fica anotado depois de ter um no patuá
    if (!est.capturados.includes(idSel)) {
      r.texto('TRAÇO: ?', 120, 64, P.uiAccD!);
      L.paragrafo(r, 'Só se conhece o jeito de um bicho depois de ter um no patuá.', 120, 76, 112, 5, P.uiBg3!);
      return;
    }
    const t = tracoDaEspecie(idSel);
    r.texto(t.nome.toUpperCase(), 120, 64, P.uiAccD!);
    L.paragrafo(r, t.descricao, 120, 76, 112, 5, P.uiBg3!);
  }

  private spriteCaderno(arte: string): Assado {
    let a = this.spritesCaderno.get(arte);
    if (a) return a;
    const desenho = ARTE_CRIATURAS[arte];
    if (!desenho) throw new Error(`sem arte para ${arte}`);
    a = assarSuave(desenho());
    this.spritesCaderno.set(arte, a);
    return a;
  }

  private desenharMedalhas(r: Renderizador): void {
    MEDALHAS.forEach((m, i) => {
      const x = 20 + (i % 4) * 52;
      const y = 34 + Math.floor(i / 4) * 44;
      const tem = this.op.estado.medalhas.includes(m.id);
      if (tem) {
        let img = this.medalhinhas.get(m.id);
        if (!img) { img = assarSuave(medalha(m.id, 20)); this.medalhinhas.set(m.id, img); }
        r.sprite(img, x + 6, y);
        r.texto(m.nome.slice(0, 6), x, y + 24, P.uiInk!);
      } else {
        r.retangulo(x + 8, y + 2, 16, 16, P.uiBg2!);
        r.texto('?', x + 14, y + 6, P.uiBg3!);
        r.texto('- - -', x, y + 24, P.uiBg3!);
      }
    });
  }
}
