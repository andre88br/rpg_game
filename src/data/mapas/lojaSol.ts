/* Loja da Cidade do Sol — mesma função das lojas anteriores. Abre com o
   primeiro raio e fecha com o último. */
import type { DefMapa } from '../../world/tilemap.ts';

export const lojaSol: DefMapa = {
  id: 'lojaSol',
  nome: 'LOJA DO SOL',
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
      id: 'lojista_sol', nome: 'LOJISTA', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { loja: true, linhas: [
          'Abro com o primeiro raio e fecho com o último. Aproveita que ainda é dia.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'cidadeDoSol', destino: { tx: 40, ty: 9, dir: 'baixo' } },
  ],
};
