/* =========================================================================
   Os terreiros em 3D, um por região, copiados do desenho 2D
   (art/predios.ts: terreiroAgua … terreiroLuz) peça por peça e com as
   mesmas cores: o telhado azul de espuma e a concha da Foz, a oca de palha
   e troncos da Mata, a pedra escura de chaminés acesas da Serra, a
   gameleira do Campo, a oca e o totem de Tupã, o templo no penhasco das
   Minas, o sobrado de torre e lua do Bairro, e o templo de colunas e
   cúpula do Sol. O que no 2D passa do alto (SOBRA) sobe acima do telhado.

   Também moram aqui as peças de fachada (porta, janelas), que a construção
   de loja, benzimento, posto, forja e moinho (casas.ts) usa igual.

   Puro three.js. Teste em modelos.test.ts.
   ========================================================================= */
import * as THREE from 'three';
import { P } from '../../art/palette.ts';
import { bola, caixa, cilindro, cone, peca, prismaTelhado } from './base.ts';

type Giro = { x?: number; y?: number; z?: number };
type Esc = [number, number, number];
export type Por = (g: THREE.BufferGeometry, cor: string, x: number, y: number, z: number, giro?: Giro, esc?: Esc) => void;

/* as medidas de quem monta: x de 0 a w, z de z0 (fundo) a frente, y para cima */
export interface Lote {
  p: Por;
  w: number;
  d: number;
  z0: number;
  frente: number;
  cx: number;
  cz: number;
  /* o meio do tile da porta */
  px: number;
}

export function lote(w: number, alt: number, col: number, pecas: THREE.BufferGeometry[]): Lote {
  const d = alt - 0.45, z0 = 0.05;
  const p: Por = (g, cor, x, y, z, giro, esc) => { pecas.push(peca(g, cor, x, y, z, giro, esc)); };
  return { p, w, d, z0, frente: z0 + d, cx: w / 2, cz: z0 + d / 2, px: col + 0.5 };
}

/* ------------------------------------------------------------ fachada */

export interface CoresPorta { d: string; m: string; l: string }
export const MADEIRA: CoresPorta = { d: P.doorD!, m: P.door!, l: '#9a6236' };

const disco = (r: number) => new THREE.CylinderGeometry(r, r, 0.06, 14);

/* a porta, como a do 2D: moldura escura, a folha, a faixa clara no alto,
   o risco do meio e a maçaneta; `arco` arredonda o alto. Devolve o y do
   alto da porta. */
export function porta(l: Lote, larg: number, alt: number, c: CoresPorta, arco = false, macaneta = P.gold!, base = 0.2): number {
  const { p, px, frente: f } = l;
  const reto = arco ? alt - larg / 2 : alt;
  p(caixa(larg + 0.1, reto + 0.05, 0.05), c.d, px, base + reto / 2, f + 0.02);
  p(caixa(larg, reto, 0.06), c.m, px, base + reto / 2, f + 0.04);
  if (arco) {
    p(disco(larg / 2 + 0.05), c.d, px, base + reto, f + 0.02, { x: Math.PI / 2 });
    p(disco(larg / 2), c.m, px, base + reto, f + 0.04, { x: Math.PI / 2 });
  } else {
    p(caixa(larg, 0.07, 0.065), c.l, px, base + reto - 0.05, f + 0.045);
  }
  p(caixa(0.03, reto * 0.9, 0.07), c.d, px, base + reto * 0.45, f + 0.045);
  p(bola(0.035), macaneta, px + larg * 0.3, base + alt * 0.45, f + 0.08);
  return base + alt;
}

/* janela de cruz (a da casinha do 2D) */
export function janelaCruz(l: Lote, x: number, y: number, w: number, h: number, vidro: string, moldura: string, brilho = '#b8e6fb'): void {
  const { p, frente: f } = l;
  p(caixa(w, h, 0.05), moldura, x, y, f + 0.02);
  p(caixa(w - 0.1, h - 0.1, 0.06), vidro, x, y, f + 0.03);
  p(caixa(w - 0.1, h * 0.25, 0.065), brilho, x, y + h * 0.3, f + 0.035);
  p(caixa(0.06, h, 0.07), moldura, x, y, f + 0.04);
  p(caixa(w, 0.06, 0.07), moldura, x, y, f + 0.04);
}

