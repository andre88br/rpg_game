/* =========================================================================
   O CÍRCULO DOURADO — o torneio das oito medalhas, até o fim.

   A chegada à praça e à arena (os `aoChegar` de cada uma), o Zeca pela
   última vez e o Anhangá apresentados antes da luta, e a vitória sobre o
   campeão: as oito medalhas acendem, a comporta da Foz racha, a mata volta
   e a avó termina a história na beira do fogo — aí vêm os créditos.
   ========================================================================= */
import type { Ator, Roteiro } from '../cutscenes.ts';
import * as O from '../../art/fundos/circulo.ts';
import {
  trilhaAurora, mataAntiga, mataDepois, mataAntes, noiteFogueira, ceuTitulo, redemoinhoLembranca,
} from '../../art/cenas.ts';
import { arcoMedalhas } from './comum.ts';

/* os oito donos de terreiro, enfileirados na praça */
const MESTRES: readonly Ator[] = ['mariana', 'tie', 'bras', 'perere', 'guaraci', 'ubirajara', 'morgana', 'solano']
  .map((pessoa, i): Ator => ({ figura: { pessoa, dir: 'baixo' }, x: 10 + i * 29, y: 92, aparece: 0.3 + i * 0.3 }));

/* ------------------------------------------------- a chegada à praça */
const CIRCULO: Roteiro = [
  { // a praça redonda, no meio do mundo
    musica: 'circulo',
    fundo: O.pracaCirculo,
    atores: [{ figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 96, por: 2.6 } }],
    legendas: [
      'No meio do mundo, onde as oito estradas se encontram, fica uma praça redonda de pedra dourada.',
      'Gente das oito regiões veio ver: pescador, mateiro, tropeiro, catador, garimpeiro...',
    ],
  },
  { // a coroação de vinte anos atrás
    musica: 'lembranca',
    fundo: O.circuloAntigo,
    atores: [{ figura: { pessoa: 'anhanga', dir: 'baixo' }, x: 112, y: 84 }],
    legendas: [
      { quem: 'PORTEIRO', texto: 'Faz vinte anos que o Anhangá ganhou o Círculo. Desde então, ninguém chegou aqui com as oito.' },
      { quem: 'PORTEIRO', texto: 'Desde então o mato foi falando cada vez mais baixo. Ele ficou esperando alguém que escutasse o mato de novo.' },
    ],
  },
  { // os oito donos de terreiro, cada um da sua região
    musica: 'circulo',
    fundo: O.pracaCirculo,
    atores: MESTRES,
    legendas: [
      'E os oito donos de terreiro vieram também, cada um da sua região, pra ver quem juntou as medalhas.',
    ],
  },
  { // o letreiro do torneio
    fundo: O.pracaCirculo,
    atores: [{ figura: { jogador: true, dir: 'cima' }, x: 112, y: 96 }],
    legendas: [
      { quem: 'PORTEIRO', texto: 'Lá dentro são seis lutas seguidas, e ninguém benze ninguém. Leva garrafada, {crianca}.' },
    ],
    titulo: ['O CÍRCULO DOURADO', 'O TORNEIO DAS OITO MEDALHAS'],
  },
];

/* ---------------------------------------------- a entrada na arena */

/* os quatro Guardiões, cada um com um bicho de cada lado do que guarda */
const GUARDIOES: readonly Ator[] = [
  { figura: { pessoa: 'tie', dir: 'baixo' }, x: 36, y: 70, aparece: 0.3 },
  { figura: { criatura: 'iaraMae' }, x: 12, y: 80, aparece: 0.3, balanco: { amp: 1, periodo: 2 } },
  { figura: { pessoa: 'guarda', dir: 'baixo' }, x: 74, y: 70, aparece: 0.9 },
  { figura: { criatura: 'mulaSemCabeca' }, x: 56, y: 80, aparece: 0.9, balanco: { amp: 1, periodo: 2 } },
  { figura: { pessoa: 'mariana', dir: 'baixo' }, x: 150, y: 70, aparece: 1.5 },
  { figura: { criatura: 'saci' }, x: 150, y: 80, aparece: 1.5, balanco: { amp: 2, periodo: 1 } },
  { figura: { pessoa: 'anhanga', dir: 'baixo' }, x: 188, y: 70, aparece: 2.1 },
  { figura: { criatura: 'jaci' }, x: 196, y: 80, aparece: 2.1, balanco: { amp: 1, periodo: 2 } },
];

