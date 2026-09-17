/* =========================================================================
   Terreiro de Água — o salão de Dona Mariana, e o fim da Região da Foz.

   O salão é alagado: quem pisa na água não para de andar até bater em alguma
   coisa. Duas colunas de pedra são os únicos freios, e é delas que sai o
   quebra-cabeça. Entra-se pelo vão de baixo, em (8,8), e sai-se pelo vão de
   cima, em (2,2); a solução tem oito escorregões:

       cima · direita · baixo · esquerda · cima · esquerda · cima · cima

   O traçado NÃO foi escolhido no olho. Um salão de gelo erra fácil de dois
   jeitos: ou vira corredor (o escorregão não muda nada) ou vira armadilha
   (você chega num canto de onde não dá mais para voltar, e a partida trava
   sem batalha para perder). A planta foi procurada por busca larga entre as
   combinações de duas colunas, exigindo caminho até a saída E volta até a
   porta a partir de TODO lugar alcançável. `mapas.test.ts` refaz as duas
   contas a cada execução, então mexer numa coluna aqui acusa na hora.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroPortoIara: DefMapa = {
  id: 'terreiroPortoIara',
  nome: 'TERREIRO DE ÁGUA',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWWWW',
    'W_______________W',
    'WW_WWWWWWWWWWWWWW',
    'WWuuuuuWuuuuuuuWW',
    'WWuuuuuuuuuuuuuWW',
    'WWuuuuuuuuuuuuuWW',
    'WWuuuuuuuuuuuuuWW',
    'WWuuWuuuuuuuuuuWW',
    'WWWWWWWW_WWWWWWWW',
    'W_mmmmmmmmmmmmm_W',
    'W_mmmmmmmmmmmmm_W',
    'W_mmmmmmmmmmmmm_W',
    'W_______________W',
    'W_______T_______W',
    'WWWWWWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'gamela', tx: 1, ty: 9, larg: 2, alt: 2, solido: false },
    { tipo: 'gamela', tx: 14, ty: 9, larg: 2, alt: 2, solido: false },
  ],

  npcs: [
    {
      id: 'mariana', nome: 'DONA MARIANA', estilo: 'mariana',
      tx: 8, ty: 1, dir: 'baixo',
      treinador: {
        classe: 'DONA DO TERREIRO', premio: 1500,
        time: [{ especie: 'piragua', nivel: 13 }, { especie: 'iarinha', nivel: 15 }],
        falaInicio: 'A água já viu você chegar. Agora deixa ela ver o que você sabe.',
        falaDerrota: 'Pois é. A maré virou para o seu lado, criança.',
      },
      falas: [
        { se: 'medalha:mare', linhas: [
          'A Foz inteira é sua conhecida agora, {nome}.',
          'O que vem depois da água é assunto de outra região. Um dia você atravessa.'] },
        { se: 'venceu_mariana', medalha: 'mare', dom: 'nadar', linhas: [
          'Tome a MEDALHA MARÉ. Ela não é enfeite: é aviso de que a água te conhece.',
          'E com ela vem o Dom de NADAR. De hoje em diante rio e mar não te barram mais.',
          'Vá ver o que tem do outro lado, criança. É para isso que serve saber nadar.'] },
        { seNao: 'contas>=5', linhas: [
          'A guia ainda não se abriu, criança. Não foi você que entrou: foi o vento.',
          'Volte quando as cinco contas estiverem acesas.'] },
        { batalha: true, linhas: [
          'Então a guia se abriu. Quer dizer que a região inteira já confia em você.',
          'Falta uma pessoa para confiar, e essa sou eu. Prepare o seu time.'] },
      ],
    },
  ],

  inicio: { tx: 8, ty: 12, dir: 'cima' },
  cenario: 'praia',

  saidas: [
    { tx: 8, ty: 13, para: 'portoIara', destino: { tx: 16, ty: 18, dir: 'baixo' } },
  ],
};
