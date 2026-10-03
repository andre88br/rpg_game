/* Os traços na batalha: um caso para cada gancho do motor. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Batalha, type Evento } from './engine.ts';
import { criar, hpMaximo, type Encantado } from './encantado.ts';
import type { Mochila } from '../data/items.ts';

/* a Cabritinha (Cabeçuda) é o adversário neutro: o traço dela só vale para recuo */
const neutro = (nivel = 30, golpes = ['encarada']) =>
  criar('cabritinha', nivel, { golpes, selvagem: true });

function luta(meu: Encantado, dele: Encantado,
              op: { semente?: number; noite?: boolean; mochila?: Mochila } = {}) {
  return new Batalha({ time: [meu], oponentes: [dele], semente: op.semente ?? 1,
                       noite: op.noite, mochila: op.mochila ?? {} });
}
const tracos = (ev: Evento[]) => ev.filter((e) => e.k === 'traco').map((e) => e.nome);
const danos = (ev: Evento[], lado: 'aliado' | 'inimigo') =>
  ev.flatMap((e) => (e.k === 'dano' && e.lado === lado ? [e.de - e.para] : []));

/* --------------------------------------------------------------- entrada */

test('Agouro: ao abrir a luta, o ataque do adversário cai', () => {
  const b = luta(criar('matinta', 30), neutro());
  const ev = b.abrir();
  assert.deepEqual(tracos(ev), ['Agouro']);
  assert.equal(b.inimigo.estagios.atq, -1);
});

test('Agouro: também ao entrar trocando', () => {
  const time = [criar('cabritinha', 30, { golpes: ['encarada'] }), criar('matinta', 30)];
  const b = new Batalha({ time, oponentes: [neutro()], semente: 1 });
  b.abrir();
  const ev = b.executar({ tipo: 'trocar', indice: 1 });
  assert.ok(tracos(ev).includes('Agouro'));
  assert.ok(b.inimigo.estagios.atq < 0);
});

/* ------------------------------------------------------------------ dano */

test('Chama Viva: o fogo só fica mais forte com o fôlego por um fio', () => {
  const dano = (hpBaixo: boolean) => {
    const meu = criar('boitatinha', 30, { golpes: ['brasa'] });
    if (hpBaixo) meu.hp = 1;
    const ev = luta(meu, neutro(60), { semente: 3 }).executar({ tipo: 'golpe', indice: 0 });
    return danos(ev, 'inimigo')[0]!;
  };
  assert.ok(dano(true) > dano(false) * 1.3, `${dano(true)} contra ${dano(false)}`);
});

test('Couro Grosso: pancada física machuca menos; a especial não muda', () => {
  const dano = (alvo: string, golpe: string) => {
    const meu = criar('cabritinha', 60, { golpes: [golpe] });
    const dele = criar(alvo, 40, { golpes: ['encarada'], selvagem: true });
    return danos(luta(meu, dele, { semente: 4 }).executar({ tipo: 'golpe', indice: 0 }), 'inimigo')[0]!;
  };
  // mesmos atributos, só o traço diferente? não existe; então compara a razão
  // física/especial do Mapinguari com a de um Minhocão (terra, sem couro)
  const razaoCouro = dano('mapinguari', 'investida') / dano('mapinguari', 'brasa');
  const razaoSem = dano('minhocao', 'investida') / dano('minhocao', 'brasa');
  assert.ok(razaoCouro < razaoSem * 0.85, `${razaoCouro} contra ${razaoSem}`);
});

test('Água Funda: golpe de água não machuca e cura', () => {
  const meu = criar('iarinha', 30, { golpes: ['jato_agua'] });
  const dele = criar('piragua', 30, { golpes: ['encarada'], selvagem: true });
  dele.hp = 10;
  const ev = luta(meu, dele).executar({ tipo: 'golpe', indice: 0 });
  assert.deepEqual(danos(ev, 'inimigo'), []);
  assert.ok(dele.hp > 10);
  assert.ok(tracos(ev).includes('Água Funda'));
});

test('Carapaça: nunca leva acerto em cheio', () => {
  for (let semente = 1; semente <= 300; semente++) {
    const meu = criar('salamanca', 30, { golpes: ['investida'] });   // Carbúnculo: crítico mais fácil
    const dele = criar('tatuTrovao', 60, { golpes: ['encarada'], selvagem: true });
    const ev = luta(meu, dele, { semente }).executar({ tipo: 'golpe', indice: 0 });
    assert.ok(!ev.some((e) => e.k === 'dano' && e.critico), `semente ${semente}`);
  }
});

