/* Tiles 16x16 do cenario. Gerados por codigo com RNG semeado, entao o mesmo
   tile sai identico toda vez e nao dependemos de nenhum asset externo. */
import { Buf, rng } from './engine.js';
import { P } from './palette.js';
import { text, textWidth } from './font.js';

export const TS = 16; // tamanho do tile

function base(color) { const b = new Buf(TS, TS); b.rect(0, 0, TS, TS, color); return b; }

export function tileGrass(seed = 1) {
  const b = base(P.grass); const r = rng(seed);
  for (let i = 0; i < 26; i++) b.set(r() * TS, r() * TS, r() < 0.55 ? P.grassD : P.grassL);
  for (let i = 0; i < 5; i++) { // tufinhos de 2px
    const x = (r() * (TS - 2)) | 0, y = (r() * (TS - 2)) | 0;
    b.set(x, y, P.grassD); b.set(x + 1, y - 1, P.grassD);
  }
  return b;
}

export function tileTallGrass(seed = 2) {
  // base propria, bem mais escura que a grama comum: e o contraste que faz o
  // jogador reconhecer de longe onde aparecem os Encantados selvagens
  const b = base(P.tallD); const r = rng(seed * 7 + 1);
  for (let i = 0; i < 20; i++) b.set(r() * TS, r() * TS, P.tall);

  // leques de folhas cobrindo o tile inteiro, em duas alturas
  for (let fila = 0; fila < 2; fila++) {
    const yBase = fila === 0 ? 9 : TS - 1;
    for (let x = 1; x < TS; x += 4) {
      const jitter = ((r() * 2) | 0) - 1;
      const cx = x + jitter;
      const alt = 6 + ((r() * 3) | 0);
      const c = fila === 0 ? P.tall : P.tallL;
      b.line(cx, yBase, cx, yBase - alt, c);
      b.line(cx - 2, yBase, cx - 1, yBase - alt + 2, c);
      b.line(cx + 2, yBase, cx + 1, yBase - alt + 2, c);
      b.set(cx, yBase - alt - 1, P.grassL);
    }
  }
  return b;
}

export function tileWater(seed = 3, frame = 0) {
  const b = base(P.water); const r = rng(seed);
  for (let i = 0; i < 10; i++) b.set(r() * TS, r() * TS, P.waterD);
  // ondinhas horizontais deslocadas pelo frame (animacao de 2 quadros)
  for (const y of [3, 8, 13]) {
    const off = ((y * 3 + frame * 4) % TS);
    for (let k = 0; k < 5; k++) b.set((off + k) % TS, y, P.waterL);
    for (let k = 0; k < 3; k++) b.set((off + 9 + k) % TS, y + 1, P.waterL);
  }
  return b;
}

export function tileShore(seed = 4) { // areia encontrando a agua (borda superior)
  const b = base(P.sand); const r = rng(seed);
  for (let i = 0; i < 20; i++) b.set(r() * TS, r() * TS, P.sandD);
  return b;
}

export function tilePath(seed = 5) {
  const b = base(P.path); const r = rng(seed);
  for (let i = 0; i < 18; i++) b.set(r() * TS, r() * TS, r() < 0.6 ? P.pathD : P.pathL);
  return b;
}

export function tileTree(seed = 6) {
  const b = tileGrass(seed + 40);
  b.rect(6, 10, 4, 6, P.trunkD); b.rect(7, 10, 2, 6, P.trunk);
  b.ellipse(8, 7, 7, 6, P.tree);
  b.ellipse(6, 5, 4, 3, P.treeL);
  b.ellipse(11, 9, 3, 2, P.treeD);
  b.ellipse(4, 9, 3, 2, P.treeD);
  return b;
}

export function tileFlower(seed = 7, color = '#f2d24b') {
  const b = tileGrass(seed + 12);
  for (const [fx, fy] of [[4, 6], [11, 10]]) {
    b.set(fx, fy - 1, color); b.set(fx - 1, fy, color); b.set(fx + 1, fy, color);
    b.set(fx, fy + 1, color); b.set(fx, fy, '#ffffff');
  }
  return b;
}

