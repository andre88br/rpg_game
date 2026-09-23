/* =========================================================================
   Corrida contra o sol.

   Uma corrida começa quando uma fala liga a flag `ativa` dela; a partir
   daí um relógio corre, na tela, e cada marco (flag) aceso conta. Todos
   acesos antes do fim: liga `conta` e desliga `ativa`. O tempo acabou:
   desliga `ativa` e todos os marcos — recomeça do zero, falando de novo.
   O relógio não vai para o save: quem carrega um jogo com a corrida ativa
   perde a corrida (e os marcos), sem nunca travar nada.

   Puro. Teste em corrida.test.ts.
   ========================================================================= */

export interface DefCorrida {
  ativa: string;               // flag ligada por quem dá a largada
  marcos: readonly string[];   // flags acesas no caminho
  conta: string;               // flag ligada quando todos acendem a tempo
  segundos: number;
  fim: string;                 // o que se ouve quando o tempo acaba
}

export type Resultado = 'correndo' | 'venceu' | 'perdeu' | 'parada';

/* decide, a cada quadro, o que acontece; quem aplica é a cena */
export function avaliarCorrida(c: DefCorrida, flags: Record<string, boolean>, restante: number | null): Resultado {
  if (flags[c.ativa] !== true) return 'parada';
  if (c.marcos.every((m) => flags[m] === true)) return 'venceu';
  if (restante !== null && restante <= 0) return 'perdeu';
  return 'correndo';
}

export function encerrar(c: DefCorrida, flags: Record<string, boolean>, venceu: boolean): void {
  delete flags[c.ativa];
  if (venceu) { flags[c.conta] = true; return; }
  for (const m of c.marcos) delete flags[m];
}
