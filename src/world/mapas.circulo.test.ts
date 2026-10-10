/* =========================================================================
   Coerência dos mapas — Círculo Dourado.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa } from './tilemap.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { ABERTO, entradas, mapa, alcance } from './mapas.apoio.ts';

/* ---------------------------------------------------- Círculo Dourado */

test('a arena abre uma câmara por vitória, na ordem, e só no fim chega ao campeão', () => {
  const def = MAPAS['arenaDourada']!;
  const ordem = ['iracema', 'itabera', 'ybytu', 'jacira', 'zeca9'];
  const topo = `7,0`;
  for (let k = 0; k <= ordem.length; k++) {
    const venceu = new Set(ordem.slice(0, k).map((id) => `venceu_${id}`));
    const m = new Mapa(def, { ...ABERTO, ligada: (c) => venceu.has(c) });
    const pes = alcance(m, def.inicio.tx, def.inicio.ty);
    // alcança o adversário da vez, mas não o seguinte
    const daVez = def.npcs.find((n) => n.id === (ordem[k] ?? 'anhanga'))!;
    assert.ok(pes.has(`7,${daVez.ty}`), `com ${k} vitórias devia chegar ao ${daVez.id}`);
    const seguinte = def.npcs.find((n) => n.id === ordem[k + 1]);
    if (seguinte) assert.ok(!pes.has(`7,${seguinte.ty}`), `com ${k} vitórias já chegava ao ${seguinte.id}`);
    assert.equal(pes.has(topo), k === ordem.length, 'a saída de cima só depois do Zeca');
  }
});

test('na volta de campeão, as trancas seguem os adversários mais fortes', () => {
  const def = MAPAS['arenaDourada']!;
  const fechado = new Mapa(def, { ...ABERTO, ligada: (c) => c === 'campeao' });
  const pes = alcance(fechado, def.inicio.tx, def.inicio.ty);
  assert.ok(!pes.has('7,31'), 'campeão sem vencer a Iracema forte passou da primeira porta');
  const aberto = new Mapa(def, { ...ABERTO, ligada: (c) => c === 'campeao' || c === 'venceu_iracema_b' });
  assert.ok(alcance(aberto, def.inicio.tx, def.inicio.ty).has('7,31'));
});

test('cada adversário tem gêmeo de campeão, e entrar na arena apaga todas as vitórias', () => {
  const def = MAPAS['arenaDourada']!;
  const zera = new Set(def.zeraAoEntrar);
  for (const n of def.npcs) {
    assert.ok(n.treinador, `${n.id} devia lutar`);
    assert.ok(zera.has(`venceu_${n.id}`), `${n.id}: a vitória não se apaga ao entrar`);
    for (const c of n.treinador!.time) assert.ok(c.nivel <= 70, `${n.id}: nível ${c.nivel} acima do teto (70)`);
    if (n.id.endsWith('_b')) { assert.equal(n.se, 'campeao'); continue; }
    assert.equal(n.seNao, 'campeao');
    assert.ok(def.npcs.some((x) => x.id === `${n.id}_b`), `${n.id} sem gêmeo de campeão`);
  }
  const anhanga = def.npcs.find((n) => n.id === 'anhanga')!.treinador!;
  assert.equal(anhanga.creditos, true);
  assert.deepEqual([anhanga.liga].flat(), ['campeao']);
  assert.equal(def.npcs.filter((n) => n.treinador?.creditos).length, 1, 'os créditos tocam uma vez só');
});

test('o portão da Estrada Dourada só abre com a oitava medalha', () => {
  const def = MAPAS['estradaDourada']!;
  const sem = new Mapa(def, { ...ABERTO, ligada: (c) => c !== 'medalha:aurora' });
  assert.ok(!alcance(sem, def.inicio.tx, def.inicio.ty).has('0,11'));
  assert.ok(alcance(new Mapa(def, ABERTO), def.inicio.tx, def.inicio.ty).has('0,11'));
});

test('todo balão leva a um mapa que existe, e desce em chão livre', () => {
  let baloes = 0;
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      for (const f of n.falas) {
        if (!f.leva) continue;
        baloes++;
        assert.ok(MAPAS[f.leva.mapa], `${id}: ${n.id} leva para "${f.leva.mapa}", que não existe`);
        assert.ok(!mapa(f.leva.mapa).solido(f.leva.tx, f.leva.ty), `${id}: ${n.id} desce em tile sólido`);
      }
    }
  }
  assert.equal(baloes, 2, 'o balão vai e volta: Cidade do Sol <-> Círculo Dourado');
  const ida = MAPAS['cidadeDoSol']!.npcs.find((n) => n.id === 'baloeiro_sol')!.falas.find((f) => f.leva)!;
  assert.ok([ida.se].flat().includes('medalha:aurora'), 'o balão sobe sem as oito medalhas');
});

/* ------------------------------------------------- pós-jogo (Fase 11) */

test('o Remanso só abre depois do campeonato, e a Norato pede Visão Noturna e Prisma', () => {
  const circulo = MAPAS['circuloDourado']!;
  const praca = (ligada: (c: string) => boolean) =>
    alcance(new Mapa(circulo, { ...ABERTO, ligada }), circulo.inicio.tx, circulo.inicio.ty);
  assert.ok(!praca((c) => c !== 'campeao').has('0,33'), 'sem campeonato a saída do Remanso devia fechar');
  assert.ok(praca(() => true).has('0,33'));

  const def = MAPAS['remansoNorato']!;
  const cobra = def.npcs.find((n) => n.id === 'cobra_norato')!;
  const vizinhos = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => `${cobra.tx + dx!},${cobra.ty + dy!}`);
  const chega = (ligada: (c: string) => boolean) => {
    const pes = alcance(new Mapa(def, { ...ABERTO, ligada }), def.inicio.tx, def.inicio.ty);
    return vizinhos.some((v) => pes.has(v));
  };
  assert.ok(!chega((c) => c !== 'dom_visao'), 'sem Visão Noturna não devia chegar');
  assert.ok(!chega((c) => c !== 'dom_prisma'), 'sem Prisma não devia chegar');
  assert.ok(chega(() => true));
  assert.equal(cobra.treinador?.time[0]?.especie, 'cobraNorato');
});

test('as oito revanches crescem com o jogador e podem se repetir', () => {
  const revanches = MAPAS['circuloDourado']!.npcs.filter((n) => n.id.startsWith('revanche_'));
  assert.equal(revanches.length, 8);
  for (const n of revanches) {
    assert.deepEqual(n.treinador?.escala, { piso: 70, mais: 3 }, n.id);
    assert.equal(n.treinador?.repete, true, n.id);
  }
});

test('a Romaria tem porta, mestre e três barracas', () => {
  const def = MAPAS['romariaCirculo']!;
  assert.ok(def.npcs.find((n) => n.id === 'mestre_romaria')!.falas.every((f) => f.romaria));
  assert.equal(def.npcs.filter((n) => n.id.startsWith('barraca_')).length, 3);
  const circulo = MAPAS['circuloDourado']!;
  assert.ok(circulo.saidas!.some((s) => s.para === 'romariaCirculo'));
  void mapa; void entradas;
});
