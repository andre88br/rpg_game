import test from 'node:test';
import assert from 'node:assert/strict';
import { novoJogo } from './state.ts';
import { adicionar } from '../data/items.ts';
import { raioDaLuz, RAIO_SEM_LUZ, RAIO_CANDEIA, RAIO_TOCHA } from './luz.ts';

test('sem candeia nem Dom Tocha, o raio é o mínimo', () => {
  const e = novoJogo();
  assert.equal(raioDaLuz(e), RAIO_SEM_LUZ);
});

test('a candeia no bolso aumenta o raio', () => {
  const e = novoJogo();
  adicionar(e.mochila, 'candeia');
  assert.equal(raioDaLuz(e), RAIO_CANDEIA);
});

test('o Dom Tocha vale mais que a candeia, mesmo com as duas', () => {
  const e = novoJogo();
  adicionar(e.mochila, 'candeia');
  e.flags['dom_tocha'] = true;
  assert.equal(raioDaLuz(e), RAIO_TOCHA);
});

test('o Dom Visão Noturna enxerga mais longe que a Tocha', async () => {
  const { raioDaLuz, RAIO_TOCHA, RAIO_VISAO } = await import('./luz.ts');
  const { novoJogo } = await import('./state.ts');
  const e = novoJogo();
  e.flags['dom_tocha'] = true;
  assert.equal(raioDaLuz(e), RAIO_TOCHA);
  e.flags['dom_visao'] = true;
  assert.equal(raioDaLuz(e), RAIO_VISAO);
  assert.ok(RAIO_VISAO > RAIO_TOCHA);
});