const ARENA: Roteiro = [
  { // as seis câmaras
    musica: 'circulo',
    fundo: O.camaraArena,
    atores: [{ figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 96, por: 2.6 } }],
    legendas: [
      'A arena do Círculo tem seis câmaras, uma em cima da outra. Cada porta só abre com a vitória.',
      'Sair ou cair recomeça do começo. E a plateia não vai embora até ver o fim.',
    ],
  },
  { // os quatro Guardiões
    fundo: O.camaraArena,
    atores: GUARDIOES,
    legendas: [
      'Quatro Guardiões vigiam as primeiras câmaras. Iracema, da água e da mata. Itaberá, do fogo e da pedra.',
      'Ybytu, do vento e do trovão. Jacira, da sombra e da luz. Depois, só o rival... e o campeão.',
    ],
  },
  { // o letreiro
    fundo: O.camaraArena,
    atores: [{ figura: { jogador: true, dir: 'cima' }, x: 112, y: 96 }],
    legendas: [],
    titulo: ['A ARENA DOURADA', 'SEIS LUTAS SEGUIDAS'],
  },
];

/* --------------------------------------------- o Zeca, pela última vez

   O pai e o Mestre do Porto vieram de barco, e estão na arquibancada. E o
   Zeca, que queria provar que era o melhor desde o redemoinho, agora só
   quer uma luta boa. */
const ZECA_FINAL: Roteiro = [
  { // no meio do carpete
    musica: 'zeca',
    fundo: O.camaraArena,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 64 },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.6 } },
    ],
    legendas: [
      'Na quinta câmara, no meio do carpete vermelho, o rival de sempre espera de braços cruzados.',
      { quem: 'ZECA', texto: 'Oito medalhas cada um. Nove vezes eu te barrei. Essa é a última, e é pra valer!' },
    ],
  },
  { // o pai e o Mestre na arquibancada
    musica: 'porto',
    fundo: O.camaraArena,
    atores: [
      { figura: { pessoa: 'paiZeca', dir: 'baixo' }, x: 30, y: 34, aparece: 0.3 },
      { figura: { pessoa: 'pescador', dir: 'baixo' }, x: 50, y: 34, aparece: 0.6 },
      { figura: { pessoa: 'zeca', dir: 'esq' }, x: 112, y: 64 },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Olha lá na arquibancada: meu pai e o Mestre do Porto. Vieram de barco, como prometeram.' },
      { quem: 'ZECA', texto: 'Ele me disse que tá orgulhoso. Do meu Saci, do meu Lobisomem... de mim.' },
    ],
  },
  { // o redemoinho, lá no começo
    musica: 'lembranca',
    fundo: redemoinhoLembranca,
    atores: [
      { figura: { criatura: 'sacizinho' }, x: 146, y: 60, balanco: { amp: 5, periodo: 0.45 } },
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 10, y: 96, ate: { x: 142, y: 96, de: 0.6, por: 4 } },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Desde o redemoinho, quando eu tirei o gorro do Sacizinho, eu queria provar que era o melhor.' },
      { quem: 'ZECA', texto: 'Hoje eu só quero uma luta boa. A melhor de todas. Contra você.' },
    ],
  },
  { // frente a frente, e o letreiro
    musica: 'zeca',
    fundo: O.camaraArena,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 64, ate: { x: 112, y: 72, de: 0.3, por: 0.6 } },
      { figura: { criatura: 'saci' }, x: 140, y: 58, aparece: 0.6, balanco: { amp: 3, periodo: 0.8 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Vem, {crianca}. Mostra tudo o que a trilha te ensinou!' },
    ],
    titulo: ['ZECA', 'A ÚLTIMA VEZ'],
  },
];

/* ----------------------------------------------------- o Anhangá

   O campeão de vinte anos: guarda da mata, ficou esperando enquanto os
   Encantados dormiam, região por região. */
