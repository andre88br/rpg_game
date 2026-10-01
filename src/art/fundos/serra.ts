/* =========================================================================
   REGIÃO 3 — a Serra Boitatá: os fundos das cutscenes e as peças miúdas
   (o pote de carvão, o sino de bronze, a candeia).

   Mesmo contrato de art/cenas.ts: 240×160, a faixa de baixo (y ≥ 122) é da
   legenda, então o que importa mora acima dela.
   ========================================================================= */
import { Buf, rng } from '../../core/buf.ts';
import { P } from '../palette.ts';
import { degrade, estrelas, morros, arvore, lembranca, placaMataSeca } from '../cenas.ts';

const W = 240, H = 160;

/* chão de cinza batida da serra, com pedrisco e capim seco */
export function chaoSerra(b: Buf, y0: number, semente: number, cor = '#8a7a6a'): void {
  b.rect(0, y0, b.w, H - y0, cor);
  const r = rng(semente);
  for (let i = 0; i < 260; i++) {
    const c = i % 4 === 0 ? '#c8a858' : i % 3 === 0 ? '#6a5a4c' : '#9a8a78';
    b.set((r() * b.w) | 0, y0 + ((r() * (H - y0)) | 0), c);
  }
}

/* um tufo de capim seco */
export function capimSeco(b: Buf, x: number, y: number, alt = 8): void {
  for (let k = -4; k <= 4; k += 2) {
    const a = alt - Math.abs(k);
    b.line(x + k, y, x + k + (k > 0 ? 2 : k < 0 ? -2 : 0), y - a, k % 4 ? '#a8883a' : '#c8a858');
  }
}

/* uma pedra solta, com o brilho no alto */
export function pedra(b: Buf, x: number, y: number, rx: number, ry: number): void {
  b.ellipse(x, y, rx, ry, P.rockD!); b.ellipse(x - 1, y - 2, rx - 2, ry - 2, P.rock!);
  b.ellipse(x - rx / 3, y - ry / 2, Math.max(1, rx / 4), Math.max(1, ry / 4), '#b8aca0');
}

/* rachaduras de brasa numa parede ou num chão escuro */
function veiasBrasa(b: Buf, x0: number, y0: number, w: number, h: number, n: number, semente: number): void {
  const r = rng(semente);
  for (let i = 0; i < n; i++) {
    let x = x0 + ((r() * w) | 0), y = y0 + ((r() * h) | 0);
    for (let k = 0; k < 5; k++) {
      const nx = x + ((r() * 9) | 0) - 4, ny = y + 2 + ((r() * 4) | 0);
      b.line(x, y, nx, ny, k % 2 ? P.fire! : P.fireD!);
      x = nx; y = ny;
    }
    b.set(x, y, P.fireL!);
  }
}

/* uma mula de carga, de perfil para a direita, com as duas bruacas */
function mulaCarga(b: Buf, x: number, y: number, cor: string, carga: string): void {
  b.rect(x, y, 18, 8, cor);                                    // o corpo
  b.rect(x + 16, y - 6, 5, 8, cor); b.rect(x + 19, y - 7, 6, 4, cor);   // pescoço e cabeça
  b.set(x + 17, y - 9, cor); b.set(x + 19, y - 9, cor);         // as orelhas
  for (const px of [x + 1, x + 4, x + 13, x + 16]) b.rect(px, y + 8, 2, 7, cor);
  b.line(x, y + 1, x - 3, y + 7, cor);                         // o rabo
  b.rect(x + 3, y - 4, 11, 6, carga); b.rect(x + 3, y + 3, 11, 6, carga);   // as bruacas
  b.rect(x + 3, y - 4, 11, 1, '#e8d0a0');
}

/* ------------------------------------------------- a Trilha da Brasa */

/* a trilha subindo a serra em ziguezague, no sol da tarde: capim seco,
   pedra solta, e a fumaça da serra lá no alto */
