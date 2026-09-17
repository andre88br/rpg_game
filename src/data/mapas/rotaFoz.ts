/* Rota da Foz — a estrada entre Vila Aurora e Porto Iara.
   É o mato alto mais cheio da região e onde o Zeca "Redemoinho" barra a
   passagem (segunda conta da guia, na Etapa 2). O paredão de pedra no sul
   deixa um vão só: quem quiser desviar tem que voltar pelo mato.            */
import type { DefMapa } from '../../world/tilemap.ts';

export const rotaFoz: DefMapa = {
  id: 'rotaFoz',
  nome: 'ROTA DA FOZ',

  chao: [
    '#############==###############',
    '#............==..............#',
    '#..,,,,,..f..==.....,,,,,....#',
    '#..,,,,,.....==.....,,,,,....#',
    '#..,,,,,.....==.....,,,,,....#',
    '#..,,,,,.....==.....,,,,,....#',
    '#............==..............#',
    '#.#..........==...........#..#',
    '#....==========.....f........#',
    '#....=.......==..............#',
    '#....=.......==.....,,,,,,...#',
    '#....=.......==.....,,,,,,...#',
    '#..o.=.......==.....,,,,,,...#',
    '#....=.......==..............#',
    '#....==========..............#',
    '#...~~~~~~...==..........o...#',
    '#..~~~~~~~~..==..............#',
    '#..~~~~~~~~..==.....#........#',
    '#..~~~~~~~~..==..............#',
    '#..~~~~~~~~..==.........f....#',
    '#...~~~~~~...==..............#',
    '#..,,,,,,....==....,,,,,,,...#',
    '#..,,,,,,....==....,,,,,,,...#',
    '#..,,,,,,....==....,,,,,,,...#',
    '#..,,,,,,....==....,,,,,,,...#',
    '#............==..............#',
    '#.....RRRRRRR==RRRR.......#..#',
    '#.....R......==...R..........#',
    '#.....R......==...R..........#',
    '#.#..........==..............#',
    '#........o...==......f.......#',
    '#.....f......==.........#....#',
    '#............==..............#',
    '#############==###############',
  ],

  objetos: [
    { tipo: 'placa', tx: 15, ty: 1,
      placa: 'ROTA DA FOZ. Ao norte, Vila Aurora. Ao sul, Porto Iara.' },
    { tipo: 'placa', tx: 15, ty: 25,
      placa: 'Passagem do paredão. Daqui em diante é porto: cuidado com a maré.' },
  ],

  npcs: [
    {
      id: 'zeca', nome: 'ZECA', estilo: 'zeca',
      tx: 12, ty: 8, dir: 'dir',
      falas: [
        'Ó ela! A vizinha resolveu virar caçadora de Encantado.',
        'Vai na frente que eu te alcanço. E olha que eu chego em Porto Iara primeiro.',
      ],
    },
    {
      id: 'caminhante', nome: 'CAMINHANTE', estilo: 'aldeao',
      tx: 15, ty: 14, dir: 'esq',
      falas: [
        'Esse atalho ali do lado não leva a lugar nenhum: é só volta.',
        'Se a sua criatura cair, volta pra vila. Apagado no mato não é lugar de ninguém.',
      ],
    },
    {
      id: 'menino2', nome: 'MENINO DA VILA', estilo: 'crianca',
      tx: 19, ty: 22, dir: 'esq',
      falas: ['Perdi de novo. Minha mãe vai me matar se souber que eu desci sozinho.'],
    },
  ],

  inicio: { tx: 13, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 13, ty: 0,  para: 'vilaAurora', destino: { tx: 13, ty: 24, dir: 'cima' } },
    { tx: 14, ty: 0,  para: 'vilaAurora', destino: { tx: 14, ty: 24, dir: 'cima' } },
    { tx: 13, ty: 33, para: 'portoIara',  destino: { tx: 16, ty: 1, dir: 'baixo' } },
    { tx: 14, ty: 33, para: 'portoIara',  destino: { tx: 17, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 8,
  encontros: [
    { especie: 'caiporinha', min: 3, max: 6, peso: 40 },
    { especie: 'piragua', min: 3, max: 6, peso: 35 },
    { especie: 'sacizinho', min: 4, max: 7, peso: 25 },
  ],
};
