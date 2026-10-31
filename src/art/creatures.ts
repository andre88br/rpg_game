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
  olho: '#ffffff', bril: '#ffffff',
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

/* ------------------------------------------------------------- as poses

   O desenho de sempre é a pose 'normal'. As outras só mudam o rosto — o
   olho pisca, aperta quando apanha, vira x no desmaio, fecha a sobrancelha
   no ataque — e é a animação da batalha que escolhe qual mostrar. Quem
   desenha não sabe da pose: `olhao`, `olhoPonto` e `carinha` perguntam. */
export type Pose = 'normal' | 'pisca' | 'ataque' | 'dano' | 'desmaio';
export const POSES: readonly Pose[] = ['normal', 'pisca', 'ataque', 'dano', 'desmaio'];

let pose: Pose = 'normal';

/* desenha `desenhar` numa pose (e volta ao normal, aconteça o que for) */
export function naPose(desenhar: () => Buf, p: Pose): Buf {
  const antes = pose;
  pose = p;
  try { return desenhar(); } finally { pose = antes; }
}

/* Qual pose mostrar na luta, neste instante — a mesma regra para a batalha
   plana e a 3D. Parado, pisca de vez em quando (`tempo` já vem defasado
   para os dois lados não piscarem juntos). */
export function poseNaLuta(e: { caido: boolean; avanco: number; tremor: number }, tempo: number): Pose {
  if (e.caido) return 'desmaio';
  if (e.tremor > 0) return 'dano';
  if (e.avanco > 0) return 'ataque';
  return piscando(tempo) ? 'pisca' : 'normal';
}

/* o bicho parado está de olho fechado neste instante? Uma piscada a cada
   3,4 s, e de três em três vezes uma dupla */
export function piscando(tempo: number): boolean {
  const ciclo = ((tempo % 3.4) + 3.4) % 3.4;
  return ciclo < 0.13 || (ciclo > 0.3 && ciclo < 0.4 && Math.floor(tempo / 3.4) % 3 === 0);
}

/* o traço do olho fechado: escuro, ou claro se a cara embaixo é escura */
function traco(b: Buf, x: number, y: number): string {
  const c = b.get(x, y);
  const m = c ? /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c) : null;
  if (!m) return C.olhoP;
  const luz = (parseInt(m[1]!, 16) * 0.3 + parseInt(m[2]!, 16) * 0.59 + parseInt(m[3]!, 16) * 0.11) / 255;
  return luz < 0.3 ? '#f0e8f0' : C.olhoP;
}

/* o olho está aberto? quem pinta a pupila de outra cor por cima pergunta */
function abertos(): boolean { return pose === 'normal' || pose === 'ataque'; }

/* A carinha da turma do folclore: olho preto e alto, com um ponto de brilho,
   bochecha rosada e o sorrisão. (cx, cy) é o meio, na altura dos olhos;
   `sep` é a distância de cada olho até o meio. */
function carinha(b: Buf, cx: number, cy: number, sep: number, bochecha = C.bochecha): void {
  olhoPonto(b, cx - sep, cy, true);
  olhoPonto(b, cx + sep - 1, cy, false);
  b.rect(cx - sep - 3, cy + 2, 2, 1, bochecha);
  b.rect(cx + sep + 2, cy + 2, 2, 1, bochecha);
  const l = sep - 1;
  if (pose === 'dano') { b.rect(cx - 1, cy + 3, 2, 2, C.boca); return; }      // "ai!"
  if (pose === 'desmaio') { b.line(cx - l, cy + 4, cx + l - 1, cy + 4, C.boca); return; }
  b.set(cx - l - 1, cy + 3, C.boca);
  b.line(cx - l, cy + 4, cx + l - 1, cy + 4, C.boca);
  b.set(cx + l, cy + 3, C.boca);
}

/* o olhinho de ponto (2×3, com brilho), em cada pose. x é a coluna da
   esquerda, y a linha do meio; `esquerdo` diz para que lado ele aperta. */
function olhoPonto(b: Buf, x: number, y: number, esquerdo: boolean): void {
  const t = traco(b, x, y);
  switch (pose) {
    case 'pisca':
      b.rect(x, y + 1, 2, 1, t);
      return;
    case 'dano':                                     // apertado: > <
      if (esquerdo) { b.set(x, y - 1, t); b.set(x + 1, y, t); b.set(x, y + 1, t); }
      else { b.set(x + 1, y - 1, t); b.set(x, y, t); b.set(x + 1, y + 1, t); }
      return;
    case 'desmaio':                                  // x
      b.line(x, y - 1, x + 2, y + 1, t); b.line(x + 2, y - 1, x, y + 1, t);
      return;
    default:
      b.rect(x, y - 1, 2, 3, C.olhoP);
      b.set(x, y - 1, C.bril);
      // atacando: a sobrancelha fecha, mais baixa do lado do meio
      if (pose === 'ataque') {
        const tb = traco(b, x, y - 3);
        if (esquerdo) b.line(x - 1, y - 3, x + 1, y - 2, tb);
        else b.line(x, y - 2, x + 2, y - 3, tb);
      }
  }
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
  olhoPonto(b, 14, 16, true); olhoPonto(b, 20, 16, false);
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
  const s = dir < 0 ? -1 : 1;                      // −1: o olho da direita
  const t = traco(b, x, y);
  if (pose === 'pisca') { b.line(x - r + 1, y + 1, x + r - 1, y + 1, t); return; }
  if (pose === 'dano') {                           // apertado: > <
    b.line(x - s * (r - 1), y - r + 1, x + s * (r - 1), y, t);
    b.line(x + s * (r - 1), y, x - s * (r - 1), y + r - 1, t);
    return;
  }
  if (pose === 'desmaio') {                        // x
    b.line(x - r + 1, y - r + 1, x + r - 1, y + r - 1, t);
    b.line(x - r + 1, y + r - 1, x + r - 1, y - r + 1, t);
    return;
  }
  // atacando: a sobrancelha fecha, mais baixa do lado do meio
  if (pose === 'ataque') b.line(x - s * r, y - r - 2, x + s * (r - 1), y - r, traco(b, x, y - r - 1));
  b.ellipse(x, y, r, r, C.olho);
  b.rect(x - r + 1, y - r + 1, 2 * r - 1, 2 * r - 1, C.olho);
  if (r <= 2) {
    // olho pequeno: pupila 2×3, encostada para o lado do meio
    const px = dir < 0 ? x - 1 : x;
    b.rect(px, y - 1, 2, 3, C.olhoP);
    b.set(px, y - 1, C.bril);
    return;
  }
  const p = r - 1;
  b.rect(x - p + 1 + dir, y - p + 1, 2 * p - 1, 2 * p, C.olhoP);
  b.set(x - p + 1 + dir, y - p + 1, C.bril);
}

/* fogo de desenho: a borda vermelha, o laranja e o miolo amarelo */
function coroaDeFogo(b: Buf, x: number, y: number, larg: number, alt: number): void {
  chama(b, x, y, larg, alt, C.fogoV, C.fogoA);
  b.tri(x - larg * 0.3, y, x, y - alt * 0.35, x + larg * 0.3, y, C.fogoM);
}

/* a cabeça da Mula: um fogo de gota com olhão e sorriso */
function fogoComCara(b: Buf, cx: number, cy: number, rx: number, ry: number): void {
  chamaComCara(b, cx, cy, rx, ry, C.fogoV, C.fogoA, C.fogoM);
}

/* boca de riso aberto: os cantos para cima, o escuro e a língua */
function bocaAberta(b: Buf, cx: number, y: number, meia: number): void {
  b.set(cx - meia, y, C.bocaF);
  b.rect(cx - meia + 1, y + 1, 2 * meia - 1, 2, C.bocaF);
  b.set(cx + meia, y, C.bocaF);
  b.rect(cx - 1, y + 2, 3, 1, C.linguaL);
}

/* uma chama de gota, de três cores, com olhão e sorriso */
function chamaComCara(b: Buf, cx: number, cy: number, rx: number, ry: number,
  borda: string, meio: string, miolo: string): void {
  b.ellipse(cx, cy, rx, ry, borda);
  b.tri(cx - rx, cy, cx - rx + 1, cy - ry - 4, cx - 1, cy - ry + 1, borda);
  b.tri(cx - 3, cy - ry + 1, cx + 1, cy - ry - 5, cx + 3, cy - ry + 1, borda);
  b.tri(cx + 1, cy - ry + 1, cx + rx, cy - ry - 3, cx + rx, cy, borda);
  b.ellipse(cx, cy + 1, rx - 1, ry - 1, meio);
  b.ellipse(cx, cy + 2, rx - 3, ry - 3, miolo);
  const r = rx >= 8 ? 3 : 2;
  olhao(b, cx - r - 1, cy, r, 0); olhao(b, cx + r + 1, cy, r, -1);
  b.set(cx - 2, cy + ry - 2, C.olhoP);
  b.line(cx - 1, cy + ry - 1, cx + 1, cy + ry - 1, C.olhoP);
  b.set(cx + 2, cy + ry - 2, C.olhoP);
}

