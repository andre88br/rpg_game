/* =========================================================================
   As construções low-poly, com a cara de cada região — a mesma ideia de
   art/predios.ts, agora de pé:
     água    cal com barrado azul, telhado de telha
     planta  taipa e palha; o terreiro é uma oca de troncos
     fogo    pedra e ardósia, com chaminé; o terreiro tem brasa na base
     vento   tábua, com a gameleira por cima e as raízes descendo
     raio    oca redonda do Xingu; o terreiro tem o totem da ave do trovão
     terra   adobe de teto plano, com platibanda e vigas
     sombra  sobrado torto de dois andares; o terreiro tem torre
     luz     cal e ouro; o terreiro tem colunas e cúpula
   Benzimento, loja, posto, forja e moinho usam a forma da região com a cor
   e o detalhe deles (a cruz, o toldo, a bigorna, as pás). A arena e o balão
   têm modelo próprio.

   O modelo fica em coordenadas do objeto: x de 0 à largura (em tiles), z de
   0 até a frente, y para cima. A porta cai na coluna de `colunaPorta`, a
   mesma do mapa plano — é por ela que se entra.
   ========================================================================= */
import * as THREE from 'three';
import type { TipoObjeto } from '../../world/tilemap.ts';
import { colunaPorta } from '../../art/tiles.ts';
import { PREDIOS } from '../relevo.ts';
import { bola, caixa, cilindro, cone, juntar, peca, prismaTelhado } from './base.ts';

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
  /* o letreiro sobre a porta (a vista desenha o texto) */
  letreiro?: { texto: string; cor: string; x: number; y: number; z: number; larg: number };
  /* a coluna da porta, em tiles a partir da esquerda */
  portaCol: number;
  /* as pás do moinho, à parte para a vista girá-las: a geometria vem
     centrada no eixo, e (x, y, z) é onde o eixo fica */
  pas?: { geo: THREE.BufferGeometry; x: number; y: number; z: number };
}

const JANELA = '#8ed0ec', JANELA_ACESA = '#f4d070', MOLDURA = '#5a3e24';

