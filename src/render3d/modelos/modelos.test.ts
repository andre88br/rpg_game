import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from '../../data/mapas/index.ts';
import { regiaoDoMapa, lugarNoMundo } from '../../data/mundo.ts';
import { colunaPorta } from '../../art/tiles.ts';
import { modeloDe, TIPOS_DE_OBJETO } from '../relevo.ts';
import { ESTILO_DA_REGIAO, predio3D } from './casas.ts';
import { objeto3D, temModelo3D } from './objetos.ts';
import { ARVORES, ARVORES_DA_REGIAO, MATO_DA_REGIAO, arvoreDoTile, modeloArvore, modeloPedra } from './vegetacao.ts';

const REGIOES = ['agua', 'planta', 'fogo', 'vento', 'raio', 'terra', 'sombra', 'luz', 'fora'];

test('toda região tem casa, árvore e mato', () => {
  for (const r of REGIOES) {
    assert.ok(ESTILO_DA_REGIAO[r], `${r} sem casa`);
    assert.ok(ARVORES_DA_REGIAO[r]?.length, `${r} sem árvore`);
    assert.ok(MATO_DA_REGIAO[r], `${r} sem mato`);
  }
});

test('todo modelo de árvore tem geometria, com a base no chão', () => {
  for (const a of ARVORES) {
    const g = modeloArvore(a);
    g.computeBoundingBox();
    assert.ok(g.getAttribute('position').count > 0, a);
    assert.ok(g.getAttribute('color'), `${a} sem cor`);
    assert.ok(g.boundingBox!.min.y > -0.15 && g.boundingBox!.max.y > 0.5, `${a}: ${g.boundingBox!.min.y}..${g.boundingBox!.max.y}`);
  }
  assert.ok(modeloPedra().getAttribute('position').count > 0);
  assert.equal(arvoreDoTile('agua', 3, 4, true), 'coqueiro');
  assert.notEqual(arvoreDoTile('terra', 3, 4, true), 'coqueiro', 'coqueiro só na Foz');
});

test('toda construção de todo mapa vira modelo, com a porta na coluna do mapa plano', () => {
  for (const [id, def] of Object.entries(MAPAS)) {
    const reg = regiaoDoMapa(lugarNoMundo(id, MAPAS) ?? id)?.tipo ?? null;
    for (const o of def.objetos) {
      if (modeloDe(o.tipo) !== 'predio') continue;
      const w = o.larg ?? 4, alt = o.alt ?? 3;
      const p = predio3D(reg, o.tipo, w, alt, o.portaCol);
      assert.ok(p.geo.getAttribute('position').count > 30, `${id}: ${o.tipo} vazio`);
      if (o.tipo !== 'balao') assert.equal(p.portaCol, colunaPorta(w, o.portaCol), `${id}: porta de ${o.tipo}`);
      p.geo.dispose();
    }
  }
});

test('todo objeto de mapa tem modelo 3D, translúcido ou recorte', () => {
  for (const t of TIPOS_DE_OBJETO) {
    const m = modeloDe(t);
    if (m === 'objeto') assert.ok(temModelo3D(t), `${t} diz objeto mas não tem modelo`);
  }
  for (const [id, def] of Object.entries(MAPAS)) {
    for (const o of def.objetos) {
      if (modeloDe(o.tipo) !== 'objeto') continue;
      const g = objeto3D(o, 3);
      assert.ok(g && g.getAttribute('position').count > 0, `${id}: ${o.tipo}`);
      g!.dispose();
    }
  }
});