export function trilhaSerra(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x7a, 0xa8, 0xd8], [0xe8, 0xc0, 0x90], [0xf0, 0xd8, 0xa8]]);
  // a serra lá atrás, com a fumaça que não apaga
  morros(b, 46, 18, 0.025, 0.4, '#8a6a6a', 90);
  for (let k = 0; k < 6; k++) b.ellipse(150 + k * 6, 22 - k * 4, 8 + k * 2, 3 + k, k % 2 ? '#a89090' : '#b8a0a0');
  b.ellipse(148, 26, 6, 2, '#e05a2a');
  morros(b, 70, 10, 0.04, 2.0, '#9a8072', 100);
  chaoSerra(b, 82, 401);
  // a trilha em ziguezague, de terra mais clara
  const zz: [number, number][] = [[20, 84], [200, 94], [40, 106], [220, 120], [120, 140]];
  for (let i = 0; i + 1 < zz.length; i++) {
    const [x0, y0] = zz[i]!, [x1, y1] = zz[i + 1]!;
    for (let t = 0; t <= 1; t += 0.01) {
      const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      b.rect(Math.round(x) - 6 - i * 2, Math.round(y), 12 + i * 4, 2, '#b8a07a');
    }
  }
  for (const [x, y, rx, ry] of [[14, 98, 9, 6], [228, 104, 10, 7], [100, 92, 5, 3], [170, 112, 7, 5]] as const) pedra(b, x, y, rx, ry);
  for (const [x, y] of [[60, 90], [150, 100], [30, 118], [200, 132], [90, 128]] as const) capimSeco(b, x, y);
  return b;
}

/* a tropa de antigamente, na lembrança do Chefe: mula atrás de mula, com
   bruaca de sal e de panela, subindo a mesma trilha */
export function tropaAntiga(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0xe0, 0xa8, 0x70], [0xf0, 0xd0, 0x98]]);
  morros(b, 60, 14, 0.03, 1.1, '#b08a70', 100);
  chaoSerra(b, 96, 403, '#a08a70');
  b.rect(0, 100, W, 10, '#c8b088');
  for (let k = 0; k < 6; k++) mulaCarga(b, 8 + k * 38, 86, k % 2 ? '#5a4a3a' : '#6d5a48', k % 3 ? '#c8a060' : '#a8703a');
  // o madrinheiro na frente, com o cincerro no pescoço da primeira
  b.circle(232, 88, 2, '#d8c040');
  for (const [x, y] of [[20, 120], [120, 116], [200, 124]] as const) capimSeco(b, x, y, 10);
  return lembranca(b, '#3a2010');
}

/* meia-laranja: só a metade de cima de uma elipse, assentada em `base` */
function cupula(b: Buf, cx: number, base: number, rx: number, ry: number, cor: string): void {
  for (let y = base - ry; y < base; y++) {
    const meia = Math.round(rx * Math.sqrt(1 - ((base - y) / ry) ** 2));
    b.rect(cx - meia, y, meia * 2, 1, cor);
  }
}

/* a carvoaria da Companhia: fornos de barro em fileira, fumaça grossa, tocos
   onde antes era mata, a pilha de lenha e a placa da Mata-Seca */
export function carvoaria(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0x5a, 0x4a, 0x4a], [0x9a, 0x7a, 0x6a], [0xb8, 0x98, 0x80]]);
  for (const [x, y] of [[40, 30], [110, 22], [180, 34]] as const) {
    b.ellipse(x, y, 30, 8, '#6a5a5a'); b.ellipse(x + 10, y - 6, 18, 6, '#7a6a68');
  }
  morros(b, 70, 6, 0.05, 0.3, '#5a4a44', 90);
  chaoSerra(b, 78, 405, '#6a5a4c');
  // tocos da mata que virou carvão
  for (const x of [12, 70, 132, 214, 228]) { b.rect(x, 80, 8, 6, P.trunkD!); b.ellipse(x + 4, 80, 4, 1, '#8a6a48'); }
  // os fornos: meia-laranja de barro, boca acesa
  for (const x of [30, 90, 150]) {
    cupula(b, x, 104, 24, 24, '#8a4a2a'); cupula(b, x - 4, 104, 18, 19, '#a85a32');
    b.rect(x - 24, 104, 48, 2, '#5a4a40');                                // a sombra no chão
    b.ellipse(x, 98, 6, 5, '#2a1a10'); b.ellipse(x, 99, 4, 3, P.fire!); b.set(x, 99, P.fireL!);
    b.rect(x - 2, 78, 4, 3, '#5a3a2a');                                // o respiro
  }
  // a pilha de lenha cortada
  for (let k = 0; k < 4; k++) for (let i = 0; i < 5 - k; i++) {
    b.ellipse(196 + i * 8 + k * 4, 112 - k * 6, 4, 3, '#8a6a48'); b.ellipse(196 + i * 8 + k * 4, 112 - k * 6, 2, 1, '#c9a06a');
  }
  placaMataSeca(b, 170, 50);
  return b;
}

