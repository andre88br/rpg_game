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
  // Cabra da Serra — bode encantado
  cab:  '#c9a876', cabL: '#e8d4a8', cabD: '#8f7248',
  chif: '#5a4a38', chifL: '#7a6650', chifD: '#3a2f22',
  // Mula-sem-Cabeça — assombracao da estrada
  mul:  '#4a2e28', mulL: '#6b4a3c', mulD: '#2c1a16', pesc: '#ff6a22', pescL: '#ffc23c',
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
  const pele = '#4a3a3a', peleL = '#6b5555', gorro = '#d63b2f', gorroD = '#9c2620';
  const vento = '#bfe9e0', ventoD = '#7fc4b8';

  // redemoinho no lugar do pé: o Saci nunca encosta direito no chão
  b.ellipse(16, 28, 11, 3, ventoD);
  b.ellipse(16, 27, 8, 2, vento);
  b.line(4, 26, 7, 24, ventoD);
  b.line(28, 26, 25, 24, ventoD);

  // a perna única
  b.rect(14, 21, 5, 5, pele);
  b.ellipse(16, 26, 4, 2, peleL);

  // tronco e bracinhos
  b.ellipse(16, 18, 6, 4, pele);
  b.ellipse(16, 19, 4, 2, peleL);
  b.ellipse(9, 17, 2, 3, pele);
  b.ellipse(23, 16, 2, 3, pele);

  // cabeça, com espaço de sobra abaixo do gorro para o rosto caber
  b.ellipse(16, 11, 7, 6, pele);
  b.ellipse(16, 13, 5, 3, peleL);

  // gorro vermelho: copa baixa, aba marcada e a ponta caindo para trás
  b.ellipse(16, 4, 7, 3, gorro);
  b.ellipse(16, 3, 5, 2, '#f0655a');
  b.tri(10, 4, 3, 1, 12, 2, gorro);
  b.ellipse(3, 1, 2, 2, gorroD);
  b.rect(8, 6, 17, 2, gorroD);                 // aba, bem acima dos olhos

  // rosto travesso
  olho(b, 13, 11, 2, 1);
  olho(b, 19, 11, 2, -1);
  b.line(13, 14, 19, 14, '#c9553f');           // sorriso largo
  b.set(12, 13, '#c9553f'); b.set(20, 13, '#c9553f');

  // cachimbo saindo do canto da boca, com a fumacinha
  b.rect(21, 14, 4, 1, P.trunkD);
  b.rect(24, 12, 2, 3, P.trunk);
  for (const [x, y] of [[27, 10], [29, 7], [28, 4]]) b.ellipse(x, y, 1, 1, '#d9d9d9');
  return b.outline(P.ink);
}

