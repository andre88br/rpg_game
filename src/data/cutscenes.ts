/* =========================================================================
   Os roteiros das cutscenes: dado puro, tocado por scenes/cutscene.ts.

   Um roteiro é uma fila de TOMADAS. Cada tomada tem um fundo pintado (que
   pode ser mais largo que a tela, e aí a câmera anda por ele), quem aparece
   por cima — gente, Encantado, medalha, peça — e as legendas, uma página
   por A. B pula a cutscene inteira.

   Tempos em segundos desde o começo da tomada; posições em pixels do fundo
   (canto de cima à esquerda do sprite).

   Para tocar uma cutscene a partir do mundo, uma fala ou um treinador
   vencido leva `cutscene: '<id daqui>'` — e ela toca uma vez só (a flag
   `viu_cut_<id>`). Um treinador com `apresentacao: '<id>'` toca a dele
   ANTES da primeira luta, logo depois da fala de desafio.
   ========================================================================= */
import type { Buf } from '../core/buf.ts';
import type { Direcao } from '../art/people.ts';
import * as C from '../art/cenas.ts';

export type Figura =
  | { pessoa: string; dir?: Direcao }
  /* quem está jogando (Tainá ou Bento) e o primeiro Encantado do time —
     resolvidos na hora, a partir da partida */
  | { jogador: true; dir?: Direcao }
  | { inicial: true; flip?: boolean }
  | { criatura: string; flip?: boolean }
  | { medalha: string; tam?: number }
  | { peca: 'fogueira' | 'trator' | 'rede' | 'farol' };

export interface Ator {
  figura: Figura;
  x: number; y: number;
  /* anda até (x, y) de `ate`, começando em `de` e levando `por` segundos.
     Gente anda com os passos; o trator, com a esteira. `vaiVolta` repete
     a ida e a volta para sempre. */
  ate?: { x: number; y: number; de?: number; por: number; vaiVolta?: boolean };
  /* surge (e some) com fade, em vez de estar lá desde o começo */
  aparece?: number;
  some?: number;
  /* opacidade máxima: os Encantados que ninguém mais vê ficam meio apagados */
  alfa?: number;
  /* desenhado por cima de todos os outros, fora da ordem por altura: o
     farol que esconde o Boitatá */
  frente?: boolean;
  /* flutua (seno) ou pula (só para cima) no lugar */
  balanco?: { amp: number; periodo: number; salto?: boolean; fase?: number };
}

/* partículas desenhadas na hora, sem estado: saem de (x, y) e sobem */
export interface Efeito {
  tipo: 'fagulhas' | 'fumaca' | 'poeira';
  x: number; y: number;
  aparece?: number;
  some?: number;
}

export interface Tomada {
  fundo: () => Buf;
  /* um segundo fundo que vai cobrindo o primeiro: o antes e o depois */
  depois?: { fundo: () => Buf; de: number; por: number };
  /* só para fundos mais largos que a tela: de onde a câmera sai e aonde vai */
  camera?: { de: number; ate: number; inicio?: number; por: number };
  atores?: readonly Ator[];
  efeitos?: readonly Efeito[];
  /* páginas de legenda, cada uma no máximo LINHAS_LEGENDA linhas. Aceitam
     o recheio das falas ({nome}, {crianca}...) e {inicial}, o nome do
     primeiro Encantado do time */
  legendas: readonly Legenda[];
  /* letreiro grande no meio da tela (a tomada final da abertura) */
  titulo?: readonly string[];
}

/* uma página de legenda: narração solta, ou a fala de alguém (o nome vai
   numa etiqueta em cima da faixa) */
export type Legenda = string | { quem: string; texto: string };

export const textoDe = (l: Legenda): string => typeof l === 'string' ? l : l.texto;

export type Roteiro = readonly Tomada[];

/* a faixa da legenda: largura útil e quantas linhas cabem nela */
export const LARG_LEGENDA = 240 - 20;
export const LINHAS_LEGENDA = 3;

