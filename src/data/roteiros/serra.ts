/* =========================================================================
   REGIÃO 3 — a Serra Boitatá. O mesmo desenho da Foz e da Mata: quem pede o
   serviço conta a história, o rival aparece antes da luta, o bicho da
   região vem de emboscada, o terreiro tem a entrada e a vitória, e a saída
   chama para a próxima região. A história daqui: a tropa que ficou sem
   trilha, e a carvoaria da Companhia que queima a encosta e espantou o
   Boitatá para o fundo da caverna.
   ========================================================================= */
import type { Ator, Roteiro } from '../cutscenes.ts';
import * as S from '../../art/fundos/serra.ts';

/* o Chefe da Tropa, no fim da Trilha da Brasa — apresentado antes da luta */
const CHEFE_TROPA: Roteiro = [
  { // ele espera no último trecho, sentado numa bruaca vazia
    musica: 'serra',
    fundo: S.trilhaSerra,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'baixo' }, x: 112, y: 70 },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 100, por: 2.6 } },
    ],
    legendas: [
      'No último trecho da Trilha da Brasa, um homem de chapéu de couro espera sentado numa bruaca vazia.',
      { quem: 'CHEFE DA TROPA', texto: 'Três tropeiros vencidos! Faz anos que ninguém sobe a trilha inteira de uma vez, {crianca}.' },
    ],
  },
  { // a tropa de antigamente, com o Boitatá alumiando a trilha
    musica: 'lembranca',
    fundo: S.tropaAntiga,
    atores: [
      { figura: { criatura: 'boitatao' }, x: 250, y: 30, alfa: 0.55, ate: { x: 130, y: 34, de: 0.4, por: 6 },
        balanco: { amp: 2, periodo: 1.6 } },
    ],
    legendas: [
      { quem: 'CHEFE DA TROPA', texto: 'No tempo do meu avô, a tropa subia esta serra toda semana: sal, panela, rapadura e notícia.' },
      { quem: 'CHEFE DA TROPA', texto: 'E de noite o Boitatá ia na frente, alumiando a trilha pra mula não errar o passo.' },
    ],
  },
  { // a carvoaria da Companhia na encosta
    musica: 'companhia',
    fundo: S.carvoaria,
    atores: [
      { figura: { pessoa: 'capataz', dir: 'dir' }, x: 40, y: 104, ate: { x: 120, y: 104, de: 0.4, por: 4 } },
    ],
    efeitos: [{ tipo: 'fumaca', x: 32, y: 76 }, { tipo: 'fumaca', x: 92, y: 76, aparece: 0.6 }, { tipo: 'fumaca', x: 152, y: 76, aparece: 1.2 }],
    legendas: [
      { quem: 'CHEFE DA TROPA', texto: 'Hoje a Companhia abriu estrada de caminhão do outro lado, e queima a encosta pra fazer carvão.' },
      { quem: 'CHEFE DA TROPA', texto: 'A tropa ficou sem serviço. E a fumaça lá de cima não apaga mais, nem com chuva.' },
    ],
  },
  { // de volta à trilha, frente a frente
    musica: 'serra',
    fundo: S.trilhaSerra,
    atores: [
      { figura: { pessoa: 'aldeao', dir: 'baixo' }, x: 112, y: 70, ate: { x: 112, y: 76, de: 0.3, por: 0.6 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 100 },
    ],
    legendas: [
      { quem: 'CHEFE DA TROPA', texto: 'Por isso a gente fecha a trilha: quem sobe a serra tem que provar que sobe por ela, não contra ela.' },
      { quem: 'CHEFE DA TROPA', texto: 'Quatro tropeiros, e eu sou o último. Mostra o que você tem!' },
    ],
    titulo: ['CHEFE DA TROPA', 'O ÚLTIMO DA TRILHA'],
  },
];

/* --------------------------------------------- o Ferreiro e a candeia

   Toca quando ele dá a candeia: a forja fria, o carvão do Boitatá que
   sempre veio da caverna, a carvoaria que espantou o bicho para o fundo
   dela — e o serviço dos cinco potes. */
