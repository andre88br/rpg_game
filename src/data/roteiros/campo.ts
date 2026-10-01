/* =========================================================================
   REGIÃO 4 — o Campo do Saci. A história daqui: os catadores de vento, que
   liam o tempo na peneira com o recado do Saci, e a cerca de arame que a
   Companhia passou no campo inteiro para plantar soja — e que todo
   redemoinho derruba de noite.
   ========================================================================= */
import type { Ator, Roteiro } from '../cutscenes.ts';
import * as K from '../../art/fundos/campo.ts';

/* o Chefe dos Catadores, na porteira da Ventania — antes da luta */
const CATADORES: Roteiro = [
  { // ele, com a peneira contra o céu
    musica: 'campo',
    fundo: K.campoAberto,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'baixo' }, x: 112, y: 76 },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.6 } },
    ],
    legendas: [
      'No fim do Campo Aberto, onde o capim acaba e a Ventania começa, um homem segura uma peneira contra o céu.',
      { quem: 'CHEFE DOS CATADORES', texto: 'Catador de vento lê o tempo na peneira, {crianca}. E o vento de hoje diz que vem gente forte aí.' },
    ],
  },
  { // o campo de antigamente, com o redemoinho do Saci
    musica: 'lembranca',
    fundo: K.campoAntigo,
    atores: [
      { figura: { criatura: 'saci' }, x: 112, y: 52, alfa: 0.6, balanco: { amp: 4, periodo: 0.6 } },
    ],
    legendas: [
      { quem: 'CHEFE DOS CATADORES', texto: 'Antigamente a gente pegava o vento na peneira e dizia: vai chover na terça. E chovia.' },
      { quem: 'CHEFE DOS CATADORES', texto: 'Quem soprava o recado era o Saci. Cada redemoinho no meio do campo era um aviso dele.' },
    ],
  },
  { // a cerca de arame e a terra revirada
    musica: 'companhia',
    fundo: K.campoCercado,
    atores: [
      { figura: { peca: 'trator' }, x: -60, y: 46, ate: { x: 70, y: 46, de: 0.3, por: 5 } },
      { figura: { pessoa: 'capataz', dir: 'esq' }, x: 200, y: 104, ate: { x: 150, y: 104, de: 0.6, por: 2.4 } },
    ],
    efeitos: [{ tipo: 'poeira', x: 40, y: 92, aparece: 1 }],
    legendas: [
      { quem: 'CHEFE DOS CATADORES', texto: 'Agora a Companhia passou arame no campo inteiro e revirou o capim pra plantar soja até o horizonte.' },
      { quem: 'CHEFE DOS CATADORES', texto: 'Toda noite um redemoinho derruba a cerca. Toda manhã eles levantam de novo, mais alta.' },
    ],
  },
  { // de volta à porteira, frente a frente
    musica: 'campo',
    fundo: K.campoAberto,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'baixo' }, x: 112, y: 76, ate: { x: 112, y: 80, de: 0.3, por: 0.5 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    legendas: [
      { quem: 'CHEFE DOS CATADORES', texto: 'O vento anda bravo, e eu não deixo qualquer um entrar na Ventania Funda.' },
      { quem: 'CHEFE DOS CATADORES', texto: 'Quatro catadores, e eu sou o último. Vamos ver o que o seu vento diz!' },
    ],
    titulo: ['CHEFE DOS CATADORES', 'O ÚLTIMO ANTES DA VENTANIA'],
  },
];

/* ------------------------------------------ o Zeca, na subida do Topo

   Ele viu um redemoinho derrubar a cerca da Companhia e, no meio dele, um
   Sacizinho rindo — igual àquele de quem tirou o gorro quando era pequeno. */
