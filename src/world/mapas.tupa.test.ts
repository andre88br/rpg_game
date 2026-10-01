/* =========================================================================
   Coerência dos mapas — Aldeia Tupã.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa, type DefMapa } from './tilemap.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { ABERTO, FECHADO, entradas, alcance, resolverChaves } from './mapas.apoio.ts';

/* ------------------------------------------- Aldeia Tupã: para os lados */

const MAPAS_REGIAO5_FORA = ['campinaDosRaios', 'aldeiaTupa', 'charcoRelampejante', 'morroDoTrovao'];

test('a região 5 cresce para os lados: todo mapa externo dela é bem mais largo que os antigos', () => {
  /* as quatro regiões anteriores nunca passaram de 34 colunas ao ar livre */
  const antigos = ['vilaAurora', 'rotaFoz', 'portoIara', 'igarapeCurupira', 'mataDoCurupira',
                   'trilhaDaBrasa', 'vilaFornalha', 'cavernaBoitata', 'cumeeiraBoitata',
                   'campoAberto', 'ventaniaFunda', 'aldeiaCatavento', 'topoDoRedemoinho'];
  const maisLargoAntigo = Math.max(...antigos.map((id) => MAPAS[id]!.chao[0]!.length));
  assert.equal(maisLargoAntigo, 34);
  let tiles = 0;
  for (const id of MAPAS_REGIAO5_FORA) {
    const def = MAPAS[id]!;
    const larg = def.chao[0]!.length;
    assert.ok(larg >= 56, `${id}: só ${larg} colunas`);
    assert.ok(def.chao.length >= 34, `${id}: só ${def.chao.length} linhas — devia crescer para baixo também`);
    tiles += larg * def.chao.length;
  }
  // a Serra Boitatá, a maior até então, tinha 4.480 tiles ao ar livre
  assert.ok(tiles >= 2 * 4480, `a região 5 tem ${tiles} tiles ao ar livre`);
});

test('a Aldeia Tupã tem estrada para oeste, leste e norte', () => {
  const def = MAPAS['aldeiaTupa']!;
  const larg = def.chao[0]!.length;
  const para = (s: { tx: number; ty: number }): string =>
    s.tx === 0 ? 'oeste' : s.tx === larg - 1 ? 'leste' : s.ty === 0 ? 'norte' : 'porta';
  const lados = new Map<string, string>();
  for (const s of def.saidas ?? []) lados.set(para(s), s.para);
  assert.equal(lados.get('oeste'), 'campinaDosRaios');
  assert.equal(lados.get('leste'), 'charcoRelampejante');
  assert.equal(lados.get('norte'), 'morroDoTrovao');
});

test('o vão leste do Topo do Redemoinho só abre com a Medalha Rodamoinho', () => {
  const def = MAPAS['topoDoRedemoinho']!;
  const saidas = def.saidas!.filter((s) => s.para === 'campinaDosRaios');
  assert.equal(saidas.length, 2);
  const sem = new Mapa(def, FECHADO);
  const com = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => c === 'medalha:rodamoinho' });
  const pesSem = alcance(sem, def.inicio.tx, def.inicio.ty);
  const pesCom = alcance(com, def.inicio.tx, def.inicio.ty);
  for (const s of saidas) {
    assert.ok(!pesSem.has(`${s.tx},${s.ty}`), 'sem a medalha o vão leste devia estar trancado');
    assert.ok(pesCom.has(`${s.tx},${s.ty}`), 'com a medalha o vão leste devia abrir');
  }
});

test('cada tranca da Campina dos Raios abre com o SEU tambor, e cada tambor fica do lado de cá', () => {
  const def = MAPAS['campinaDosRaios']!;
  const ordem = ['tambor1', 'tambor2', 'tambor3', 'chefe_tambores'];
  const saida = def.saidas!.find((s) => s.para === 'aldeiaTupa')!;
  for (let i = 0; i < ordem.length; i++) {
    const vencidos = new Set(ordem.slice(0, i).map((id) => `venceu_${id}`));
    const m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => vencidos.has(c) });
    const pes = alcance(m, def.inicio.tx, def.inicio.ty);
    const npc = def.npcs.find((n) => n.id === ordem[i])!;
    const deFrente = [[0, -1], [0, 1], [-1, 0], [1, 0]]
      .some(([dx, dy]) => pes.has(`${npc.tx + dx!},${npc.ty + dy!}`));
    assert.ok(deFrente, `${npc.id} devia ser alcançável depois de vencer os anteriores`);
    assert.ok(!pes.has(`${saida.tx},${saida.ty}`),
              `com só ${i} tambores vencidos a saída para a aldeia não devia abrir`);
  }
  const todos = new Set(ordem.map((id) => `venceu_${id}`));
  const m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => todos.has(c) });
  assert.ok(alcance(m, def.inicio.tx, def.inicio.ty).has(`${saida.tx},${saida.ty}`));
});