const NA_FORJA: readonly Ator[] = [
  { figura: { pessoa: 'ferreiro', dir: 'esq' }, x: 136, y: 70 },
  { figura: { jogador: true, dir: 'dir' }, x: 56, y: 74 },
  { figura: { inicial: true }, x: 16, y: 66, balanco: { amp: 1, periodo: 1.8 } },
];

const FERREIRO: Roteiro = [
  { // a forja fria, a bigorna coberta de pó
    musica: 'forja',
    fundo: S.forjaFria,
    atores: [
      { figura: { pessoa: 'ferreiro', dir: 'esq' }, x: 136, y: 70 },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 74, ate: { x: 56, y: 74, por: 2.4 } },
      { figura: { inicial: true }, x: -56, y: 66, ate: { x: 16, y: 66, por: 2.4 }, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      'Na forja da Vila Fornalha, a fornalha está fria e a bigorna, coberta de pó.',
      { quem: 'FERREIRO', texto: 'Faz três anos que eu não bato ferro, {crianca}. Ferreiro sem fogo é só um homem parado.' },
    ],
  },
  { // a gruta do Boitatá, com os potes de brasa
    musica: 'encantados',
    fundo: S.grutaBrasa,
    atores: [
      { figura: { criatura: 'boitatao' }, x: 100, y: 44, alfa: 0.6, balanco: { amp: 2, periodo: 2 } },
      { figura: { peca: 'carvao' }, x: 52, y: 100, aparece: 0.6 },
      { figura: { peca: 'carvao' }, x: 174, y: 104, aparece: 1.0 },
    ],
    legendas: [
      { quem: 'FERREIRO', texto: 'O carvão bom sempre veio da caverna do Boitatá. Ele deixa a brasa dele nos potes, e ela dura um ano.' },
      { quem: 'FERREIRO', texto: 'Quem pega com respeito, leva. Foi assim com o meu pai, e com o pai dele.' },
    ],
  },
  { // a carvoaria na encosta
    musica: 'companhia',
    fundo: S.carvoaria,
    efeitos: [{ tipo: 'fumaca', x: 32, y: 76 }, { tipo: 'fumaca', x: 152, y: 76, aparece: 0.6 }],
    legendas: [
      { quem: 'FERREIRO', texto: 'Aí a Companhia acendeu os fornos dela na encosta. Carvão de mata queimada, que fede e não esquenta.' },
      { quem: 'FERREIRO', texto: 'O Boitatá se enfiou no fundo da gruta, bravo, e os potes ficaram lá, perdidos no escuro.' },
    ],
  },
  { // a candeia passa para as mãos da criança
    musica: 'forja',
    fundo: S.forjaFria,
    atores: [
      ...NA_FORJA,
      { figura: { peca: 'candeia' }, x: 132, y: 80, ate: { x: 68, y: 82, de: 0.5, por: 1.4 }, some: 2.6 },
    ],
    legendas: [
      { quem: 'FERREIRO', texto: 'Leve esta CANDEIA. Não é muito, mas lá dentro, sem luz, você não acha nem a própria mão.' },
      { quem: 'FERREIRO', texto: 'Me traga cinco potes de carvão do Boitatá, e eu acendo uma conta da sua guia.' },
    ],
  },
];

/* ------------------------------------------ o Zeca, na boca da caverna

   Toca entre a fala de desafio e a luta: o pai dele foi mandado para os
   fornos da carvoaria, e o Zeca voltou à Foz para prender um Piraguá. */