export function tileRock(seed = 8) {
  const b = tileGrass(seed + 21);
  b.ellipse(8, 10, 6, 4, P.rock);
  b.ellipse(6, 8, 3, 2, '#b5aca3');
  b.ellipse(11, 12, 2, 1, P.rockD);
  return b;
}

export function tileCliff(seed = 9) { // parede de pedra / desnivel
  const b = base(P.rockD); const r = rng(seed);
  b.rect(0, 0, TS, 3, P.rock);
  for (let i = 0; i < 22; i++) b.set(r() * TS, 3 + r() * (TS - 3), r() < 0.5 ? '#5b524c' : '#83786f');
  return b;
}

export function tileFloorWood(seed = 10) { // piso interno de ginasio
  const b = base('#c99a5e');
  for (let y = 0; y < TS; y += 4) for (let x = 0; x < TS; x++) b.set(x, y, '#a87c45');
  for (let y = 0; y < TS; y += 4) b.set((y * 5) % TS, y + 2, '#a87c45');
  return b;
}

/* ---- construcoes: desenhadas como blocos, nao como tiles soltos ---- */

/* casa simples w x h em TILES; telhado colorido e porta centralizada */
export function building(wTiles, hTiles, opt = {}) {
  const { roof = P.roof, roofD = P.roofD, roofL = P.roofL, sign = null, signColor = P.gold } = opt;
  const w = wTiles * TS, h = hTiles * TS;
  const b = new Buf(w, h);
  const roofH = Math.floor(h * 0.42);

  // corpo
  b.rect(2, roofH - 2, w - 4, h - roofH + 2, P.wall);
  b.rect(2, roofH - 2, 3, h - roofH + 2, P.wallD);
  b.rect(w - 5, roofH - 2, 3, h - roofH + 2, P.wallD);

  // telhado em duas aguas
  for (let y = 0; y < roofH; y++) {
    const inset = Math.floor((roofH - y) * 0.55);
    b.rect(inset, y, w - inset * 2, 1, y < 3 ? roofL : roof);
    b.set(inset, y, roofD); b.set(w - inset - 1, y, roofD);
  }
  b.rect(0, roofH - 3, w, 3, roofD);
  b.rect(0, roofH - 3, w, 1, roofL);

  // porta
  const dw = 12, dx = ((w - dw) / 2) | 0, dy = h - 18;
  b.rect(dx, dy, dw, 18, P.doorD);
  b.rect(dx + 1, dy + 1, dw - 2, 17, P.door);
  b.rect(dx + 1, dy + 1, dw - 2, 3, '#9a6236');
  b.set(dx + dw - 4, dy + 10, P.gold);

  // janelas
  const wy = roofH + 4;
  for (const wx of [6, w - 16]) {
    b.rect(wx, wy, 10, 9, P.winD);
    b.rect(wx + 1, wy + 1, 8, 7, P.win);
    b.rect(wx + 1, wy + 1, 8, 3, '#b8e6fb');
    b.rect(wx + 4, wy, 2, 9, P.wallD);
    b.rect(wx, wy + 3, 10, 2, P.wallD);
  }

  // placa sobre a fachada
  if (sign) {
    const sw = textWidth(sign) + 8;
    const sx = ((w - sw) / 2) | 0, sy = roofH;
    b.rect(sx, sy, sw, 13, P.ink);
    b.rect(sx + 1, sy + 1, sw - 2, 11, signColor);
    b.rect(sx + 1, sy + 1, sw - 2, 3, '#ffffff');
    text(b, sign, sx + 4, sy + 3, P.ink);
  }
  return b;
}

/* moita de mato alto isolada, usada fora dos tiles de grade */
export function bush() {
  const b = new Buf(16, 14);
  b.ellipse(8, 9, 7, 5, P.tall);
  b.ellipse(6, 7, 4, 3, P.tallL);
  b.ellipse(11, 10, 3, 2, P.tallD);
  return b;
}

/* placa de madeira com seta */
export function signpost() {
  const b = new Buf(14, 18);
  b.rect(6, 8, 3, 10, P.trunkD);
  b.rect(1, 3, 12, 8, P.trunk);
  b.rect(1, 3, 12, 2, '#8a5c32');
  b.frame(1, 3, 12, 8, P.trunkD);
  return b;
}
