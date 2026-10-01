/* =========================================================================
   REGIÃO 7 — o Bairro da Cuca: os fundos das cutscenes e o retrato antigo.
   Noite que não acaba, casarões de janela alta, a mesa da Cartomante, o
   sótão do berço que balança sozinho — e a placa de VENDIDO da Companhia
   pregada na porta do Casarão.
   ========================================================================= */
import { Buf, rng } from '../../core/buf.ts';
import { P } from '../palette.ts';
import { texto, larguraTexto } from '../font.ts';
import { degrade, estrelas, morros, lembranca } from '../cenas.ts';

const W = 240, H = 160;

function lua(b: Buf, x: number, y: number, r: number): void {
  b.circle(x, y, r, '#f0ecd8'); b.circle(x - r / 3, y - r / 4, Math.max(1, r / 5), '#d8d0b8'); b.circle(x + r / 3, y + r / 3, Math.max(1, r / 6), '#d8d0b8');
}

/* um casarão de dois andares, de frente, com as janelas altas */
function casarao(b: Buf, x: number, w: number, base: number, h: number, cor: string, acesas: readonly number[] = []): void {
  const y = base - h;
  b.rect(x, y, w, h, cor); b.rect(x, y, w, 2, '#5a4a6a');
  b.tri(x - 4, y, x + w + 4, y, x + w / 2, y - 16, '#2a1e30');
  const nj = Math.max(1, Math.floor((w - 8) / 14));
  for (let a = 0; a < 2; a++) for (let j = 0; j < nj; j++) {
    const jx = x + 6 + j * 14, jy = y + 6 + a * 22;
    b.rect(jx, jy, 8, 14, acesas.includes(a * nj + j) ? '#e8c060' : '#1a1424');
    b.rect(jx, jy + 6, 8, 1, '#3a2e48'); b.rect(jx + 3, jy, 1, 14, '#3a2e48');
  }
}

/* a placa que a Companhia prega nas portas: VENDIDO, e a marca embaixo */
function placaVendido(b: Buf, x: number, y: number): void {
  const s = 'VENDIDO';
  const w = Math.max(larguraTexto(s), larguraTexto('MATA-SECA')) + 8;
  b.rect(x - 1, y - 1, w + 2, 22, P.ink!); b.rect(x, y, w, 20, '#e0d6c0');
  b.rect(x, y, w, 2, '#b03020');
  texto(b, s, x + (w - larguraTexto(s)) / 2, y + 3, '#b03020');
  texto(b, 'MATA-SECA', x + 4, y + 12, '#6a5a4a');
}

/* calçamento de pedra, molhado de sereno */
function calcamento(b: Buf, y0: number, semente: number): void {
  b.rect(0, y0, W, H - y0, '#3a3444');
  const r = rng(semente);
  for (let y = y0 + 2; y < H; y += 6) for (let x = (y % 12); x < W; x += 12) {
    b.rect(x, y, 10, 4, r() < 0.5 ? '#4a4256' : '#423a4e'); b.set(x + 1, y, '#5a5268');
  }
}

/* ---------------------------------------------------- o bairro */

/* o largo do bairro de noite: casarões dos dois lados, o Casarão
   Assombrado no fundo com a placa de VENDIDO, e o lampião fraco */
export function bairroCuca(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 96, [[0x0e, 0x0c, 0x1e], [0x24, 0x1e, 0x3a], [0x3a, 0x2a, 0x4a]]);
  estrelas(b, 801, 30, 50);
  lua(b, 208, 22, 10);
  casarao(b, 0, 56, 96, 60, '#3a3048', [1]);
  casarao(b, 184, 56, 96, 56, '#342a42', [2]);
  // o Casarão Assombrado, maior, torto, no fundo
  casarao(b, 70, 100, 92, 70, '#2a2236');
  b.line(118, 6, 130, 18, '#2a1e30');
  b.rect(110, 70, 20, 22, '#140e1a');
  placaVendido(b, 132, 62);
  // o lampião fraco
  b.rect(60, 50, 2, 46, '#2a2230'); b.rect(56, 46, 10, 6, '#2a2230'); b.rect(58, 47, 6, 4, '#c8a050');
  calcamento(b, 96, 803);
  for (let i = 0; i < 6; i++) b.ellipse(30 + i * 40, 100 + (i % 2) * 6, 22, 2, '#4a4458');   // o sereno no chão
  return b;
}