test('Carbúnculo: acerta em cheio mais que o normal', () => {
  const criticos = (especie: string) => {
    let n = 0;
    for (let semente = 1; semente <= 400; semente++) {
      const meu = criar(especie, 30, { golpes: ['investida'] });
      const ev = luta(meu, neutro(60), { semente }).executar({ tipo: 'golpe', indice: 0 });
      if (ev.some((e) => e.k === 'dano' && e.lado === 'inimigo' && e.critico)) n++;
    }
    return n;
  };
  assert.ok(criticos('salamanca') > criticos('mulinha') * 2);
});

test('Lua Cheia: só vale à noite', () => {
  const dano = (noite: boolean) => {
    const meu = criar('lobinho', 30, { golpes: ['investida'] });
    return danos(luta(meu, neutro(60), { semente: 5, noite }).executar({ tipo: 'golpe', indice: 0 }), 'inimigo')[0]!;
  };
  assert.ok(dano(true) > dano(false) * 1.2, `${dano(true)} contra ${dano(false)}`);
});

test('Acalanto: bate mais em quem dorme', () => {
  const dano = (dormindo: boolean) => {
    const meu = criar('cuca', 30, { golpes: ['investida'] });
    const dele = neutro(60);
    if (dormindo) { dele.status = 'dormindo'; dele.turnosStatus = 3; }
    return danos(luta(meu, dele, { semente: 5 }).executar({ tipo: 'golpe', indice: 0 }), 'inimigo')[0]!;
  };
  assert.ok(dano(true) > dano(false) * 1.35);
});

/* --------------------------------------------------------------- contato */

test('Pele Elétrica: golpe físico às vezes trava quem bate; especial nunca', () => {
  let fisico = 0, especial = 0;
  for (let semente = 1; semente <= 60; semente++) {
    for (const golpe of ['investida', 'brasa']) {
      const meu = criar('mulinha', 30, { golpes: [golpe] });
      const dele = criar('relampo', 60, { golpes: ['encarada'], selvagem: true });
      luta(meu, dele, { semente }).executar({ tipo: 'golpe', indice: 0 });
      if (meu.status === 'paralisado') golpe === 'investida' ? fisico++ : especial++;
    }
  }
  assert.ok(fisico > 5 && fisico < 35, `travou ${fisico} de 60`);
  assert.equal(especial, 0);
});

test('Assombrado: contato pode dar quebranto, mas não em quem é Sem Cabeça', () => {
  let pegou = 0, semCabeca = 0;
  for (let semente = 1; semente <= 60; semente++) {
    const b = luta(criar('cabritinha', 30, { golpes: ['investida'] }),
                   criar('corpoSeco', 60, { golpes: ['encarada'], selvagem: true }), { semente });
    b.executar({ tipo: 'golpe', indice: 0 });
    if (b.aliado.feitico > 0) pegou++;
    const c = luta(criar('mulinha', 30, { golpes: ['investida'] }),
                   criar('corpoSeco', 60, { golpes: ['encarada'], selvagem: true }), { semente });
    c.executar({ tipo: 'golpe', indice: 0 });
    if (c.aliado.feitico > 0) semCabeca++;
  }
  assert.ok(pegou > 5);
  assert.equal(semCabeca, 0);
});

/* ------------------------------------------------------------ imunidade */

test('Vigia não dorme; Sete Cores não pega nenhum estado; Pele de Ouro, peçonha', () => {
  const tenta = (alvo: string, golpe: string) => {
    for (let semente = 1; semente <= 10; semente++) {
      const dele = criar(alvo, 30, { golpes: ['encarada'], selvagem: true });
      const ev = luta(criar('cabritinha', 30, { golpes: [golpe] }), dele, { semente })
        .executar({ tipo: 'golpe', indice: 0 });
      if (dele.status) return dele.status;
      if (tracos(ev).length) return 'barrou';
    }
    return null;
  };
  assert.equal(tenta('luzeiro', 'polen'), 'barrou');
  assert.equal(tenta('arcoDaVelha', 'polen'), 'barrou');   // Raio: a teia já não pegaria
  assert.equal(tenta('maeDoOuro', 'esporo'), 'barrou');
  assert.equal(tenta('cabritinha', 'polen'), 'dormindo');
});

test('Cabeçuda: não se machuca com o tranco', () => {
  const meu = criar('cabritinha', 30, { golpes: [] });      // sem golpe: Esforço, que tem recuo
  const b = luta(meu, neutro(60));
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  assert.deepEqual(danos(ev, 'aliado'), []);
});

