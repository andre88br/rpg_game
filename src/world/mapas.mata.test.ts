/* =========================================================================
   Coerência dos mapas — Mata do Curupira: o salão que empurra raiz.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from '../data/mapas/index.ts';
import { mapa, alcance, alcanceDeslizando } from './mapas.apoio.ts';

/* ---------------------------------------------- o salão que empurra raiz */

test('o quebra-cabeça do Terreiro de Raiz tem solução', () => {
  const def = MAPAS['terreiroCurupira']!;
  const m = mapa('terreiroCurupira');
  const tie = def.npcs.find((n) => n.id === 'tie')!;
  const daPorta = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);

  const vizinhos = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dx, dy]) => `${tie.tx + dx!},${tie.ty + dy!}`);
  assert.ok(vizinhos.some((v) => daPorta.has(v)),
            'o campo de raízes não tem caminho até a Tiê');
});

test('e ninguém fica preso no meio das raízes', () => {
  const def = MAPAS['terreiroCurupira']!;
  const m = mapa('terreiroCurupira');
  const entrada = `${def.inicio.tx},${def.inicio.ty}`;
  for (const lugar of alcanceDeslizando(m, def.inicio.tx, def.inicio.ty)) {
    const [x, y] = lugar.split(',').map(Number) as [number, number];
    assert.ok(alcanceDeslizando(m, x, y).has(entrada),
              `quem chega em (${lugar}) não consegue mais voltar para a porta`);
  }
});

test('o Terreiro de Raiz é mesmo um quebra-cabeça, não um corredor', () => {
  const def = MAPAS['terreiroCurupira']!;
  const m = mapa('terreiroCurupira');
  const raizes = def.chao.join('').split('').filter((c) => c === 'v').length;
  assert.ok(raizes > 35, `o campo tem só ${raizes} tiles de raiz viva`);

  const tie = def.npcs.find((n) => n.id === 'tie')!;
  const escorregando = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);
  const aPe = alcance(m, def.inicio.tx, def.inicio.ty);
  assert.ok(aPe.has(`${tie.tx - 1},${tie.ty}`),
            'sem escorregar o salão devia ser um corredor reto');
  assert.ok(escorregando.size < aPe.size,
            'a raiz devia tirar lugares de alcance, não deixar tudo igual');
});

test('o campo de raízes não se resolve segurando uma direção só', () => {
  /* se um pillar sozinho já não bastasse, esse é o teste que provaria: uma
     tecla segurada até bater em alguma coisa não pode encostar do lado da
     Tiê — senão o "quebra-cabeça" era só um corredor disfarçado */
  const def = MAPAS['terreiroCurupira']!;
  const m = mapa('terreiroCurupira');
  const tie = def.npcs.find((n) => n.id === 'tie')!;

  function segurar(dx: number, dy: number): [number, number] {
    let x = def.inicio.tx, y = def.inicio.ty;
    for (let i = 0; i < 30; i++) {
      let nx = x + dx, ny = y + dy;
      if (m.solido(nx, ny)) break;
      while (m.escorrega(nx, ny)) {
        const ax = nx + dx, ay = ny + dy;
        if (m.solido(ax, ay)) break;
        nx = ax; ny = ay;
      }
      if (nx === x && ny === y) break;
      x = nx; y = ny;
    }
    return [x, y];
  }

  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
    const [x, y] = segurar(dx, dy);
    const chegou = [[0, 1], [0, -1], [1, 0], [-1, 0]]
      .some(([ax, ay]) => x === tie.tx + ax! && y === tie.ty + ay!);
    assert.ok(!chegou, `segurando só uma direção (${dx},${dy}) não devia chegar do lado da Tiê`);
  }
});
