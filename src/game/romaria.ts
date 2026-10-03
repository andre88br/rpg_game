/* =========================================================================
   A Romaria do Círculo: lutas em sequência contra romeiros de time
   sorteado, no nível do Encantado mais forte do jogador mais 2.

   Não há benzimento no meio: só a cada 7 vitórias o Mestre da Romaria
   benze o time. Cada vitória vale fichas (a sétima vale mais), trocadas nas
   barracas do salão. Perder ou sair do salão encerra a sequência; o recorde
   fica guardado. Puro: o mundo chama e aplica.
   ========================================================================= */
import type { Aleatorio } from '../core/rng.ts';
import { criar, type Encantado } from '../battle/encantado.ts';
import { ESPECIES_ORDEM } from '../data/creatures.ts';
import { formaNoNivel, maiorNivel } from './escala.ts';
import type { EstadoJogo } from './state.ts';

export const BENZE_A_CADA = 7;
export const FORA_DA_ROMARIA = new Set(['boto', 'botoEncantado', 'cobraNorato']);

const NOMES = ['JOSEFA', 'BENEDITO', 'ROSÁRIO', 'SEVERINO', 'APARECIDA', 'RAIMUNDO',
  'CONCEIÇÃO', 'DAMIÃO', 'GENI', 'TIÃO', 'LURDES', 'CHICO', 'NAZARÉ', 'ZÉ DO BOI'];

export function nivelDaRomaria(e: EstadoJogo): number {
  return Math.min(100, maiorNivel(e) + 2);
}

/* três romeiros no começo; um a mais a cada sete vitórias, até seis */
export function tamanhoDoTime(vitorias: number): number {
  return Math.min(6, 3 + Math.floor(vitorias / BENZE_A_CADA));
}

export function fichasDaVitoria(vitorias: number): number {
  return vitorias % BENZE_A_CADA === 0 ? 5 : 1;
}

export function gerarRomeiro(rnd: Aleatorio, nivel: number, vitorias: number): { nome: string; time: Encantado[] } {
  const pode = ESPECIES_ORDEM.filter((id) => !FORA_DA_ROMARIA.has(id));
  const time: Encantado[] = [];
  const usados = new Set<string>();
  while (time.length < tamanhoDoTime(vitorias)) {
    const id = formaNoNivel(rnd.escolher(pode), nivel);
    if (usados.has(id)) continue;
    usados.add(id);
    time.push(criar(id, nivel));
  }
  return { nome: rnd.escolher(NOMES), time };
}
