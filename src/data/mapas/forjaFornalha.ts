/* Forja da Vila Fornalha — o Ferreiro empresta a candeia para quem vai à
   Caverna do Boitatá, e troca cinco carvões achados lá dentro por uma conta
   da guia. */
import type { DefMapa } from '../../world/tilemap.ts';

export const forjaFornalha: DefMapa = {
  id: 'forjaFornalha',
  nome: 'FORJA',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWW',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W______T______W',
    'WWWWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'estante', tx: 1,  ty: 1, larg: 4 },
    { tipo: 'estante', tx: 10, ty: 1, larg: 4 },
    { tipo: 'balcao',  tx: 3,  ty: 5, larg: 9 },
  ],

  npcs: [
    {
      id: 'ferreiro', nome: 'FERREIRO', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { se: 'conta_fole', linhas: [
          'Cinco carvões acesos e uma conta da guia, tudo por conta da sua candeia.',
          'Guarde-a. A serra ainda tem gruta escura pela frente.'] },
        { se: 'item:carvao>=5', pede: { item: 'carvao', n: 5 }, liga: 'conta_fole', paga: 400, linhas: [
          'Cinco carvões, ainda quentes! É disso que essa forja precisa.',
          'Acendi uma conta da guia por sua conta. E toma, pelo trabalho.'] },
        { se: 'tem_candeia', linhas: [
          'A Caverna do Boitatá é logo ao sul da vila. Cinco carvões, num pote cada, escondidos no breu.',
          'Sem luz de verdade lá dentro você não acha nem a própria mão.'] },
        { da: { item: 'candeia' }, liga: 'tem_candeia', linhas: [
          'Vejo que vai enfrentar a caverna. Leve essa candeia — não é muito, mas é mais que nada.',
          'Ache cinco carvões lá dentro e me traga: essa forja está fria há anos.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'vilaFornalha', destino: { tx: 5, ty: 30, dir: 'baixo' } },
  ],
};
