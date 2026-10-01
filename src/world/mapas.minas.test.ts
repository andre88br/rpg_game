/* =========================================================================
   Coerência dos mapas — Minas da Caipora.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa, type DefMapa } from './tilemap.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { ABERTO, entradas, mapa, alcance, passoComTrilho, resolverChaves } from './mapas.apoio.ts';

/* ------------------------------------------ Minas da Caipora: tipos novos */

const MAPAS_REGIAO6_FORA = ['bocaDaMina', 'arraialCaipora', 'galeriasDaMina', 'cavaFunda'];

test('a região 6 também é larga e alta', () => {
  for (const id of MAPAS_REGIAO6_FORA) {
    const def = MAPAS[id]!;
    assert.ok(def.chao[0]!.length >= 56, `${id}: só ${def.chao[0]!.length} colunas`);
    assert.ok(def.chao.length >= 40, `${id}: só ${def.chao.length} linhas`);
  }
});

/* Todos os estados (posição × alavancas) alcançáveis a partir da entrada, e
   quais deles ainda chegam ao alvo. Diferente das chaves de para-raio, o
   trilho só anda para um lado: aqui um movimento NÃO se desfaz sozinho, e
   "ninguém fica preso" precisa ser provado de verdade, com busca reversa. */
function grafoDeTrilhos(
  def: DefMapa, chaves: readonly string[], sempre: ReadonlySet<string>,
  de: { tx: number; ty: number },
): Map<string, string[]> {
  const mapas = new Map<number, Mapa>();
  const mapaDe = (mask: number): Mapa => {
    let m = mapas.get(mask);
    if (!m) {
      const ligadas = new Set(chaves.filter((_, i) => mask & (1 << i)));
      m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => sempre.has(c) || ligadas.has(c) });
      mapas.set(mask, m);
    }
    return m;
  };
  const postes = chaves.map((k) => def.objetos.find((x) => x.tipo === 'alavanca'
    && x.falas?.some((f) => [f.liga, f.desliga].flat().includes(k)))!);
  const grafo = new Map<string, string[]>();
  const fila = [`${de.tx},${de.ty},0`];
  grafo.set(fila[0]!, []);
  while (fila.length) {
    const k = fila.shift()!;
    const [x, y, mask] = k.split(',').map(Number) as [number, number, number];
    const m = mapaDe(mask);
    const saidas: string[] = [];
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
      const onde = passoComTrilho(m, x, y, dx, dy);
      if (onde) saidas.push(`${onde[0]},${onde[1]},${mask}`);
    }
    postes.forEach((p, i) => {
      if (Math.abs(p.tx - x) + Math.abs(p.ty - y) === 1) saidas.push(`${x},${y},${mask ^ (1 << i)}`);
    });
    grafo.set(k, saidas);
    for (const n of saidas) if (!grafo.has(n)) { grafo.set(n, []); fila.push(n); }
  }
  return grafo;
}

function chegamAo(grafo: Map<string, string[]>, alvo: (x: number, y: number) => boolean): Set<string> {
  const reverso = new Map<string, string[]>();
  for (const [a, ns] of grafo) for (const n of ns) (reverso.get(n) ?? reverso.set(n, []).get(n)!).push(a);
  const ok = new Set([...grafo.keys()].filter((k) => { const [x, y] = k.split(',').map(Number); return alvo(x!, y!); }));
  const fila = [...ok];
  while (fila.length) {
    for (const p of reverso.get(fila.shift()!) ?? []) if (!ok.has(p)) { ok.add(p); fila.push(p); }
  }
  return ok;
}

const ALAVANCAS_MINA = ['alavanca_mina_1', 'alavanca_mina_2', 'alavanca_mina_3'];