const NO_FIM_DO_CARPETE: readonly Ator[] = [
  { figura: { pessoa: 'anhanga', dir: 'baixo' }, x: 112, y: 62 },
];

const ANHANGA: Roteiro = [
  { // a plateia faz silêncio
    musica: 'anhanga',
    fundo: O.camaraArena,
    atores: [...NO_FIM_DO_CARPETE, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.6 } }],
    legendas: [
      'Na última câmara, a plateia inteira faz silêncio de uma vez.',
      'No fim do carpete, de coroa e capa escura, o campeão se levanta pela primeira vez em vinte anos.',
    ],
  },
  { // quando ele era guarda da mata
    musica: 'encantados',
    fundo: mataAntiga,
    atores: [
      { figura: { criatura: 'curupira' }, x: 150, y: 76, alfa: 0.7, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { pessoa: 'anhanga', dir: 'dir' }, x: 60, y: 94 },
    ],
    legendas: [
      { quem: 'ANHANGÁ', texto: 'Antes de ser campeão, eu era guarda da mata. Contava os bichos um por um, feito o Contador da Foz.' },
      { quem: 'ANHANGÁ', texto: 'Quando a Companhia chegou, os Encantados foram dormindo, região por região.' },
      { quem: 'ANHANGÁ', texto: 'E eu fiquei aqui no Círculo, esperando.' },
    ],
  },
  { // as oito medalhas
    musica: 'trilha',
    fundo: trilhaAurora,
    atores: arcoMedalhas,
    legendas: [
      { quem: 'ANHANGÁ', texto: 'Oito medalhas. Oito mestres dizendo: aqui tem quem responda. É isso que acorda quem dorme.' },
      { quem: 'ANHANGÁ', texto: 'Mas o Círculo não se ganha com medalha. Se ganha com o que o mato te ensinou no caminho.' },
    ],
  },
  { // frente a frente, e o letreiro
    musica: 'anhanga',
    fundo: O.camaraArena,
    atores: [...NO_FIM_DO_CARPETE, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 }],
    legendas: [
      { quem: 'ANHANGÁ', texto: 'Vinte anos esperando alguém que escutasse o mato de novo. Mostra o que ele te disse!' },
    ],
    titulo: ['ANHANGÁ', 'O CAMPEÃO DO CÍRCULO'],
  },
];

/* ------------------------------------------------------ o campeão

   Toca depois da fala de derrota do Anhangá, antes dos créditos: a arena
   vem abaixo, o campeão se revela o próprio Anhangá, o guarda da mata, as
   oito medalhas acendem juntas, a comporta da Foz racha e a
   Mãe-d'Água acorda, a mata volta, e a avó fecha a história na beira do
   fogo — o mesmo fogo da abertura. */
