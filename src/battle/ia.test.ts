/* A IA do treinador: não gasta golpe à toa, finaliza antes de cair e, se
   for `esperta`, troca para quem aguenta. O selvagem continua como sempre. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Batalha, type Evento } from './engine.ts';
import { criar, type Encantado } from './encantado.ts';

function contra(meu: Encantado, dele: Encantado[], semente: number, esperta = false) {
  return new Batalha({
    time: [meu], oponentes: dele, semente,
    treinador: { nome: 'Teste', classe: 'TREINADOR', esperta },
  });
}
const golpesDele = (ev: Evento[]) =>
  ev.flatMap((e) => (e.k === 'golpe' && e.lado === 'inimigo' ? [e.golpe] : []));

/* o primeiro golpe que o treinador escolhe, em várias sementes */
function escolhas(montar: (semente: number) => Batalha, sementes = 40): string[] {
  const r: string[] = [];
  for (let s = 1; s <= sementes; s++) {
    r.push(...golpesDele(montar(s).executar({ tipo: 'golpe', indice: 0 })).slice(0, 1));
  }
  return r;
}

test('não tenta queimar quem é de Fogo', () => {
  const r = escolhas((s) => contra(criar('boitatinha', 20, { golpes: ['encarada'] }),
    [criar('curupinho', 20, { golpes: ['fogo_fatuo', 'investida'] })], s));
  assert.ok(r.length > 0 && !r.includes('fogo_fatuo'), r.join(','));
});

test('não põe no sono quem já dorme, nem quem é Vigia', () => {
  const montar = (alvo: () => Encantado) => (s: number) =>
    contra(alvo(), [criar('curupinho', 20, { golpes: ['polen', 'investida'] })], s);
  const r1 = escolhas(montar(() => { const e = criar('mulinha', 20, { golpes: ['encarada'] });
    e.status = 'dormindo'; e.turnosStatus = 3; return e; }));
  const r2 = escolhas(montar(() => criar('luzeiro', 20, { golpes: ['encarada'] })));
  assert.ok(!r1.includes('polen') && !r2.includes('polen'));
});

test('não abaixa a defesa que já está no fundo', () => {
  const r = escolhas((s) => {
    const b = contra(criar('mulinha', 20, { golpes: ['encarada'] }),
      [criar('cabritinha', 20, { golpes: ['encarada', 'rosnado'] })], s);
    b.aliado.estagios.def = -6;   // a Encarada baixa a defesa; o Rosnado, o ataque
    return b;
  });
  assert.ok(r.length > 0 && r.every((g) => g === 'rosnado'), r.join(','));
});

test('com os dois por um fio, finaliza com o golpe que sai antes', () => {
  const r = escolhas((s) => {
    // o Saci é mais rápido: só o Risco (prioridade) chega antes dele
    const b = contra(criar('saci', 30, { golpes: ['investida'] }),
      [criar('faisquinha', 30, { golpes: ['trovao_seco', 'risco'] })], s);
    b.aliado.enc.hp = 1;
    b.inimigo.enc.hp = 1;
    return b;
  });
  assert.ok(r.length > 0 && r.every((g) => g === 'risco'), r.join(','));
});

test('esperta: contra golpe de Água, troca para quem bebe a água', () => {
  let trocou = 0;
  for (let s = 1; s <= 40; s++) {
    // o Curupinho vem antes na lista e também resiste, mas o Piraguá não leva nada
    const b = contra(criar('iarinha', 30, { golpes: ['jato_agua'] }), [
      criar('mulinha', 30, { golpes: ['investida'] }),
      criar('curupinho', 30, { golpes: ['investida'] }),
      criar('piragua', 30, { golpes: ['investida'] }),
    ], s, true);
    b.executar({ tipo: 'golpe', indice: 0 });
    if (b.iInimigo !== 0) { trocou++; assert.equal(b.iInimigo, 2, `semente ${s}`); }
  }
  assert.ok(trocou > 8, `trocou ${trocou} de 40`);
});

test('esperta: não troca quem já ganhou força', () => {
  for (let s = 1; s <= 40; s++) {
    const b = contra(criar('iarinha', 30, { golpes: ['jato_agua'] }), [
      criar('mulinha', 30, { golpes: ['investida'] }),
      criar('piragua', 30, { golpes: ['investida'] }),
    ], s, true);
    b.inimigo.estagios.atq = 2;
    b.executar({ tipo: 'golpe', indice: 0 });
    assert.equal(b.iInimigo, 0, `semente ${s}`);
  }
});

test('sem `esperta`, o treinador nunca troca', () => {
  for (let s = 1; s <= 20; s++) {
    const b = contra(criar('iarinha', 30, { golpes: ['jato_agua'] }), [
      criar('mulinha', 30, { golpes: ['investida'] }),
      criar('piragua', 30, { golpes: ['investida'] }),
    ], s);
    b.executar({ tipo: 'golpe', indice: 0 });
    assert.equal(b.iInimigo, 0);
  }
});
