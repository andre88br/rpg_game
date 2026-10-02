import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PREFIXO_CODIGO, codigoDoSave, jsonDoSave, nomeDoArquivo, saveDoTexto } from './transferencia.ts';
import { guardar, novoJogo } from './state.ts';
import { criar } from '../battle/encantado.ts';

function partida() {
  const e = novoJogo('TAINÁ', 'taina');
  guardar(e, criar('iarinha', 12));
  e.medalhas.push('mare');
  e.flags['conta_recado'] = true;
  e.dinheiro = 4321;
  return e;
}

test('o código vai e volta, com acento no nome', () => {
  const e = partida();
  const codigo = codigoDoSave(e);
  assert.ok(codigo.startsWith(PREFIXO_CODIGO));
  assert.match(codigo.slice(PREFIXO_CODIGO.length), /^[A-Za-z0-9+/=]+$/);
  const volta = saveDoTexto(codigo);
  assert.ok(volta);
  assert.equal(volta.nome, 'TAINÁ');
  assert.equal(volta.dinheiro, 4321);
  assert.deepEqual(volta.medalhas, ['mare']);
  assert.equal(volta.flags['conta_recado'], true);
  assert.equal(volta.time[0]?.especie, 'iarinha');
  assert.equal(volta.time[0]?.nivel, 12);
});

test('o JSON do arquivo baixado também é aceito', () => {
  const volta = saveDoTexto(jsonDoSave(partida()));
  assert.equal(volta?.nome, 'TAINÁ');
});

test('espaço e quebra de linha do colar não atrapalham', () => {
  const codigo = codigoDoSave(partida());
  const bagunca = `  ${codigo.slice(0, 30)}\n${codigo.slice(30, 90)} \r\n${codigo.slice(90)}\n`;
  assert.equal(saveDoTexto(bagunca)?.nome, 'TAINÁ');
});

test('lixo não vira partida', () => {
  assert.equal(saveDoTexto(''), null);
  assert.equal(saveDoTexto('oi'), null);
  assert.equal(saveDoTexto(PREFIXO_CODIGO + '%%%'), null);
  assert.equal(saveDoTexto(PREFIXO_CODIGO + btoa('não é json')), null);
  assert.equal(saveDoTexto(PREFIXO_CODIGO + btoa('{"v":999,"jogo":{}}')), null);
  assert.equal(saveDoTexto('{"quebrado"'), null);
  assert.equal(saveDoTexto('{"v":1}'), null);
});

test('o nome do arquivo não leva acento nem espaço', () => {
  const e = novoJogo('JOÃO DA SILVA', 'bento');
  assert.equal(nomeDoArquivo(e, new Date(2026, 9, 2)), 'encantados-joao-da-silva-2026-10-02.json');
  e.nome = '!!!';
  assert.equal(nomeDoArquivo(e, new Date(2026, 0, 5)), 'encantados-save-2026-01-05.json');
});