/* a Boitatá crescida, em pé sobre as voltas do corpo */
function cobraDeFogo(b: Buf): void {
  // a volta de baixo e o rabo de ponta acesa
  b.ellipse(20, 35, 13, 4, C.boi);
  b.ellipse(20, 36, 9, 2, C.boiB);
  b.tri(30, 35, 36, 24, 35, 37, C.boi);
  coroaDeFogo(b, 36, 24, 4, 8);
  // o corpo em pé, de barriga listrada
  b.ellipse(19, 29, 7, 6, C.boi);
  b.rect(13, 18, 12, 10, C.boi);
  b.rect(16, 18, 6, 15, C.boiB);
  for (let y = 20; y <= 32; y += 2) b.line(16, y, 21, y, C.boiBD);
  // cabeção, cara amarela e a coroa de fogo
  b.ellipse(19, 13, 10, 7, C.boi);
  b.ellipse(19, 15, 8, 5, C.boiB);
  coroaDeFogo(b, 19, 8, 8, 8);
  // olhão, narinas, a boca aberta de sorriso e a língua bifurcada
  olhao(b, 15, 10, 3, 0); olhao(b, 23, 10, 3, -1);
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
  cobraDeFogo(b);
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
  const azul = '#3a9ad8', azulL = '#7cc4ee', azulD = '#22689e', barriga = '#d8eef8';
  // de lado, olhando para a direita: o rabo primeiro, atrás
  b.tri(9, 16, 1, 8, 2, 25, azulD);
  b.tri(14, 9, 17, 3, 21, 9, azulD);                 // nadadeira de cima
  // corpo gorducho e a barriga clara
  b.ellipse(17, 16, 10, 8, azul);
  b.ellipse(18, 19, 7, 4, barriga);
  b.ellipse(13, 12, 3, 2, azulL);
  b.tri(14, 20, 11, 25, 17, 22, azulL);               // nadadeira do lado
  // olhão, bochecha e o sorriso de quem roubou a isca
  olhao(b, 21, 13, 3, 1);
  b.rect(23, 18, 2, 1, C.bochecha);
  b.set(23, 20, C.bocaF); b.line(24, 21, 26, 21, C.bocaF); b.set(27, 20, C.bocaF);
  b.set(25, 22, P.white);
  for (const [x, y] of [[29, 9], [28, 4]] as const) { b.ellipse(x, y, 1, 1, C.bolha); b.set(x, y - 1, '#ffffff'); }
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
  // perninhas e cascos
  for (const x of [11, 14, 17, 20]) { b.rect(x, 24, 2, 5, C.cab); b.rect(x, 29, 2, 1, C.chifD); }
  // corpinho
  b.ellipse(16, 23, 7, 4, C.cab);
  b.ellipse(16, 24, 4, 2, C.cabL);
  // orelhas de lado e os chifrinhos
  b.ellipse(6, 11, 3, 1, C.cabD); b.ellipse(26, 11, 3, 1, C.cabD);
  b.tri(11, 6, 10, 1, 14, 5, C.chif); b.tri(21, 6, 22, 1, 18, 5, C.chif);
  // cabeção, focinho claro e a barbicha
  b.ellipse(16, 12, 8, 7, C.cab);
  b.ellipse(16, 16, 5, 3, C.cabL);
  b.tri(15, 19, 16, 22, 17, 19, C.cabL);
  b.tri(14, 5, 16, 3, 18, 5, C.cabD);                 // topete
  carinha(b, 16, 12, 3);
  b.set(15, 15, C.chifD); b.set(17, 15, C.chifD);
  return b.outline(P.ink);
}

/* ---------------- CABRA-CABRIOLA (Terra/Fogo, evoluida) ---------------- */
export function cabraCabriola(): Buf {
  const b = new Buf(40, 40);
  // patas e cascos
  for (const x of [12, 16, 21, 25]) { b.rect(x, 30, 3, 7, C.cab); b.rect(x, 36, 3, 2, C.chifD); }
  b.ellipse(19, 28, 10, 5, C.cab);
  b.ellipse(19, 29, 6, 3, C.cabL);
  // chifres enrolados, e o fogo saindo deles
  b.ellipse(8, 9, 5, 5, C.chif); b.ellipse(8, 9, 2, 2, C.chifD);
  b.ellipse(31, 9, 5, 5, C.chif); b.ellipse(31, 9, 2, 2, C.chifD);
  coroaDeFogo(b, 6, 4, 3, 5); coroaDeFogo(b, 33, 4, 3, 5);
  b.ellipse(7, 16, 3, 1, C.cabD); b.ellipse(32, 16, 3, 1, C.cabD);
  // cabeção bravo, focinho e barba
  b.ellipse(19, 15, 9, 8, C.cab);
  b.ellipse(19, 19, 6, 4, C.cabL);
  b.tri(17, 23, 19, 27, 21, 23, C.cabL);
  olhao(b, 15, 13, 3, 0); olhao(b, 23, 13, 3, -1);
  b.line(12, 9, 17, 10, C.chifD); b.line(26, 9, 21, 10, C.chifD);
  b.set(17, 18, C.chifD); b.set(21, 18, C.chifD);
  bocaAberta(b, 19, 20, 3);
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
  // empinada: de pé nas patas de trás, as da frente no ar, de casco em brasa
  b.ellipse(19, 26, 8, 6, C.mul);
  b.rect(12, 21, 14, 4, C.mul);
  b.rect(19, 29, 5, 9, C.mul);
  b.rect(19, 37, 5, 2, C.casco);
  for (let k = 0; k < 4; k++) { b.line(13, 22 + k, 6, 15 + k, C.mul); b.line(13, 27 + k, 7, 21 + k, C.mul); }
  b.rect(3, 13, 4, 4, C.casco); b.rect(4, 20, 4, 4, C.casco);
  coroaDeFogo(b, 4, 13, 2, 5); coroaDeFogo(b, 5, 20, 2, 4);
  b.ellipse(19, 21, 6, 1, C.mulD);
  // o pescoço ainda solta faísca
  for (const [x, y] of [[13, 18], [25, 18]] as const) b.ellipse(x, y, 1, 1, C.fogoA);
  fogoComCara(b, 19, 10, 8, 7);
  return b.outline(P.ink);
}

/* ---------------- SALAMANCA (Fogo/Terra, guardiã da mina) ---------------- */
export function salamanca(): Buf {
  const b = new Buf(32, 32);
  // o rabo enrolando para a direita, de ponta escura
  b.ellipse(23, 27, 6, 2, C.sal);
  b.ellipse(28, 24, 2, 3, C.salD);
  // patinhas e corpinho de pintas de pedra
  b.ellipse(8, 27, 3, 2, C.sal); b.ellipse(24, 23, 3, 2, C.sal);
  b.ellipse(16, 24, 7, 5, C.sal);
  b.ellipse(16, 25, 4, 3, C.salL);
  b.ellipse(9, 22, 3, 2, C.sal); b.ellipse(23, 21, 2, 2, C.sal);
  // cabeção largo de salamandra
  b.ellipse(16, 13, 10, 7, C.sal);
  b.ellipse(16, 16, 7, 3, C.salL);
  for (const [x, y] of [[8, 9], [22, 9], [13, 7]] as const) b.rect(x, y, 2, 2, C.esc);
  olhao(b, 12, 11, 2, 0); olhao(b, 20, 11, 2, -1);
  b.rect(8, 15, 2, 1, C.bochecha); b.rect(23, 15, 2, 1, C.bochecha);
  b.set(12, 16, C.bocaF); b.line(13, 17, 19, 17, C.bocaF); b.set(20, 16, C.bocaF);
  return b.outline(P.ink);
}

