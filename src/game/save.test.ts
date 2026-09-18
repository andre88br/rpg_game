import test from 'node:test';
import assert from 'node:assert/strict';
import { novoJogo, ligar } from './state.ts';
import { adicionar, quantidade } from '../data/items.ts';
import { criar, hpMaximo } from '../battle/encantado.ts';
import { MAPAS, MAPA_INICIAL } from '../data/mapas/index.ts';
import {
  NUM_SLOTS, algumSlotOcupado, apagar, apagarSlot, carregar, carregarDeSlot,
  definirSlotAtivo, migrarSaveAntigo, obterSlotAtivo, primeiroSlotVazio,
  quandoSalvou, resumoSlot, resumoTodos, restaurar, salvar, salvarEmSlot,
  serializar, temSave, temSaveEmSlot, usarArmazem, type Armazem,
} from './save.ts';

/* armazém de mentira: o mesmo contrato do localStorage, sem navegador */
/* a partida nasce sem time: quem testa ida e volta de bicho monta o seu */
function comTime(e: ReturnType<typeof novoJogo>): ReturnType<typeof novoJogo> {
  e.time = [criar('iarinha', 5), criar('boitatinha', 5)];
  return e;
}

function memoria(): Armazem & { dados: Map<string, string> } {
  const dados = new Map<string, string>();
  return {
    dados,
    getItem: (k) => dados.get(k) ?? null,
    setItem: (k, v) => { dados.set(k, v); },
    removeItem: (k) => { dados.delete(k); },
  };
}

test('ida e volta preserva o que importa', () => {
  const e = comTime(novoJogo('ROSA', 'bento'));
  ligar(e, 'conta_recado');
  e.dinheiro = 1234;
  e.medalhas = ['mare'];
  e.vistos = ['piragua'];
  e.capturados = ['piragua'];
  e.posicao = { mapa: 'rotaFoz', tx: 13, ty: 10, dir: 'baixo' };
  e.time[0]!.hp = 3;
  e.time[0]!.apelido = 'PINGO';

  const v = restaurar(serializar(e))!;
  assert.ok(v);
  assert.equal(v.nome, 'ROSA');
  assert.equal(v.personagem, 'bento');
  assert.equal(v.dinheiro, 1234);
  assert.equal(v.flags['conta_recado'], true);
  assert.deepEqual(v.medalhas, ['mare']);
  assert.deepEqual(v.posicao, { mapa: 'rotaFoz', tx: 13, ty: 10, dir: 'baixo' });
  assert.equal(v.time.length, e.time.length);
  assert.equal(v.time[0]!.hp, 3);
  assert.equal(v.time[0]!.apelido, 'PINGO');
  assert.equal(v.time[0]!.golpes.length, e.time[0]!.golpes.length);
});

test('o save é uma cópia: mexer nele não mexe na partida', () => {
  const e = comTime(novoJogo());
  const s = serializar(e);
  s.jogo.time[0]!.hp = 1;
  s.jogo.dinheiro = 0;
  assert.notEqual(e.time[0]!.hp, 1);
  assert.equal(e.dinheiro, 3000);
});

test('save de antes da escolha de personagem volta como Tainá', () => {
  const s = serializar(novoJogo('ANTIGA'));
  delete (s.jogo as { personagem?: string }).personagem;
  const v = restaurar(s)!;
  assert.equal(v.personagem, 'taina');
});

test('personagem desconhecido no save não quebra a partida', () => {
  const s = serializar(novoJogo());
  (s.jogo as { personagem: string }).personagem = 'ninguem_assim';
  const v = restaurar(s)!;
  assert.equal(v.personagem, 'taina');
});

test('versão diferente não é save desta publicação', () => {
  const s = serializar(novoJogo());
  assert.equal(restaurar({ ...s, v: 99 }), null);
  assert.equal(restaurar(null), null);
  assert.equal(restaurar({ v: 1 }), null);
});

test('espécie que sumiu do jogo é descartada, não quebra a partida', () => {
  const e = comTime(novoJogo());
  const s = serializar(e);
  s.jogo.time.unshift({ ...s.jogo.time[0]!, especie: 'bicho_que_nao_existe' });
  const v = restaurar(s)!;
  assert.ok(v);
  assert.equal(v.time.length, e.time.length);
  assert.ok(v.time.every((c) => c.especie !== 'bicho_que_nao_existe'));
});

