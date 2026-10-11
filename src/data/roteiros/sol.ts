/* =========================================================================
   REGIÃO 8 — a Cidade do Sol. A última: o Oráculo vê as oito medalhas e a
   sala da Companhia com um X vermelho em cada região; o Zeca relembra o
   paredão da Rota da Foz; e o Solano manda a criança ao Círculo Dourado,
   onde o Anhangá espera há vinte anos.
   ========================================================================= */
import type { Ator, Roteiro } from '../cutscenes.ts';
import * as S from '../../art/fundos/sol.ts';
import { trilhaAurora, paredaoRota, barcoAmanhecer, fozEstacas } from '../../art/cenas.ts';
import { arcoMedalhas } from './comum.ts';

/* ------------------------------------------- a visão do Oráculo */
const NA_BACIA: readonly Ator[] = [
  { figura: { pessoa: 'oraculo', dir: 'esq' }, x: 166, y: 76 },
  { figura: { jogador: true, dir: 'dir' }, x: 58, y: 80 },
];

const ORACULO: Roteiro = [
  { // a mão no espelho d'água
    musica: 'sol',
    fundo: S.casaOraculo,
    atores: NA_BACIA,
    legendas: [
      "O Oráculo mergulha a mão no espelho d'água, e a casa inteira se enche de luz.",
      { quem: 'ORÁCULO', texto: 'Três respostas certas. Agora o sol te deve uma visão, {crianca}. Olha na água.' },
    ],
  },
  { // as oito medalhas no céu da trilha
    musica: 'trilha',
    fundo: trilhaAurora,
    atores: arcoMedalhas,
    legendas: [
      { quem: 'ORÁCULO', texto: 'Oito terreiros, oito medalhas. Cada uma é um mestre dizendo: aqui tem quem responda.' },
      { quem: 'ORÁCULO', texto: 'Você já leva sete. A oitava mora aqui, com o Solano, no alto da cidade.' },
    ],
  },
  { // a sala da Companhia
    musica: 'companhia',
    fundo: S.escritorioCompanhia,
    atores: [{ figura: { pessoa: 'ferraz', dir: 'cima' }, x: 112, y: 100 }],
    legendas: [
      { quem: 'ORÁCULO', texto: 'Vejo também a sala da Companhia: um mapa enorme na parede, com um X vermelho em cada região.' },
      { quem: 'ORÁCULO', texto: 'E vejo quem risca os X: o Doutor Ferraz. A sala fica aqui mesmo, na praça baixa da cidade.' },
      { quem: 'ORÁCULO', texto: 'Papel carimbado diz que a terra é deles. Mas a terra não lê papel. Vai lá e mostra isso a ele.' },
    ],
  },
  { // de volta à bacia, a conta
    musica: 'sol',
    fundo: S.casaOraculo,
    atores: NA_BACIA,
    legendas: [
      { quem: 'ORÁCULO', texto: 'Quando as oito se juntarem no Círculo Dourado, quem dorme debaixo do mato vai acordar.' },
      { quem: 'ORÁCULO', texto: 'Acendi uma conta da sua guia, {crianca}. E toma, que visão boa se paga.' },
    ],
  },
];

/* ------------------------------------- o Doutor Ferraz, vencido

   O ato final contra a Companhia: depois da luta no escritório, o mapa dos
   X rasga na parede, as estacas saem da praia da Foz e o gerente vai
   embora de lancha. O que ainda dorme só acorda no Círculo. */
