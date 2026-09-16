import test from 'node:test';
import assert from 'node:assert/strict';
import { Batalha, type AcaoJogador, type Evento } from './engine.ts';
import { criar, desmaiado, hpMaximo, type Encantado } from './encantado.ts';
import type { Mochila } from '../data/items.ts';

/* ---------------------------------------------------------------- apoio */

function montar(op: {
  meu?: Encantado[]; dele?: Encantado[]; semente?: number;
  treinador?: boolean; mochila?: Mochila;
} = {}) {
  const time = op.meu ?? [criar('boitatinha', 10)];
  const oponentes = op.dele ?? [criar('piragua', 8, { selvagem: true })];
  return new Batalha({
    time, oponentes, semente: op.semente ?? 1,
    mochila: op.mochila ?? {},
    treinador: op.treinador
      ? { nome: 'Zeca', classe: 'RIVAL', falaDerrota: 'Da próxima eu ganho!' }
      : null,
  });
}

const textos = (ev: Evento[]) => ev.filter((e) => e.k === 'texto').map((e) => e.t);
const tem = (ev: Evento[], k: Evento['k']) => ev.some((e) => e.k === k);

/* roda a batalha até acabar, sempre atacando com o primeiro golpe */
function ateOFim(b: Batalha, acao: AcaoJogador = { tipo: 'golpe', indice: 0 }, limite = 200) {
  const tudo: Evento[] = [];
  for (let i = 0; i < limite && !b.resultado; i++) {
    if (b.aguardandoTroca) {
      const livre = b.disponiveis()[0];
      if (livre === undefined) break;
      tudo.push(...b.trocarApos(livre));
      continue;
    }
    tudo.push(...b.executar(acao));
  }
  return tudo;
}

/* ------------------------------------------------------------- abertura */

test('a abertura anuncia selvagem ou treinador', () => {
  assert.match(textos(montar().abrir()).join(' '), /selvagem apareceu/);
  const t = textos(montar({ treinador: true }).abrir()).join(' ');
  assert.match(t, /RIVAL Zeca quer lutar/);
});

/* ---------------------------------------------------------------- turno */

test('um turno tira HP de alguém', () => {
  const b = montar();
  const hpInimigo = b.inimigo.enc.hp;
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  assert.ok(tem(ev, 'dano'));
  assert.ok(b.inimigo.enc.hp < hpInimigo || b.aliado.enc.hp < hpMaximo(b.aliado.enc));
});

test('quem é mais rápido ataca primeiro', () => {
  // Sacizinho (vel 78) contra Caiporinha (vel 38), mesmo nível
  const b = montar({
    meu: [criar('sacizinho', 20)],
    dele: [criar('caiporinha', 20, { selvagem: true })],
  });
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  const primeiro = ev.find((e) => e.k === 'golpe');
  assert.equal(primeiro?.lado, 'aliado');
});

test('prioridade ganha da velocidade', () => {
  // Caiporinha é muito mais lenta, mas Bote tem prioridade +1
  const meu = criar('caiporinha', 20, { golpes: ['bote', 'investida'] });
  const b = montar({ meu: [meu], dele: [criar('sacizinho', 20, { selvagem: true })] });
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  assert.equal(ev.find((e) => e.k === 'golpe')?.lado, 'aliado');
});

test('trocar de Encantado acontece antes de qualquer golpe', () => {
  const b = montar({ meu: [criar('caiporinha', 5), criar('sacizinho', 5)] });
  const ev = b.executar({ tipo: 'trocar', indice: 1 });
  const iEntrar = ev.findIndex((e) => e.k === 'entrar');
  const iGolpe = ev.findIndex((e) => e.k === 'golpe');
  assert.ok(iEntrar >= 0);
  assert.ok(iGolpe === -1 || iEntrar < iGolpe);
  assert.equal(b.aliado.enc.especie, 'sacizinho');
});

test('trocar zera os estágios de atributo', () => {
  const b = montar({ meu: [criar('curupinho', 20, { golpes: ['afiar'] }), criar('sacizinho', 20)] });
  b.executar({ tipo: 'golpe', indice: 0 });
  assert.ok(b.aliado.estagios.atq > 0);
  b.executar({ tipo: 'trocar', indice: 1 });
  assert.equal(b.aliado.estagios.atq, 0);
});

test('usar golpe gasta PP, e só do golpe usado', () => {
  const b = montar({ meu: [criar('iarinha', 20)] });
  const antes = b.aliado.enc.golpes.map((g) => g.pp);
  b.executar({ tipo: 'golpe', indice: 1 });
  const depois = b.aliado.enc.golpes.map((g) => g.pp);
  assert.equal(depois[1], antes[1]! - 1);
  assert.equal(depois[0], antes[0]);
});

