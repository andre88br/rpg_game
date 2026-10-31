/* =========================================================================
   As dicas da primeira hora: cada controle é ensinado na hora em que serve,
   numa faixa curta que some sozinha, em vez de uma lista de controles
   antes do primeiro passo. Cada dica aparece uma vez na partida (a flag
   `dica_<id>`), na ordem desta lista, uma de cada vez.

   Puro. Teste em dicas.test.ts.
   ========================================================================= */

export interface ContextoDica {
  interior: boolean;          // dentro de casa
  temTime: boolean;           // já tem um Encantado
  pertoDeAlguem: boolean;     // alguém a até dois passos
  noMato: boolean;            // pisando no mato alto
  passosFora: number;         // passos ao ar livre nesta sessão
}

export interface Dica { id: string; texto: string; quando: (c: ContextoDica) => boolean }

export const DICAS: readonly Dica[] = [
  { id: 'falar', texto: 'A: FALAR  (TECLADO: Z OU ENTER)', quando: (c) => c.pertoDeAlguem },
  { id: 'mato', texto: 'NO MATO ALTO APARECEM ENCANTADOS', quando: (c) => c.temTime && c.noMato },
  { id: 'correr', texto: 'SEGURE B PARA CORRER  (TECLADO: X)', quando: (c) => c.temTime && !c.interior },
  { id: 'menu', texto: 'MENU: TIME E MOCHILA  (TECLADO: ESC)', quando: (c) => c.temTime && !c.interior && c.passosFora >= 25 },
];

/* a próxima dica a mostrar agora, ou null */
export function proximaDica(flags: Readonly<Record<string, boolean>>, c: ContextoDica): Dica | null {
  return DICAS.find((d) => !flags[`dica_${d.id}`] && d.quando(c)) ?? null;
}

/* a dica da primeira luta com bicho do mato, enquanto ninguém foi pego —
   duas falas, cada uma cabendo na caixa da batalha */
export const DICA_CAPTURA: readonly string[] = [
  'Dica: bicho do mato só entra no patuá cansado.',
  'Lute um pouco e depois escolha PATUÁ. Com pouca vida, ele entra mais fácil.',
];
