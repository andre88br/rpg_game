/* =========================================================================
   A vegetação low-poly: uma árvore (ou cacto, ou moita) por bioma, cada uma
   com a base em y = 0 e cerca de um tile de largura. A vista repete cada
   modelo com InstancedMesh, girando e variando o tamanho por tile.

   Qual árvore cada região usa no lugar do `#` sai de ARVORES_DA_REGIAO.
   ========================================================================= */
import type * as THREE from 'three';
import { bola, cilindro, cone, juntar, peca, sorte } from './base.ts';

export type Arvore =
  | 'mata' | 'mataAlta' | 'coqueiro' | 'ipeRosa' | 'ipeAmarelo' | 'cacto'
  | 'seca' | 'pinheiro' | 'arbusto';

const TRONCO = '#6b4a2e', TRONCO_CLARO = '#8a6440';

const MODELOS: Record<Arvore, () => THREE.BufferGeometry> = {
  /* a árvore de sempre: tronco e duas copas de icosaedro */
  mata: () => juntar([
    peca(cilindro(0.08, 0.13, 0.95, 6), TRONCO, 0, 0.47, 0),
    peca(bola(0.55), '#3a8a3c', 0, 1.15, 0, { y: 0.4 }),
    peca(bola(0.4), '#4f9a40', 0.12, 1.6, -0.05, { y: 1.1 }),
  ]),
  /* a mata da Mata do Curupira: alta, de três copas, com raiz aparecendo */
  mataAlta: () => juntar([
    peca(cilindro(0.09, 0.16, 1.5, 6), TRONCO, 0, 0.75, 0),
    peca(cone(0.25, 0.3, 5), TRONCO, 0, 0.12, 0),
    peca(bola(0.62), '#2a6a30', 0, 1.55, 0, { y: 0.3 }),
    peca(bola(0.48), '#2f7a36', -0.25, 2.0, 0.1, { y: 1.2 }),
    peca(bola(0.38), '#3f8f3e', 0.22, 2.35, -0.05, { y: 2.1 }),
  ]),
  /* coqueiro: tronco em gomos que se inclina, palmas caindo, cocos */
  coqueiro: () => {
    const pecas: THREE.BufferGeometry[] = [];
    let x = 0;
    for (let i = 0; i < 5; i++) {
      pecas.push(peca(cilindro(0.065, 0.08, 0.36, 6), i % 2 ? TRONCO_CLARO : '#9a7a50', x, 0.18 + i * 0.34, 0, { z: -0.08 }));
      x += 0.035 + i * 0.012;
    }
    const topo = 1.85;
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      pecas.push(peca(cone(0.11, 0.95, 3), k % 2 ? '#3f9a3a' : '#2f8030',
        x + Math.cos(a) * 0.38, topo - 0.12, Math.sin(a) * 0.38,
        { x: Math.sin(a) * 1.25, z: -Math.cos(a) * 1.25 }, [1, 1, 0.35]));
    }
    for (let k = 0; k < 3; k++) pecas.push(peca(bola(0.07), '#6b4a2e', x + Math.cos(k * 2.1) * 0.09, topo - 0.12, Math.sin(k * 2.1) * 0.09));
    return juntar(pecas);
  },
  ipeRosa: () => juntar([
    peca(cilindro(0.07, 0.12, 1.0, 6), TRONCO, 0, 0.5, 0),
    peca(cilindro(0.04, 0.06, 0.5, 5), TRONCO, 0.15, 1.05, 0, { z: -0.5 }),
    peca(bola(0.55), '#e07aa8', 0, 1.25, 0, { y: 0.5 }),
    peca(bola(0.38), '#f09ac0', 0.3, 1.5, 0.1, { y: 1.3 }),
  ]),
  ipeAmarelo: () => juntar([
    peca(cilindro(0.07, 0.12, 1.0, 6), TRONCO, 0, 0.5, 0),
    peca(cilindro(0.04, 0.06, 0.5, 5), TRONCO, -0.15, 1.05, 0, { z: 0.5 }),
    peca(bola(0.55), '#f2c43a', 0, 1.25, 0, { y: 0.2 }),
    peca(bola(0.38), '#f8d860', -0.28, 1.5, 0.05, { y: 0.9 }),
  ]),
  /* mandacaru: coluna e dois braços */
  cacto: () => juntar([
    peca(cilindro(0.15, 0.17, 1.2, 7), '#4f8f4a', 0, 0.6, 0),
    peca(cilindro(0.09, 0.09, 0.3, 6), '#4f8f4a', 0.2, 0.55, 0, { z: Math.PI / 2 }),
    peca(cilindro(0.09, 0.09, 0.45, 6), '#5aa055', 0.35, 0.78, 0),
    peca(cilindro(0.08, 0.08, 0.25, 6), '#4f8f4a', -0.18, 0.75, 0, { z: Math.PI / 2 }),
    peca(cilindro(0.08, 0.08, 0.35, 6), '#5aa055', -0.3, 0.92, 0),
    peca(cone(0.16, 0.12, 7), '#e86a8a', 0, 1.26, 0),
  ]),
  /* árvore seca e torta: só galho */
  seca: () => juntar([
    peca(cilindro(0.06, 0.13, 1.1, 5), '#5a4a42', 0, 0.55, 0, { z: 0.08 }),
    peca(cilindro(0.03, 0.06, 0.6, 5), '#5a4a42', 0.22, 1.15, 0, { z: -0.8 }),
    peca(cilindro(0.03, 0.05, 0.55, 5), '#5a4a42', -0.2, 1.2, 0.05, { z: 0.9 }),
    peca(cilindro(0.02, 0.04, 0.4, 5), '#5a4a42', 0.05, 1.35, -0.15, { x: 0.7 }),
  ]),
  /* pinheiro da serra: três cones */
  pinheiro: () => juntar([
    peca(cilindro(0.07, 0.1, 0.5, 6), TRONCO, 0, 0.25, 0),
    peca(cone(0.55, 0.8, 7), '#2a5a3a', 0, 0.8, 0),
    peca(cone(0.42, 0.7, 7), '#2f6a40', 0, 1.25, 0, { y: 0.4 }),
    peca(cone(0.28, 0.6, 7), '#3a7a4a', 0, 1.65, 0, { y: 0.8 }),
  ]),
  arbusto: () => juntar([
    peca(bola(0.38), '#4f8f3e', 0, 0.3, 0),
    peca(bola(0.28), '#5fa048', 0.25, 0.25, 0.1, { y: 0.8 }),
    peca(bola(0.22), '#3f7f36', -0.22, 0.22, -0.05),
  ]),
};

