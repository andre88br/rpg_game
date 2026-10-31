/* Os Encantados. Desenhados com primitivas (elipses, triangulos) e depois
   contornados automaticamente — a mesma tecnica que o jogo vai usar. */
import { Buf } from '../core/buf.ts';
import { P } from './palette.ts';

const C: Record<string, string> = {
  // Boitata — serpente de fogo
  boi:  '#3f9a4a', boiL: '#62b866', boiD: '#2a6e34', boiB: '#f2d83a', boiBD: '#c8a828',
  fogoV: '#e0401e', fogoA: '#ff8a2a', fogoM: '#ffd23a', lingua: '#e070a0', bocaF: '#7a2a2a',
  olhoAzul: '#4ab0f0',
  // Iara — sereia das aguas
  iar:  '#5e9460', iarL: '#86b878', iarD: '#3e6e44', iarH: '#2a2630',
  pele: '#b8805c', peleD: '#8e5c3c',
  // Curupira — guardiao da mata
  cur:  '#4e9f3f', curL: '#79c45f', curD: '#33702a',
  fogoC:'#e8541f', fogoCL:'#ffa63a',
  // a turma do folclore, de cabeção (carinha e cucaDePe)
  olhoP: '#1a1420', bochecha: '#f2a6a6', bochechaE: '#e48a86', boca: '#3a2226',
  peleC: '#e8c9a0', peleCD: '#c9a078', peleM: '#a06a4a', saci: '#86573d',
  cabeloF: '#cf3f2e', cabeloFL: '#ec6a50',            // o fogo do Curupira
  cabeloC: '#e8743a', cabeloCL: '#f6a066',            // a Caipora
  lanca: '#9a7a52', lancaD: '#6e5434', ponta: '#b8b8c0', pontaL: '#e4e4ea',
  pintura: '#cf4b3a', bolha: '#9fd4f0', iarHL: '#4a4452',
  gorro: '#d63b2f', gorroD: '#9c2620', gorroL: '#f0655a',
  cachimbo: '#ece0b0', cachimboD: '#b8a878', vento: '#bfe9e0', ventoD: '#7fc4b8',
  palha: '#d8b860', palhaD: '#a88a3a',
  porco: '#6a5446', porcoL: '#8a7262', porcoD: '#3e3028', focinho: '#e8a0a0',
  cuca: '#6f9a4a', cucaL: '#8ab862', cucaD: '#46682e', cucaB: '#c8d898', cucaBD: '#9ab070',
  guara: '#e8873a', guaraB: '#fbf3e4', guaraC: '#f2d6b0', guaraP: '#3a2a24',
  lobo: '#c8602e', crina: '#2e2228', bocaA: '#d86a7a',
  lobi: '#8a5432', lobiL: '#c08a5a', lobiD: '#5a3420', focinhoL: '#3a2420', linguaL: '#d8343a',
  camisa: '#5aa0a0', camisaD: '#3e7a7a', calcao: '#5a5458', garra: '#f0e8d0',
  loiro: '#e8c46a', loiroL: '#f6e0a0', manto: '#5a2a5e', mantoL: '#7a4a82',
  // gerais
  olho: '#ffffff', pup: '#191221', bril: '#ffffff',
  sombra: '#00000000',
  // Cabra da Serra — bode encantado
  cab:  '#c9a876', cabL: '#e8d4a8', cabD: '#8f7248',
  chif: '#5a4a38', chifL: '#7a6650', chifD: '#3a2f22',
  // Mula-sem-Cabeça — assombracao da estrada
  mul:  '#6e3220', mulL: '#8a4430', mulD: '#4a2016', casco: '#2a1612', pesc: '#ff6a22', pescL: '#ffc23c',
  // Salamanca — guardia da mina
  sal:  '#c9622e', salL: '#e88a4a', salD: '#8a3e18',
  esc:  '#4a4038', escL: '#6b5f52', escD: '#2e2822',
  // Mae-do-Ouro — fogo da mina, exclusiva
  our:  '#f0c93a', ourL: '#fce87a', ourD: '#b8901c', ceu: '#2a1f4a',
};

/* chama generica: n linguas de fogo subindo a partir de (x,y) */
function chama(b: Buf, x: number, y: number, larg: number, alt: number, c1: string, c2: string): void {
  b.tri(x - larg, y, x, y - alt, x + larg, y, c1);
  b.tri(x - larg * 0.55, y, x - larg * 0.2, y - alt * 0.62, x + larg * 0.2, y, c2);
  b.tri(x - larg - 2, y, x - larg - 1, y - alt * 0.45, x - larg + 2, y, c1);
  b.tri(x + larg - 2, y, x + larg + 1, y - alt * 0.45, x + larg + 2, y, c1);
}

function olho(b: Buf, x: number, y: number, r = 3, dir = 1): void {
  b.ellipse(x, y, r, r, C.olho);
  b.ellipse(x + dir, y, r - 1, r - 1, C.pup);
  b.set(x - dir, y - 1, C.bril);
}

/* A carinha da turma do folclore: olho preto e alto, com um ponto de brilho,
   bochecha rosada e o sorrisão. (cx, cy) é o meio, na altura dos olhos;
   `sep` é a distância de cada olho até o meio. */
function carinha(b: Buf, cx: number, cy: number, sep: number, bochecha = C.bochecha): void {
  for (const x of [cx - sep, cx + sep - 1]) {
    b.rect(x, cy - 1, 2, 3, C.olhoP);
    b.set(x, cy - 1, C.bril);
  }
  b.rect(cx - sep - 3, cy + 2, 2, 1, bochecha);
  b.rect(cx + sep + 2, cy + 2, 2, 1, bochecha);
  const l = sep - 1;
  b.set(cx - l - 1, cy + 3, C.boca);
  b.line(cx - l, cy + 4, cx + l - 1, cy + 4, C.boca);
  b.set(cx + l, cy + 3, C.boca);
}

/* a Cuca de pé: jacarezinho de cabelo loiro, rabo para o lado e focinho
   para a direita. A rainha ganha coroa e cabelo mais comprido. */
function cucaDePe(b: Buf, rainha: boolean): void {
  // cabelo loiro atrás da cabeça, até os ombros (ou até a cintura)
  b.ellipse(15, 15, 9, 9, C.loiro);
  b.rect(6, 15, 7, rainha ? 17 : 12, C.loiro);
  // rabo, saindo para a esquerda lá embaixo
  b.tri(14, 32, 1, 39, 16, 37, C.cuca);
  // pernas
  b.rect(14, 34, 4, 4, C.cuca); b.rect(21, 34, 4, 4, C.cuca);
  // corpo e a barriga de couro claro, com as listras
  b.ellipse(19, 29, 7, 6, C.cuca);
  b.ellipse(19, 30, 4, 5, C.cucaB);
  for (const y of [28, 31, 34]) b.line(17, y, 21, y, C.cucaBD);
  // bracinhos
  b.ellipse(11, 28, 2, 4, C.cuca); b.ellipse(27, 28, 2, 4, C.cuca);
  // cabeção e focinho comprido, de ponta redonda
  b.ellipse(17, 16, 9, 8, C.cuca);
  b.ellipse(28, 19, 9, 4, C.cuca);
  b.ellipse(28, 17, 7, 1, C.cucaL);
  b.set(35, 16, C.cucaD); b.set(33, 16, C.cucaD);          // narinas
  // franja e mechas caindo do lado esquerdo do rosto
  b.ellipse(16, 9, 10, 3, C.loiro);
  for (const x of [9, 13, 17, 21]) b.tri(x - 2, 11, x + 2, 11, x, 13, C.loiro);
  b.ellipse(8, 19, 2, 7, C.loiro);
  b.set(13, 7, C.loiroL); b.set(14, 7, C.loiroL); b.set(15, 6, C.loiroL);
  // a carinha: olhos no alto da cabeça, sorriso ao longo do focinho
  for (const x of [14, 20]) { b.rect(x, 15, 2, 3, C.olhoP); b.set(x, 15, C.bril); }
  b.rect(11, 19, 2, 1, C.bochecha);
  b.rect(21, 19, 3, 2, C.bochecha);
  b.set(19, 21, C.boca); b.line(20, 22, 33, 22, C.boca); b.set(34, 21, C.boca);
  if (rainha) {
    b.rect(11, 4, 11, 2, P.goldD);
    for (const x of [12, 16, 20]) b.tri(x - 2, 5, x, 0, x + 2, 5, P.gold);
    b.set(16, 3, '#e05a5a');
  }
}

/* o olhão de desenho animado: branco redondo, pupila preta grande olhando
   um tico para o meio (`dir`) e o ponto de brilho */
function olhao(b: Buf, x: number, y: number, r: number, dir = 0): void {
  b.ellipse(x, y, r, r, C.olho);
  b.rect(x - r + 1, y - r + 1, 2 * r - 1, 2 * r - 1, C.olho);
  const p = r - 1;
  b.rect(x - p + 1 + dir, y - p + 1, Math.max(2, 2 * p - 1), 2 * p, C.olhoP);
  b.set(x - p + 1 + dir, y - p + 1, C.bril);
}

/* fogo de desenho: a borda vermelha, o laranja e o miolo amarelo */
function coroaDeFogo(b: Buf, x: number, y: number, larg: number, alt: number): void {
  chama(b, x, y, larg, alt, C.fogoV, C.fogoA);
  b.tri(x - larg * 0.3, y, x, y - alt * 0.35, x + larg * 0.3, y, C.fogoM);
}

/* a cabeça da Mula: um fogo de gota com olhão e sorriso */
function fogoComCara(b: Buf, cx: number, cy: number, rx: number, ry: number): void {
  b.ellipse(cx, cy, rx, ry, C.fogoV);
  b.tri(cx - rx, cy, cx - rx + 1, cy - ry - 4, cx - 1, cy - ry + 1, C.fogoV);
  b.tri(cx - 3, cy - ry + 1, cx + 1, cy - ry - 5, cx + 3, cy - ry + 1, C.fogoV);
  b.tri(cx + 1, cy - ry + 1, cx + rx, cy - ry - 3, cx + rx, cy, C.fogoV);
  b.ellipse(cx, cy + 1, rx - 1, ry - 1, C.fogoA);
  b.ellipse(cx, cy + 2, rx - 3, ry - 3, C.fogoM);
  const r = rx >= 8 ? 3 : 2;
  olhao(b, cx - r - 1, cy, r, 0); olhao(b, cx + r + 1, cy, r, -1);
  b.set(cx - 2, cy + ry - 2, C.olhoP);
  b.line(cx - 1, cy + ry - 1, cx + 1, cy + ry - 1, C.olhoP);
  b.set(cx + 2, cy + ry - 2, C.olhoP);
}

/* a Boitatá crescida, em pé sobre as voltas do corpo; a Mboitatá é a mais
   velha, de fogo maior e os olhos azuis de todo bicho que morreu no fogo */
function cobraDeFogo(b: Buf, antiga: boolean): void {
  // a volta de baixo e o rabo de ponta acesa
  b.ellipse(20, 35, 13, 4, C.boi);
  b.ellipse(20, 36, 9, 2, C.boiB);
  b.tri(30, 35, 36, 24, 35, 37, C.boi);
  coroaDeFogo(b, 36, 24, 4, antiga ? 10 : 8);
  // o corpo em pé, de barriga listrada
  b.ellipse(19, 29, 7, 6, C.boi);
  b.rect(13, 18, 12, 10, C.boi);
  b.rect(16, 18, 6, 15, C.boiB);
  for (let y = 20; y <= 32; y += 2) b.line(16, y, 21, y, C.boiBD);
  // cabeção, cara amarela e a coroa de fogo
  b.ellipse(19, 13, 10, 7, C.boi);
  b.ellipse(19, 15, 8, 5, C.boiB);
  coroaDeFogo(b, 19, 8, antiga ? 10 : 8, antiga ? 9 : 8);
  if (antiga) { coroaDeFogo(b, 10, 9, 3, 6); coroaDeFogo(b, 28, 9, 3, 6); }
  // olhão, narinas, a boca aberta de sorriso e a língua bifurcada
  for (const [x, d] of [[15, 0], [23, -1]] as const) {
    olhao(b, x, 10, 3, d);
    if (antiga) { b.rect(x - 1 + d, 9, 3, 4, C.olhoAzul); b.set(x - 1 + d, 9, C.bril); }
  }
  b.set(17, 14, C.boiD); b.set(21, 14, C.boiD);
  // o sorriso aberto, com a língua saindo do meio
  b.set(13, 15, C.bocaF); b.set(14, 16, C.bocaF);
  b.rect(15, 17, 9, 2, C.bocaF);
  b.set(24, 16, C.bocaF); b.set(25, 15, C.bocaF);
  b.line(19, 19, 19, 22, C.lingua);
  b.set(18, 23, C.lingua); b.set(20, 23, C.lingua);
  for (const [x, y] of [[6, 6], [33, 4], [5, 16]] as const) b.ellipse(x, y, 1, 1, C.fogoA);
}

