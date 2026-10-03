/* =========================================================================
   A hora do dia, tirada do relógio do aparelho.

   Por enquanto só diz se é noite (das 18h às 6h) — é o que a Lua Cheia do
   Lobinho e as Fases da Lua do Jaci leem na batalha. Os testes passam a data.
   ========================================================================= */

export function ehNoite(d: Date = new Date()): boolean {
  const h = d.getHours();
  return h >= 18 || h < 6;
}
