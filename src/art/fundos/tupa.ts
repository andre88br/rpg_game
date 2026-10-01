/* =========================================================================
   REGIÃO 5 — a Aldeia Tupã: os fundos das cutscenes, a pedra-de-raio e o
   tambor. Campina de céu pesado, a aldeia de palha, o charco com o casarão
   dos para-raios da Companhia, o ninho do raio no cume.
   ========================================================================= */
import { Buf, rng } from '../../core/buf.ts';
import { P } from '../palette.ts';
import { degrade, estrelas, morros, lembranca, placaMataSeca } from '../cenas.ts';

const W = 240, H = 160;

/* nuvem de chuva pesada, em duas camadas */
function nuvemPesada(b: Buf, x: number, y: number, rx: number): void {
  b.ellipse(x, y, rx, 12, '#3a3a52'); b.ellipse(x - 8, y - 4, rx - 12, 8, '#4a4a64'); b.ellipse(x + 10, y + 4, rx - 18, 6, '#2e2e44');
}

/* um raio em ziguezague, de (x, y) para baixo */
export function raio(b: Buf, x: number, y: number, passos: number, semente = 1): void {
  const r = rng(semente);
  for (let k = 0; k < passos; k++) {
    const nx = x + (k % 2 ? 4 + ((r() * 4) | 0) : -4 - ((r() * 4) | 0)), ny = y + 8;
    b.line(x, y, nx, ny, P.bolt!); b.line(x + 1, y, nx + 1, ny, '#fff4c0');
    x = nx; y = ny;
  }
}

/* grama da campina, com manchas chamuscadas onde o raio caiu */
function chaoCampina(b: Buf, y0: number, semente: number, cor = '#5a8a4a'): void {
  b.rect(0, y0, W, H - y0, cor);
  const r = rng(semente);
  for (let i = 0; i < 200; i++) b.set((r() * W) | 0, y0 + ((r() * (H - y0)) | 0), i % 3 ? '#4a7a3c' : '#6a9a58');
  for (let i = 0; i < 4; i++) {
    const x = (r() * W) | 0, y = y0 + 10 + ((r() * (H - y0 - 20)) | 0);
    b.ellipse(x, y, 7, 3, '#3a3a2a'); b.ellipse(x, y, 3, 1, '#2a2a20');
  }
}

/* oca de palha, de frente */
function oca(b: Buf, cx: number, base: number, w: number, h: number): void {
  b.ellipse(cx, base - h / 2, w / 2, h / 2, '#a88840');
  b.rect(cx - w / 2, base - h / 2, w, h / 2, '#a88840');
  for (let y = base - h + 4; y < base; y += 4) b.rect(cx - w / 2 + 2, y, w - 4, 1, '#c8a860');
  b.ellipse(cx, base - 6, 5, 7, '#3a2410'); b.rect(cx - 5, base - 6, 10, 6, '#3a2410');
}

/* ---------------------------------------------- a Campina dos Raios */

/* a campina sob o céu pesado: a cerca de pau-a-pique com o vão, o chão
   chamuscado e o tambor grande no meio do vão */
export function campinaRaios(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0x3a, 0x3a, 0x5a], [0x6a, 0x6a, 0x8a], [0xa8, 0xa8, 0xa0]]);
  for (const [x, y, rx] of [[50, 20, 46], [170, 14, 56]] as const) nuvemPesada(b, x, y, rx);
  raio(b, 30, 30, 5, 601);
  morros(b, 74, 5, 0.05, 0.4, '#3a5a3a', 90);
  chaoCampina(b, 78, 603);
  // a cerca de pau-a-pique, com o vão no meio
  for (const [x0, x1] of [[0, 88], [152, W]] as const) {
    for (let x = x0; x < x1; x += 4) b.rect(x, 70, 3, 22, x % 8 ? '#6d4726' : '#8a5a30');
    b.rect(x0, 76, x1 - x0, 2, '#4a2e18'); b.rect(x0, 84, x1 - x0, 2, '#4a2e18');
  }
  return b;
}

/* a festa do trovão de antigamente, na lembrança do Chefe: de noite, a roda
   de tambores em volta do fogo, e o raio respondendo lá em cima */
