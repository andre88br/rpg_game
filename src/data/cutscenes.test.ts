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
import { MUSICAS, type IdMusica } from '../audio/musicas.ts';
import { temaDaBatalha, temaDoMapa } from '../audio/temas.ts';

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
        const cru = textoDe(l);
        // {g:ela|ele}: confere as duas formas, a da Tainá e a do Bento
        for (const lado of [1, 2]) {
          const s = cru.replace(/\{g:([^{}|]*)\|([^{}]*)\}/g, (_, f: string, m: string) => (lado === 1 ? f : m));
          /* o recheio ({nome}, {inicial}...) pode esticar a frase: mede com
             um nome de dez letras, o máximo que a tela de nome deixa digitar */
          const cheio = s.replace(/\{[\w:]+\}/g, 'MMMMMMMMMM');
          const n = quebrar(cheio, LARG_LEGENDA).length;
          assert.ok(n <= LINHAS_LEGENDA, `tomada ${i}: "${s}" dá ${n} linhas`);
          assert.ok(desenhavel(s.replace(/\{[\w:]+\}/g, '')), `tomada ${i}: "${s}" tem letra que a fonte não desenha`);
        }
        if (typeof l !== 'string') assert.ok(desenhavel(l.quem), `tomada ${i}: nome "${l.quem}"`);
      }
    }
  });
}

