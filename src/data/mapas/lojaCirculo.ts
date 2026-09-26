/* Loja do Círculo Dourado — a última antes do torneio. Garrafada é o que
   mais sai: lá dentro ninguém benze ninguém. */
import type { DefMapa } from '../../world/tilemap.ts';

export const lojaCirculo: DefMapa = {
  id: 'lojaCirculo',
  nome: 'LOJA DO CÍRCULO',
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
      id: 'lojista_circulo', nome: 'LOJISTA', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { loja: true, linhas: [
          'Última loja antes da arena. Leva garrafada: lá dentro ninguém benze ninguém.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'circuloDourado', destino: { tx: 37, ty: 15, dir: 'baixo' } },
  ],
};