const CAMPEAO: Roteiro = [
  { // a arena vem abaixo
    musica: 'campeao',
    fundo: O.camaraArena,
    depois: { fundo: O.camaraFesta, de: 0.4, por: 1.6 },
    atores: [
      ...NO_FIM_DO_CARPETE,
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
      { figura: { inicial: true }, x: 70, y: 90, balanco: { amp: 6, periodo: 0.6, salto: true } },
    ],
    legendas: [
      'Quando a última luta acaba, a arena inteira vem abaixo: papel picado, tambor e grito das oito regiões.',
      { quem: 'ANHANGÁ', texto: 'O mato respondeu a você, {crianca}. O Círculo Dourado tem {g:uma nova campeã|um novo campeão}.' },
    ],
  },
  { // a coroa cai: o campeão é o próprio Anhangá
    musica: 'encantados',
    fundo: O.camaraFesta,
    atores: [
      { figura: { pessoa: 'anhanga', dir: 'baixo' }, x: 112, y: 62, some: 2 },
      { figura: { criatura: 'anhanga' }, x: 112, y: 56, alfa: 0.75, aparece: 2.2, balanco: { amp: 2, periodo: 1.6 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    legendas: [
      'O campeão tira a coroa. Por um instante, no lugar dele, está um veado branco de olhos de fogo.',
      { quem: 'ANHANGÁ', texto: 'Eu sou o guarda da mata. O primeiro Anhangá. Vesti gente pra esperar aqui no meio do mundo.' },
      { quem: 'ANHANGÁ', texto: 'Bicho não briga com papel carimbado. Precisava de gente que respondesse pela terra. E você respondeu.' },
      { quem: 'ANHANGÁ', texto: 'O Doutor Ferraz já foi embora. Agora é a vez de quem dorme.' },
    ],
  },
  { // as oito medalhas acendem juntas
    musica: 'encantados',
    fundo: trilhaAurora,
    atores: arcoMedalhas,
    legendas: [
      'Longe dali, no mesmo instante, as oito medalhas acendem juntas, uma em cada terreiro.',
      'E quem dormia debaixo do mato começa, enfim, a acordar.',
    ],
  },
  { // a comporta racha, e a Mãe-d'Água acorda
    fundo: O.rioLivre,
    atores: [
      { figura: { criatura: 'iaraMae' }, x: 60, y: 76, aparece: 0.6, ate: { x: 60, y: 48, de: 0.6, por: 2.4 }, balanco: { amp: 2, periodo: 2.2 } },
      { figura: { criatura: 'piragua' }, x: 170, y: 80, aparece: 1.4, balanco: { amp: 10, periodo: 1.3, salto: true } },
    ],
    legendas: [
      'Na Foz, a comporta da Companhia racha ao meio, e o rio passa por cima, cantando.',
      'A Mãe-d\'Água acorda. E lá no terreiro, a Dona Mariana sente a água entrar sozinha, com a maré.',
    ],
  },
  { // a mata volta
    fundo: mataDepois,
    depois: { fundo: mataAntes, de: 0.8, por: 4 },
    atores: [
      { figura: { criatura: 'curupira' }, x: 40, y: 70, aparece: 3, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { criatura: 'caipora' }, x: 160, y: 72, aparece: 3.4, balanco: { amp: 3, periodo: 0.5, salto: true } },
    ],
    legendas: [
      'Na mata, na serra, no campo e nas minas, onde havia X vermelho, brota muda nova.',
      'Sem o Doutor Ferraz, a Companhia recolhe as estacas e não volta mais.',
      'Terra que responde não se compra.',
    ],
  },
  { // a avó termina a história na beira do fogo
    musica: 'fogueira',
    fundo: noiteFogueira,
    atores: [
      { figura: { peca: 'fogueira' }, x: 108, y: 88 },
      { figura: { pessoa: 'avo', dir: 'dir' }, x: 78, y: 90 },
      { figura: { pessoa: 'crianca', dir: 'esq' }, x: 146, y: 92 },
      { figura: { criatura: 'sacizinho' }, x: 186, y: 50, alfa: 0.4, aparece: 1.6, balanco: { amp: 3, periodo: 1.8 } },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 120, y: 92 }],
    legendas: [
      'E é assim, diz a avó, que se conta a história da criança que escutou o mato de novo.',
      'Hoje, quem souber escutar ouve o rio, o vento e a brasa respondendo. Todos eles. Todo dia.',
    ],
  },
  { // o letreiro, como na abertura
    musica: 'campeao',
    fundo: ceuTitulo,
    atores: [
      { figura: { jogador: true, dir: 'baixo' }, x: 112, y: 96, aparece: 0.6 },
      { figura: { inicial: true }, x: 70, y: 90, aparece: 1.0, balanco: { amp: 2, periodo: 2 } },
      { figura: { criatura: 'sacizinho' }, x: 140, y: 88, aparece: 1.4, balanco: { amp: 3, periodo: 1.2, fase: 0.7 } },
    ],
    legendas: [],
    titulo: ['ENCANTADOS', '{g:A CAMPEÃ|O CAMPEÃO} DO CÍRCULO'],
  },
];

export const ROTEIROS_CIRCULO: Record<string, Roteiro> = {
  circulo: CIRCULO,
  arena: ARENA,
  zeca_final: ZECA_FINAL,
  anhanga: ANHANGA,
  campeao: CAMPEAO,
};
