/* =========================================================================
   REGIÃO 5 — a Aldeia Tupã. A história daqui: a aldeia que responde ao
   trovão com tambor, e a Companhia que fincou torre de ferro na campina e
   um casarão de para-raios no charco para prender o raio num fio — e o
   céu, sem conversa, troveja sem chover.
   ========================================================================= */
import type { Ator, Roteiro } from '../cutscenes.ts';
import * as U from '../../art/fundos/tupa.ts';

/* o Chefe dos Tambores, no último vão da campina — antes da luta */
const TAMBORES: Roteiro = [
  { // o tambor grande no meio do vão
    musica: 'tambores',
    fundo: U.campinaRaios,
    atores: [
      { figura: { peca: 'tambor' }, x: 130, y: 90 },
      { figura: { pessoa: 'guarda', dir: 'esq' }, x: 150, y: 80 },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 92, ate: { x: 80, y: 92, por: 2.6 } },
    ],
    legendas: [
      'No último vão da Campina dos Raios, um tambor do tamanho de uma criança espera no meio do caminho.',
      { quem: 'CHEFE DOS TAMBORES', texto: 'Três tambores calaram, e você ainda está de pé. Escuta o meu antes de passar, {crianca}.' },
    ],
  },
  { // a festa do trovão de antigamente
    musica: 'lembranca',
    fundo: U.festaTrovao,
    legendas: [
      { quem: 'CHEFE DOS TAMBORES', texto: 'Quando o céu falava, a aldeia respondia. Tambor embaixo, trovão em cima, a noite inteira.' },
      { quem: 'CHEFE DOS TAMBORES', texto: 'Era assim que Tupã sabia que a gente ainda estava aqui, escutando.' },
    ],
  },
  { // as torres de ferro da Companhia
    musica: 'companhia',
    fundo: U.torresCompanhia,
    atores: [
      { figura: { pessoa: 'capataz', dir: 'dir' }, x: 120, y: 96, ate: { x: 180, y: 98, de: 0.4, por: 3 } },
    ],
    legendas: [
      { quem: 'CHEFE DOS TAMBORES', texto: 'Agora a Companhia fincou torre de ferro na campina e quer prender o raio num fio, pra vender na cidade.' },
      { quem: 'CHEFE DOS TAMBORES', texto: 'Desde então o céu troveja sem chover. E tambor nenhum consegue responder.' },
    ],
  },
  { // de volta ao vão, frente a frente
    musica: 'tambores',
    fundo: U.campinaRaios,
    atores: [
      { figura: { peca: 'tambor' }, x: 130, y: 90 },
      { figura: { pessoa: 'guarda', dir: 'esq' }, x: 150, y: 80 },
      { figura: { jogador: true, dir: 'dir' }, x: 80, y: 92 },
    ],
    legendas: [
      { quem: 'CHEFE DOS TAMBORES', texto: 'O tambor grande é o último antes da aldeia. Mostra o que você trouxe do vento!' },
    ],
    titulo: ['CHEFE DOS TAMBORES', 'O TAMBOR GRANDE'],
  },
];

/* ------------------------------------------- o Zeca, na estrada do morro

   O pai dele foi mandado levantar para-raio no charco, e um raio caiu do
   lado. Pela primeira vez, ele perguntou dos Encantados do filho. */
