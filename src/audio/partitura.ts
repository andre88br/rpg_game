/* =========================================================================
   Partitura: a música do jogo escrita como texto, e o compilador que a
   transforma numa lista de notas com passo, duração e frequência.

   Como a arte, a música também é feita por código: nenhum arquivo de áudio.
   Cada música traz a MELODIA escrita à mão e os ACORDES, um por compasso;
   o baixo, a bateria e o arpejo saem dos acordes, por um estilo escolhido
   ("baião", "galope", "marcha"...). Assim cada música nova é só a melodia
   e a harmonia — o resto do conjunto vem junto.

   Notação da melodia: notas separadas por espaço, compassos por `|`.
     c5      dó da 5ª oitava, dura 2 passos (uma colcheia)
     f#4:3   fá sustenido, 3 passos
     bb4:8   si bemol, 8 passos (uma mínima)
     -:4     pausa de 4 passos
   Um compasso tem 16 passos (semicolcheias). Compasso que não soma 16 é
   erro — é o teste que pega nota esquecida.

   Acordes: "C", "Am", "G7", "Bb", "F#m", "Bdim", "Cmaj7", "Dsus", "Em7".
   "F G" num compasso só = meio compasso de cada.

   Puro: nada de áudio aqui. Teste em partitura.test.ts.
   ========================================================================= */

export const PASSOS_POR_COMPASSO = 16;
const MEIO = PASSOS_POR_COMPASSO / 2;

export type EstiloBaixo = 'baiao' | 'marcha' | 'galope' | 'lento' | 'passeio' | 'nenhum';
export type EstiloBateria = 'baiao' | 'rock' | 'batalha' | 'suave' | 'marcha' | 'nenhuma';
export type EstiloArpejo = 'sobe' | 'colcheia' | 'nenhum';

export type Voz = 'melodia' | 'contracanto' | 'baixo' | 'arpejo';
export type Batida = 'bumbo' | 'caixa' | 'chimbal' | 'aberto';

export interface Musica {
  bpm: number;
  acordes: readonly string[];
  melodia: string;
  /* uma segunda voz escrita à mão, opcional, na mesma notação */
  contracanto?: string;
  baixo?: EstiloBaixo;
  bateria?: EstiloBateria;
  arpejo?: EstiloArpejo;
  /* toca uma vez e para (vinheta de cura, de medalha...) em vez de repetir */
  vinheta?: boolean;
}

export interface NotaTocada { passo: number; dur: number; freq: number; voz: Voz }
export interface GolpeBateria { passo: number; batida: Batida }

export interface Compilada {
  bpm: number;
  passos: number;
  vinheta: boolean;
  notas: NotaTocada[];
  batidas: GolpeBateria[];
}

/* ------------------------------------------------------------- alturas */

const SEMITOM: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