/* ------------------------------------------------------------ a Forja */

/* a forja do Ferreiro: parede de pedra, a fornalha no fundo, a bigorna no
   meio, ferramentas penduradas e o fole de couro. `acesa` muda tudo de cor */
export function forjaFria(): Buf { return forja(false); }
export function forjaAcesa(): Buf { return forja(true); }

function forja(acesa: boolean): Buf {
  const b = new Buf(W, H);
  // parede de pedra
  b.rect(0, 0, W, 84, acesa ? '#5a4038' : '#3a3438');
  for (let y = 0; y < 84; y += 10) for (let x = -((y / 10) % 2) * 10; x < W; x += 20) {
    b.rect(x + 1, y + 1, 18, 8, acesa ? '#6a4a40' : '#4a4448'); b.rect(x + 1, y + 1, 18, 1, acesa ? '#8a6050' : '#5a5458');
  }
  // a fornalha, de tijolo, com a boca
  b.rect(150, 18, 70, 66, '#6a3a2a'); b.rect(150, 18, 70, 4, '#8a4a32');
  b.tri(150, 18, 220, 18, 185, 0, '#5a3226');
  b.ellipse(185, 60, 20, 16, '#1a1010');
  if (acesa) {
    b.ellipse(185, 64, 17, 11, P.fireD!); b.ellipse(185, 66, 13, 8, P.fire!); b.ellipse(185, 68, 8, 4, P.fireL!);
    for (let y = 84; y < 122; y += 2) b.rect(150 - (y - 84) / 2, y, 70 + (y - 84), 1, y % 4 ? '#7a4a30' : '#6a4030');
  } else {
    for (const [x, y] of [[178, 66], [188, 68], [194, 64]] as const) b.ellipse(x, y, 4, 2, '#2a2a2a');
  }
  // o fole de couro, encostado
  b.tri(108, 70, 140, 62, 140, 78, '#6a4a2a'); b.line(108, 70, 140, 70, '#4a2e18');
  b.rect(100, 68, 10, 4, '#8a8a8a');
  // ferramentas penduradas
  for (const [x, c] of [[20, '#8a8a8a'], [34, '#9a9a9a'], [48, '#7a7a7a'], [62, '#8a8a8a']] as const) {
    b.rect(x, 14, 2, 26, '#6d4726'); b.rect(x - 3, 38, 8, 5, c);
  }
  // o chão de terra batida
  b.rect(0, 84, W, H - 84, acesa ? '#6a4a34' : '#4a3a30');
  const r = rng(411);
  for (let i = 0; i < 90; i++) b.set((r() * W) | 0, 86 + ((r() * 70) | 0), acesa ? '#8a6040' : '#5a4a3c');
  // a bigorna no toco
  b.rect(96, 94, 18, 14, P.trunkD!); b.ellipse(105, 94, 9, 2, '#8a6a48');
  b.rect(90, 84, 30, 6, '#4a4a52'); b.rect(90, 84, 30, 1, acesa ? '#e8a060' : '#7a7a82');
  b.tri(120, 84, 132, 86, 120, 89, '#4a4a52'); b.rect(100, 90, 10, 4, '#3a3a42');
  // o balde de têmpera
  b.rect(222, 96, 14, 14, '#6a6a6a'); b.rect(223, 97, 12, 2, acesa ? '#e8a060' : '#3a5a7a');
  return b;
}

/* a Vila Fornalha de noite, com as chaminés soltando fumaça de novo e as
   janelas acesas: o martelo voltou a bater */
