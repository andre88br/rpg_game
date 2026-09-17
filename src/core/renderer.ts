/* =========================================================================
   Renderizador: um unico canvas com resolucao logica fixa de 240x160.
   A ampliacao ate o tamanho da tela e feita pelo CSS, sempre por um fator
   INTEIRO, entao o pixel nunca borra nem fica retangular.

   O canvas tem SUAVE vezes mais pixels do que a resolucao logica, e uma
   transformacao de escala converte um pelo outro: TODO o desenho continua
   sendo feito em coordenadas de 240x160, como sempre foi. Os pixels a mais
   existem para caber o degrau que assarSuave() poe nas diagonais do mundo.
   Texto e menus, assados em 1x, caem em pixels inteiros do canvas e
   continuam nitidos.
   ========================================================================= */
import { Buf, assar, escalaDe, SUAVE, type Assado } from './buf.ts';
import { texto as textoNoBuf, larguraTexto, CHAR_W } from '../art/font.ts';

export const LARGURA = 240;
export const ALTURA = 160;

/* --------------------------------------------------------------------------
   Fonte em tempo de execucao.
   Desenhar texto pixel a pixel a cada quadro seria lento, entao cada cor
   usada ganha um atlas de glifos assado uma unica vez e reaproveitado.
   -------------------------------------------------------------------------- */
const CEL_W = 8, CEL_H = 12, GLIFO_OX = 1, GLIFO_OY = 3;

const CARACTERES =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?':/-()+<>%_~*v=" +
  'ÁÀÂÃÉÊÍÓÔÕÚÜÇ';

class Fonte {
  private atlasPorCor = new Map<string, Assado>();
  private indice = new Map<string, number>();

  constructor() {
    [...CARACTERES].forEach((c, i) => this.indice.set(c, i));
  }

  private atlas(cor: string): Assado {
    let a = this.atlasPorCor.get(cor);
    if (a) return a;
    const n = this.indice.size;
    const buf = new Buf(n * CEL_W, CEL_H);
    for (const [c, i] of this.indice) {
      textoNoBuf(buf, c, i * CEL_W + GLIFO_OX, GLIFO_OY, cor);
    }
    a = assar(buf);
    this.atlasPorCor.set(cor, a);
    return a;
  }

  largura(s: string): number { return larguraTexto(s); }

  desenhar(ctx: CanvasRenderingContext2D, s: string, x: number, y: number,
           cor: string, opt: { sombra?: string } = {}): void {
    if (opt.sombra) this.desenhar(ctx, s, x + 1, y + 1, opt.sombra);
    const atlas = this.atlas(cor);
    let cx = x;
    for (const ch of s.toUpperCase()) {
      const i = this.indice.get(ch);
      if (i !== undefined) {
        ctx.drawImage(atlas, i * CEL_W, 0, CEL_W, CEL_H,
                      cx - GLIFO_OX, y - GLIFO_OY, CEL_W, CEL_H);
      }
      cx += CHAR_W;
    }
  }
}

export const fonte = new Fonte();

/* -------------------------------------------------------------------------- */

export class Renderizador {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  escala = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = LARGURA * SUAVE;
    canvas.height = ALTURA * SUAVE;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('canvas 2d indisponivel');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    /* daqui em diante quem desenha fala em 240x160 e nao precisa saber de nada */
    this.ctx.setTransform(SUAVE, 0, 0, SUAVE, 0, 0);
  }

  /* Recalcula a ampliacao para caber no espaco disponivel.
     O fator inteiro e calculado em PIXELS DO DISPOSITIVO, nao em pixels CSS:
     assim cada pixel do jogo ocupa sempre a mesma quantidade de pixels
     fisicos (nunca sai retangular), e ainda assim a imagem cresce o
     suficiente num celular, onde a densidade costuma ser 2x ou 3x. */
  ajustar(dispW: number, dispH: number): boolean {
    const dpr = Math.max(1, Math.min(4, window.devicePixelRatio || 1));

    // escala que preencheria todo o espaco, e a maior escala inteira em
    // pixels FISICOS que cabe nele
    const cheia = Math.min(dispW / LARGURA, dispH / ALTURA);
    const inteira = Math.max(1, Math.floor(cheia * dpr)) / dpr;

    // Em telas de densidade alta, a escala inteira as vezes desperdica quase
    // 20% da largura do celular. Nesses casos vale preencher: com 2 ou 3
    // pixels fisicos por pixel do jogo, a diferenca de um pixel fisico entre
    // uma coluna e outra nao e perceptivel. Em densidade 1 mantemos o fator
    // inteiro, onde essa diferenca apareceria.
    const nova = (dpr >= 2 && inteira < cheia * 0.9) ? cheia : inteira;

    if (Math.abs(nova - this.escala) < 1e-6) return false;
    this.escala = nova;
    this.canvas.style.width = `${LARGURA * nova}px`;
    this.canvas.style.height = `${ALTURA * nova}px`;
    this.ctx.imageSmoothingEnabled = false;
    return true;
  }

  limpar(cor = '#000000'): void {
    this.ctx.fillStyle = cor;
    this.ctx.fillRect(0, 0, LARGURA, ALTURA);
  }

  /* A imagem pode ter sido assada suave, com mais pixels do que ocupa na
     tela: o tamanho de destino sai da escala dela, nunca do width cru. */
  sprite(img: Assado, x: number, y: number): void {
    const s = escalaDe(img);
    this.ctx.drawImage(img, Math.round(x), Math.round(y), img.width / s, img.height / s);
  }

  /* recorte de uma imagem maior (usado para a janela da camera no mapa) */
  recorte(img: Assado, sx: number, sy: number, sw: number, sh: number,
          dx: number, dy: number): void {
    const s = escalaDe(img);
    this.ctx.drawImage(img, sx * s, sy * s, sw * s, sh * s,
                       Math.round(dx), Math.round(dy), sw, sh);
  }

  retangulo(x: number, y: number, w: number, h: number, cor: string): void {
    this.ctx.fillStyle = cor;
    this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  texto(s: string, x: number, y: number, cor: string, opt: { sombra?: string } = {}): void {
    fonte.desenhar(this.ctx, s, Math.round(x), Math.round(y), cor, opt);
  }

  larguraTexto(s: string): number { return fonte.largura(s); }

  /* escurece a tela inteira; usado nas transicoes */
  cortina(alfa: number, cor = '#000000'): void {
    if (alfa <= 0) return;
    this.ctx.globalAlpha = Math.min(1, alfa);
    this.ctx.fillStyle = cor;
    this.ctx.fillRect(0, 0, LARGURA, ALTURA);
    this.ctx.globalAlpha = 1;
  }
}
