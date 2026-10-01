/* =========================================================================
   REGIÃO 6 — as Minas da Caipora: os fundos das cutscenes, a pepita e a
   forquilha. O vale do garimpo de bateia, o rio barrento da draga da
   Companhia, o arraial, as galerias de trilho e a Cava Funda.
   ========================================================================= */
import { Buf, rng } from '../../core/buf.ts';
import { P } from '../palette.ts';
import { degrade, estrelas, morros, arvore, lembranca, placaMataSeca } from '../cenas.ts';

const W = 240, H = 160;

/* chão de terra vermelha de mina, com cascalho */
function chaoMina(b: Buf, y0: number, semente: number, cor = '#9a6a44'): void {
  b.rect(0, y0, b.w, H - y0, cor);
  const r = rng(semente);
  for (let i = 0; i < 220; i++) b.set((r() * b.w) | 0, y0 + ((r() * (H - y0)) | 0), i % 3 ? '#8a5a38' : '#b08058');
}

/* a boca de uma mina: o escuro com o madeiramento em volta */
function bocaDeMina(b: Buf, x: number, y: number, w: number, h: number): void {
  b.rect(x, y, w, h, '#1a120c');
  b.rect(x - 3, y - 4, 4, h + 4, '#6d4726'); b.rect(x + w - 1, y - 4, 4, h + 4, '#6d4726');
  b.rect(x - 5, y - 6, w + 10, 4, '#8a5a30'); b.rect(x - 5, y - 6, w + 10, 1, '#a0703c');
}

/* um trecho de trilho de vagonete, em perspectiva, de (x0,y0) a (x1,y1) */
function trilho(b: Buf, x0: number, y0: number, x1: number, y1: number, larg: number): void {
  for (let t = 0; t <= 1; t += 0.05) {
    const x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t);
    const m = Math.round(larg * (0.4 + 0.6 * t));
    b.rect(x - m - 1, y, 2 * m + 2, 2, '#5a3a20');
  }
  for (const s of [-1, 1]) {
    for (let t = 0; t <= 1; t += 0.01) {
      const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      b.set(Math.round(x + s * larg * (0.4 + 0.6 * t)), Math.round(y), '#9a9aa2');
    }
  }
}

/* um vagonete de minério. Desenhado no fundo */
function vagonete(b: Buf, x: number, y: number, cheio = true): void {
  b.rect(x, y, 26, 14, '#5a5a62'); b.rect(x, y, 26, 2, '#7a7a82'); b.rect(x + 2, y + 4, 22, 1, '#4a4a52');
  if (cheio) { b.ellipse(x + 13, y, 11, 4, '#7a5a3a'); b.set(x + 8, y - 2, P.gold!); b.set(x + 16, y - 1, P.gold!); }
  b.circle(x + 6, y + 15, 3, '#2a2a2e'); b.circle(x + 20, y + 15, 3, '#2a2a2e');
}

/* ------------------------------------------------- a Boca da Mina */

/* o vale do garimpo: o riacho limpo, as bateias secando na pedra, a boca
   da mina velha na encosta e as barracas de lona */
export function valeMina(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x6a, 0xa8, 0xd8], [0xc8, 0xd8, 0xd0], [0xf0, 0xe0, 0xb0]]);
  morros(b, 46, 18, 0.03, 0.6, '#8a6a4a', 90);
  morros(b, 66, 8, 0.05, 2.0, '#6a8a4a', 90);
  chaoMina(b, 82, 701);
  bocaDeMina(b, 30, 62, 22, 20);
  // as barracas de lona
  for (const [x, c] of [[180, '#c8b070'], [210, '#a8c0a0']] as const) {
    b.tri(x - 14, 92, x + 14, 92, x, 70, c); b.tri(x - 3, 92, x + 3, 92, x, 80, '#3a2a1a');
  }
  // o riacho, limpo, com a ponte de tábua
  b.rect(0, 100, W, 10, P.water!); for (let x = 0; x < W; x += 7) b.rect(x, 102 + (x % 3), 4, 1, P.waterL!);
  b.rect(96, 98, 24, 14, '#8a5a30'); for (let x = 96; x < 120; x += 4) b.rect(x, 98, 1, 14, '#6d4726');
  // as bateias secando
  for (const x of [60, 150]) { b.ellipse(x, 94, 9, 3, '#6d4726'); b.ellipse(x, 93, 6, 1, '#4a2e18'); }
  return b;
}