export function festaTrovao(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 90, [[0x14, 0x10, 0x2a], [0x2a, 0x24, 0x48], [0x4a, 0x34, 0x4a]]);
  estrelas(b, 605, 20, 30);
  nuvemPesada(b, 120, 18, 60);
  raio(b, 124, 26, 5, 607);
  morros(b, 82, 4, 0.05, 0.4, '#1e2a1e', 100);
  b.rect(0, 96, W, H - 96, '#2a3a24');
  b.ellipse(120, 108, 40, 9, '#5a3a22'); b.ellipse(120, 108, 18, 4, '#8a5a2a');
  b.tri(112, 108, 128, 108, 120, 92, P.fire!); b.tri(116, 108, 124, 108, 120, 98, P.fireL!);
  // a roda de tocadores, de silhueta, cada um com o tambor
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const x = Math.round(120 + Math.cos(a) * 54), y = Math.round(104 + Math.sin(a) * 12);
    const c = '#140e0a';
    b.circle(x, y - 14, 3, c); b.rect(x - 3, y - 11, 6, 9, c); b.rect(x - 3, y - 2, 2, 5, c); b.rect(x + 1, y - 2, 2, 5, c);
    b.ellipse(x + 5, y - 5, 4, 3, '#6d4726'); b.ellipse(x + 5, y - 7, 4, 1, '#c8a870');
  }
  return lembranca(b, '#0a0a1a');
}

/* as torres de ferro da Companhia atravessando a campina, com o fio, e a
   placa. Céu cinza, sem uma nuvem de chuva */
export function torresCompanhia(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0x8a, 0x8a, 0x9a], [0xb8, 0xb8, 0xb8], [0xd0, 0xc8, 0xb8]]);
  morros(b, 74, 4, 0.05, 0.4, '#6a7a5a', 90);
  chaoCampina(b, 78, 609, '#7a8a5a');
  // as torres em treliça, cada vez menores lá longe
  const torre = (x: number, base: number, h: number) => {
    const w = Math.round(h / 3);
    b.line(x - w, base, x - 2, base - h, '#4a4a52'); b.line(x + w, base, x + 2, base - h, '#4a4a52');
    for (let y = base; y > base - h; y -= 6) {
      const m = Math.round(w * (y - (base - h)) / h);
      b.line(x - m, y, x + m, y - 6, '#5a5a62'); b.line(x + m, y, x - m, y - 6, '#5a5a62');
    }
    b.rect(x - w + 2, base - h + 4, 2 * w - 4, 2, '#4a4a52');
    return [x, base - h + 4] as const;
  };
  const tops = [torre(40, 110, 80), torre(150, 92, 52), torre(214, 82, 30)];
  for (let i = 0; i + 1 < tops.length; i++) {
    const [x0, y0] = tops[i]!, [x1, y1] = tops[i + 1]!;
    for (const d of [-6, 6]) b.line(x0 + d, y0, x1 + Math.round(d / 2), y1, '#2a2a30');
  }
  placaMataSeca(b, 70, 74);
  return b;
}

/* --------------------------------------------------- a Aldeia Tupã */

/* a aldeia de palha, o pátio de terra e o Morro do Trovão atrás, com a
   nuvem parada no cume */
export function aldeiaTupa(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0x5a, 0x7a, 0xa8], [0x9a, 0xb0, 0xc8], [0xd8, 0xd8, 0xc8]]);
  // o morro, com a nuvem no cume
  b.tri(70, 80, 210, 80, 150, 10, '#4a5a4a'); b.tri(150, 10, 210, 80, 170, 80, '#3a4a3a');
  nuvemPesada(b, 150, 14, 34);
  morros(b, 76, 3, 0.05, 1.2, '#5a8a4a', 90);
  chaoCampina(b, 80, 611);
  b.ellipse(120, 112, 100, 18, P.path!); b.ellipse(120, 112, 86, 14, P.pathL!);
  for (const [x, w, h] of [[30, 40, 34], [86, 34, 28], [206, 44, 36]] as const) oca(b, x, 96, w, h);
  return b;
}

/* dentro da casa do Pajé: parede de palha, o fogo baixo, a esteira e a
   mesa de pedra onde ele arruma as pedras-de-raio */