/* ninguém toca uma chave em pé num tile onde uma cerca pode aparecer */
function nenhumaCercaAoLadoDasChaves(def: DefMapa): void {
  const cercas = new Set(def.objetos.filter((o) => o.tipo === 'cercaRaio').map((o) => `${o.tx},${o.ty}`));
  for (const p of def.objetos.filter((o) => o.tipo === 'paraRaio')) {
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
      assert.ok(!cercas.has(`${p.tx + dx},${p.ty + dy}`),
                `${def.id}: a chave em (${p.tx},${p.ty}) tem uma cerca bem do lado`);
    }
  }
}

const CHAVES_CHARCO = ['chave_charco_a', 'chave_charco_b', 'chave_charco_c'];

test('o casarão do Charco tem solução, e pede seis toques de chave', () => {
  const def = MAPAS['charcoRelampejante']!;
  const mestre = def.objetos.find((o) => o.tipo === 'paraRaio' && o.placa === 'PARA-RAIO MESTRE')!;
  const toques = resolverChaves(def, CHAVES_CHARCO, new Set(), def.inicio,
                                { tx: mestre.tx - 1, ty: mestre.ty });
  assert.equal(toques, 6, `o para-raio mestre devia pedir 6 toques, pediu ${toques}`);
  nenhumaCercaAoLadoDasChaves(def);
});

test('conta_para_raios é alcançável sem nenhum Dom novo — o trecho é obrigatório', () => {
  const def = MAPAS['charcoRelampejante']!;
  const mestre = def.objetos.find((o) => o.tipo === 'paraRaio' && o.placa === 'PARA-RAIO MESTRE'
                                        && o.falas?.some((f) => f.liga === 'conta_para_raios'));
  assert.ok(mestre, 'o para-raio mestre devia acender conta_para_raios');
  // sem dom_faisca e sem medalha nenhuma: a busca acima já usa só as chaves
  const toques = resolverChaves(def, CHAVES_CHARCO, new Set(), def.inicio,
                                { tx: mestre!.tx, ty: mestre!.ty - 1 });
  assert.ok(toques !== null);
});

test('com a conta acesa, todas as cercas do Charco se calam, e os fundos abrem', () => {
  const def = MAPAS['charcoRelampejante']!;
  const m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => c === 'conta_para_raios' });
  for (const o of def.objetos.filter((x) => x.tipo === 'cercaRaio')) {
    assert.ok(!m.solido(o.tx, o.ty), `a cerca em (${o.tx},${o.ty}) devia sumir com a conta`);
  }
  const arco = def.npcs.find((n) => n.id === 'arco_da_velha')!;
  const pes = alcance(m, def.inicio.tx, def.inicio.ty);
  assert.ok(pes.has(`${arco.tx - 1},${arco.ty}`), 'o Arco-da-Velha devia ser alcançável depois da conta');
  const semConta = new Mapa(def, FECHADO);
  for (let mask = 0; mask < 8; mask++) {
    const lig = new Set(CHAVES_CHARCO.filter((_, i) => mask & (1 << i)));
    const mm = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => lig.has(c) });
    assert.ok(!alcance(mm, def.inicio.tx, def.inicio.ty).has(`${arco.tx - 1},${arco.ty}`),
              'antes da conta, chave nenhuma devia abrir os fundos do casarão');
  }
  assert.ok(semConta.solido(58, 20));
});

test('o Terreiro do Trovão tem solução: três guardas, duas chaves, quatro toques', () => {
  const def = MAPAS['terreiroTrovao']!;
  const guardas = new Set(['venceu_guarda_faisca', 'venceu_guarda_relampago', 'venceu_guarda_trovoada']);
  const guaraci = def.npcs.find((n) => n.id === 'guaraci')!;
  const toques = resolverChaves(def, ['chave_tupa_1', 'chave_tupa_2'], guardas, def.inicio,
                                { tx: guaraci.tx + 1, ty: guaraci.ty });
  assert.equal(toques, 4, `o Guaraci devia pedir 4 toques de chave, pediu ${toques}`);
  nenhumaCercaAoLadoDasChaves(def);
  // e sem as guardas, chave nenhuma resolve
  const semGuardas = resolverChaves(def, ['chave_tupa_1', 'chave_tupa_2'], new Set(), def.inicio,
                                    { tx: guaraci.tx + 1, ty: guaraci.ty });
  assert.equal(semGuardas, null, 'sem vencer as guardas não devia dar para chegar ao Guaraci');
});