/* o bairro de antigamente, na lembrança da Morgana: janelas acesas, a
   roda de criança no largo e a lua grande — a noite era de todo mundo */
export function bairroAntigo(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 96, [[0x1a, 0x1a, 0x3a], [0x3a, 0x30, 0x5a], [0x6a, 0x4a, 0x6a]]);
  estrelas(b, 805, 50, 60);
  lua(b, 120, 24, 16);
  casarao(b, 0, 70, 96, 60, '#5a4a6a', [0, 1, 2, 3]);
  casarao(b, 170, 70, 96, 60, '#5a4a6a', [0, 1, 2, 3]);
  // as bandeirinhas de festa atravessando o largo
  for (let x = 70; x < 170; x += 6) { const y = 46 + Math.round(Math.sin((x - 70) / 100 * Math.PI) * 8); b.tri(x, y, x + 4, y, x + 2, y + 4, ['#e04a3a', '#f0d040', '#3a7fd5', '#5aa34a'][(x / 6) % 4]!); }
  calcamento(b, 96, 807);
  // a roda de criança, de silhueta
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2, x = Math.round(120 + Math.cos(a) * 30), y = Math.round(108 + Math.sin(a) * 6);
    const c = '#1a1424';
    b.circle(x, y - 12, 2, c); b.rect(x - 2, y - 10, 4, 7, c); b.rect(x - 2, y - 3, 1, 4, c); b.rect(x + 1, y - 3, 1, 4, c);
  }
  return lembranca(b, '#0a0814');
}

/* ------------------------------------------------- a Cartomante */

/* a casa da Cartomante: pano roxo na parede, a mesa redonda de toalha
   franjada, a vela e a bola de vidro */
export function casaCartomante(): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 90, '#3a2a4a');
  for (let x = 0; x < W; x += 16) { b.rect(x, 0, 8, 90, '#45325a'); b.tri(x, 90, x + 8, 90, x + 4, 84, '#2a1e38'); }
  // estrelas e luas bordadas no pano
  const r = rng(809);
  for (let i = 0; i < 18; i++) { const x = (r() * W) | 0, y = (r() * 70) | 0; b.set(x, y, P.gold!); b.set(x + 1, y, P.goldD!); }
  b.rect(0, 90, W, H - 90, '#2a2030');
  for (let y = 94; y < H; y += 8) b.rect(0, y, W, 1, '#1e1626');
  // a mesa redonda, de toalha com franja
  b.ellipse(120, 88, 50, 10, '#6a3fa8'); b.rect(70, 88, 100, 20, '#6a3fa8'); b.ellipse(120, 108, 50, 4, '#5a3290');
  for (let x = 72; x < 170; x += 4) b.rect(x, 108, 2, 4, P.gold!);
  // a bola de vidro e a vela
  b.ellipse(120, 84, 22, 3, '#4a2f78');
  b.circle(120, 72, 10, '#8ab0d8'); b.circle(117, 69, 3, '#d8f0ff'); b.rect(112, 81, 16, 3, '#4a3a2a');
  b.rect(92, 72, 4, 10, '#f4f0e0'); b.rect(92, 68, 4, 4, P.fireL!); b.set(93, 67, P.light!);
  for (const [x, y] of [[140, 80], [150, 82], [160, 80]] as const) b.rect(x, y, 7, 10, '#e8dcc8');
  return b;
}

/* as três cartas viradas na mesa, de perto: três molduras grandes onde a
   cutscene põe o que cada carta mostra */
export const CARTAS_X = [18, 90, 162] as const;

