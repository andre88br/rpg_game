/* =========================================================================
   REGIÃO 4 — o Campo do Saci: os fundos das cutscenes e a pena de vento.
   Capim dourado até o horizonte, cataventos, redemoinhos de poeira — e a
   cerca de arame da Companhia cortando o campo.
   ========================================================================= */
import { Buf, rng } from '../../core/buf.ts';
import { P } from '../palette.ts';
import { degrade, estrelas, morros, lembranca, placaMataSeca } from '../cenas.ts';

const W = 240, H = 160;

function nuvens(b: Buf, lista: readonly (readonly [number, number])[], cor = '#ffffff'): void {
  for (const [x, y] of lista) { b.ellipse(x, y, 18, 4, cor); b.ellipse(x + 10, y - 3, 10, 4, cor); }
}

/* o capim do campo, penteado pelo vento, de `y0` até embaixo */
export function capimCampo(b: Buf, y0: number, semente: number, base = '#c8b860'): void {
  b.rect(0, y0, b.w, H - y0, base);
  const r = rng(semente);
  for (let y = y0 + 2; y < H; y += 3) {
    for (let x = ((r() * 11) | 0); x < b.w; x += 9 + ((r() * 5) | 0)) {
      b.line(x, y, x + 4, y - 2 - ((y - y0) >> 5), y % 2 ? '#e0d080' : '#a89840');
    }
  }
}

/* o vento desenhado no ar: um traço que termina em caracol */
export function risco(b: Buf, x: number, y: number, larg = 30, cor = '#e8f8f4'): void {
  b.line(x, y, x + larg, y - 2, cor);
  b.line(x + larg, y - 2, x + larg + 4, y - 6, cor);
  b.set(x + larg + 3, y - 7, cor); b.set(x + larg + 1, y - 7, cor);
}

/* um redemoinho de poeira: um funil de traços que alarga para cima */
export function redemoinho(b: Buf, cx: number, base: number, alt: number, cor = '#c8b088', corL = '#e8d8b0'): void {
  for (let k = 0; k < alt; k += 3) {
    const meia = 3 + k * 0.4;
    const desvio = Math.round(Math.sin(k * 0.25) * 3);
    b.line(Math.round(cx - meia) + desvio, base - k, Math.round(cx + meia) + desvio, base - k - 1, k % 2 ? cor : corL);
  }
}

/* um catavento de pás brancas no alto de um mastro */
export function catavento(b: Buf, x: number, y: number, s = 1, cor = '#f4f0e0'): void {
  b.rect(x, y, 2, Math.round(24 * s), '#6a5a4a');
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + 0.4;
    const ex = Math.round(x + 1 + Math.cos(a) * 9 * s), ey = Math.round(y + Math.sin(a) * 9 * s);
    b.line(x + 1, y, ex, ey, cor); b.line(x + 1, y + 1, ex, ey + 1, cor);
  }
  b.set(x + 1, y, '#c42a1f');
}

/* ------------------------------------------------------ o Campo Aberto */

/* o campo aberto de dia: céu grande, capim até o horizonte, cataventos e o
   vento riscado no ar */
export function campoAberto(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 72, [[0x5a, 0xa8, 0xe8], [0xa8, 0xd8, 0xf4], [0xe8, 0xf4, 0xe8]]);
  nuvens(b, [[40, 18], [150, 12], [210, 28]]);
  morros(b, 70, 3, 0.04, 0.6, '#9ac080', 80);
  capimCampo(b, 74, 501);
  for (const [x, y, s] of [[34, 50, 1], [196, 46, 1.2], [120, 58, 0.7]] as const) catavento(b, x, y, s);
  for (const [x, y] of [[20, 36], [100, 30], [170, 40]] as const) risco(b, x, y);
  return b;
}

/* o mesmo campo, cortado pela cerca de arame da Companhia: moirão, fio
   farpado, a terra revirada em leira de soja e a placa da Mata-Seca */
export function campoCercado(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 72, [[0x8a, 0x9a, 0xb0], [0xc8, 0xc8, 0xc0], [0xe0, 0xd8, 0xc8]]);
  nuvens(b, [[60, 20], [180, 14]], '#d8d8d8');
  morros(b, 70, 3, 0.04, 0.6, '#8aa070', 80);
  capimCampo(b, 74, 503);
  // do lado de lá da cerca, a terra revirada em leiras
  b.rect(0, 74, W, 22, '#8a6a44');
  for (let y = 76; y < 96; y += 4) b.rect(0, y, W, 1, '#6d5234');
  for (let x = 6; x < W; x += 12) for (let y = 78; y < 96; y += 8) { b.set(x, y, '#5aa34a'); b.set(x + 1, y - 1, '#74bf5e'); }
  // a cerca, de moirão em moirão
  for (let x = 4; x < W; x += 26) { b.rect(x, 82, 3, 24, '#6d4726'); b.rect(x, 82, 3, 1, '#8a5a30'); }
  for (const y of [88, 95, 102]) {
    b.rect(0, y, W, 1, '#8a8a8a');
    for (let x = 8; x < W; x += 9) { b.set(x, y - 1, '#b8b8b8'); b.set(x + 1, y + 1, '#b8b8b8'); }
  }
  placaMataSeca(b, 160, 54);
  return b;
}