export function predio3D(regiao: string | null, tipo: TipoObjeto, w: number, alt: number,
                         portaCol?: number): Predio3D {
  if (tipo === 'arena') return arena(w, alt, portaCol);
  if (tipo === 'balao') return { geo: balao(w), portaCol: 0 };
  const base = ESTILO_DA_REGIAO[regiao ?? 'fora'] ?? ESTILO_DA_REGIAO['fora']!;
  const cfg = PREDIOS[tipo];
  // casa e terreiro usam as cores da região; os outros, as cores deles
  const est: Estilo = tipo === 'casa' || tipo === 'terreiro' || !cfg
    ? base
    : { ...base, telhado: cfg.telhado, telhadoEscuro: cfg.escuro };
  const terreiro = tipo === 'terreiro';
  const d = alt - 0.45, z0 = 0.05, frente = z0 + d, cx = w / 2, cz = z0 + d / 2;
  const h = terreiro ? 2.4 : est.forma === 'sobrado' ? 2.6 : 1.7;
  const col = colunaPorta(w, portaCol);
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
  } else if (terreiro && est.forma === 'taipa') {
    // oca de troncos: estacas em volta, e o cone de palha alto
    for (let i = 0; i <= Math.round(w * 2); i++) {
      const x = (i / Math.round(w * 2)) * w;
      if (Math.abs(x - px) < 0.55) continue;
      p(cilindro(0.11, 0.12, h, 6), i % 2 ? '#7a5a3a' : '#8a6a44', x, h / 2, frente - 0.1);
    }
    p(caixa(w - 0.1, h, d - 0.25), '#6b4a2e', cx, h / 2, cz - 0.1);
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
        p(cone(1, 1, 4), est.telhado, cx, h + (terreiro ? 1.1 : 0.55), cz, { y: Math.PI / 4 },
          [r * (w / Math.max(w, d)), terreiro ? 2.2 : 1.1, r * (d / Math.max(w, d))]);
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
  const largPorta = terreiro ? 1.0 : 0.72;
  const altPorta = terreiro ? 1.4 : 1.1;
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
  if (est.forma === 'sobrado' && terreiro) {
    p(caixa(1.1, h + 1.6, 1.1), est.parede, w - 0.7, (h + 1.6) / 2, z0 + 0.6);
    p(cone(0.9, 1.2, 4), est.telhado, w - 0.7, h + 2.2, z0 + 0.6, { y: Math.PI / 4 });
    p(bola(0.22), '#f4e8b0', w - 0.7, h + 1.2, z0 + 1.16, {}, [1, 1, 0.3]);
  }
  if (est.forma === 'templo' && (terreiro || tipo === 'benzimento')) {
    p(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), est.base, cx, h + 0.18, cz, {}, [w * 0.22, w * 0.22, w * 0.22]);
    if (terreiro) for (const x of [0.4, w - 0.4, px - 0.85, px + 0.85]) p(cilindro(0.13, 0.15, h, 8), '#fffaf0', x, h / 2, frente + 0.25);
  }
  if (terreiro && est.forma === 'oca') {
    // o totem da ave do trovão, ao lado da porta
    const tx = px + 1.3 > w ? px - 1.3 : px + 1.3;
    p(cilindro(0.12, 0.14, h + 1.4, 6), '#8a5a3a', tx, (h + 1.4) / 2, frente + 0.3);
    p(caixa(1.4, 0.12, 0.25), '#c84a3a', tx, h + 1.1, frente + 0.3);
    p(cone(0.18, 0.4, 4), '#f0c040', tx, h + 1.55, frente + 0.3);
  }
  if (terreiro && est.forma === 'pedra') {
    for (let i = 0; i < w; i += 1) p(caixa(0.25, 0.15, 0.25), '#ff7a2a', i + 0.5, 0.28, frente + 0.25, { y: i });
  }
  if (terreiro && est.forma === 'cal') {
    // o mastro com a bandeira azul
    p(cilindro(0.04, 0.04, 1.8, 5), '#2a2430', 0.9, h + 0.9, cz);
    p(caixa(0.9, 0.5, 0.03), '#3a8fd5', 1.36, h + 1.5, cz);
  }
  if (terreiro && est.forma === 'adobe') {
    // o penhasco vermelho atrás, de onde o terreiro foi esculpido
    p(caixa(w + 1.2, h + 1.2, 0.8), '#a85a3a', cx, (h + 1.2) / 2, z0 - 0.3);
  }

  /* ---------------------------------------------------------- o detalhe do tipo */
  if (tipo === 'benzimento') {
    const topo = est.forma === 'oca' ? h * 1.15 + 0.15 : h + (est.forma === 'taipa' ? 1.1 : est.forma === 'adobe' || est.forma === 'templo' ? 0.2 : h * 0.55);
    p(caixa(0.08, 0.5, 0.08), '#f4ead0', cx, topo + 0.25, cz);
    p(caixa(0.3, 0.08, 0.08), '#f4ead0', cx, topo + 0.32, cz);
  }
  if (tipo === 'loja') {
    // o toldo listrado sobre a porta
    for (let i = 0; i < 4; i++) {
      p(caixa(0.3, 0.05, 0.7), i % 2 ? '#f4f0e8' : est.telhado, px - 0.45 + i * 0.3, altPorta + 0.42, frente + 0.3, { x: 0.35 });
    }
  }
  if (tipo === 'forja') {
    p(caixa(0.4, 1.4, 0.4), '#5a524a', 0.5, h + 0.5, cz);
    p(caixa(0.45, 0.25, 0.25), '#3a3a42', w - 0.7, 0.45, frente + 0.4);
    p(caixa(0.2, 0.3, 0.2), '#3a3a42', w - 0.7, 0.2, frente + 0.4);
  }
  let pas: Predio3D['pas'];
  if (tipo === 'moinho') {
    const lam: THREE.BufferGeometry[] = [peca(cilindro(0.1, 0.1, 0.12, 8), '#6b4a2e', 0, 0, 0.02, { x: Math.PI / 2 })];
    for (let k = 0; k < 4; k++) {
      lam.push(peca(caixa(0.18, 1.5, 0.04), '#f4ead0', 0, 0, 0, { z: k * Math.PI / 2 }));
    }
    pas = { geo: juntar(lam), x: cx, y: h * 0.7, z: frente + 0.12 };
  }

  const letra = cfg?.letreiro && tipo !== 'terreiro' && tipo !== 'casa'
    ? { texto: cfg.letreiro, cor: cfg.escuro, x: cx, y: Math.min(h - 0.25, altPorta + 0.55), z: frente + 0.07, larg: Math.min(w - 0.5, 2.4) }
    : undefined;
  return { geo: juntar(pecas), letreiro: letra, portaCol: col, pas };
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
  return { geo: juntar(pecas), portaCol: col, letreiro: { texto: 'ARENA', cor: '#8a6a14', x: col + 0.5, y: 2.3, z: frente + 0.27, larg: 1.6 } };
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
