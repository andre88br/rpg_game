import { test } from 'node:test';
import assert from 'node:assert/strict';
import { desenhavel } from '../art/font.ts';
import { teclaDeTexto } from '../core/input.ts';
import { LETRAS_NOME, digitarNome } from './personagem.ts';

test('toda letra do teclado do nome a fonte desenha, com acento e Ç', () => {
  for (const l of LETRAS_NOME) assert.ok(desenhavel(l), `a fonte não desenha "${l}"`);
  for (const l of 'ÁÃÂÉÊÍÓÕÔÚÇ') assert.ok(LETRAS_NOME.has(l), `falta "${l}" no teclado`);
});

test('o teclado físico escreve o nome: letra, acento, apagar e Enter', () => {
  const teclas = ['t', 'a', 'i', 'n', 'á', '1', 'Shift', 'Backspace', 'Enter']
    .map(teclaDeTexto).filter((t): t is string => t !== null);
  const r = digitarNome('', teclas);
  assert.equal(r.nome, 'TAIN');
  assert.equal(r.ok, true);
  assert.equal(digitarNome('', ['J', 'O', 'Ã', 'O']).nome, 'JOÃO');
  // não passa de dez letras
  assert.equal(digitarNome('', [...'ABCDEFGHIJKL']).nome.length, 10);
});