test('partida sem time volta inteira: é quem ainda não escolheu o inicial', () => {
  const s = serializar(novoJogo('NOVATA'));
  assert.deepEqual(s.jogo.time, []);
  const v = restaurar(s)!;
  assert.ok(v, 'quem gravou antes de escolher o patuá tem partida para retomar');
  assert.deepEqual(v.time, []);
  assert.equal(v.nome, 'NOVATA');
});

test('vida acima do máximo é aparada', () => {
  const e = comTime(novoJogo());
  const s = serializar(e);
  s.jogo.time[0]!.hp = 99999;
  const v = restaurar(s)!;
  assert.equal(v.time[0]!.hp, hpMaximo(v.time[0]!));
});

test('golpe que não existe mais some, e o bicho não fica mudo', () => {
  const e = novoJogo();
  e.time = [criar('piragua', 5)];
  const s = serializar(e);
  s.jogo.time[0]!.golpes = [{ id: 'golpe_fantasma', pp: 5, ppMax: 5 }];
  const v = restaurar(s)!;
  assert.ok(v.time[0]!.golpes.length >= 1);
  assert.ok(v.time[0]!.golpes.every((g) => g.id !== 'golpe_fantasma'));
});

test('mapa desconhecido volta para o começo', () => {
  const s = serializar(novoJogo());
  s.jogo.posicao = { mapa: 'ilha_que_nunca_existiu', tx: 3, ty: 3, dir: 'baixo' };
  const v = restaurar(s)!;
  assert.equal(v.posicao.mapa, MAPA_INICIAL);
  assert.deepEqual({ tx: v.posicao.tx, ty: v.posicao.ty },
                   { tx: MAPAS[MAPA_INICIAL]!.inicio.tx, ty: MAPAS[MAPA_INICIAL]!.inicio.ty });
});

test('posição fora da grade é trazida para dentro', () => {
  const s = serializar(novoJogo());
  s.jogo.posicao = { mapa: 'vilaAurora', tx: 9999, ty: -4, dir: 'dir' };
  const v = restaurar(s)!;
  assert.ok(v.posicao.tx >= 0 && v.posicao.tx < 30);
  assert.ok(v.posicao.ty >= 0);
});

test('item que não existe mais não volta na mochila', () => {
  const e = novoJogo();
  const s = serializar(e);
  s.jogo.mochila['item_fantasma'] = 5;
  s.jogo.mochila['patua'] = 7;
  const v = restaurar(s)!;
  assert.equal(quantidade(v.mochila, 'item_fantasma'), 0);
  assert.equal(quantidade(v.mochila, 'patua'), 7);
});

test('gravar, achar e retomar pelo slot ativo', () => {
  const ls = memoria();
  usarArmazem(ls);
  definirSlotAtivo(0);
  apagar();
  assert.equal(temSave(), false);
  assert.equal(carregar(), null);

  const e = novoJogo('BENTA');
  adicionar(e.mochila, 'patua_bom', 2);
  assert.equal(salvar(e), true);
  assert.equal(temSave(), true);
  assert.ok(quandoSalvou());

  const v = carregar()!;
  assert.equal(v.nome, 'BENTA');
  assert.equal(quantidade(v.mochila, 'patua_bom'), 2);

  apagar();
  assert.equal(temSave(), false);
  usarArmazem(null);
});

test('save corrompido no armazém não derruba o jogo', () => {
  const ls = memoria();
  usarArmazem(ls);
  definirSlotAtivo(2);
  ls.dados.set('encantados:save:v1:2', '{isso não é json');
  assert.equal(carregar(), null);
  assert.equal(temSave(), true);      // existe, mas não serve
  assert.equal(quandoSalvou(), null);
  apagarSlot(2);
  usarArmazem(null);
});

test('sem armazém nenhum, salvar apenas devolve falso', () => {
  usarArmazem(null);
  assert.equal(salvar(novoJogo()), false);
  assert.equal(carregar(), null);
  assert.equal(temSave(), false);
});

