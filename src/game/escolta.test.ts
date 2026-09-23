import { test } from 'node:test';
import assert from 'node:assert/strict';
import { novoJogo } from './state.ts';
import { escoltaAtiva, derrubarEscolta, ESCOLTAS } from './escolta.ts';

test('a escolta existe só entre começar e chegar', () => {
  const e = novoJogo();
  const d = ESCOLTAS[0]!;
  assert.equal(escoltaAtiva(e), null);
  e.flags[d.flag] = true;
  assert.equal(escoltaAtiva(e)?.id, d.id);
  e.flags[d.fim] = true;
  assert.equal(escoltaAtiva(e), null, 'depois de chegar, ninguém segue mais');
});

test('apagar no caminho derruba a escolta, mas não o que já foi entregue', () => {
  const e = novoJogo();
  const d = ESCOLTAS[0]!;
  e.flags[d.flag] = true;
  assert.equal(derrubarEscolta(e)?.id, d.id);
  assert.equal(e.flags[d.flag], undefined);
  assert.equal(escoltaAtiva(e), null);
  e.flags[d.fim] = true;
  assert.equal(derrubarEscolta(e), null);
  assert.equal(e.flags[d.fim], true);
});
