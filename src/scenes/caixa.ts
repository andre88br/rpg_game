/* =========================================================================
   A caixa da benzedeira: onde vai quem não coube no time.

   Sobreposição, como a loja e o menu de pausa: o baú de verdade, desenhado
   no mundo (em benzimentoPortoIara), é quem abre esta tela — não é uma
   página do menu de pausa nem da loja. Time e caixa aparecem como uma
   lista só, com um cursor que anda pelas duas partes: A sobre alguém do
   time manda pra caixa, A sobre alguém da caixa chama pro time.
   ========================================================================= */
import { assar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import * as L from '../ui/listas.ts';
import { nome, type Encantado } from '../battle/encantado.ts';
import { TAMANHO_TIME, type EstadoJogo } from '../game/state.ts';

export type SaidaCaixa = 'aberto' | 'fechar';

/* título de seção não se escolhe; time/caixa apontam pro índice na lista
   de origem, pra saber exatamente quem mover quando A for apertado */
type Linha =
  | { tipo: 'titulo'; texto: string }
  | { tipo: 'time' | 'caixa'; indice: number };

const LINHA_ALT = 10;
const LINHAS_VISIVEIS = 11;

export class TelaCaixa {
  private estado: EstadoJogo;
  private sel = 0;
  private topo = 0;
  private recado: string | null = null;
  private tempoRecado = 0;

  private caixaCheia: Assado;

  constructor(estado: EstadoJogo) {
    this.estado = estado;
    this.caixaCheia = assar(UI.caixa(LARGURA - 8, ALTURA - 8));
  }

  abrir(): void {
    this.sel = 0;
    this.topo = 0;
    this.recado = null;
  }

  private avisar(s: string): void { this.recado = s; this.tempoRecado = 1.6; }

  private linhas(): Linha[] {
    const est = this.estado;
    const linhas: Linha[] = [
      { tipo: 'titulo', texto: `SEU TIME (${est.time.length}/${TAMANHO_TIME})` },
    ];
    est.time.forEach((_, i) => linhas.push({ tipo: 'time', indice: i }));
    linhas.push({ tipo: 'titulo', texto: `NA CAIXA (${est.caixa.length})` });
    est.caixa.forEach((_, i) => linhas.push({ tipo: 'caixa', indice: i }));
    return linhas;
  }

  /* mantém a janela rolando de modo que a linha escolhida nunca saia da tela */
  private ajustarJanela(totalLinhas: number): void {
    if (this.sel < this.topo) this.topo = this.sel;
    if (this.sel >= this.topo + LINHAS_VISIVEIS) this.topo = this.sel - LINHAS_VISIVEIS + 1;
    this.topo = Math.max(0, Math.min(this.topo, Math.max(0, totalLinhas - LINHAS_VISIVEIS)));
  }

  /* A sobre um Encantado do time manda ele pra caixa; A sobre um da caixa
     chama ele pro time. Título de seção não responde a nada. */
  private mexer(linhas: readonly Linha[]): void {
    const l = linhas[this.sel];
    if (!l || l.tipo === 'titulo') return;
    const est = this.estado;

    if (l.tipo === 'time') {
      if (est.time.length <= 1) { this.avisar('PRECISA FICAR COM UM, AO MENOS.'); return; }
      const [bicho] = est.time.splice(l.indice, 1) as [Encantado];
      est.caixa.push(bicho);
      this.avisar(`${nome(bicho).toUpperCase()} FOI PRA CAIXA.`);
    } else {
      if (est.time.length >= TAMANHO_TIME) { this.avisar('O TIME JÁ ESTÁ CHEIO.'); return; }
      const [bicho] = est.caixa.splice(l.indice, 1) as [Encantado];
      est.time.push(bicho);
      this.avisar(`${nome(bicho).toUpperCase()} ENTROU NO TIME.`);
    }
    // a lista muda de tamanho: o cursor não pode sobrar fora dela
    this.sel = Math.min(this.sel, Math.max(0, this.linhas().length - 1));
  }

  /* ------------------------------------------------------------ entrada */

  atualizar(dt: number, entrada: Entrada): SaidaCaixa {
    if (this.tempoRecado > 0) {
      this.tempoRecado -= dt;
      if (this.tempoRecado <= 0) this.recado = null;
    }

    const linhas = this.linhas();
    const escolhiveis = linhas
      .map((l, i) => (l.tipo === 'titulo' ? -1 : i))
      .filter((i) => i >= 0);

    if (escolhiveis.length > 0) {
      let pos = escolhiveis.indexOf(this.sel);
      if (pos < 0) pos = 0;
      if (entrada.apertou('cima')) pos = (pos - 1 + escolhiveis.length) % escolhiveis.length;
      if (entrada.apertou('baixo')) pos = (pos + 1) % escolhiveis.length;
      this.sel = escolhiveis[pos]!;
    }
    this.ajustarJanela(linhas.length);

    if (entrada.apertou('b') || entrada.apertou('menu')) return 'fechar';
    if (entrada.apertou('a')) this.mexer(linhas);
    return 'aberto';
  }

  /* ------------------------------------------------------------ desenho */

  desenhar(r: Renderizador): void {
    L.telaCheia(r, this.caixaCheia, 'CAIXA DA BENZEDEIRA', 'A CHAMAR/GUARDAR   B SAIR');
    const linhas = this.linhas();
    const est = this.estado;

    for (let i = 0; i < LINHAS_VISIVEIS; i++) {
      const idx = this.topo + i;
      const l = linhas[idx];
      if (!l) break;
      const y = 28 + i * LINHA_ALT;

      if (l.tipo === 'titulo') { r.texto(l.texto, 14, y, P.uiAccD!); continue; }
      const bicho = l.tipo === 'time' ? est.time[l.indice]! : est.caixa[l.indice]!;
      if (idx === this.sel) r.texto('=', 12, y, P.uiAccD!);
      r.texto(nome(bicho), 22, y, P.uiInk!);
      const nv = 'NV' + bicho.nivel;
      r.texto(nv, LARGURA - 20 - r.larguraTexto(nv), y, P.uiBg3!);
    }

    if (this.topo > 0) r.texto('...', LARGURA - 34, 28, P.uiBg3!);
    if (this.topo + LINHAS_VISIVEIS < linhas.length) {
      r.texto('...', LARGURA - 34, 28 + (LINHAS_VISIVEIS - 1) * LINHA_ALT, P.uiBg3!);
    }

    if (this.recado) {
      const larg = r.larguraTexto(this.recado) + 20;
      r.retangulo((LARGURA - larg) / 2, ALTURA - 40, larg, 16, P.ink!);
      r.texto(this.recado, (LARGURA - r.larguraTexto(this.recado)) / 2, ALTURA - 36, P.gold!);
    }
  }
}
