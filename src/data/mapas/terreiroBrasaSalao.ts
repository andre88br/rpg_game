/* Terreiro de Brasa — sala 4 de 4, o salão do Brás.
   Depois do pátio, da escória e do breu, é aqui que o dono do terreiro
   espera — com um trunfo escolhido contra o Encantado inicial de quem
   chegou até ele. */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroBrasaSalao: DefMapa = {
  id: 'terreiroBrasaSalao',
  nome: 'TERREIRO DE BRASA — SALÃO',
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
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'WWWWWWW_WWWWWWW',
  ],

  objetos: [],

  npcs: [
    {
      id: 'bras', nome: 'BRÁS', estilo: 'aldeao',
      tx: 7, ty: 2, dir: 'baixo',
      treinador: {
        classe: 'DONO DO TERREIRO', premio: 3500,
        esperta: true, itens: { garrafada_forte: 2, erva_doce: 1 },
        time: [{ especie: 'cabritinha', nivel: 32 }, { especie: 'salamanca', nivel: 33 },
               { especie: 'mulaSemCabeca', nivel: 34 }, { especie: 'boitatao', nivel: 36 }],
        /* o quinto Encantado, escolhido contra o inicial de quem chegou até
           aqui — água bate em fogo, planta bate em água, fogo bate em planta */
        trunfo: {
          boitatinha: { especie: 'iaraMae', nivel: 34 },
          iarinha: { especie: 'curupira', nivel: 34 },
          curupinho: { especie: 'cabraCabriola', nivel: 35 },
        },
        falaInicio: 'Três guardas vencidos, e ainda de pé. Vamos ver se aguenta o dono da casa.',
        falaDerrota: 'Pois é. Até o Curupira que anda comigo respeita quem chega até aqui.',
      },
      falas: [
        { se: 'medalha:brasa', linhas: [
          'A Serra Boitatá é sua conhecida agora, {nome}.',
          'O que vem depois da serra é assunto de outra região. Um dia você chega lá.'] },
        { se: 'venceu_bras', medalha: 'brasa', dom: 'tocha', linhas: [
          'Tome a MEDALHA BRASA. Ela não é enfeite: é aviso de que a serra te conhece.',
          'E com ela vem o Dom de TOCHA. De hoje em diante, o breu não te esconde mais nada.',
          'Vá em frente, {nome}. É para isso que serve saber acender fogo na hora certa.'] },
        { batalha: true, linhas: [
          'Pátio, escória e breu — passou pelos três. Falta só eu.',
          'Prepare o seu time. O terreiro inteiro está vendo.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 13, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 14, para: 'terreiroBrasaBreu', destino: { tx: 8, ty: 1, dir: 'baixo' } },
  ],
};