/* ---------------- MÃE-DO-OURO (Fogo/Luz, exclusiva) ---------------- */
export function maeDoOuro(): Buf {
  const b = new Buf(40, 40);
  // um fogo de ouro, com cara, que risca o céu
  b.tri(12, 22, 0, 39, 20, 30, C.ourD);               // o rastro
  b.tri(15, 26, 4, 39, 18, 31, C.ourL);
  chamaComCara(b, 21, 20, 10, 9, C.ourD, C.our, C.ourL);
  for (const [x, y] of [[5, 8], [34, 6], [36, 22], [8, 20]] as const) {
    b.line(x - 1, y, x + 1, y, C.ourL); b.line(x, y - 1, x, y + 1, C.ourL);
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
  const pena = '#5e4e74', penaL = '#8a7aa2', penaD = '#3e3252', cara = '#d8cce8';
  // as asas (as primeiras peças: batem)
  b.ellipse(6, 19, 4, 7, penaD);
  b.ellipse(26, 19, 4, 7, penaD);
  // corpo redondo, peito claro, orelhinhas de pena
  b.tri(8, 9, 8, 2, 13, 7, pena); b.tri(24, 9, 24, 2, 19, 7, pena);
  b.ellipse(16, 17, 9, 11, pena);
  b.ellipse(16, 23, 5, 5, penaL);
  for (const [x, y] of [[14, 22], [18, 22], [16, 25]] as const) b.set(x, y, penaD);
  // o rosto de coruja: dois discos claros com o olhão
  b.ellipse(12, 13, 4, 4, cara); b.ellipse(20, 13, 4, 4, cara);
  olhao(b, 12, 13, 2, 0); olhao(b, 20, 13, 2, -1);
  b.tri(15, 16, 16, 19, 17, 16, '#e8a03a');
  b.rect(8, 17, 2, 1, C.bochecha); b.rect(23, 17, 2, 1, C.bochecha);
  for (const x of [13, 18]) b.rect(x, 28, 2, 2, '#e8a03a');
  return b.outline(P.ink);
}

/* ---------------- UIRAPURU (Vento, exclusivo) ---------------- */
export function uirapuru(): Buf {
  const b = new Buf(40, 40);
  const amarelo = '#f2d03a', amareloL = '#fbe88a', azul = '#3a7ad0', azulD = '#24508e';
  // asas abertas (as primeiras peças: batem)
  b.tri(11, 20, 1, 12, 7, 30, azul);
  b.tri(29, 20, 39, 12, 33, 30, azul);
  // o rabo e a bolinha do corpo
  b.tri(16, 32, 20, 39, 24, 32, azulD);
  b.ellipse(20, 22, 11, 11, amarelo);
  b.ellipse(20, 27, 7, 5, amareloL);
  // topete azul
  b.tri(15, 12, 18, 5, 20, 12, azul); b.tri(19, 12, 23, 6, 25, 13, azulD);
  olhao(b, 15, 19, 3, 0); olhao(b, 25, 19, 3, -1);
  b.tri(18, 23, 20, 27, 22, 23, '#e8803a');
  b.rect(10, 24, 2, 1, C.bochecha); b.rect(29, 24, 2, 1, C.bochecha);
  // a cantoria
  for (const [x, y] of [[33, 5], [6, 4]] as const) { b.ellipse(x, y + 3, 1, 1, azulD); b.line(x + 1, y, x + 1, y + 3, azulD); b.set(x + 2, y, azulD); }
  return b.outline(P.ink);
}

/* ---------------- FAISQUINHA (Raio, vaga-lume do raio) ---------------- */
export function faisquinha(): Buf {
  const b = new Buf(32, 32);
  const asa = '#d8eefa', casco = '#2e3a6e', cascoL = '#4a5a9a', luz = '#f6d23a', luzL = '#fff2a0';
  // asinhas (as primeiras peças: batem)
  b.ellipse(7, 12, 5, 3, asa);
  b.ellipse(25, 12, 5, 3, asa);
  // o bumbum que acende
  b.ellipse(16, 24, 6, 6, luz);
  b.ellipse(16, 25, 3, 3, luzL);
  // cabeção de besouro e as anteninhas de raio
  b.line(12, 6, 10, 2, casco); b.line(20, 6, 22, 2, casco);
  b.rect(9, 1, 2, 2, luz); b.rect(22, 1, 2, 2, luz);
  b.ellipse(16, 12, 8, 7, casco);
  b.ellipse(13, 8, 3, 2, cascoL);
  olhao(b, 13, 12, 2, 0); olhao(b, 19, 12, 2, -1);
  b.rect(9, 15, 2, 1, C.bochecha); b.rect(22, 15, 2, 1, C.bochecha);
  b.set(14, 16, luzL); b.line(15, 17, 17, 17, luzL); b.set(18, 16, luzL);
  for (const [x, y] of [[4, 22], [28, 21], [26, 29]] as const) { b.set(x, y - 1, luz); b.set(x - 1, y, luz); b.set(x + 1, y, luz); b.set(x, y + 1, luz); }
  return b.outline(P.ink);
}

/* ---------------- RELAMPO (Raio, evolução da Faisquinha) ---------------- */
export function relampo(): Buf {
  const b = new Buf(40, 40);
  const casco = '#24306a', cascoL = '#3e4e96', luz = '#f6d23a', luzL = '#fff2a0', asa = P.bolt;
  // asas de raio (as primeiras peças: batem)
  b.tri(14, 16, 0, 4, 4, 22, asa); b.tri(13, 18, 1, 26, 7, 14, luzL);
  b.tri(26, 16, 40, 4, 36, 22, asa); b.tri(27, 18, 39, 26, 33, 14, luzL);
  // o bumbum aceso
  b.ellipse(20, 30, 8, 8, luz);
  b.ellipse(20, 31, 4, 4, luzL);
  // o chifre em raio e o cabeção
  b.line(20, 7, 18, 3, luz); b.line(18, 3, 22, 3, luz); b.line(22, 3, 20, 0, luz);
  b.ellipse(20, 15, 10, 8, casco);
  b.ellipse(16, 11, 4, 2, cascoL);
  olhao(b, 16, 15, 3, 0); olhao(b, 24, 15, 3, -1);
  b.line(12, 10, 17, 12, luz); b.line(28, 10, 23, 12, luz);
  b.rect(11, 19, 2, 1, C.bochecha); b.rect(27, 19, 2, 1, C.bochecha);
  bocaAberta(b, 20, 19, 3);
  return b.outline(P.ink);
}

/* ---------------- TATU-TROVÃO (Raio/Terra) ---------------- */
export function tatuTrovao(): Buf {
  const b = new Buf(40, 40);
  const casco = '#8a7058', cascoL = '#a88a6e', cascoD = '#5e4a38', pele = '#e0b090', raio = P.bolt;
  // de lado, olhando para a direita: as quatro patinhas primeiro
  for (const x of [9, 14, 22, 27]) b.rect(x, 30, 3, 5, pele);
  b.tri(6, 26, 0, 31, 7, 30, pele);                    // rabinho
  // a carapaça redonda, com faixas de raio
  b.ellipse(18, 24, 13, 9, casco);
  b.ellipse(16, 19, 7, 3, cascoL);
  for (const x of [11, 17, 23]) {
    b.line(x, 16, x, 31, cascoD);
    b.line(x + 2, 20, x + 1, 23, raio); b.line(x + 1, 23, x + 3, 24, raio); b.line(x + 3, 24, x + 2, 27, raio);
  }
  // a cabeça de tatu, de orelha em pé
  b.tri(29, 20, 30, 13, 33, 19, pele);
  b.ellipse(32, 25, 6, 5, pele);
  b.ellipse(37, 27, 2, 2, pele);
  olhao(b, 32, 23, 2, 1);
  b.rect(34, 27, 2, 1, C.bochecha);
  b.set(38, 26, C.bocaF); b.set(35, 29, C.bocaF); b.line(36, 30, 37, 30, C.bocaF);
  return b.outline(P.ink);
}

/* ---------------- ARCO-DA-VELHA (Raio/Luz, exclusivo) ---------------- */
export function arcoDaVelha(): Buf {
  const b = new Buf(40, 40);
  const faixas = ['#e0524a', '#f09a3a', P.bolt, '#5fbf6a', '#4a9fd0', '#8a6ad0'];
  // o corpo é o próprio arco-íris: seis faixas em meia-lua
  faixas.forEach((cor, i) => {
    const r = 17 - i * 2;
    for (let a = 0; a <= 180; a += 2) {
      const rad = (a * Math.PI) / 180;
      const x = 20 + Math.cos(rad) * r, y = 30 - Math.sin(rad) * r;
      b.rect(x | 0, y | 0, 2, 2, cor);
    }
  });
  // a lagoa e as duas cabeças, uma em cada ponta, bebendo
  b.ellipse(20, 37, 19, 2, P.waterD);
  b.ellipse(20, 37, 17, 1, P.water);
  for (const [x, d] of [[5, 0], [35, -1]] as const) {
    b.ellipse(x, 30, 5, 5, faixas[0]!);
    olhao(b, x - 2, 29, 2, d); olhao(b, x + 2, 29, 2, d);
    b.set(x - 2, 33, C.bocaF); b.line(x - 1, 34, x + 1, 34, C.bocaF); b.set(x + 2, 33, C.bocaF);
  }
  // faísca no alto do arco
  b.line(20, 6, 18, 10, '#fffbe0'); b.line(18, 10, 22, 10, '#fffbe0'); b.line(22, 10, 20, 14, '#fffbe0');
  return b.outline(P.ink);
}

/* ---------------- MINHOQUINHA (Terra) ---------------- */
export function minhoquinha(): Buf {
  const b = new Buf(32, 32);
  const minhoca = '#e08a8a', minhocaL = '#f4b0a8', minhocaD = '#b86060', terra = '#7a5a3a', terraL = '#9a7650';
  // o montinho de terra de onde ela sai
  b.ellipse(16, 28, 12, 4, terra);
  b.ellipse(14, 27, 6, 2, terraL);
  // o corpo de gomos
  b.ellipse(16, 23, 5, 4, minhoca);
  b.ellipse(16, 18, 5, 4, minhoca);
  b.line(12, 21, 20, 21, minhocaD); b.line(12, 25, 20, 25, minhocaD);
  // cabeção, de capacete de garimpeiro
  b.ellipse(16, 11, 8, 7, minhoca);
  b.ellipse(13, 13, 3, 2, minhocaL);
  b.ellipse(16, 6, 7, 3, '#e8c03a');
  b.rect(8, 7, 17, 2, '#c89a1a');
  b.rect(15, 3, 3, 2, '#fff2a0');
  carinha(b, 16, 12, 3, C.bochecha);
  return b.outline(P.ink);
}

/* ---------------- MINHOCÃO (Terra, evolução) ---------------- */
export function minhocao(): Buf {
  const b = new Buf(40, 40);
  const minhoca = '#c87070', minhocaL = '#e09a90', minhocaD = '#985050', terra = '#6a4a30', terraL = '#8a6a48';
  // o buraco e o rabo saindo do outro lado
  b.ellipse(20, 35, 19, 5, terra);
  b.ellipse(16, 34, 8, 2, terraL);
  b.ellipse(34, 30, 3, 5, minhoca); b.line(32, 29, 36, 29, minhocaD);
  // o corpo em gomos, saindo do chão
  b.ellipse(16, 30, 8, 5, minhoca);
  b.ellipse(16, 23, 8, 5, minhoca);
  b.line(9, 27, 23, 27, minhocaD); b.line(9, 33, 23, 33, minhocaD);
  for (const [x, y] of [[11, 24], [20, 31]] as const) b.rect(x, y, 2, 2, '#8a8a90');
  // cabeção de bocarra
  b.ellipse(17, 12, 11, 9, minhoca);
  b.ellipse(12, 8, 4, 2, minhocaL);
  olhao(b, 13, 10, 3, 0); olhao(b, 21, 10, 3, -1);
  b.line(10, 5, 15, 6, minhocaD); b.line(24, 5, 19, 6, minhocaD);
  b.rect(8, 14, 2, 1, C.bochecha); b.rect(25, 14, 2, 1, C.bochecha);
  b.set(11, 15, C.bocaF); b.rect(12, 16, 11, 3, C.bocaF); b.set(23, 15, C.bocaF);
  for (const x of [13, 16, 19, 22]) b.set(x, 16, P.white);
  b.rect(15, 18, 4, 1, C.linguaL);
  return b.outline(P.ink);
}

/* ---------------- MAPINGUARI (Terra) ---------------- */
export function mapinguari(): Buf {
  const b = new Buf(40, 40);
  const pelo = '#6e4a32', peloL = '#8e664a', peloD = '#4a3020';
  // perninhas curtas
  b.rect(11, 32, 6, 6, peloD); b.rect(23, 32, 6, 6, peloD);
  // bracinhos de garra
  b.ellipse(6, 24, 3, 5, pelo); b.ellipse(34, 24, 3, 5, pelo);
  for (const x of [4, 6, 8, 32, 34, 36]) b.line(x, 29, x, 31, '#f0e8d0');
  // o corpão peludo, redondo como um barril
  b.ellipse(20, 21, 14, 14, pelo);
  b.ellipse(14, 12, 5, 3, peloL);
  for (const x of [8, 13, 27, 32]) b.tri(x - 2, 8, x, 4, x + 2, 9, pelo);
  // um olho só, no meio da testa
  olhao(b, 20, 12, 4, 0);
  b.line(15, 6, 25, 6, peloD);
  // e a boca na barriga, sorrindo
  b.rect(11, 22, 2, 1, C.bochecha); b.rect(27, 22, 2, 1, C.bochecha);
  b.set(13, 23, C.bocaF); b.rect(14, 24, 13, 4, C.bocaF); b.set(27, 23, C.bocaF);
  for (const x of [15, 18, 22, 25]) b.set(x, 24, P.white);
  b.rect(18, 27, 5, 1, C.linguaL);
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
  olhoPonto(b, 11, 12, true); olhoPonto(b, 19, 12, false);
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
  const pele = '#9a8a6a', peleL = '#b8a888', peleD = '#6a5e48', trapo = '#5a4e44', galho = '#4a3a2a';
  // a árvore seca em que ele se encosta
  b.rect(31, 6, 3, 33, galho);
  b.line(32, 12, 38, 6, galho); b.line(32, 18, 26, 13, galho);
  // pernas finas e o trapo
  b.rect(15, 31, 3, 7, pele); b.rect(22, 31, 3, 7, pele);
  b.rect(13, 22, 14, 10, trapo);
  for (const x of [14, 18, 22, 26]) b.tri(x - 1, 31, x + 1, 31, x, 34, trapo);
  for (const y of [24, 28]) b.line(13, y, 26, y, peleD);
  // bracinhos secos, um apoiado no galho
  b.rect(9, 23, 4, 2, pele); b.rect(27, 21, 5, 2, pele);
  // cabeção murcho
  b.ellipse(20, 13, 9, 8, pele);
  b.ellipse(16, 9, 3, 2, peleL);
  for (const x of [14, 22]) {
    if (abertos()) { b.rect(x, 11, 4, 4, peleD); b.rect(x + 1, 12, 2, 2, '#f2d23a'); }
    else olhoPonto(b, x + 1, 13, x < 20);
  }
  if (pose === 'ataque') { b.line(13, 9, 17, 10, C.olhoP); b.line(22, 10, 26, 9, C.olhoP); }
  b.set(17, 18, peleD); b.line(18, 19, 22, 19, peleD); b.set(23, 18, peleD);
  b.tri(17, 5, 20, 2, 21, 6, peleD);
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
  const cabelo = '#1a1424', pele = '#d8d0dc', vestido = '#3a2a4a', vestidoL = '#5a4a6e', telha = '#a8483a', telhaD = '#7a3028';
  // o cabelo comprido atrás (sai no 3D, onde vira extras)
  b.ellipse(20, 11, 10, 9, cabelo);
  b.rect(10, 11, 21, 15, cabelo);
  // o telhado onde ela anda
  b.tri(0, 39, 20, 31, 40, 39, telha);
  b.line(4, 38, 36, 38, telhaD);
  // o vestido, os bracinhos e as unhas compridas
  b.rect(17, 30, 2, 4, pele); b.rect(22, 30, 2, 4, pele);
  b.tri(12, 32, 20, 18, 28, 32, vestido);
  b.tri(16, 32, 20, 22, 24, 32, vestidoL);
  b.rect(9, 22, 5, 2, pele); b.rect(27, 22, 5, 2, pele);
  for (const x of [5, 7, 9]) b.line(x, 21, x + 3, 23, '#f0e8f0');
  for (const x of [31, 33, 35]) b.line(x - 3, 23, x, 21, '#f0e8f0');
  // cabeção pálido, franja desgrenhada
  b.ellipse(20, 12, 8, 8, pele);
  b.ellipse(20, 6, 9, 3, cabelo);
  for (const x of [13, 17, 21, 25]) b.tri(x - 2, 7, x, 11, x + 2, 7, cabelo);
  b.rect(10, 7, 3, 16, cabelo); b.rect(28, 7, 3, 16, cabelo);
  olhao(b, 16, 13, 3, 0); olhao(b, 24, 13, 3, -1);
  if (abertos()) for (const x of [16, 24]) b.set(x, 13, '#d03040');
  b.rect(13, 17, 2, 1, C.bochecha); b.rect(26, 17, 2, 1, C.bochecha);
  b.set(18, 17, C.bocaF); b.line(19, 18, 21, 18, C.bocaF); b.set(22, 17, C.bocaF);
  return b.outline(P.ink);
}

/* ---------------- LUZEIRO (Luz) ---------------- */
export function luzeiro(): Buf {
  const b = new Buf(32, 32);
  const ouro = '#f6d23a', ouroL = '#fff2a0', ouroD = '#d8a820';
  // a estrelinha de cinco pontas, gorducha
  b.tri(16, 1, 11, 12, 21, 12, ouro);
  b.tri(1, 12, 13, 12, 10, 20, ouro);
  b.tri(31, 12, 19, 12, 22, 20, ouro);
  b.tri(6, 30, 11, 18, 17, 24, ouro);
  b.tri(26, 30, 21, 18, 15, 24, ouro);
  b.ellipse(16, 17, 8, 7, ouro);
  b.ellipse(13, 13, 3, 2, ouroL);
  b.line(10, 24, 22, 24, ouroD);
  carinha(b, 16, 16, 3);
  for (const [x, y] of [[4, 4], [28, 5], [29, 26]] as const) { b.set(x, y - 1, ouroL); b.set(x - 1, y, ouroL); b.set(x + 1, y, ouroL); b.set(x, y + 1, ouroL); }
  return b.outline(P.ink);
}

/* ---------------- ESTRELA-D'ALVA (Luz, evolução) ---------------- */
export function estrelaDalva(): Buf {
  const b = new Buf(40, 40);
  const ouro = '#f6d23a', ouroL = '#fff2a0', azul = '#8ac8f0', azulL = '#d0ecff';
  // a cauda de cometa, atrás
  b.tri(14, 24, 0, 38, 8, 26, azul);
  b.tri(16, 28, 3, 40, 14, 32, azulL);
  // a estrela grande
  b.tri(22, 0, 16, 14, 28, 14, ouro);
  b.tri(6, 14, 19, 14, 15, 24, ouro);
  b.tri(38, 14, 25, 14, 29, 24, ouro);
  b.tri(11, 38, 16, 22, 23, 29, ouro);
  b.tri(33, 38, 28, 22, 21, 29, ouro);
  b.ellipse(22, 20, 10, 9, ouro);
  b.ellipse(18, 15, 4, 2, ouroL);
  olhao(b, 18, 19, 3, 0); olhao(b, 26, 19, 3, -1);
  b.rect(13, 24, 2, 1, C.bochecha); b.rect(29, 24, 2, 1, C.bochecha);
  b.set(19, 24, C.bocaF); b.line(20, 25, 24, 25, C.bocaF); b.set(25, 24, C.bocaF);
  for (const [x, y] of [[5, 5], [36, 4], [37, 32]] as const) { b.set(x, y - 1, ouroL); b.set(x - 1, y, ouroL); b.set(x + 1, y, ouroL); b.set(x, y + 1, ouroL); }
  return b.outline(P.ink);
}

/* ---------------- LAMPARINA (Luz/Fogo) ---------------- */
export function lamparina(): Buf {
  const b = new Buf(40, 40);
  const lata = '#9aa0a8', lataL = '#c8ccd2', lataD = '#6a7078';
  // a alça, atrás
  b.ellipse(31, 26, 5, 5, lataD); b.ellipse(31, 26, 3, 3, lataL);
  // o corpo de lata, de cara, e o pavio aceso
  b.ellipse(20, 30, 11, 8, lata);
  b.rect(9, 30, 23, 6, lata);
  b.rect(8, 35, 25, 3, lataD);
  b.ellipse(15, 26, 4, 2, lataL);
  b.rect(18, 19, 5, 4, lataD);
  chamaComCara(b, 20, 12, 6, 5, C.fogoV, C.fogoA, C.fogoM);
  // a carinha na lata
  carinha(b, 20, 29, 4);
  return b.outline(P.ink);
}

/* ---------------- JACI (Luz/Sombra, exclusiva) ---------------- */
export function jaci(): Buf {
  const b = new Buf(40, 40);
  const lua = '#f2e8c8', luaL = '#fffaf0', luaD = '#c8bc98', sombra = '#4a3a6a', estrela = '#fff2a0';
  // a lua cheia, metade luz e metade sombra
  b.ellipse(20, 20, 16, 16, lua);
  b.ellipse(26, 20, 10, 15, sombra);
  b.ellipse(13, 12, 4, 3, luaL);
  for (const [x, y] of [[8, 25], [13, 30]] as const) b.rect(x, y, 3, 2, luaD);
  // a cara: um olho dorme na sombra, o outro brilha na luz
  olhao(b, 14, 18, 3, 0);
  b.set(23, 19, estrela); b.line(24, 20, 27, 20, estrela); b.set(28, 19, estrela);
  b.rect(9, 23, 2, 1, C.bochecha);
  b.set(16, 25, C.bocaF); b.line(17, 26, 22, 26, C.bocaF); b.set(23, 25, C.bocaF);
  for (const [x, y] of [[3, 4], [36, 6], [37, 34]] as const) { b.set(x, y - 1, estrela); b.set(x - 1, y, estrela); b.set(x + 1, y, estrela); b.set(x, y + 1, estrela); }
  return b.outline(P.ink);
}

/* =========================================================================
   Evoluções novas: a forma de cima de cada linhagem. Todas 40x40.
   ========================================================================= */

/* ---------------- MBOITATÁ (Fogo, 3ª forma da Boitatinha) ---------------- */
export function mboitata(): Buf {
  const b = new Buf(40, 40);
  // a mais velha não fica em pé: se arrasta em "S" pelo campo, com o
  // pescoço erguido na esquerda e a ponta do rabo acesa na direita
  coroaDeFogo(b, 37, 23, 3, 9);
  for (const [x, y, rx] of [[33, 30, 4], [26, 34, 6], [17, 34, 6]] as const) {
    b.ellipse(x, y, rx, 4, C.boi);
    b.rect(x - rx + 2, y + 2, 2 * rx - 3, 2, C.boiB);
  }
  for (const x of [22, 29]) b.set(x, 31, C.boiD);
  // o pescoço, de barriga listrada, e a cabeça grande
  b.rect(6, 16, 10, 18, C.boi);
  b.rect(8, 18, 6, 15, C.boiB);
  for (let y = 20; y <= 32; y += 2) b.line(8, y, 13, y, C.boiBD);
  b.ellipse(12, 12, 10, 7, C.boi);
  b.ellipse(12, 14, 8, 5, C.boiB);
  coroaDeFogo(b, 12, 7, 9, 8);
  coroaDeFogo(b, 24, 9, 3, 6);
  // os olhos azuis de todo bicho que morreu no fogo
  for (const [x, d] of [[8, 0], [16, -1]] as const) {
    olhao(b, x, 10, 3, d);
    if (abertos()) { b.rect(x - 1 + d, 9, 3, 4, C.olhoAzul); b.set(x - 1 + d, 9, C.bril); }
  }
  b.set(10, 14, C.boiD); b.set(14, 14, C.boiD);
  b.set(6, 15, C.bocaF); b.rect(7, 16, 10, 2, C.bocaF); b.set(17, 15, C.bocaF);
  b.line(12, 18, 12, 21, C.lingua); b.set(11, 22, C.lingua); b.set(13, 22, C.lingua);
  for (const [x, y] of [[30, 4], [35, 12], [3, 4]] as const) b.ellipse(x, y, 1, 1, C.fogoA);
  return b.outline(P.ink);
}

/* ---------------- IPUPIARA (Água/Sombra, 3ª forma da Iarinha) ---------------- */
export function ipupiara(): Buf {
  const b = new Buf(40, 40);
  const mar = '#1f5c8a', marL = '#3a8fd5', marD = '#123a5a', alga = '#2f7a5a', algaL = '#4a9a72', pele = '#7aa4c0';
  // o cabelo de alga atrás (sai no 3D, onde vira extras)
  b.ellipse(20, 13, 10, 9, alga);
  b.rect(10, 13, 21, 16, alga);
  // o fundo do mar e a cauda enorme
  b.ellipse(20, 37, 19, 3, marD);
  b.ellipse(20, 31, 8, 5, mar);
  b.ellipse(28, 35, 7, 2, mar);
  b.tri(32, 35, 40, 26, 39, 39, marL);
  for (const x of [15, 19, 23]) b.line(x, 31, x + 2, 32, marD);
  // tronco e os braços de tentáculo
  b.ellipse(20, 25, 6, 4, pele);
  b.ellipse(12, 27, 2, 5, marL); b.ellipse(28, 27, 2, 5, marL);
  b.rect(15, 24, 11, 2, algaL);
  // cabeção, franja de alga e a coroa de coral quebrada
  b.ellipse(20, 15, 9, 8, pele);
  b.ellipse(20, 9, 10, 4, alga);
  for (const x of [13, 17, 21, 25]) b.tri(x - 2, 10, x, 14, x + 2, 10, alga);
  b.rect(10, 11, 2, 16, alga); b.rect(29, 11, 2, 16, alga);
  b.rect(15, 3, 11, 2, P.goldD);
  for (const x of [16, 24]) b.tri(x - 2, 4, x, 0, x + 2, 4, P.gold);
  b.tri(18, 4, 19, 2, 21, 4, P.gold);
  olhao(b, 16, 16, 3, 0); olhao(b, 24, 16, 3, -1);
  if (abertos()) for (const x of [16, 23]) b.rect(x, 16, 2, 2, '#4ad0e0');
  b.rect(12, 20, 2, 1, '#c890b0'); b.rect(27, 20, 2, 1, '#c890b0');
  b.set(17, 21, C.bocaF); b.line(18, 22, 22, 22, C.bocaF); b.set(23, 21, C.bocaF);
  for (const [x, y] of [[4, 12], [6, 5], [35, 8], [3, 24]]) { b.ellipse(x, y, 1, 1, C.bolha); b.set(x, y - 1, '#ffffff'); }
  return b.outline(P.ink);
}

/* ---------------- ANHANGÁ (Planta/Luz, 3ª forma do Curupinho) ---------------- */
export function anhanga(): Buf {
  const b = new Buf(40, 40);
  const pelo = '#f4f0e8', peloL = '#ffffff', peloD = '#c8c0b0', chifre = '#8a6a48';
  // de lado, olhando para a esquerda: as quatro patas primeiro
  for (const x of [12, 16, 26, 30]) b.rect(x, 28, 3, 10, pelo);
  // o rabinho, o corpo e a barriga
  b.ellipse(35, 21, 3, 2, peloL);
  b.ellipse(23, 24, 12, 7, pelo);
  b.ellipse(22, 27, 8, 3, peloL);
  b.ellipse(26, 20, 5, 2, peloD);
  // pescoço e cabeção
  b.rect(10, 15, 6, 10, pelo);
  b.ellipse(11, 11, 9, 8, pelo);
  b.ellipse(5, 15, 4, 3, peloL);
  b.set(2, 13, P.ink);
  b.tri(15, 7, 21, 4, 17, 11, pelo);                    // orelha
  // os galhos, com folhinhas
  b.line(9, 5, 7, 0, chifre); b.line(8, 2, 4, 1, chifre);
  b.line(13, 5, 15, 0, chifre); b.line(14, 2, 18, 1, chifre);
  b.rect(3, 0, 2, 2, '#4e9f3f'); b.rect(18, 0, 2, 2, '#4e9f3f');
  // olho de fogo
  olhao(b, 9, 10, 3, 0);
  if (abertos()) b.rect(9, 10, 2, 2, '#e8541f');
  coroaDeFogo(b, 11, 6, 1, 3);
  b.rect(6, 15, 2, 1, C.bochecha);
  b.set(3, 16, C.bocaF); b.line(4, 17, 6, 17, C.bocaF);
  return b.outline(P.ink);
}

/* ---------------- PIRAGUAÇU (Água, evolução do Piraguá) ---------------- */
export function piraguacu(): Buf {
  const b = new Buf(40, 40);
  const azul = '#2a7ec0', azulL = '#6ab4e4', azulD = '#18507e', barriga = '#d8eef8';
  b.tri(9, 20, 0, 9, 1, 32, azulD);
  b.tri(14, 10, 20, 2, 26, 10, azulD);
  b.ellipse(21, 20, 14, 11, azul);
  b.ellipse(22, 25, 10, 5, barriga);
  b.ellipse(15, 14, 4, 2, azulL);
  b.tri(16, 26, 12, 33, 21, 28, azulL);
  // olhão de sobrancelha brava e a bocarra de dentes
  olhao(b, 27, 15, 3, 1);
  b.line(23, 10, 29, 12, C.olhoP);
  b.rect(29, 21, 2, 1, C.bochecha);
  b.set(27, 24, C.bocaF); b.rect(28, 25, 8, 3, C.bocaF); b.set(36, 24, C.bocaF);
  b.rect(30, 27, 4, 1, C.linguaL);
  for (const x of [29, 31, 33, 35]) b.set(x, 25, P.white);
  for (const [x, y, r] of [[37, 12, 1], [36, 6, 2]] as const) { b.ellipse(x, y, r, r, C.bolha); b.set(x, y - r, '#ffffff'); }
  return b.outline(P.ink);
}

/* ---------------- TEINIAGUÁ (Fogo/Terra, evolução da Salamanca) ---------------- */
export function teiniagua(): Buf {
  const b = new Buf(40, 40);
  const rubi = '#e0303a', rubiL = '#ff8a8a';
  b.ellipse(29, 34, 8, 3, C.sal);
  b.ellipse(36, 30, 3, 4, C.salD);
  b.ellipse(9, 34, 4, 2, C.sal); b.ellipse(31, 29, 4, 2, C.sal);
  b.ellipse(20, 30, 9, 6, C.sal);
  b.ellipse(20, 31, 5, 4, C.salL);
  b.ellipse(10, 28, 4, 2, C.sal); b.ellipse(30, 27, 3, 2, C.sal);
  // cabeção, e na testa a pedra encantada de fogo
  b.ellipse(20, 18, 12, 8, C.sal);
  b.ellipse(20, 21, 9, 4, C.salL);
  for (const [x, y] of [[9, 14], [29, 14], [13, 12], [26, 12]] as const) b.rect(x, y, 2, 2, C.esc);
  coroaDeFogo(b, 20, 8, 5, 7);
  b.ellipse(20, 10, 3, 3, rubi); b.set(19, 9, rubiL); b.set(20, 9, rubiL);
  olhao(b, 15, 16, 3, 0); olhao(b, 25, 16, 3, -1);
  b.rect(10, 21, 2, 1, C.bochecha); b.rect(29, 21, 2, 1, C.bochecha);
  bocaAberta(b, 20, 21, 4);
  return b.outline(P.ink);
}

/* ---------------- MATINTA-PERERA (Vento/Sombra, evolução da Matinta) ---------------- */
export function matintaPerera(): Buf {
  const b = new Buf(40, 40);
  const pena = '#4a3a5e', penaL = '#7a6a92', penaD = '#2e2440', cara = '#d8cce8', xale = '#b8303a';
  b.ellipse(6, 24, 5, 9, penaD);
  b.ellipse(34, 24, 5, 9, penaD);
  b.ellipse(20, 23, 12, 13, pena);
  b.ellipse(20, 29, 7, 6, penaL);
  // o xale vermelho de véia
  b.tri(9, 22, 31, 22, 20, 30, xale);
  b.rect(9, 21, 23, 2, xale);
  b.ellipse(15, 16, 5, 5, cara); b.ellipse(25, 16, 5, 5, cara);
  olhao(b, 15, 16, 3, 0); olhao(b, 25, 16, 3, -1);
  b.line(10, 11, 16, 12, penaD); b.line(30, 11, 24, 12, penaD);
  b.tri(19, 19, 20, 23, 21, 19, '#e8a03a');
  // o chapéu de bruxa, torto
  b.rect(9, 8, 22, 2, P.ink);
  b.tri(12, 8, 24, 0, 27, 8, '#2a2236');
  b.rect(14, 6, 12, 2, xale);
  // o cachimbo de quem pede fumo
  b.line(22, 22, 27, 22, P.trunk); b.rect(27, 19, 3, 3, P.trunkD);
  b.ellipse(31, 16, 1, 1, '#d9d9d9'); b.ellipse(33, 12, 2, 2, '#d9d9d9');
  for (const x of [16, 22]) b.rect(x, 36, 3, 2, '#e8a03a');
  return b.outline(P.ink);
}

/* ---------------- TATUAÇU (Raio/Terra, evolução do Tatu-Trovão) ---------------- */
export function tatuacu(): Buf {
  const b = new Buf(40, 40);
  const casco = '#6e5a46', cascoL = '#8e7660', cascoD = '#44362a', pele = '#d8a080', raio = P.bolt;
  for (const x of [6, 12, 21, 27]) b.rect(x, 32, 4, 6, pele);
  b.tri(4, 27, 0, 34, 5, 32, pele);
  b.ellipse(17, 24, 15, 11, casco);
  b.ellipse(14, 17, 8, 3, cascoL);
  for (const x of [9, 15, 21, 27]) {
    b.line(x, 14, x, 33, cascoD);
    b.line(x + 3, 18, x + 1, 23, raio); b.line(x + 1, 23, x + 4, 24, raio); b.line(x + 4, 24, x + 2, 30, raio);
  }
  // espinhos de pedra nas costas
  for (const x of [10, 17, 24]) b.tri(x - 2, 14, x, 9, x + 2, 14, cascoD);
  b.tri(29, 19, 31, 11, 34, 18, pele);
  b.ellipse(32, 25, 7, 6, pele);
  b.ellipse(38, 27, 2, 2, pele);
  olhao(b, 32, 23, 3, 1);
  b.line(29, 19, 34, 20, cascoD);
  b.rect(34, 28, 2, 1, C.bochecha);
  b.set(33, 30, C.bocaF); b.rect(34, 31, 4, 1, C.bocaF); b.set(35, 31, P.white);
  return b.outline(P.ink);
}

/* ---------------- ALMA-PENADA (Sombra/Terra, evolução do Corpo-Seco) ---------------- */
export function almaPenada(): Buf {
  const b = new Buf(40, 40);
  const lencol = '#e8eef8', lencolL = '#ffffff', lencolD = '#b0bcd8', vela = '#f2e8c8';
  // o lençol, de barra ondulada
  b.ellipse(20, 17, 13, 13, lencol);
  b.rect(7, 17, 27, 14, lencol);
  for (const x of [9, 15, 21, 27, 32]) b.tri(x - 3, 30, x, 36, x + 3, 30, lencol);
  b.ellipse(14, 10, 4, 3, lencolL);
  b.line(10, 22, 10, 29, lencolD); b.line(30, 22, 30, 29, lencolD);
  // bracinho com a vela acesa
  b.ellipse(33, 22, 4, 2, lencol);
  b.rect(36, 16, 2, 6, vela);
  coroaDeFogo(b, 37, 16, 2, 4);
  // a cara de quem se assustou com o próprio susto
  olhao(b, 15, 16, 3, 0); olhao(b, 25, 16, 3, 0);
  b.rect(10, 21, 2, 1, C.bochecha); b.rect(28, 21, 2, 1, C.bochecha);
  b.ellipse(20, 23, 2, 2, C.bocaF);
  b.rect(19, 22, 3, 3, C.bocaF);
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
  const sombra = '#2e2240', sombraL = '#4a3a62', lua = '#f2e8b8';
  // o manto que se abre até o chão, de barra em fiapos
  b.tri(20, 8, 3, 36, 37, 36, sombra);
  for (const x of [5, 11, 17, 23, 29, 35]) b.tri(x - 3, 35, x, 40, x + 3, 35, sombra);
  b.tri(20, 16, 12, 36, 28, 36, sombraL);
  // os braços compridos, abertos, de unha de fora
  b.rect(4, 18, 12, 3, sombra); b.rect(24, 18, 12, 3, sombra);
  for (const [x, d] of [[3, -1], [36, 1]] as const) {
    b.ellipse(x, 19, 2, 3, sombraL);
    for (const k of [-1, 1]) b.line(x + k, 16, x + k + d, 13, '#f0e8f0');
  }
  // o capuz com chifres e a cara
  b.tri(13, 6, 10, 0, 16, 4, sombra); b.tri(27, 6, 30, 0, 24, 4, sombra);
  b.ellipse(20, 11, 8, 8, sombra);
  b.ellipse(16, 6, 3, 2, sombraL);
  // a lua minguante no peito
  b.ellipse(20, 27, 3, 3, lua); b.ellipse(21, 26, 2, 2, sombraL);
  olhao(b, 16, 11, 3, 0); olhao(b, 24, 11, 3, -1);
  if (abertos()) {
    b.rect(16, 10, 2, 3, '#d03040'); b.rect(23, 10, 2, 3, '#d03040');
    b.set(16, 10, C.bril); b.set(23, 10, C.bril);
  }
  b.set(17, 15, '#f0e8f0'); b.line(18, 16, 22, 16, '#f0e8f0'); b.set(23, 15, '#f0e8f0');
  return b.outline(P.ink);
}

/* ---------------- JUMA (Terra, evolução do Mapinguari) ---------------- */
export function juma(): Buf {
  const b = new Buf(40, 40);
  const pelo = '#e8e0cc', peloL = '#f8f4e8', peloD = '#b8ae98', chifre = '#8a7a64';
  b.rect(10, 33, 7, 6, peloD); b.rect(23, 33, 7, 6, peloD);
  b.ellipse(4, 23, 4, 7, pelo); b.ellipse(36, 23, 4, 7, pelo);
  for (const x of [1, 3, 5, 7, 33, 35, 37, 39]) b.line(x, 30, x, 32, chifre);
  // chifres de pedra
  b.tri(9, 9, 5, 0, 13, 6, chifre); b.tri(31, 9, 35, 0, 27, 6, chifre);
  b.ellipse(20, 21, 15, 15, pelo);
  b.ellipse(13, 11, 6, 3, peloL);
  for (const x of [7, 12, 28, 33]) b.tri(x - 2, 9, x, 5, x + 2, 10, pelo);
  olhao(b, 20, 12, 4, 0);
  b.line(14, 6, 26, 6, peloD);
  b.rect(9, 23, 2, 1, C.bochecha); b.rect(29, 23, 2, 1, C.bochecha);
  b.set(11, 23, C.bocaF); b.rect(12, 24, 17, 5, C.bocaF); b.set(29, 23, C.bocaF);
  for (const x of [13, 16, 19, 22, 25, 28]) b.set(x, 24, P.white);
  for (const x of [14, 18, 22, 26]) b.set(x, 28, P.white);
  b.rect(17, 27, 7, 1, C.linguaL);
  return b.outline(P.ink);
}

/* ---------------- UIRAPURU-REI (Vento/Luz, evolução do Uirapuru) ---------------- */
export function uirapuruRei(): Buf {
  const b = new Buf(40, 40);
  const amarelo = '#f2c83a', amareloL = '#fbe88a', azul = '#2a6ad0', azulL = '#6aa4ee', azulD = '#1a4088';
  b.tri(11, 19, 0, 6, 5, 31, azul); b.tri(9, 22, 1, 14, 6, 28, azulL);
  b.tri(29, 19, 40, 6, 35, 31, azul); b.tri(31, 22, 39, 14, 34, 28, azulL);
  // rabo comprido de rei
  b.tri(14, 31, 10, 39, 20, 33, azulD); b.tri(26, 31, 30, 39, 20, 33, azulD);
  b.tri(17, 32, 20, 39, 23, 32, azul);
  b.ellipse(20, 22, 11, 11, amarelo);
  b.ellipse(20, 27, 7, 5, amareloL);
  // coroa
  b.rect(14, 9, 13, 2, P.goldD);
  for (const x of [15, 20, 25]) b.tri(x - 2, 10, x, 4, x + 2, 10, P.gold);
  b.set(20, 7, '#e05a5a');
  olhao(b, 15, 19, 3, 0); olhao(b, 25, 19, 3, -1);
  b.tri(18, 23, 20, 27, 22, 23, '#e8803a');
  b.rect(10, 24, 2, 1, C.bochecha); b.rect(29, 24, 2, 1, C.bochecha);
  for (const [x, y] of [[4, 2], [36, 3], [37, 35]] as const) {
    b.line(x - 1, y, x + 1, y, amareloL); b.line(x, y - 1, x, y + 1, amareloL);
  }
  return b.outline(P.ink);
}

/* ---------------- FOGO-FÁTUO (Luz/Fogo, evolução da Lamparina) ---------------- */
export function fogoFatuo(): Buf {
  const b = new Buf(40, 40);
  const azul = '#3a7ad8', azulL = '#7ab8f4', azulM = '#d0ecff';
  // fiapos de fogo frio, soltos
  for (const [x, y, r] of [[6, 30, 2], [34, 32, 2], [8, 10, 1], [33, 8, 1]] as const) b.ellipse(x, y, r, r, azulL);
  b.tri(14, 32, 20, 39, 26, 32, azul);
  chamaComCara(b, 20, 22, 11, 10, azul, azulL, azulM);
  return b.outline(P.ink);
}

/* ---------------- BOIÚNA (Água/Raio, evolução do Arco-da-Velha) ---------------- */
export function boiuna(): Buf {
  const b = new Buf(40, 40);
  const cobra = '#24505e', cobraL = '#3e7486', barriga = '#9ad0d8', barrigaD = '#6aa4b0', raio = P.bolt;
  // a cobra grande saindo do rio: as costas em corcovas à esquerda, o rabo
  // de raio na ponta, e o pescoço erguido à direita
  b.line(2, 22, 4, 16, raio); b.line(4, 16, 1, 16, raio); b.line(1, 16, 3, 10, raio);
  for (const [x, y] of [[5, 30], [14, 29]] as const) {
    b.ellipse(x, y, 5, 6, cobra);
    b.ellipse(x - 1, y - 3, 2, 2, cobraL);
  }
  b.rect(23, 16, 10, 18, cobra);
  b.rect(25, 18, 6, 15, barriga);
  for (let y = 20; y <= 32; y += 2) b.line(25, y, 30, y, barrigaD);
  // o rio por cima, engolindo a metade de baixo das corcovas
  b.rect(0, 33, 40, 7, P.waterD);
  b.ellipse(20, 34, 19, 1, P.water);
  // cabeção, com o arco-íris por cima e o olho de luz de navio
  b.ellipse(28, 12, 11, 8, cobra);
  b.ellipse(28, 15, 8, 4, barriga);
  for (const [i, cor] of (['#e0524a', '#f09a3a', P.bolt, '#5fbf6a'] as const).entries()) b.rect(20 + i * 4, 4, 4, 2, cor);
  olhao(b, 23, 10, 3, 0); olhao(b, 33, 10, 3, -1);
  if (abertos()) for (const x of [23, 33]) b.set(x, 9, raio);
  b.set(26, 13, cobra); b.set(30, 13, cobra);
  b.set(22, 15, C.bocaF); b.rect(23, 16, 11, 2, C.bocaF); b.set(34, 15, C.bocaF);
  b.set(25, 16, P.white); b.set(31, 16, P.white);
  return b.outline(P.ink);
}

/* ---------------- ELDORADO (Fogo/Luz, evolução da Mãe-do-Ouro) ---------------- */
export function eldorado(): Buf {
  const b = new Buf(40, 40);
  // a serra de ouro, de cara, com a chama acesa no cume
  b.tri(1, 39, 20, 6, 39, 39, C.ourD);
  b.tri(5, 39, 20, 11, 35, 39, C.our);
  b.tri(14, 39, 20, 18, 26, 39, C.ourL);
  b.rect(8, 37, 24, 2, C.ourD);
  coroaDeFogo(b, 20, 7, 4, 7);
  olhao(b, 15, 26, 3, 0); olhao(b, 25, 26, 3, -1);
  b.rect(10, 31, 2, 1, C.bochecha); b.rect(29, 31, 2, 1, C.bochecha);
  b.set(16, 31, C.bocaF); b.line(17, 32, 23, 32, C.bocaF); b.set(24, 31, C.bocaF);
  for (const [x, y] of [[5, 12], [35, 10], [33, 22], [7, 24]] as const) {
    b.line(x - 1, y, x + 1, y, C.ourL); b.line(x, y - 1, x, y + 1, C.ourL);
  }
  return b.outline(P.ink);
}

/* ---------------- ECLIPSE (Luz/Sombra, evolução da Jaci) ---------------- */
export function eclipse(): Buf {
  const b = new Buf(40, 40);
  const sol = '#f6c83a', solL = '#fff2a0', lua = '#2a2040', luaL = '#4a3a62';
  // a coroa do sol, em volta
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6, c = Math.cos(a), s = Math.sin(a);
    b.tri(20 + c * 13 - s * 3, 20 + s * 13 + c * 3, 20 + c * 19, 20 + s * 19, 20 + c * 13 + s * 3, 20 + s * 13 - c * 3, i % 2 ? sol : solL);
  }
  b.ellipse(20, 20, 15, 15, sol);
  // a lua escura por cima, com cara
  b.ellipse(20, 20, 12, 12, lua);
  b.ellipse(15, 14, 4, 2, luaL);
  olhao(b, 15, 19, 3, 0); olhao(b, 25, 19, 3, -1);
  if (abertos()) for (const x of [15, 24]) b.rect(x, 19, 2, 2, sol);
  b.rect(10, 24, 2, 1, '#c86a8a'); b.rect(28, 24, 2, 1, '#c86a8a');
  b.set(16, 25, solL); b.line(17, 26, 23, 26, solL); b.set(24, 25, solL);
  return b.outline(P.ink);
}