/* a draga da Companhia no rio: água barrenta, a máquina amarela, o monte
   de lama revirada e a placa */
export function dragaCompanhia(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x9a, 0x90, 0x88], [0xc0, 0xb0, 0x98]]);
  morros(b, 58, 10, 0.04, 1.0, '#7a6050', 90);
  chaoMina(b, 74, 703, '#8a6a4a');
  // o rio barrento
  b.rect(0, 92, W, 30, '#a8804a');
  const r = rng(705);
  for (let i = 0; i < 40; i++) b.rect((r() * W) | 0, 94 + ((r() * 26) | 0), 6, 1, i % 2 ? '#c8a060' : '#8a6a3a');
  // a draga, com a esteira de caçambas
  b.rect(120, 70, 70, 26, '#c9a02a'); b.rect(120, 70, 70, 3, '#e8c450'); b.rect(120, 92, 70, 4, '#8d6f16');
  b.rect(150, 52, 22, 18, '#8d6f16'); b.rect(154, 56, 14, 8, '#5a7080');
  b.rect(180, 40, 3, 30, '#3a3a3a');
  for (let k = 0; k < 7; k++) { const x = 116 - k * 8, y = 80 + k * 4; b.rect(x - 4, y, 7, 5, '#6a6a6a'); }
  b.line(116, 82, 64, 108, '#4a4a4a');
  // o monte de lama na margem
  b.ellipse(40, 86, 34, 10, '#6a4a2a'); b.ellipse(36, 82, 20, 6, '#7a5a34');
  placaMataSeca(b, 8, 40);
  return b;
}

/* o garimpo de antigamente, na lembrança da Garimpeira: a avó dela com a
   bateia no rio limpo, e a mata ainda inteira na encosta */
export function garimpoAntigo(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0xe8, 0xb0, 0x70], [0xf4, 0xd8, 0xa0]]);
  morros(b, 52, 14, 0.03, 0.6, '#5a7a3a', 96);
  for (let x = -4; x < W + 6; x += 12) arvore(b, x, 80 + ((x * 3) % 6), 26 + ((x * 7) % 8), P.tree!, P.treeD!, P.treeL!);
  chaoMina(b, 84, 707, '#b08a5a');
  b.rect(0, 100, W, 14, P.water!); for (let x = 0; x < W; x += 6) b.rect(x, 104 + (x % 4), 4, 1, P.waterL!);
  // a avó, de silhueta, curvada sobre a bateia dentro do rio
  const c = '#3a2410';
  b.circle(120, 86, 3, c); b.rect(117, 89, 7, 8, c); b.line(118, 92, 112, 100, c); b.line(123, 92, 128, 100, c);
  b.ellipse(120, 101, 10, 3, '#6d4726'); b.set(118, 100, P.gold!);
  return lembranca(b, '#3a2410');
}

/* -------------------------------------------- o Arraial da Caipora */

/* a rua do arraial no fim da tarde: casas de tábua, lampião aceso, os
   trilhos velhos atravessando a rua e um vagonete parado */
export function arraialCaipora(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x4a, 0x3a, 0x6a], [0xc0, 0x7a, 0x6a], [0xf0, 0xb8, 0x80]]);
  morros(b, 50, 14, 0.03, 0.8, '#5a4038', 90);
  chaoMina(b, 90, 709);
  for (const [x, w, h, c] of [[8, 50, 40, '#8a6a48'], [66, 40, 34, '#7a5a3a'], [150, 46, 42, '#8a6a48'], [202, 40, 32, '#7a5a3a']] as const) {
    const y = 90 - h;
    b.rect(x, y, w, h, c);
    for (let k = x; k < x + w; k += 5) b.rect(k, y, 1, h, '#5a4028');
    b.tri(x - 3, y, x + w + 3, y, x + w / 2, y - 12, '#4a3a3a');
    b.rect(x + 6, y + 10, 9, 8, '#f8c060'); b.rect(x + w - 14, y + h - 16, 9, 16, '#3a2410');
  }
  // o lampião no poste
  b.rect(124, 46, 2, 44, '#3a2a20'); b.rect(120, 42, 10, 6, '#3a2a20'); b.rect(122, 43, 6, 4, P.fireL!);
  trilho(b, 120, 92, 120, 150, 18);
  vagonete(b, 186, 96);
  return b;
}

