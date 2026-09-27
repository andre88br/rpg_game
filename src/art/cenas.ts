/* =========================================================================
   A arte das cutscenes: fundos pintados uma vez (e assados) e as poucas
   peças que se mexem por cima deles — a fogueira, o trator da Companhia.

   Tudo na tela lógica de 240×160. A faixa de baixo (de y≈124 em diante)
   fica por conta da legenda, então o que importa em cada fundo mora acima
   dela. Um fundo pode ser mais largo que a tela: a câmera da tomada anda
   por ele (ver scenes/cutscene.ts).
   ========================================================================= */
import { Buf, rng } from '../core/buf.ts';
import { P } from './palette.ts';
import { texto, larguraTexto } from './font.ts';
import * as T from './tiles.ts';

const W = 240, H = 160;

type RGB = readonly [number, number, number];

function hex(c: RGB): string {
  return '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/* céu em degradê, linha a linha, entre várias cores de parada */
function degrade(b: Buf, y0: number, y1: number, paradas: readonly RGB[]): void {
  const n = paradas.length - 1;
  for (let y = y0; y < y1; y++) {
    const t = ((y - y0) / Math.max(1, y1 - y0 - 1)) * n;
    const i = Math.min(n - 1, Math.floor(t)), f = t - i;
    const a = paradas[i]!, z = paradas[i + 1]!;
    b.rect(0, y, b.w, 1, hex([a[0] + (z[0] - a[0]) * f, a[1] + (z[1] - a[1]) * f, a[2] + (z[2] - a[2]) * f]));
  }
}

function estrelas(b: Buf, semente: number, n: number, ymax: number): void {
  const r = rng(semente);
  for (let i = 0; i < n; i++) {
    b.set((r() * b.w) | 0, (r() * ymax) | 0, i % 6 === 0 ? P.white! : '#a89bd0');
  }
}

/* morros ondulados: um perfil de senos, cheio até embaixo */
function morros(b: Buf, base: number, amp: number, freq: number, fase: number, cor: string, ate = H): void {
  for (let x = 0; x < b.w; x++) {
    const y = Math.round(base - amp * (0.6 * Math.sin(x * freq + fase) + 0.4 * Math.sin(x * freq * 2.3 + fase * 1.7)));
    b.rect(x, y, 1, ate - y, cor);
  }
}

/* árvore redonda de copa, maior que o tile do mundo */
function arvore(b: Buf, cx: number, base: number, alt: number, cor: string, corD: string, corL: string, tronco = P.trunk!): void {
  const r = Math.max(5, Math.round(alt * 0.4));
  b.rect(cx - 1, base - alt + r, 3, alt - r, tronco);
  b.circle(cx, base - alt + r, r, corD);
  b.circle(cx - 1, base - alt + r - 1, r - 1, cor);
  b.circle(cx - 2, base - alt + r - 3, Math.max(2, r - 4), corL);
}

/* ---------------------------------------------------------- 1. fogueira */

export function noiteFogueira(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, H, [[0x0d, 0x09, 0x12], [0x1c, 0x14, 0x30], [0x2a, 0x1e, 0x3a]]);
  estrelas(b, 7, 70, 70);
  // lua
  b.circle(196, 24, 9, '#f3ecd0');
  b.circle(200, 21, 8, '#1a1330');
  morros(b, 78, 8, 0.03, 1.2, '#1f1830');
  // mata escura ao fundo
  for (let x = -6; x < W + 8; x += 11) {
    const h = 20 + ((x * 13) % 9);
    arvore(b, x, 92, h, '#1a2a22', '#121c18', '#22362b', '#120d0a');
  }
  // chão de terra batida
  b.rect(0, 92, W, H - 92, '#2a1d17');
  const r = rng(3);
  for (let i = 0; i < 90; i++) b.set((r() * W) | 0, 92 + ((r() * (H - 92)) | 0), '#35261d');
  // clarão da fogueira no chão
  b.ellipse(120, 108, 58, 12, '#3f2a1d');
  b.ellipse(120, 108, 38, 8, '#5a3a22');
  b.ellipse(120, 108, 20, 5, '#7a4a26');
  return b;
}

