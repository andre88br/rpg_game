/* Regra de design: todo Encantado se reconhece só pela sombra. Cada
   silhueta é recortada, centrada num quadrado e reamostrada em 24×24; a
   sobreposição entre duas (interseção ÷ união) diz o quanto se confundem.
   Da mesma família (uma forma e a evolução dela) pode lembrar, mas tem de
   mudar; de famílias diferentes, tem de ser outra figura. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTE_CRIATURAS } from './creatures.ts';
import { ESPECIES, ESPECIES_ORDEM } from '../data/creatures.ts';
import type { Buf } from '../core/buf.ts';

const LADO = 24;
export const LIMITE_FAMILIA = 0.88;
export const LIMITE_OUTROS = 0.8;

function silhueta(b: Buf): Uint8Array {
  let x0 = b.w, y0 = b.h, x1 = -1, y1 = -1;
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
    if (b.get(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1, lado = Math.max(w, h);
  // centrada na largura e apoiada no chão, como o bicho aparece na luta
  const ox = x0 - (lado - w) / 2, oy = y0 - (lado - h);
  const m = new Uint8Array(LADO * LADO);
  for (let j = 0; j < LADO; j++) for (let i = 0; i < LADO; i++) {
    m[j * LADO + i] = b.get(Math.floor(ox + (i + 0.5) * lado / LADO), Math.floor(oy + (j + 0.5) * lado / LADO)) ? 1 : 0;
  }
  return m;
}

function sobreposicao(a: Uint8Array, b: Uint8Array): number {
  let i = 0, u = 0;
  for (let k = 0; k < a.length; k++) { i += a[k]! & b[k]!; u += a[k]! | b[k]!; }
  return i / u;
}

/* a família de cada espécie: a forma de baixo da linha de evolução */
function familias(): Map<string, string> {
  const de = new Map<string, string>();
  for (const id of ESPECIES_ORDEM) { const e = ESPECIES[id]!.evolui?.em; if (e) de.set(e, id); }
  const raiz = (id: string): string => { let r = id; while (de.has(r)) r = de.get(r)!; return r; };
  return new Map(ESPECIES_ORDEM.map((id) => [id, raiz(id)]));
}

test('todo Encantado se reconhece pela silhueta', () => {
  const fam = familias();
  const sils = ESPECIES_ORDEM.map((id) => [id, silhueta(ARTE_CRIATURAS[ESPECIES[id]!.arte]!())] as const);
  const ruins: string[] = [];
  for (let a = 0; a < sils.length; a++) for (let c = a + 1; c < sils.length; c++) {
    const [ia, sa] = sils[a]!, [ic, sc] = sils[c]!;
    const limite = fam.get(ia) === fam.get(ic) ? LIMITE_FAMILIA : LIMITE_OUTROS;
    const s = sobreposicao(sa, sc);
    if (s >= limite) ruins.push(`${ia} / ${ic}: ${s.toFixed(2)} (limite ${limite})`);
  }
  assert.deepEqual(ruins, [], 'silhuetas parecidas demais');
});