/* ---------------- BOITATINHA (Fogo, inicial) ---------------- */
export function boitatinha(): Buf {
  const b = new Buf(32, 32);
  // o rabo enrolando para a direita, com a pontinha acesa
  b.ellipse(22, 29, 5, 2, C.boi);
  b.tri(24, 29, 27, 21, 27, 30, C.boi);
  coroaDeFogo(b, 27, 21, 3, 6);
  // o corpo em pé, de barriga amarela listrada
  b.ellipse(15, 25, 5, 6, C.boi);
  b.rect(11, 15, 9, 8, C.boi);
  b.rect(13, 15, 5, 15, C.boiB);
  for (let y = 18; y <= 29; y += 2) b.line(13, y, 17, y, C.boiBD);
  // cabeção e a cara amarela
  b.ellipse(16, 10, 8, 6, C.boi);
  b.ellipse(16, 12, 6, 4, C.boiB);
  coroaDeFogo(b, 16, 6, 7, 7);
  // olhão, narinas, sorriso e a língua bifurcada
  olhao(b, 13, 8, 2, 0); olhao(b, 19, 8, 2, -1);
  b.set(15, 11, C.boiD); b.set(17, 11, C.boiD);
  b.set(12, 12, C.bocaF); b.line(13, 13, 19, 13, C.bocaF); b.set(20, 12, C.bocaF);
  b.line(16, 14, 16, 17, C.lingua);
  b.set(15, 18, C.lingua); b.set(17, 18, C.lingua);
  return b.outline(P.ink);
}

/* ---------------- IARINHA (Água, inicial) ---------------- */
export function iarinha(): Buf {
  const b = new Buf(32, 32);
  // cabelo preto e liso caindo pelas costas
  b.ellipse(16, 11, 8, 7, C.iarH);
  b.rect(8, 11, 17, 11, C.iarH);
  // cauda de peixe, enrolando para a direita, com a nadadeira
  b.ellipse(16, 25, 5, 4, C.iar);
  b.ellipse(21, 29, 4, 2, C.iar);
  b.tri(23, 29, 30, 24, 28, 31, C.iarL);
  b.line(13, 25, 15, 26, C.iarD); b.line(17, 26, 19, 25, C.iarD);
  // tronco, braços e o top de folha
  b.ellipse(16, 20, 4, 3, C.pele);
  b.ellipse(11, 21, 1, 3, C.pele); b.ellipse(21, 21, 1, 3, C.pele);
  b.rect(13, 19, 7, 2, C.iarL);
  // cabeção
  b.ellipse(16, 12, 7, 7, C.pele);
  // franja reta e as mechas da frente
  b.ellipse(16, 7, 8, 3, C.iarH);
  b.rect(9, 8, 15, 2, C.iarH);
  b.rect(8, 9, 2, 12, C.iarH); b.rect(23, 9, 2, 12, C.iarH);
  // a pintura vermelha atravessando o rosto, de mecha a mecha
  b.rect(10, 12, 13, 2, C.pintura);
  b.set(13, 5, C.iarHL); b.set(14, 5, C.iarHL);
  carinha(b, 16, 13, 3);
  // bolhinhas
  for (const [x, y] of [[4, 10], [5, 4], [28, 7], [29, 15]]) {
    b.ellipse(x, y, 1, 1, C.bolha); b.set(x, y - 1, '#ffffff');
  }
  return b.outline(P.ink);
}

/* ---------------- CURUPINHO (Planta, inicial) ---------------- */
export function curupinho(): Buf {
  const b = new Buf(32, 32);
  // lança, atrás de tudo
  b.line(26, 7, 26, 30, C.lanca);
  b.tri(24, 8, 26, 2, 28, 8, C.ponta);
  // pernas e pés VIRADOS PARA TRÁS — a marca registrada do Curupira:
  // o calcanhar vem para a frente e os dedos apontam para trás (para cima)
  b.rect(13, 25, 2, 4, C.peleC); b.rect(17, 25, 2, 4, C.peleC);
  b.ellipse(13, 29, 2, 1, C.peleC); b.ellipse(18, 29, 2, 1, C.peleC);
  b.set(12, 28, C.peleCD); b.set(19, 28, C.peleCD);
  // tronco pequeno e braços — o direito segura a lança
  b.ellipse(16, 21, 4, 4, C.peleC);
  b.ellipse(11, 21, 1, 3, C.peleC);
  b.ellipse(23, 21, 3, 1, C.peleC);
  // saia de folhas
  b.ellipse(16, 24, 6, 2, C.cur);
  for (let x = 11; x <= 21; x += 2) b.tri(x - 1, 24, x + 1, 24, x, 28, x % 4 === 1 ? C.curD : C.cur);
  // cabeção
  b.ellipse(16, 13, 7, 7, C.peleC);
  // cabelo de fogo, espetado
  b.ellipse(16, 8, 8, 3, C.cabeloF);
  for (const [x0, y0, x1, y1, x2, y2] of [[7, 10, 7, 2, 12, 6], [10, 7, 12, 0, 16, 6], [14, 6, 17, 0, 19, 6],
    [17, 6, 22, 1, 22, 8], [20, 7, 26, 3, 25, 11]] as const) b.tri(x0, y0, x1, y1, x2, y2, C.cabeloF);
  b.tri(11, 9, 13, 12, 15, 9, C.cabeloF);       // mechas caindo na testa
  b.tri(16, 9, 18, 12, 20, 9, C.cabeloF);
  b.tri(13, 3, 15, 1, 16, 5, C.cabeloFL);
  carinha(b, 16, 14, 3);
  return b.outline(P.ink);
}

/* ================= EVOLUÇÕES FINAIS (40x40) ================= */

/* BOITATÃO — a serpente de fogo adulta, guardia dos campos */
export function boitatao(): Buf {
  const b = new Buf(40, 40);
  cobraDeFogo(b, false);
  return b.outline(P.ink);
}

/* IARA-MÃE — a senhora das aguas, coroada */
export function iaraMae(): Buf {
  const b = new Buf(40, 40);
  // cabelo preto, comprido até a cauda
  b.ellipse(20, 14, 10, 9, C.iarH);
  b.rect(10, 14, 21, 15, C.iarH);
  // cauda grande, enrolando para a direita
  b.ellipse(20, 31, 7, 5, C.iar);
  b.ellipse(27, 36, 6, 2, C.iar);
  b.tri(31, 36, 39, 28, 38, 39, C.iarL);
  for (const x of [15, 19, 23]) b.line(x, 31, x + 2, 32, C.iarD);
  // tronco, braços e o top de folha
  b.ellipse(20, 25, 6, 4, C.pele);
  b.ellipse(13, 26, 2, 4, C.pele); b.ellipse(27, 26, 2, 4, C.pele);
  b.rect(15, 24, 11, 2, C.iarL);
  b.rect(17, 26, 7, 1, C.iarD);
  // cabeção
  b.ellipse(20, 15, 9, 8, C.pele);
  // franja e mechas da frente, e a pintura vermelha de mecha a mecha
  b.ellipse(20, 9, 10, 4, C.iarH);
  b.rect(11, 10, 19, 2, C.iarH);
  b.rect(10, 11, 2, 16, C.iarH); b.rect(29, 11, 2, 16, C.iarH);
  b.rect(12, 15, 17, 3, C.pintura);
  b.set(16, 7, C.iarHL); b.set(17, 7, C.iarHL); b.set(18, 6, C.iarHL);
  // coroa de corais
  b.rect(15, 3, 11, 2, P.goldD);
  for (const x of [16, 20, 24]) b.tri(x - 2, 4, x, 0, x + 2, 4, P.gold);
  b.set(20, 2, '#cde8ff');
  carinha(b, 20, 16, 4);
  for (const [x, y] of [[4, 12], [6, 5], [35, 8], [36, 17], [3, 24]]) {
    b.ellipse(x, y, 1, 1, C.bolha); b.set(x, y - 1, '#ffffff');
  }
  return b.outline(P.ink);
}

/* CURUPIRÁ — o guardiao adulto da mata, com bordunа */
export function curupira(): Buf {
  const b = new Buf(40, 40);
  // lança comprida, atrás de tudo
  b.line(33, 8, 33, 38, C.lanca);
  b.line(34, 8, 34, 38, C.lancaD);
  b.tri(30, 10, 33, 1, 37, 10, C.ponta);
  b.tri(32, 9, 33, 4, 34, 9, C.pontaL);
  // pernas e pés virados para trás
  b.rect(16, 31, 3, 5, C.peleC); b.rect(21, 31, 3, 5, C.peleC);
  b.ellipse(16, 36, 3, 1, C.peleC); b.ellipse(23, 36, 3, 1, C.peleC);
  b.set(14, 35, C.peleCD); b.set(25, 35, C.peleCD);
  // tronco e braços
  b.ellipse(20, 26, 6, 5, C.peleC);
  b.ellipse(13, 26, 2, 4, C.peleC);
  b.ellipse(29, 25, 4, 2, C.peleC);
  // saia de folhas, comprida
  b.ellipse(20, 30, 8, 2, C.cur);
  for (let x = 13; x <= 27; x += 2) b.tri(x - 1, 30, x + 1, 30, x, 35, x % 4 === 1 ? C.curD : C.cur);
  // colar de dentes
  for (const x of [17, 20, 23]) b.tri(x - 1, 23, x + 1, 23, x, 25, '#f0e8d0');
  // cabeção
  b.ellipse(20, 15, 9, 8, C.peleC);
  // cabelo de fogo, bem maior
  b.ellipse(20, 9, 10, 4, C.cabeloF);
  for (const [x0, y0, x1, y1, x2, y2] of [[9, 12, 6, 3, 14, 7], [11, 8, 12, 0, 18, 6], [16, 6, 20, 0, 23, 6],
    [21, 6, 28, 0, 28, 9], [26, 8, 34, 5, 31, 14], [9, 10, 4, 12, 11, 15]] as const) b.tri(x0, y0, x1, y1, x2, y2, C.cabeloF);
  b.tri(13, 11, 15, 14, 18, 11, C.cabeloF);
  b.tri(19, 11, 21, 14, 24, 11, C.cabeloF);
  b.tri(14, 4, 17, 1, 18, 6, C.cabeloFL);
  b.tri(23, 4, 27, 2, 26, 7, C.cabeloFL);
  carinha(b, 20, 16, 4);
  return b.outline(P.ink);
}

/* =========================================================================
   Selvagens de Porto Iara
   ========================================================================= */

/* ---------------- PIRAGUÁ (Água, selvagem) ---------------- */
export function piragua(): Buf {
  const b = new Buf(32, 32);
  const cor = '#4fb0c9', corL = '#8fdcef', corD = '#2b7c95', barriga = '#f3e9b8';

  // cauda, atrás do corpo
  b.tri(9, 16, 2, 8, 2, 24, corD);
  b.tri(9, 16, 4, 11, 4, 21, cor);

  // corpo: elipse deitada, focinho para a direita
  b.ellipse(18, 16, 10, 8, cor);
  b.ellipse(19, 19, 8, 4, barriga);          // barriga clara
  b.ellipse(15, 12, 6, 3, corL);             // brilho do dorso

  // nadadeira de cima e nadadeira de baixo
  b.tri(16, 8, 12, 2, 21, 7, corL);
  b.tri(14, 8, 12, 3, 18, 7, cor);
  b.tri(17, 24, 13, 30, 22, 25, corD);

  // nadadeira lateral, bem no meio do corpo
  b.ellipse(18, 19, 3, 2, corL);
  b.line(16, 19, 20, 19, corD);

  // escamas: três arcos curtos, só no meio
  for (let i = 0; i < 3; i++) {
    b.line(19 + i * 3, 12 + i, 19 + i * 3, 20 - i, corD);
  }

  // cabeça: boca aberta e olho grande
  b.ellipse(26, 17, 4, 4, corL);
  b.tri(24, 19, 31, 17, 31, 23, '#e8607a');  // boca
  b.line(24, 19, 31, 21, '#a8324a');
  olho(b, 24, 13, 3, 1);

  // bolhinhas subindo
  for (const [x, y] of [[6, 4], [10, 2], [28, 5], [30, 10]]) {
    b.ellipse(x, y, 1, 1, corL); b.set(x, y - 1, '#ffffff');
  }
  return b.outline(P.ink);
}

