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
import type { IdMusica } from '../audio/musicas.ts';

export type Figura =
  | { pessoa: string; dir?: Direcao }
  /* quem está jogando (Tainá ou Bento) e o primeiro Encantado do time —
     resolvidos na hora, a partir da partida */
  | { jogador: true; dir?: Direcao }
  | { inicial: true; flip?: boolean }
  | { criatura: string; flip?: boolean }
  | { medalha: string; tam?: number }
  | { peca: 'fogueira' | 'trator' | 'rede' | 'farol' | 'carta' | 'muda' | 'tinta' };

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
  /* o tema que toca a partir desta tomada (audio/musicas.ts). Sem ele,
     segue o da tomada anterior — a primeira de todo roteiro precisa ter.
     Música de fundo só existe nas cutscenes: ela é a trilha da história. */
  musica?: IdMusica;
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
    musica: 'fogueira',
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
    musica: 'encantados',
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
    musica: 'fogueira',
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
    musica: 'companhia',
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
    musica: 'trilha',
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
    musica: 'firmina',
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
    musica: 'companhia',
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
    musica: 'firmina',
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
    musica: 'zeca',
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
    musica: 'lembranca',
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
    musica: 'companhia',
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
    musica: 'zeca',
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
    musica: 'porto',
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
    musica: 'lembranca',
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
    musica: 'companhia',
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
    musica: 'porto',
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
    musica: 'porto',
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
    musica: 'redes_noite',
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
    musica: 'porto',
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
    musica: 'boitata',
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

/* --------------------------------------------- o Contador de Bichos

   Toca na primeira conversa com ele, quando dá o caderno: quarenta anos de
   bicho anotado, o caderno emagrecendo onde a Companhia passa, e o serviço
   de anotar os quatro da região. */
const CONTADOR: Roteiro = [
  { // debaixo da amendoeira, a mesinha dos cadernos
    musica: 'contador',
    fundo: C.mesaContador,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'esq' }, x: 166, y: 72 },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 78, ate: { x: 70, y: 78, por: 2.4 } },
      { figura: { inicial: true }, x: -56, y: 68, ate: { x: 34, y: 68, por: 2.4 }, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      'Na sombra da amendoeira da praça, um senhor anota tudo num caderno surrado, sem pressa nenhuma.',
      { quem: 'CONTADOR DE BICHOS', texto: 'Opa! Encantado de patuá! Deixa eu ver... {inicial}, é? Esse eu tenho anotado.' },
    ],
  },
  { // o caderno aberto: os bichos da Foz, um em cada quadro
    fundo: C.cadernoAberto,
    atores: [
      { figura: { criatura: 'piragua' }, x: 22, y: 18, aparece: 0.3 },
      { figura: { criatura: 'caiporinha' }, x: 22, y: 72, aparece: 1.1 },
      { figura: { criatura: 'sacizinho' }, x: 134, y: 18, aparece: 1.9 },
      { figura: { inicial: true }, x: 134, y: 72, aparece: 2.7 },
    ],
    legendas: [
      { quem: 'CONTADOR DE BICHOS', texto: 'Faz quarenta anos que eu anoto todo Encantado que passa pela Foz. Desenho, dia e lugar.' },
      { quem: 'CONTADOR DE BICHOS', texto: 'Piraguá no rio, Caiporinha no mato fundo, Sacizinho na estrada... e o seu, que dá quatro.' },
    ],
  },
  { // onde a Companhia passa, o caderno emagrece
    musica: 'companhia',
    fundo: C.mataDepois,
    legendas: [
      { quem: 'CONTADOR DE BICHOS', texto: 'Mas a cada ano o caderno fica mais magro. Onde a Companhia finca estaca, bicho não volta.' },
      { quem: 'CONTADOR DE BICHOS', texto: 'E o que ninguém conta, some sem ninguém saber.' },
    ],
  },
  { // o caderno novo, para quem vai andar a trilha
    musica: 'contador',
    fundo: C.mesaContador,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'esq' }, x: 166, y: 72 },
      { figura: { jogador: true, dir: 'dir' }, x: 70, y: 78 },
      { figura: { inicial: true }, x: 34, y: 68, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      { quem: 'CONTADOR DE BICHOS', texto: 'Toma um caderno novo. Anda pelo mato alto e anota os quatro bichos da região.' },
      { quem: 'CONTADOR DE BICHOS', texto: 'Voltando com os quatro, eu mesmo acendo uma conta da sua guia. Palavra de contador.' },
    ],
  },
];

/* ----------------------------------------------- o Terreiro de Água

   Duas cutscenes da Dona Mariana: a da primeira entrada no salão (o
   `aoChegar` do terreiro) e a da vitória (`cutscene` do treinador), que
   termina chamando para a medalha — a fala dela é que entrega. */
