/* =========================================================================
   As músicas do jogo, e qual toca em cada lugar.

   Cada região tem a sua, com um sotaque: a Foz é um baião de beira-mar, a
   Mata anda em modo dórico, a Serra corre em galope, o Campo do Saci é
   forró em sol mixolídio, a Aldeia Tupã é elétrica, as Minas são pesadas,
   o Bairro da Cuca é menor harmônico e a Cidade do Sol brilha em lídio.

   Notação em partitura.ts. Puro: teste em partitura.test.ts.
   ========================================================================= */
import type { Musica } from './partitura.ts';
import { regiaoDoMapa } from '../data/mundo.ts';
import type { Tipo } from '../art/palette.ts';

export const MUSICAS = {
  /* ------------------------------------------------------ fora do mundo */
  titulo: {
    bpm: 104, baixo: 'marcha', bateria: 'rock', arpejo: 'colcheia',
    acordes: ['C', 'Am', 'F', 'G', 'C', 'Em', 'F G', 'C'],
    melodia: `g4 c5 e5:4 d5 c5 d5:4 | e5:6 c5:2 a4:8 | a4 c5 f5:4 e5 d5 c5:4 | d5:12 -:4 |
              g4 c5 e5:4 g5 f5 e5:4 | g5:6 e5:2 b4:8 | a4 c5 f5:4 g5 f5 d5:4 | c5:12 -:4`,
  },
  historia: {
    bpm: 84, baixo: 'lento', arpejo: 'sobe',
    acordes: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'C'],
    melodia: `e5:4 a5:4 g5:4 e5:4 | f5:6 e5:2 c5:8 | e5:4 g5:4 c6:6 b5:2 | a5:4 g5:4 d5:8 |
              c5:4 e5:4 a5:6 g5:2 | f5:4 e5:4 c5:8 | d5:4 g5:4 b5:4 a5:4 | g5:12 -:4`,
  },

  /* ------------------------------------------------------------ regiões */
  agua: {
    bpm: 96, baixo: 'baiao', bateria: 'baiao', arpejo: 'colcheia',
    acordes: ['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D'],
    melodia: `a4 d5 f#5:3 e5:1 d5 a4 b4:4 | g4 b4 d5:4 c#5 b4 g4:4 | f#4 a4 d5:3 e5:1 f#5:4 e5 d5 |
              e5:6 c#5:2 a4:8 | a4 d5 f#5:3 g5:1 a5:4 f#5 d5 | g5:3 f#5:1 e5 d5 b4:8 |
              c#5 e5 a5:4 g5 e5 c#5:4 | d5:12 -:4`,
  },
  planta: {
    bpm: 92, baixo: 'marcha', bateria: 'suave', arpejo: 'sobe',
    acordes: ['Am', 'D', 'Am', 'G', 'Am', 'D', 'F G', 'Am'],
    melodia: `e5:4 d5 e5 a4:8 | f#4 a4 d5:4 c5 b4 a4:4 | e5:4 g5 e5 d5 c5 a4:4 | b4 d5 g5:8 -:4 |
              a5:4 g5 e5 d5:4 c5:4 | f#5:4 e5 d5 a4:8 | c5 a4 f4:4 b4 d5 g4:4 | a4:12 -:4`,
  },
  fogo: {
    bpm: 124, baixo: 'galope', bateria: 'rock', arpejo: 'sobe',
    acordes: ['Em', 'C', 'D', 'Em', 'Em', 'F', 'D', 'Em'],
    melodia: `e5 e5:1 e5:1 g5 e5 b5:4 a5 g5 | g5:4 e5 c5 e5:4 -:4 | f#5 f#5:1 f#5:1 a5 f#5 d5:4 e5 f#5 |
              e5:12 -:4 | b4 b4:1 b4:1 e5 g5 b5:4 a5 g5 | a5:4 f5 c5 a4:4 -:4 |
              d5 f#5 a5:4 g5 f#5 d5:4 | e5:12 -:4`,
  },
  vento: {
    bpm: 130, baixo: 'baiao', bateria: 'baiao', arpejo: 'colcheia',
    acordes: ['G', 'F', 'G', 'D', 'G', 'F', 'C D', 'G'],
    melodia: `d5:1 e5:1 g5 g5 f5 g5 a5 g5:4 | f5 e5 c5 a4 c5:4 -:4 | d5:1 e5:1 g5 g5 f5 g5 b5 a5:4 |
              f#5:4 e5 d5 a4:8 | b5 a5 g5 f5 g5:4 d5:4 | c5 f5 a5:4 g5 f5 c5:4 |
              e5 g5 c6:4 a5 f#5 d5:4 | g5:12 -:4`,
  },
  raio: {
    bpm: 136, baixo: 'galope', bateria: 'rock', arpejo: 'sobe',
    acordes: ['Dm', 'Bb', 'C', 'Dm', 'Dm', 'Bb', 'C A7', 'Dm'],
    melodia: `a4 d5 f5 a5 g5:1 f5:1 e5 d5:4 | f5:4 d5 bb4 d5:8 | e5 g5 c6:4 bb5 a5 g5:4 | a5:12 -:4 |
              d6 c6 a5 f5 g5:1 a5:1 f5 d5:4 | bb5:4 a5 f5 d5:8 | c6 bb5 g5:4 a5 c#5 e5:4 | d5:12 -:4`,
  },
  terra: {
    bpm: 88, baixo: 'marcha', bateria: 'marcha', arpejo: 'colcheia',
    acordes: ['Cm', 'Ab', 'Bb', 'Cm', 'Cm', 'Fm', 'G', 'Cm'],
    melodia: `c5:4 eb5 g5 f5:4 eb5:4 | c5:4 ab4:4 c5:8 | d5:4 f5 bb5 ab5:4 f5:4 | g5:12 -:4 |
              g5:4 f5 eb5 d5:4 c5:4 | ab4:4 c5 f5 eb5:4 c5:4 | b4:4 d5 f5 g5:4 b4:4 | c5:12 -:4`,
  },
  sombra: {
    bpm: 80, baixo: 'lento', bateria: 'suave', arpejo: 'sobe',
    acordes: ['Am', 'E', 'Am', 'Dm', 'Am', 'F', 'E', 'Am'],
    melodia: `a4 c5 e5:4 d#5:4 e5:4 | g#4:4 b4 d5 f5:8 | e5 d5 c5 b4 a4:4 e4:4 | f4 a4 d5:8 -:4 |
              a5 g#5 a5:4 e5:4 c5:4 | f5:4 e5 d5 c5:8 | b4 g#4 e4:4 f4 g#4 b4:4 | a4:12 -:4`,
  },
  luz: {
    bpm: 112, baixo: 'passeio', bateria: 'rock', arpejo: 'sobe',
    acordes: ['F', 'G', 'Am', 'F', 'F', 'G', 'Bb C', 'F'],
    melodia: `c5 f5 a5:4 g5 f5 c5:4 | b4 d5 g5:4 f5 d5 b4:4 | c5 e5 a5:6 g5 e5:4 | f5:12 -:4 |
              a5 g5 f5 g5 a5:4 c6:4 | b5:4 a5 g5 d5:8 | d5 f5 bb5:4 c6 g5 e5:4 | f5:12 -:4`,
  },

  /* ------------------------------------------------------ lugares à parte */
  casa: {
    bpm: 90, baixo: 'marcha', bateria: 'suave', arpejo: 'colcheia',
    acordes: ['G', 'C', 'D', 'G'],
    melodia: `d5 b4 g4:4 a4 b4 d5:4 | e5:4 c5 e5 g5:8 | f#5:4 e5 d5 a4:4 c5:4 | b4:12 -:4`,
  },
  benzimento: {
    bpm: 76, baixo: 'lento', arpejo: 'sobe',
    acordes: ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Bb C', 'F'],
    melodia: `a4:4 c5:4 f5:8 | e5:4 d5:4 a4:8 | bb4:4 d5:4 f5:6 e5:2 | e5:8 g5:8 |
              a5:4 g5:4 f5:8 | f5:4 e5 d5 a4:8 | d5:4 f5:4 e5:4 c5:4 | f5:12 -:4`,
  },
  terreiro: {
    bpm: 140, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe',
    acordes: ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'C B7', 'Em'],
    melodia: `e5 -:1 e5:1 g5 -:1 g5:1 a5 b5 a5 g5 | f#5 g5 e5:4 b4:4 e5:4 | c5 e5 g5:4 c6:4 b5:4 |
              a5:4 f#5:4 d5:8 | e6 d6 b5 g5 a5 g5 e5:4 | g5:4 f#5 e5 b4:8 |
              c5 e5 g5:4 f#5 d#5 b4:4 | e5:12 -:4`,
  },

  /* ------------------------------------------------------------ batalhas */
  selvagem: {
    bpm: 150, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe',
    acordes: ['Am', 'F', 'G', 'E', 'Am', 'F', 'G', 'E'],
    melodia: `a5 e5 a5 c6 b5 a5 e5:4 | f5 a5 c6:4 a5 f5 c5:4 | d5 g5 b5:4 a5 g5 d5:4 | e5:4 g#5:4 b5:4 e6:4 |
              c6 b5 a5 e5 c5 e5 a5:4 | a5:4 f5 c5 f5:4 a5:4 | g5:4 d5 b4 d5:4 g5:4 | g#5:4 e5:4 b4:8`,
  },
  treinador: {
    bpm: 156, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe',
    acordes: ['Dm', 'C', 'Bb', 'A', 'Dm', 'C', 'Bb A', 'Dm'],
    melodia: `d5 f5 a5 d6 c6 a5 f5:4 | e5 g5 c6:4 bb5 a5 g5:4 | f5 bb5 d6:4 c6 bb5 f5:4 | e5:4 c#5:4 a4:4 e5:4 |
              a5 a5:1 a5:1 d6:4 c6 a5 f5:4 | g5 c6 e6:4 d6 c6 g5:4 | f5 bb5 d6:4 c#6 a5 e5:4 | d5:12 -:4`,
  },
  mestre: {
    bpm: 164, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe',
    acordes: ['Em', 'F', 'D', 'Em', 'C', 'D', 'B7', 'Em'],
    melodia: `e5 b5 e6 b5 g5 b5 e5:4 | f5 a5 c6:4 b5 a5 f5:4 | f#5 a5 d6:4 c6 a5 f#5:4 | g5:4 b5:4 e6:8 |
              e6 d6 c6 g5 e5 g5 c6:4 | d6 c6 a5 f#5 d5 f#5 a5:4 | b5:4 a5 f#5 d#5:4 b4:4 | e5:12 -:4`,
  },
  vitoria: {
    bpm: 120, baixo: 'marcha', bateria: 'rock', arpejo: 'colcheia',
    acordes: ['C', 'F', 'G', 'C'],
    melodia: `g5 g5:1 g5:1 g5 e5 c6:8 | a5 c6 a5 f5 a5:8 | g5 b5 d6 b5 g5:4 f5:4 | e5:4 g5:4 c6:8`,
  },

  /* ------------------------------------------------------------ vinhetas */
  cura: {
    bpm: 120, baixo: 'lento', vinheta: true,
    acordes: ['C', 'G C'],
    melodia: 'c5 e5 g5 c6:6 -:4 | b5 g5 d5:4 c6:8',
  },
  item: {
    bpm: 140, baixo: 'lento', vinheta: true,
    acordes: ['C'],
    melodia: 'c5 e5 g5 c6 g5 c6:6',
  },
  medalha: {
    bpm: 110, baixo: 'marcha', vinheta: true,
    acordes: ['C F', 'G C'],
    melodia: 'c5 e5 g5 a5 c6:4 a5:4 | b5 g5 d6:4 c6:8',
  },
  captura: {
    bpm: 130, baixo: 'marcha', vinheta: true,
    acordes: ['C', 'G C'],
    melodia: 'g4 c5 e5 g5 e5 g5 c6:4 | b5 d6 g5:4 c6:8',
  },
  nivel: {
    bpm: 150, vinheta: true,
    acordes: ['F'],
    melodia: 'c5 f5 a5 c6:10',
  },
  derrota: {
    bpm: 70, baixo: 'lento', vinheta: true,
    acordes: ['Am', 'E Am'],
    melodia: 'e5:4 c5:4 a4:8 | g#4:4 b4:4 a4:8',
  },
} satisfies Record<string, Musica>;

export type IdMusica = keyof typeof MUSICAS;

export function musica(id: IdMusica): Musica { return MUSICAS[id]; }

/* ------------------------------------------------------ o que toca onde */

const DA_REGIAO: Record<Tipo, IdMusica> = {
  agua: 'agua', planta: 'planta', fogo: 'fogo', vento: 'vento',
  raio: 'raio', terra: 'terra', sombra: 'sombra', luz: 'luz',
};

/* Terreiro (todas as salas) e a arena do torneio têm a música de desafio;
   a casa de benzimento, a calma; loja e casa de gente, a de dentro de casa;
   o resto — caminho, cidade, caverna — toca a música da região. */
export function musicaDoMapa(id: string): IdMusica {
  if (id.startsWith('terreiro') || id === 'arenaDourada') return 'terreiro';
  if (id.startsWith('benzimento')) return 'benzimento';
  if (/^(loja|casa)[A-Z]/.test(id) || id === 'forjaFornalha') return 'casa';
  const r = regiaoDoMapa(id);
  return r ? DA_REGIAO[r.tipo] : 'agua';
}
