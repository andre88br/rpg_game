/* =========================================================================
   O Rezador do benzimento: faz um Encantado lembrar um golpe que já soube
   (ou que já teria aprendido no nível dele, nesta forma ou numa de antes).
   Cobra por reza. Escolhe quem → escolhe o golpe → se já tiver quatro,
   escolhe qual esquece.

   Sobreposição, como a caixa e a loja: o mundo continua desenhado atrás.
   O que pode ser lembrado e o ensinar moram em game/golpes.ts.
   ========================================================================= */
import { assar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Entrada } from '../core/input.ts';
import { P, infoTipo } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import * as L from '../ui/listas.ts';
import { quebrar } from '../art/font.ts';
import { golpe as fichaGolpe } from '../data/moves.ts';
import { MAX_GOLPES, nome, type Encantado } from '../battle/encantado.ts';
import type { EstadoJogo } from '../game/state.ts';
import { PRECO_REZA, ensinar, relembraveis } from '../game/golpes.ts';
import { EscolhaEsquecer } from '../ui/esquecer.ts';
import * as Som from '../audio/som.ts';

export type SaidaRezador = 'aberto' | 'fechar';

const LINHAS_VISIVEIS = 6;
const ALTURA_LINHA = 16;

export class TelaRezador {
  private pagina: 'time' | 'golpes' | 'esquecer' = 'time';
  private selTime = 0;
  private alvo: Encantado | null = null;
  private lista: string[] = [];
  private selGolpe = 0;
  private topo = 0;
  private esquecer = new EscolhaEsquecer();
  private recado: string | null = null;
  private tempoRecado = 0;
  private readonly caixaCheia: Assado;

  constructor(private readonly estado: EstadoJogo) {
    this.caixaCheia = assar(UI.caixa(LARGURA - 8, ALTURA - 8));
  }

  abrir(): void {
    this.pagina = 'time';
    this.selTime = 0;
    this.alvo = null;
    this.recado = null;
  }

  private avisar(s: string, t = 2): void { this.recado = s; this.tempoRecado = t; }

  atualizar(dt: number, entrada: Entrada): SaidaRezador {
    if (this.tempoRecado > 0 && (this.tempoRecado -= dt) <= 0) this.recado = null;

    if (this.pagina === 'time') {
      const total = this.estado.time.length;
      if (total === 0 || entrada.apertou('b') || entrada.apertou('menu')) return 'fechar';
      if (entrada.apertou('cima')) this.selTime = (this.selTime - 1 + total) % total;
      if (entrada.apertou('baixo')) this.selTime = (this.selTime + 1) % total;
      if (entrada.apertou('a')) this.escolherTime();
      return 'aberto';
    }

    if (this.pagina === 'golpes') {
      const n = this.lista.length;
      if (entrada.apertou('cima')) this.selGolpe = (this.selGolpe - 1 + n) % n;
      if (entrada.apertou('baixo')) this.selGolpe = (this.selGolpe + 1) % n;
      if (this.selGolpe < this.topo) this.topo = this.selGolpe;
      if (this.selGolpe >= this.topo + LINHAS_VISIVEIS) this.topo = this.selGolpe - LINHAS_VISIVEIS + 1;
      if (entrada.apertou('b') || entrada.apertou('menu')) { this.pagina = 'time'; return 'aberto'; }
      if (entrada.apertou('a')) this.escolherGolpe();
      return 'aberto';
    }

    // ---- esquecer qual ----
    const r = this.esquecer.atualizar(entrada, this.alvo!);
    if (r.k === 'desistiu') this.pagina = 'golpes';
    else if (r.k === 'esquece') this.lembrar(r.indice);
    return 'aberto';
  }

  private escolherTime(): void {
    const alvo = this.estado.time[this.selTime];
    if (!alvo) return;
    const lista = relembraveis(alvo);
    if (lista.length === 0) {
      this.avisar(`${nome(alvo).toUpperCase()} NÃO TEM O QUE LEMBRAR.`);
      return;
    }
    this.alvo = alvo;
    this.lista = lista;
    this.selGolpe = 0;
    this.topo = 0;
    this.pagina = 'golpes';
  }

  private escolherGolpe(): void {
    if (this.estado.dinheiro < PRECO_REZA) {
      this.avisar(`FALTAM ${PRECO_REZA - this.estado.dinheiro} RÉIS PARA A REZA.`);
      return;
    }
    if (this.alvo!.golpes.length < MAX_GOLPES) { this.lembrar(); return; }
    this.esquecer.abrir();
    this.pagina = 'esquecer';
  }

