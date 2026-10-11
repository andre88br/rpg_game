/* A Fase D da história: os mestres com voz própria, a Firmina no meio da
   trilha, a volta para casa, o mundo reagindo ao fim e os fios soltos
   amarrados. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from './mapas/index.ts';
import { REGIOES, regiaoDoMapa } from './mundo.ts';
import { CUTSCENES, textoDe } from './cutscenes.ts';
import { novoJogo } from '../game/state.ts';
import { escolherFala } from '../game/quests.ts';

const todoTexto = (): string[] => [
  ...Object.values(MAPAS).flatMap((m) => m.npcs.flatMap((n) => [
    ...n.falas.flatMap((f) => f.linhas),
    n.treinador?.falaInicio ?? '', n.treinador?.falaDerrota ?? ''])),
  ...Object.values(CUTSCENES).flatMap((r) => r.flatMap((t) => t.legendas.map(textoDe))),
];

test('nenhum mestre entrega a medalha com a mesma frase', () => {
  const todas = todoTexto();
  assert.equal(todas.filter((t) => t.includes('Chega aqui do meu lado')).length, 0);
  assert.ok(todas.filter((t) => /acendi uma conta/i.test(t)).length <= 1, '"acendi uma conta" de novo');
});

test('as revanches do Círculo falam cada uma do seu jeito', () => {
  const rev = MAPAS.circuloDourado!.npcs.filter((n) => n.id.startsWith('revanche_'));
  assert.equal(rev.length, 8);
  for (const campo of ['falaInicio', 'falaDerrota'] as const) {
    const falas = new Set(rev.map((n) => n.treinador![campo]));
    assert.equal(falas.size, 8, `${campo} repetida entre os mestres`);
  }
  const primeiras = new Set(rev.map((n) => n.falas.map((f) => f.linhas[0]).join('|')));
  assert.equal(primeiras.size, 8, 'conversa repetida entre os mestres');
});

test('depois do campeonato, cada região tem alguém que comenta o fim', () => {
  for (const r of REGIOES) {
    const fala = Object.entries(MAPAS).some(([id, m]) => regiaoDoMapa(id)?.tipo === r.tipo &&
      m.npcs.some((n) => n.falas.some((f) => [f.se].flat().includes('campeao'))));
    assert.ok(fala, `${r.nome}: ninguém fala do campeonato`);
  }
});

test('a volta para casa, a lenda da Norato e a Romaria tocam na primeira chegada', () => {
  for (const [mapa, cut] of [['vilaAurora', 'volta_casa'], ['remansoNorato', 'norato'], ['romariaCirculo', 'romaria']]) {
    const a = MAPAS[mapa]!.aoChegar;
    assert.equal(a?.cutscene, cut, `${mapa} devia tocar ${cut}`);
    assert.ok(CUTSCENES[cut], `falta a cutscene ${cut}`);
    assert.deepEqual([a!.seNao].flat(), [`viu_cut_${cut}`], `${cut} devia tocar uma vez só`);
  }
  assert.deepEqual([MAPAS.vilaAurora!.aoChegar!.se].flat(), ['campeao']);
});

test('a Firmina visita Tupã só no meio da trilha, e o Seu Tonho é o dono do patuá', () => {
  const f = MAPAS.aldeiaTupa!.npcs.find((n) => n.id === 'firmina_tupa')!;
  assert.equal(f.se, 'medalha:rodamoinho');
  assert.equal(f.seNao, 'medalha:trovao');

  const tonho = MAPAS.vilaAurora!.npcs.find((n) => n.id === 'tonho')!;
  assert.equal(tonho.se, 'campeao');
  const e = novoJogo();
  e.flags.campeao = true; e.flags.achou_pote = true;
  assert.match(escolherFala(e, tonho.falas)!.linhas.join(' '), /pote/);
  // o pote do açude continua lá para ser achado
  assert.ok(MAPAS.rotaFoz!.objetos!.some((o) => o.placa === 'POTE DE BARRO'));
});