export function vilaFornalhaNoite(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 80, [[0x14, 0x10, 0x2a], [0x3a, 0x22, 0x3a], [0x7a, 0x3a, 0x30]]);
  estrelas(b, 413, 30, 50);
  morros(b, 56, 16, 0.03, 0.6, '#2a1e28', 90);
  chaoSerra(b, 96, 415, '#5a4a40');
  // as casas de pedra, cada uma com a chaminé
  for (const [x, w, h] of [[10, 50, 34], [70, 44, 40], [124, 56, 30], [190, 44, 38]] as const) {
    const y = 96 - h;
    b.rect(x, y, w, h, '#5a5058'); b.rect(x, y, w, 2, '#7a7078');
    b.tri(x - 4, y, x + w + 4, y, x + w / 2, y - 14, '#6a3226');
    b.rect(x + w - 12, y - 20, 7, 14, '#4a4048');
    for (let k = 0; k < 4; k++) b.ellipse(x + w - 8 + k * 3, y - 26 - k * 7, 4 + k * 2, 2 + k, k % 2 ? '#5a4a52' : '#6a5a60');
    b.rect(x + 8, y + 12, 8, 8, '#f8c060'); b.rect(x + 8, y + 15, 8, 1, '#5a5058');
    b.rect(x + w / 2 - 4, y + h - 14, 9, 14, '#3a2a20');
  }
  // o clarão da forja, no fundo da rua
  b.ellipse(120, 110, 50, 8, '#7a4a34'); b.ellipse(120, 110, 24, 4, '#9a5a3a');
  return b;
}

/* ------------------------------------------------------ a caverna */

/* a boca da Caverna do Boitatá, no fim da vila: a rocha rachada de brasa e
   a tranca de pau atravessada na frente */
export function bocaCaverna(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 40, [[0xa8, 0x7a, 0x6a], [0xd8, 0xa8, 0x88]]);
  // o paredão de rocha
  b.rect(0, 16, W, 80, '#6a5a52');
  const rr = rng(417);
  for (let i = 0; i < 30; i++) {
    const r = rr;
    const x = (r() * W) | 0, y = 18 + ((r() * 70) | 0);
    b.ellipse(x, y, 12 + ((r() * 10) | 0), 5, i % 2 ? '#7a6a60' : '#5a4c46');
  }
  veiasBrasa(b, 0, 20, W, 60, 10, 419);
  // a boca, escura, com o bafo quente
  b.ellipse(120, 82, 40, 34, '#1a1010'); b.rect(80, 82, 80, 16, '#1a1010');
  b.ellipse(120, 92, 24, 10, '#3a1a14');
  chaoSerra(b, 96, 421);
  // a tranca de pau atravessada, com dois moirões
  b.rect(80, 92, 3, 18, P.trunkD!); b.rect(158, 92, 3, 18, P.trunkD!);
  b.rect(74, 96, 92, 5, P.trunk!); b.rect(74, 96, 92, 1, '#8a5a30');
  for (const [x, y] of [[30, 112], [210, 116]] as const) capimSeco(b, x, y, 9);
  pedra(b, 20, 104, 10, 6); pedra(b, 222, 100, 8, 5);
  return b;
}

/* a gruta funda do Boitatá: o escuro, as veias de brasa nas paredes e o
   chão de carvão que brilha. `ouro`: o canto da Mãe-do-Ouro, com a luz
   dourada descendo do teto */
export function grutaBrasa(): Buf { return gruta(false); }
export function grutaOuro(): Buf { return gruta(true); }

function gruta(ouro: boolean): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, H, '#140c0c');
  // a abóbada, em camadas
  for (let k = 0; k < 4; k++) b.ellipse(120, -10 + k * 6, 150 - k * 14, 60 - k * 8, ['#2a1c1a', '#241816', '#1e1412', '#180e0c'][k]!);
  veiasBrasa(b, 0, 0, W, 90, ouro ? 6 : 16, ouro ? 423 : 425);
  // estalactites
  const r = rng(427);
  for (let x = 6; x < W; x += 14 + ((r() * 10) | 0)) b.tri(x, 0, x + 8, 0, x + 4, 14 + ((r() * 18) | 0), '#2a1e1c');
  // o chão de carvão
  b.rect(0, 92, W, H - 92, '#2a2020');
  for (let i = 0; i < 160; i++) b.set((r() * W) | 0, 92 + ((r() * 66) | 0), i % 5 ? '#3a2e2c' : P.fireD!);
  for (const [x, y] of [[30, 100], [200, 104], [90, 112]] as const) pedra(b, x, y, 9, 5);
  if (ouro) {
    // o feixe dourado que desce do teto até o chão
    for (let y = 0; y < 110; y++) {
      const meia = 6 + y / 6;
      b.rect(Math.round(120 - meia), y, Math.round(meia * 2), 1, y % 3 ? '#4a3a1a' : '#5a4a1e');
    }
    b.ellipse(120, 108, 26, 5, '#8a7020'); b.ellipse(120, 108, 14, 3, P.gold!);
    for (let i = 0; i < 24; i++) b.set(100 + ((r() * 40) | 0), 10 + ((r() * 96) | 0), P.goldD!);
  }
  return b;
}

