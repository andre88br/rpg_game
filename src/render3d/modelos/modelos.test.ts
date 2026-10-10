import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from '../../data/mapas/index.ts';
import { regiaoDoMapa, lugarNoMundo } from '../../data/mundo.ts';
import { colunaPorta } from '../../art/tiles.ts';
import { modeloDe, TIPOS_DE_OBJETO } from '../relevo.ts';
import { ESTILO_DA_REGIAO, predio3D } from './casas.ts';
import { FUNDO_PLACA_TERREIRO, TERREIRO_3D } from './terreiros.ts';
import { terreiroDaRegiao } from '../../art/predios.ts';
import { P, type Tipo } from '../../art/palette.ts';
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
      // o letreiro: todo prédio de serviço tem, cabe na fachada e fica na
      // frente de tudo o que passa pelo vão dele (senão a câmera não o vê)
      const comLetreiro = ['terreiro', 'benzimento', 'loja', 'posto', 'forja', 'moinho', 'arena'].includes(o.tipo);
      assert.equal(p.letreiro !== undefined, comLetreiro, `${id}: letreiro de ${o.tipo}`);
      if (p.letreiro && o.tipo !== 'arena') {
        const l = p.letreiro;
        assert.ok(l.x - l.larg / 2 >= 0 && l.x + l.larg / 2 <= w, `${id}: letreiro de ${o.tipo} sai da fachada`);
        p.geo.computeBoundingBox();
        const pos = p.geo.getAttribute('position');
        for (let i = 0; i < pos.count; i++) {
          if (Math.abs(pos.getX(i) - l.x) < l.larg / 2 && pos.getY(i) > l.y) {
            assert.ok(pos.getZ(i) < l.z, `${id}: ${o.tipo} tem peça na frente do letreiro`);
          }
        }
      }
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
import { animarEncantado, encantado3D, tamanhoDe } from './encantado3d.ts';

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

/* as cores de vértice de todo o modelo, em hex */
function coresDoModelo(g: THREE.Object3D): Set<string> {
  const cores = new Set<string>();
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    const a = m.isMesh ? m.geometry.getAttribute('color') : null;
    if (!a) return;
    for (let k = 0; k < a.count; k += 3) cores.add('#' + new THREE.Color(a.getX(k), a.getY(k), a.getZ(k)).getHexString());
  });
  return cores;
}

test('todo Encantado 3D sai do próprio desenho: as cores dele, de pé, do tamanho certo', () => {
  for (const id of ESPECIES_ORDEM) {
    const b = ARTE_CRIATURAS[especie(id).arte]!();
    // as duas cores que mais aparecem no desenho (sem o contorno)
    const conta = new Map<string, number>();
    for (const c of b.d) if (c && c !== '#191221' && c.length === 7) conta.set(c.toLowerCase(), (conta.get(c.toLowerCase()) ?? 0) + 1);
    const maiores = [...conta.entries()].sort((x, y) => y[1] - x[1]).slice(0, 2).map(([c]) => c);
    const g = encantado3D(id, false, mat);
    assert.ok(g.getObjectByName('corpo'), id);
    const cores = coresDoModelo(g);
    for (const c of maiores) assert.ok(cores.has(c), `${id}: falta a cor ${c} do desenho`);
    const caixa = new THREE.Box3().setFromObject(g);
    const alto = caixa.max.y - caixa.min.y, t = tamanhoDe(id);
    assert.ok(alto > 0.5 * t && alto < 1.6 * t, `${id}: altura ${alto.toFixed(2)}`);
    assert.ok(caixa.min.y > -0.05, `${id}: afunda no chão (${caixa.min.y.toFixed(2)})`);
    const raro = coresDoModelo(encantado3D(id, true, mat));
    assert.ok([...raro].some((c) => !cores.has(c)), `${id}: o raro tem as mesmas cores`);
    assert.ok(t >= 0.8 && t <= 1.4, `${id}: tamanho ${t}`);
  }
  assert.ok(tamanhoDe('mboitata') > tamanhoDe('boitatinha'), 'a forma de cima é maior');
  assert.equal(tamanhoDe('cobraNorato'), 1.4);
});

test('o desmaio deixa o Encantado deitado; o ataque avança', () => {
  const g = encantado3D('lobinho', false, mat);
  const corpo = g.getObjectByName('corpo')!;
  animarEncantado(g, 'atacar', 0.22, 0);
  assert.ok(corpo.position.z > 0.3);
  animarEncantado(g, 'desmaio', 1, 0);
  assert.ok(Math.abs(corpo.rotation.z - Math.PI / 2) < 0.01);
});

/* as cores de vértice de um modelo, para comparar com o desenho */
function coresDe(g: THREE.BufferGeometry): THREE.Color[] {
  const c = g.getAttribute('color');
  const vistas = new Map<string, THREE.Color>();
  for (let i = 0; i < c.count; i++) {
    const k = `${c.getX(i).toFixed(4)},${c.getY(i).toFixed(4)},${c.getZ(i).toFixed(4)}`;
    if (!vistas.has(k)) vistas.set(k, new THREE.Color(c.getX(i), c.getY(i), c.getZ(i)));
  }
  return [...vistas.values()];
}
const tem = (cores: THREE.Color[], hex: string) => {
  const a = new THREE.Color(hex);
  return cores.some((b) => Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) < 0.01);
};

test('loja, benzimento, posto, forja e moinho: a mesma construção do 2D em toda região', () => {
  for (const tipo of ['loja', 'benzimento', 'posto', 'forja', 'moinho'] as const) {
    const contas = REGIOES.map((r) => predio3D(r, tipo, 5, 4, 2).geo.getAttribute('position').count);
    assert.ok(contas.every((n) => n === contas[0]), `${tipo} muda de forma com a região`);
    const cores = coresDe(predio3D('raio', tipo, 5, 4, 2).geo);
    assert.ok(tem(cores, P.wall!) && tem(cores, P.door!) && tem(cores, P.win!), `${tipo}: parede, porta e janela do 2D`);
  }
  assert.ok(tem(coresDe(predio3D('terra', 'loja', 5, 4, 2).geo), '#3f8f6f'), 'o telhado verde da loja');
  assert.ok(tem(coresDe(predio3D('luz', 'benzimento', 5, 4, 2).geo), '#c25d8f'), 'o telhado rosa do benzimento');
});

test('o terreiro 3D de cada região tem as cores do desenho 2D', () => {
  for (const r of Object.keys(TERREIRO_3D) as Tipo[]) {
    // as cores que mais aparecem no desenho, sem o contorno e sem a placa
    const b = terreiroDaRegiao(r, 7, 5, 3);
    const conta = new Map<string, number>();
    for (let y = 0; y < b.h; y++) {
      for (let x = 0; x < b.w; x++) {
        const c = b.get(x, y);
        if (!c || c === P.ink || c === '#ffffff' || c === FUNDO_PLACA_TERREIRO[r]) continue;
        conta.set(c, (conta.get(c) ?? 0) + 1);
      }
    }
    const principais = [...conta.entries()].sort((a, z) => z[1] - a[1]).slice(0, 4).map(([c]) => c);
    const p = predio3D(r, 'terreiro', 7, 5, 3);
    const cores = coresDe(p.geo);
    for (const c of principais) assert.ok(tem(cores, c), `terreiro de ${r}: falta a cor ${c} do 2D`);
    assert.equal(p.letreiro?.fundo, FUNDO_PLACA_TERREIRO[r], `terreiro de ${r}: placa da cor do 2D`);
  }
});