const NO_SALAO = [
  { figura: { pessoa: 'mariana', dir: 'baixo' }, x: 112, y: 12 },
] as const;

const TERREIRO_AGUA: Roteiro = [
  { // o salão alagado, e ela lá no alto
    musica: 'terreiro_agua',
    fundo: C.salaoAgua,
    atores: [
      ...NO_SALAO,
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 150, ate: { x: 112, y: 94, por: 2.4 } },
      { figura: { inicial: true }, x: 70, y: 150, ate: { x: 70, y: 84, por: 2.4 }, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      'O Terreiro de Água é um salão alagado. A água do chão não para quieta nem um instante.',
      'Lá no alto, entre as velas, alguém espera sem pressa nenhuma.',
    ],
  },
  { // a lembrança: a Iara-Mãe no salão, no tempo da maré
    musica: 'encantados',
    fundo: C.salaoAgua,
    atores: [
      { figura: { criatura: 'iaraMae' }, x: 96, y: 50, alfa: 0.5, aparece: 0.4, balanco: { amp: 2, periodo: 2.4 } },
    ],
    legendas: [
      { quem: 'DONA MARIANA', texto: 'Este terreiro é da Iara-Mãe. Antes da comporta, a água entrava aqui sozinha, com a maré.' },
      { quem: 'DONA MARIANA', texto: 'Hoje eu é que cuido dela. E ela não deixa ninguém atravessar de qualquer jeito.' },
    ],
  },
  { // ela, e o letreiro
    musica: 'terreiro_agua',
    fundo: C.salaoAgua,
    atores: [
      ...NO_SALAO,
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 },
      { figura: { inicial: true }, x: 70, y: 84, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      { quem: 'DONA MARIANA', texto: 'Cinco contas acesas. A Foz inteira falou bem de você, {crianca}.' },
      { quem: 'DONA MARIANA', texto: 'Mas água não se atravessa em linha reta: pisou nela, só para quando bater em pedra.' },
    ],
    titulo: ['DONA MARIANA', 'A DONA DO TERREIRO'],
  },
];

