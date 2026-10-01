/* =========================================================================
   As peças paradas das cutscenes: o que não é gente nem bicho e aparece por
   cima do fundo — a rede do Mestre, a carta lacrada, o pote de carvão... Um
   desenho só, sem animação (a fogueira e o trator, que se mexem, ficam em
   art/cenas.ts e o tocador cuida deles à parte).
   ========================================================================= */
import type { Buf } from '../core/buf.ts';
import { redeEnrolada, farolGrande, cartaLacrada, muda, lataTinta } from './cenas.ts';
import { poteCarvao, sinoBronze, candeia } from './fundos/serra.ts';
import { penaVento } from './fundos/campo.ts';
import { pedraRaio, tamborGrande } from './fundos/tupa.ts';
import { pepita, forquilha } from './fundos/minas.ts';
import { retrato } from './fundos/cuca.ts';
import { cristalSolar, balao } from './fundos/sol.ts';

export const PECAS = {
  rede: redeEnrolada,
  farol: farolGrande,
  carta: cartaLacrada,
  muda,
  tinta: lataTinta,
  // Serra Boitatá
  carvao: poteCarvao,
  sino: sinoBronze,
  candeia,
  // Campo do Saci
  pena: penaVento,
  // Aldeia Tupã
  pedraRaio,
  tambor: tamborGrande,
  // Minas da Caipora
  pepita,
  forquilha,
  // Bairro da Cuca
  retrato,
  // Cidade do Sol
  cristal: cristalSolar,
  balao,
} satisfies Record<string, () => Buf>;

export type PecaParada = keyof typeof PECAS;