/* -------------------------------------------------------------------------
   Registro: liga a chave `arte` de cada espécie ao desenho.
   É por aqui que a batalha e o Caderno acham o sprite certo.
   ------------------------------------------------------------------------- */
/* ---------------- BOTO (Água/Luz, o secreto) ---------------- */
export function boto(): Buf {
  const b = new Buf(32, 32);
  const rosa = '#e890a8', rosaL = '#f8c0d0', rosaD = '#c06a84';
  // de lado, olhando para a esquerda; a água por baixo
  b.ellipse(16, 28, 14, 2, P.waterD);
  b.ellipse(16, 28, 12, 1, P.water);
  b.tri(25, 20, 31, 11, 31, 26, rosaD);                 // rabo
  b.ellipse(17, 19, 10, 8, rosa);
  b.ellipse(16, 23, 7, 3, rosaL);
  b.tri(17, 12, 21, 6, 22, 13, rosaD);                   // nadadeira das costas
  b.ellipse(5, 21, 5, 2, rosa);                          // o bico comprido
  b.tri(16, 24, 21, 29, 21, 24, rosaD);
  olhao(b, 13, 16, 3, 0);
  b.rect(9, 19, 2, 1, C.bochecha);
  b.set(2, 22, C.bocaF); b.line(3, 23, 8, 23, C.bocaF); b.set(9, 22, C.bocaF);
  return b.outline(P.ink);
}

