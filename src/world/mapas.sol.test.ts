/* =========================================================================
   Coerência dos mapas — Cidade do Sol.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa, objetoAtivo, type ContextoMapa, type DefMapa } from './tilemap.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { tracarFeixe } from '../game/feixe.ts';
import { VEL_ANDAR, ABERTO, entradas, alcance, VEL_CORRER } from './mapas.apoio.ts';

/* ------------------------------------------------------------- região 8 */

/* o feixe de um mapa com estas flags ligadas: acerta o cristal? */
function feixeAcerta(def: DefMapa, flags: ReadonlySet<string>): boolean {
  const ctx: ContextoMapa = { ...ABERTO, ligada: (c) => flags.has(c) };
  const m = new Mapa(def, ctx);
  const ativos = def.objetos.filter((o) => objetoAtivo(o, ctx));
  const fonte = ativos.find((o) => o.tipo === 'fonteLuz')!;
  const alvo = ativos.find((o) => o.tipo === 'cristal')!;
  const espelhos = new Map(ativos.filter((o) => o.tipo === 'espelho')
    .map((o) => [`${o.tx},${o.ty}`, o.inclinacao ?? '/'] as const));
  return tracarFeixe(fonte, fonte.dir ?? 'dir', alvo, (x, y) => m.solido(x, y),
                     (x, y) => espelhos.get(`${x},${y}`) ?? null).acertou;
}

/* todas as combinações de espelhos girados que levam o feixe ao cristal */
function solucoesDoFeixe(id: string): string[][] {
  const def = MAPAS[id]!;
  const giros = [...new Set(def.objetos.filter((o) => o.tipo === 'espelho')
    .flatMap((o) => [o.se, o.seNao].flat()).filter((c): c is string => typeof c === 'string'))];
  const achadas: string[][] = [];
  for (let mask = 0; mask < 1 << giros.length; mask++) {
    const ligadas = giros.filter((_, i) => mask & (1 << i));
    if (feixeAcerta(def, new Set(ligadas))) achadas.push(ligadas);
  }
  return achadas;
}

test('o Jardim dos Espelhos: a solução mais curta gira quatro espelhos, e é uma só', () => {
  const s = solucoesDoFeixe('jardimEspelhos');
  assert.ok(s.length > 0, 'o feixe nunca chega ao cristal');
  const menor = Math.min(...s.map((x) => x.length));
  assert.equal(menor, 4);
  const curtas = s.filter((x) => x.length === menor);
  assert.equal(curtas.length, 1, `há ${curtas.length} soluções de ${menor} giros`);
  assert.deepEqual(curtas[0]!.sort(), ['espelho_1', 'espelho_2', 'espelho_3', 'espelho_5']);
});

test('o feixe do Terreiro da Aurora tem solução, e é ele que abre a porta do salão', () => {
  assert.ok(solucoesDoFeixe('terreiroAurora').length > 0);
  assert.ok(!feixeAcerta(MAPAS['terreiroAurora']!, new Set()), 'já começa resolvido');
  const def = MAPAS['terreiroAurora']!;
  const fechado = new Mapa(def, { ...ABERTO, ligada: (c) => c !== 'cristal_aurora' });
  assert.ok(fechado.solido(14, 17));
  assert.ok(!new Mapa(def, ABERTO).solido(14, 17));
});

