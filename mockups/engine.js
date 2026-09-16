/* =========================================================================
   Encantados — motor de pixel art usado para gerar os esboços.
   Este mesmo pipeline vira src/art/ no jogo: desenha-se em um buffer de
   pixels, aplica-se contorno automatico e depois faz-se o blit no canvas.
   ========================================================================= */

export class Buf {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.d = new Array(w * h).fill(null);
  }
  set(x, y, c) {
    if (c == null) return;
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.d[y * this.w + x] = c;
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.d[y * this.w + x];
  }
  /* set() ignora null de proposito (para blit pular transparencia), entao
     apagar exige metodo proprio. */
  apagar(x, y) {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.d[y * this.w + x] = null;
  }
  apagarElipse(cx, cy, rx, ry) {
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++)
        if ((x * x) / (rx * rx + 0.0001) + (y * y) / (ry * ry + 0.0001) <= 1.05) this.apagar(cx + x, cy + y);
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  frame(x, y, w, h, c) {
    for (let i = 0; i < w; i++) { this.set(x + i, y, c); this.set(x + i, y + h - 1, c); }
    for (let j = 0; j < h; j++) { this.set(x, y + j, c); this.set(x + w - 1, y + j, c); }
  }
  ellipse(cx, cy, rx, ry, c) {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx + 0.0001) + (y * y) / (ry * ry + 0.0001) <= 1.05) this.set(cx + x, cy + y, c);
      }
    }
  }
  circle(cx, cy, r, c) { this.ellipse(cx, cy, r, r, c); }
  line(x0, y0, x1, y1, c) {
    // arredonda: com coordenadas fracionarias o Bresenham nunca alcanca o
    // destino e o laco nao termina
    x0 = Math.round(x0); y0 = Math.round(y0);
    x1 = Math.round(x1); y1 = Math.round(y1);
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
  }
  /* triangulo cheio, usado para chamas, telhados e bicos */
  tri(x0, y0, x1, y1, x2, y2, c) {
    const minx = Math.min(x0, x1, x2), maxx = Math.max(x0, x1, x2);
    const miny = Math.min(y0, y1, y2), maxy = Math.max(y0, y1, y2);
    const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
    if (area === 0) return;
    for (let y = miny; y <= maxy; y++) {
      for (let x = minx; x <= maxx; x++) {
        const w0 = ((x1 - x0) * (y - y0) - (x - x0) * (y1 - y0)) / area;
        const w1 = ((x2 - x1) * (y - y1) - (x - x1) * (y2 - y1)) / area;
        const w2 = ((x0 - x2) * (y - y2) - (x - x2) * (y0 - y2)) / area;
        if (w0 >= -0.02 && w1 >= -0.02 && w2 >= -0.02) this.set(x, y, c);
      }
    }
  }
  /* desenha a partir de linhas de texto + mapa de paleta ('.' = transparente) */
  art(rows, pal, ox = 0, oy = 0) {
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        this.set(ox + x, oy + y, pal[ch] || null);
      }
    }
  }
  blit(src, ox, oy, opt = {}) {
    const { flipX = false, tint = null, alphaSkip = null } = opt;
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const sx = flipX ? src.w - 1 - x : x;
        const c = src.get(sx, y);
        if (c == null || c === alphaSkip) continue;
        this.set(ox + x, oy + y, tint || c);
      }
    }
  }
  /* contorno automatico: qualquer pixel vazio encostado em pixel cheio vira
     a cor de contorno. E o truque que da coesao visual a arte toda. */
  outline(c) {
    const add = [];
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
  /* sombra elipsoide sob o sprite */
  shadow(cx, cy, rx, ry, c) { this.ellipse(cx, cy, rx, ry, c); return this; }

  grow(pad) {
    const b = new Buf(this.w + pad * 2, this.h + pad * 2);
    b.blit(this, pad, pad);
    return b;
  }

  toCanvas(scale = 1, bg = null) {
    const cv = document.createElement('canvas');
    cv.width = this.w * scale; cv.height = this.h * scale;
    const ctx = cv.getContext('2d');
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height); }
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.d[y * this.w + x];
        if (c == null) continue;
        ctx.fillStyle = c;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    return cv;
  }
}

/* RNG com semente: garante que o mesmo tile saia identico toda vez */
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

/* amplia um Buf por vizinho mais proximo, preservando a nitidez do pixel */
export function escalar(src, n) {
  const b = new Buf(src.w * n, src.h * n);
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) {
      const c = src.get(x, y);
      if (c == null) continue;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) b.set(x * n + i, y * n + j, c);
    }
  return b;
}

/* recorta uma regiao */
export function recortar(src, x, y, w, h) {
  const b = new Buf(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) b.set(i, j, src.get(x + i, y + j));
  return b;
}
