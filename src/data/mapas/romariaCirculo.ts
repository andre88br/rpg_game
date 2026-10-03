/* =========================================================================
   Romaria do Círculo — o salão das lutas em sequência, no pós-jogo.

   O Mestre da Romaria manda um romeiro atrás do outro (game/romaria.ts),
   no nível do Encantado mais forte do jogador mais 2. Só benze a cada sete
   vitórias; perder, ou sair do salão, encerra a sequência. As três barracas
   trocam as fichas ganhas por prêmios.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const romariaCirculo: DefMapa = {
  id: 'romariaCirculo',
  nome: 'ROMARIA DO CÍRCULO',
  interior: true,
  musica: 'terreiro',

  chao: [
    'WWWWWWWWWWWWWWWWW',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______T_______W',
    'WWWWWWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'estante', tx: 1,  ty: 1, larg: 3 },
    { tipo: 'estante', tx: 13, ty: 1, larg: 3 },
    { tipo: 'balcao',  tx: 1,  ty: 6, larg: 3 },
    { tipo: 'balcao',  tx: 13, ty: 6, larg: 3 },
    { tipo: 'balcao',  tx: 7,  ty: 3, larg: 3 },
    { tipo: 'placa', tx: 11, ty: 9,
      placa: 'ROMARIA: um romeiro atrás do outro. Benzimento só a cada sete vitórias. Sair do salão encerra a sequência.' },
  ],

  npcs: [
    {
      id: 'mestre_romaria', nome: 'MESTRE DA ROMARIA', estilo: 'guarda',
      tx: 8, ty: 2, dir: 'baixo',
      falas: [
        { se: 'romaria_andando', romaria: true, linhas: [
          '{romaria} vitórias seguidas. O próximo romeiro já está na fila. Vamos?'] },
        { romaria: true, linhas: [
          'A Romaria não para: um romeiro atrás do outro, no nível do seu melhor Encantado.',
          'Benzo o seu time a cada sete vitórias. O recorde até hoje: {recorde}. Vamos?'] },
      ],
    },
    {
      id: 'barraca_patua', nome: 'BARRAQUEIRA', estilo: 'aldeao',
      tx: 2, ty: 5, dir: 'baixo',
      falas: [
        { se: 'item:ficha_romaria>=5', pede: { item: 'ficha_romaria', n: 5 },
          da: { item: 'patua_mestre', n: 3 }, linhas: ['Cinco fichas, três Patuás de Mestre. Negócio fechado!'] },
        { linhas: ['Cinco fichas e levo três Patuás de Mestre pra você. Romaria dá ficha, viu?'] },
      ],
    },
    {
      id: 'barraca_agua', nome: 'BARRAQUEIRO', estilo: 'aldeao',
      tx: 14, ty: 5, dir: 'baixo',
      falas: [
        { se: 'item:ficha_romaria>=12', pede: { item: 'ficha_romaria', n: 12 },
          da: { item: 'agua_benta', n: 3 }, linhas: ['Doze fichas, três Águas Bentas. Volta sempre!'] },
        { linhas: ['Água Benta de verdade, três garrafas por doze fichas.'] },
      ],
    },
    {
      id: 'barraca_cantiga', nome: 'CANTADOR', estilo: 'aldeao',
      tx: 4, ty: 9, dir: 'dir',
      falas: [
        { se: ['item:ficha_romaria>=30', '!item:cantiga_rasante'], pede: { item: 'ficha_romaria', n: 30 },
          cantiga: 'cantiga_rasante', linhas: ['Trinta fichas! Te ensino a Cantiga do Rasante, que é de levar pra vida.'] },
        { se: 'item:cantiga_rasante', linhas: ['Cantiga boa a gente canta até gastar a voz. E ela não gasta.'] },
        { linhas: ['Com trinta fichas eu canto a Cantiga do Rasante pra você levar.'] },
      ],
    },
  ],

  inicio: { tx: 8, ty: 9, dir: 'cima' },

  saidas: [
    { tx: 8, ty: 10, para: 'circuloDourado', destino: { tx: 36, ty: 31, dir: 'baixo' } },
  ],
};