/* ---------------- SACIZINHO (Vento, selvagem) ---------------- */
export function sacizinho(): Buf {
  const b = new Buf(32, 32);
  // redemoinho no lugar do pé: o Saci nunca encosta direito no chão
  b.ellipse(16, 30, 9, 1, C.ventoD);
  b.ellipse(16, 29, 6, 1, C.vento);
  // a perna única
  b.rect(15, 26, 3, 3, C.saci);
  // tronco, braços, a bolsa vermelha e o calção
  b.ellipse(16, 22, 4, 3, C.saci);
  b.ellipse(11, 22, 1, 3, C.saci); b.ellipse(21, 22, 1, 3, C.saci);
  b.line(13, 19, 19, 25, C.gorro);
  b.rect(18, 24, 4, 3, C.gorro); b.set(20, 25, C.gorroD);
  b.rect(13, 25, 7, 2, C.gorro);
  // cabeção
  b.ellipse(16, 14, 7, 6, C.saci);
  // gorro vermelho: alto, com a ponta caindo para trás
  b.ellipse(16, 7, 8, 3, C.gorro);
  b.tri(9, 8, 12, 0, 23, 8, C.gorro);
  b.tri(11, 3, 13, 0, 15, 4, C.gorroL);
  b.rect(8, 9, 17, 2, C.gorroD);
  carinha(b, 16, 14, 3, C.bochechaE);
  // cachimbo no canto da boca, com a fumacinha
  b.line(19, 18, 23, 18, C.cachimbo);
  b.rect(23, 15, 3, 4, C.cachimbo);
  b.rect(23, 15, 3, 1, C.cachimboD);
  for (const [x, y] of [[27, 12], [29, 8], [28, 4]]) b.ellipse(x, y, 1, 1, '#d9d9d9');
  return b.outline(P.ink);
}

/* ---------------- CAIPORINHA (Planta, selvagem) ---------------- */
export function caiporinha(): Buf {
  const b = new Buf(32, 32);
  // cabelo laranja atrás da cabeça, até os ombros
  b.ellipse(16, 12, 9, 8, C.cabeloC);
  b.rect(7, 12, 19, 8, C.cabeloC);
  for (const x of [8, 11, 21, 24]) b.tri(x - 1, 19, x + 1, 19, x, 22, C.cabeloC);
  // pernas
  b.rect(13, 26, 2, 3, C.peleM); b.rect(17, 26, 2, 3, C.peleM);
  b.ellipse(13, 29, 2, 1, C.peleM); b.ellipse(18, 29, 2, 1, C.peleM);
  // tronco, braços, o top de palha e a saia de folhas
  b.ellipse(16, 22, 4, 3, C.peleM);
  b.ellipse(11, 22, 1, 3, C.peleM); b.ellipse(21, 22, 1, 3, C.peleM);
  b.rect(13, 20, 7, 2, C.palha);
  for (const x of [13, 15, 17, 19]) b.set(x, 22, C.palhaD);
  b.ellipse(16, 25, 5, 2, C.cur);
  for (let x = 12; x <= 20; x += 2) b.tri(x - 1, 25, x + 1, 25, x, 28, x % 4 === 0 ? C.curD : C.cur);
  // cabeção
  b.ellipse(16, 13, 7, 7, C.peleM);
  // franja repicada
  b.ellipse(16, 8, 8, 3, C.cabeloC);
  for (const x of [11, 14, 17, 20]) b.tri(x - 1, 9, x + 1, 9, x + 1, 12, C.cabeloC);
  b.rect(8, 9, 2, 10, C.cabeloC); b.rect(23, 9, 2, 10, C.cabeloC);
  b.set(13, 6, C.cabeloCL); b.set(14, 6, C.cabeloCL); b.set(15, 5, C.cabeloCL);
  carinha(b, 16, 14, 3, C.bochechaE);
  return b.outline(P.ink);
}

/* =========================================================================
   Serra Boitatá
   ========================================================================= */

/* ---------------- CABRITINHA (Terra, inicial da serra) ---------------- */
export function cabritinha(): Buf {
  const b = new Buf(32, 32);

  // patas curtas, cascos escuros
  b.rect(11, 24, 3, 5, C.cabD); b.rect(18, 24, 3, 5, C.cabD);
  b.rect(11, 20, 3, 5, C.cab); b.rect(18, 20, 3, 5, C.cab);

  // corpo baixo e robusto
  b.ellipse(16, 19, 9, 6, C.cab);
  b.ellipse(16, 21, 6, 3, C.cabL);
  b.ellipse(9, 19, 2, 3, C.cab); b.ellipse(23, 19, 2, 3, C.cab); // patas de tras

  // cabeca
  b.ellipse(16, 11, 7, 6, C.cab);
  b.ellipse(16, 14, 5, 3, C.cabL);              // barbicha clara

  // chifres curvos, virados para cima
  b.tri(10, 8, 6, 2, 12, 7, C.chif);
  b.tri(22, 8, 26, 2, 20, 7, C.chif);
  b.line(10, 8, 7, 4, C.chifL); b.line(22, 8, 25, 4, C.chifL);

  // orelhas caidas
  b.ellipse(9, 12, 3, 2, C.cabD); b.ellipse(23, 12, 3, 2, C.cabD);

  olho(b, 13, 11, 2, 1); olho(b, 19, 11, 2, -1);
  b.line(15, 14, 17, 14, C.cabD);               // narinas/boca
  return b.outline(P.ink);
}

/* ---------------- CABRA-CABRIOLA (Terra/Fogo, evoluida) ---------------- */
export function cabraCabriola(): Buf {
  const b = new Buf(40, 40);

  // patas fortes com casco fendido
  b.rect(13, 30, 4, 7, C.cabD); b.rect(23, 30, 4, 7, C.cabD);
  b.rect(13, 25, 4, 6, C.cab); b.rect(23, 25, 4, 6, C.cab);
  b.ellipse(11, 26, 3, 4, C.cab); b.ellipse(29, 26, 3, 4, C.cab);

  // corpo maior, musculoso
  b.ellipse(20, 24, 12, 8, C.cab);
  b.ellipse(20, 26, 8, 4, C.cabL);
  b.ellipse(20, 30, 6, 2, C.cabD);

  // fumaca das narinas, saindo do focinho
  chama(b, 12, 15, 3, 5, C.pescL, '#ffe8a0');
  chama(b, 28, 15, 3, 5, C.pescL, '#ffe8a0');

  // cabeca angulosa
  b.ellipse(20, 14, 9, 7, C.cab);
  b.ellipse(20, 17, 6, 3, C.cabL);

  // chifres grandes, torcidos
  b.tri(12, 9, 4, 0, 15, 8, C.chif);
  b.tri(28, 9, 36, 0, 25, 8, C.chif);
  b.line(12, 9, 6, 2, C.chifL); b.line(28, 9, 34, 2, C.chifL);
  b.set(8, 4, C.chifD); b.set(32, 4, C.chifD);

  b.ellipse(11, 15, 3, 2, C.cabD); b.ellipse(29, 15, 3, 2, C.cabD); // orelhas

  olho(b, 16, 14, 3, 1); olho(b, 24, 14, 3, -1);
  b.line(18, 18, 22, 18, C.cabD);
  return b.outline(P.ink);
}

/* ---------------- MULINHA (Fogo, inicial da serra) ---------------- */
export function mulinha(): Buf {
  const b = new Buf(32, 32);
  // o rabo em brasa e a garupa, atrás
  coroaDeFogo(b, 26, 22, 3, 7);
  b.ellipse(21, 22, 5, 5, C.mulD);
  b.rect(20, 24, 3, 7, C.mulD);                 // a perna de trás
  // o peito e as duas pernas da frente
  b.ellipse(15, 20, 6, 5, C.mul);
  b.rect(10, 17, 10, 3, C.mul);
  b.rect(10, 23, 4, 8, C.mul); b.rect(16, 23, 4, 8, C.mul);
  b.rect(10, 30, 4, 1, C.casco); b.rect(16, 30, 4, 1, C.casco);
  b.ellipse(15, 17, 4, 1, C.mulD);              // o corte do pescoço
  // a cabeça que não tem: um fogo com cara, flutuando acima do pescoço
  fogoComCara(b, 15, 8, 6, 5);
  return b.outline(P.ink);
}

/* ---------------- MULA-SEM-CABEÇA (Fogo, evoluida) ---------------- */
export function mulaSemCabeca(): Buf {
  const b = new Buf(40, 40);
  coroaDeFogo(b, 33, 27, 4, 10);
  b.ellipse(27, 27, 6, 6, C.mulD);
  b.rect(26, 29, 4, 9, C.mulD);
  b.ellipse(19, 26, 8, 6, C.mul);
  b.rect(12, 21, 14, 4, C.mul);
  b.rect(12, 29, 5, 9, C.mul); b.rect(21, 29, 5, 9, C.mul);
  b.rect(12, 37, 5, 2, C.casco); b.rect(21, 37, 5, 2, C.casco);
  b.ellipse(19, 21, 6, 1, C.mulD);
  // o pescoço ainda solta faísca
  for (const [x, y] of [[13, 18], [25, 18]] as const) b.ellipse(x, y, 1, 1, C.fogoA);
  fogoComCara(b, 19, 10, 8, 7);
  return b.outline(P.ink);
}

/* ---------------- SALAMANCA (Fogo/Terra, guardiã da mina) ---------------- */
export function salamanca(): Buf {
  const b = new Buf(32, 32);

  // cauda longa, atras do corpo
  b.tri(23, 20, 30, 12, 30, 26, C.escD);
  b.tri(23, 20, 27, 15, 27, 24, C.sal);

  // corpo de lagartixa, deitado
  b.ellipse(15, 19, 10, 6, C.sal);
  b.ellipse(15, 21, 7, 3, C.salL);
  for (const [x, y] of [[10, 16], [15, 15], [20, 16]]) b.ellipse(x, y, 2, 2, C.esc); // placas escuras

  // pernas curtas, agarradas na pedra
  b.ellipse(8, 23, 2, 2, C.escL); b.ellipse(20, 24, 2, 2, C.escL);
  b.ellipse(6, 18, 2, 2, C.escL); b.ellipse(18, 12, 2, 2, C.escL);

  // cabeca triangular
  b.ellipse(8, 13, 6, 5, C.sal);
  b.ellipse(8, 15, 4, 2, C.salL);
  b.tri(3, 13, 0, 11, 3, 16, C.sal);             // focinho

  olho(b, 8, 11, 2, 0);
  // brasa nas fendas das costas
  for (const [x, y] of [[13, 17], [17, 18], [20, 20]]) b.set(x, y, C.pescL);
  return b.outline(P.ink);
}

/* ---------------- MÃE-DO-OURO (Fogo/Luz, exclusiva) ---------------- */
export function maeDoOuro(): Buf {
  const b = new Buf(40, 40);

  // rastro de luz atras, como um risco no ceu
  b.tri(28, 30, 39, 34, 39, 26, C.ourD);
  b.tri(28, 30, 36, 32, 36, 28, C.our);

  // corpo em forma de chama alongada, flutuando
  b.ellipse(18, 26, 9, 10, C.our);
  b.ellipse(18, 24, 6, 6, C.ourL);
  chama(b, 18, 16, 9, 11, C.our, C.ourL);
  chama(b, 10, 20, 4, 7, C.our, C.ourL);
  chama(b, 26, 20, 4, 7, C.our, C.ourL);

  // rosto sereno no meio da chama
  b.ellipse(18, 19, 5, 4, '#fff3c0');
  olho(b, 15, 18, 2, 1); olho(b, 21, 18, 2, -1);
  b.line(17, 21, 19, 21, C.ourD);

  // brilho de ouro pingando embaixo
  for (const [x, y] of [[9, 34], [14, 37], [24, 36], [28, 33]]) {
    b.ellipse(x, y, 1, 1, C.our); b.set(x, y - 1, '#fff3c0');
  }
  return b.outline(P.ink);
}

