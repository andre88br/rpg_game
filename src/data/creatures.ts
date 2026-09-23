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
    evolui: { em: 'saci', nv: 24 },
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

  /* --------------------- da Serra Boitatá --------------------- */
  {
    id: 'cabritinha', nome: 'Cabritinha', tipos: ['terra'],
    base: { hp: 52, atq: 58, def: 56, esp: 44, vel: 42 },
    taxaCaptura: 190, xpBase: 58, crescimento: 'rapido',
    arte: 'cabritinha', categoria: 'Bode da Serra',
    sobre: 'Sobe pedra que nem cabra de verdade. Topada dela derruba gente feita.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'pedrada' },
      { nv: 7, golpe: 'areia' }, { nv: 13, golpe: 'tremor' },
      { nv: 20, golpe: 'afiar' },
    ],
    evolui: { em: 'cabraCabriola', nv: 32 },
  },
  {
    id: 'cabraCabriola', nome: 'Cabra-Cabriola', tipos: ['terra', 'fogo'],
    base: { hp: 82, atq: 98, def: 80, esp: 70, vel: 72 },
    taxaCaptura: 30, xpBase: 168, crescimento: 'medio',
    arte: 'cabraCabriola', categoria: 'Bode da Serra',
    sobre: 'Solta fumaça pelas narinas quando pisa fundo. Ninguém segura uma cabriola dela.',
    aprende: [
      { nv: 1, golpe: 'pedrada' }, { nv: 1, golpe: 'tremor' },
      { nv: 1, golpe: 'brasa' }, { nv: 32, golpe: 'desmoronamento' },
      { nv: 38, golpe: 'rabo_brasa' }, { nv: 44, golpe: 'afiar' },
    ],
  },
  {
    id: 'mulinha', nome: 'Mulinha', tipos: ['fogo'],
    base: { hp: 46, atq: 52, def: 44, esp: 56, vel: 70 },
    taxaCaptura: 190, xpBase: 60, crescimento: 'medio',
    arte: 'mulinha', categoria: 'Assombração da Estrada',
    sobre: 'Casco de fogo bate na terra da trilha. Ninguém vê o que carrega no lombo.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'brasa' },
      { nv: 8, golpe: 'fogo_fatuo' }, { nv: 15, golpe: 'labareda' },
      { nv: 22, golpe: 'mau_olhado' },
    ],
    evolui: { em: 'mulaSemCabeca', nv: 30 },
  },
  {
    id: 'mulaSemCabeca', nome: 'Mula-sem-Cabeça', tipos: ['fogo'],
    base: { hp: 75, atq: 92, def: 68, esp: 88, vel: 95 },
    taxaCaptura: 25, xpBase: 172, crescimento: 'medio',
    arte: 'mulaSemCabeca', categoria: 'Assombração da Estrada',
    sobre: 'Corre a serra inteira numa noite só. O pescoço solta fogo em vez de pescoço.',
    aprende: [
      { nv: 1, golpe: 'labareda' }, { nv: 1, golpe: 'fogo_fatuo' },
      { nv: 1, golpe: 'mau_olhado' }, { nv: 30, golpe: 'rabo_brasa' },
      { nv: 36, golpe: 'clarao_boitata' }, { nv: 42, golpe: 'breu' },
    ],
  },
  {
    id: 'salamanca', nome: 'Salamanca', tipos: ['fogo', 'terra'],
    base: { hp: 68, atq: 70, def: 78, esp: 74, vel: 48 },
    taxaCaptura: 90, xpBase: 110, crescimento: 'medio',
    arte: 'salamanca', categoria: 'Guardiã da Mina',
    sobre: 'Some se pisar em cinza morta. Onde ela passou, a pedra fica quente por dias.',
    aprende: [
      { nv: 1, golpe: 'brasa' }, { nv: 1, golpe: 'pedrada' },
      { nv: 10, golpe: 'areia' }, { nv: 18, golpe: 'labareda' },
      { nv: 26, golpe: 'tremor' }, { nv: 34, golpe: 'desmoronamento' },
    ],
  },
  {
    id: 'maeDoOuro', nome: 'Mãe-do-Ouro', tipos: ['fogo', 'luz'],
    base: { hp: 78, atq: 72, def: 70, esp: 105, vel: 85 },
    taxaCaptura: 3, xpBase: 180, crescimento: 'lento',
    arte: 'maeDoOuro', categoria: 'Fogo da Mina',
    sobre: 'Risca o céu da serra de noite, sempre em cima de ouro que ninguém acha.',
    aprende: [
      { nv: 1, golpe: 'clarao' }, { nv: 1, golpe: 'labareda' },
      { nv: 1, golpe: 'lampejo' }, { nv: 20, golpe: 'benzecao' },
      { nv: 30, golpe: 'aurora' }, { nv: 40, golpe: 'clarao_boitata' },
    ],
  },

  /* --------------------- do Campo do Saci --------------------- */
  {
    id: 'saci', nome: 'Saci', tipos: ['vento'],
    base: { hp: 64, atq: 74, def: 56, esp: 90, vel: 118 },
    taxaCaptura: 25, xpBase: 165, crescimento: 'rapido',
    arte: 'saci', categoria: 'Peralta do Vento',
    sobre: 'Cresceu, mas não emendou. Atravessa cerca fechada sem tirar o gorro do lugar.',
    aprende: [
      { nv: 1, golpe: 'pe_de_vento' }, { nv: 1, golpe: 'redemoinho' },
      { nv: 1, golpe: 'encarada' }, { nv: 24, golpe: 'vendaval' },
      { nv: 30, golpe: 'afiar' },
    ],
  },
  {
    id: 'matinta', nome: 'Matinta', tipos: ['vento'],
    base: { hp: 70, atq: 66, def: 62, esp: 88, vel: 80 },
    taxaCaptura: 70, xpBase: 120, crescimento: 'medio',
    arte: 'matinta', categoria: 'Bruxa do Vento',
    sobre: 'De dia é véia sentada na porta. De noite vira coruja e pede fumo pela janela.',
    aprende: [
      { nv: 1, golpe: 'rajada' }, { nv: 1, golpe: 'pe_de_vento' },
      { nv: 12, golpe: 'encarada' }, { nv: 20, golpe: 'redemoinho' },
      { nv: 28, golpe: 'rosnado' }, { nv: 36, golpe: 'vendaval' },
    ],
  },
  {
    id: 'uirapuru', nome: 'Uirapuru', tipos: ['vento'],
    base: { hp: 74, atq: 60, def: 58, esp: 112, vel: 98 },
    taxaCaptura: 3, xpBase: 185, crescimento: 'lento',
    arte: 'uirapuru', categoria: 'Canto do Mato',
    sobre: 'Canta uma vez por noite, uma vez no ano. Quem escuta não esquece mais o resto da vida.',
    aprende: [
      { nv: 1, golpe: 'rajada' }, { nv: 1, golpe: 'redemoinho' },
      { nv: 1, golpe: 'vendaval' }, { nv: 20, golpe: 'encarada' },
    ],
  },

  /* --------------------- da Aldeia Tupã --------------------- */
  {
    id: 'faisquinha', nome: 'Faisquinha', tipos: ['raio'],
    base: { hp: 40, atq: 42, def: 38, esp: 60, vel: 80 },
    taxaCaptura: 180, xpBase: 60, crescimento: 'rapido',
    arte: 'faisquinha', categoria: 'Vaga-lume do Raio',
    sobre: 'Nasce onde o raio cai no capim. Pisca três vezes antes de sumir no mato.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'faisca' },
      { nv: 9, golpe: 'teia_eletrica' }, { nv: 15, golpe: 'encarada' },
      { nv: 22, golpe: 'trovoada' },
    ],
    evolui: { em: 'relampo', nv: 46 },
  },
  {
    id: 'relampo', nome: 'Relampo', tipos: ['raio'],
    base: { hp: 68, atq: 70, def: 60, esp: 104, vel: 112 },
    taxaCaptura: 35, xpBase: 175, crescimento: 'rapido',
    arte: 'relampo', categoria: 'Vaga-lume do Raio',
    sobre: 'Risca o céu de uma serra a outra num piscar. O trovão só chega depois que ele já foi.',
    aprende: [
      { nv: 1, golpe: 'faisca' }, { nv: 1, golpe: 'teia_eletrica' },
      { nv: 1, golpe: 'trovoada' }, { nv: 46, golpe: 'raio_tupa' },
      { nv: 50, golpe: 'afiar' },
    ],
  },
  {
    id: 'tatuTrovao', nome: 'Tatu-Trovão', tipos: ['raio', 'terra'],
    base: { hp: 82, atq: 88, def: 96, esp: 62, vel: 44 },
    taxaCaptura: 60, xpBase: 150, crescimento: 'medio',
    arte: 'tatuTrovao', categoria: 'Cavador de Tempestade',
    sobre: 'Enterra o raio que cai no morro e devolve o estrondo pelo chão, dias depois.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'pedrada' },
      { nv: 1, golpe: 'faisca' }, { nv: 20, golpe: 'tremor' },
      { nv: 32, golpe: 'trovoada' }, { nv: 44, golpe: 'desmoronamento' },
    ],
  },
  {
    id: 'arcoDaVelha', nome: 'Arco-da-Velha', tipos: ['raio', 'luz'],
    base: { hp: 80, atq: 62, def: 70, esp: 116, vel: 92 },
    taxaCaptura: 3, xpBase: 190, crescimento: 'lento',
    arte: 'arcoDaVelha', categoria: 'Serpente da Chuva',
    sobre: 'Bebe água da lagoa pelas duas pontas depois da tempestade. Quem passa por baixo troca de sina.',
    aprende: [
      { nv: 1, golpe: 'trovoada' }, { nv: 1, golpe: 'lampejo' },
      { nv: 1, golpe: 'raio_tupa' }, { nv: 1, golpe: 'aurora' },
    ],
  },

  /* --------------------- das Minas da Caipora --------------------- */
  {
    id: 'minhoquinha', nome: 'Minhoquinha', tipos: ['terra'],
    base: { hp: 52, atq: 55, def: 50, esp: 35, vel: 40 },
    taxaCaptura: 180, xpBase: 62, crescimento: 'rapido',
    arte: 'minhoquinha', categoria: 'Minhoca da Mina',
    sobre: 'Abre túnel na terra mole mais rápido que garimpeiro com enxada. Some ao menor tremor.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'areia' },
      { nv: 10, golpe: 'pedrada' }, { nv: 18, golpe: 'encarada' },
      { nv: 26, golpe: 'tremor' },
    ],
    evolui: { em: 'minhocao', nv: 50 },
  },
  {
    id: 'minhocao', nome: 'Minhocão', tipos: ['terra'],
    base: { hp: 104, atq: 108, def: 96, esp: 50, vel: 52 },
    taxaCaptura: 35, xpBase: 180, crescimento: 'rapido',
    arte: 'minhocao', categoria: 'Minhoca da Mina',
    sobre: 'Dizem que é ele quem faz o rio mudar de curso. Quando se vira embaixo da serra, a mina treme.',
    aprende: [
      { nv: 1, golpe: 'pedrada' }, { nv: 1, golpe: 'tremor' },
      { nv: 1, golpe: 'areia' }, { nv: 50, golpe: 'desmoronamento' },
      { nv: 54, golpe: 'afiar' },
    ],
  },
  {
    id: 'mapinguari', nome: 'Mapinguari', tipos: ['terra'],
    base: { hp: 110, atq: 118, def: 100, esp: 55, vel: 50 },
    taxaCaptura: 25, xpBase: 200, crescimento: 'lento',
    arte: 'mapinguari', categoria: 'Gigante da Cava',
    sobre: 'Um olho só no meio da testa e a boca na barriga. O chão da cava funda afunda onde ele pisa.',
    aprende: [
      { nv: 1, golpe: 'pedrada' }, { nv: 1, golpe: 'rosnado' },
      { nv: 1, golpe: 'tremor' }, { nv: 1, golpe: 'desmoronamento' },
    ],
  },
  {
    id: 'caipora', nome: 'Caipora', tipos: ['terra', 'planta'],
    base: { hp: 86, atq: 96, def: 82, esp: 88, vel: 100 },
    taxaCaptura: 3, xpBase: 195, crescimento: 'lento',
    arte: 'caipora', categoria: 'Dona da Mata Funda',
    sobre: 'Monta um porco-do-mato e protege quem não caça mais que precisa. Fumo de rolo acalma ela.',
    aprende: [
      { nv: 1, golpe: 'tremor' }, { nv: 1, golpe: 'cipo' },
      { nv: 1, golpe: 'desmoronamento' }, { nv: 1, golpe: 'tempestade_verde' },
    ],
  },

  /* --------------------- do Bairro da Cuca --------------------- */
  {
    id: 'lobinho', nome: 'Lobinho', tipos: ['sombra'],
    base: { hp: 48, atq: 62, def: 42, esp: 44, vel: 70 },
    taxaCaptura: 170, xpBase: 64, crescimento: 'rapido',
    arte: 'lobinho', categoria: 'Filhote da Lua',
    sobre: 'Nasce em sétimo filho de sexta-feira. Uiva baixinho pra lua e se esconde quando ela olha de volta.',
    aprende: [
      { nv: 1, golpe: 'arranhao' }, { nv: 1, golpe: 'sombra_fria' },
      { nv: 12, golpe: 'rosnado' }, { nv: 20, golpe: 'mau_olhado' },
      { nv: 30, golpe: 'garra_cuca' },
    ],
    evolui: { em: 'lobisomem', nv: 52 },
  },
  {
    id: 'lobisomem', nome: 'Lobisomem', tipos: ['sombra'],
    base: { hp: 92, atq: 116, def: 80, esp: 70, vel: 102 },
    taxaCaptura: 30, xpBase: 185, crescimento: 'rapido',
    arte: 'lobisomem', categoria: 'Filhote da Lua',
    sobre: 'Na lua cheia vira bicho e corre sete cemitérios antes do galo cantar.',
    aprende: [
      { nv: 1, golpe: 'garra_cuca' }, { nv: 1, golpe: 'rosnado' },
      { nv: 1, golpe: 'sombra_fria' }, { nv: 52, golpe: 'breu' },
      { nv: 56, golpe: 'afiar' },
    ],
  },
  {
    id: 'corpoSeco', nome: 'Corpo-Seco', tipos: ['sombra', 'terra'],
    base: { hp: 90, atq: 98, def: 104, esp: 64, vel: 46 },
    taxaCaptura: 55, xpBase: 170, crescimento: 'medio',
    arte: 'corpoSeco', categoria: 'O que a Terra Não Quis',
    sobre: 'Foi tão ruim em vida que nem a terra quis. Anda encostado nas árvores secas do bairro.',
    aprende: [
      { nv: 1, golpe: 'mau_olhado' }, { nv: 1, golpe: 'pedrada' },
      { nv: 1, golpe: 'sombra_fria' }, { nv: 30, golpe: 'tremor' },
      { nv: 44, golpe: 'garra_cuca' },
    ],
  },
  {
    id: 'cuca', nome: 'Cuca', tipos: ['sombra'],
    base: { hp: 104, atq: 90, def: 90, esp: 124, vel: 84 },
    taxaCaptura: 20, xpBase: 210, crescimento: 'lento',
    arte: 'cuca', categoria: 'A Velha do Sótão',
    sobre: 'Cabeça de jacaré, voz de velha. Vem pegar quem não dorme, e ninguém sabe o que ela faz depois.',
    aprende: [
      { nv: 1, golpe: 'garra_cuca' }, { nv: 1, golpe: 'mau_olhado' },
      { nv: 1, golpe: 'breu' }, { nv: 1, golpe: 'sombra_fria' },
    ],
  },
  {
    id: 'pisadeira', nome: 'Pisadeira', tipos: ['sombra', 'vento'],
    base: { hp: 82, atq: 70, def: 72, esp: 120, vel: 106 },
    taxaCaptura: 3, xpBase: 200, crescimento: 'lento',
    arte: 'pisadeira', categoria: 'Dona do Telhado',
    sobre: 'Magra, de unhas compridas, anda nos telhados. Pisa no peito de quem dorme de barriga cheia.',
    aprende: [
      { nv: 1, golpe: 'breu' }, { nv: 1, golpe: 'vendaval' },
      { nv: 1, golpe: 'mau_olhado' }, { nv: 1, golpe: 'redemoinho' },
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
