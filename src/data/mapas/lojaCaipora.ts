/* Loja do Arraial da Caipora — mesma função das lojas anteriores, a única
   entre as três estradas das Minas. */
import type { DefMapa } from '../../world/tilemap.ts';

export const lojaCaipora: DefMapa = {
  id: 'lojaCaipora',
  nome: 'LOJA DO ARRAIAL',
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
      id: 'lojista_caipora', nome: 'LOJISTA', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { loja: true, linhas: [
          'Garimpo gasta garrafada e patuá como a terra gasta enxada. Leva de sobra.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'arraialCaipora', destino: { tx: 40, ty: 9, dir: 'baixo' } },
  ],
};
