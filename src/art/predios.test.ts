import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from '../data/mapas/index.ts';
import { regiaoDoMapa } from '../data/mundo.ts';
import { TIPOS_ORDEM } from './palette.ts';
import { TS, colunaPorta } from './tiles.ts';
import { SOBRA, casaDaRegiao, terreiroDaRegiao } from './predios.ts';

/* toda casa e todo terreiro de verdade, com o tamanho que o mapa pede */
const usados = Object.entries(MAPAS).flatMap(([id, def]) => def.objetos
  .filter((o) => o.tipo === 'casa' || o.tipo === 'terreiro')
  .map((o) => ({ id, o, tipo: regiaoDoMapa(id)!.tipo })));

test('as oito regiões têm casa e terreiro próprios', () => {
  for (const t of TIPOS_ORDEM) {
    assert.ok(casaDaRegiao(t, 5, 4).d.some((c) => c), `${t}: casa vazia`);
    assert.ok(terreiroDaRegiao(t, 7, 5).d.some((c) => c), `${t}: terreiro vazio`);
  }
  assert.ok(usados.length > 15);
});

test('o desenho tem o tamanho da construção, mais a sobra de cima', () => {
  for (const { id, o, tipo } of usados) {
    const larg = o.larg ?? 4, alt = o.alt ?? 3;
    const b = o.tipo === 'casa' ? casaDaRegiao(tipo, larg, alt, o.portaCol) : terreiroDaRegiao(tipo, larg, alt, o.portaCol);
    assert.equal(b.w, larg * TS, `${id}: largura`);
    assert.equal(b.h, alt * TS + SOBRA, `${id}: altura`);
    // nada desenhado abaixo do chão: a última linha é o pé da construção
    assert.ok(b.d.slice((b.h - 1) * b.w).some((c) => c), `${id}: ${o.tipo} não encosta no chão`);
  }
});

test('a porta é desenhada no tile por onde se entra', () => {
  for (const { id, o, tipo } of usados) {
    const larg = o.larg ?? 4, alt = o.alt ?? 3;
    const b = o.tipo === 'casa' ? casaDaRegiao(tipo, larg, alt, o.portaCol) : terreiroDaRegiao(tipo, larg, alt, o.portaCol);
    const meio = colunaPorta(larg, o.portaCol) * TS + TS / 2;
    // o vão da porta ocupa o meio do tile da porta nas últimas fileiras
    for (let y = b.h - 10; y < b.h - 1; y++) assert.ok(b.get(meio, y), `${id}: ${o.tipo} sem porta em (${meio},${y})`);
  }
});