const MARIANA_VENCE: Roteiro = [
  { // a água do salão assenta
    musica: 'terreiro_agua',
    fundo: C.salaoAgua,
    depois: { fundo: C.salaoAguaCalmo, de: 0.6, por: 3 },
    atores: [
      ...NO_SALAO,
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 },
      { figura: { inicial: true }, x: 70, y: 84, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      'Quando a luta acaba, a água do salão assenta pela primeira vez, lisa feito espelho.',
      { quem: 'DONA MARIANA', texto: 'A maré virou pro seu lado. E eu fico contente de ter perdido, viu?' },
    ],
  },
  { // a comporta, e a Iara-Mãe dormindo
    musica: 'companhia',
    fundo: C.rioCalado,
    atores: [
      { figura: { criatura: 'iaraMae' }, x: 60, y: 54, alfa: 0.4, balanco: { amp: 1, periodo: 3 } },
    ],
    legendas: [
      { quem: 'DONA MARIANA', texto: 'Enquanto a comporta da Companhia fechar o rio, a Iara-Mãe dorme.' },
      { quem: 'DONA MARIANA', texto: 'Quem vai abrir aquilo não sou eu, {crianca}. É quem anda a trilha inteira.' },
    ],
  },
  { // a medalha
    musica: 'terreiro_agua',
    fundo: C.salaoAguaCalmo,
    atores: [
      ...NO_SALAO,
      { figura: { medalha: 'mare', tam: 20 }, x: 110, y: 60, aparece: 0.8, balanco: { amp: 2, periodo: 1.6 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 },
      { figura: { inicial: true }, x: 70, y: 84, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      { quem: 'DONA MARIANA', texto: 'A MEDALHA MARÉ é sua. Chega aqui do meu lado, que eu mesma te entrego.' },
    ],
  },
];

/* ------------------------------------------- a carta para a Tiê

   Duas cutscenes para o fim da Região da Foz. A primeira toca quando o
   jogador sai do terreiro com a Medalha Maré (o `aoChegar` de Porto Iara):
   o Mestre do Porto traz o recado da Firmina. A segunda, na casa dela,
   quando ela entrega a carta (a fala é que põe a carta na mochila). */
const FIRMINA_CHAMA: Roteiro = [
  { // na porta do terreiro, o Mestre chegando esbaforido
    musica: 'porto',
    fundo: C.portaTerreiro,
    atores: [
      { figura: { jogador: true, dir: 'baixo' }, x: 112, y: 74, ate: { x: 112, y: 92, por: 1.2 } },
      { figura: { inicial: true }, x: 150, y: 82, aparece: 0.4, ate: { x: 150, y: 96, de: 0.4, por: 1.2 }, balanco: { amp: 1, periodo: 1.6 } },
      { figura: { pessoa: 'pescador', dir: 'dir' }, x: -20, y: 96, ate: { x: 70, y: 96, de: 1, por: 2 } },
    ],
    legendas: [
      'Lá fora, o sol já vai caindo no mar. E alguém vem correndo pelo largo.',
      { quem: 'MESTRE DO PORTO', texto: 'A Medalha Maré! Eu sabia. A Foz inteira vai saber antes do sol cair.' },
    ],
  },
  { // a lembrança: a Firmina escrevendo, a carta em cima da mesa
    musica: 'firmina',
    fundo: C.salaFirminaLembranca,
    atores: [
      { figura: { pessoa: 'firmina', dir: 'esq' }, x: 166, y: 84 },
      { figura: { peca: 'carta' }, x: 112, y: 80, aparece: 0.6 },
    ],
    legendas: [
      { quem: 'MESTRE DO PORTO', texto: 'Chegou recado da Firmina no barco da manhã. Ela quer te ver antes de você atravessar a água.' },
      { quem: 'MESTRE DO PORTO', texto: 'Disse que tem uma carta pra você. E carta dela nunca é à toa.' },
    ],
  },
  { // o caminho de volta, subindo a Rota da Foz
    musica: 'viagem',
    fundo: C.trilhaAurora,
    atores: [
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 124, ate: { x: 116, y: 88, por: 3.5 } },
      { figura: { inicial: true }, x: 146, y: 126, ate: { x: 136, y: 88, por: 3.5 }, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      { quem: 'MESTRE DO PORTO', texto: 'Sobe a Rota da Foz até a Vila Aurora, {crianca}. A casa de telhado grande, você sabe.' },
      'A Dona Firmina está esperando em VILA AURORA.',
    ],
  },
];

const FIRMINA_CARTA: Roteiro = [
  { // a sala, e a carta lacrada em cima da mesa
    musica: 'firmina',
    fundo: C.salaFirmina,
    atores: [
      { figura: { peca: 'carta' }, x: 112, y: 80 },
      { figura: { jogador: true, dir: 'dir' }, x: 56, y: 84 },
      { figura: { inicial: true }, x: 24, y: 74, balanco: { amp: 1, periodo: 1.8 } },
      { figura: { pessoa: 'firmina', dir: 'esq' }, x: 166, y: 84 },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 149, y: 74 }],
    legendas: [
      'Em cima da mesa comprida, uma carta dobrada em quatro, com lacre de cera vermelha.',
      { quem: 'DONA FIRMINA', texto: 'A Medalha Maré no peito. A Dona Mariana não dá aquilo pra qualquer um, {crianca}.' },
    ],
  },
  { // do outro lado da água, a mata, e a Tiê
    musica: 'viagem',
    fundo: C.mataAntes,
    atores: [
      { figura: { pessoa: 'tie', dir: 'baixo' }, x: 150, y: 76, aparece: 0.5 },
    ],
    legendas: [
      { quem: 'DONA FIRMINA', texto: 'Do outro lado da água tem mata, e na mata tem a Tiê. É ela quem cuida do Terreiro de Raiz.' },
      { quem: 'DONA FIRMINA', texto: 'Amiga minha de muito tempo. E a Companhia já anda rondando por lá também.' },
    ],
  },
  { // a carta passa para as mãos da criança
    fundo: C.salaFirmina,
    atores: [
      { figura: { peca: 'carta' }, x: 112, y: 80, ate: { x: 66, y: 86, de: 0.6, por: 1.4 }, some: 2.4 },
      { figura: { jogador: true, dir: 'dir' }, x: 56, y: 84 },
      { figura: { inicial: true }, x: 24, y: 74, balanco: { amp: 1, periodo: 1.8 } },
      { figura: { pessoa: 'firmina', dir: 'esq' }, x: 166, y: 84, ate: { x: 150, y: 84, por: 0.8 } },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 149, y: 74 }],
    legendas: [
      { quem: 'DONA FIRMINA', texto: 'Leve esta carta a ela. E com o Dom de Nadar, a água não é mais parede pra você.' },
    ],
    titulo: ['A MATA DO CURUPIRA', 'DO OUTRO LADO DA ÁGUA'],
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
      musica: 'saci',
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
      musica: 'saci',
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

/* =========================================================================
   REGIÃO 2 — a Mata do Curupira. O mesmo desenho da Foz: quem pede o
   serviço conta a história, o rival aparece antes da luta, as três ladras
   têm o seu esconderijo, o bicho da região vem de emboscada, o terreiro
   tem a entrada e a vitória, e a saída chama para a próxima região.
   ========================================================================= */

/* ------------------------------------------ o Seu Elias, com a carta

   Toca quando ele recebe a carta da Firmina: a mata de antigamente, as
   árvores marcadas pela Companhia, o viveiro roubado, o caderno de pegadas
   — e o aviso da grota, onde mora o Curupira. */
const ELIAS: Roteiro = [
  { // a clareira: ele abre a carta ali mesmo
    musica: 'mata',
    fundo: C.clareiraMata,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'baixo' }, x: 132, y: 78 },
      { figura: { peca: 'carta' }, x: 150, y: 86 },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 92, ate: { x: 96, y: 92, por: 2.6 } },
      { figura: { inicial: true }, x: -56, y: 82, ate: { x: 60, y: 82, por: 2.6 }, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      'Na clareira da Mata do Curupira, o Seu Elias abre a carta ali mesmo, de pé, sem cerimônia.',
      { quem: 'SEU ELIAS', texto: 'Letra da Firmina eu conheço de longe. Diz que você voltou da Foz de medalha no peito.' },
    ],
  },
  { // a mata de antigamente, e o Curupira trazendo quem se perdia
    musica: 'lembranca',
    fundo: C.mataAntiga,
    atores: [
      { figura: { criatura: 'curupira' }, x: 150, y: 76, alfa: 0.7, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { pessoa: 'crianca', dir: 'dir' }, x: 40, y: 94, ate: { x: 116, y: 94, de: 0.6, por: 3 } },
    ],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'Quando eu era menino, quem se perdia aqui dentro o Curupira trazia de volta.' },
      { quem: 'SEU ELIAS', texto: 'De pés virados, pra ninguém achar o rastro dele. A mata tinha quem cuidasse.' },
    ],
  },
  { // a picada da Companhia, com os X vermelhos nos troncos
    musica: 'companhia',
    fundo: C.arvoresMarcadas,
    atores: [
      { figura: { pessoa: 'capataz', dir: 'esq' }, x: 100, y: 74, ate: { x: 60, y: 74, de: 0.4, por: 2.4 } },
      { figura: { peca: 'tinta' }, x: 118, y: 90 },
    ],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'Faz um mês que apareceu gente da Companhia pintando X vermelho nos troncos.' },
      { quem: 'SEU ELIAS', texto: 'Árvore marcada é árvore que vai cair. E desde então a mata anda estranha.' },
    ],
  },
  { // o viveiro com três covas vazias
    musica: 'mata',
    fundo: C.viveiroVazio,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'baixo' }, x: 200, y: 60 },
    ],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'Até as Caiporinhas deram de roubar. Sumiram três mudas do meu viveiro.' },
      { quem: 'SEU ELIAS', texto: 'Sem muda não tem o que plantar no lugar do que eles derrubam, {crianca}.' },
    ],
  },
  { // de volta à clareira: a conta, o caderno e o aviso da grota
    fundo: C.clareiraMata,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'esq' }, x: 132, y: 78 },
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 92 },
      { figura: { inicial: true }, x: 60, y: 82, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'A carta vale a primeira conta. E toma este CADERNO DE PEGADAS: anota os bichos que vir.' },
      { quem: 'SEU ELIAS', texto: 'Traz as mudas e enche o caderno, que eu acendo mais duas contas da sua guia.' },
      { quem: 'SEU ELIAS', texto: 'Só não entra de bobeira na grota funda, do lado de lá do mato. Aquilo tem dono.' },
    ],
  },
];

