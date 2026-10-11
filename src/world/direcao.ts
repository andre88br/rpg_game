/* As quatro direções em passos de tile. À parte do world/actor.ts para
   que as contas puras (e os testes) não carreguem o ator inteiro. */
import type { Direcao } from '../art/people.ts';

export const DELTAS: Record<Direcao, [number, number]> = {
  cima: [0, -1], baixo: [0, 1], esq: [-1, 0], dir: [1, 0],
};

/* a direção de um deslocamento; o eixo horizontal vence o vertical */
export function direcaoDe(dx: number, dy: number): Direcao | null {
  if (dx < 0) return 'esq';
  if (dx > 0) return 'dir';
  if (dy < 0) return 'cima';
  if (dy > 0) return 'baixo';
  return null;
}