/* a fogueira acesa, três quadros de chama. 24×24, a lenha na base */
export function fogueira(q: number): Buf {
  const b = new Buf(24, 24);
  // lenha cruzada
  b.line(3, 22, 20, 18, P.trunkD!); b.line(3, 21, 20, 17, P.trunk!);
  b.line(3, 18, 20, 22, P.trunkD!); b.line(3, 17, 20, 21, P.trunk!);
  const s = [0, 2, -1][q % 3]!;
  b.tri(4, 20, 12, 2 + s, 20, 20, P.fireD!);
  b.tri(6, 20, 12 + (q % 2 ? 1 : -1), 6 + s, 18, 20, P.fire!);
  b.tri(8, 20, 12, 11 - s, 16, 20, P.fireL!);
  b.set(12, 18, P.light!); b.set(11, 17, P.light!);
  return b;
}

/* uma fagulha: 1×2 que sobe do fogo */
export function fagulha(): Buf {
  const b = new Buf(1, 2);
  b.set(0, 0, P.fireL!); b.set(0, 1, P.fire!);
  return b;
}

/* ---------------------------------------------------- 2. mato que falava */

export const LARG_PANORAMA = 600;

export function panoramaNatureza(): Buf {
  const b = new Buf(LARG_PANORAMA, H);
  degrade(b, 0, 96, [[0x7f, 0xc4, 0xe8], [0xb4, 0xe2, 0xf0], [0xe8, 0xf4, 0xe0]]);
  // nuvens
  for (const [x, y] of [[40, 20], [170, 12], [300, 26], [430, 16], [540, 30]] as const) {
    b.ellipse(x, y, 16, 4, '#ffffff'); b.ellipse(x + 10, y - 3, 9, 4, '#ffffff');
  }
  // serra ao fundo, de ponta a ponta, mais alta no leste
  for (let x = 0; x < b.w; x++) {
    const sobe = Math.max(0, (x - 360) / 240);
    const y = Math.round(72 - sobe * 34 - 6 * Math.sin(x * 0.05) - 4 * Math.sin(x * 0.13));
    b.rect(x, y, 1, 96 - y, sobe > 0 ? P.rockD! : '#8fb0a0');
  }
  // o chão
  b.rect(0, 94, b.w, H - 94, P.grass!);
  const r = rng(21);
  for (let i = 0; i < 500; i++) b.set((r() * b.w) | 0, 94 + ((r() * (H - 94)) | 0), P.grassL!);

  // o RIO (0..200): água larga com as margens de areia
  b.rect(0, 98, 200, 26, P.sand!);
  b.rect(0, 102, 206, 18, P.water!);
  for (let x = 0; x < 206; x += 2) b.set(x, 102 + ((x >> 3) % 2), P.foam!);
  for (let i = 0; i < 40; i++) b.rect((r() * 190) | 0, 105 + ((r() * 12) | 0), 4, 1, P.waterL!);
  b.tri(200, 102, 214, 110, 200, 120, P.water!);

  // a MATA (200..400): árvores em três fileiras
  for (const [base, h, passo] of [[92, 36, 13], [100, 42, 15], [112, 38, 17]] as const) {
    for (let x = 212 + (base % 7); x < 400; x += passo) {
      arvore(b, x, base, h + ((x * 7) % 8), P.tree!, P.treeD!, P.treeL!);
    }
  }

  // a SERRA (400..600): pedra com rachaduras de brasa
  for (let x = 400; x < b.w; x++) {
    const y = Math.round(100 - (x - 400) * 0.12 - 5 * Math.sin(x * 0.09));
    b.rect(x, y, 1, 124 - y, P.rock!);
    b.set(x, y, P.rockD!);
  }
  for (let i = 0; i < 16; i++) {
    const x = 420 + ((r() * 170) | 0), y = 90 + ((r() * 26) | 0);
    b.line(x, y, x + 4 + ((r() * 5) | 0), y + 3, P.fire!);
    b.set(x + 1, y, P.fireL!);
  }
  return b;
}

/* -------------------------------------------------------- 3. a vila hoje */

export function vilaHoje(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0x3a, 0x2d, 0x55], [0xc0, 0x6a, 0x6a], [0xf0, 0xb0, 0x70]]);
  // postes com fio, que ninguém mais olha para o céu
  for (const x of [20, 120, 220]) b.rect(x, 20, 2, 70, '#3a2a2a');
  b.line(20, 24, 120, 30, '#2a1d20'); b.line(120, 30, 220, 24, '#2a1d20');
  // chão de rua
  b.rect(0, 78, W, H - 78, P.path!);
  b.rect(0, 100, W, 16, P.pathD!);
  const r = rng(5);
  for (let i = 0; i < 120; i++) b.set((r() * W) | 0, 78 + ((r() * 46) | 0), P.pathL!);
  // casas enfileiradas
  b.blit(T.construcao(3, 2, { roof: P.roof!, roofD: P.roofD!, roofL: P.roofL! }), 6, 44);
  b.blit(T.construcao(3, 2, { roof: '#3f8f6f', roofD: '#2b6b52', roofL: '#5fb894' }), 86, 44);
  b.blit(T.construcao(3, 2, { roof: '#8f6fa8', roofD: '#6a4f80', roofL: '#b094c8' }), 166, 44);
  return b;
}

