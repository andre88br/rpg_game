/* =========================================================================
   O CÍRCULO DOURADO — os fundos das cutscenes do torneio: a praça redonda
   no meio do mundo, a arena de seis câmaras, a coroação de vinte anos atrás
   e, no fim, o rio da Foz correndo livre pela comporta quebrada.
   ========================================================================= */
import { Buf, rng } from '../../core/buf.ts';
import { P } from '../palette.ts';
import { degrade, morros, arvore, lembranca } from '../cenas.ts';

const W = 240, H = 160;

/* as cores das oito regiões, na ordem da trilha */
const CORES_REGIOES = ['#3a7fd5', '#2f6b2e', '#bf3316', '#7fc4b8', '#c79a12', '#b07840', '#4a3a6b', '#e3c96a'] as const;

/* uma fileira de gente na arquibancada, de silhueta com a roupa colorida */
function plateia(b: Buf, y: number, semente: number, x0 = 0, x1 = W): void {
  const r = rng(semente);
  for (let x = x0 + 2; x < x1 - 4; x += 7) {
    const c = CORES_REGIOES[(r() * 8) | 0]!;
    const dy = (r() * 2) | 0;
    b.circle(x + 2, y - 6 - dy, 2, '#3a2a20'); b.rect(x, y - 4 - dy, 5, 5, c);
  }
}

/* uma bandeira de pano pendurada num mastro */
function bandeira(b: Buf, x: number, y: number, cor: string): void {
  b.rect(x, y, 1, 26, '#4a3a2a');
  b.tri(x + 1, y, x + 1, y + 10, x + 13, y + 5, cor);
}

/* ------------------------------------------------------ a praça */

/* a praça redonda de pedra dourada, a arena no alto, as oito bandeiras em
   volta e gente das oito regiões chegando */
export function pracaCirculo(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 70, [[0x5a, 0xa8, 0xf0], [0xb8, 0xe0, 0xf8], [0xf8, 0xf0, 0xd8]]);
  morros(b, 64, 4, 0.05, 0.4, '#8ab070', 90);
  // a arena: um tambor de pedra clara com faixa dourada e o portão
  b.rect(60, 14, 120, 62, '#e8dcc0'); b.rect(60, 14, 120, 4, P.gold!); b.rect(60, 40, 120, 3, P.goldD!);
  b.ellipse(120, 14, 60, 6, '#f4ecd8');
  for (let x = 66; x < 180; x += 12) b.rect(x, 22, 6, 12, '#c8b890');
  b.rect(106, 48, 28, 28, '#5a4028'); b.ellipse(120, 48, 14, 6, '#5a4028'); b.rect(119, 48, 2, 28, '#3a2a1a');
  // as oito bandeiras, uma de cada região
  CORES_REGIOES.forEach((c, i) => bandeira(b, 8 + i * 30 - (i > 3 ? -4 : 0), 30 + (i % 2) * 6, c));
  // o chão da praça, em anéis
  b.rect(0, 76, W, H - 76, '#d8c890');
  for (let k = 0; k < 4; k++) b.ellipse(120, 118, 110 - k * 26, 34 - k * 8, k % 2 ? '#e8d8a0' : '#c8b480');
  b.ellipse(120, 118, 10, 3, P.gold!);
  plateia(b, 84, 1001, 0, 56); plateia(b, 84, 1003, 184, W);
  return b;
}

/* a coroação de vinte anos atrás, na lembrança do Porteiro: o Anhangá de
   pé no meio da arena, a plateia em volta, e a mata ainda inteira lá fora */
export function circuloAntigo(): Buf {
  const b = arenaCamara(false);
  for (let x = -4; x < W + 6; x += 12) arvore(b, x, 18, 16, P.tree!, P.treeD!, P.treeL!);
  return lembranca(b, '#2a1a08');
}

/* ------------------------------------------------------ a arena */

/* uma câmara da arena: o carpete vermelho no meio, a arquibancada cheia dos
   dois lados, as tochas, e a porta da câmara de cima lá no fundo.
   `festa`: chuva de papel picado, para o campeão */
export function camaraArena(): Buf { return arenaCamara(false); }
export function camaraFesta(): Buf { return arenaCamara(true); }

