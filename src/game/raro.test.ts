import test from 'node:test';
import assert from 'node:assert/strict';
import { CHANCE_RARO, chanceRaro, talvezRaro } from './raro.ts';
import { guardar, novoJogo } from './state.ts';
import { restaurar, serializar } from './save.ts';
import { escolherFala, aplicarFala } from './quests.ts';
import { criar } from '../battle/encantado.ts';
import { Aleatorio } from '../core/rng.ts';
import { corRara, giroDe, variante } from '../art/raro.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import { ESPECIES_ORDEM, especie } from '../data/creatures.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { adicionar, consumir } from '../data/items.ts';

test('um em 256 no mato, e o dobro com o Amuleto do Brilho', () => {
  const e = novoJogo();
  assert.equal(chanceRaro(e), CHANCE_RARO);
  e.mochila['amuleto_brilho'] = 1;
  assert.equal(chanceRaro(e), CHANCE_RARO * 2);
  const rnd = new Aleatorio(5);
  let n = 0;
  for (let i = 0; i < 64000; i++) if (talvezRaro(criar('lobinho', 5), e, rnd).raro) n++;
  assert.ok(n > 380 && n < 620, `${n} raros em 64000 (esperado ~500)`);
});

test('o raro atravessa o save, e o caderno marca a espécie', () => {
  const e = novoJogo();
  guardar(e, criar('saci', 20, { raro: true }));
  guardar(e, criar('lobinho', 5));
  assert.deepEqual(e.raros, ['saci']);
  const volta = restaurar(JSON.parse(JSON.stringify(serializar(e))))!;
  assert.equal(volta.time[0]!.raro, true);
  assert.equal(volta.time[1]!.raro, undefined);
  assert.deepEqual(volta.raros, ['saci']);
});

test('a cor rara gira o matiz e deixa contorno, olho e brilho em paz', () => {
  for (const id of ESPECIES_ORDEM) {
    const g = giroDe(id);
    assert.ok(g >= 90 && g <= 270, `${id}: ${g}`);
  }
  assert.equal(corRara('#191221', 180), '#191221');      // contorno
  assert.equal(corRara('#ffffff', 180), '#ffffff');      // olho
  assert.notEqual(corRara('#d9452a', 180), '#d9452a');
  // todo desenho muda de cor em algum pixel, e mantém o tamanho
  for (const id of ESPECIES_ORDEM) {
    const arte = especie(id).arte;
    const b = ARTE_CRIATURAS[arte]!();
    const v = variante(b, id);
    assert.equal(v.d.length, b.d.length);
    assert.ok(v.d.some((c, i) => c !== b.d[i]), `${id}: a cor rara é igual à comum`);
  }
});

test('o Contador entrega um prêmio por marca de presos, uma vez cada', () => {
  const falas = MAPAS['portoIara']!.npcs.find((n) => n.id === 'contador')!.falas;
  const e = novoJogo();
  e.flags['tem_caderno'] = true; e.flags['conta_caderno'] = true;
  const presos = (n: number) => { e.capturados = ESPECIES_ORDEM.slice(0, n); };
  const fala = () => {
    const f = escolherFala(e, falas)!;
    aplicarFala(e, f, { adicionar: (id, n) => adicionar(e.mochila, id, n),
                        consumir: (id, n) => consumir(e.mochila, id, n) });
    return f;
  };
  presos(11);
  assert.equal(fala().liga, undefined);
  presos(12);
  fala();
  assert.equal(e.mochila['patua_mestre'], 5);
  assert.equal(fala().liga, undefined, 'não entrega duas vezes');
  presos(40);
  fala(); fala();
  assert.equal(e.mochila['cantiga_sol'], 1);
  assert.equal(e.mochila['amuleto_brilho'], 1);
  presos(45);
  fala();
  assert.ok([...e.time, ...e.caixa].some((b) => b.especie === 'boto'));
});