test('os seis slots são independentes', () => {
  const ls = memoria();
  usarArmazem(ls);
  for (let i = 0; i < NUM_SLOTS; i++) apagarSlot(i);

  assert.equal(algumSlotOcupado(), false);
  assert.equal(primeiroSlotVazio(), 0);

  salvarEmSlot(novoJogo('UM'), 0);
  salvarEmSlot(novoJogo('DOIS'), 3);

  assert.equal(algumSlotOcupado(), true);
  assert.equal(temSaveEmSlot(0), true);
  assert.equal(temSaveEmSlot(1), false);
  assert.equal(temSaveEmSlot(3), true);
  assert.equal(primeiroSlotVazio(), 1);

  assert.equal(carregarDeSlot(0)!.nome, 'UM');
  assert.equal(carregarDeSlot(3)!.nome, 'DOIS');
  assert.equal(carregarDeSlot(1), null);

  // sobrescrever um slot não mexe nos outros
  salvarEmSlot(novoJogo('UM-DE-NOVO'), 0);
  assert.equal(carregarDeSlot(0)!.nome, 'UM-DE-NOVO');
  assert.equal(carregarDeSlot(3)!.nome, 'DOIS');

  apagarSlot(0);
  assert.equal(temSaveEmSlot(0), false);
  assert.equal(temSaveEmSlot(3), true);

  for (let i = 0; i < NUM_SLOTS; i++) apagarSlot(i);
  usarArmazem(null);
});

test('resumoSlot mostra o que a tela de slots precisa, e nada de um slot vazio', () => {
  const ls = memoria();
  usarArmazem(ls);
  for (let i = 0; i < NUM_SLOTS; i++) apagarSlot(i);

  assert.equal(resumoSlot(0), null);

  const e = comTime(novoJogo('CAIPORA'));
  e.medalhas = ['mare'];
  e.time[0]!.nivel = 22;
  salvarEmSlot(e, 2);

  const r = resumoSlot(2)!;
  assert.ok(r);
  assert.equal(r.slot, 2);
  assert.equal(r.nome, 'CAIPORA');
  assert.equal(r.medalhas, 1);
  assert.equal(r.nivel, 22);
  assert.ok(r.quando);

  const todos = resumoTodos();
  assert.equal(todos.length, NUM_SLOTS);
  assert.equal(todos[2]!.nome, 'CAIPORA');
  assert.equal(todos[0], null);

  for (let i = 0; i < NUM_SLOTS; i++) apagarSlot(i);
  usarArmazem(null);
});

test('slot ativo fica preso a [0, NUM_SLOTS)', () => {
  definirSlotAtivo(-3);
  assert.equal(obterSlotAtivo(), 0);
  definirSlotAtivo(999);
  assert.equal(obterSlotAtivo(), NUM_SLOTS - 1);
  definirSlotAtivo(2);
  assert.equal(obterSlotAtivo(), 2);
});

test('migração: um save do formato antigo vira o slot 1', () => {
  const ls = memoria();
  usarArmazem(ls);
  for (let i = 0; i < NUM_SLOTS; i++) apagarSlot(i);
  ls.dados.set('encantados:save:v1', JSON.stringify(serializar(novoJogo('ANTIGA'))));

  migrarSaveAntigo();

  assert.equal(ls.dados.has('encantados:save:v1'), false);
  assert.equal(temSaveEmSlot(0), true);
  assert.equal(carregarDeSlot(0)!.nome, 'ANTIGA');

  for (let i = 0; i < NUM_SLOTS; i++) apagarSlot(i);
  usarArmazem(null);
});

test('migração não sobrescreve um slot 1 que já existe', () => {
  const ls = memoria();
  usarArmazem(ls);
  for (let i = 0; i < NUM_SLOTS; i++) apagarSlot(i);
  salvarEmSlot(novoJogo('JA_TINHA'), 0);
  ls.dados.set('encantados:save:v1', JSON.stringify(serializar(novoJogo('ANTIGA'))));

  migrarSaveAntigo();

  assert.equal(carregarDeSlot(0)!.nome, 'JA_TINHA');

  for (let i = 0; i < NUM_SLOTS; i++) apagarSlot(i);
  usarArmazem(null);
});