const ZECA_CAMPO: Roteiro = [
  { // de braços cruzados na subida
    musica: 'zeca',
    fundo: K.aldeiaCatavento,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'esq' }, x: 150, y: 98 },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 100, ate: { x: 96, y: 100, por: 2.6 } },
    ],
    legendas: [
      'Na subida para o Topo do Redemoinho, alguém de braços cruzados fecha o caminho. Adivinha quem.',
      { quem: 'ZECA', texto: 'Achou que eu ia parar depois da serra? Te segui até aqui em cima!' },
    ],
  },
  { // a lembrança: o redemoinho derrubando a cerca, e o Sacizinho rindo
    musica: 'lembranca',
    fundo: K.campoNoite,
    atores: [
      { figura: { criatura: 'sacizinho' }, x: 104, y: 50, balanco: { amp: 5, periodo: 0.45 } },
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 30, y: 98, aparece: 0.6 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Ontem de noite eu vi um redemoinho derrubar a cerca da Companhia inteirinha, moirão por moirão.' },
      { quem: 'ZECA', texto: 'E lá no meio tinha um Sacizinho rindo. Igual àquele de quem eu tirei o gorro, quando era pequeno.' },
    ],
  },
  { // de volta à subida, frente a frente
    musica: 'zeca',
    fundo: K.aldeiaCatavento,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'esq' }, x: 150, y: 98 },
      { figura: { criatura: 'saci', flip: true }, x: 180, y: 70, aparece: 0.6, balanco: { amp: 3, periodo: 0.8 } },
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 100 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Meu pai diz que é sabotagem. Eu acho que é o campo dizendo que não quer cerca.' },
      { quem: 'ZECA', texto: 'Mas isso não muda nada aqui: quarta vez, {crianca}. Dessa eu não perco!' },
    ],
    titulo: ['ZECA', 'QUARTA VEZ'],
  },
];

/* -------------------------------------------- as cinco penas, no moinho

   O Moleiro amarra uma pena em cada pá, o moinho gira sozinho, e de noite
   um canto desce das vigas — o Uirapuru, que ainda não se mostra. */
const NO_MOINHO: readonly Ator[] = [
  { figura: { pessoa: 'aldeao', dir: 'esq' }, x: 150, y: 80 },
  { figura: { jogador: true, dir: 'dir' }, x: 74, y: 82 },
];

const MOLEIRO: Roteiro = [
  { // as penas contra a luz
    musica: 'campo',
    fundo: K.moinhoDentro,
    atores: [
      ...NO_MOINHO,
      ...[0, 1, 2, 3, 4].map((i): Ator => ({ figura: { peca: 'pena' }, x: 96 + i * 10, y: 96 + (i % 2) * 4, aparece: 0.3 + i * 0.25 })),
    ],
    legendas: [
      'O Moleiro levanta as cinco penas de vento, uma por uma, contra a luz da janela.',
      { quem: 'MOLEIRO', texto: 'Cinco penas, e nenhuma igual à outra! Agora sim o moinho tem com que conversar com o vento.' },
    ],
  },
  { // uma pena em cada pá, e o moinho gira
    fundo: K.moinhoComPenas,
    efeitos: [{ tipo: 'poeira', x: 120, y: 92, aparece: 1 }],
    legendas: [
      'Ele sobe a escada e amarra uma pena na ponta de cada pá...',
      '...e o moinho, parado havia meses, começa a girar sozinho, mesmo sem vento nenhum.',
    ],
  },
  { // de noite, um canto lá nas vigas
    musica: 'encantados',
    fundo: K.moinhoNoite,
    atores: [
      { figura: { criatura: 'uirapuru' }, x: 140, y: 2, alfa: 0.35, aparece: 0.8, some: 4, balanco: { amp: 2, periodo: 1.2 } },
    ],
    legendas: [
      'Naquela noite, um canto desceu das vigas do moinho, uma vez só.',
      'O Moleiro jura que ouviu. E que o vento lá fora parou pra escutar.',
    ],
  },
  { // de volta, a conta
    musica: 'campo',
    fundo: K.moinhoDentro,
    atores: NO_MOINHO,
    legendas: [
      { quem: 'MOLEIRO', texto: 'Farinha pra aldeia inteira, e uma conta da guia acesa por sua conta. Toma, pelo trabalho.' },
    ],
  },
];

/* ------------------------------------------- a Matinta do redemoinho

   Toca quando o jogador chega perto do olho do vento: o assobio, e os olhos
   amarelos abrindo. A luta começa assim que ela acaba (emboscada). */
