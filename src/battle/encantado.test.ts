import test from 'node:test';
import assert from 'node:assert/strict';
import { Aleatorio } from '../core/rng.ts';
import {
  atributos, criar, curarTudo, desmaiado, evoluir, ficha, ganharXP,
  golpesAte, hpMaximo, nome, progressoXP, reviver, semPP, sortearSelvagem,
  substituirGolpe, xpDoNivel, xpPorDerrotar, MAX_GOLPES, NIVEL_MAX,
} from './encantado.ts';
import { ESPECIES_ORDEM, especie } from '../data/creatures.ts';
import { GOLPES } from '../data/moves.ts';

test('toda espécie referencia golpes e evoluções que existem', () => {
  for (const id of ESPECIES_ORDEM) {
    const e = especie(id);
    for (const a of e.aprende) {
      assert.ok(GOLPES[a.golpe], `${id} aprende golpe inexistente: ${a.golpe}`);
      assert.ok(a.nv >= 1 && a.nv <= NIVEL_MAX, `${id}: nível inválido ${a.nv}`);
    }
    if (e.evolui) {
      assert.ok(ESPECIES_ORDEM.includes(e.evolui.em),
                `${id} evolui para espécie inexistente: ${e.evolui.em}`);
    }
    assert.ok(e.tipos.length >= 1 && e.tipos.length <= 2, `${id}: tipos demais`);
    assert.ok(e.aprende.some((a) => a.nv === 1), `${id} nasce sem golpe nenhum`);
  }
});

test('nasce com o HP cheio e com no máximo quatro golpes', () => {
  for (const id of ESPECIES_ORDEM) {
    const e = criar(id, 25);
    assert.equal(e.hp, hpMaximo(e));
    assert.ok(e.golpes.length > 0 && e.golpes.length <= MAX_GOLPES);
    assert.equal(desmaiado(e), false);
  }
});

test('os atributos crescem com o nível', () => {
  const novato = criar('iarinha', 5);
  const veterano = criar('iarinha', 40);
  const a = atributos(novato), b = atributos(veterano);
  for (const k of ['hp', 'atq', 'def', 'esp', 'vel'] as const) {
    assert.ok(b[k] > a[k], `${k} não cresceu`);
  }
});

test('atributo-base maior vira atributo maior no mesmo nível', () => {
  // Curupirá é o mais forte no braço; Iara-Mãe é a mais forte na magia
  const cur = atributos(criar('curupira', 30));
  const iara = atributos(criar('iaraMae', 30));
  assert.ok(cur.atq > iara.atq);
  assert.ok(iara.esp > cur.esp);
});

test('a curva de XP é crescente e o nível 1 custa zero', () => {
  assert.equal(xpDoNivel(1, 'medio'), 0);
  for (let n = 2; n <= NIVEL_MAX; n++) {
    assert.ok(xpDoNivel(n, 'medio') > xpDoNivel(n - 1, 'medio'));
  }
  // "rápido" precisa de menos XP que "lento" no mesmo nível
  assert.ok(xpDoNivel(30, 'rapido') < xpDoNivel(30, 'medio'));
  assert.ok(xpDoNivel(30, 'medio') < xpDoNivel(30, 'lento'));
});

test('a barra de XP fica entre 0 e 1 e zera ao subir de nível', () => {
  const e = criar('piragua', 10);
  assert.equal(progressoXP(e), 0);
  ganharXP(e, 1);
  const p = progressoXP(e);
  assert.ok(p > 0 && p < 1);
});

test('XP suficiente sobe um nível e aprende o golpe do nível', () => {
  const e = criar('curupinho', 5);
  const alvo = xpDoNivel(6, 'medio') - e.xp;
  const subidas = ganharXP(e, alvo);
  assert.equal(subidas.length, 1);
  assert.equal(e.nivel, 6);
  assert.deepEqual(subidas[0]!.aprendeu, ['cipo']);
  assert.ok(e.golpes.some((g) => g.id === 'cipo'));
});

test('XP de sobra sobe vários níveis de uma vez, um relato por nível', () => {
  const e = criar('piragua', 5);
  const subidas = ganharXP(e, xpDoNivel(12, 'rapido'));
  assert.equal(e.nivel, 12);
  assert.deepEqual(subidas.map((s) => s.nivel), [6, 7, 8, 9, 10, 11, 12]);
});

test('subir de nível soma o HP ganho ao HP atual, sem curar de graça', () => {
  const e = criar('iarinha', 10);
  e.hp = 5;
  const antes = hpMaximo(e);
  ganharXP(e, xpDoNivel(11, 'medio') - e.xp);
  const ganho = hpMaximo(e) - antes;
  assert.equal(e.hp, 5 + ganho);
  assert.ok(e.hp < hpMaximo(e), 'subir de nível não pode encher a barra');
});