/* ---------------- CAIPORINHA (Planta, selvagem) ---------------- */
export function caiporinha(): Buf {
  const b = new Buf(32, 32);
  const pelo = '#8a5a34', peloL = '#ab7748', peloD = '#5e3a20';
  const folha = '#4e9f3f', folhaD = '#33702a';

  // cajado, atrás de tudo
  b.rect(26, 7, 2, 21, P.trunk);
  b.ellipse(27, 7, 3, 2, P.trunkD);
  b.set(26, 12, P.trunkD); b.set(27, 18, P.trunkD);

  // pernas curtas e pés
  b.rect(11, 25, 4, 5, peloD); b.rect(17, 25, 4, 5, peloD);
  b.ellipse(12, 30, 3, 1, peloD); b.ellipse(20, 30, 3, 1, peloD);

  // corpo baixo e redondo, bem abaixo da cabeça
  b.ellipse(16, 23, 8, 5, pelo);
  b.ellipse(16, 24, 5, 3, peloL);
  b.ellipse(8, 22, 2, 3, pelo);               // bracinhos
  b.ellipse(24, 22, 2, 3, pelo);

  // orelhas pontudas, desenhadas antes da cabeça para ficarem atrás dela
  b.tri(8, 12, 6, 2, 14, 10, pelo);
  b.tri(24, 12, 26, 2, 18, 10, pelo);
  b.tri(9, 10, 8, 5, 12, 10, peloD);
  b.tri(23, 10, 24, 5, 20, 10, peloD);

  // cabeça grande
  b.ellipse(16, 13, 8, 7, pelo);
  b.ellipse(16, 16, 5, 3, peloL);

  // focinho de porco-do-mato, com presinhas
  b.ellipse(16, 17, 3, 2, '#c08a68');
  b.set(15, 17, peloD); b.set(17, 17, peloD);
  b.line(12, 18, 11, 15, '#f0e8d0');
  b.line(20, 18, 21, 15, '#f0e8d0');

  // coroa de folhas, encaixada na testa e sem cobrir as orelhas
  b.ellipse(16, 8, 6, 2, folha);
  b.tri(11, 8, 8, 3, 14, 7, folhaD);
  b.tri(16, 7, 15, 2, 19, 6, folha);
  b.tri(21, 8, 24, 3, 18, 7, folhaD);
  b.line(11, 9, 21, 9, folhaD);

  olho(b, 12, 13, 2, 1);
  olho(b, 20, 13, 2, -1);
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

  // pernas e cascos
  b.rect(10, 23, 3, 6, C.mulD); b.rect(19, 23, 3, 6, C.mulD);
  b.rect(10, 19, 3, 5, C.mul); b.rect(19, 19, 3, 5, C.mul);

  // corpo alongado de mula
  b.ellipse(16, 18, 10, 6, C.mul);
  b.ellipse(16, 20, 7, 3, C.mulL);
  b.ellipse(23, 17, 3, 4, C.mul);               // garupa

  // pescoco sem cabeca: chama saindo direto do busto
  b.rect(11, 12, 6, 7, C.mul);
  chama(b, 14, 8, 6, 9, C.pesc, C.pescL);
  b.ellipse(14, 12, 3, 2, '#ffe8a0');            // brilho onde a cabeca deveria estar

  // orelhas longas, no lugar de onde a cabeca era
  b.tri(9, 6, 6, 0, 11, 5, C.mulD);
  b.tri(19, 6, 22, 0, 17, 5, C.mulD);

  // rabo em brasa
  chama(b, 27, 20, 3, 6, C.pesc, C.pescL);
  return b.outline(P.ink);
}

