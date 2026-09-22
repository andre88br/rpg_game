/* Casa de Benzimento da Aldeia Tupã — o único abrigo da quinta região.
   Quem apagar na campina, no charco ou no morro acorda sempre aqui: fica
   no meio das três estradas, a mesma distância de todas. */
import type { DefMapa } from '../../world/tilemap.ts';

export const benzimentoTupa: DefMapa = {
  id: 'benzimentoTupa',
  nome: 'CASA DE BENZIMENTO',
  interior: true,
  refugio: true,
  socorro: { quem: 'DONA JUREMA', falas: [
    'Acordou. Um vigia do morro te achou {caida} e te trouxe no ombro, {crianca}.',
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
      id: 'benzedeira_tupa', nome: 'DONA JUREMA', estilo: 'firmina',
      tx: 9, ty: 2, dir: 'esq',
      falas: [
        { cura: true, linhas: [
          'Chega mais, que raio não escolhe em quem bate. Passa os patuás na gamela.',
          '...pronto. Time inteiro de pé outra vez.',
          'Campina, charco ou morro: de qualquer um deles, o caminho de volta é pra cá.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'aldeiaTupa', destino: { tx: 47, ty: 9, dir: 'baixo' } },
  ],
};
