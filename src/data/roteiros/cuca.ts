/* =========================================================================
   REGIÃO 7 — o Bairro da Cuca. A história daqui: o bairro velho, onde a
   noite sempre foi de todo mundo — a Cuca guardando o sono, a Pisadeira
   cuidando de quem já se foi — e a Companhia, que pregou VENDIDO na porta
   do Casarão e quer derrubar o bairro inteiro.
   ========================================================================= */
import type { Ator, Roteiro } from '../cutscenes.ts';
import * as Q from '../../art/fundos/cuca.ts';
import { noiteFogueira } from '../../art/cenas.ts';

/* --------------------------------------- as três cartas da Cartomante */
const NA_MESA: readonly Ator[] = [
  { figura: { pessoa: 'cartomante', dir: 'esq' }, x: 176, y: 74 },
  { figura: { jogador: true, dir: 'dir' }, x: 44, y: 78 },
];

const CARTOMANTE: Roteiro = [
  { // as três cartas viradas, ao lado da vela
    musica: 'bairro',
    fundo: Q.casaCartomante,
    atores: NA_MESA,
    efeitos: [{ tipo: 'fagulhas', x: 94, y: 66 }],
    legendas: [
      'A Cartomante junta as três cartas na mesa, ao lado da vela, e sopra a poeira de cima delas.',
      { quem: 'CARTOMANTE', texto: 'Três adivinhas, três acertos. Agora as cartas te devem uma leitura de verdade.' },
    ],
  },
  { // o que cada carta mostra
    musica: 'encantados',
    fundo: Q.cartasMesa,
    atores: [
      { figura: { criatura: 'iaraMae' }, x: 28, y: 34, aparece: 0.4, balanco: { amp: 1, periodo: 2.4 } },
      { figura: { pessoa: 'capataz', dir: 'baixo' }, x: 112, y: 70, aparece: 1.4 },
      { figura: { medalha: 'aurora', tam: 16 }, x: 184, y: 36, aparece: 2.4, balanco: { amp: 1, periodo: 1.6 } },
      { figura: { jogador: true, dir: 'baixo' }, x: 184, y: 78, aparece: 2.4 },
    ],
    legendas: [
      { quem: 'CARTOMANTE', texto: 'A primeira carta é o rio que dorme. A segunda, a sombra que cresce comprando terra.' },
      { quem: 'CARTOMANTE', texto: 'E a terceira é você, {crianca}: uma criança que ainda vai ter oito medalhas no peito, no meio do mundo.' },
    ],
  },
  { // a placa de VENDIDO no Casarão
    musica: 'companhia',
    fundo: Q.bairroCuca,
    atores: [{ figura: { pessoa: 'capataz', dir: 'baixo' }, x: 142, y: 86 }],
    legendas: [
      { quem: 'CARTOMANTE', texto: 'A sombra já chegou aqui: a Companhia comprou o Casarão e quer derrubar o bairro velho inteiro.' },
      { quem: 'CARTOMANTE', texto: 'Mas carta não mente. Quem junta as oito, o mato inteiro escuta.' },
    ],
  },
  { // de volta à mesa, a conta
    musica: 'bairro',
    fundo: Q.casaCartomante,
    atores: NA_MESA,
    efeitos: [{ tipo: 'fagulhas', x: 94, y: 66 }],
    legendas: [
      { quem: 'CARTOMANTE', texto: 'A sua sorte é boa. Acendi uma conta da sua guia, e toma, que carta boa se paga.' },
    ],
  },
];

/* ------------------------------------------ o Zeca, na porta do Casarão

   O medo da Cuca vem da cantiga da avó; e o pai, lá da Foz, mandou carta
   dizendo que a Companhia comprou o Casarão para derrubar. */
const ZECA_CUCA: Roteiro = [
  { // no portão do Casarão, assobiando alto
    musica: 'zeca',
    fundo: Q.bairroCuca,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 40, y: 96 },
      { figura: { jogador: true, dir: 'esq' }, x: 260, y: 98, ate: { x: 150, y: 98, por: 2.6 } },
    ],
    legendas: [
      'Na saída oeste do bairro, perto do Casarão Assombrado, alguém assobia alto pra espantar o medo.',
      { quem: 'ZECA', texto: 'Sete, {crianca}. Sete regiões! E dessa vez eu não durmo antes de ganhar.' },
    ],
  },
  { // a lembrança: a avó cantando na beira do fogo
    musica: 'fogueira',
    fundo: noiteFogueira,
    atores: [
      { figura: { peca: 'fogueira' }, x: 108, y: 88 },
      { figura: { pessoa: 'avo', dir: 'dir' }, x: 78, y: 90 },
      { figura: { pessoa: 'zeca', dir: 'esq' }, x: 146, y: 92 },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 120, y: 92 }],
    legendas: [
      { quem: 'ZECA', texto: 'Minha avó cantava: dorme, neném, que a Cuca vem pegar... Eu dormia de olho aberto, só de medo.' },
      { quem: 'ZECA', texto: 'E meu pai mandou carta: a Companhia comprou o Casarão pra derrubar. Nem a Cuca eles respeitam.' },
    ],
  },
  { // de volta ao portão, com o Lobisomem novo
    musica: 'zeca',
    fundo: Q.bairroCuca,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 40, y: 96 },
      { figura: { criatura: 'lobisomem' }, x: 4, y: 70, aparece: 0.6, balanco: { amp: 1, periodo: 1.2 } },
      { figura: { jogador: true, dir: 'esq' }, x: 150, y: 98 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Prendi um Lobisomem na Rua do Breu, sozinho, de noite. Medo eu tenho. Mas não paro.' },
      { quem: 'ZECA', texto: 'Sétima vez. O Casarão é logo ali, e o caminho passa por mim!' },
    ],
    titulo: ['ZECA', 'SÉTIMA VEZ'],
  },
];