export function cartasMesa(): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, H, '#6a3fa8');
  const r = rng(811);
  for (let i = 0; i < 140; i++) b.set((r() * W) | 0, (r() * H) | 0, '#5a3290');
  for (const x of CARTAS_X) {
    b.rect(x - 1, 13, 62, 98, P.ink!); b.rect(x, 14, 60, 96, '#efe6c8');
    b.rect(x + 3, 17, 54, 90, '#2a2240'); b.frame(x + 3, 17, 54, 90, P.gold!);
    for (const [cx, cy] of [[x + 6, 20], [x + 53, 20], [x + 6, 103], [x + 53, 103]] as const) b.set(cx, cy, P.gold!);
  }
  // o fundo de cada carta: o rio, a sombra, a estrada
  b.rect(21, 76, 54, 31, '#2a5da6'); for (let x = 22; x < 74; x += 6) b.rect(x, 80 + (x % 3), 4, 1, '#6aa8ea');
  b.rect(93, 60, 54, 47, '#140e1a'); for (let k = 0; k < 5; k++) b.rect(98 + k * 10, 50 + (k % 2) * 6, 6, 57, '#1e1626');
  b.tri(165, 106, 219, 106, 192, 60, '#c2a06a'); b.circle(192, 30, 8, '#fff3c4');
  return b;
}

/* ----------------------------------------------------- o Casarão */

/* o sótão: vigas tortas, a janela redonda com a lua, teia, e o berço
   velho no meio do assoalho */
export function sotao(): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, H, '#1a1420');
  // o telhado por dentro, em V invertido
  b.tri(0, 0, W, 0, 120, 0, '#140e18');
  for (let k = 0; k < 8; k++) { b.line(0, 20 + k * 12, 120, k * 6 - 30, '#2a2030'); b.line(W, 20 + k * 12, 120, k * 6 - 30, '#2a2030'); }
  b.rect(0, 30, W, 4, '#3a2a30'); b.rect(30, 34, 4, 60, '#3a2a30'); b.rect(206, 34, 4, 60, '#3a2a30');
  // a janela redonda com a lua
  b.circle(120, 30, 14, '#3a2a30'); b.circle(120, 30, 11, '#1c1a3a'); lua(b, 124, 28, 5);
  b.rect(108, 29, 24, 2, '#3a2a30'); b.rect(119, 19, 2, 22, '#3a2a30');
  // a teia no canto
  for (let k = 0; k < 5; k++) b.line(34, 34, 34 + 26 - k * 2, 34 + k * 7, '#5a5268');
  for (const d of [8, 16]) b.line(34 + d, 34, 34, 34 + d, '#5a5268');
  // o assoalho
  b.rect(0, 94, W, H - 94, '#2a2028');
  for (let y = 98; y < H; y += 7) b.rect(0, y, W, 1, '#1e161e');
  // o berço velho
  b.rect(150, 86, 40, 14, '#4a3438'); b.rect(150, 86, 40, 2, '#6a4a50');
  for (let x = 152; x < 190; x += 5) b.rect(x, 78, 1, 10, '#4a3438');
  b.rect(150, 78, 40, 1, '#4a3438');
  b.line(148, 104, 192, 104, '#4a3438'); b.line(146, 102, 152, 100, '#4a3438'); b.line(194, 102, 188, 100, '#4a3438');
  return b;
}

/* o telhado do Casarão de noite: as telhas tortas, a chaminé e a lua tão
   perto que dá para contar as manchas */
export function telhadoCasarao(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, H, [[0x0e, 0x0c, 0x1e], [0x24, 0x1e, 0x3a]]);
  estrelas(b, 813, 60, 80);
  lua(b, 170, 40, 26);
  // o telhado, em diagonal: de (0,130) subindo até (240,92), cheio até embaixo
  const beira = (x: number) => Math.round(130 - (x / W) * 38);
  for (let x = 0; x < W; x++) {
    const y = beira(x);
    b.rect(x, y, 1, H - y, '#2a1e30');
    for (let k = y + 4; k < H; k += 7) b.set(x, k, (x + k) % 10 < 6 ? '#3a2e44' : '#241a2c');
    b.set(x, y, '#4a3a58');
  }
  b.rect(46, 100, 16, 24, '#3a2a30'); b.rect(44, 98, 20, 4, '#4a3a40');
  return b;
}

/* ------------------------------------------------ o Terreiro do Breu */

/* o salão da Morgana no escuro: três pilares, os rastros dos vultos no
   chão, e ela lá no alto. `calmo`: as velas acendem e o salão aparece */
export function salaoBreu(): Buf { return salaoDoBreu(false); }
export function salaoBreuCalmo(): Buf { return salaoDoBreu(true); }

