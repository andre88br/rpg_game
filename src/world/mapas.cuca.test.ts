/* =========================================================================
   Coerência dos mapas — Bairro da Cuca.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa, type DefMapa } from './tilemap.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { ABERTO, FECHADO, entradas, alcance } from './mapas.apoio.ts';

/* ------------------------------------------- Bairro da Cuca: rondas e ladrilhos */

test('toda ronda é um caminho fechado de tiles vizinhos e andáveis', () => {
  for (const [id, def] of entradas) {
    const m = new Mapa(def, FECHADO);
    for (const n of def.npcs) {
      const r = n.ronda;
      if (!r) continue;
      assert.deepEqual([r.caminho[0]!.tx, r.caminho[0]!.ty], [n.tx, n.ty], `${id}/${n.id}: não começa no próprio lugar`);
      r.caminho.forEach((p, i) => {
        const q = r.caminho[(i + 1) % r.caminho.length]!;
        assert.equal(Math.abs(p.tx - q.tx) + Math.abs(p.ty - q.ty), 1, `${id}/${n.id}: salto em (${p.tx},${p.ty})`);
        assert.ok(!m.solido(p.tx, p.ty), `${id}/${n.id}: passa por parede em (${p.tx},${p.ty})`);
        assert.equal(m.saidaEm(p.tx, p.ty), undefined, `${id}/${n.id}: pisa numa saída`);
      });
      assert.ok(!m.solido(r.volta.tx, r.volta.ty), `${id}/${n.id}: devolve para dentro de parede`);
      assert.ok(n.seNao, `${id}/${n.id}: a ronda devia acabar em algum momento`);
    }
  }
});

/* A travessia sem ser visto, simulada em passos: o jogador anda um tile ou
   espera a cada passo, o vigia anda um tile a cada dois (no jogo ele é
   ainda mais lento). Por segurança o vigia conta nos dois tiles — onde está
   e para onde vai —, olhando para onde anda. Devolve o número de passos da
   travessia mais curta sem ser visto, ou null. */
function travessiaSemSerVisto(def: DefMapa, flags: ReadonlySet<string>,
                              de: { tx: number; ty: number }, alvo: { tx: number; ty: number },
                              comVigias = true): number | null {
  const m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => flags.has(c) });
  const parados = new Set(def.npcs.filter((n) => !n.ronda).map((n) => `${n.tx},${n.ty}`));
  const livre = (x: number, y: number): boolean => !m.solido(x, y) && !parados.has(`${x},${y}`);
  const rondas = comVigias ? def.npcs.filter((n) => n.ronda).map((n) => n.ronda!) : [];
  const L = rondas.reduce((a, r) => (a * r.caminho.length) / mdc(a, r.caminho.length), 1);
  const P = 2 * L;
  const visto = (x: number, y: number, t: number): boolean => rondas.some((r) => {
    const n = r.caminho.length;
    for (const k of [Math.floor(t / 2) % n, (Math.floor(t / 2) + 1) % n]) {
      const a = r.caminho[(k - 1 + n) % n]!, b = r.caminho[k]!;
      if (b.tx === x && b.ty === y) return true;
      const dx = b.tx - a.tx, dy = b.ty - a.ty;
      let vx = b.tx, vy = b.ty;
      for (let i = 0; i < r.visao; i++) {
        vx += dx; vy += dy;
        if (m.solido(vx, vy)) break;
        if (vx === x && vy === y) return true;
      }
    }
    return false;
  });
  if (visto(de.tx, de.ty, 0)) return null;
  const seen = new Set([`${de.tx},${de.ty},0`]);
  let fila: [number, number][] = [[de.tx, de.ty]];
  for (let t = 0; fila.length && t < 20 * P; t++) {
    const prox: [number, number][] = [];
    for (const [x, y] of fila) {
      if (x === alvo.tx && y === alvo.ty) return t;
      for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = x + dx, ny = y + dy, k = `${nx},${ny},${(t + 1) % P}`;
        if (!livre(nx, ny) || seen.has(k) || visto(nx, ny, t + 1)) continue;
        seen.add(k); prox.push([nx, ny]);
      }
    }
    fila = prox;
  }
  return null;
}
function mdc(a: number, b: number): number { return b === 0 ? a : mdc(b, a % b); }

test('o Beco das Rondas se atravessa sem ser visto, mas não de graça', () => {
  const def = MAPAS['becoDasRondas']!;
  const portao = def.objetos.find((o) => o.placa === 'PORTÃO DO CEMITÉRIO')!;
  const alvo = { tx: portao.tx, ty: portao.ty + 1 };
  const semVigia = travessiaSemSerVisto(def, new Set(), def.inicio, alvo, false);
  const comVigia = travessiaSemSerVisto(def, new Set(), def.inicio, alvo);
  assert.ok(comVigia !== null, 'nenhuma travessia escapa de todos os vigias');
  assert.ok(comVigia! >= semVigia! + 10, `os vigias quase não atrapalham (${semVigia} → ${comVigia})`);
  assert.equal(def.npcs.filter((n) => n.ronda).length, 7);
});

test('no Terreiro do Breu se passa pelos vultos até a primeira guarda', () => {
  const def = MAPAS['terreiroBreu']!;
  const guarda = def.npcs.find((n) => n.id === 'guarda_sombra1')!;
  const alvo = { tx: guarda.tx + 1, ty: guarda.ty };
  const t = travessiaSemSerVisto(def, new Set(), def.inicio, alvo);
  assert.ok(t !== null, 'os vultos veem qualquer caminho até a guarda');
  const semVulto = travessiaSemSerVisto(def, new Set(), def.inicio, alvo, false)!;
  assert.ok(t! > semVulto, 'os vultos deviam obrigar a esperar');
  // vencida a Morgana, os vultos somem e a saída fica livre
  const depois = new Mapa(def, ABERTO);
  const morgana = def.npcs.find((n) => n.id === 'morgana')!;
  assert.ok(alcance(depois, morgana.tx + 1, morgana.ty).has(`${def.saidas![0]!.tx},${def.saidas![0]!.ty}`));
});

