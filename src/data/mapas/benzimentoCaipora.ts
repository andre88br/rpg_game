/* Casa de Benzimento do Arraial da Caipora — o único abrigo da sexta
   região. Quem apagar no vale, nas galerias ou na cava acorda aqui. Se o
   time apagar escoltando o Tuco, ele volta correndo para o fundo da mina. */
import type { DefMapa } from '../../world/tilemap.ts';

export const benzimentoCaipora: DefMapa = {
  id: 'benzimentoCaipora',
  nome: 'CASA DE BENZIMENTO',
  interior: true,
  refugio: true,
  socorro: { quem: 'DONA ZEFA', falas: [
    'Acordou. Um garimpeiro te achou {caida} e te trouxe no carrinho de mão, {crianca}.',
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
      id: 'benzedeira_caipora', nome: 'DONA ZEFA', estilo: 'firmina',
      tx: 9, ty: 2, dir: 'esq',
      falas: [
        { cura: true, linhas: [
          'Chega mais, que a mina não perdoa. Passa os patuás na gamela.',
          '...pronto. Time inteiro de pé outra vez.',
          'Vale, galerias ou cava: de qualquer um deles, o caminho de volta é pra cá.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'arraialCaipora', destino: { tx: 47, ty: 9, dir: 'baixo' } },
  ],
};
