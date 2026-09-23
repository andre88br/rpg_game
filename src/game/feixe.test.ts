import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refletir, tracarFeixe, type Inclinacao } from './feixe.ts';

test('os espelhos desviam em ângulo reto', () => {
  assert.equal(refletir('dir', '/'), 'cima');
  assert.equal(refletir('baixo', '/'), 'esq');
  assert.equal(refletir('dir', '\\'), 'baixo');
  assert.equal(refletir('cima', '\\'), 'esq');
});

test('o feixe passa por um espelho e chega ao cristal', () => {
  const espelhos = new Map<string, Inclinacao>([['4,0', '\\']]);
  const f = tracarFeixe({ tx: 0, ty: 0 }, 'dir', { tx: 4, ty: 3 },
                        (x, y) => x < 0 || y < 0 || x > 9 || y > 9,
                        (x, y) => espelhos.get(`${x},${y}`) ?? null);
  assert.equal(f.acertou, true);
  assert.deepEqual(f.caminho, [[1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2]]);
});

test('parede para o feixe, e espelhos em laço não travam', () => {
  const f = tracarFeixe({ tx: 0, ty: 0 }, 'dir', { tx: 9, ty: 9 }, (x) => x === 3, () => null);
  assert.equal(f.acertou, false);
  assert.equal(f.caminho.length, 2);
  const laco = new Map<string, Inclinacao>([['2,0', '\\'], ['2,2', '/'], ['0,2', '\\'], ['0,0', '/']]);
  const g = tracarFeixe({ tx: 1, ty: 0 }, 'dir', { tx: 9, ty: 9 }, () => false, (x, y) => laco.get(`${x},${y}`) ?? null);
  assert.equal(g.acertou, false);
});
