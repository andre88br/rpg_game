/* Porto Iara — a cidade do Terreiro de Água, e o fim da Fase 1.
   O terreiro fica no meio do largo, e a guia de cinco contas atravessa o pátio
   na frente da porta: enquanto as cinco contas não acenderem, ninguém entra.
   A grade é editável à mão, um caractere por tile de 16x16:
     .  grama          ,  mato alto (encontros)   =  caminho de terra
     a  areia          ~  água (intransponível)   p  cais de madeira
     #  árvore         o  pedra                   f  flores                  */
import type { DefMapa } from '../../world/tilemap.ts';

export const portoIara: DefMapa = {
  id: 'portoIara',
  nome: 'PORTO IARA',

  chao: [
    '################==################',
    '#...............==...............#',
    '#...............==...............#',
    '#.#.............==.............#.#',
    '#...............==...............#',
    '#...............==...............#',
    '#...............==...............#',
    '#...............==...............#',
    '#.#.........f...==..f..........#.#',
    '#........=......==.....=.........#',
    '#.==============================.#',
    '#.==============================.#',
    '#........==............==........#',
    '#.,,,,,.o==............==..,,,,,.#',
    '#.,,,,,..==............==..,,,,,.#',
    '#.,,,,,..==...........o==..,,,,,.#',
    '#.,,,,,.f==o...........==f.,,,,,.#',
    '#.,,,,,..==............==..,,,,,.#',
    '#........==..=======...==........#',
    '#........==..=======...==........#',
    '#.#.....==================.....#.#',
    '#.......==================.......#',
    '#......o==================.......#',
    '#...........==========...........#',
    '#.,,,,,.f...==========....f.,,,,.#',
    '#.,,,,,.....==========......,,,,.#',
    '#.,,,,,..f..==========....f.,,,,.#',
    '#.,,,,,.....==========.....o,,,,.#',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '~~~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],

  objetos: [
    { tipo: 'casa',       tx: 2,  ty: 5,  larg: 4, alt: 3, trancada: true },
    { tipo: 'benzimento', tx: 7,  ty: 5,  larg: 5, alt: 4 },   // porta (9,8)
    { tipo: 'loja',       tx: 21, ty: 5,  larg: 5, alt: 4 },   // porta (23,8)
    { tipo: 'casa',       tx: 28, ty: 5,  larg: 4, alt: 3, trancada: true },
    { tipo: 'terreiro',   tx: 13, ty: 13, larg: 7, alt: 5 },   // porta (16,17)
    // a guia de cinco contas: o portão da Fase 1
    { tipo: 'portao',     tx: 13, ty: 19, larg: 7, contas: 0 },
    { tipo: 'placa',      tx: 20, ty: 19,
      placa: 'TERREIRO DE ÁGUA, de Dona Mariana. A guia abre com cinco contas acesas.' },
    { tipo: 'placa',      tx: 11, ty: 22,
      placa: 'Ao sul: a praia e o cais. Ao norte: a Rota da Foz.' },
  ],

  npcs: [
    {
      id: 'guarda', nome: 'GUARDA DO LARGO', estilo: 'guarda',
      tx: 12, ty: 20, dir: 'dir',
      falas: [
        'A guia tem cinco contas, e todas apagadas. Assim ninguém passa.',
        'Cada serviço bem feito nesta região acende uma. Pergunte por aí quem precisa de ajuda.',
      ],
    },
    {
      id: 'pescador', nome: 'MESTRE DO PORTO', estilo: 'pescador',
      tx: 17, ty: 29, dir: 'cima',
      falas: [
        'Sem as redes ninguém pesca hoje, moça.',
        'Sumiram três. Dizem que foi bicho, e não gente. Quem me trouxer de volta acende uma conta da guia.',
      ],
    },
    {
      id: 'contador', nome: 'CONTADOR DE BICHOS', estilo: 'aldeao',
      tx: 24, ty: 21, dir: 'esq',
      falas: [
        'Eu anoto num caderno todo Encantado que aparece por aqui. Já são quatro na região.',
        'Me traga os quatro anotados e eu mesmo acendo uma conta pra você.',
      ],
    },
    {
      id: 'crianca', nome: 'MENINO DO CAIS', estilo: 'crianca',
      tx: 6, ty: 21, dir: 'baixo',
      falas: ['Tem um bicho de fogo morando no farol. De noite dá pra ver os olhos dele.'],
    },
    {
      id: 'aldea', nome: 'MOÇA DA VILA', estilo: 'aldeao',
      tx: 26, ty: 12, dir: 'esq',
      falas: ['A loja vende patuás. Sem patuá não dá para capturar Encantado nenhum.'],
    },
  ],

  inicio: { tx: 16, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 16, ty: 0,  para: 'rotaFoz',              destino: { tx: 13, ty: 32, dir: 'cima' } },
    { tx: 17, ty: 0,  para: 'rotaFoz',              destino: { tx: 14, ty: 32, dir: 'cima' } },
    { tx: 9,  ty: 8,  para: 'benzimentoPortoIara',  destino: { tx: 7, ty: 8, dir: 'cima' } },
    { tx: 23, ty: 8,  para: 'lojaPortoIara',        destino: { tx: 7, ty: 8, dir: 'cima' } },
    { tx: 16, ty: 17, para: 'terreiroPortoIara',    destino: { tx: 8, ty: 12, dir: 'cima' } },
  ],

  cenario: 'praia',
  passosPorEncontro: 8,
  /* O mato de Porto Iara é beira de rio: Piraguá é o que mais aparece, o
     Sacizinho passa correndo de vez em quando e a Caiporinha vem do mato
     mais fechado do fundo. */
  encontros: [
    { especie: 'piragua', min: 4, max: 7, peso: 55 },
    { especie: 'caiporinha', min: 4, max: 6, peso: 30 },
    { especie: 'sacizinho', min: 5, max: 7, peso: 15 },
  ],
};