/* ------------------------------------------ o Zeca, de novo, no igarapé

   Toca entre a fala de desafio e a luta (`apresentacao`). O Zeca atravessou
   o rio a nado atrás de quem ganhou dele — e viu o pai do lado de cá,
   marcando árvore para a Companhia. */
const ZECA_MATA: Roteiro = [
  { // a fileira de pedra, e ele em cima dela, pingando
    musica: 'zeca',
    fundo: C.rochaIgarape,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 58, balanco: { amp: 1, periodo: 0.7 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 94, por: 2.4 } },
    ],
    legendas: [
      'No meio do igarapé, uma fileira de pedra fecha o caminho para o sul. Em cima dela, pingando...',
      { quem: 'ZECA', texto: 'Atravessei o rio a nado atrás de você! Achou que ia se livrar de mim assim?' },
    ],
  },
  { // a lembrança: o pai dele pintando X nos troncos
    musica: 'companhia',
    fundo: C.arvoresMarcadas,
    atores: [
      { figura: { pessoa: 'paiZeca', dir: 'esq' }, x: 96, y: 72 },
      { figura: { peca: 'tinta' }, x: 84, y: 90 },
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 20, y: 80, aparece: 0.6 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Sabe quem eu vi ontem, na picada do outro lado? Meu pai. Pintando X vermelho nas árvores.' },
      { quem: 'ZECA', texto: 'Nem me viu. Ficou lá com a lata de tinta, que nem quem nunca andou nesta mata.' },
    ],
  },
  { // de volta à pedra, frente a frente
    musica: 'zeca',
    fundo: C.rochaIgarape,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'baixo' }, x: 112, y: 58, ate: { x: 112, y: 68, de: 0.4, por: 0.8 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 },
      { figura: { criatura: 'curupinho' }, x: 146, y: 62, aparece: 0.8, balanco: { amp: 3, periodo: 0.9 } },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Eu não sei mais de que lado eu tô, {crianca}. Mas uma coisa eu sei:' },
      { quem: 'ZECA', texto: 'ninguém passa desta pedra sem me vencer. Nem você!' },
    ],
    titulo: ['ZECA', 'DE NOVO NO CAMINHO'],
  },
];