/* ------------------------------------------------ 4. a Companhia Mata-Seca */

export function mataAntes(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x8f, 0xcf, 0xea], [0xd8, 0xf0, 0xe8]]);
  b.rect(0, 70, W, H - 70, P.grass!);
  // o rio atravessando de lado a lado
  b.rect(0, 100, W, 18, P.water!);
  for (let x = 0; x < W; x += 3) b.set(x, 100, P.foam!);
  const r = rng(9);
  for (let i = 0; i < 30; i++) b.rect((r() * W) | 0, 104 + ((r() * 12) | 0), 5, 1, P.waterL!);
  for (let x = 4; x < W; x += 14) arvore(b, x, 78, 30 + ((x * 5) % 10), P.tree!, P.treeD!, P.treeL!);
  for (let x = 10; x < W; x += 19) arvore(b, x, 96, 34 + ((x * 3) % 8), P.tree!, P.treeD!, P.treeL!);
  return b;
}

export function mataDepois(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x4a, 0x2a, 0x22], [0xa0, 0x5a, 0x30], [0xd0, 0x90, 0x50]]);
  // fumaça parada no horizonte
  for (const [x, y] of [[30, 40], [90, 34], [170, 42], [220, 36]] as const) {
    b.ellipse(x, y, 22, 6, '#7a5a4a'); b.ellipse(x + 8, y - 4, 12, 4, '#8f6f5a');
  }
  b.rect(0, 70, W, H - 70, '#8a6a44');
  const r = rng(13);
  for (let i = 0; i < 160; i++) b.set((r() * W) | 0, 70 + ((r() * 54) | 0), i % 2 ? '#a3804f' : '#6d5234');
  // o leito do rio, rachado, com um fio de água só
  b.rect(0, 100, W, 18, '#6d5234');
  for (let x = 0; x < W; x += 9) b.line(x, 101, x + 4, 116, '#4a3620');
  b.rect(0, 108, W, 2, P.waterD!);
  // tocos no lugar das árvores
  for (let x = 4; x < W; x += 14) { b.rect(x - 2, 72, 5, 6, P.trunkD!); b.rect(x - 2, 72, 5, 1, '#c9a06a'); }
  for (let x = 10; x < W; x += 19) { b.rect(x - 2, 90, 5, 6, P.trunkD!); b.rect(x - 2, 90, 5, 1, '#c9a06a'); }
  // a cerca de arame e a placa da Companhia
  for (let x = 0; x < W; x += 12) b.rect(x, 80, 2, 12, '#4a3a30');
  b.line(0, 83, W, 83, '#9a8f86'); b.line(0, 88, W, 88, '#9a8f86');
  placaMataSeca(b, 150, 58);
  return b;
}

/* a placa "MATA-SECA" com dois moirões, desenhada no próprio fundo */
function placaMataSeca(b: Buf, x: number, y: number): void {
  const s = 'MATA-SECA';
  const w = larguraTexto(s) + 10;
  b.rect(x + 6, y + 12, 3, 22, '#3a2a20');
  b.rect(x + w - 9, y + 12, 3, 22, '#3a2a20');
  b.rect(x - 1, y - 1, w + 2, 16, P.ink!);
  b.rect(x, y, w, 14, '#e0d6c0');
  b.rect(x, y, w, 2, '#b03020');
  texto(b, s, x + 5, y + 4, '#b03020');
}

/* o trator da Companhia, de frente para a direita, lâmina na frente.
   Dois quadros: a esteira anda. 52×34 */