test('as Galerias têm solução pelos trilhos, e pedem seis alavancadas', () => {
  const def = MAPAS['galeriasDaMina']!;
  const sino = def.objetos.find((o) => o.placa === 'SINO DA MINA')!;
  const toques = resolverChaves(def, ALAVANCAS_MINA, new Set(), def.inicio, { tx: sino.tx - 1, ty: sino.ty });
  assert.equal(toques, 6, `o sino devia pedir 6 alavancadas, pediu ${toques}`);
});

test('nas Galerias ninguém fica preso: todo estado ainda chega ao sino, e do sino se volta', () => {
  const def = MAPAS['galeriasDaMina']!;
  const sino = def.objetos.find((o) => o.placa === 'SINO DA MINA')!;
  const grafo = grafoDeTrilhos(def, ALAVANCAS_MINA, new Set(), def.inicio);
  const aoSino = chegamAo(grafo, (x, y) => Math.abs(x - sino.tx) + Math.abs(y - sino.ty) === 1);
  for (const k of grafo.keys()) assert.ok(aoSino.has(k), `do estado ${k} não se chega mais ao sino`);
  // e a volta com o Tuco: de todo estado ao lado do sino, a entrada da mina
  const aEntrada = chegamAo(grafo, (x, y) => x === def.inicio.tx && y === def.inicio.ty);
  for (const k of grafo.keys()) {
    const [x, y] = k.split(',').map(Number);
    if (Math.abs(x! - sino.tx) + Math.abs(y! - sino.ty) === 1) {
      assert.ok(aEntrada.has(k), `do sino (${k}) não se volta à entrada`);
    }
  }
});

test('um trilho só anda para um lado: voltar por ele devolve para onde se estava', () => {
  const def = MAPAS['galeriasDaMina']!;
  const m = new Mapa(def, ABERTO);
  // o expresso SE → NO: pisar nele em qualquer ponto leva até a plataforma NO
  const fim = passoComTrilho(m, 54, 37, 0, 1);
  assert.deepEqual(fim, [4, 9], 'o expresso devia levar do SE até a plataforma NO');
  // e de dentro da plataforma NO, pisar no fim do expresso devolve para a NO
  assert.deepEqual(passoComTrilho(m, 4, 9, 0, 1), [4, 9]);
});

test('o Terreiro da Pedra tem solução: uma alavanca, a charada e três guardas', () => {
  const def = MAPAS['terreiroPedra']!;
  const flags = new Set(['venceu_guarda_cascalho', 'passou_charada_pedra', 'venceu_guarda_rocha']);
  const ubirajara = def.npcs.find((n) => n.id === 'ubirajara')!;
  const alvo = { tx: ubirajara.tx + 1, ty: ubirajara.ty };
  assert.equal(resolverChaves(def, ['alavanca_terreiro_pedra'], flags, def.inicio, alvo), 1);
  // e do Ubirajara se volta à porta, com qualquer posição da alavanca
  const porta = def.saidas![0]!;
  const acima = { tx: porta.tx, ty: porta.ty - 1 };
  for (const extra of [[], ['alavanca_terreiro_pedra']]) {
    const tudo = new Set([...flags, ...extra]);
    assert.equal(resolverChaves(def, [], tudo, alvo, acima), 0,
                 `do Ubirajara devia dar para voltar à porta (alavanca ${extra.length ? 'puxada' : 'solta'})`);
  }
  for (const falta of flags) {
    const sem = new Set([...flags].filter((f) => f !== falta));
    assert.equal(resolverChaves(def, ['alavanca_terreiro_pedra'], sem, def.inicio, alvo), null,
                 `sem "${falta}" não devia dar para chegar ao Ubirajara`);
  }
});

