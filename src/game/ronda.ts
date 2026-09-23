/* =========================================================================
   Rondas: o que um vigia enxerga.

   Ele olha só para a frente (para onde está andando), numa linha reta de
   até `alcance` tiles, e a primeira parede corta a visão. Esconder-se atrás
   de um caixote ou numa reentrância do muro é o jogo inteiro.

   Puro. Teste em ronda.test.ts.
   ========================================================================= */
import type { Direcao } from '../art/people.ts';

const DELTA: Record<Direcao, readonly [number, number]> = {
  cima: [0, -1], baixo: [0, 1], esq: [-1, 0], dir: [1, 0],
};

export function avista(de: { tx: number; ty: number }, dir: Direcao, alcance: number,
                       alvo: { tx: number; ty: number },
                       solido: (tx: number, ty: number) => boolean): boolean {
  const [dx, dy] = DELTA[dir];
  let x = de.tx, y = de.ty;
  for (let i = 0; i < alcance; i++) {
    x += dx; y += dy;
    if (solido(x, y)) return false;
    if (x === alvo.tx && y === alvo.ty) return true;
  }
  return false;
}

/* o próximo ponto do caminho fechado, dando a volta no fim */
export function proximoDaRonda(tamanho: number, i: number): number {
  return (i + 1) % tamanho;
}
