/* =========================================================================
   Coerência dos mapas — Serra Boitatá.

   As ferramentas comuns (andar pelo mapa, deslizar, o mundo aberto e o
   fechado) ficam em mapas.apoio.ts.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa } from './tilemap.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { ESPECIES } from '../data/creatures.ts';
import { SERVICOS_OPCIONAIS } from '../game/quests.ts';
import { temSolucao } from './pedras.ts';
import { FECHADO, entradas, mapa, alcance } from './mapas.apoio.ts';

/* ----------------------------------------- Caverna do Boitatá: as pedras */

test('o campo de escória da Caverna do Boitatá tem solução', () => {
  const def = MAPAS['cavernaBoitata']!;
  // FECHADO, não a `m` compartilhada (ABERTO): sob ABERTO toda cova já
  // conta como tapada (o `entulho` fica ativo no lugar dela), e a busca
  // não estaria testando um sólido de verdade nenhum
  const m = new Mapa(def, FECHADO);
  const pedras = (def.pedras ?? []).map((p) => ({ tx: p.tx, ty: p.ty }));
  const covas = def.objetos
    .filter((o) => o.tipo === 'cova')
    .map((o) => ({ tx: o.tx, ty: o.ty, flag: o.seNao as string }));
  assert.equal(covas.length, 3, 'a câmara devia ter as três covas');
  // a partir da boca da própria câmara, não da entrada do mapa inteiro, e
  // com o vaguear do jogador preso à própria câmara: o resto da caverna é
  // uma sala grande e aberta que só infla o espaço de estados sem ter nada
  // a ver com o quebra-cabeça das pedras. O objetivo é só chegar perto do
  // portão (16,24) — se ele de fato ABRE com as três tapadas é o próximo
  // teste, que reconstrói o mapa com as flags ligadas (a trava, sendo uma
  // `barreira`, não muda de sólida sozinha só porque a busca preencheu a
  // cova; ela só passa a valer no mapa assado de novo, fora do BFS puro) */
  assert.ok(temSolucao(m, { tx: 16, ty: 18 }, pedras, covas, { tx: 16, ty: 24 },
                        { x0: 1, y0: 17, x1: 30, y1: 25 }),
            'as três pedras deviam poder chegar às três covas, com saída livre depois');
});

test('as três covas da Caverna do Boitatá abrem a passagem para a Cumeeira', () => {
  const def = MAPAS['cavernaBoitata']!;
  const fechado = new Mapa(def, { contas: () => 0, nadar: false, ligada: () => false });
  const aberto = new Mapa(def, {
    contas: () => 0, nadar: false,
    ligada: (c) => c === 'cova_breu_a' || c === 'cova_breu_b' || c === 'cova_breu_c',
  });
  assert.ok(!alcance(fechado, def.inicio.tx, def.inicio.ty).has('16,37'),
            'sem as três covas tapadas a Cumeeira devia continuar trancada');
  assert.ok(alcance(aberto, def.inicio.tx, def.inicio.ty).has('16,37'),
            'com as três covas tapadas a passagem devia abrir');
});

/* -------------------------------------------- o Terreiro de Brasa em 4 salas */

test('o caminho até o Brás passa por quatro salas e três guardas', () => {
  const salas = ['terreiroBrasaPatio', 'terreiroBrasaEscoria',
                 'terreiroBrasaBreu', 'terreiroBrasaSalao'];
  const guardas = ['venceu_zelador_brasa', 'venceu_sopradora', 'venceu_guarda_breu'];

  for (const id of salas) assert.ok(MAPAS[id], `falta a sala ${id}`);

  // cada emenda entre uma sala e a seguinte tem uma tranca própria, e é ela
  // que faz o caminho ser longo de verdade em vez de quatro portas seguidas
  for (let i = 0; i < 3; i++) {
    const def = MAPAS[salas[i]!]!;
    const paraProxima = (def.saidas ?? []).find((s) => s.para === salas[i + 1]);
    assert.ok(paraProxima, `${salas[i]}: não leva a ${salas[i + 1]}`);
    const tranca = def.objetos.find(
      (o) => o.tipo === 'barreira' && o.seNao === guardas[i]
             && o.tx === paraProxima!.tx && o.ty === paraProxima!.ty);
    assert.ok(tranca, `${salas[i]}: a saída para ${salas[i + 1]} não é trancada por ${guardas[i]}`);
  }

  // e a porta do terreiro, na vila, entra pela PRIMEIRA sala — não pela última
  const vila = MAPAS['vilaFornalha']!;
  assert.ok((vila.saidas ?? []).some((s) => s.para === 'terreiroBrasaPatio'),
            'a porta do terreiro na vila devia levar ao pátio');
});