/* ---------------- MULA-SEM-CABEÇA (Fogo, evoluida) ---------------- */
export function mulaSemCabeca(): Buf {
  const b = new Buf(40, 40);

  b.rect(12, 29, 4, 8, C.mulD); b.rect(24, 29, 4, 8, C.mulD);
  b.rect(12, 24, 4, 6, C.mul); b.rect(24, 24, 4, 6, C.mul);

  b.ellipse(20, 22, 13, 7, C.mul);
  b.ellipse(20, 24, 9, 4, C.mulL);
  b.ellipse(30, 21, 4, 5, C.mul);               // garupa maior

  // busto sem cabeca, com o pescoco em brasa aberta
  b.rect(14, 14, 8, 9, C.mul);
  b.ellipse(18, 14, 5, 3, C.mulD);               // corte do pescoco
  chama(b, 18, 9, 9, 12, C.pesc, C.pescL);
  chama(b, 10, 12, 4, 7, C.pesc, C.pescL);
  chama(b, 26, 12, 4, 7, C.pesc, C.pescL);
  b.set(18, 14, '#ffe8a0'); b.set(19, 15, '#ffcf6a');

  chama(b, 35, 24, 4, 7, C.pesc, C.pescL);       // rabo em brasa
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
  const pele = '#4a3a3a', peleL = '#6b5555', gorro = '#d63b2f', gorroD = '#9c2620', gorroL = '#f0655a';
  const vento = '#bfe9e0', ventoD = '#7fc4b8';

  // redemoinho maior, agora quase engolindo a perna inteira
  b.ellipse(20, 35, 15, 4, ventoD);
  b.ellipse(20, 34, 11, 3, vento);
  b.line(4, 32, 9, 29, ventoD); b.line(36, 32, 31, 29, ventoD);
  b.line(2, 36, 8, 34, ventoD); b.line(38, 36, 32, 34, ventoD);

  // a perna única, mais longa
  b.rect(17, 25, 6, 8, pele);
  b.ellipse(20, 33, 5, 2, peleL);

  // tronco largo, um braço erguido segurando o cachimbo bem alto
  b.ellipse(20, 22, 8, 5, pele);
  b.ellipse(20, 23, 5, 3, peleL);
  b.rect(28, 14, 3, 9, pele);                  // braço erguido
  b.ellipse(11, 21, 3, 4, pele);                // braço caído

  // cabeça, maior e mais redonda que a do Sacizinho
  b.ellipse(20, 13, 9, 7, pele);
  b.ellipse(20, 15, 6, 3, peleL);

  // gorro maior, aba larga, ponta bem jogada para trás
  b.ellipse(20, 4, 9, 4, gorro);
  b.ellipse(20, 3, 6, 2, gorroL);
  b.tri(11, 5, 1, 2, 14, 3, gorro);
  b.ellipse(1, 2, 2, 2, gorroD);
  b.rect(9, 7, 22, 3, gorroD);                  // aba

  // rosto de riso escancarado — o dono da graça toda
  olho(b, 16, 13, 3, 1); olho(b, 24, 13, 3, -1);
  b.tri(15, 16, 20, 20, 25, 16, '#c9553f');     // boca aberta, triangular
  b.line(16, 17, 24, 17, '#7a2e22');

  // cachimbo na mão erguida, fumaça grande
  b.rect(30, 14, 4, 2, P.trunkD);
  b.ellipse(35, 12, 3, 2, P.trunk);
  for (const [x, y, r] of [[38, 9, 1], [39, 5, 2], [37, 1, 2]] as const) {
    b.ellipse(x, y, r, r, '#e8e8e8');
  }
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
  const porco = '#5a4a3e', porcoL = '#7a6a5a', pele = '#a8683e', cabelo = '#e0552e', cabeloL = '#f2884a';

  // o porco-do-mato que ela monta
  b.ellipse(20, 30, 14, 7, porco);
  b.ellipse(18, 28, 6, 2, porcoL);
  b.ellipse(34, 30, 5, 4, porco);
  b.ellipse(38, 31, 2, 2, '#3a2e24');                  // focinho
  b.tri(33, 27, 35, 22, 37, 27, porco);                // orelha
  for (const x of [10, 16, 25, 30]) b.rect(x, 35, 3, 5, '#3a2e24');

  // a Caipora, pequena, de cabelo de fogo, montada
  b.ellipse(19, 20, 5, 6, pele);
  b.rect(12, 18, 3, 7, pele);                          // braço com o galho
  b.line(11, 12, 13, 26, '#6b4a2e');
  b.ellipse(11, 11, 3, 2, '#4f8a3a');                  // folhas na ponta do galho
  b.ellipse(19, 11, 5, 5, pele);
  for (const [x, y, r] of [[15, 7, 3], [19, 5, 4], [23, 7, 3], [25, 11, 2]] as const) {
    b.ellipse(x, y, r, r, cabelo);
  }
  b.ellipse(19, 4, 2, 1, cabeloL);
  olho(b, 17, 11, 2, 1); olho(b, 21, 11, 2, -1);
  return b.outline(P.ink);
}

/* ---------------- LOBINHO (Sombra) ---------------- */
export function lobinho(): Buf {
  const b = new Buf(32, 32);
  const pelo = '#4a4658', peloL = '#6e6a82', peloD = '#2e2a3a', olhoC = '#f2d23a';
  b.tri(3, 22, 1, 13, 8, 20, peloD);                    // rabo
  b.ellipse(15, 22, 9, 6, pelo);                        // corpo
  b.ellipse(14, 24, 5, 3, peloL);
  for (const x of [9, 13, 18, 21]) b.rect(x, 26, 3, 5, peloD);
  b.ellipse(22, 13, 7, 6, pelo);                        // cabeça
  b.tri(17, 9, 18, 2, 21, 8, pelo); b.tri(27, 9, 26, 2, 23, 8, pelo);   // orelhas
  b.tri(19, 8, 19, 5, 20, 8, '#9c8ab0');
  b.ellipse(27, 16, 4, 3, peloL);                       // focinho
  b.set(30, 15, P.ink);
  b.ellipse(20, 12, 2, 2, olhoC); b.set(20, 12, P.ink);
  b.ellipse(25, 12, 2, 2, olhoC); b.set(25, 12, P.ink);
  return b.outline(P.ink);
}

