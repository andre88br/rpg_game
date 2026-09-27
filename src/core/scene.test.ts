/* O gerenciador de cenas: a troca no meio de uma entrada não pode ser
   engolida — é assim que a volta da batalha pede a cutscene de quem perdeu. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GerenciadorCenas, type Cena } from './scene.ts';
import type { Entrada } from './input.ts';

const cena = (): Cena => ({ atualizar() {}, desenhar() {} });
const nada = {} as Entrada;

test('trocar no meio da entrada ainda troca de cena', () => {
  const g = new GerenciadorCenas();
  const mundo = cena(), batalha = cena(), cutscene = cena();
  g.definir(batalha);
  g.trocar(mundo);
  for (let i = 0; i < 20; i++) g.atualizar(1 / 60, nada);   // saiu, e o mundo está entrando
  assert.equal(g.cena, mundo);
  g.trocar(cutscene);
  for (let i = 0; i < 60; i++) g.atualizar(1 / 60, nada);
  assert.equal(g.cena, cutscene);
});

test('trocar duas vezes enquanto escurece fica com a primeira', () => {
  const g = new GerenciadorCenas();
  const a = cena(), b = cena(), c = cena();
  g.definir(a);
  g.trocar(b);
  g.trocar(c);
  for (let i = 0; i < 60; i++) g.atualizar(1 / 60, nada);
  assert.equal(g.cena, b);
});
