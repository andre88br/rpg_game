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
import { igarapeCurupira } from './igarapeCurupira.ts';
import { mataDoCurupira } from './mataDoCurupira.ts';
import { casaEncruzilhada } from './casaEncruzilhada.ts';
import { terreiroCurupira } from './terreiroCurupira.ts';
import { trilhaDaBrasa } from './trilhaDaBrasa.ts';
import { vilaFornalha } from './vilaFornalha.ts';
import { lojaFornalha } from './lojaFornalha.ts';
import { benzimentoFornalha } from './benzimentoFornalha.ts';
import { forjaFornalha } from './forjaFornalha.ts';
import { cavernaBoitata } from './cavernaBoitata.ts';
import { cumeeiraBoitata } from './cumeeiraBoitata.ts';
import { terreiroBrasaPatio } from './terreiroBrasaPatio.ts';
import { terreiroBrasaEscoria } from './terreiroBrasaEscoria.ts';
import { terreiroBrasaBreu } from './terreiroBrasaBreu.ts';
import { terreiroBrasaSalao } from './terreiroBrasaSalao.ts';
import { campoAberto } from './campoAberto.ts';
import { ventaniaFunda } from './ventaniaFunda.ts';
import { aldeiaCatavento } from './aldeiaCatavento.ts';
import { lojaCatavento } from './lojaCatavento.ts';
import { benzimentoCatavento } from './benzimentoCatavento.ts';
import { moinhoCatavento } from './moinhoCatavento.ts';
import { topoDoRedemoinho } from './topoDoRedemoinho.ts';
import { terreiroRodamoinho } from './terreiroRodamoinho.ts';

export const MAPAS: Record<string, DefMapa> = {
  vilaAurora,
  casaTaina,
  casaFirmina,
  rotaFoz,
  portoIara,
  lojaPortoIara,
  benzimentoPortoIara,
  terreiroPortoIara,
  igarapeCurupira,
  mataDoCurupira,
  casaEncruzilhada,
  terreiroCurupira,
  trilhaDaBrasa,
  vilaFornalha,
  lojaFornalha,
  benzimentoFornalha,
  forjaFornalha,
  cavernaBoitata,
  cumeeiraBoitata,
  terreiroBrasaPatio,
  terreiroBrasaEscoria,
  terreiroBrasaBreu,
  terreiroBrasaSalao,
  campoAberto,
  ventaniaFunda,
  aldeiaCatavento,
  lojaCatavento,
  benzimentoCatavento,
  moinhoCatavento,
  topoDoRedemoinho,
  terreiroRodamoinho,
};

export const MAPA_INICIAL = 'casaTaina';
