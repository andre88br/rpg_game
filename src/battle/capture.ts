/* =========================================================================
   Captura.

   A conta é a de sempre: quanto mais machucado o bicho, melhor o patuá e
   pior o estado dele, maior a chance. O resultado sai como uma chance única
   entre 0 e 1, e os quatro balanços da animação são só essa mesma chance
   dividida em quatro sorteios — ou seja, a animação nunca mente sobre o
   resultado: se balançar quatro vezes, pegou.
   ========================================================================= */
import type { Aleatorio } from '../core/rng.ts';
import type { Encantado } from './encantado.ts';
import { ficha, hpMaximo } from './encantado.ts';

/* multiplicador por estado alterado: bicho dormindo é bem mais fácil */
export const BONUS_STATUS: Record<string, number> = {
  dormindo: 2,
  paralisado: 1.5,
  queimado: 1.2,
  envenenado: 1.2,
};

export function chanceCaptura(alvo: Encantado, bonusPatua: number): number {
  const max = hpMaximo(alvo);
  const hp = Math.max(1, alvo.hp);
  // o HP pesa de 1/3 (cheio) a 1 (quase caindo)
  const fatorHP = (3 * max - 2 * hp) / (3 * max);
  const fatorStatus = alvo.status ? (BONUS_STATUS[alvo.status] ?? 1) : 1;
  const bruto = (fatorHP * ficha(alvo).taxaCaptura * bonusPatua * fatorStatus) / 255;
  return Math.max(0, Math.min(1, bruto));
}

export interface ResultadoCaptura {
  capturado: boolean;
  balancos: number;    // 0 a 4 — quantas vezes o patuá balança antes de abrir
  chance: number;
}

export function tentarCaptura(alvo: Encantado, bonusPatua: number,
                              rnd: Aleatorio): ResultadoCaptura {
  const chance = chanceCaptura(alvo, bonusPatua);
  if (chance >= 1) return { capturado: true, balancos: 4, chance };

  // chance por balanço: quatro sucessos seguidos equivalem à chance total
  const porBalanco = Math.pow(chance, 1 / 4);
  let balancos = 0;
  for (let i = 0; i < 4; i++) {
    if (rnd.proximo() >= porBalanco) break;
    balancos++;
  }
  return { capturado: balancos === 4, balancos, chance };
}
