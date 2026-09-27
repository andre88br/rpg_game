/* =========================================================================
   Coerência das cutscenes: nada disso aparece no `tsc`. Um estilo de gente
   que não existe vira um boneco de roupa padrão, uma espécie errada some da
   tela sem aviso e uma legenda comprida demais passa da faixa — tudo
   compila. Estes testes pintam cada tomada de verdade e conferem os nomes.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CUTSCENES, LARG_LEGENDA, LINHAS_LEGENDA, textoDe } from './cutscenes.ts';
import { MAPAS } from './mapas/index.ts';
import { ESTILOS } from '../art/people.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import { MEDALHAS } from '../art/badges.ts';
import { quebrar, desenhavel } from '../art/font.ts';
import type { Fala } from '../game/quests.ts';

test('a abertura existe e tem tomadas', () => {
  assert.ok(CUTSCENES['intro']);
  assert.ok(CUTSCENES['intro']!.length > 0);
});

for (const [id, roteiro] of Object.entries(CUTSCENES)) {
  test(`cutscene "${id}": fundos pintam e cobrem a tela`, () => {
    for (const [i, t] of roteiro.entries()) {
      for (const f of [t.fundo, t.depois?.fundo]) {
        if (!f) continue;
        const b = f();
        assert.ok(b.w >= 240 && b.h === 160, `tomada ${i}: fundo ${b.w}x${b.h}`);
      }
      if (t.camera) {
        const w = t.fundo().w;
        for (const x of [t.camera.de, t.camera.ate]) {
          assert.ok(x >= 0 && x + 240 <= w, `tomada ${i}: câmera em ${x} sai de um fundo de ${w}`);
        }
      }
    }
  });

  test(`cutscene "${id}": todo ator existe`, () => {
    for (const [i, t] of roteiro.entries()) {
      for (const a of t.atores ?? []) {
        const f = a.figura;
        if ('pessoa' in f) assert.ok(ESTILOS[f.pessoa], `tomada ${i}: estilo "${f.pessoa}"`);
        else if ('criatura' in f) assert.ok(ARTE_CRIATURAS[f.criatura], `tomada ${i}: criatura "${f.criatura}"`);
        else if ('medalha' in f) assert.ok(MEDALHAS.some((m) => m.id === f.medalha), `tomada ${i}: medalha "${f.medalha}"`);
      }
    }
  });

  test(`cutscene "${id}": toda legenda cabe na faixa`, () => {
    for (const [i, t] of roteiro.entries()) {
      assert.ok(t.legendas.length > 0 || t.titulo, `tomada ${i}: nem legenda nem letreiro`);
      for (const l of t.legendas) {
        const s = textoDe(l);
        /* o recheio ({nome}, {inicial}...) pode esticar a frase: mede com
           um nome de dez letras, o máximo que a tela de nome deixa digitar */
        const cheio = s.replace(/\{[\w:]+\}/g, 'MMMMMMMMMM');
        const n = quebrar(cheio, LARG_LEGENDA).length;
        assert.ok(n <= LINHAS_LEGENDA, `tomada ${i}: "${s}" dá ${n} linhas`);
        assert.ok(desenhavel(s.replace(/\{[\w:]+\}/g, '')), `tomada ${i}: "${s}" tem letra que a fonte não desenha`);
        if (typeof l !== 'string') assert.ok(desenhavel(l.quem), `tomada ${i}: nome "${l.quem}"`);
      }
    }
  });
}

test('toda cutscene pedida por fala ou treinador existe', () => {
  const pedidas: string[] = [];
  const daFala = (f: Fala) => { if (f.cutscene) pedidas.push(f.cutscene); };
  for (const def of Object.values(MAPAS)) {
    for (const o of def.objetos) for (const f of o.falas ?? []) daFala(f);
    for (const n of def.npcs) {
      for (const f of n.falas) daFala(f);
      if (n.treinador?.cutscene) pedidas.push(n.treinador.cutscene);
      if (n.treinador?.apresentacao) pedidas.push(n.treinador.apresentacao);
      if (n.encontro) pedidas.push(n.encontro);
    }
  }
  for (const id of pedidas) assert.ok(CUTSCENES[id], `cutscene "${id}" não existe`);
});

test('o primeiro Zeca, na Rota da Foz, é apresentado antes da luta', () => {
  const zeca = MAPAS['rotaFoz']!.npcs.find((n) => n.id === 'zeca')!;
  assert.equal(zeca.treinador?.apresentacao, 'zeca');
  const roteiro = CUTSCENES['zeca']!;
  assert.ok(roteiro.some((t) => t.titulo?.includes('ZECA')), 'falta o letreiro do rival');
});

test('o Mestre do Porto conta a história do porto quando recebe a carta', () => {
  const mestre = MAPAS['portoIara']!.npcs.find((n) => n.id === 'pescador')!;
  const carta = mestre.falas.find((f) => f.pede?.item === 'carta')!;
  assert.equal(carta.cutscene, 'mestre');
  assert.equal(carta.liga, 'conta_recado');
  assert.ok((carta.paga ?? 0) > 0);
});

test('o Mestre do Porto recebe as três redes com cutscene', () => {
  const mestre = MAPAS['portoIara']!.npcs.find((n) => n.id === 'pescador')!;
  const redes = mestre.falas.find((f) => f.pede?.item === 'rede')!;
  assert.equal(redes.cutscene, 'mestre_redes');
  assert.equal(redes.pede?.n, 3);
  assert.equal(redes.liga, 'conta_redes');
  assert.ok(CUTSCENES['mestre_redes']);
});