/* as medalhas em arco, acendendo uma depois da outra */
const ORDEM_MEDALHAS = ['mare', 'raiz', 'brasa', 'rodamoinho', 'trovao', 'pedra', 'breu', 'aurora'];
const arcoMedalhas: Ator[] = ORDEM_MEDALHAS.map((id, i) => {
  const a = Math.PI * (0.92 - (i / 7) * 0.84);
  return {
    figura: { medalha: id, tam: 16 },
    x: Math.round(120 + Math.cos(a) * 92 - 8),
    y: Math.round(66 - Math.sin(a) * 44 - 8),
    aparece: 0.8 + i * 0.45,
    balanco: { amp: 1, periodo: 2.4, fase: i * 0.7 },
  };
});

/* ------------------------------------------------------------ a abertura */
const INTRO: Roteiro = [
  { // a avó conta, na beira do fogo
    fundo: C.noiteFogueira,
    atores: [
      { figura: { peca: 'fogueira' }, x: 108, y: 88 },
      { figura: { pessoa: 'avo', dir: 'dir' }, x: 78, y: 90 },
      { figura: { pessoa: 'crianca', dir: 'esq' }, x: 146, y: 92 },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 120, y: 92 }],
    legendas: ['Diz a avó que, antes de tudo, o mato falava.'],
  },
  { // o rio, a mata e a serra, cada um com quem mora nele
    fundo: C.panoramaNatureza,
    camera: { de: 0, ate: C.LARG_PANORAMA - 240, inicio: 0.6, por: 16 },
    atores: [
      { figura: { criatura: 'iarinha' }, x: 70, y: 76, balanco: { amp: 14, periodo: 1.5, salto: true } },
      { figura: { criatura: 'curupinho' }, x: 250, y: 70,
        ate: { x: 330, y: 72, por: 5, vaiVolta: true } },
      { figura: { criatura: 'sacizinho' }, x: 360, y: 20,
        ate: { x: 440, y: 30, por: 6, vaiVolta: true }, balanco: { amp: 4, periodo: 1.2 } },
      { figura: { criatura: 'boitatinha' }, x: 490, y: 62, balanco: { amp: 3, periodo: 2 } },
    ],
    legendas: [
      'Cada rio tinha dona. Cada fogo tinha gênio.',
      'Cada vento tinha nome — e respondia por ele, se alguém soubesse chamar.',
    ],
  },
  { // a vila de hoje: ninguém olha, e eles continuam ali
    fundo: C.vilaHoje,
    atores: [
      { figura: { criatura: 'iarinha' }, x: 24, y: 70, alfa: 0.35, aparece: 1.2, balanco: { amp: 2, periodo: 2.2 } },
      { figura: { criatura: 'caiporinha' }, x: 104, y: 72, alfa: 0.35, aparece: 2.0, balanco: { amp: 2, periodo: 2.6 } },
      { figura: { criatura: 'sacizinho' }, x: 186, y: 62, alfa: 0.35, aparece: 2.8, balanco: { amp: 3, periodo: 1.8 } },
      { figura: { pessoa: 'aldeao', dir: 'dir' }, x: -20, y: 90, ate: { x: 260, y: 90, por: 10 } },
      { figura: { pessoa: 'pescador', dir: 'esq' }, x: 250, y: 100, ate: { x: -20, y: 100, de: 1.5, por: 11 } },
    ],
    legendas: [
      'Hoje poucos escutam mais.',
      'Mas os Encantados continuam aí: na água do rio, na mata fechada, na brasa do fogão de lenha.',
    ],
  },
  { // a Companhia chega: o trator passa e a mata vira toco
    fundo: C.mataAntes,
    depois: { fundo: C.mataDepois, de: 2.5, por: 3 },
    atores: [
      { figura: { peca: 'trator' }, x: -60, y: 62, ate: { x: 96, y: 62, de: 0.4, por: 5 } },
      { figura: { pessoa: 'capataz', dir: 'baixo' }, x: 216, y: 70, aparece: 5 },
    ],
    efeitos: [{ tipo: 'fumaca', x: 60, y: 60, aparece: 3 }, { tipo: 'fumaca', x: 190, y: 56, aparece: 4 }],
    legendas: [
      'E a Companhia Mata-Seca anda comprando terra e calando rio, região por região.',
      'Alguém vai ter que discordar.',
    ],
  },
  { // a trilha ao amanhecer, e as oito medalhas no céu
    fundo: C.trilhaAurora,
    atores: [
      ...arcoMedalhas,
      { figura: { pessoa: 'taina', dir: 'cima' }, x: 96, y: 112, ate: { x: 108, y: 94, de: 0.4, por: 7 } },
      { figura: { pessoa: 'bento', dir: 'cima' }, x: 126, y: 114, ate: { x: 118, y: 96, de: 0.4, por: 7 } },
    ],
    legendas: [
      'Quem souber escutar de novo pode andar a Trilha das Oito Medalhas:',
      'terreiro por terreiro, até onde os antigos moram.',
    ],
  },
  { // o letreiro
    fundo: C.ceuTitulo,
    atores: [
      { figura: { criatura: 'iarinha' }, x: 62, y: 98, aparece: 1.4, balanco: { amp: 2, periodo: 2 } },
      { figura: { criatura: 'boitatinha' }, x: 104, y: 94, aparece: 1.7, balanco: { amp: 2, periodo: 2, fase: 0.7 } },
      { figura: { criatura: 'curupinho' }, x: 146, y: 98, aparece: 2.0, balanco: { amp: 2, periodo: 2, fase: 1.4 } },
    ],
    legendas: [],
    titulo: ['ENCANTADOS', 'A TRILHA DAS OITO MEDALHAS'],
  },
];