/* ---------------- BOTO-ENCANTADO (Água/Luz, evolução do Boto) ---------------- */
export function botoEncantado(): Buf {
  const b = new Buf(40, 40);
  const rosa = '#e890a8', rosaL = '#f8c0d0', terno = '#f4f0e8', ternoD = '#c8c0b0', chapeu = '#f8f6f0';
  // pernas de calça branca e sapato
  b.rect(14, 32, 4, 5, terno); b.rect(22, 32, 4, 5, terno);
  b.rect(13, 37, 6, 2, '#3a2a24'); b.rect(21, 37, 6, 2, '#3a2a24');
  // o paletó branco, a flor vermelha e as mãos
  b.ellipse(20, 28, 9, 6, terno);
  b.tri(17, 23, 20, 30, 23, 23, rosaL);
  b.line(20, 24, 20, 33, ternoD);
  b.ellipse(12, 26, 1, 1, '#e03a4a');
  b.ellipse(10, 29, 2, 3, terno); b.ellipse(30, 29, 2, 3, terno);
  b.ellipse(10, 32, 2, 1, rosa); b.ellipse(30, 32, 2, 1, rosa);
  // cabeção de boto, o focinho de bico, e o chapéu
  b.ellipse(20, 15, 10, 8, rosa);
  b.ellipse(20, 20, 4, 3, rosaL);
  b.ellipse(14, 12, 3, 2, rosaL);
  b.rect(8, 8, 25, 2, chapeu);
  b.rect(12, 2, 17, 7, chapeu);
  b.rect(12, 6, 17, 2, '#2a2a30');
  olhao(b, 16, 14, 3, 0); olhao(b, 24, 14, 3, -1);
  b.rect(11, 18, 2, 1, C.bochecha); b.rect(28, 18, 2, 1, C.bochecha);
  b.set(18, 21, C.bocaF); b.line(19, 22, 21, 22, C.bocaF); b.set(22, 21, C.bocaF);
  return b.outline(P.ink);
}

