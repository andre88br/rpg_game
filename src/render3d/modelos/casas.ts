/* =========================================================================
   As construções low-poly, com a cara de cada região — a mesma ideia de
   art/predios.ts, agora de pé:
     água    cal com barrado azul, telhado de telha
     planta  taipa e palha
     fogo    pedra e ardósia, com chaminé
     vento   tábua, com a gameleira por cima e as raízes descendo
     raio    oca redonda do Xingu
     terra   adobe de teto plano, com platibanda e vigas
     sombra  sobrado torto de dois andares
     luz     cal e ouro
   O terreiro de cada região é o desenho 2D dela, em sólidos (terreiros.ts).
   Benzimento, loja, posto, forja e moinho são, como no 2D, a mesma
   construção em todo lugar (construcao3D). A arena e o balão têm modelo
   próprio.

   O modelo fica em coordenadas do objeto: x de 0 à largura (em tiles), z de
   0 até a frente, y para cima. A porta cai na coluna de `colunaPorta`, a
   mesma do mapa plano — é por ela que se entra.
   ========================================================================= */
import * as THREE from 'three';
import type { TipoObjeto } from '../../world/tilemap.ts';
import { colunaPorta } from '../../art/tiles.ts';
import { PREDIOS } from '../relevo.ts';
import { larguraTexto } from '../../art/font.ts';
import { P } from '../../art/palette.ts';
import { bola, caixa, cilindro, cone, juntar, peca, prismaTelhado } from './base.ts';
import { FUNDO_PLACA_TERREIRO, MADEIRA, TERREIRO_3D, duasAguas, janelaCruz, lote, porta } from './terreiros.ts';

export type Forma = 'cal' | 'taipa' | 'pedra' | 'gameleira' | 'oca' | 'adobe' | 'sobrado' | 'templo';

interface Estilo {
  forma: Forma;
  parede: string;
  base: string;
  telhado: string;
  telhadoEscuro: string;
  porta: string;
}

export const ESTILO_DA_REGIAO: Record<string, Estilo> = {
  agua: { forma: 'cal', parede: '#f4eee2', base: '#3f7fbf', telhado: '#c8653a', telhadoEscuro: '#9a4a28', porta: '#3f6a9a' },
  planta: { forma: 'taipa', parede: '#b48a5e', base: '#7a5a3a', telhado: '#d8b45a', telhadoEscuro: '#a88a3a', porta: '#5a3e24' },
  fogo: { forma: 'pedra', parede: '#8e847a', base: '#5a524a', telhado: '#4a4a5a', telhadoEscuro: '#33333f', porta: '#5a3a2a' },
  vento: { forma: 'gameleira', parede: '#a8805a', base: '#6b4a2e', telhado: '#7a5a3a', telhadoEscuro: '#5a4028', porta: '#4a3220' },
  raio: { forma: 'oca', parede: '#c8a860', base: '#8a6a3a', telhado: '#d4b060', telhadoEscuro: '#a88840', porta: '#3a2818' },
  terra: { forma: 'adobe', parede: '#c87a52', base: '#9a5a38', telhado: '#b06a42', telhadoEscuro: '#8a4a2a', porta: '#5a3a24' },
  sombra: { forma: 'sobrado', parede: '#6e5e80', base: '#4a3e58', telhado: '#3a2a4a', telhadoEscuro: '#2a1e38', porta: '#2a1e2a' },
  luz: { forma: 'templo', parede: '#f8f4e8', base: '#e0b040', telhado: '#f0e8d0', telhadoEscuro: '#e0b040', porta: '#8a6a2a' },
  fora: { forma: 'cal', parede: '#f2eadc', base: '#c9a227', telhado: '#c2493f', telhadoEscuro: '#93312c', porta: '#6b4a2e' },
};

export interface Predio3D {
  geo: THREE.BufferGeometry;
  /* o letreiro sobre a porta (a vista desenha a placa como a do 2D) */
  letreiro?: { texto: string; fundo: string; x: number; y: number; z: number; larg: number };
  /* a coluna da porta, em tiles a partir da esquerda */
  portaCol: number;
}

const JANELA = '#8ed0ec', JANELA_ACESA = '#f4d070', MOLDURA = '#5a3e24';

