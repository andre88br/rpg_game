/* =========================================================================
   O Mapa do Mundo, desenhado como mapa de verdade: um pergaminho com o
   terreno de cada região — o litoral e o mar da Foz, a mata fechada do
   Curupira, as montanhas com lava da Serra, os campos de vento do Saci, a
   savana de raios de Tupã, as bocas de mina da Caipora e o bairro de
   árvores secas da Cuca —, as estradas pontilhadas entre os lugares, casinha
   onde há cidade, e a rosa dos ventos no canto. Por baixo de tudo, um
   continente de relva sem dono, para as regiões não virarem ilhas.

   A névoa (o que o jogador ainda não conhece) é outra peça, desenhada por
   cima na hora (ui/mapas.ts): o mapa de baixo é um só, assado uma vez.
   ========================================================================= */
import { Buf, rng } from '../core/buf.ts';
import { P, type Tipo } from './palette.ts';

export const MAPA_W = 220;
export const MAPA_H = 88;

/* onde fica, em pixels do pergaminho, a casinha da coluna c, linha l */
export function pontoMapa(c: number, l: number): [number, number] {
  return [20 + c * 20, 8 + l * 12];
}

interface Terreno { chao: string; chaoL: string; deco: (b: Buf, x: number, y: number, r: () => number) => void }

const TERRENO: Record<string, Terreno> = {
  agua: { chao: '#8cc47a', chaoL: '#a8d890',
    deco: (b, x, y) => { b.set(x, y, '#6aa45a'); b.set(x + 1, y - 1, '#6aa45a'); } },
  planta: { chao: '#3f8a3a', chaoL: '#5aa44a',
    deco: (b, x, y) => { b.ellipse(x, y, 2, 2, '#2a5e28'); b.set(x - 1, y - 1, '#5aa44a'); b.set(x, y + 3, '#5a3e24'); } },
  fogo: { chao: '#9a7a5a', chaoL: '#b8987a',
    deco: (b, x, y, r) => {
      b.tri(x - 4, y + 2, x, y - 4, x + 4, y + 2, '#6d5a48'); b.tri(x - 1, y - 2, x, y - 4, x + 1, y - 2, '#e8e0d0');
      if (r() < 0.5) b.set(x, y - 3, '#e8583a');
    } },
  vento: { chao: '#c8d88a', chaoL: '#dce8a8',
    deco: (b, x, y) => { b.line(x - 2, y, x + 1, y, '#f4f8e8'); b.set(x + 2, y - 1, '#f4f8e8'); b.line(x - 1, y + 2, x + 2, y + 2, '#a8b86a'); } },
  raio: { chao: '#d8c060', chaoL: '#e8d488',
    deco: (b, x, y) => { b.line(x, y - 2, x - 1, y, '#8a6a10'); b.line(x - 1, y, x + 1, y, '#8a6a10'); b.line(x + 1, y, x, y + 2, '#8a6a10'); } },
  terra: { chao: '#b08850', chaoL: '#c8a068',
    deco: (b, x, y, r) => {
      if (r() < 0.5) { b.ellipse(x, y, 2, 2, '#6b4a2e'); b.rect(x - 1, y, 3, 2, '#2a1e14'); }
      else { b.ellipse(x, y, 2, 1, '#8a8078'); b.set(x - 1, y - 1, '#b8b0a8'); }
    } },
  sombra: { chao: '#5a4a6a', chaoL: '#6e5e80',
    deco: (b, x, y) => { b.line(x, y + 2, x, y - 2, '#2e2440'); b.line(x, y - 1, x - 2, y - 3, '#2e2440'); b.line(x, y, x + 2, y - 2, '#2e2440'); } },
};

export interface LugarNoMapa { id: string; c: number; l: number; tipo: Tipo; cidade: boolean }