const ZECA_SERRA: Roteiro = [
  { // a tranca de pau, de novo
    musica: 'zeca',
    fundo: S.bocaCaverna,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'esq' }, x: 124, y: 98 },
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 102, ate: { x: 70, y: 102, por: 2.6 } },
    ],
    legendas: [
      'Na saída sul da Vila Fornalha, alguém atravessou uma tranca de pau na boca da caverna. De novo.',
      { quem: 'ZECA', texto: 'Te segui serra acima! A boca da caverna é minha até você provar o contrário.' },
    ],
  },
  { // o pai dele nos fornos
    musica: 'companhia',
    fundo: S.carvoaria,
    atores: [
      { figura: { pessoa: 'paiZeca', dir: 'esq' }, x: 112, y: 100 },
      { figura: { pessoa: 'ferraz', dir: 'esq' }, x: 150, y: 104 },
      { figura: { pessoa: 'zeca', dir: 'dir' }, x: 20, y: 102, aparece: 0.8 },
    ],
    efeitos: [{ tipo: 'fumaca', x: 92, y: 76 }],
    legendas: [
      { quem: 'DOUTOR FERRAZ', texto: 'Mais lenha nesse forno! Carvão não espera ninguém parar de tossir.' },
      { quem: 'ZECA', texto: 'Sabe por que eu subi? Mandaram meu pai pros fornos da carvoaria. Ele volta pra casa preto de fuligem.' },
      { quem: 'ZECA', texto: 'Tossindo a noite inteira. E o Doutor Ferraz, o gerente, ainda diz que é progresso.' },
    ],
  },
  { // de volta à boca da caverna, com o Piraguá novo
    musica: 'zeca',
    fundo: S.bocaCaverna,
    atores: [
      { figura: { pessoa: 'zeca', dir: 'esq' }, x: 124, y: 98 },
      { figura: { criatura: 'piragua', flip: true }, x: 150, y: 82, aparece: 0.6, balanco: { amp: 6, periodo: 0.9, salto: true } },
      { figura: { jogador: true, dir: 'dir' }, x: 70, y: 102 },
    ],
    legendas: [
      { quem: 'ZECA', texto: 'Voltei na Foz e prendi um Piraguá no rio, sozinho. Agora eu tenho quatro.' },
      { quem: 'ZECA', texto: 'Eu não sei se a Companhia tá certa ou errada. Mas sei que hoje eu ganho de você!' },
    ],
    titulo: ['ZECA', 'TERCEIRA VEZ'],
  },
];

/* --------------------------------------- os cinco carvões, na forja

   Toca quando o Ferreiro recebe os potes: a fornalha pega sozinha, a vila
   volta a fumaçar de noite, e o Boitatá, lá no fundo, dorme em paz. */
const FERREIRO_FOLE: Roteiro = [
  { // a fornalha pega sozinha
    musica: 'forja',
    fundo: S.forjaFria,
    depois: { fundo: S.forjaAcesa, de: 1.2, por: 2.4 },
    atores: [
      ...NA_FORJA,
      { figura: { peca: 'carvao' }, x: 160, y: 98, some: 1.4 },
      { figura: { peca: 'carvao' }, x: 176, y: 102, some: 1.4 },
      { figura: { peca: 'carvao' }, x: 192, y: 98, some: 1.4 },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 185, y: 70, aparece: 1.6 }],
    legendas: [
      'O Ferreiro despeja os cinco potes na fornalha. A brasa do Boitatá pega sozinha, sem fole nenhum.',
      { quem: 'FERREIRO', texto: 'Olha só isso! Cinco potes, e a forja respira de novo.' },
    ],
  },
  { // a vila de noite, com as chaminés fumaçando
    musica: 'serra',
    fundo: S.vilaFornalhaNoite,
    legendas: [
      'Naquela noite, as chaminés da Vila Fornalha voltaram a fumaçar, uma depois da outra.',
      'E o som do martelo desceu a serra até a trilha, onde a tropa parou pra escutar.',
    ],
  },
  { // o Boitatá, no fundo da gruta, dormindo em paz
    musica: 'encantados',
    fundo: S.grutaBrasa,
    atores: [
      { figura: { criatura: 'boitatao' }, x: 100, y: 52, alfa: 0.5, balanco: { amp: 1, periodo: 3 } },
    ],
    legendas: [
      'No fundo da caverna, alguma coisa grande se mexeu no escuro... e voltou a dormir em paz.',
    ],
  },
  { // de volta à forja acesa, a conta
    musica: 'forja',
    fundo: S.forjaAcesa,
    atores: NA_FORJA,
    efeitos: [{ tipo: 'fagulhas', x: 185, y: 70 }],
    legendas: [
      { quem: 'FERREIRO', texto: 'Acendi uma conta da guia por sua conta. E toma, pelo trabalho.' },
    ],
  },
];

