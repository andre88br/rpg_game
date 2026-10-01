/* =========================================================================
   Coerência dos mapas — Campo do Saci: correntes de vento.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa } from './tilemap.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { FECHADO, entradas, mapa, alcance, passo, alcanceDeslizando } from './mapas.apoio.ts';

/* ------------------------------------------- o Campo do Saci: correntes

   As duas piscinas de vento (a Ventania Funda, obrigatória no caminho, e o
   Terreiro do Rodamoinho, o salão do Pererê) foram achadas por busca larga
   do mesmo jeito que os dois salões acima: solução garantida, ninguém fica
   preso, e segurar uma direção só nunca resolve. Aqui a busca larga entra
   de novo, generalizada (não hard-coded a um dos dois lugares), exatamente
   o ponto do risco #1 da Serra: todo BFS de quebra-cabeça tem que partir da
   entrada de verdade — nunca de um ponto do meio. */

/* segurar uma direção só, do início até onde ela empacar — a mesma checagem
   já usada no campo de raízes do Curupira, agora reaproveitável para
   qualquer sala com correntes/escorregões */
function segurarUmaDirecao(
  m: Mapa, ix: number, iy: number, dx: number, dy: number, passos = 60,
): [number, number] {
  let x = ix, y = iy;
  for (let i = 0; i < passos; i++) {
    let nx = x + dx, ny = y + dy;
    if (m.solido(nx, ny)) break;
    while (m.escorrega(nx, ny)) {
      const ax = nx + dx, ay = ny + dy;
      if (m.solido(ax, ay)) break;
      nx = ax; ny = ay;
    }
    if (nx === x && ny === y) break;
    x = nx; y = ny;
  }
  return [x, y];
}

test('a Ventania Funda tem solução, partindo da entrada de verdade', () => {
  const def = MAPAS['ventaniaFunda']!;
  const m = mapa('ventaniaFunda');
  const saidaSul = (def.saidas ?? []).find((s) => s.para === 'aldeiaCatavento')!;

  const desliz = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);
  assert.ok(desliz.has(`${saidaSul.tx},${saidaSul.ty}`),
            'a ventania devia ter caminho escorregando até a saída sul');
});

test('e ninguém fica preso dentro da Ventania Funda', () => {
  const def = MAPAS['ventaniaFunda']!;
  const m = mapa('ventaniaFunda');
  const entrada = `${def.inicio.tx},${def.inicio.ty}`;
  for (const lugar of alcanceDeslizando(m, def.inicio.tx, def.inicio.ty)) {
    const [x, y] = lugar.split(',').map(Number) as [number, number];
    assert.ok(alcanceDeslizando(m, x, y).has(entrada),
              `quem chega em (${lugar}) na ventania não consegue mais voltar até a entrada`);
  }
});

test('a Ventania Funda não se resolve segurando uma direção só', () => {
  const def = MAPAS['ventaniaFunda']!;
  const m = mapa('ventaniaFunda');
  const saidaSul = (def.saidas ?? []).find((s) => s.para === 'aldeiaCatavento')!;
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
    const [x, y] = segurarUmaDirecao(m, def.inicio.tx, def.inicio.ty, dx, dy);
    assert.ok(!(x === saidaSul.tx && y === saidaSul.ty) && !(x === saidaSul.tx + 1 && y === saidaSul.ty),
              `segurando só uma direção (${dx},${dy}) não devia atravessar a ventania inteira`);
  }
});

test('conta_ventania é alcançável sem nenhum Dom — o trecho é obrigatório, não opcional', () => {
  /* risco #4 do plano: o Dom Rajada só pode abrir bônus, nunca o caminho
     principal. A travessia acende sozinha (a placa do fim), sem depender
     de flag nenhuma de Dom. */
  const def = MAPAS['ventaniaFunda']!;
  const semDomNenhum = new Mapa(def, FECHADO);
  const saidaSul = (def.saidas ?? []).find((s) => s.para === 'aldeiaCatavento')!;
  const desliz = alcanceDeslizando(semDomNenhum, def.inicio.tx, def.inicio.ty);
  assert.ok(desliz.has(`${saidaSul.tx},${saidaSul.ty}`),
            'sem Dom nenhum, a ventania ainda tem que ter solução');
});

test('o Terreiro do Rodamoinho tem solução, partindo da porta de verdade', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const perere = def.npcs.find((n) => n.id === 'perere')!;
  const daPorta = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);

  const vizinhos = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dx, dy]) => `${perere.tx + dx!},${perere.ty + dy!}`);
  assert.ok(vizinhos.some((v) => daPorta.has(v)),
            'o salão do Pererê não tem caminho até ele, partindo da entrada de verdade');
});

/* Diferente dos outros salões de corrente, o Rodamoinho é de mão única de
   propósito: quem erra uma forquilha não anda de volta até a porta (a
   corrente não deixa) — pisa numa saída disfarçada de chão, que devolve
   pro início do salão. As seis saídas abaixo são exatamente as seis
   forquilhas erradas das três correntes; se uma pedra se mover e abrir um
   jeito de voltar andando por engano, os testes abaixo pegam isso. */
