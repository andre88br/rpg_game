/* Aldeia Catavento — o eixo do Campo do Saci: loja, benzimento (o abrigo da
   região), o moinho do Moleiro, e o pátio do Terreiro do Rodamoinho.
   O Zeca aparece pela quarta vez, agora guardando a subida para o Topo do
   Redemoinho — ele já seguiu o jogador desde a Rota da Foz.
   O pátio do terreiro é fechado nas laterais (colunas 13 e 20, linhas 8-11):
   a guia de sete contas — cinco obrigatórias, duas de serviço — é o único
   jeito de chegar até a porta, igual em toda região anterior.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore/pilar (parede)   .  grama (chão)
     ,  mato alto (encontro)    o  pedra (obstáculo solto)               */
import type { DefMapa } from '../../world/tilemap.ts';

export const aldeiaCatavento: DefMapa = {
  id: 'aldeiaCatavento',
  nome: 'ALDEIA CATAVENTO',

  chao: [
    '################..################',
    '#................................#',
    '#................................#',
    '#..o..........................o..#',
    '#................................#',
    '#................................#',
    '#................................#',
    '#................................#',
    '#...........#.......#............#',
    '#...........#.......#............#',
    '#...........#.......#............#',
    '#...........#.......#............#',
    '#................................#',
    '#................................#',
    '#..,,,,,,,,...........,,,,,,,,...#',
    '#..,,,,,,,,...........,,,,,,,,...#',
    '#..,,,,,,,,...........,,,,,,,,...#',
    '#..,,,,,,,,...........,,,,,,,,...#',
    '#................................#',
    '#................................#',
    '#....o......................o....#',
    '#................................#',
    '#..,,,,,,,,...........,,,,,,,,...#',
    '#..,,,,,,,,...........,,,,,,,,...#',
    '#..,,,,,,,,...........,,,,,,,,...#',
    '#..,,,,,,,,...........,,,,,,,,...#',
    '#................................#',
    '#................................#',
    '#................................#',
    '#.......o................o.......#',
    '#................................#',
    '#................................#',
    '#................................#',
    '################..################',
  ],

  objetos: [
    { tipo: 'terreiro',    tx: 13, ty: 3,  larg: 7, alt: 5 },              // porta (16,7)
    { tipo: 'portao',      tx: 13, ty: 11, larg: 7, terreiro: 'vento' },
    { tipo: 'loja',        tx: 3,  ty: 18, larg: 5, alt: 4 },              // porta (5,21)
    { tipo: 'benzimento',  tx: 26, ty: 18, larg: 5, alt: 4 },              // porta (28,21)
    { tipo: 'moinho',      tx: 3,  ty: 26, larg: 5, alt: 4 },              // porta (5,29)
    { tipo: 'placa', tx: 19, ty: 1,
      placa: 'ALDEIA CATAVENTO. O terreiro fica ao norte; o topo, ao sul.' },
    { tipo: 'placa', tx: 20, ty: 12,
      placa: 'TERREIRO DO RODAMOINHO, do Pererê. A guia abre com cinco contas acesas.' },
    /* a tranca do Zeca, pela quarta vez: some no instante em que ele perde */
    { tipo: 'barreira', tx: 16, ty: 33, larg: 2, seNao: 'venceu_zeca4' },
    { tipo: 'placa', tx: 19, ty: 31,
      placa: 'Ao sul, o Topo do Redemoinho. O vento lá em cima não perdoa ninguém.' },

    /* o terceiro capim dourado, no canto do largo — serviço opcional da região */
    { tipo: 'achado', tx: 30, ty: 5, solido: false, placa: 'CAPIM DOURADO',
      se: 'achou_capim_aldeia', vazio: true,
      falas: [{ linhas: ['A touceira está murcha agora.'] }] },
    { tipo: 'achado', tx: 30, ty: 5, solido: false, placa: 'CAPIM DOURADO',
      seNao: 'achou_capim_aldeia',
      falas: [{ liga: 'achou_capim_aldeia', da: { item: 'capim_dourado' }, linhas: [
        'Crescendo numa fresta do muro, sem murchar nunca: um punhado de CAPIM DOURADO.',
        'A moleira do moinho procura os três até hoje.'] }] },
  ],

  npcs: [
    {
      id: 'zeca4', nome: 'ZECA', estilo: 'zeca',
      tx: 16, ty: 32, dir: 'cima',
      treinador: {
        classe: 'MOLEQUE DA VILA', visao: 5, premio: 2200,
        liga: 'venceu_zeca4',
        time: [{ especie: 'matinta', nivel: 41 }, { especie: 'saci', nivel: 42 },
               { especie: 'cabraCabriola', nivel: 42 }, { especie: 'curupira', nivel: 43 }],
        falaInicio: 'Você achou que eu ia parar depois da vila do Brás? Te segui até aqui em cima.',
        falaDerrota: 'De novo?! Um dia eu ganho de você, {crianca}. Um dia.',
        esperta: true, itens: { garrafada_forte: 2 },
      },
      falas: [
        { se: 'venceu_zeca4', linhas: [
          'Vai lá. O topo é seu — por enquanto. Eu ainda não desisti, viu?'] },
        { batalha: true, linhas: [
          'Quarta vez, {crianca}. Foz, mata, serra, e agora aqui. Isso já é hábito meu.'] },
      ],
    },
    {
      id: 'prendedora_ventos', nome: 'PRENDEDORA DE VENTOS', estilo: 'aldeao',
      tx: 17, ty: 19, dir: 'baixo',
      falas: [
        { se: 'conta_penas', linhas: [
          'Seis Encantados presos, cada um na hora certa. Isso é ofício, {crianca}.'] },
        { se: 'capturados>=6', liga: 'conta_penas', paga: 500, linhas: [
          'Seis presos, você me disse? Deixa eu conferir... é verdade!',
          'Ver bicho voando é fácil. Prender no ar é que separa quem treina de quem só corre atrás.',
          'Acendi uma conta da guia por sua conta.'] },
        { linhas: [
          'Não conto quem você viu passar: conto quem você prendeu. Já são {capturados} no seu patuá.',
          'Me traga seis Encantados presos, direitinho, e acendo uma conta da sua guia.'] },
      ],
    },
    {
      id: 'capinzeiro', nome: 'CAPINZEIRO', estilo: 'aldeao',
      tx: 12, ty: 19, dir: 'baixo',
      falas: [
        { se: 'servico_capim', linhas: [
          'Os três punhados de capim dourado, guardados no moinho. A aldeia inteira agradece.'] },
        /* serviço opcional: não trava guia nenhuma, mas paga bem */
        { se: 'item:capim_dourado>=3', pede: { item: 'capim_dourado', n: 3 }, liga: 'servico_capim',
          paga: 3000, da: { item: 'patua_mestre', n: 3 }, linhas: [
          'Os TRÊS! Ninguém achava os três punhados desde que eu era criança.',
          'Toma o que eu tenho de melhor guardado, e o dinheiro que a aldeia separou.',
          'E fica de olho no moinho. Capim dourado atrai bicho que ninguém nunca viu.'] },
        { linhas: [
          'O vento espalhou três punhados de capim dourado pela região: um aqui na aldeia mesmo,',
          'e os outros dois em campo aberto e lá no topo. Nenhum murcha, nenhum apaga.',
          'Me traga os três e eu te pago bem — tenho {dinheiro} motivos pra saber que você precisa.'] },
      ],
    },
  ],

  inicio: { tx: 16, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 16, ty: 0,  para: 'ventaniaFunda',      destino: { tx: 9,  ty: 41, dir: 'cima' } },
    { tx: 17, ty: 0,  para: 'ventaniaFunda',      destino: { tx: 10, ty: 41, dir: 'cima' } },
    { tx: 16, ty: 33, para: 'topoDoRedemoinho',   destino: { tx: 16, ty: 1,  dir: 'baixo' } },
    { tx: 17, ty: 33, para: 'topoDoRedemoinho',   destino: { tx: 17, ty: 1,  dir: 'baixo' } },
    { tx: 16, ty: 7,  para: 'terreiroRodamoinho', destino: { tx: 7,  ty: 15, dir: 'cima' } },
    { tx: 5,  ty: 21, para: 'lojaCatavento',      destino: { tx: 7,  ty: 8,  dir: 'cima' } },
    { tx: 28, ty: 21, para: 'benzimentoCatavento', destino: { tx: 7, ty: 8,  dir: 'cima' } },
    { tx: 5,  ty: 29, para: 'moinhoCatavento',    destino: { tx: 7,  ty: 8,  dir: 'cima' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 12,
  encontros: [
    { especie: 'saci', min: 40, max: 42, peso: 45 },
    { especie: 'matinta', min: 40, max: 42, peso: 30 },
    { especie: 'cabritinha', min: 39, max: 41, peso: 25 },
  ],
};
