/* =========================================================================
   As músicas do jogo.

   Música de fundo só toca nas CUTSCENES: o mundo e a batalha ficam com os
   efeitos, e a música vira trilha de cinema — cada tema é o tom de um
   momento da história, e cada tomada de cutscene diz qual quer
   (`musica` em data/cutscenes.ts). Fora delas, só as vinhetas curtas
   (cura, medalha, item, nível, captura, derrota).

   Notação em partitura.ts. Puro: teste em partitura.test.ts.
   ========================================================================= */
import type { Musica } from './partitura.ts';

export const MUSICAS = {
  /* ------------------------------------------------ os temas da história */

  /* a avó na beira do fogo: acalanto, sem bateria, só o arpejo e o baixo */
  fogueira: {
    bpm: 72, baixo: 'lento', arpejo: 'colcheia',
    acordes: ['Am', 'F', 'C', 'G', 'Am', 'F', 'E', 'Am'],
    melodia: `e5:4 d5 c5 a4:8 | a4 c5 f5:6 e5 c5:4 | e5:4 g5:4 e5 d5 c5:4 | d5:6 b4:2 g4:8 |
              e5:4 d5 c5 a4:4 c5:4 | f5:4 e5 d5 c5:8 | b4:4 g#4:4 e4:4 g#4:4 | a4:12 -:4`,
  },
  /* cada rio tem dona, cada vento tem nome: o encanto, em fá lídio */
  encantados: {
    bpm: 70, baixo: 'lento', arpejo: 'sobe',
    acordes: ['F', 'G', 'F', 'G', 'Dm', 'G', 'Bb', 'C'],
    melodia: `c5:4 f5:4 a5:6 g5:2 | b5:8 a5:4 g5:4 | a5:4 c6:4 a5:4 f5:4 | g5:6 b4:2 d5:8 |
              f5:4 a5:4 d6:8 | b5:4 a5:4 g5:4 d5:4 | f5:4 bb5:4 a5:4 f5:4 | g5:12 -:4`,
  },
  /* a Companhia Mata-Seca: ostinato grave, marcha de trator, diminuto */
  companhia: {
    bpm: 88, baixo: 'galope', bateria: 'marcha',
    acordes: ['Dm', 'Dm', 'Bb', 'A', 'Dm', 'Bdim', 'Gm', 'A'],
    melodia: `d4:4 -:2 d4:2 f4:4 e4:4 | d4:4 -:2 d4:2 a4:4 g#4:4 | bb4:6 a4:2 g4:4 f4:4 | e4:4 c#4:4 a3:8 |
              d5:4 -:2 d5:2 f5:4 e5:4 | f5:4 d5 b4 g#4:8 | g4:4 bb4:4 d5:4 c#5:4 | e5:4 c#5:4 a4:8`,
  },
  /* as oito medalhas no céu: esperança, marcha que cresce */
  trilha: {
    bpm: 100, baixo: 'marcha', bateria: 'marcha', arpejo: 'colcheia',
    acordes: ['D', 'A', 'Bm', 'G', 'D', 'G', 'A', 'D'],
    melodia: `a4 d5 f#5:4 a5:6 f#5:2 | e5:4 c#5 e5 a5:8 | b5:6 a5:2 f#5:4 d5:4 | g5:4 b5:4 d6:8 |
              a5:6 f#5:2 d5:4 a5:4 | b5:4 d6:4 g5:8 | a5:4 g5 f#5 e5:4 c#5:4 | d5:12 -:4`,
  },
  /* a sala da Dona Firmina: modinha, casa e juízo */
  firmina: {
    bpm: 80, baixo: 'passeio', arpejo: 'colcheia',
    acordes: ['F', 'Dm', 'Gm', 'C', 'F', 'Bb', 'Gm C', 'F'],
    melodia: `c5:4 f5:4 e5 f5 a5:4 | a5:4 f5:4 d5:8 | bb4:4 d5:4 g5:6 f5:2 | e5:8 g5:4 c5:4 |
              c5:4 f5:4 a5:4 c6:4 | bb5:6 a5:2 f5:4 d5:4 | g5:4 bb5:4 e5:4 g5:4 | f5:12 -:4`,
  },
  /* o Zeca Redemoinho: forró atrevido, de quem fala o dobro */
  zeca: {
    bpm: 132, baixo: 'baiao', bateria: 'baiao', arpejo: 'colcheia',
    acordes: ['G', 'F', 'G', 'D', 'G', 'F', 'C D', 'G'],
    melodia: `g5:1 g5:1 -:2 b5 g5 f5 d5 g5:4 | a5 f5 c5 f5 a5:4 -:4 | g5:1 g5:1 -:2 b5 d6 c6 b5 g5:4 |
              f#5:4 a5 f#5 d5:8 | d6 b5 g5 b5 d6:4 b5:4 | c6 a5 f5 a5 c6:4 -:4 |
              e5 g5 c6:4 d6 c6 a5:4 | g5:12 -:4`,
  },
  /* o tempo de antigamente: saudade que termina em maior */
  lembranca: {
    bpm: 66, baixo: 'lento', arpejo: 'sobe',
    acordes: ['Am', 'Dm', 'G', 'C', 'F', 'Dm', 'E', 'A'],
    melodia: `e5:4 a5:4 g5 f5 e5:4 | d5:6 f5:2 a5:8 | g5:4 f5 e5 d5:4 b4:4 | c5:8 e5:8 |
              a5:4 g5 f5 c5:8 | d5:4 f5:4 a5:4 g5:4 | g#5:6 f5:2 e5:4 d5:4 | c#5:12 -:4`,
  },
  /* o porto e o Mestre: baião de pescador, de quem não vende o barco */
  porto: {
    bpm: 100, baixo: 'baiao', bateria: 'baiao', arpejo: 'colcheia',
    acordes: ['D', 'D', 'G', 'A', 'D', 'Bm', 'G A', 'D'],
    melodia: `f#5:3 e5:1 d5 a4 d5:4 f#5:4 | a5:3 g5:1 f#5 e5 d5:8 | b4 d5 g5:4 f#5 e5 d5:4 | c#5:4 e5:4 a5:8 |
              a5:3 f#5:1 d5 f#5 a5:4 d6:4 | b5:4 a5 f#5 d5:8 | g5 b5 d6:4 c#6 a5 e5:4 | d5:12 -:4`,
  },
  /* de noite, as redes no varal — e um gorro espiando de longe */
  redes_noite: {
    bpm: 76, baixo: 'lento', arpejo: 'sobe',
    acordes: ['Em', 'C', 'Em', 'B7', 'Em', 'C', 'Am B7', 'Em'],
    melodia: `b4:4 e5:4 g5:4 -:4 | e5 -:2 g5 -:2 c6:4 b5:4 | g5:4 f#5 e5 b4:8 | d#5:4 f#5:4 a5 -:2 b5:4 |
              e6 -:2 d6:1 c6:1 b5 g5:4 e5:4 | c6:4 g5:4 e5:8 | a5 c6 e5:4 f#5 a5 d#5:4 | e5:12 -:4`,
  },
  /* o mar ferve e a cobra de fogo desenrola: perigo, em mi frígio */
  boitata: {
    bpm: 144, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe',
    acordes: ['Em', 'F', 'Em', 'F', 'C', 'D', 'F', 'B7'],
    melodia: `e5 f5 e5 b4 e5:4 g5:4 | f5 a5 c6:4 b5 a5 f5:4 | e5:1 e5:1 g5 b5 e6 d6 b5 g5:4 | f5:4 a5:4 c6:4 f6:4 |
              e6:4 c6 g5 e5:4 c5:4 | f#5:4 a5 d6 c6:4 a5:4 | a5:4 c6 f5 a5:4 c6:4 | b5:4 a5 f#5 d#5:4 b4:4`,
  },
  /* Sacizinho: travessura saltitante, cromática, com assobio no alto */
  saci: {
    bpm: 140, baixo: 'marcha', bateria: 'rock',
    acordes: ['C', 'C', 'F', 'G', 'C', 'A7', 'Dm G', 'C'],
    melodia: `g5:1 -:1 e5:1 -:1 g5:1 -:1 c6 b5:1 -:1 a5:1 -:1 g5:4 |
              e5:1 f5:1 f#5:1 g5:1 -:4 c6:1 -:1 g5:1 -:1 e5:4 |
              a5:1 -:1 f5:1 -:1 a5:1 -:1 c6 a5 f5 c5:4 |
              b5:1 -:1 d6:1 -:1 g6 -:2 f5:1 f#5:1 g5:6 |
              c6:1 -:1 g5:1 -:1 e5:1 -:1 g5 c6:1 -:1 e6:1 -:1 c6:4 |
              c#6 a5 e5 g5 -:4 c#5:4 |
              d5:1 -:1 f5:1 -:1 a5 -:2 b4:1 -:1 d5:1 -:1 g5:4 |
              c6 g5:1 e5:1 c5:4 -:8`,
  },
  /* o Contador de Bichos: curiosidade miúda, no passo de quem anota */
  contador: {
    bpm: 96, baixo: 'passeio', arpejo: 'colcheia',
    acordes: ['G', 'D', 'Em', 'C', 'G', 'D', 'C D', 'G'],
    melodia: `d5 g5 f#5 g5 a5:4 g5:4 | f#5 a5 d5:4 e5 f#5 a5:4 | g5 e5 b4:4 e5 g5 b5:4 | c6:4 b5 a5 g5:4 e5:4 |
              d5:1 e5:1 g5 b5:4 a5 g5 d5:4 | f#5 e5 d5 e5 f#5:4 a5:4 | e5 g5 c6:4 a5 f#5 d5:4 | g5:4 d5:4 g4:8`,
  },
  /* o Terreiro de Água e a Iara-Mãe: solene, devagar, como a maré */
  terreiro_agua: {
    bpm: 64, baixo: 'lento', arpejo: 'sobe',
    acordes: ['Cm', 'Ab', 'Eb', 'Bb', 'Cm', 'Fm', 'G', 'Cm'],
    melodia: `g4:4 c5:4 eb5:8 | c5:4 eb5:4 ab5:8 | g5:6 f5:2 eb5:4 bb4:4 | d5:8 f5:8 |
              eb5:4 g5:4 c6:8 | ab5:4 g5 f5 c5:8 | b4:4 d5:4 f5:4 g5:4 | c5:12 -:4`,
  },
  /* a partida: a estrada, a água a atravessar, o horizonte */
  viagem: {
    bpm: 108, baixo: 'passeio', bateria: 'suave', arpejo: 'colcheia',
    acordes: ['G', 'C', 'G', 'D', 'Em', 'C', 'A7 D', 'G'],
    melodia: `b4 d5 g5:6 f#5 e5 d5 | e5:4 g5:4 c6:6 b5:2 | b5:4 g5 d5 g5:4 b5:4 | a5:8 f#5:4 d5:4 |
              e5 g5 b5:6 a5 g5:4 | e5 g5 c6:6 b5 a5:4 | g5 e5 c#5:4 d5 f#5 a5:4 | g5:12 -:4`,
  },

  /* ---------------------------------------------- Região 2: a Mata */

  /* o Seu Elias, mateiro: baião manso em lá dórico, de quem anda sem pressa */
  mata: {
    bpm: 92, baixo: 'baiao', bateria: 'suave', arpejo: 'colcheia',
    acordes: ['Am', 'D', 'Am', 'D', 'C', 'G', 'D', 'Am'],
    melodia: `a4 c5 e5:4 d5 e5 a4:4 | f#5:4 e5 d5 a4:8 | c5 e5 a5:4 g5 e5 d5:4 | f#5:6 e5:2 d5:8 |
              e5 g5 c6:4 b5 g5 e5:4 | d5 g5 b5:6 a5:2 g5:4 | a5:4 f#5 e5 d5:4 f#5:4 | e5:12 -:4`,
  },
  /* Caiporinha no porco-do-mato: trote miúdo, cromático, de quem some no mato */
  caipora: {
    bpm: 132, baixo: 'galope', bateria: 'baiao',
    acordes: ['Em', 'Em', 'Am', 'B7', 'Em', 'C', 'Am B7', 'Em'],
    melodia: `e5:1 -:1 e5:1 -:1 g5 e5:1 -:1 b4:1 -:1 e5:4 g5 |
              f#5:1 g5:1 f#5:1 e5:1 d#5 e5 -:4 b4:4 |
              a5:1 -:1 a5:1 -:1 c6 a5:1 -:1 e5:1 -:1 a5:4 c6 |
              b5 a5 g5 f#5 d#5:4 b4:4 |
              e6:1 -:1 b5:1 -:1 g5 e5 b4:1 c5:1 c#5:1 d5:1 d#5:4 |
              e5 g5 c6:4 b5:1 -:1 g5:1 -:1 e5:4 |
              a5 c6 e5:4 f#5 a5 d#5:4 |
              e5 -:2 e4 -:2 e5:4 -:4`,
  },
  /* o Curupira da grota: mistério em ré dórico, com o assobio lá no alto */
  curupira: {
    bpm: 84, baixo: 'lento', bateria: 'suave', arpejo: 'sobe',
    acordes: ['Dm', 'C', 'Dm', 'C', 'Bb', 'C', 'Dm', 'A7'],
    melodia: `a5:6 g5:2 f5:4 d5:4 | e5:4 g5:4 c6:8 | d6:4 c6 a5 f5:4 a5:4 | g5:12 e5:4 |
              f5:4 bb5:4 d6:6 c6:2 | e6:8 c6:4 g5:4 | f5:4 a5:4 d6:4 a5:4 | c#6:8 e5:4 a4:4`,
  },
  /* o Terreiro de Raiz e a Tiê: devagar, como raiz que cresce */
  terreiro_raiz: {
    bpm: 60, baixo: 'lento', arpejo: 'colcheia',
    acordes: ['Gm', 'Eb', 'Bb', 'F', 'Gm', 'Cm', 'D', 'Gm'],
    melodia: `d5:4 g5:4 bb5:8 | g5:4 bb5:4 eb5:8 | f5:6 d5:2 bb4:8 | c5:4 f5:4 a5:8 |
              bb5:4 a5 g5 d5:8 | eb5:4 g5:4 c6:6 bb5:2 | a5:4 f#5:4 d5:4 f#5:4 | g5:12 -:4`,
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
