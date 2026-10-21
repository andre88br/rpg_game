import test from 'node:test';
import assert from 'node:assert/strict';
import { novoJogo, ligar } from './state.ts';
import { criar } from '../battle/encantado.ts';
import { MAPA_INICIAL } from '../data/mapas/index.ts';
import { marcosDe, novosMarcos, registrarProgresso } from './telemetria.ts';

const caminhos = (e: ReturnType<typeof novoJogo>) => marcosDe(e).map((m) => m.caminho);

test('jogo recém-começado: só a região e o mapa iniciais', () => {
  const e = novoJogo();
  assert.equal(e.posicao.mapa, MAPA_INICIAL);
  assert.deepEqual(caminhos(e), ['regiao/1-agua', `mapa/${MAPA_INICIAL}`]);
});

test('time, medalhas, capturas e campeão viram marcos', () => {
  const e = novoJogo();
  e.time = [criar('iarinha', 5)];
  e.medalhas = ['mare', 'raiz'];
  e.capturados = Array.from({ length: 12 }, (_, i) => `x${i}`);
  e.posicao = { mapa: 'aldeiaTupa', tx: 1, ty: 1, dir: 'baixo' };
  ligar(e, 'campeao');
  const c = caminhos(e);
  for (const esperado of ['marco/primeiro-encantado', 'regiao/5-raio', 'mapa/aldeiaTupa',
    'medalhas/1', 'medalhas/2', 'capturados/1', 'capturados/10', 'marco/campeao']) {
    assert.ok(c.includes(esperado), esperado);
  }
  assert.ok(!c.includes('medalhas/3'));
  assert.ok(!c.includes('capturados/25'));
});

test('o que já foi contado não volta', () => {
  const e = novoJogo();
  e.medalhas = ['mare'];
  const novos = novosMarcos(e, new Set(['regiao/1-agua', 'medalhas/1']));
  assert.deepEqual(novos.map((m) => m.caminho), [`mapa/${MAPA_INICIAL}`]);
});

test('fora do site publicado, registrar não estoura nem manda nada', () => {
  assert.doesNotThrow(() => registrarProgresso(novoJogo()));
});
