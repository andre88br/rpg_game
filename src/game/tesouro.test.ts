import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sondarTesouro } from './tesouro.ts';
import type { DefMapa } from '../world/tilemap.ts';

const mapa: DefMapa = {
  id: 'teste', nome: 'TESTE', chao: ['....................'], npcs: [],
  inicio: { tx: 0, ty: 0, dir: 'baixo' },
  objetos: [
    { tipo: 'enterrado', tx: 10, ty: 0, seNao: 'cavou' },
    { tipo: 'enterrado', tx: 10, ty: 0, se: 'cavou', vazio: true },
  ],
};
const semCavar = (o: { se?: unknown; seNao?: unknown }) => o.se === undefined;

test('a forquilha esquenta conforme se chega perto', () => {
  assert.equal(sondarTesouro(mapa, semCavar, 10, 0).temperatura, 'quente');
  assert.equal(sondarTesouro(mapa, semCavar, 8, 0).temperatura, 'quente');
  assert.equal(sondarTesouro(mapa, semCavar, 5, 0).temperatura, 'morno');
  assert.equal(sondarTesouro(mapa, semCavar, 0, 0).temperatura, 'frio');
  assert.equal(sondarTesouro(mapa, semCavar, 0, 30).temperatura, 'gelado');
});

test('tesouro já cavado não conta mais', () => {
  const cavado = (o: { se?: unknown; seNao?: unknown }) => o.seNao === undefined;
  const s = sondarTesouro(mapa, cavado, 10, 0);
  assert.equal(s.temperatura, 'nada');
  assert.equal(s.distancia, null);
});
