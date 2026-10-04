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
  // as pernas (pares) vão uma de cada lado
  piragua: { perfil: 1, fundo: 0.75, flutua: true },
  piraguacu: { perfil: 1, fundo: 0.75, flutua: true },
  salamanca: { perfil: -1, fundo: 0.7, pares: [7, 8, 9, 10], parZ: 3.5 },
  teiniagua: { perfil: 1, fundo: 0.7, pares: [3, 4, 5, 6], parZ: 4 },
  mulinha: { perfil: -1, fundo: 0.7, pares: [0, 1, 2, 3], parZ: 3.5 },
  mulaSemCabeca: { perfil: -1, fundo: 0.7, pares: [0, 1, 2, 3], parZ: 4 },
  tatuTrovao: { perfil: 1, fundo: 0.8, pares: [1, 2, 3, 4], parZ: 6 },
  tatuacu: { perfil: 1, fundo: 0.8, pares: [1, 2, 3, 4], parZ: 7 },
  lobinho: { perfil: 1, fundo: 0.7, pares: [3, 4, 5, 6], parZ: 3 },
  anhanga: { perfil: -1, fundo: 0.6, pares: [0, 1, 2, 3], parZ: 3.5 },
  mboitata: { perfil: -1, fundo: 0.7 },
  minhocao: { perfil: 1, fundo: 0.8 },
  boto: { perfil: -1, fundo: 0.7 },

  // cabelo comprido descendo pelas costas
  iarinha: { extras: cabelo('#1b4a6b', 16, 8, 7, 11) },
  iaraMae: { extras: cabelo('#1b4a6b', 20, 12, 8, 14) },
  ipupiara: { extras: cabelo('#2f7a5a', 20, 9, 8, 14) },
  pisadeira: { extras: cabelo('#1a1424', 20, 7, 5, 10) },

  // asas que batem (a da esquerda do desenho é a asaE)
  uirapuru: { flutua: true, partes: { asaE: [0, 2], asaD: [1, 3] } },
  uirapuruRei: { flutua: true, partes: { asaE: [4, 5], asaD: [6, 7] } },
  matinta: { flutua: true, partes: { asaE: [0, 2], asaD: [1, 3] } },
  matintaPerera: { flutua: true, partes: { asaE: [0, 2, 3, 4], asaD: [1, 5, 6, 7] } },
  relampo: { flutua: true, partes: { asaE: [0, 1, 4], asaD: [2, 3, 5] } },
  faisquinha: { flutua: true, partes: { asaE: [0, 2], asaD: [1, 3] } },

  // astros e assombrações: flutuam
  // Jaci: o céu é um disco atrás, e a sombra que come a lua é fina, por cima
  jaci: { flutua: true, atras: [0], fundoDe: { 0: 1.5, 7: 2.5 } },
  eclipse: { flutua: true },
  luzeiro: { flutua: true },
  estrelaDalva: { flutua: true },
  maeDoOuro: { flutua: true },
  fogoFatuo: { flutua: true },
  almaPenada: { flutua: true },
};
