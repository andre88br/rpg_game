/* O pós-jogo: revanche que cresce, a Romaria e o Modo Desafio. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { formaNoNivel, nivelEscalado } from './escala.ts';
import { FORA_DA_ROMARIA, fichasDaVitoria, gerarRomeiro, nivelDaRomaria, tamanhoDoTime } from './romaria.ts';
import { gastarEncontro, podePrenderAqui, soltarDesmaiados } from './desafio.ts';
import { novoJogo } from './state.ts';
import { restaurar, serializar } from './save.ts';
import { criar } from '../battle/encantado.ts';
import { Batalha } from '../battle/engine.ts';
import { Aleatorio } from '../core/rng.ts';

test('a revanche vem no nível do melhor do time mais 3, com piso no 60', () => {
  const e = novoJogo();
  e.time = [criar('saci', 40), criar('lobinho', 30)];
  assert.equal(nivelEscalado(e, { piso: 60, mais: 3 }), 60);
  e.time.push(criar('relampo', 72));
  assert.equal(nivelEscalado(e, { piso: 60, mais: 3 }), 75);
});

test('cada bicho vem na forma do nível', () => {
  assert.equal(formaNoNivel('boitatinha', 10), 'boitatinha');
  assert.equal(formaNoNivel('boitatinha', 30), 'boitatao');
  assert.equal(formaNoNivel('boitatinha', 60), 'mboitata');
  assert.equal(formaNoNivel('saci', 90), 'saci');
});

test('a Romaria: nível, tamanho do time, fichas e ninguém secreto', () => {
  const e = novoJogo();
  e.time = [criar('saci', 50)];
  assert.equal(nivelDaRomaria(e), 52);
  assert.deepEqual([0, 6, 7, 14, 21, 50].map(tamanhoDoTime), [3, 3, 4, 5, 6, 6]);
  assert.deepEqual([1, 6, 7, 14].map(fichasDaVitoria), [1, 1, 5, 5]);
  const rnd = new Aleatorio(3);
  for (let i = 0; i < 200; i++) {
    const r = gerarRomeiro(rnd, 52, i % 30);
    assert.equal(r.time.length, tamanhoDoTime(i % 30));
    assert.equal(new Set(r.time.map((b) => b.especie)).size, r.time.length, 'sem repetir espécie');
    for (const b of r.time) {
      assert.equal(b.nivel, 52);
      assert.ok(!FORA_DA_ROMARIA.has(b.especie), b.especie);
      assert.equal(formaNoNivel(b.especie, 52), b.especie, 'já na forma do nível');
    }
  }
});

test('o recorde da Romaria atravessa o save', () => {
  const e = novoJogo();
  e.romaria = { seq: 3, recorde: 11 };
  assert.deepEqual(restaurar(JSON.parse(JSON.stringify(serializar(e))))!.romaria, { seq: 3, recorde: 11 });
  const velho = JSON.parse(JSON.stringify(serializar(novoJogo())));
  delete velho.estado?.romaria; delete velho.romaria;
  assert.deepEqual(restaurar(velho)!.romaria, { seq: 0, recorde: 0 });
});

test('Desafio: só o primeiro bicho do lugar vai para o patuá', () => {
  const e = novoJogo();
  assert.ok(podePrenderAqui(e, 'rotaUm'));
  gastarEncontro(e, 'rotaUm');
  assert.ok(podePrenderAqui(e, 'rotaUm'), 'fora do Desafio não muda nada');
  e.flags['desafio'] = true;
  assert.ok(podePrenderAqui(e, 'rotaUm'));
  gastarEncontro(e, 'rotaUm');
  assert.ok(!podePrenderAqui(e, 'rotaUm'));
  assert.ok(podePrenderAqui(e, 'mataDoCurupira'));

  const b = new Batalha({ time: [criar('saci', 20)], oponentes: [criar('lobinho', 3, { selvagem: true })],
                          mochila: { patua: 3 }, podePrender: false });
  const ev = b.executar({ tipo: 'item', item: 'patua' });
  assert.ok(ev.some((x) => x.k === 'texto' && /Desafio/.test(x.t)));
  assert.equal(b.mochila['patua'], 3, 'o patuá não se gasta');
});

test('Desafio: quem desmaia é solto, mas o último fica', () => {
  const e = novoJogo();
  const a = criar('saci', 20), b = criar('lobinho', 20);
  e.time = [a, b];
  b.hp = 0;
  assert.deepEqual(soltarDesmaiados(e), [], 'fora do Desafio ninguém sai');
  e.flags['desafio'] = true;
  assert.deepEqual(soltarDesmaiados(e), ['Lobinho']);
  assert.deepEqual(e.time, [a]);
  a.hp = 0;
  assert.deepEqual(soltarDesmaiados(e), [], 'o último fica, para o jogo não travar');
  e.caixa = [criar('cuca', 20)];
  assert.deepEqual(soltarDesmaiados(e), ['Saci']);
  assert.equal(e.time[0]!.especie, 'cuca', 'o primeiro da caixa vem para o time');
});
