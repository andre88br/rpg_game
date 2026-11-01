import test from 'node:test';
import assert from 'node:assert/strict';
import { COSTA_MAX, marAberto, texturaDaCosta } from './mar.ts';

/* um mapa de letras: '~' é água */
function mapa(linhas: string[]) {
  const H = linhas.length, W = linhas[0]!.length;
  return { W, H, agua: (x: number, y: number) => linhas[y]![x] === '~' };
}

const PRAIA = [
  '..........',
  '..~~......',   // uma lagoa no meio da terra
  '..~~......',
  '..........',
  '~~~~~~~~~~',   // o mar, colado na borda de baixo
  '~~~~~~~~~~',
];

test('mar aberto é a água ligada à borda; lagoa no meio da terra não', () => {
  const m = mapa(PRAIA);
  const mar = marAberto(m.W, m.H, m.agua);
  assert.equal(mar[5 * m.W + 4], 1, 'o mar');
  assert.equal(mar[4 * m.W + 0], 1, 'o mar, na beira');
  assert.equal(mar[1 * m.W + 2], 0, 'a lagoa');
  assert.equal(mar[0], 0, 'a terra');
});

test('a textura da costa: distância até a terra no mar, negativa em terra, e o que é mar', () => {
  const m = mapa(PRAIA);
  const d = texturaDaCosta(m.W, m.H, m.agua, marAberto(m.W, m.H, m.agua));
  const LW = m.W + 2;
  const texel = (x: number, y: number) => d.subarray(((y + 1) * LW + x + 1) * 4, ((y + 1) * LW + x + 2) * 4);
  const dist = (x: number, y: number) => texel(x, y)[0]! / 25 - 1;
  assert.ok(Math.abs(dist(5, 4) - 0.5) < 0.05, `mar colado na areia: ${dist(5, 4)}`);
  assert.ok(Math.abs(dist(5, 5) - 1.5) < 0.05, `uma fileira mais para o largo: ${dist(5, 5)}`);
  assert.ok(dist(5, 3) < 0, 'na areia, negativa');
  assert.equal(texel(5, 5)[1], 255, 'mar aberto');
  assert.equal(texel(2, 1)[1], 0, 'lagoa não faz onda');
  assert.equal(texel(5, 3)[1], 255, 'a areia da praia, colada no mar');
  // fora do mapa é mar, e a distância nunca passa do que cabe
  assert.equal(texel(-1, 6)[2], 255);
  for (let i = 0; i < d.length; i += 4) assert.ok(d[i]! / 25 - 1 <= COSTA_MAX + 0.01);
});
