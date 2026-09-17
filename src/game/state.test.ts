import test from 'node:test';
import assert from 'node:assert/strict';
import { novoJogo, trocarPosicoes, usarItemForaDeBatalha, usavelForaDeBatalha } from './state.ts';
import { criar, desmaiado } from '../battle/encantado.ts';
import { quantidade } from '../data/items.ts';

const comTime = (e: ReturnType<typeof novoJogo>) => {
  e.time = [criar('iarinha', 5), criar('boitatinha', 5)];
  return e;
};

test('trocarPosicoes troca dois Encantados de lugar', () => {
  const e = comTime(novoJogo());
  const [iarinha, boitatinha] = e.time;
  trocarPosicoes(e, 0, 1);
  assert.equal(e.time[0], boitatinha);
  assert.equal(e.time[1], iarinha);
});

test('trocarPosicoes não faz nada com índice fora do time', () => {
  const e = comTime(novoJogo());
  const antes = [...e.time];
  trocarPosicoes(e, 0, 5);
  assert.deepEqual(e.time, antes);
});

test('patuá e itens de serviço não se usam fora de batalha', () => {
  assert.equal(usavelForaDeBatalha('patua'), false);
  assert.equal(usavelForaDeBatalha('carta'), false);
});

test('garrafada, erva-doce e água benta se usam fora de batalha', () => {
  assert.equal(usavelForaDeBatalha('garrafada'), true);
  assert.equal(usavelForaDeBatalha('erva_doce'), true);
  assert.equal(usavelForaDeBatalha('agua_benta'), true);
});

test('garrafada cura fora de batalha e consome o item', () => {
  const e = comTime(novoJogo());
  e.mochila['garrafada'] = 1;
  e.time[0]!.hp = 1;
  const r = usarItemForaDeBatalha(e, 'garrafada', 0);
  assert.equal(r.usou, true);
  assert.ok(e.time[0]!.hp > 1);
  assert.equal(quantidade(e.mochila, 'garrafada'), 0);
});

test('garrafada em quem desmaiou não adianta nada e não gasta o item', () => {
  const e = comTime(novoJogo());
  e.mochila['garrafada'] = 1;
  e.time[0]!.hp = 0;
  const r = usarItemForaDeBatalha(e, 'garrafada', 0);
  assert.equal(r.usou, false);
  assert.equal(quantidade(e.mochila, 'garrafada'), 1);
});

test('água benta revive fora de batalha', () => {
  const e = comTime(novoJogo());
  e.mochila['agua_benta'] = 1;
  e.time[0]!.hp = 0;
  assert.equal(desmaiado(e.time[0]!), true);
  const r = usarItemForaDeBatalha(e, 'agua_benta', 0);
  assert.equal(r.usou, true);
  assert.equal(desmaiado(e.time[0]!), false);
});

test('sem item na mochila, usarItemForaDeBatalha não gasta o que não existe', () => {
  const e = comTime(novoJogo());
  delete e.mochila['garrafada'];
  e.time[0]!.hp = 1;
  const r = usarItemForaDeBatalha(e, 'garrafada', 0);
  assert.equal(r.usou, false);
});
