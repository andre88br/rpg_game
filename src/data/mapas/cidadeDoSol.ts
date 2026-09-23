/* =========================================================================
   Cidade do Sol — o eixo da última região: o Caminho da Aurora a oeste, o
   Jardim dos Espelhos a leste e, ao norte, o Pico da Aurora, trancado pelo
   Zeca pela oitava vez. Loja, benzimento, a casa do Oráculo (três
   perguntas) e a Joalheira, que procura cristais solares.

   A tarefa nova daqui é a CORRIDA CONTRA O SOL (game/corrida.ts): o
   Acendedor, na praça, dá a largada, e um relógio aparece no canto da tela.
   Os cinco lampiões ficam nos cantos da cidade; acender todos antes do fim
   acende `conta_lampioes`. O tempo acabou: eles apagam e recomeça. O
   relógio só corre com o jogador andando (conversa e menu param ele), e
   `mapas.test.ts` confere que a melhor rota correndo cabe no tempo, mas
   andando não.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const cidadeDoSol: DefMapa = {
  id: 'cidadeDoSol',
  nome: 'CIDADE DO SOL',

  chao: [
    '###########################..###########################', // 0
    '#..........................==..........................#', // 1
    '#..........................==..........................#', // 2
    '#..........................==..,,,,,...................#', // 3
    '#..........................==..,,,,,...................#', // 4
    '#..........................==..,,,,,...................#', // 5
    '#..........................==..,,,,,...................#', // 6
    '#..........................==..,,,,,...................#', // 7
    '#..........................==..,,,,,...................#', // 8
    '#......#.......#...........==..,,,,,....=......=.......#', // 9
    '#......#.......#...........==..,,,,,....=......=.......#', // 10
    '#......#.......#...........==...........=......=.......#', // 11
    '#......#.......#...........==...........=......=.......#', // 12
    '#..........=...............==...........=......=.......#', // 13
    '#.,,,,.....=...............==...........=......=.......#', // 14
    '#.,,,,.....=...............==...........=......=.......#', // 15
    '#.,,,,.....=...............==...........=......=.......#', // 16
    '#.,,,,.....=...............==...........=......=.......#', // 17
    '#..........=...............==...........=......=.......#', // 18
    '#..........=...............==...........=......=.......#', // 19
    '.======================================================.', // 20
    '.======================================================.', // 21
    '#..........................==..........................#', // 22
    '#..........................==..........................#', // 23
    '#..........................==..........................#', // 24
    '#..........................==..........................#', // 25
    '#..........................==...............,,,,,,,,,,.#', // 26
    '#.......................ffffffff............,,,,,,,,,,.#', // 27
    '#.......................ffffffff............,,,,,,,,,,.#', // 28
    '#.......................ff~~~~ff............,,,,,,,,,,.#', // 29
    '#.,,,,,,,,,.............ff~~~~ff............,,,,,,,,,,.#', // 30
    '#.,,,,,,,,,.............ffffffff............,,,,,,,,,,.#', // 31
    '#.,,,,,,,,,.............ffffffff.......................#', // 32
    '#.,,,,,,,,,.....,,,,,,,....==..........................#', // 33
    '#.,,,,,,,,,.....,,,,,,,....==..........................#', // 34
    '#.,,,,,,,,,.....,,,,,,,....==...................RRR.RRR#', // 35
    '#.,,,,,,,,,.....,,,,,,,....==...................R......#', // 36
    '#.,,,,,,,,,.....,,,,,,,....==...................R......#', // 37
    '#...............,,,,,,,....==...................R......#', // 38
    '#...............................................R......#', // 39
    '#...............................................R......#', // 40
    '########################################################', // 41
  ],

  corrida: {
    ativa: 'corrida_lampioes',
    marcos: ['lampiao_1', 'lampiao_2', 'lampiao_3', 'lampiao_4', 'lampiao_5'],
    conta: 'conta_lampioes',
    segundos: 26,
    fim: 'O sol se pôs antes do último lampião. Todos se apagam de novo. Fala com o Acendedor pra tentar outra vez.',
  },

  objetos: [
    { tipo: 'terreiro',    tx: 8,  ty: 4,  larg: 7, alt: 5 },              // porta (11,8)
    { tipo: 'portao',      tx: 8,  ty: 12, larg: 7, terreiro: 'luz' },
    { tipo: 'loja',        tx: 38, ty: 5,  larg: 5, alt: 4 },              // porta (40,8)
    { tipo: 'benzimento',  tx: 45, ty: 5,  larg: 5, alt: 4 },              // porta (47,8)
    { tipo: 'casa',        tx: 38, ty: 23, larg: 5, alt: 4 },              // porta (40,26), o Oráculo
    { tipo: 'placa', tx: 16, ty: 12,
      placa: 'TERREIRO DA AURORA, do Solano. A guia abre com cinco contas acesas.' },
    { tipo: 'placa', tx: 25, ty: 22,
      placa: 'CIDADE DO SOL. Oeste: Caminho da Aurora. Leste: Jardim dos Espelhos. Norte: Pico da Aurora.' },
    { tipo: 'placa', tx: 43, ty: 26,
      placa: 'O ORÁCULO DO SOL. Quem pergunta, responde primeiro.' },
    /* a tranca do Zeca, pela oitava e última vez: a subida do Pico */
    { tipo: 'barreira', tx: 27, ty: 0, larg: 2, seNao: 'venceu_zeca8' },

    /* os cinco lampiões da corrida contra o sol */
    { tipo: 'lampiao', tx: 4, ty: 3, larg: 1, placa: 'LAMPIÃO', se: 'lampiao_1',
      falas: [{ linhas: ['Aceso. Falta correr pros outros!'] }] },
    { tipo: 'lampiao', tx: 4, ty: 3, larg: 1, placa: 'LAMPIÃO', seNao: 'lampiao_1', vazio: true,
      falas: [
        { se: 'corrida_lampioes', liga: 'lampiao_1', linhas: ['Você acende o lampião. Um a menos!'] },
        { linhas: ['Apagado. O Acendedor, na praça, é quem dá a largada.'] },
      ] },
    { tipo: 'lampiao', tx: 52, ty: 3, larg: 1, placa: 'LAMPIÃO', se: 'lampiao_2',
      falas: [{ linhas: ['Aceso. Falta correr pros outros!'] }] },
    { tipo: 'lampiao', tx: 52, ty: 3, larg: 1, placa: 'LAMPIÃO', seNao: 'lampiao_2', vazio: true,
      falas: [
        { se: 'corrida_lampioes', liga: 'lampiao_2', linhas: ['Você acende o lampião. Um a menos!'] },
        { linhas: ['Apagado. O Acendedor, na praça, é quem dá a largada.'] },
      ] },
    { tipo: 'lampiao', tx: 4, ty: 38, larg: 1, placa: 'LAMPIÃO', se: 'lampiao_3',
      falas: [{ linhas: ['Aceso. Falta correr pros outros!'] }] },
    { tipo: 'lampiao', tx: 4, ty: 38, larg: 1, placa: 'LAMPIÃO', seNao: 'lampiao_3', vazio: true,
      falas: [
        { se: 'corrida_lampioes', liga: 'lampiao_3', linhas: ['Você acende o lampião. Um a menos!'] },
        { linhas: ['Apagado. O Acendedor, na praça, é quem dá a largada.'] },
      ] },
    { tipo: 'lampiao', tx: 44, ty: 38, larg: 1, placa: 'LAMPIÃO', se: 'lampiao_4',
      falas: [{ linhas: ['Aceso. Falta correr pros outros!'] }] },
    { tipo: 'lampiao', tx: 44, ty: 38, larg: 1, placa: 'LAMPIÃO', seNao: 'lampiao_4', vazio: true,
      falas: [
        { se: 'corrida_lampioes', liga: 'lampiao_4', linhas: ['Você acende o lampião. Um a menos!'] },
        { linhas: ['Apagado. O Acendedor, na praça, é quem dá a largada.'] },
      ] },
    { tipo: 'lampiao', tx: 20, ty: 24, larg: 1, placa: 'LAMPIÃO', se: 'lampiao_5',
      falas: [{ linhas: ['Aceso. Falta correr pros outros!'] }] },
    { tipo: 'lampiao', tx: 20, ty: 24, larg: 1, placa: 'LAMPIÃO', seNao: 'lampiao_5', vazio: true,
      falas: [
        { se: 'corrida_lampioes', liga: 'lampiao_5', linhas: ['Você acende o lampião. Um a menos!'] },
        { linhas: ['Apagado. O Acendedor, na praça, é quem dá a largada.'] },
      ] },

    /* bolso do Dom Prisma no canto sudeste */
    { tipo: 'cortinaLuz', tx: 51, ty: 35, larg: 1, seNao: 'dom_prisma' },
    { tipo: 'achado', tx: 53, ty: 39, solido: false, placa: 'ESCONDERIJO', se: 'achou_esconderijo_cidade', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 53, ty: 39, solido: false, placa: 'ESCONDERIJO', seNao: 'achou_esconderijo_cidade',
      falas: [{ liga: 'achou_esconderijo_cidade', da: { item: 'agua_benta', n: 2 }, linhas: [
        'Atrás da cortina de luz, duas cabaças lacradas: ÁGUA BENTA.',
        'Ninguém atravessava aquela luz antes do Dom Prisma.'] }] },
  ],

  npcs: [
    {
      id: 'acendedor', nome: 'ACENDEDOR', estilo: 'aldeao',
      tx: 30, ty: 24, dir: 'baixo',
      falas: [
        { se: 'conta_lampioes', linhas: [
          'Cinco lampiões antes do sol cair! Nunca vi ninguém correr assim. A conta é sua.'] },
        { se: 'corrida_lampioes', linhas: ['Corre! Olha o sol no canto!'] },
        { liga: 'corrida_lampioes', linhas: [
          'Quando o sol se põe, a Cidade do Sol precisa de luz. Cinco lampiões, um em cada canto.',
          'Acende todos antes do sol sumir, e eu acendo uma conta da sua guia. Andando não dá: corre!',
          'Valendo... JÁ!'] },
      ],
    },
    {
      id: 'zeca8', nome: 'ZECA', estilo: 'zeca',
      tx: 29, ty: 1, dir: 'baixo',
      treinador: {
        classe: 'RIVAL DE SEMPRE', visao: 4, premio: 5000, liga: 'conta_zeca8',
        time: [{ especie: 'lobisomem', nivel: 59 }, { especie: 'minhocao', nivel: 59 },
               { especie: 'relampo', nivel: 59 }, { especie: 'saci', nivel: 60 },
               { especie: 'estrelaDalva', nivel: 60 }, { especie: 'curupira', nivel: 60 }],
        falaInicio: 'Oito, {crianca}. Da Foz até aqui. Essa é a última, e eu trouxe seis. Sem desculpa dessa vez.',
        falaDerrota: 'Oito a zero... Sabe de uma coisa? Foi a melhor viagem da minha vida. Vai lá, o Pico é seu.',
        esperta: true, itens: { garrafada_forte: 3, erva_doce: 1, agua_benta: 1 },
      },
      falas: [
        { se: 'venceu_zeca8', linhas: [
          'Quando você for campeã... quer dizer, campeão... lembra de mim, tá? Eu fui o primeiro a te desafiar.'] },
        { batalha: true, linhas: [
          'A subida do Pico é aqui. E eu estou na frente dela, como sempre estive.'] },
      ],
    },
    {
      id: 'joalheira', nome: 'JOALHEIRA', estilo: 'firmina',
      tx: 18, ty: 28, dir: 'baixo',
      falas: [
        { se: 'servico_cristais', linhas: [
          'Os três cristais já estão na coroa da cidade. E a lua, dizem, anda descendo no Pico.'] },
        { se: 'item:cristal_solar>=3', pede: { item: 'cristal_solar', n: 3 }, liga: 'servico_cristais',
          paga: 5000, da: { item: 'patua_mestre', n: 3 }, linhas: [
          'Os TRÊS cristais solares! Com eles a cidade guarda a luz do dia a noite inteira.',
          'Toma o que eu tenho de melhor, e o dinheiro. E escuta:',
          'quem guarda a luz do dia, a Jaci vem ver. Sobe no alto do Pico de noite.'] },
        { linhas: [
          'Três cristais solares estão enterrados na região: um no Caminho, um no Jardim, um no Pico.',
          'A sua forquilha acha. Me traz os três?'] },
      ],
    },
  ],

  inicio: { tx: 1, ty: 20, dir: 'dir' },

  saidas: [
    { tx: 0,  ty: 20, para: 'caminhoAurora',    destino: { tx: 58, ty: 20, dir: 'esq' } },
    { tx: 0,  ty: 21, para: 'caminhoAurora',    destino: { tx: 58, ty: 21, dir: 'esq' } },
    { tx: 55, ty: 20, para: 'jardimEspelhos',   destino: { tx: 1,  ty: 20, dir: 'dir' } },
    { tx: 55, ty: 21, para: 'jardimEspelhos',   destino: { tx: 1,  ty: 21, dir: 'dir' } },
    { tx: 27, ty: 0,  para: 'picoAurora',       destino: { tx: 27, ty: 38, dir: 'cima' } },
    { tx: 28, ty: 0,  para: 'picoAurora',       destino: { tx: 28, ty: 38, dir: 'cima' } },
    { tx: 11, ty: 8,  para: 'terreiroAurora',   destino: { tx: 14, ty: 21, dir: 'cima' } },
    { tx: 40, ty: 8,  para: 'lojaSol',          destino: { tx: 7,  ty: 8,  dir: 'cima' } },
    { tx: 47, ty: 8,  para: 'benzimentoSol',    destino: { tx: 7,  ty: 8,  dir: 'cima' } },
    { tx: 40, ty: 26, para: 'casaOraculo',      destino: { tx: 7,  ty: 8,  dir: 'cima' } },
  ],

  cenario: 'cidade',
  passosPorEncontro: 12,
  encontros: [
    { especie: 'luzeiro', min: 57, max: 59, peso: 55 },
    { especie: 'lamparina', min: 57, max: 59, peso: 30 },
    { especie: 'faisquinha', min: 57, max: 58, peso: 15 },
  ],
};