/* ------------------------------------------------------ a cumeeira */

/* o alto da serra de noite: o anel de lava, a pedra preta e o céu vermelho
   de cinza. É aqui que a Mula corre */
export function cumeeiraNoite(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x14, 0x0c, 0x1a], [0x3a, 0x14, 0x1a], [0x6a, 0x22, 0x1a]]);
  estrelas(b, 431, 20, 40);
  morros(b, 66, 8, 0.05, 0.2, '#1e1418', 90);
  b.rect(0, 80, W, H - 80, '#2a2228');
  const r = rng(433);
  for (let i = 0; i < 160; i++) b.set((r() * W) | 0, 80 + ((r() * 78) | 0), i % 2 ? '#3a3036' : '#1e181c');
  // o rio de lava atravessando o platô
  for (let x = 0; x < W; x++) {
    const y = Math.round(104 + 6 * Math.sin(x * 0.04) + 3 * Math.sin(x * 0.11));
    b.rect(x, y, 1, 10, P.fireD!); b.rect(x, y + 2, 1, 6, P.fire!); if (x % 7 < 3) b.set(x, y + 4, P.fireL!);
  }
  for (const [x, y, rx, ry] of [[30, 92, 12, 7], [200, 90, 14, 8], [120, 86, 6, 4], [60, 136, 14, 7], [190, 140, 12, 6]] as const) {
    b.ellipse(x, y, rx, ry, '#141014'); b.ellipse(x - 1, y - 2, rx - 2, ry - 2, '#3a3438');
  }
  return b;
}

/* ------------------------------------------------ o Terreiro de Brasa */

/* o salão do Brás: parede de tijolo, braseiros nas colunas, o altar de
   bigorna lá no alto, e o chão de cinza rachado de brasa. `calmo`: depois
   da luta, a brasa assenta e fica dourada */
export function salaoBrasa(): Buf { return salaoDeBrasa(false); }
export function salaoBrasaCalmo(): Buf { return salaoDeBrasa(true); }

function salaoDeBrasa(calmo: boolean): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 56, '#4a2420');
  for (let y = 0; y < 56; y += 7) for (let x = -((y / 7) % 2) * 8; x < W; x += 16) {
    b.rect(x + 1, y + 1, 14, 5, '#5a2c24'); b.rect(x + 1, y + 1, 14, 1, '#6a3a2e');
  }
  // as colunas com o braseiro em cima
  for (const x of [26, 214]) {
    b.rect(x - 6, 14, 12, 50, '#3a1c18'); b.rect(x - 6, 14, 3, 50, '#4a2620');
    b.ellipse(x, 14, 10, 4, '#2a1410');
    b.tri(x - 7, 13, x + 7, 13, x, calmo ? 6 : 0, calmo ? '#d8a030' : P.fire!);
    b.tri(x - 4, 13, x + 4, 13, x, calmo ? 8 : 4, P.fireL!);
  }
  // o altar de bigorna, lá no alto, onde o Brás espera
  b.rect(90, 30, 60, 10, '#3a2a28'); b.rect(90, 30, 60, 2, calmo ? '#e8c060' : '#e07a3a');
  b.rect(100, 40, 40, 6, '#2a1e1c'); b.rect(96, 46, 48, 6, '#3a2a28');
  // o chão de cinza, rachado de brasa
  b.rect(0, 56, W, 60, calmo ? '#5a4a40' : '#3a2e2a');
  const r = rng(calmo ? 441 : 443);
  for (let i = 0; i < 100; i++) b.set((r() * W) | 0, 58 + ((r() * 56) | 0), calmo ? '#6a5a4c' : '#4a3c36');
  for (let i = 0; i < (calmo ? 30 : 14); i++) {
    const x = (r() * W) | 0, y = 60 + ((r() * 50) | 0);
    if (calmo) { b.set(x, y, P.gold!); b.set(x + 1, y, P.goldD!); }
    else { b.line(x, y, x + 6 + ((r() * 8) | 0), y + ((r() * 4) | 0) - 2, P.fire!); b.set(x, y, P.fireL!); }
  }
  b.rect(0, 116, W, H - 116, '#2a1e1c');
  for (let x = 0; x < W; x += 16) b.rect(x, 116, 15, 1, '#4a3a36');
  return b;
}

