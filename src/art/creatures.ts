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
  const azul = '#4ab0f0', azulL = '#b8e8ff';
  // corpo em "S" de fogo, escamas escuras no dorso
  for (const [x, y, r] of [[8, 34, 6], [16, 31, 6], [24, 33, 6], [31, 29, 5], [30, 22, 5]] as const) {
    b.ellipse(x, y, r, r - 1, C.boi);
    b.ellipse(x, y + 1, r - 3, r - 3, C.boiB);
    b.set(x, y - r + 1, C.boiD);
  }
  chama(b, 4, 32, 4, 8, '#ff6a22', '#ffc23c');         // ponta da cauda acesa
  // pescoço e cabeça grandes, olhando para a esquerda
  b.rect(24, 13, 8, 9, C.boi);
  b.ellipse(22, 11, 11, 7, C.boi);
  b.ellipse(15, 14, 6, 3, C.boiB);                      // mandíbula clara
  b.line(8, 14, 22, 14, C.boiD);
  for (const x of [10, 13, 16]) b.tri(x - 1, 14, x + 1, 14, x, 17, P.white);
  b.tri(26, 6, 34, -1, 30, 8, C.boiD);                  // chifres
  b.tri(20, 5, 24, -1, 24, 6, C.boiD);
  // os olhos de todo bicho que morreu no fogo: três de cada lado, azuis
  for (const [x, y] of [[17, 9], [21, 8], [25, 9]] as const) {
    b.ellipse(x, y, 2, 2, azul); b.set(x, y, azulL);
  }
  chama(b, 34, 12, 4, 9, '#ff6a22', '#ffc23c');         // juba
  chama(b, 30, 16, 3, 6, '#ff6a22', '#ffc23c');
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
  b.ellipse(20, 20, 8, 7, C.iarH);
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
  const pele = '#3f7a44', peleL = '#6aa068', peleD = '#24502a', manto = '#3a1a4a', mantoL = '#5e2e6e';
  b.ellipse(20, 37, 19, 3, '#2a4a3a');                  // o brejo
  b.tri(3, 38, 20, 12, 37, 38, manto);
  b.tri(10, 38, 20, 18, 30, 38, mantoL);
  // caldeirão na frente
  b.ellipse(20, 32, 8, 5, '#2a2a30');
  b.ellipse(20, 28, 8, 2, '#7ac070');
  for (const [x, y] of [[17, 25], [22, 24], [20, 22]] as const) b.ellipse(x, y, 1, 1, '#a8e8a0');
  b.ellipse(6, 24, 3, 5, pele); b.ellipse(34, 24, 3, 5, pele);
  b.line(5, 28, 4, 31, '#e8e0d0'); b.line(35, 28, 36, 31, '#e8e0d0');
  // cabeça de jacaré, de frente, com coroa
  b.ellipse(20, 12, 9, 7, pele);
  b.ellipse(20, 17, 7, 3, pele);
  b.ellipse(20, 16, 6, 1, peleL);
  b.line(13, 18, 27, 18, peleD);
  for (const x of [14, 17, 20, 23, 26]) b.tri(x - 1, 18, x + 1, 18, x, 20, '#e8e0d0');
  b.ellipse(15, 10, 3, 3, '#f2d23a'); b.rect(15, 8, 1, 5, P.ink);
  b.ellipse(25, 10, 3, 3, '#f2d23a'); b.rect(25, 8, 1, 5, P.ink);
  b.rect(13, 3, 15, 2, P.goldD);
  for (const x of [14, 20, 26]) b.tri(x - 2, 4, x, 0, x + 2, 4, P.gold);
  for (const [x, y] of [[9, 8], [10, 13], [30, 8], [31, 13]] as const) b.ellipse(x, y, 2, 3, '#e8e4dc');
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
export const ARTE_CRIATURAS: Record<string, () => Buf> = {
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