const FERRAZ: Roteiro = [
  { // o mapa dos X rasga na parede
    musica: 'companhia',
    fundo: S.escritorioCompanhia,
    atores: [
      { figura: { pessoa: 'ferraz', dir: 'esq' }, x: 150, y: 96 },
      { figura: { jogador: true, dir: 'dir' }, x: 74, y: 100 },
    ],
    legendas: [
      'O Doutor Ferraz cai sentado na cadeira. O carimbo rola da mesa e some debaixo da estante.',
      { quem: 'DOUTOR FERRAZ', texto: 'Sete regiões. Sete capangas voltando de mão vazia. E agora uma criança na minha sala.' },
      'Na parede, o mapa enorme range. Um X vermelho descola, depois outro, e o papel rasga de cima a baixo.',
      { quem: 'DOUTOR FERRAZ', texto: 'Papel carimbado... Eu comprei tudo isso. Com papel carimbado!' },
      'Lá fora, o vento da praça leva os pedaços de X pela janela. Terra não lê papel.',
    ],
  },
  { // na Foz, a última estaca sai da areia
    musica: 'lembranca',
    fundo: fozEstacas,
    atores: [],
    legendas: [
      'Longe dali, na praia da Foz, um capanga arranca a última estaca e joga no mato.',
      'Na Mata, no fundo da serra, no campo e nas minas, a notícia corre mais rápido que a lancha da Companhia.',
    ],
  },
  { // a lancha vai embora de madrugada
    musica: 'sol',
    fundo: barcoAmanhecer,
    atores: [],
    legendas: [
      'De madrugada, uma lancha sai do porto. O Doutor Ferraz vai embora sem levar nem o chapéu.',
      'Mas a comporta da Foz continua de pé, e quem dorme debaixo do mato ainda não acordou.',
      'Para isso, falta o Círculo Dourado. E o balão do Baloeiro já pode subir.',
    ],
  },
];

/* --------------------------------------------- o Zeca, aos pés do Pico

   A oitava vez: ele lembra do paredão da Rota da Foz, e conta que o pai
   vem de barco com o Mestre do Porto para ver o torneio. */
const ZECA_SOL: Roteiro = [
  { // aos pés do Pico, com o sol nas costas
    musica: 'zeca',
    fundo: S.cidadeSol,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 70 },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.6 } },
    ],
    legendas: [
      'Na saída norte da Cidade do Sol, aos pés do Pico da Aurora, alguém espera com o sol nas costas.',
      { quem: 'ZECA', texto: 'Oito, {crianca}. Da Foz até aqui. Essa é a última, e eu trouxe seis.' },
    ],
  },
  { // a lembrança do paredão da Rota da Foz
    musica: 'lembranca',
    fundo: paredaoRota,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 58 },
      { figura: { jogador: true, dir: 'dir' }, x: 78, y: 90 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Lembra do paredão da Rota da Foz? Eu atravessei uma tranca de pau na estrada só pra te provocar.' },
      { quem: 'ZECA', texto: 'Achava que você não merecia o patuá da Dona Firmina. Eu é que não sabia de nada.' },
    ],
  },
  { // o pai, de volta ao rio
    musica: 'porto',
    fundo: barcoAmanhecer,
    legendas: [
      { quem: 'ZECA', texto: 'Meu pai mandou dizer que vem ver o torneio. Ele nunca tinha visto uma luta minha.' },
      { quem: 'ZECA', texto: 'Vem de barco, com o Mestre do Porto, só pra isso.' },
    ],
  },
  { // de volta ao Pico, com a Estrela-d'Alva
    musica: 'zeca',
    fundo: S.cidadeSol,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 70 },
      { figura: { criatura: 'estrelaDalva' }, x: 140, y: 44, aparece: 0.6, balanco: { amp: 2, periodo: 1.6 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Então hoje não tem desculpa. Oitava vez, {crianca}, e é pra valer!' },
    ],
    titulo: ['ZECA', 'OITAVA VEZ'],
  },
];