/* janela em arco, acesa ou de vidro */
export function janelaArco(l: Lote, x: number, y: number, w: number, h: number, vidro: string, moldura: string): void {
  const { p, frente: f } = l;
  const reto = h - w / 2;
  p(caixa(w, reto, 0.05), moldura, x, y - h / 2 + reto / 2, f + 0.02);
  p(disco(w / 2), moldura, x, y - h / 2 + reto, f + 0.02, { x: Math.PI / 2 });
  p(caixa(w - 0.1, reto - 0.05, 0.06), vidro, x, y - h / 2 + reto / 2 + 0.02, f + 0.03);
  p(disco(w / 2 - 0.05), vidro, x, y - h / 2 + reto, f + 0.03, { x: Math.PI / 2 });
  p(caixa(0.05, h * 0.9, 0.07), moldura, x, y, f + 0.04);
}

/* janela de veneziana: as ripas na frente do vidro */
function janelaVeneziana(l: Lote, x: number, y: number, w: number, h: number, vidro: string, moldura: string): void {
  const { p, frente: f } = l;
  p(caixa(w, h, 0.05), moldura, x, y, f + 0.02);
  p(caixa(w - 0.1, h - 0.1, 0.06), vidro, x, y, f + 0.03);
  for (let k = -h / 2 + 0.12; k < h / 2 - 0.05; k += 0.12) p(caixa(w - 0.1, 0.03, 0.08), moldura, x, y + k, f + 0.04);
}

/* janela redonda (a escotilha da Foz) */
function janelaRedonda(l: Lote, x: number, y: number, r: number, vidro: string, moldura: string): void {
  const { p, frente: f } = l;
  p(disco(r), moldura, x, y, f + 0.02, { x: Math.PI / 2 });
  p(disco(r - 0.07), vidro, x, y, f + 0.035, { x: Math.PI / 2 });
  p(caixa(0.05, r * 1.8, 0.08), moldura, x, y, f + 0.05);
  p(bola(0.05), '#ffffff', x - r * 0.4, y + r * 0.4, f + 0.07);
}

/* telhado de duas águas com a cumeeira clara e o beiral escuro do 2D */
export function duasAguas(l: Lote, x: number, w: number, y: number, alto: number, c: { l: string; m: string; d: string },
                          beiral = 0.3, z0 = l.z0, d = l.d): void {
  const { p } = l;
  const cz = z0 + d / 2;
  p(prismaTelhado(w, d, alto, beiral), c.m, x + w / 2, y, cz);
  p(caixa(w + beiral * 2, 0.08, 0.22), c.l, x + w / 2, y + alto - 0.02, cz);
  p(caixa(w + beiral * 2, 0.1, 0.1), c.d, x + w / 2, y + 0.02, z0 + d + beiral - 0.04);
}

/* ponto na água da frente de um telhado de duas águas, a fração t do beiral até a cumeeira */
function naAguaDaFrente(l: Lote, y: number, alto: number, t: number, beiral = 0.3): { y: number; z: number; giro: number } {
  const meia = l.d / 2 + beiral;
  return { y: y + alto * t + 0.04, z: l.cz + meia * (1 - t) + 0.04, giro: -Math.atan2(alto, meia) };
}

function chama(l: Lote, x: number, y: number, z: number, s = 1): void {
  l.p(cone(0.18 * s, 0.5 * s, 5), P.fire!, x, y + 0.25 * s, z);
  l.p(cone(0.1 * s, 0.32 * s, 5), P.fireL!, x, y + 0.17 * s, z + 0.03 * s);
}

/* ------------------------------------------------------------ os oito */

const H_TERREIRO = 2.4;

