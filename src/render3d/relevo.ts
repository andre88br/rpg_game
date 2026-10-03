/* =========================================================================
   O relevo da vista 3D: o que cada letra do chão vira quando o mapa sai do
   papel, e que modelo cada objeto ganha. A vista (vista3d.ts) só constrói o
   que esta tabela manda — é aqui que se decide, e é isto que se testa.

   O chão é low-poly: cada tile tem uma cor (e a vista mistura as cores nos
   cantos, para grama virar caminho sem degrau de cor), uma altura (os cantos
   são a média dos vizinhos, o que chanfra todo barranco), e um enfeite em
   cima. Parede, rocha e paredão de caverna são BLOCOS: não entram na média
   e sobem retos.

   Por enquanto a vista 3D cobre a Região da Foz (`EM_3D`); o resto do mundo
   continua no desenho plano. A tabela já cobre todas as 27 letras.

   Puro. Teste em relevo.test.ts.
   ========================================================================= */
import type { TipoObjeto } from '../world/tilemap.ts';

/* o que fica em cima do chão daquele tile */
export type Enfeite =
  | 'nada' | 'arvore' | 'pedra' | 'mato' | 'flores' | 'capim' | 'cascalho' | 'trilho'
  | 'rocha' | 'parede';

export interface Relevo {
  /* altura do chão (o topo do bloco, se for bloco), em tiles */
  altura: number;
  /* cor do topo; a vista varia um pouco por canto */
  cor: string;
  enfeite: Enfeite;
  /* água: o chão afunda e a lâmina d'água passa por cima */
  agua: boolean;
  /* parede, rocha: sobe reta, fora da média dos cantos */
  bloco: boolean;
  /* lava: brilha sozinha */
  brilha?: boolean;
}

const AGUA = -0.45;

const t = (altura: number, cor: string, enfeite: Enfeite = 'nada'): Relevo =>
  ({ altura, cor, enfeite, agua: false, bloco: false });
const bloco = (altura: number, cor: string, enfeite: Enfeite): Relevo =>
  ({ altura, cor, enfeite, agua: false, bloco: true });

const TABELA: Record<string, Relevo> = {
  /* ao ar livre */
  '.': t(0, '#72b35a'),
  ',': t(0, '#4f9446', 'mato'),
  '=': t(-0.03, '#d2b072'),
  'f': t(0, '#7cba5c', 'flores'),
  'a': t(-0.12, '#e8d296'),
  'p': t(-0.12, '#9a7048'),
  /* o fundo d'água é areia: a margem vira prainha, e no raso a areia aparece */
  '~': { altura: -1.4, cor: '#c9b384', enfeite: 'nada', agua: true, bloco: false },
  '#': t(0, '#5e9e4c', 'arvore'),
  'o': t(0, '#6aa857', 'pedra'),
  'R': bloco(1.1, '#8f887c', 'rocha'),
  /* interiores */
  '_': t(0, '#b98e5c'),
  'W': bloco(1.2, '#e2cba2', 'parede'),
  'T': t(0, '#b8454a'),
  'm': t(0, '#cdbd7c'),
  'u': t(-0.04, '#8cc2e0'),
  'v': t(0, '#6d8f3a'),
  /* Serra Boitatá */
  'c': t(0, '#8e847c'),
  'n': t(0, '#cdb25e', 'capim'),
  'L': { altura: -0.25, cor: '#ff6a1e', enfeite: 'nada', agua: false, bloco: false, brilha: true },
  'S': bloco(1.3, '#4c4454', 'parede'),
  's': t(0, '#6c6274'),
  'g': t(0, '#625a6a', 'cascalho'),
  /* Campo do Saci */
  'V': t(0, '#a9dccb'),
  /* Minas da Caipora: trilhos */
  'D': t(0, '#7c6a58', 'trilho'),
  'E': t(0, '#7c6a58', 'trilho'),
  'C': t(0, '#7c6a58', 'trilho'),
  'B': t(0, '#7c6a58', 'trilho'),
};

export function relevoDe(ch: string): Relevo | null { return TABELA[ch] ?? null; }

export const LETRAS_COM_RELEVO: readonly string[] = Object.keys(TABELA);

export const NIVEL_AGUA = AGUA;

