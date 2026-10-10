/* =========================================================================
   As músicas do jogo.

   Três famílias:
   - os temas da HISTÓRIA, trilha de cinema das cutscenes: cada um é o tom
     de um momento, e cada tomada diz qual quer (`musica` em
     data/cutscenes.ts);
   - os temas do MUNDO e da BATALHA, em laço, mais baixos: um por região ao
     ar livre, mais casa, terreiro e breu, e selvagem, treinador e chefe —
     quem escolhe é audio/temas.ts;
   - as VINHETAS curtas (cura, medalha, item, nível, captura, vitória,
     derrota), que interrompem e devolvem a música da vez.

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

  /* ---------------------------------------------- Região 3: a Serra */

  /* a tropa subindo a serra: baião de tropeiro em lá mixolídio */
  serra: {
    bpm: 112, baixo: 'baiao', bateria: 'baiao', arpejo: 'colcheia',
    acordes: ['A', 'G', 'A', 'D', 'A', 'G', 'E7', 'A'],
    melodia: `e5 a5 c#6:4 b5 a5 g5:4 | g5:4 f#5 e5 d5:8 | e5 a5 c#6 e6:4 d6 c#6 a5 | f#5:6 e5:2 d5:8 |
              c#5 e5 a5:4 g5 e5 c#5:4 | d5 g5 b5:6 a5:2 g5:4 | g#5:4 b5:4 e6:4 d6 b5 | a5:12 -:4`,
  },
  /* a forja do Ferreiro: marcha de martelo em ré menor */
  forja: {
    bpm: 96, baixo: 'marcha', bateria: 'marcha', arpejo: 'colcheia',
    acordes: ['Dm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'Gm A', 'Dm'],
    melodia: `d5:4 a4:4 d5 f5 a5:4 | a5:3 g5:1 f5 e5 d5:8 | g5:4 d5:4 bb5:6 a5:2 | a5:4 c#5:4 e5:8 |
              d6:4 a5 f5 d5:4 f5:4 | f5 bb5 d6:6 c6:2 bb5:4 | bb5:4 g5:4 e5 g5 c#6:4 | d6:12 -:4`,
  },
  /* a Mula-sem-Cabeça: galope de casco de fogo, em lá menor */
  mula: {
    bpm: 152, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe',
    acordes: ['Am', 'E', 'F', 'E', 'Am', 'Dm', 'F E', 'Am'],
    melodia: `a5:1 -:1 a5:1 -:1 e5 a5 c6 b5 a5:4 | e5:1 -:1 e5:1 -:1 g#5 b5 e6:4 d6 b5 |
              f5:1 -:1 f5:1 -:1 a5 c6 f6:4 e6 c6 | b5:4 g#5:4 e5:8 |
              c6 b5 a5 e5 a5:4 c6:4 | d6 c6 a5 f5 d5:4 f5:4 | a5 c6 f5 a5 g#5:4 e5:4 | a5 e5 a4:4 -:8`,
  },
  /* o Terreiro de Brasa e o Brás: solene, como brasa que não apaga */
  terreiro_brasa: {
    bpm: 62, baixo: 'lento', arpejo: 'colcheia',
    acordes: ['Em', 'C', 'Am', 'B', 'Em', 'Am', 'B7', 'Em'],
    melodia: `b4:4 e5:4 g5:8 | e5:4 g5:4 c6:8 | a5:6 g5:2 e5:4 c5:4 | d#5:8 f#5:8 |
              g5:4 b5:4 e6:8 | c6:4 b5 a5 e5:8 | d#5:4 f#5:4 a5:4 b5:4 | e5:12 -:4`,
  },

  /* ------------------------------------------- Região 4: o Campo do Saci */

  /* o campo aberto: xote de vento solto, em sol maior */
  campo: {
    bpm: 104, baixo: 'passeio', bateria: 'suave', arpejo: 'colcheia',
    acordes: ['G', 'C', 'G', 'D', 'Em', 'C', 'D7', 'G'],
    melodia: `d5 g5 b5:4 a5 g5 d5:4 | e5:4 g5 c6:6 b5:2 a5:2 | b5:3 a5:1 g5 d5 g5:4 b5:4 | a5:6 f#5:2 d5:8 |
              e5 g5 b5:4 a5 g5 e5:4 | c6:4 b5 a5 g5:4 e5:4 | d5 f#5 a5:4 c6:4 b5 a5 | g5:12 -:4`,
  },
  /* a Matinta: o assobio comprido lá no alto, em si menor */
  matinta: {
    bpm: 76, baixo: 'lento', bateria: 'suave', arpejo: 'sobe',
    acordes: ['Bm', 'G', 'Bm', 'F#', 'Em', 'G', 'F#7', 'Bm'],
    melodia: `f#6:6 -:2 b5:4 d6:4 | d6:4 b5 g5 e5:8 | f#6:6 -:2 d6:4 b5:4 | a#5:8 c#6:8 |
              g5:4 b5:4 e6:8 | d6:4 b5 g5 d5:8 | c#6:4 e6:4 a#5:4 f#5:4 | b5:12 -:4`,
  },
  /* o Terreiro do Rodamoinho e o Pererê: vento que gira, em ré dórico */
  terreiro_vento: {
    bpm: 70, baixo: 'lento', arpejo: 'sobe',
    acordes: ['Dm', 'G', 'Dm', 'G', 'Bb', 'C', 'A7', 'Dm'],
    melodia: `a4:4 d5:4 f5:8 | g5:4 b5:4 d6:8 | c6:6 a5:2 f5:4 d5:4 | e5:8 b5:8 |
              d6:4 bb5 a5 f5:8 | e5:4 g5:4 c6:6 bb5:2 | a5:4 c#6:4 e6:4 g5:4 | d5:12 -:4`,
  },

  /* --------------------------------------------- Região 5: a Aldeia Tupã */

  /* os tambores da campina: baque forte, em mi menor */
  tambores: {
    bpm: 120, baixo: 'marcha', bateria: 'batalha',
    acordes: ['Em', 'D', 'Em', 'D', 'C', 'D', 'B7', 'Em'],
    melodia: `e5:4 g5 a5 b5:4 a5 g5 | f#5:4 d5:4 a5:8 | e5 e5 g5 a5 b5:4 d6:4 | a5:6 f#5:2 d5:8 |
              e6:4 d6 b5 g5:4 e5:4 | f#5 a5 d6:6 c6:2 a5:4 | d#5:4 f#5:4 a5:4 b5:4 | e5 -:2 e5 -:2 e5:8`,
  },
  /* o Relampo do cume: tempestade ligeira, em ré menor */
  relampo: {
    bpm: 160, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe',
    acordes: ['Dm', 'Bb', 'C', 'A', 'Dm', 'Bb', 'Gm A', 'Dm'],
    melodia: `d6:1 a5:1 f5:1 a5:1 d6:2 -:2 d6:1 e6:1 f6:2 e6:2 d6:2 | bb5:4 f5:4 d5:4 f5:4 |
              c6:1 g5:1 e5:1 g5:1 c6:2 -:2 c6:1 d6:1 e6:2 d6:2 c6:2 | c#6:4 a5:4 e5:8 |
              f6:2 e6:2 d6:2 a5:2 f5:4 a5:4 | bb5:2 d6:2 f6:4 e6:2 d6:2 bb5:4 |
              g5:2 bb5:2 d6:4 c#6:2 e6:2 a5:4 | d6:4 a5:2 f5:2 d5:4 -:4`,
  },
  /* o Terreiro do Trovão e o Guaraci: quem escuta o céu, em mi dórico */
  terreiro_trovao: {
    bpm: 66, baixo: 'lento', arpejo: 'colcheia',
    acordes: ['Em', 'A', 'Em', 'A', 'G', 'D', 'B7', 'Em'],
    melodia: `b4:4 e5:4 g5:8 | a5:4 c#6:4 e6:8 | d6:6 b5:2 g5:4 e5:4 | c#6:8 a5:8 |
              b5:4 d6:4 g5:8 | a5:4 f#5 d5 a5:8 | d#6:4 b5:4 f#5:4 a5:4 | e5:12 -:4`,
  },

  /* ------------------------------------------ Região 6: as Minas da Caipora */

  /* o garimpo de bateia: baião de trabalho, em ré mixolídio */
  garimpo: {
    bpm: 100, baixo: 'baiao', bateria: 'baiao', arpejo: 'colcheia',
    acordes: ['D', 'C', 'D', 'A', 'G', 'C', 'A7', 'D'],
    melodia: `a4 d5 f#5:4 e5 d5 a4:4 | g5:4 e5 c5 e5:8 | f#5 a5 d6:4 c6 a5 f#5:4 | e5:6 c#5:2 a4:8 |
              b4 d5 g5:4 a5 b5 d6:4 | c6:4 g5 e5 c5:8 | c#5:4 e5:4 g5:4 a5:4 | d5:12 -:4`,
  },
  /* o Mapinguari: passo pesado no fundo da cava, em dó menor */
  mapinguari: {
    bpm: 72, baixo: 'marcha', bateria: 'marcha',
    acordes: ['Cm', 'Ab', 'Cm', 'G', 'Fm', 'Ab', 'G7', 'Cm'],
    melodia: `c4:4 -:2 c4:2 eb4:4 d4:4 | c4:4 ab3:4 c4:8 | g4:4 -:2 g4:2 bb4:4 ab4:4 | g4:8 d4:8 |
              f4:4 ab4:4 c5:8 | eb5:4 c5 ab4 eb4:8 | d4:4 f4:4 b4:4 d5:4 | c5:4 g4 eb4 c4:8`,
  },
  /* o Terreiro da Pedra e o Ubirajara: devagar, como pedra que assenta */
  terreiro_pedra: {
    bpm: 64, baixo: 'lento', arpejo: 'sobe',
    acordes: ['F#m', 'D', 'A', 'E', 'F#m', 'Bm', 'C#7', 'F#m'],
    melodia: `c#5:4 f#5:4 a5:8 | f#5:4 a5:4 d6:8 | c#6:6 a5:2 e5:4 c#5:4 | b4:8 e5:8 |
              a5:4 c#6:4 f#6:8 | d6:4 c#6 b5 f#5:8 | f5:4 g#5:4 b5:4 c#6:4 | f#5:12 -:4`,
  },

  /* --------------------------------------------- Região 7: o Bairro da Cuca */

  /* a rua do bairro de noite: passo miúdo e cromático, de quem anda no escuro */
  bairro: {
    bpm: 92, baixo: 'passeio', bateria: 'suave', arpejo: 'colcheia',
    acordes: ['Dm', 'A7', 'Dm', 'Gm', 'Bb', 'Gm', 'A7', 'Dm'],
    melodia: `d5 -:2 f5 -:2 a5:4 g#5:4 | a5:4 g5 f5 e5:4 c#5:4 | d5 -:2 f5 -:2 a5 d6 c#6 d6 | bb5:6 a5:2 g5:8 |
              f5 bb5 d6:4 c6 bb5 f5:4 | g5:4 bb5 a5 g5:8 | e5:4 g5:4 c#6:4 e6:4 | d6:4 a5 f5 d5:8`,
  },
  /* a Cuca do sótão: o acalanto de "dorme, neném", assombrado, em lá menor */
  cuca: {
    bpm: 84, baixo: 'lento', arpejo: 'sobe',
    acordes: ['Am', 'Dm', 'E', 'Am', 'F', 'Dm', 'E7', 'Am'],
    melodia: `e5:4 e5:4 c5:8 | d5:4 f5:4 a5:8 | g#5:4 e5:4 b4:8 | c5:4 b4 a4 e5:8 |
              f5:4 a5:4 c6:8 | a5:4 f5 d5 a4:8 | b4:4 d5:4 g#5:4 b5:4 | a5:12 -:4`,
  },
  /* o Terreiro do Breu e a Morgana: o escuro que escuta, em sol menor */
  terreiro_breu: {
    bpm: 60, baixo: 'lento', arpejo: 'sobe',
    acordes: ['Gm', 'Eb', 'Cm', 'D', 'Gm', 'Cm', 'D7', 'Gm'],
    melodia: `g4:4 bb4:4 d5:8 | eb5:4 g5:4 bb5:8 | c6:6 bb5:2 g5:4 eb5:4 | f#5:8 a5:8 |
              bb5:4 a5 g5 d5:8 | eb5:4 g5:4 c6:8 | d6:4 c6 a5 f#5:4 d5:4 | g5:12 -:4`,
  },

  /* --------------------------------------------- Região 8: a Cidade do Sol */

  /* a Cidade do Sol: marcha clara de meio-dia, em dó maior */
  sol: {
    bpm: 112, baixo: 'marcha', bateria: 'marcha', arpejo: 'colcheia',
    acordes: ['C', 'F', 'C', 'G', 'Am', 'F', 'G7', 'C'],
    melodia: `c5 e5 g5:4 c6:6 b5:2 | a5:4 f5 a5 c6:8 | g5 e5 c5 e5 g5:4 c6:4 | b5:6 a5:2 g5:8 |
              a5 c6 e6:4 d6 c6 a5:4 | f5 a5 c6:6 a5:2 f5:4 | g5:4 b5:4 d6:4 f6:4 | e6:4 c6 g5 c6:8`,
  },
  /* a Estrela-d'Alva: a última estrela da noite, lá no alto, em mi maior */
  estrela: {
    bpm: 72, baixo: 'lento', bateria: 'suave', arpejo: 'sobe',
    acordes: ['E', 'C#m', 'A', 'B', 'E', 'G#m', 'F#m B', 'E'],
    melodia: `g#5:4 b5:4 e6:8 | c#6:4 e6:4 g#6:8 | f#6:6 e6:2 c#6:4 a5:4 | d#6:8 f#6:8 |
              e6:4 b5 g#5 e5:8 | d#6:4 b5:4 g#5:8 | a5:4 c#6:4 b5:4 d#6:4 | e6:12 -:4`,
  },
  /* o Terreiro da Aurora e o Solano: majestoso, como o sol que nasce */
  terreiro_aurora: {
    bpm: 76, baixo: 'lento', bateria: 'suave', arpejo: 'colcheia',
    acordes: ['D', 'Bm', 'G', 'A', 'D', 'G', 'Em A', 'D'],
    melodia: `d5:4 f#5:4 a5:8 | b5:4 a5 f#5 d5:8 | g5:4 b5:4 d6:8 | c#6:6 b5:2 a5:8 |
              f#5 a5 d6:4 e6:4 f#6:4 | g6:4 f#6 e6 d6:8 | e6:4 c#6:4 a5:4 c#6:4 | d6:12 -:4`,
  },

  /* ------------------------------------------- o Círculo Dourado */

  /* a praça do torneio: fanfarra das oito regiões, em si bemol */
  circulo: {
    bpm: 120, baixo: 'marcha', bateria: 'marcha', arpejo: 'colcheia',
    acordes: ['Bb', 'Eb', 'Bb', 'F', 'Gm', 'Eb', 'F7', 'Bb'],
    melodia: `f5 bb5 d6:4 f6:6 d6:2 | eb6:4 bb5 g5 eb5:8 | d5 f5 bb5 d6 f6:4 d6:4 | c6:6 a5:2 f5:8 |
              g5 bb5 d6:4 g6:4 f6:4 | eb6:4 d6 c6 bb5:4 g5:4 | a5:4 c6:4 eb6:4 c6:4 | bb5:4 f5 d5 bb4:8`,
  },
  /* o Anhangá, campeão do Círculo: a luta final, em mi menor */
  anhanga: {
    bpm: 138, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe',
    acordes: ['Em', 'C', 'D', 'B7', 'Em', 'Am', 'B7', 'Em'],
    melodia: `e5:2 g5:2 b5:4 e6:4 d6:2 b5:2 | c6:4 g5:4 e5:4 g5:4 | d6:2 c6:2 b5:2 a5:2 f#5:4 a5:4 | d#6:4 b5:4 f#5:4 b4:4 |
              e6:2 -:2 e6:2 d6:2 b5:4 g5:4 | a5:2 c6:2 e6:4 d6:2 c6:2 a5:4 | b5:4 d#6:4 f#6:4 a6:4 | g6:4 f#6:2 d#6:2 e6:8`,
  },
  /* o campeão: o hino da trilha inteira, em sol maior */
  campeao: {
    bpm: 96, baixo: 'marcha', bateria: 'marcha', arpejo: 'colcheia',
    acordes: ['G', 'D', 'Em', 'C', 'G', 'C', 'D7', 'G'],
    melodia: `d5 g5 b5:4 d6:6 b5:2 | a5:4 f#5 a5 d6:8 | e6:4 d6 b5 g5:4 b5:4 | c6:6 b5:2 a5:4 g5:4 |
              b5 d6 g6:6 f#6:2 e6:4 | e6:4 c6 e6 g6:8 | f#6:4 e6:4 d6:4 c6:4 | b5:4 a5 f#5 g5:8`,
  },

  /* ------------------------------------------------- o mundo, andando

     Tocam em laço enquanto se anda: mais longos que os da história (16
     compassos, para o laço não cansar) e mais baixos (`ganho`), por baixo
     dos efeitos e das conversas. Quem escolhe qual toca é audio/temas.ts. */

  /* a Foz: baião praiano em ré maior, de rede balançando */
  mundoFoz: {
    bpm: 104, baixo: 'baiao', bateria: 'suave', arpejo: 'colcheia', ganho: 0.7,
    acordes: ['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D', 'Bm', 'G', 'D', 'A', 'G', 'A', 'D', 'D'],
    melodia: `a4 d5 f#5:4 e5 d5 a4:4 | b4 d5 g5:6 f#5:2 e5:4 | f#5:4 a5:4 f#5 e5 d5:4 | e5:6 c#5:2 a4:8 |
              a4 d5 f#5:4 a5 f#5 d6:4 | b5:4 a5 g5 d5:8 | c#5 e5 a5:4 g5 e5 c#5:4 | d5:12 -:4 |
              f#5 b5 d6:4 c#6 b5 f#5:4 | g5:4 b5:4 d6:6 b5:2 | a5:4 f#5 d5 a4:4 d5:4 | e5:6 g5:2 c#5:8 |
              b4 d5 g5:4 b5 a5 g5:4 | a4 c#5 e5:4 a5 g5 e5:4 | f#5:4 e5 d5 a4 d5 f#5:4 | d5:12 -:4`,
  },
  /* a Mata: toada em lá dórico, o arpejo subindo como cipó */
  mundoMata: {
    bpm: 84, baixo: 'lento', bateria: 'suave', arpejo: 'sobe', ganho: 0.7,
    acordes: ['Am', 'D', 'Am', 'D', 'C', 'G', 'Am', 'Am', 'F', 'C', 'G', 'Am', 'Dm', 'G', 'Am', 'E7'],
    melodia: `e5:4 a5:4 c6:6 b5:2 | a5:4 f#5:4 d5:8 | c5 e5 a5:4 g5 e5 c5:4 | d5:6 e5:2 f#5:8 |
              g5:4 e5 g5 c6:8 | b5:4 a5 g5 d5:8 | e5:4 c5:4 a4:8 | -:4 e5 a5 c6:4 b5:4 |
              a5:6 g5:2 f5:4 c5:4 | e5:4 g5:4 c6:8 | d6:4 b5 g5 d5:4 g5:4 | e5:12 -:4 |
              f5:4 a5:4 d6:6 c6:2 | b5:4 g5 a5 b5:8 | c6:4 b5 a5 e5:4 c5:4 | b4:4 d5:4 g#5:8`,
  },
  /* a Serra: marcha de tropeiro em sol mixolídio, de casco no cascalho */
  mundoSerra: {
    bpm: 96, baixo: 'marcha', bateria: 'marcha', arpejo: 'colcheia', ganho: 0.7,
    acordes: ['G', 'F', 'G', 'F', 'C', 'G', 'F', 'G', 'Em', 'F', 'G', 'C', 'G', 'F', 'D', 'G'],
    melodia: `d5 g5 b5:4 a5 g5 d5:4 | c5 f5 a5:4 g5 f5 c5:4 | b4 d5 g5:6 f5:2 d5:4 | c5:4 a4:4 f4:8 |
              e5 g5 c6:4 b5 g5 e5:4 | d5:6 b4:2 g4:8 | a4 c5 f5:4 a5:4 g5:4 | g5:12 -:4 |
              e5:4 g5:4 b5:6 a5:2 | a5:4 f5 g5 a5:8 | b5:4 d6:4 b5 a5 g5:4 | e5:12 -:4 |
              d5 g5 b5:4 d6 b5 g5:4 | f5 a5 c6:4 a5 f5 c5:4 | d5:4 f#5:4 a5:4 c6:4 | b5:4 g5:4 g4:8`,
  },
  /* o Campo do Saci: xote em fá maior, de vento a favor */
  mundoCampo: {
    bpm: 100, baixo: 'passeio', bateria: 'suave', arpejo: 'colcheia', ganho: 0.7,
    acordes: ['F', 'Bb', 'F', 'C', 'F', 'Bb', 'C', 'F', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C', 'F', 'F'],
    melodia: `c5 f5 a5:4 g5 f5 c5:4 | d5:4 f5 bb5:6 a5:2 g5:2 | a5:3 g5:1 f5 c5 f5:4 a5:4 | g5:6 e5:2 c5:8 |
              f5 a5 c6:4 a5 f5 c5:4 | bb5:4 a5 g5 f5:4 d5:4 | e5 g5 c6:4 bb5:4 g5:4 | f5:12 -:4 |
              a5:4 f5 a5 d6:6 c6:2 | bb5:4 a5 g5 f5:8 | c6:3 a5:1 f5 a5 c6:4 f6:4 | e6:6 d6:2 c6:8 |
              d6 c6 bb5:4 a5 g5 f5:4 | e5 g5 c6:4 bb5 g5 e5:4 | f5:4 a5 g5 f5 c5 f5:4 | f5:12 -:4`,
  },
  /* a Aldeia Tupã: tambor e escala pentatônica em mi, sem arpejo */
  mundoTupa: {
    bpm: 108, baixo: 'marcha', bateria: 'baiao', ganho: 0.7,
    acordes: ['Em', 'D', 'Em', 'D', 'Em', 'G', 'D', 'Em', 'C', 'D', 'Em', 'Em', 'Am', 'D', 'Em', 'Em'],
    melodia: `e5:3 e5:1 g5 a5 b5:4 a5 g5 | a5:4 b5 a5 d5:8 | e5:3 e5:1 g5 a5 b5:4 d6:4 | b5 a5 g5 a5 d5:8 |
              e6:4 d6 b5 a5:4 g5:4 | g5:4 b5 d6 b5:8 | a5:4 g5 a5 d5:8 | e5:12 -:4 |
              g5:3 g5:1 e5 g5 a5:4 g5:4 | a5:3 a5:1 g5 a5 b5:4 d6:4 | e6:4 d6:4 b5:8 | -:4 b4 d5 e5:8 |
              a5:4 g5 e5 a5:8 | d6:4 b5 a5 d5:8 | g5 a5 b5:4 a5 g5 e5:4 | e5:12 -:4`,
  },
  /* as Minas: passeio grave em ré menor, de quem desce de candeia na mão */
  mundoMinas: {
    bpm: 92, baixo: 'passeio', bateria: 'suave', arpejo: 'colcheia', ganho: 0.7,
    acordes: ['Dm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'A', 'F', 'C', 'Dm', 'A', 'Bb', 'Gm', 'A', 'Dm'],
    melodia: `d5:4 f5 a5 d5:4 a4:4 | f5:4 e5 d5 a4:8 | g4 bb4 d5:4 g5:6 f5:2 | e5:6 c#5:2 a4:8 |
              a4 d5 f5:4 e5 d5 a5:4 | bb5:4 a5 g5 f5:8 | g5:4 d5 bb4 g4:8 | a4:12 -:4 |
              c5 f5 a5:4 c6:6 a5:2 | g5:4 e5 c5 g4:8 | f5:4 d5:4 a5:8 | c#6:6 b5:2 a5:8 |
              d6:4 bb5 f5 d5:4 f5:4 | g5:4 bb5 a5 g5:8 | e5 g5 c#6:4 e5:4 a4:4 | d5:12 -:4`,
  },
  /* o Bairro da Cuca: toada de mistério em mi frígio, sem bateria */
  mundoCuca: {
    bpm: 80, baixo: 'lento', arpejo: 'sobe', ganho: 0.7,
    acordes: ['Em', 'F', 'Em', 'F', 'Am', 'G', 'F', 'Em', 'Dm', 'Em', 'F', 'G', 'Am', 'F', 'E', 'E'],
    melodia: `e5:4 f5:4 g5:6 f5:2 | e5:4 c5:4 a4:8 | b4 e5 g5:4 b5:6 a5:2 | g5:4 f5 e5 f5:8 |
              a5:4 c6:4 e6:6 d6:2 | d6:4 b5 g5 d5:8 | c6:4 a5 f5 c5:4 f5:4 | e5:12 -:4 |
              d5 f5 a5:4 g5 f5 d5:4 | e5 g5 b5:4 a5 g5 e5:4 | f5:4 a5:4 c6:6 b5:2 | d6:6 c6:2 b5:8 |
              c6:4 b5 a5 e5:8 | f5:4 e5 d5 c5:8 | b4:4 e5:4 g#5:8 | f5:4 e5:4 e4:8`,
  },
  /* a Cidade do Sol: galope luminoso em lá maior */
  mundoSol: {
    bpm: 120, baixo: 'galope', bateria: 'baiao', arpejo: 'colcheia', ganho: 0.7,
    acordes: ['A', 'E', 'A', 'D', 'A', 'F#m', 'D', 'E', 'D', 'E', 'C#m', 'F#m', 'D', 'E', 'A', 'A'],
    melodia: `e5 a5 c#6:4 b5 a5 e5:4 | g#5:4 b5:4 e6:6 d6:2 | c#6:4 a5 e5 a5:4 c#6:4 | d6:6 c#6:2 b5:4 a5:4 |
              e5 a5 c#6:4 e6:4 c#6:4 | f#5 a5 c#6:4 a5:4 f#5:4 | d5 f#5 a5:4 d6:4 a5:4 | b5:12 -:4 |
              a5:4 f#5 a5 d6:8 | e6:4 d6 c#6 b5:8 | c#6:4 g#5 e5 c#5:4 e5:4 | f#5:6 a5:2 c#6:8 |
              d6 c#6 b5 a5 f#5:4 d5:4 | e5 g#5 b5:4 e6:4 d6:4 | c#6:4 a5:4 e5:4 a5:4 | a5:12 -:4`,
  },
  /* o Círculo Dourado e a estrada até ele: marcha solene em si bemol */
  mundoCirculo: {
    bpm: 96, baixo: 'marcha', bateria: 'marcha', arpejo: 'colcheia', ganho: 0.7,
    acordes: ['Bb', 'F', 'Gm', 'Eb', 'Bb', 'F', 'Eb', 'F', 'Gm', 'Dm', 'Eb', 'Bb', 'Eb', 'F', 'Bb', 'Bb'],
    melodia: `f5:4 bb5:4 d6:6 c6:2 | c6:4 a5 f5 c5:8 | d5 g5 bb5:4 a5 g5 d5:4 | eb5:6 g5:2 bb5:8 |
              bb5:4 d6:4 f6:6 d6:2 | c6:4 a5:4 f5:8 | g5 bb5 eb6:4 d6 c6 bb5:4 | a5:12 -:4 |
              g5:4 bb5:4 d6:6 c6:2 | a5:4 f5 a5 d6:8 | eb6:4 d6 c6 bb5:4 g5:4 | f5:12 -:4 |
              g5 bb5 eb6:4 g6:4 f6:4 | f6:4 eb6 d6 c6:8 | d6:4 c6 bb5 f5:4 d5:4 | bb5:12 -:4`,
  },

  /* a tela de título: toada de beira de fogueira em lá menor, a avó
     começando a contar — devagar, com o arpejo subindo feito fumaça */
  titulo: {
    bpm: 82, baixo: 'passeio', arpejo: 'sobe', ganho: 0.7,
    acordes: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E'],
    melodia: `a4:4 c5:2 e5:2 a5:6 g5:2 | f5:4 e5:2 d5:2 c5:8 | e5:2 g5:2 c6:4 b5:2 a5:2 g5:4 | d5:6 e5:2 g5:8 |
              a5:4 c6:4 b5:2 a5:2 e5:4 | f5:2 a5:2 c6:6 b5:2 a5:4 | d5:2 f5:2 a5:4 g5:2 f5:2 e5:4 | g#5:6 b5:2 e5:8`,
  },
  /* dentro de casa: modinha baixinha em dó, sem bateria */
  casa: {
    bpm: 76, baixo: 'passeio', arpejo: 'colcheia', ganho: 0.6,
    acordes: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G'],
    melodia: `e5:4 g5:4 c6:6 b5:2 | a5:4 e5:4 c5:8 | f5 a5 c6:4 a5 f5 c5:4 | d5:6 g5:2 b5:8 |
              c6:4 b5 a5 g5:4 e5:4 | a5:4 c6 b5 a5:8 | f5 a5 d6:4 c6:4 a5:4 | b5:6 a5:2 g5:8`,
  },
  /* dentro do terreiro e da arena: tenso, em ré menor, o baixo galopando */
  terreiro: {
    bpm: 88, baixo: 'galope', bateria: 'suave', arpejo: 'sobe', ganho: 0.7,
    acordes: ['Dm', 'Bb', 'Dm', 'A', 'Gm', 'Dm', 'A', 'A'],
    melodia: `d5:4 -:2 d5:2 f5:4 a5:4 | bb5:4 a5 g5 f5:8 | d6:4 -:2 d6:2 c6:4 a5:4 | c#6:6 bb5:2 a5:8 |
              g5:4 bb5:4 d6:4 bb5:4 | a5:4 f5:4 d5:8 | e5 g5 bb5:4 a5 g5 e5:4 | c#5:8 a4:8`,
  },
  /* no breu (caverna, casarão): quase só baixo e arpejo, uma nota de vez em quando */
  breu: {
    bpm: 64, baixo: 'lento', arpejo: 'sobe', ganho: 0.6,
    acordes: ['Am', 'F', 'Am', 'E', 'Dm', 'Am', 'F', 'E'],
    melodia: `-:8 e5:8 | c5:12 -:4 | -:8 a5:4 g5:4 | g#5:12 -:4 |
              -:8 f5:8 | e5:12 -:4 | -:8 c6:4 a5:4 | b5:12 -:4`,
  },

  /* ---------------------------------------------------------- batalha */

  /* bicho do mato: corrida curta em mi menor */
  batalhaSelvagem: {
    bpm: 152, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe', ganho: 0.85,
    acordes: ['Em', 'C', 'D', 'B7', 'Em', 'C', 'Am', 'B7'],
    melodia: `e5:1 -:1 e5:1 -:1 g5 b5 e6:4 d6 b5 | c6:4 g5 e5 c6:4 b5 g5 |
              d6:1 -:1 d6:1 -:1 a5 f#5 d6:4 e6 f#6 | d#6:4 b5:4 f#5:4 a5:4 |
              g5 b5 e6:4 g6 f#6 e6:4 | e6 d6 c6 b5 g5:4 e5:4 | a5 c6 e6:4 d6 c6 a5:4 | b5:4 a5:4 f#5 d#5 b4:4`,
  },
  /* treinador na estrada: sol menor, de quem quer mostrar serviço */
  batalhaTreinador: {
    bpm: 144, baixo: 'galope', bateria: 'batalha', arpejo: 'colcheia', ganho: 0.85,
    acordes: ['Gm', 'Eb', 'F', 'D', 'Gm', 'Bb', 'Cm', 'D7'],
    melodia: `g5:3 g5:1 bb5 d6 g6:4 f6 d6 | eb6:4 d6 c6 bb5:4 g5:4 | f5:3 f5:1 a5 c6 f6:4 eb6 c6 | d6:4 a5:4 f#5:8 |
              g5 bb5 d6 g6 f6:4 d6:4 | f6 d6 bb5 f5 bb5:4 d6:4 | eb6 d6 c6 g5 eb5:4 c6:4 | d6:4 c6 a5 f#5:4 d5:4`,
  },
  /* dono de terreiro, rival, guardião, campeão e bicho-chefe: dó menor, no limite */
  batalhaChefe: {
    bpm: 160, baixo: 'galope', bateria: 'batalha', arpejo: 'sobe', ganho: 0.9,
    acordes: ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Fm', 'Ab', 'G7'],
    melodia: `c6:1 -:1 c6:1 -:1 g5:1 -:1 c6:1 -:1 eb6:4 d6 c6 | ab5:4 c6:4 eb6:6 d6:2 |
              bb5:1 -:1 bb5:1 -:1 f5:1 -:1 bb5:1 -:1 d6:4 c6 bb5 | b5:4 d6:4 g6:8 |
              g6 f6 eb6 d6 c6:4 g5:4 | ab5 c6 f6:4 eb6 c6 ab5:4 | eb6:4 c6 ab5 eb6:4 g6:4 | f6:4 d6:4 b5 g5 f5:4`,
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
  /* venceu a luta: fanfarra curta em dó */
  vitoria: {
    bpm: 150, baixo: 'marcha', vinheta: true,
    acordes: ['C', 'G C'],
    melodia: 'g5 g5 g5 c6:6 e6:4 | d6 c6 b5 d6 c6:8',
  },
  derrota: {
    bpm: 70, baixo: 'lento', vinheta: true,
    acordes: ['Am', 'E Am'],
    melodia: 'e5:4 c5:4 a4:8 | g#4:4 b4:4 a4:8',
  },
} satisfies Record<string, Musica>;

export type IdMusica = keyof typeof MUSICAS;

export function musica(id: IdMusica): Musica { return MUSICAS[id]; }
