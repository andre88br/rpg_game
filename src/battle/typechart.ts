/* =========================================================================
   Tabela de tipos.

   Só existem dois triângulos e um par, exatamente como combinado no plano:

       Fogo  →  Planta  →  Água  →  Fogo        (2x)
       Terra →  Raio    →  Vento →  Terra       (2x)
       Luz   ↔  Sombra                          (2x nos dois sentidos)

   E cada seta dos triângulos, ao contrário, vale ½× (RESISTENCIAS): quem
   leva 2× de um tipo também resiste ao tipo que ele mesmo vence. Todo o
   resto é neutro (1x). É pouca regra de propósito: dá para decorar depois
   de duas batalhas, e ainda obriga a montar um time variado.
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

/* atacante → tipos que resistem a ele (½×): cada seta dos triângulos, ao
   contrário. Planta bate mal em Fogo, Água em Planta, Fogo em Água; Raio
   em Terra, Vento em Raio, Terra em Vento. Luz e Sombra não resistem uma
   à outra: as duas se batem com força. */
export const RESISTENCIAS: Record<TipoGolpe, readonly Tipo[]> = {
  neutro: [],
  fogo:   ['agua'],
  planta: ['fogo'],
  agua:   ['planta'],
  terra:  ['vento'],
  raio:   ['terra'],
  vento:  ['raio'],
  luz:    [],
  sombra: [],
};

export const SUPER = 2;
export const NEUTRO = 1;
export const FRACO = 0.5;

/* multiplicador de um golpe contra um alvo de um ou dois tipos.
   Com dois tipos os multiplicadores se somam por multiplicação, então um
   alvo Planta/Água leva 2x de Fogo (Fogo bate em Planta) e não 4x, porque
   Fogo não tem vantagem sobre Água. */
export function eficacia(golpe: TipoGolpe, alvo: readonly Tipo[]): number {
  let m = 1;
  const vant = VANTAGENS[golpe], res = RESISTENCIAS[golpe];
  for (const t of alvo) {
    if (vant.includes(t)) m *= SUPER;
    if (res.includes(t)) m *= FRACO;
  }
  return m;
}

/* frase mostrada na caixa de texto depois do golpe */
export function fraseEficacia(m: number): string | null {
  if (m >= 4) return 'Foi devastador!';
  if (m > 1) return 'É super eficaz!';
  if (m < 1) return 'Não foi muito eficaz...';
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
