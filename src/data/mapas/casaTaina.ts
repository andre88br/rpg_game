/* Casa da Tainá — o quarto de onde tudo começa.
   Nos interiores: _ piso de madeira · W parede · T tapete (o da porta é a saída) */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaTaina: DefMapa = {
  id: 'casaTaina',
  nome: 'SUA CASA',
  interior: true,
  refugio: true,

  chao: [
    'WWWWWWWWWWW',
    'W_________W',
    'W_________W',
    'W_________W',
    'W__TTTTT__W',
    'W__TTTTT__W',
    'W__TTTTT__W',
    'W_________W',
    'W____T____W',
    'WWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'estante', tx: 1, ty: 1, larg: 3 },
    { tipo: 'mesa',    tx: 6, ty: 1, larg: 3 },
  ],

  npcs: [
    {
      id: 'mae', nome: 'MÃE', estilo: 'aldeao',
      tx: 2, ty: 5, dir: 'dir',
      falas: [
        'Acordou, enfim! A Dona Firmina mandou chamar você.',
        'Vai lá, criança. E leva juízo junto com o patuá.',
      ],
    },
  ],

  inicio: { tx: 5, ty: 7, dir: 'cima' },

  saidas: [
    { tx: 5, ty: 8, para: 'vilaAurora', destino: { tx: 6, ty: 6, dir: 'baixo' } },
  ],
};
