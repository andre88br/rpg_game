/* =========================================================================
   Revanche que cresce com o jogador.

   Os oito mestres do Círculo voltam no nível do Encantado mais forte do
   time mais 3 (nunca abaixo do 60), e cada bicho do time deles já aparece
   na forma que teria nesse nível. Os golpes saem de `golpesAte` no nível
   novo — o time ganha golpe novo sozinho.
   ========================================================================= */
import { especie } from '../data/creatures.ts';
import type { EstadoJogo } from './state.ts';

export interface Escala { piso: number; mais: number }

export function maiorNivel(e: EstadoJogo): number {
  return Math.max(1, ...e.time.map((b) => b.nivel));
}

export function nivelEscalado(e: EstadoJogo, s: Escala): number {
  return Math.min(100, Math.max(s.piso, maiorNivel(e) + s.mais));
}

/* a forma que a espécie teria nesse nível, seguindo a cadeia de evolução */
export function formaNoNivel(id: string, nivel: number): string {
  let atual = id;
  for (let i = 0; i < 5; i++) {
    const ev = especie(atual).evolui;
    if (!ev || ev.nv > nivel) break;
    atual = ev.em;
  }
  return atual;
}
