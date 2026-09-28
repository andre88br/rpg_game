import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PASSOS_POR_COMPASSO, acordeDe, compilar, frequencia, lerVoz, midiDe,
} from './partitura.ts';
import { MUSICAS, type IdMusica } from './musicas.ts';

test('alturas: lá 4 é 440 Hz e dó central é o midi 60', () => {
  assert.equal(midiDe('a4'), 69);
  assert.equal(midiDe('c4'), 60);
  assert.equal(midiDe('c#4'), 61);
  assert.equal(midiDe('bb3'), 58);
  assert.equal(frequencia(69), 440);
  assert.ok(Math.abs(frequencia(midiDe('a5')) - 880) < 1e-9);
  assert.throws(() => midiDe('h4'));
});

test('acordes: raiz e qualidade', () => {
  assert.deepEqual(acordeDe('C'), { raiz: 0, intervalos: [0, 4, 7] });
  assert.deepEqual(acordeDe('Am'), { raiz: 9, intervalos: [0, 3, 7] });
  assert.equal(acordeDe('Bb').raiz, 10);
  assert.equal(acordeDe('F#m').raiz, 6);
  assert.deepEqual(acordeDe('G7').intervalos, [0, 4, 7, 10]);
  assert.throws(() => acordeDe('X'));
});

test('lerVoz: duração padrão de 2 passos, pausas e compasso que não fecha', () => {
  const [c] = lerVoz('c5 e5:4 -:6 g5:4');
  assert.deepEqual(c!.map((f) => f.dur), [2, 4, 6, 4]);
  assert.equal(c![2]!.midi, null);
  assert.throws(() => lerVoz('c5 e5'), /soma 4 passos/);
});

test('compilar: melodia com compassos a mais que os acordes é erro', () => {
  assert.throws(() => compilar({ bpm: 100, acordes: ['C'], melodia: 'c5:16 | c5:16' }));
});

test('compilar: baixo, bateria e arpejo cobrem todos os compassos', () => {
  const c = compilar({
    bpm: 120, acordes: ['C', 'F G'], melodia: 'c5:16 | c5:16',
    baixo: 'marcha', bateria: 'rock', arpejo: 'sobe',
  });
  assert.equal(c.passos, 2 * PASSOS_POR_COMPASSO);
  const baixo = c.notas.filter((n) => n.voz === 'baixo');
  assert.equal(baixo.length, 8);                          // 2 por meio compasso
  // segunda metade do segundo compasso é sol: a raiz do baixo é um sol
  const sol = baixo.find((n) => n.passo === 24)!;
  assert.ok(Math.abs(sol.freq - frequencia(43)) < 1e-9);  // sol 2
  assert.equal(c.notas.filter((n) => n.voz === 'arpejo').length, 32);
  assert.ok(c.batidas.every((b) => b.passo < c.passos));
});

test('todas as músicas compilam, dentro da faixa que se ouve bem', () => {
  for (const [id, m] of Object.entries(MUSICAS)) {
    const c = compilar(m);
    assert.ok(c.notas.length > 0, id);
    assert.ok(c.bpm >= 60 && c.bpm <= 200, id);
    for (const n of c.notas) {
      assert.ok(n.freq >= 60 && n.freq <= 2200, `${id}: ${n.freq.toFixed(1)} Hz fora da faixa`);
      assert.ok(n.passo + n.dur <= c.passos, `${id}: nota passa do fim`);
    }
  }
});

test('só as vinhetas deixam de repetir', () => {
  const vinhetas: IdMusica[] = ['cura', 'item', 'medalha', 'captura', 'nivel', 'derrota'];
  for (const [id, m] of Object.entries(MUSICAS)) {
    assert.equal(compilar(m).vinheta, vinhetas.includes(id as IdMusica), id);
  }
});
