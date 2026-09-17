/* Vila Aurora — onde a trilha começa.
   Grade editável à mão, um caractere por tile de 16x16:
     .  grama          ,  mato alto (encontros)   =  caminho de terra
     a  areia          ~  água (intransponível)   p  cais de madeira
     #  árvore         o  pedra                   f  flores
     _  piso           W  parede interna          T  tapete                */
import type { DefMapa } from '../../world/tilemap.ts';

export const vilaAurora: DefMapa = {
  id: 'vilaAurora',
  nome: 'VILA AURORA',

  chao: [
    '##############################',
    '##############################',
    '#.f........................f.#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#..#..=.......=........=.#...#',
    '#.....=.f.....=....f...=.....#',
    '#.==========================.#',
    '#.==========================.#',
    '#............==..............#',
    '#.,,,,.......==....o.........#',
    '#.,,,,.......==....,,,,,.....#',
    '#.,,,,.......==....,,,,,..o..#',
    '#.,,,,.......==....,,,,,.....#',
    '#.,,,,.......==....,,,,,.....#',
    '#..~~~~~~....==....,,,,,.....#',
    '#.~~~~~~~~...==..............#',
    '#.~~~~~~~~...==..........o...#',
    '#.~~~~~~~~...==..............#',
    '#.~~~~~~~~...==...f..........#',
    '#..~~~~~~....==...........#..#',
    '#.....f......==.........f....#',
    '#...o........==......#.......#',
    '#............==..............#',
    '#############==###############',
  ],

  objetos: [
    // a porta cai sempre no meio de um TILE: é nela que a saída do mapa mora
    { tipo: 'casa', tx: 4,  ty: 3, larg: 4, alt: 3 },                    // porta (6,5)
    { tipo: 'casa', tx: 12, ty: 2, larg: 5, alt: 4 },                    // porta (14,5)
    { tipo: 'casa', tx: 21, ty: 3, larg: 4, alt: 3, trancada: true },    // ninguém em casa
    { tipo: 'placa', tx: 12, ty: 23,
      placa: 'VILA AURORA. Ao sul, a Rota da Foz leva a Porto Iara.' },
    { tipo: 'placa', tx: 10, ty: 10,
      placa: 'Mato alto: é onde os Encantados se escondem. Ande devagar.' },
  ],

  npcs: [
    {
      id: 'vizinho', nome: 'SEU ANASTÁCIO', estilo: 'aldeao',
      tx: 19, ty: 7, dir: 'baixo',
      falas: [
        'A Dona Firmina mora ali no meio, a casa de telhado grande.',
        'Ela é quem entrega o primeiro Encantado da gente. Vai lá falar com ela.',
      ],
    },
    {
      id: 'menina', nome: 'MENINA', estilo: 'crianca',
      tx: 8, ty: 11, dir: 'dir',
      falas: ['Meu irmão desceu pra Rota da Foz e não voltou. Aposto que perdeu a luta de novo.'],
    },
    {
      id: 'velha', nome: 'DONA BENTA', estilo: 'aldeao',
      tx: 22, ty: 9, dir: 'baixo',
      falas: [
        'Em Porto Iara tem terreiro, criança. Mas o portão está fechado com uma guia de cinco contas.',
        'Cada conta acende com um serviço bem feito. Cinco serviços, cinco contas, e o terreiro se abre.',
      ],
    },
  ],

  inicio: { tx: 6, ty: 6, dir: 'baixo' },

  saidas: [
    { tx: 6,  ty: 5,  para: 'casaTaina',   destino: { tx: 5, ty: 7, dir: 'cima' } },
    { tx: 14, ty: 5,  para: 'casaFirmina', destino: { tx: 6, ty: 8, dir: 'cima' } },
    { tx: 13, ty: 25, para: 'rotaFoz',     destino: { tx: 13, ty: 1, dir: 'baixo' } },
    { tx: 14, ty: 25, para: 'rotaFoz',     destino: { tx: 14, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 10,
  /* o mato da vila é quintal de gente: bicho pequeno e manso, nível baixo */
  encontros: [
    { especie: 'piragua', min: 2, max: 4, peso: 45 },
    { especie: 'caiporinha', min: 2, max: 4, peso: 40 },
    { especie: 'sacizinho', min: 3, max: 4, peso: 15 },
  ],
};