const ZECA_TUPA: Roteiro = [
  { // na estrada norte
    musica: 'zeca',
    fundo: U.aldeiaTupa,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'esq' }, x: 150, y: 92 },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 96, ate: { x: 96, y: 96, por: 2.6 } },
    ],
    legendas: [
      'Na estrada que sobe o Morro do Trovão, um conhecido de sempre bate o pé no chão.',
      { quem: 'ZECA', texto: 'Cinco regiões, {crianca}. Cinco vezes eu te espero no caminho. Hoje eu trouxe cinco Encantados!' },
    ],
  },
  { // o pai dele no charco, e o raio
    musica: 'companhia',
    fundo: U.charcoCasarao,
    atores: [
      { figura: { pessoa: 'paiZeca', dir: 'dir' }, x: 140, y: 94 },
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 30, y: 100, aparece: 0.8 },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 176, y: 90, aparece: 0.6 }],
    legendas: [
      { quem: 'ZECA', texto: 'Mandaram meu pai levantar para-raio no casarão do charco. Semana passada, um raio caiu do lado dele.' },
      { quem: 'ZECA', texto: 'Ele voltou pra casa branco. E disse uma coisa que eu nunca tinha ouvido: que o céu tava bravo com ele.' },
    ],
  },
  { // de volta à estrada, com o Relampo novo
    musica: 'zeca',
    fundo: U.aldeiaTupa,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'esq' }, x: 150, y: 92 },
      { figura: { criatura: 'relampo', flip: true }, x: 178, y: 64, aparece: 0.6, balanco: { amp: 3, periodo: 0.5 } },
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 96 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Pela primeira vez ele perguntou dos meus Encantados. Quis saber o nome de cada um.' },
      { quem: 'ZECA', texto: 'Mas isso fica pra depois. Quinta vez, {crianca}, e hoje eu vou ganhar!' },
    ],
    titulo: ['ZECA', 'QUINTA VEZ'],
  },
];

/* --------------------------------------- as cinco pedras-de-raio, no Pajé */
const NA_CASA_DO_PAJE: readonly Ator[] = [
  { figura: { pessoa: 'paje', dir: 'esq' }, x: 160, y: 72 },
  { figura: { jogador: true, dir: 'dir' }, x: 60, y: 76 },
];

const PAJE: Roteiro = [
  { // as pedras na mesa, cada uma apontada para onde caiu
    musica: 'encantados',
    fundo: U.casaPaje,
    atores: [
      ...NA_CASA_DO_PAJE,
      ...[0, 1, 2, 3, 4].map((i): Ator => ({ figura: { peca: 'pedraRaio' }, x: 94 + i * 12, y: 82 + (i % 2) * 3, aparece: 0.3 + i * 0.3 })),
    ],
    legendas: [
      'O Pajé arruma as cinco pedras-de-raio na mesa de pedra, cada uma apontada para onde caiu.',
      { quem: 'PAJÉ', texto: 'A campina, a aldeia, o charco, o morro... você andou a região inteira de ponta a ponta.' },
    ],
  },
  { // o recado de Tupã
    musica: 'lembranca',
    fundo: U.festaTrovao,
    legendas: [
      { quem: 'PAJÉ', texto: 'Pedra-de-raio é recado de Tupã. Onde ela cai, a terra fica sabendo que alguém lá em cima está olhando.' },
      { quem: 'PAJÉ', texto: 'Antigamente caía uma por lua. Esta lua caíram cinco: o céu está querendo falar.' },
    ],
  },
  { // o fio da Companhia
    musica: 'companhia',
    fundo: U.torresCompanhia,
    legendas: [
      { quem: 'PAJÉ', texto: 'O fio da Companhia rouba o raio antes de ele chegar no chão. Raio preso não deixa pedra.' },
      { quem: 'PAJÉ', texto: 'E terra que não recebe recado vai esquecendo quem mora nela.' },
    ],
  },
  { // de volta, a conta
    musica: 'encantados',
    fundo: U.casaPaje,
    atores: NA_CASA_DO_PAJE,
    legendas: [
      { quem: 'PAJÉ', texto: 'O raio escolheu você, {crianca}. Por mim, mais uma conta acende na guia. E toma, pelo caminho.' },
    ],
  },
];

/* --------------------------------------- o para-raio mestre, no charco

   Toca quando o jogador encosta no para-raio mestre: as cercas da
   Companhia se calam, o fio fica mudo, e o céu chove de verdade. */
const PARA_RAIOS: Roteiro = [
  { // o estalo corre o casarão, e tudo apaga
    musica: 'encantados',
    fundo: U.charcoCasarao,
    depois: { fundo: U.charcoCalado, de: 1.2, por: 3 },
    efeitos: [{ tipo: 'fagulhas', x: 170, y: 40, some: 1.4 }],
    legendas: [
      'Um estalo corre o casarão inteiro, de sala em sala, e todas as cercas da Companhia se calam de uma vez.',
      'O fio que saía do telhado fica mudo. O raio não tem mais onde ficar preso.',
    ],
  },
  { // a chuva mansa, e o céu limpo
    fundo: U.charcoCalado,
    legendas: [
      'Lá fora, o céu responde com um trovão comprido... e a nuvem pesada se desmancha numa chuva mansa.',
      'Quando ela passa, o charco brilha inteiro, limpo, como se tivesse acabado de nascer.',
    ],
  },
];

