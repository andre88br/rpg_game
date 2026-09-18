/* =========================================================================
   Quem vai andar a trilha: a escolha entre Tainá e Bento, e o nome — só
   para um jogo NOVO, nunca para um CONTINUAR. Duas telas, uma cena só:
   primeiro o personagem, depois o nome, com B voltando da segunda pra
   primeira (mas nenhuma saída sem escolher, como na escolha do inicial).
   ========================================================================= */
import { assar, assarSuave, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import { pessoa, ESTILOS } from '../art/people.ts';
import { PROTAGONISTAS } from '../game/state.ts';

const MAX_NOME = 10;

/* teclado alfabético: quatro linhas de sete, a última fecha com apagar e OK.
   "<-" e não "⌫": a fonte do jogo é só o que cabe num cartucho de verdade,
   sem glifo de apagar — e o traço já lê como seta pra trás. */
const APAGAR = '<-';
const TECLAS: readonly string[] = [
  ...'ABCDEFG', ...'HIJKLMN', ...'OPQRSTU', ...'VWXYZ', APAGAR, 'OK',
];
const COLS = 7;

export class CenaPersonagem implements Cena {
  private tela: 'personagem' | 'nome' = 'personagem';
  private sel = 0;                 // 0 ou 1, qual protagonista
  private cursor = 0;              // índice na grade do teclado
  private nome = '';
  private retratos = new Map<string, Assado>();
  private moldura!: Assado;
  private aoEscolher: (id: string, nome: string) => void;

  constructor(aoEscolher: (id: string, nome: string) => void) { this.aoEscolher = aoEscolher; }

  entrar(): void {
    this.tela = 'personagem';
    this.sel = 0;
    this.cursor = 0;
    this.nome = '';
    this.moldura ??= assar(UI.caixa(LARGURA - 16, ALTURA - 16));
  }

  private retrato(id: string): Assado {
    let a = this.retratos.get(id);
    if (a) return a;
    a = assarSuave(pessoa(ESTILOS[id] ?? {}));
    this.retratos.set(id, a);
    return a;
  }

  atualizar(_dt: number, entrada: Entrada): void {
    if (this.tela === 'personagem') { this.naEscolha(entrada); return; }
    this.noNome(entrada);
  }

  private naEscolha(entrada: Entrada): void {
    if (entrada.apertou('esq')) this.sel = (this.sel - 1 + PROTAGONISTAS.length) % PROTAGONISTAS.length;
    if (entrada.apertou('dir')) this.sel = (this.sel + 1) % PROTAGONISTAS.length;
    if (!entrada.apertou('a')) return;
    this.tela = 'nome';
    this.cursor = 0;
  }

  private noNome(entrada: Entrada): void {
    if (entrada.apertou('b')) { this.tela = 'personagem'; return; }

    const linha = Math.floor(this.cursor / COLS);
    const totalLinhas = Math.ceil(TECLAS.length / COLS);
    if (entrada.apertou('esq')) this.cursor = (this.cursor - 1 + TECLAS.length) % TECLAS.length;
    if (entrada.apertou('dir')) this.cursor = (this.cursor + 1) % TECLAS.length;
    if (entrada.apertou('cima')) this.cursor = this.moverLinha(this.cursor, linha - 1, totalLinhas);
    if (entrada.apertou('baixo')) this.cursor = this.moverLinha(this.cursor, linha + 1, totalLinhas);

    if (!entrada.apertou('a')) return;
    const tecla = TECLAS[this.cursor];
    if (tecla === APAGAR) { this.nome = this.nome.slice(0, -1); return; }
    if (tecla === 'OK') {
      const padrao = PROTAGONISTAS[this.sel]!.nome;
      this.aoEscolher(PROTAGONISTAS[this.sel]!.id, this.nome.length > 0 ? this.nome : padrao);
      return;
    }
    if (tecla && this.nome.length < MAX_NOME) this.nome += tecla;
  }

  /* troca de linha mantendo a coluna, presa dentro do total de teclas
     (a última linha é mais curta que as outras) */
  private moverLinha(atual: number, novaLinha: number, totalLinhas: number): number {
    const col = atual % COLS;
    const linha = ((novaLinha % totalLinhas) + totalLinhas) % totalLinhas;
    const alvo = linha * COLS + col;
    return Math.min(alvo, TECLAS.length - 1);
  }

  desenhar(r: Renderizador): void {
    r.limpar('#101018');
    if (this.tela === 'personagem') this.desenharEscolha(r);
    else this.desenharNome(r);
  }

  private desenharEscolha(r: Renderizador): void {
    r.sprite(this.moldura, 8, 8);
    const titulo = 'QUEM VAI ANDAR A TRILHA?';
    r.texto(titulo, (LARGURA - r.larguraTexto(titulo)) / 2, 20, P.uiAccD!);
    r.retangulo(16, 32, LARGURA - 32, 1, P.uiBg3!);

    PROTAGONISTAS.forEach((p, i) => {
      const cx = LARGURA / 2 + (i === 0 ? -56 : 56);
      const escolhido = i === this.sel;
      const img = this.retrato(p.id);
      if (escolhido) r.retangulo(cx - 26, 46, 52, 60, P.uiBg2!);
      r.sprite(img, cx - img.width / 2, escolhido ? 50 : 56);
      r.texto(p.nome, cx - r.larguraTexto(p.nome) / 2, 110,
              escolhido ? P.uiInk! : P.uiBg3!);
    });

    r.texto('< >  ESCOLHER    A  CONFIRMAR', 16, ALTURA - 20, P.uiBg3!);
  }

  private desenharNome(r: Renderizador): void {
    const prot = PROTAGONISTAS[this.sel]!;
    r.sprite(this.moldura, 8, 8);
    const titulo = 'COMO VOCÊ SE CHAMA?';
    r.texto(titulo, (LARGURA - r.larguraTexto(titulo)) / 2, 18, P.uiAccD!);

    r.sprite(this.retrato(prot.id), 16, 28);

    const campo = this.nome.length > 0 ? this.nome : prot.nome;
    const corCampo = this.nome.length > 0 ? P.uiInk! : P.uiBg3!;
    r.retangulo(48, 30, 130, 14, P.uiBg2!);
    r.texto(campo, 54, 34, corCampo);
    if (Math.floor(Date.now() / 400) % 2 === 0) {
      const cursorX = 54 + r.larguraTexto(campo) + 2;
      r.retangulo(cursorX, 33, 5, 9, P.uiAccD!);
    }

    // teclado
    const ox = 24, oy = 56, celW = 26, celH = 15;
    TECLAS.forEach((tecla, i) => {
      const col = i % COLS, linha = Math.floor(i / COLS);
      const x = ox + col * celW, y = oy + linha * celH;
      const selecionado = i === this.cursor;
      if (selecionado) r.retangulo(x, y, celW - 4, celH - 3, P.uiAcc!);
      const cor = selecionado ? P.uiInk! : P.uiBg3!;
      r.texto(tecla, x + (celW - 4 - r.larguraTexto(tecla)) / 2, y + 3, cor);
    });

    r.texto('A ESCOLHER   B VOLTAR', 16, ALTURA - 12, P.uiBg3!);
  }
}