/* ---------------- SACI (Vento, evoluído) ---------------- */
export function saci(): Buf {
  const b = new Buf(40, 40);
  // redemoinho maior, quase engolindo a perna
  b.ellipse(20, 37, 14, 2, C.ventoD);
  b.ellipse(20, 36, 10, 1, C.vento);
  b.line(3, 33, 8, 31, C.ventoD); b.line(37, 33, 32, 31, C.ventoD);
  // a perna única
  b.rect(18, 31, 4, 5, C.saci);
  // tronco, braços, a bolsa e o calção
  b.ellipse(20, 26, 6, 5, C.saci);
  b.ellipse(12, 26, 2, 4, C.saci); b.ellipse(28, 26, 2, 4, C.saci);
  b.line(15, 22, 24, 29, C.gorro); b.line(16, 22, 25, 29, C.gorro);
  b.rect(22, 28, 6, 4, C.gorro); b.rect(22, 28, 6, 1, C.gorroD); b.set(25, 30, P.gold);
  b.rect(15, 30, 10, 2, C.gorro);
  // cabeção
  b.ellipse(20, 16, 9, 8, C.saci);
  // gorro alto, ponta jogada para trás
  b.ellipse(20, 8, 10, 3, C.gorro);
  b.tri(10, 9, 13, 0, 29, 9, C.gorro);
  b.tri(13, 4, 14, 1, 17, 5, C.gorroL);
  b.rect(10, 11, 21, 2, C.gorroD);
  carinha(b, 20, 17, 4, C.bochechaE);
  // cachimbo maior, fumaça grande
  b.line(24, 21, 30, 21, C.cachimbo);
  b.rect(30, 17, 4, 5, C.cachimbo);
  b.rect(30, 17, 4, 1, C.cachimboD);
  for (const [x, y, r] of [[34, 13, 1], [36, 9, 2], [34, 4, 2]] as const) b.ellipse(x, y, r, r, '#e8e8e8');
  return b.outline(P.ink);
}

/* ---------------- MATINTA (Vento, bruxa do vento) ---------------- */
export function matinta(): Buf {
  const b = new Buf(32, 32);
  const capa = '#4a3f52', capaL = '#6e5f78', capaD = '#2e2638';
  const pena = '#8f7aa3', penaL = '#b3a0c4';
  const bico = '#e8a838', olhoAm = '#f2d23a';

  // asas fechadas como capa, atrás do corpo
  b.tri(4, 26, 2, 10, 13, 22, capaD);
  b.tri(28, 26, 30, 10, 19, 22, capaD);
  b.tri(6, 25, 5, 13, 13, 22, capa);
  b.tri(26, 25, 27, 13, 19, 22, capa);

  // corpo arredondado, penugem
  b.ellipse(16, 22, 8, 7, capa);
  b.ellipse(16, 24, 5, 4, capaL);
  for (const [x, y] of [[12, 20], [20, 20], [16, 17]]) b.ellipse(x, y, 2, 2, pena);

  // cabeça grande de coruja, sem pescoço aparente
  b.ellipse(16, 12, 8, 7, capa);
  b.ellipse(16, 14, 5, 3, capaL);

  // disco facial claro, típico de coruja
  b.ellipse(16, 12, 6, 5, penaL);
  olho(b, 13, 11, 3, 1); olho(b, 19, 11, 3, -1);
  b.tri(15, 13, 16, 16, 17, 13, bico);           // bico curvo

  // "orelhas" de penacho, torcidas para os lados — o toque de bruxa
  b.tri(9, 6, 4, 0, 12, 5, capaD);
  b.tri(23, 6, 28, 0, 20, 5, capaD);
  b.set(4, 0, olhoAm); b.set(28, 0, olhoAm);
  return b.outline(P.ink);
}

/* ---------------- UIRAPURU (Vento, exclusivo) ---------------- */
export function uirapuru(): Buf {
  const b = new Buf(40, 40);
  const corpo = '#e8d94a', corpoL = '#fff2a0', corpoD = '#b8a020', asa = '#4a9fd0', asaL = '#7fc4ef';

  // asas abertas, em pleno canto — atrás do corpo
  b.tri(20, 22, 2, 12, 16, 28, asa);
  b.tri(20, 22, 38, 12, 24, 28, asa);
  b.tri(20, 22, 6, 16, 17, 26, asaL);
  b.tri(20, 22, 34, 16, 23, 26, asaL);

  // cauda em leque, curta
  b.tri(20, 28, 14, 37, 26, 37, corpoD);
  b.tri(20, 28, 17, 34, 23, 34, corpo);

  // corpo pequeno e redondo, peito claro
  b.ellipse(20, 22, 7, 8, corpo);
  b.ellipse(20, 24, 4, 5, corpoL);

  // cabeça pequena, bico fino erguido — no meio do canto
  b.ellipse(20, 12, 6, 6, corpo);
  b.ellipse(20, 14, 4, 3, corpoL);
  b.tri(20, 10, 26, 7, 21, 13, corpoD);          // bico apontado para cima

  olho(b, 18, 10, 2, 1);

  // notas do canto, subindo no ar
  for (const [x, y] of [[28, 6], [32, 10], [30, 15]] as const) {
    b.ellipse(x, y, 1, 2, '#fff3c0');
    b.set(x + 1, y - 2, '#fff3c0');
  }
  return b.outline(P.ink);
}

/* ---------------- FAISQUINHA (Raio, vaga-lume do raio) ---------------- */
export function faisquinha(): Buf {
  const b = new Buf(32, 32);
  const corpo = '#3f4a6b', corpoL = '#5d6b94', luz = P.bolt, luzL = '#fff6b0', asa = '#cfe6f2';

  // asinhas transparentes, abertas
  b.ellipse(9, 12, 6, 4, asa); b.ellipse(23, 12, 6, 4, asa);
  b.ellipse(9, 12, 4, 2, '#eef8fc'); b.ellipse(23, 12, 4, 2, '#eef8fc');

  // a lanterna: o traseiro inteiro aceso, maior que o resto
  b.ellipse(16, 23, 8, 7, P.boltD);
  b.ellipse(16, 22, 7, 6, luz);
  b.ellipse(14, 20, 3, 2, luzL);

  // corpo e cabeça escuros
  b.ellipse(16, 13, 6, 5, corpo);
  b.ellipse(16, 12, 4, 2, corpoL);
  olho(b, 13, 12, 2, 1); olho(b, 19, 12, 2, -1);

  // antenas em zigue-zague, como um raio pequeno
  b.line(13, 8, 11, 5, corpo); b.line(11, 5, 13, 3, corpo); b.set(13, 2, luz);
  b.line(19, 8, 21, 5, corpo); b.line(21, 5, 19, 3, corpo); b.set(19, 2, luz);

  // faíscas soltas em volta
  for (const [x, y] of [[4, 24], [28, 22], [6, 29], [27, 28]] as const) {
    b.set(x, y, luz); b.set(x + 1, y - 1, luzL);
  }
  return b.outline(P.ink);
}

/* ---------------- RELAMPO (Raio, evolução da Faisquinha) ---------------- */
export function relampo(): Buf {
  const b = new Buf(40, 40);
  const corpo = '#2f3656', corpoL = '#4d5988', luz = P.bolt, luzD = P.boltD, luzL = '#fff6b0';

  // asas longas em forma de raio, abertas para trás
  b.tri(20, 16, 1, 6, 10, 20, luzD);
  b.tri(10, 20, 3, 24, 16, 20, luzD);
  b.tri(20, 16, 39, 6, 30, 20, luzD);
  b.tri(30, 20, 37, 24, 24, 20, luzD);
  b.tri(20, 16, 5, 8, 11, 18, luz);
  b.tri(20, 16, 35, 8, 29, 18, luz);

  // a lanterna comprida, riscando para baixo
  b.ellipse(20, 30, 7, 8, luzD);
  b.ellipse(20, 29, 6, 7, luz);
  b.ellipse(18, 26, 2, 3, luzL);
  b.tri(16, 35, 20, 39, 24, 35, luz);

  // corpo e cabeça
  b.ellipse(20, 18, 6, 6, corpo);
  b.ellipse(20, 11, 6, 5, corpo);
  b.ellipse(20, 10, 4, 2, corpoL);
  olho(b, 17, 11, 2, 1); olho(b, 23, 11, 2, -1);

  // chifre-antena único, um raio inteiro
  b.line(20, 6, 17, 3, luz); b.line(17, 3, 22, 2, luz); b.line(22, 2, 19, 0, luz);
  return b.outline(P.ink);
}

/* ---------------- TATU-TROVÃO (Raio/Terra) ---------------- */
export function tatuTrovao(): Buf {
  const b = new Buf(40, 40);
  const casco = '#7a6a58', cascoD = '#54483b', cascoL = '#a08c74', pele = '#c9a88a';

  // rabo grosso e pernas curtas
  b.tri(4, 26, 1, 33, 9, 29, cascoD);
  for (const x of [10, 16, 25, 31]) b.rect(x, 30, 4, 5, pele);

  // o casco em arco, dividido em cintas
  b.ellipse(20, 24, 16, 10, cascoD);
  b.ellipse(20, 22, 15, 9, casco);
  for (const x of [11, 16, 21, 26]) b.rect(x, 14, 2, 17, cascoD);
  b.ellipse(16, 18, 5, 2, cascoL);

  // um raio amarelo cravado em cada cinta
  for (const x of [13, 18, 23, 28]) {
    b.line(x, 17, x - 1, 21, P.bolt); b.line(x - 1, 21, x + 1, 22, P.bolt); b.line(x + 1, 22, x, 26, P.bolt);
  }

  // cabeça comprida, focinho no chão
  b.ellipse(34, 26, 5, 4, pele);
  b.tri(36, 24, 40, 29, 35, 30, pele);
  b.ellipse(32, 20, 2, 3, pele);               // orelha
  olho(b, 34, 25, 2, 1);
  return b.outline(P.ink);
}

/* ---------------- ARCO-DA-VELHA (Raio/Luz, exclusivo) ---------------- */
export function arcoDaVelha(): Buf {
  const b = new Buf(40, 40);
  const faixas = ['#e0524a', '#f09a3a', P.bolt, '#5fbf6a', '#4a9fd0', '#8a6ad0'];

  // o corpo é o próprio arco-íris: seis faixas em meia-lua
  faixas.forEach((cor, i) => {
    const r = 18 - i * 2;
    for (let a = 0; a <= 180; a += 2) {
      const rad = (a * Math.PI) / 180;
      const x = 20 + Math.cos(rad) * r, y = 30 - Math.sin(rad) * r;
      b.rect(x | 0, y | 0, 2, 2, cor);
    }
  });

  // as duas cabeças, uma em cada ponta, bebendo da lagoa
  b.ellipse(20, 36, 18, 3, P.waterD);
  b.ellipse(20, 36, 16, 2, P.water);
  for (const [x, d] of [[4, 1], [36, -1]] as const) {
    b.ellipse(x, 31, 4, 3, faixas[0]!);
    olho(b, x + d, 30, 1, d);
    b.set(x + d * 3, 33, '#f2f0ea');
  }

  // faísca no alto do arco
  b.line(20, 6, 18, 10, '#fffbe0'); b.line(18, 10, 22, 10, '#fffbe0'); b.line(22, 10, 20, 14, '#fffbe0');
  return b.outline(P.ink);
}

/* ---------------- MINHOQUINHA (Terra) ---------------- */
export function minhoquinha(): Buf {
  const b = new Buf(32, 32);
  const pele = '#c97a6a', peleL = '#e8a08e', peleD = '#9c5446', terra = '#6b4a2e';

  // o montinho de terra de onde ela sai
  b.ellipse(16, 28, 13, 4, terra);
  b.ellipse(16, 27, 11, 3, '#8a6440');

  // corpo em "S", saindo da terra, anelado
  for (const [x, y, r] of [[10, 24, 4], [12, 19, 4], [17, 16, 4], [21, 12, 4]] as const) {
    b.ellipse(x, y, r, r, pele);
    b.line(x - r + 1, y, x + r - 1, y, peleD);
  }
  b.ellipse(12, 19, 2, 1, peleL);

  // cabeça redonda com capacetinho de pedra
  b.ellipse(22, 8, 5, 5, pele);
  b.ellipse(22, 5, 5, 3, '#8a8f99');
  b.ellipse(21, 4, 2, 1, '#b8bcc4');
  olho(b, 20, 9, 2, 1); olho(b, 25, 9, 2, -1);
  return b.outline(P.ink);
}

