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

/* ------------------------------------------------- gente e Encantados (12c) */

import * as THREE from 'three';
import { ESTILOS } from '../../art/people.ts';
import { ARTE_CRIATURAS } from '../../art/creatures.ts';
import { ESPECIES_ORDEM, especie } from '../../data/creatures.ts';
import { animarPessoa, pessoa3D } from './humanoide.ts';
import { CORPO_DA_ESPECIE, animarEncantado, coresDoDesenho, encantado3D, tamanhoDe } from './encantado3d.ts';

const mat = new THREE.MeshLambertMaterial({ vertexColors: true });

test('todo estilo de gente vira boneco, com braços e pernas que se mexem', () => {
  for (const [nome, op] of Object.entries(ESTILOS)) {
    const g = pessoa3D(op, mat);
    for (const parte of ['corpo', 'tronco', 'bracoE', 'bracoD', 'pernaE', 'pernaD']) {
      assert.ok(g.getObjectByName(parte), `${nome} sem ${parte}`);
    }
  }
  const g = pessoa3D(ESTILOS['taina']!, mat);
  const perna = () => g.getObjectByName('pernaE')!.rotation.x;
  animarPessoa(g, { dir: 'baixo', movendo: true, fasePasso: 0.5, nadando: false }, 0, 0.016);
  const a = perna();
  animarPessoa(g, { dir: 'baixo', movendo: true, fasePasso: 1.5, nadando: false }, 0, 0.016);
  assert.ok(Math.abs(a - perna()) > 0.5, 'a perna vai e volta no passo');
  animarPessoa(g, { dir: 'baixo', movendo: false, fasePasso: 0, nadando: true }, 0, 0.016);
  assert.equal(g.getObjectByName('pernaE')!.visible, false, 'nadando, as pernas somem');
});

test('toda espécie tem corpo, cores do próprio desenho e modelo', () => {
  for (const id of ESPECIES_ORDEM) {
    assert.ok(CORPO_DA_ESPECIE[id], `${id} sem corpo`);
    const b = ARTE_CRIATURAS[especie(id).arte]!();
    const c = coresDoDesenho(b);
    for (const k of [c.principal, c.secundaria, c.destaque]) assert.match(k, /^#[0-9a-f]{6}$/, id);
    assert.notEqual(c.principal, '#191221', `${id}: a cor principal é o contorno`);
    const g = encantado3D(id, b, mat);
    assert.ok(g.getObjectByName('corpo'), id);
    const t = tamanhoDe(id);
    assert.ok(t >= 0.8 && t <= 1.4, `${id}: tamanho ${t}`);
  }
  assert.ok(tamanhoDe('mboitata') > tamanhoDe('boitatinha'), 'a forma de cima é maior');
  assert.equal(tamanhoDe('cobraNorato'), 1.4);
});

test('o desmaio deixa o Encantado deitado; o ataque avança', () => {
  const g = encantado3D('lobinho', ARTE_CRIATURAS['lobinho']!(), mat);
  const corpo = g.getObjectByName('corpo')!;
  animarEncantado(g, 'atacar', 0.22, 0);
  assert.ok(corpo.position.z > 0.3);
  animarEncantado(g, 'desmaio', 1, 0);
  assert.ok(Math.abs(corpo.rotation.z - Math.PI / 2) < 0.01);
});