function terreiroAgua(l: Lote): number {
  const { p, w, d, frente: f, cx, cz, px } = l, h = H_TERREIRO, alto = 1.7;
  p(caixa(w + 0.1, 0.2, d + 0.1), '#d8d0c0', cx, 0.1, cz);
  p(caixa(w - 0.2, h, d), '#f6f2ea', cx, h / 2, cz);
  for (const x of [0.17, w - 0.17]) p(caixa(0.16, h, 0.06), '#d8d0c0', x, h / 2, f + 0.01);
  // o barrado de azulejo: branco com o desenho azul
  p(caixa(w - 0.2, 0.75, 0.04), '#ffffff', cx, 0.2 + 0.375, f + 0.01);
  for (let y = 0.3; y < 0.9; y += 0.25) {
    for (let x = 0.35; x < w - 0.2; x += 0.25) {
      if (Math.abs(x - px) < 0.55) continue;
      p(caixa(0.07, 0.07, 0.02), P.waterD!, x, y, f + 0.035, { z: Math.PI / 4 });
    }
  }
  duasAguas(l, 0, w, h, alto, { l: P.waterL!, m: P.water!, d: P.waterD! });
  // espuma na cumeeira e a gota em cima
  for (let x = 0.7; x < w - 0.6; x += 0.32) p(bola(0.19), P.foam!, x, h + alto + 0.06, cz);
  p(bola(0.34, 1), P.water!, cx, h + alto + 0.5, cz, {}, [1, 1, 0.8]);
  p(cone(0.26, 0.62, 8), P.waterL!, cx, h + alto + 0.98, cz);
  // a concha rosada na água da frente do telhado
  const c = naAguaDaFrente(l, h, alto, 0.38);
  p(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 14, 1, false, Math.PI / 2, Math.PI), '#f0c0a8', cx, c.y, c.z, { x: Math.PI / 2 + c.giro });
  for (let k = -3; k <= 3; k++) {
    p(caixa(0.04, 0.6, 0.03), '#d08a70', cx + Math.sin(k * 0.42) * 0.3, c.y + Math.cos(k * 0.42) * 0.28 * Math.cos(c.giro), c.z + 0.06 + Math.cos(k * 0.42) * 0.28 * Math.sin(-c.giro), { x: c.giro, z: -k * 0.42 });
  }
  janelaRedonda(l, 1.1, h * 0.62, 0.38, P.win!, P.waterD!);
  janelaRedonda(l, w - 1.1, h * 0.62, 0.38, P.win!, P.waterD!);
  return porta(l, 0.85, 1.65, { d: '#1f4f8a', m: P.water!, l: P.waterL! }, true);
}

function terreiroPlanta(l: Lote): number {
  const { p, w, d, frente: f, cx, cz, px } = l, h = 1.7;
  p(caixa(w + 0.1, 0.2, d + 0.1), '#5a3a1e', cx, 0.1, cz);
  p(caixa(w - 0.3, h, d - 0.3), '#7a5230', cx, h / 2, cz);
  // a paliçada de troncos, na frente e dos lados
  const tora = ['#7a5230', '#946a40', '#6d4726'];
  for (let x = 0.3, i = 0; x < w - 0.2; x += 0.36, i++) {
    if (Math.abs(x - px) < 0.5) continue;
    p(cilindro(0.15, 0.16, h + 0.15, 6), tora[i % 3]!, x, (h + 0.15) / 2, f - 0.1);
  }
  for (let z = l.z0 + 0.3, i = 0; z < f - 0.1; z += 0.4, i++) {
    for (const x of [0.2, w - 0.2]) p(cilindro(0.15, 0.16, h + 0.15, 6), tora[i % 3]!, x, (h + 0.15) / 2, z);
  }
  // as escoras de pau na base
  for (const [x0, s] of [[0.5, 1], [w * 0.27, -1], [w * 0.7, 1], [w - 0.75, -1]] as const) {
    p(cilindro(0.05, 0.05, 0.8, 4), '#5a3a1e', x0 + s * 0.25, 0.45, f + 0.1, { z: -s * 0.75 });
  }
  // a cúpula de palha, redonda, que desce bem baixo
  const domo = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  p(domo, '#a8903a', cx, h - 0.35, cz, {}, [w / 2 + 0.4, 2.1, d / 2 + 0.45]);
  p(new THREE.SphereGeometry(1, 12, 3, 0, Math.PI * 2, 0, Math.PI / 5), '#d8c060', cx, h - 0.35, cz, {}, [w / 2 + 0.42, 2.12, d / 2 + 0.47]);
  p(new THREE.TorusGeometry(1, 0.06, 4, 16), '#6a5a20', cx, h - 0.3, cz, { x: Math.PI / 2 }, [w / 2 + 0.42, d / 2 + 0.47, 1]);
  // a folha verde no alto da frente
  const fy = h + 1.05, fz = cz + (d / 2 + 0.45) * 0.72;
  p(bola(1, 1), '#3f8a3a', cx, fy, fz, { x: -0.6 }, [0.5, 0.85, 0.1]);
  p(bola(1, 1), '#5aa44a', cx, fy, fz + 0.05, { x: -0.6 }, [0.38, 0.7, 0.09]);
  p(caixa(0.05, 1.5, 0.04), '#2a5e28', cx, fy, fz + 0.11, { x: -0.6 });
  // cipós pendurados do beiral
  for (const x of [w * 0.14, w * 0.3, w * 0.7, w * 0.86]) {
    const comp = 0.5 + ((x * 7) % 0.6);
    p(caixa(0.04, comp, 0.04), P.tree!, x, h - 0.1 - comp / 2, f + 0.15);
  }
  janelaVeneziana(l, 1.2, 0.95, 0.75, 0.6, '#2a3a20', '#5a3a1e');
  janelaVeneziana(l, w - 1.2, 0.95, 0.75, 0.6, '#2a3a20', '#5a3a1e');
  // a porta escura com a cortina de folhas
  p(caixa(0.9, 1.6, 0.06), '#2a1e14', px, 0.2 + 0.8, f + 0.04);
  for (let x = -0.38, i = 0; x <= 0.38; x += 0.13, i++) {
    const comp = 1.1 + (i % 3) * 0.15;
    p(caixa(0.06, comp, 0.03), i % 2 ? '#3f8a3a' : '#5aa44a', px + x, 1.8 - comp / 2, f + 0.08);
  }
  return 1.8;
}

