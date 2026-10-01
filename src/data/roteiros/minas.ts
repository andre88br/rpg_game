/* =========================================================================
   REGIÃO 6 — as Minas da Caipora. A história daqui: o garimpo de bateia,
   que tira o ouro do dia e deixa o resto para a terra, contra a draga da
   Companhia que revira o rio atrás da montanha inteira. E o pai do Zeca
   pede as contas.
   ========================================================================= */
import type { Ator, Roteiro } from '../cutscenes.ts';
import * as M from '../../art/fundos/minas.ts';
import { barcoAmanhecer } from '../../art/cenas.ts';

/* --------------------------------------- a Garimpeira e a forquilha */
const NA_BOCA: readonly Ator[] = [
  { figura: { pessoa: 'garimpeira', dir: 'esq' }, x: 140, y: 72 },
  { figura: { jogador: true, dir: 'dir' }, x: 84, y: 74 },
];

const GARIMPEIRA: Roteiro = [
  { // ela batendo a bateia na pedra
    musica: 'garimpo',
    fundo: M.valeMina,
    atores: [
      { figura: { pessoa: 'garimpeira', dir: 'esq' }, x: 140, y: 72 },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 74, ate: { x: 84, y: 74, por: 2.6 } },
    ],
    legendas: [
      'Na Boca da Mina, uma mulher de capacete amarelo bate a bateia na pedra para tirar o barro.',
      { quem: 'GARIMPEIRA', texto: 'Chegou gente nova no vale! E com medalha no peito, ainda por cima.' },
    ],
  },
  { // a avó dela, com a bateia no rio limpo
    musica: 'lembranca',
    fundo: M.garimpoAntigo,
    atores: [{ figura: { criatura: 'caipora' }, x: 196, y: 50, alfa: 0.4, balanco: { amp: 1, periodo: 2 } }],
    legendas: [
      { quem: 'GARIMPEIRA', texto: 'Minha avó garimpava de bateia neste mesmo riacho. Tirava o ouro do dia e deixava o resto pra terra.' },
      { quem: 'GARIMPEIRA', texto: 'Ela dizia: a Caipora deixa pegar o que a mão aguenta. Quem quer mais, ela faz se perder no mato.' },
    ],
  },
  { // a draga da Companhia
    musica: 'companhia',
    fundo: M.dragaCompanhia,
    atores: [{ figura: { pessoa: 'capataz', dir: 'dir' }, x: 76, y: 70 }],
    legendas: [
      { quem: 'GARIMPEIRA', texto: 'Aí a Companhia trouxe a draga. Revira o rio inteiro atrás de ouro, e o que sobra é lama.' },
      { quem: 'GARIMPEIRA', texto: 'Eu enterrei as minhas três pepitas pra eles não levarem. E agora nem eu acho mais onde!' },
    ],
  },
  { // a forquilha passa para as mãos da criança
    musica: 'garimpo',
    fundo: M.valeMina,
    atores: [
      ...NA_BOCA,
      { figura: { peca: 'forquilha' }, x: 136, y: 80, ate: { x: 96, y: 82, de: 0.5, por: 1.2 }, some: 2.4 },
    ],
    legendas: [
      { quem: 'GARIMPEIRA', texto: 'Toma esta FORQUILHA. Usa ela na mochila: ela diz se o ouro está quente ou frio.' },
      { quem: 'GARIMPEIRA', texto: 'Me traz as três pepitas e eu acendo uma conta da sua guia.' },
    ],
  },
];

/* ------------------------------------------ o Zeca, na estrada da Cava

   O pai dele pediu as contas da Companhia e voltou à Foz para pescar com o
   Mestre do Porto. Agora é o Zeca quem não sabe o que provar. */