function arenaCamara(festa: boolean): Buf {
  const b = new Buf(W, H);
  b.rect(0, 0, W, 60, '#8a7a5a');
  for (let y = 0; y < 60; y += 8) for (let x = -((y / 8) % 2) * 10; x < W; x += 20) { b.rect(x + 1, y + 1, 18, 6, '#9a8a68'); b.rect(x + 1, y + 1, 18, 1, '#aa9a78'); }
  // a porta de cima, com o arco dourado
  b.rect(104, 20, 32, 40, '#3a2a1a'); b.ellipse(120, 20, 16, 8, '#3a2a1a');
  b.ellipse(120, 20, 18, 10, P.goldD!); b.ellipse(120, 20, 16, 8, '#3a2a1a');
  // as arquibancadas, em degraus, cheias de gente
  for (let k = 0; k < 4; k++) {
    const y = 28 + k * 10;
    b.rect(0, y, 96 - k * 6, 10, k % 2 ? '#6a5a42' : '#7a6a4e'); b.rect(144 + k * 6, y, 96 - k * 6, 10, k % 2 ? '#6a5a42' : '#7a6a4e');
    plateia(b, y + 9, 1005 + k, 0, 96 - k * 6); plateia(b, y + 9, 1015 + k, 144 + k * 6, W);
  }
  // as tochas dos dois lados da porta
  for (const x of [92, 146]) { b.rect(x, 30, 3, 14, '#4a3a2a'); b.tri(x - 3, 30, x + 6, 30, x + 1, 20, P.fire!); b.tri(x - 1, 30, x + 4, 30, x + 1, 24, P.fireL!); }
  // o chão e o carpete
  b.rect(0, 68, W, H - 68, '#c8b890');
  for (let y = 72; y < H; y += 10) for (let x = (y % 20); x < W; x += 20) b.rect(x, y, 18, 8, '#d8c8a0');
  b.rect(96, 60, 48, H - 60, '#a8302a'); b.rect(96, 60, 3, H - 60, P.gold!); b.rect(141, 60, 3, H - 60, P.gold!);
  if (festa) {
    const r = rng(1031);
    for (let i = 0; i < 160; i++) b.rect((r() * W) | 0, (r() * 120) | 0, 2, 1, CORES_REGIOES[i % 8]!);
  }
  return b;
}

/* ------------------------------------------------------ o fim */

/* o rio da Foz depois do torneio: a comporta da Companhia rachada ao meio,
   a água passando por cima e o leito seco enchendo de novo */
/* o rio de antigamente, sem comporta nenhuma, no fim da tarde: o cenário
   da lenda de Honorato e Maria Caninana */
export function rioAntigo(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 50, [[0x3a, 0x2d, 0x55], [0xc0, 0x7a, 0x6a], [0xf0, 0xc0, 0x80]]);
  morros(b, 46, 4, 0.05, 0.9, '#4a6a4a');
  b.rect(0, 50, W, H - 50, P.grassD!);
  const r = rng(1042);
  for (let i = 0; i < 90; i++) b.set((r() * W) | 0, 50 + ((r() * 74) | 0), P.grass!);
  b.rect(0, 72, W, 36, P.waterD!);
  for (let i = 0; i < 40; i++) b.rect((r() * W) | 0, 76 + ((r() * 28) | 0), 6, 1, P.water!);
  for (const x of [10, 40, 74, 170, 204, 232]) arvore(b, x, 66, 26 + (x % 9), P.treeD!, P.treeD!, P.tree!);
  return b;
}

export function rioLivre(): Buf {
  const b = new Buf(W, H);
  degrade(b, 0, 50, [[0x6a, 0xb0, 0xe8], [0xc0, 0xe4, 0xf4]]);
  morros(b, 46, 4, 0.05, 0.4, '#6a9a6a');
  b.rect(0, 50, W, H - 50, P.grass!);
  const r = rng(1041);
  for (let i = 0; i < 120; i++) b.set((r() * W) | 0, 50 + ((r() * 74) | 0), P.grassL!);
  // o rio inteiro, de lado a lado, correndo
  b.rect(0, 72, W, 36, P.water!);
  for (let i = 0; i < 40; i++) b.rect((r() * W) | 0, 76 + ((r() * 28) | 0), 6, 1, P.waterL!);
  // a comporta partida, com a água espumando por cima
  b.rect(118, 66, 7, 46, '#9a9a98'); b.rect(128, 70, 7, 42, '#8a8a88');
  b.line(124, 66, 126, 112, '#5a5a58'); b.rect(118, 80, 7, 4, '#b03020');
  for (let y = 70; y < 108; y += 3) b.rect(110 + (y % 6), y, 30, 1, P.foam!);
  // as árvores de volta na margem, e uma muda em cada toco
  for (const x of [14, 50, 88, 168, 210]) arvore(b, x, 66, 24 + (x % 7), P.tree!, P.treeD!, P.treeL!);
  return b;
}
