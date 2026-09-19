/* Loja da Aldeia Catavento — mesma função das lojas anteriores, mais alto e
   mais exposta ao vento: quem chega até aqui já gastou patuá e garrafada no
   Campo Aberto e na Ventania Funda. */
import type { DefMapa } from '../../world/tilemap.ts';

export const lojaCatavento: DefMapa = {
  id: 'lojaCatavento',
  nome: 'LOJA DO CATAVENTO',
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
      id: 'lojista_catavento', nome: 'LOJISTA', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { loja: true, linhas: [
          'O vento aqui em cima come garrafada rápido. Bom que você trouxe dinheiro.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'aldeiaCatavento', destino: { tx: 5, ty: 22, dir: 'baixo' } },
  ],
};