/* ---------------- COBRA NORATO (Água/Sombra, lendária escondida) ---------------- */
export function cobraNorato(): Buf {
  const b = new Buf(40, 40);
  const cobra = '#2e6a4a', cobraL = '#4a8e66', barriga = '#d8d090', barrigaD = '#aaa060', mancha = '#1a4a30';
  // deitada no barranco, enrolada em espiral, só a cabeça de chapéu erguida
  b.ellipse(18, 31, 17, 8, cobra);
  b.ellipse(18, 31, 12, 5, cobraL);
  b.ellipse(18, 31, 7, 3, cobra);
  b.rect(16, 31, 5, 1, cobraL);
  for (const [x, y] of [[5, 30], [30, 28], [12, 36], [25, 35]] as const) b.rect(x, y, 3, 2, mancha);
  // o pescoço saindo do meio da espiral
  b.rect(25, 17, 8, 13, cobra);
  b.rect(27, 19, 4, 10, barriga);
  for (let y = 21; y <= 27; y += 2) b.line(27, y, 30, y, barrigaD);
  // a cabeça clara e o chapéu de palha de quem anda de gente
  b.ellipse(29, 12, 10, 7, cobra);
  b.ellipse(29, 15, 7, 4, barriga);
  b.ellipse(24, 9, 3, 2, cobraL);
  b.ellipse(29, 5, 10, 2, '#e0c070');
  b.ellipse(29, 3, 5, 3, '#e0c070');
  b.rect(24, 4, 11, 1, '#a8883a');
  olhao(b, 25, 11, 3, 0); olhao(b, 33, 11, 3, -1);
  b.rect(20, 15, 2, 1, C.bochecha); b.rect(36, 15, 2, 1, C.bochecha);
  b.set(25, 16, C.bocaF); b.line(26, 17, 32, 17, C.bocaF); b.set(33, 16, C.bocaF);
  b.line(29, 18, 29, 20, C.lingua); b.set(28, 21, C.lingua); b.set(30, 21, C.lingua);
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
