/* Loja da Vila Fornalha — mesma função da loja de Porto Iara, mais alto na
   serra: quem chega até aqui já gastou patuá e garrafada na trilha. */
import type { DefMapa } from '../../world/tilemap.ts';

export const lojaFornalha: DefMapa = {
  id: 'lojaFornalha',
  nome: 'LOJA DA SERRA',
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
      id: 'lojista_serra', nome: 'LOJISTA', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { loja: true, linhas: [
          'A serra come garrafada rápido. Bom que você trouxe dinheiro.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'vilaFornalha', destino: { tx: 5, ty: 22, dir: 'baixo' } },
  ],
};
