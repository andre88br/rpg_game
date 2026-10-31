import test from 'node:test';
import assert from 'node:assert/strict';
import { proximaDica, type ContextoDica } from './dicas.ts';

const casa: ContextoDica = { interior: true, temTime: false, pertoDeAlguem: false, noMato: false, passosFora: 0 };

test('em casa, sem time e sozinho: nenhuma dica', () => {
  assert.equal(proximaDica({}, casa), null);
});

test('perto de alguém, ensina o A; uma vez só', () => {
  assert.equal(proximaDica({}, { ...casa, pertoDeAlguem: true })?.id, 'falar');
  assert.equal(proximaDica({ dica_falar: true }, { ...casa, pertoDeAlguem: true }), null);
});

test('com time, na rua: correr; no mato: o mato vem antes; o menu espera uns passos', () => {
  const rua = { ...casa, interior: false, temTime: true };
  assert.equal(proximaDica({ dica_falar: true }, rua)?.id, 'correr');
  assert.equal(proximaDica({ dica_falar: true }, { ...rua, noMato: true })?.id, 'mato');
  const vistas = { dica_falar: true, dica_correr: true, dica_mato: true };
  assert.equal(proximaDica(vistas, { ...rua, passosFora: 10 }), null);
  assert.equal(proximaDica(vistas, { ...rua, passosFora: 25 })?.id, 'menu');
});

test('a dica da captura cabe na caixa da batalha: cada fala em até três linhas', async () => {
  const { DICA_CAPTURA } = await import('./dicas.ts');
  const { quebrar } = await import('../art/font.ts');
  const { LARGURA } = await import('../core/renderer.ts');
  for (const f of DICA_CAPTURA) assert.ok(quebrar(f, LARGURA - 28).length <= 3, f);
});