/* ---------------------------------------- as mudas de volta, no Seu Elias

   Toca quando ele recebe as três mudas: ele replanta o viveiro, uma
   Caiporinha volta de noite (para regar, não para roubar) e, de manhã, ele
   planta muda nos tocos da picada. */
const ELIAS_MUDAS: Roteiro = [
  { // no viveiro, as três de volta na terra
    musica: 'mata',
    fundo: C.viveiroCheio,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'baixo' }, x: 116, y: 60 },
      { figura: { jogador: true, dir: 'dir' }, x: 60, y: 60 },
    ],
    legendas: [
      'O Seu Elias ajoelha no viveiro e põe as três mudas na terra, uma do lado da outra.',
      { quem: 'SEU ELIAS', texto: 'Nem amassou. Caiporinha rouba, mas rouba com cuidado, {crianca}.' },
    ],
  },
  { // de noite, uma Caiporinha volta — com uma cabaça de água
    musica: 'redes_noite',
    fundo: C.viveiroNoite,
    atores: [
      { figura: { criatura: 'caiporinha' }, x: -40, y: 52, ate: { x: 150, y: 52, de: 0.4, por: 3.2 },
        balanco: { amp: 2, periodo: 0.4, salto: true } },
    ],
    legendas: [
      'Naquela noite, uma Caiporinha voltou montada no porco-do-mato...',
      '...e em vez de levar alguma coisa, deixou água do igarapé ao pé de cada muda.',
    ],
  },
  { // de manhã, uma muda em cada toco da picada
    musica: 'mata',
    fundo: C.picadaMudas,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'dir' }, x: 10, y: 84, ate: { x: 90, y: 84, por: 2.4 } },
    ],
    legendas: [
      'De manhã cedo, o Seu Elias levou mudas para a picada da Companhia e plantou uma em cada toco.',
      { quem: 'SEU ELIAS', texto: 'Eles derrubam uma, a gente planta três. Quero ver quem cansa primeiro.' },
    ],
  },
  { // de volta à clareira, a conta
    fundo: C.clareiraMata,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'esq' }, x: 132, y: 78 },
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 92 },
    ],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'Promessa de mateiro: outra conta da guia acesa, e toma pelo trabalho.' },
    ],
  },
];

/* ------------------------------------------ o caderno de pegadas cheio

   Toca quando o Seu Elias confere os sete bichos: o caderno aberto, a
   amizade com o Contador de Bichos da Foz, e a pegada de pé virado. */
const ELIAS_PEGADAS: Roteiro = [
  { // o caderno aberto, com os bichos nos quadros
    musica: 'contador',
    fundo: C.cadernoPegadas,
    atores: [
      { figura: { criatura: 'curupinho' }, x: 22, y: 18 },
      { figura: { criatura: 'caiporinha' }, x: 22, y: 72 },
      { figura: { criatura: 'sacizinho' }, x: 134, y: 18 },
      { figura: { inicial: true }, x: 134, y: 72 },
    ],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'Sete bichos! Pegada de Curupinho, rastro de Caiporinha, redemoinho de Sacizinho...' },
      { quem: 'SEU ELIAS', texto: 'O Contador de Bichos da Foz ia gostar de ver. A gente troca caderno pelo barco faz trinta anos.' },
    ],
  },
  { // a pegada de pé virado, na beira da grota
    musica: 'curupira',
    fundo: C.grotaFunda,
    atores: [
      { figura: { criatura: 'curupira' }, x: 104, y: 36, alfa: 0.45, balanco: { amp: 1, periodo: 2 } },
    ],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'E olha esta aqui, na última página: pegada de pé virado, na beira da grota funda.' },
      { quem: 'SEU ELIAS', texto: 'Curupira de verdade. Faz dez anos que ninguém anotava um, {crianca}.' },
    ],
  },
  { // de volta à clareira, a conta
    musica: 'mata',
    fundo: C.clareiraMata,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'esq' }, x: 132, y: 78 },
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 92 },
    ],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'Serviço de mateiro de verdade. Acendi outra conta da guia pra você.' },
    ],
  },
];

/* ---------------------------------------------------- o Curupira da grota

   Toca quando o jogador chega perto da grota: as pegadas ao contrário, o
   assobio, o mato fechando — e ele sai da moita. A luta começa assim que
   ela acaba (o NPC é `emboscada`). */
