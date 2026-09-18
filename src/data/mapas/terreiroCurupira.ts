/* =========================================================================
   Terreiro de Raiz — o salão da Tiê, e o fim da Mata do Curupira.

   Aqui não é água que escorrega: é raiz viva. Duas colunas de parede são os
   únicos freios, e é delas que sai o quebra-cabeça — mesma regra do salão
   alagado de Porto Iara, cara nova. Entra-se por baixo, em (6,13); sai-se
   por cima, em (5,1), do lado da Tiê; a solução tem seis escorregões:

       cima · cima · cima · cima · cima · cima · esquerda · cima · direita
       · cima · cima

   (os seis primeiros são só andar até o campo de raízes — as decisões de
   verdade começam quando a raiz pega no pé). O traçado não foi escolhido no
   olho: foi buscado à parte por busca larga, exigindo caminho até a Tiê E
   volta para a porta a partir de TODO lugar alcançável, e barrando qualquer
   solução de uma tecla só (seguraria "cima" e chegaria de graça). Mexer numa
   coluna aqui acusa na hora em `mapas.test.ts`.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroCurupira: DefMapa = {
  id: 'terreiroCurupira',
  nome: 'TERREIRO DE RAIZ',
  interior: true,

  chao: [
    'WWWWWWWWWWWWW',
    'W___________W',
    'W___________W',
    'W_vvvvvvvvv_W',
    'W_vvvvWvvvv_W',
    'W_vvvvvvvvv_W',
    'W_vvvWvvvvv_W',
    'W_vvvvvvvvv_W',
    'WWWWWW_WWWWWW',
    'W___________W',
    'W___________W',
    'W___________W',
    'W___________W',
    'W___________W',
    'WWWWWWWWWWWWW',
  ],

  objetos: [],

  npcs: [
    {
      id: 'tie', nome: 'TIÊ', estilo: 'tie',
      tx: 6, ty: 1, dir: 'baixo',
      treinador: {
        classe: 'DONA DO TERREIRO', premio: 1800,
        time: [{ especie: 'caiporinha', nivel: 20 }, { especie: 'curupinho', nivel: 22 },
               { especie: 'curupira', nivel: 25 }],
        falaInicio: 'A mata inteira escuta esse terreiro, sabia? Vamos ver o que você aprendeu com ela.',
        falaDerrota: 'Pois é. Até o Curupira que anda comigo respeita quem chega até aqui.',
      },
      falas: [
        { se: 'medalha:raiz', linhas: [
          'A Mata do Curupira é sua conhecida agora, {nome}.',
          'O que vem depois da mata é assunto de outra região. Um dia você chega lá.'] },
        { se: 'venceu_tie', medalha: 'raiz', dom: 'cortarCipo', linhas: [
          'Tome a MEDALHA RAIZ. Ela não é enfeite: é aviso de que a mata te conhece.',
          'E com ela vem o Dom de CORTAR CIPÓ. De hoje em diante, touceira nenhuma te barra o caminho.',
          'Vá em frente, {nome}. É para isso que serve saber abrir caminho na mata.'] },
        { seNao: 'contas:planta>=5', linhas: [
          'A guia ainda não se abriu, {crianca}. Não foi você que entrou: foi o vento entre as raízes.',
          'Volte quando as cinco contas estiverem acesas.'] },
        { batalha: true, linhas: [
          'Então a guia se abriu. Quer dizer que a mata inteira já confia em você.',
          'Falta uma pessoa para confiar, e essa sou eu. Prepare o seu time.'] },
      ],
    },
  ],

  inicio: { tx: 6, ty: 12, dir: 'cima' },
  cenario: 'mata',

  saidas: [
    { tx: 6, ty: 13, para: 'mataDoCurupira', destino: { tx: 6, ty: 7, dir: 'baixo' } },
  ],
};
