/* =========================================================================
   Terreiro do Rodamoinho — o salão do Pererê, e o fim do Campo do Saci.

   O salão gira sozinho: quem pisa na corrente não para até bater em alguma
   coisa. Quatro pedras espalhadas pela sala são os únicos freios, e é delas
   que sai o quebra-cabeça — mesma regra do salão alagado de Porto Iara e do
   campo de raízes do Curupira, cara nova. Entra-se por baixo, em (7,15);
   sai-se por cima, em (7,0), do lado do Pererê; a solução tem dez
   escorregões:

       cima · cima · cima · esquerda · cima · direita · cima · cima · cima · cima

   O traçado NÃO foi escolhido no olho: foi achado por busca larga entre
   milhares de combinações de quatro pedras, exigindo ao mesmo tempo que dê
   pra sair pelo vão de cima E voltar até a porta a partir de TODO lugar
   alcançável — e que segurar uma direção só nunca resolva sozinho.
   `mapas.test.ts` reconfere isso a cada execução; mexer numa pedra aqui
   acusa na hora.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroRodamoinho: DefMapa = {
  id: 'terreiroRodamoinho',
  nome: 'TERREIRO DO RODAMOINHO',
  interior: true,

  chao: [
    'WWWWWWW_WWWWWWW',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'WWWWWWWVWWWWWWW',
    'WVVVVVVVWVVVVVW',
    'WVVVVVVVVVVVVWW',
    'WVVVVVVVVVVVVVW',
    'WVVVVVVVVVVVVVW',
    'WVVVVVVWVVVVVVW',
    'WVVVVVVVVVVVVVW',
    'WVVVVVWVVVVVVVW',
    'WWWWWWWVWWWWWWW',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'WWWWWWW_WWWWWWW',
  ],

  objetos: [],

  npcs: [
    {
      id: 'perere', nome: 'PERERÊ', estilo: 'mariana',
      tx: 5, ty: 1, dir: 'baixo',
      treinador: {
        classe: 'DONO DO TERREIRO', premio: 4000,
        esperta: true, itens: { garrafada_forte: 2, erva_doce: 1 },
        time: [{ especie: 'saci', nivel: 45 }, { especie: 'matinta', nivel: 46 },
               { especie: 'cabraCabriola', nivel: 46 }, { especie: 'saci', nivel: 47 },
               { especie: 'matinta', nivel: 48 }],
        falaInicio: 'Atravessou a ventania funda e ainda sobrou vento pra chegar aqui. Vamos ver quanto sobra depois de mim.',
        falaDerrota: 'Pois é. O vento virou de vez para o seu lado, criança.',
      },
      falas: [
        { se: 'medalha:rodamoinho', linhas: [
          'A Medalha Rodamoinho é sua, e o Dom Rajada com ela. Use os dois com cuidado.'] },
        { se: 'venceu_perere', medalha: 'rodamoinho', dom: 'rajada', linhas: [
          'Ganhou limpo. Toma a Medalha Rodamoinho — e o Dom Rajada, que abre o que o vento tranca.'] },
        { batalha: true, linhas: [
          'Cinco Encantados, um vento só. Vamos ver se o seu aguenta o meu até o fim.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 15, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 16, para: 'aldeiaCatavento', destino: { tx: 16, ty: 8, dir: 'baixo' } },
  ],
};