test('cada tranca do Terreiro de Brasa fecha e abre de verdade', () => {
  /* a sala, a flag que destranca, e para ONDE a porta trancada leva — a
     porta de volta, que fica aberta sempre, não entra nesta conta */
  const salas: [string, string, string][] = [
    ['terreiroBrasaPatio', 'venceu_zelador_brasa', 'terreiroBrasaEscoria'],
    ['terreiroBrasaEscoria', 'venceu_sopradora', 'terreiroBrasaBreu'],
    ['terreiroBrasaBreu', 'venceu_guarda_breu', 'terreiroBrasaSalao'],
  ];
  for (const [id, flag, proxima] of salas) {
    const def = MAPAS[id]!;
    const fechado = new Mapa(def, FECHADO);
    const aberto = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    const saida = (def.saidas ?? []).find((s) => s.para === proxima)!;
    assert.ok(fechado.solido(saida.tx, saida.ty),
              `${id}: a saída devia estar trancada antes de vencer o guarda`);
    assert.ok(!aberto.solido(saida.tx, saida.ty),
              `${id}: a saída devia abrir depois de vencer o guarda`);
  }
});

test('cada tranca do Campo Aberto fecha e abre de verdade, uma de cada vez', () => {
  /* pegou um bug de verdade: a terceira tranca estava condicionada a
     `venceu_chefe_catadores`, e o chefe mora do OUTRO lado dela — um laço
     sem saída que o usuário bateu de frente. Este teste confere elo por
     elo, não só que "a saída final abre com tudo vencido" (isso o teste
     geral sob ABERTO já mascarava, porque ali toda condição vale). */
  const def = MAPAS['campoAberto']!;
  const elos: [string, number, number][] = [
    ['venceu_catador1', 8, 9],
    ['venceu_catador2', 22, 17],
    ['venceu_catador3', 8, 25],
    ['venceu_chefe_catadores', 14, 33],
  ];
  const fechado = new Mapa(def, FECHADO);
  for (const [, tx, ty] of elos) {
    assert.ok(fechado.solido(tx, ty), `campoAberto: a tranca em (${tx},${ty}) devia começar fechada`);
  }
  for (const [flag, tx, ty] of elos) {
    const aberto = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    assert.ok(!aberto.solido(tx, ty),
              `campoAberto: a tranca em (${tx},${ty}) devia abrir com "${flag}" ligada`);
    // e nenhuma OUTRA continua trancada por engano com essa flag sozinha
    for (const [, ox, oy] of elos) {
      if (ox === tx && oy === ty) continue;
      assert.ok(aberto.solido(ox, oy),
                `campoAberto: "${flag}" sozinha não devia abrir a tranca em (${ox},${oy})`);
    }
  }
});

test('cada tranca da Trilha da Brasa fecha e abre de verdade, uma de cada vez', () => {
  const def = MAPAS['trilhaDaBrasa']!;
  const elos: [string, number, number][] = [
    ['venceu_tropeiro1', 6, 10],
    ['venceu_tropeiro2', 22, 17],
    ['venceu_tropeiro3', 6, 24],
    ['venceu_chefe_tropa', 4, 31],
  ];
  const fechado = new Mapa(def, FECHADO);
  for (const [, tx, ty] of elos) {
    assert.ok(fechado.solido(tx, ty), `trilhaDaBrasa: a tranca em (${tx},${ty}) devia começar fechada`);
  }
  for (const [flag, tx, ty] of elos) {
    const aberto = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    assert.ok(!aberto.solido(tx, ty),
              `trilhaDaBrasa: a tranca em (${tx},${ty}) devia abrir com "${flag}" ligada`);
    for (const [, ox, oy] of elos) {
      if (ox === tx && oy === ty) continue;
      assert.ok(aberto.solido(ox, oy),
                `trilhaDaBrasa: "${flag}" sozinha não devia abrir a tranca em (${ox},${oy})`);
    }
  }
});