test('sem nenhum PP o golpe vira Esforço e machuca quem usa', () => {
  const meu = criar('curupinho', 30, { golpes: ['arranhao'] });
  const b = montar({ meu: [meu], dele: [criar('caiporinha', 30, { selvagem: true })] });
  meu.golpes[0]!.pp = 0;
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  assert.ok(ev.some((e) => e.k === 'golpe' && e.golpe === 'esforco'));
  assert.ok(textos(ev).some((t) => /se machucou com o esforço/.test(t)));
});

/* ------------------------------------------------------------- efeitos */

test('golpe de estado aplica o estado e não tira HP direto', () => {
  const meu = criar('iarinha', 30, { golpes: ['canto_iara'] });
  const b = montar({ meu: [meu], dele: [criar('caiporinha', 30, { selvagem: true })], semente: 3 });
  for (let i = 0; i < 12 && !b.inimigo.enc.status; i++) {
    b.executar({ tipo: 'golpe', indice: 0 });     // 70% de acerto: insiste
  }
  assert.equal(b.inimigo.enc.status, 'dormindo');
});

test('não se queima um Encantado de Fogo', () => {
  const meu = criar('boitatinha', 30, { golpes: ['fogo_fatuo'] });
  const b = montar({ meu: [meu], dele: [criar('boitatao', 30, { selvagem: true })], semente: 5 });
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  assert.equal(b.inimigo.enc.status, null);
  assert.ok(textos(ev).some((t) => /não adiantou/i.test(t)));
});

test('golpe que mexe em atributo mexe no estágio certo', () => {
  const meu = criar('curupinho', 20, { golpes: ['afiar'] });
  const b = montar({ meu: [meu] });
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  assert.equal(b.aliado.estagios.atq, 1);
  assert.ok(ev.some((e) => e.k === 'estagio' && e.stat === 'atq' && e.passos === 1));
});

test('o estágio trava no limite e avisa que não muda mais', () => {
  const meu = criar('curupinho', 40, { golpes: ['afiar'] });
  // oponente fraco de propósito: o teste é sobre o teto do estágio, e o
  // Curupinho precisa sobreviver aos oito turnos para chegar lá
  const b = montar({ meu: [meu], dele: [criar('caiporinha', 3, { selvagem: true })] });
  let avisou = false;
  for (let i = 0; i < 8 && !b.resultado; i++) {
    const ev = b.executar({ tipo: 'golpe', indice: 0 });
    if (textos(ev).some((t) => /não muda mais/.test(t))) avisou = true;
  }
  assert.equal(b.aliado.estagios.atq, 6);
  assert.ok(avisou, 'passou do teto sem avisar');
});

test('golpe de cura não passa do HP máximo e avisa quando é inútil', () => {
  const meu = criar('iarinha', 30, { golpes: ['folego'] });
  const b = montar({ meu: [meu], dele: [criar('caiporinha', 5, { selvagem: true })] });
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  assert.ok(textos(ev).some((t) => /não adiantou/i.test(t)));
  assert.ok(meu.hp <= hpMaximo(meu));
});

test('drenar cura quem usou', () => {
  const meu = criar('curupinho', 30, { golpes: ['raiz_sugadora'] });
  const b = montar({ meu: [meu], dele: [criar('piragua', 8, { selvagem: true })] });
  meu.hp = Math.floor(hpMaximo(meu) / 2);
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  const cura = ev.find((e) => e.k === 'cura');
  if (cura?.k !== 'cura') throw new Error('faltou o evento de cura');
  assert.ok(cura.para > cura.de);
  assert.ok(textos(ev).some((t) => /sugou energia/.test(t)));
});

test('queimadura e veneno tiram HP no fim do turno', () => {
  const meu = criar('curupinho', 30, { golpes: ['esporo'] });
  const b = montar({ meu: [meu], dele: [criar('caiporinha', 30, { selvagem: true })], semente: 11 });
  for (let i = 0; i < 15 && b.inimigo.enc.status !== 'envenenado' && !b.resultado; i++) {
    b.executar({ tipo: 'golpe', indice: 0 });
  }
  assert.equal(b.inimigo.enc.status, 'envenenado');
  const ev = b.executar({ tipo: 'golpe', indice: 0 });
  assert.ok(textos(ev).some((t) => /sofre com o veneno/.test(t)));
});

/* --------------------------------------------------------------- itens */

test('patuá com chance alta captura e encerra a batalha', () => {
  const alvo = criar('piragua', 3, { selvagem: true });
  alvo.hp = 1; alvo.status = 'dormindo';
  const b = montar({ dele: [alvo], mochila: { patua_mestre: 5 }, semente: 8 });
  const ev = b.executar({ tipo: 'item', item: 'patua_mestre' });
  assert.ok(tem(ev, 'patua'));
  assert.equal(b.resultado, 'captura');
  assert.equal(alvo.selvagem, false, 'capturado deixa de ser selvagem');
});

