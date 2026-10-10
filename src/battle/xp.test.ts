import test from 'node:test';
import assert from 'node:assert/strict';
import { Batalha, FRACAO_RESERVA, type Evento } from './engine.ts';
import { criar, xpPorDerrotar } from './encantado.ts';

const textos = (ev: Evento[]) => ev.filter((e) => e.k === 'texto').map((e) => e.t);

test('quem está em campo leva todo o XP, a reserva de pé leva metade, o caído nada', () => {
  const campo = criar('boitatinha', 30), reserva = criar('iarinha', 5), caido = criar('curupinho', 5);
  campo.golpes = [{ id: 'investida', pp: 30, ppMax: 30 }];
  caido.hp = 0;
  const alvo = criar('piragua', 3, { selvagem: true });
  const ganho = xpPorDerrotar(alvo);
  const xp0 = { campo: campo.xp, reserva: reserva.xp, caido: caido.xp };
  const b = new Batalha({ time: [campo, reserva, caido], oponentes: [alvo], semente: 2, mochila: {} });
  const ev: Evento[] = [];
  for (let i = 0; i < 20 && !b.resultado; i++) ev.push(...b.executar({ tipo: 'golpe', indice: 0 }));
  assert.equal(b.resultado, 'vitoria');
  assert.equal(campo.xp - xp0.campo, ganho);
  assert.equal(reserva.xp - xp0.reserva, Math.floor(ganho * FRACAO_RESERVA));
  assert.equal(caido.xp, xp0.caido, 'o caído não ganha');
  const t = textos(ev).join(' | ');
  assert.match(t, /O resto do time ganhou/);
});

test('subir de nível na reserva vira texto, sem evento de cena', () => {
  const campo = criar('boitatinha', 70), reserva = criar('iarinha', 2);
  campo.golpes = [{ id: 'investida', pp: 30, ppMax: 30 }];
  const alvo = criar('piraguacu', 25, { selvagem: true });
  alvo.hp = 1;
  const b = new Batalha({ time: [campo, reserva], oponentes: [alvo], semente: 3, mochila: {} });
  const ev: Evento[] = [];
  for (let i = 0; i < 10 && !b.resultado; i++) ev.push(...b.executar({ tipo: 'golpe', indice: 0 }));
  assert.ok(reserva.nivel > 2, 'a reserva subiu');
  assert.ok(textos(ev).some((t) => t.startsWith('Iarinha chegou ao nível') || /IARINHA chegou ao nível/i.test(t)));
  // os eventos `nivel` são só de quem está em campo
  const niveis = ev.filter((e) => e.k === 'nivel').length;
  assert.ok(niveis <= 1);
});

import { hpMaximo } from './encantado.ts';

test('a peçonha piora a cada turno: 1/16, 2/16, 3/16 da vida', () => {
  const eu = criar('boitatinha', 50, { golpes: ['encarada'] });
  eu.status = 'envenenado';
  const dele = criar('cabritinha', 5, { golpes: ['encarada'], selvagem: true });
  const b = new Batalha({ time: [eu], oponentes: [dele], semente: 1, mochila: {} });
  const max = hpMaximo(eu);
  const perdas: number[] = [];
  for (let i = 0; i < 3; i++) {
    const ev = b.executar({ tipo: 'golpe', indice: 0 });
    for (const e of ev) if (e.k === 'dano' && e.lado === 'aliado') perdas.push(e.de - e.para);
  }
  assert.deepEqual(perdas, [1, 2, 3].map((n) => Math.max(1, Math.floor(max * n / 16))));
});

test('golpe ½×: "Não foi muito eficaz..."', () => {
  const eu = criar('boitatinha', 30, { golpes: ['brasa'] });
  const dele = criar('piragua', 30, { golpes: ['encarada'], selvagem: true });
  const b = new Batalha({ time: [eu], oponentes: [dele], semente: 4, mochila: {} });
  let viu = false;
  for (let i = 0; i < 5 && !viu; i++) viu = textos(b.executar({ tipo: 'golpe', indice: 0 })).includes('Não foi muito eficaz...');
  assert.ok(viu);
});

import { item, quantoCura } from '../data/items.ts';

test('a Garrafada cura um terço da vida (no mínimo 20); a Forte, dois terços; a Santa, tudo', () => {
  const ef = (id: string) => item(id).efeito as { k: 'cura'; hp: number; fracao?: number };
  assert.equal(quantoCura(ef('garrafada'), 40), 20, 'bicho pequeno: o mínimo');
  assert.equal(quantoCura(ef('garrafada'), 180), 63);
  assert.equal(quantoCura(ef('garrafada_forte'), 180), 126);
  assert.equal(quantoCura(ef('garrafada_santa'), 180), 180);
});
