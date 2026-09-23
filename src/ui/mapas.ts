/* =========================================================================
   As duas telas do Mapa do Mundo (menu de pausa → mochila → mapa).

   O MUNDO: o pergaminho desenhado em art/mundo.ts — o terreno de cada
   região, as estradas e as cidades —, com névoa por cima de todo lugar que
   o jogador ainda não conhece, o lugar atual marcado e o escolhido cercado.

   A PLANTA: o chão do lugar, tile por tile, em miniatura — parede, mato,
   água, estrada, construções, as saídas em amarelo e o jogador piscando.
   Só abre com o mapa daquela região na mochila.
   ========================================================================= */
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import { assar, type Assado } from '../core/buf.ts';
import { P } from '../art/palette.ts';
import { mapaMundo, nevoa, pontoMapa } from '../art/mundo.ts';
import type { DefMapa } from '../world/tilemap.ts';
import { CIDADES, POSICOES, regiaoDoMapa } from '../data/mundo.ts';

/* o pergaminho fica neste canto da tela cheia do menu */
const MX = 10, MY = 26;

let base: Assado | null = null;
let nuvem: Assado | null = null;

export function pontoNoMundo(id: string): [number, number] {
  const [c, l] = POSICOES[id]!;
  const [x, y] = pontoMapa(c, l);
  return [MX + x, MY + y];
}

export function desenharMundo(r: Renderizador, conhecidos: ReadonlySet<string>,
                              estradas: readonly [string, string][],
                              atual: string | null, sel: string | null, piscando: boolean): void {
  if (!base) {
    const lugares = Object.entries(POSICOES).map(([id, [c, l]]) => ({
      id, c, l, tipo: regiaoDoMapa(id)!.tipo, cidade: CIDADES.has(id),
    }));
    base = assar(mapaMundo(lugares, estradas));
    nuvem = assar(nevoa());
  }
  r.sprite(base, MX, MY);
  // a névoa por cima do que ainda não se conhece
  for (const id of Object.keys(POSICOES)) {
    if (conhecidos.has(id)) continue;
    const [x, y] = pontoNoMundo(id);
    r.sprite(nuvem!, x - 15, y - 12);
  }
  if (sel) {
    const [x, y] = pontoNoMundo(sel);
    r.retangulo(x - 6, y - 7, 13, 1, P.uiAccD!); r.retangulo(x - 6, y + 5, 13, 1, P.uiAccD!);
    r.retangulo(x - 6, y - 7, 1, 13, P.uiAccD!); r.retangulo(x + 6, y - 7, 1, 13, P.uiAccD!);
  }
  if (atual && piscando) {
    const [x, y] = pontoNoMundo(atual);
    r.retangulo(x - 2, y - 9, 5, 5, P.ink!);
    r.retangulo(x - 1, y - 8, 3, 3, '#ff3030');
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