const ZECA_MINAS: Roteiro = [
  { // na saída oeste do arraial
    musica: 'zeca',
    fundo: M.arraialCaipora,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 44, y: 98 },
      { figura: { jogador: true, dir: 'esq' }, x: 260, y: 100, ate: { x: 140, y: 100, por: 2.6 } },
    ],
    legendas: [
      'Na saída oeste do arraial, a estrada da Cava Funda tem dono outra vez.',
      { quem: 'ZECA', texto: 'Seis, {crianca}. Seis vezes! Dessa vez eu cavei um time inteiro só pra você.' },
    ],
  },
  { // o pai dele, de volta ao mar, no barco do Mestre
    musica: 'porto',
    fundo: barcoAmanhecer,
    legendas: [
      { quem: 'ZECA', texto: 'Sabe da maior? Meu pai pediu as contas da Companhia. Voltou pra Foz e foi pescar com o Mestre do Porto.' },
      { quem: 'ZECA', texto: 'Diz que prefere peixe pouco e rio vivo. Eu nunca vi ele tão quieto... nem tão contente.' },
    ],
  },
  { // de volta à estrada, com o Minhocão novo
    musica: 'zeca',
    fundo: M.arraialCaipora,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 44, y: 98 },
      { figura: { criatura: 'minhocao' }, x: 4, y: 74, aparece: 0.6, balanco: { amp: 2, periodo: 1.2 } },
      { figura: { jogador: true, dir: 'esq' }, x: 140, y: 100 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Então agora sou eu que tenho que provar alguma coisa. Pra ele, pra mim, sei lá.' },
      { quem: 'ZECA', texto: 'Sexta vez. A Cava Funda é minha até você passar por cima!' },
    ],
    titulo: ['ZECA', 'SEXTA VEZ'],
  },
];

/* ------------------------------------- o Tuco de volta, na Dona Luzia */
const NA_PORTA: readonly Ator[] = [
  { figura: { pessoa: 'firmina', dir: 'esq' }, x: 150, y: 94 },
  { figura: { pessoa: 'crianca', dir: 'esq' }, x: 134, y: 98 },
  { figura: { jogador: true, dir: 'dir' }, x: 90, y: 98 },
];

const TUCO: Roteiro = [
  { // ele larga a mão e corre
    musica: 'garimpo',
    fundo: M.arraialCaipora,
    atores: [
      { figura: { pessoa: 'firmina', dir: 'esq' }, x: 150, y: 94 },
      { figura: { pessoa: 'crianca', dir: 'dir' }, x: 74, y: 100, ate: { x: 134, y: 98, de: 0.3, por: 1.2 } },
      { figura: { jogador: true, dir: 'dir' }, x: 90, y: 98 },
    ],
    legendas: [
      'O Tuco larga a sua mão e sai correndo pela rua do arraial.',
      { quem: 'DONA LUZIA', texto: 'TUCO! Meu filho! Onde é que você se meteu, menino?!' },
    ],
  },
  { // o que ele viu nas Galerias
    musica: 'lembranca',
    fundo: M.galeriaMina,
    atores: [
      { figura: { pessoa: 'crianca', dir: 'cima' }, x: 112, y: 120, ate: { x: 112, y: 84, de: 0.3, por: 3 } },
    ],
    legendas: [
      { quem: 'TUCO', texto: 'Eu vi um vagonete andando sozinho nos trilhos velhos, mãe! Fui atrás, e o trilho não deixava voltar.' },
      { quem: 'TUCO', texto: 'Lá no fundo tinha um sino. E quando a gente tocou, alguém assobiou de volta no escuro.' },
    ],
  },
  { // de volta à porta, a conta
    musica: 'garimpo',
    fundo: M.arraialCaipora,
    atores: NA_PORTA,
    legendas: [
      { quem: 'DONA LUZIA', texto: 'Aquelas galerias são da mina velha, que a Companhia largou quando abriu a cava dela.' },
      { quem: 'DONA LUZIA', texto: 'Deus te pague, {crianca}. Toma, é pouco. E a sua guia tem mais uma conta acesa.' },
    ],
  },
];