/* ---------------- MINHOCÃO (Terra, evolução) ---------------- */
export function minhocao(): Buf {
  const b = new Buf(40, 40);
  const pele = '#a85a4a', peleL = '#d08070', peleD = '#7a3a2e', pedra = '#8a8f99';

  b.ellipse(20, 36, 18, 4, '#5a3e24');
  // corpo grosso em arco, com placas de pedra no dorso
  for (const [x, y, r] of [[6, 30, 6], [10, 22, 7], [18, 17, 7], [27, 15, 7], [33, 20, 6]] as const) {
    b.ellipse(x, y, r, r, pele);
    b.line(x - r + 1, y + 1, x + r - 1, y + 1, peleD);
    b.ellipse(x, y - r + 2, 3, 2, pedra);
  }
  b.ellipse(12, 22, 3, 2, peleL);

  // cabeça enorme de boca aberta, cheia de dentinhos de pedra
  b.ellipse(34, 27, 6, 7, pele);
  b.ellipse(35, 31, 4, 3, '#3a1a14');
  for (const x of [32, 35, 38]) b.tri(x - 1, 29, x + 1, 29, x, 31, '#e8e0d0');
  olho(b, 32, 24, 2, 1); olho(b, 37, 24, 2, -1);
  return b.outline(P.ink);
}

/* ---------------- MAPINGUARI (Terra) ---------------- */
export function mapinguari(): Buf {
  const b = new Buf(40, 40);
  const pelo = '#5a4232', peloL = '#7a5a44', peloD = '#3a2a1e', boca = '#7a1e1a';

  // pernas grossas de pé de pilão
  b.rect(10, 30, 7, 9, peloD); b.rect(23, 30, 7, 9, peloD);
  b.ellipse(13, 38, 5, 2, '#2a1e14'); b.ellipse(26, 38, 5, 2, '#2a1e14');

  // corpo enorme e peludo
  b.ellipse(20, 22, 15, 13, pelo);
  for (const [x, y] of [[9, 16], [31, 16], [7, 26], [33, 26], [20, 10]] as const) b.ellipse(x, y, 3, 2, peloL);

  // a boca na barriga, que é o que faz ele ser ele
  b.ellipse(20, 25, 7, 5, boca);
  b.ellipse(20, 26, 5, 3, '#3a0a08');
  for (const x of [15, 18, 22, 25]) b.tri(x - 1, 21, x + 1, 21, x, 24, '#e8e0d0');

  // braços com garra
  b.ellipse(4, 22, 4, 7, pelo); b.ellipse(36, 22, 4, 7, pelo);
  b.line(1, 28, 0, 31, '#e8e0d0'); b.line(38, 28, 39, 31, '#e8e0d0');

  // um olho só, no meio da testa
  b.ellipse(20, 11, 4, 4, '#f2f0ea');
  b.ellipse(20, 11, 2, 2, '#c93f3f');
  b.set(19, 10, '#ffffff');
  return b.outline(P.ink);
}

/* ---------------- CAIPORA (Terra/Planta, exclusiva) ---------------- */
export function caipora(): Buf {
  const b = new Buf(40, 40);
  // o porco-do-mato que ela monta, gorducho
  b.ellipse(19, 31, 13, 6, C.porco);
  b.ellipse(17, 29, 7, 2, C.porcoL);
  for (const x of [9, 14, 24, 29]) b.rect(x, 35, 3, 4, C.porcoD);
  b.ellipse(32, 29, 6, 5, C.porco);                        // cabeça do porco
  b.tri(29, 25, 30, 20, 33, 24, C.porco);                  // orelha
  b.ellipse(37, 31, 2, 2, C.focinho);
  b.set(37, 30, C.porcoD); b.set(37, 32, C.porcoD);
  b.line(34, 33, 33, 36, '#f0e8d0');                       // presinha
  b.rect(31, 27, 2, 2, C.olhoP); b.set(31, 27, '#ffffff');
  // a Caipora montada, de cabelo de fogo, com o galho na mão
  b.ellipse(16, 13, 9, 8, C.cabeloC);                      // cabelo atrás
  b.rect(7, 13, 19, 8, C.cabeloC);
  b.ellipse(16, 24, 4, 3, C.peleM);                        // tronco
  b.rect(13, 22, 7, 2, C.palha);
  b.ellipse(10, 23, 1, 3, C.peleM);
  b.line(8, 9, 10, 27, P.trunk);                           // o galho
  b.ellipse(8, 8, 3, 2, C.cur);
  b.ellipse(21, 24, 1, 3, C.peleM);
  b.ellipse(16, 14, 7, 7, C.peleM);                        // cabeção
  b.ellipse(16, 9, 8, 3, C.cabeloC);
  for (const x of [11, 14, 17, 20]) b.tri(x - 1, 10, x + 1, 10, x + 1, 13, C.cabeloC);
  for (const [x0, x1] of [[9, 12], [15, 18], [21, 24]] as const) b.tri(x0, 7, x0 + 1, 2, x1, 7, C.cabeloC);
  b.rect(8, 10, 2, 10, C.cabeloC); b.rect(23, 10, 2, 10, C.cabeloC);
  b.set(13, 7, C.cabeloCL); b.set(14, 7, C.cabeloCL);
  carinha(b, 16, 15, 3, C.bochechaE);
  return b.outline(P.ink);
}

/* ---------------- LOBO-GUARÁ (Sombra) ---------------- */
/* o filhote, sentado e de frente: orelhão, cara de raposa, peito branco,
   as "meias" pretas do guará e o rabo de ponta branca */
export function lobinho(): Buf {
  const b = new Buf(32, 32);
  // rabo, saindo para a direita, atrás de tudo
  b.ellipse(24, 27, 6, 3, C.guara);
  b.ellipse(29, 25, 2, 2, C.guaraB);
  // corpo sentado, as ancas e o peito branco
  b.ellipse(10, 28, 3, 2, C.guara); b.ellipse(22, 28, 3, 2, C.guara);
  b.ellipse(16, 24, 7, 6, C.guara);
  b.ellipse(16, 22, 4, 4, C.guaraB);
  b.tri(13, 25, 16, 28, 19, 25, C.guaraB);
  // as patas da frente, de meia preta
  b.rect(12, 25, 3, 5, C.guaraP); b.rect(17, 25, 3, 5, C.guaraP);
  b.ellipse(13, 30, 2, 1, C.guaraP); b.ellipse(18, 30, 2, 1, C.guaraP);
  // orelhões, de dentro creme e ponta escura
  b.tri(5, 13, 6, 1, 13, 7, C.guara); b.tri(27, 13, 26, 1, 19, 7, C.guara);
  b.tri(7, 11, 7, 4, 11, 8, C.guaraC); b.tri(25, 11, 25, 4, 21, 8, C.guaraC);
  b.tri(6, 3, 6, 1, 8, 3, C.guaraP); b.tri(26, 3, 26, 1, 24, 3, C.guaraP);
  // cabeção, a parte branca da cara e os tufos da bochecha
  b.ellipse(16, 12, 9, 7, C.guara);
  b.tri(14, 6, 16, 3, 18, 6, C.guara);
  b.ellipse(16, 16, 6, 3, C.guaraB);
  b.tri(8, 13, 6, 17, 11, 17, C.guaraB); b.tri(24, 13, 26, 17, 21, 17, C.guaraB);
  // a carinha: olho preto com brilho, focinho, boca aberta de alegria
  for (const x of [11, 19]) { b.rect(x, 11, 2, 3, C.olhoP); b.set(x, 11, C.bril); }
  b.rect(8, 14, 2, 1, C.bochecha); b.rect(22, 14, 2, 1, C.bochecha);
  b.rect(15, 14, 2, 1, C.olhoP);
  b.rect(15, 16, 2, 2, C.bocaA);
  b.set(15, 16, C.boca); b.set(16, 16, C.boca);
  return b.outline(P.ink);
}

/* ---------------- LOBISOMEM (Sombra, evolução) ---------------- */
/* o guará crescido, mais escuro e bravo: a crina preta arrepiada no
   cangote, as sobrancelhas fechadas e os dentes à mostra */
export function lobisomem(): Buf {
  const b = new Buf(40, 40);
  // o rabo, atrás de tudo
  b.tri(25, 31, 38, 25, 31, 35, C.lobi);
  b.tri(33, 27, 38, 25, 35, 29, C.lobiL);
  // pernas, pés e o calção rasgado
  b.rect(14, 32, 4, 5, C.lobi); b.rect(22, 32, 4, 5, C.lobi);
  b.ellipse(15, 37, 3, 1, C.lobi); b.ellipse(25, 37, 3, 1, C.lobi);
  b.rect(13, 29, 14, 3, C.calcao);
  for (const x of [14, 18, 22, 26]) b.tri(x - 1, 31, x + 1, 31, x, 34, C.calcao);
  // a camisa rasgada
  b.ellipse(20, 25, 7, 6, C.camisa);
  for (const x of [14, 17, 20, 23, 26]) b.tri(x - 1, 29, x + 1, 29, x, 32, C.camisa);
  b.tri(17, 20, 23, 20, 20, 24, C.lobiL);
  // braços abertos, de garra para cima
  b.ellipse(11, 23, 3, 2, C.camisaD); b.ellipse(29, 23, 3, 2, C.camisaD);
  b.ellipse(6, 23, 3, 2, C.lobi); b.ellipse(34, 23, 3, 2, C.lobi);
  b.ellipse(4, 20, 3, 3, C.lobi); b.ellipse(36, 20, 3, 3, C.lobi);
  for (const x of [2, 4, 6]) b.line(x, 17, x, 15, C.garra);
  for (const x of [34, 36, 38]) b.line(x, 17, x, 15, C.garra);
  // orelhas, cabeção e os tufos da bochecha
  b.tri(10, 9, 9, 0, 16, 5, C.lobi); b.tri(30, 9, 31, 0, 24, 5, C.lobi);
  b.tri(11, 7, 11, 2, 14, 5, C.lobiL); b.tri(29, 7, 29, 2, 26, 5, C.lobiL);
  b.ellipse(20, 12, 10, 8, C.lobi);
  b.tri(17, 5, 20, 1, 23, 5, C.lobi);
  b.tri(11, 13, 7, 18, 13, 18, C.lobi); b.tri(29, 13, 33, 18, 27, 18, C.lobi);
  b.ellipse(20, 15, 6, 4, C.lobiL);
  // a cara: olhão, sobrancelha, focinho e o sorriso de presas
  olhao(b, 15, 10, 3, 0); olhao(b, 25, 10, 3, -1);
  b.line(12, 6, 17, 6, C.lobiD); b.line(23, 6, 28, 6, C.lobiD);
  b.rect(18, 13, 4, 2, C.focinhoL); b.set(18, 13, C.lobiL);
  // o sorriso de presas, com a língua vermelha
  b.set(14, 16, C.bocaF); b.rect(15, 17, 11, 2, C.bocaF); b.set(26, 16, C.bocaF);
  b.rect(19, 18, 4, 2, C.linguaL);
  b.set(16, 17, P.white); b.set(24, 17, P.white);
  return b.outline(P.ink);
}