/* --------------------------------------------- a Mula-sem-Cabeça

   Toca quando o jogador chega perto do fundo da cumeeira: o tropel de um
   lado e do outro, e ela vem a galope. A luta começa assim que ela acaba
   (o NPC é `emboscada`). */
const MULA: Roteiro = [
  { // o platô e o tropel
    musica: 'mula',
    fundo: S.cumeeiraNoite,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 76, ate: { x: 70, y: 76, por: 2.6 } },
      { figura: { inicial: true }, x: -56, y: 66, ate: { x: 34, y: 66, por: 2.6 }, balanco: { amp: 1, periodo: 1.6 } },
    ],
    legendas: [
      'No fundo da cumeeira, a pedra preta ainda está quente, e um rio de lava corta o platô ao meio.',
      'Um tropel de casco ecoa de um lado da serra... depois do outro... cada vez mais perto.',
    ],
  },
  { // ela vem a galope, com o fogo saindo do pescoço
    fundo: S.cumeeiraNoite,
    atores: [
      { figura: { criatura: 'mulaSemCabeca', flip: true }, x: 260, y: 62, ate: { x: 150, y: 64, de: 0.4, por: 1.6 },
        balanco: { amp: 4, periodo: 0.35, salto: true } },
      { figura: { jogador: true, dir: 'dir' }, x: 70, y: 76 },
      { figura: { inicial: true }, x: 34, y: 66, balanco: { amp: 1, periodo: 1.6 } },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 166, y: 66, aparece: 1.8 }, { tipo: 'poeira', x: 176, y: 100, aparece: 0.6, some: 2.4 }],
    legendas: [
      'Sem cabeça nenhuma, só o fogo saindo do pescoço, a Mula-sem-Cabeça vem a galope.',
      'Ela não para pra ninguém. Quem fica na frente dela, que aguente o coice.',
    ],
  },
  { // o letreiro do bicho
    fundo: S.cumeeiraNoite,
    atores: [
      { figura: { criatura: 'mulaSemCabeca', flip: true }, x: 100, y: 72, balanco: { amp: 3, periodo: 0.5, salto: true } },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 116, y: 74 }],
    legendas: [],
    titulo: ['MULA-SEM-CABEÇA', 'O GALOPE DA CUMEEIRA'],
  },
];

/* ------------------------------------------------ o Terreiro de Brasa

   A chegada ao salão (o `aoChegar` da quarta sala) e a vitória (a
   `cutscene` do Brás), que chama para a medalha — a fala dele entrega. */
const NA_BRASA: readonly Ator[] = [
  { figura: { pessoa: 'bras', dir: 'baixo' }, x: 112, y: 12 },
];

