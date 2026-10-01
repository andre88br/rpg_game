/* =========================================================================
   REGIÃO 8 — a Cidade do Sol: os fundos das cutscenes, o cristal solar e o
   balão. Cúpulas brancas e douradas, a casa do Oráculo com o espelho
   d'água, a sala da Companhia com o mapa riscado de X, o Pico da Aurora e
   o salão de espelhos do Solano — e o céu visto do balão.
   ========================================================================= */
import { Buf, rng } from '../../core/buf.ts';
import { P } from '../palette.ts';
import { texto, larguraTexto } from '../font.ts';
import { degrade, estrelas, morros, lembranca } from '../cenas.ts';

const W = 240, H = 160;

/* uma cúpula branca com o topo dourado */
function cupula(b: Buf, x: number, w: number, base: number, h: number): void {
  b.rect(x, base - h, w, h, '#f4ecd8'); b.rect(x, base - h, 3, h, '#d8ccb0');
  b.ellipse(x + w / 2, base - h, w / 2, Math.round(w / 3), P.gold!);
  b.ellipse(x + w / 2 - w / 6, base - h - w / 6, w / 8, w / 10, '#fff0a0');
  b.rect(x + w / 2 - 1, base - h - Math.round(w / 3) - 6, 2, 6, P.goldD!);
  b.rect(x + w / 2 - 3, base - 12, 6, 12, '#a88c35');
}

/* lampião de ferro, aceso ou não */
function lampiao(b: Buf, x: number, base: number, aceso: boolean): void {
  b.rect(x, base - 34, 2, 34, '#3a3a42'); b.rect(x - 3, base - 40, 8, 7, '#3a3a42');
  b.rect(x - 2, base - 39, 6, 5, aceso ? P.fireL! : '#6a6a72');
}

/* ------------------------------------------------- a Cidade do Sol */

/* a praça da cidade ao meio-dia: cúpulas, a fonte no meio e os lampiões */
export function cidadeSol(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0x5a, 0xa8, 0xf0], [0xa8, 0xd8, 0xf8], [0xf8, 0xf0, 0xd8]]);
  b.circle(206, 22, 12, '#fff8d0'); b.circle(206, 22, 9, P.light!);
  cupula(b, 6, 36, 92, 40); cupula(b, 48, 44, 92, 54); cupula(b, 148, 44, 92, 48); cupula(b, 198, 36, 92, 36);
  // o chão de pedra clara da praça
  b.rect(0, 92, W, H - 92, '#e8dcc0');
  for (let y = 94; y < H; y += 8) for (let x = (y % 16); x < W; x += 16) b.rect(x, y, 14, 6, '#f0e6cc');
  // a fonte no meio
  b.ellipse(120, 104, 30, 8, '#c8b890'); b.ellipse(120, 102, 26, 6, '#8ac8f0'); b.rect(117, 84, 6, 18, '#c8b890');
  b.ellipse(120, 84, 8, 3, '#c8b890'); for (let k = -1; k <= 1; k++) b.line(120, 80, 120 + k * 10, 96, '#d8f0ff');
  lampiao(b, 24, 112, false); lampiao(b, 214, 112, false);
  return b;
}

/* a mesma praça com os lampiões acesos em pleno dia: festa */
export function cidadeFesta(): Buf {
  const b = cidadeSol();
  lampiao(b, 24, 112, true); lampiao(b, 214, 112, true);
  for (let x = 0; x < W; x += 6) {
    const y = 60 + Math.round(Math.sin(x / W * Math.PI) * 10);
    b.tri(x, y, x + 4, y, x + 2, y + 4, ['#e04a3a', '#f0d040', '#3a7fd5', '#5aa34a'][(x / 6) % 4]!);
  }
  return b;
}

/* a casa do Oráculo: paredes brancas, a janela redonda de onde o sol cai
   em feixe, e a bacia larga com o espelho d'água no chão */
