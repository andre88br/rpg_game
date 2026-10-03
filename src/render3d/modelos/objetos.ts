/* =========================================================================
   Os objetos de mecânica em low-poly: placa, cerca, guia de contas, monte
   de folhas, entulho, pote, para-raio, cerca de raio, pedra rachada, monte
   de terra, alavanca, espelho, fonte de luz, cristal, lampião, baú e
   estante. Cada um olha o MESMO estado que o desenho plano olha (`vazio`,
   `inclinacao`, as contas acesas) — a vista remonta o mapa quando ele muda.

   Coordenadas do objeto: x de 0 à largura, z de 0 a 1 (uma fileira), y para
   cima. O que é chão (ladrilho, buraco, desvio) continua como recorte
   deitado, e o véu e a cortina de luz são translúcidos (a vista cuida).
   ========================================================================= */
import * as THREE from 'three';
import type { DefObjeto, TipoObjeto } from '../../world/tilemap.ts';
import { bola, caixa, cilindro, cone, juntar, peca, pedra, sorte } from './base.ts';

/* peça que brilha sozinha: a cor passa de 1, e o tone mapping acende */
function brilho(g: THREE.BufferGeometry, forca = 2.4): THREE.BufferGeometry {
  const c = g.getAttribute('color') as THREE.BufferAttribute;
  for (let i = 0; i < c.array.length; i++) (c.array as Float32Array)[i]! *= forca;
  return g;
}

const MADEIRA = '#8a6440', MADEIRA_ESCURA = '#5a3e24', METAL = '#7a7a88';

type Construtor = (o: DefObjeto, contas: number) => THREE.BufferGeometry;