function terreiroFogo(l: Lote): number {
  const { p, w, d, frente: f, cx, cz } = l, h = H_TERREIRO, alto = 1.25;
  p(caixa(w + 0.1, 0.2, d + 0.1), '#221c24', cx, 0.1, cz);
  p(caixa(w - 0.2, h, d), '#221c24', cx, h / 2, cz);
  // as pedras da frente, com o rejunte por baixo
  for (let j = 0, y = 0.3; y < h - 0.1; j++, y += 0.27) {
    for (let x = 0.15 + (j % 2 ? 0.2 : 0); x < w - 0.2; x += 0.44) {
      const lado = Math.min(0.4, w - 0.15 - x);
      if (lado < 0.15) continue;
      p(caixa(lado, 0.22, 0.04), ((Math.round(x * 13) + j * 7) % 3) === 0 ? '#342e36' : '#443c44', x + lado / 2, y, f + 0.015);
    }
  }
  for (let k = 0; k < 16; k++) {
    p(caixa(0.05, 0.05, 0.03), k % 2 ? P.fire! : P.fireL!, 0.4 + ((k * 1.81) % (w - 0.8)), 0.45 + ((k * 0.73) % (h - 0.7)), f + 0.045);
  }
  duasAguas(l, 0, w, h, alto, { l: '#c24a2a', m: '#8a2a1a', d: '#5a180e' });
  // riscos de lava descendo a água da frente
  for (let x = 1.3; x < w - 1.2; x += 0.56) {
    const a = naAguaDaFrente(l, h, alto, 0.35);
    p(caixa(0.04, 0.6, 0.02), '#ff8a3a', x, a.y, a.z, { x: a.giro + Math.PI / 2, z: 0.25 });
  }
  // as duas chaminés, com a chama na ponta
  for (const x of [0.95, w - 0.95]) {
    const topo = h + alto + 0.9;
    p(caixa(0.6, topo - h + 0.4, 0.6), '#342e36', x, h - 0.2 + (topo - h + 0.4) / 2, cz + 0.6);
    p(caixa(0.66, 0.1, 0.66), '#5a5058', x, topo + 0.2, cz + 0.6);
    chama(l, x, topo + 0.25, cz + 0.6, 1.1);
  }
  // a chama no frontão
  const c = naAguaDaFrente(l, h, alto, 0.4);
  chama(l, cx, c.y - 0.15, c.z + 0.12, 1.9);
  janelaArco(l, 1.4, 1.45, 0.8, 0.8, '#ff8a2a', '#221c24');
  janelaArco(l, w - 1.4, 1.45, 0.8, 0.8, '#ff8a2a', '#221c24');
  const topo = porta(l, 0.85, 1.65, { d: '#221c24', m: P.fireD!, l: P.fire! }, true, P.fireL!);
  // o fogo lá dentro
  p(caixa(0.45, 0.75, 0.04), P.fireL!, l.px, 0.2 + 0.375, f + 0.08);
  p(caixa(0.22, 0.95, 0.04), '#ffe080', l.px, 0.2 + 0.475, f + 0.09);
  return topo;
}