/* ------------------------------------------ o primeiro patuá, na casa da Firmina

   Toca quando fecha a conversa da escolha do inicial. É onde a Companhia
   Mata-Seca deixa de ser história de avó e chega à Foz. */
const FIRMINA: Roteiro = [
  { // os três na sala: o patuá escolhido em cima da mesa
    fundo: C.salaFirmina,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: 56, y: 84 },
      { figura: { inicial: true }, x: 104, y: 56, aparece: 0.3, balanco: { amp: 2, periodo: 2.4 } },
      { figura: { pessoa: 'firmina', dir: 'esq' }, x: 166, y: 84 },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 149, y: 74, aparece: 0.4 }],
    legendas: [
      '{inicial} ficou em cima da mesa, olhando de um para o outro, como quem já sabia o caminho.',
      { quem: 'DONA FIRMINA', texto: 'Patuá escolhido é laço feito, {crianca}. E eu não te chamei aqui à toa.' },
    ],
  },
  { // a Companhia desce na praia da Foz
    fundo: C.fozEstacas,
    atores: [
      { figura: { pessoa: 'capataz', dir: 'dir' }, x: 30, y: 92 },
      { figura: { pessoa: 'capataz', dir: 'dir' }, x: 70, y: 100, ate: { x: 120, y: 100, de: 0.6, por: 4 } },
      { figura: { pessoa: 'pescador', dir: 'esq' }, x: 196, y: 96, aparece: 2.2 },
    ],
    legendas: [
      { quem: 'DONA FIRMINA', texto: 'Semana passada desceu na Foz uma lancha da Companhia Mata-Seca. Gente de boné, estaca e papel carimbado.' },
      { quem: 'DONA FIRMINA', texto: 'Mediram a praia, contaram as redes e disseram ao Mestre do Porto que o rio agora tem dono.' },
    ],
  },
  { // a comporta, e quem morava no rio indo embora
    fundo: C.rioCalado,
    atores: [
      { figura: { criatura: 'iaraMae' }, x: 60, y: 54, alfa: 0.9, some: 6.5,
        ate: { x: 10, y: 50, de: 4, por: 3.5 }, balanco: { amp: 2, periodo: 2.2 } },
      { figura: { criatura: 'piragua', flip: true }, x: 86, y: 76, some: 5,
        balanco: { amp: 10, periodo: 1.3, salto: true } },
    ],
    legendas: [
      { quem: 'DONA FIRMINA', texto: 'Rio calado não fica calado por muito tempo. Quem mora nele vai embora... ou fica bravo.' },
      { quem: 'DONA FIRMINA', texto: 'E quando os Encantados ficam bravos, quem paga é a vila inteira.' },
    ],
  },
  { // de volta à sala
    fundo: C.salaFirmina,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: 56, y: 84 },
      { figura: { inicial: true }, x: 104, y: 56, balanco: { amp: 2, periodo: 2.4 } },
      { figura: { pessoa: 'firmina', dir: 'esq' }, x: 166, y: 84, ate: { x: 150, y: 84, de: 0.5, por: 1.2 } },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 149, y: 74 }],
    legendas: [
      { quem: 'DONA FIRMINA', texto: 'Os terreiros ainda seguram esta terra. Cada medalha é um mestre dizendo: aqui tem quem responda.' },
      { quem: 'DONA FIRMINA', texto: 'Mas começa pequeno. Chegue aqui outra vez, que eu tenho um serviço para vocês dois.' },
    ],
  },
];