/* dentro das Galerias: o túnel escorado, o trilho sumindo no escuro, a
   lanterna pendurada e o vagonete tombado */
export function galeriaMina(): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, H, '#140e0a');
  // o túnel, em arcos de escora cada vez menores
  for (let k = 0; k < 6; k++) {
    const m = 110 - k * 16, top = 6 + k * 10, base = 132 - k * 7;
    b.rect(120 - m, top, 2 * m, base - top, k % 2 ? '#2a1e16' : '#241a12');
    b.rect(120 - m, top, 5, base - top, '#6d4726'); b.rect(120 + m - 5, top, 5, base - top, '#6d4726');
    b.rect(120 - m, top, 2 * m, 4, '#8a5a30');
  }
  b.rect(104, 66, 32, 30, '#0a0806');
  trilho(b, 120, 92, 120, 160, 30);
  // a lanterna pendurada
  b.line(60, 14, 60, 30, '#3a2a20'); b.rect(56, 30, 8, 9, '#3a2a20'); b.rect(58, 32, 4, 5, P.fireL!);
  for (let y = 40; y < 110; y += 2) b.rect(60 - (y - 40) / 3, y, (y - 40) / 1.5 + 2, 1, y % 4 ? '#2e2218' : '#32261a');
  // o vagonete tombado na lateral
  b.rect(176, 104, 26, 14, '#5a5a62'); b.rect(176, 104, 2, 14, '#7a7a82'); b.ellipse(170, 116, 8, 3, '#7a5a3a');
  return b;
}

/* --------------------------------------------------- a Cava Funda */

/* a cava em espiral, vista da borda: anéis de rocha descendo até o fundo
   escuro, onde um olho só brilha */
export function cavaFunda(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 40, [[0x8a, 0x70, 0x60], [0xb0, 0x90, 0x70]]);
  b.rect(0, 30, W, H - 30, '#6a4a32');
  for (let k = 0; k < 6; k++) {
    const rx = 120 - k * 18, ry = 52 - k * 8;
    b.ellipse(120, 88 + k * 4, rx, ry, k % 2 ? '#5a3e2a' : '#7a5636');
    b.ellipse(120, 88 + k * 4 - ry + 2, rx - 4, 2, k % 2 ? '#7a5636' : '#8a6644');
  }
  b.ellipse(120, 112, 16, 6, '#120c08');
  const r = rng(711);
  for (let i = 0; i < 80; i++) b.set((r() * W) | 0, 40 + ((r() * 110) | 0), '#4a3424');
  return b;
}

/* --------------------------------------------- o Terreiro da Pedra */

/* o salão do Ubirajara: parede de rocha com veio de cristal, o trilho no
   chão, e o trono de pedra lá em cima. `calmo`: a poeira assenta, e os
   cristais acendem */
export function salaoPedra(): Buf { return salaoDePedra(false); }
export function salaoPedraCalmo(): Buf { return salaoDePedra(true); }

function salaoDePedra(calmo: boolean): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 56, '#5a4a40');
  const r = rng(calmo ? 713 : 715);
  for (let i = 0; i < 40; i++) b.ellipse((r() * W) | 0, (r() * 56) | 0, 10 + ((r() * 10) | 0), 4, i % 2 ? '#6a5a4c' : '#4a3c34');
  // os cristais na parede
  for (const [x, y] of [[24, 20], [60, 34], [180, 24], [214, 38]] as const) {
    b.tri(x - 5, y + 10, x + 5, y + 10, x, y - 6, calmo ? '#a8e8f0' : '#6a8a90');
    b.tri(x - 1, y + 10, x + 7, y + 10, x + 4, y, calmo ? '#e8ffff' : '#8aa8b0');
  }
  // o trono de pedra
  b.rect(96, 30, 48, 6, P.rockD!); b.rect(96, 30, 48, 2, P.rock!);
  b.rect(100, 12, 6, 18, P.rockD!); b.rect(134, 12, 6, 18, P.rockD!); b.rect(96, 36, 48, 14, '#4a4440');
  // o chão de cascalho com o trilho
  b.rect(0, 56, W, 60, calmo ? '#8a6a4c' : '#6a4e38');
  for (let i = 0; i < 80; i++) b.set((r() * W) | 0, 58 + ((r() * 56) | 0), calmo ? '#9a7a5a' : '#5a4030');
  for (let x = 0; x < W; x += 8) b.rect(x, 96, 4, 8, '#5a3a20');
  b.rect(0, 97, W, 1, '#9a9aa2'); b.rect(0, 103, W, 1, '#9a9aa2');
  if (!calmo) for (let i = 0; i < 30; i++) b.set((r() * W) | 0, 58 + ((r() * 56) | 0), '#c8b8a0');   // a poeira no ar
  b.rect(0, 116, W, H - 116, '#3a302a');
  for (let x = 0; x < W; x += 16) b.rect(x, 116, 15, 1, '#5a4a40');
  return b;
}