test('toda cutscene pedida por fala ou treinador existe', () => {
  const pedidas: string[] = [];
  const daFala = (f: Fala) => { if (f.cutscene) pedidas.push(f.cutscene); };
  for (const def of Object.values(MAPAS)) {
    if (def.aoChegar) daFala(def.aoChegar);
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

test('o Boitatá do farol só aparece depois das redes, de emboscada', () => {
  const boitata = MAPAS['portoIara']!.npcs.find((n) => n.id === 'boitata')!;
  assert.equal(boitata.se, 'conta_redes');
  assert.equal(boitata.encontro, 'boitata');
  assert.ok(boitata.emboscada);
  assert.equal(boitata.treinador?.liga, 'conta_farol');
  assert.ok(CUTSCENES['boitata']!.some((t) => t.atores?.some((a) => a.frente)),
            'o farol tem que passar na frente do bicho');
});

test('o Contador de Bichos se apresenta quando dá o caderno', () => {
  const contador = MAPAS['portoIara']!.npcs.find((n) => n.id === 'contador')!;
  const caderno = contador.falas.find((f) => f.da?.item === 'caderno')!;
  assert.equal(caderno.cutscene, 'contador');
  assert.equal(caderno.liga, 'tem_caderno');
});

test('o Terreiro de Água tem cutscene ao entrar e ao vencer a Dona Mariana', () => {
  const t = MAPAS['terreiroPortoIara']!;
  assert.equal(t.aoChegar?.cutscene, 'terreiro_agua');
  assert.equal(t.aoChegar?.seNao, 'viu_cut_terreiro_agua', 'a entrada tocaria toda vez');
  const mariana = t.npcs.find((n) => n.id === 'mariana')!;
  assert.equal(mariana.treinador?.cutscene, 'mariana_vence');
  // a medalha continua vindo da fala dela, depois da cutscene
  assert.ok(mariana.falas.some((f) => f.medalha === 'mare'));
});

test('saindo do terreiro com a medalha, o Mestre chama de volta à Firmina, que entrega a carta', () => {
  const chegada = MAPAS['portoIara']!.aoChegar!;
  assert.equal(chegada.cutscene, 'firmina_chama');
  assert.equal(chegada.se, 'medalha:mare');
  const nao = [chegada.seNao ?? []].flat();
  assert.ok(nao.includes('viu_cut_firmina_chama'), 'a chamada tocaria toda vez');
  assert.ok(nao.includes('deu_carta_tie'), 'a chamada tocaria com a carta já pega');
  const firmina = MAPAS['casaFirmina']!.npcs.find((n) => n.id === 'firmina')!;
  const carta = firmina.falas.find((f) => f.da?.item === 'carta_tie')!;
  assert.equal(carta.cutscene, 'firmina_carta');
  assert.equal(carta.liga, 'deu_carta_tie');
});

/* ------------------------------------------- Região 2: a Mata do Curupira */

test('o Seu Elias conta a história da mata quando recebe a carta', () => {
  const elias = MAPAS['mataDoCurupira']!.npcs.find((n) => n.id === 'elias')!;
  const carta = elias.falas.find((f) => f.pede?.item === 'carta_tie')!;
  assert.equal(carta.cutscene, 'elias');
  assert.ok([carta.liga].flat().includes('conta_recado_mata'));
  const mudas = elias.falas.find((f) => f.pede?.item === 'muda')!;
  assert.equal(mudas.cutscene, 'elias_mudas');
  assert.equal(mudas.liga, 'conta_mudas');
  const pegadas = elias.falas.find((f) => f.liga === 'conta_pegadas')!;
  assert.equal(pegadas.cutscene, 'elias_pegadas');
});

test('o segundo Zeca, no igarapé, é apresentado antes da luta', () => {
  const zeca = MAPAS['igarapeCurupira']!.npcs.find((n) => n.id === 'zeca2')!;
  assert.equal(zeca.treinador?.apresentacao, 'zeca_mata');
  assert.ok(CUTSCENES['zeca_mata']!.some((t) => t.titulo?.includes('ZECA')), 'falta o letreiro do rival');
});

test('o Curupira da grota só aparece depois da carta, de emboscada', () => {
  const c = MAPAS['mataDoCurupira']!.npcs.find((n) => n.id === 'curupira_grota')!;
  assert.equal(c.se, 'conta_recado_mata');
  assert.equal(c.encontro, 'curupira');
  assert.ok(c.emboscada);
  assert.equal(c.treinador?.liga, 'conta_grota');
  assert.ok(CUTSCENES['curupira']!.some((t) => t.titulo?.includes('CURUPIRA')));
});

test('o Terreiro de Raiz tem cutscene ao entrar e ao vencer a Tiê', () => {
  const t = MAPAS['terreiroCurupira']!;
  assert.equal(t.aoChegar?.cutscene, 'terreiro_raiz');
  assert.equal(t.aoChegar?.seNao, 'viu_cut_terreiro_raiz', 'a entrada tocaria toda vez');
  const tie = t.npcs.find((n) => n.id === 'tie')!;
  assert.equal(tie.treinador?.cutscene, 'tie_vence');
  // a medalha continua vindo da fala dela, depois da cutscene
  assert.ok(tie.falas.some((f) => f.medalha === 'raiz'));
});

test('saindo do terreiro com a Medalha Raiz, o Seu Elias aponta a Serra', () => {
  const chegada = MAPAS['mataDoCurupira']!.aoChegar!;
  assert.equal(chegada.cutscene, 'elias_serra');
  assert.equal(chegada.se, 'medalha:raiz');
  assert.equal(chegada.seNao, 'viu_cut_elias_serra', 'a chamada tocaria toda vez');
  assert.ok(CUTSCENES['elias_serra']!.some((t) => t.titulo?.includes('SERRA BOITATÁ')));
});

/* ---------------------------------- Regiões 3 a 8 e o Círculo Dourado

   O mesmo desenho em toda região, conferido por tabela: o rival (e o chefe
   da estrada) apresentado antes da luta, o bicho da região de emboscada, o
   terreiro com entrada e vitória, a saída chamando a região seguinte, quem
   pede serviço contando a história e o Encantado exclusivo chegando com
   cutscene. */

const npc = (mapa: string, id: string) => {
  const n = MAPAS[mapa]?.npcs.find((x) => x.id === id);
  assert.ok(n, `${mapa}: NPC "${id}" não existe`);
  return n!;
};
const temLetreiro = (id: string, palavra: string) =>
  assert.ok(CUTSCENES[id]!.some((t) => t.titulo?.some((l) => l.includes(palavra))), `${id}: falta o letreiro "${palavra}"`);

const APRESENTADOS: readonly [string, string, string, string][] = [
  ['trilhaDaBrasa', 'chefe_tropa', 'chefe_tropa', 'CHEFE DA TROPA'],
  ['vilaFornalha', 'zeca3', 'zeca_serra', 'ZECA'],
  ['campoAberto', 'chefe_catadores', 'catadores', 'CHEFE DOS CATADORES'],
  ['aldeiaCatavento', 'zeca4', 'zeca_campo', 'ZECA'],
  ['campinaDosRaios', 'chefe_tambores', 'tambores', 'CHEFE DOS TAMBORES'],
  ['aldeiaTupa', 'zeca5', 'zeca_tupa', 'ZECA'],
  ['arraialCaipora', 'zeca6', 'zeca_minas', 'ZECA'],
  ['bairroDaCuca', 'zeca7', 'zeca_cuca', 'ZECA'],
  ['cidadeDoSol', 'zeca8', 'zeca_sol', 'ZECA'],
  ['arenaDourada', 'zeca9', 'zeca_final', 'ZECA'],
  ['arenaDourada', 'anhanga', 'anhanga', 'ANHANGÁ'],
];

for (const [mapa, id, cut, letreiro] of APRESENTADOS) {
  test(`${id} (${mapa}) é apresentado antes da primeira luta`, () => {
    assert.equal(npc(mapa, id).treinador?.apresentacao, cut);
    temLetreiro(cut, letreiro);
  });
}

const EMBOSCADAS: readonly [string, string, string, string][] = [
  ['cumeeiraBoitata', 'mula_cumeeira', 'mula', 'MULA-SEM-CABEÇA'],
  ['topoDoRedemoinho', 'matinta_topo', 'matinta', 'MATINTA'],
  ['morroDoTrovao', 'relampo_cume', 'relampo', 'RELAMPO'],
  ['cavaFunda', 'mapinguari_fundo', 'mapinguari', 'MAPINGUARI'],
  ['casaraoAssombrado', 'cuca_sotao', 'cuca', 'CUCA'],
  ['picoAurora', 'estrela_cume', 'estrela', "ESTRELA-D'ALVA"],
];

for (const [mapa, id, cut, letreiro] of EMBOSCADAS) {
  test(`o bicho de ${mapa} vem de emboscada, com cutscene`, () => {
    const n = npc(mapa, id);
    assert.equal(n.encontro, cut);
    assert.ok(n.emboscada, `${id} apareceria antes da cutscene`);
    assert.ok(n.treinador?.selvagem && n.treinador.liga, `${id}: a luta tem que acender a conta`);
    temLetreiro(cut, letreiro);
  });
}

/* [mapa da entrada, cutscene da entrada, mapa do dono, dono, cutscene da vitória, medalha] */
const TERREIROS_DAQUI: readonly [string, string, string, string, string, string][] = [
  ['terreiroBrasaSalao', 'terreiro_brasa', 'terreiroBrasaSalao', 'bras', 'bras_vence', 'brasa'],
  ['terreiroRodamoinho', 'terreiro_vento', 'terreiroRodamoinho', 'perere', 'perere_vence', 'rodamoinho'],
  ['terreiroTrovao', 'terreiro_trovao', 'terreiroTrovao', 'guaraci', 'guaraci_vence', 'trovao'],
  ['terreiroPedra', 'terreiro_pedra', 'terreiroPedra', 'ubirajara', 'ubirajara_vence', 'pedra'],
  ['terreiroBreu', 'terreiro_breu', 'terreiroBreu', 'morgana', 'morgana_vence', 'breu'],
  ['terreiroAurora', 'terreiro_aurora', 'terreiroAurora', 'solano', 'solano_vence', 'aurora'],
];

for (const [entrada, cutEntrada, mapaDono, dono, cutVence, medalha] of TERREIROS_DAQUI) {
  test(`o terreiro da medalha ${medalha} tem cutscene ao entrar e ao vencer`, () => {
    const t = MAPAS[entrada]!;
    assert.equal(t.aoChegar?.cutscene, cutEntrada);
    assert.equal(t.aoChegar?.seNao, `viu_cut_${cutEntrada}`, 'a entrada tocaria toda vez');
    const d = npc(mapaDono, dono);
    assert.equal(d.treinador?.cutscene, cutVence);
    // a medalha continua vindo da fala do dono, depois da cutscene
    assert.ok(d.falas.some((f) => f.medalha === medalha));
    assert.ok(CUTSCENES[cutVence]!.some((tm) => tm.atores?.some((a) => 'medalha' in a.figura && a.figura.medalha === medalha)),
              `${cutVence}: a medalha não aparece`);
    // o dono aparece com o estilo dele, não o de outra pessoa
    assert.ok(ESTILOS[d.estilo], `${dono}: estilo "${d.estilo}"`);
  });
}

/* [mapa, cutscene, medalha que chama, letreiro da região seguinte] */
const SAIDAS: readonly [string, string, string, string][] = [
  ['vilaFornalha', 'fornalha_campo', 'brasa', 'CAMPO DO SACI'],
  ['aldeiaCatavento', 'catavento_tupa', 'rodamoinho', 'ALDEIA TUPÃ'],
  ['aldeiaTupa', 'tupa_minas', 'trovao', 'MINAS DA CAIPORA'],
  ['arraialCaipora', 'arraial_cuca', 'pedra', 'BAIRRO DA CUCA'],
  ['bairroDaCuca', 'bairro_sol', 'breu', 'CIDADE DO SOL'],
  ['cidadeDoSol', 'sol_circulo', 'aurora', 'O CÍRCULO DOURADO'],
];

for (const [mapa, cut, medalha, letreiro] of SAIDAS) {
  test(`saindo com a medalha ${medalha}, ${mapa} chama para a região seguinte`, () => {
    const c = MAPAS[mapa]!.aoChegar!;
    assert.equal(c.cutscene, cut);
    assert.equal(c.se, `medalha:${medalha}`);
    assert.equal(c.seNao, `viu_cut_${cut}`, 'a chamada tocaria toda vez');
    temLetreiro(cut, letreiro);
  });
}

/* quem pede serviço conta a história: [mapa, npc ou objeto, a flag que a fala liga, cutscene] */
const SERVICOS: readonly [string, string, string, string][] = [
  ['forjaFornalha', 'ferreiro', 'tem_candeia', 'ferreiro'],
  ['forjaFornalha', 'ferreiro', 'conta_fole', 'ferreiro_fole'],
  ['moinhoCatavento', 'moleiro', 'conta_catavento', 'moleiro'],
  ['casaPaje', 'paje', 'conta_pedras_raio', 'paje'],
  ['bocaDaMina', 'garimpeira', 'tem_forquilha', 'garimpeira'],
  ['arraialCaipora', 'dona_luzia', 'conta_menino', 'tuco'],
  ['casaCartomante', 'cartomante', 'conta_cartomante', 'cartomante'],
  ['casaOraculo', 'oraculo', 'conta_oraculo', 'oraculo'],
];

for (const [mapa, id, flag, cut] of SERVICOS) {
  test(`${id} conta a história quando a fala de ${flag} fecha`, () => {
    const f = npc(mapa, id).falas.find((x) => [x.liga].flat().includes(flag));
    assert.ok(f, `${id}: nenhuma fala liga ${flag}`);
    assert.equal(f!.cutscene, cut);
  });
}

test('o para-raio mestre do charco cala o casarão com cutscene', () => {
  const o = MAPAS['charcoRelampejante']!.objetos.find((x) => x.falas?.some((f) => f.liga === 'conta_para_raios'));
  assert.equal(o?.falas?.[0]?.cutscene, 'para_raios');
});

const EXCLUSIVOS: readonly [string, string, string][] = [
  ['cavernaBoitata', 'mae_do_ouro', 'mae_do_ouro'],
  ['moinhoCatavento', 'uirapuru', 'uirapuru'],
  ['charcoRelampejante', 'arco_da_velha', 'arco_da_velha'],
  ['cavaFunda', 'caipora_fundo', 'caipora'],
  ['casaraoAssombrado', 'pisadeira_telhado', 'pisadeira'],
  ['picoAurora', 'jaci_cume', 'jaci'],
];

for (const [mapa, id, cut] of EXCLUSIVOS) {
  test(`o Encantado exclusivo de ${mapa} chega com cutscene`, () => {
    const f = npc(mapa, id).falas.find((x) => x.encantado);
    assert.equal(f?.cutscene, cut);
    const especie = f!.encantado!.especie;
    assert.ok(CUTSCENES[cut]!.some((t) => t.atores?.some((a) => 'criatura' in a.figura && a.figura.criatura === especie)),
              `${cut}: o próprio ${especie} não aparece`);
  });
}

test('o Círculo Dourado tem cutscene na praça, na arena e no fim, antes dos créditos', () => {
  assert.equal(MAPAS['circuloDourado']!.aoChegar?.cutscene, 'circulo');
  assert.equal(MAPAS['arenaDourada']!.aoChegar?.cutscene, 'arena');
  assert.equal(MAPAS['arenaDourada']!.aoChegar?.seNao, 'viu_cut_arena');
  const campeao = npc('arenaDourada', 'anhanga').treinador!;
  assert.equal(campeao.cutscene, 'campeao');
  assert.ok(campeao.creditos, 'a cutscene do campeão vem antes dos créditos, não no lugar deles');
  // a última tomada volta ao letreiro da abertura
  assert.ok(CUTSCENES['campeao']!.at(-1)!.titulo?.includes('ENCANTADOS'));
});

/* ------------------------------------------------------------ a trilha */

test('toda cutscene começa dizendo o tema, e todo tema pedido existe', () => {
  for (const [id, roteiro] of Object.entries(CUTSCENES)) {
    assert.ok(roteiro[0]?.musica, `${id}: a primeira tomada não diz a música`);
    for (const t of roteiro) {
      if (t.musica) assert.ok(t.musica in MUSICAS, `${id}: tema "${t.musica}" não existe`);
    }
  }
});

test('todo tema que não é vinheta toca em algum lugar: cutscene, mapa ou batalha', () => {
  const usados = new Set<IdMusica | undefined>([
    ...Object.values(CUTSCENES).flatMap((r) => r.map((t) => t.musica)),
    ...Object.values(MAPAS).map((d) => temaDoMapa(d)),
    temaDaBatalha(null),
    'titulo',                    // a tela de título (scenes/title.ts)
    ...Object.values(MAPAS).flatMap((d) => d.npcs.flatMap((n) => (n.treinador ? [temaDaBatalha(n.treinador)] : []))),
  ]);
  for (const [id, m] of Object.entries(MUSICAS)) {
    if ('vinheta' in m && m.vinheta) continue;
    assert.ok(usados.has(id as IdMusica), `o tema "${id}" não toca em lugar nenhum`);
  }
});
