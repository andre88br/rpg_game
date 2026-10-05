/* O MANUAL e o README contra os dados: as tabelas de traços, cantigas,
   golpes próprios, evoluções e horário/clima têm que dizer o que o jogo
   faz, e os números do README têm que bater com as listas. Quem muda os
   dados e esquece a documentação descobre aqui. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GOLPES, GOLPES_ORDEM } from './moves.ts';
import { ESPECIES, ESPECIES_ORDEM } from './creatures.ts';
import { TRACOS_ORDEM, TRACO_DA_ESPECIE, traco } from './tracos.ts';
import { ITENS, ITENS_ORDEM } from './items.ts';
import { HORARIO, CLIMA_FAVORITO } from '../game/tempo.ts';

const raiz = new URL('../../', import.meta.url);
const MANUAL = readFileSync(new URL('MANUAL.md', raiz), 'utf8');
const README = readFileSync(new URL('README.md', raiz), 'utf8');

/* as linhas de tabela do MANUAL que começam com este texto na 1ª coluna */
function linha(primeira: string): string | undefined {
  return MANUAL.split('\n').find((l) => l.startsWith(`| ${primeira} |`));
}

test('README: os números batem com os dados', () => {
  assert.ok(README.includes(`**${ESPECIES_ORDEM.length} Encantados**`), 'número de Encantados');
  assert.ok(README.includes(`**${GOLPES_ORDEM.length} golpes**`), 'número de golpes');
  assert.ok(README.includes(`**${TRACOS_ORDEM.length} traços**`), 'número de traços');
  assert.ok(README.includes(`${TRACOS_ORDEM.length} ao todo`), 'número de traços no texto');
  const cantigas = ITENS_ORDEM.filter((i) => ITENS[i]!.efeito.k === 'cantiga');
  assert.ok(README.includes(`**${cantigas.length}\ncantigas**`) || README.includes(`**${cantigas.length} cantigas**`), 'número de cantigas');
});

test('MANUAL: todo traço tem linha, com todas as espécies dele', () => {
  assert.ok(MANUAL.includes(`São ${TRACOS_ORDEM.length}.`), 'número de traços');
  for (const id of TRACOS_ORDEM) {
    const t = traco(id);
    const l = linha(t.nome);
    assert.ok(l, `traço ${t.nome} sem linha no MANUAL`);
    for (const [esp, tr] of Object.entries(TRACO_DA_ESPECIE)) {
      if (tr === id) assert.ok(l!.includes(ESPECIES[esp]!.nome), `${ESPECIES[esp]!.nome} faltando na linha de ${t.nome}`);
    }
  }
});

test('MANUAL: toda cantiga tem linha, com o golpe e o preço', () => {
  const cantigas = ITENS_ORDEM.filter((i) => ITENS[i]!.efeito.k === 'cantiga');
  assert.ok(MANUAL.includes(`São ${cantigas.length}.`), 'número de cantigas');
  for (const id of cantigas) {
    const it = ITENS[id]!;
    const l = linha(it.nome);
    assert.ok(l, `${it.nome} sem linha no MANUAL`);
    const ef = it.efeito as { golpe: string };
    assert.ok(l!.includes(GOLPES[ef.golpe]!.nome), `${it.nome}: golpe errado`);
    if (it.preco > 0) assert.ok(l!.includes(`(${it.preco})`), `${it.nome}: preço errado`);
  }
});

test('MANUAL: todo golpe próprio está na tabela, com quem aprende e o nível', () => {
  const quem: Record<string, { esp: string; nv: number }[]> = {};
  for (const id of ESPECIES_ORDEM) for (const a of ESPECIES[id]!.aprende) (quem[a.golpe] ??= []).push({ esp: id, nv: a.nv });
  // os mesmos doze de PROPRIOS em moves.test.ts
  const proprios = ['fogo_mboitata', 'abraco_fundo', 'furia_anhanga', 'coice_mula', 'cidade_ouro', 'rodamoinho_saci',
    'canto_uirapuru', 'boiuna_eletrica', 'bocarra', 'uivo_lua', 'acalanto_cuca', 'eclipse_total'];
  for (const g of proprios) {
    const l = quem[g]!;
    const ln = linha(GOLPES[g]!.nome);
    assert.ok(ln, `golpe próprio ${GOLPES[g]!.nome} sem linha no MANUAL`);
    assert.ok(ln!.includes(ESPECIES[l[0]!.esp]!.nome) && ln!.includes(`| ${l[0]!.nv} |`), `${GOLPES[g]!.nome}: quem ou nível errado`);
  }
});

test('MANUAL: toda evolução está na tabela, com o nível certo', () => {
  for (const id of ESPECIES_ORDEM) {
    const e = ESPECIES[id]!;
    if (!e.evolui) continue;
    const alvo = ESPECIES[e.evolui.em]!.nome;
    const achou = MANUAL.split('\n').some((l) => l.startsWith('| ') && l.includes(e.nome) && new RegExp(`${alvo}\\**\\s*\\(${e.evolui!.nv}\\)`).test(l));
    assert.ok(achou, `${e.nome} → ${alvo} (${e.evolui.nv}) não está na tabela de evoluções`);
  }
});

test('MANUAL: as tabelas de horário e de clima favorito', () => {
  const dia = linha('do dia')!, noite = linha('da noite')!;
  for (const [esp, h] of Object.entries(HORARIO)) {
    assert.ok((h === 'dia' ? dia : noite).includes(ESPECIES[esp]!.nome), `${ESPECIES[esp]!.nome} (${h})`);
  }
  for (const [esp, c] of Object.entries(CLIMA_FAVORITO)) {
    const l = linha(`gosta de ${c}`);
    assert.ok(l?.includes(ESPECIES[esp]!.nome), `${ESPECIES[esp]!.nome} gosta de ${c}`);
  }
});