/* ---------------------------------------------------- a Cuca do sótão */
const CUCA: Roteiro = [
  { // o berço que balança sozinho
    musica: 'cuca',
    fundo: Q.sotao,
    atores: [{ figura: { jogador: true, dir: 'dir' }, x: -20, y: 86, ate: { x: 80, y: 86, por: 2.6 } }],
    legendas: [
      'No sótão do Casarão, um berço velho balança sozinho, devagar, no escuro.',
      'E uma cantiga de ninar começa baixinho: dorme, neném, que a Cuca vem pegar...',
    ],
  },
  { // o focinho de jacaré, e a voz de velha
    fundo: Q.sotao,
    atores: [
      { figura: { criatura: 'cuca' }, x: 220, y: 50, ate: { x: 140, y: 52, de: 0.3, por: 2.4 }, aparece: 0.3, balanco: { amp: 2, periodo: 1.6 } },
      { figura: { jogador: true, dir: 'dir' }, x: 80, y: 86 },
    ],
    legendas: [
      'O focinho de jacaré aparece antes da voz de velha. E ela vem.',
      'A Cuca guarda o sono do bairro há duzentos anos. Quem sobe aqui sem pedir não dorme mais.',
    ],
  },
  { // o letreiro do bicho
    fundo: Q.sotao,
    atores: [{ figura: { criatura: 'cuca' }, x: 100, y: 76, balanco: { amp: 2, periodo: 1.6 } }],
    legendas: [],
    titulo: ['CUCA', 'A DONA DO SÓTÃO'],
  },
];

/* ------------------------------------------------ o Terreiro do Breu */
const NO_ESCURO: readonly Ator[] = [
  { figura: { pessoa: 'morgana', dir: 'baixo' }, x: 112, y: 12 },
];

const TERREIRO_BREU: Roteiro = [
  { // nenhuma vela acesa, e os vultos
    musica: 'terreiro_breu',
    fundo: Q.salaoBreu,
    atores: [
      ...NO_ESCURO,
      { figura: { pessoa: 'morgana', dir: 'esq' }, x: 60, y: 76, alfa: 0.3, ate: { x: 28, y: 76, por: 2.4, vaiVolta: true } },
      { figura: { pessoa: 'morgana', dir: 'dir' }, x: 186, y: 76, alfa: 0.3, ate: { x: 218, y: 76, por: 2.4, vaiVolta: true } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 96, por: 2.4 } },
    ],
    legendas: [
      'O Terreiro do Breu não tem uma vela acesa. Vultos dão a volta nos pilares, sem fazer barulho.',
      'Lá no alto, alguém vestida de preto espera, e só os olhos dela brilham.',
    ],
  },
  { // o bairro de antigamente
    musica: 'encantados',
    fundo: Q.bairroAntigo,
    atores: [{ figura: { criatura: 'cuca' }, x: 186, y: 4, alfa: 0.5, balanco: { amp: 1, periodo: 2.4 } }],
    legendas: [
      { quem: 'MORGANA', texto: 'O bairro velho sempre foi da noite. Aqui a Cuca guarda o sono, e a Pisadeira cuida de quem já se foi.' },
      { quem: 'MORGANA', texto: 'Quem tem medo do escuro não escuta o que ele diz. Eu escuto.' },
    ],
  },
  { // ela, e o letreiro
    musica: 'terreiro_breu',
    fundo: Q.salaoBreu,
    atores: NO_ESCURO,
    legendas: [
      { quem: 'MORGANA', texto: 'A Cartomante já tinha lido a sua sorte. Disse que você chegava antes da lua minguar.' },
      { quem: 'MORGANA', texto: 'Aqui os vultos enxergam longe. Anda pelo escuro deles, {crianca}, e não pela luz.' },
    ],
    titulo: ['MORGANA', 'A DONA DO TERREIRO'],
  },
];