const MATINTA: Roteiro = [
  { // o redemoinho que gira sem sair do lugar
    musica: 'matinta',
    fundo: K.topoRedemoinho,
    atores: [
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.6 } },
    ],
    legendas: [
      'No alto do platô, um redemoinho enorme gira sozinho, sem sair do lugar.',
      'E lá de dentro vem um assobio fino, comprido... fiiiiiii...',
    ],
  },
  { // os olhos amarelos, e ela
    fundo: K.topoRedemoinho,
    atores: [
      { figura: { criatura: 'matinta' }, x: 104, y: 40, aparece: 1, balanco: { amp: 3, periodo: 1.4 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    efeitos: [{ tipo: 'poeira', x: 120, y: 96, aparece: 0.3, some: 2.6 }],
    legendas: [
      'Quem escuta o assobio da Matinta e não responde, ela vem buscar a resposta.',
      'Os olhos amarelos abrem antes do resto do corpo aparecer.',
    ],
  },
  { // o letreiro do bicho
    fundo: K.topoRedemoinho,
    atores: [{ figura: { criatura: 'matinta' }, x: 104, y: 76, balanco: { amp: 3, periodo: 1.4 } }],
    legendas: [],
    titulo: ['MATINTA', 'O OLHO DO REDEMOINHO'],
  },
];

/* ---------------------------------------- o Terreiro do Rodamoinho */

const NO_BANCO: readonly Ator[] = [
  { figura: { pessoa: 'perere', dir: 'baixo' }, x: 112, y: 14 },
];

const TERREIRO_VENTO: Roteiro = [
  { // o salão que corre feito rio de vento
    musica: 'terreiro_vento',
    fundo: K.salaoVento,
    atores: [...NO_BANCO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 94, por: 2.6 } }],
    legendas: [
      'O Terreiro do Rodamoinho é um salão comprido, e o chão inteiro corre feito rio de vento.',
      'Lá no fim, num banco de uma perna só, alguém de gorro vermelho balança o pé.',
    ],
  },
  { // o primeiro redemoinho do mundo
    musica: 'encantados',
    fundo: K.campoNoite,
    atores: [{ figura: { criatura: 'saci' }, x: 100, y: 50, alfa: 0.7, balanco: { amp: 4, periodo: 0.7 } }],
    legendas: [
      { quem: 'PERERÊ', texto: 'Meu avô dizia que o primeiro redemoinho do mundo nasceu aqui, de um Saci dançando sozinho no campo.' },
      { quem: 'PERERÊ', texto: 'Por isso o vento daqui não obedece ninguém. Nem a Companhia, nem a cerca, nem eu.' },
    ],
  },
  { // ele, e o letreiro
    musica: 'terreiro_vento',
    fundo: K.salaoVento,
    atores: [...NO_BANCO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 }],
    legendas: [
      { quem: 'PERERÊ', texto: 'O Chefe dos Catadores mandou recado pelo vento: diz que você atravessou a Ventania sem chorar.' },
      { quem: 'PERERÊ', texto: 'Aqui, quem erra o passo o vento leva de volta pro começo. Pisou, só para quando bater.' },
    ],
    titulo: ['PERERÊ', 'O DONO DO TERREIRO'],
  },
];

const PERERE_VENCE: Roteiro = [
  { // o vento para, e as cortinas caem
    musica: 'terreiro_vento',
    fundo: K.salaoVento,
    depois: { fundo: K.salaoVentoCalmo, de: 0.6, por: 3 },
    atores: [...NO_BANCO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 }],
    legendas: [
      'Quando a luta acaba, o vento do salão para de uma vez, e as cortinas caem quietas.',
      { quem: 'PERERÊ', texto: 'Ganhou do vento, {crianca}. Pouca gente consegue isso.' },
    ],
  },
  { // a cerca de arame
    musica: 'companhia',
    fundo: K.campoCercado,
    legendas: [
      { quem: 'PERERÊ', texto: 'A cerca da Companhia cai toda noite, mas eles levantam de novo. Vento sozinho não ganha de arame.' },
      { quem: 'PERERÊ', texto: 'Agora, vento com gente junto... aí já é outra história.' },
    ],
  },
  { // a medalha
    musica: 'terreiro_vento',
    fundo: K.salaoVentoCalmo,
    atores: [
      ...NO_BANCO,
      { figura: { medalha: 'rodamoinho', tam: 24 }, x: 108, y: 54, aparece: 0.4, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 },
    ],
    legendas: [
      { quem: 'PERERÊ', texto: 'A MEDALHA RODAMOINHO é sua. Chega aqui do meu lado, que eu mesmo te entrego.' },
    ],
  },
];

