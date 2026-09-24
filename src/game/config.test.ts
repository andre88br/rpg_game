import test from 'node:test';
import assert from 'node:assert/strict';
import {
  definirVelocidade, definirVisao3D, multiplicadorVelocidade, obterVelocidade, obterVisao3D,
  usarArmazemConfig,
} from './config.ts';
import type { Armazem } from './save.ts';

function memoria(): Armazem & { dados: Map<string, string> } {
  const dados = new Map<string, string>();
  return {
    dados,
    getItem: (k) => dados.get(k) ?? null,
    setItem: (k, v) => { dados.set(k, v); },
    removeItem: (k) => { dados.delete(k); },
  };
}

test('sem nada gravado, a velocidade padrão é normal e vale 1x', () => {
  usarArmazemConfig(memoria());
  assert.equal(obterVelocidade(), 'normal');
  assert.equal(multiplicadorVelocidade(), 1);
});

test('definirVelocidade muda o multiplicador e persiste no armazém', () => {
  const ls = memoria();
  usarArmazemConfig(ls);
  definirVelocidade('turbo');
  assert.equal(obterVelocidade(), 'turbo');
  assert.ok(multiplicadorVelocidade() > 1);
  assert.equal(ls.dados.get('encantados:config:v1'), 'turbo');
});

test('uma sessão nova lê a velocidade que a anterior gravou', () => {
  const ls = memoria();
  usarArmazemConfig(ls);
  definirVelocidade('rapida');
  usarArmazemConfig(ls);            // simula uma nova sessão, mesmo armazém
  assert.equal(obterVelocidade(), 'rapida');
});

test('sem armazém nenhum, a velocidade ainda funciona em memória', () => {
  usarArmazemConfig(null);
  definirVelocidade('turbo');
  assert.equal(obterVelocidade(), 'turbo');
  usarArmazemConfig(null);
  definirVelocidade('normal');
});

test('a visão 3D vem ligada, e desligar vale para a próxima sessão', () => {
  const ls = memoria();
  usarArmazemConfig(ls);
  assert.equal(obterVisao3D(), true);
  definirVisao3D(false);
  usarArmazemConfig(ls);
  assert.equal(obterVisao3D(), false);
  assert.equal(obterVelocidade(), 'normal', 'a visão não mexe na velocidade');
});