test('a corrida dos lampiões cabe no tempo correndo, mas não andando', () => {
  const def = MAPAS['cidadeDoSol']!;
  const c = def.corrida!;
  const m = new Mapa(def, { ...ABERTO, ligada: (f) => f === c.ativa });
  const lampioes = c.marcos.map((f) => def.objetos.find((o) => o.tipo === 'lampiao' && o.seNao === f)!);
  const distancias = (x0: number, y0: number): Map<string, number> => {
    const d = new Map([[`${x0},${y0}`, 0]]);
    const fila: [number, number][] = [[x0, y0]];
    while (fila.length) {
      const [x, y] = fila.shift()!;
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
        const k = `${x + dx},${y + dy}`;
        if (d.has(k) || m.solido(x + dx, y + dy)) continue;
        d.set(k, d.get(`${x},${y}`)! + 1);
        fila.push([x + dx, y + dy]);
      }
    }
    return d;
  };
  // os pontos de parada: na frente do Acendedor e ao lado de cada lampião
  const acendedor = def.npcs.find((n) => n.id === 'acendedor')!;
  const nos: { x: number; y: number; l: number }[] = [{ x: acendedor.tx, y: acendedor.ty + 1, l: -1 }];
  lampioes.forEach((o, l) => {
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
      if (!m.solido(o.tx + dx, o.ty + dy)) nos.push({ x: o.tx + dx, y: o.ty + dy, l });
    }
  });
  const d = nos.map((n) => distancias(n.x, n.y));
  let melhor = Infinity;
  const busca = (i: number, feitos: number, soma: number): void => {
    if (soma >= melhor) return;
    if (feitos === (1 << lampioes.length) - 1) { melhor = soma; return; }
    nos.forEach((n, j) => {
      if (n.l < 0 || feitos & (1 << n.l)) return;
      const passo = d[i]!.get(`${n.x},${n.y}`);
      if (passo !== undefined) busca(j, feitos | (1 << n.l), soma + passo);
    });
  };
  busca(0, 0, 0);
  assert.ok(Number.isFinite(melhor), 'algum lampião não se alcança');
  assert.ok(melhor * VEL_CORRER < c.segundos - 4, `correndo leva ${melhor * VEL_CORRER}s de ${c.segundos}s`);
  assert.ok(melhor * VEL_ANDAR > c.segundos, `andando leva ${melhor * VEL_ANDAR}s, e devia não caber`);
});

test('a Medalha Aurora vem com o Dom Prisma, e as cortinas de luz só se abrem com ele', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  assert.equal(falas.find((f) => f.medalha === 'aurora')?.dom, 'prisma');
  let cortinas = 0;
  for (const [id, def] of entradas) {
    // o Remanso da Norato também tem cortina, mas sem esconderijo: tem teste dele
    if (!def.objetos.some((o) => o.tipo === 'cortinaLuz') || !def.objetos.some((o) => o.placa === 'ESCONDERIJO')) continue;
    cortinas++;
    const esconderijo = def.objetos.find(
      (o) => o.tipo === 'achado' && o.placa === 'ESCONDERIJO' && o.seNao !== undefined)!;
    const alvo = `${esconderijo.tx},${esconderijo.ty}`;
    const sem = new Mapa(def, { ...ABERTO, ligada: (c) => c !== 'dom_prisma' });
    const pes = alcance(sem, def.inicio.tx, def.inicio.ty);
    assert.ok(!pes.has(alvo), `${id}: sem o Dom o esconderijo devia fechar`);
    assert.ok(alcance(new Mapa(def, ABERTO), def.inicio.tx, def.inicio.ty).has(alvo), `${id}: com o Dom devia abrir`);
    for (const s of def.saidas ?? []) assert.ok(pes.has(`${s.tx},${s.ty}`), `${id}: a cortina trancou uma saída`);
  }
  assert.equal(cortinas, 2);
});

test('três cristais solares em três mapas, e a Jaci só depois deles E da medalha', () => {
  const onde = entradas.filter(([, def]) => def.objetos.some((o) => o.falas?.some((f) => f.da?.item === 'cristal_solar')))
    .map(([id]) => id);
  assert.equal(onde.length, 3);
  const j = MAPAS['picoAurora']!.npcs.find((n) => n.id === 'jaci_cume')!;
  const entrega = j.falas.find((f) => f.encantado)!;
  assert.equal(entrega.encantado!.especie, 'jaci');
  const exige = [entrega.se].flat();
  assert.ok(exige.includes('servico_cristais') && exige.includes('medalha:aurora'));
});

test('a região 8 também é larga', () => {
  for (const id of ['caminhoAurora', 'cidadeDoSol', 'jardimEspelhos', 'picoAurora']) {
    assert.ok(MAPAS[id]!.chao[0]!.length >= 56, `${id}: estreito demais`);
  }
});