/* ------------------------------------------ o Zeca, no paredão da Rota da Foz

   Toca no primeiro encontro, entre a fala de desafio e a batalha
   (`apresentacao` do treinador). Apresenta o rival e a história dele: o
   redemoinho que deu o apelido, e o pai que foi trabalhar para a Companhia. */
const ZECA: Roteiro = [
  { // a tranca atravessada na estrada, e o Zeca esperando
    fundo: C.paredaoRota,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 58 },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 90, ate: { x: 78, y: 90, por: 3 } },
      { figura: { inicial: true }, x: -56, y: 78, ate: { x: 42, y: 78, por: 3 }, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      'No paredão da Rota da Foz, alguém atravessou uma tranca de pau no meio da estrada.',
      { quem: 'ZECA', texto: 'Demorou, hein? Tô te esperando desde que a Dona Firmina mandou te chamar.' },
    ],
  },
  { // o letreiro do rival
    fundo: C.paredaoRota,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 104 },
      { figura: { criatura: 'sacizinho' }, x: 130, y: 86, aparece: 0.6, balanco: { amp: 4, periodo: 0.8 } },
    ],
    legendas: [],
    titulo: ['ZECA', 'O REDEMOINHO'],
  },
  { // a lembrança: o Zeca pequeno pulando no redemoinho atrás do Sacizinho
    fundo: C.redemoinhoLembranca,
    atores: [
      { figura: { criatura: 'sacizinho' }, x: 146, y: 60, balanco: { amp: 5, periodo: 0.45 } },
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 10, y: 96, ate: { x: 142, y: 96, de: 0.6, por: 4 } },
    ],
    efeitos: [{ tipo: 'fumaca', x: 160, y: 112, aparece: 0.5 }],
    legendas: [
      'O Zeca mora na casa da frente. Um ano mais velho, dois palmos mais alto e o dobro de falante.',
      'Um dia ele pulou dentro de um redemoinho atrás de um Sacizinho.',
      'E saiu lá de dentro com o gorro vermelho do bicho na mão.',
      'Desde então, a vila inteira chama ele de Zeca Redemoinho.',
    ],
  },
  { // o pai dele, de uniforme da Companhia, na praia das estacas
    fundo: C.fozEstacas,
    atores: [
      { figura: { pessoa: 'paiZeca', dir: 'esq' }, x: 132, y: 94 },
      { figura: { pessoa: 'capataz', dir: 'esq' }, x: 166, y: 96 },
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 40, y: 84, aparece: 0.8 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Meu pai foi trabalhar pra Companhia Mata-Seca. Diz que agora tem salário todo mês.' },
      { quem: 'ZECA', texto: 'E diz que Encantado é história de avó. Eu já nem sei mais em quem acreditar.' },
    ],
  },
  { // de volta ao paredão, frente a frente
    fundo: C.paredaoRota,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 58, ate: { x: 112, y: 70, de: 0.4, por: 1 } },
      { figura: { jogador: true, dir: 'dir' }, x: 78, y: 90 },
      { figura: { criatura: 'sacizinho' }, x: 136, y: 46, balanco: { amp: 3, periodo: 1 } },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'E a Dona Firmina deu patuá foi pra você. O meu, eu peguei sozinho, no mato.' },
      { quem: 'ZECA', texto: 'Então vamos ver quem merece andar a trilha. Quer passar? Passa por cima de mim!' },
    ],
  },
];

