/* Os Encantados. Desenhados com primitivas (elipses, triangulos) e depois
   contornados automaticamente — a mesma tecnica que o jogo vai usar. */
import { Buf } from '../core/buf.ts';
import { P } from './palette.ts';

const C: Record<string, string> = {
  // Boitata — serpente de fogo
  boi:  '#d9452a', boiL: '#f2845a', boiD: '#9e2d18', boiB: '#f7d9a8',
  // Iara — sereia das aguas
  iar:  '#3a8fd5', iarL: '#7fc4ef', iarD: '#245f9e', iarH: '#1b4a6b',
  pele: '#e0a97e', peleD: '#b8794f',
  // Curupira — guardiao da mata
  cur:  '#4e9f3f', curL: '#79c45f', curD: '#33702a',
  fogoC:'#e8541f', fogoCL:'#ffa63a',
  // gerais
  olho: '#ffffff', pup: '#191221', bril: '#ffffff',
  sombra: '#00000000',
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

/* ---------------- BOITATINHA (Fogo, inicial) ---------------- */
export function boitatinha(): Buf {
  const b = new Buf(32, 32);

  // corpo enrolado: duas voltas visiveis, a de baixo maior
  b.ellipse(16, 26, 12, 5, C.boi);
  b.ellipse(16, 27, 8, 3, C.boiB);            // barriga clara
  b.ellipse(16, 21, 9, 4, C.boi);             // volta de cima
  b.ellipse(16, 22, 5, 2, C.boiB);
  b.line(7, 24, 25, 24, C.boiD);              // separacao entre as duas voltas
  b.ellipse(24, 24, 3, 3, C.boiD);            // ponta da cauda saindo do lado
  b.ellipse(27, 23, 2, 2, C.boi);

  // pescoco curto ligando cabeca ao corpo
  b.rect(13, 16, 6, 4, C.boi);

  // cabeca
  b.ellipse(16, 12, 7, 6, C.boi);
  b.ellipse(16, 15, 5, 3, C.boiB);            // focinho claro
  b.set(14, 14, C.boiD); b.set(18, 14, C.boiD); // narinas
  b.line(13, 16, 19, 16, C.boiD);             // linha da boca

  // crista de fogo, acima da cabeca, sem invadir o rosto
  chama(b, 16, 7, 6, 7, '#ff6a22', '#ffc23c');

  // olhos
  olho(b, 12, 11, 2, 1);
  olho(b, 20, 11, 2, -1);

  // lingua bifurcada
  b.line(16, 18, 16, 20, '#e8541f');
  return b.outline(P.ink);
}

/* ---------------- IARINHA (Água, inicial) ---------------- */
export function iarinha(): Buf {
  const b = new Buf(32, 32);

  // cauda (cy 24, ocupa 17..31)
  b.ellipse(16, 24, 7, 7, C.iar);
  b.ellipse(16, 23, 4, 5, C.iarL);            // brilho central
  // escamas: tracinhos escuros so nas laterais, para nao virar listra
  for (let i = 0; i < 3; i++) {
    b.line(10, 21 + i * 3, 12, 21 + i * 3, C.iarD);
    b.line(20, 21 + i * 3, 22, 21 + i * 3, C.iarD);
  }
  // nadadeira caudal: dois lobos discretos
  b.tri(16, 28, 7, 31, 15, 31, C.iarL);
  b.tri(16, 28, 25, 31, 17, 31, C.iarL);
  b.line(16, 28, 16, 31, C.iarD);

  // torso (cy 16)
  b.ellipse(16, 16, 5, 4, C.pele);
  b.ellipse(16, 18, 5, 2, C.iarL);            // top de escamas
  b.ellipse(11, 17, 2, 3, C.pele);            // bracos
  b.ellipse(21, 17, 2, 3, C.pele);

  // cabeca (cy 8)
  b.ellipse(16, 8, 6, 6, C.pele);

  // cabelo: franja por cima e mechas longas descendo pelos lados
  b.ellipse(16, 4, 7, 3, C.iarH);
  b.ellipse(16, 3, 5, 2, C.iarD);
  for (const x of [9, 10, 22, 23]) for (let y = 4; y <= 19; y++) b.set(x, y, C.iarH);
  for (const x of [10, 22]) for (let y = 4; y <= 9; y++) b.set(x, y, C.iarD);
  b.line(11, 4, 21, 4, C.iarH);               // franja

  // rosto
  olho(b, 13, 8, 2, 1);
  olho(b, 19, 8, 2, -1);
  b.set(15, 11, C.peleD); b.set(16, 11, C.peleD);

  // bolhinhas
  // bolhinhas: circulos de verdade, senao viram sujeirinha na tela
  for (const [x, y] of [[4, 10], [6, 4], [27, 6], [29, 14], [3, 21]]) {
    b.ellipse(x, y, 1, 1, C.iarL); b.set(x, y, '#cde8ff'); b.set(x, y - 1, '#ffffff');
  }
  return b.outline(P.ink);
}

/* ---------------- CURUPINHO (Planta, inicial) ---------------- */
export function curupinho(): Buf {
  const b = new Buf(32, 32);
  // pernas
  b.rect(13, 22, 3, 6, C.pele); b.rect(17, 22, 3, 6, C.pele);
  // pes VIRADOS PARA TRAS — a marca registrada do Curupira:
  // o calcanhar aponta para frente e os dedos para tras (para cima na tela)
  b.ellipse(12, 28, 3, 2, C.pele); b.ellipse(20, 28, 3, 2, C.pele);
  for (const x of [10, 12, 14]) { b.set(x, 26, C.pele); b.set(x, 25, C.peleD); }
  for (const x of [18, 20, 22]) { b.set(x, 26, C.pele); b.set(x, 25, C.peleD); }
  b.ellipse(16, 19, 8, 6, C.cur);            // corpo/folhagem
  b.ellipse(16, 18, 5, 3, C.curL);
  b.tri(8, 19, 2, 16, 9, 23, C.curD);        // folhas laterais
  b.tri(24, 19, 30, 16, 23, 23, C.curD);
  b.ellipse(16, 11, 6, 6, C.pele);           // cabeca
  b.ellipse(16, 15, 7, 2, C.curD);           // gola de folhas
  chama(b, 16, 6, 6, 8, C.fogoC, C.fogoCL);  // cabelo de fogo
  olho(b, 13, 11, 2, 1); olho(b, 19, 11, 2, -1);
  b.rect(15, 14, 3, 1, C.peleD);             // boca
  return b.outline(P.ink);
}

/* ================= EVOLUÇÕES FINAIS (40x40) ================= */

/* BOITATÃO — a serpente de fogo adulta, guardia dos campos */
export function boitatao(): Buf {
  const b = new Buf(40, 40);

  // tres voltas do corpo, a de baixo bem larga
  b.ellipse(20, 34, 16, 6, C.boi);
  b.ellipse(20, 35, 11, 4, C.boiB);
  b.ellipse(20, 28, 13, 5, C.boi);
  b.ellipse(20, 29, 8, 3, C.boiB);
  b.line(6, 31, 34, 31, C.boiD);
  b.ellipse(20, 23, 10, 4, C.boi);
  b.ellipse(20, 24, 6, 2, C.boiB);
  b.line(9, 26, 31, 26, C.boiD);
  b.ellipse(33, 27, 3, 3, C.boiD);           // cauda saindo do lado
  b.ellipse(36, 25, 2, 2, C.boi);

  b.rect(15, 17, 10, 4, C.boi);              // pescoco

  // cabeca maior e mais angulosa
  b.ellipse(20, 12, 9, 7, C.boi);
  b.ellipse(20, 16, 6, 3, C.boiB);
  b.set(17, 15, C.boiD); b.set(23, 15, C.boiD);
  b.line(15, 18, 25, 18, C.boiD);
  b.set(15, 19, P.white); b.set(17, 19, P.white);   // presas
  b.set(23, 19, P.white); b.set(25, 19, P.white);

  // chifres
  b.tri(12, 8, 7, 1, 15, 7, C.boiD);
  b.tri(28, 8, 33, 1, 25, 7, C.boiD);

  // juba de fogo
  chama(b, 20, 7, 8, 10, '#ff6a22', '#ffc23c');
  chama(b, 12, 9, 4, 6, '#ff6a22', '#ffc23c');
  chama(b, 28, 9, 4, 6, '#ff6a22', '#ffc23c');

  olho(b, 15, 11, 3, 1);
  olho(b, 25, 11, 3, -1);
  return b.outline(P.ink);
}

/* IARA-MÃE — a senhora das aguas, coroada */
export function iaraMae(): Buf {
  const b = new Buf(40, 40);

  b.ellipse(20, 31, 9, 9, C.iar);            // cauda
  b.ellipse(20, 30, 5, 7, C.iarL);
  for (let i = 0; i < 3; i++) {
    b.line(12, 27 + i * 4, 15, 27 + i * 4, C.iarD);
    b.line(25, 27 + i * 4, 28, 27 + i * 4, C.iarD);
  }
  b.tri(20, 35, 5, 39, 19, 39, C.iarL);      // cauda aberta
  b.tri(20, 35, 35, 39, 21, 39, C.iarL);
  b.line(20, 35, 20, 39, C.iarD);

  b.ellipse(20, 21, 6, 5, C.pele);           // torso
  b.ellipse(20, 23, 6, 3, C.iarL);
  b.ellipse(13, 22, 2, 4, C.pele);           // bracos
  b.ellipse(27, 22, 2, 4, C.pele);

  b.ellipse(20, 12, 7, 7, C.pele);           // cabeca

  // cabelo muito longo
  b.ellipse(20, 7, 9, 4, C.iarH);
  b.ellipse(20, 6, 6, 2, C.iarD);
  for (const x of [11, 12, 13, 27, 28, 29]) for (let y = 7; y <= 26; y++) b.set(x, y, C.iarH);
  for (const x of [12, 28]) for (let y = 7; y <= 14; y++) b.set(x, y, C.iarD);
  b.line(14, 7, 26, 7, C.iarH);

  // coroa de corais
  b.rect(15, 3, 11, 3, P.gold);
  b.rect(15, 5, 11, 1, P.goldD);
  for (const x of [15, 20, 25]) b.tri(x - 2, 3, x, 0, x + 2, 3, P.gold);
  b.set(20, 1, '#cde8ff');

  olho(b, 16, 12, 2, 1);
  olho(b, 24, 12, 2, -1);
  b.set(19, 15, C.peleD); b.set(20, 15, C.peleD);

  for (const [x, y] of [[4, 12], [7, 6], [34, 9], [36, 17], [3, 24]]) {
    b.ellipse(x, y, 1, 1, C.iarL); b.set(x, y, '#cde8ff'); b.set(x, y - 1, '#ffffff');
  }
  return b.outline(P.ink);
}

/* CURUPIRÁ — o guardiao adulto da mata, com bordunа */
export function curupira(): Buf {
  const b = new Buf(40, 40);

  // pernas e pes virados para tras
  b.rect(16, 27, 4, 8, C.pele); b.rect(21, 27, 4, 8, C.pele);
  b.ellipse(15, 36, 4, 2, C.pele); b.ellipse(25, 36, 4, 2, C.pele);
  for (const x of [12, 14, 16]) { b.set(x, 34, C.pele); b.set(x, 33, C.peleD); }
  for (const x of [24, 26, 28]) { b.set(x, 34, C.pele); b.set(x, 33, C.peleD); }

  // corpo com armadura de folhas
  b.ellipse(20, 23, 10, 8, C.cur);
  b.ellipse(20, 21, 6, 4, C.curL);
  for (const [x, y] of [[13, 20], [27, 20], [15, 27], [25, 27], [20, 29]])
    b.ellipse(x, y, 3, 2, C.curD);
  b.tri(10, 23, 2, 19, 11, 28, C.curD);      // folhas laterais
  b.tri(30, 23, 38, 19, 29, 28, C.curD);

  // bracos
  b.ellipse(11, 22, 3, 3, C.pele);
  b.ellipse(29, 22, 3, 3, C.pele);

  // borduna (porrete de madeira) na mao direita
  b.rect(31, 10, 4, 16, P.trunk);
  b.rect(30, 8, 6, 5, P.trunkD);
  b.set(31, 9, '#8a5c32'); b.set(34, 11, '#8a5c32');

  // cabeca
  b.ellipse(20, 14, 8, 7, C.pele);
  b.ellipse(20, 19, 9, 2, C.curD);           // gola de folhas

  // cabelo de fogo, bem maior
  chama(b, 20, 8, 8, 10, C.fogoC, C.fogoCL);
  chama(b, 13, 10, 4, 6, C.fogoC, C.fogoCL);
  chama(b, 27, 10, 4, 6, C.fogoC, C.fogoCL);

  olho(b, 16, 14, 2, 1);
  olho(b, 24, 14, 2, -1);
  b.rect(18, 17, 4, 1, C.peleD);
  return b.outline(P.ink);
}