export function casaPaje(): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 90, '#8a6a30');
  for (let y = 2; y < 90; y += 4) b.rect(0, y, W, 1, y % 8 ? '#a88840' : '#6d5020');
  // os cestos e as cabaças pendurados
  for (const [x, y] of [[30, 30], [60, 22], [196, 26]] as const) { b.line(x, 0, x, y - 6, '#4a2e18'); b.ellipse(x, y, 7, 6, '#c8a048'); b.ellipse(x - 2, y - 2, 2, 2, '#e8c878'); }
  // o chão de terra, e a esteira
  b.rect(0, 90, W, H - 90, '#7a5a3a');
  const r = rng(613);
  for (let i = 0; i < 80; i++) b.set((r() * W) | 0, 92 + ((r() * 66) | 0), '#6a4a2e');
  b.rect(40, 104, 70, 14, '#c8a860'); for (let x = 42; x < 110; x += 4) b.rect(x, 104, 1, 14, '#a88840');
  // a mesa de pedra
  b.ellipse(120, 92, 40, 8, P.rockD!); b.ellipse(120, 90, 38, 6, P.rock!);
  // o fogo baixo
  b.ellipse(200, 106, 14, 4, '#3a2410');
  b.tri(192, 106, 208, 106, 200, 92, P.fire!); b.tri(196, 106, 204, 106, 200, 98, P.fireL!);
  return b;
}

/* ------------------------------------------- o Charco Relampejante */

/* o charco na chuva: poças, junco, e o casarão dos para-raios da Companhia
   com as pontas de ferro no telhado. `calado`: depois do para-raio mestre,
   as cercas apagam e a chuva para */
export function charcoCasarao(): Buf { return charco(false); }
export function charcoCalado(): Buf { return charco(true); }

function charco(calado: boolean): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, calado
    ? [[0x6a, 0x8a, 0xb0], [0xa8, 0xc0, 0xd0], [0xd8, 0xe0, 0xd8]]
    : [[0x2a, 0x2a, 0x40], [0x4a, 0x4a, 0x60], [0x6a, 0x6a, 0x78]]);
  if (!calado) { nuvemPesada(b, 60, 16, 50); nuvemPesada(b, 190, 10, 54); raio(b, 186, 22, 4, 615); }
  // o casarão, com as pontas de ferro
  b.rect(110, 34, 120, 50, '#5a5a5a'); b.rect(110, 34, 120, 3, '#7a7a7a');
  b.tri(104, 34, 236, 34, 170, 18, '#3a3a40');
  for (const x of [124, 150, 176, 202, 224]) {
    b.rect(x, 4, 2, 24, '#8a8a92'); b.set(x, 3, P.bolt!);
    if (!calado) { b.set(x - 1, 2, '#fff4c0'); b.set(x + 2, 4, P.bolt!); }
  }
  for (const x of [124, 160, 196]) b.rect(x, 50, 14, 12, calado ? '#3a3a40' : '#f8e070');
  b.rect(164, 66, 12, 18, '#3a2a20');
  // as cercas de raio na frente do casarão
  for (const x of [100, 236]) b.rect(x, 64, 3, 22, '#8a8a92');
  if (!calado) for (const y of [70, 76, 82]) for (let x = 103; x < 236; x += 2) b.set(x, y + (x % 4 ? 0 : 1), P.bolt!);
  // o brejo
  b.rect(0, 84, W, H - 84, '#4a6a3a');
  const r = rng(617);
  for (const [x, y, rx] of [[30, 100, 22], [140, 112, 30], [210, 130, 18], [60, 134, 20]] as const) {
    b.ellipse(x, y, rx, 5, calado ? '#7aa0c8' : '#3a4a6a'); b.ellipse(x - 4, y - 1, rx / 2, 2, calado ? '#a8c8e8' : '#5a6a8a');
  }
  for (let i = 0; i < 30; i++) {
    const x = (r() * W) | 0, y = 88 + ((r() * 60) | 0);
    b.line(x, y, x - 1, y - 8, '#2d6027'); b.line(x + 2, y, x + 3, y - 6, '#3c7c34');
  }
  if (!calado) for (let i = 0; i < 90; i++) { const x = (r() * W) | 0, y = (r() * 120) | 0; b.line(x, y, x - 2, y + 5, '#8a9ab8'); }
  return b;
}