/* o campo de antigamente, na lembrança do Chefe: catadores com a peneira
   no alto lendo o vento, e um redemoinho de Saci passando no meio */
export function campoAntigo(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 72, [[0xe8, 0xb0, 0x70], [0xf4, 0xd8, 0xa0]]);
  morros(b, 70, 3, 0.04, 0.6, '#b8a870', 80);
  capimCampo(b, 74, 505, '#d8c070');
  redemoinho(b, 132, 110, 54);
  // os catadores, de silhueta, com a peneira levantada
  for (const x of [40, 74, 196]) {
    const c = '#5a4030';
    b.circle(x, 84, 3, c); b.rect(x - 3, 87, 6, 10, c); b.rect(x - 3, 97, 2, 7, c); b.rect(x + 1, 97, 2, 7, c);
    b.line(x + 3, 88, x + 7, 78, c); b.ellipse(x + 8, 75, 6, 2, '#8a6a40'); b.ellipse(x + 8, 75, 4, 1, '#c8a060');
  }
  return lembranca(b, '#3a2a10');
}

/* ------------------------------------------------- a Aldeia Catavento */

/* a aldeia de dia: casas de taipa, o moinho grande no fundo, cataventos em
   cada telhado e o largo de terra */
export function aldeiaCatavento(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x5a, 0xa8, 0xe8], [0xb8, 0xe0, 0xf4]]);
  nuvens(b, [[30, 16], [200, 22]]);
  morros(b, 62, 4, 0.05, 1.0, '#9ac080', 80);
  capimCampo(b, 66, 507);
  // o moinho, lá atrás à direita
  moinhoDeFora(b, 186, 22, 0.7);
  // as casas de taipa, cada uma com o catavento no telhado
  for (const [x, w] of [[14, 50], [80, 46]] as const) {
    b.rect(x, 70, w, 26, '#d8b888'); b.rect(x, 70, w, 2, '#e8d0a8');
    b.tri(x - 4, 70, x + w + 4, 70, x + w / 2, 54, '#b07840');
    b.rect(x + w / 2 - 4, 82, 9, 14, '#6d4726'); b.rect(x + 6, 76, 8, 7, '#5a7080');
    catavento(b, x + w / 2 - 1, 38, 0.7);
  }
  b.rect(0, 96, W, H - 96, P.path!);
  const r = rng(509);
  for (let i = 0; i < 90; i++) b.set((r() * W) | 0, 96 + ((r() * 62) | 0), i % 2 ? P.pathD! : P.pathL!);
  return b;
}

/* o moinho de vento de fora: torre de pedra, telhado de cone, as quatro pás */
function moinhoDeFora(b: Buf, x: number, y: number, s: number, penas = false): void {
  const w = Math.round(30 * s), h = Math.round(60 * s);
  b.rect(x - w / 2, y + 10, w, h, '#c8b8a0'); b.rect(x - w / 2, y + 10, 3, h, '#a89880');
  b.tri(x - w / 2 - 3, y + 10, x + w / 2 + 3, y + 10, x, y - 6, '#8a4a2a');
  b.rect(x - 4, y + h - 4, 8, 14, '#5a3a20');
  const cy = y + 8;
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + 0.6;
    const ex = Math.round(x + Math.cos(a) * 34 * s), ey = Math.round(cy + Math.sin(a) * 34 * s);
    b.line(x, cy, ex, ey, '#6d4726'); b.line(x + 1, cy, ex + 1, ey, '#6d4726');
    const px = Math.round(x + Math.cos(a) * 22 * s), py = Math.round(cy + Math.sin(a) * 22 * s);
    b.ellipse(px, py, Math.round(6 * s), Math.round(6 * s), '#f4ecd8');
    if (penas) { b.line(ex, ey, ex + 4, ey - 3, '#7fc4b8'); b.line(ex, ey, ex - 3, ey - 4, '#bfe9e0'); }
  }
  b.circle(x, cy, 3, '#4a2e18');
}