const TERREIRO_BRASA: Roteiro = [
  { // o salão da brasa, e ele lá no alto
    musica: 'terreiro_brasa',
    fundo: S.salaoBrasa,
    atores: [
      ...NA_BRASA,
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 170, ate: { x: 112, y: 94, por: 2.6 } },
    ],
    efeitos: [{ tipo: 'fagulhas', x: 26, y: 10 }, { tipo: 'fagulhas', x: 214, y: 10 }],
    legendas: [
      'Depois do pátio, da escória e do breu, a última sala: o salão da brasa.',
      'Lá no alto, de pé ao lado de uma bigorna de pedra, alguém espera de braços cruzados.',
    ],
  },
  { // a serra de antigamente, com o Boitatá guardando a mata
    musica: 'encantados',
    fundo: S.serraAntiga,
    atores: [
      { figura: { criatura: 'boitatao' }, x: -40, y: 40, alfa: 0.7, ate: { x: 120, y: 30, de: 0.3, por: 6 }, balanco: { amp: 3, periodo: 1.4 } },
    ],
    legendas: [
      { quem: 'BRÁS', texto: 'Este terreiro foi aceso pelo Boitatá, no tempo em que a serra inteira era mata.' },
      { quem: 'BRÁS', texto: 'Fogo de Encantado guarda. Fogo de forno de carvão, esse só come.' },
    ],
  },
  { // ele, e o letreiro
    musica: 'terreiro_brasa',
    fundo: S.salaoBrasa,
    atores: [...NA_BRASA, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 }],
    efeitos: [{ tipo: 'fagulhas', x: 26, y: 10 }, { tipo: 'fagulhas', x: 214, y: 10 }],
    legendas: [
      { quem: 'BRÁS', texto: 'O Ferreiro me contou dos potes, e o Chefe da Tropa, da trilha. A serra fala bem de você, {crianca}.' },
      { quem: 'BRÁS', texto: 'Mas brasa não se pega com a mão. Chegou até aqui, aguenta o calor até o fim.' },
    ],
    titulo: ['BRÁS', 'O DONO DO TERREIRO'],
  },
];

const BRAS_VENCE: Roteiro = [
  { // a brasa do chão assenta e fica dourada
    musica: 'terreiro_brasa',
    fundo: S.salaoBrasa,
    depois: { fundo: S.salaoBrasaCalmo, de: 0.6, por: 3 },
    atores: [...NA_BRASA, { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 }],
    legendas: [
      'Quando a luta acaba, as rachaduras de brasa do chão param de crepitar e ficam douradas, quietas.',
      { quem: 'BRÁS', texto: 'A serra escolheu o seu lado, {crianca}. E ela não escolhe à toa.' },
    ],
  },
  { // a carvoaria ainda acesa
    musica: 'companhia',
    fundo: S.carvoaria,
    efeitos: [{ tipo: 'fumaca', x: 32, y: 76 }, { tipo: 'fumaca', x: 92, y: 76 }, { tipo: 'fumaca', x: 152, y: 76 }],
    legendas: [
      { quem: 'BRÁS', texto: 'Enquanto aqueles fornos queimarem a encosta, o Boitatá não volta a andar pela serra.' },
      { quem: 'BRÁS', texto: 'Mas cada terreiro que responde é uma brasa a mais acesa contra eles.' },
    ],
  },
  { // a medalha
    musica: 'terreiro_brasa',
    fundo: S.salaoBrasaCalmo,
    atores: [
      ...NA_BRASA,
      { figura: { medalha: 'brasa', tam: 24 }, x: 108, y: 50, aparece: 0.4, balanco: { amp: 2, periodo: 1.4 } },
      { figura: { jogador: true, dir: 'cima' }, x: 112, y: 94 },
    ],
    legendas: [
      { quem: 'BRÁS', texto: 'A MEDALHA BRASA é sua. Chega aqui do meu lado, que eu mesmo te entrego.' },
    ],
  },
];

/* --------------------------------------------- a saída para o Campo

   Na primeira chegada à vila com a Medalha Brasa (o `aoChegar` da Vila
   Fornalha, que é a saída do terreiro): o Ferreiro conta do muro rachado
   da cumeeira, e do Campo do Saci do outro lado. */
