/* =========================================================================
   Espécies de Encantados.

   Cada espécie é só uma ficha: tipos, atributos-base, o que aprende e em que
   nível e em quem evolui. Nada aqui sabe desenhar nem lutar — a arte vem de
   art/creatures.ts pela chave `arte`, e a luta lê estes números por
   battle/encantado.ts.

   Os atributos-base seguem a mesma escala do gênero: soma perto de 250 para
   uma criatura inicial e perto de 400 para uma evoluída.
   ========================================================================= */
import type { Tipo } from '../art/palette.ts';

export type Crescimento = 'rapido' | 'medio' | 'lento';

export interface Atributos {
  hp: number;
  atq: number;   // pancada física
  def: number;   // aguenta pancada física
  esp: number;   // serve de ataque E defesa para golpes especiais
  vel: number;   // decide quem bate primeiro
}

export interface Aprendizado { nv: number; golpe: string }

export interface Especie {
  id: string;
  nome: string;
  tipos: readonly Tipo[];         // um ou dois
  base: Atributos;
  taxaCaptura: number;            // 3 (quase impossível) a 255 (fácil)
  xpBase: number;
  crescimento: Crescimento;
  aprende: readonly Aprendizado[];
  evolui?: { em: string; nv: number };
  arte: string;                   // chave em art/creatures.ts
  categoria: string;              // linha de sabor no Caderno
  sobre: string;
}