/* o moinho de perto, com as cinco penas de vento presas nas pás */
export function moinhoComPenas(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 90, [[0x5a, 0xa8, 0xe8], [0xb8, 0xe0, 0xf4], [0xf0, 0xf4, 0xe8]]);
  nuvens(b, [[40, 30], [200, 18]]);
  capimCampo(b, 96, 511);
  moinhoDeFora(b, 120, 30, 1, true);
  for (const [x, y] of [[20, 50], [190, 70]] as const) risco(b, x, y, 26);
  return b;
}

/* dentro do moinho: as vigas lá em cima, a mó de pedra, os sacos de
   farinha e a luz entrando pela porta. `noite`: a lua pela janela */
export function moinhoDentro(): Buf { return moinhoInterior(false); }
export function moinhoNoite(): Buf { return moinhoInterior(true); }

function moinhoInterior(noite: boolean): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 90, noite ? '#3a2a24' : '#7a5a3a');
  for (let x = 0; x < W; x += 14) { b.rect(x, 0, 13, 90, noite ? '#46342c' : '#8a6a48'); b.rect(x, 0, 1, 90, noite ? '#2a1e18' : '#5a4028'); }
  // as vigas cruzadas lá em cima
  b.rect(0, 14, W, 6, noite ? '#2a1e18' : '#4a2e18'); b.rect(0, 40, W, 5, noite ? '#2a1e18' : '#4a2e18');
  b.line(0, 20, 120, 40, noite ? '#2a1e18' : '#4a2e18'); b.line(240, 20, 120, 40, noite ? '#2a1e18' : '#4a2e18');
  // a janela redonda
  b.circle(196, 30, 12, '#3a2410');
  b.circle(196, 30, 10, noite ? '#1c1a3a' : '#a8d8f4');
  if (noite) { b.circle(198, 28, 4, '#f0ecd8'); estrelas(b, 513, 0, 0); }
  // a mó de pedra e o eixo
  b.rect(116, 0, 6, 70, '#5a3a20');
  b.ellipse(119, 80, 34, 9, '#6d635c'); b.ellipse(119, 77, 32, 7, P.rock!); b.ellipse(119, 76, 6, 2, '#5a524c');
  // o chão de tábua
  b.rect(0, 90, W, H - 90, noite ? '#3a2a20' : '#9c7a50');
  for (let y = 94; y < H; y += 8) b.rect(0, y, W, 1, noite ? '#2a1e18' : '#7a5a3a');
  // os sacos de farinha
  for (const [x, y] of [[30, 84], [46, 88], [36, 76]] as const) {
    b.ellipse(x, y, 9, 8, noite ? '#9a9080' : '#e8dcc8'); b.rect(x - 3, y - 9, 6, 3, '#b8a888');
  }
  return b;
}

/* -------------------------------------------- o Topo do Redemoinho */

/* o alto do platô: o redemoinho enorme que gira sozinho, e as correntes de
   vento em volta. Fim de tarde, céu verde-água */
export function topoRedemoinho(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0x3a, 0x6a, 0x7a], [0x8a, 0xb8, 0xb0], [0xd8, 0xe0, 0xc0]]);
  morros(b, 76, 4, 0.05, 0.3, '#5a7a60', 90);
  capimCampo(b, 82, 515, '#a8a860');
  // o redemoinho grande, no meio
  for (let k = 0; k < 90; k++) {
    const meia = 4 + k * 0.55;
    const desvio = Math.round(Math.sin(k * 0.18) * 5);
    const x0 = Math.round(120 - meia) + desvio, x1 = Math.round(120 + meia) + desvio;
    b.rect(x0, 112 - k, x1 - x0, 1, k % 6 < 3 ? '#a8d8d0' : '#8cc8bc');
    // as faixas do giro, inclinadas, e a borda clara
    const f = Math.round(((k * 3) % (x1 - x0 + 1)));
    b.rect(x0 + f, 112 - k, 3, 1, '#e8f8f4');
    b.set(x0, 112 - k, '#5a9a90'); b.set(x1, 112 - k, '#e8f8f4');
  }
  // as correntes em volta, setas de vento no chão
  for (const [x, y] of [[30, 100], [190, 104], [60, 128], [170, 132]] as const) {
    for (let k = 0; k < 3; k++) b.line(x + k * 6, y, x + k * 6 + 4, y - 3, '#e8f8f4');
  }
  return b;
}

/* --------------------------------------- o Terreiro do Rodamoinho */

/* o salão comprido do Pererê: as três correntes no chão, as janelas altas
   com a cortina batendo, e ele lá em cima, num banco de uma perna só.
   `calmo`: depois da luta, o vento para e as cortinas caem */
