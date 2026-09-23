import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pisarLadrilho } from './sequencia.ts';

const ORDEM = ['lua', 'coruja', 'gato', 'vela'];

test('na ordem certa, a sequência completa no último ladrilho', () => {
  let p = 0;
  for (const [i, s] of ORDEM.entries()) {
    const r = pisarLadrilho(ORDEM, p, s);
    assert.equal(r.errou, false);
    assert.equal(r.completou, i === ORDEM.length - 1);
    p = r.progresso;
  }
  assert.equal(p, 4);
});

test('fora da ordem zera, e o primeiro símbolo já conta como recomeço', () => {
  assert.deepEqual(pisarLadrilho(ORDEM, 2, 'vela'), { progresso: 0, completou: false, errou: true });
  assert.deepEqual(pisarLadrilho(ORDEM, 2, 'lua'), { progresso: 1, completou: false, errou: true });
  assert.deepEqual(pisarLadrilho(ORDEM, 0, 'gato'), { progresso: 0, completou: false, errou: true });
});

test('pisar de novo no ladrilho que acabou de contar não muda nada', () => {
  assert.deepEqual(pisarLadrilho(ORDEM, 2, 'coruja'), { progresso: 2, completou: false, errou: false });
});
