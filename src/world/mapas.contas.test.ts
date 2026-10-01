/* =========================================================================
   Coerência dos mapas — os Dons e as cinco contas da Foz e da Mata.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa, type ContextoMapa } from './tilemap.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { ESPECIES } from '../data/creatures.ts';
import { TERREIROS } from '../game/quests.ts';
import { ABERTO, FECHADO, entradas, alcance } from './mapas.apoio.ts';

/* --------------------------------------------- o Dom e as cinco contas */

test('a segunda tranca do Zeca, no igarapé, fecha e abre de verdade', () => {
  const fechado = new Mapa(MAPAS['igarapeCurupira']!, FECHADO);
  const aberto = new Mapa(MAPAS['igarapeCurupira']!, ABERTO);
  const saida = MAPAS['igarapeCurupira']!.saidas!.find((s) => s.para === 'mataDoCurupira')!;
  const inicio = MAPAS['igarapeCurupira']!.inicio;

  assert.ok(!alcance(fechado, inicio.tx, inicio.ty).has(`${saida.tx},${saida.ty}`),
            'sem vencer o Zeca de novo, o igarapé para a Mata devia estar trancado');
  assert.ok(alcance(aberto, inicio.tx, inicio.ty).has(`${saida.tx},${saida.ty}`),
            'vencido o Zeca de novo, o igarapé devia abrir');
});

test('a touceira de cipó só cede para quem tem o Dom "Cortar Cipó"', () => {
  /* é o teste do Dom desta região: sem "Cortar Cipó", o bolso além da
     touceira seria cenário inalcançável — um prêmio que ninguém pega */
  const def = MAPAS['mataDoCurupira']!;
  const cipo = def.objetos.find((o) => o.tipo === 'barreira')!;
  const semDom: ContextoMapa = { ...ABERTO, ligada: (c) => c !== 'dom_cortarCipo' };
  const comDom: ContextoMapa = ABERTO;
  const m1 = new Mapa(def, semDom);
  const m2 = new Mapa(def, comDom);
  const inicio = def.inicio;
  const bolso = `${cipo.tx + 1},${cipo.ty + 1}`;   // o outro tile do vão, além da placa

  assert.ok(m1.solido(cipo.tx, cipo.ty), 'sem o Dom, a touceira devia barrar a passagem');
  assert.ok(!m2.solido(cipo.tx, cipo.ty), 'com o Dom, a touceira devia ceder');
  assert.ok(!alcance(m1, inicio.tx, inicio.ty).has(bolso),
            'sem o Dom, o bolso além da touceira devia ser inalcançável');
  assert.ok(alcance(m2, inicio.tx, inicio.ty).has(bolso),
            'com o Dom, o bolso além da touceira devia abrir');
});

test('a Medalha Raiz tem quem a entregue, com o Dom junto', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  const premio = falas.find((f) => f.medalha === 'raiz');
  assert.ok(premio, 'ninguém entrega a Medalha Raiz');
  assert.equal(premio!.dom, 'cortarCipo', 'a Raiz tem que vir com o Dom de cortar cipó');
});

test('a ilhota do açude só existe para quem sabe nadar', () => {
  /* é o teste do Dom: se a Medalha Maré não abrisse a água, o pote seria
     cenário inalcançável — e um prêmio que ninguém pega não é prêmio */
  const def = MAPAS['rotaFoz']!;
  const pote = def.objetos.find((o) => o.tipo === 'achado' && o.placa !== 'MAPA')!;
  const aPe = new Mapa(def, { ...ABERTO, nadar: false });
  const nadando = new Mapa(def, ABERTO);
  const alvo = `${pote.tx},${pote.ty}`;

  assert.ok(!alcance(aPe, def.inicio.tx, def.inicio.ty).has(alvo),
            'a pé a ilhota devia ser inalcançável');
  assert.ok(alcance(nadando, def.inicio.tx, def.inicio.ty).has(alvo),
            'com o Dom "Nadar" a ilhota devia abrir');
});

test('as cinco contas de cada guia podem mesmo ser acesas jogando', () => {
  /* Cada guia é o portão de uma fase. Se uma conta não tiver ninguém que a
     acenda, o jogo fica sem fim — e nada no `tsc` diria isso. */
  const acesas = new Set<string>();
  for (const [, def] of entradas) {
    for (const o of def.objetos) {
      for (const f of o.falas ?? []) {
        for (const l of [f.liga].flat()) if (typeof l === 'string') acesas.add(l);
      }
    }
    for (const n of def.npcs) {
      for (const f of n.falas) {
        for (const l of [f.liga].flat()) if (typeof l === 'string') acesas.add(l);
      }
      for (const l of [n.treinador?.liga].flat()) if (typeof l === 'string') acesas.add(l);
    }
    // a conta de uma sala de pedras acende em código (world/pedras.ts +
    // overworld.ts), quando a última cova é tapada — não em fala nenhuma
    if (def.pedrasConta) acesas.add(def.pedrasConta);
    if (def.sequencia) acesas.add(def.sequencia.flag);
    if (def.feixe) acesas.add(def.feixe.flag);
    if (def.corrida) acesas.add(def.corrida.conta);
  }
  for (const lista of Object.values(TERREIROS)) {
    for (const c of lista) {
      assert.ok(acesas.has(c.flag), `ninguém acende a conta "${c.servico}" (${c.flag})`);
    }
  }
});

