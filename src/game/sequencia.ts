/* =========================================================================
   Ladrilhos de memória.

   Um mapa com `sequencia` tem ladrilhos com símbolos gravados (objetos
   'ladrilho'). Pisar neles na ordem certa liga a flag da sequência; pisar
   fora da ordem zera o progresso — a não ser que o ladrilho errado seja o
   primeiro da ordem, que já conta como recomeço. Pisar de novo no mesmo
   ladrilho que acabou de contar não muda nada (é o jogador parado em cima
   dele, virando).

   Puro. Teste em sequencia.test.ts.
   ========================================================================= */

export interface Passo {
  progresso: number;          // quantos símbolos certos seguidos
  completou: boolean;
  errou: boolean;
}

export function pisarLadrilho(ordem: readonly string[], progresso: number, simbolo: string): Passo {
  if (progresso >= ordem.length) return { progresso, completou: false, errou: false };
  if (ordem[progresso] === simbolo) {
    const p = progresso + 1;
    return { progresso: p, completou: p === ordem.length, errou: false };
  }
  if (progresso > 0 && ordem[progresso - 1] === simbolo) return { progresso, completou: false, errou: false };
  const recomeco = ordem[0] === simbolo ? 1 : 0;
  return { progresso: recomeco, completou: false, errou: progresso > 0 || recomeco === 0 };
}
