/* =========================================================================
   A vegetação: uma árvore (ou cacto, ou moita) por bioma, cada uma com a
   base em y = 0 e cerca de um tile de largura. A copa é folhagem
   (`folhagem`, em base.ts): tufos irregulares, escuros por dentro e claros
   onde bate o sol, em verdes de mato de verdade. A vista repete cada
   modelo com InstancedMesh, girando e variando o tamanho por tile.

   Qual árvore cada região usa no lugar do `#` sai de ARVORES_DA_REGIAO.
   ========================================================================= */
import * as THREE from 'three';
import { bola, cilindro, folhagem, fundir, galho, juntarLiso, lisa, peca, sorte } from './base.ts';

export type Arvore =
  | 'mata' | 'mataAlta' | 'coqueiro' | 'ipeRosa' | 'ipeAmarelo' | 'cacto'
  | 'seca' | 'pinheiro' | 'arbusto';

const TRONCO = '#5e4a38', TRONCO_CLARO = '#8a7458';

/* tronco e galhos com normais lisas, já prontos para `fundir` */
const tronco = (rT: number, rB: number, h: number, x: number, y: number, z: number,
                giro: { x?: number; y?: number; z?: number } = {}, cor = TRONCO) => galho(rT, rB, h, cor, x, y, z, giro);