const LISTA: readonly Especie[] = [
  /* --------------------- os três iniciais --------------------- */
  {
    id: 'boitatinha', nome: 'Boitatinha', tipos: ['fogo'],
    base: { hp: 40, atq: 55, def: 40, esp: 60, vel: 65 },
    taxaCaptura: 45, xpBase: 62, crescimento: 'medio',
    arte: 'boitatinha', categoria: 'Cobra de Fogo',
    sobre: 'Filhote da cobra que guarda o campo. Acende sozinha quando tem medo.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'brasa' },
      { nv: 6, golpe: 'rosnado' }, { nv: 10, golpe: 'labareda' },
      { nv: 14, golpe: 'fogo_fatuo' }, { nv: 20, golpe: 'rabo_brasa' },
      { nv: 28, golpe: 'clarao_boitata' },
    ],
    evolui: { em: 'boitatao', nv: 18 },
  },
  {
    id: 'boitatao', nome: 'Boitatão', tipos: ['fogo'],
    base: { hp: 70, atq: 85, def: 65, esp: 95, vel: 90 },
    taxaCaptura: 30, xpBase: 165, crescimento: 'medio',
    arte: 'boitatao', categoria: 'Cobra de Fogo',
    sobre: 'Rasga o escuro do cerrado inteiro. Onde passa, o mato seco vira brasa.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'brasa' },
      { nv: 1, golpe: 'labareda' }, { nv: 18, golpe: 'rabo_brasa' },
      { nv: 24, golpe: 'fogo_fatuo' }, { nv: 30, golpe: 'clarao_boitata' },
      { nv: 36, golpe: 'encarada' },
    ],
  },
  {
    id: 'iarinha', nome: 'Iarinha', tipos: ['agua'],
    base: { hp: 48, atq: 45, def: 55, esp: 65, vel: 52 },
    taxaCaptura: 45, xpBase: 62, crescimento: 'medio',
    arte: 'iarinha', categoria: 'Moça do Rio',
    sobre: 'Canta baixinho na beira do rio. Quem para pra ouvir, cochila.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'bolha' },
      { nv: 6, golpe: 'jato_agua' }, { nv: 12, golpe: 'canto_iara' },
      { nv: 16, golpe: 'mare_cheia' }, { nv: 22, golpe: 'folego' },
      { nv: 28, golpe: 'tromba_agua' },
    ],
    evolui: { em: 'iaraMae', nv: 18 },
  },
  {
    id: 'iaraMae', nome: 'Iara-Mãe', tipos: ['agua'],
    base: { hp: 80, atq: 65, def: 80, esp: 100, vel: 80 },
    taxaCaptura: 30, xpBase: 165, crescimento: 'medio',
    arte: 'iaraMae', categoria: 'Mãe das Águas',
    sobre: 'Dona do fundo do rio. Devolve afogado e leva atrevido.',
    aprende: [
      { nv: 1, golpe: 'jato_agua' }, { nv: 1, golpe: 'bolha' },
      { nv: 1, golpe: 'canto_iara' }, { nv: 18, golpe: 'mare_cheia' },
      { nv: 24, golpe: 'benzecao' }, { nv: 30, golpe: 'tromba_agua' },
      { nv: 36, golpe: 'lampejo' },
    ],
  },
  {
    id: 'curupinho', nome: 'Curupinho', tipos: ['planta'],
    base: { hp: 50, atq: 62, def: 58, esp: 48, vel: 47 },
    taxaCaptura: 45, xpBase: 62, crescimento: 'medio',
    arte: 'curupinho', categoria: 'Guarda-Mata',
    sobre: 'Tem os pés virados pra trás: quem segue a pegada acaba mais fundo na mata.',
    aprende: [
      { nv: 1, golpe: 'arranhao' }, { nv: 1, golpe: 'folha_afiada' },
      { nv: 6, golpe: 'cipo' }, { nv: 11, golpe: 'raiz_sugadora' },
      { nv: 15, golpe: 'afiar' }, { nv: 21, golpe: 'esporo' },
      { nv: 28, golpe: 'tempestade_verde' },
    ],
    evolui: { em: 'curupira', nv: 18 },
  },
  {
    id: 'curupira', nome: 'Curupirá', tipos: ['planta'],
    base: { hp: 80, atq: 100, def: 85, esp: 65, vel: 75 },
    taxaCaptura: 30, xpBase: 165, crescimento: 'medio',
    arte: 'curupira', categoria: 'Guarda-Mata',
    sobre: 'Assobia uma vez e a mata inteira fecha o caminho do caçador.',
    aprende: [
      { nv: 1, golpe: 'arranhao' }, { nv: 1, golpe: 'folha_afiada' },
      { nv: 1, golpe: 'cipo' }, { nv: 18, golpe: 'afiar' },
      { nv: 24, golpe: 'esporo' }, { nv: 30, golpe: 'tempestade_verde' },
      { nv: 36, golpe: 'desmoronamento' },
    ],
  },

  /* --------------------- selvagens de Porto Iara --------------------- */
  {
    id: 'piragua', nome: 'Piraguá', tipos: ['agua'],
    base: { hp: 42, atq: 48, def: 40, esp: 50, vel: 60 },
    taxaCaptura: 190, xpBase: 55, crescimento: 'rapido',
    arte: 'piragua', categoria: 'Peixe Encantado',
    sobre: 'Peixinho teimoso que rouba isca e some antes de o pescador xingar.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'bolha' },
      { nv: 8, golpe: 'jato_agua' }, { nv: 13, golpe: 'bote' },
      { nv: 19, golpe: 'mare_cheia' },
    ],
  },
  {
    id: 'sacizinho', nome: 'Sacizinho', tipos: ['vento'],
    base: { hp: 38, atq: 45, def: 35, esp: 52, vel: 78 },
    taxaCaptura: 190, xpBase: 58, crescimento: 'rapido',
    arte: 'sacizinho', categoria: 'Peralta do Vento',
    sobre: 'Some dentro do próprio redemoinho. Só larga o que roubou por uma peneira.',
    aprende: [
      { nv: 1, golpe: 'arranhao' }, { nv: 1, golpe: 'rajada' },
      { nv: 7, golpe: 'pe_de_vento' }, { nv: 12, golpe: 'encarada' },
      { nv: 18, golpe: 'redemoinho' },
    ],
  },
  {
    id: 'caiporinha', nome: 'Caiporinha', tipos: ['planta'],
    base: { hp: 54, atq: 52, def: 56, esp: 40, vel: 38 },
    taxaCaptura: 190, xpBase: 55, crescimento: 'rapido',
    arte: 'caiporinha', categoria: 'Bicho do Mato',
    sobre: 'Anda montada em porco-do-mato. Dá azar em caçador que não pede licença.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'folha_afiada' },
      { nv: 7, golpe: 'rosnado' }, { nv: 12, golpe: 'cipo' },
      { nv: 18, golpe: 'raiz_sugadora' },
    ],
  },
];

export const ESPECIES: Record<string, Especie> =
  Object.fromEntries(LISTA.map((e) => [e.id, e]));

export function especie(id: string): Especie {
  const e = ESPECIES[id];
  if (!e) throw new Error(`espécie desconhecida: ${id}`);
  return e;
}

export const ESPECIES_ORDEM: readonly string[] = LISTA.map((e) => e.id);