test('não dá para prender o Encantado de um treinador', () => {
  const b = montar({ treinador: true, mochila: { patua: 3 } });
  const ev = b.executar({ tipo: 'item', item: 'patua' });
  assert.ok(textos(ev).some((t) => /Encantado dos outros/.test(t)));
  assert.equal(b.resultado, null);
});

test('usar item gasta a unidade da mochila', () => {
  const mochila = { patua: 2 };
  const b = montar({ mochila, semente: 4 });
  b.executar({ tipo: 'item', item: 'patua' });
  assert.equal(mochila.patua, 1);
});

test('garrafada cura o Encantado que está em campo', () => {
  const meu = criar('iarinha', 20);
  meu.hp = 5;
  const b = montar({ meu: [meu], mochila: { garrafada: 1 } });
  // o oponente ainda joga no mesmo turno, então conferimos o evento de cura,
  // não o HP no fim do turno
  const ev = b.executar({ tipo: 'item', item: 'garrafada' });
  const cura = ev.find((e) => e.k === 'cura');
  if (cura?.k !== 'cura') throw new Error('faltou o evento de cura');
  assert.equal(cura.de, 5);
  assert.equal(cura.para, 25);
});

test('erva-doce limpa o estado alterado', () => {
  const meu = criar('iarinha', 20);
  meu.status = 'queimado';
  const b = montar({ meu: [meu], mochila: { erva_doce: 1 } });
  b.executar({ tipo: 'item', item: 'erva_doce' });
  assert.equal(meu.status, null);
});

/* --------------------------------------------------------------- fuga */

test('dá para fugir de selvagem, e a chance melhora a cada tentativa', () => {
  let fugiu = 0;
  for (let s = 0; s < 60; s++) {
    const b = montar({ semente: s });
    ateOFim(b, { tipo: 'fugir' }, 10);
    if (b.resultado === 'fuga') fugiu++;
  }
  assert.ok(fugiu > 50, `só fugiu ${fugiu} de 60 vezes`);
});

test('não dá para fugir de treinador', () => {
  const b = montar({ treinador: true });
  const ev = b.executar({ tipo: 'fugir' });
  assert.ok(textos(ev).some((t) => /luta marcada/.test(t)));
  assert.equal(b.resultado, null);
});

/* ------------------------------------------------------ fim de batalha */

test('derrubar o único oponente selvagem dá vitória e XP', () => {
  const meu = criar('boitatao', 40);
  const b = montar({ meu: [meu], dele: [criar('piragua', 3, { selvagem: true })] });
  const xpAntes = meu.xp;
  const ev = ateOFim(b);
  assert.equal(b.resultado, 'vitoria');
  assert.ok(tem(ev, 'xp'));
  assert.ok(meu.xp > xpAntes);
});

test('treinador manda o próximo quando o primeiro cai', () => {
  const b = montar({
    meu: [criar('boitatao', 45)],
    dele: [criar('piragua', 3), criar('caiporinha', 3)],
    treinador: true,
  });
  const ev = ateOFim(b);
  assert.equal(b.resultado, 'vitoria');
  assert.ok(ev.some((e) => e.k === 'entrar' && e.lado === 'inimigo'));
  assert.ok(textos(ev).some((t) => /Você venceu Zeca/.test(t)));
  assert.ok(textos(ev).some((t) => /Da próxima eu ganho/.test(t)));
});

test('quando o seu cai e há reserva, a batalha pede a troca em vez de acabar', () => {
  const fraco = criar('piragua', 2);
  const b = montar({ meu: [fraco, criar('boitatao', 40)],
                     dele: [criar('boitatao', 45, { selvagem: true })] });
  const evs: Evento[] = [];
  for (let i = 0; i < 30 && !b.resultado && !b.aguardandoTroca; i++) {
    evs.push(...b.executar({ tipo: 'golpe', indice: 0 }));
  }
  assert.equal(b.aguardandoTroca, true);
  assert.equal(b.resultado, null);
  assert.ok(tem(evs, 'trocarForcado'));

  const ev = b.trocarApos(1);
  assert.equal(b.aguardandoTroca, false);
  assert.equal(b.aliado.enc.especie, 'boitatao');
  assert.ok(tem(ev, 'entrar'));
});

test('sem ninguém em pé no time, é derrota', () => {
  const b = montar({ meu: [criar('piragua', 2)],
                     dele: [criar('boitatao', 50, { selvagem: true })] });
  ateOFim(b);
  assert.equal(b.resultado, 'derrota');
  assert.ok(b.time.every(desmaiado));
});