const MODELOS: Partial<Record<TipoObjeto, Construtor>> = {
  placa: () => juntar([
    peca(caixa(0.08, 0.7, 0.08), MADEIRA_ESCURA, 0.5, 0.35, 0.55),
    peca(caixa(0.72, 0.42, 0.07), '#c8a06a', 0.5, 0.68, 0.58),
    peca(caixa(0.6, 0.06, 0.08), MADEIRA_ESCURA, 0.5, 0.52, 0.6),
  ]),
  barreira: (o) => {
    const w = o.larg ?? 1, pecas: THREE.BufferGeometry[] = [];
    for (let i = 0; i <= w; i++) pecas.push(peca(caixa(0.12, 0.9, 0.12), MADEIRA_ESCURA, i === w ? w - 0.08 : i + 0.08, 0.45, 0.5));
    for (const y of [0.35, 0.7]) pecas.push(peca(caixa(w, 0.1, 0.06), MADEIRA, w / 2, y, 0.5));
    for (let i = 0; i < w; i++) pecas.push(peca(caixa(0.06, 0.6, 0.05), '#c84a3a', i + 0.5, 0.52, 0.55, { z: 0.6 }));
    return juntar(pecas);
  },
  /* a guia de cinco contas: as acesas brilham */
  portao: (o, contas) => {
    const w = o.larg ?? 3, pecas: THREE.BufferGeometry[] = [
      peca(caixa(0.2, 1.6, 0.2), MADEIRA_ESCURA, 0.15, 0.8, 0.5),
      peca(caixa(0.2, 1.6, 0.2), MADEIRA_ESCURA, w - 0.15, 0.8, 0.5),
      peca(caixa(w, 0.06, 0.06), '#d8c8a0', w / 2, 1.25, 0.5),
    ];
    for (let i = 0; i < 5; i++) {
      const g = peca(bola(0.11, 0), i < contas ? '#f0c040' : '#4a4050', 0.5 + (w - 1) * (i / 4), 1.1, 0.5);
      pecas.push(i < contas ? brilho(g) : g);
    }
    return juntar(pecas);
  },
  monteFolhas: (o) => {
    const w = o.larg ?? 1, pecas: THREE.BufferGeometry[] = [];
    for (let i = 0; i < w; i++) for (let k = 0; k < 4; k++) {
      pecas.push(peca(bola(0.28 + sorte(i, k) * 0.12), k % 2 ? '#5a8a3a' : '#8a7a3a',
        i + 0.25 + sorte(i, k, 1) * 0.5, 0.2 + k * 0.08, 0.3 + sorte(i, k, 2) * 0.4, { y: k }, [1, 0.7, 1]));
    }
    return juntar(pecas);
  },
  entulho: () => juntar([0, 1, 2, 3, 4].map((k) =>
    peca(caixa(0.32, 0.22, 0.28), k % 2 ? '#8a8078' : '#6a625a', 0.3 + sorte(k, 1) * 0.4, 0.11 + (k > 2 ? 0.2 : 0), 0.3 + sorte(k, 2) * 0.4, { y: k, z: (sorte(k, 3) - 0.5) * 0.4 }))),
  achado: (o) => {
    const pecas = [
      peca(cilindro(0.18, 0.24, 0.42, 7), '#b8653a', 0.5, 0.21, 0.5),
      peca(cilindro(0.12, 0.18, 0.12, 7), '#a0552e', 0.5, 0.48, 0.5),
    ];
    if (o.vazio !== true) pecas.push(peca(cilindro(0.14, 0.14, 0.05, 7), '#8a4a28', 0.5, 0.56, 0.5));
    return juntar(pecas);
  },
  paraRaio: (o) => {
    const aceso = o.vazio !== true;
    const topo = peca(bola(0.13, 0), aceso ? '#f8e060' : '#5a5a68', 0.5, 1.55, 0.5);
    return juntar([
      peca(caixa(0.35, 0.2, 0.35), '#5a524a', 0.5, 0.1, 0.5),
      peca(cilindro(0.04, 0.05, 1.4, 5), METAL, 0.5, 0.8, 0.5),
      peca(cone(0.05, 0.25, 4), METAL, 0.5, 1.75, 0.5),
      aceso ? brilho(topo, 3) : topo,
    ]);
  },
  cercaRaio: (o) => {
    const w = o.larg ?? 1, pecas: THREE.BufferGeometry[] = [];
    for (let i = 0; i <= w; i++) pecas.push(peca(cilindro(0.05, 0.06, 1.0, 5), METAL, Math.min(i, w - 0.05) + 0.02, 0.5, 0.5));
    for (const y of [0.3, 0.55, 0.8]) pecas.push(brilho(peca(caixa(w, 0.025, 0.025), '#9ad8ff', w / 2, y, 0.5), 2.2));
    return juntar(pecas);
  },
  pedraRachada: (o) => {
    const w = o.larg ?? 1, pecas: THREE.BufferGeometry[] = [];
    for (let i = 0; i < w; i++) {
      pecas.push(peca(pedra(0.45), '#8a8278', i + 0.3, 0.4, 0.5, { y: 0.3 }, [0.75, 1, 1]));
      pecas.push(peca(pedra(0.42), '#7a7268', i + 0.72, 0.38, 0.5, { y: 1.1 }, [0.75, 1, 1]));
    }
    return juntar(pecas);
  },
  monteTerra: (o) => {
    const w = o.larg ?? 1, pecas: THREE.BufferGeometry[] = [];
    for (let i = 0; i < w; i++) pecas.push(peca(bola(0.5, 0), '#8a5a3a', i + 0.5, 0.18, 0.5, { y: i }, [1, 0.6, 1]));
    return juntar(pecas);
  },
  alavanca: (o) => {
    const ligada = o.vazio !== true;
    return juntar([
      peca(caixa(0.45, 0.25, 0.35), '#5a524a', 0.5, 0.12, 0.5),
      peca(cilindro(0.04, 0.04, 0.7, 5), METAL, 0.5 + (ligada ? 0.15 : -0.15), 0.5, 0.5, { z: ligada ? -0.5 : 0.5 }),
      peca(bola(0.08), '#c84a3a', 0.5 + (ligada ? 0.32 : -0.32), 0.82, 0.5),
    ]);
  },
  /* o espelho num pé, virado para onde a barra dele aponta */
  espelho: (o) => {
    const giro = o.inclinacao === '\\' ? -Math.PI / 4 : Math.PI / 4;
    return juntar([
      peca(cilindro(0.06, 0.08, 0.5, 5), MADEIRA_ESCURA, 0.5, 0.25, 0.5),
      peca(caixa(0.85, 0.85, 0.08), '#c9a227', 0.5, 0.85, 0.5, { y: giro }),
      brilho(peca(caixa(0.72, 0.72, 0.1), '#bfe8f8', 0.5, 0.85, 0.5, { y: giro }), 1.4),
    ]);
  },
  fonteLuz: () => juntar([
    peca(cilindro(0.3, 0.38, 0.5, 8), '#f0e8d0', 0.5, 0.25, 0.5),
    brilho(peca(bola(0.22, 1), '#fff0a0', 0.5, 0.75, 0.5), 3),
  ]),
  cristal: (o) => {
    const aceso = o.vazio !== true;
    const g = peca(new THREE.OctahedronGeometry(0.35, 0), aceso ? '#a8f0ff' : '#5a7a8a', 0.5, 0.7, 0.5, {}, [1, 1.6, 1]);
    return juntar([peca(cilindro(0.3, 0.35, 0.25, 6), '#8a8278', 0.5, 0.12, 0.5), aceso ? brilho(g, 2.5) : g]);
  },
  lampiao: (o) => {
    const aceso = o.vazio !== true;
    const luz = peca(caixa(0.22, 0.28, 0.22), aceso ? '#ffd860' : '#5a5040', 0.5, 1.28, 0.5);
    return juntar([
      peca(cilindro(0.04, 0.05, 1.2, 5), '#3a3442', 0.5, 0.6, 0.5),
      peca(cone(0.2, 0.15, 4), '#3a3442', 0.5, 1.5, 0.5, { y: Math.PI / 4 }),
      aceso ? brilho(luz, 3) : luz,
    ]);
  },
  bau: () => juntar([
    peca(caixa(0.8, 0.45, 0.55), '#8a5a2e', 0.5, 0.23, 0.55),
    peca(caixa(0.84, 0.15, 0.59), '#7a4a24', 0.5, 0.52, 0.55),
    peca(caixa(0.86, 0.07, 0.04), '#c9a227', 0.5, 0.38, 0.84),
    peca(caixa(0.1, 0.14, 0.05), '#c9a227', 0.5, 0.42, 0.86),
  ]),
  estante: (o) => {
    const w = o.larg ?? 2, pecas: THREE.BufferGeometry[] = [peca(caixa(w - 0.1, 1.5, 0.45), MADEIRA, w / 2, 0.75, 0.3)];
    const cores = ['#e8c040', '#4f9a40', '#c84a3a', '#3f7fbf'];
    for (let y = 0; y < 3; y++) {
      pecas.push(peca(caixa(w - 0.2, 0.05, 0.42), MADEIRA_ESCURA, w / 2, 0.35 + y * 0.42, 0.34));
      for (let i = 0; i < w * 3; i++) {
        pecas.push(peca(cilindro(0.06, 0.07, 0.22, 5), cores[(i + y) % 4]!, 0.2 + i * 0.32, 0.5 + y * 0.42, 0.42));
      }
    }
    return juntar(pecas);
  },
};

export function temModelo3D(tipo: TipoObjeto): boolean { return MODELOS[tipo] !== undefined; }

export function objeto3D(o: DefObjeto, contas: number): THREE.BufferGeometry | null {
  const m = MODELOS[o.tipo];
  return m ? m(o, contas) : null;
}
