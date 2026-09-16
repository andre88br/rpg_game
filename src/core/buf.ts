/* =========================================================================
   Buffer de pixels: a base de toda a arte do jogo.
   Desenha-se aqui em tempo de carga; depois cada Buf e "assado" em um canvas
   (ver assar()) e o laco de jogo so faz drawImage, que e rapido.
   ========================================================================= */

export type Cor = string;

export class Buf {
  readonly w: number;
  readonly h: number;
  readonly d: (Cor | null)[];

  constructor(w: number, h: number) {
    this.w = w; this.h = h;
    this.d = new Array(w * h).fill(null);
  }

  set(x: number, y: number, c: Cor | null | undefined): void {
    if (c == null) return;            // null e ignorado de proposito: ver apagar()
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.d[y * this.w + x] = c;
  }

  get(x: number, y: number): Cor | null {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.d[y * this.w + x];
  }

  /* set() ignora null para que blit pule transparencia, entao apagar precisa
     de metodo proprio. */
  apagar(x: number, y: number): void {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.d[y * this.w + x] = null;
  }

  apagarElipse(cx: number, cy: number, rx: number, ry: number): void {
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++)
        if ((x * x) / (rx * rx + 1e-4) + (y * y) / (ry * ry + 1e-4) <= 1.05) this.apagar(cx + x, cy + y);
  }

  rect(x: number, y: number, w: number, h: number, c: Cor): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }

  frame(x: number, y: number, w: number, h: number, c: Cor): this {
    for (let i = 0; i < w; i++) { this.set(x + i, y, c); this.set(x + i, y + h - 1, c); }
    for (let j = 0; j < h; j++) { this.set(x, y + j, c); this.set(x + w - 1, y + j, c); }
    return this;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, c: Cor): this {
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++)
        if ((x * x) / (rx * rx + 1e-4) + (y * y) / (ry * ry + 1e-4) <= 1.05) this.set(cx + x, cy + y, c);
    return this;
  }

  circle(cx: number, cy: number, r: number, c: Cor): this { return this.ellipse(cx, cy, r, r, c); }

  line(x0: number, y0: number, x1: number, y1: number, c: Cor): this {
    // arredonda: com coordenadas fracionarias o Bresenham nunca alcanca o
    // destino e o laco nao termina
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return this;
  }

  /* triangulo cheio: chamas, telhados, bicos, setas */
  tri(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: Cor): this {
    const minx = Math.floor(Math.min(x0, x1, x2)), maxx = Math.ceil(Math.max(x0, x1, x2));
    const miny = Math.floor(Math.min(y0, y1, y2)), maxy = Math.ceil(Math.max(y0, y1, y2));
    const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
    if (area === 0) return this;
    for (let y = miny; y <= maxy; y++) {
      for (let x = minx; x <= maxx; x++) {
        const w0 = ((x1 - x0) * (y - y0) - (x - x0) * (y1 - y0)) / area;
        const w1 = ((x2 - x1) * (y - y1) - (x - x1) * (y2 - y1)) / area;
        const w2 = ((x0 - x2) * (y - y2) - (x - x2) * (y0 - y2)) / area;
        if (w0 >= -0.02 && w1 >= -0.02 && w2 >= -0.02) this.set(x, y, c);
      }
    }
    return this;
  }

  /* desenha a partir de linhas de texto + paleta ('.' e ' ' = transparente) */
  art(linhas: readonly string[], pal: Record<string, Cor>, ox = 0, oy = 0): this {
    for (let y = 0; y < linhas.length; y++) {
      const linha = linhas[y]!;
      for (let x = 0; x < linha.length; x++) {
        const ch = linha[x]!;
        if (ch === '.' || ch === ' ') continue;
        this.set(ox + x, oy + y, pal[ch]);
      }
    }
    return this;
  }

  blit(src: Buf, ox: number, oy: number, opt: { flipX?: boolean; tint?: Cor } = {}): this {
    const { flipX = false, tint } = opt;
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const c = src.get(flipX ? src.w - 1 - x : x, y);
        if (c == null) continue;
        this.set(ox + x, oy + y, tint ?? c);
      }
    }
    return this;
  }

  /* Contorno automatico: todo pixel vazio encostado em pixel cheio vira a cor
     de contorno. E o que da coesao visual a arte inteira. */
  outline(c: Cor): this {
    const add: [number, number][] = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y) != null) continue;
        if (this.get(x - 1, y) != null || this.get(x + 1, y) != null ||
            this.get(x, y - 1) != null || this.get(x, y + 1) != null) add.push([x, y]);
      }
    }
    for (const [x, y] of add) this.set(x, y, c);
    return this;
  }

  clonar(): Buf {
    const b = new Buf(this.w, this.h);
    for (let i = 0; i < this.d.length; i++) b.d[i] = this.d[i]!;
    return b;
  }
}

/* amplia por vizinho mais proximo, preservando a nitidez do pixel */
export function escalar(src: Buf, n: number): Buf {
  const b = new Buf(src.w * n, src.h * n);
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) {
      const c = src.get(x, y);
      if (c == null) continue;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) b.set(x * n + i, y * n + j, c);
    }
  return b;
}

export function recortar(src: Buf, x: number, y: number, w: number, h: number): Buf {
  const b = new Buf(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) b.set(i, j, src.get(x + i, y + j));
  return b;
}

/* --------------------------------------------------------------------------
   Conversao de cor e "assamento" para canvas.
   -------------------------------------------------------------------------- */

const cacheCor = new Map<string, [number, number, number, number]>();

export function corParaRGBA(hex: string): [number, number, number, number] {
  let v = cacheCor.get(hex);
  if (v) return v;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255;
  v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), a];
  cacheCor.set(hex, v);
  return v;
}

export type Assado = HTMLCanvasElement;

/* Converte um Buf em canvas uma unica vez, na carga. O laco de jogo usa
   drawImage sobre o resultado, nunca redesenha pixel a pixel. */
export function assar(buf: Buf): Assado {
  const cv = document.createElement('canvas');
  cv.width = buf.w; cv.height = buf.h;
  const ctx = cv.getContext('2d')!;
  const img = ctx.createImageData(buf.w, buf.h);
  const dados = img.data;
  for (let i = 0; i < buf.d.length; i++) {
    const c = buf.d[i];
    if (c == null) continue;
    const [r, g, b, a] = corParaRGBA(c);
    const j = i * 4;
    dados[j] = r; dados[j + 1] = g; dados[j + 2] = b; dados[j + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

/* RNG com semente: o mesmo tile sai identico em toda execucao */
export function rng(semente: number): () => number {
  let s = semente >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