test('toda charada tem resposta certa entre as opções, e cabe na caixinha', () => {
  let perguntas = 0;
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      for (const f of n.falas) {
        const p = f.pergunta;
        if (!p) continue;
        perguntas++;
        assert.ok(p.opcoes.length >= 2 && p.opcoes.length <= 4, `${id}/${n.id}: ${p.opcoes.length} opções`);
        assert.ok(p.certa >= 0 && p.certa < p.opcoes.length, `${id}/${n.id}: resposta certa fora das opções`);
        for (const o of p.opcoes) assert.ok(o.length <= 14, `${id}/${n.id}: opção "${o}" larga demais`);
        assert.ok(p.errou.linhas.length > 0);
      }
    }
  }
  assert.equal(perguntas, 10,
    'três do Velho Garimpeiro, a da guarda da Pedra, três cartas da Cartomante e três do Oráculo');
});

test('errar uma charada do Velho Garimpeiro apaga as anteriores', () => {
  const velho = MAPAS['casaGarimpeiro']!.npcs.find((n) => n.id === 'velho_garimpeiro')!;
  const segunda = velho.falas.find((f) => f.se === 'charada1_ok')!;
  const terceira = velho.falas.find((f) => f.se === 'charada2_ok')!;
  assert.deepEqual([segunda.pergunta!.errou.desliga].flat(), ['charada1_ok']);
  assert.deepEqual([terceira.pergunta!.errou.desliga].flat().sort(), ['charada1_ok', 'charada2_ok']);
  assert.equal(terceira.liga, 'conta_charadas');
});

test('a escolta do Tuco começa no fundo da mina e termina com a mãe', () => {
  const tuco = MAPAS['galeriasDaMina']!.npcs.find((n) => n.id === 'tuco')!;
  assert.deepEqual([tuco.seNao].flat().sort(), ['escoltando_menino', 'menino_salvo']);
  assert.ok(tuco.falas.some((f) => f.liga === 'escoltando_menino'));
  const luzia = MAPAS['arraialCaipora']!.npcs.find((n) => n.id === 'dona_luzia')!;
  const entrega = luzia.falas.find((f) => f.se === 'escoltando_menino')!;
  assert.deepEqual([entrega.liga].flat().sort(), ['conta_menino', 'menino_salvo']);
  assert.equal(entrega.desliga, 'escoltando_menino');
});

test('todo tesouro enterrado fica em chão alcançável, e só se cava com a forquilha', () => {
  for (const [id, def] of entradas) {
    const m = mapa(id);
    const pes = alcance(m, def.inicio.tx, def.inicio.ty);
    for (const o of def.objetos) {
      if (o.tipo !== 'enterrado') continue;
      assert.ok(!m.solido(o.tx, o.ty), `${id}: enterrado em (${o.tx},${o.ty}) é parede`);
      const ladoAlcancavel = [[0, -1], [0, 1], [-1, 0], [1, 0]]
        .some(([dx, dy]) => pes.has(`${o.tx + dx!},${o.ty + dy!}`));
      assert.ok(ladoAlcancavel, `${id}: ninguém chega perto do enterrado em (${o.tx},${o.ty})`);
      if (o.vazio !== true) {
        assert.ok(o.falas?.every((f) => f.se === 'item:forquilha'), `${id}: dá para cavar sem forquilha`);
      }
    }
  }
});

test('três pepitas na Boca da Mina, e três diamantes em três mapas', () => {
  const onde = (item: string) => entradas.flatMap(([id, def]) =>
    def.objetos.filter((o) => o.tipo === 'enterrado' && o.falas?.some((f) => f.da?.item === item)).map(() => id));
  assert.deepEqual(onde('pepita'), ['bocaDaMina', 'bocaDaMina', 'bocaDaMina']);
  assert.equal(new Set(onde('diamante')).size, 3);
});