test('os ladrilhos do Casarão: a ordem existe no chão, e só ela abre a ala oeste', () => {
  const def = MAPAS['casaraoAssombrado']!;
  const seq = def.sequencia!;
  const simbolos = def.objetos.filter((o) => o.tipo === 'ladrilho').map((o) => o.simbolo);
  for (const s of seq.ordem) assert.equal(simbolos.filter((x) => x === s).length, 1, `símbolo "${s}" devia aparecer uma vez`);
  assert.ok(simbolos.length > seq.ordem.length, 'devia haver ladrilhos de sobra, para confundir');
  assert.equal(def.objetos.filter((o) => o.tipo === 'placa' && o.placa?.startsWith('QUADRO')).length, seq.ordem.length,
               'um quadro de pista para cada símbolo da ordem');
  const pes = alcance(new Mapa(def, FECHADO), def.inicio.tx, def.inicio.ty);
  for (const o of def.objetos.filter((x) => x.tipo === 'ladrilho')) {
    assert.ok(pes.has(`${o.tx},${o.ty}`), `ladrilho em (${o.tx},${o.ty}) inalcançável`);
  }
  const cuca = def.npcs.find((n) => n.id === 'cuca_sotao')!;
  const perto = `${cuca.tx - 1},${cuca.ty}`;
  assert.ok(!pes.has(perto), 'sem os ladrilhos a Cuca devia estar fora de alcance');
  const depois = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => c === seq.flag });
  assert.ok(alcance(depois, def.inicio.tx, def.inicio.ty).has(perto), 'com os ladrilhos a Cuca devia ser alcançável');
});

test('a Medalha Breu vem com o Dom Visão Noturna, e os véus só caem com ele', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  assert.equal(falas.find((f) => f.medalha === 'breu')?.dom, 'visao');
  let veus = 0;
  for (const [id, def] of entradas) {
    // o Remanso da Norato também tem véu, mas sem esconderijo: tem teste dele
    if (!def.objetos.some((o) => o.tipo === 'veu') || !def.objetos.some((o) => o.placa === 'ESCONDERIJO')) continue;
    veus++;
    const esconderijo = def.objetos.find(
      (o) => o.tipo === 'achado' && o.placa === 'ESCONDERIJO' && o.seNao !== undefined)!;
    const alvo = `${esconderijo.tx},${esconderijo.ty}`;
    const sem = new Mapa(def, { ...ABERTO, ligada: (c) => c !== 'dom_visao' });
    const pes = alcance(sem, def.inicio.tx, def.inicio.ty);
    assert.ok(!pes.has(alvo), `${id}: sem o Dom o esconderijo devia fechar`);
    assert.ok(alcance(new Mapa(def, ABERTO), def.inicio.tx, def.inicio.ty).has(alvo), `${id}: com o Dom devia abrir`);
    // a saída sul do bairro é o próprio véu: é o Dom que abre a Cidade do Sol
    for (const s of def.saidas ?? []) {
      if (s.para === 'caminhoAurora') { assert.ok(!pes.has(`${s.tx},${s.ty}`), `${id}: a saída sul devia ter véu`); continue; }
      assert.ok(pes.has(`${s.tx},${s.ty}`), `${id}: o véu trancou uma saída`);
    }
  }
  assert.equal(veus, 2);
});

test('três retratos em três mapas, e a Pisadeira só depois deles E da medalha', () => {
  const onde = entradas.filter(([, def]) => def.objetos.some((o) => o.falas?.some((f) => f.da?.item === 'retrato')))
    .map(([id]) => id);
  assert.equal(onde.length, 3);
  const p = MAPAS['casaraoAssombrado']!.npcs.find((n) => n.id === 'pisadeira_telhado')!;
  const entrega = p.falas.find((f) => f.encantado)!;
  assert.equal(entrega.encantado!.especie, 'pisadeira');
  const exige = [entrega.se].flat();
  assert.ok(exige.includes('servico_retratos') && exige.includes('medalha:breu'));
});

test('a região 7 também é larga', () => {
  for (const id of ['ruaDoBreu', 'bairroDaCuca', 'becoDasRondas']) {
    assert.ok(MAPAS[id]!.chao[0]!.length >= 56, `${id}: estreito demais`);
  }
});

test('o mapa de cada região está escondido nela mesma, e se acha sem Dom nenhum', async () => {
  const { REGIOES, itemMapaDaRegiao } = await import('../data/mundo.ts');
  for (const r of REGIOES) {
    const item = itemMapaDaRegiao(r);
    const onde = entradas.flatMap(([id, def]) =>
      def.objetos.filter((o) => o.falas?.some((f) => f.da?.item === item)).map((o) => ({ id, def, o })));
    assert.equal(onde.length, 1, `${item}: devia estar em um lugar só`);
    const { id, def, o } = onde[0]!;
    assert.ok(r.mapas.includes(id), `${item} está fora da própria região (${id})`);
    assert.ok(!def.interior, `${item} devia ficar ao ar livre`);
    const semDom = new Mapa(def, { contas: () => 5, nadar: false, ligada: (c) => !c.startsWith('dom_') });
    assert.ok(alcance(semDom, def.inicio.tx, def.inicio.ty).has(`${o.tx},${o.ty}`),
              `${item} em (${o.tx},${o.ty}) exige algum Dom`);
  }
});