/* ---------------------------------------------- o Mapinguari da cava */
const MAPINGUARI: Roteiro = [
  { // o fundo da cava treme
    musica: 'mapinguari',
    fundo: M.cavaFunda,
    atores: [{ figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.6 } }],
    legendas: [
      'No fundo da Cava Funda, o chão afunda de um lado... depois do outro.',
      'Um ronco grosso sobe do buraco, e a cava inteira treme.',
    ],
  },
  { // um olho só, no meio da testa
    fundo: M.cavaFunda,
    atores: [
      { figura: { criatura: 'mapinguari' }, x: 100, y: 96, ate: { x: 100, y: 52, de: 0.3, por: 2 }, aparece: 0.3 },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    efeitos: [{ tipo: 'poeira', x: 120, y: 104, aparece: 0.3, some: 2.6 }],
    legendas: [
      'Um olho só se abre no meio da testa. O Mapinguari respira pela boca da barriga.',
      'Dizem que ele guarda o fundo da terra de quem cava sem pedir licença.',
    ],
  },
  { // o letreiro do bicho
    fundo: M.cavaFunda,
    atores: [{ figura: { criatura: 'mapinguari' }, x: 100, y: 76, balanco: { amp: 1, periodo: 1.6 } }],
    legendas: [],
    titulo: ['MAPINGUARI', 'O DONO DA CAVA'],
  },
];

/* ---------------------------------------------- o Terreiro da Pedra */
const NO_TRONO: readonly Ator[] = [
  { figura: { pessoa: 'ubirajara', dir: 'baixo' }, x: 112, y: 12 },
];

const TERREIRO_PEDRA: Roteiro = [
  { // o salão de rocha viva
    musica: 'terreiro_pedra',
    fundo: M.salaoPedra,
    atores: [...NO_TRONO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 70, por: 2.8 } }],
    legendas: [
      'O Terreiro da Pedra é cavado na rocha viva, e os trilhos da mina velha atravessam o salão.',
      'Lá no alto, num trono de pedra, alguém de capacete de ferro espera de braços cruzados.',
    ],
  },
  { // a montanha de antigamente
    musica: 'encantados',
    fundo: M.montanhaAntiga,
    atores: [{ figura: { criatura: 'caipora' }, x: 100, y: 16, alfa: 0.6, balanco: { amp: 2, periodo: 1.6 } }],
    legendas: [
      { quem: 'UBIRAJARA', texto: 'A Caipora sempre deixou o povo do vale tirar o ouro do dia. Ouro dormindo embaixo, mata em cima.' },
      { quem: 'UBIRAJARA', texto: 'A Companhia quer a montanha inteira de uma vez. E montanha cavada sem licença desmorona.' },
    ],
  },
  { // ele, e o letreiro
    musica: 'terreiro_pedra',
    fundo: M.salaoPedra,
    atores: [...NO_TRONO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 70 }],
    legendas: [
      { quem: 'UBIRAJARA', texto: 'Cavou, respondeu as charadas, trouxe o Tuco de volta e desceu a cava. O vale fala bem de você.' },
      { quem: 'UBIRAJARA', texto: 'Mas pedra não se apressa: puxa a alavanca certa antes do trilho, {crianca}.' },
    ],
    titulo: ['UBIRAJARA', 'O DONO DO TERREIRO'],
  },
];

const UBIRAJARA_VENCE: Roteiro = [
  { // a poeira assenta, os cristais acendem
    musica: 'terreiro_pedra',
    fundo: M.salaoPedra,
    depois: { fundo: M.salaoPedraCalmo, de: 0.6, por: 3 },
    atores: [...NO_TRONO, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 70 }],
    legendas: [
      'Quando a luta acaba, a poeira do salão assenta, e os cristais da parede acendem sozinhos.',
      { quem: 'UBIRAJARA', texto: 'A pedra cedeu. Pouca gente consegue isso comigo.' },
    ],
  },
  { // a draga ainda no rio
    musica: 'companhia',
    fundo: M.dragaCompanhia,
    legendas: [
      { quem: 'UBIRAJARA', texto: 'A draga ainda revira o rio lá embaixo. Mas o arraial voltou pra bateia.' },
      { quem: 'UBIRAJARA', texto: 'Seis medalhas, {crianca}. Seis terreiros respondendo junto. Isso a Companhia não compra.' },
    ],
  },
  { // a medalha
    musica: 'terreiro_pedra',
    fundo: M.salaoPedraCalmo,
    atores: [
      ...NO_TRONO,
      { figura: { medalha: 'pedra', tam: 24 }, x: 108, y: 44, aparece: 0.4, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 70 },
    ],
    legendas: [
      { quem: 'UBIRAJARA', texto: 'A MEDALHA PEDRA é sua. Chega aqui do meu lado, que eu mesmo te entrego.' },
    ],
  },
];

