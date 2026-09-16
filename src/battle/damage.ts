/* =========================================================================
   Fórmula de dano e modificadores de atributo.

   Este arquivo é só aritmética: recebe números prontos e devolve dano. Quem
   junta estágios, queimadura e tipo é o motor de turnos — separar assim é o
   que deixa a fórmula testável sem montar uma batalha inteira.
   ========================================================================= */
import type { Aleatorio } from '../core/rng.ts';
import type { Tipo, TipoGolpe } from '../art/palette.ts';

/* ---------------------------------------------------- estágios de atributo
   Cada "passo" de um golpe tipo Rosnado sobe ou desce um estágio, de -6 a
   +6. A escala é a clássica: +1 vale 1,5x e -1 vale 0,66x, então subir e
   descer se cancelam direitinho. */
export const ESTAGIO_MIN = -6;
export const ESTAGIO_MAX = 6;

export function multEstagio(passos: number): number {
  const n = Math.max(ESTAGIO_MIN, Math.min(ESTAGIO_MAX, passos));
  return n >= 0 ? (2 + n) / 2 : 2 / (2 - n);
}

export function aplicarEstagio(valor: number, passos: number): number {
  return Math.max(1, Math.floor(valor * multEstagio(passos)));
}

/* ------------------------------------------------------------- críticos */
export const CHANCE_CRITICO = 6;    // % base
export const MULT_CRITICO = 1.5;

/* ------------------------------------------------------------ afinidade
   STAB: bater com um golpe do próprio tipo rende 50% a mais. É o que faz
   valer a pena montar um time variado em vez de um só bicho com tudo. */
export const MULT_AFINIDADE = 1.5;

export function temAfinidade(tipoGolpe: TipoGolpe, tiposDoAtacante: readonly Tipo[]): boolean {
  return tipoGolpe !== 'neutro' && tiposDoAtacante.includes(tipoGolpe);
}

/* ------------------------------------------------------------------ dano */

export interface EntradaDano {
  nivel: number;
  ataque: number;      // ATQ ou ESP do atacante, já com estágios e queimadura
  defesa: number;      // DEF ou ESP do alvo, já com estágios
  potencia: number;
  afinidade: boolean;
  eficacia: number;    // 1, 2 ou 4, vindo de typechart.ts
  bonusCritico?: number;
}

export interface ResultadoDano {
  dano: number;
  critico: boolean;
}

/* parte determinística: o mesmo golpe com os mesmos números sempre dá isto.
   O acaso entra depois, em calcularDano. */
export function danoBase(e: EntradaDano): number {
  if (e.potencia <= 0) return 0;
  const bruto = Math.floor(
    (Math.floor((2 * e.nivel) / 5 + 2) * e.potencia * (e.ataque / Math.max(1, e.defesa))) / 50,
  ) + 2;
  const comTipo = bruto * e.eficacia * (e.afinidade ? MULT_AFINIDADE : 1);
  return Math.max(1, Math.floor(comTipo));
}

/* variação de 85% a 100%, como no gênero: duas trocas iguais nunca dão
   exatamente o mesmo resultado, mas a diferença nunca vira sorte pura. */
export function calcularDano(e: EntradaDano, rnd: Aleatorio): ResultadoDano {
  if (e.potencia <= 0) return { dano: 0, critico: false };
  const critico = rnd.chance(CHANCE_CRITICO + (e.bonusCritico ?? 0));
  const variacao = 0.85 + rnd.proximo() * 0.15;
  const bruto = danoBase(e) * (critico ? MULT_CRITICO : 1) * variacao;
  return { dano: Math.max(1, Math.floor(bruto)), critico };
}

/* ------------------------------------------------------------- precisão */
/* precisao 0 quer dizer "nunca erra" (Benzeção, Afiar as Garras...) */
export function acertou(precisao: number, rnd: Aleatorio): boolean {
  if (precisao <= 0) return true;
  return rnd.chance(precisao);
}
