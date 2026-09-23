import { test } from 'node:test';
import assert from 'node:assert/strict';
import { andarNaMochila, paginasDaMochila, ITENS_POR_PAGINA } from './listas.ts';

test('a mochila vai em páginas de seis', () => {
  assert.equal(ITENS_POR_PAGINA, 6);
  assert.equal(paginasDaMochila(0), 1);
  assert.equal(paginasDaMochila(6), 1);
  assert.equal(paginasDaMochila(7), 2);
  assert.equal(paginasDaMochila(13), 3);
});

test('cima e baixo andam item a item, virando a página na ponta', () => {
  assert.equal(andarNaMochila(5, 13, 'baixo'), 6);   // da página 1 para a 2
  assert.equal(andarNaMochila(6, 13, 'cima'), 5);
  assert.equal(andarNaMochila(12, 13, 'baixo'), 0);  // dá a volta
  assert.equal(andarNaMochila(0, 13, 'cima'), 12);
});

test('esquerda e direita pulam uma página, na mesma linha', () => {
  assert.equal(andarNaMochila(2, 13, 'dir'), 8);
  assert.equal(andarNaMochila(8, 13, 'esq'), 2);
  // a última página é mais curta: a linha cai no último item
  assert.equal(andarNaMochila(10, 13, 'dir'), 12);
  // e da última volta para a primeira
  assert.equal(andarNaMochila(12, 13, 'dir'), 0);
  assert.equal(andarNaMochila(1, 13, 'esq'), 12);
  // com uma página só, os lados não mexem
  assert.equal(andarNaMochila(3, 5, 'dir'), 3);
  assert.equal(andarNaMochila(0, 0, 'dir'), 0);
});
