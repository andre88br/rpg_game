import test from 'node:test';
import assert from 'node:assert/strict';
import { ehNoite } from './tempo.ts';

test('é noite das 18h às 6h', () => {
  const as = (h: number) => ehNoite(new Date(2026, 5, 1, h, 30));
  assert.equal(as(5), true);
  assert.equal(as(6), false);
  assert.equal(as(12), false);
  assert.equal(as(17), false);
  assert.equal(as(18), true);
  assert.equal(as(23), true);
});