/* --------------------------------------- a saída para a Aldeia Tupã

   Na primeira chegada à aldeia com a Medalha Rodamoinho: os cataventos
   viram todos para o leste, e o Moleiro conta do vão aberto no Topo. */
const CATAVENTO_TUPA: Roteiro = [
  { // a aldeia, e o Moleiro chegando
    musica: 'campo',
    fundo: K.aldeiaCatavento,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 100 },
      { figura: { pessoa: 'aldeao', dir: 'esq' }, x: 250, y: 100, ate: { x: 140, y: 100, de: 0.3, por: 2.2 } },
    ],
    legendas: [
      'Lá fora, todos os cataventos da aldeia viram de uma vez para o mesmo lado: o leste.',
      { quem: 'MOLEIRO', texto: 'Medalha Rodamoinho! O moinho deu três voltas sozinho quando o Pererê caiu, eu vi.' },
    ],
  },
  { // a campina dos raios, lá do outro lado
    musica: 'viagem',
    fundo: K.tupaAoLonge,
    legendas: [
      { quem: 'MOLEIRO', texto: 'Lá no Topo do Redemoinho, o vento abriu um vão na parede do leste. Dali se vê a campina dos raios.' },
      { quem: 'MOLEIRO', texto: 'Do outro lado fica a Aldeia Tupã. Lá o céu fala alto, {crianca}, e quem responde é o tambor.' },
    ],
    titulo: ['ALDEIA TUPÃ', 'ONDE O TROVÃO MORA'],
  },
];

/* --------------------------------------------------- o Uirapuru */

const UIRAPURU: Roteiro = [
  { // o capim dourado em cima da mó
    musica: 'encantados',
    fundo: K.moinhoNoite,
    atores: [{ figura: { jogador: true, dir: 'dir' }, x: 74, y: 82 }],
    legendas: [
      'No moinho, o vento lá fora para de repente, e tudo fica quieto.',
      'Lá das vigas, um canto desce, uma vez só. É o canto que o Moleiro jurava ter ouvido.',
    ],
  },
  { // ele desce das vigas
    fundo: K.moinhoNoite,
    atores: [
      { figura: { criatura: 'uirapuru' }, x: 140, y: -40, ate: { x: 120, y: 56, de: 0.3, por: 3 }, balanco: { amp: 2, periodo: 1.2 } },
      { figura: { jogador: true, dir: 'dir' }, x: 74, y: 82 },
    ],
    legendas: [
      { quem: 'UIRAPURU', texto: 'Três punhados de capim dourado, juntos de novo. Quem faz isso merece o meu canto.' },
    ],
  },
  { // o letreiro
    fundo: K.moinhoNoite,
    atores: [{ figura: { criatura: 'uirapuru' }, x: 100, y: 76, balanco: { amp: 2, periodo: 1.2 } }],
    legendas: [],
    titulo: ['UIRAPURU', 'O CANTO QUE PARA O VENTO'],
  },
];

export const ROTEIROS_CAMPO: Record<string, Roteiro> = {
  catadores: CATADORES,
  zeca_campo: ZECA_CAMPO,
  moleiro: MOLEIRO,
  matinta: MATINTA,
  terreiro_vento: TERREIRO_VENTO,
  perere_vence: PERERE_VENCE,
  catavento_tupa: CATAVENTO_TUPA,
  uirapuru: UIRAPURU,
};
