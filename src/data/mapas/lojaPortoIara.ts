/* Loja de Porto Iara — patuás, garrafadas e ervas. O balcão vira tela de
   compra na Etapa 2; por ora o lojista só conversa. */
import type { DefMapa } from '../../world/tilemap.ts';

export const lojaPortoIara: DefMapa = {
  id: 'lojaPortoIara',
  nome: 'LOJA',
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
      id: 'lojista', nome: 'LOJISTA', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { loja: true, linhas: [
          'Entra, entra. Patuá, garrafada, erva-doce: o que a mata dá, eu vendo.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'portoIara', destino: { tx: 23, ty: 9, dir: 'baixo' } },
  ],
};
