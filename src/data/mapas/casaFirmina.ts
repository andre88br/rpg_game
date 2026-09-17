/* Casa da Dona Firmina — na Etapa 3 é aqui que se escolhe o inicial, entre os
   três patuás em cima da mesa comprida. */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaFirmina: DefMapa = {
  id: 'casaFirmina',
  nome: 'CASA DA DONA FIRMINA',
  interior: true,

  chao: [
    'WWWWWWWWWWWWW',
    'W___________W',
    'W___________W',
    'W___________W',
    'W__TTTTTTT__W',
    'W__TTTTTTT__W',
    'W__TTTTTTT__W',
    'W___________W',
    'W___________W',
    'W_____T_____W',
    'WWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'estante', tx: 1, ty: 1, larg: 3 },
    { tipo: 'estante', tx: 9, ty: 1, larg: 3 },
    { tipo: 'mesa',    tx: 4, ty: 2, larg: 5 },
  ],

  npcs: [
    {
      id: 'firmina', nome: 'DONA FIRMINA', estilo: 'firmina',
      tx: 6, ty: 1, dir: 'baixo',
      falas: [
        'Chegou na hora, criança. Três patuás em cima da mesa, e um deles é seu.',
        'Ainda não. Primeiro me conta: você já sabe o caminho até Porto Iara?',
        'Desce a Rota da Foz e não sai da estrada. O resto a gente resolve depois.',
      ],
    },
  ],

  inicio: { tx: 6, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 6, ty: 9, para: 'vilaAurora', destino: { tx: 14, ty: 6, dir: 'baixo' } },
  ],
};
