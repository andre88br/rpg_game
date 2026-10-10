/* O equilíbrio da trilha: alarmes contra os problemas que a revisão achou
   (muro de treino, escada achatada no fim, terreiro sem resposta). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REGIOES } from './mundo.ts';
import { MAPAS } from './mapas/index.ts';
import { ESPECIES, ESPECIES_ORDEM } from './creatures.ts';
import { GOLPES } from './moves.ts';
import { VANTAGENS } from '../battle/typechart.ts';

const nivelMaximo = (ids: readonly string[]) => Math.max(0, ...ids.flatMap((id) =>
  MAPAS[id]!.npcs.flatMap((n) => (n.treinador && !n.treinador.escala ? n.treinador.time.map((c) => c.nivel) : []))));

test('o topo de cada terreiro sobe de região a região, e o campeão fica no 70', () => {
  const topos = REGIOES.map((r) => nivelMaximo(r.mapas.filter((m) => m.startsWith('terreiro'))));
  for (let i = 1; i < topos.length; i++) assert.ok(topos[i]! > topos[i - 1]!, `terreiro ${i + 1}: ${topos[i]} não passa de ${topos[i - 1]}`);
  assert.equal(nivelMaximo(['arenaDourada']), 70);
});

test('todo terreiro tem resposta no mato antes dele (um tipo que bate no dele)', () => {
  const vistas = new Set<string>();
  for (const r of REGIOES) {
    for (const m of r.mapas) for (const f of MAPAS[m]!.encontros ?? []) vistas.add(f.especie);
    if (!r.mapas.some((m) => m.startsWith('terreiro'))) continue;
    const resposta = [...vistas].filter((id) => ESPECIES[id]!.tipos.some((t) => VANTAGENS[t].includes(r.tipo)));
    assert.ok(resposta.length > 0, `terreiro de ${r.tipo}: nenhum selvagem até aqui bate nele`);
  }
});

test('toda forma final soma pelo menos 440 de atributos', () => {
  for (const id of ESPECIES_ORDEM) {
    const e = ESPECIES[id]!;
    if (e.evolui) continue;
    const t = Object.values(e.base).reduce((a, b) => a + b, 0);
    assert.ok(t >= 440, `${id}: ${t}`);
  }
});

test('nenhum golpe próprio de forma final tem recarga (só a Arremetida, que é de todos)', () => {
  for (const g of Object.values(GOLPES)) {
    if (g.efeito?.recarga) assert.equal(g.id, 'arremetida', `${g.id} ainda perde a vez`);
  }
});

test('ninguém evolui depois do 58 (o teto dos treinadores é 70)', () => {
  for (const id of ESPECIES_ORDEM) {
    const ev = ESPECIES[id]!.evolui;
    if (ev) assert.ok(ev.nv <= 58, `${id} evolui no ${ev.nv}`);
  }
});
