import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avaliarCorrida, encerrar, type DefCorrida } from './corrida.ts';

const C: DefCorrida = { ativa: 'corre', marcos: ['m1', 'm2'], conta: 'venci', segundos: 60, fim: 'acabou' };

test('a corrida anda, vence com todos os marcos, e perde no fim do tempo', () => {
  assert.equal(avaliarCorrida(C, {}, null), 'parada');
  assert.equal(avaliarCorrida(C, { corre: true, m1: true }, 10), 'correndo');
  assert.equal(avaliarCorrida(C, { corre: true, m1: true, m2: true }, 0), 'venceu', 'o último marco no último segundo vale');
  assert.equal(avaliarCorrida(C, { corre: true, m1: true }, 0), 'perdeu');
});

test('perder apaga os marcos; vencer acende a conta', () => {
  const f: Record<string, boolean> = { corre: true, m1: true };
  encerrar(C, f, false);
  assert.deepEqual(f, {});
  const g: Record<string, boolean> = { corre: true, m1: true, m2: true };
  encerrar(C, g, true);
  assert.deepEqual(g, { m1: true, m2: true, venci: true });
});