export function modeloArvore(a: Arvore): THREE.BufferGeometry { return MODELOS[a](); }
export const ARVORES: readonly Arvore[] = Object.keys(MODELOS) as Arvore[];

/* as árvores de cada região (pelo tipo dela), com o peso do sorteio */
export const ARVORES_DA_REGIAO: Record<string, readonly [Arvore, number][]> = {
  agua: [['mata', 3], ['arbusto', 1]],
  planta: [['mataAlta', 4], ['mata', 2]],
  fogo: [['pinheiro', 3], ['seca', 1]],
  vento: [['ipeRosa', 2], ['arbusto', 2], ['mata', 1]],
  raio: [['mataAlta', 2], ['mata', 2]],
  terra: [['cacto', 3], ['seca', 1]],
  sombra: [['seca', 3], ['mata', 1]],
  luz: [['ipeAmarelo', 3], ['mata', 1]],
  fora: [['mata', 2], ['ipeAmarelo', 1]],
};

/* a árvore de um tile: o coqueiro vence perto de areia ou água na Foz */
export function arvoreDoTile(regiao: string | null, x: number, y: number, pertoDoMar: boolean): Arvore {
  if ((regiao ?? 'fora') === 'agua' && pertoDoMar) return 'coqueiro';
  const lista = ARVORES_DA_REGIAO[regiao ?? 'fora'] ?? ARVORES_DA_REGIAO['fora']!;
  const total = lista.reduce((s, [, p]) => s + p, 0);
  let r = sorte(x, y, 21) * total;
  for (const [a, p] of lista) { r -= p; if (r <= 0) return a; }
  return lista[0]![0];
}

/* a cor dos tufos de mato, por região */
export const MATO_DA_REGIAO: Record<string, [string, string]> = {
  agua: ['#3f8a3a', '#5aa44a'], planta: ['#2f7a36', '#4f9a3a'], fogo: ['#6a7a3a', '#8a8a4a'],
  vento: ['#c8a84a', '#e0c060'], raio: ['#3f8a4a', '#5aa45a'], terra: ['#8a7a3a', '#a89a4a'],
  sombra: ['#4a5a4a', '#5a6a5a'], luz: ['#8ab84a', '#a8d05a'], fora: ['#4f9446', '#6aae52'],
};

/* a pedra empurrável e as de enfeite, com um pouco de musgo */
export function modeloPedra(): THREE.BufferGeometry {
  return juntar([
    peca(bola(0.45, 0), '#9a9488', 0, 0.36, 0, { y: 0.3 }, [1, 0.85, 1]),
    peca(bola(0.16), '#5f8a4a', -0.12, 0.62, 0.1, {}, [1, 0.4, 1]),
  ]);
}
