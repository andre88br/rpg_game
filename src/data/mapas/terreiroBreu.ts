/* =========================================================================
   Terreiro do Breu — o salão da Morgana, e o fim do Bairro da Cuca.

   No escuro, como o Casarão. Entra-se por baixo, em (14,21), num salão com
   dois pilares e um VULTO dando a volta em cada um — a mesma ronda do Beco
   (game/ronda.ts), agora enxergando sete tiles. Ser visto devolve à
   entrada. A porta do canto noroeste (4,10) é guardada pela primeira
   guarda; a sala de cima, pela segunda; a Morgana espera na câmara do alto.
   Os vultos somem quando a Morgana cai, para a saída ficar livre.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroBreu: DefMapa = {
  id: 'terreiroBreu',
  nome: 'TERREIRO DO BREU',
  interior: true,
  escuro: {},

  chao: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 0
    'W___________________________W', // 1
    'W___________________________W', // 2
    'W___________________________W', // 3
    'WWWWWWWWWWWWWWWWWWWWWWWW_WWWW', // 4
    'W___________________________W', // 5
    'W___________________________W', // 6
    'W___________________________W', // 7
    'W___________________________W', // 8
    'W___________________________W', // 9
    'WWWW_WWWWWWWWWWWWWWWWWWWWWWWW', // 10
    'W___________________________W', // 11
    'W___________________________W', // 12
    'W___________________________W', // 13
    'W__WWW___WWW_____WWW________W', // 14
    'W__WWW___WWW_____WWW________W', // 15
    'W__WWW___WWW_____WWW________W', // 16
    'W___________________________W', // 17
    'W___________________________W', // 18
    'W___________________________W', // 19
    'W___________________________W', // 20
    'W___________________________W', // 21
    'WWWWWWWWWWWWWW_WWWWWWWWWWWWWW', // 22
  ],

  objetos: [
    { tipo: 'placa', tx: 22, ty: 20,
      placa: 'TERREIRO DO BREU. Os vultos veem longe, mas só para a frente.' },
    { tipo: 'barreira', tx: 4,  ty: 10, larg: 1, seNao: 'venceu_guarda_sombra1' },
    { tipo: 'barreira', tx: 24, ty: 4,  larg: 1, seNao: 'venceu_guarda_sombra2' },
  ],

  npcs: [
    {
      id: 'vulto1', nome: 'VULTO', estilo: 'anhanga',
      tx: 9, ty: 13, dir: 'dir', seNao: 'venceu_morgana',
      ronda: {
        visao: 7, volta: { tx: 14, ty: 21, dir: 'cima' },
        fala: 'Um vulto vira a cabeça devagar... e você acorda de novo na entrada do salão.',
        caminho: [{ tx: 9, ty: 13 }, { tx: 10, ty: 13 }, { tx: 11, ty: 13 }, { tx: 12, ty: 13 }, { tx: 12, ty: 14 }, { tx: 12, ty: 15 }, { tx: 12, ty: 16 }, { tx: 12, ty: 17 }, { tx: 11, ty: 17 }, { tx: 10, ty: 17 }, { tx: 9, ty: 17 }, { tx: 8, ty: 17 }, { tx: 8, ty: 16 }, { tx: 8, ty: 15 }, { tx: 8, ty: 14 }, { tx: 8, ty: 13 }],
      },
      falas: [{ linhas: ['O vulto não responde. Só olha.'] }],
    },
    {
      id: 'vulto2', nome: 'VULTO', estilo: 'anhanga',
      tx: 20, ty: 16, dir: 'baixo', seNao: 'venceu_morgana',
      ronda: {
        visao: 7, volta: { tx: 14, ty: 21, dir: 'cima' },
        fala: 'Um vulto vira a cabeça devagar... e você acorda de novo na entrada do salão.',
        caminho: [{ tx: 20, ty: 16 }, { tx: 20, ty: 17 }, { tx: 19, ty: 17 }, { tx: 18, ty: 17 }, { tx: 17, ty: 17 }, { tx: 16, ty: 17 }, { tx: 16, ty: 16 }, { tx: 16, ty: 15 }, { tx: 16, ty: 14 }, { tx: 16, ty: 13 }, { tx: 17, ty: 13 }, { tx: 18, ty: 13 }, { tx: 19, ty: 13 }, { tx: 20, ty: 13 }, { tx: 20, ty: 14 }, { tx: 20, ty: 15 }],
      },
      falas: [{ linhas: ['O vulto não responde. Só olha.'] }],
    },
    {
      id: 'vulto3', nome: 'VULTO', estilo: 'anhanga',
      tx: 2, ty: 15, dir: 'baixo', seNao: 'venceu_morgana',
      ronda: {
        visao: 7, volta: { tx: 14, ty: 21, dir: 'cima' },
        fala: 'Um vulto vira a cabeça devagar... e você acorda de novo na entrada do salão.',
        caminho: [{ tx: 2, ty: 15 }, { tx: 2, ty: 16 }, { tx: 2, ty: 17 }, { tx: 3, ty: 17 }, { tx: 4, ty: 17 }, { tx: 5, ty: 17 }, { tx: 6, ty: 17 }, { tx: 6, ty: 16 }, { tx: 6, ty: 15 }, { tx: 6, ty: 14 }, { tx: 6, ty: 13 }, { tx: 5, ty: 13 }, { tx: 4, ty: 13 }, { tx: 3, ty: 13 }, { tx: 2, ty: 13 }, { tx: 2, ty: 14 }],
      },
      falas: [{ linhas: ['O vulto não responde. Só olha.'] }],
    },
    {
      id: 'guarda_sombra1', nome: 'GUARDA DA NÉVOA', estilo: 'guarda',
      tx: 3, ty: 11, dir: 'dir',
      treinador: {
        classe: 'GUARDA DA NÉVOA', visao: 2, premio: 3200,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'corpoSeco', nivel: 57 }, { especie: 'lobisomem', nivel: 57 },
               { especie: 'relampo', nivel: 57 }],
        falaInicio: 'Passou pelos vultos sem eles verem? Então tem pé leve. Vamos ver a mão.',
        falaDerrota: 'Mão pesada também. Sobe.',
      },
      falas: [
        { se: 'venceu_guarda_sombra1', linhas: ['Lá em cima, a Guarda do Luto. Depois dela, a Morgana.'] },
        { batalha: true, linhas: ['Ninguém sobe sem passar pela névoa.'] },
      ],
    },
    {
      id: 'guarda_sombra2', nome: 'GUARDA DO LUTO', estilo: 'guarda',
      tx: 23, ty: 5, dir: 'dir',
      treinador: {
        classe: 'GUARDA DO LUTO', visao: 2, premio: 3600,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'cuca', nivel: 58 }, { especie: 'lobisomem', nivel: 58 },
               { especie: 'mapinguari', nivel: 58 }, { especie: 'corpoSeco', nivel: 58 }],
        falaInicio: 'Última guarda. Aqui dentro até a luz fica de luto.',
        falaDerrota: 'Então vai. A Morgana já apagou as velas pra te receber.',
      },
      falas: [
        { se: 'venceu_guarda_sombra2', linhas: ['A câmara dela é logo acima. Não pisca.'] },
        { batalha: true, linhas: ['O luto não abre caminho pra qualquer um.'] },
      ],
    },
    {
      id: 'morgana', nome: 'MORGANA', estilo: 'anhanga',
      tx: 3, ty: 2, dir: 'dir',
      treinador: {
        classe: 'DONA DO TERREIRO', premio: 7000,
        esperta: true, itens: { garrafada_forte: 3, erva_doce: 1, agua_benta: 1 },
        time: [{ especie: 'lobisomem', nivel: 58 }, { especie: 'corpoSeco', nivel: 58 },
               { especie: 'cuca', nivel: 59 }, { especie: 'matinta', nivel: 59 },
               { especie: 'lobisomem', nivel: 60 }],
        /* o sexto Encantado, escolhido contra o inicial — a regra do Brás */
        trunfo: {
          boitatinha: { especie: 'iaraMae', nivel: 59 },
          iarinha: { especie: 'curupira', nivel: 59 },
          curupinho: { especie: 'boitatao', nivel: 59 },
        },
        falaInicio: 'Passou pelos vultos, pelas guardas, pelo Casarão. Agora vem o breu de verdade.',
        falaDerrota: 'O breu cedeu. Pouca gente vê no escuro como você.',
      },
      falas: [
        { se: 'medalha:breu', linhas: [
          'A Medalha Breu é sua, e o Dom Visão Noturna com ela. Véu de sombra nenhum esconde mais nada de você.'] },
        { se: 'venceu_morgana', medalha: 'breu', dom: 'visao', linhas: [
          'Ganhou limpo. Toma a Medalha Breu — e o Dom Visão Noturna: o escuro abre, e os véus caem.'] },
        { batalha: true, linhas: [
          'Seis Encantados, nenhuma vela acesa. Vamos ver quem enxerga primeiro.'] },
      ],
    },
  ],

  inicio: { tx: 14, ty: 21, dir: 'cima' },

  saidas: [
    { tx: 14, ty: 22, para: 'bairroDaCuca', destino: { tx: 11, ty: 9, dir: 'baixo' } },
  ],
};