/* atrás do casarão, depois da chuva certa: a poça e o arco-íris descendo */
export function charcoArcoIris(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 96, [[0x6a, 0x9a, 0xd0], [0xb0, 0xd0, 0xe8], [0xe8, 0xf0, 0xe8]]);
  const cores = ['#e04a3a', '#f08a2a', '#f0d040', '#5aa34a', '#3a7fd5', '#5a4aa8', '#9a5ac8'];
  cores.forEach((c, k) => {
    for (let a = 0; a <= Math.PI; a += 0.004) {
      const rr = 96 - k * 3;
      b.set(Math.round(120 + Math.cos(a) * rr), Math.round(112 - Math.sin(a) * rr * 0.9), c);
      b.set(Math.round(120 + Math.cos(a) * rr), Math.round(113 - Math.sin(a) * rr * 0.9), c);
    }
  });
  b.rect(0, 96, W, H - 96, '#4a6a3a');
  b.ellipse(120, 112, 70, 10, '#7aa0c8'); b.ellipse(116, 110, 40, 4, '#a8c8e8');
  b.rect(0, 70, 30, 30, '#5a5a5a'); b.rect(0, 70, 30, 2, '#7a7a7a');    // a quina do casarão
  return b;
}

/* --------------------------------------------- o Morro do Trovão */

/* o cume, no meio da nuvem: pedra rachada, chão chamuscado e o ninho do
   raio — uma coroa de pedra preta onde o raio cai sempre no mesmo lugar */
export function cumeTrovao(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, H, [[0x2a, 0x2a, 0x40], [0x4a, 0x4a, 0x5a], [0x5a, 0x5a, 0x60]]);
  nuvemPesada(b, 60, 20, 60); nuvemPesada(b, 190, 30, 50);
  b.rect(0, 78, W, H - 78, '#5a5a52');
  const r = rng(619);
  for (let i = 0; i < 160; i++) b.set((r() * W) | 0, 80 + ((r() * 78) | 0), i % 3 ? '#4a4a44' : '#6a6a60');
  // o ninho: a coroa de pedra preta
  b.ellipse(120, 92, 46, 12, '#2a2a2e'); b.ellipse(120, 90, 38, 8, '#3a3a3e');
  for (let k = 0; k < 9; k++) {
    const x = 80 + k * 10;
    b.tri(x - 4, 92, x + 4, 92, x, 76 - (k % 2) * 6, '#2a2a2e');
  }
  b.ellipse(120, 92, 20, 4, '#1a1a1e');
  raio(b, 122, 0, 9, 621);
  for (const [x, y] of [[30, 120], [200, 130]] as const) { b.ellipse(x, y, 14, 6, '#3a3a36'); b.line(x - 8, y - 2, x + 6, y + 3, '#2a2a26'); }
  return b;
}

/* ------------------------------------------- o Terreiro do Trovão */

/* o salão do Guaraci: madeira escura, tambores nas paredes, as cercas de
   raio entre as salas e o assento de pedra lá em cima. `calmo`: as cercas
   apagam e a luz entra pelo telhado */
export function salaoTrovao(): Buf { return salaoDoTrovao(false); }
export function salaoTrovaoCalmo(): Buf { return salaoDoTrovao(true); }