/* o Boitatá da serra, na lembrança do Brás: a cobra de fogo enrolada no
   alto, de noite, guardando a mata que ainda havia na encosta */
export function serraAntiga(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 90, [[0x14, 0x10, 0x2a], [0x2a, 0x22, 0x4a], [0x4a, 0x30, 0x4a]]);
  estrelas(b, 445, 50, 70);
  morros(b, 60, 26, 0.02, 0.9, '#1e1a2a', 110);
  // a mata cobrindo a encosta inteira
  for (let x = -4; x < W + 8; x += 10) arvore(b, x, 100 + ((x * 7) % 8), 24 + ((x * 3) % 10), '#1f3a22', '#142818', '#2a4a2a', '#140e0a');
  b.rect(0, 108, W, H - 108, '#142818');
  return lembranca(b, '#2a0a0a');
}

/* o Campo do Saci visto do vão novo no muro da cumeeira: um mar de capim
   dourado, cataventos girando e o vento desenhado no ar */
export function campoAoLonge(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x6a, 0xb0, 0xe8], [0xb8, 0xe0, 0xf4], [0xf0, 0xf4, 0xe0]]);
  for (const [x, y] of [[40, 18], [150, 12], [210, 26]] as const) { b.ellipse(x, y, 18, 4, '#ffffff'); b.ellipse(x + 10, y - 3, 10, 4, '#ffffff'); }
  morros(b, 70, 4, 0.04, 0.6, '#9ac080', 90);
  // o capim, em faixas que o vento penteia
  b.rect(0, 76, W, 50, '#c8b860');
  for (let y = 78; y < 126; y += 3) for (let x = (y * 7) % 11; x < W; x += 11) b.line(x, y, x + 4, y - 2, y % 2 ? '#e0d080' : '#a89840');
  // os cataventos lá longe
  for (const [x, y, s] of [[60, 60, 1], [150, 56, 1.3], [200, 64, 0.8]] as const) {
    b.rect(x, y, 2, Math.round(20 * s), '#6a5a4a');
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + 0.4;
      b.line(x + 1, y, Math.round(x + 1 + Math.cos(a) * 8 * s), Math.round(y + Math.sin(a) * 8 * s), '#f4f0e0');
    }
  }
  // o vento desenhado no ar
  for (const [x, y] of [[20, 40], [100, 34], [170, 46]] as const) {
    b.line(x, y, x + 30, y - 2, '#e8f8f4'); b.line(x + 30, y - 2, x + 34, y - 6, '#e8f8f4'); b.set(x + 33, y - 7, '#e8f8f4');
  }
  // a borda da cumeeira, na frente: pedra escura
  b.rect(0, 118, W, H - 118, '#2a2228');
  for (let x = 0; x < W; x += 12) b.ellipse(x + 6, 118, 8, 4, '#3a3036');
  return b;
}

/* ---------------------------------------------------------- as peças */

/* o pote de barro com carvão em brasa. 14×12 */
export function poteCarvao(): Buf {
  const b = new Buf(14, 12);
  b.ellipse(7, 7, 6, 5, '#8a4a2a'); b.ellipse(6, 6, 4, 3, '#a85a32');
  b.rect(2, 2, 10, 3, '#2a2020');
  b.set(4, 2, P.fire!); b.set(7, 3, P.fireL!); b.set(9, 2, P.fire!);
  return b;
}

/* o sino de bronze da capela. 12×14 */
export function sinoBronze(): Buf {
  const b = new Buf(12, 14);
  b.rect(5, 0, 2, 2, '#6a4a1a');
  b.ellipse(6, 6, 4, 4, '#b8892c'); b.rect(1, 6, 10, 5, '#b8892c');
  b.rect(0, 10, 12, 2, '#8d6a16'); b.rect(3, 4, 2, 6, '#e8c050');
  b.rect(5, 12, 2, 2, '#4a3a1a');
  return b;
}

/* a candeia de barro, acesa. 10×10 */
export function candeia(): Buf {
  const b = new Buf(10, 10);
  b.ellipse(5, 7, 4, 2, '#8a4a2a'); b.rect(1, 6, 8, 1, '#a85a32');
  b.rect(8, 5, 2, 2, '#8a4a2a');
  b.tri(7, 5, 9, 5, 8, 0, P.fire!); b.set(8, 3, P.fireL!);
  return b;
}