const CURUPIRA: Roteiro = [
  { // a grota e as pegadas que só vão para dentro
    musica: 'curupira',
    fundo: C.grotaFunda,
    atores: [
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 96, por: 2.6 } },
    ],
    legendas: [
      'Do lado de lá do mato alto, o chão afunda numa grota de raiz e sombra.',
      'As pegadas no barro vão todas para trás, como se alguém tivesse saído daqui sem nunca ter entrado.',
    ],
  },
  { // o assobio, e ele saindo da moita
    fundo: C.grotaFunda,
    atores: [
      { figura: { criatura: 'curupira' }, x: 104, y: 40, aparece: 0.8, balanco: { amp: 3, periodo: 0.6, salto: true } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 96 },
    ],
    efeitos: [{ tipo: 'poeira', x: 120, y: 72, aparece: 0.4, some: 2 }],
    legendas: [
      'Um assobio fino corta a mata, e o mato se fecha atrás de você.',
      'De cabelo de fogo e pés virados, o Curupira sai da moita. Ele não gosta de visita.',
    ],
  },
  { // o letreiro do bicho
    fundo: C.grotaFunda,
    atores: [
      { figura: { criatura: 'curupira' }, x: 104, y: 76, balanco: { amp: 2, periodo: 0.8 } },
    ],
    legendas: [],
    titulo: ['CURUPIRA', 'O GUARDIÃO DA GROTA'],
  },
];

/* ------------------------------------------------ o Terreiro de Raiz

   Duas cutscenes da Tiê: a da primeira entrada no salão (`aoChegar` do
   terreiro) e a da vitória (`cutscene` da treinadora), que termina
   chamando para a medalha — a fala dela é que entrega. */
const NA_RAIZ: readonly Ator[] = [
  { figura: { pessoa: 'tie', dir: 'baixo' }, x: 112, y: 12 },
];

const TERREIRO_RAIZ: Roteiro = [
  { // o salão de raiz viva, e ela lá no alto
    musica: 'terreiro_raiz',
    fundo: C.salaoRaiz,
    atores: [
      ...NA_RAIZ,
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 94, por: 2.6 } },
    ],
    legendas: [
      'O Terreiro de Raiz é um salão de raiz viva. O chão se mexe devagar, como quem respira.',
      'Lá no alto, entre os cipós, alguém espera sentada numa raiz trançada.',
    ],
  },
  { // a sumaúma de mil anos, onde o terreiro nasceu
    musica: 'encantados',
    fundo: C.sumauma,
    atores: [
      { figura: { criatura: 'curupira' }, x: 150, y: 88, alfa: 0.6, balanco: { amp: 2, periodo: 1.6 } },
    ],
    legendas: [
      { quem: 'TIÊ', texto: 'Este terreiro nasceu no pé de uma sumaúma de mil anos. As raízes dela seguram a mata inteira.' },
      { quem: 'TIÊ', texto: 'Onde a Companhia corta, a raiz morre. E onde a raiz morre, a mata desaba.' },
    ],
  },
  { // ela, e o letreiro
    musica: 'terreiro_raiz',
    fundo: C.salaoRaiz,
    atores: [
      ...NA_RAIZ,
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 },
    ],
    legendas: [
      { quem: 'TIÊ', texto: 'Recebi a carta da Firmina pelo Seu Elias. Ela sempre soube escolher gente, {crianca}.' },
      { quem: 'TIÊ', texto: 'Mas raiz não se atravessa em linha reta: pisou nela, só para quando bater em alguma coisa.' },
    ],
    titulo: ['TIÊ', 'A DONA DO TERREIRO'],
  },
];

const TIE_VENCE: Roteiro = [
  { // as raízes param, e florescem
    musica: 'terreiro_raiz',
    fundo: C.salaoRaiz,
    depois: { fundo: C.salaoRaizFlorido, de: 0.6, por: 3 },
    atores: [
      ...NA_RAIZ,
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 },
    ],
    legendas: [
      'Quando a luta acaba, as raízes do salão param de se mexer e dão flor, todas de uma vez.',
      { quem: 'TIÊ', texto: 'A mata escolheu o seu lado, {crianca}. E eu não vou discordar da mata.' },
    ],
  },
  { // a picada marcada, esperando o fim das chuvas
    musica: 'companhia',
    fundo: C.arvoresMarcadas,
    legendas: [
      { quem: 'TIÊ', texto: 'A Companhia marcou metade da mata com tinta vermelha. Esperam o fim das chuvas pra derrubar.' },
      { quem: 'TIÊ', texto: 'Sozinha eu não seguro. Mas cada medalha que você leva é um terreiro que responde junto.' },
    ],
  },
  { // a medalha
    musica: 'terreiro_raiz',
    fundo: C.salaoRaizFlorido,
    atores: [
      ...NA_RAIZ,
      { figura: { medalha: 'raiz', tam: 24 }, x: 108, y: 50, aparece: 0.4, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 },
    ],
    legendas: [
      { quem: 'TIÊ', texto: 'A MEDALHA RAIZ é sua. Chega aqui do meu lado, que eu mesma te entrego.' },
    ],
  },
];

