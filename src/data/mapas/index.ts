/* Registro de todos os mapas da Região da Foz — a Fase 1 do jogo.
   As saídas de um mapa apontam para as chaves deste objeto, e o teste em
   src/world/mapas.test.ts confere que nenhuma delas aponta para o vazio. */
import type { DefMapa } from '../../world/tilemap.ts';
import { vilaAurora } from './vilaAurora.ts';
import { casaTaina } from './casaTaina.ts';
import { casaFirmina } from './casaFirmina.ts';
import { rotaFoz } from './rotaFoz.ts';
import { portoIara } from './portoIara.ts';
import { lojaPortoIara } from './lojaPortoIara.ts';
import { benzimentoPortoIara } from './benzimentoPortoIara.ts';
import { terreiroPortoIara } from './terreiroPortoIara.ts';

export const MAPAS: Record<string, DefMapa> = {
  vilaAurora,
  casaTaina,
  casaFirmina,
  rotaFoz,
  portoIara,
  lojaPortoIara,
  benzimentoPortoIara,
  terreiroPortoIara,
};

export const MAPA_INICIAL = 'casaTaina';
