import test from 'node:test';
import assert from 'node:assert/strict';
import { abrigos, chegada, destinosDaCanoa, motivoParaNaoViajar } from './viagem.ts';
import { novoJogo } from './state.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { CIDADES, lugarNoMundo } from '../data/mundo.ts';
import { Mapa } from '../world/tilemap.ts';

test('toda cidade tem um abrigo, e a chegada é andável lá dentro', () => {
  const tem = abrigos(MAPAS);
  for (const c of CIDADES) {
    assert.ok(tem.has(c), `${c} sem abrigo`);
    const ch = chegada(c, MAPAS)!;
    assert.equal(lugarNoMundo(ch.mapa, MAPAS), c);
    assert.ok(MAPAS[ch.mapa]!.refugio, `${ch.mapa} não é abrigo`);
    const m = new Mapa(MAPAS[ch.mapa]!);
    assert.ok(!m.solido(ch.tx, ch.ty), `${c}: chegada sólida`);
  }
});

test('a canoa só leva para onde já se esteve, e nunca para onde se está', () => {
  const e = novoJogo();
  assert.deepEqual(destinosDaCanoa(e, MAPAS, 'vilaAurora'), []);
  e.flags['visitou_vilaAurora'] = true;
  e.flags['visitou_portoIara'] = true;
  assert.deepEqual(destinosDaCanoa(e, MAPAS, 'vilaAurora'), ['portoIara']);
  assert.deepEqual(new Set(destinosDaCanoa(e, MAPAS, 'rotaUm')), new Set(['vilaAurora', 'portoIara']));
});

test('escolta, corrida e falta de destino seguram a canoa', () => {
  const e = novoJogo();
  assert.match(motivoParaNaoViajar(e, { correndo: false, destinos: 0 })!, /já esteve/);
  assert.match(motivoParaNaoViajar(e, { correndo: true, destinos: 2 })!, /tempo/);
  e.flags['escoltando_menino'] = true;
  assert.match(motivoParaNaoViajar(e, { correndo: false, destinos: 2 })!, /levando/);
  e.flags['menino_salvo'] = true;
  assert.equal(motivoParaNaoViajar(e, { correndo: false, destinos: 2 }), null);
});