function terreiroVento(l: Lote): number {
  const { p, w, d, frente: f, cx, cz, px } = l, h = 1.9;
  const x0 = 1.1, x1 = w - 1.1;
  p(caixa(w + 0.1, 0.2, d + 0.1), '#6b4a2e', cx, 0.1, cz);
  // o salão de tábuas
  p(caixa(x1 - x0, h, d - 0.4), '#a87848', cx, h / 2, cz);
  for (let x = x0 + 0.2; x < x1; x += 0.25) p(caixa(0.03, h - 0.1, 0.03), '#7a5230', x, h / 2, f - 0.19);
  duasAguas(l, x0 - 0.1, x1 - x0 + 0.2, h, 0.6, { l: '#c8a048', m: '#a8803a', d: '#6a5020' }, 0.25, l.z0 + 0.2, d - 0.4);
  // o tronco da gameleira atrás, os dois galhos e a copa por cima de tudo
  p(cilindro(0.55, 0.75, 2.2, 8), '#7a5230', cx, h + 0.8, cz - 0.5);
  for (const s of [-1, 1]) p(cilindro(0.1, 0.16, 2.6, 5), '#523418', cx + s * 1.3, h + 1.5, cz - 0.3, { z: -s * 1.1 });
  const bolotas: [number, number, number, number][] = [];
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    bolotas.push([cx + Math.cos(a) * (w / 2) * 0.62 + 0.15, h + 2.8 + Math.sin(a) * 0.5, cz - 0.2 + Math.sin(a * 2) * 0.6, 1.05]);
  }
  bolotas.push([cx + 0.15, h + 3.0, cz - 0.2, 1.5]);
  bolotas.forEach(([x, y, z, r], i) => {
    p(bola(r, 1), '#3f7f38', x, y, z, {}, [1, 0.8, 1]);
    if (i % 2 === 0) p(bola(r * 0.35, 0), '#8ad070', x - r * 0.3, y + r * 0.55, z + r * 0.3);
  });
  p(bola(w * 0.45, 1), '#1f4c22', cx, h + 2.45, cz - 0.2, {}, [1, 0.35, 0.9]);
  // as raízes aéreas, em cortina dos dois lados
  for (const [a, b] of [[0.1, x0 - 0.05], [x1 + 0.05, w - 0.1]] as const) {
    for (let x = a, i = 0; x <= b; x += 0.16, i++) {
      for (const z of [f - 0.15, f - 0.7, f - 1.3]) {
        const comp = h + 2.2 - ((i * 7 + z * 3) % 0.9);
        p(cilindro(0.025, 0.025, comp, 3), (i + Math.round(z)) % 3 ? '#6e4a2a' : '#946a40', x + ((i * 0.37) % 0.08), h + 2.3 - comp / 2, z);
      }
    }
  }
  for (const x of [x0 + 0.15, x1 - 0.15]) p(caixa(0.22, h, 0.22), '#6e4a2a', x, h / 2, f - 0.1);
  janelaCruz(l, x0 + 0.65, 1.15, 0.6, 0.6, '#ffcf70', '#523418', '#fff0b0');
  janelaCruz(l, x1 - 0.65, 1.15, 0.6, 0.6, '#ffcf70', '#523418', '#fff0b0');
  for (const x of [cx - 0.8, cx + 0.8]) {
    p(caixa(0.03, 0.25, 0.03), '#523418', x, h - 0.15, f + 0.1);
    p(caixa(0.22, 0.24, 0.22), '#523418', x, h - 0.4, f + 0.1);
    p(caixa(0.15, 0.17, 0.24), '#ffcf70', x, h - 0.4, f + 0.1);
  }
  void px;
  return porta(l, 0.85, 1.5, MADEIRA, true);
}