/* ---------------- CORPO-SECO (Sombra/Terra) ---------------- */
export function corpoSeco(): Buf {
  const b = new Buf(40, 40);
  const pele = '#8a7a5a', peleD = '#5a4e38', trapo = '#4a4038';
  b.ellipse(20, 38, 12, 2, '#3a2e24');
  b.rect(15, 26, 4, 12, peleD); b.rect(22, 26, 4, 12, peleD);          // pernas finas
  b.tri(11, 28, 20, 12, 29, 28, trapo);                                 // trapo
  b.rect(17, 13, 7, 14, pele);                                          // tronco magro
  for (const y of [16, 19, 22]) b.line(17, y, 23, y, peleD);            // costelas
  b.line(17, 15, 6, 8, pele); b.line(6, 8, 3, 2, pele);                 // braço erguido, galho seco
  b.line(3, 2, 1, 0, peleD); b.line(3, 2, 6, 0, peleD);
  b.line(24, 15, 32, 24, pele); b.line(32, 24, 35, 30, peleD);
  b.ellipse(20, 8, 5, 6, pele);                                         // cabeça funda
  b.ellipse(18, 7, 2, 2, '#1a1410'); b.ellipse(23, 7, 2, 2, '#1a1410');
  b.set(18, 7, '#c9c040'); b.set(23, 7, '#c9c040');
  b.rect(18, 11, 5, 1, '#1a1410');
  return b.outline(P.ink);
}

/* ---------------- CUCA (Sombra) ---------------- */
export function cuca(): Buf {
  const b = new Buf(40, 40);
  cucaDePe(b, false);
  return b.outline(P.ink);
}

/* ---------------- PISADEIRA (Sombra/Vento, exclusiva) ---------------- */
export function pisadeira(): Buf {
  const b = new Buf(40, 40);
  const pele = '#b8b0a8', peleD = '#8a827a', vestido = '#2e2440', cabelo = '#1a1424';
  // telhado embaixo dos pés
  b.tri(0, 39, 20, 30, 40, 39, '#8a3a2a'); b.line(0, 39, 20, 30, '#5a2418'); b.line(20, 30, 40, 39, '#5a2418');
  b.rect(15, 24, 2, 8, peleD); b.rect(23, 24, 2, 8, peleD);            // pernas compridas
  b.tri(12, 26, 20, 10, 28, 26, vestido);                              // vestido magro
  b.line(14, 13, 4, 20, pele); b.line(26, 13, 36, 20, pele);           // braços abertos
  for (const [x, d] of [[4, -1], [36, 1]] as const) for (const k of [0, 2, 4]) b.line(x, 20, x + d * 3, 20 + k, '#e8e0d0');
  b.ellipse(20, 7, 4, 5, pele);                                        // rosto comprido
  b.tri(14, 4, 20, 0, 26, 4, cabelo); b.rect(15, 3, 3, 12, cabelo); b.rect(23, 3, 3, 12, cabelo);
  b.ellipse(18, 7, 1, 1, '#c93f3f'); b.ellipse(22, 7, 1, 1, '#c93f3f');
  b.line(18, 10, 22, 10, peleD);
  return b.outline(P.ink);
}

/* ---------------- LUZEIRO (Luz) ---------------- */
export function luzeiro(): Buf {
  const b = new Buf(32, 32);
  const luz = '#ffe860', luzL = '#fffbe0', luzD = '#e8b830';
  // estrela de cinco pontas, gordinha
  for (const [x0, y0, x1, y1, x2, y2] of [[16, 2, 12, 14, 20, 14], [3, 12, 14, 12, 12, 20], [29, 12, 18, 12, 20, 20],
                                          [8, 29, 13, 18, 18, 22], [24, 29, 19, 18, 14, 22]] as const) {
    b.tri(x0, y0, x1, y1, x2, y2, luzD);
  }
  b.ellipse(16, 17, 8, 7, luz);
  b.ellipse(14, 15, 4, 3, luzL);
  olho(b, 13, 16, 2, 1); olho(b, 19, 16, 2, -1);
  b.line(14, 21, 18, 21, luzD);
  for (const [x, y] of [[4, 4], [28, 5], [2, 24], [30, 22]] as const) b.set(x, y, luzL);
  return b.outline(P.ink);
}

/* ---------------- ESTRELA-D'ALVA (Luz, evolução) ---------------- */
export function estrelaDalva(): Buf {
  const b = new Buf(40, 40);
  const luz = '#ffe860', luzL = '#fffbe0', luzD = '#d8a020', azul = '#8ac8f0';
  // cauda de cometa atrás, em três riscos
  b.tri(0, 32, 14, 22, 12, 28, azul); b.tri(2, 38, 16, 26, 14, 31, '#b8e0f8'); b.tri(6, 22, 16, 20, 14, 24, azul);
  // estrela de oito pontas
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4, r = k % 2 === 0 ? 17 : 12;
    const x = 22 + Math.cos(a) * r, y = 18 + Math.sin(a) * r;
    b.tri(22, 18, x + Math.cos(a + Math.PI / 2) * 3, y + Math.sin(a + Math.PI / 2) * 3, x, y, luzD);
  }
  b.ellipse(22, 18, 10, 10, luz);
  b.ellipse(19, 15, 5, 4, luzL);
  olho(b, 18, 18, 2, 1); olho(b, 26, 18, 2, -1);
  b.line(20, 23, 24, 23, luzD);
  return b.outline(P.ink);
}

/* ---------------- LAMPARINA (Luz/Fogo) ---------------- */
export function lamparina(): Buf {
  const b = new Buf(40, 40);
  const lata = '#8a8f99', lataD = '#5c616b', chama = P.fireL, chamaD = P.fire;
  b.ellipse(20, 34, 12, 4, lataD); b.rect(10, 22, 20, 12, lata); b.rect(10, 22, 20, 2, '#b8bcc4');   // corpo de lata
  b.rect(28, 24, 6, 3, lataD);                                                                        // bico
  b.line(8, 26, 4, 20, lataD); b.line(4, 20, 8, 16, lataD);                                           // alça
  b.rect(18, 17, 4, 5, '#e8e0d0');                                                                    // pavio
  b.tri(12, 18, 20, -1, 28, 18, chamaD); b.tri(15, 17, 20, 3, 25, 17, chama); b.ellipse(20, 14, 3, 3, '#fff6b0');
  olho(b, 16, 28, 2, 1); olho(b, 24, 28, 2, -1);
  return b.outline(P.ink);
}

/* ---------------- JACI (Luz/Sombra, exclusiva) ---------------- */
export function jaci(): Buf {
  const b = new Buf(40, 40);
  const lua = '#f2ecd8', luaD = '#c8c0a8', noite = '#2e2440';
  b.ellipse(20, 20, 18, 18, noite);                                                  // o céu em volta
  for (const [x, y] of [[6, 8], [32, 6], [8, 32], [34, 30], [28, 36]] as const) b.set(x, y, '#fff6b0');
  b.ellipse(20, 20, 13, 13, lua);                                                    // a lua cheia
  b.ellipse(25, 18, 11, 12, '#4a3a5e');                                              // a sombra que come metade
  for (const [x, y, r] of [[12, 14, 2], [14, 25, 3], [10, 20, 1]] as const) b.ellipse(x, y, r, r, luaD);
  olho(b, 12, 19, 2, 1);
  b.ellipse(26, 18, 2, 2, '#f2d23a'); b.set(26, 18, P.ink);                          // o olho do lado escuro
  b.line(11, 25, 15, 26, luaD);
  return b.outline(P.ink);
}

/* =========================================================================
   Evoluções novas: a forma de cima de cada linhagem. Todas 40x40.
   ========================================================================= */

/* ---------------- MBOITATÁ (Fogo, 3ª forma da Boitatinha) ---------------- */
export function mboitata(): Buf {
  const b = new Buf(40, 40);
  cobraDeFogo(b, true);
  return b.outline(P.ink);
}

/* ---------------- IPUPIARA (Água/Sombra, 3ª forma da Iarinha) ---------------- */
export function ipupiara(): Buf {
  const b = new Buf(40, 40);
  const mar = '#1f5c8a', marL = '#3a8fd5', marD = '#123a5a', alga = '#2f7a5a';
  b.ellipse(20, 37, 19, 3, marD);                       // o fundo do mar
  // cauda enorme enrolada
  b.ellipse(20, 30, 14, 7, mar);
  b.ellipse(20, 30, 9, 4, marL);
  b.tri(32, 28, 40, 20, 39, 34, marD);
  // torso e braços compridos de água
  b.ellipse(20, 20, 8, 7, '#1b4a6b');
  b.ellipse(20, 22, 5, 4, marL);
  b.ellipse(9, 19, 3, 7, mar); b.ellipse(31, 19, 3, 7, mar);
  for (const [x, d] of [[8, -1], [32, 1]] as const) b.line(x, 25, x + d * 3, 28, marL);
  // cabeça com cabelo de alga e coroa de coral quebrada
  b.ellipse(20, 10, 7, 7, '#6a8fa0');
  for (const x of [11, 12, 28, 29]) for (let y = 6; y <= 24; y++) b.set(x, y, alga);
  b.ellipse(20, 5, 8, 3, alga);
  b.rect(15, 1, 11, 2, P.goldD);
  for (const x of [15, 22]) b.tri(x - 2, 2, x, -1, x + 2, 2, P.gold);
  b.ellipse(17, 10, 2, 2, '#9fe8ff'); b.ellipse(23, 10, 2, 2, '#9fe8ff');
  b.set(17, 10, P.ink); b.set(23, 10, P.ink);
  b.line(17, 14, 23, 14, marD);
  for (const [x, y] of [[4, 8], [36, 6], [3, 26], [37, 14]] as const) {
    b.ellipse(x, y, 1, 1, marL); b.set(x, y - 1, '#ffffff');
  }
  return b.outline(P.ink);
}

/* ---------------- ANHANGÁ (Planta/Luz, 3ª forma do Curupinho) ---------------- */
export function anhanga(): Buf {
  const b = new Buf(40, 40);
  const pelo = '#f2eee4', peloD = '#c8c0b0', chifre = '#6b4a2e';
  // o veado branco, de lado, virado para a esquerda
  for (const x of [11, 15, 25, 29]) b.rect(x, 27, 3, 12, peloD);
  b.ellipse(21, 23, 12, 7, pelo);
  b.ellipse(22, 26, 8, 3, peloD);
  b.tri(32, 20, 37, 17, 34, 24, pelo);                  // rabinho
  b.rect(9, 11, 6, 12, pelo);                           // pescoço
  b.ellipse(9, 10, 6, 5, pelo);                         // cabeça
  b.ellipse(4, 12, 3, 2, peloD);                        // focinho
  b.set(2, 12, P.ink);
  b.tri(13, 7, 17, 3, 15, 9, pelo);                     // orelha
  // galhada de raiz, com folhas brotando
  b.line(8, 5, 5, 0, chifre); b.line(6, 2, 2, 1, chifre);
  b.line(11, 5, 14, 0, chifre); b.line(13, 2, 17, 1, chifre);
  for (const [x, y] of [[2, 1], [17, 1], [5, 0], [14, 0]] as const) b.ellipse(x, y, 1, 1, C.curL);
  // olho de fogo
  b.ellipse(8, 9, 2, 2, C.fogoC); b.set(8, 9, C.fogoCL);
  // folhas no lombo e brilho em volta
  for (const [x, y] of [[17, 17], [23, 16], [28, 18]] as const) b.ellipse(x, y, 2, 1, C.cur);
  for (const [x, y] of [[30, 6], [35, 10], [24, 4]] as const) { b.set(x, y, '#fffbe0'); b.set(x + 1, y, '#fff6b0'); }
  return b.outline(P.ink);
}

/* ---------------- PIRAGUAÇU (Água, evolução do Piraguá) ---------------- */
export function piraguacu(): Buf {
  const b = new Buf(40, 40);
  const cor = '#2f8fb0', corL = '#6fcfe8', corD = '#1c5f78', barriga = '#f3e9b8';
  b.tri(10, 20, 0, 8, 0, 32, corD);                     // cauda
  b.tri(10, 20, 3, 12, 3, 28, cor);
  b.ellipse(22, 20, 15, 11, cor);                       // corpo grande
  b.ellipse(23, 25, 12, 5, barriga);
  b.ellipse(18, 14, 9, 3, corL);
  b.tri(20, 9, 14, 0, 28, 8, corD);                     // barbatana de cima, alta
  b.tri(22, 31, 16, 39, 27, 31, corD);
  for (let i = 0; i < 4; i++) b.line(18 + i * 4, 13 + i, 18 + i * 4, 25 - i, corD);   // escamas
  // bocarra cheia de dentes
  b.tri(29, 22, 40, 18, 40, 29, '#e8607a');
  b.line(29, 22, 40, 25, '#a8324a');
  for (const x of [32, 35, 38]) { b.set(x, 21, P.white); b.set(x, 27, P.white); }
  olho(b, 31, 15, 3, 1);
  b.line(28, 12, 33, 13, corD);                         // sobrancelha brava
  return b.outline(P.ink);
}