/* ------------------------------------------ o Mestre do Porto, com a carta

   Toca quando o Mestre recebe a carta da Dona Firmina: a história do porto,
   a Companhia querendo comprar tudo, e os dois serviços que ele deixa — as
   redes sumidas e o bicho do farol. */
const MESTRE: Roteiro = [
  { // o cais: ele lê a carta
    fundo: C.caisIara,
    atores: [
      { figura: { pessoa: 'pescador', dir: 'esq' }, x: 150, y: 88 },
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 88 },
      { figura: { inicial: true }, x: 62, y: 78, balanco: { amp: 1, periodo: 1.8 } },
    ],
    legendas: [
      'O Mestre do Porto leu a carta duas vezes, devagar, como quem conta rede.',
      { quem: 'MESTRE DO PORTO', texto: 'A Firmina escreve pouco e diz muito. Diz que você é de confiança.' },
    ],
  },
  { // o porto de antigamente: trinta barcos e a Iara-Mãe guiando na neblina
    fundo: C.portoAntigo,
    atores: [
      { figura: { criatura: 'iaraMae' }, x: 96, y: 58, alfa: 0.55, aparece: 0.8,
        ate: { x: 136, y: 56, de: 0.8, por: 6 }, balanco: { amp: 2, periodo: 2.4 } },
    ],
    legendas: [
      { quem: 'MESTRE DO PORTO', texto: 'No tempo do meu pai, a Foz tinha trinta barcos.' },
      { quem: 'MESTRE DO PORTO', texto: 'E quando a neblina baixava, a Iara-Mãe trazia um por um de volta pra casa.' },
    ],
  },
  { // a Companhia com o papel carimbado
    fundo: C.fozEstacas,
    atores: [
      { figura: { pessoa: 'pescador', dir: 'dir' }, x: 100, y: 94 },
      { figura: { pessoa: 'capataz', dir: 'esq' }, x: 150, y: 94, ate: { x: 122, y: 94, de: 0.3, por: 1.6 } },
    ],
    legendas: [
      { quem: 'MESTRE DO PORTO', texto: 'Agora a Companhia quer comprar o porto inteiro. Mandaram papel dizendo que o rio tem dono.' },
      { quem: 'MESTRE DO PORTO', texto: 'Eu disse que o rio é da Iara. Riram de mim.' },
    ],
  },
  { // as redes sumindo de noite
    fundo: C.varalRedes,
    atores: [
      { figura: { criatura: 'sacizinho' }, x: 120, y: 84, ate: { x: 250, y: 90, de: 0.5, por: 3.5 }, balanco: { amp: 4, periodo: 0.5 } },
      { figura: { criatura: 'sacizinho', flip: true }, x: 110, y: 100, ate: { x: -40, y: 104, de: 1.2, por: 3.5 }, balanco: { amp: 4, periodo: 0.5, fase: 1 } },
    ],
    legendas: [
      { quem: 'MESTRE DO PORTO', texto: 'E pra piorar, sumiram três redes minhas. Dizem que foi bicho, não gente.' },
      { quem: 'MESTRE DO PORTO', texto: 'Sem rede não tem peixe. E sem peixe, eu acabo vendendo o barco pra eles.' },
    ],
  },
  { // de volta ao cais, com o farol ao fundo
    fundo: C.caisIara,
    atores: [
      { figura: { pessoa: 'pescador', dir: 'esq' }, x: 150, y: 88 },
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 88 },
      { figura: { inicial: true }, x: 62, y: 78, balanco: { amp: 1, periodo: 1.8 } },
    ],
    legendas: [
      { quem: 'MESTRE DO PORTO', texto: 'Essa primeira conta é sua, pela carta. Traz as três redes e eu acendo outra.' },
      { quem: 'MESTRE DO PORTO', texto: 'E repara no farol: de noite ele acende sozinho. Tem bicho morando lá, {crianca}.' },
    ],
  },
];