export function trator(q: number): Buf {
  const b = new Buf(52, 34);
  const amar = '#c9a02a', amarD = '#8d6f16', amarL = '#e8c450';
  // cabine
  b.rect(10, 2, 18, 14, amarD);
  b.rect(12, 4, 14, 9, '#5a7080');
  b.rect(13, 5, 5, 3, '#8fb0c0');
  // cano de descarga
  b.rect(32, 0, 3, 12, '#3a3a3a');
  // corpo
  b.rect(4, 14, 36, 10, amar);
  b.rect(4, 14, 36, 2, amarL);
  b.rect(4, 22, 36, 2, amarD);
  // lâmina
  b.rect(42, 12, 4, 20, '#6a6a6a');
  b.rect(46, 14, 4, 18, '#8a8a8a');
  b.line(40, 20, 42, 20, '#3a3a3a');
  // esteira
  b.rect(2, 24, 40, 9, '#2a2a2a');
  b.ellipse(8, 28, 4, 4, '#4a4a4a'); b.ellipse(36, 28, 4, 4, '#4a4a4a');
  for (let x = 3 + (q % 2) * 2; x < 41; x += 4) { b.set(x, 24, '#5a5a5a'); b.set(x + 1, 32, '#5a5a5a'); }
  return b;
}

/* ---------------------------------------------------------- 5. a trilha */

export function trilhaAurora(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 86, [[0x2a, 0x1e, 0x4a], [0x8f, 0x4f, 0x80], [0xf0, 0x90, 0x60], [0xff, 0xd0, 0x80]]);
  estrelas(b, 17, 24, 30);
  // o sol nascendo atrás do morro
  b.circle(120, 86, 16, '#ffe0a0');
  b.circle(120, 86, 12, P.light!);
  morros(b, 84, 6, 0.04, 0.3, '#5a3a5a');
  morros(b, 96, 5, 0.06, 2.1, '#3a4a3a');
  b.rect(0, 100, W, H - 100, '#2f5a32');
  // a trilha, estreitando até o horizonte
  for (let y = 88; y < H; y++) {
    const t = (y - 88) / (H - 88);
    const cx = 120 + Math.sin(t * 5) * 30 * t;
    const meia = 2 + t * 26;
    b.rect(Math.round(cx - meia), y, Math.round(meia * 2), 1, t < 0.1 ? '#a3804f' : P.path!);
  }
  return b;
}

/* ---------------------------------------------------------- 6. o título */

export function ceuTitulo(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, H, [[0x0d, 0x09, 0x12], [0x22, 0x1a, 0x33], [0x3a, 0x22, 0x40]]);
  estrelas(b, 11, 80, H - 30);
  morros(b, 138, 6, 0.035, 0.8, '#15101f');
  return b;
}

/* ============================================ a Dona Firmina e o primeiro patuá */

/* a sala da Dona Firmina à noite: tábua, estante, janela e a mesa comprida
   com a lamparina acesa no meio */
export function salaFirmina(): Buf {
  const b = new Buf(W, H);
  // parede de tábua
  for (let x = 0; x < W; x += 12) {
    b.rect(x, 0, 12, 74, x % 24 ? '#6d4726' : '#7a5230');
    b.rect(x, 0, 1, 74, '#482e18');
  }
  b.rect(0, 70, W, 4, '#482e18');
  // janela com a noite lá fora
  b.rect(20, 14, 34, 28, '#3a2410');
  b.rect(22, 16, 30, 24, '#1c1430');
  b.rect(36, 16, 2, 24, '#3a2410'); b.rect(22, 27, 30, 2, '#3a2410');
  b.set(27, 20, P.white!); b.set(45, 22, '#a89bd0'); b.set(30, 33, '#a89bd0');
  // estante com potes e ervas
  b.rect(176, 10, 50, 50, '#482e18');
  for (const y of [24, 40, 56]) b.rect(176, y, 50, 3, '#6d4726');
  const potes = ['#5f8f4f', '#c2493f', '#e8e0d0', '#3f6fa8', '#c9a227', '#8f4f6a'];
  for (let i = 0; i < 12; i++) {
    const x = 180 + (i % 4) * 11, y = [15, 31, 47][Math.floor(i / 4)]!;
    b.rect(x, y, 7, 9, potes[i % potes.length]!);
    b.rect(x + 1, y - 1, 5, 1, '#3a2a20');
  }
  // raminhos pendurados
  for (const x of [72, 84, 96]) { b.line(x, 0, x, 10, '#3a2a20'); b.ellipse(x, 13, 3, 4, P.treeL!); }
  // assoalho
  for (let y = 74; y < H; y += 6) {
    b.rect(0, y, W, 6, y % 12 ? '#a3804f' : '#9a764a');
    b.rect(0, y, W, 1, '#7c5a36');
  }
  // o clarão da lamparina, quente, no chão e na parede
  b.ellipse(120, 96, 90, 22, '#b08c58');
  // a mesa comprida, de frente
  b.rect(80, 86, 80, 6, '#6d4726');
  b.rect(80, 86, 80, 1, '#9c6b3c');
  b.rect(84, 92, 4, 16, '#482e18'); b.rect(152, 92, 4, 16, '#482e18');
  // a lamparina
  b.rect(146, 79, 7, 7, '#c9a227');
  b.rect(148, 76, 3, 3, P.fireL!);
  b.set(149, 75, P.light!);
  return b;
}