/* ---------------- TEINIAGUÁ (Fogo/Terra, evolução da Salamanca) ---------------- */
export function teiniagua(): Buf {
  const b = new Buf(40, 40);
  b.ellipse(20, 37, 18, 2, C.escD);
  // lagarto grande de lado, cauda curva
  b.ellipse(20, 28, 13, 6, C.sal);
  b.ellipse(20, 30, 9, 3, C.salL);
  for (const x of [11, 16, 23, 28]) b.rect(x, 31, 3, 6, C.salD);
  b.ellipse(5, 25, 4, 3, C.sal); b.ellipse(2, 20, 2, 3, C.sal);
  for (const x of [12, 17, 22, 27]) b.tri(x - 2, 23, x, 18, x + 2, 23, C.esc);   // cristas de pedra
  b.ellipse(31, 20, 8, 6, C.sal);                       // cabeça
  b.ellipse(35, 23, 5, 2, C.salL);
  b.line(29, 24, 39, 24, C.salD);
  olho(b, 32, 18, 2, -1);
  // a pedra de fogo na testa, o carbúnculo
  b.ellipse(31, 12, 4, 4, '#c9302a');
  b.ellipse(30, 11, 2, 2, '#ff8a6a');
  b.set(29, 10, '#ffffff');
  chama(b, 31, 8, 3, 6, '#ff6a22', '#ffc23c');
  return b.outline(P.ink);
}

/* ---------------- MATINTA-PERERA (Vento/Sombra, evolução da Matinta) ---------------- */
export function matintaPerera(): Buf {
  const b = new Buf(40, 40);
  const pena = '#3a2e44', penaL = '#5e4e6e', penaD = '#221a2a', bico = '#e0b040';
  // coruja grande de asas abertas
  b.tri(20, 16, 0, 10, 4, 30, penaD);
  b.tri(20, 16, 40, 10, 36, 30, penaD);
  for (const [x, d] of [[3, 1], [37, -1]] as const) for (const k of [0, 4, 8]) b.line(x, 14 + k, x + d * 8, 16 + k, penaL);
  b.ellipse(20, 24, 10, 12, pena);
  b.ellipse(20, 27, 6, 8, penaL);
  for (const y of [22, 26, 30]) b.line(17, y, 23, y, pena);
  b.ellipse(20, 11, 9, 8, pena);                         // cabeça
  b.tri(11, 6, 11, 0, 15, 5, pena); b.tri(29, 6, 29, 0, 25, 5, pena);   // tufos
  b.ellipse(16, 11, 4, 4, '#f2e8c0'); b.ellipse(24, 11, 4, 4, '#f2e8c0');
  b.ellipse(16, 11, 2, 2, '#c93f3f'); b.ellipse(24, 11, 2, 2, '#c93f3f');
  b.tri(19, 14, 21, 14, 20, 18, bico);
  // o lenço de véia amarrado no pescoço
  b.rect(14, 18, 13, 2, '#a8324a'); b.tri(20, 19, 17, 24, 23, 24, '#a8324a');
  for (const x of [15, 19, 23]) b.line(x, 36, x - 1, 39, bico);   // garras
  return b.outline(P.ink);
}

/* ---------------- TATUAÇU (Raio/Terra, evolução do Tatu-Trovão) ---------------- */
export function tatuacu(): Buf {
  const b = new Buf(40, 40);
  const casco = '#7a6a5a', cascoL = '#9c8a78', cascoD = '#4a3e32', pele = '#c9a07a';
  b.ellipse(20, 37, 19, 2, cascoD);
  for (const x of [8, 14, 25, 31]) b.rect(x, 30, 4, 7, pele);
  b.ellipse(20, 22, 17, 12, casco);                     // o casco enorme
  for (let i = -2; i <= 2; i++) b.line(20 + i * 5, 11, 20 + i * 6, 33, cascoD);   // cintas
  b.ellipse(15, 16, 5, 3, cascoL);
  // raios presos no casco
  for (const [x, y] of [[12, 18], [26, 14], [22, 26]] as const) {
    b.line(x, y, x - 2, y + 3, P.bolt); b.line(x - 2, y + 3, x + 1, y + 4, P.bolt); b.line(x + 1, y + 4, x - 1, y + 7, P.bolt);
  }
  b.ellipse(36, 27, 4, 4, pele);                        // cabeça pontuda
  b.tri(37, 25, 40, 31, 36, 31, pele);
  b.ellipse(34, 20, 2, 3, pele);
  olho(b, 36, 26, 1, 1);
  b.tri(3, 26, 0, 36, 6, 30, casco);                    // rabo
  return b.outline(P.ink);
}

/* ---------------- ALMA-PENADA (Sombra/Terra, evolução do Corpo-Seco) ---------------- */
export function almaPenada(): Buf {
  const b = new Buf(40, 40);
  const veu = '#c8d0e0', veuL = '#eef2f8', veuD = '#8a92a8', corrente = '#6a6a72';
  // lençol que flutua, sem pé no chão
  b.ellipse(20, 16, 11, 12, veu);
  b.rect(9, 16, 23, 14, veu);
  for (const x of [9, 15, 21, 27]) b.tri(x, 29, x + 3, 36, x + 6, 29, veu);
  b.ellipse(16, 11, 4, 3, veuL);
  for (const x of [13, 20, 27]) b.line(x, 18, x, 30, veuD);
  // olhos fundos e boca de lamento
  b.ellipse(16, 14, 2, 3, '#1a1410'); b.ellipse(24, 14, 2, 3, '#1a1410');
  b.set(16, 14, '#c9c040'); b.set(24, 14, '#c9c040');
  b.ellipse(20, 21, 2, 3, '#1a1410');
  // a corrente que ela arrasta
  for (let k = 0; k < 6; k++) b.frame(29 + k, 26 + k * 2, 3, 2, corrente);
  b.rect(33, 37, 6, 3, '#4a4a52');
  // galho seco do corpo que ficou para trás
  b.line(4, 38, 8, 28, '#5a4e38'); b.line(8, 28, 5, 24, '#5a4e38'); b.line(8, 28, 11, 25, '#5a4e38');
  return b.outline(P.ink);
}

/* ---------------- CUCA-RAINHA (Sombra/Água, evolução da Cuca) ---------------- */
export function cucaRainha(): Buf {
  const b = new Buf(40, 40);
  // o manto de rainha, atrás
  b.tri(4, 39, 19, 12, 34, 39, C.manto);
  b.tri(10, 39, 19, 18, 28, 39, C.mantoL);
  cucaDePe(b, true);
  return b.outline(P.ink);
}

/* ---------------- PESADELO (Sombra/Vento, evolução da Pisadeira) ---------------- */
export function pesadelo(): Buf {
  const b = new Buf(40, 40);
  const noite = '#2e2440', noiteL = '#4a3a64', pele = '#9890a0', cabelo = '#120e1a';
  // manto que se desfaz em fumaça
  b.ellipse(20, 20, 14, 15, noite);
  for (const x of [6, 12, 18, 24, 30]) b.tri(x, 32, x + 3, 40, x + 6, 32, noite);
  for (const [x, y] of [[4, 10], [35, 12], [2, 22], [37, 26]] as const) b.ellipse(x, y, 2, 2, noiteL);
  // braços muito compridos, unhas de fora
  b.line(10, 16, 1, 30, pele); b.line(30, 16, 39, 30, pele);
  for (const [x, d] of [[1, 1], [39, -1]] as const) for (const k of [0, 2, 4]) b.line(x, 30, x + d * k, 35, '#e8e0d0');
  // rosto comprido com cabelo escorrido
  b.ellipse(20, 12, 5, 7, pele);
  b.rect(13, 4, 3, 18, cabelo); b.rect(24, 4, 3, 18, cabelo);
  b.tri(13, 6, 20, 1, 27, 6, cabelo);
  b.ellipse(18, 11, 1, 2, '#ff4a4a'); b.ellipse(22, 11, 1, 2, '#ff4a4a');
  b.line(17, 16, 23, 16, '#5a5268');
  b.set(18, 17, '#e8e0d0'); b.set(22, 17, '#e8e0d0');
  // lua minguante presa no manto
  b.ellipse(20, 27, 4, 4, '#f2ecd8'); b.ellipse(22, 26, 4, 4, noite);
  return b.outline(P.ink);
}

/* ---------------- JUMA (Terra, evolução do Mapinguari) ---------------- */
export function juma(): Buf {
  const b = new Buf(40, 40);
  const pelo = '#d8d0c0', peloL = '#f2ece0', peloD = '#a89c88', boca = '#7a1e1a';
  b.rect(9, 30, 8, 9, peloD); b.rect(23, 30, 8, 9, peloD);
  b.ellipse(13, 38, 6, 2, '#6a5e4a'); b.ellipse(27, 38, 6, 2, '#6a5e4a');
  b.ellipse(20, 21, 17, 14, pelo);                      // corpanzil de pelo branco
  for (const [x, y] of [[8, 12], [32, 12], [5, 24], [35, 24], [20, 8], [13, 32], [27, 32]] as const) b.ellipse(x, y, 3, 2, peloL);
  b.ellipse(20, 25, 8, 6, boca);                        // boca na barriga, maior
  b.ellipse(20, 26, 6, 4, '#3a0a08');
  for (const x of [14, 17, 20, 23, 26]) b.tri(x - 1, 20, x + 1, 20, x, 23, '#e8e0d0');
  for (const x of [16, 20, 24]) b.tri(x - 1, 31, x + 1, 31, x, 28, '#e8e0d0');
  b.ellipse(3, 20, 4, 8, pelo); b.ellipse(37, 20, 4, 8, pelo);
  for (const [x, d] of [[1, -1], [38, 1]] as const) { b.line(x, 27, x + d, 31, '#e8e0d0'); b.line(x + 2 * -d, 27, x + d - 2 * d, 31, '#e8e0d0'); }
  b.ellipse(20, 9, 5, 5, '#f2f0ea');                    // olho único, maior
  b.ellipse(20, 9, 3, 3, '#e8a020');
  b.ellipse(20, 9, 1, 2, P.ink);
  b.line(14, 4, 26, 4, peloD);                          // testa franzida
  return b.outline(P.ink);
}

/* ---------------- UIRAPURU-REI (Vento/Luz, evolução do Uirapuru) ---------------- */
export function uirapuruRei(): Buf {
  const b = new Buf(40, 40);
  const pena = '#f2d23a', penaL = '#fff2a0', dourado = '#ffb030', asa = '#3a8fd5', asaD = '#245f9e';
  // cauda longa em leque
  for (const [x, y] of [[4, 36], [9, 39], [2, 29]] as const) b.tri(16, 26, x, y, x + 5, y - 2, asaD);
  b.tri(16, 26, 6, 38, 10, 36, dourado);
  // asas abertas pra cima
  b.tri(18, 20, 2, 4, 12, 24, asaD); b.tri(18, 20, 5, 7, 12, 22, asa);
  b.tri(24, 20, 38, 2, 30, 24, asaD); b.tri(24, 20, 35, 6, 29, 22, asa);
  b.ellipse(21, 23, 8, 7, pena);                        // corpo
  b.ellipse(22, 25, 5, 4, penaL);
  b.ellipse(23, 13, 6, 5, pena);                        // cabeça
  b.tri(28, 13, 34, 14, 28, 15, '#3a2a1a');             // bico aberto, cantando
  b.tri(28, 15, 33, 16, 28, 16, '#3a2a1a');
  olho(b, 24, 12, 2, 1);
  // coroa de penas douradas
  for (const x of [19, 22, 25]) b.tri(x - 1, 9, x, 3, x + 1, 9, dourado);
  // notas do canto
  for (const [x, y] of [[35, 20], [37, 26]] as const) { b.ellipse(x, y, 1, 1, dourado); b.line(x + 1, y, x + 1, y - 4, dourado); }
  for (const x of [19, 23]) b.line(x, 30, x, 34, '#3a2a1a');
  return b.outline(P.ink);
}