const FORNALHA_CAMPO: Roteiro = [
  { // a vila de noite, e o Ferreiro chegando
    musica: 'serra',
    fundo: S.vilaFornalhaNoite,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: 96, y: 98 },
      { figura: { pessoa: 'ferreiro', dir: 'esq' }, x: 250, y: 98, ate: { x: 140, y: 98, de: 0.3, por: 2.2 } },
    ],
    legendas: [
      'Lá fora a vila inteira bate panela: a notícia da Medalha Brasa já correu a serra.',
      { quem: 'FERREIRO', texto: 'Medalha Brasa! Eu sabia que a candeia tinha ido pra mão certa, {crianca}.' },
    ],
  },
  { // o Campo do Saci, visto do muro rachado
    musica: 'viagem',
    fundo: S.campoAoLonge,
    atores: [
      { figura: { criatura: 'sacizinho' }, x: 20, y: 40, alfa: 0.6, ate: { x: 200, y: 30, de: 0.8, por: 6 }, balanco: { amp: 4, periodo: 0.8 } },
    ],
    legendas: [
      { quem: 'FERREIRO', texto: 'Quando o Brás caiu, o muro do sul da cumeeira rachou de cima a baixo. Dizem que foi o vento que empurrou.' },
      { quem: 'FERREIRO', texto: 'Do outro lado fica o Campo do Saci: capim até onde a vista alcança, e vento que tem nome.' },
    ],
    titulo: ['CAMPO DO SACI', 'ONDE O VENTO TEM NOME'],
  },
];

/* ------------------------------------------------- a Mãe-do-Ouro

   Toca quando ela vem para o time: os três sinos tocam juntos lá na vila,
   e a luz desce do teto da gruta. */
const MAE_DO_OURO: Roteiro = [
  { // o canto mais fundo da caverna
    musica: 'encantados',
    fundo: S.grutaBrasa,
    atores: [
      { figura: { jogador: true, dir: 'dir' }, x: -20, y: 92, ate: { x: 80, y: 92, por: 2.6 } },
      { figura: { peca: 'sino' }, x: 112, y: 30, alfa: 0.5, aparece: 1.4, balanco: { amp: 2, periodo: 0.6 } },
      { figura: { peca: 'sino' }, x: 140, y: 24, alfa: 0.5, aparece: 1.8, balanco: { amp: 2, periodo: 0.6, fase: 1 } },
      { figura: { peca: 'sino' }, x: 168, y: 30, alfa: 0.5, aparece: 2.2, balanco: { amp: 2, periodo: 0.6, fase: 2 } },
    ],
    legendas: [
      'No canto mais fundo da caverna, depois da passagem que só a Tocha abre, o escuro é diferente.',
      'Lá longe, na capela da vila, os três sinos de bronze tocam juntos, sem vento nenhum.',
    ],
  },
  { // a luz desce do teto e toma forma
    fundo: S.grutaOuro,
    atores: [
      { figura: { criatura: 'maeDoOuro' }, x: 100, y: -40, ate: { x: 100, y: 66, de: 0.3, por: 3 }, balanco: { amp: 2, periodo: 2 } },
      { figura: { jogador: true, dir: 'dir' }, x: 80, y: 92 },
    ],
    legendas: [
      'Uma luz desce do teto devagar, como ouro derretido, e toma forma de gente.',
      { quem: 'MÃE-DO-OURO', texto: 'Três sinos tocaram, e a serra inteira ouviu. Quem faz isso, eu escuto.' },
    ],
  },
  { // o letreiro
    fundo: S.grutaOuro,
    atores: [{ figura: { criatura: 'maeDoOuro' }, x: 100, y: 76, balanco: { amp: 2, periodo: 2 } }],
    legendas: [],
    titulo: ['MÃE-DO-OURO', 'A LUZ DO FUNDO DA SERRA'],
  },
];

export const ROTEIROS_SERRA: Record<string, Roteiro> = {
  chefe_tropa: CHEFE_TROPA,
  ferreiro: FERREIRO,
  zeca_serra: ZECA_SERRA,
  ferreiro_fole: FERREIRO_FOLE,
  mula: MULA,
  terreiro_brasa: TERREIRO_BRASA,
  bras_vence: BRAS_VENCE,
  fornalha_campo: FORNALHA_CAMPO,
  mae_do_ouro: MAE_DO_OURO,
};