/* --------------------------------------------- o Relampo do cume */
const RELAMPO: Roteiro = [
  { // o ninho do raio
    musica: 'relampo',
    fundo: U.cumeTrovao,
    atores: [{ figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.6 } }],
    legendas: [
      'No cume do Morro do Trovão, o raio cai sempre no mesmo lugar: uma coroa de pedra preta, o ninho do raio.',
      'O céu clareia de uma vez, e o trovão chega depois...',
    ],
  },
  { // ...junto com ele
    fundo: U.cumeTrovao,
    atores: [
      { figura: { criatura: 'relampo' }, x: 160, y: 40, ate: { x: 100, y: 46, de: 0.2, por: 0.6, vaiVolta: true }, aparece: 0.2 },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 120, y: 80, aparece: 0.4 }],
    legendas: [
      '...junto com ele. Um Relampo dá voltas no ninho, mais rápido que o olho acompanha.',
      'Só o rastro amarelo fica no ar. E ele não gosta de visita.',
    ],
  },
  { // o letreiro do bicho
    fundo: U.cumeTrovao,
    atores: [{ figura: { criatura: 'relampo' }, x: 100, y: 76, balanco: { amp: 3, periodo: 0.4 } }],
    efeitos: [{ tipo: 'fagulhas', x: 120, y: 92 }],
    legendas: [],
    titulo: ['RELAMPO', 'O DONO DO CUME'],
  },
];

/* ------------------------------------------- o Terreiro do Trovão */
const NO_ASSENTO: readonly Ator[] = [
  { figura: { pessoa: 'guaraci', dir: 'baixo' }, x: 112, y: 12 },
];

const TERREIRO_TROVAO: Roteiro = [
  { // as cercas estalando, e ele lá no alto
    musica: 'terreiro_trovao',
    fundo: U.salaoTrovao,
    atores: [...NO_ASSENTO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.6 } }],
    legendas: [
      'O Terreiro do Trovão é todo de madeira escura, e as cercas de raio estalam entre uma sala e outra.',
      'Lá no alto, num assento de pedra, alguém de cocar dourado escuta o céu de olhos fechados.',
    ],
  },
  { // a conversa com Tupã
    musica: 'encantados',
    fundo: U.festaTrovao,
    legendas: [
      { quem: 'GUARACI', texto: 'O meu povo toca tambor pra Tupã desde antes de existir aldeia. O trovão é a resposta.' },
      { quem: 'GUARACI', texto: 'Quem prende o raio num fio cala a conversa. E céu que não conversa vira tempestade.' },
    ],
  },
  { // ele, e o letreiro
    musica: 'terreiro_trovao',
    fundo: U.salaoTrovao,
    atores: [...NO_ASSENTO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 }],
    legendas: [
      { quem: 'GUARACI', texto: 'Os tambores da campina deixaram você passar, e o Pajé mandou dizer que o raio te escolheu.' },
      { quem: 'GUARACI', texto: 'Aqui as cercas abrem e fecham com a chave. Pensa antes de mexer, {crianca}: raio não perdoa pressa.' },
    ],
    titulo: ['GUARACI', 'O DONO DO TERREIRO'],
  },
];

