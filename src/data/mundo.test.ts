import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from './mapas/index.ts';
import { ITENS } from './items.ts';
import {
  COLUNAS, LINHAS, POSICOES, REGIOES, conhecido, estradas, itemMapaDaRegiao, lugarNoMundo, regiaoDoMapa,
} from './mundo.ts';

test('todo mapa do jogo pertence a exatamente uma região', () => {
  for (const id of Object.keys(MAPAS)) {
    const donas = REGIOES.filter((r) => r.mapas.includes(id));
    assert.equal(donas.length, 1, `${id} está em ${donas.length} regiões`);
  }
  for (const r of REGIOES) for (const id of r.mapas) assert.ok(MAPAS[id], `${r.nome}: mapa "${id}" não existe`);
});

test('todo lugar ao ar livre tem casinha no mapa do mundo, e só eles', () => {
  const usadas = new Set<string>();
  for (const [id, def] of Object.entries(MAPAS)) {
    const p = POSICOES[id];
    if (def.interior) { assert.equal(p, undefined, `${id} é interior e tem casinha`); continue; }
    assert.ok(p, `${id} não tem casinha no mapa do mundo`);
    assert.ok(p![0] >= 0 && p![0] < COLUNAS && p![1] >= 0 && p![1] < LINHAS, `${id} fora da grade`);
    const k = p!.join(',');
    assert.ok(!usadas.has(k), `duas casinhas em ${k}`);
    usadas.add(k);
  }
});

test('toda estrada é reta na grade, e todo mapa cai em algum lugar do mundo', () => {
  for (const [a, b] of estradas(MAPAS)) {
    const [ax, ay] = POSICOES[a]!, [bx, by] = POSICOES[b]!;
    assert.ok(ax === bx || ay === by, `a estrada ${a}—${b} é torta`);
  }
  for (const id of Object.keys(MAPAS)) assert.ok(lugarNoMundo(id, MAPAS), `${id} não leva a lugar nenhum`);
  assert.equal(lugarNoMundo('casaFirmina', MAPAS), 'vilaAurora');
  assert.equal(lugarNoMundo('terreiroBrasaSalao', MAPAS), 'vilaFornalha');
});

test('cada região tem o seu item de mapa', () => {
  for (const r of REGIOES) assert.ok(ITENS[itemMapaDaRegiao(r)], `falta o item ${itemMapaDaRegiao(r)}`);
  assert.ok(ITENS['mapa']);
});

test('conhecer um lugar: pisou, ganhou a medalha da região, ou está nele', () => {
  assert.equal(conhecido({}, [], null, 'portoIara'), false);
  assert.equal(conhecido({ visitou_portoIara: true }, [], null, 'portoIara'), true);
  assert.equal(conhecido({}, ['mare'], null, 'portoIara'), true, 'save antigo com a Maré conhece a Foz');
  assert.equal(conhecido({}, [], 'portoIara', 'portoIara'), true);
  assert.equal(regiaoDoMapa('portoIara')?.tipo, 'agua');
});
