/* =========================================================================
   O que o desenho 2D não diz, espécie por espécie: se está de lado, quanto
   é grosso, o que vai para trás, o que é asa ou cauda (desenho3d.ts).

   Os números das peças são a ordem em que a função de desenho de
   art/creatures.ts chama as primitivas (pixels soltos seguidos da mesma
   cor contam como uma). `tools/bichos3d.html?num=1` mostra a lista numerada.
   ========================================================================= */
import type { Ajuste } from './desenho3d.ts';

/* o cabelo atrás da cabeça: o desenho de frente só mostra a franja */
const cabelo = (c: string, cx: number, cy: number, r: number, comprido: number) => [
  { k: 'e' as const, cx, cy, rx: r, ry: r + 1, c, atras: true },
  { k: 'r' as const, x: cx - r + 1, y: cy, w: r * 2 - 1, h: comprido, c, atras: true },
];

export const AJUSTES: Record<string, Ajuste> = {
  // desenhados de lado: a cabeça para a direita (1) ou para a esquerda (−1);
  // as pernas (pares, as primeiras peças) vão uma de cada lado
  piragua: { perfil: 1, fundo: 0.75, flutua: true },
  piraguacu: { perfil: 1, fundo: 0.75, flutua: true },
  tatuTrovao: { perfil: 1, fundo: 0.8, pares: [0, 1, 2, 3], parZ: 6 },
  tatuacu: { perfil: 1, fundo: 0.8, pares: [0, 1, 2, 3], parZ: 7 },
  boto: { perfil: -1, fundo: 0.7 },
  anhanga: { perfil: -1, fundo: 0.6, pares: [0, 1, 2, 3], parZ: 3.5 },

  // cabelo comprido descendo pelas costas
  // (o cabelo de trás do desenho 2D — as primeiras peças — sai: em 3D
  // ele viraria um bloco na frente do rosto)
  iarinha: { sem: [0, 1], extras: cabelo('#2a2630', 16, 11, 8, 11) },
  iaraMae: { sem: [0, 1], extras: cabelo('#2a2630', 20, 14, 10, 15) },
  ipupiara: { sem: [0, 1], extras: cabelo('#2f7a5a', 20, 13, 9, 15) },
  pisadeira: { sem: [0, 1], extras: cabelo('#1a1424', 20, 11, 9, 14) },
  caiporinha: { sem: [0, 1, 2, 3, 4, 5], extras: cabelo('#e8743a', 16, 12, 8, 9) },

  // rabo (e a garupa da Mula) atrás do corpo: as primeiras peças
  lobinho: { atras: [0, 1] },
  lobisomem: { atras: [0, 1] },
  boitatinha: { atras: [0, 1, 2, 3, 4, 5, 6] },
  boitatao: { atras: [2, 3, 4, 5, 6, 7] },
  mboitata: { atras: [0, 1, 2, 3, 4] },
  mulinha: { atras: [0, 1, 2, 3, 4, 5, 6] },
  mulaSemCabeca: { atras: [0, 1, 2, 3, 4, 5, 6] },
  salamanca: { atras: [0, 1] },
  teiniagua: { atras: [0, 1] },

  // asas que batem: as primeiras peças de cada desenho (a da esquerda é a asaE)
  faisquinha: { flutua: true, partes: { asaE: [0], asaD: [1] } },
  relampo: { flutua: true, partes: { asaE: [0, 1], asaD: [2, 3] } },
  matinta: { flutua: true, partes: { asaE: [0], asaD: [1] } },
  matintaPerera: { flutua: true, partes: { asaE: [0], asaD: [1] } },
  uirapuru: { flutua: true, partes: { asaE: [0], asaD: [1] } },
  uirapuruRei: { flutua: true, partes: { asaE: [0, 1], asaD: [2, 3] } },

  // astros e assombrações: flutuam
  jaci: { flutua: true },
  // o disco do sol é chato, para a lua com a cara aparecer na frente
  eclipse: { flutua: true, fundoDe: { 12: 3 } },
  luzeiro: { flutua: true },
  estrelaDalva: { flutua: true },
  maeDoOuro: { flutua: true },
  fogoFatuo: { flutua: true },
  almaPenada: { flutua: true },
  pesadelo: { flutua: true },
};