const MORGANA_VENCE: Roteiro = [
  { // as velas acendem sozinhas
    musica: 'terreiro_breu',
    fundo: Q.salaoBreu,
    depois: { fundo: Q.salaoBreuCalmo, de: 0.6, por: 3 },
    atores: [...NO_ESCURO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 96 }],
    legendas: [
      'Quando a luta acaba, as velas do salão acendem sozinhas, uma por uma, e os vultos somem.',
      { quem: 'MORGANA', texto: 'O breu cedeu. Pouca gente vê no escuro como você.' },
    ],
  },
  { // a placa de VENDIDO
    musica: 'companhia',
    fundo: Q.bairroCuca,
    legendas: [
      { quem: 'MORGANA', texto: 'A Companhia pregou VENDIDO no Casarão. Querem derrubar o bairro e acender holofote no lugar da lua.' },
      { quem: 'MORGANA', texto: 'Sete medalhas, {crianca}. Falta uma. E a última fica onde a noite acaba.' },
    ],
  },
  { // a medalha
    musica: 'terreiro_breu',
    fundo: Q.salaoBreuCalmo,
    atores: [
      ...NO_ESCURO,
      { figura: { medalha: 'breu', tam: 24 }, x: 108, y: 54, aparece: 0.4, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 96 },
    ],
    legendas: [
      { quem: 'MORGANA', texto: 'A MEDALHA BREU é sua. Chega aqui do meu lado, que eu mesma te entrego.' },
    ],
  },
];

/* -------------------------------------- a saída para a Cidade do Sol */
const BAIRRO_SOL: Roteiro = [
  { // as janelas do bairro se abrem de noite
    musica: 'bairro',
    fundo: Q.bairroCuca,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: 90, y: 100 },
      { figura: { pessoa: 'firmina', dir: 'esq' }, x: 250, y: 100, ate: { x: 140, y: 100, de: 0.3, por: 2.4 } },
      { figura: { pessoa: 'crianca', dir: 'baixo' }, x: 20, y: 98, aparece: 1 },
    ],
    legendas: [
      'Lá fora, pela primeira vez em muito tempo, as janelas do bairro se abrem de noite.',
      { quem: 'VELHA DO BAIRRO', texto: 'Medalha Breu! As crianças saíram na rua só pra ver você passar, {crianca}.' },
    ],
  },
  { // a cidade lá do outro lado do véu
    musica: 'viagem',
    fundo: Q.solAoLonge,
    legendas: [
      { quem: 'VELHA DO BAIRRO', texto: 'Na saída sul, um véu de sombra fecha a estrada. Com o Dom Visão Noturna, ele cai na sua frente.' },
      { quem: 'VELHA DO BAIRRO', texto: 'Do outro lado fica a Cidade do Sol, a última. Lá a noite acaba, e o dia mora.' },
    ],
    titulo: ['CIDADE DO SOL', 'ONDE A NOITE ACABA'],
  },
];

/* ------------------------------------------------------ a Pisadeira */
const PISADEIRA: Roteiro = [
  { // a lua tão perto
    musica: 'encantados',
    fundo: Q.telhadoCasarao,
    atores: [{ figura: { jogador: true, dir: 'dir' }, x: 80, y: 92 }],
    legendas: [
      'No telhado do Casarão, a lua está tão perto que dá pra contar as manchas.',
      'Os três retratos voltaram para a parede da Velha. E alguém, aqui em cima, ficou sabendo.',
    ],
  },
  { // um vulto magro desce pela beira do telhado
    fundo: Q.telhadoCasarao,
    atores: [
      { figura: { criatura: 'pisadeira' }, x: 150, y: -40, ate: { x: 140, y: 52, de: 0.3, por: 3 }, balanco: { amp: 2, periodo: 1.8 } },
      { figura: { jogador: true, dir: 'dir' }, x: 80, y: 92 },
    ],
    legendas: [
      { quem: 'PISADEIRA', texto: 'Os três retratos de volta na parede. Quem cuida dos que já foram assim, eu acompanho.' },
    ],
  },
  { // o letreiro
    fundo: Q.telhadoCasarao,
    atores: [{ figura: { criatura: 'pisadeira' }, x: 100, y: 76, balanco: { amp: 2, periodo: 1.8 } }],
    legendas: [],
    titulo: ['PISADEIRA', 'A GUARDIÃ DO TELHADO'],
  },
];

export const ROTEIROS_CUCA: Record<string, Roteiro> = {
  cartomante: CARTOMANTE,
  zeca_cuca: ZECA_CUCA,
  cuca: CUCA,
  terreiro_breu: TERREIRO_BREU,
  morgana_vence: MORGANA_VENCE,
  bairro_sol: BAIRRO_SOL,
  pisadeira: PISADEIRA,
};