export function predio3D(regiao: string | null, tipo: TipoObjeto, w: number, alt: number,
                         portaCol?: number): Predio3D {
  if (tipo === 'arena') return arena(w, alt, portaCol);
  if (tipo === 'balao') return { geo: balao(w), portaCol: 0 };
  const col = colunaPorta(w, portaCol);
  const cfg = PREDIOS[tipo];
  // o terreiro de cada região é o desenho dela (terreiros.ts)
  const construtor = tipo === 'terreiro' && regiao ? TERREIRO_3D[regiao] : undefined;
  if (construtor) {
    const pecas: THREE.BufferGeometry[] = [];
    const l = lote(w, alt, col, pecas);
    const topo = construtor(l);
    return { geo: juntar(pecas), portaCol: col,
             letreiro: letreiro(pecas, w, l.px, topo, 'TERREIRO', FUNDO_PLACA_TERREIRO[regiao!]!) };
  }
  // loja, benzimento, posto, forja e moinho: a construção única do 2D
  if (tipo !== 'casa' && cfg) return construcao3D(w, alt, col, cfg);
  return casa(regiao, w, alt, col);
}

/* a casa comum, com a cara da região */
function casa(regiao: string | null, w: number, alt: number, col: number): Predio3D {
  const est: Estilo = ESTILO_DA_REGIAO[regiao ?? 'fora'] ?? ESTILO_DA_REGIAO['fora']!;
  const d = alt - 0.45, z0 = 0.05, frente = z0 + d, cx = w / 2, cz = z0 + d / 2;
  const h = est.forma === 'sobrado' ? 2.6 : 1.7;
  const px = col + 0.5;
  const pecas: THREE.BufferGeometry[] = [];
  const p = (g: THREE.BufferGeometry, cor: string, x: number, y: number, z: number,
             giro?: { x?: number; y?: number; z?: number }, esc?: [number, number, number]) =>
    pecas.push(peca(g, cor, x, y, z, giro, esc));

  // o embasamento, sempre
  p(caixa(w + 0.1, 0.2, d + 0.1), est.base, cx, 0.1, cz);

  /* ---------------------------------------------------------- paredes */
  if (est.forma === 'oca') {
    // a oca é o próprio telhado: uma cúpula de palha até o chão
    const domo = new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    p(domo, est.telhado, cx, 0.15, cz, {}, [w / 2 + 0.15, h * 1.15, d / 2 + 0.15]);
    p(new THREE.SphereGeometry(1, 9, 2, 0, Math.PI * 2, 0, Math.PI / 6), est.telhadoEscuro, cx, 0.15 + h * 0.75, cz, {}, [w / 4, h * 0.5, d / 4]);
  } else {
    p(caixa(w - 0.1, h, d), est.parede, cx, h / 2, cz);
    if (est.forma === 'cal') p(caixa(w - 0.04, 0.35, d + 0.04), est.base, cx, 0.32, cz);
    if (est.forma === 'templo') p(caixa(w - 0.02, 0.16, d + 0.04), est.base, cx, h - 0.08, cz);
    if (est.forma === 'pedra') {
      for (let i = 0; i < w * 2; i++) p(caixa(0.4, 0.22, 0.05), '#7a7268', 0.3 + i * 0.5, 0.45 + (i % 2) * 0.5, frente + 0.01);
    }
  }

  /* ---------------------------------------------------------- telhado */
  const temTelhado = est.forma !== 'oca';
  if (temTelhado) {
    switch (est.forma) {
      case 'taipa': {
        // telhado de quatro águas de palha, bem saído
        const r = Math.max(w, d) * 0.78;
        p(cone(1, 1, 4), est.telhado, cx, h + 0.55, cz, { y: Math.PI / 4 },
          [r * (w / Math.max(w, d)), 1.1, r * (d / Math.max(w, d))]);
        break;
      }
      case 'adobe':
        p(caixa(w + 0.1, 0.18, d + 0.1), est.telhado, cx, h + 0.09, cz);
        p(caixa(w + 0.1, 0.25, 0.12), est.telhadoEscuro, cx, h + 0.3, frente);
        p(caixa(w + 0.1, 0.25, 0.12), est.telhadoEscuro, cx, h + 0.3, z0);
        for (let i = 0; i < w; i++) p(cilindro(0.05, 0.05, 0.4, 5), '#6b4a2e', i + 0.5, h - 0.25, frente + 0.12, { x: Math.PI / 2 });
        break;
      case 'templo':
        p(caixa(w + 0.2, 0.18, d + 0.2), est.telhado, cx, h + 0.09, cz);
        break;
      case 'pedra':
        p(prismaTelhado(w, d, h * 0.75, 0.25), est.telhado, cx, h, cz);
        p(caixa(0.35, 0.9, 0.35), '#6a6058', w - 0.6, h + 0.6, cz - d * 0.2);
        break;
      case 'sobrado':
        p(prismaTelhado(w, d, h * 0.45, 0.2), est.telhado, cx, h, cz, { z: 0.04 });
        break;
      default:
        p(prismaTelhado(w, d, h * 0.55, 0.3), est.telhado, cx, h, cz);
    }
  }

  /* ---------------------------------------------------------- porta e janelas */
  const largPorta = 0.72;
  const altPorta = 1.1;
  p(caixa(largPorta + 0.12, altPorta + 0.08, 0.05), MOLDURA, px, altPorta / 2 + 0.2, frente + 0.02);
  p(caixa(largPorta, altPorta, 0.06), est.porta, px, altPorta / 2 + 0.2, frente + 0.04);
  if (est.forma !== 'oca') {
    const acesa = est.forma === 'sobrado';
    const andares = est.forma === 'sobrado' ? [1.05, 2.0] : [1.05];
    for (const jy of andares) {
      for (let i = 0; i < w; i++) {
        if (jy < 1.5 && (Math.abs(i + 0.5 - px) < 1.1)) continue;
        if (i === 0 && w > 3 || i === w - 1 && w > 3) continue;
        p(caixa(0.5, 0.48, 0.05), MOLDURA, i + 0.5, jy, frente + 0.02);
        p(caixa(0.4, 0.38, 0.06), acesa ? JANELA_ACESA : JANELA, i + 0.5, jy, frente + 0.03);
      }
    }
  }

  /* ---------------------------------------------------------- detalhes da região */
  if (est.forma === 'gameleira') {
    p(bola(Math.max(w, d) * 0.55), '#3f8a3a', cx + 0.3, h + 1.0, z0 + 0.3, { y: 0.3 }, [1.2, 0.8, 1]);
    p(bola(Math.max(w, d) * 0.4), '#4f9a40', cx - 0.8, h + 1.4, z0 + 0.2, { y: 1.1 });
    for (const rx of [0.15, w - 0.15]) for (let k = 0; k < 3; k++) {
      p(cilindro(0.025, 0.04, h + 0.6, 4), '#7a5a3a', rx + (k - 1) * 0.12, (h + 0.6) / 2, frente + 0.05 - k * 0.1);
    }
  }
  return { geo: juntar(pecas), portaCol: col };
}