export function casaOraculo(): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 90, '#f0e6cc');
  for (let x = 0; x < W; x += 30) b.rect(x, 0, 2, 90, '#e0d4b4');
  b.circle(120, 26, 16, '#c8a050'); b.circle(120, 26, 13, '#fff8d0');
  for (let k = -6; k <= 6; k += 3) b.line(120, 26, 120 + k * 3, 0, '#c8a050');
  // o feixe de sol caindo na bacia
  for (let y = 40; y < 96; y++) { const m = 8 + (y - 40) / 4; b.rect(Math.round(120 - m), y, Math.round(2 * m), 1, y % 2 ? '#f8ecc8' : '#f4e6c0'); }
  b.rect(0, 90, W, H - 90, '#d8c8a0');
  for (let y = 94; y < H; y += 8) b.rect(0, y, W, 1, '#c8b890');
  // a bacia com o espelho d'água
  b.ellipse(120, 100, 40, 10, '#a88c35'); b.ellipse(120, 99, 36, 8, '#8ac8f0'); b.ellipse(112, 97, 14, 2, '#fff8d0');
  return b;
}

/* a sala da Companhia, na visão do Oráculo: o mapa enorme na parede com um
   X vermelho em cada região, a mesa de papel carimbado e a janela */
export function escritorioCompanhia(): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 96, '#8a8a8a');
  for (let x = 0; x < W; x += 24) b.rect(x, 0, 1, 96, '#7a7a7a');
  // o mapa na parede
  b.rect(30, 8, 140, 70, '#3a3a3a'); b.rect(32, 10, 136, 66, '#e8dcc0');
  b.ellipse(100, 44, 60, 28, '#a8c890'); b.ellipse(80, 40, 30, 16, '#90b878'); b.ellipse(130, 50, 26, 12, '#c8b880');
  for (const [x, y] of [[54, 26], [62, 52], [86, 60], [104, 28], [116, 46], [136, 36], [150, 58], [96, 44]] as const) {
    b.line(x - 3, y - 3, x + 3, y + 3, '#d02a1a'); b.line(x + 3, y - 3, x - 3, y + 3, '#d02a1a');
  }
  const s = 'MATA-SECA';
  b.rect(176, 10, larguraTexto(s) + 8, 12, '#e0d6c0'); b.rect(176, 10, larguraTexto(s) + 8, 2, '#b03020');
  texto(b, s, 180, 13, '#b03020');
  // a janela com a cidade lá fora
  b.rect(184, 30, 44, 48, '#3a3a3a'); b.rect(186, 32, 40, 44, '#a8d8f8'); b.rect(205, 32, 2, 44, '#3a3a3a');
  b.ellipse(200, 70, 8, 6, P.gold!); b.ellipse(216, 72, 6, 4, P.gold!);
  // o chão e a mesa de papel
  b.rect(0, 96, W, H - 96, '#5a5a62');
  b.rect(70, 92, 100, 8, '#4a3a2a'); b.rect(70, 92, 100, 2, '#6a5a4a'); b.rect(76, 100, 6, 20, '#3a2a1e'); b.rect(158, 100, 6, 20, '#3a2a1e');
  for (const [x, y] of [[84, 88], [100, 89], [130, 88]] as const) { b.rect(x, y, 14, 4, '#f4f0e0'); b.circle(x + 10, y + 2, 1, '#b03020'); }
  return b;
}

/* --------------------------------------------- o Pico da Aurora */

/* o cume antes do amanhecer: o céu ainda escuro em cima, rosado no fim, as
   estrelas indo embora — e uma que não quer ir */
export function picoAurora(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 100, [[0x10, 0x14, 0x3a], [0x4a, 0x3a, 0x6a], [0xd0, 0x7a, 0x8a], [0xf8, 0xc0, 0x90]]);
  estrelas(b, 901, 40, 50);
  morros(b, 96, 6, 0.04, 0.6, '#5a4a6a', H);
  // o cume, de pedra e flor
  b.tri(-10, H, 250, H, 120, 74, '#6a5a5a'); b.tri(120, 74, 250, H, 160, H, '#5a4a4a');
  const r = rng(903);
  for (let i = 0; i < 40; i++) { const x = 40 + ((r() * 160) | 0), y = 100 + ((r() * 50) | 0); b.set(x, y, i % 2 ? '#f0d040' : '#e08ab0'); }
  for (const [x, y] of [[90, 104], [150, 108]] as const) { b.ellipse(x, y, 10, 5, '#4a3a3a'); b.ellipse(x - 1, y - 2, 7, 3, '#7a6a6a'); }
  return b;
}

