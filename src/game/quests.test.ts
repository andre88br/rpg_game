import test from 'node:test';
import assert from 'node:assert/strict';
import { novoJogo, ligar } from './state.ts';
import { criar } from '../battle/encantado.ts';
import { adicionar, consumir, quantidade, type Mochila } from '../data/items.ts';
import {
  CONTAS, aplicarFala, contasAcesas, contasFaltando, escolherFala, ligada,
  preencher, responder, serve,
  type Fala,
} from './quests.ts';

/* a partida nasce sem Encantado nenhum — quem testa cura precisa de time */
const comTime = (e: ReturnType<typeof novoJogo>) => {
  e.time = [criar('iarinha', 5), criar('boitatinha', 5)];
  return e;
};

const bolsa = (m: Mochila) => ({
  adicionar: (id: string, n: number) => adicionar(m, id, n),
  consumir: (id: string, n: number) => consumir(m, id, n),
});

test('flag ligada e a mesma flag negada', () => {
  const e = novoJogo();
  assert.equal(ligada(e, 'falou_firmina'), false);
  assert.equal(ligada(e, '!falou_firmina'), true);
  ligar(e, 'falou_firmina');
  assert.equal(ligada(e, 'falou_firmina'), true);
  assert.equal(ligada(e, '!falou_firmina'), false);
});

test('condição de item conta a quantidade', () => {
  const e = novoJogo();
  e.mochila = {};
  assert.equal(ligada(e, 'item:carta'), false);
  adicionar(e.mochila, 'carta', 1);
  assert.equal(ligada(e, 'item:carta'), true);
  assert.equal(ligada(e, 'item:carta>=2'), false);
  adicionar(e.mochila, 'carta', 1);
  assert.equal(ligada(e, 'item:carta>=2'), true);
});

test('condições de coleção e de bolso', () => {
  const e = novoJogo();
  e.vistos = ['piragua', 'sacizinho'];
  e.capturados = ['piragua'];
  e.dinheiro = 500;
  e.medalhas = ['mare'];
  assert.equal(ligada(e, 'vistos>=2'), true);
  assert.equal(ligada(e, 'vistos>=3'), false);
  assert.equal(ligada(e, 'capturados>=1'), true);
  assert.equal(ligada(e, 'dinheiro>=500'), true);
  assert.equal(ligada(e, 'dinheiro>=501'), false);
  assert.equal(ligada(e, 'medalha:mare'), true);
  assert.equal(ligada(e, 'medalha:cipo'), false);
});

test('escolherFala pega a PRIMEIRA que serve', () => {
  const e = novoJogo();
  const falas: Fala[] = [
    { se: 'conta_recado', linhas: ['obrigada de novo'] },
    { se: 'item:carta', linhas: ['leva essa carta'] },
    { linhas: ['bom dia'] },
  ];
  assert.equal(escolherFala(e, falas)!.linhas[0], 'bom dia');
  adicionar(e.mochila, 'carta', 1);
  assert.equal(escolherFala(e, falas)!.linhas[0], 'leva essa carta');
  ligar(e, 'conta_recado');
  assert.equal(escolherFala(e, falas)!.linhas[0], 'obrigada de novo');
});

test('seNao barra a fala sem precisar de negação na string', () => {
  const e = novoJogo();
  const f: Fala = { seNao: 'conta_recado', linhas: ['ainda falta'] };
  assert.equal(serve(e, f), true);
  ligar(e, 'conta_recado');
  assert.equal(serve(e, f), false);
});

test('sem nenhuma fala servindo, escolherFala devolve nulo', () => {
  const e = novoJogo();
  assert.equal(escolherFala(e, [{ se: 'nunca', linhas: ['oi'] }]), null);
});

test('aplicarFala liga flag, entrega e cobra item', () => {
  const e = novoJogo();
  e.mochila = {};
  adicionar(e.mochila, 'carta', 1);
  const efeito = aplicarFala(e, {
    linhas: ['tome'], liga: 'conta_recado',
    pede: { item: 'carta' }, da: { item: 'garrafada', n: 2 }, paga: 400,
  }, bolsa(e.mochila));
  assert.equal(e.flags['conta_recado'], true);
  assert.equal(quantidade(e.mochila, 'carta'), 0);
  assert.equal(quantidade(e.mochila, 'garrafada'), 2);
  assert.equal(e.dinheiro, 3400);
  assert.equal(efeito.levou, 'carta');
  assert.equal(efeito.deu, 'garrafada');
});

test('quem não tem o item pedido não recebe a troca pela metade', () => {
  const e = novoJogo();
  e.mochila = {};
  const efeito = aplicarFala(e, { linhas: ['cadê?'], pede: { item: 'carta' } }, bolsa(e.mochila));
  assert.equal(efeito.levou, null);
  assert.equal(quantidade(e.mochila, 'carta'), 0);
});

test('a cura levanta o time todo', () => {
  const e = comTime(novoJogo());
  e.time[0]!.hp = 1;
  e.time[1]!.hp = 0;
  const efeito = aplicarFala(e, { linhas: ['pronto'], cura: true }, bolsa(e.mochila));
  assert.equal(efeito.curou, true);
  assert.ok(e.time.every((c) => c.hp > 0));
});

