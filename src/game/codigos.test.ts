import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CODIGOS, DONS, LeitorCodigos, MEDALHAS, PULOS, aplicarPulo, type Codigo, type Pulo } from './codigos.ts';
import type { Acao } from '../core/input.ts';
import { novoJogo } from './state.ts';
import { quantidade } from '../data/items.ts';
import { MAPAS } from '../data/mapas/index.ts';

test('nenhum código é sufixo de outro: só um dispara por vez', () => {
  const todos = Object.entries(CODIGOS);
  for (const [a, ca] of todos) {
    for (const [b, cb] of todos) {
      if (a === b || cb.length > ca.length) continue;
      const cauda = ca.slice(ca.length - cb.length);
      assert.ok(!cb.every((x, i) => cauda[i] === x), `${b} é sufixo de ${a}`);
    }
  }
});

test('o leitor reconhece cada código, mesmo depois de botões soltos', () => {
  for (const [id, codigo] of Object.entries(CODIGOS) as [Codigo, readonly Acao[]][]) {
    const l = new LeitorCodigos();
    assert.equal(l.ler(['esq', 'a', 'b']), null);
    let achou: Codigo | null = null;
    for (const a of codigo) achou = l.ler([a]) ?? achou;
    assert.equal(achou, id);
  }
});

test('depois de bater, o buffer zera: o último A não dispara de novo', () => {
  const l = new LeitorCodigos();
  for (const a of CODIGOS.evoluir) l.ler([a]);
  assert.equal(l.ler(['a']), null);
});

test('todo pulo leva a um mapa que existe', () => {
  for (const [id, p] of Object.entries(PULOS)) assert.ok(MAPAS[p.destino], `${id}: ${p.destino}`);
});

test('o pulo entrega as medalhas e os Dons das regiões anteriores, e nada além', () => {
  const ordem: Pulo[] = ['regiao2', 'regiao3', 'regiao4', 'regiao5', 'regiao6', 'regiao7', 'regiao8', 'torneio'];
  ordem.forEach((pulo, i) => {
    const e = novoJogo();
    aplicarPulo(e, pulo);
    assert.deepEqual(e.medalhas, MEDALHAS.slice(0, i + 1));
    for (const [j, d] of DONS.entries()) assert.equal(e.flags[`dom_${d}`] === true, j <= i, `${pulo}: dom_${d}`);
    assert.equal(e.time.length, 1);
    assert.equal(e.flags['inicial_curupinho'], true);
  });
});

test('na Mata vai a carta da Tiê; dali em diante, patuás bons', () => {
  const mata = novoJogo();
  aplicarPulo(mata, 'regiao2');
  assert.equal(quantidade(mata.mochila, 'carta_tie'), 1);
  assert.equal(quantidade(mata.mochila, 'patua_bom'), 0);

  const serra = novoJogo();
  aplicarPulo(serra, 'regiao3');
  assert.equal(quantidade(serra.mochila, 'carta_tie'), 0);
  assert.equal(quantidade(serra.mochila, 'patua_bom'), 5);
  aplicarPulo(serra, 'regiao4');                  // já tinha cinco: não dobra
  assert.equal(quantidade(serra.mochila, 'patua_bom'), 5);
});
