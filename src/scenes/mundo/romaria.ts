/* =========================================================================
   A Romaria do Círculo, do lado do mundo: quem é o próximo romeiro, e o
   que acontece com a sequência quando a luta acaba. As regras (nível,
   fichas, benzedura) moram em game/romaria.ts; aqui só se aplicam.
   ========================================================================= */
import type { Aleatorio } from '../../core/rng.ts';
import type { Encantado } from '../../battle/encantado.ts';
import type { Resultado } from '../../battle/engine.ts';
import { adicionar } from '../../data/items.ts';
import { BENZE_A_CADA, fichasDaVitoria, gerarRomeiro, nivelDaRomaria } from '../../game/romaria.ts';
import { curarTime, type EstadoJogo } from '../../game/state.ts';

export function proximoRomeiro(e: EstadoJogo, rnd: Aleatorio): { nome: string; time: Encantado[] } {
  return gerarRomeiro(rnd, nivelDaRomaria(e), e.romaria.seq);
}

/* aplica o fim de uma luta da Romaria e devolve o que o Mestre diz */
export function fimDaRomaria(e: EstadoJogo, r: Resultado): string[] {
  const ro = e.romaria;
  if (r !== 'vitoria') {
    const fez = ro.seq;
    ro.seq = 0;
    return [`A romaria acabou em ${fez} vitória${fez === 1 ? '' : 's'}. O recorde é ${ro.recorde}.`];
  }
  ro.seq++;
  ro.recorde = Math.max(ro.recorde, ro.seq);
  const f = fichasDaVitoria(ro.seq);
  adicionar(e.mochila, 'ficha_romaria', f);
  const linhas = [`${ro.seq} vitória${ro.seq > 1 ? 's' : ''} seguida${ro.seq > 1 ? 's' : ''}! ${f} ficha${f > 1 ? 's' : ''} para você.`];
  if (ro.seq % BENZE_A_CADA === 0) {
    curarTime(e);
    linhas.push(`${BENZE_A_CADA} de uma vez: benzi o seu time. A romaria segue!`);
  }
  return linhas;
}
