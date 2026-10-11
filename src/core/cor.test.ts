import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clarear, escurecer, misturar } from './cor.ts';

test('misturar vai de uma cor à outra e segura o t', () => {
  assert.equal(misturar('#000000', '#ffffff', 0), '#000000');
  assert.equal(misturar('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(misturar('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(misturar('#102030', '#ffffff', -3), '#102030');
  assert.equal(misturar('#102030', '#ffffff', 9), '#ffffff');
});

test('clarear e escurecer não passam dos limites', () => {
  assert.equal(clarear('#f0f0f0', 50), '#ffffff');
  assert.equal(clarear('#102030', 45), '#3d4d5d');
  assert.equal(escurecer('#ff8000', 0.5), '#804000');
  assert.equal(escurecer('#123456', 1), '#123456');
});
