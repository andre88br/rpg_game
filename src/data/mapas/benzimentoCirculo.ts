/* Casa de Benzimento do Círculo Dourado — quem cai na arena acorda aqui,
   e o torneio recomeça do primeiro Guardião. */
import type { DefMapa } from '../../world/tilemap.ts';

export const benzimentoCirculo: DefMapa = {
  id: 'benzimentoCirculo',
  nome: 'CASA DE BENZIMENTO',
  interior: true,
  refugio: true,
  socorro: { quem: 'DONA DOURADA', falas: [
    'Acordou. O Porteiro te trouxe da arena {caida}, {crianca}. O Círculo recomeça do primeiro.',
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
      id: 'benzedeira_circulo', nome: 'DONA DOURADA', estilo: 'firmina',
      tx: 9, ty: 2, dir: 'esq',
      falas: [
        { cura: true, linhas: [
          'Chega mais. Quem sai da arena sai cansado, ganhando ou perdendo.',
          '...pronto. Time inteiro de pé outra vez.',
          'Lembra: lá dentro não tem gamela. O que você levar na mochila é o que você tem.'] },
      ],
    },
    /* o Rezador: faz lembrar golpe esquecido, a dinheiro (scenes/rezador.ts) */
    {
      id: 'rezador_circulo', nome: 'REZADOR', estilo: 'paje',
      tx: 2, ty: 3, dir: 'baixo',
      falas: [
        { rezador: true, linhas: [
          'Tem golpe que o Encantado esquece, mas a reza traz de volta.',
          'Oitocentos réis por reza. Escolha quem, e o que ele vai lembrar.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'circuloDourado', destino: { tx: 6, ty: 15, dir: 'baixo' } },
  ],
};
