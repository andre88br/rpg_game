/* Casa da Encruzilhada — loja e benzimento sob o mesmo teto, na Mata do
   Curupira: uma casa só, dois balcões, para não abrir mais um prédio na
   clareira. É aqui que se acorda depois de apagar no mato da região. */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaEncruzilhada: DefMapa = {
  id: 'casaEncruzilhada',
  nome: 'CASA DA ENCRUZILHADA',
  interior: true,
  refugio: true,
  socorro: { quem: 'DONA IRACI', falas: [
    'Acordou. Te acharam {caida} no mato, {crianca}.',
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
    { tipo: 'gamela',  tx: 1,  ty: 1, larg: 2, alt: 2 },
    { tipo: 'balcao',  tx: 5,  ty: 2, larg: 6 },
    { tipo: 'estante', tx: 12, ty: 1, larg: 2 },
  ],

  npcs: [
    {
      id: 'iraci', nome: 'DONA IRACI', estilo: 'firmina',
      tx: 2, ty: 3, dir: 'dir',
      falas: [
        { cura: true, linhas: [
          'Encoste os patuás na gamela, {crianca}, que a água benta faz o resto.',
          '...pronto. Time inteiro de pé outra vez.',
          'E fique tranquila: se apagar no mato da região, é aqui que você acorda.'] },
      ],
    },
    {
      id: 'mercador', nome: 'MERCADOR', estilo: 'pescador',
      tx: 7, ty: 1, dir: 'baixo',
      falas: [
        { loja: true, linhas: [
          'Entra, entra. Patuá, garrafada, erva-doce: o que dá na mata, eu vendo também.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'mataDoCurupira', destino: { tx: 15, ty: 7, dir: 'baixo' } },
  ],
};