test('os campos de pedra do Terreiro de Brasa têm solução a partir da porta', () => {
  /* Este teste já existiu errado, e deixou passar duas salas impossíveis:
     partia de (8,1) — a faixa NORTE, do outro lado do quebra-cabeça — e
     pedia para chegar em (5,7), ao sul. Ou seja, resolvia a sala de trás
     para a frente, de um tile onde o jogador só consegue pisar DEPOIS de
     resolvê-la. Com a pedra acima da cova, quem subia do salão batia na
     cova (que é sólida) antes de alcançar a pedra, e a partida travava sem
     saída.

     Por isso agora o começo é `def.inicio` — a porta por onde o jogador
     entra de verdade — e o objetivo é (8,1), a faixa norte onde ficam o
     guarda e a porta seguinte. É o percurso real, no sentido real. */
  for (const id of ['terreiroBrasaEscoria', 'terreiroBrasaBreu']) {
    const def = MAPAS[id]!;
    const m = new Mapa(def, FECHADO);
    const pedras = (def.pedras ?? []).map((p) => ({ tx: p.tx, ty: p.ty }));
    const covas = def.objetos
      .filter((o) => o.tipo === 'cova')
      .map((o) => ({ tx: o.tx, ty: o.ty, flag: o.seNao as string }));
    assert.equal(pedras.length, 2, `${id}: devia ter duas pedras`);
    assert.equal(covas.length, 2, `${id}: devia ter duas covas`);

    /* subindo cada corredor a partir do salão, a PEDRA tem que vir antes da
       cova — senão a cova (sólida) barra o caminho e a pedra fica do lado
       de lá, inalcançável. É a checagem que falta ao BFS dizer em voz alta */
    for (const p of def.pedras ?? []) {
      const cova = covas.find((c) => c.flag === p.cova)!;
      assert.equal(cova.tx, p.tx, `${id}: pedra e cova de ${p.cova} em corredores diferentes`);
      assert.ok(cova.ty < p.ty,
                `${id}: a cova de ${p.cova} está ABAIXO da pedra — quem sobe do salão ` +
                `bate nela antes de alcançar a pedra e trava a sala`);
    }

    // o percurso de verdade: da porta de entrada até a faixa norte
    assert.ok(temSolucao(m, { tx: def.inicio.tx, ty: def.inicio.ty }, pedras, covas,
                         { tx: 8, ty: 1 }),
              `${id}: não dá para chegar ao guarda entrando pela porta`);
  }
});

test('nas salas de pedra, os DOIS corredores chegam à porta', () => {
  /* Cada sala tem dois corredores de largura 1, e resolver UM já devia
     bastar. Mas NPC é sólido: a Sopradora, parada na antessala de uma linha
     só, virava parede para quem subia por um dos lados — quem resolvesse o
     corredor "errado" chegava lá em cima e não passava. O BFS do mapa todo
     não pega isso, porque no cenário "tudo aberto" ele sempre acha o outro
     corredor. Então aqui se testa cada boca de corredor por vez. */
  const VIZ = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
  for (const id of ['terreiroBrasaEscoria', 'terreiroBrasaBreu']) {
    const def = MAPAS[id]!;
    const m = mapa(id);
    const porta = (def.saidas ?? []).find((x) => x.ty === 0)!;
    const fixos = new Set(def.npcs.filter((n) => n.se === undefined && n.seNao === undefined)
                                  .map((n) => `${n.tx},${n.ty}`));
    const livre = (x: number, y: number) => !m.solido(x, y) && !fixos.has(`${x},${y}`);

    for (const p of def.pedras ?? []) {
      /* de onde a pedra encaixada deixa o jogador sair: logo acima da cova
         daquele corredor, já na faixa de cima */
      const cova = def.objetos.find((o) => o.tipo === 'cova' && o.seNao === p.cova)!;
      const saidaDoCorredor = { tx: cova.tx, ty: cova.ty - 1 };
      assert.ok(livre(saidaDoCorredor.tx, saidaDoCorredor.ty),
                `${id}: acima da cova de ${p.cova} não é chão livre`);

      const vistos = new Set([`${saidaDoCorredor.tx},${saidaDoCorredor.ty}`]);
      const fila = [[saidaDoCorredor.tx, saidaDoCorredor.ty]];
      while (fila.length) {
        const [x, y] = fila.shift() as [number, number];
        for (const [dx, dy] of VIZ) {
          const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
          if (vistos.has(k) || !livre(nx, ny)) continue;
          vistos.add(k); fila.push([nx, ny]);
        }
      }
      assert.ok(vistos.has(`${porta.tx},${porta.ty}`),
                `${id}: quem resolve o corredor de ${p.cova} sobe e não alcança a porta ` +
                `(${porta.tx},${porta.ty}) — tem NPC fixo no caminho`);
    }
  }
});

