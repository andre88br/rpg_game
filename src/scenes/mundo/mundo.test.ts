/* Os pedaços da cena do mundo que são conta pura: quem avista, com que
   time o treinador vem, o passo no mato, a fuga do Sacizinho, a Romaria e
   as covas das pedras. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Aleatorio } from '../../core/rng.ts';
import { criar } from '../../battle/encantado.ts';
import { novoJogo } from '../../game/state.ts';
import { quantidade } from '../../data/items.ts';
import { covasAbertas } from '../../world/pedras.ts';
import type { DefMapa, DefTreinador } from '../../world/tilemap.ts';
import { avistou, fichaDoTreinador, premiarVitoria, timeDoTreinador } from './treinadores.ts';
import { passoNoMato, rotaDeFuga } from './encontros.ts';
import { fimDaRomaria } from './romaria.ts';

const nada = () => false;

test('o vigia vê reto até a visão, e parede ou NPC no meio cortam', () => {
  const v = { tx: 5, ty: 5, dir: 'baixo' as const, visao: 3 };
  assert.equal(avistou(v, { tx: 5, ty: 8 }, nada, nada), true);
  assert.equal(avistou(v, { tx: 5, ty: 9 }, nada, nada), false, 'longe demais');
  assert.equal(avistou(v, { tx: 6, ty: 7 }, nada, nada), false, 'fora da linha');
  assert.equal(avistou(v, { tx: 5, ty: 8 }, (x, y) => x === 5 && y === 7, nada), false, 'parede');
  assert.equal(avistou(v, { tx: 5, ty: 8 }, nada, (x, y) => x === 5 && y === 6), false, 'outro NPC');
});

test('o treinador vem na forma do nível, com trunfo e revanche que cresce', () => {
  const e = novoJogo();
  e.time = [criar('iarinha', 50)];
  e.flags['inicial_iarinha'] = true;
  const t: DefTreinador = {
    classe: 'TESTE', time: [{ especie: 'cabritinha', nivel: 42 }],
    trunfo: { curupinho: { especie: 'boitatinha', nivel: 40 }, iarinha: { especie: 'curupinho', nivel: 40 } },
  };
  const time = timeDoTreinador(t, e);
  assert.equal(time[0]!.especie, 'cabraCabriola', 'Cabritinha no 42 já evoluiu');
  assert.equal(time.length, 2);
  assert.notEqual(time[1]!.especie, 'boitatinha', 'o trunfo é contra o inicial de quem joga');
  const revanche = timeDoTreinador({ ...t, trunfo: undefined, escala: { piso: 10, mais: 3 } }, e);
  assert.equal(revanche[0]!.nivel, 53);
  // bicho-chefe fica como foi desenhado, e não tem painel de treinador
  const chefe = timeDoTreinador({ classe: 'BICHO', selvagem: true, time: [{ especie: 'cabritinha', nivel: 42 }] }, e);
  assert.equal(chefe[0]!.especie, 'cabritinha');
  assert.equal(fichaDoTreinador('X', { classe: 'BICHO', selvagem: true, time: [] }), null);
});

test('vencer dá a flag, as ligações, o prêmio e o item', () => {
  const e = novoJogo();
  const antes = e.dinheiro;
  premiarVitoria(e, 'zeca', { classe: 'RIVAL', time: [], liga: ['a', 'b'], premio: 100, da: { item: 'rede', n: 2 } });
  assert.equal(e.flags['venceu_zeca'], true);
  assert.equal(e.flags['a'] && e.flags['b'], true);
  assert.equal(e.dinheiro, antes + 100);
  assert.equal(quantidade(e.mochila, 'rede'), 2);
});

test('o passo no mato: fumo gasta e avisa, mato sem tabela não dá nada', () => {
  const e = novoJogo();
  e.time = [criar('iarinha', 10)];
  const def = { id: 'rotaFoz', encontros: [{ especie: 'piragua', min: 3, max: 3, peso: 1 }], passosPorEncontro: 1 } as unknown as DefMapa;
  e.repelente = 2;
  assert.equal(passoNoMato(e, def, 'limpo', new Aleatorio(1), 'dia').k, 'nada');
  assert.equal(passoNoMato(e, def, 'limpo', new Aleatorio(1), 'dia').k, 'fumoAcabou');
  const p = passoNoMato(e, def, 'limpo', new Aleatorio(1), 'dia');
  assert.equal(p.k, 'luta');
  if (p.k === 'luta') { assert.equal(p.oponente.especie, 'piragua'); assert.equal(p.podePrender, true); }
  assert.equal(passoNoMato(e, { ...def, encontros: [] }, 'limpo', new Aleatorio(1)).k, 'nada');
});

test('o Sacizinho foge para longe, depois de lado, e encurralado fica', () => {
  const livre = () => true;
  assert.equal(rotaDeFuga({ tx: 5, ty: 5 }, { tx: 4, ty: 5 }, livre), 'dir');
  assert.equal(rotaDeFuga({ tx: 5, ty: 5 }, { tx: 4, ty: 5 }, (x) => x !== 6), 'cima');
  assert.equal(rotaDeFuga({ tx: 5, ty: 5 }, { tx: 4, ty: 5 }, () => false), null);
});

test('a Romaria: vitória soma ficha e benze na sétima, derrota zera', () => {
  const e = novoJogo();
  for (let i = 0; i < 6; i++) fimDaRomaria(e, 'vitoria');
  const setima = fimDaRomaria(e, 'vitoria');
  assert.equal(e.romaria.seq, 7);
  assert.ok(setima.some((l) => l.includes('benzi')));
  assert.ok(quantidade(e.mochila, 'ficha_romaria') > 7);
  fimDaRomaria(e, 'derrota');
  assert.equal(e.romaria.seq, 0);
  assert.equal(e.romaria.recorde, 7);
});

test('covas abertas: só as que a flag ainda não tapou', () => {
  const objetos = [
    { tipo: 'cova', tx: 1, ty: 1, seNao: 'tapou_1' },
    { tipo: 'cova', tx: 2, ty: 2, seNao: 'tapou_2' },
    { tipo: 'placa', tx: 3, ty: 3 },
  ];
  assert.deepEqual(covasAbertas(objetos, (f) => f === 'tapou_1'), [{ tx: 2, ty: 2, flag: 'tapou_2' }]);
});