/* a cidade subindo o pico de antigamente, na lembrança do Solano: gente
   de silhueta no alto, de braço erguido para o sol que nasce */
export function auroraAntiga(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 100, [[0x4a, 0x3a, 0x7a], [0xd0, 0x7a, 0x7a], [0xf8, 0xc0, 0x80], [0xff, 0xe8, 0xa8]]);
  b.circle(120, 96, 22, '#fff0b0'); b.circle(120, 96, 16, P.light!);
  b.tri(-10, H, 250, H, 120, 92, '#3a2a3a');
  for (let k = 0; k < 9; k++) {
    const x = 40 + k * 20, y = 112 + Math.abs(k - 4) * 3;
    const c = '#1e1424';
    b.circle(x, y - 14, 3, c); b.rect(x - 3, y - 11, 6, 10, c); b.line(x - 3, y - 10, x - 6, y - 20, c); b.line(x + 3, y - 10, x + 6, y - 20, c);
  }
  return lembranca(b, '#2a1a10');
}

/* o cercado de pedra do canto do cume, de noite fora de hora: metade da
   lua clara, metade escura */
export function cercadoJaci(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, H, [[0x0e, 0x0c, 0x24], [0x24, 0x1e, 0x40]]);
  estrelas(b, 905, 70, 90);
  // a lua partida ao meio: a metade da esquerda clara, a da direita escura
  b.circle(56, 34, 16, '#f0ecd8');
  for (let y = -16; y <= 16; y++) {
    const m = Math.round(Math.sqrt(16 * 16 - y * y));
    b.rect(57, 34 + y, m, 1, '#3a3462');
  }
  // o cercado de pedra empilhada
  b.rect(0, 96, W, H - 96, '#3a3448');
  for (let x = 0; x < W; x += 14) for (const y of [92, 100]) b.ellipse(x + 7 + (y % 2) * 7, y, 8, 5, y === 92 ? '#5a5268' : '#4a4458');
  return b;
}

/* ------------------------------------------- o Terreiro da Aurora */

/* o salão do Solano: pedra branca, espelhos nas paredes com o feixe
   correndo entre eles, e o trono do sol lá no alto. `calmo`: a luz se
   desfaz em sete cores */
export function salaoAurora(): Buf { return salaoDaAurora(false); }
export function salaoAuroraCalmo(): Buf { return salaoDaAurora(true); }

function salaoDaAurora(calmo: boolean): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 56, '#f0e6cc');
  for (let x = 0; x < W; x += 20) b.rect(x, 0, 1, 56, '#e0d4b4');
  // o sol de ouro atrás do trono
  b.circle(120, 20, 18, P.goldD!); b.circle(120, 20, 15, P.gold!);
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; b.line(120 + Math.round(Math.cos(a) * 18), 20 + Math.round(Math.sin(a) * 18), 120 + Math.round(Math.cos(a) * 26), 20 + Math.round(Math.sin(a) * 26), P.gold!); }
  b.rect(96, 32, 48, 6, '#e3c96a'); b.rect(96, 32, 48, 2, '#fff3c4'); b.rect(100, 38, 40, 12, '#d8c8a0');
  // os espelhos nas paredes
  for (const x of [20, 60, 168, 208]) { b.rect(x, 10, 14, 26, '#a88c35'); b.rect(x + 2, 12, 10, 22, '#d8f0ff'); b.line(x + 3, 14, x + 9, 28, '#ffffff'); }
  // o chão de mármore
  b.rect(0, 56, W, 60, calmo ? '#f8f0dc' : '#e8dcc0');
  for (let y = 60; y < 116; y += 10) for (let x = (y % 20); x < W; x += 20) b.rect(x, y, 18, 8, calmo ? '#fff8e8' : '#f0e6cc');
  if (calmo) {
    const cores = ['#e04a3a', '#f08a2a', '#f0d040', '#5aa34a', '#3a7fd5', '#5a4aa8', '#9a5ac8'];
    cores.forEach((c, k) => { for (let x = 0; x < W; x += 2) b.set(x, 64 + k * 6 + Math.round(Math.sin(x * 0.05 + k) * 3), c); });
  } else {
    // o feixe de luz cruzando o salão, de espelho em espelho
    b.line(27, 36, 120, 90, '#fff3c4'); b.line(120, 90, 215, 36, '#fff3c4');
    b.line(28, 36, 121, 90, '#f8e090'); b.line(121, 90, 216, 36, '#f8e090');
  }
  b.rect(0, 116, W, H - 116, '#c8b890');
  for (let x = 0; x < W; x += 16) b.rect(x, 116, 15, 1, '#e0d4b4');
  return b;
}