const GUARACI_VENCE: Roteiro = [
  { // as cercas apagam, e a luz entra
    musica: 'terreiro_trovao',
    fundo: U.salaoTrovao,
    depois: { fundo: U.salaoTrovaoCalmo, de: 0.6, por: 3 },
    atores: [...NO_ASSENTO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 }],
    legendas: [
      'Quando a luta acaba, as cercas de raio se apagam uma por uma, e a luz entra pelo telhado.',
      { quem: 'GUARACI', texto: 'O raio escolheu você. Não sou eu quem vai discutir com ele.' },
    ],
  },
  { // as torres ainda de pé
    musica: 'companhia',
    fundo: U.torresCompanhia,
    legendas: [
      { quem: 'GUARACI', texto: 'As torres da Companhia ainda estão na campina. Mas o casarão do charco calou, e o céu voltou a chover.' },
      { quem: 'GUARACI', texto: 'Cada medalha é um tambor a mais respondendo, {crianca}. Já são cinco.' },
    ],
  },
  { // a medalha
    musica: 'terreiro_trovao',
    fundo: U.salaoTrovaoCalmo,
    atores: [
      ...NO_ASSENTO,
      { figura: { medalha: 'trovao', tam: 24 }, x: 108, y: 58, aparece: 0.4, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    legendas: [
      { quem: 'GUARACI', texto: 'A MEDALHA TROVÃO é sua. Escuta: ela ronca baixinho quando vai chover.' },
      { quem: 'GUARACI', texto: 'O Pererê mandou lembrança, né? Ele só aparece com tempestade. E eu, só quando ele aparece.' },
      { quem: 'GUARACI', texto: 'Minha filha já toca o tambor grande. No dia que as torres caírem, ela toca pra Tupã na campina inteira.' },
    ],
  },
];

/* ------------------------------------------- a saída para as Minas */
const TUPA_MINAS: Roteiro = [
  { // os tambores tocam todos juntos
    musica: 'tambores',
    fundo: U.aldeiaTupa,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 96 },
      { figura: { pessoa: 'paje', dir: 'esq' }, x: 250, y: 96, ate: { x: 140, y: 96, de: 0.3, por: 2.4 } },
    ],
    legendas: [
      'Lá fora, os tambores da aldeia tocam todos juntos, e o céu responde com um trovão manso, sem raio.',
      { quem: 'PAJÉ', texto: 'Medalha Trovão! A aldeia inteira escutou quando o Guaraci caiu.' },
    ],
  },
  { // o vale das Minas, do alto do morro
    musica: 'viagem',
    fundo: U.minasAoLonge,
    legendas: [
      { quem: 'PAJÉ', texto: 'No alto do cume, duas pedras rachadas fecham a estrada do norte. O Dom Faísca parte as duas.' },
      { quem: 'PAJÉ', texto: 'Do outro lado ficam as Minas da Caipora. A terra lá guarda ouro, e a Companhia já cavou buraco demais.' },
    ],
    titulo: ['MINAS DA CAIPORA', 'ONDE A TERRA GUARDA OURO'],
  },
];

/* --------------------------------------------- o Arco-da-Velha */
const ARCO_DA_VELHA: Roteiro = [
  { // a chuva certa
    musica: 'encantados',
    fundo: U.charcoCalado,
    atores: [{ figura: { jogador: true, dir: 'dir' }, x: 40, y: 96 }],
    legendas: [
      'Lá na aldeia, a rede de penas da Tecelã balança, e uma chuva fina e certa cai sobre o charco.',
      'A chuva para de repente. Atrás do casarão, alguma coisa brilha em sete cores.',
    ],
  },
  { // as duas pontas do arco descem até a poça
    fundo: U.charcoArcoIris,
    atores: [
      { figura: { criatura: 'arcoDaVelha' }, x: 100, y: -40, ate: { x: 100, y: 62, de: 0.3, por: 3 }, balanco: { amp: 2, periodo: 1.6 } },
    ],
    legendas: [
      { quem: 'ARCO-DA-VELHA', texto: 'A rede de penas chamou a chuva certa. Quem faz isso, eu acompanho.' },
    ],
  },
  { // o letreiro
    fundo: U.charcoArcoIris,
    atores: [{ figura: { criatura: 'arcoDaVelha' }, x: 100, y: 76, balanco: { amp: 2, periodo: 1.6 } }],
    legendas: [],
    titulo: ['ARCO-DA-VELHA', 'AS SETE CORES DA CHUVA'],
  },
];

export const ROTEIROS_TUPA: Record<string, Roteiro> = {
  tambores: TAMBORES,
  zeca_tupa: ZECA_TUPA,
  paje: PAJE,
  para_raios: PARA_RAIOS,
  relampo: RELAMPO,
  terreiro_trovao: TERREIRO_TROVAO,
  guaraci_vence: GUARACI_VENCE,
  tupa_minas: TUPA_MINAS,
  arco_da_velha: ARCO_DA_VELHA,
};
