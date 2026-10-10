import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPAS } from '../data/mapas/index.ts';
import { CUTSCENES } from '../data/cutscenes.ts';
import { novoJogo } from './state.ts';
import { preencher } from './quests.ts';

/* todo texto que o jogo pode mostrar: as falas dos mapas (NPC, placa,
   treinador) e as cutscenes, colhidas de qualquer campo de texto */
function textos(x: unknown, saida: string[] = []): string[] {
  if (typeof x === 'string') saida.push(x);
  else if (Array.isArray(x)) for (const v of x) textos(v, saida);
  else if (x && typeof x === 'object') for (const v of Object.values(x)) textos(v, saida);
  return saida;
}
const TODOS = [...textos(MAPAS), ...textos(CUTSCENES)];

/* formas que, dirigidas ao protagonista, erram o gênero do outro */
const ERRADO_PARA_ELE = /\b(você mesma|Ó ela|A vizinha|caçadora de Encantado|voltou inteira|nova campeã|Tá pronta|A CAMPEÃ|Campeã agora|Campeã é campeã|para a campeã)\b/;
const ERRADO_PARA_ELA = /\b(você mesmo|Ó ele|O vizinho|caçador de Encantado|voltou inteiro|novo campeão|Tá pronto pro|O CAMPEÃO DO CÍRCULO|Campeão agora|Campeão é campeão|para o campeão)\b/;

test('{g:feminino|masculino} escolhe pelo protagonista', () => {
  assert.equal(preencher(novoJogo('TAINÁ', 'taina'), 'Tá {g:pronta|pronto}!'), 'Tá pronta!');
  assert.equal(preencher(novoJogo('BENTO', 'bento'), 'Tá {g:pronta|pronto}!'), 'Tá pronto!');
  assert.equal(preencher(novoJogo('BENTO', 'bento'), '{g:A CAMPEÃ|O CAMPEÃO} DO CÍRCULO'), 'O CAMPEÃO DO CÍRCULO');
});

test('nenhuma fala erra o gênero de quem joga, com a Tainá ou com o Bento', () => {
  const ela = novoJogo('TAINÁ', 'taina'), ele = novoJogo('BENTO', 'bento');
  // o Anhangá campeão e as falas sobre outra gente ficam de fora
  const sobreOutros = /Anhangá é o campeão|Antes de ser campeão|e o campeão\.|o campeão se levanta|Meu filho|menino\?!|no menino|desse menino|um menino|era menino|quando eu era|da menina|a menina d|campeão de vinte|TUCO/;
  for (const t of TODOS) {
    // o título da cutscene do Anhangá, que é dele
    if (sobreOutros.test(t) || t === 'O CAMPEÃO DO CÍRCULO') continue;
    const a = preencher(ela, t), o = preencher(ele, t);
    assert.ok(!a.includes('{g:') && !o.includes('{g:'), `marca não preenchida: ${t}`);
    assert.doesNotMatch(o, ERRADO_PARA_ELE, `com o Bento: ${o}`);
    assert.doesNotMatch(a, ERRADO_PARA_ELA, `com a Tainá: ${a}`);
  }
});