test('com quatro golpes ocupados o novo fica pendente em vez de sumir', () => {
  const e = criar('boitatinha', 13);   // já sabe 4: investida, brasa, rosnado, labareda
  assert.equal(e.golpes.length, MAX_GOLPES);
  const subidas = ganharXP(e, xpDoNivel(14, 'medio') - e.xp);
  assert.deepEqual(subidas[0]!.aprendeu, []);
  assert.deepEqual(subidas[0]!.naoCoube, ['fogo_fatuo']);
  assert.equal(e.golpes.length, MAX_GOLPES);
});

test('substituir golpe troca o certo e devolve os PP cheios', () => {
  const e = criar('boitatinha', 13);
  substituirGolpe(e, 1, 'fogo_fatuo');
  assert.equal(e.golpes[1]!.id, 'fogo_fatuo');
  assert.equal(e.golpes[1]!.pp, GOLPES['fogo_fatuo']!.pp);
  assert.equal(e.golpes.length, MAX_GOLPES);
});

test('chegar ao nível da evolução é sinalizado, mas quem evolui é quem chama', () => {
  const e = criar('boitatinha', 17);
  const subidas = ganharXP(e, xpDoNivel(18, 'medio') - e.xp);
  assert.equal(subidas.at(-1)!.evoluiEm, 'boitatao');
  assert.equal(e.especie, 'boitatinha');    // ainda não evoluiu
});

test('evoluir mantém nível e golpes, e o HP ganho entra como HP de verdade', () => {
  const e = criar('curupinho', 18);
  e.hp = 10;
  const golpes = e.golpes.map((g) => g.id);
  const antes = hpMaximo(e);
  evoluir(e, 'curupira');
  assert.equal(e.especie, 'curupira');
  assert.equal(e.nivel, 18);
  assert.deepEqual(e.golpes.map((g) => g.id), golpes);
  assert.equal(e.hp, 10 + (hpMaximo(e) - antes));
  assert.ok(hpMaximo(e) > antes);
  assert.equal(nome(e), 'Curupirá');
});

test('apelido ganha da espécie na hora de mostrar o nome', () => {
  const e = criar('iarinha', 5, { apelido: 'Muriqui' });
  assert.equal(nome(e), 'Muriqui');
  assert.equal(ficha(e).nome, 'Iarinha');
});

test('golpesAte entrega os quatro mais recentes que a espécie já saberia', () => {
  assert.deepEqual(golpesAte('boitatinha', 1), ['investida', 'brasa']);
  const nv20 = golpesAte('boitatinha', 20);
  assert.equal(nv20.length, MAX_GOLPES);
  assert.ok(nv20.includes('rabo_brasa'));
  assert.ok(!nv20.includes('investida'), 'os mais antigos saem primeiro');
});

test('derrotar um treinador rende mais XP que derrotar um selvagem igual', () => {
  const selvagem = criar('piragua', 12, { selvagem: true });
  const domado = criar('piragua', 12);
  assert.ok(xpPorDerrotar(domado) > xpPorDerrotar(selvagem));
});

test('semPP só é verdade quando nenhum golpe tem PP', () => {
  const e = criar('iarinha', 10);
  assert.equal(semPP(e), false);
  for (const g of e.golpes) g.pp = 0;
  assert.equal(semPP(e), true);
});

test('curarTudo devolve HP, PP e limpa o estado', () => {
  const e = criar('iarinha', 20);
  e.hp = 1; e.status = 'queimado'; e.golpes[0]!.pp = 0;
  curarTudo(e);
  assert.equal(e.hp, hpMaximo(e));
  assert.equal(e.status, null);
  assert.equal(e.golpes[0]!.pp, e.golpes[0]!.ppMax);
});

test('reviver só funciona em quem está caído', () => {
  const e = criar('iarinha', 20);
  reviver(e);
  assert.equal(e.hp, hpMaximo(e), 'quem está de pé não muda');
  e.hp = 0;
  reviver(e, 0.5);
  assert.equal(e.hp, Math.floor(hpMaximo(e) * 0.5));
});

test('o sorteio do mato respeita os pesos e a faixa de nível', () => {
  const tabela = [
    { especie: 'piragua', min: 3, max: 5, peso: 90 },
    { especie: 'sacizinho', min: 4, max: 6, peso: 10 },
  ];
  const rnd = new Aleatorio(42);
  const conta: Record<string, number> = {};
  for (let i = 0; i < 2000; i++) {
    const e = sortearSelvagem(tabela, rnd);
    conta[e.especie] = (conta[e.especie] ?? 0) + 1;
    assert.equal(e.selvagem, true);
    const faixa = tabela.find((t) => t.especie === e.especie)!;
    assert.ok(e.nivel >= faixa.min && e.nivel <= faixa.max);
  }
  assert.ok(conta['piragua']! > conta['sacizinho']! * 4, 'o peso não pesou');
});
