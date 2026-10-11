import test from 'node:test';
import assert from 'node:assert/strict';
import {
  definirQualidade, definirVelocidade, definirVisao3D, obterQualidade, palpiteQualidade, multiplicadorVelocidade, obterVelocidade, obterVisao3D,
  usarArmazemConfig, obterVolume, definirVolume, proximoVolume,
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

test('qualidade: o palpite pelo aparelho', () => {
  assert.equal(palpiteQualidade({ toque: true, ladoMenor: 412 }), 'leve', 'celular');
  assert.equal(palpiteQualidade({ toque: false, ladoMenor: 1080, nucleos: 8, memoria: 8 }), 'alta', 'computador');
  assert.equal(palpiteQualidade({ toque: true, ladoMenor: 1024, nucleos: 8 }), 'alta', 'tablet grande e forte');
  assert.equal(palpiteQualidade({ toque: false, ladoMenor: 1080, nucleos: 4 }), 'leve', 'poucos núcleos');
  assert.equal(palpiteQualidade({ toque: false, ladoMenor: 1080, nucleos: 8, memoria: 2 }), 'leve', 'pouca memória');
});

test('qualidade: a escolha persiste e não mexe na visão', () => {
  const ls = memoria();
  usarArmazemConfig(ls);
  definirQualidade('leve');
  usarArmazemConfig(ls);
  assert.equal(obterQualidade(), 'leve');
  assert.equal(obterVisao3D(), true);
  definirQualidade('alta');
  usarArmazemConfig(ls);
  assert.equal(obterQualidade(), 'alta');
});

test('volumes: MÉDIO por padrão, cada canal por si, e persistem', () => {
  const ls = memoria();
  usarArmazemConfig(ls);
  assert.equal(obterVolume('musica'), 2);
  assert.equal(obterVolume('efeitos'), 2);
  definirVolume('musica', 0);
  assert.equal(obterVolume('musica'), 0);
  assert.equal(obterVolume('efeitos'), 2);
  usarArmazemConfig(ls);                 // relê do armazém
  assert.equal(obterVolume('musica'), 0);
});

test('proximoVolume dá a volta nos dois sentidos', () => {
  assert.equal(proximoVolume(3), 0);
  assert.equal(proximoVolume(0, -1), 3);
  assert.equal(proximoVolume(1), 2);
});

test('a velocidade do texto é à parte da de andar, e sobrevive à volta', async () => {
  const { obterVelTexto, definirVelTexto, multiplicadorTexto } = await import('./config.ts');
  const m = memoria();
  usarArmazemConfig(m);
  assert.equal(obterVelTexto(), 'normal');
  definirVelTexto('instantaneo');
  assert.equal(multiplicadorVelocidade(), 1, 'andar continua igual');
  assert.ok(multiplicadorTexto() >= 1e5);
  assert.ok(Number.isFinite(multiplicadorTexto() * 0), 'dt zero não vira NaN');
  usarArmazemConfig(m);
  assert.equal(obterVelTexto(), 'instantaneo');
});

test('tecla própria: uma por ação, sem repetir, e o padrão limpa', async () => {
  const { obterTeclas, definirTecla, limparTeclas } = await import('./config.ts');
  const m = memoria();
  usarArmazemConfig(m);
  definirTecla('a', 'KeyJ');
  definirTecla('b', 'KeyJ');            // a mesma tecla passa para o B
  assert.deepEqual(obterTeclas(), { b: 'KeyJ' });
  definirTecla('menu', 'KeyM');
  usarArmazemConfig(m);
  assert.deepEqual(obterTeclas(), { b: 'KeyJ', menu: 'KeyM' });
  limparTeclas();
  assert.deepEqual(obterTeclas(), {});
  m.dados.set('encantados:config:teclas:v1', 'lixo{');
  usarArmazemConfig(m);
  assert.deepEqual(obterTeclas(), {}, 'gravação estragada não derruba');
});