test('a Medalha Brasa tem quem a entregue, com o Dom junto', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  const premio = falas.find((f) => f.medalha === 'brasa');
  assert.ok(premio, 'ninguém entrega a Medalha Brasa');
  assert.equal(premio!.dom, 'tocha', 'a Brasa tem que vir com o Dom de Tocha');
});

test('o trunfo do Brás cobre os três iniciais, e nenhum some em save antigo', () => {
  const bras = MAPAS['terreiroBrasaSalao']!.npcs.find((n) => n.id === 'bras')!;
  const trunfo = bras.treinador?.trunfo;
  assert.ok(trunfo, 'o Brás devia ter trunfo');
  for (const inicial of ['boitatinha', 'iarinha', 'curupinho']) {
    assert.ok(trunfo![inicial], `falta trunfo contra ${inicial}`);
    assert.ok(ESPECIES[trunfo![inicial]!.especie],
              `trunfo contra ${inicial} usa espécie desconhecida`);
  }
  // sem nenhuma flag `inicial_*` (save de antes dela existir) o jogo cai no
  // primeiro par do objeto — por isso ele nunca pode estar vazio
  assert.ok(Object.values(trunfo!).length > 0);
});

/* --------------------------------------- os dois serviços opcionais da Serra */

test('os dois serviços opcionais têm quem os acenda', () => {
  /* o teste das contas só olha TERREIROS; estes dois ficam de fora dela de
     propósito (não travam guia nenhuma), então precisam da própria rede */
  const acesas = new Set<string>();
  for (const [, def] of entradas) {
    for (const o of def.objetos) {
      for (const f of o.falas ?? []) {
        for (const l of [f.liga].flat()) if (typeof l === 'string') acesas.add(l);
      }
    }
    for (const n of def.npcs) {
      for (const f of n.falas) {
        for (const l of [f.liga].flat()) if (typeof l === 'string') acesas.add(l);
      }
    }
  }
  for (const s of SERVICOS_OPCIONAIS) {
    assert.ok(acesas.has(s.flag), `ninguém acende o serviço "${s.servico}" (${s.flag})`);
  }
});

test('os três sinos existem, espalhados por três mapas diferentes', () => {
  const mapasComSino = entradas
    .filter(([, def]) => def.objetos.some(
      (o) => o.tipo === 'achado' && o.falas?.some((f) => f.da?.item === 'sino')))
    .map(([id]) => id);
  assert.equal(mapasComSino.length, 3,
               `os sinos deviam estar em três mapas, estão em ${mapasComSino.join(', ')}`);
});

test('o ramo fundo da caverna só cede para quem tem o Dom Tocha', () => {
  const def = MAPAS['cavernaBoitata']!;
  const semTocha = new Mapa(def, FECHADO);
  const comTocha = new Mapa(def, {
    contas: () => 0, nadar: false, ligada: (c) => c === 'dom_tocha',
  });
  const mae = def.npcs.find((n) => n.id === 'mae_do_ouro')!;
  const deFrente = `${mae.tx + 1},${mae.ty}`;   // de onde se fala com ela

  assert.ok(!alcance(semTocha, def.inicio.tx, def.inicio.ty).has(deFrente),
            'sem o Dom Tocha o bolso da Mãe-do-Ouro devia continuar fechado');
  assert.ok(alcance(comTocha, def.inicio.tx, def.inicio.ty).has(deFrente),
            'com o Dom Tocha o bolso devia abrir');
});

test('a Mãe-do-Ouro só se entrega depois dos sinos E da medalha', () => {
  const mae = MAPAS['cavernaBoitata']!.npcs.find((n) => n.id === 'mae_do_ouro')!;
  const entrega = mae.falas.find((f) => f.encantado);
  assert.ok(entrega, 'a Mãe-do-Ouro devia entregar um Encantado');
  assert.equal(entrega!.encantado!.especie, 'maeDoOuro');
  const exige = [entrega!.se].flat();
  assert.ok(exige.includes('servico_sinos'), 'devia exigir os três sinos');
  assert.ok(exige.includes('medalha:brasa'), 'devia exigir a Medalha Brasa');
});