/* A parede de baixo de um interior fica baixinha, como numa maquete
   cortada: senão ela tampava a sala inteira da câmera, que olha do sul. */
export const PAREDE_CORTADA = 0.3;

/* os mapas que já têm vista 3D: a Região da Foz inteira */
export const EM_3D: ReadonlySet<string> = new Set([
  'vilaAurora', 'casaTaina', 'casaFirmina', 'rotaFoz', 'portoIara',
  'lojaPortoIara', 'benzimentoPortoIara', 'terreiroPortoIara',
]);

/* o modelo de cada objeto: construção de verdade, farol, ou o próprio
   desenho do jogo recortado e posto de pé (placa, guia, estante, baú...) */
export type Modelo = 'predio' | 'farol' | 'recorte';

export const PREDIOS: Partial<Record<TipoObjeto, { telhado: string; escuro: string; letreiro?: string }>> = {
  casa: { telhado: '#c2493f', escuro: '#93312c' },
  benzimento: { telhado: '#c25d8f', escuro: '#95406a', letreiro: 'BENZIMENTO' },
  loja: { telhado: '#3f8f6f', escuro: '#2b6b52', letreiro: 'LOJA' },
  terreiro: { telhado: '#3f6fa8', escuro: '#2b4d79', letreiro: 'TERREIRO' },
  posto: { telhado: '#8a6a3f', escuro: '#654d2e', letreiro: 'ENCRUZILHADA' },
  forja: { telhado: '#7a3a2a', escuro: '#582719', letreiro: 'FORJA' },
  moinho: { telhado: '#c9a85a', escuro: '#9c7f3e', letreiro: 'MOINHO' },
  arena: { telhado: '#c9a227', escuro: '#8a6a14', letreiro: 'ARENA' },
};

/* todo tipo de objeto, um modelo — o Record obriga a não esquecer nenhum */
const MODELO: Record<TipoObjeto, Modelo> = {
  casa: 'predio', loja: 'predio', benzimento: 'predio', terreiro: 'predio', posto: 'predio',
  forja: 'predio', moinho: 'predio', arena: 'predio',
  farol: 'farol',
  placa: 'recorte', barreira: 'recorte', monteFolhas: 'recorte', portao: 'recorte',
  achado: 'recorte', cova: 'recorte', entulho: 'recorte',
  paraRaio: 'recorte', cercaRaio: 'recorte', pedraRachada: 'recorte',
  enterrado: 'recorte', desvio: 'recorte', alavanca: 'recorte', monteTerra: 'recorte',
  ladrilho: 'recorte', veu: 'recorte',
  espelho: 'recorte', fonteLuz: 'recorte', cristal: 'recorte', lampiao: 'recorte', cortinaLuz: 'recorte',
  balao: 'recorte',
  balcao: 'recorte', gamela: 'recorte', estante: 'recorte', mesa: 'recorte', patuas: 'recorte', bau: 'recorte',
};

export function modeloDe(tipo: TipoObjeto): Modelo { return MODELO[tipo]; }

export const TIPOS_DE_OBJETO: readonly TipoObjeto[] = Object.keys(MODELO) as TipoObjeto[];

/* Recorte deitado no chão (é chão, não coisa de pé): o desenho vai no
   piso, como no mapa plano. */
export const DEITADOS: ReadonlySet<TipoObjeto> = new Set<TipoObjeto>([
  'enterrado', 'ladrilho', 'desvio', 'cova', 'gamela', 'patuas', 'mesa', 'balcao',
]);

/* ------------------------------------------------------------------ luz

   A luz de cada região e de cada hora. O sol muda de cor com o período, o
   céu ganha a cor da região, e o tempo (chuva, neblina) puxa tudo para o
   cinza e aproxima a névoa. */
export type PeriodoLuz = 'manha' | 'dia' | 'tarde' | 'noite';
export type ClimaLuz = 'limpo' | 'chuva' | 'ventania' | 'tempestade' | 'neblina';

export interface Luz {
  ceuTopo: string;        // o degradê do fundo
  ceuBase: string;
  hemiCima: string;       // a luz que vem do céu
  hemiBaixo: string;      // a que volta do chão
  hemi: number;
  sol: string;
  solForca: number;
  nevoa: string;
  nevoaPerto: number;
  nevoaLonge: number;
  /* de onde vem o sol: ângulo em volta e altura (0 = horizonte) */
  solAngulo: number;
  solAltura: number;
}