/* ---------------------------------------- as redes de volta, no Mestre

   Toca quando o Mestre do Porto recebe as três redes: ele desembola os nós
   de Saci, as redes voltam pro varal de noite (com um gorro vermelho
   espiando de longe) e, de manhã, o barco dele sai pela barra. */
const MESTRE_REDES: Roteiro = [
  { // no cais: as três redes no tabuado
    fundo: C.caisIara,
    atores: [
      { figura: { peca: 'rede' }, x: 100, y: 102 },
      { figura: { peca: 'rede' }, x: 128, y: 104 },
      { figura: { peca: 'rede' }, x: 114, y: 96 },
      { figura: { pessoa: 'pescador', dir: 'esq' }, x: 160, y: 88 },
      { figura: { jogador: true, dir: 'dir' }, x: 80, y: 88 },
      { figura: { inicial: true }, x: 46, y: 78, balanco: { amp: 1, periodo: 1.8 } },
    ],
    legendas: [
      'O Mestre do Porto espalha as três redes no tabuado e desfaz os nós um por um.',
      { quem: 'MESTRE DO PORTO', texto: 'Nó de Saci não tem fim, mas rede boa aguenta. Estão inteiras, {crianca}.' },
    ],
  },
  { // de noite, as redes de volta no varal, e um gorro espiando
    fundo: C.varalCheio,
    atores: [
      { figura: { criatura: 'sacizinho', flip: true }, x: 212, y: 56, alfa: 0.7, aparece: 1.2, some: 4.2,
        balanco: { amp: 2, periodo: 0.8 } },
    ],
    legendas: [
      'Naquela noite, as três redes voltaram pro varal do Mestre.',
      'Lá do fim da praia, um gorro vermelho espiou... e foi embora rindo, sem levar nada.',
    ],
  },
  { // de manhã cedo, o barco sai pela barra
    fundo: C.barcoAmanhecer,
    legendas: [
      'E no clarear do dia, pela primeira vez em muito tempo, um barco saiu pela barra.',
      { quem: 'MESTRE DO PORTO', texto: 'A Companhia que espere sentada. Enquanto tiver peixe, o barco é meu.' },
    ],
  },
  { // de volta ao cais, a conta
    fundo: C.caisIara,
    atores: [
      { figura: { pessoa: 'pescador', dir: 'esq' }, x: 150, y: 88 },
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 88 },
      { figura: { inicial: true }, x: 62, y: 78, balanco: { amp: 1, periodo: 1.8 } },
    ],
    legendas: [
      { quem: 'MESTRE DO PORTO', texto: 'Promessa é promessa: outra conta da guia acesa por sua conta.' },
      { quem: 'MESTRE DO PORTO', texto: 'O rio ainda é da Iara, {crianca}. Enquanto tiver gente pescando nele.' },
    ],
  },
];

/* ---------------------------------------------------- o Boitatá do farol

   Toca quando o jogador chega perto da ponta do cais, depois das redes: o
   mar ferve, e o Boitatá desenrola de trás do farol. A luta começa assim
   que ela acaba (o NPC é `emboscada`). */