/* --------------------------------------- a saída para o Bairro da Cuca */
const ARRAIAL_CUCA: Roteiro = [
  { // o arraial bate a bateia, feito sino
    musica: 'garimpo',
    fundo: M.arraialCaipora,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: 90, y: 98 },
      { figura: { pessoa: 'firmina', dir: 'esq' }, x: 250, y: 96, ate: { x: 140, y: 96, de: 0.3, por: 2.2 } },
      { figura: { pessoa: 'crianca', dir: 'esq' }, x: 270, y: 100, ate: { x: 160, y: 100, de: 0.3, por: 2.2 } },
    ],
    legendas: [
      'Lá fora, o arraial inteiro bate a bateia na pedra, feito sino: a Medalha Pedra já correu o vale.',
      { quem: 'DONA LUZIA', texto: 'Medalha Pedra! O Tuco não para de contar pra todo mundo que foi você que trouxe ele de volta.' },
    ],
  },
  { // o bairro lá do outro lado
    musica: 'viagem',
    fundo: M.cucaAoLonge,
    legendas: [
      { quem: 'DONA LUZIA', texto: 'Na beira oeste da Cava Funda, a terra desmoronou e fechou a estrada velha. O Dom Escavar abre.' },
      { quem: 'DONA LUZIA', texto: 'Do outro lado fica o Bairro da Cuca. Lá a noite não acaba, e criança não sai de casa depois que escurece.' },
    ],
    titulo: ['BAIRRO DA CUCA', 'ONDE A NOITE NÃO DORME'],
  },
];

/* ------------------------------------------------------- a Caipora */
const CAIPORA: Roteiro = [
  { // o assobio no fundo da cava
    musica: 'encantados',
    fundo: M.cavaFunda,
    atores: [{ figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 }],
    legendas: [
      'No fundo da Cava Funda, um assobio fino corta o silêncio. Não tem ninguém à vista.',
      'Os três diamantes do Ourives foram achados sem derrubar uma árvore. Alguém ficou sabendo.',
    ],
  },
  { // ela vem montada no porco-do-mato
    fundo: M.cavaFunda,
    atores: [
      { figura: { criatura: 'caipora' }, x: -50, y: 60, ate: { x: 100, y: 60, de: 0.3, por: 2.4 }, balanco: { amp: 3, periodo: 0.35, salto: true } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    efeitos: [{ tipo: 'poeira', x: 116, y: 96, aparece: 2.4, some: 3.6 }],
    legendas: [
      { quem: 'CAIPORA', texto: 'Três diamantes achados sem derrubar uma árvore. Quem garimpa assim, eu acompanho.' },
    ],
  },
  { // o letreiro
    fundo: M.cavaFunda,
    atores: [{ figura: { criatura: 'caipora' }, x: 100, y: 76, balanco: { amp: 2, periodo: 0.5, salto: true } }],
    legendas: [],
    titulo: ['CAIPORA', 'A DONA DO MATO E DO OURO'],
  },
];

export const ROTEIROS_MINAS: Record<string, Roteiro> = {
  garimpeira: GARIMPEIRA,
  zeca_minas: ZECA_MINAS,
  tuco: TUCO,
  mapinguari: MAPINGUARI,
  terreiro_pedra: TERREIRO_PEDRA,
  ubirajara_vence: UBIRAJARA_VENCE,
  arraial_cuca: ARRAIAL_CUCA,
  caipora: CAIPORA,
};
