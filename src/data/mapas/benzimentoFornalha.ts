/* Casa de Benzimento da Vila Fornalha — o único abrigo da Serra Boitatá.
   Não há outro depois daqui até o Terreiro de Brasa: quem apagar na trilha,
   na caverna ou na cumeeira acorda sempre aqui. */
import type { DefMapa } from '../../world/tilemap.ts';

export const benzimentoFornalha: DefMapa = {
  id: 'benzimentoFornalha',
  nome: 'CASA DE BENZIMENTO',
  interior: true,
  refugio: true,
  socorro: { quem: 'DONA IZILDA', falas: [
    'Acordou. Um tropeiro te achou {caida} na trilha e trouxe pra cá, {crianca}.',
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
      id: 'benzedeira_serra', nome: 'DONA IZILDA', estilo: 'firmina',
      tx: 9, ty: 2, dir: 'esq',
      falas: [
        { cura: true, linhas: [
          'Passa esses patuás na gamela, que a serra é dura com quem sobe.',
          '...pronto. Time inteiro de pé outra vez.',
          'Guarde isso na cabeça: depois daqui não tem outro benzimento até o Terreiro de Brasa.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'vilaFornalha', destino: { tx: 28, ty: 22, dir: 'baixo' } },
  ],
};