export function salaoVento(): Buf { return salaoDoVento(false); }
export function salaoVentoCalmo(): Buf { return salaoDoVento(true); }

function salaoDoVento(calmo: boolean): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 56, '#3a5a55');
  for (let x = 0; x < W; x += 20) b.rect(x, 0, 1, 56, '#2a4440');
  // as janelas altas, com a cortina
  for (const x of [18, 66, 158, 206]) {
    b.rect(x, 8, 18, 30, '#a8d8e8'); b.rect(x, 8, 18, 2, '#2a4440');
    if (calmo) { b.rect(x, 10, 4, 28, '#c42a1f'); b.rect(x + 14, 10, 4, 28, '#c42a1f'); }
    else { b.tri(x, 10, x + 4, 10, x + 16, 30, '#c42a1f'); b.tri(x + 14, 10, x + 18, 10, x + 26, 26, '#c42a1f'); }
  }
  // o banco de uma perna só, lá no alto
  b.rect(96, 32, 48, 5, '#6d4726'); b.rect(96, 32, 48, 1, '#8a5a30'); b.rect(118, 37, 4, 14, '#4a2e18');
  b.rect(90, 50, 60, 6, '#2a4440');
  // o chão, com as correntes desenhadas
  b.rect(0, 56, W, 60, '#7fa89a');
  for (let y = 60; y < 116; y += 6) for (let x = (y * 3) % 18; x < W; x += 18) {
    if (calmo) b.set(x, y, '#9ac0b0');
    else { b.line(x, y, x + 6, y - 2, '#bfe9e0'); b.set(x + 6, y - 3, '#ffffff'); }
  }
  b.rect(114, 56, 12, 60, '#6a9888');                          // o corredor do meio, sempre limpo
  b.rect(0, 116, W, H - 116, '#2a4440');
  for (let x = 0; x < W; x += 16) b.rect(x, 116, 15, 1, '#4a6a64');
  return b;
}

/* o primeiro redemoinho, na lembrança do Pererê: o Saci de uma perna só,
   dançando no meio do campo de noite */
export function campoNoite(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0x10, 0x14, 0x2a], [0x24, 0x34, 0x4a]]);
  estrelas(b, 517, 60, 70);
  b.circle(200, 22, 9, '#f0ecd8');
  morros(b, 76, 3, 0.04, 0.6, '#1e2a28', 90);
  capimCampo(b, 80, 519, '#4a5a40');
  redemoinho(b, 120, 118, 60, '#5a6a60', '#8a9a88');
  return lembranca(b, '#0a1418');
}

/* a campina lá do outro lado, vista do vão novo no Topo: nuvem de chuva,
   raio caindo, e a aldeia de palha pequenina no meio */
export function tupaAoLonge(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 90, [[0x2a, 0x2a, 0x4a], [0x5a, 0x5a, 0x7a], [0xa8, 0xa0, 0x98]]);
  for (const [x, y, rx] of [[60, 24, 40], [150, 18, 50], [220, 30, 34]] as const) {
    b.ellipse(x, y, rx, 12, '#3a3a52'); b.ellipse(x - 8, y - 4, rx - 12, 8, '#4a4a64');
  }
  // o raio
  let x = 206, y = 28;
  for (let k = 0; k < 6; k++) {
    const nx = x + (k % 2 ? 6 : -5), ny = y + 9;
    b.line(x, y, nx, ny, P.bolt!); b.line(x + 1, y, nx + 1, ny, '#fff4c0');
    x = nx; y = ny;
  }
  morros(b, 86, 4, 0.05, 0.5, '#4a6a4a', 100);
  b.rect(0, 92, W, 30, '#5a8a4a');
  // a aldeia de palha lá longe
  for (const [cx, w] of [[96, 10], [112, 14], [130, 10]] as const) {
    b.rect(cx - w / 2, 84, w, 6, '#c8a860'); b.tri(cx - w / 2 - 2, 84, cx + w / 2 + 2, 84, cx, 76, '#a88840');
  }
  // a borda do platô, na frente: capim e pedra
  capimCampo(b, 118, 521, '#8a8a50');
  return b;
}

/* ---------------------------------------------------------- as peças */

/* a pena de vento: verde-água, com a ponta enrolada. 8×14 */
export function penaVento(): Buf {
  const b = new Buf(8, 14);
  b.line(4, 13, 4, 1, '#4f948a');
  for (let y = 2; y < 12; y++) {
    const m = y < 7 ? (y - 1) >> 1 : (12 - y) >> 1;
    b.rect(4 - m, y, m, 1, '#7fc4b8'); b.rect(5, y, m, 1, '#bfe9e0');
  }
  b.set(3, 0, '#bfe9e0');
  return b;
}