  /* cobra e ensina; `substituir` é o golpe que sai, quando não há vaga */
  private lembrar(substituir?: number): void {
    const alvo = this.alvo!;
    const golpe = this.lista[this.selGolpe]!;
    const saiu = substituir === undefined ? null : fichaGolpe(alvo.golpes[substituir]!.id).nome;
    if (!ensinar(alvo, golpe, substituir)) return;
    this.estado.dinheiro -= PRECO_REZA;
    Som.vinheta('item');
    const novo = fichaGolpe(golpe).nome.toUpperCase();
    this.avisar(saiu
      ? `${nome(alvo).toUpperCase()} ESQUECEU ${saiu.toUpperCase()} E LEMBROU ${novo}!`
      : `${nome(alvo).toUpperCase()} LEMBROU ${novo}!`, 2.6);
    this.pagina = 'time';
  }

  /* ------------------------------------------------------------ desenho */

  desenhar(r: Renderizador): void {
    if (this.pagina === 'time') this.desenharTime(r);
    else if (this.pagina === 'golpes') this.desenharGolpes(r);
    else {
      const alvo = this.alvo!;
      L.telaCheia(r, this.caixaCheia,
                  `PARA LEMBRAR ${fichaGolpe(this.lista[this.selGolpe]!).nome}`.toUpperCase(),
                  'A ESQUECE ESTE   B VOLTAR');
      this.esquecer.desenhar(r, alvo);
    }

    if (this.recado) {
      const larg = r.larguraTexto(this.recado) + 20;
      r.retangulo((LARGURA - larg) / 2, ALTURA - 40, larg, 16, P.ink!);
      r.texto(this.recado, (LARGURA - r.larguraTexto(this.recado)) / 2, ALTURA - 36, P.gold!);
    }
  }

  private desenharTime(r: Renderizador): void {
    L.telaCheia(r, this.caixaCheia, 'O REZADOR: QUEM VAI LEMBRAR?',
                `A ESCOLHER   B SAIR   ${this.estado.dinheiro} RÉIS`);
    L.listaTime(r, this.estado.time, this.selTime);
    const e = this.estado.time[this.selTime];
    if (e) {
      const n = relembraveis(e).length;
      r.texto(n === 0 ? 'NADA PARA LEMBRAR' : `${n} GOLPE${n > 1 ? 'S' : ''} PARA LEMBRAR - ${PRECO_REZA} RÉIS`,
              14, ALTURA - 32, P.uiBg3!);
    }
  }

  private desenharGolpes(r: Renderizador): void {
    const alvo = this.alvo!;
    L.telaCheia(r, this.caixaCheia, `${nome(alvo)} PODE LEMBRAR`.toUpperCase(),
                `A LEMBRAR (${PRECO_REZA} RÉIS)   B VOLTAR`);
    for (let i = 0; i < LINHAS_VISIVEIS; i++) {
      const idx = this.topo + i;
      const id = this.lista[idx];
      if (!id) break;
      const g = fichaGolpe(id);
      const y = 30 + i * ALTURA_LINHA;
      if (idx === this.selGolpe) r.retangulo(10, y - 3, LARGURA - 20, ALTURA_LINHA - 2, P.uiBg2!);
      r.texto(g.nome.toUpperCase(), 16, y, P.uiInk!);
      L.etiquetaTipo(r, infoTipo(g.tipo), 112, y, 4);
      if (g.pot > 0) r.texto(`POT ${g.pot}`, 146, y, P.uiBg3!);
      const pp = `PP ${g.pp}`;
      r.texto(pp, LARGURA - 16 - r.larguraTexto(pp), y, P.uiBg3!);
    }
    if (this.topo > 0) r.texto('...', LARGURA - 34, 22, P.uiBg3!);
    if (this.topo + LINHAS_VISIVEIS < this.lista.length) {
      r.texto('...', LARGURA - 34, 30 + LINHAS_VISIVEIS * ALTURA_LINHA - 4, P.uiBg3!);
    }
    // a descrição do golpe escolhido, numa linha só
    const linhas = quebrar(fichaGolpe(this.lista[this.selGolpe]!).descricao, LARGURA - 40);
    r.texto(linhas.length > 1 ? `${linhas[0]}...` : linhas[0] ?? '', 14, ALTURA - 30, P.uiBg3!);
  }
}
