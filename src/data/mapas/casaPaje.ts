/* Casa do Pajé — ele troca as cinco pedras-de-raio, caídas pelos quatro
   mapas largos da região (duas na campina, uma na aldeia, uma no charco,
   uma no morro), por uma conta da guia. */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaPaje: DefMapa = {
  id: 'casaPaje',
  nome: 'CASA DO PAJÉ',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWW',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W____TTTTT____W',
    'W____TTTTT____W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W______T______W',
    'WWWWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'estante', tx: 1,  ty: 1, larg: 3 },
    { tipo: 'estante', tx: 11, ty: 1, larg: 3 },
    { tipo: 'mesa',    tx: 5,  ty: 2, larg: 5 },
  ],

  npcs: [
    {
      id: 'paje', nome: 'PAJÉ', estilo: 'paje',
      tx: 7, ty: 1, dir: 'baixo',
      falas: [
        { se: 'conta_pedras_raio', linhas: [
          'As cinco pedras estão aqui na mesa, cada uma apontada pra onde caiu.',
          'O raio escolheu você, {crianca}. Eu só confirmei.'] },
        { se: 'item:pedra_raio>=5', pede: { item: 'pedra_raio', n: 5 }, liga: 'conta_pedras_raio',
          /* as pedras na mesa, o recado de Tupã e o fio da Companhia */
          paga: 600, cutscene: 'paje', linhas: [
          'Cinco pedras-de-raio, de cinco lugares diferentes! Senta, que eu vou pôr na mesa.'] },
        { linhas: [
          'Onde o raio cai, ele deixa uma pedra. Cinco caíram na região desde a última lua.',
          'Duas na campina, uma aqui na aldeia, uma no charco e uma no morro — cada uma num canto.',
          'Me traga as cinco e acendo uma conta da sua guia.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'aldeiaTupa', destino: { tx: 40, ty: 27, dir: 'baixo' } },
  ],
};