const BOITATA: Roteiro = [
  { // a ponta do cais, e o mar começando a ferver
    fundo: C.caisDoFarol,
    atores: [
      { figura: { peca: 'farol' }, x: 150, y: 2, frente: true },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 80, ate: { x: 64, y: 80, por: 2.6 } },
      { figura: { inicial: true }, x: -56, y: 70, ate: { x: 28, y: 70, por: 2.6 }, balanco: { amp: 1, periodo: 1.6 } },
    ],
    efeitos: [{ tipo: 'fumaca', x: 140, y: 100, aparece: 1.6 }],
    legendas: [
      'A ponta do cais, no pé do Farol da Barra. A porta está emperrada há anos.',
      'De repente a água em volta começa a ferver, e a tábua esquenta debaixo do pé.',
    ],
  },
  { // de trás do farol, a cobra de fogo
    fundo: C.caisDoFarol,
    atores: [
      { figura: { peca: 'farol' }, x: 150, y: 2, frente: true },
      { figura: { criatura: 'boitatao', flip: true }, x: 166, y: 62,
        ate: { x: 102, y: 62, de: 0.6, por: 2.4 }, balanco: { amp: 2, periodo: 1.2 } },
      { figura: { jogador: true, dir: 'dir' }, x: 64, y: 80 },
      { figura: { inicial: true }, x: 28, y: 70, balanco: { amp: 1, periodo: 1.6 } },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 150, y: 104, aparece: 0.8 }],
    legendas: [
      'De trás do farol desenrola uma cobra de fogo, com dois olhos acesos feito lanterna.',
      'É ela quem acende o farol toda noite. E ela não gosta de visita.',
    ],
  },
  { // o letreiro do bicho
    fundo: C.caisDoFarol,
    atores: [
      { figura: { peca: 'farol' }, x: 150, y: 2, frente: true },
      { figura: { criatura: 'boitatao', flip: true }, x: 100, y: 74, balanco: { amp: 3, periodo: 0.9 } },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 120, y: 110 }],
    legendas: [],
    titulo: ['BOITATÁ', 'O BICHO DO FAROL'],
  },
];

/* ------------------------------------------- os Sacizinhos das três redes

   Cada Sacizinho tem o seu esconderijo e duas cutscenes: a de quando o
   jogador chega perto pela primeira vez (`encontro` do NPC) e a de quando
   perde a briga, larga a rede e vira vento (`cutscene` do treinador). As
   duas saem do mesmo molde, mudando só o lugar. */
interface Esconderijo {
  fundo: () => Buf;
  saci: { x: number; y: number };
  rede: { x: number; y: number };
  /* por onde o jogador chega, e onde para */
  de: { x: number; y: number };
  ate: { x: number; y: number };
  dir: Direcao;
  onde: string;        // a primeira página: o lugar
  chao: string;        // "no capim", "na areia"...
}

function sacizinhoAchado(e: Esconderijo): Roteiro {
  return [
    { // lá está ele, brincando com a rede
      fundo: e.fundo,
      atores: [
        { figura: { peca: 'rede' }, x: e.rede.x, y: e.rede.y },
        { figura: { criatura: 'sacizinho' }, x: e.saci.x, y: e.saci.y, balanco: { amp: 2, periodo: 0.9 } },
        { figura: { jogador: true, dir: e.dir }, x: e.de.x, y: e.de.y, ate: { ...e.ate, de: 0.4, por: 2.4 } },
      ],
      legendas: [
        e.onde,
        'É um Sacizinho, dando nó e mais nó na rede do Mestre do Porto.',
      ],
    },
    { // ele te vê, agarra a rede e se prepara pra correr
      fundo: e.fundo,
      atores: [
        { figura: { criatura: 'sacizinho' }, x: e.saci.x, y: e.saci.y, balanco: { amp: 6, periodo: 0.4, salto: true } },
        { figura: { jogador: true, dir: e.dir }, x: e.ate.x, y: e.ate.y },
      ],
      legendas: [
        { quem: 'SACIZINHO', texto: 'Hi-hi-hi! Achou, é? A rede é minha agora. Quer? Vem pegar!' },
        'Sacizinho foge de quem chega perto. Encurrale ele num canto, sem ter pra onde pular.',
      ],
    },
  ];
}

