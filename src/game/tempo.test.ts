import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLIMA_DA_REGIAO, CLIMA_FAVORITO, FORA_DE_HORA, HORARIO, NA_HORA, NO_CLIMA,
  ehNoite, fatorClima, fixarHora, periodo, sortearClima, tabelaDoMomento,
} from './tempo.ts';
import { Aleatorio } from '../core/rng.ts';
import { ESPECIES_ORDEM } from '../data/creatures.ts';

afterEach(() => fixarHora(null));

test('os períodos do dia', () => {
  const as = (h: number) => periodo(new Date(2026, 5, 1, h, 30));
  assert.deepEqual([5, 6, 9, 10, 15, 16, 17, 18, 23].map(as),
    ['noite', 'manha', 'manha', 'dia', 'dia', 'tarde', 'tarde', 'noite', 'noite']);
  assert.equal(ehNoite(new Date(2026, 5, 1, 12)), false);
  assert.equal(ehNoite(new Date(2026, 5, 1, 2)), true);
});

test('a hora fixada de teste vence o relógio', () => {
  fixarHora(22);
  assert.equal(periodo(new Date(2026, 5, 1, 12)), 'noite');
});

test('cada região só tem o clima dela; fora delas é sempre limpo', () => {
  const rnd = new Aleatorio(3);
  for (let i = 0; i < 300; i++) {
    assert.ok(['limpo', 'chuva'].includes(sortearClima('agua', rnd)));
    assert.ok(['limpo', 'tempestade'].includes(sortearClima('raio', rnd)));
    assert.equal(sortearClima('fogo', rnd), 'limpo');
    assert.equal(sortearClima(null, rnd), 'limpo');
  }
  const vezes = Array.from({ length: 1000 }, () => sortearClima('sombra', rnd)).filter((c) => c === 'neblina').length;
  assert.ok(Math.abs(vezes - CLIMA_DA_REGIAO.sombra!.chance * 10) < 60, `${vezes}`);
});

test('as espécies de horário e de clima existem', () => {
  for (const id of [...Object.keys(HORARIO), ...Object.keys(CLIMA_FAVORITO)]) {
    assert.ok(ESPECIES_ORDEM.includes(id), id);
  }
});

test('o mato do momento: de noite o Lobinho aparece mais, de dia menos, nunca zero', () => {
  const t = [{ especie: 'lobinho', min: 5, max: 6, peso: 10 }, { especie: 'cabritinha', min: 5, max: 6, peso: 10 }];
  assert.equal(tabelaDoMomento(t, 'noite', 'limpo')[0]!.peso, 10 * NA_HORA);
  assert.equal(tabelaDoMomento(t, 'dia', 'limpo')[0]!.peso, 10 * FORA_DE_HORA);
  assert.equal(tabelaDoMomento(t, 'dia', 'limpo')[1]!.peso, 10);
  assert.equal(t[0]!.peso, 10, 'a tabela do mapa não muda');
});

test('na chuva a Iarinha dobra; o quando da faixa vence a tabela', () => {
  const t = [{ especie: 'iarinha', min: 5, max: 6, peso: 10 }];
  assert.equal(tabelaDoMomento(t, 'dia', 'chuva')[0]!.peso, 10 * NO_CLIMA);
  assert.equal(tabelaDoMomento(t, 'dia', 'limpo')[0]!.peso, 10);
  const propria = [{ especie: 'lobinho', min: 5, max: 6, peso: 10, quando: 'dia' as const }];
  assert.equal(tabelaDoMomento(propria, 'dia', 'limpo')[0]!.peso, 10 * NA_HORA);
});

test('o clima na força dos golpes', () => {
  assert.equal(fatorClima('agua', 'chuva'), 1.2);
  assert.equal(fatorClima('fogo', 'chuva'), 0.8);
  assert.equal(fatorClima('raio', 'tempestade'), 1.2);
  assert.equal(fatorClima('vento', 'ventania'), 1.2);
  assert.equal(fatorClima('sombra', 'neblina'), 1.2);
  assert.equal(fatorClima('fogo', 'limpo'), 1);
  assert.equal(fatorClima('neutro', 'chuva'), 1);
});
