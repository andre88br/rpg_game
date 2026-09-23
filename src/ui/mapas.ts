/* =========================================================================
   As duas telas do Mapa do Mundo (menu de pausa → mochila → mapa).

   O MUNDO: uma casinha por lugar ao ar livre (data/mundo.ts), ligadas pelas
   estradas, na cor do tipo da região. Lugar que o jogador ainda não
   conhece aparece como "?", e estrada só aparece entre dois conhecidos.

   A PLANTA: o chão do lugar, tile por tile, em miniatura — parede, mato,
   água, estrada, construções, as saídas em amarelo e o jogador piscando.
   Só abre com o mapa daquela região na mochila.
   ========================================================================= */
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import { P, TIPOS } from '../art/palette.ts';
import type { DefMapa } from '../world/tilemap.ts';
import { POSICOES, regiaoDoMapa } from '../data/mundo.ts';

const X0 = 18, DX = 17, Y0 = 38, DY = 12;

export function pontoNoMundo(id: string): [number, number] {
  const [c, l] = POSICOES[id]!;
  return [X0 + c * DX, Y0 + l * DY];
}

export function desenharMundo(r: Renderizador, conhecidos: ReadonlySet<string>,
                              estradas: readonly [string, string][],
                              atual: string | null, sel: string | null, piscando: boolean): void {
  // estradas primeiro, por baixo das casinhas (todas são retas na grade)
  for (const [a, b] of estradas) {
    if (!conhecidos.has(a) || !conhecidos.has(b)) continue;
    const [ax, ay] = pontoNoMundo(a), [bx, by] = pontoNoMundo(b);
    r.retangulo(Math.min(ax, bx), Math.min(ay, by), Math.abs(ax - bx) + 1, Math.abs(ay - by) + 1, P.uiBg3!);
  }
  for (const id of Object.keys(POSICOES)) {
    const [x, y] = pontoNoMundo(id);
    const reg = regiaoDoMapa(id);
    if (id === sel) r.retangulo(x - 6, y - 6, 13, 13, P.uiAccD!);
    r.retangulo(x - 4, y - 4, 9, 9, P.ink!);
    if (conhecidos.has(id) && reg) {
      r.retangulo(x - 3, y - 3, 7, 7, TIPOS[reg.tipo].cor);
    } else {
      r.retangulo(x - 3, y - 3, 7, 7, P.uiBg2!);
      r.texto('?', x - 2, y - 3, P.uiBg3!);
    }
    if (id === atual && piscando) r.retangulo(x - 1, y - 1, 3, 3, '#ffffff');
  }
}

/* cor de cada caractere do chão, na miniatura */
const COR: Record<string, string> = {
  '#': '#2f5e2e', 'R': '#6d635c', 'S': '#3a3346', 'W': '#6b4a2e', 'L': '#c93f3f', 'o': '#8a8078',
  '~': '#3f7fbf', 'u': '#5f9fd0', ',': '#3f7a3a', 'n': '#8a9a4a', 'g': '#5a5448', 'v': '#5f8a3a',
  '.': '#6fae5a', 'f': '#8fbe6a', '=': '#c9a86a', 'a': '#d9c28a', 'c': '#9a8f86', 'p': '#8a6440',
  '_': '#d9b88a', 'T': '#b85a4a', 'm': '#c9a86a', 's': '#8a8078', 'V': '#a8d8c8',
  'D': '#b8bcc4', 'E': '#b8bcc4', 'C': '#b8bcc4', 'B': '#b8bcc4',
};
const CONSTRUCAO = new Set(['casa', 'loja', 'benzimento', 'terreiro', 'posto', 'forja', 'moinho', 'farol']);

export function desenharPlanta(r: Renderizador, def: DefMapa,
                               jogador: { tx: number; ty: number } | null, piscando: boolean): void {
  const larg = def.chao[0]!.length, alt = def.chao.length;
  const areaW = LARGURA - 28, areaH = ALTURA - 62;
  const s = Math.max(1, Math.floor(Math.min(areaW / larg, areaH / alt)));
  const x0 = Math.floor((LARGURA - larg * s) / 2), y0 = 28 + Math.floor((areaH - alt * s) / 2);
  r.retangulo(x0 - 2, y0 - 2, larg * s + 4, alt * s + 4, P.ink!);
  def.chao.forEach((linha, ty) => {
    for (let tx = 0; tx < linha.length; tx++) {
      r.retangulo(x0 + tx * s, y0 + ty * s, s, s, COR[linha[tx]!] ?? '#6fae5a');
    }
  });
  for (const o of def.objetos) {
    if (!CONSTRUCAO.has(o.tipo)) continue;
    const cor = o.tipo === 'terreiro' ? P.gymRoof! : o.tipo === 'benzimento' ? '#c25d8f'
              : o.tipo === 'loja' ? '#3f8f6f' : P.roof!;
    r.retangulo(x0 + o.tx * s, y0 + o.ty * s, (o.larg ?? 4) * s, (o.alt ?? 3) * s, cor);
  }
  for (const sd of def.saidas ?? []) {
    if (sd.para === def.id) continue;          // saída disfarçada que devolve ao começo
    r.retangulo(x0 + sd.tx * s, y0 + sd.ty * s, s, s, P.bolt!);
  }
  if (jogador && piscando) {
    const m = Math.max(2, s);
    r.retangulo(x0 + jogador.tx * s + (s - m) / 2, y0 + jogador.ty * s + (s - m) / 2, m, m, '#ff3030');
  }
}
