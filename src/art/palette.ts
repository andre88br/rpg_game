/* Paleta unica do jogo. Tudo desenhado usa apenas estas cores, o que
   mantem o visual coeso entre cenario, personagens e interface. */
export const P: Record<string, string> = {
  ink:      '#191221',  ink2:     '#2d2338',

  skin:     '#e3a276',  skinL:    '#f6c9a4',  skinD:    '#b8764f',
  skin2:    '#a9714a',  skin2L:   '#c99167',  skin2D:   '#7d4c2e',
  hair:     '#2c1b14',  hairL:    '#4e3020',
  hairR:    '#c4471f',  hairRL:   '#f07a2c',

  grass:    '#5aa34a',  grassD:   '#468a3c',  grassL:   '#74bf5e',
  tall:     '#3c7c34',  tallD:    '#2d6027',  tallL:    '#5aa347',
  tree:     '#2f6b2e',  treeD:    '#1f4c22',  treeL:    '#4c8f3f',
  trunk:    '#6d4726',  trunkD:   '#482e18',

  path:     '#c2a06a',  pathD:    '#a3804f',  pathL:    '#d9bd8c',
  sand:     '#f0dda6',  sandD:    '#d6bf85',

  water:    '#3a7fd5',  waterD:   '#2a5da6',  waterL:   '#6aa8ea',  foam: '#d3ebff',

  wall:     '#ecdcc2',  wallD:    '#c3aa89',  wallL:    '#fbf1de',
  roof:     '#c2493f',  roofD:    '#93312c',  roofL:    '#e0685a',
  gymRoof:  '#3f6fa8',  gymRoofD: '#2b4d79',  gymRoofL: '#5f96d0',
  door:     '#7c4c29',  doorD:    '#54301a',
  win:      '#8fd2f2',  winD:     '#5aa0c8',

  fire:     '#ff6a22',  fireL:    '#ffc23c',  fireD:    '#bf3316',
  bolt:     '#ffd93b',  boltD:    '#c79a12',
  dark:     '#4a3a6b',  darkL:    '#6f59a0',
  light:    '#fff3c4',  lightD:   '#e3c96a',
  rock:     '#9a8f86',  rockD:    '#6d635c',
  wind:     '#bfe9e0',  windD:    '#7fc4b8',

  uiBg:     '#f7f3e6',  uiBg2:    '#ded5bd',  uiBg3:    '#bdb198',
  uiInk:    '#2b2436',  uiAcc:    '#c9a227',  uiAccD:   '#8d6f16',
  hpGreen:  '#4cd05a',  hpYellow: '#f0c030',  hpRed:    '#e04a3a',
  barBack:  '#4a4258',  xp:       '#4aa8e0',

  night:    '#221a33',  nightL:   '#3a2d55',
  white:    '#ffffff',  black:    '#0d0912',
  gold:     '#f2c43d',  goldD:    '#b8891c',  silver: '#d6dbe4', silverD: '#98a1b0',
};

export type Tipo = 'fogo' | 'agua' | 'planta' | 'terra' | 'vento' | 'raio' | 'sombra' | 'luz';

export interface InfoTipo { nome: string; cor: string; corD: string }

/* cores dos 8 tipos, usadas em medalhas, etiquetas e efeitos */
export const TIPOS: Record<Tipo, InfoTipo> = {
  fogo:   { nome: 'FOGO',   cor: P.fire,    corD: P.fireD },
  agua:   { nome: 'ÁGUA',   cor: P.water,   corD: P.waterD },
  planta: { nome: 'PLANTA', cor: P.tree,    corD: P.treeD },
  terra:  { nome: 'TERRA',  cor: '#b07840', corD: '#7c5228' },
  vento:  { nome: 'VENTO',  cor: P.windD,   corD: '#4f948a' },
  raio:   { nome: 'RAIO',   cor: P.bolt,    corD: P.boltD },
  sombra: { nome: 'SOMBRA', cor: P.dark,    corD: '#2f2447' },
  luz:    { nome: 'LUZ',    cor: P.lightD,  corD: '#a88c35' },
};

export const TIPOS_ORDEM: readonly Tipo[] = ['fogo','agua','planta','terra','vento','raio','sombra','luz'];