/* ---------------- FOGO-FÁTUO (Luz/Fogo, evolução da Lamparina) ---------------- */
export function fogoFatuo(): Buf {
  const b = new Buf(40, 40);
  const azul = '#4a9ff0', azulL = '#a8dcff', azulD = '#2a5fb0', lata = '#5c616b';
  // chama azul grande que corre, com rabo de luz
  b.tri(2, 36, 16, 20, 18, 30, azulD); b.tri(6, 38, 18, 26, 20, 33, azul);
  b.tri(8, 34, 20, 0, 32, 34, azulD);
  b.tri(11, 33, 20, 5, 29, 33, azul);
  b.ellipse(20, 27, 10, 8, azul);
  b.ellipse(20, 26, 6, 5, azulL);
  b.ellipse(19, 23, 3, 3, '#ffffff');
  olho(b, 16, 27, 2, 1); olho(b, 24, 27, 2, -1);
  b.line(18, 31, 22, 31, azulD);
  // a alça da lamparina velha, pendurada no dedo de fogo
  b.line(30, 18, 35, 14, lata); b.line(35, 14, 38, 18, lata);
  b.rect(34, 18, 5, 4, lata); b.set(36, 19, '#ffe860');
  for (const [x, y] of [[4, 8], [34, 4], [38, 30], [6, 22]] as const) { b.set(x, y, azulL); b.set(x, y + 1, azul); }
  return b.outline(P.ink);
}

/* ---------------- BOIÚNA (Água/Raio, evolução do Arco-da-Velha) ---------------- */
export function boiuna(): Buf {
  const b = new Buf(40, 40);
  const cobra = '#2a3e4a', cobraL = '#4a6a78', cobraD = '#16242c', luz = '#fff2a0';
  b.ellipse(20, 36, 19, 3, P.waterD);                   // o rio
  b.ellipse(20, 36, 17, 2, P.water);
  // voltas da cobra grande saindo da água
  b.ellipse(8, 32, 6, 6, cobra); b.ellipse(8, 33, 4, 3, P.water);
  b.ellipse(22, 30, 7, 7, cobra); b.ellipse(22, 32, 5, 4, P.water);
  for (const [x, y] of [[8, 27], [22, 24]] as const) b.line(x - 3, y, x + 3, y, cobraL);
  b.rect(30, 14, 7, 20, cobra);                         // pescoço erguido
  for (const y of [18, 23, 28]) b.line(31, y, 36, y, cobraD);
  b.ellipse(28, 11, 10, 6, cobra);                      // cabeça
  b.ellipse(24, 13, 6, 2, cobraL);
  b.line(18, 14, 32, 14, cobraD);
  // os olhos que parecem luz de navio
  b.ellipse(24, 8, 3, 2, luz); b.set(24, 8, '#ffffff');
  b.ellipse(32, 8, 3, 2, luz); b.set(32, 8, '#ffffff');
  for (const [x, y] of [[18, 7], [14, 6], [38, 7]] as const) b.set(x, y, luz);
  // faixa de arco-íris no dorso: não esqueceu de onde veio
  const faixas = ['#e0524a', '#f09a3a', P.bolt, '#5fbf6a', '#4a9fd0'];
  faixas.forEach((c, i) => b.line(31 + i, 16, 31 + i, 33, c));
  // raio caindo atrás
  b.line(6, 0, 3, 8, P.bolt); b.line(3, 8, 7, 9, P.bolt); b.line(7, 9, 4, 18, P.bolt);
  return b.outline(P.ink);
}

/* ---------------- ELDORADO (Fogo/Luz, evolução da Mãe-do-Ouro) ---------------- */
export function eldorado(): Buf {
  const b = new Buf(40, 40);
  // serra de ouro com uma cidade dormindo no alto, e ela é o rosto da serra
  b.tri(0, 39, 12, 16, 22, 39, C.ourD);
  b.tri(14, 39, 28, 10, 40, 39, C.our);
  b.tri(6, 39, 20, 4, 34, 39, C.our);
  b.tri(12, 39, 20, 10, 28, 39, C.ourL);
  // torres da cidade
  for (const [x, h] of [[15, 6], [19, 9], [23, 7]] as const) {
    b.rect(x, 12 - h + 6, 3, h, C.ourD);
    b.tri(x - 1, 12 - h + 6, x + 1, 12 - h + 2, x + 3, 12 - h + 6, C.our);
  }
  // rosto
  olho(b, 16, 24, 2, 1); olho(b, 24, 24, 2, -1);
  b.line(17, 30, 23, 30, C.ourD);
  // coroa de chamas no pico
  chama(b, 20, 4, 3, 5, '#ff6a22', '#ffc23c');
  for (const [x, y] of [[4, 10], [34, 8], [8, 4], [37, 20]] as const) {
    b.set(x, y, '#ffffff'); b.set(x - 1, y, C.ourL); b.set(x + 1, y, C.ourL); b.set(x, y - 1, C.ourL); b.set(x, y + 1, C.ourL);
  }
  return b.outline(P.ink);
}

/* ---------------- ECLIPSE (Luz/Sombra, evolução da Jaci) ---------------- */
export function eclipse(): Buf {
  const b = new Buf(40, 40);
  const sol = '#ffb030', solL = '#ffe890', lua = '#2e2440';
  // coroa do sol aparecendo em volta
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    b.tri(20 + Math.cos(a - 0.2) * 12, 20 + Math.sin(a - 0.2) * 12,
          20 + Math.cos(a) * 19, 20 + Math.sin(a) * 19,
          20 + Math.cos(a + 0.2) * 12, 20 + Math.sin(a + 0.2) * 12, k % 2 ? sol : solL);
  }
  b.ellipse(20, 20, 13, 13, solL);
  b.ellipse(20, 20, 12, 12, lua);                       // a lua na frente do sol
  b.ellipse(16, 16, 3, 2, '#4a3a5e');
  // um olho de dia e um de noite
  b.ellipse(15, 20, 2, 2, '#fff6b0'); b.set(15, 20, P.ink);
  b.ellipse(25, 20, 2, 2, '#9fc8ff'); b.set(25, 20, P.ink);
  b.line(17, 26, 23, 26, '#6a5a80');
  b.set(33, 11, '#ffffff'); b.set(34, 11, solL); b.set(33, 10, solL);   // o anel de diamante
  return b.outline(P.ink);
}

/* -------------------------------------------------------------------------
   Registro: liga a chave `arte` de cada espécie ao desenho.
   É por aqui que a batalha e o Caderno acham o sprite certo.
   ------------------------------------------------------------------------- */
/* ---------------- BOTO (Água/Luz, o secreto) ---------------- */
export function boto(): Buf {
  const b = new Buf(32, 32);
  const rosa = '#e88aa8', rosaL = '#f6bfd0', rosaD = '#b85a7a';
  b.ellipse(16, 30, 13, 2, '#3a8fd5');                  // a água em volta
  // corpo arqueado, saltando
  b.ellipse(15, 20, 11, 7, rosa);
  b.ellipse(15, 23, 8, 3, rosaL);                       // barriga clara
  b.tri(24, 16, 31, 10, 29, 22, rosa);                  // cauda subindo
  b.tri(27, 9, 31, 6, 31, 13, rosaD);                   // nadadeira da cauda
  b.tri(14, 13, 19, 7, 20, 14, rosaD);                  // nadadeira de cima
  // cabeça com o bico comprido e o "melão" na testa
  b.ellipse(7, 17, 5, 5, rosa);
  b.ellipse(6, 13, 3, 2, rosaL);
  b.rect(0, 18, 5, 2, rosa);
  b.line(0, 20, 4, 20, rosaD);
  olho(b, 7, 16, 2, -1);
  // brilho de luz em volta
  for (const [x, y] of [[3, 5], [12, 3], [25, 25], [2, 26]] as const) {
    b.set(x, y, '#fffbe0'); b.set(x + 1, y, '#fff6b0'); b.set(x, y + 1, '#fff6b0');
  }
  return b.outline(P.ink);
}

/* ---------------- BOTO-ENCANTADO (Água/Luz, evolução do Boto) ---------------- */
export function botoEncantado(): Buf {
  const b = new Buf(40, 40);
  const rosa = '#e07898', rosaL = '#f6bfd0', rosaD = '#a84a6a', linho = '#f4f0e6', linhoD = '#cfc8b8';
  b.ellipse(20, 38, 17, 2, '#3a8fd5');
  // corpo de gente, de terno de linho branco
  b.rect(13, 22, 14, 14, linho);
  b.rect(13, 34, 5, 4, linhoD); b.rect(22, 34, 5, 4, linhoD);   // pernas
  b.line(20, 22, 20, 33, linhoD);
  b.ellipse(10, 27, 3, 6, linho); b.ellipse(30, 27, 3, 6, linho); // braços
  b.ellipse(10, 33, 2, 2, rosa); b.ellipse(30, 33, 2, 2, rosa);   // mãos rosadas
  b.rect(18, 22, 4, 3, '#d8455a');                     // gravata
  // cabeça de boto, com o bico e o chapéu branco
  b.ellipse(20, 15, 7, 7, rosa);
  b.ellipse(20, 18, 4, 2, rosaL);
  b.rect(12, 16, 4, 3, rosa); b.line(9, 18, 13, 18, rosaD); b.rect(9, 16, 4, 2, rosa);
  olho(b, 18, 13, 2, -1);
  b.ellipse(21, 8, 11, 2, linho);                      // aba do chapéu
  b.rect(15, 2, 12, 6, linho);
  b.rect(15, 6, 12, 1, '#d8455a');                     // fita
  // brilho em volta
  for (const [x, y] of [[4, 6], [35, 4], [36, 20], [3, 22]] as const) {
    b.set(x, y, '#fffbe0'); b.set(x + 1, y, '#fff6b0'); b.set(x, y + 1, '#fff6b0');
  }
  return b.outline(P.ink);
}

/* ---------------- COBRA NORATO (Água/Sombra, lendária escondida) ---------------- */
export function cobraNorato(): Buf {
  const b = new Buf(40, 40);
  const esc = '#1f3a3a', escL = '#2f5a52', escD = '#122424', barriga = '#8aa88a', olhoV = '#f0e050';
  b.ellipse(20, 38, 19, 2, '#123a5a');                  // o rio escuro
  // as voltas do corpo, uma atrás da outra
  b.ellipse(20, 33, 17, 5, esc);
  b.ellipse(20, 34, 12, 2, barriga);
  b.ellipse(14, 26, 11, 5, escL);
  b.ellipse(14, 27, 7, 2, barriga);
  b.line(4, 30, 36, 30, escD);
  // o pescoço subindo e a cabeça grande, de lado
  b.rect(18, 12, 7, 14, esc);
  b.line(20, 13, 20, 24, barriga);
  b.ellipse(24, 10, 10, 6, esc);
  b.ellipse(31, 12, 5, 3, escL);                        // focinho
  b.set(34, 11, P.ink);                                 // narina
  b.line(26, 14, 35, 14, escD);                         // boca
  // olho amarelo de fogo-fátuo, e as escamas brilhando de leve
  b.ellipse(24, 8, 2, 2, olhoV); b.set(24, 8, P.ink); b.set(25, 7, '#ffffff');
  for (const [x, y] of [[10, 25], [17, 24], [8, 32], [15, 33], [25, 33], [31, 32], [21, 17]] as const) {
    b.set(x, y, '#5fa8a0'); b.set(x + 1, y, '#3f8078');
  }
  // a pele velha largada no barranco, atrás
  b.line(1, 20, 6, 15, '#c8c0a0'); b.line(6, 15, 3, 10, '#c8c0a0');
  return b.outline(P.ink);
}

export const ARTE_CRIATURAS: Record<string, () => Buf> = {
  boto, botoEncantado, cobraNorato,
  boitatinha, boitatao, iarinha, iaraMae, curupinho, curupira,
  piragua, sacizinho, caiporinha,
  cabritinha, cabraCabriola, mulinha, mulaSemCabeca, salamanca, maeDoOuro,
  saci, matinta, uirapuru,
  faisquinha, relampo, tatuTrovao, arcoDaVelha,
  minhoquinha, minhocao, mapinguari, caipora,
  lobinho, lobisomem, corpoSeco, cuca, pisadeira,
  luzeiro, estrelaDalva, lamparina, jaci,
  mboitata, ipupiara, anhanga, piraguacu, teiniagua, matintaPerera, tatuacu,
  almaPenada, cucaRainha, pesadelo, juma, uirapuruRei, fogoFatuo, boiuna,
  eldorado, eclipse,
};