test('cada guarda do Trovão tranca o trecho seguinte, na ordem', () => {
  const def = MAPAS['terreiroTrovao']!;
  const elos: [string, number, number][] = [
    ['venceu_guarda_faisca', 4, 14],
    ['venceu_guarda_relampago', 23, 4],
    ['venceu_guarda_trovoada', 14, 2],
  ];
  for (const [flag, tx, ty] of elos) {
    assert.ok(new Mapa(def, FECHADO).solido(tx, ty), `a tranca em (${tx},${ty}) devia começar fechada`);
    const m = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    assert.ok(!m.solido(tx, ty), `a tranca em (${tx},${ty}) devia abrir com ${flag}`);
  }
});

test('a Medalha Trovão tem quem a entregue, com o Dom Faísca junto', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  const premio = falas.find((f) => f.medalha === 'trovao');
  assert.ok(premio, 'ninguém entrega a Medalha Trovão');
  assert.equal(premio!.dom, 'faisca');
});

test('as pedras rachadas só cedem ao Dom Faísca, e só travam a estrada das Minas', () => {
  let pedras = 0;
  for (const id of MAPAS_REGIAO5_FORA) {
    const def = MAPAS[id]!;
    const rachadas = def.objetos.filter((o) => o.tipo === 'pedraRachada');
    if (rachadas.length === 0) continue;
    pedras += rachadas.length;
    const esconderijo = def.objetos.find(
      (o) => o.tipo === 'achado' && o.placa === 'ESCONDERIJO' && o.seNao !== undefined)!;
    const alvo = `${esconderijo.tx},${esconderijo.ty}`;
    const semDom = new Mapa(def, { ...ABERTO, ligada: (c) => c !== 'dom_faisca' });
    const comDom = new Mapa(def, ABERTO);
    const pesSem = alcance(semDom, def.inicio.tx, def.inicio.ty);
    assert.ok(!pesSem.has(alvo), `${id}: sem o Dom Faísca o esconderijo devia estar fechado`);
    assert.ok(alcance(comDom, def.inicio.tx, def.inicio.ty).has(alvo),
              `${id}: com o Dom Faísca o esconderijo devia abrir`);
    // o resto do mapa não depende do Dom: toda saída continua alcançável sem
    // ele — menos a estrada para as Minas, que é justamente o que o Dom abre
    const pesCom = alcance(comDom, def.inicio.tx, def.inicio.ty);
    for (const s of def.saidas ?? []) {
      const onde = `${s.tx},${s.ty}`;
      if (s.para === 'bocaDaMina') {
        assert.ok(!pesSem.has(onde), `${id}: sem o Dom Faísca a estrada das Minas devia estar fechada`);
        assert.ok(pesCom.has(onde), `${id}: com o Dom Faísca a estrada das Minas devia abrir`);
        continue;
      }
      assert.ok(pesSem.has(onde), `${id}: a pedra rachada trancou a saída (${onde})`);
    }
  }
  // três esconderijos + as duas da estrada das Minas
  assert.equal(pedras, 5);
});

test('as cinco pedras-de-raio estão espalhadas pelos quatro mapas largos', () => {
  const onde: string[] = [];
  for (const [id, def] of entradas) {
    for (const o of def.objetos) {
      if (o.falas?.some((f) => f.da?.item === 'pedra_raio')) onde.push(id);
    }
  }
  assert.equal(onde.length, 5, `esperava 5 pedras-de-raio, achou ${onde.length}`);
  assert.deepEqual([...new Set(onde)].sort(), [...MAPAS_REGIAO5_FORA].sort());
});

test('as três penas de trovão existem, espalhadas por três mapas diferentes', () => {
  const mapasComPena = entradas
    .filter(([, def]) => def.objetos.some(
      (o) => o.tipo === 'achado' && o.falas?.some((f) => f.da?.item === 'pena_trovao')))
    .map(([id]) => id);
  assert.equal(mapasComPena.length, 3, `penas de trovão em: ${mapasComPena.join(', ')}`);
});

test('o Arco-da-Velha só se entrega depois das penas E da medalha', () => {
  const arco = MAPAS['charcoRelampejante']!.npcs.find((n) => n.id === 'arco_da_velha')!;
  const entrega = arco.falas.find((f) => f.encantado);
  assert.ok(entrega);
  assert.equal(entrega!.encantado!.especie, 'arcoDaVelha');
  const exige = [entrega!.se].flat();
  assert.ok(exige.includes('servico_penas_trovao'));
  assert.ok(exige.includes('medalha:trovao'));
});