test('dinheiro nunca fica negativo', () => {
  const e = novoJogo();
  e.dinheiro = 100;
  aplicarFala(e, { linhas: ['caro'], paga: -900 }, bolsa(e.mochila));
  assert.equal(e.dinheiro, 0);
});

test('as cinco contas acendem uma a uma', () => {
  const e = novoJogo();
  assert.equal(contasAcesas(e), 0);
  assert.equal(contasFaltando(e).length, 5);
  CONTAS.forEach((c, i) => {
    ligar(e, c.flag);
    assert.equal(contasAcesas(e), i + 1);
    assert.equal(contasFaltando(e).length, 4 - i);
  });
  assert.equal(ligada(e, 'contas>=5'), true);
});

test('as contas têm flags distintas', () => {
  assert.equal(new Set(CONTAS.map((c) => c.flag)).size, CONTAS.length);
});

test('o recheio das falas lê o estado da partida', () => {
  const e = novoJogo('BENTA');
  e.vistos = ['piragua', 'sacizinho'];
  assert.equal(preencher(e, 'Bom dia, {nome}.'), 'Bom dia, BENTA.');
  assert.equal(preencher(e, '{contas} de cinco, faltam {faltam}.'), '0 de cinco, faltam 5.');
  assert.equal(preencher(e, 'Você anotou {vistos} de quatro.'), 'Você anotou 2 de quatro.');
  assert.equal(preencher(e, 'Falta {servico}.'), `Falta ${CONTAS[0]!.servico}.`);
  ligar(e, CONTAS[0]!.flag);
  assert.equal(preencher(e, '{contas} de cinco, faltam {faltam}.'), '1 de cinco, faltam 4.');
  assert.equal(preencher(e, 'Falta {servico}.'), `Falta ${CONTAS[1]!.servico}.`);
});

test('chave que ninguém conhece fica como está', () => {
  const e = novoJogo();
  assert.equal(preencher(e, 'um {troco} qualquer'), 'um {troco} qualquer');
});

test('o recheio concorda em gênero com o personagem escolhido', () => {
  const tai = novoJogo('TAINÁ', 'taina');
  assert.equal(preencher(tai, 'Oi, {crianca}.'), 'Oi, menina.');
  assert.equal(preencher(tai, 'Te acharam {caida} no mato.'), 'Te acharam caída no mato.');

  const ben = novoJogo('BENTO', 'bento');
  assert.equal(preencher(ben, 'Oi, {crianca}.'), 'Oi, menino.');
  assert.equal(preencher(ben, 'Te acharam {caida} no mato.'), 'Te acharam caído no mato.');
});

test('a medalha entra na caixinha junto com o Dom', () => {
  const e = novoJogo();
  const efeito = aplicarFala(e, {
    linhas: ['tome a Maré'], medalha: 'mare', dom: 'nadar',
  }, bolsa(e.mochila));
  assert.deepEqual(e.medalhas, ['mare']);
  assert.equal(e.flags['dom_nadar'], true);
  assert.equal(efeito.medalha, 'mare');
  assert.equal(ligada(e, 'medalha:mare'), true);
});

test('a mesma medalha não entra duas vezes', () => {
  const e = novoJogo();
  const fala = { linhas: ['de novo'], medalha: 'mare' };
  aplicarFala(e, fala, bolsa(e.mochila));
  const segunda = aplicarFala(e, fala, bolsa(e.mochila));
  assert.deepEqual(e.medalhas, ['mare']);
  assert.equal(segunda.medalha, null, 'a segunda vez não é conquista nenhuma');
});

/* ------------------------------------------------------------- charadas */

const charada: Fala = {
  se: 'charada1_ok', liga: 'charada2_ok', paga: 100, linhas: ['Segunda charada...'],
  pergunta: {
    opcoes: ['o ovo', 'a pedra', 'o vento'], certa: 1,
    acertou: ['Acertou!'],
    errou: { linhas: ['Errou. Volta pro começo.'], desliga: 'charada1_ok' },
  },
};

test('resposta certa devolve a fala sem a pergunta, para o efeito vir depois', () => {
  const e = novoJogo();
  ligar(e, 'charada1_ok');
  const r = responder(e, charada, 1);
  assert.equal(r.certa, true);
  assert.deepEqual(r.linhas, ['Acertou!']);
  assert.ok(r.fala && r.fala.pergunta === undefined);
  assert.equal(r.fala!.liga, 'charada2_ok');
  // responder não aplica nada sozinho: quem aplica é a cena, ao fechar
  assert.equal(ligada(e, 'charada2_ok'), false);
  aplicarFala(e, r.fala!, bolsa(e.mochila));
  assert.equal(ligada(e, 'charada2_ok'), true);
});

test('resposta errada desliga o progresso e não aplica nada', () => {
  const e = novoJogo();
  ligar(e, 'charada1_ok');
  const antes = e.dinheiro;
  const r = responder(e, charada, 0);
  assert.equal(r.certa, false);
  assert.equal(r.fala, null);
  assert.equal(ligada(e, 'charada1_ok'), false, 'errar devia voltar para a primeira charada');
  assert.equal(ligada(e, 'charada2_ok'), false);
  assert.equal(e.dinheiro, antes);
});