test('Pés Trocados: o adversário erra mais', () => {
  const erros = (alvo: string) => {
    let n = 0;
    for (let semente = 1; semente <= 400; semente++) {
      const dele = criar(alvo, 60, { golpes: ['encarada'], selvagem: true });
      const ev = luta(criar('mulinha', 30, { golpes: ['investida'] }), dele, { semente })
        .executar({ tipo: 'golpe', indice: 0 });
      if (ev.some((e) => e.k === 'errou' && e.lado === 'aliado')) n++;
    }
    return n;
  };
  assert.equal(erros('cabritinha'), 0);
  const n = erros('curupinho');
  assert.ok(n > 30 && n < 95, `errou ${n} de 400`);
});

/* ---------------------------------------------------------- fim do turno */

test('Canto que Cura regenera no fim do turno', () => {
  const meu = criar('uirapuru', 30, { golpes: ['encarada'] });
  meu.hp = 5;
  const ev = luta(meu, neutro()).executar({ tipo: 'golpe', indice: 0 });
  assert.ok(meu.hp > 5);
  assert.ok(tracos(ev).includes('Canto que Cura'));
});

test('Peso no Peito castiga o adversário que dorme, e só ele', () => {
  const dele = neutro(30);
  dele.status = 'dormindo'; dele.turnosStatus = 3;
  const b = luta(criar('pisadeira', 30, { golpes: ['encarada'] }), dele);
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  assert.ok(dele.hp < hpMaximo(dele));
  assert.ok(tracos(ev).includes('Peso no Peito'));

  const acordado = neutro(30);
  luta(criar('pisadeira', 30, { golpes: ['encarada'] }), acordado).executar({ tipo: 'golpe', indice: 0 });
  assert.equal(acordado.hp, hpMaximo(acordado));
});

/* ---------------------------------------------------- captura, fuga, achado */

test('Dona da Mata: o patuá pega mais fácil', () => {
  const pegou = (especie: string) => {
    let n = 0;
    for (let semente = 1; semente <= 200; semente++) {
      const mochila: Mochila = { patua: 1 };
      const b = luta(criar(especie, 30, { golpes: ['encarada'] }),
                     criar('lobinho', 20, { golpes: ['encarada'], selvagem: true }), { semente, mochila });
      b.executar({ tipo: 'item', item: 'patua' });
      if (b.resultado === 'captura') n++;
    }
    return n;
  };
  assert.ok(pegou('caiporinha') > pegou('cabritinha') * 1.2);
});

test('Cavador: a fuga nunca falha, mesmo sendo mais lento', () => {
  for (let semente = 1; semente <= 30; semente++) {
    const b = luta(criar('minhoquinha', 5, { golpes: ['encarada'] }),
                   criar('saci', 60, { golpes: ['encarada'], selvagem: true }), { semente });
    b.executar({ tipo: 'fugir' });
    assert.equal(b.resultado, 'fuga');
  }
});

test('Rodamoinho: vencendo um selvagem, às vezes acha um item na mochila', () => {
  let achou = 0;
  for (let semente = 1; semente <= 80; semente++) {
    const mochila: Mochila = {};
    const fraco = criar('cabritinha', 2, { golpes: ['encarada'], selvagem: true });
    const b = luta(criar('saci', 50, { golpes: ['investida'] }), fraco, { semente, mochila });
    b.executar({ tipo: 'golpe', indice: 0 });
    assert.equal(b.resultado, 'vitoria');
    if (Object.values(mochila).some((n) => n > 0)) achou++;
  }
  assert.ok(achou > 8 && achou < 40, `achou ${achou} de 80`);
});

/* ------------------------------------------------------------------ clima */

test('na chuva a água bate mais e o fogo menos, e a abertura avisa', () => {
  const dano = (golpe: string, clima: 'limpo' | 'chuva') => {
    const meu = criar('mulinha', 30, { golpes: [golpe] });
    const b = new Batalha({ time: [meu], oponentes: [neutro(60)], semente: 9, clima });
    return danos(b.executar({ tipo: 'golpe', indice: 0 }), 'inimigo')[0]!;
  };
  assert.ok(dano('jato_agua', 'chuva') > dano('jato_agua', 'limpo'));
  assert.ok(dano('brasa', 'chuva') < dano('brasa', 'limpo'));
  const b = new Batalha({ time: [criar('mulinha', 30)], oponentes: [neutro()], clima: 'chuva' });
  assert.ok(b.abrir().some((e) => e.k === 'texto' && e.t === 'Está chovendo.'));
});

test('o bicho de cor rara é anunciado ao aparecer', () => {
  const dele = criar('lobinho', 5, { selvagem: true, raro: true });
  const ev = new Batalha({ time: [criar('mulinha', 10)], oponentes: [dele] }).abrir();
  assert.ok(ev.some((e) => e.k === 'texto' && /cor rara/.test(e.t)));
});