test('a Medalha Maré tem quem a entregue, com o Dom junto', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  const premio = falas.find((f) => f.medalha === 'mare');
  assert.ok(premio, 'ninguém entrega a Medalha Maré');
  assert.equal(premio!.dom, 'nadar', 'a Maré tem que vir com o Dom de nadar');
});

test('todo bicho desenhado no mapa é espécie que existe', () => {
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      if (!n.estilo.startsWith('bicho:')) continue;
      const arte = n.estilo.slice(6);
      assert.ok(Object.values(ESPECIES).some((e) => e.arte === arte),
                `${id}: ${n.id} usa a arte "${arte}", que não é de nenhuma espécie`);
    }
  }
});

test('quem foge tem o que entregar quando for encurralado', () => {
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      if (!n.fujao) continue;
      const solta = n.falas.find((f) => f.se === undefined && f.seNao === undefined);
      // ou entrega na conversa, ou briga e larga o que carregava ao perder
      const briga = solta?.batalha && n.treinador?.da && n.treinador.liga === n.seNao;
      assert.ok(solta?.da || solta?.liga || briga,
                `${id}: ${n.id} foge e, quando pego, não entrega nada`);
      assert.ok(n.seNao, `${id}: ${n.id} continuaria no mapa depois de entregar`);
    }
  }
});

test('as três redes do Mestre do Porto se tomam na briga com os Sacizinhos', () => {
  const sacis = entradas.flatMap(([, def]) => def.npcs)
    .filter((n) => n.treinador?.da?.item === 'rede');
  assert.equal(sacis.length, 3);
  for (const n of sacis) {
    const t = n.treinador!;
    assert.ok(n.fujao, `${n.id} tem que fugir antes de brigar`);
    assert.ok(t.selvagem, `${n.id} é bicho: dá para prender no patuá`);
    assert.ok(!t.visao, `${n.id} não pode desafiar de longe, só encurralado`);
    assert.equal(t.time[0]!.especie, 'sacizinho');
    assert.equal(t.liga, n.seNao, `${n.id} tem que sumir depois de largar a rede`);
    // só depois da carta: é o Mestre do Porto quem conta das redes
    assert.equal(n.se, 'conta_recado', `${n.id} apareceria antes do Mestre pedir as redes`);
    assert.ok(n.encontro, `${n.id} sem cutscene de quando é achado`);
    assert.ok(t.cutscene, `${n.id} sem cutscene de quando larga a rede`);
    assert.ok(!t.falaDerrota, `${n.id}: a cutscene já conta a derrota`);
  }
  // cada um num esconderijo diferente, e cada um com as suas cutscenes
  assert.equal(new Set(sacis.map((n) => n.encontro)).size, 3);
  assert.equal(new Set(sacis.map((n) => n.treinador!.cutscene)).size, 3);
});

test('as três mudas do Seu Elias se tomam na briga com as Caiporinhas', () => {
  const caipos = entradas.flatMap(([, def]) => def.npcs)
    .filter((n) => n.treinador?.da?.item === 'muda');
  assert.equal(caipos.length, 3);
  for (const n of caipos) {
    const t = n.treinador!;
    assert.ok(n.fujao, `${n.id} tem que fugir antes de brigar`);
    assert.ok(t.selvagem, `${n.id} é bicho: dá para prender no patuá`);
    assert.ok(!t.visao, `${n.id} não pode desafiar de longe, só encurralada`);
    assert.equal(t.time[0]!.especie, 'caiporinha');
    assert.equal(t.liga, n.seNao, `${n.id} tem que sumir depois de largar a muda`);
    // só depois da carta: é o Seu Elias quem conta do viveiro
    assert.equal(n.se, 'tem_caderno_mata', `${n.id} apareceria antes do Seu Elias pedir as mudas`);
    assert.ok(n.encontro, `${n.id} sem cutscene de quando é achada`);
    assert.ok(t.cutscene, `${n.id} sem cutscene de quando larga a muda`);
    assert.ok(!t.falaDerrota, `${n.id}: a cutscene já conta a derrota`);
  }
  assert.equal(new Set(caipos.map((n) => n.encontro)).size, 3);
  assert.equal(new Set(caipos.map((n) => n.treinador!.cutscene)).size, 3);
});
