/* =========================================================================
   O mato: o passo que vira encontro, e o Sacizinho que foge de quem chega.

   Contas puras sobre o estado e o mapa; a cena do mundo só pede a luta ou
   abre o recado que sai daqui.
   ========================================================================= */
import { DELTAS, direcaoDe } from '../../world/direcao.ts';
import type { Direcao } from '../../art/people.ts';
import type { DefMapa } from '../../world/tilemap.ts';
import type { Aleatorio } from '../../core/rng.ts';
import { sortearSelvagem, type Encantado } from '../../battle/encantado.ts';
import { MAPAS } from '../../data/mapas/index.ts';
import { lugarNoMundo } from '../../data/mundo.ts';
import { talvezRaro } from '../../game/raro.ts';
import { podePrenderAqui } from '../../game/desafio.ts';
import { periodo as periodoAgora, tabelaDoMomento, type Clima, type Periodo } from '../../game/tempo.ts';
import { temTimeEmPe, type EstadoJogo } from '../../game/state.ts';

export type Passo =
  | { k: 'nada' }
  | { k: 'fumoAcabou' }
  | { k: 'luta'; oponente: Encantado; lugar: string; podePrender: boolean };

/* um passo no mato alto: às vezes vira encontro. O Fumo de Rolo gasta um
   pouco a cada passo e, enquanto dura, não deixa bicho nenhum chegar. */
export function passoNoMato(e: EstadoJogo, def: DefMapa, clima: Clima, rnd: Aleatorio,
                            p: Periodo = periodoAgora()): Passo {
  const tabela = def.encontros;
  if (!tabela || tabela.length === 0) return { k: 'nada' };
  if (!temTimeEmPe(e)) return { k: 'nada' };
  if (e.repelente > 0) {
    e.repelente--;
    return e.repelente === 0 ? { k: 'fumoAcabou' } : { k: 'nada' };
  }
  const media = def.passosPorEncontro ?? 10;
  if (!rnd.chance(100 / media)) return { k: 'nada' };

  const agora = tabelaDoMomento(tabela, p, clima);
  const lugar = lugarNoMundo(def.id, MAPAS) ?? def.id;
  return {
    k: 'luta', lugar,
    podePrender: podePrenderAqui(e, lugar),
    oponente: talvezRaro(sortearSelvagem(agora, rnd), e, rnd),
  };
}

/* Para onde o fujão pula: primeiro para longe do jogador, depois de lado;
   nunca para cima dele (quem decide o que está livre é `livre`). Nulo:
   encurralado. */
export function rotaDeFuga(fujao: { tx: number; ty: number }, jogador: { tx: number; ty: number },
                           livre: (x: number, y: number) => boolean): Direcao | null {
  const tentativas: Direcao[] = [];
  const direta = direcaoDe(Math.sign(fujao.tx - jogador.tx), Math.sign(fujao.ty - jogador.ty));
  if (direta) tentativas.push(direta);
  for (const d of ['cima', 'baixo', 'esq', 'dir'] as Direcao[]) if (!tentativas.includes(d)) tentativas.push(d);
  for (const d of tentativas) {
    const [ex, ey] = DELTAS[d];
    const nx = fujao.tx + ex, ny = fujao.ty + ey;
    if (nx === jogador.tx && ny === jogador.ty) continue;
    if (livre(nx, ny)) return d;
  }
  return null;
}
