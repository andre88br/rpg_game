/* =========================================================================
   Páginas da caixa de diálogo: a caixa mostra 3 linhas por vez. Uma frase
   que não cabe no que sobrou da página começa na página seguinte, em vez de
   ficar cortada no meio (o resto da página fica em branco). Frase maior que
   uma página inteira continua quebrando, porque não tem outro jeito.

   Puro. Teste em paginas.test.ts.
   ========================================================================= */
export const LINHAS_POR_PAGINA = 3;

/* recebe cada frase já quebrada em linhas; devolve a lista corrida de
   linhas, com linhas vazias onde uma frase pulou para a página seguinte */
export function empaginar(frases: readonly (readonly string[])[], porPagina = LINHAS_POR_PAGINA): string[] {
  const saida: string[] = [];
  for (const frase of frases) {
    const usadas = saida.length % porPagina;
    if (usadas > 0 && usadas + frase.length > porPagina) {
      while (saida.length % porPagina !== 0) saida.push('');
    }
    saida.push(...frase);
  }
  return saida;
}
