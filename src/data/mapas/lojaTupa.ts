/* Loja da Aldeia Tupã — mesma função das lojas anteriores. É a única entre
   três mapas largos, então quem chega da campina costuma chegar sem patuá. */
import type { DefMapa } from '../../world/tilemap.ts';

export const lojaTupa: DefMapa = {
  id: 'lojaTupa',
  nome: 'LOJA DA ALDEIA TUPÃ',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWW',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W______T______W',
    'WWWWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'estante', tx: 1,  ty: 1, larg: 4 },
    { tipo: 'estante', tx: 10, ty: 1, larg: 4 },
    { tipo: 'balcao',  tx: 3,  ty: 5, larg: 9 },
  ],

  npcs: [
    {
      id: 'lojista_tupa', nome: 'LOJISTA', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { loja: true, linhas: [
          'Três estradas saem daqui, e nenhuma é curta. Leva garrafada de sobra.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'aldeiaTupa', destino: { tx: 40, ty: 9, dir: 'baixo' } },
  ],
};
