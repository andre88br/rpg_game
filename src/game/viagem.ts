/* =========================================================================
   A Canoa Encantada: viagem rápida para o benzimento de uma cidade onde já
   se esteve.

   Puro: recebe os mapas e o estado. Quem chega cai no `inicio` do abrigo da
   cidade (o benzimento, ou a casa que faz as vezes dele), já de pé lá dentro.
   A lista de cidades visitadas sai das flags `visitou_<lugar>` que o mundo já
   liga — nada novo no save.
   ========================================================================= */
import type { DefMapa } from '../world/tilemap.ts';
import type { Direcao } from '../art/people.ts';
import { CIDADES, POSICOES, lugarNoMundo } from '../data/mundo.ts';
import type { EstadoJogo } from './state.ts';
import { escoltaAtiva } from './escolta.ts';

export interface Chegada { mapa: string; tx: number; ty: number; dir: Direcao }

/* cidade → o mapa-abrigo (refugio) que fica nela */
export function abrigos(mapas: Record<string, DefMapa>): Map<string, string> {
  const r = new Map<string, string>();
  for (const [id, def] of Object.entries(mapas)) {
    if (!def.refugio) continue;
    const lugar = lugarNoMundo(id, mapas);
    if (lugar && CIDADES.has(lugar) && !r.has(lugar)) r.set(lugar, id);
  }
  return r;
}

/* as cidades para onde a canoa leva, na ordem da grade do mapa-múndi */
export function destinosDaCanoa(e: EstadoJogo, mapas: Record<string, DefMapa>,
                                aqui: string | null): string[] {
  const tem = abrigos(mapas);
  return [...CIDADES]
    .filter((c) => c !== aqui && tem.has(c) && e.flags[`visitou_${c}`] === true)
    .sort((a, b) => (POSICOES[a]?.[0] ?? 0) - (POSICOES[b]?.[0] ?? 0)
                 || (POSICOES[a]?.[1] ?? 0) - (POSICOES[b]?.[1] ?? 0));
}

export function chegada(cidade: string, mapas: Record<string, DefMapa>): Chegada | null {
  const id = abrigos(mapas).get(cidade);
  if (!id) return null;
  const i = mapas[id]!.inicio;
  return { mapa: id, tx: i.tx, ty: i.ty, dir: i.dir };
}

/* por que não dá para remar agora — ou null, se dá */
export function motivoParaNaoViajar(e: EstadoJogo, ctx: { correndo: boolean; destinos: number }): string | null {
  if (escoltaAtiva(e)) return 'Quem você está levando não cabe na canoa.';
  if (ctx.correndo) return 'Agora não dá: o tempo está correndo!';
  if (ctx.destinos === 0) return 'A canoa só leva para onde você já esteve.';
  return null;
}
