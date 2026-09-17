/* =========================================================================
   Estado da partida: o que é SEU e atravessa cenas, mapas e batalhas.

   A cena de mundo e a de batalha mexem nas MESMAS referências de Encantado,
   então o HP perdido numa luta continua perdido ao voltar para o mapa — sem
   nenhum trabalho de sincronização.
   ========================================================================= */
import { criar, curarTudo, desmaiado, type Encantado } from '../battle/encantado.ts';
import { adicionar, type Mochila } from '../data/items.ts';
import type { Direcao } from '../art/people.ts';
import { MAPAS, MAPA_INICIAL } from '../data/mapas/index.ts';

export const TAMANHO_TIME = 6;

/* onde o jogador está, ou onde ele acorda depois de apagar */
export interface Lugar { mapa: string; tx: number; ty: number; dir: Direcao }

export interface EstadoJogo {
  nome: string;
  posicao: Lugar;
  refugio: Lugar;
  time: Encantado[];
  caixa: Encantado[];               // o que não coube no time
  mochila: Mochila;
  dinheiro: number;
  medalhas: string[];
  flags: Record<string, boolean>;
  vistos: string[];                 // espécies já encontradas
  capturados: string[];             // espécies já presas num patuá
}

/* Time provisório da Fase 2.
   Na Fase 3 quem entrega o inicial é a Dona Firmina, em Vila Aurora, e este
   bloco sai daqui. Por ora começamos com dois para dar o que trocar em
   batalha e um punhado de itens para testar captura e cura. */
export function novoJogo(nome = 'TAINÁ'): EstadoJogo {
  const inicio = MAPAS[MAPA_INICIAL]!.inicio;
  const lugar = (): Lugar => ({ mapa: MAPA_INICIAL, ...inicio });
  const est: EstadoJogo = {
    nome,
    posicao: lugar(),
    refugio: lugar(),
    time: [criar('iarinha', 5), criar('boitatinha', 5)],
    caixa: [],
    mochila: {},
    dinheiro: 3000,
    medalhas: [],
    flags: {},
    vistos: [],
    capturados: [],
  };
  adicionar(est.mochila, 'patua', 10);
  adicionar(est.mochila, 'garrafada', 5);
  adicionar(est.mochila, 'erva_doce', 2);
  return est;
}

export function timeEmPe(e: EstadoJogo): Encantado[] {
  return e.time.filter((c) => !desmaiado(c));
}

export function temTimeEmPe(e: EstadoJogo): boolean {
  return e.time.some((c) => !desmaiado(c));
}

export function curarTime(e: EstadoJogo): void {
  for (const c of e.time) curarTudo(c);
}

/* Entra no time se houver vaga; senão vai para a caixa.
   Devolve true quando entrou no time. */
export function guardar(e: EstadoJogo, bicho: Encantado): boolean {
  registrar(e, bicho.especie, true);
  if (e.time.length < TAMANHO_TIME) { e.time.push(bicho); return true; }
  e.caixa.push(bicho);
  return false;
}

export function registrar(e: EstadoJogo, especie: string, capturado = false): void {
  if (!e.vistos.includes(especie)) e.vistos.push(especie);
  if (capturado && !e.capturados.includes(especie)) e.capturados.push(especie);
}

export function ligar(e: EstadoJogo, flag: string): void { e.flags[flag] = true; }
export function tem(e: EstadoJogo, flag: string): boolean { return e.flags[flag] === true; }
