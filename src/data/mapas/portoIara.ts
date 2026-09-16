/* Porto Iara — a primeira cidade com ginásio.
   A grade abaixo é editável à mão: cada caractere é um tile de 16x16.
     .  grama          ,  mato alto (encontros)   =  caminho de terra
     a  areia          ~  água (intransponível)   p  cais de madeira
     #  árvore         o  pedra                   f  flores            */
import type { DefMapa } from '../../world/tilemap.ts';

export const portoIara: DefMapa = {
  nome: 'PORTO IARA',

  chao: [
    '##############################',
    '##############################',
    '#.............==.............#',
    '#.,,,.........==...#.........#',
    '#.,,,....#....==.............#',
    '#.,,,.........==.............#',
    '#.,,,.......f.==..........#..#',
    '#.............==...f.........#',
    '#.==========================.#',
    '#.==========================.#',
    '#.............==...o.....,,,.#',
    '#.,,,,........==.........,,,.#',
    '#.,,,,.......f==.........,,,.#',
    '#.o,,,........==..o......,,,.#',
    '#.,,,,........==.....==..#,,.#',
    '#.......==....==.....==..,,,.#',
    '#.......===============......#',
    '#.......===============......#',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],

  objetos: [
    // a casa foi para a direita: em cima do mato alto ela tapava metade da
    // única moita do norte, e sobrava pouco chão para caçar Encantado
    { tipo: 'casa',     tx: 6,  ty: 4,  larg: 4, alt: 3 },
    { tipo: 'casa',     tx: 21, ty: 4,  larg: 4, alt: 3 },
    { tipo: 'ginasio',  tx: 6,  ty: 11, larg: 6, alt: 4 },
    { tipo: 'loja',     tx: 20, ty: 11, larg: 4, alt: 3 },
    // a barreira fecha a entrada do ginásio até a tarefa da cidade terminar
    { tipo: 'barreira', tx: 6,  ty: 15, larg: 6 },
    { tipo: 'placa',    tx: 12, ty: 10,
      placa: 'PORTO IARA. Ginásio de Água, líder Mariana. Ao sul: o cais.' },
  ],

  npcs: [
    {
      id: 'firmina', nome: 'DONA FIRMINA', estilo: 'firmina',
      tx: 12, ty: 6, dir: 'baixo',
      falas: [
        'Cuidado no mato alto, criança. É ali que os Encantados se escondem.',
        'Quem anda depressa espanta bicho. Vai devagar que eles aparecem.',
      ],
    },
    {
      id: 'guarda', nome: 'GUARDA DO CAIS', estilo: 'guarda',
      tx: 9, ty: 16, dir: 'cima',
      falas: [
        'O ginásio está fechado, moça. Mestre Mariana só recebe depois que o porto voltar a pescar.',
        'Sem as redes não tem peixe, e sem peixe não tem ginásio. Fala com o mestre do porto lá embaixo.',
      ],
    },
    {
      id: 'pescador', nome: 'MESTRE DO PORTO', estilo: 'pescador',
      tx: 17, ty: 17, dir: 'cima',
      falas: [
        'Sem as redes ninguém pesca hoje, moça.',
        'Dizem que um Encantado levou as três. Se você trouxer de volta, eu mesmo abro o cais do ginásio.',
      ],
    },
    {
      id: 'crianca', nome: 'MENINO', estilo: 'crianca',
      tx: 24, ty: 9, dir: 'esq',
      falas: ['Um dia eu também vou ter as oito medalhas!'],
    },
    {
      id: 'aldea', nome: 'MOÇA DA VILA', estilo: 'aldeao',
      tx: 5, ty: 9, dir: 'baixo',
      falas: ['A loja vende Patuás. Sem Patuá não dá para capturar Encantado nenhum.'],
    },
  ],

  inicio: { tx: 15, ty: 5, dir: 'baixo' },

  cenario: 'praia',
  passosPorEncontro: 8,
  /* O mato de Porto Iara é beira de rio: Piraguá é o que mais aparece, o
     Sacizinho passa correndo de vez em quando e a Caiporinha vem do mato
     mais fechado do fundo. */
  encontros: [
    { especie: 'piragua', min: 3, max: 6, peso: 55 },
    { especie: 'caiporinha', min: 3, max: 5, peso: 30 },
    { especie: 'sacizinho', min: 4, max: 6, peso: 15 },
  ],
};
