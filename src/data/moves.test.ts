/* =========================================================================
   Coerência dos golpes e dos aprendizados: nenhum golpe esquecido, nenhum
   golpe próprio na espécie errada, ninguém sem golpe do próprio tipo no
   começo, e as formas finais ainda aprendendo depois do 55.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GOLPES } from './moves.ts';
import { ESPECIES } from './creatures.ts';
import { Batalha } from '../battle/engine.ts';
import { criar } from '../battle/encantado.ts';

/* os golpes próprios das formas finais, e quem pode aprendê-los */
const PROPRIOS: Record<string, readonly string[]> = {
  fogo_mboitata: ['mboitata'],
  abraco_fundo: ['ipupiara'],
  furia_anhanga: ['anhanga'],
  coice_mula: ['mulaSemCabeca'],
  cidade_ouro: ['eldorado'],
  rodamoinho_saci: ['saci'],
  canto_uirapuru: ['uirapuruRei'],
  boiuna_eletrica: ['boiuna'],
  bocarra: ['juma'],
  uivo_lua: ['lobisomem'],
  acalanto_cuca: ['cucaRainha'],
  eclipse_total: ['eclipse'],
};

const especies = Object.values(ESPECIES);
const quemAprende = (golpe: string) => especies.filter((e) => e.aprende.some((a) => a.golpe === golpe)).map((e) => e.id);

test('todo golpe é aprendido por alguma espécie (o Esforço é o último recurso, de fora)', () => {
  for (const id of Object.keys(GOLPES)) {
    if (id === 'esforco') continue;
    assert.ok(quemAprende(id).length > 0, `ninguém aprende ${id}`);
  }
});

test('golpe próprio só na forma final certa', () => {
  for (const [golpe, donos] of Object.entries(PROPRIOS)) {
    assert.ok(GOLPES[golpe], `golpe próprio inexistente: ${golpe}`);
    assert.deepEqual(quemAprende(golpe).sort(), [...donos].sort(), golpe);
  }
});

test('toda espécie tem golpe de dano do próprio tipo até o nível 10', () => {
  for (const e of especies) {
    const ok = e.aprende.some((a) => {
      const g = GOLPES[a.golpe]!;
      return a.nv <= 10 && g.categoria !== 'estado' && (e.tipos as readonly string[]).includes(g.tipo);
    });
    assert.ok(ok, `${e.id} não tem golpe do próprio tipo até o 10`);
  }
});

test('quem não evolui mais continua aprendendo depois do 55', () => {
  for (const e of especies) {
    if (e.evolui) continue;
    const ultimo = Math.max(...e.aprende.map((a) => a.nv));
    assert.ok(ultimo > 55, `${e.id} para de aprender no ${ultimo}`);
  }
});

test('a lista de aprendizado está em ordem de nível', () => {
  for (const e of especies) {
    const nvs = e.aprende.map((a) => a.nv);
    assert.deepEqual(nvs, [...nvs].sort((a, b) => a - b), e.id);
    assert.equal(new Set(e.aprende.map((a) => a.golpe)).size, e.aprende.length, `${e.id} repete golpe`);
  }
});

test('os números dos golpes ficam dentro do razoável', () => {
  for (const g of Object.values(GOLPES)) {
    assert.ok(g.pot <= 130, `${g.id}: potência ${g.pot}`);
    assert.ok(g.pp >= 1 && g.pp <= 40, `${g.id}: ${g.pp} PP`);
    const m = g.efeito?.multi;
    if (m) assert.ok(m[0] >= 2 && m[0] <= m[1] && m[1] <= 5, `${g.id}: várias pancadas ${m}`);
    if (g.efeito?.protege) assert.ok((g.prioridade ?? 0) >= 3, `${g.id}: proteção precisa sair primeiro`);
    if (g.efeito?.recarga) assert.ok(g.pot >= 100, `${g.id}: recarga só em golpe forte`);
  }
});

/* Alarme de equilíbrio: cada forma final, no nível 60, contra todas as outras,
   com os quatro golpes que teria. Ninguém pode varrer todo mundo — é o que
   acusaria um golpe novo quebrado. O teto é 95% e não menos porque o
   Pesadelo e o Eclipse, evoluções exclusivas do pós-jogo, já venciam 20 de
   23 antes dos golpes novos, pelos atributos-base. */
test('nenhuma forma final ganha de quase todo mundo no nível 60', () => {
  const finais = especies.filter((e) => !e.evolui).map((e) => e.id);
  const vitorias = new Map<string, number>(finais.map((id) => [id, 0]));
  let semente = 1;
  for (const a of finais) {
    for (const b of finais) {
      if (a === b) continue;
      const luta = new Batalha({
        time: [criar(a, 60)], oponentes: [criar(b, 60, { selvagem: true })],
        semente: semente++, mochila: {}, treinador: null,
      });
      for (let t = 0; t < 120 && !luta.resultado; t++) {
        // o lado do jogador escolhe como a IA escolheria: o golpe de melhor nota
        luta.executar({ tipo: 'golpe', indice: luta.melhorGolpeDoAliado() });
      }
      if (luta.resultado === 'vitoria') vitorias.set(a, vitorias.get(a)! + 1);
    }
  }
  const lutas = finais.length - 1;
  for (const [id, v] of vitorias) {
    assert.ok(v / lutas <= 0.95, `${id} venceu ${v} de ${lutas}`);
  }
});