function sacizinhoVencido(e: Esconderijo): Roteiro {
  return [
    { // tonto da briga, ele afrouxa o pé e a rede cai
      fundo: e.fundo,
      atores: [
        { figura: { criatura: 'sacizinho' }, x: e.saci.x, y: e.saci.y, balanco: { amp: 2, periodo: 1.6 } },
        { figura: { peca: 'rede' }, x: e.rede.x, y: e.rede.y, aparece: 1 },
        { figura: { jogador: true, dir: e.dir }, x: e.ate.x, y: e.ate.y },
      ],
      legendas: [
        'Tonto da briga, o Sacizinho cambaleia numa perna só e afrouxa o pé...',
        `...e a rede do Mestre cai ${e.chao}.`,
      ],
    },
    { // num assobio, ele vira redemoinho e some
      fundo: e.fundo,
      atores: [
        { figura: { peca: 'rede' }, x: e.rede.x, y: e.rede.y },
        { figura: { criatura: 'sacizinho' }, x: e.saci.x, y: e.saci.y, some: 1.4,
          ate: { x: e.saci.x + 8, y: e.saci.y - 36, de: 0.5, por: 1 } },
        { figura: { jogador: true, dir: e.dir }, x: e.ate.x, y: e.ate.y },
      ],
      efeitos: [{ tipo: 'poeira', x: e.saci.x + 16, y: e.saci.y + 34, aparece: 0.2, some: 2.8 }],
      legendas: [
        'Num assobio, ele vira redemoinho e some no vento, rindo até o fim.',
        'A REDE DE PESCA é sua. O Mestre do Porto vai gostar de ver.',
      ],
    },
  ];
}

/* atrás das pedras do paredão, na Rota da Foz */
const NO_PAREDAO: Esconderijo = {
  fundo: C.cantoParedao, saci: { x: 150, y: 72 }, rede: { x: 118, y: 96 },
  de: { x: -20, y: 86 }, ate: { x: 70, y: 86 }, dir: 'dir',
  onde: 'Atrás das pedras do paredão, no capim alto, alguém ri baixinho.',
  chao: 'no capim',
};

/* na nesga de areia atrás do farol, em Porto Iara */
const ATRAS_DO_FAROL: Esconderijo = {
  fundo: C.atrasFarol, saci: { x: 112, y: 74 }, rede: { x: 80, y: 100 },
  de: { x: -20, y: 88 }, ate: { x: 40, y: 88 }, dir: 'dir',
  onde: 'Na nesga de areia atrás do farol, onde ninguém do porto passa, um gorro vermelho.',
  chao: 'na areia',
};

/* no beco entre a venda e a casa do pescador, em Porto Iara */
const NO_BECO: Esconderijo = {
  fundo: C.becoPorto, saci: { x: 112, y: 62 }, rede: { x: 112, y: 98 },
  de: { x: 148, y: 150 }, ate: { x: 148, y: 92 }, dir: 'cima',
  onde: 'No beco entre a venda e a casa do pescador, um assobio vem da sombra.',
  chao: 'no chão do beco',
};

export const CUTSCENES: Record<string, Roteiro> = {
  intro: INTRO,
  firmina: FIRMINA,
  zeca: ZECA,
  mestre: MESTRE,
  mestre_redes: MESTRE_REDES,
  boitata: BOITATA,
  saci_mato: sacizinhoAchado(NO_PAREDAO),
  saci_mato_rede: sacizinhoVencido(NO_PAREDAO),
  saci_cais: sacizinhoAchado(ATRAS_DO_FAROL),
  saci_cais_rede: sacizinhoVencido(ATRAS_DO_FAROL),
  saci_praia: sacizinhoAchado(NO_BECO),
  saci_praia_rede: sacizinhoVencido(NO_BECO),
};
