import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compatibilidade, ensinar, relembraveis } from './golpes.ts';
import { criar, evoluir } from '../battle/encantado.ts';
import { GOLPES } from '../data/moves.ts';
import { ITENS } from '../data/items.ts';
import { ESPECIES } from '../data/creatures.ts';

test('relembra o que já teria aprendido, menos o que sabe e o que ainda não chegou', () => {
  const e = criar('boitatinha', 15);      // sabe os quatro últimos até o 15
  const lista = relembraveis(e);
  assert.ok(lista.includes('investida'), 'o golpe do nível 1 que saiu volta');
  for (const g of e.golpes) assert.ok(!lista.includes(g.id), `já sabe ${g.id}`);
  assert.ok(!lista.includes('rabo_brasa'), 'o do nível 20 ainda não');
});

test('quem evoluiu lembra também o golpe da forma de antes', () => {
  const e = criar('curupinho', 30);
  evoluir(e, 'curupira');
  // Raiz Sugadora só existe na lista do Curupinho
  assert.ok(relembraveis(e).includes('raiz_sugadora'));
});

test('a cantiga: pode, não pode e já sabe', () => {
  const fogo = criar('boitatinha', 20);
  assert.equal(compatibilidade(fogo, 'cantiga_capim'), 'pode');       // todos
  assert.equal(compatibilidade(fogo, 'cantiga_pedra'), 'pode');       // terra, fogo, raio
  assert.equal(compatibilidade(fogo, 'cantiga_trovao'), 'nao');       // raio, vento, água
  ensinar(fogo, 'fecha_corpo', 0);
  assert.equal(compatibilidade(fogo, 'cantiga_capim'), 'ja');
  assert.equal(compatibilidade(fogo, 'garrafada'), 'nao');            // não é cantiga
});

test('ensinar: com vaga entra; sem vaga troca o escolhido; sem escolha não ensina', () => {
  const e = criar('boitatinha', 1);                                   // dois golpes
  assert.ok(ensinar(e, 'grito'));
  assert.equal(e.golpes.at(-1)!.id, 'grito');
  const cheio = criar('boitatinha', 20);
  assert.equal(cheio.golpes.length, 4);
  assert.equal(ensinar(cheio, 'pisao'), false);
  assert.ok(ensinar(cheio, 'pisao', 2));
  assert.equal(cheio.golpes[2]!.id, 'pisao');
  assert.equal(cheio.golpes[2]!.pp, GOLPES['pisao']!.pp);
  assert.equal(ensinar(cheio, 'pisao', 1), false, 'não ensina o que já sabe');
});

test('toda cantiga ensina um golpe que existe, a alguma espécie', () => {
  const cantigas = Object.values(ITENS).filter((i) => i.efeito.k === 'cantiga');
  assert.equal(cantigas.length, 11);
  for (const c of cantigas) {
    const ef = c.efeito as Extract<typeof c.efeito, { k: 'cantiga' }>;
    assert.ok(GOLPES[ef.golpe], `${c.id}: golpe ${ef.golpe}`);
    const alguem = Object.values(ESPECIES).some((e) =>
      ef.tipos === 'todos' || e.tipos.some((t) => (ef.tipos as readonly string[]).includes(t)));
    assert.ok(alguem, `${c.id}: ninguém pode aprender`);
  }
});
