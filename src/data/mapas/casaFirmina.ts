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
        { se: 'conta_recado', linhas: [
          'O Mestre do Porto mandou agradecer. Disse que a carta chegou seca, apesar da maré.',
          'Uma conta acesa. Faltam quatro, e nenhuma delas se acende de graça.'] },
        { se: 'item:carta', linhas: [
          'A carta é para o MESTRE DO PORTO, lá no cais de Porto Iara.',
          'E não abra no caminho. Carta molhada e carta lida dão no mesmo: não servem.'] },
        { seNao: 'falou_firmina', liga: ['falou_firmina', 'tem_recado'],
          da: { item: 'carta' }, linhas: [
          'Chegou na hora, criança. Antes de qualquer patuá, um serviço.',
          'Leve esta carta ao Mestre do Porto, em Porto Iara. É coisa de gente grande.',
          'Desce a Rota da Foz e não sai da estrada. O resto a gente resolve depois.'] },
        { linhas: [
          'A carta some no caminho? Pois então volte aqui que eu escrevo outra.',
          'Mas não me faça escrever duas vezes a mesma coisa, criança.'] },
      ],
    },
  ],

  inicio: { tx: 6, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 6, ty: 9, para: 'vilaAurora', destino: { tx: 14, ty: 6, dir: 'baixo' } },
  ],
};
