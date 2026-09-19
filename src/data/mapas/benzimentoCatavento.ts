/* Casa de Benzimento da Aldeia Catavento — o único abrigo do Campo do Saci.
   Não há outro depois daqui até o Terreiro do Rodamoinho: quem apagar no
   campo, na ventania ou no topo acorda sempre aqui. */
import type { DefMapa } from '../../world/tilemap.ts';

export const benzimentoCatavento: DefMapa = {
  id: 'benzimentoCatavento',
  nome: 'CASA DE BENZIMENTO',
  interior: true,
  refugio: true,
  socorro: { quem: 'DONA CACILDA', falas: [
    'Acordou. Um catador te achou {caida} no campo e trouxe pra cá, {crianca}.',
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
    { tipo: 'bau', tx: 10, ty: 7, larg: 2, placa: 'BAÚ DA BENZEDEIRA',
      falas: [{ caixa: true, linhas: [
        'Dentro do baú estão os Encantados que não couberam no seu time.'] }] },
  ],

  npcs: [
    {
      id: 'benzedeira_catavento', nome: 'DONA CACILDA', estilo: 'firmina',
      tx: 9, ty: 2, dir: 'esq',
      falas: [
        { cura: true, linhas: [
          'Passa esses patuás na gamela, que o vento daqui é duro com quem sobe.',
          '...pronto. Time inteiro de pé outra vez.',
          'Guarde isso na cabeça: depois daqui não tem outro benzimento até o Terreiro do Rodamoinho.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'aldeiaCatavento', destino: { tx: 28, ty: 22, dir: 'baixo' } },
  ],
};