/* ------------------------------------------------ a saída para a Serra

   Toca na primeira chegada à clareira com a Medalha Raiz (o `aoChegar` da
   Mata do Curupira, que é a saída do terreiro): o Seu Elias mostra a
   fumaça da Serra Boitatá e a touceira de cipó que o Dom novo abre. */
const ELIAS_SERRA: Roteiro = [
  { // a clareira no fim da tarde, ele chegando
    musica: 'mata',
    fundo: C.clareiraTarde,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 92 },
      { figura: { pessoa: 'aldeao', dir: 'esq' }, x: 250, y: 80, ate: { x: 140, y: 80, de: 0.3, por: 2.2 } },
    ],
    legendas: [
      'Lá fora a mata já escurece. E o Seu Elias vem pela trilha, com a pressa de quem tem notícia.',
      { quem: 'SEU ELIAS', texto: 'Medalha Raiz! A mata inteira já sabe, {crianca}. Até os bichos pararam pra ver.' },
    ],
  },
  { // a fumaça da Serra, ao sul
    musica: 'boitata',
    fundo: C.serraAoLonge,
    efeitos: [{ tipo: 'fumaca', x: 96, y: 44 }, { tipo: 'fumaca', x: 152, y: 40, aparece: 0.8 }],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'Olha pro sul. Aquela fumaça é da Serra Boitatá. Fogo de serra acende e apaga há séculos...' },
      { quem: 'SEU ELIAS', texto: '...mas este ano ele não apaga. Uns dizem que é a Companhia. Outros, que é o Boitatá bravo.' },
    ],
  },
  { // a touceira de cipó, e a trilha atrás dela
    musica: 'viagem',
    fundo: C.touceiraCipo,
    atores: [
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.4 } },
    ],
    legendas: [
      { quem: 'SEU ELIAS', texto: 'Com o Dom de Cortar Cipó, a touceira do canto da clareira não te segura mais.' },
      { quem: 'SEU ELIAS', texto: 'Atrás dela começa a Trilha da Brasa. Vai com cuidado, que lá o chão é quente.' },
    ],
    titulo: ['SERRA BOITATÁ', 'ONDE O FOGO NÃO APAGA'],
  },
];

/* ------------------------------------------ as Caiporinhas das três mudas

   O mesmo molde dos Sacizinhos da Foz: a cutscene de quando o jogador
   acha a ladra (`encontro`) e a de quando ela perde a briga e larga a muda
   (`cutscene` da luta). Muda só o lugar. */
interface Toca {
  fundo: () => Buf;
  bicho: { x: number; y: number };
  muda: { x: number; y: number };
  de: { x: number; y: number };
  ate: { x: number; y: number };
  dir: Direcao;
  onde: string;
  chao: string;
}

function caiporinhaAchada(e: Toca): Roteiro {
  return [
    { // lá está ela, com a muda no colo
      musica: 'caipora',
      fundo: e.fundo,
      atores: [
        { figura: { criatura: 'caiporinha' }, x: e.bicho.x, y: e.bicho.y, balanco: { amp: 2, periodo: 0.7 } },
        { figura: { peca: 'muda' }, x: e.bicho.x + 10, y: e.bicho.y - 6, balanco: { amp: 2, periodo: 0.7 } },
        { figura: { jogador: true, dir: e.dir }, x: e.de.x, y: e.de.y, ate: { ...e.ate, de: 0.4, por: 2.4 } },
      ],
      legendas: [
        e.onde,
        'É uma Caiporinha, montada no porco-do-mato, com uma muda do Seu Elias no colo.',
      ],
    },
    { // ela te vê e se prepara pra correr
      fundo: e.fundo,
      atores: [
        { figura: { criatura: 'caiporinha' }, x: e.bicho.x, y: e.bicho.y, balanco: { amp: 5, periodo: 0.35, salto: true } },
        { figura: { peca: 'muda' }, x: e.bicho.x + 10, y: e.bicho.y - 6, balanco: { amp: 5, periodo: 0.35, salto: true } },
        { figura: { jogador: true, dir: e.dir }, x: e.ate.x, y: e.ate.y },
      ],
      legendas: [
        { quem: 'CAIPORINHA', texto: 'Hu-hu! Muda boa, muda minha! Quer? Corre atrás!' },
        'Caiporinha foge de quem chega perto. Encurrale ela num canto, sem ter pra onde correr.',
      ],
    },
  ];
}

