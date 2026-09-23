/* Loja do Bairro da Cuca — mesma função das lojas anteriores. Fecha tarde:
   no bairro, ninguém dorme cedo. */
import type { DefMapa } from '../../world/tilemap.ts';

export const lojaCuca: DefMapa = {
  id: 'lojaCuca',
  nome: 'LOJA DO BAIRRO',
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
      id: 'lojista_cuca', nome: 'LOJISTA', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { loja: true, linhas: [
          'Aqui a gente vende até de madrugada. No Bairro da Cuca, ninguém dorme cedo.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'bairroDaCuca', destino: { tx: 40, ty: 9, dir: 'baixo' } },
  ],
};
