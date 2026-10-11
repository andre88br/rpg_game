/* A Companhia Mata-Seca com rosto: um capanga em cada região da Foz ao
   Bairro da Cuca, o escritório do Doutor Ferraz na Cidade do Sol, e o
   balão do Círculo esperando o Ferraz cair. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from './mapas/index.ts';
import { REGIOES, regiaoDoMapa } from './mundo.ts';
import { CUTSCENES } from './cutscenes.ts';
import { novoJogo } from '../game/state.ts';
import { escolherFala } from '../game/quests.ts';
import type { DefNPC } from '../world/tilemap.ts';

const todosNpcs = (): [string, DefNPC][] =>
  Object.entries(MAPAS).flatMap(([id, m]) => m.npcs.map((n) => [id, n] as [string, DefNPC]));

test('cada região da Foz ao Bairro da Cuca tem um capanga da Companhia', () => {
  const capangas = todosNpcs().filter(([, n]) => n.treinador?.classe === 'CAPANGA DA COMPANHIA');
  for (const r of REGIOES.filter((r) => r.tipo !== 'luz')) {
    const daqui = capangas.filter(([mapa, n]) => regiaoDoMapa(mapa)?.tipo === r.tipo && n.id === `capanga_${r.tipo}`);
    assert.equal(daqui.length, 1, `${r.nome}: devia ter exatamente um capanga_${r.tipo}`);
    const [, n] = daqui[0]!;
    // só aparece depois da medalha — é a cerimônia que conta da ameaça
    assert.equal(n.se, `medalha:${r.medalha}`, `${n.id}: devia esperar a medalha da região`);
    assert.equal(n.seNao, `venceu_${n.id}`, `${n.id}: vencido, devia sumir`);
    assert.equal(n.treinador!.liga, `companhia_${r.tipo}`);
    assert.match(JSON.stringify(n), /Doutor Ferraz/, `${n.id}: devia falar do patrão`);
    assert.ok(n.treinador!.falaDerrota, `${n.id}: devia desfazer a ameaça ao perder`);
  }
});

test('o escritório da Companhia fica na Cidade do Sol, com o Ferraz dentro', () => {
  assert.equal(regiaoDoMapa('escritorioCompanhia')?.tipo, 'luz');
  const porta = (MAPAS.cidadeDoSol!.saidas ?? []).find((s) => s.para === 'escritorioCompanhia');
  assert.ok(porta, 'a Cidade do Sol devia ter a porta do escritório');
  const ferraz = MAPAS.escritorioCompanhia!.npcs.find((n) => n.id === 'ferraz');
  assert.ok(ferraz?.treinador, 'o Ferraz devia ser treinador');
  assert.equal(ferraz!.treinador!.cutscene, 'ferraz');
  assert.ok(CUTSCENES.ferraz, 'falta a cutscene do Ferraz');
  const nivel = Math.max(...ferraz!.treinador!.time.map((t) => t.nivel));
  assert.ok(nivel >= 64 && nivel <= 70, `Ferraz no nível ${nivel}`);

  // antes da visão do Oráculo ele só manda embora; depois, desafia
  const e = novoJogo();
  assert.equal(escolherFala(e, ferraz!.falas)?.batalha, undefined);
  e.flags.conta_oraculo = true;
  assert.equal(escolherFala(e, ferraz!.falas)?.batalha, true);
});

test('o balão só sobe para o Círculo depois do Ferraz', () => {
  const baloeiro = MAPAS.cidadeDoSol!.npcs.find((n) => n.id === 'baloeiro_sol')!;
  const e = novoJogo();
  e.medalhas = REGIOES.map((r) => r.medalha);
  assert.equal(escolherFala(e, baloeiro.falas)?.leva, undefined, 'subiu sem vencer o Ferraz');
  e.flags.venceu_ferraz = true;
  assert.equal(escolherFala(e, baloeiro.falas)?.leva?.mapa, 'circuloDourado');
});