/* ---------------- LOBISOMEM (Sombra, evolução) ---------------- */
export function lobisomem(): Buf {
  const b = new Buf(40, 40);
  const pelo = '#3a3648', peloL = '#5e5a74', peloD = '#221e2e', olhoC = '#f24a3a';
  b.rect(12, 30, 6, 9, peloD); b.rect(23, 30, 6, 9, peloD);            // pernas em pé
  b.ellipse(20, 22, 11, 11, pelo);                                      // tronco
  b.ellipse(20, 24, 6, 6, peloL);
  b.ellipse(7, 22, 4, 8, pelo); b.ellipse(33, 22, 4, 8, pelo);         // braços
  for (const [x, d] of [[5, -1], [35, 1]] as const) {                  // garras
    b.line(x, 29, x + d, 33, '#e8e0d0'); b.line(x + 2 * d, 29, x + 3 * d, 33, '#e8e0d0');
  }
  b.ellipse(20, 10, 8, 7, pelo);                                        // cabeça
  b.tri(13, 6, 13, -1, 17, 4, pelo); b.tri(27, 6, 27, -1, 23, 4, pelo);
  b.ellipse(20, 14, 5, 3, peloL);                                       // focinho
  b.rect(16, 16, 9, 2, '#7a1e1a');
  for (const x of [17, 20, 23]) b.tri(x - 1, 16, x + 1, 16, x, 18, '#e8e0d0');
  b.ellipse(16, 9, 2, 1, olhoC); b.ellipse(24, 9, 2, 1, olhoC);
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
  const pele = '#4f8a4a', peleL = '#7ab070', peleD = '#2f5e2e', manto = '#5a2a5e', mantoL = '#7a4a82';
  b.tri(6, 39, 20, 14, 34, 39, manto);                                  // manto de velha
  b.tri(12, 39, 20, 20, 28, 39, mantoL);
  b.ellipse(8, 26, 3, 5, pele); b.ellipse(32, 26, 3, 5, pele);          // mãos de garra
  b.line(6, 30, 5, 33, '#e8e0d0'); b.line(34, 30, 35, 33, '#e8e0d0');
  // cabeça de jacaré, focinho comprido para o lado
  b.ellipse(18, 12, 8, 7, pele);
  b.ellipse(29, 14, 9, 4, pele);
  b.ellipse(29, 12, 8, 2, peleL);
  b.line(21, 16, 37, 16, peleD);
  for (const x of [24, 28, 32, 36]) b.tri(x - 1, 16, x + 1, 16, x, 18, '#e8e0d0');
  for (const [x, y] of [[13, 7], [18, 5], [23, 7]] as const) b.ellipse(x, y, 2, 1, peleD);   // escamas
  b.ellipse(19, 10, 3, 3, '#f2d23a'); b.rect(19, 8, 1, 5, P.ink);       // olho de réptil
  // cabelo branco de velha
  for (const [x, y] of [[10, 6], [11, 10], [12, 14], [9, 12]] as const) b.ellipse(x, y, 2, 3, '#e8e4dc');
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

/* -------------------------------------------------------------------------
   Registro: liga a chave `arte` de cada espécie ao desenho.
   É por aqui que a batalha e o Caderno acham o sprite certo.
   ------------------------------------------------------------------------- */
export const ARTE_CRIATURAS: Record<string, () => Buf> = {
  boitatinha, boitatao, iarinha, iaraMae, curupinho, curupira,
  piragua, sacizinho, caiporinha,
  cabritinha, cabraCabriola, mulinha, mulaSemCabeca, salamanca, maeDoOuro,
  saci, matinta, uirapuru,
  faisquinha, relampo, tatuTrovao, arcoDaVelha,
  minhoquinha, minhocao, mapinguari, caipora,
  lobinho, lobisomem, corpoSeco, cuca, pisadeira,
};