function salaoDoTrovao(calmo: boolean): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 56, calmo ? '#5a4a3a' : '#3a2e28');
  for (let x = 0; x < W; x += 12) b.rect(x, 0, 1, 56, '#2a1e18');
  // tambores pendurados nas paredes
  for (const x of [20, 48, 192, 220]) { b.ellipse(x, 24, 9, 12, '#6d4726'); b.ellipse(x, 14, 9, 3, '#e8d0a0'); b.line(x - 8, 18, x + 8, 32, '#c8a870'); b.line(x + 8, 18, x - 8, 32, '#c8a870'); }
  // o assento de pedra, e o cocar de penas gravado na parede atrás
  for (let k = -3; k <= 3; k++) b.line(120, 26, 120 + k * 8, 4, k % 2 ? P.bolt! : '#e8d0a0');
  b.rect(96, 30, 48, 8, P.rockD!); b.rect(96, 30, 48, 2, P.rock!); b.rect(104, 38, 32, 12, '#4a4a44');
  if (calmo) for (let y = 0; y < 56; y++) b.rect(110 - y / 4, y, 20 + y / 2, 1, y % 2 ? '#6a5a44' : '#625240');
  // o chão de tábua
  b.rect(0, 56, W, 60, calmo ? '#8a6a48' : '#6a4e36');
  for (let y = 60; y < 116; y += 7) b.rect(0, y, W, 1, '#4a3424');
  // as cercas de raio, de lado a lado
  for (const y of [70, 98]) {
    for (const x of [8, 232]) b.rect(x, y - 10, 3, 14, '#8a8a92');
    if (!calmo) for (let x = 11; x < 232; x += 2) { b.set(x, y - 6 + (x % 4 ? 0 : 1), P.bolt!); b.set(x, y + (x % 6 ? 0 : -1), '#fff4c0'); }
    else b.rect(11, y - 6, 221, 1, '#5a5a62');
  }
  b.rect(0, 116, W, H - 116, '#2a1e18');
  for (let x = 0; x < W; x += 16) b.rect(x, 116, 15, 1, '#4a3a2e');
  return b;
}

/* as Minas lá do outro lado, vistas do alto do Morro depois das pedras
   rachadas: o vale com as bocas de mina, o rio barrento e as dragas */
export function minasAoLonge(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x8a, 0xa8, 0xc8], [0xd8, 0xc8, 0xa8], [0xf0, 0xd8, 0xa0]]);
  morros(b, 50, 16, 0.03, 0.4, '#8a6a4a', 100);
  morros(b, 70, 10, 0.05, 1.8, '#7a5a3a', 120);
  // as bocas de mina na encosta
  for (const [x, y] of [[50, 74], [110, 80], [180, 72]] as const) {
    b.ellipse(x, y, 8, 7, '#2a1a10'); b.rect(x - 9, y - 8, 2, 14, '#6d4726'); b.rect(x + 8, y - 8, 2, 14, '#6d4726'); b.rect(x - 9, y - 9, 19, 2, '#6d4726');
  }
  // o rio barrento no fundo do vale, e a draga da Companhia
  b.rect(0, 100, W, 10, '#a8804a'); for (let x = 0; x < W; x += 9) b.rect(x, 103 + (x % 3), 5, 1, '#c8a060');
  b.rect(150, 92, 30, 10, '#c9a02a'); b.rect(160, 84, 10, 8, '#8d6f16'); b.rect(176, 78, 2, 14, '#3a3a3a');
  // a borda do cume na frente: pedra rachada partida
  b.rect(0, 118, W, H - 118, '#3a3a36');
  for (let x = 0; x < W; x += 20) { b.ellipse(x + 10, 118, 12, 5, '#4a4a44'); b.line(x + 4, 116, x + 14, 122, '#2a2a26'); }
  return b;
}

/* ---------------------------------------------------------- as peças */

/* a pedra-de-raio: lasca preta com o veio amarelo. 10×10 */
export function pedraRaio(): Buf {
  const b = new Buf(10, 10);
  b.tri(1, 9, 9, 9, 5, 0, '#2a2a2e'); b.tri(3, 9, 8, 9, 6, 2, '#3a3a40');
  b.line(5, 2, 4, 5, P.bolt!); b.line(4, 5, 6, 7, P.bolt!);
  return b;
}

/* o tambor grande dos tocadores: couro em cima, corda trançada. 20×18 */
export function tamborGrande(): Buf {
  const b = new Buf(20, 18);
  b.rect(2, 4, 16, 12, '#6d4726'); b.ellipse(10, 16, 8, 2, '#4a2e18');
  b.ellipse(10, 4, 8, 3, '#e8d0a0'); b.ellipse(9, 3, 4, 1, '#f8ecd0');
  for (let x = 3; x < 18; x += 3) { b.line(x, 6, x + 2, 15, '#c8a870'); }
  return b;
}
