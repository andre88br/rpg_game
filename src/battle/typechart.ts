/* =========================================================================
   Tabela de tipos.

   Só existem dois triângulos e um par, exatamente como combinado no plano:

       Fogo  →  Planta  →  Água  →  Fogo        (2x)
       Terra →  Raio    →  Vento →  Terra       (2x)
       Luz   ↔  Sombra                          (2x nos dois sentidos)

   Todo o resto é neutro (1x). É pouca regra de propósito: dá para decorar
   depois de duas batalhas, mas ainda obriga a montar um time variado, já que
   cada um dos 8 ginásios usa um tipo diferente.

   Se um dia quisermos mais profundidade, basta acrescentar as resistências
   (0.5x no sentido contrário de cada seta) em VANTAGENS — o resto do motor
   não muda, porque tudo passa por eficacia().
   ========================================================================= */
import type { Tipo, TipoGolpe } from '../art/palette.ts';

/* atacante → lista de tipos contra os quais ele é super eficaz */
export const VANTAGENS: Record<TipoGolpe, readonly Tipo[]> = {
  neutro: [],
  fogo:   ['planta'],
  planta: ['agua'],
  agua:   ['fogo'],
  terra:  ['raio'],
  raio:   ['vento'],
  vento:  ['terra'],
  luz:    ['sombra'],
  sombra: ['luz'],
};

export const SUPER = 2;
export const NEUTRO = 1;

/* multiplicador de um golpe contra um alvo de um ou dois tipos.
   Com dois tipos os multiplicadores se somam por multiplicação, então um
   alvo Planta/Água leva 2x de Fogo (Fogo bate em Planta) e não 4x, porque
   Fogo não tem vantagem sobre Água. */
export function eficacia(golpe: TipoGolpe, alvo: readonly Tipo[]): number {
  let m = 1;
  const vant = VANTAGENS[golpe];
  for (const t of alvo) if (vant.includes(t)) m *= SUPER;
  return m;
}

/* frase mostrada na caixa de texto depois do golpe */
export function fraseEficacia(m: number): string | null {
  if (m >= 4) return 'Foi devastador!';
  if (m > 1) return 'É super eficaz!';
  return null;
}

/* usado pela IA e pela tela de time: o quanto este time sofre deste tipo */
export function melhorTipoContra(alvo: readonly Tipo[]): Tipo[] {
  const bons: Tipo[] = [];
  for (const t of Object.keys(VANTAGENS) as Tipo[]) {
    if (t === ('neutro' as Tipo)) continue;
    if (eficacia(t, alvo) > 1) bons.push(t);
  }
  return bons;
}