/* --------------------------------------------- o balão no céu */

/* lá de cima: nuvens, e embaixo o continente em retalhos — o azul da Foz,
   o verde da mata, o vermelho da serra, o dourado do campo, o cinza da
   aldeia, o barro das minas, o roxo do bairro e o branco da cidade — com o
   Círculo Dourado brilhando no meio */
export function baloeCeu(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 60, [[0x4a, 0x98, 0xe8], [0xa8, 0xd8, 0xf8]]);
  b.rect(0, 60, W, H - 60, '#7aa86a');
  const retalhos: readonly [number, number, number, number, string][] = [
    [0, 60, 50, 40, '#3a7fd5'], [50, 60, 50, 30, '#2f6b2e'], [100, 60, 40, 30, '#a04a2a'], [140, 60, 50, 34, '#d8c070'],
    [190, 60, 50, 40, '#8a8aa0'], [0, 100, 60, 60, '#9a6a44'], [180, 100, 60, 60, '#4a3a6a'], [60, 120, 120, 40, '#f0e6cc'],
  ];
  for (const [x, y, w, h, c] of retalhos) {
    b.rect(x, y, w, h, c);
    const r = rng(907 + x + y);
    for (let i = 0; i < 30; i++) b.set(x + ((r() * w) | 0), y + ((r() * h) | 0), '#e8f0e0');
  }
  // o Círculo Dourado no meio
  b.ellipse(120, 104, 22, 10, P.goldD!); b.ellipse(120, 104, 18, 8, P.gold!); b.ellipse(120, 104, 10, 4, '#7aa86a');
  // as nuvens passando por cima
  for (const [x, y] of [[30, 30], [160, 20], [210, 70], [60, 84]] as const) { b.ellipse(x, y, 20, 5, '#ffffff'); b.ellipse(x + 10, y - 3, 12, 4, '#ffffff'); }
  return b;
}

/* ---------------------------------------------------------- as peças */

/* o cristal solar: amarelo-claro, com a luz presa dentro. 10×14 */
export function cristalSolar(): Buf {
  const b = new Buf(10, 14);
  b.tri(0, 6, 9, 6, 5, 0, '#f0d040'); b.tri(0, 6, 9, 6, 5, 13, '#c8a020');
  b.line(5, 1, 3, 6, '#fff8d0'); b.set(4, 3, '#ffffff');
  return b;
}

/* o balão listrado do Baloeiro, com o cesto. 30×40 */
export function balao(): Buf {
  const b = new Buf(30, 40);
  b.ellipse(15, 13, 14, 13, '#e04a3a');
  for (let x = 3; x < 28; x += 6) for (let y = 1; y < 26; y++) { const m = Math.sqrt(Math.max(0, 1 - ((y - 13) / 13) ** 2)) * 14; if (Math.abs(x - 15) < m) b.rect(x, y, 3, 1, '#f0d040'); }
  b.line(5, 22, 11, 32, '#6d4726'); b.line(25, 22, 19, 32, '#6d4726');
  b.rect(10, 32, 10, 7, '#8a5a30'); b.rect(10, 32, 10, 1, '#a0703c');
  return b;
}
