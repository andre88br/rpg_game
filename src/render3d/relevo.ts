/* =========================================================================
   O relevo da vista 3D: o que cada letra do chão vira quando o mapa sai do
   papel, e que modelo cada objeto ganha. A vista (vista3d.ts) só constrói o
   que esta tabela manda — é aqui que se decide, e é isto que se testa.

   Por enquanto a vista 3D cobre a Região da Foz (`EM_3D`); o resto do mundo
   continua no desenho plano, sem mudar nada.

   Puro. Teste em relevo.test.ts.
   ========================================================================= */
import type { TipoObjeto } from '../world/tilemap.ts';

/* o que fica em cima do chão daquele tile */
export type Enfeite = 'nada' | 'arvore' | 'pedra' | 'mato' | 'flores' | 'rocha' | 'parede';

export interface Relevo {
  /* altura do chão (o topo do bloco), em tiles */
  altura: number;
  /* a letra cujo desenho pinta o topo — árvore e pedra ficam sobre grama */
  piso: string;
  enfeite: Enfeite;
  /* água: o chão afunda e a lâmina d'água passa por cima */
  agua: boolean;
}

const AGUA = -0.45;

const TABELA: Record<string, Relevo> = {
  '.': { altura: 0, piso: '.', enfeite: 'nada', agua: false },
  ',': { altura: 0, piso: ',', enfeite: 'mato', agua: false },
  '=': { altura: -0.03, piso: '=', enfeite: 'nada', agua: false },
  'f': { altura: 0, piso: 'f', enfeite: 'flores', agua: false },
  'a': { altura: -0.12, piso: 'a', enfeite: 'nada', agua: false },
  'p': { altura: -0.18, piso: 'p', enfeite: 'nada', agua: false },
  '~': { altura: -1.4, piso: '~', enfeite: 'nada', agua: true },
  '#': { altura: 0, piso: '.', enfeite: 'arvore', agua: false },
  'o': { altura: 0, piso: '.', enfeite: 'pedra', agua: false },
  'R': { altura: 1.1, piso: 'R', enfeite: 'rocha', agua: false },
  /* interiores */
  '_': { altura: 0, piso: '_', enfeite: 'nada', agua: false },
  'T': { altura: 0, piso: 'T', enfeite: 'nada', agua: false },
  'm': { altura: 0, piso: 'm', enfeite: 'nada', agua: false },
  'u': { altura: -0.04, piso: 'u', enfeite: 'nada', agua: false },
  'W': { altura: 1.2, piso: 'W', enfeite: 'parede', agua: false },
};

export function relevoDe(ch: string): Relevo | null { return TABELA[ch] ?? null; }

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
};

export function modeloDe(tipo: TipoObjeto): Modelo {
  if (PREDIOS[tipo]) return 'predio';
  if (tipo === 'farol') return 'farol';
  return 'recorte';
}

/* Recorte deitado no chão (é chão, não coisa de pé): o desenho vai no
   piso, como no mapa plano. */
export const DEITADOS: ReadonlySet<TipoObjeto> = new Set<TipoObjeto>([
  'enterrado', 'ladrilho', 'desvio', 'cova', 'gamela', 'patuas', 'mesa', 'balcao',
]);
