/* =========================================================================
   Terreiro da Aurora — o salão do Solano, e o fim da jornada.

   No saguão de entrada, a mesma tarefa do Jardim em pequeno: a fonte de
   luz na parede oeste, dois espelhos e um cristal. Com o feixe no cristal
   (cristal_aurora), a barreira da porta do meio some. Depois, duas guardas
   e, na câmara do alto, o Solano.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroAurora: DefMapa = {
  id: 'terreiroAurora',
  nome: 'TERREIRO DA AURORA',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 0
    'W___________________________W', // 1
    'W___________________________W', // 2
    'W___________________________W', // 3
    'WWWW_WWWWWWWWWWWWWWWWWWWWWWWW', // 4
    'W___________________________W', // 5
    'W___________________________W', // 6
    'W___________________________W', // 7
    'W___________________________W', // 8
    'W___________________________W', // 9
    'WWWWWWWWWWWWWWWWWWWWWWWW_WWWW', // 10
    'W___________________________W', // 11
    'W___________________________W', // 12
    'W___________________________W', // 13
    'W___________________________W', // 14
    'W___________________________W', // 15
    'W___________________________W', // 16
    'WWWWWWWWWWWWWW_WWWWWWWWWWWWWW', // 17
    'W___________________________W', // 18
    'W___________________________W', // 19
    'W___________________________W', // 20
    'W___________________________W', // 21
    'WWWWWWWWWWWWWW_WWWWWWWWWWWWWW', // 22
  ],

  feixe: { flag: 'cristal_aurora' },

  objetos: [
    { tipo: 'placa', tx: 22, ty: 20,
      placa: 'TERREIRO DA AURORA. A porta abre quando a luz chega ao cristal.' },
    { tipo: 'fonteLuz', tx: 1, ty: 20, larg: 1, dir: 'dir' },
    { tipo: 'cristal', tx: 2, ty: 18, larg: 1, placa: 'CRISTAL', se: 'cristal_aurora',
      falas: [{ linhas: ['O cristal brilha. A porta do meio está livre.'] }] },
    { tipo: 'cristal', tx: 2, ty: 18, larg: 1, placa: 'CRISTAL', seNao: 'cristal_aurora', vazio: true,
      falas: [{ linhas: ['Um cristal fosco, esperando luz.'] }] },
    { tipo: 'espelho', tx: 10, ty: 20, larg: 1, placa: 'ESPELHO', inclinacao: '\\', seNao: 'espelho_aurora_1',
      falas: [{ liga: 'espelho_aurora_1', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 10, ty: 20, larg: 1, placa: 'ESPELHO', inclinacao: '/', se: 'espelho_aurora_1',
      falas: [{ desliga: 'espelho_aurora_1', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 10, ty: 18, larg: 1, placa: 'ESPELHO', inclinacao: '/', seNao: 'espelho_aurora_2',
      falas: [{ liga: 'espelho_aurora_2', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 10, ty: 18, larg: 1, placa: 'ESPELHO', inclinacao: '\\', se: 'espelho_aurora_2',
      falas: [{ desliga: 'espelho_aurora_2', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'barreira', tx: 14, ty: 17, larg: 1, seNao: 'cristal_aurora' },
    { tipo: 'barreira', tx: 24, ty: 10, larg: 1, seNao: 'venceu_guarda_luz1' },
    { tipo: 'barreira', tx: 4,  ty: 4,  larg: 1, seNao: 'venceu_guarda_luz2' },
  ],

  npcs: [
    {
      id: 'guarda_luz1', nome: 'GUARDA DO ORVALHO', estilo: 'aldeao',
      tx: 23, ty: 11, dir: 'dir',
      treinador: {
        classe: 'GUARDA DO ORVALHO', visao: 3, premio: 4500,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'estrelaDalva', nivel: 59 }, { especie: 'lamparina', nivel: 59 },
               { especie: 'arcoDaVelha', nivel: 59 }],
        falaInicio: 'O feixe te trouxe até aqui. Agora é Encantado contra Encantado.',
        falaDerrota: 'Passa. A última guarda é a mais clara.',
      },
      falas: [
        { se: 'venceu_guarda_luz1', linhas: ['O Solano está no alto. Ele não pisca.'] },
        { batalha: true, linhas: ['O feixe te trouxe até aqui. Agora é Encantado contra Encantado.'] },
      ],
    },
    {
      id: 'guarda_luz2', nome: 'GUARDA DO MEIO-DIA', estilo: 'aldeao',
      tx: 5, ty: 5, dir: 'esq',
      treinador: {
        classe: 'GUARDA DO MEIO-DIA', visao: 3, premio: 5000,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'estrelaDalva', nivel: 60 }, { especie: 'maeDoOuro', nivel: 59 },
               { especie: 'lamparina', nivel: 60 }, { especie: 'relampo', nivel: 60 }],
        falaInicio: 'Meio-dia: a hora em que ninguém tem sombra. Nem você.',
        falaDerrota: 'Tá bom, tem sombra sim. Sobe.',
      },
      falas: [
        { se: 'venceu_guarda_luz2', linhas: ['A câmara do Solano é logo acima. Boa sorte, e bom sol.'] },
        { batalha: true, linhas: ['Meio-dia: a hora em que ninguém tem sombra. Nem você.'] },
      ],
    },
    {
      id: 'solano', nome: 'SOLANO', estilo: 'guarda',
      tx: 22, ty: 2, dir: 'esq',
      treinador: {
        classe: 'DONO DO TERREIRO', premio: 9000,
        esperta: true, itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'estrelaDalva', nivel: 60 }, { especie: 'maeDoOuro', nivel: 60 },
               { especie: 'lamparina', nivel: 60 }, { especie: 'arcoDaVelha', nivel: 60 },
               { especie: 'estrelaDalva', nivel: 60 }],
        trunfo: {
          boitatinha: { especie: 'iaraMae', nivel: 60 },
          iarinha: { especie: 'curupira', nivel: 60 },
          curupinho: { especie: 'boitatao', nivel: 60 },
        },
        falaInicio: 'Sete medalhas, sete Dons, oito vezes o Zeca. Agora o sol. Ninguém olha pra ele sem piscar.',
        falaDerrota: 'Você não piscou. A Trilha das Oito Medalhas termina aqui, com você.',
      },
      falas: [
        { se: 'medalha:aurora', linhas: [
          'A Medalha Aurora é sua, e o Dom Prisma com ela: a luz se desfaz em cores na sua mão.',
          'Oito medalhas. O Círculo Dourado vai querer te conhecer.'] },
        { se: 'venceu_solano', medalha: 'aurora', dom: 'prisma', linhas: [
          'Ganhou limpo. Toma a Medalha Aurora — a oitava — e o Dom Prisma, que abre as cortinas de luz.'] },
        { batalha: true, linhas: [
          'Seis Encantados, a luz inteira do dia. Vamos ver quem enxerga primeiro.'] },
      ],
    },
  ],

  inicio: { tx: 14, ty: 21, dir: 'cima' },

  saidas: [
    { tx: 14, ty: 22, para: 'cidadeDoSol', destino: { tx: 11, ty: 9, dir: 'baixo' } },
  ],
};