/* o céu de cada região (pelo tipo dela), ao meio-dia */
const CEU_DA_REGIAO: Record<string, [string, string]> = {
  agua: ['#5fb4ec', '#cdeefc'], planta: ['#6ab8d8', '#d6f0e0'], fogo: ['#e89a6a', '#f8dcb8'],
  vento: ['#7cc4f0', '#e8f6ff'], raio: ['#7a8ec8', '#d8def0'], terra: ['#c8a878', '#f0e0c0'],
  sombra: ['#6a5a8a', '#c8b8d8'], luz: ['#f0c860', '#fff4d0'], fora: ['#e8c060', '#fff0c8'],
};

function misturar(a: string, b: string, k: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, '0')}`;
}

export function luzDe(regiao: string | null, p: PeriodoLuz, clima: ClimaLuz, interior: boolean): Luz {
  if (interior) {
    return {
      ceuTopo: '#120e18', ceuBase: '#1c1624', hemiCima: '#fff0d8', hemiBaixo: '#6a5038', hemi: 1.5,
      sol: '#ffe8c0', solForca: 1.4, nevoa: '#120e18', nevoaPerto: 60, nevoaLonge: 120,
      solAngulo: 2.4, solAltura: 1.1,
    };
  }
  const [topo, base] = CEU_DA_REGIAO[regiao ?? 'fora'] ?? CEU_DA_REGIAO['fora']!;
  let l: Luz;
  switch (p) {
    case 'manha':
      l = { ceuTopo: misturar(topo, '#f0b088', 0.35), ceuBase: misturar(base, '#ffd8b0', 0.5),
            hemiCima: '#ffe8d0', hemiBaixo: '#5a6a3a', hemi: 0.95, sol: '#ffd8a8', solForca: 2.0,
            nevoa: misturar(base, '#ffd8b0', 0.5), nevoaPerto: 24, nevoaLonge: 48, solAngulo: 0.6, solAltura: 0.55 };
      break;
    case 'tarde':
      l = { ceuTopo: misturar(topo, '#e07040', 0.45), ceuBase: misturar(base, '#ffb070', 0.6),
            hemiCima: '#ffd0a0', hemiBaixo: '#5a4a3a', hemi: 0.85, sol: '#ffa060', solForca: 1.9,
            nevoa: misturar(base, '#ffb070', 0.6), nevoaPerto: 22, nevoaLonge: 46, solAngulo: 3.6, solAltura: 0.45 };
      break;
    case 'noite':
      l = { ceuTopo: '#0a1030', ceuBase: '#28305a', hemiCima: '#8aa0e0', hemiBaixo: '#1a2030', hemi: 0.55,
            sol: '#a8c0ff', solForca: 0.7, nevoa: '#1a2244', nevoaPerto: 16, nevoaLonge: 38,
            solAngulo: 2.2, solAltura: 0.9 };
      break;
    default:
      l = { ceuTopo: topo, ceuBase: base, hemiCima: '#eef6ff', hemiBaixo: '#5a7a3a', hemi: 1.0,
            sol: '#fff2d8', solForca: 2.4, nevoa: base, nevoaPerto: 26, nevoaLonge: 52,
            solAngulo: 2.0, solAltura: 1.0 };
  }
  if (clima === 'chuva' || clima === 'tempestade') {
    const k = clima === 'tempestade' ? 0.6 : 0.45;
    l.ceuTopo = misturar(l.ceuTopo, '#4a5260', k); l.ceuBase = misturar(l.ceuBase, '#8890a0', k);
    l.nevoa = misturar(l.nevoa, '#7a8290', k);
    l.solForca *= 0.45; l.hemi *= 0.9; l.nevoaPerto *= 0.7; l.nevoaLonge *= 0.75;
  } else if (clima === 'neblina') {
    l.nevoa = misturar(l.nevoa, '#d0d4e0', 0.6); l.ceuBase = l.nevoa;
    l.nevoaPerto = 6; l.nevoaLonge = 22; l.solForca *= 0.6;
  }
  return l;
}
