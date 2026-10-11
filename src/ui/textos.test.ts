/* Todo letreiro fixo das telas (rodapés, títulos, opções) precisa existir
   na fonte do jogo: um glifo que falta some sem aviso — foi assim que um
   "^" de rodapé sumiu da ficha. Lê o código-fonte das telas e confere cada
   texto em maiúsculas entre aspas simples. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { desenhavel } from '../art/font.ts';

const ARQUIVOS = [
  ...readdirSync('src/scenes').filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts')).map((f) => `src/scenes/${f}`),
  ...readdirSync('src/ui').filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts')).map((f) => `src/ui/${f}`),
];

test('todo letreiro em maiúsculas das telas a fonte desenha', () => {
  for (const arq of ARQUIVOS) {
    const src = readFileSync(arq, 'utf8');
    for (const m of src.matchAll(/'([^'\n]{3,})'/g)) {
      const t = m[1]!;
      if (t !== t.toUpperCase() || !/[A-Z]{2}/.test(t) || /\$\{|\\/.test(t)) continue;
      assert.ok(desenhavel(t), `${arq}: "${t}" tem letra que a fonte não desenha`);
    }
  }
});
