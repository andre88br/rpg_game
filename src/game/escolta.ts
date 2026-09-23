/* =========================================================================
   Escolta: alguém que anda atrás do jogador.

   Uma escolta é só flag. Enquanto `flag` estiver ligada e `fim` não, a
   cena do mundo desenha o escoltado um passo atrás do jogador, em qualquer
   mapa, atravessando portas junto — e quem espera por ele (a mãe, no
   arraial) tem uma fala `se: flag` que liga `fim` e desliga `flag`. Se o
   time apagar no caminho, a escolta cai: `flag` desliga e o escoltado volta
   para onde estava (o NPC original tem `seNao: [flag, fim]`).

   Puro. Teste em escolta.test.ts.
   ========================================================================= */
import type { EstadoJogo } from './state.ts';

export interface DefEscolta {
  id: string;
  nome: string;
  estilo: string;            // chave em ESTILOS (src/art/people.ts)
  flag: string;              // ligada enquanto ele anda com você
  fim: string;               // ligada quando ele chegou aonde devia
  /* o que se ouve quando a escolta cai porque o time apagou */
  aoFalhar: string;
}

export const ESCOLTAS: readonly DefEscolta[] = [
  {
    id: 'menino_mina', nome: 'TUCO', estilo: 'crianca',
    flag: 'escoltando_menino', fim: 'menino_salvo',
    aoFalhar: 'O Tuco se assustou quando você caiu e correu de volta pro fundo da mina.',
  },
];

export function escoltaAtiva(e: EstadoJogo): DefEscolta | null {
  return ESCOLTAS.find((d) => e.flags[d.flag] === true && e.flags[d.fim] !== true) ?? null;
}

/* o time apagou: a escolta em andamento cai. Devolve quem caiu, para a cena
   dizer o recado. */
export function derrubarEscolta(e: EstadoJogo): DefEscolta | null {
  const d = escoltaAtiva(e);
  if (d) delete e.flags[d.flag];
  return d;
}
