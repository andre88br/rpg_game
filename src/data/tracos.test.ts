import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACOS_ORDEM, TRACO_DA_ESPECIE, traco, tracoDaEspecie } from './tracos.ts';
import { ESPECIES_ORDEM, especie } from './creatures.ts';
import { item } from './items.ts';
import { larguraTexto, quebrar } from '../art/font.ts';

test('toda espécie tem um traço que existe', () => {
  for (const id of ESPECIES_ORDEM) assert.ok(tracoDaEspecie(id), id);
  for (const id of Object.keys(TRACO_DA_ESPECIE)) assert.ok(ESPECIES_ORDEM.includes(id), `sobrou ${id}`);
});

test('todo traço é de alguém', () => {
  const usados = new Set(Object.values(TRACO_DA_ESPECIE));
  for (const id of TRACOS_ORDEM) assert.ok(usados.has(id), `${id} não é de ninguém`);
});

test('a linha de evolução divide o traço', () => {
  for (const id of ESPECIES_ORDEM) {
    const ev = especie(id).evolui;
    if (ev) assert.equal(TRACO_DA_ESPECIE[ev.em], TRACO_DA_ESPECIE[id], `${id} → ${ev.em}`);
  }
});

test('nome e descrição cabem no Caderno, e os itens achados existem', () => {
  for (const id of TRACOS_ORDEM) {
    const t = traco(id);
    assert.ok(larguraTexto(t.nome.toUpperCase()) <= 112, t.nome);
    assert.ok(quebrar(t.descricao, 112).length <= 5, t.descricao);
    for (const i of t.achado?.itens ?? []) assert.ok(item(i), i);
  }
});