/* ----------------------------------------- a Estrela-d'Alva do cume */
const ESTRELA: Roteiro = [
  { // a estrela que não quer ir embora
    musica: 'estrela',
    fundo: S.picoAurora,
    atores: [{ figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 96, por: 2.6 } }],
    legendas: [
      'No cume do Pico da Aurora, o céu ainda está escuro, mas uma estrela não quer ir embora.',
      'Ela brilha cada vez mais forte... e começa a descer.',
    ],
  },
  { // ela desce até a altura dos olhos
    fundo: S.picoAurora,
    atores: [
      { figura: { criatura: 'estrelaDalva' }, x: 150, y: -40, ate: { x: 100, y: 48, de: 0.2, por: 3 }, balanco: { amp: 2, periodo: 1.6 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 96 },
    ],
    legendas: [
      "O céu clareia antes da hora, e a Estrela-d'Alva desce até a altura dos seus olhos.",
      'É a última estrela da noite. E ela não vai embora sem saber quem chegou.',
    ],
  },
  { // o letreiro do bicho
    fundo: S.picoAurora,
    atores: [{ figura: { criatura: 'estrelaDalva' }, x: 100, y: 76, balanco: { amp: 2, periodo: 1.6 } }],
    legendas: [],
    titulo: ["ESTRELA-D'ALVA", 'A ÚLTIMA DA NOITE'],
  },
];

/* ------------------------------------------- o Terreiro da Aurora */
const NO_TRONO_DO_SOL: readonly Ator[] = [
  { figura: { pessoa: 'solano', dir: 'baixo' }, x: 112, y: 14 },
];

const TERREIRO_AURORA: Roteiro = [
  { // a pedra branca e a luz correndo pelos espelhos
    musica: 'terreiro_aurora',
    fundo: S.salaoAurora,
    atores: [...NO_TRONO_DO_SOL, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 96, por: 2.6 } }],
    legendas: [
      'O Terreiro da Aurora é todo de pedra branca, e a luz entra por espelhos e corre pelas paredes.',
      'Lá no alto, de coroa de sol, alguém espera de olhos fechados, como quem toma sol.',
    ],
  },
  { // a cidade subindo o pico para cumprimentar o sol
    musica: 'encantados',
    fundo: S.auroraAntiga,
    atores: [{ figura: { criatura: 'estrelaDalva' }, x: 100, y: 30, alfa: 0.5, balanco: { amp: 2, periodo: 2 } }],
    legendas: [
      { quem: 'SOLANO', texto: 'Antigamente a cidade inteira subia o pico antes do amanhecer, pra cumprimentar o sol.' },
      { quem: 'SOLANO', texto: 'Hoje a Companhia vende o dia em fio e lâmpada. E quem compra luz esquece de olhar pro céu.' },
    ],
  },
  { // ele, e o letreiro
    musica: 'terreiro_aurora',
    fundo: S.salaoAurora,
    atores: [...NO_TRONO_DO_SOL, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 96 }],
    legendas: [
      { quem: 'SOLANO', texto: 'Sete medalhas, sete Dons, oito vezes o Zeca. O Oráculo já me contou tudo, {crianca}.' },
      { quem: 'SOLANO', texto: 'Aqui a luz anda em linha reta até bater num espelho. Gira o espelho certo, e ela te abre a porta.' },
    ],
    titulo: ['SOLANO', 'O DONO DO TERREIRO'],
  },
];

const SOLANO_VENCE: Roteiro = [
  { // a luz se desfaz em sete cores
    musica: 'terreiro_aurora',
    fundo: S.salaoAurora,
    depois: { fundo: S.salaoAuroraCalmo, de: 0.6, por: 3 },
    atores: [...NO_TRONO_DO_SOL, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 96 }],
    legendas: [
      'Quando a luta acaba, a luz dos espelhos se desfaz em sete cores e enche o salão inteiro.',
      { quem: 'SOLANO', texto: 'Você não piscou. A Trilha das Oito Medalhas termina aqui, com você.' },
    ],
  },
  { // as oito medalhas acesas no céu
    musica: 'trilha',
    fundo: trilhaAurora,
    atores: arcoMedalhas,
    legendas: [
      { quem: 'SOLANO', texto: 'Oito medalhas acesas. Desde que a Companhia chegou, ninguém tinha juntado todas.' },
      { quem: 'SOLANO', texto: 'Leva elas ao Círculo Dourado, no meio do mundo. O Anhangá espera há vinte anos por alguém assim.' },
    ],
  },
  { // a medalha
    musica: 'terreiro_aurora',
    fundo: S.salaoAuroraCalmo,
    atores: [
      ...NO_TRONO_DO_SOL,
      { figura: { medalha: 'aurora', tam: 24 }, x: 108, y: 56, aparece: 0.4, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 96 },
    ],
    legendas: [
      { quem: 'SOLANO', texto: 'A MEDALHA AURORA é sua, a oitava. Chega aqui do meu lado, que eu mesmo te entrego.' },
    ],
  },
];

