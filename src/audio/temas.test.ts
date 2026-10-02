import { test } from 'node:test';
import assert from 'node:assert/strict';
import { temaDaBatalha, temaDoMapa } from './temas.ts';
import { MUSICAS } from './musicas.ts';
import { MAPAS } from '../data/mapas/index.ts';

const npc = (mapa: string, id: string) => {
  const t = MAPAS[mapa]!.npcs.find((n) => n.id === id)?.treinador;
  assert.ok(t, `${mapa}: ${id} não é treinador`);
  return t;
};

test('todo mapa tem um tema que existe, e que repete', () => {
  for (const def of Object.values(MAPAS)) {
    const id = temaDoMapa(def);
    assert.ok(MUSICAS[id], `${def.id}: tema ${id} não existe`);
    assert.ok(!('vinheta' in MUSICAS[id]), `${def.id}: ${id} é vinheta`);
  }
});

test('cada região ao ar livre tem o seu tema', () => {
  assert.equal(temaDoMapa(MAPAS['vilaAurora']!), 'mundoFoz');
  assert.equal(temaDoMapa(MAPAS['mataDoCurupira']!), 'mundoMata');
  assert.equal(temaDoMapa(MAPAS['vilaFornalha']!), 'mundoSerra');
  assert.equal(temaDoMapa(MAPAS['campoAberto']!), 'mundoCampo');
  assert.equal(temaDoMapa(MAPAS['aldeiaTupa']!), 'mundoTupa');
  assert.equal(temaDoMapa(MAPAS['arraialCaipora']!), 'mundoMinas');
  assert.equal(temaDoMapa(MAPAS['bairroDaCuca']!), 'mundoCuca');
  assert.equal(temaDoMapa(MAPAS['cidadeDoSol']!), 'mundoSol');
  assert.equal(temaDoMapa(MAPAS['circuloDourado']!), 'mundoCirculo');
  assert.equal(temaDoMapa(MAPAS['estradaDourada']!), 'mundoCirculo');
});

test('casa, terreiro, arena e breu', () => {
  assert.equal(temaDoMapa(MAPAS['casaTaina']!), 'casa');
  assert.equal(temaDoMapa(MAPAS['lojaPortoIara']!), 'casa');
  assert.equal(temaDoMapa(MAPAS['terreiroPortoIara']!), 'terreiro');
  assert.equal(temaDoMapa(MAPAS['arenaDourada']!), 'terreiro');
  assert.equal(temaDoMapa(MAPAS['cavernaBoitata']!), 'breu');
  assert.equal(temaDoMapa(MAPAS['casaraoAssombrado']!), 'breu');
});

test('mato alto, treinador comum e chefe', () => {
  assert.equal(temaDaBatalha(null), 'batalhaSelvagem');
  assert.equal(temaDaBatalha(npc('terreiroPortoIara', 'mariana')), 'batalhaChefe');
  assert.equal(temaDaBatalha(npc('portoIara', 'boitata')), 'batalhaChefe');
  assert.equal(temaDaBatalha(npc('portoIara', 'saci_cais')), 'batalhaSelvagem');
  assert.equal(temaDaBatalha(npc('arenaDourada', 'anhanga')), 'batalhaChefe');
  assert.equal(temaDaBatalha(npc('circuloDourado', 'revanche_bras')), 'batalhaChefe');
  // um guarda de terreiro é treinador, não chefe
  const guarda = Object.values(MAPAS).flatMap((d) => d.npcs)
    .find((n) => n.treinador?.classe.startsWith('GUARDA DO'))!.treinador!;
  assert.equal(temaDaBatalha(guarda), 'batalhaTreinador');
});

test('toda luta com o Zeca é de chefe', () => {
  const zecas = Object.values(MAPAS).flatMap((d) => d.npcs).filter((n) => /^zeca\d*(_b)?$/.test(n.id));
  assert.ok(zecas.length >= 9);
  for (const z of zecas) assert.equal(temaDaBatalha(z.treinador!), 'batalhaChefe', z.id);
});
