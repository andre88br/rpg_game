/* =========================================================================
   Modo Desafio, escolhido no NOVO JOGO (a flag `desafio`).

   Duas regras a mais, e só elas:
   - quem desmaia é solto ao fim da luta (some do time de vez);
   - em cada lugar, só o PRIMEIRO bicho do mato pode ir para o patuá —
     ganhando, fugindo ou perdendo dele, o lugar fica gasto.
   ========================================================================= */
import { desmaiado, nome, type Encantado } from '../battle/encantado.ts';
import type { EstadoJogo } from './state.ts';

export function emDesafio(e: EstadoJogo): boolean { return e.flags['desafio'] === true; }

/* o primeiro encontro deste lugar ainda vale? */
export function podePrenderAqui(e: EstadoJogo, lugar: string): boolean {
  return !emDesafio(e) || e.flags[`desafio_encontro_${lugar}`] !== true;
}

export function gastarEncontro(e: EstadoJogo, lugar: string): void {
  if (emDesafio(e)) e.flags[`desafio_encontro_${lugar}`] = true;
}

/* tira do time quem desmaiou e devolve os nomes, para a despedida */
export function soltarDesmaiados(e: EstadoJogo): string[] {
  if (!emDesafio(e)) return [];
  let caidos: Encantado[] = e.time.filter((b) => desmaiado(b));
  /* sem mais ninguém em lugar nenhum, o último fica: o jogo não trava */
  if (caidos.length === e.time.length && e.caixa.length === 0) caidos = caidos.slice(1);
  e.time = e.time.filter((b) => !caidos.includes(b));
  /* sem ninguém no time, o primeiro da caixa vem para ele */
  if (e.time.length === 0 && e.caixa.length > 0) e.time.push(e.caixa.shift()!);
  return caidos.map((b) => nome(b));
}
