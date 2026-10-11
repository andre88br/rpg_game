/* =========================================================================
   Contas de cor em '#rrggbb' — uma vez só. Antes cada tela tinha a sua
   cópia de "misturar" e de "clarear", e uma delas não segurava o t entre 0
   e 1. Todas as contas aqui seguram.
   ========================================================================= */

function canais(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexDe(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/* de `a` (t = 0) até `b` (t = 1), em linha reta em cada canal */
export function misturar(a: string, b: string, t: number): string {
  t = Math.max(0, Math.min(1, t));
  const [ar, ag, ab] = canais(a), [br, bg, bb] = canais(b);
  return hexDe(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/* soma `quanto` a cada canal, sem passar de 255 */
export function clarear(hex: string, quanto: number): string {
  const [r, g, b] = canais(hex);
  return hexDe(r + quanto, g + quanto, b + quanto);
}

/* multiplica cada canal por `k` (0..1 escurece) */
export function escurecer(hex: string, k: number): string {
  const [r, g, b] = canais(hex);
  return hexDe(r * k, g * k, b * k);
}