/* a praia da Foz ao fim da tarde, com as estacas de fita vermelha da
   Companhia fincadas na areia e a lancha dela no mar */
export function fozEstacas(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 58, [[0x6a, 0x4a, 0x7a], [0xe0, 0x8a, 0x5a], [0xf8, 0xc8, 0x80]]);
  // o mar
  b.rect(0, 58, W, 30, P.waterD!);
  const r = rng(29);
  for (let i = 0; i < 40; i++) b.rect((r() * W) | 0, 60 + ((r() * 26) | 0), 6, 1, P.water!);
  for (let x = 0; x < W; x += 2) b.set(x, 58, '#f8c880');
  // o farol na ponta
  b.rect(206, 20, 10, 48, '#ecdcc2');
  for (const y of [28, 40, 52]) b.rect(206, y, 10, 4, '#c2493f');
  b.rect(204, 14, 14, 6, '#3a3a3a');
  b.rect(208, 15, 6, 4, P.fireL!);
  b.rect(200, 66, 22, 4, P.rockD!);
  // a lancha da Companhia
  b.tri(40, 72, 90, 72, 84, 80, '#6a6a6a');
  b.rect(46, 72, 38, 3, '#8a8a8a');
  b.rect(56, 64, 16, 8, '#e0d6c0');
  b.rect(56, 64, 16, 2, '#b03020');
  // areia
  b.rect(0, 88, W, H - 88, P.sand!);
  for (let x = 0; x < W; x += 3) b.set(x, 88, P.foam!);
  for (let i = 0; i < 90; i++) b.set((r() * W) | 0, 90 + ((r() * 34) | 0), P.sandD!);
  // barcos de pescador puxados na areia
  b.tri(170, 104, 206, 104, 200, 112, '#7c4c29');
  b.rect(172, 102, 32, 2, '#9c6b3c');
  // as estacas, com fita vermelha
  for (const [x, y] of [[20, 96], [52, 100], [104, 98], [136, 102], [226, 100]] as const) {
    b.rect(x, y, 2, 14, '#8a6a44');
    b.rect(x + 2, y + 1, 5, 2, '#d03020');
  }
  return b;
}

/* a boca do rio com a comporta da Companhia: de um lado a água presa, do
   outro o leito quase seco */
export function rioCalado(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 50, [[0x9a, 0x9a, 0xa8], [0xc8, 0xc0, 0xb0]]);
  morros(b, 46, 4, 0.05, 0.4, '#6a8a6a');
  b.rect(0, 50, W, H - 50, P.grassD!);
  const r = rng(31);
  for (let i = 0; i < 120; i++) b.set((r() * W) | 0, 50 + ((r() * 74) | 0), P.grass!);
  // rio, de lado a lado: cheio antes da comporta, rachado depois
  b.rect(0, 72, 120, 36, P.water!);
  for (let i = 0; i < 20; i++) b.rect((r() * 110) | 0, 76 + ((r() * 28) | 0), 6, 1, P.waterL!);
  b.rect(132, 72, W - 132, 36, '#8a6a44');
  for (let x = 134; x < W; x += 8) b.line(x, 73, x + 5, 106, '#6d5234');
  b.rect(132, 88, W - 132, 2, P.waterD!);
  // a comporta de concreto com a faixa da Companhia
  b.rect(118, 62, 16, 52, '#9a9a98');
  b.rect(118, 62, 16, 3, '#c0c0bc');
  b.rect(118, 80, 16, 4, '#b03020');
  b.rect(114, 60, 24, 3, '#6a6a68');
  // árvores sobrando, poucas
  for (const x of [14, 50, 88]) arvore(b, x, 66, 26, P.tree!, P.treeD!, P.treeL!);
  for (const x of [160, 200]) { b.rect(x - 2, 58, 5, 8, P.trunkD!); b.rect(x - 2, 58, 5, 1, '#c9a06a'); }
  return b;
}