function terreiroRaio(l: Lote): number {
  const { p, w, d, cx, cz, px } = l, h = 3.2;
  p(caixa(w + 0.1, 0.2, d + 0.1), '#8a6a3a', cx, 0.1, cz);
  // a oca do Xingu, um pouco à direita, com os anéis de amarração
  const ox = cx + 0.35, rx = w / 2 - 0.45, rz = d / 2 + 0.1;
  p(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#b89858', ox, 0.15, cz, {}, [rx, h, rz]);
  for (const t of [0.22, 0.45, 0.66, 0.84]) {
    const r = Math.sqrt(1 - t * t);
    p(new THREE.TorusGeometry(1, 0.035, 3, 18), '#6a5428', ox, 0.15 + h * t, cz, { x: Math.PI / 2 }, [rx * r + 0.02, rz * r + 0.02, 1]);
  }
  p(new THREE.SphereGeometry(1, 14, 2, 0, Math.PI * 2, 0, Math.PI / 9), '#d8bc78', ox, 0.15, cz, {}, [rx + 0.01, h + 0.01, rz + 0.01]);
  // os fiapos de palha escura, espalhados pela frente da cúpula
  for (let k = 0; k < 36; k++) {
    const a = 0.25 + ((k * 0.618) % 1) * (Math.PI - 0.5), t = 0.08 + ((k * 0.381) % 1) * 0.8;
    const r = Math.sqrt(1 - t * t);
    p(caixa(0.16, 0.04, 0.04), '#8a6e38', ox + Math.cos(a) * rx * r, 0.15 + h * t, cz + Math.sin(a) * rz * r + 0.02, { y: -a + Math.PI / 2 });
  }
  // o totem à esquerda: três caras e a ave do trovão no alto
  const tx = 0.4, tz = l.frente - 0.3, alto = 3.9;
  p(caixa(0.7, alto, 0.6), '#7a4a2a', tx, alto / 2, tz);
  p(caixa(0.12, alto, 0.62), '#5a3418', tx - 0.29, alto / 2, tz);
  for (const [y, c] of [[alto - 0.9, '#c2493f'], [alto - 1.9, P.water!], [alto - 2.9, P.bolt!]] as const) {
    p(caixa(0.6, 0.6, 0.06), c, tx + 0.02, y, tz + 0.31);
    for (const ox2 of [-0.13, 0.13]) p(caixa(0.1, 0.1, 0.03), P.ink!, tx + ox2, y + 0.08, tz + 0.35);
    p(caixa(0.25, 0.05, 0.03), P.ink!, tx + 0.02, y - 0.15, tz + 0.35);
  }
  for (const s of [-1, 1]) p(cone(0.35, 1.2, 3), '#2e3a5a', tx + s * 0.6, alto + 0.3, tz, { z: s * 1.25 }, [1, 1, 0.4]);
  p(cone(0.22, 0.5, 4), '#f4f0e8', tx, alto + 0.35, tz);
  p(caixa(0.06, 0.2, 0.06), P.bolt!, tx, alto + 0.3, tz + 0.2, { z: 0.4 });
  // a porta em arco escuro, aberta na palha
  const f = cz + rz * Math.sqrt(Math.max(0, 1 - ((px - ox) / rx) ** 2)) * 0.97;
  const fl: Lote = { ...l, frente: f };
  return porta(fl, 0.9, 1.65, { d: '#2a1810', m: '#2a1810', l: '#4a2c1a' }, true, '#2a1810');
}

function terreiroTerra(l: Lote): number {
  const { p, w, d, frente: f, cx, cz, px } = l, h = 2.4;
  // o penhasco vermelho, com o topo recortado e as camadas da rocha
  p(caixa(w, h + 0.6, d), '#b05a38', cx, (h + 0.6) / 2, cz);
  for (let y = 0.4; y < h + 0.5; y += 0.32) p(caixa(w + 0.02, 0.05, d + 0.02), '#9a4a2c', cx, y, cz);
  for (let k = 0; k < 7; k++) {
    const x = 0.5 + k * ((w - 1) / 6), alto = 0.5 + Math.abs(Math.sin(k * 1.7)) * 0.9 + (k === 0 || k === 6 ? -0.3 : 0);
    p(cone(0.7, alto, 4), k % 2 ? '#c87050' : '#b05a38', x, h + 0.6 + alto / 2 - 0.05, cz - 0.3 + (k % 3) * 0.3, { y: k });
  }
  for (let k = 0; k < 14; k++) p(caixa(0.2 + (k % 3) * 0.06, 0.05, 0.03), k % 2 ? '#c87050' : '#8a4028', 0.3 + ((k * 2.37) % (w - 0.6)), 0.3 + ((k * 1.13) % h), f + 0.015);
  // a fachada esculpida: frontão, quatro colunas, o cristal e o nicho
  const f0 = 1.1, f1 = w - 1.1, topoF = h - 0.15;
  p(caixa(f1 - f0, topoF, 0.15), '#c87a58', cx, topoF / 2, f + 0.07);
  p(caixa(f1 - f0, 0.1, 0.17), '#e8a080', cx, topoF, f + 0.08);
  const front = new THREE.Shape();
  front.moveTo(-(f1 - f0) / 2 - 0.25, 0); front.lineTo(0, 1.05); front.lineTo((f1 - f0) / 2 + 0.25, 0); front.lineTo(-(f1 - f0) / 2 - 0.25, 0);
  p(new THREE.ExtrudeGeometry(front, { depth: 0.18, bevelEnabled: false }), '#c87a58', cx, topoF, f - 0.02);
  const dentro = new THREE.Shape();
  dentro.moveTo(-(f1 - f0) / 2 + 0.05, 0.06); dentro.lineTo(0, 0.88); dentro.lineTo((f1 - f0) / 2 - 0.05, 0.06); dentro.lineTo(-(f1 - f0) / 2 + 0.05, 0.06);
  p(new THREE.ExtrudeGeometry(dentro, { depth: 0.04, bevelEnabled: false }), '#d88c68', cx, topoF, f + 0.16);
  const cristal = (x: number, y: number, z: number, c: string, s = 1) => p(cone(0.13 * s, 0.5 * s, 4), c, x, y, z);
  cristal(cx, topoF + 0.5, f + 0.22, '#5ad0e0');
  for (const x of [f0 + 0.3, f0 + 1.15, f1 - 1.15, f1 - 0.3]) {
    p(cilindro(0.16, 0.16, topoF - 0.35, 8), '#e0a080', x, 0.2 + (topoF - 0.35) / 2, f + 0.25);
    p(caixa(0.5, 0.15, 0.4), '#b06848', x, topoF - 0.07, f + 0.25);
    p(caixa(0.5, 0.15, 0.4), '#b06848', x, 0.22, f + 0.25);
  }
  // o nicho com os três cristais, sobre a porta
  p(caixa(1.1, 0.8, 0.06), '#6a3020', px, 2.05 - 0.15, f + 0.15);
  cristal(px - 0.3, 1.9 - 0.15, f + 0.22, '#e05a8a', 0.6);
  cristal(px, 2.0 - 0.15, f + 0.22, '#5ad0e0', 0.7);
  cristal(px + 0.3, 1.9 - 0.15, f + 0.22, '#f2c43d', 0.6);
  // a porta funda
  p(caixa(1.15, 1.6, 0.06), '#3a1810', px, 1.0, f + 0.15);
  p(caixa(1.15, 0.1, 0.07), '#8a4028', px, 1.78, f + 0.16);
  const fl: Lote = { ...l, frente: f + 0.15 };
  porta(fl, 0.85, 1.35, { d: '#2a1008', m: '#4a2414', l: '#6a3420' });
  return 1.5;
}

function terreiroSombra(l: Lote): number {
  const { p, w, d, frente: f, cx, cz } = l, h = 2.2;
  p(caixa(w + 0.1, 0.2, d + 0.1), '#2e2440', cx, 0.1, cz);
  p(caixa(w - 0.6, h, d), '#4a3a5a', cx, h / 2, cz);
  for (const x of [0.4, w - 0.4]) p(caixa(0.2, h, 0.06), '#2e2440', x, h / 2, f + 0.01);
  // os dois telhados dos lados
  const telha = { l: '#4a3a5a', m: '#2e2440', d: '#1a1428' };
  duasAguas(l, 0.05, cx - 0.95, h, 1.0, telha, 0.25);
  duasAguas(l, cx + 0.9, w - cx - 0.95, h, 1.0, telha, 0.25);
  // a torre do meio, com o telhado pontudo e a lua
  const tz = cz + d / 2 - 0.9, alto = h + 2.0;
  p(caixa(1.8, alto, 1.8), '#4a3a5a', cx, alto / 2, tz);
  p(caixa(0.12, alto, 0.06), '#2e2440', cx - 0.86, alto / 2, tz + 0.91);
  p(cone(1.6, 1.4, 4), '#2e2440', cx, alto + 0.7, tz, { y: Math.PI / 4 });
  p(cone(1.35, 1.2, 4), '#3a2d4a', cx, alto + 0.62, tz + 0.04, { y: Math.PI / 4 });
  p(disco(0.38), P.light!, cx, alto - 0.55, tz + 0.91, { x: Math.PI / 2 });
  p(disco(0.32), '#4a3a5a', cx + 0.2, alto - 0.45, tz + 0.93, { x: Math.PI / 2 });
  // as janelas góticas lilás
  for (const x of [1.0, w - 1.0]) {
    p(caixa(0.6, 0.95, 0.05), '#1a1428', x, 1.15, f + 0.02);
    p(caixa(0.45, 0.85, 0.06), '#a070e0', x, 1.12, f + 0.03);
    p(cone(0.32, 0.45, 4), '#1a1428', x, 1.83, f + 0.02, { y: Math.PI / 4 }, [1, 1, 0.15]);
    p(cone(0.24, 0.35, 4), '#a070e0', x, 1.8, f + 0.04, { y: Math.PI / 4 }, [1, 1, 0.12]);
    p(caixa(0.04, 1.2, 0.07), '#1a1428', x, 1.25, f + 0.05);
  }
  // os corvos no beiral
  for (const x of [1.4, w - 1.5]) {
    p(caixa(0.3, 0.2, 0.22), P.ink!, x, h + 0.55, f - 0.4);
    p(cone(0.06, 0.12, 4), P.uiAcc!, x + 0.2, h + 0.58, f - 0.4, { z: -Math.PI / 2 });
  }
  return porta(l, 0.85, 1.65, { d: '#1a1428', m: '#2e2440', l: '#4a3a5a' }, true, P.silverD!);
}

function terreiroLuz(l: Lote): number {
  const { p, w, d, cx, cz } = l, h = 2.3;
  // os dois degraus claros
  p(caixa(w + 0.1, 0.2, d + 0.3), '#e8dcc0', cx, 0.1, cz + 0.1);
  p(caixa(w - 0.6, 0.2, d + 0.05), '#f4ecd8', cx, 0.3, cz);
  const base = 0.4, f = l.frente;
  p(caixa(w - 1.2, h, d - 0.3), '#fffaf0', cx, base + h / 2, cz - 0.1);
  for (const x of [0.75, w - 0.75]) p(caixa(0.16, h, 0.06), '#e8dcc0', x, base + h / 2, f - 0.24);
  // as quatro colunas
  for (const x of [1.09, 2.09, w - 2.03, w - 1.03]) {
    p(cilindro(0.2, 0.22, h - 0.3, 10), '#fbf1de', x, base + 0.15 + (h - 0.3) / 2, f + 0.1);
    p(caixa(0.56, 0.17, 0.5), P.lightD!, x, base + h - 0.08, f + 0.1);
    p(caixa(0.56, 0.17, 0.5), P.lightD!, x, base + 0.09, f + 0.1);
  }
  // o frontão dourado, com o sol, e a cúpula com a ponta
  duasAguas(l, 0.25, w - 0.5, base + h, 1.15, { l: P.light!, m: P.gold!, d: P.goldD! }, 0.3, l.z0, d + 0.3);
  const s = naAguaDaFrente({ ...l, d: d + 0.3, cz: l.z0 + (d + 0.3) / 2 }, base + h, 1.15, 0.42);
  p(disco(0.5), P.gold!, cx, s.y, s.z + 0.04, { x: Math.PI / 2 + s.giro });
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    p(caixa(0.07, 0.26, 0.03), '#e3a020', cx + Math.cos(a) * 0.68, s.y + Math.sin(a) * 0.68 * Math.cos(s.giro), s.z + 0.06 - Math.sin(a) * 0.68 * Math.sin(-s.giro), { x: s.giro, z: a - Math.PI / 2 });
  }
  const topo = base + h + 1.15;
  p(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.lightD!, cx, topo - 0.25, cz, {}, [1.05, 1.0, 1.05]);
  p(bola(0.3, 1), P.light!, cx - 0.35, topo + 0.45, cz + 0.4);
  p(cilindro(0.04, 0.04, 0.6, 5), P.goldD!, cx, topo + 1.0, cz);
  p(bola(0.1, 1), P.light!, cx, topo + 1.35, cz);
  const fl: Lote = { ...l, frente: f - 0.22 };
  janelaArco(fl, cx - 1.05, base + 1.2, 0.55, 0.9, P.win!, P.lightD!);
  janelaArco(fl, cx + 1.05, base + 1.2, 0.55, 0.9, P.win!, P.lightD!);
  return porta(fl, 0.85, 1.4, { d: P.goldD!, m: P.gold!, l: P.light! }, true, '#ffffff', base);
}

export const TERREIRO_3D: Record<string, (l: Lote) => number> = {
  agua: terreiroAgua, planta: terreiroPlanta, fogo: terreiroFogo, vento: terreiroVento,
  raio: terreiroRaio, terra: terreiroTerra, sombra: terreiroSombra, luz: terreiroLuz,
};

/* o fundo da placa de cada terreiro, o mesmo do placa() do 2D */
export const FUNDO_PLACA_TERREIRO: Record<string, string> = {
  agua: '#d3ebff', planta: '#b8e0a0', fogo: '#ffb080', vento: '#e8f0c8',
  raio: '#f4e0a0', terra: '#f4d8c0', sombra: '#c8b0e8', luz: P.light!,
};