/* ---------------------------------------- a saída para o Círculo */
const SOL_CIRCULO: Roteiro = [
  { // a cidade acende os lampiões em pleno dia
    musica: 'sol',
    fundo: S.cidadeFesta,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: 80, y: 104 },
      { figura: { pessoa: 'aldeao', dir: 'esq' }, x: 250, y: 104, ate: { x: 150, y: 104, de: 0.3, por: 2.4 } },
    ],
    legendas: [
      'Lá fora, a Cidade do Sol inteira acende os lampiões em pleno dia, só pra comemorar.',
      { quem: 'BALOEIRO', texto: 'Oito medalhas! Enchi o balão assim que vi o Solano descendo do terreiro.' },
    ],
  },
  { // lá de cima, as oito regiões e o Círculo no meio
    musica: 'viagem',
    fundo: S.baloeCeu,
    atores: [{ figura: { peca: 'balao' }, x: -40, y: 30, ate: { x: 190, y: 20, de: 0.2, por: 8 }, balanco: { amp: 2, periodo: 2 } }],
    legendas: [
      { quem: 'BALOEIRO', texto: 'Lá de cima se veem as oito regiões de uma vez, da Foz até aqui.' },
      { quem: 'BALOEIRO', texto: 'E bem no meio de tudo, o Círculo Dourado. Fala comigo do lado do balão, que eu te levo.' },
    ],
    titulo: ['O CÍRCULO DOURADO', 'NO MEIO DO MUNDO'],
  },
];

/* --------------------------------------------------------- a Jaci */
const JACI: Roteiro = [
  { // a noite volta fora de hora
    musica: 'encantados',
    fundo: S.cercadoJaci,
    atores: [{ figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.4 } }],
    legendas: [
      'No cercado de pedra do cume, o dia escurece de repente, como se a noite tivesse voltado.',
      'Os três cristais solares guardam a luz do dia. E a lua veio ver quem fez isso.',
    ],
  },
  { // ela desce até tocar a pedra
    fundo: S.cercadoJaci,
    atores: [
      { figura: { criatura: 'jaci' }, x: 100, y: -40, ate: { x: 100, y: 52, de: 0.3, por: 3 }, balanco: { amp: 2, periodo: 2 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    legendas: [
      { quem: 'JACI', texto: 'Quem guardou a luz do dia em cristal merece a noite também.' },
    ],
  },
  { // o letreiro
    fundo: S.cercadoJaci,
    atores: [{ figura: { criatura: 'jaci' }, x: 100, y: 76, balanco: { amp: 2, periodo: 2 } }],
    legendas: [],
    titulo: ['JACI', 'METADE LUZ, METADE SOMBRA'],
  },
];

export const ROTEIROS_SOL: Record<string, Roteiro> = {
  oraculo: ORACULO,
  ferraz: FERRAZ,
  zeca_sol: ZECA_SOL,
  estrela: ESTRELA,
  terreiro_aurora: TERREIRO_AURORA,
  solano_vence: SOLANO_VENCE,
  sol_circulo: SOL_CIRCULO,
  jaci: JACI,
};