function salaoDoBreu(calmo: boolean): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, H, calmo ? '#2a2236' : '#0e0a14');
  b.rect(0, 0, W, 56, calmo ? '#3a2e48' : '#140e1c');
  // o trono de espaldar alto
  b.rect(104, 4, 32, 30, calmo ? '#2a1e30' : '#0a0610'); b.rect(98, 30, 44, 8, calmo ? '#4a3a58' : '#1a1420');
  b.rect(90, 48, 60, 8, calmo ? '#2a2236' : '#100c16');
  // os três pilares
  for (const x of [40, 120, 200]) {
    const px = x === 120 ? x - 7 : x - 7;
    if (x === 120) continue;
    b.rect(px, 50, 14, 66, calmo ? '#4a3a58' : '#1a1420'); b.rect(px, 50, 3, 66, calmo ? '#5a4a6a' : '#221a2a');
  }
  b.rect(113, 74, 14, 42, calmo ? '#4a3a58' : '#1a1420');
  // os rastros dos vultos, em volta de cada pilar
  for (const [x, y] of [[47, 84], [120, 96], [207, 84]] as const) b.ellipse(x, y, 20, 8, calmo ? '#2e2440' : '#16101e');
  // as velas: apagadas, ou acesas
  for (const x of [16, 80, 160, 224]) {
    b.rect(x - 1, 40, 3, 10, '#c8c0b0');
    if (calmo) { b.rect(x - 1, 36, 3, 4, P.fireL!); b.set(x, 35, P.light!); b.ellipse(x, 44, 8, 8, '#3a2e48'); b.rect(x - 1, 40, 3, 10, '#e8e0d0'); }
  }
  b.rect(0, 116, W, H - 116, calmo ? '#1e1828' : '#08060c');
  return b;
}

/* a Cidade do Sol lá do outro lado do véu: o dia nascendo atrás de
   cúpulas brancas e douradas, a estrada que desce entre flores */
export function solAoLonge(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 96, [[0x2a, 0x1e, 0x4a], [0xc8, 0x6a, 0x7a], [0xf8, 0xc0, 0x70], [0xff, 0xe8, 0xa0]]);
  b.circle(120, 76, 22, '#ffe8a0'); b.circle(120, 76, 16, P.light!);
  for (let k = 0; k < 10; k++) { const a = Math.PI + (k / 9) * Math.PI; b.line(120, 76, Math.round(120 + Math.cos(a) * 60), Math.round(76 + Math.sin(a) * 50), '#f8d890'); }
  // as cúpulas da cidade, de contraluz
  for (const [x, w, h] of [[56, 22, 20], [86, 26, 30], [140, 30, 26], [176, 20, 18]] as const) {
    b.rect(x, 96 - h, w, h, '#e8d8b8'); b.ellipse(x + w / 2, 96 - h, w / 2, w / 3, P.gold!); b.rect(x + w / 2 - 1, 96 - h - w / 3 - 6, 2, 6, P.goldD!);
  }
  morros(b, 96, 3, 0.05, 0.8, '#7a9a5a', 110);
  b.rect(0, 104, W, H - 104, '#5a8a4a');
  b.tri(100, H, 140, H, 120, 104, P.path!);
  for (let i = 0; i < 30; i++) { const r = rng(815 + i)(); b.set((r * W) | 0, 108 + ((i * 7) % 40), i % 2 ? '#f0d040' : '#e08ab0'); }
  // o véu de sombra rasgado, nas bordas da tela
  for (let y = 0; y < H; y++) { const m = 10 + Math.round(6 * Math.sin(y * 0.2)); b.rect(0, y, m, 1, '#1a1424'); b.rect(W - m, y, m, 1, '#1a1424'); }
  return b;
}

/* ---------------------------------------------------------- as peças */

/* o retrato antigo, de moldura dourada. 12×14 */
export function retrato(): Buf {
  const b = new Buf(12, 14);
  b.rect(0, 0, 12, 14, P.goldD!); b.rect(1, 1, 10, 12, '#d8c8a0');
  b.circle(6, 5, 2, '#5a4a3a'); b.rect(3, 8, 6, 4, '#5a4a3a');
  return b;
}