test('as seis saídas disfarçadas do Rodamoinho devolvem pro início, e ficam na corrente', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const disfarcadas = (def.saidas ?? []).filter((s) => s.para === 'terreiroRodamoinho');
  assert.equal(disfarcadas.length, 6,
    'esperava seis saídas disfarçadas — uma por forquilha errada, em três correntes');
  for (const s of disfarcadas) {
    assert.equal(s.destino.tx, def.inicio.tx, `saída (${s.tx},${s.ty}): destino.tx devia ser o início`);
    assert.equal(s.destino.ty, def.inicio.ty, `saída (${s.tx},${s.ty}): destino.ty devia ser o início`);
    assert.ok(m.escorrega(s.tx, s.ty),
      `a saída disfarçada em (${s.tx},${s.ty}) devia ficar numa corrente de vento`);
  }
});

test('em cada uma das seis forquilhas, o lado errado pisa numa saída disfarçada', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const disfarcadas = new Set(
    (def.saidas ?? []).filter((s) => s.para === 'terreiroRodamoinho').map((s) => `${s.tx},${s.ty}`));

  // cada forquilha: onde ela trava (parada pela pedra central) e qual lado
  // é o CERTO — o outro lado tem que cair exatamente numa saída disfarçada
  const forquilhas: [number, number, 'esquerda' | 'direita'][] = [
    [7, 35, 'esquerda'],  // 1ª corrente (a mais perto da porta)
    [7, 28, 'direita'],   // 2ª corrente, forquilha de baixo
    [7, 24, 'esquerda'],  // 2ª corrente, forquilha de cima
    [7, 17, 'esquerda'],  // 3ª corrente, forquilha de baixo
    [7, 13, 'direita'],   // 3ª corrente, forquilha do meio
    [7, 9,  'esquerda'],  // 3ª corrente, forquilha de cima (a mais perto do Pererê)
  ];

  for (const [tx, ty, certo] of forquilhas) {
    const [dx] = certo === 'esquerda' ? [-1] : [1];
    const [px, py] = passo(m, tx, ty, dx, 0);
    assert.ok(!(px === tx && py === ty),
      `forquilha (${tx},${ty}): o lado certo (${certo}) devia mover o jogador`);

    const errado = -dx;
    const [ex, ey] = passo(m, tx, ty, errado, 0);
    assert.ok(disfarcadas.has(`${ex},${ey}`),
      `forquilha (${tx},${ty}): o lado errado parou em (${ex},${ey}), que não é saída disfarçada`);
  }
});

test('cada guarda do Rodamoinho tranca e destranca a corrente seguinte', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const guardas: [string, number, number][] = [
    ['venceu_guarda_correnteza', 7, 30],
    ['venceu_guarda_remoinho',   7, 19],
    ['venceu_guarda_tormenta',   7, 4],
  ];
  for (const [flag, tx, ty] of guardas) {
    const fechado = new Mapa(def, FECHADO);
    const aberto = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    assert.ok(fechado.solido(tx, ty),
      `a barreira em (${tx},${ty}) devia estar trancada antes de ${flag}`);
    assert.ok(!aberto.solido(tx, ty),
      `a barreira em (${tx},${ty}) devia abrir depois de ${flag}`);
  }
});

test('o Terreiro do Rodamoinho é mesmo um quebra-cabeça, não um corredor', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const ventos = def.chao.join('').split('').filter((c) => c === 'V').length;
  assert.ok(ventos > 40, `o salão tem só ${ventos} tiles de corrente`);

  const perere = def.npcs.find((n) => n.id === 'perere')!;
  const escorregando = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);
  const aPe = alcance(m, def.inicio.tx, def.inicio.ty);
  const vizinhos = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dx, dy]) => `${perere.tx + dx!},${perere.ty + dy!}`);
  assert.ok(vizinhos.some((v) => aPe.has(v)),
            'sem escorregar o salão devia ser um corredor reto');
  assert.ok(escorregando.size < aPe.size,
            'a corrente devia tirar lugares de alcance, não deixar tudo igual');
});

test('o Terreiro do Rodamoinho não se resolve segurando uma direção só', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const perere = def.npcs.find((n) => n.id === 'perere')!;
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
    const [x, y] = segurarUmaDirecao(m, def.inicio.tx, def.inicio.ty, dx, dy);
    const chegou = [[0, 1], [0, -1], [1, 0], [-1, 0]]
      .some(([ax, ay]) => x === perere.tx + ax! && y === perere.ty + ay!);
    assert.ok(!chegou, `segurando só uma direção (${dx},${dy}) não devia chegar do lado do Pererê`);
  }
});

test('o monte de folhas do Topo do Redemoinho só some com o Dom Rajada', () => {
  const def = MAPAS['topoDoRedemoinho']!;
  const semRajada = new Mapa(def, FECHADO);
  const comRajada = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === 'dom_rajada' });
  const esconderijo = def.objetos.find(
    (o) => o.tipo === 'achado' && o.placa === 'ESCONDERIJO' && o.se === undefined)!;
  const alvo = `${esconderijo.tx},${esconderijo.ty}`;

  assert.ok(!alcance(semRajada, def.inicio.tx, def.inicio.ty).has(alvo),
            'sem o Dom Rajada o esconderijo devia continuar fechado');
  assert.ok(alcance(comRajada, def.inicio.tx, def.inicio.ty).has(alvo),
            'com o Dom Rajada o esconderijo devia abrir');
});

test('os três capins dourados existem, espalhados por três mapas diferentes', () => {
  const mapasComCapim = entradas
    .filter(([, def]) => def.objetos.some(
      (o) => o.tipo === 'achado' && o.falas?.some((f) => f.da?.item === 'capim_dourado')))
    .map(([id]) => id);
  assert.equal(mapasComCapim.length, 3,
    `esperava capim dourado em 3 mapas, achou em: ${mapasComCapim.join(', ')}`);
});