/* "c4" → 60 (o dó central), "a4" → 69 */
export function midiDe(nota: string): number {
  const m = /^([a-g])(#|b)?(\d)$/.exec(nota);
  if (!m) throw new Error(`nota inválida: "${nota}"`);
  const acidente = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + SEMITOM[m[1]!]! + acidente;
}

export function frequencia(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/* ------------------------------------------------------------- acordes */

const QUALIDADES: Record<string, readonly number[]> = {
  '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11], dim: [0, 3, 6], sus: [0, 5, 7],
};

export interface Acorde { raiz: number; intervalos: readonly number[] }

export function acordeDe(nome: string): Acorde {
  const m = /^([A-G])(#|b)?(m7|maj7|dim|sus|m|7)?$/.exec(nome);
  if (!m) throw new Error(`acorde inválido: "${nome}"`);
  const acidente = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const raiz = (SEMITOM[m[1]!.toLowerCase()]! + acidente + 12) % 12;
  return { raiz, intervalos: QUALIDADES[m[3] ?? '']! };
}

/* ----------------------------------------------------------- melodias */

export interface Figura { midi: number | null; dur: number }

/* Lê uma voz escrita à mão. Devolve os compassos, cada um com suas figuras;
   compasso que não fecha 16 passos é erro. */
export function lerVoz(texto: string): Figura[][] {
  const compassos = texto.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
  return compassos.map((c, i) => {
    const figuras = c.split(/\s+/).map((tok): Figura => {
      const [alt, d] = tok.split(':');
      const dur = d === undefined ? 2 : Number(d);
      if (!Number.isInteger(dur) || dur <= 0) throw new Error(`duração inválida: "${tok}"`);
      return { midi: alt === '-' ? null : midiDe(alt!), dur };
    });
    const soma = figuras.reduce((s, f) => s + f.dur, 0);
    if (soma !== PASSOS_POR_COMPASSO) {
      throw new Error(`compasso ${i + 1} ("${c}") soma ${soma} passos, não ${PASSOS_POR_COMPASSO}`);
    }
    return figuras;
  });
}

/* ------------------------------------------------ o conjunto, por estilo

   Cada padrão cobre MEIO compasso (8 passos), e é repetido com o acorde
   daquela metade. Grau: r = raiz, t = terça, q = quinta, o = oitava. */

type Grau = 'r' | 't' | 'q' | 'o';

const BAIXOS: Record<Exclude<EstiloBaixo, 'nenhum'>, readonly (readonly [number, number, Grau])[]> = {
  // o baião: colcheia pontuada, colcheia pontuada, colcheia — o bumbo da zabumba
  baiao: [[0, 3, 'r'], [3, 3, 'o'], [6, 2, 'q']],
  marcha: [[0, 4, 'r'], [4, 4, 'q']],
  galope: [[0, 2, 'r'], [2, 2, 'o'], [4, 2, 'r'], [6, 2, 'o']],
  lento: [[0, 8, 'r']],
  passeio: [[0, 2, 'r'], [2, 2, 't'], [4, 2, 'q'], [6, 2, 't']],
};

const BATERIAS: Record<Exclude<EstiloBateria, 'nenhuma'>, readonly (readonly [number, Batida])[]> = {
  baiao: [[0, 'bumbo'], [2, 'chimbal'], [3, 'bumbo'], [4, 'caixa'], [6, 'chimbal']],
  rock: [[0, 'bumbo'], [2, 'chimbal'], [4, 'caixa'], [6, 'chimbal']],
  batalha: [[0, 'bumbo'], [1, 'chimbal'], [2, 'chimbal'], [3, 'bumbo'],
            [4, 'caixa'], [5, 'chimbal'], [6, 'bumbo'], [7, 'aberto']],
  suave: [[0, 'bumbo'], [4, 'chimbal']],
  marcha: [[0, 'bumbo'], [4, 'caixa'], [6, 'chimbal']],
};

/* a raiz do baixo mora entre mi 2 e ré# 3: nem grave demais, nem alto */
function raizBaixo(a: Acorde): number { return 40 + ((a.raiz - 4 + 12) % 12); }

function grauBaixo(a: Acorde, g: Grau): number {
  const r = raizBaixo(a);
  if (g === 'r') return r;
  if (g === 'o') return r + 12;
  if (g === 't') return r + a.intervalos[1]!;
  return r + a.intervalos[2]!;
}

/* as notas do acorde perto do dó central, para o arpejo */
function notasArpejo(a: Acorde): number[] {
  const base = 60 + a.raiz;
  const tons = a.intervalos.slice(0, 3).map((i) => base + i);
  return [...tons, base + 12];
}

/* "F G" → dois acordes, meio compasso cada; "C" → o mesmo nas duas metades */
function metades(compasso: string): [Acorde, Acorde] {
  const partes = compasso.trim().split(/\s+/);
  if (partes.length < 1 || partes.length > 2) throw new Error(`compasso de acordes inválido: "${compasso}"`);
  const a = acordeDe(partes[0]!);
  return [a, partes[1] ? acordeDe(partes[1]) : a];
}

/* --------------------------------------------------------- compilação */

function vozEscrita(texto: string, voz: Voz, compassos: number, notas: NotaTocada[]): void {
  const lida = lerVoz(texto);
  if (lida.length !== compassos) {
    throw new Error(`${voz} tem ${lida.length} compassos, os acordes têm ${compassos}`);
  }
  let passo = 0;
  for (const c of lida) {
    for (const f of c) {
      if (f.midi !== null) notas.push({ passo, dur: f.dur, freq: frequencia(f.midi), voz });
      passo += f.dur;
    }
  }
}

export function compilar(m: Musica): Compilada {
  const notas: NotaTocada[] = [];
  const batidas: GolpeBateria[] = [];
  const n = m.acordes.length;

  vozEscrita(m.melodia, 'melodia', n, notas);
  if (m.contracanto) vozEscrita(m.contracanto, 'contracanto', n, notas);

  const baixo = m.baixo && m.baixo !== 'nenhum' ? BAIXOS[m.baixo] : null;
  const bateria = m.bateria && m.bateria !== 'nenhuma' ? BATERIAS[m.bateria] : null;
  const arpejo = m.arpejo ?? 'nenhum';

  m.acordes.forEach((c, i) => {
    metades(c).forEach((a, meia) => {
      const inicio = i * PASSOS_POR_COMPASSO + meia * MEIO;
      if (baixo) {
        for (const [o, d, g] of baixo) {
          notas.push({ passo: inicio + o, dur: d, freq: frequencia(grauBaixo(a, g)), voz: 'baixo' });
        }
      }
      if (bateria) for (const [o, b] of bateria) batidas.push({ passo: inicio + o, batida: b });
      if (arpejo !== 'nenhum') {
        const tons = notasArpejo(a);
        if (arpejo === 'sobe') {
          for (let k = 0; k < MEIO; k++) {
            notas.push({ passo: inicio + k, dur: 1, freq: frequencia(tons[k % tons.length]!), voz: 'arpejo' });
          }
        } else {
          const ordem = [0, 1, 2, 1];
          for (let k = 0; k < 4; k++) {
            notas.push({ passo: inicio + k * 2, dur: 2, freq: frequencia(tons[ordem[k]!]!), voz: 'arpejo' });
          }
        }
      }
    });
  });

  notas.sort((a, b) => a.passo - b.passo);
  batidas.sort((a, b) => a.passo - b.passo);
  return { bpm: m.bpm, passos: n * PASSOS_POR_COMPASSO, vinheta: m.vinheta === true, notas, batidas };
}

/* quanto dura um passo (semicolcheia), em segundos */
export function duracaoPasso(bpm: number): number { return 60 / bpm / 4; }