const MODELOS: Record<Arvore, (d: number) => THREE.BufferGeometry> = {
  /* a árvore de sempre: tronco que se abre em dois galhos e a copa em
     três volumes de folha */
  mata: (d) => fundir([
    tronco(0.08, 0.15, 0.95, 0, 0.47, 0),
    tronco(0.04, 0.07, 0.6, -0.16, 1.05, 0.04, { z: 0.55 }),
    tronco(0.04, 0.07, 0.6, 0.15, 1.1, -0.04, { z: -0.5 }),
    folhagem(0, 1.35, 0, 0.62, '#4a7a30', { detalhe: d, semente: 1, tufos: 9, sol: '#8aa850', sombra: '#1e3416' }),
    folhagem(-0.32, 1.25, 0.12, 0.4, '#45742c', { detalhe: d, semente: 2, tufos: 5, sol: '#80a048', sombra: '#1e3416' }),
    folhagem(0.3, 1.32, -0.14, 0.42, '#507e34', { detalhe: d, semente: 3, tufos: 5, sol: '#8aa850', sombra: '#1e3416' }),
  ]),
  /* a mata da Mata do Curupira: alta, de tronco comprido com sapopema */
  mataAlta: (d) => fundir([
    tronco(0.1, 0.17, 1.6, 0, 0.8, 0),
    tronco(0.02, 0.14, 0.4, 0.12, 0.15, 0, { z: -0.6 }),
    tronco(0.02, 0.14, 0.4, -0.1, 0.15, 0.08, { z: 0.6, x: 0.3 }),
    tronco(0.04, 0.07, 0.7, 0.2, 1.7, 0, { z: -0.6 }),
    folhagem(0, 2.05, 0, 0.75, '#355f26', { detalhe: d, semente: 4, tufos: 10, sol: '#6c9040', sombra: '#13240e' }),
    folhagem(0.4, 1.8, 0.1, 0.42, '#3a6628', { detalhe: d, semente: 5, tufos: 5, sol: '#6c9040', sombra: '#13240e' }),
  ]),
  /* coqueiro: tronco anelado que se inclina, palmas arqueadas, cocos */
  coqueiro: () => {
    const pecas: THREE.BufferGeometry[] = [];
    let x = 0;
    for (let i = 0; i < 5; i++) {
      pecas.push(tronco(0.065, 0.08, 0.37, x, 0.18 + i * 0.34, 0, { z: -0.08 }, i % 2 ? TRONCO_CLARO : '#7a6a54'));
      x += 0.035 + i * 0.012;
    }
    const topo = 1.85;
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + sorte(k, 2) * 0.3;
      const cai = 1.15 + sorte(k, 3) * 0.5;
      // a palma: lâmina fina e comprida, dois tons de verde
      pecas.push(lisa(peca(new THREE.ConeGeometry(0.13, 1.05, 4, 1), k % 2 ? '#4d7a2c' : '#3e6a26',
        x + Math.cos(a) * 0.42, topo - 0.16, Math.sin(a) * 0.42,
        { x: Math.sin(a) * cai, z: -Math.cos(a) * cai }, [1, 1, 0.18])));
    }
    for (let k = 0; k < 4; k++) pecas.push(lisa(peca(bola(0.075, 1), '#5a4a28', x + Math.cos(k * 1.6) * 0.09, topo - 0.14, Math.sin(k * 1.6) * 0.09)));
    return fundir(pecas);
  },
  ipeRosa: (d) => fundir([
    tronco(0.07, 0.13, 1.0, 0, 0.5, 0),
    tronco(0.04, 0.06, 0.55, 0.15, 1.05, 0, { z: -0.5 }),
    folhagem(0, 1.4, 0, 0.6, '#c8649a', { detalhe: d, semente: 6, tufos: 9, sol: '#f0a8cc', sombra: '#5a2a44', achatar: 0.7 }),
    folhagem(0.32, 1.55, 0.1, 0.36, '#d070a4', { detalhe: d, semente: 7, tufos: 5, sol: '#f4b8d4', sombra: '#5a2a44' }),
  ]),
  ipeAmarelo: (d) => fundir([
    tronco(0.07, 0.13, 1.0, 0, 0.5, 0),
    tronco(0.04, 0.06, 0.55, -0.15, 1.05, 0, { z: 0.5 }),
    folhagem(0, 1.4, 0, 0.6, '#d8a828', { detalhe: d, semente: 8, tufos: 9, sol: '#f6dc6a', sombra: '#6a4a10', achatar: 0.7 }),
    folhagem(-0.3, 1.55, 0.05, 0.36, '#e0b030', { detalhe: d, semente: 9, tufos: 5, sol: '#fae47a', sombra: '#6a4a10' }),
  ]),
  /* mandacaru: coluna e dois braços, gomos de espinho */
  cacto: () => fundir([
    lisa(peca(cilindro(0.15, 0.17, 1.2, 10), '#4a7a44', 0, 0.6, 0)),
    lisa(peca(cilindro(0.09, 0.09, 0.3, 8), '#4a7a44', 0.2, 0.55, 0, { z: Math.PI / 2 })),
    lisa(peca(cilindro(0.08, 0.09, 0.45, 8), '#527f48', 0.35, 0.78, 0)),
    lisa(peca(cilindro(0.08, 0.08, 0.25, 8), '#4a7a44', -0.18, 0.75, 0, { z: Math.PI / 2 })),
    lisa(peca(cilindro(0.07, 0.08, 0.35, 8), '#527f48', -0.3, 0.92, 0)),
    lisa(peca(bola(0.06, 1), '#d8607a', 0, 1.23, 0)),
  ]),
  /* árvore seca e torta: só galho */
  seca: () => fundir([
    tronco(0.06, 0.13, 1.1, 0, 0.55, 0, { z: 0.08 }, '#4e4038'),
    tronco(0.03, 0.06, 0.6, 0.22, 1.15, 0, { z: -0.8 }, '#4e4038'),
    tronco(0.03, 0.05, 0.55, -0.2, 1.2, 0.05, { z: 0.9 }, '#4e4038'),
    tronco(0.02, 0.04, 0.4, 0.05, 1.35, -0.15, { x: 0.7 }, '#4e4038'),
    tronco(0.01, 0.025, 0.3, 0.42, 1.38, 0.02, { z: -0.2 }, '#4e4038'),
  ]),
  /* pinheiro da serra (araucária): tronco reto e alto, e a copa em
     andares chatos de galho, abrindo para cima feito taça */
  pinheiro: (d) => fundir([
    tronco(0.05, 0.1, 1.9, 0, 0.95, 0, {}, '#5a4434'),
    folhagem(0, 1.95, 0, 0.62, '#2f4f2a', { detalhe: d, semente: 10, tufos: 9, achatar: 0.32, sol: '#5a7a44', sombra: '#101c0c' }),
    folhagem(0, 1.62, 0, 0.5, '#2c4a28', { detalhe: d, semente: 11, tufos: 7, achatar: 0.3, sol: '#52703e', sombra: '#101c0c' }),
    folhagem(0, 1.32, 0, 0.36, '#2a4626', { detalhe: d, semente: 12, tufos: 5, achatar: 0.3, sol: '#4c6a3a', sombra: '#101c0c' }),
  ]),
  arbusto: (d) => fundir([
    folhagem(0, 0.3, 0, 0.42, '#4a7a30', { detalhe: d, semente: 13, tufos: 7, achatar: 0.7, sol: '#86a44c', sombra: '#1e3416' }),
    folhagem(0.26, 0.24, 0.1, 0.28, '#527e36', { detalhe: d, semente: 14, tufos: 4, achatar: 0.75, sol: '#86a44c', sombra: '#1e3416' }),
  ]),
};

/* `leve`: tufos de folha mais simples (a qualidade LEVE, para o celular) */
export function modeloArvore(a: Arvore, leve = false): THREE.BufferGeometry { return MODELOS[a](leve ? 0 : 1); }
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
  agua: ['#4f7a30', '#6a8e3c'], planta: ['#2f5a26', '#46702e'], fogo: ['#5e6a34', '#7a7a42'],
  vento: ['#a8904a', '#c0a85a'], raio: ['#3a6a30', '#52803a'], terra: ['#7a6e3a', '#968a4a'],
  sombra: ['#3e4a3a', '#4e5a48'], luz: ['#728e3e', '#8aa44a'], fora: ['#4a7430', '#62883a'],
};

/* a pedra empurrável e as de enfeite, com um pouco de musgo */
export function modeloPedra(): THREE.BufferGeometry {
  return juntarLiso([
    peca(bola(0.45, 1), '#8e897e', 0, 0.36, 0, { y: 0.3 }, [1, 0.8, 1]),
    peca(bola(0.17, 1), '#5a7a3e', -0.12, 0.6, 0.1, {}, [1, 0.45, 1]),
  ]);
}
