/* Casa de Benzimento — o lugar de curar o time. A gamela de água benta fica
   no fundo; na Etapa 2 ela cura de verdade e grava a partida. */
import type { DefMapa } from '../../world/tilemap.ts';

export const benzimentoPortoIara: DefMapa = {
  id: 'benzimentoPortoIara',
  nome: 'CASA DE BENZIMENTO',
  interior: true,
  refugio: true,
  socorro: { quem: 'DONA ROSA', falas: [
    'Acordou. Te acharam caída perto do cais, menina.',
    'Passei os seus Encantados na gamela. Estão todos de pé outra vez.'] },

  chao: [
    'WWWWWWWWWWWWWWW',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W__TTTTTTTTT__W',
    'W__TTTTTTTTT__W',
    'W__TTTTTTTTT__W',
    'W_____________W',
    'W_____________W',
    'W______T______W',
    'WWWWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'gamela',  tx: 6,  ty: 1, larg: 2, alt: 2 },
    { tipo: 'estante', tx: 1,  ty: 1, larg: 3 },
    { tipo: 'estante', tx: 11, ty: 1, larg: 3 },
  ],

  npcs: [
    {
      id: 'benzedeira', nome: 'DONA ROSA', estilo: 'firmina',
      tx: 9, ty: 2, dir: 'esq',
      falas: [
        { cura: true, linhas: [
          'Encoste os patuás na gamela, criança, que a água benta faz o resto.',
          '...pronto. Time inteiro de pé outra vez.',
          'E fique tranquila: se apagar no mato, é aqui que você acorda.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'portoIara', destino: { tx: 9, ty: 9, dir: 'baixo' } },
  ],
};
