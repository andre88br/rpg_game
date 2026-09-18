import test from 'node:test';
import assert from 'node:assert/strict';
import { mascaraLuz } from './tiles.ts';

/* mascaraLuz é pura — Buf não toca canvas — então dá pra testar sem
   navegador, igual qualquer outro Buf do jogo. */

test('o centro da máscara fica apagado (o disco de luz)', () => {
  const b = mascaraLuz(20);
  const c = Math.floor(b.w / 2);
  assert.equal(b.get(c, c), null);
});

test('bem fora do raio a máscara fica opaca', () => {
  const raio = 20;
  const b = mascaraLuz(raio);
  const c = Math.floor(b.w / 2);
  assert.equal(b.get(c + raio + 5, c), '#000000');
  assert.equal(b.get(c, c + raio + 5), '#000000');
});

test('o disco apagado é redondo, não quadrado', () => {
  const raio = 20;
  const b = mascaraLuz(raio);
  const c = Math.floor(b.w / 2);
  // no eixo, o raio inteiro está apagado; na diagonal, bem menos —
  // senão a "máscara de luz" seria só um quadrado preto com um buraco quadrado
  assert.equal(b.get(c + raio - 1, c), null);
  assert.notEqual(b.get(c + raio - 1, c + raio - 1), null);
});

test('a máscara cresce com o raio pedido', () => {
  const pequena = mascaraLuz(20);
  const grande = mascaraLuz(96);
  assert.ok(grande.w > pequena.w);
});