/* O letreiro, logo acima da porta, com letra do mesmo tamanho em todo
   prédio. Ele vai na frente de tudo o que sai da fachada naquele vão —
   beiral de palha, cúpula da oca, colunas, totem —, senão a câmera, que
   olha de cima, não o via. `topoPorta` é o y do alto da porta. */
function letreiro(pecas: readonly THREE.BufferGeometry[], w: number, px: number, topoPorta: number,
                  texto: string, fundo: string): NonNullable<Predio3D['letreiro']> {
  const prop = 13 / (larguraTexto(texto) + 8);
  const larg = Math.min(w - 0.3, ALTURA_LETREIRO / prop);
  const alto = larg * prop;
  const x = Math.min(w - larg / 2 - 0.15, Math.max(larg / 2 + 0.15, px));
  const y = topoPorta + 0.06 + alto / 2;
  const z = frenteEm(pecas, x - larg / 2, x + larg / 2, y - alto / 2) + 0.04;
  return { texto, fundo, x, y, z, larg };
}

/* Loja, benzimento, posto, forja e moinho: no 2D são a mesma construção
   em todo lugar (tiles.ts: construcao), mudando só a cor do telhado e a
   placa — e assim ficam no 3D: parede creme de faixas escuras nas pontas,
   duas águas com a cumeeira clara e o beiral escuro, a porta de madeira e
   as duas janelas de cruz. */
