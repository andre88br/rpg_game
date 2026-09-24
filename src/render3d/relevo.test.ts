import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from '../data/mapas/index.ts';
import { REGIOES } from '../data/mundo.ts';
import { EM_3D, NIVEL_AGUA, PREDIOS, modeloDe, relevoDe } from './relevo.ts';

test('a vista 3D cobre exatamente a Região da Foz', () => {
  const foz = REGIOES.find((r) => r.tipo === 'agua')!;
  assert.deepEqual([...EM_3D].sort(), [...foz.mapas].sort());
});

test('toda letra de chão da Foz tem relevo, e o piso dela também', () => {
  for (const id of EM_3D) {
    for (const linha of MAPAS[id]!.chao) {
      for (const ch of linha) {
        const r = relevoDe(ch);
        assert.ok(r, `${id}: a letra "${ch}" não tem relevo`);
        assert.ok(relevoDe(r!.piso), `${id}: "${ch}" pinta o topo com "${r!.piso}", sem relevo`);
      }
    }
  }
});

test('água fica abaixo da lâmina, e todo chão andável fica acima dela', () => {
  for (const ch of '.,=fapTm_u#o') {
    const r = relevoDe(ch)!;
    assert.equal(r.agua, false);
    assert.ok(r.altura > NIVEL_AGUA, `${ch} afundaria na água`);
  }
  assert.ok(relevoDe('~')!.altura < NIVEL_AGUA);
});

test('toda construção da Foz vira prédio, com as cores do telhado do mapa plano', () => {
  for (const id of EM_3D) {
    for (const o of MAPAS[id]!.objetos) {
      if (['casa', 'loja', 'benzimento', 'terreiro'].includes(o.tipo)) {
        assert.equal(modeloDe(o.tipo), 'predio');
        assert.ok(PREDIOS[o.tipo]!.telhado.startsWith('#'));
      }
    }
  }
  assert.equal(modeloDe('farol'), 'farol');
  assert.equal(modeloDe('placa'), 'recorte');
});
