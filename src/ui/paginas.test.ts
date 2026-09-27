import { test } from 'node:test';
import assert from 'node:assert/strict';
import { empaginar } from './paginas.ts';

test('frase que cabe no resto da página continua nela', () => {
  assert.deepEqual(empaginar([['a'], ['b', 'c']]), ['a', 'b', 'c']);
});

test('frase que não cabe começa na página seguinte', () => {
  assert.deepEqual(empaginar([['a', 'b'], ['c', 'd']]), ['a', 'b', '', 'c', 'd']);
});

test('frase maior que uma página quebra do jeito que der', () => {
  assert.deepEqual(empaginar([['a'], ['b', 'c', 'd', 'e']]), ['a', '', '', 'b', 'c', 'd', 'e']);
});