function caiporinhaVencida(e: Toca): Roteiro {
  return [
    { // cansada da briga, ela solta a muda
      musica: 'caipora',
      fundo: e.fundo,
      atores: [
        { figura: { criatura: 'caiporinha' }, x: e.bicho.x, y: e.bicho.y, balanco: { amp: 1, periodo: 1.6 } },
        { figura: { peca: 'muda' }, x: e.muda.x, y: e.muda.y, aparece: 1 },
        { figura: { jogador: true, dir: e.dir }, x: e.ate.x, y: e.ate.y },
      ],
      legendas: [
        'Sem fôlego da briga, a Caiporinha afrouxa os braços...',
        `...e a muda do Seu Elias cai ${e.chao}, com torrão e tudo.`,
      ],
    },
    { // o porco ronca, e as duas somem no mato
      fundo: e.fundo,
      atores: [
        { figura: { peca: 'muda' }, x: e.muda.x, y: e.muda.y },
        { figura: { criatura: 'caiporinha' }, x: e.bicho.x, y: e.bicho.y, some: 1.6,
          ate: { x: e.bicho.x + 80, y: e.bicho.y - 10, de: 0.4, por: 1.2 }, balanco: { amp: 3, periodo: 0.3, salto: true } },
        { figura: { jogador: true, dir: e.dir }, x: e.ate.x, y: e.ate.y },
      ],
      efeitos: [{ tipo: 'poeira', x: e.bicho.x + 16, y: e.bicho.y + 30, aparece: 0.3, some: 1.8 }],
      legendas: [
        'O porco-do-mato dá um ronco, e as duas somem mato adentro, rindo.',
        'A MUDA DE ÁRVORE é sua. O Seu Elias vai gostar de ver.',
      ],
    },
  ];
}

/* na beira do igarapé, logo depois da travessia */
const NA_MARGEM: Toca = {
  fundo: C.margemIgarape, bicho: { x: 120, y: 92 }, muda: { x: 124, y: 112 },
  de: { x: -20, y: 106 }, ate: { x: 60, y: 106 }, dir: 'dir',
  onde: 'Na beira do igarapé, uma muda de árvore passeia sozinha pelo mato...',
  chao: 'na areia da margem',
};

/* no mato fechado entre as touceiras */
const NAS_TOUCEIRAS: Toca = {
  fundo: C.touceirasFundas, bicho: { x: 112, y: 88 }, muda: { x: 118, y: 112 },
  de: { x: 250, y: 106 }, ate: { x: 170, y: 106 }, dir: 'esq',
  onde: 'Entre as touceiras, onde nem a luz entra direito, alguma coisa ronca baixinho.',
  chao: 'no meio do capim',
};

/* depois da pedra do Zeca, no tronco caído */
const NO_TRONCO: Toca = {
  fundo: C.troncoCaido, bicho: { x: 96, y: 52 }, muda: { x: 120, y: 110 },
  de: { x: 250, y: 110 }, ate: { x: 180, y: 110 }, dir: 'esq',
  onde: 'Em cima do tronco caído, coberto de musgo, um rabo de porco-do-mato balança.',
  chao: 'do alto do tronco',
};

export const CUTSCENES: Record<string, Roteiro> = {
  intro: INTRO,
  firmina: FIRMINA,
  zeca: ZECA,
  mestre: MESTRE,
  mestre_redes: MESTRE_REDES,
  boitata: BOITATA,
  contador: CONTADOR,
  terreiro_agua: TERREIRO_AGUA,
  mariana_vence: MARIANA_VENCE,
  firmina_chama: FIRMINA_CHAMA,
  firmina_carta: FIRMINA_CARTA,
  saci_mato: sacizinhoAchado(NO_PAREDAO),
  saci_mato_rede: sacizinhoVencido(NO_PAREDAO),
  saci_cais: sacizinhoAchado(ATRAS_DO_FAROL),
  saci_cais_rede: sacizinhoVencido(ATRAS_DO_FAROL),
  saci_praia: sacizinhoAchado(NO_BECO),
  saci_praia_rede: sacizinhoVencido(NO_BECO),
  // Região 2 — a Mata do Curupira
  elias: ELIAS,
  zeca_mata: ZECA_MATA,
  elias_mudas: ELIAS_MUDAS,
  elias_pegadas: ELIAS_PEGADAS,
  curupira: CURUPIRA,
  terreiro_raiz: TERREIRO_RAIZ,
  tie_vence: TIE_VENCE,
  elias_serra: ELIAS_SERRA,
  caipora_margem: caiporinhaAchada(NA_MARGEM),
  caipora_margem_muda: caiporinhaVencida(NA_MARGEM),
  caipora_touceira: caiporinhaAchada(NAS_TOUCEIRAS),
  caipora_touceira_muda: caiporinhaVencida(NAS_TOUCEIRAS),
  caipora_tronco: caiporinhaAchada(NO_TRONCO),
  caipora_tronco_muda: caiporinhaVencida(NO_TRONCO),
};
