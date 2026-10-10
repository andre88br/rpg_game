import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from '../data/mapas/index.ts';
import { TILES } from '../world/tilemap.ts';
import {
  LETRAS_COM_RELEVO, NIVEL_AGUA, PREDIOS, TIPOS_DE_OBJETO, luzDe, modeloDe, relevoDe,
} from './relevo.ts';

test('toda letra de chão de todo mapa registrado tem relevo — as 27', () => {
  assert.deepEqual([...LETRAS_COM_RELEVO].sort(), Object.keys(TILES).sort());
  for (const [id, def] of Object.entries(MAPAS)) {
    for (const linha of def.chao) {
      for (const ch of linha) assert.ok(relevoDe(ch), `${id}: a letra "${ch}" não tem relevo`);
    }
  }
});

test('todo tipo de objeto usado num mapa tem modelo', () => {
  for (const [id, def] of Object.entries(MAPAS)) {
    for (const o of def.objetos) {
      assert.ok(TIPOS_DE_OBJETO.includes(o.tipo), `${id}: ${o.tipo} sem modelo`);
      if (modeloDe(o.tipo) === 'predio') assert.ok(PREDIOS[o.tipo], `${o.tipo} sem cores de prédio`);
    }
  }
});

test('água fica abaixo da lâmina, e todo chão andável fica acima dela', () => {
  for (const ch of LETRAS_COM_RELEVO) {
    const r = relevoDe(ch)!;
    assert.match(r.cor, /^#[0-9a-f]{6}$/, ch);
    if (r.agua) assert.ok(r.altura < NIVEL_AGUA);
    else assert.ok(r.altura > NIVEL_AGUA, `${ch} afundaria na água`);
    if (TILES[ch]!.solido && !r.agua) assert.ok(r.bloco || r.enfeite !== 'nada' || r.brilha, `${ch} é sólido e não tem nada em cima`);
  }
});

test('toda construção de todo mapa vira prédio, com as cores do telhado do mapa plano', () => {
  for (const id of Object.keys(MAPAS)) {
    for (const o of MAPAS[id]!.objetos) {
      if (['casa', 'loja', 'benzimento', 'terreiro'].includes(o.tipo)) {
        assert.equal(modeloDe(o.tipo), 'predio');
        assert.ok(PREDIOS[o.tipo]!.telhado.startsWith('#'));
      }
    }
  }
  assert.equal(modeloDe('farol'), 'farol');
  assert.equal(modeloDe('placa'), 'objeto');
  assert.equal(modeloDe('ladrilho'), 'recorte');
  assert.equal(modeloDe('veu'), 'translucido');
});

test('a luz: noite é mais escura que dia, chuva apaga o sol, neblina aproxima a névoa', () => {
  const dia = luzDe('agua', 'dia', 'limpo', false);
  const noite = luzDe('agua', 'noite', 'limpo', false);
  assert.ok(noite.solForca < dia.solForca && noite.hemi < dia.hemi);
  assert.ok(luzDe('agua', 'dia', 'chuva', false).solForca < dia.solForca);
  assert.ok(luzDe('sombra', 'dia', 'neblina', false).nevoaLonge < dia.nevoaLonge);
  assert.notEqual(luzDe('fogo', 'dia', 'limpo', false).ceuTopo, dia.ceuTopo, 'cada região tem o seu céu');
  const casa = luzDe('agua', 'noite', 'chuva', true);
  assert.equal(casa.solForca, luzDe(null, 'dia', 'limpo', true).solForca, 'dentro de casa não chove');
});
