import test from 'node:test';
import assert from 'node:assert/strict';
import { eficacia, fraseEficacia, VANTAGENS } from './typechart.ts';
import { TIPOS_ORDEM } from '../art/palette.ts';

test('o triângulo fogo → planta → água fecha', () => {
  assert.equal(eficacia('fogo', ['planta']), 2);
  assert.equal(eficacia('planta', ['agua']), 2);
  assert.equal(eficacia('agua', ['fogo']), 2);
});

test('o triângulo terra → raio → vento fecha', () => {
  assert.equal(eficacia('terra', ['raio']), 2);
  assert.equal(eficacia('raio', ['vento']), 2);
  assert.equal(eficacia('vento', ['terra']), 2);
});

test('luz e sombra são super eficazes uma contra a outra', () => {
  assert.equal(eficacia('luz', ['sombra']), 2);
  assert.equal(eficacia('sombra', ['luz']), 2);
});

test('o sentido contrário da seta é resistência (½×); Luz e Sombra não resistem', () => {
  assert.equal(eficacia('planta', ['fogo']), 0.5);
  assert.equal(eficacia('fogo', ['agua']), 0.5);
  assert.equal(eficacia('agua', ['planta']), 0.5);
  assert.equal(eficacia('vento', ['raio']), 0.5);
  assert.equal(eficacia('raio', ['terra']), 0.5);
  assert.equal(eficacia('terra', ['vento']), 0.5);
  assert.equal(eficacia('luz', ['sombra']), 2);
  assert.equal(eficacia('sombra', ['luz']), 2);
  assert.equal(fraseEficacia(0.5), 'Não foi muito eficaz...');
});

test('golpe neutro nunca tem vantagem contra ninguém', () => {
  for (const t of TIPOS_ORDEM) assert.equal(eficacia('neutro', [t]), 1);
});

test('nenhum tipo é super eficaz contra si mesmo', () => {
  for (const t of TIPOS_ORDEM) assert.equal(eficacia(t, [t]), 1);
});

test('contra dois tipos os multiplicadores se multiplicam', () => {
  // Fogo bate em Planta e Água resiste a Fogo: 2 × ½ = 1
  assert.equal(eficacia('fogo', ['planta', 'agua']), 1);
  assert.equal(eficacia('fogo', ['planta', 'terra']), 2);
  // ninguém neste jogo é fraco duas vezes ao mesmo tipo, mas a conta aguenta
  assert.equal(eficacia('fogo', ['planta', 'planta']), 4);
  assert.equal(eficacia('luz', ['agua', 'fogo']), 1);
});

test('cada tipo tem exatamente uma vantagem', () => {
  for (const t of TIPOS_ORDEM) assert.equal(VANTAGENS[t].length, 1);
  assert.equal(VANTAGENS.neutro.length, 0);
});

test('a frase só aparece quando é super eficaz', () => {
  assert.equal(fraseEficacia(1), null);
  assert.equal(fraseEficacia(2), 'É super eficaz!');
  assert.equal(fraseEficacia(4), 'Foi devastador!');
});
