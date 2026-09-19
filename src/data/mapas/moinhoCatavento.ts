/* Moinho da Aldeia Catavento — o Moleiro troca cinco penas de vento,
   achadas soltas pelo Campo do Saci, por uma conta da guia. */
import type { DefMapa } from '../../world/tilemap.ts';

export const moinhoCatavento: DefMapa = {
  id: 'moinhoCatavento',
  nome: 'MOINHO',
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
      id: 'moleiro', nome: 'MOLEIRO', estilo: 'aldeao',
      tx: 7, ty: 4, dir: 'baixo',
      falas: [
        { se: 'conta_catavento', linhas: [
          'Cinco penas moídas e uma conta da guia, tudo por conta do seu olho bom.',
          'O moinho não para de girar desde então.'] },
        { se: 'item:pena>=5', pede: { item: 'pena', n: 5 }, liga: 'conta_catavento', paga: 400, linhas: [
          'Cinco penas, e nenhuma igual à outra! É disso que este moinho precisa.',
          'Acendi uma conta da guia por sua conta. E toma, pelo trabalho.'] },
        { linhas: [
          'O Campo do Saci inteiro está cheio de pena de vento, se você souber olhar.',
          'Cinco penas, achadas soltas pelo campo, e eu acendo uma conta da sua guia.'] },
      ],
    },
    {
      id: 'uirapuru', nome: 'UIRAPURU', estilo: 'bicho:uirapuru',
      tx: 3, ty: 7, dir: 'dir', seNao: 'servico_uirapuru',
      falas: [
        /* precisa dos três punhados de capim dourado E da medalha: é
           conteúdo de depois do Pererê, e o único jeito de ter o Encantado
           exclusivo da região */
        { se: ['servico_capim', 'medalha:rodamoinho'], liga: 'servico_uirapuru',
          encantado: { especie: 'uirapuru', nivel: 30 }, linhas: [
          'Um canto desce das vigas do moinho, uma vez só, e o vento inteiro para para escutar.',
          '— Três punhados de capim dourado, juntos de novo. Quem faz isso, eu canto para.',
          'O UIRAPURU desce das vigas e vai com você.'] },
        { se: 'medalha:rodamoinho', linhas: [
          'Um canto risca as vigas do moinho e some antes de você achar de onde veio.',
          'Dizem que ele só desce para quem junta os três punhados de capim dourado.'] },
        { linhas: [
          'Alguma coisa canta lá em cima, entre as vigas, alto demais para ver direito.',
          'Não é vento, não é engrenagem. É outra coisa, e ela não canta para qualquer um.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'aldeiaCatavento', destino: { tx: 5, ty: 30, dir: 'baixo' } },
  ],
};
