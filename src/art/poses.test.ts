import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTE_CRIATURAS, naPose, poseNaLuta } from './creatures.ts';

const igual = (a: { d: readonly (string | null)[] }, b: { d: readonly (string | null)[] }) =>
  a.d.length === b.d.length && a.d.every((c, i) => c === b.d[i]);

test('todo Encantado muda de cara ao piscar, apanhar, atacar e desmaiar', () => {
  for (const [id, desenhar] of Object.entries(ARTE_CRIATURAS)) {
    const normal = desenhar();
    for (const p of ['pisca', 'ataque', 'dano', 'desmaio'] as const) {
      assert.ok(!igual(naPose(desenhar, p), normal), `${id}: a pose ${p} não muda nada`);
    }
    // e a pose não vaza para o próximo desenho
    assert.ok(igual(desenhar(), normal), `${id}: ficou preso numa pose`);
  }
});

test('a pose da luta: desmaio, dano e ataque mandam; parado, pisca de vez em quando', () => {
  const parado = { caido: false, avanco: 0, tremor: 0 };
  assert.equal(poseNaLuta({ ...parado, caido: true, tremor: 0.2 }, 0), 'desmaio');
  assert.equal(poseNaLuta({ ...parado, tremor: 0.2, avanco: 0.1 }, 1), 'dano');
  assert.equal(poseNaLuta({ ...parado, avanco: 0.1 }, 1), 'ataque');
  let piscadas = 0;
  for (let t = 0; t < 34; t += 0.01) if (poseNaLuta(parado, t) === 'pisca') piscadas++;
  assert.ok(piscadas > 0 && piscadas < 3400 * 0.1, `pisca pouco, mas pisca (${piscadas})`);
});
