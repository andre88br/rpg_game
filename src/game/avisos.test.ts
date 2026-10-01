import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarAvisos } from './avisos.ts';
import { novoJogo } from './state.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { CONTAS_NA_GUIA } from '../art/tiles.ts';
import type { ContextoMapa } from '../world/tilemap.ts';

const comContas = (n: number): ContextoMapa => ({ contas: () => n, nadar: false, ligada: () => false });

test('toda placa sem condição responde ao A no próprio tile', () => {
  const e = novoJogo();
  for (const def of Object.values(MAPAS)) {
    const avisos = montarAvisos(def, e, comContas(0));
    for (const o of def.objetos) {
      if (o.tipo !== 'placa' || !o.placa || o.falas || o.se || o.seNao) continue;
      assert.equal(avisos.get(`${o.tx},${o.ty}`)?.nome, 'PLACA', `${def.id}: placa em ${o.tx},${o.ty}`);
    }
  }
});

test('a guia do terreiro conta as contas acesas', () => {
  const def = Object.values(MAPAS).find((d) => d.objetos.some((o) => o.tipo === 'portao' && o.contas === undefined))!;
  const o = def.objetos.find((x) => x.tipo === 'portao' && x.contas === undefined)!;
  const e = novoJogo();
  const fala = (n: number) => montarAvisos(def, e, comContas(n)).get(`${o.tx},${o.ty}`)!.falas[0]!.linhas.join(' ');
  assert.match(fala(0), /Todas apagadas/);
  assert.match(fala(2), new RegExp(`2 de ${CONTAS_NA_GUIA}`));
  assert.match(fala(CONTAS_NA_GUIA), /brilham/);
});

test('objeto que saiu do mapa também não responde ao A', () => {
  const e = novoJogo();
  for (const def of Object.values(MAPAS)) {
    for (const o of def.objetos) {
      if (!o.falas || !o.se) continue;
      // nenhuma das condições ligada num jogo novo: o objeto não está lá
      const avisos = montarAvisos(def, e, comContas(0));
      const outro = def.objetos.some((x) => x !== o && x.tx === o.tx && x.ty === o.ty);
      if (!outro && typeof o.se === 'string' && !o.se.startsWith('!')) {
        assert.equal(avisos.has(`${o.tx},${o.ty}`), false, `${def.id}: ${o.tipo} em ${o.tx},${o.ty}`);
      }
    }
  }
});
