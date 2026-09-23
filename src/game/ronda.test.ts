import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avista, proximoDaRonda } from './ronda.ts';

const parede = new Set(['5,0']);
const solido = (x: number, y: number) => parede.has(`${x},${y}`);

test('o vigia vê em linha reta, só para a frente', () => {
  assert.equal(avista({ tx: 0, ty: 0 }, 'dir', 4, { tx: 3, ty: 0 }, solido), true);
  assert.equal(avista({ tx: 0, ty: 0 }, 'dir', 2, { tx: 3, ty: 0 }, solido), false, 'longe demais');
  assert.equal(avista({ tx: 0, ty: 0 }, 'esq', 4, { tx: 3, ty: 0 }, solido), false, 'de costas');
  assert.equal(avista({ tx: 0, ty: 0 }, 'dir', 4, { tx: 3, ty: 1 }, solido), false, 'fora da linha');
});

test('parede corta a visão', () => {
  assert.equal(avista({ tx: 0, ty: 0 }, 'dir', 9, { tx: 7, ty: 0 }, solido), false);
});

test('a ronda dá a volta no fim do caminho', () => {
  assert.equal(proximoDaRonda(4, 3), 0);
  assert.equal(proximoDaRonda(4, 1), 2);
});
