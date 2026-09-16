import test from 'node:test';
import assert from 'node:assert/strict';
import { Aleatorio } from '../core/rng.ts';
import { chanceCaptura, tentarCaptura } from './capture.ts';
import { criar, hpMaximo, type Encantado } from './encantado.ts';
import { item } from '../data/items.ts';

function selvagem(id = 'piragua', nv = 8): Encantado {
  return criar(id, nv, { selvagem: true });
}
const patua = (id: string) => {
  const e = item(id).efeito;
  if (e.k !== 'patua') throw new Error('não é patuá');
  return e.bonus;
};

test('bicho machucado é mais fácil de pegar', () => {
  const cheio = selvagem();
  const caido = selvagem();
  caido.hp = 1;
  assert.ok(chanceCaptura(caido, 1) > chanceCaptura(cheio, 1));
});

test('patuá melhor aumenta a chance', () => {
  const alvo = selvagem();
  alvo.hp = Math.floor(hpMaximo(alvo) / 2);
  const comum = chanceCaptura(alvo, patua('patua'));
  const bom = chanceCaptura(alvo, patua('patua_bom'));
  const mestre = chanceCaptura(alvo, patua('patua_mestre'));
  assert.ok(bom > comum);
  assert.ok(mestre > bom);
});

test('estado alterado ajuda, e dormir ajuda mais que paralisar', () => {
  const base = selvagem();
  base.hp = Math.floor(hpMaximo(base) / 2);
  const sem = chanceCaptura(base, 1);

  const par = selvagem(); par.hp = base.hp; par.status = 'paralisado';
  const drm = selvagem(); drm.hp = base.hp; drm.status = 'dormindo';
  assert.ok(chanceCaptura(par, 1) > sem);
  assert.ok(chanceCaptura(drm, 1) > chanceCaptura(par, 1));
});

test('espécie rara é mais difícil que espécie comum no mesmo estado', () => {
  const comum = selvagem('piragua');
  const raro = criar('boitatao', 8, { selvagem: true });
  comum.hp = 1; raro.hp = 1;
  assert.ok(chanceCaptura(raro, 1) < chanceCaptura(comum, 1));
});

test('a chance fica sempre entre 0 e 1', () => {
  const alvo = selvagem();
  alvo.hp = 1;
  assert.ok(chanceCaptura(alvo, 100) <= 1);
  assert.ok(chanceCaptura(alvo, 0) >= 0);
});

test('chance travada em 1 captura na hora, com os quatro balanços', () => {
  const alvo = selvagem();
  alvo.hp = 1;
  const r = tentarCaptura(alvo, 100, new Aleatorio(1));
  assert.equal(r.capturado, true);
  assert.equal(r.balancos, 4);
});

test('capturou se e somente se balançou as quatro vezes', () => {
  const rnd = new Aleatorio(99);
  for (let i = 0; i < 400; i++) {
    const alvo = selvagem();
    alvo.hp = Math.max(1, Math.floor(hpMaximo(alvo) * 0.4));
    const r = tentarCaptura(alvo, 1, rnd);
    assert.equal(r.capturado, r.balancos === 4);
    assert.ok(r.balancos >= 0 && r.balancos <= 4);
  }
});

test('a taxa observada bate com a chance calculada', () => {
  const rnd = new Aleatorio(2024);
  const molde = selvagem();
  molde.hp = Math.floor(hpMaximo(molde) * 0.3);
  const esperada = chanceCaptura(molde, 1);

  let pegos = 0;
  const n = 4000;
  for (let i = 0; i < n; i++) {
    const alvo = selvagem();
    alvo.hp = molde.hp;
    if (tentarCaptura(alvo, 1, rnd).capturado) pegos++;
  }
  const obtida = pegos / n;
  assert.ok(Math.abs(obtida - esperada) < 0.05,
            `esperava ~${esperada.toFixed(3)}, obtive ${obtida.toFixed(3)}`);
});

test('a mesma semente dá sempre o mesmo resultado', () => {
  const a = tentarCaptura(selvagem(), 1, new Aleatorio(777));
  const b = tentarCaptura(selvagem(), 1, new Aleatorio(777));
  assert.deepEqual(a, b);
});
