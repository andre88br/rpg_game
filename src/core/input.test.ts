/* A entrada sem DOM: as contas puras do direcional de toque e do texto. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { direcaoDoToque } from './input.ts';

test('o direcional de toque aponta pelo eixo que mais se afastou do centro', () => {
  assert.equal(direcaoDoToque(0, -40, 69), 'cima');
  assert.equal(direcaoDoToque(-40, 10, 69), 'esq');
  assert.equal(direcaoDoToque(30, 29, 69), 'dir');
  assert.equal(direcaoDoToque(2, 3, 69), null);           // o miolo não aponta
  assert.equal(direcaoDoToque(0, 300, 69), 'baixo');      // escorregou pra fora: vale
});

test('a tecla própria ganha das de sempre, que continuam valendo', async () => {
  const { acaoDaTecla } = await import('./input.ts');
  assert.equal(acaoDaTecla('KeyZ', {}), 'a');
  assert.equal(acaoDaTecla('KeyX', { a: 'KeyX' }), 'a');      // X agora confirma
  assert.equal(acaoDaTecla('Enter', { a: 'KeyX' }), 'a');     // e o Enter ainda também
  assert.equal(acaoDaTecla('KeyQ', {}), null);
});

test('o controle de videogame: botões e analógico viram ações', async () => {
  const { acoesDoControle } = await import('./input.ts');
  const botoes = (...ligados: number[]) => Array.from({ length: 17 }, (_, i) => ligados.includes(i));
  assert.deepEqual([...acoesDoControle(botoes(0), [0, 0])], ['a']);
  assert.deepEqual([...acoesDoControle(botoes(1), [0, 0])], ['b']);
  assert.deepEqual([...acoesDoControle(botoes(9), [0, 0])], ['menu']);
  assert.deepEqual([...acoesDoControle(botoes(12), [0, 0])], ['cima']);
  assert.deepEqual([...acoesDoControle(botoes(), [-0.9, 0.1])], ['esq']);
  assert.equal(acoesDoControle(botoes(), [0.3, -0.3]).size, 0, 'zona morta do analógico');
});

test('teclado no modo texto: letra com acento vira maiúscula, o resto não', async () => {
  const { teclaDeTexto } = await import('./input.ts');
  assert.equal(teclaDeTexto('ã'), 'Ã');
  assert.equal(teclaDeTexto('w'), 'W');
  assert.equal(teclaDeTexto('ArrowUp'), null);
  assert.equal(teclaDeTexto('Backspace'), '\b');
});
