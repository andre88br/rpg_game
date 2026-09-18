/* =========================================================================
   Quanto se vê no escuro.

   Puro de propósito, como quests.ts: nada de canvas, nada de Buf — só a
   regra de quanto o jogador alcança com os olhos, para dar pra testar sem
   navegador. Quem desenha a escuridão de verdade é `art/tiles.ts`
   (mascaraLuz) e `core/renderer.ts` (escuridao), a partir do número daqui.
   ========================================================================= */
import { quantidade } from '../data/items.ts';
import { ligada } from './quests.ts';
import type { EstadoJogo } from './state.ts';

export const RAIO_SEM_LUZ = 20;
export const RAIO_CANDEIA = 44;
export const RAIO_TOCHA = 96;

/* raio de luz em volta do jogador, em pixels — cresce em dois degraus:
   a candeia do Ferreiro é o primeiro, o Dom "Tocha" (só depois da Medalha
   Brasa) é o segundo e cobre quase a tela inteira. */
export function raioDaLuz(e: EstadoJogo): number {
  if (ligada(e, 'dom_tocha')) return RAIO_TOCHA;
  if (quantidade(e.mochila, 'candeia') > 0) return RAIO_CANDEIA;
  return RAIO_SEM_LUZ;
}
