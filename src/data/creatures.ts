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
  /* o lendário: um só no mundo, não evolui nem vem de ninguém */
  lendario?: boolean;
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
      { nv: 24, golpe: 'coice_brasa' }, { nv: 28, golpe: 'clarao_boitata' },
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
      { nv: 33, golpe: 'chuva_brasas' }, { nv: 36, golpe: 'encarada' },
      { nv: 40, golpe: 'brasa_viva' }, { nv: 46, golpe: 'fornalha' },
      { nv: 52, golpe: 'grito' },
    ],
    evolui: { em: 'mboitata', nv: 38 },
  },
  {
    id: 'mboitata', nome: 'Mboitatá', tipos: ['fogo'],
    base: { hp: 90, atq: 105, def: 80, esp: 125, vel: 110 },
    taxaCaptura: 20, xpBase: 230, crescimento: 'medio',
    arte: 'mboitata', categoria: 'Cobra de Fogo',
    sobre: 'O nome antigo, do tempo em que o campo não tinha cerca. Os olhos azuis são de todo bicho que morreu no fogo.',
    aprende: [
      { nv: 1, golpe: 'labareda' }, { nv: 1, golpe: 'rabo_brasa' },
      { nv: 1, golpe: 'fogo_fatuo' }, { nv: 1, golpe: 'clarao_boitata' },
      { nv: 58, golpe: 'encarada' }, { nv: 60, golpe: 'fogo_mboitata' },
      { nv: 62, golpe: 'fornalha' }, { nv: 64, golpe: 'afiar' },
      { nv: 66, golpe: 'coice_brasa' }, { nv: 70, golpe: 'arremetida' },
      { nv: 74, golpe: 'fecha_corpo' },
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
      { nv: 25, golpe: 'pingos' }, { nv: 28, golpe: 'tromba_agua' },
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
      { nv: 33, golpe: 'correnteza' }, { nv: 36, golpe: 'lampejo' },
      { nv: 40, golpe: 'agua_cheiro' }, { nv: 46, golpe: 'cachoeira' },
      { nv: 52, golpe: 'fecha_corpo' },
    ],
    evolui: { em: 'ipupiara', nv: 38 },
  },
  {
    id: 'ipupiara', nome: 'Ipupiara', tipos: ['agua', 'sombra'],
    base: { hp: 100, atq: 80, def: 95, esp: 130, vel: 100 },
    taxaCaptura: 20, xpBase: 230, crescimento: 'medio',
    arte: 'ipupiara', categoria: 'Mãe das Águas',
    sobre: 'Desceu tão fundo que o rio virou mar. Pescador antigo só dizia o nome dela baixinho.',
    aprende: [
      { nv: 1, golpe: 'tromba_agua' }, { nv: 1, golpe: 'mare_cheia' },
      { nv: 1, golpe: 'canto_iara' }, { nv: 1, golpe: 'benzecao' },
      { nv: 58, golpe: 'sombra_fria' }, { nv: 60, golpe: 'abraco_fundo' },
      { nv: 62, golpe: 'mau_sonho' }, { nv: 64, golpe: 'breu' },
      { nv: 66, golpe: 'cachoeira' }, { nv: 70, golpe: 'assombracao' },
      { nv: 74, golpe: 'arrepio' },
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
      { nv: 24, golpe: 'espinhos' }, { nv: 28, golpe: 'tempestade_verde' },
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
      { nv: 33, golpe: 'seiva_amarga' }, { nv: 36, golpe: 'desmoronamento' },
      { nv: 40, golpe: 'polen' }, { nv: 46, golpe: 'tronco' },
      { nv: 52, golpe: 'grito' },
    ],
    evolui: { em: 'anhanga', nv: 38 },
  },
  {
    id: 'anhanga', nome: 'Anhangá', tipos: ['planta', 'luz'],
    base: { hp: 100, atq: 125, def: 105, esp: 80, vel: 95 },
    taxaCaptura: 20, xpBase: 230, crescimento: 'medio',
    arte: 'anhanga', categoria: 'Guarda-Mata',
    sobre: 'Veado branco de olho de fogo. Caçador que o vê larga a espingarda e não volta mais à mata.',
    aprende: [
      { nv: 1, golpe: 'cipo' }, { nv: 1, golpe: 'tempestade_verde' },
      { nv: 1, golpe: 'desmoronamento' }, { nv: 1, golpe: 'afiar' },
      { nv: 58, golpe: 'lampejo' }, { nv: 60, golpe: 'furia_anhanga' },
      { nv: 62, golpe: 'feixe' }, { nv: 64, golpe: 'aurora' },
      { nv: 66, golpe: 'tronco' }, { nv: 70, golpe: 'sol_a_pino' },
      { nv: 74, golpe: 'prece' },
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
      { nv: 16, golpe: 'pingos' }, { nv: 19, golpe: 'mare_cheia' },
      { nv: 24, golpe: 'correnteza' },
    ],
    evolui: { em: 'piraguacu', nv: 30 },
  },
  {
    id: 'piraguacu', nome: 'Piraguaçu', tipos: ['agua'],
    base: { hp: 85, atq: 100, def: 76, esp: 87, vel: 103 },
    taxaCaptura: 45, xpBase: 165, crescimento: 'rapido',
    arte: 'piraguacu', categoria: 'Peixe Encantado',
    sobre: 'Roubou tanta isca que virou história de pescador. Vira canoa com uma rabanada só.',
    aprende: [
      { nv: 1, golpe: 'bolha' }, { nv: 1, golpe: 'jato_agua' },
      { nv: 1, golpe: 'bote' }, { nv: 1, golpe: 'mare_cheia' },
      { nv: 34, golpe: 'tromba_agua' }, { nv: 40, golpe: 'afiar' },
      { nv: 44, golpe: 'cachoeira' }, { nv: 50, golpe: 'agua_cheiro' },
      { nv: 56, golpe: 'pisao' }, { nv: 62, golpe: 'arremetida' },
      { nv: 68, golpe: 'fecha_corpo' },
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
      { nv: 15, golpe: 'penas' }, { nv: 18, golpe: 'redemoinho' },
      { nv: 21, golpe: 'assobio' },
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
      { nv: 18, golpe: 'raiz_sugadora' }, { nv: 24, golpe: 'espinhos' },
      { nv: 30, golpe: 'entocar' }, { nv: 36, golpe: 'seiva_amarga' },
    ],
    evolui: { em: 'caipora', nv: 40 },
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
      { nv: 16, golpe: 'pedrinhas' }, { nv: 20, golpe: 'afiar' },
      { nv: 26, golpe: 'entocar' },
    ],
    evolui: { em: 'cabraCabriola', nv: 32 },
  },
  {
    id: 'cabraCabriola', nome: 'Cabra-Cabriola', tipos: ['terra', 'fogo'],
    base: { hp: 92, atq: 110, def: 90, esp: 78, vel: 81 },
    taxaCaptura: 30, xpBase: 168, crescimento: 'medio',
    arte: 'cabraCabriola', categoria: 'Bode da Serra',
    sobre: 'Solta fumaça pelas narinas quando pisa fundo. Ninguém segura uma cabriola dela.',
    aprende: [
      { nv: 1, golpe: 'pedrada' }, { nv: 1, golpe: 'tremor' },
      { nv: 1, golpe: 'brasa' }, { nv: 32, golpe: 'desmoronamento' },
      { nv: 38, golpe: 'rabo_brasa' }, { nv: 44, golpe: 'afiar' },
      { nv: 50, golpe: 'coice_brasa' }, { nv: 56, golpe: 'terremoto' },
      { nv: 62, golpe: 'pisao' }, { nv: 68, golpe: 'arremetida' },
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
      { nv: 18, golpe: 'coice_brasa' }, { nv: 22, golpe: 'mau_olhado' },
      { nv: 26, golpe: 'brasa_viva' },
    ],
    evolui: { em: 'mulaSemCabeca', nv: 30 },
  },
  {
    id: 'mulaSemCabeca', nome: 'Mula-sem-Cabeça', tipos: ['fogo'],
    base: { hp: 81, atq: 99, def: 73, esp: 95, vel: 102 },
    taxaCaptura: 25, xpBase: 172, crescimento: 'medio',
    arte: 'mulaSemCabeca', categoria: 'Assombração da Estrada',
    sobre: 'Corre a serra inteira numa noite só. O pescoço solta fogo em vez de pescoço.',
    aprende: [
      { nv: 1, golpe: 'labareda' }, { nv: 1, golpe: 'fogo_fatuo' },
      { nv: 1, golpe: 'mau_olhado' }, { nv: 30, golpe: 'rabo_brasa' },
      { nv: 36, golpe: 'clarao_boitata' }, { nv: 42, golpe: 'breu' },
      { nv: 46, golpe: 'chuva_brasas' }, { nv: 52, golpe: 'assombracao' },
      { nv: 58, golpe: 'coice_mula' }, { nv: 64, golpe: 'fornalha' },
      { nv: 70, golpe: 'arremetida' },
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
      { nv: 22, golpe: 'pedrinhas' }, { nv: 26, golpe: 'tremor' },
      { nv: 30, golpe: 'brasa_viva' }, { nv: 34, golpe: 'desmoronamento' },
      { nv: 38, golpe: 'entocar' },
    ],
    evolui: { em: 'teiniagua', nv: 42 },
  },
  {
    id: 'teiniagua', nome: 'Teiniaguá', tipos: ['fogo', 'terra'],
    base: { hp: 88, atq: 92, def: 98, esp: 100, vel: 66 },
    taxaCaptura: 45, xpBase: 180, crescimento: 'medio',
    arte: 'teiniagua', categoria: 'Guardiã da Mina',
    sobre: 'A lagartixa da pedra de fogo na testa. Quem pega a pedra fica rico e nunca mais dorme.',
    aprende: [
      { nv: 1, golpe: 'brasa' }, { nv: 1, golpe: 'labareda' },
      { nv: 1, golpe: 'tremor' }, { nv: 1, golpe: 'desmoronamento' },
      { nv: 46, golpe: 'clarao_boitata' }, { nv: 52, golpe: 'afiar' },
      { nv: 56, golpe: 'terremoto' }, { nv: 60, golpe: 'fornalha' },
      { nv: 64, golpe: 'chuva_brasas' }, { nv: 68, golpe: 'fecha_corpo' },
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
      { nv: 46, golpe: 'feixe' }, { nv: 52, golpe: 'fornalha' },
      { nv: 58, golpe: 'prece' },
    ],
    evolui: { em: 'eldorado', nv: 52 },
  },
  {
    id: 'eldorado', nome: 'Eldorado', tipos: ['fogo', 'luz'],
    base: { hp: 92, atq: 86, def: 88, esp: 126, vel: 100 },
    taxaCaptura: 3, xpBase: 220, crescimento: 'lento',
    arte: 'eldorado', categoria: 'Fogo da Mina',
    sobre: 'A cidade de ouro que ninguém achou é ela, dormindo. Quando acorda, a serra brilha até de dia.',
    aprende: [
      { nv: 1, golpe: 'aurora' }, { nv: 1, golpe: 'clarao_boitata' },
      { nv: 1, golpe: 'lampejo' }, { nv: 1, golpe: 'labareda' },
      { nv: 64, golpe: 'benzecao' }, { nv: 66, golpe: 'cidade_ouro' },
      { nv: 68, golpe: 'afiar' }, { nv: 70, golpe: 'sol_a_pino' },
      { nv: 74, golpe: 'fecha_corpo' },
    ],
  },

  /* --------------------- do Campo do Saci --------------------- */
  {
    id: 'saci', nome: 'Saci', tipos: ['vento'],
    base: { hp: 72, atq: 83, def: 63, esp: 101, vel: 132 },
    taxaCaptura: 25, xpBase: 165, crescimento: 'rapido',
    arte: 'saci', categoria: 'Peralta do Vento',
    sobre: 'Cresceu, mas não emendou. Atravessa cerca fechada sem tirar o gorro do lugar.',
    aprende: [
      { nv: 1, golpe: 'pe_de_vento' }, { nv: 1, golpe: 'redemoinho' },
      { nv: 1, golpe: 'encarada' }, { nv: 24, golpe: 'vendaval' },
      { nv: 30, golpe: 'afiar' }, { nv: 36, golpe: 'rasante' },
      { nv: 42, golpe: 'bicadas' }, { nv: 48, golpe: 'grito' },
      { nv: 54, golpe: 'furacao' }, { nv: 60, golpe: 'rodamoinho_saci' },
      { nv: 66, golpe: 'fecha_corpo' }, { nv: 72, golpe: 'penas' },
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
      { nv: 42, golpe: 'penas' }, { nv: 46, golpe: 'assobio' },
    ],
    evolui: { em: 'matintaPerera', nv: 40 },
  },
  {
    id: 'matintaPerera', nome: 'Matinta-Perera', tipos: ['vento', 'sombra'],
    base: { hp: 86, atq: 82, def: 78, esp: 112, vel: 102 },
    taxaCaptura: 45, xpBase: 190, crescimento: 'medio',
    arte: 'matintaPerera', categoria: 'Bruxa do Vento',
    sobre: 'Assovia fino no telhado a noite toda. Se ninguém prometer fumo, a casa acorda com o nome dela na boca.',
    aprende: [
      { nv: 1, golpe: 'rajada' }, { nv: 1, golpe: 'redemoinho' },
      { nv: 1, golpe: 'encarada' }, { nv: 1, golpe: 'vendaval' },
      { nv: 52, golpe: 'mau_olhado' }, { nv: 56, golpe: 'breu' },
      { nv: 60, golpe: 'mau_sonho' }, { nv: 64, golpe: 'furacao' },
      { nv: 68, golpe: 'arrepio' }, { nv: 72, golpe: 'unhas_noite' },
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
      { nv: 30, golpe: 'penas' }, { nv: 40, golpe: 'assobio' },
      { nv: 50, golpe: 'rasante' }, { nv: 56, golpe: 'fecha_corpo' },
    ],
    evolui: { em: 'uirapuruRei', nv: 50 },
  },
  {
    id: 'uirapuruRei', nome: 'Uirapuru-Rei', tipos: ['vento', 'luz'],
    base: { hp: 88, atq: 72, def: 72, esp: 132, vel: 118 },
    taxaCaptura: 3, xpBase: 225, crescimento: 'lento',
    arte: 'uirapuruRei', categoria: 'Canto do Mato',
    sobre: 'Quando ele canta, a mata inteira para pra ouvir. O canto cura qualquer tristeza, menos a de quem caça passarinho.',
    aprende: [
      { nv: 1, golpe: 'vendaval' }, { nv: 1, golpe: 'redemoinho' },
      { nv: 1, golpe: 'rajada' }, { nv: 1, golpe: 'lampejo' },
      { nv: 64, golpe: 'benzecao' }, { nv: 66, golpe: 'canto_uirapuru' },
      { nv: 68, golpe: 'aurora' }, { nv: 70, golpe: 'furacao' },
      { nv: 74, golpe: 'feixe' },
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
      { nv: 22, golpe: 'trovoada' }, { nv: 28, golpe: 'faiscas' },
      { nv: 34, golpe: 'risco' }, { nv: 40, golpe: 'carregar' },
    ],
    evolui: { em: 'relampo', nv: 36 },
  },
  {
    id: 'relampo', nome: 'Relampo', tipos: ['raio'],
    base: { hp: 74, atq: 76, def: 65, esp: 113, vel: 122 },
    taxaCaptura: 35, xpBase: 175, crescimento: 'rapido',
    arte: 'relampo', categoria: 'Vaga-lume do Raio',
    sobre: 'Risca o céu de uma serra a outra num piscar. O trovão só chega depois que ele já foi.',
    aprende: [
      { nv: 1, golpe: 'faisca' }, { nv: 1, golpe: 'teia_eletrica' },
      { nv: 1, golpe: 'trovoada' }, { nv: 46, golpe: 'raio_tupa' },
      { nv: 50, golpe: 'afiar' }, { nv: 54, golpe: 'trovao_seco' },
      { nv: 58, golpe: 'risco' }, { nv: 62, golpe: 'carregar' },
      { nv: 66, golpe: 'arremetida' }, { nv: 70, golpe: 'fecha_corpo' },
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
      { nv: 26, golpe: 'faiscas' }, { nv: 32, golpe: 'trovoada' },
      { nv: 38, golpe: 'entocar' }, { nv: 44, golpe: 'desmoronamento' },
      { nv: 50, golpe: 'pedrinhas' },
    ],
    evolui: { em: 'tatuacu', nv: 46 },
  },
  {
    id: 'tatuacu', nome: 'Tatuaçu', tipos: ['raio', 'terra'],
    base: { hp: 100, atq: 112, def: 120, esp: 76, vel: 52 },
    taxaCaptura: 40, xpBase: 200, crescimento: 'medio',
    arte: 'tatuacu', categoria: 'Cavador de Tempestade',
    sobre: 'Tatu do tamanho de carro de boi. Enrolado, vira pedra de raio e desce o morro rolando.',
    aprende: [
      { nv: 1, golpe: 'pedrada' }, { nv: 1, golpe: 'tremor' },
      { nv: 1, golpe: 'trovoada' }, { nv: 1, golpe: 'desmoronamento' },
      { nv: 56, golpe: 'raio_tupa' }, { nv: 58, golpe: 'terremoto' },
      { nv: 62, golpe: 'afiar' }, { nv: 64, golpe: 'trovao_seco' },
      { nv: 68, golpe: 'pisao' }, { nv: 72, golpe: 'fecha_corpo' },
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
      { nv: 45, golpe: 'feixe' }, { nv: 50, golpe: 'carregar' },
      { nv: 55, golpe: 'raios_sol' }, { nv: 60, golpe: 'trovao_seco' },
    ],
    evolui: { em: 'boiuna', nv: 55 },
  },
  {
    id: 'boiuna', nome: 'Boiúna', tipos: ['agua', 'raio'],
    base: { hp: 100, atq: 84, def: 90, esp: 130, vel: 100 },
    taxaCaptura: 3, xpBase: 230, crescimento: 'lento',
    arte: 'boiuna', categoria: 'Serpente da Chuva',
    sobre: 'A cobra grande que o Arco-da-Velha vira quando bebe o rio inteiro. De noite os olhos dela parecem luz de navio.',
    aprende: [
      { nv: 1, golpe: 'trovoada' }, { nv: 1, golpe: 'raio_tupa' },
      { nv: 1, golpe: 'aurora' }, { nv: 1, golpe: 'tromba_agua' },
      { nv: 66, golpe: 'mare_cheia' }, { nv: 68, golpe: 'boiuna_eletrica' },
      { nv: 70, golpe: 'afiar' }, { nv: 72, golpe: 'cachoeira' },
      { nv: 74, golpe: 'fecha_corpo' },
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
      { nv: 26, golpe: 'tremor' }, { nv: 30, golpe: 'pedrinhas' },
      { nv: 38, golpe: 'entocar' }, { nv: 44, golpe: 'pisao' },
    ],
    evolui: { em: 'minhocao', nv: 40 },
  },
  {
    id: 'minhocao', nome: 'Minhocão', tipos: ['terra'],
    base: { hp: 114, atq: 119, def: 105, esp: 55, vel: 57 },
    taxaCaptura: 35, xpBase: 180, crescimento: 'rapido',
    arte: 'minhocao', categoria: 'Minhoca da Mina',
    sobre: 'Dizem que é ele quem faz o rio mudar de curso. Quando se vira embaixo da serra, a mina treme.',
    aprende: [
      { nv: 1, golpe: 'pedrada' }, { nv: 1, golpe: 'tremor' },
      { nv: 1, golpe: 'areia' }, { nv: 50, golpe: 'desmoronamento' },
      { nv: 54, golpe: 'afiar' }, { nv: 58, golpe: 'terremoto' },
      { nv: 62, golpe: 'grito' }, { nv: 66, golpe: 'arremetida' },
      { nv: 70, golpe: 'fecha_corpo' },
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
      { nv: 45, golpe: 'terremoto' }, { nv: 50, golpe: 'pisao' },
      { nv: 55, golpe: 'grito' }, { nv: 60, golpe: 'entocar' },
    ],
    evolui: { em: 'juma', nv: 54 },
  },
  {
    id: 'juma', nome: 'Juma', tipos: ['terra'],
    base: { hp: 130, atq: 138, def: 118, esp: 62, vel: 58 },
    taxaCaptura: 20, xpBase: 240, crescimento: 'lento',
    arte: 'juma', categoria: 'Gigante da Cava',
    sobre: 'O Mapinguari mais velho, de pelo branco. O grito dele derruba árvore e deixa caçador surdo por uma lua.',
    aprende: [
      { nv: 1, golpe: 'pedrada' }, { nv: 1, golpe: 'tremor' },
      { nv: 1, golpe: 'desmoronamento' }, { nv: 1, golpe: 'rosnado' },
      { nv: 64, golpe: 'esforco' }, { nv: 66, golpe: 'bocarra' },
      { nv: 68, golpe: 'garra_cuca' }, { nv: 72, golpe: 'pilao' },
      { nv: 74, golpe: 'fecha_corpo' },
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
      { nv: 45, golpe: 'terremoto' }, { nv: 50, golpe: 'pedrinhas' },
      { nv: 56, golpe: 'tronco' }, { nv: 62, golpe: 'polen' },
      { nv: 68, golpe: 'grito' },
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
      { nv: 30, golpe: 'garra_cuca' }, { nv: 36, golpe: 'unhas_noite' },
      { nv: 44, golpe: 'arrepio' },
    ],
    evolui: { em: 'lobisomem', nv: 42 },
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
      { nv: 56, golpe: 'afiar' }, { nv: 60, golpe: 'uivo_lua' },
      { nv: 62, golpe: 'grito' }, { nv: 66, golpe: 'mau_sonho' },
      { nv: 70, golpe: 'pisao' }, { nv: 74, golpe: 'fecha_corpo' },
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
      { nv: 36, golpe: 'assombracao' }, { nv: 44, golpe: 'garra_cuca' },
      { nv: 50, golpe: 'arrepio' }, { nv: 56, golpe: 'entocar' },
    ],
    evolui: { em: 'almaPenada', nv: 54 },
  },
  {
    id: 'almaPenada', nome: 'Alma-Penada', tipos: ['sombra', 'terra'],
    base: { hp: 110, atq: 112, def: 124, esp: 80, vel: 60 },
    taxaCaptura: 30, xpBase: 215, crescimento: 'medio',
    arte: 'almaPenada', categoria: 'O que a Terra Não Quis',
    sobre: 'Largou o corpo seco na árvore e saiu vagando. Arrasta corrente pela estrada até alguém rezar por ela.',
    aprende: [
      { nv: 1, golpe: 'mau_olhado' }, { nv: 1, golpe: 'tremor' },
      { nv: 1, golpe: 'garra_cuca' }, { nv: 1, golpe: 'sombra_fria' },
      { nv: 62, golpe: 'breu' }, { nv: 64, golpe: 'mau_sonho' },
      { nv: 66, golpe: 'desmoronamento' }, { nv: 68, golpe: 'terremoto' },
      { nv: 72, golpe: 'unhas_noite' },
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
      { nv: 45, golpe: 'mau_sonho' }, { nv: 50, golpe: 'arrepio' },
      { nv: 55, golpe: 'assombracao' }, { nv: 60, golpe: 'fecha_corpo' },
    ],
    evolui: { em: 'cucaRainha', nv: 56 },
  },
  {
    id: 'cucaRainha', nome: 'Cuca-Rainha', tipos: ['sombra', 'agua'],
    base: { hp: 120, atq: 100, def: 100, esp: 134, vel: 92 },
    taxaCaptura: 15, xpBase: 250, crescimento: 'lento',
    arte: 'cucaRainha', categoria: 'A Velha do Sótão',
    sobre: 'Largou o sótão e fez ninho no brejo. Mexe um caldeirão do tamanho de um poço e canta pra ninguém dormir.',
    aprende: [
      { nv: 1, golpe: 'garra_cuca' }, { nv: 1, golpe: 'breu' },
      { nv: 1, golpe: 'mau_olhado' }, { nv: 1, golpe: 'tromba_agua' },
      { nv: 66, golpe: 'sombra_fria' }, { nv: 68, golpe: 'acalanto_cuca' },
      { nv: 70, golpe: 'afiar' }, { nv: 72, golpe: 'cachoeira' },
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
      { nv: 45, golpe: 'assombracao' }, { nv: 50, golpe: 'penas' },
      { nv: 55, golpe: 'mau_sonho' }, { nv: 60, golpe: 'arrepio' },
    ],
    evolui: { em: 'pesadelo', nv: 56 },
  },
  {
    id: 'pesadelo', nome: 'Pesadelo', tipos: ['sombra', 'vento'],
    base: { hp: 98, atq: 84, def: 86, esp: 138, vel: 122 },
    taxaCaptura: 3, xpBase: 240, crescimento: 'lento',
    arte: 'pesadelo', categoria: 'Dona do Telhado',
    sobre: 'Quando a Pisadeira cansa de pisar no peito, ela entra no sonho. Aí não tem telha que proteja.',
    aprende: [
      { nv: 1, golpe: 'breu' }, { nv: 1, golpe: 'vendaval' },
      { nv: 1, golpe: 'mau_olhado' }, { nv: 1, golpe: 'redemoinho' },
      { nv: 66, golpe: 'sombra_fria' }, { nv: 68, golpe: 'furacao' },
      { nv: 70, golpe: 'afiar' }, { nv: 72, golpe: 'unhas_noite' },
    ],
  },

  /* --------------------- da Cidade do Sol --------------------- */
  {
    id: 'luzeiro', nome: 'Luzeiro', tipos: ['luz'],
    base: { hp: 50, atq: 44, def: 46, esp: 64, vel: 66 },
    taxaCaptura: 160, xpBase: 66, crescimento: 'rapido',
    arte: 'luzeiro', categoria: 'Estrela Caída',
    sobre: 'Pedacinho de estrela que caiu antes do amanhecer. Passa o dia escondido, esperando a noite.',
    aprende: [
      { nv: 1, golpe: 'investida' }, { nv: 1, golpe: 'clarao' },
      { nv: 12, golpe: 'benzecao' }, { nv: 22, golpe: 'lampejo' },
      { nv: 28, golpe: 'raios_sol' }, { nv: 34, golpe: 'afiar' },
      { nv: 42, golpe: 'prece' }, { nv: 46, golpe: 'feixe' },
    ],
    evolui: { em: 'estrelaDalva', nv: 42 },
  },
  {
    id: 'estrelaDalva', nome: "Estrela-d'Alva", tipos: ['luz'],
    base: { hp: 90, atq: 72, def: 84, esp: 118, vel: 104 },
    taxaCaptura: 25, xpBase: 205, crescimento: 'rapido',
    arte: 'estrelaDalva', categoria: 'Estrela Caída',
    sobre: 'A última estrela a apagar e a primeira a acender. Quem a vê antes do galo cantar não se perde.',
    aprende: [
      { nv: 1, golpe: 'lampejo' }, { nv: 1, golpe: 'benzecao' },
      { nv: 1, golpe: 'clarao' }, { nv: 50, golpe: 'aurora' },
      { nv: 54, golpe: 'feixe' }, { nv: 58, golpe: 'sol_a_pino' },
      { nv: 62, golpe: 'prece' }, { nv: 66, golpe: 'fecha_corpo' },
      { nv: 70, golpe: 'raios_sol' },
    ],
  },
  {
    id: 'lamparina', nome: 'Lamparina', tipos: ['luz', 'fogo'],
    base: { hp: 78, atq: 70, def: 76, esp: 102, vel: 78 },
    taxaCaptura: 60, xpBase: 170, crescimento: 'medio',
    arte: 'lamparina', categoria: 'Luz de Beira de Estrada',
    sobre: 'Acende sozinha na janela de quem espera alguém voltar. Apaga quando a pessoa chega.',
    aprende: [
      { nv: 1, golpe: 'clarao' }, { nv: 1, golpe: 'brasa' },
      { nv: 1, golpe: 'lampejo' }, { nv: 20, golpe: 'chuva_brasas' },
      { nv: 30, golpe: 'labareda' }, { nv: 36, golpe: 'brasa_viva' },
      { nv: 44, golpe: 'aurora' }, { nv: 52, golpe: 'feixe' },
    ],
    evolui: { em: 'fogoFatuo', nv: 52 },
  },
  {
    id: 'fogoFatuo', nome: 'Fogo-Fátuo', tipos: ['luz', 'fogo'],
    base: { hp: 92, atq: 82, def: 90, esp: 122, vel: 96 },
    taxaCaptura: 30, xpBase: 210, crescimento: 'medio',
    arte: 'fogoFatuo', categoria: 'Luz de Beira de Estrada',
    sobre: 'Luz azul que corre à frente do viajante e some quando ele alcança. Quem segue se perde; quem não segue se arrepende.',
    aprende: [
      { nv: 1, golpe: 'clarao' }, { nv: 1, golpe: 'labareda' },
      { nv: 1, golpe: 'lampejo' }, { nv: 1, golpe: 'aurora' },
      { nv: 64, golpe: 'fogo_fatuo' }, { nv: 66, golpe: 'sol_a_pino' },
      { nv: 68, golpe: 'clarao_boitata' }, { nv: 70, golpe: 'fornalha' },
      { nv: 74, golpe: 'assombracao' },
    ],
  },
  {
    id: 'jaci', nome: 'Jaci', tipos: ['luz', 'sombra'],
    base: { hp: 92, atq: 70, def: 86, esp: 126, vel: 96 },
    taxaCaptura: 3, xpBase: 215, crescimento: 'lento',
    arte: 'jaci', categoria: 'A Lua',
    sobre: 'A lua, que é luz e sombra ao mesmo tempo. Desce só para quem guardou a luz do dia em cristal.',
    aprende: [
      { nv: 1, golpe: 'aurora' }, { nv: 1, golpe: 'breu' },
      { nv: 1, golpe: 'lampejo' }, { nv: 1, golpe: 'sombra_fria' },
      { nv: 45, golpe: 'mau_sonho' }, { nv: 50, golpe: 'feixe' },
      { nv: 55, golpe: 'prece' }, { nv: 60, golpe: 'raios_sol' },
    ],
    evolui: { em: 'eclipse', nv: 58 },
  },
  {
    id: 'eclipse', nome: 'Eclipse', tipos: ['luz', 'sombra'],
    base: { hp: 106, atq: 82, def: 100, esp: 142, vel: 110 },
    taxaCaptura: 3, xpBase: 255, crescimento: 'lento',
    arte: 'eclipse', categoria: 'A Lua',
    sobre: 'Quando Jaci encontra Guaraci no meio do céu, o dia vira noite por um instante. Ela é esse instante.',
    aprende: [
      { nv: 1, golpe: 'aurora' }, { nv: 1, golpe: 'breu' },
      { nv: 1, golpe: 'lampejo' }, { nv: 1, golpe: 'sombra_fria' },
      { nv: 68, golpe: 'benzecao' }, { nv: 70, golpe: 'eclipse_total' },
      { nv: 72, golpe: 'afiar' }, { nv: 74, golpe: 'sol_a_pino' },
    ],
  },
  /* -------- o secreto: o Contador de Bichos dá a quem encher o caderno -------- */
  {
    id: 'boto', nome: 'Boto', tipos: ['agua', 'luz'],
    base: { hp: 70, atq: 60, def: 65, esp: 85, vel: 80 },
    taxaCaptura: 3, xpBase: 180, crescimento: 'lento',
    arte: 'boto', categoria: 'Boto Cor-de-Rosa',
    sobre: 'Sobe o rio nas noites de festa. Quem dança com ele não lembra direito do caminho de volta.',
    aprende: [
      { nv: 1, golpe: 'bolha' }, { nv: 1, golpe: 'clarao' },
      { nv: 8, golpe: 'jato_agua' }, { nv: 14, golpe: 'agua_cheiro' },
      { nv: 20, golpe: 'correnteza' }, { nv: 26, golpe: 'lampejo' },
      { nv: 32, golpe: 'mare_cheia' }, { nv: 38, golpe: 'prece' },
      { nv: 44, golpe: 'feixe' },
    ],
    evolui: { em: 'botoEncantado', nv: 44 },
  },
  {
    id: 'botoEncantado', nome: 'Boto-Encantado', tipos: ['agua', 'luz'],
    base: { hp: 95, atq: 75, def: 85, esp: 120, vel: 105 },
    taxaCaptura: 3, xpBase: 240, crescimento: 'lento',
    arte: 'botoEncantado', categoria: 'Boto Cor-de-Rosa',
    sobre: 'De chapéu branco e roupa de linho, ninguém diz que é bicho. Só tira o chapéu quando a festa acaba.',
    aprende: [
      { nv: 1, golpe: 'bolha' }, { nv: 1, golpe: 'clarao' },
      { nv: 1, golpe: 'jato_agua' }, { nv: 1, golpe: 'correnteza' },
      { nv: 50, golpe: 'cachoeira' }, { nv: 54, golpe: 'aurora' },
      { nv: 58, golpe: 'tromba_agua' }, { nv: 62, golpe: 'benzecao' },
      { nv: 66, golpe: 'sol_a_pino' }, { nv: 70, golpe: 'folego' },
    ],
  },
  /* -------- o lendário escondido, no Remanso, depois do campeonato -------- */
  {
    id: 'cobraNorato', nome: 'Cobra Norato', tipos: ['agua', 'sombra'],
    base: { hp: 115, atq: 110, def: 100, esp: 115, vel: 95 },
    taxaCaptura: 3, xpBase: 270, crescimento: 'lento', lendario: true,
    arte: 'cobraNorato', categoria: 'Cobra Grande',
    sobre: 'Filho de mulher, nasceu cobra. Toda noite tira a pele no barranco e anda de gente; de dia, é o rio inteiro.',
    aprende: [
      { nv: 1, golpe: 'mare_cheia' }, { nv: 1, golpe: 'sombra_fria' },
      { nv: 1, golpe: 'correnteza' }, { nv: 1, golpe: 'mau_olhado' },
      { nv: 64, golpe: 'tromba_agua' }, { nv: 68, golpe: 'arrepio' },
      { nv: 72, golpe: 'mau_sonho' }, { nv: 76, golpe: 'cachoeira' },
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
