/* =========================================================================
   Coerência dos mapas — Região da Foz: o salão que escorrega.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from '../data/mapas/index.ts';
import { mapa, alcance, alcanceDeslizando } from './mapas.apoio.ts';

/* ------------------------------------------------ o salão que escorrega */

test('o quebra-cabeça do terreiro tem solução', () => {
  const def = MAPAS['terreiroPortoIara']!;
  const m = mapa('terreiroPortoIara');
  const mariana = def.npcs.find((n) => n.id === 'mariana')!;
  const daPorta = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);

  // dá para chegar de frente para a Dona Mariana, escorregão a escorregão
  const vizinhos = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dx, dy]) => `${mariana.tx + dx!},${mariana.ty + dy!}`);
  assert.ok(vizinhos.some((v) => daPorta.has(v)),
            'o salão alagado não tem caminho até a Dona Mariana');
});

test('e ninguém fica preso no meio da água', () => {
  const def = MAPAS['terreiroPortoIara']!;
  const m = mapa('terreiroPortoIara');
  const entrada = `${def.inicio.tx},${def.inicio.ty}`;
  // de qualquer lugar que dê para alcançar, tem que dar para voltar
  for (const lugar of alcanceDeslizando(m, def.inicio.tx, def.inicio.ty)) {
    const [x, y] = lugar.split(',').map(Number) as [number, number];
    assert.ok(alcanceDeslizando(m, x, y).has(entrada),
              `quem chega em (${lugar}) não consegue mais voltar para a porta`);
  }
});

test('o salão do terreiro é mesmo um quebra-cabeça, não um corredor', () => {
  /* andando normal (sem escorregar) o caminho seria trivial; é a água que
     torna o salão um problema. Se um dia alguém tirar as poças, este teste
     avisa que o desafio virou corredor. */
  const def = MAPAS['terreiroPortoIara']!;
  const m = mapa('terreiroPortoIara');
  const pocas = def.chao.join('').split('').filter((c) => c === 'u').length;
  assert.ok(pocas > 40, `o salão tem só ${pocas} tiles de água`);

  const mariana = def.npcs.find((n) => n.id === 'mariana')!;
  const escorregando = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);
  const aPe = alcance(m, def.inicio.tx, def.inicio.ty);
  assert.ok(aPe.has(`${mariana.tx - 1},${mariana.ty}`),
            'sem escorregar o salão devia ser um corredor reto');
  assert.ok(escorregando.size < aPe.size,
            'a água devia tirar lugares de alcance, não deixar tudo igual');
});