test('a Medalha Pedra vem com o Dom Escavar, e os montes de terra só cedem a ele', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  assert.equal(falas.find((f) => f.medalha === 'pedra')?.dom, 'escavar');
  let montes = 0;
  for (const id of MAPAS_REGIAO6_FORA) {
    const def = MAPAS[id]!;
    if (!def.objetos.some((o) => o.tipo === 'monteTerra')) continue;
    montes++;
    const esconderijo = def.objetos.find(
      (o) => o.tipo === 'achado' && o.placa === 'ESCONDERIJO' && o.seNao !== undefined)!;
    const alvo = `${esconderijo.tx},${esconderijo.ty}`;
    const sem = new Mapa(def, { ...ABERTO, ligada: (c) => c !== 'dom_escavar' });
    assert.ok(!alcance(sem, def.inicio.tx, def.inicio.ty).has(alvo), `${id}: sem o Dom o esconderijo devia fechar`);
    assert.ok(alcance(new Mapa(def, ABERTO), def.inicio.tx, def.inicio.ty).has(alvo), `${id}: com o Dom devia abrir`);
    const pes = alcance(sem, def.inicio.tx, def.inicio.ty);
    const pesCom = alcance(new Mapa(def, ABERTO), def.inicio.tx, def.inicio.ty);
    for (const s of def.saidas ?? []) {
      // a estrada do Bairro da Cuca é justamente o que o Dom Escavar abre
      if (s.para === 'ruaDoBreu') {
        assert.ok(!pes.has(`${s.tx},${s.ty}`), `${id}: sem o Dom a estrada do Bairro devia estar fechada`);
        assert.ok(pesCom.has(`${s.tx},${s.ty}`), `${id}: com o Dom a estrada do Bairro devia abrir`);
        continue;
      }
      assert.ok(pes.has(`${s.tx},${s.ty}`), `${id}: o monte trancou uma saída`);
    }
  }
  assert.equal(montes, 3, 'três mapas com monte de terra (e a Cava tem também o da estrada)');
});

test('a Caipora só se entrega depois dos diamantes E da medalha', () => {
  const c = MAPAS['cavaFunda']!.npcs.find((n) => n.id === 'caipora_fundo')!;
  const entrega = c.falas.find((f) => f.encantado)!;
  assert.equal(entrega.encantado!.especie, 'caipora');
  const exige = [entrega.se].flat();
  assert.ok(exige.includes('servico_diamantes') && exige.includes('medalha:pedra'));
});

/* Pegou de verdade o Terreiro da Pedra: o trilho da plataforma A para a B só
   anda num sentido, e quem subia até o Ubirajara não tinha mais por onde
   voltar à porta. Aqui, para todo mapa, com toda condição valendo: de todo
   tile alcançável (seguindo os trilhos) ainda se chega a alguma saída. As
   Galerias ficam de fora — lá o caminho depende de quais das três alavancas
   estão puxadas, e quem prova a volta é a busca de estados própria delas. */
test('de todo lugar alcançável se volta a alguma saída', () => {
  for (const [id, def] of entradas) {
    if (id === 'galeriasDaMina') continue;
    if (!def.saidas?.length) continue;
    const m = mapa(id);
    const grafo = new Map<string, string[]>();
    const fila = [`${def.inicio.tx},${def.inicio.ty}`];
    grafo.set(fila[0]!, []);
    while (fila.length) {
      const k = fila.shift()!;
      const [x, y] = k.split(',').map(Number) as [number, number];
      const saidas: string[] = [];
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
        const onde = passoComTrilho(m, x, y, dx, dy);
        if (onde) saidas.push(`${onde[0]},${onde[1]}`);
      }
      grafo.set(k, saidas);
      for (const n of saidas) if (!grafo.has(n)) { grafo.set(n, []); fila.push(n); }
    }
    const portas = new Set(def.saidas.map((s) => `${s.tx},${s.ty}`));
    const voltam = chegamAo(new Map([...grafo].map(([k, v]) => [`${k},0`, v.map((n) => `${n},0`)])),
                            (x, y) => portas.has(`${x},${y}`));
    const presos = [...grafo.keys()].filter((k) => !voltam.has(`${k},0`));
    assert.deepEqual(presos.slice(0, 5), [], `${id}: ${presos.length} tiles sem caminho de volta a uma saída`);
  }
});