function construcao3D(w: number, alt: number, col: number, cfg: NonNullable<(typeof PREDIOS)[TipoObjeto]>): Predio3D {
  const pecas: THREE.BufferGeometry[] = [];
  const l = lote(w, alt, col, pecas);
  const { p, d, frente, cx, cz } = l, h = 1.7;
  p(caixa(w + 0.1, 0.2, d + 0.1), P.wallD!, cx, 0.1, cz);
  p(caixa(w - 0.2, h, d), P.wall!, cx, h / 2, cz);
  for (const x of [0.22, w - 0.22]) p(caixa(0.2, h, 0.06), P.wallD!, x, h / 2, frente + 0.01);
  duasAguas(l, 0, w, h, h * 0.62, { l: cfg.clara, m: cfg.telhado, d: cfg.escuro });
  const topo = porta(l, 0.75, 1.15, MADEIRA);
  for (const x of [0.69, w - 0.69]) janelaCruz(l, x, 1.2, 0.62, 0.56, P.win!, P.wallD!);
  return { geo: juntar(pecas), portaCol: col,
           letreiro: cfg.letreiro ? letreiro(pecas, w, l.px, topo, cfg.letreiro, cfg.fundo) : undefined };
}

/* a altura da placa do letreiro, em tiles */
const ALTURA_LETREIRO = 0.46;

/* o z mais à frente das peças que passam pelo vão [x0, x1] dali para cima
   (pela caixa de cada peça: o telhado só tem vértice nos cantos, e o beiral
   passa por cima do vão sem nenhum vértice dentro dele) */
export function frenteEm(pecas: readonly THREE.BufferGeometry[], x0: number, x1: number, y0: number): number {
  let z = -Infinity;
  for (const g of pecas) {
    if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox!;
    if (b.max.x >= x0 && b.min.x <= x1 && b.max.y >= y0) z = Math.max(z, b.max.z);
  }
  return z;
}

/* a arena do Círculo: um anel dourado, com bandeiras no alto */
function arena(w: number, alt: number, portaCol?: number): Predio3D {
  const d = alt - 0.45, cx = w / 2, cz = 0.05 + d / 2, frente = 0.05 + d;
  const col = colunaPorta(w, portaCol);
  const pecas: THREE.BufferGeometry[] = [
    peca(cilindro(1, 1.04, 2.6, 18), '#e8c860', cx, 1.3, cz, {}, [w / 2, 1, d / 2]),
    peca(cilindro(1.04, 1.04, 0.3, 18), '#c9a227', cx, 2.75, cz, {}, [w / 2, 1, d / 2]),
    peca(caixa(1.4, 1.8, 0.4), '#6b4a2e', col + 0.5, 0.9, frente),
    peca(caixa(1.8, 0.3, 0.5), '#c9a227', col + 0.5, 1.95, frente),
  ];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const x = cx + Math.cos(a) * w / 2, z = cz + Math.sin(a) * d / 2;
    pecas.push(peca(cilindro(0.03, 0.03, 1.0, 4), '#3a3020', x, 3.3, z));
    pecas.push(peca(caixa(0.5, 0.3, 0.03), k % 2 ? '#c84a3a' : '#3a8fd5', x + 0.25, 3.65, z));
  }
  return { geo: juntar(pecas), portaCol: col, letreiro: { texto: 'ARENA', fundo: '#fff3c4', x: col + 0.5, y: 2.3, z: frente + 0.27, larg: 1.6 } };
}

/* o balão listrado, preso por quatro cordas, com o cesto no chão */
function balao(w: number): THREE.BufferGeometry {
  const cx = w / 2, cz = 1.2;
  const pecas: THREE.BufferGeometry[] = [peca(caixa(0.9, 0.55, 0.9), '#8a6440', cx, 0.28, cz)];
  for (let k = 0; k < 8; k++) {
    const gomo = new THREE.SphereGeometry(1.25, 2, 8, (k / 8) * Math.PI * 2, Math.PI / 4, 0, Math.PI * 0.8);
    pecas.push(peca(gomo, k % 2 ? '#e84a3a' : '#f4d04a', cx, 2.9, cz, {}, [1, 1.15, 1]));
  }
  for (const [dx, dz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]] as const) {
    pecas.push(peca(cilindro(0.015, 0.015, 1.6, 3), '#3a3020', cx + dx * 1.3, 1.35, cz + dz * 1.3, { x: dz * 0.6, z: -dx * 0.6 }));
  }
  return juntar(pecas);
}
