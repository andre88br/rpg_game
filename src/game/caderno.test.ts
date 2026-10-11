import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESPECIES_ORDEM } from '../data/creatures.ts';
import { ondeAchar, textoOnde } from './caderno.ts';

test('toda espécie tem um jeito de ser achada', () => {
  for (const id of ESPECIES_ORDEM) {
    const o = ondeAchar(id);
    const algum = o.mato.length + o.chefe.length + o.presente.length + (o.inicial ? 1 : 0) + (o.evoluiDe ? 1 : 0);
    assert.ok(algum > 0, `${id}: ninguém sabe onde achar`);
    assert.notEqual(textoOnde(id), 'Ninguém sabe onde mora.');
  }
});

test('o caderno lê os mapas de verdade', () => {
  assert.ok(ondeAchar('piragua').mato.some((m) => m.mapa === 'rotaFoz'));
  assert.ok(ondeAchar('lobinho').mato.length > 0);
  assert.deepEqual(ondeAchar('boto').presente, ['portoIara']);
  assert.equal(ondeAchar('iarinha').inicial, true);
  assert.equal(ondeAchar('boitatao').evoluiDe?.especie, 'boitatinha');
  assert.ok(ondeAchar('cobraNorato').chefe.includes('remansoNorato'));
});
