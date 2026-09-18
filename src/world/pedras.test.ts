import test from 'node:test';
import assert from 'node:assert/strict';
import { Mapa, type ContextoMapa, type DefMapa } from './tilemap.ts';
import { empurrar, ocupadaPorPedra, posicoesIniciais, temSolucao,
         type Cova, type Pedra } from './pedras.ts';

const CTX: ContextoMapa = { contas: () => 0, nadar: false, ligada: () => false };

/* corredor reto de largura 1, colunas 1..4 andáveis (0 e 5 são parede) */
function corredor(): Mapa {
  const def: DefMapa = {
    id: 'teste', nome: 'TESTE',
    chao: ['######', '#....#', '######'],
    objetos: [], npcs: [],
    inicio: { tx: 1, ty: 1, dir: 'baixo' },
  };
  return new Mapa(def, CTX);
}

/* o mesmo corredor, mas com uma cova de VERDADE: sólida como qualquer
   objeto `cova` do jogo — é o que garante que empurrar uma pedra para lá
   não é bloqueado pelo próprio sólido que a impede de cair andando */
function corredorComCovaSolida(): Mapa {
  const def: DefMapa = {
    id: 'teste2', nome: 'TESTE2',
    chao: ['######', '#....#', '######'],
    objetos: [{ tipo: 'cova', tx: 3, ty: 1, seNao: 'nunca_liga' }],
    npcs: [],
    inicio: { tx: 1, ty: 1, dir: 'baixo' },
  };
  return new Mapa(def, CTX);
}

test('posicoesIniciais pula pedra cuja cova já foi tapada', () => {
  const def = [{ tx: 2, ty: 1, cova: 'cova_a' }, { tx: 3, ty: 1, cova: 'cova_b' }];
  const nenhuma = posicoesIniciais(def, () => true);
  assert.equal(nenhuma.length, 0);

  const so_b = posicoesIniciais(def, (f) => f === 'cova_a');
  assert.deepEqual(so_b, [{ tx: 3, ty: 1 }]);
});

test('empurrar move a pedra um tile na direção do empurrão', () => {
  const pedras: Pedra[] = [{ tx: 2, ty: 1 }];
  const r = empurrar(pedras, 1, 1, 1, 0, () => true, []);
  assert.equal(r.moveu, true);
  assert.equal(r.encaixou, null);
  assert.deepEqual(pedras, [{ tx: 3, ty: 1 }]);
});

test('empurrar contra parede, outra pedra ou NPC não move nada', () => {
  const pedras: Pedra[] = [{ tx: 2, ty: 1 }];
  const semSaida = () => false;
  const r = empurrar(pedras, 1, 1, 1, 0, semSaida, []);
  assert.equal(r.moveu, false);
  assert.deepEqual(pedras, [{ tx: 2, ty: 1 }], 'a pedra não devia sair do lugar');
});

test('empurrar sem pedra na frente não faz nada', () => {
  const pedras: Pedra[] = [{ tx: 5, ty: 5 }];
  const r = empurrar(pedras, 1, 1, 1, 0, () => true, []);
  assert.equal(r.moveu, false);
  assert.equal(r.encaixou, null);
});

test('empurrar numa cova aberta funde a pedra: ela some da sala', () => {
  const pedras: Pedra[] = [{ tx: 2, ty: 1 }];
  const covas: Cova[] = [{ tx: 3, ty: 1, flag: 'cova_a' }];
  const r = empurrar(pedras, 1, 1, 1, 0, () => true, covas);
  assert.equal(r.moveu, true);
  assert.equal(r.encaixou, 'cova_a');
  assert.equal(pedras.length, 0, 'a pedra funde na cova e some');
});

test('ocupadaPorPedra reflete o estado atual da lista', () => {
  const pedras: Pedra[] = [{ tx: 2, ty: 1 }];
  assert.ok(ocupadaPorPedra(pedras, 2, 1));
  assert.ok(!ocupadaPorPedra(pedras, 3, 1));
});

test('temSolucao: um corredor reto com a cova pela frente tem solução', () => {
  const m = corredor();
  const pedras: Pedra[] = [{ tx: 2, ty: 1 }];
  const covas: Cova[] = [{ tx: 3, ty: 1, flag: 'cova_a' }];
  assert.ok(temSolucao(m, { tx: 1, ty: 1 }, pedras, covas, { tx: 4, ty: 1 }));
});

test('temSolucao: cova do lado que ninguém alcança não tem solução', () => {
  // corredor de largura 1: o jogador nasce encostado na pedra, do lado
  // oeste. Só dá pra empurrá-la pra LESTE — pro lado oeste (onde está a
  // cova) precisaria empurrar do lado leste, e não há como chegar lá sem
  // atravessar a própria pedra primeiro
  const m = corredor();
  const pedras: Pedra[] = [{ tx: 2, ty: 1 }];
  const covas: Cova[] = [{ tx: 1, ty: 1, flag: 'cova_b' }];
  assert.ok(!temSolucao(m, { tx: 1, ty: 1 }, pedras, covas, { tx: 4, ty: 1 }));
});

test('temSolucao: sem cova nenhuma, sempre tem solução', () => {
  const m = corredor();
  assert.ok(temSolucao(m, { tx: 1, ty: 1 }, [], [], { tx: 4, ty: 1 }));
});

test('temSolucao: a cova SÓLIDA de verdade não impede o empurrão nem a travessia', () => {
  // exatamente o bug que apareceu jogando: a cova bloqueia quem anda (é
  // sólida por padrão, como qualquer `cova` do jogo), mas isso não pode
  // impedir a pedra de entrar nela nem o jogador de andar por cima depois
  const m = corredorComCovaSolida();
  const pedras: Pedra[] = [{ tx: 2, ty: 1 }];
  const covas: Cova[] = [{ tx: 3, ty: 1, flag: 'cova_a' }];
  assert.ok(temSolucao(m, { tx: 1, ty: 1 }, pedras, covas, { tx: 4, ty: 1 }));
});