test('a batalha não aceita mais ações depois de acabar', () => {
  const b = montar({ meu: [criar('boitatao', 45)], dele: [criar('piragua', 2, { selvagem: true })] });
  ateOFim(b);
  assert.deepEqual(b.executar({ tipo: 'golpe', indice: 0 }), []);
});

/* ------------------------------------------------------- XP e evolução */

test('XP suficiente numa vitória faz evoluir durante a batalha', () => {
  const meu = criar('curupinho', 17);
  meu.xp = 0;   // XP zerado para o ganho da luta empurrar vários níveis
  const b = montar({ meu: [meu], dele: [criar('piragua', 3, { selvagem: true })] });
  // um oponente só não basta; forçamos a subida direto e conferimos o evento
  meu.xp = 5827;   // um fio abaixo do nível 18 (18³ = 5832)
  const ev = ateOFim(b);
  assert.equal(b.resultado, 'vitoria');
  assert.ok(tem(ev, 'nivel'));
  assert.ok(ev.some((e) => e.k === 'evoluir' && e.para === 'curupira'));
  assert.equal(meu.especie, 'curupira');
});

test('golpe que não coube vira pendência, não some', () => {
  const meu = criar('boitatinha', 13);
  meu.xp = 2743;    // um fio abaixo do nível 14 (14³ = 2744), onde vem Fogo-Fátuo
  const b = montar({ meu: [meu], dele: [criar('piragua', 2, { selvagem: true })] });
  const ev = ateOFim(b);
  assert.ok(ev.some((e) => e.k === 'esquecer' && e.golpe === 'fogo_fatuo'));
  assert.deepEqual(b.pendentesAprender, [{ indice: 0, golpe: 'fogo_fatuo' }]);
});

/* -------------------------------------------------------------- acaso */

test('a mesma semente reproduz a batalha inteira', () => {
  const rodar = () => {
    const b = montar({ meu: [criar('boitatinha', 12)],
                       dele: [criar('caiporinha', 12, { selvagem: true })], semente: 2025 });
    return JSON.stringify(ateOFim(b));
  };
  assert.equal(rodar(), rodar());
});

test('sementes diferentes produzem batalhas diferentes', () => {
  const rodar = (s: number) => {
    const b = montar({ meu: [criar('boitatinha', 12)],
                       dele: [criar('caiporinha', 12, { selvagem: true })], semente: s });
    return JSON.stringify(ateOFim(b));
  };
  assert.notEqual(rodar(1), rodar(2));
});

/* ---------------------------------------------------------------- IA */

test('a IA prefere o golpe super eficaz que tem em mãos', () => {
  // Piraguá com Jato d'Água (2x em Fogo) e Investida (1x) contra Boitatinha
  const dele = criar('piragua', 20, { golpes: ['investida', 'jato_agua'], selvagem: true });
  let agua = 0, outro = 0;
  for (let s = 0; s < 40; s++) {
    const b = montar({ meu: [criar('boitatinha', 20)], dele: [structuredClone(dele)], semente: s });
    const ev = b.executar({ tipo: 'golpe', indice: 0 });
    const dela = ev.find((e) => e.k === 'golpe' && e.lado === 'inimigo');
    if (!dela || dela.k !== 'golpe') continue;
    if (dela.golpe === 'jato_agua') agua++; else outro++;
  }
  assert.ok(agua > outro * 3, `IA escolheu água ${agua}x e o resto ${outro}x`);
});

test('a IA nunca escolhe um golpe sem PP', () => {
  const dele = criar('piragua', 20, { golpes: ['jato_agua', 'investida'], selvagem: true });
  dele.golpes[0]!.pp = 0;
  const b = montar({ meu: [criar('boitatao', 45)], dele: [dele], semente: 6 });
  for (let i = 0; i < 5 && !b.resultado; i++) {
    const ev = b.executar({ tipo: 'golpe', indice: 3 });
    for (const e of ev) {
      if (e.k === 'golpe' && e.lado === 'inimigo') assert.notEqual(e.golpe, 'jato_agua');
    }
  }
});

test('o treinador é mais certeiro que o bicho selvagem', () => {
  const golpes = ['investida', 'jato_agua'];
  const conta = (treinador: boolean) => {
    let bons = 0;
    for (let s = 0; s < 60; s++) {
      const b = montar({
        meu: [criar('boitatinha', 20)],
        dele: [criar('piragua', 20, { golpes, selvagem: !treinador })],
        treinador, semente: s,
      });
      const ev = b.executar({ tipo: 'golpe', indice: 0 });
      const dela = ev.find((e) => e.k === 'golpe' && e.lado === 'inimigo');
      if (dela?.k === 'golpe' && dela.golpe === 'jato_agua') bons++;
    }
    return bons;
  };
  assert.ok(conta(true) >= conta(false), 'treinador devia errar menos a escolha');
});
