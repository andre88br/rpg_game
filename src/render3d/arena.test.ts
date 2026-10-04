import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAMERAS, CENARIOS_3D, arenaDe, focoDaCena } from './arena.ts';

test('todo cenário tem arena em toda região', () => {
  assert.deepEqual([...CENARIOS_3D].sort(), ['caverna', 'cidade', 'mata', 'praia']);
  for (const c of CENARIOS_3D) {
    for (const r of ['agua', 'planta', 'fogo', 'vento', 'raio', 'terra', 'sombra', 'luz', null]) {
      const a = arenaDe(c, r);
      for (const cor of [a.chao, a.plataforma, a.borda]) assert.match(cor, /^#[0-9a-f]{6}$/, `${c}/${r}`);
    }
  }
  assert.equal(arenaDe('praia', 'agua').mar, true);
  assert.equal(arenaDe('caverna', 'terra').interior, true);
  assert.notEqual(arenaDe('mata', 'terra').chao, arenaDe('mata', 'planta').chao, 'a grama muda por região');
});

test('a câmera vai para quem ataca, abre na entrada, e volta ao geral', () => {
  const parado = { avanco: { aliado: 0, inimigo: 0 }, entrada: { aliado: 1, inimigo: 1 } };
  assert.equal(focoDaCena(parado), 'geral');
  assert.equal(focoDaCena({ ...parado, avanco: { aliado: 0.1, inimigo: 0 } }), 'ataqueAliado');
  assert.equal(focoDaCena({ ...parado, avanco: { aliado: 0, inimigo: 0.1 } }), 'ataqueInimigo');
  assert.equal(focoDaCena({ ...parado, golpe: 'inimigo' }), 'ataqueInimigo', 'o golpe voando segura a câmera');
  assert.equal(focoDaCena({ ...parado, entrada: { aliado: 0.4, inimigo: 1 } }), 'entrada');
  for (const c of Object.values(CAMERAS)) assert.ok(c.pos[1] > 0 && c.fov > 20);
});