/* a serra da Caipora de antigamente, na lembrança do Ubirajara: mata em
   cima, ouro dormindo embaixo, e ninguém cavando */
export function montanhaAntiga(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 60, [[0x6a, 0xa8, 0xd8], [0xb8, 0xe0, 0xf0]]);
  b.tri(-20, 70, 260, 70, 120, 6, '#4a7a3a');
  for (let x = 10; x < W - 10; x += 10) {
    const topo = 70 - Math.max(0, 60 - Math.abs(x - 120) * 0.55);
    arvore(b, x, Math.round(topo + 14), 14, P.tree!, P.treeD!, P.treeL!);
  }
  // o corte da terra, com o ouro dormindo nos veios
  b.rect(0, 70, W, 56, '#8a5a38');
  for (let y = 74; y < 124; y += 6) b.rect(0, y, W, 2, y % 12 ? '#7a4a2e' : '#9a6a44');
  const r = rng(717);
  for (let i = 0; i < 26; i++) { const x = (r() * W) | 0, y = 76 + ((r() * 46) | 0); b.rect(x, y, 3, 2, P.gold!); b.set(x, y, '#fff0a0'); }
  b.rect(0, 124, W, H - 124, '#5a3a24');
  return lembranca(b, '#2a1608');
}

/* o Bairro da Cuca lá do outro lado, depois da terra desmoronada: casarões
   de janela alta, a lua cheia e o telhado torto do Casarão */
export function cucaAoLonge(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 100, [[0x0e, 0x0c, 0x1e], [0x24, 0x1e, 0x3a], [0x3a, 0x2a, 0x4a]]);
  estrelas(b, 719, 40, 60);
  b.circle(186, 28, 14, '#f0ecd8'); b.circle(182, 25, 3, '#d8d0b8'); b.circle(190, 32, 2, '#d8d0b8');
  // os casarões de silhueta, com uma janela ou outra acesa
  const c = '#120e1a';
  for (const [x, w, h] of [[0, 34, 46], [36, 30, 38], [68, 40, 54], [112, 26, 34], [140, 50, 62], [192, 48, 44]] as const) {
    const y = 104 - h;
    b.rect(x, y, w, h, c); b.tri(x - 2, y, x + w + 2, y, x + w / 2, y - 12, c);
    if ((x / 2) % 3 === 0) b.rect(x + 6, y + 10, 5, 8, '#c8a050');
  }
  b.line(170, 30, 160, 40, c); // o telhado torto do Casarão
  // a borda da cava na frente, terra desmoronada aberta
  b.rect(0, 104, W, H - 104, '#3a2a1e');
  for (let x = 0; x < W; x += 14) b.ellipse(x + 7, 104, 9, 4, '#4a3624');
  return b;
}

/* ---------------------------------------------------------- as peças */

/* a pepita de ouro, do tamanho de uma unha. 8×6 */
export function pepita(): Buf {
  const b = new Buf(8, 6);
  b.ellipse(4, 3, 3, 2, P.goldD!); b.ellipse(3, 2, 2, 1, P.gold!); b.set(2, 1, '#fff0a0');
  return b;
}

/* a forquilha de radiestesia: um galho em Y. 12×14 */
export function forquilha(): Buf {
  const b = new Buf(12, 14);
  b.line(6, 13, 6, 7, '#8a5a30'); b.line(6, 7, 1, 0, '#8a5a30'); b.line(6, 7, 11, 0, '#8a5a30');
  b.line(7, 13, 7, 7, '#6d4726');
  return b;
}
