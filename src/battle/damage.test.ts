import test from 'node:test';
import assert from 'node:assert/strict';
import { Aleatorio } from '../core/rng.ts';
import {
  acertou, aplicarEstagio, calcularDano, danoBase, multEstagio,
  temAfinidade, MULT_AFINIDADE, ESTAGIO_MAX, ESTAGIO_MIN,
} from './damage.ts';

const padrao = {
  nivel: 20, ataque: 40, defesa: 40, potencia: 50,
  afinidade: false, eficacia: 1,
};

test('estágio 0 não muda nada e os limites travam', () => {
  assert.equal(multEstagio(0), 1);
  assert.equal(multEstagio(ESTAGIO_MAX), 4);
  assert.equal(multEstagio(ESTAGIO_MIN), 0.25);
  assert.equal(multEstagio(99), multEstagio(ESTAGIO_MAX));
  assert.equal(multEstagio(-99), multEstagio(ESTAGIO_MIN));
});

test('subir e descer um estágio se cancelam', () => {
  assert.ok(Math.abs(multEstagio(1) * multEstagio(-1) - 1) < 1e-9);
  assert.ok(Math.abs(multEstagio(2) * multEstagio(-2) - 1) < 1e-9);
});

test('aplicarEstagio nunca devolve menos que 1', () => {
  assert.equal(aplicarEstagio(1, -6), 1);
  assert.equal(aplicarEstagio(100, 0), 100);
  assert.equal(aplicarEstagio(100, 2), 200);
});

test('mais potência dá mais dano', () => {
  assert.ok(danoBase({ ...padrao, potencia: 90 }) > danoBase({ ...padrao, potencia: 40 }));
});

test('mais defesa no alvo dá menos dano', () => {
  assert.ok(danoBase({ ...padrao, defesa: 80 }) < danoBase({ ...padrao, defesa: 20 }));
});

test('nível maior dá mais dano', () => {
  assert.ok(danoBase({ ...padrao, nivel: 40 }) > danoBase({ ...padrao, nivel: 10 }));
});

test('super eficaz dobra o dano', () => {
  const um = danoBase(padrao);
  const dois = danoBase({ ...padrao, eficacia: 2 });
  assert.equal(dois, um * 2);
});

test('afinidade rende 50% a mais', () => {
  const sem = danoBase(padrao);
  const com = danoBase({ ...padrao, afinidade: true });
  assert.equal(com, Math.floor(sem * MULT_AFINIDADE));
});

test('golpe de estado (potência 0) não tira HP', () => {
  assert.equal(danoBase({ ...padrao, potencia: 0 }), 0);
  assert.equal(calcularDano({ ...padrao, potencia: 0 }, new Aleatorio(1)).dano, 0);
});

test('a variação fica entre 85% e 100% do dano base (sem crítico)', () => {
  const base = danoBase(padrao);
  let vistos = 0;
  for (let s = 0; s < 500; s++) {
    const r = calcularDano(padrao, new Aleatorio(s));
    if (r.critico) continue;
    vistos++;
    assert.ok(r.dano >= Math.floor(base * 0.85), `dano ${r.dano} abaixo do piso`);
    assert.ok(r.dano <= base, `dano ${r.dano} acima do teto ${base}`);
  }
  assert.ok(vistos > 300, 'quase toda tentativa devia ser sem crítico');
});

test('crítico acontece, e quando acontece bate mais forte que o teto normal', () => {
  const base = danoBase(padrao);
  let criticos = 0;
  for (let s = 0; s < 2000; s++) {
    const r = calcularDano(padrao, new Aleatorio(s));
    if (!r.critico) continue;
    criticos++;
    assert.ok(r.dano > Math.floor(base * 0.85 * 1.5) - 1);
  }
  // 6% de 2000 ≈ 120; a faixa é larga de propósito, é só uma sanidade
  assert.ok(criticos > 40 && criticos < 250, `críticos demais ou de menos: ${criticos}`);
});

test('a mesma semente sempre dá o mesmo dano', () => {
  const a = calcularDano(padrao, new Aleatorio(12345));
  const b = calcularDano(padrao, new Aleatorio(12345));
  assert.deepEqual(a, b);
});

test('o dano nunca é zero quando o golpe tem potência', () => {
  const fraco = { nivel: 1, ataque: 5, defesa: 999, potencia: 10,
                  afinidade: false, eficacia: 1 };
  assert.ok(calcularDano(fraco, new Aleatorio(7)).dano >= 1);
});

test('afinidade só vale para o próprio tipo, e nunca para golpe neutro', () => {
  assert.equal(temAfinidade('fogo', ['fogo']), true);
  assert.equal(temAfinidade('fogo', ['agua', 'fogo']), true);
  assert.equal(temAfinidade('fogo', ['agua']), false);
  assert.equal(temAfinidade('neutro', ['fogo']), false);
});

test('precisão 0 quer dizer "nunca erra"', () => {
  for (let s = 0; s < 50; s++) assert.equal(acertou(0, new Aleatorio(s)), true);
});

test('precisão 100 acerta sempre e precisão baixa erra às vezes', () => {
  for (let s = 0; s < 50; s++) assert.equal(acertou(100, new Aleatorio(s)), true);
  let erros = 0;
  for (let s = 0; s < 400; s++) if (!acertou(70, new Aleatorio(s))) erros++;
  assert.ok(erros > 60 && erros < 180, `erros fora do esperado: ${erros}`);
});
