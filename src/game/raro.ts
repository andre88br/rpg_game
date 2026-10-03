/* =========================================================================
   A cor rara no mato alto: um em 256, e um em 128 com o Amuleto do Brilho
   na mochila. O raro só muda a cor (art/raro.ts) — atributos, golpes e
   traço são os de sempre.
   ========================================================================= */
import type { Aleatorio } from '../core/rng.ts';
import type { Encantado } from '../battle/encantado.ts';
import { quantidade } from '../data/items.ts';
import type { EstadoJogo } from './state.ts';

export const CHANCE_RARO = 1 / 256;

export function chanceRaro(e: EstadoJogo): number {
  return quantidade(e.mochila, 'amuleto_brilho') > 0 ? CHANCE_RARO * 2 : CHANCE_RARO;
}

/* sorteia a cor do bicho que acabou de aparecer no mato */
export function talvezRaro(bicho: Encantado, e: EstadoJogo, rnd: Aleatorio): Encantado {
  if (rnd.proximo() < chanceRaro(e)) bicho.raro = true;
  return bicho;
}