export function mapaMundo(lugares: readonly LugarNoMapa[], estradas: readonly [string, string][]): Buf {
  const b = new Buf(MAPA_W, MAPA_H);
  const r = rng(71);

  // o pergaminho: fundo cor de papel velho, manchas e borda queimada
  b.rect(0, 0, MAPA_W, MAPA_H, '#ead9b0');
  for (let i = 0; i < 700; i++) b.set((r() * MAPA_W) | 0, (r() * MAPA_H) | 0, r() < 0.5 ? '#dcc79a' : '#f2e4c2');
  for (let x = 0; x < MAPA_W; x++) for (const y of [0, 1, MAPA_H - 2, MAPA_H - 1]) b.set(x, y, '#c8a870');
  for (let y = 0; y < MAPA_H; y++) for (const x of [0, 1, MAPA_W - 2, MAPA_W - 1]) b.set(x, y, '#c8a870');

  // o mar a oeste, encostado na Foz, com ondinhas
  const onde = new Map(lugares.map((l) => [l.id, pontoMapa(l.c, l.l)]));
  const porto = onde.get('portoIara');
  if (porto) {
    b.ellipse(porto[0] - 18, porto[1], 14, 30, '#4a8fc8');
    b.ellipse(porto[0] - 18, porto[1], 12, 28, '#5fa4d8');
    for (let i = 0; i < 14; i++) {
      const x = 3 + ((r() * 12) | 0), y = porto[1] - 24 + ((r() * 48) | 0);
      b.line(x, y, x + 2, y, '#a8d4f0');
    }
  }

  // a terra: uma mancha por lugar, na cor da região, desenhada numa folha à
  // parte para ganhar contorno de litoral antes de ir para o pergaminho
  const terra = new Buf(MAPA_W, MAPA_H);
  const dona = new Int8Array(MAPA_W * MAPA_H).fill(-1);
  const tipos = Object.keys(TERRENO);
  // o continente: terra sem dono por baixo de tudo, para as regiões não
  // virarem ilhas soltas — relva baixa, com a costa irregular
  const cantos = new Set(['1,0', '9,0', '1,6', '9,6', '8,6', '2,6', '9,1']);
  for (let c = 1; c <= 9; c++) {
    for (let l = 0; l <= 6; l++) {
      if (cantos.has(`${c},${l}`)) continue;
      const [x0, y0] = pontoMapa(c, l);
      const cx = x0 + ((r() * 9) | 0) - 4, cy = y0 + ((r() * 7) | 0) - 3;
      const raio = 9 + ((r() * 6) | 0);
      for (let dy = -raio; dy <= raio; dy++) {
        for (let dx = -raio; dx <= raio; dx++) {
          if (dx * dx + dy * dy > raio * raio) continue;
          const px = cx + dx, py = cy + dy;
          if (px < 5 || py < 5 || px >= MAPA_W - 5 || py >= MAPA_H - 5) continue;
          terra.set(px, py, r() < 0.07 ? '#9aa46a' : '#b4bc84');
        }
      }
    }
  }
  for (const l of lugares) {
    const [x, y] = onde.get(l.id)!;
    const t = TERRENO[l.tipo]!;
    const raio = 10 + ((r() * 3) | 0);
    for (let dy = -raio; dy <= raio; dy++) {
      for (let dx = -raio - 2; dx <= raio + 2; dx++) {
        if ((dx * dx) / ((raio + 2) * (raio + 2)) + (dy * dy) / (raio * raio) > 1) continue;
        const px = x + dx, py = y + dy;
        if (px < 3 || py < 3 || px >= MAPA_W - 3 || py >= MAPA_H - 3) continue;
        terra.set(px, py, r() < 0.1 ? t.chaoL : t.chao);
        dona[py * MAPA_W + px] = tipos.indexOf(l.tipo);
      }
    }
  }
  // fronteira entre regiões: pontilhado escuro onde o dono muda
  for (let y = 1; y < MAPA_H - 1; y++) {
    for (let x = 1; x < MAPA_W - 1; x++) {
      const d = dona[y * MAPA_W + x]!;
      if (d < 0) continue;
      const dir = dona[y * MAPA_W + x + 1]!, baixo = dona[(y + 1) * MAPA_W + x]!;
      if (((dir >= 0 && dir !== d) || (baixo >= 0 && baixo !== d)) && (x + y) % 2 === 0) terra.set(x, y, '#5a4a32');
    }
  }
  // enfeites do terreno, longe do centro de cada lugar (onde vai a casinha)
  for (const l of lugares) {
    const [x, y] = onde.get(l.id)!;
    for (let i = 0; i < 6; i++) {
      const a = r() * Math.PI * 2, d = 5 + r() * 5;
      const px = Math.round(x + Math.cos(a) * d * 1.2), py = Math.round(y + Math.sin(a) * d);
      if (dona[py * MAPA_W + px] !== tipos.indexOf(l.tipo)) continue;
      TERRENO[l.tipo]!.deco(terra, px, py, r);
    }
  }
  // buraco no meio do continente (sem ligação com a borda do pergaminho) vira lago
  const fora = new Uint8Array(MAPA_W * MAPA_H);
  const fila: number[] = [];
  for (let x = 0; x < MAPA_W; x++) fila.push(x, (MAPA_H - 1) * MAPA_W + x);
  for (let y = 0; y < MAPA_H; y++) fila.push(y * MAPA_W, y * MAPA_W + MAPA_W - 1);
  for (const i of fila) fora[i] = 1;
  while (fila.length) {
    const i = fila.pop()!;
    const x = i % MAPA_W, y = (i / MAPA_W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MAPA_W || ny >= MAPA_H) continue;
      const j = ny * MAPA_W + nx;
      if (fora[j] || terra.get(nx, ny) != null) continue;
      fora[j] = 1; fila.push(j);
    }
  }
  for (let y = 0; y < MAPA_H; y++) {
    for (let x = 0; x < MAPA_W; x++) {
      if (!fora[y * MAPA_W + x] && terra.get(x, y) == null) terra.set(x, y, '#5fa4d8');
    }
  }
  terra.outline('#6b5a3a');
  b.blit(terra, 0, 0);

  // estradas pontilhadas (todas retas na grade)
  for (const [a, c] of estradas) {
    const p = onde.get(a), q = onde.get(c);
    if (!p || !q) continue;
    const passos = Math.max(Math.abs(q[0] - p[0]), Math.abs(q[1] - p[1]));
    for (let i = 0; i <= passos; i += 2) {
      b.set(Math.round(p[0] + ((q[0] - p[0]) * i) / passos), Math.round(p[1] + ((q[1] - p[1]) * i) / passos), '#6b4a2e');
    }
  }

  // os lugares: casinha onde é cidade, marco de pedra nos caminhos
  for (const l of lugares) {
    const [x, y] = onde.get(l.id)!;
    if (l.cidade) {
      b.rect(x - 3, y - 1, 7, 4, '#f2e8d0');
      b.tri(x - 4, y - 1, x, y - 5, x + 4, y - 1, P.roof!);
      b.rect(x, y + 1, 1, 2, '#6b4a2e');
      b.frame(x - 3, y - 1, 7, 4, '#5a4a32');
    } else {
      b.ellipse(x, y, 2, 2, '#f2e8d0');
      b.ellipse(x, y, 1, 1, '#6b4a2e');
    }
  }

  // a rosa dos ventos, no canto de baixo à direita
  const [rx, ry] = [MAPA_W - 16, MAPA_H - 16];
  b.tri(rx - 2, ry, rx, ry - 9, rx + 2, ry, '#8a3a2a');
  b.tri(rx - 2, ry, rx, ry + 9, rx + 2, ry, '#5a4a32');
  b.tri(rx, ry - 2, rx + 9, ry, rx, ry + 2, '#5a4a32');
  b.tri(rx, ry - 2, rx - 9, ry, rx, ry + 2, '#5a4a32');
  b.ellipse(rx, ry, 1, 1, '#ead9b0');
  return b;
}

/* uma nuvem de névoa, cor de pergaminho: cobre o que ainda não se conhece */
export function nevoa(): Buf {
  const b = new Buf(30, 24);
  const puffs: [number, number, number, number][] =
    [[15, 12, 13, 10], [8, 10, 7, 6], [22, 10, 7, 6], [11, 16, 7, 6], [20, 16, 7, 6], [15, 6, 7, 5]];
  for (const [x, y, rx, ry] of puffs) b.ellipse(x, y, rx, ry, '#e2cfa2');
  for (const [x, y, rx, ry] of puffs) b.ellipse(x - 1, y - 1, rx - 3, ry - 3, '#efe2c0');
  return b;
}
