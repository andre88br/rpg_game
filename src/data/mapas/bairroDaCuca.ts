/* Bairro da Cuca — o eixo da sétima região: rua para leste (Rua do Breu),
   beco para o norte (Beco das Rondas) e, a oeste, o Casarão Assombrado,
   trancado pelo Zeca pela sétima vez. Loja, benzimento, a casa da
   Cartomante (as cartas: charadas, como as do Velho Garimpeiro) e a Velha
   do Bairro, que procura três retratos antigos. O pátio do Terreiro do
   Breu é fechado nas laterais (colunas 7 e 15, linhas 9-12).
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore   .  grama   =  rua   ,  mato   o  pedra   R  muro           */
import type { DefMapa } from '../../world/tilemap.ts';

export const bairroDaCuca: DefMapa = {
  id: 'bairroDaCuca',
  nome: 'BAIRRO DA CUCA',

  chao: [
    '###########################..###########################', // 0
    '#..........................==..........................#', // 1
    '#..........................==..........................#', // 2
    '#..o.......................==..........................#', // 3
    '#..........................==..,,,,,...................#', // 4
    '#..........................==..,,,,,...................#', // 5
    '#..........................==..,,,,,...................#', // 6
    '#..........................==..,,,,,...................#', // 7
    '#..........................==..,,,,,...................#', // 8
    '#......#.......#...........==..,,,,,....=......=.......#', // 9
    '#......#.......#...........==..,,,,,....=......=.......#', // 10
    '#......#.......#...........==..,,,,,....=......=.......#', // 11
    '#......#.......#...........==...........=......=.......#', // 12
    '#..........=...............==...........=......=.......#', // 13
    '#..........=...............==...........=......=.......#', // 14
    '#.,,,,,....=...............==...........=......=.......#', // 15
    '#.,,,,,....=...............==...........=......=.......#', // 16
    '#.,,,,,....=...............==.....o.....=......=.......#', // 17
    '#.,,,,,....=...............==...........=......=.......#', // 18
    '#..........=...............==...........=......=.......#', // 19
    '.======================================================.', // 20
    '.======================================================.', // 21
    '#......................................................#', // 22
    '#......................................................#', // 23
    '#......................................................#', // 24
    '#.....................o.....................,,,,,,,,,,.#', // 25
    '#...........................................,,,,,,,,,,.#', // 26
    '#...........................................,,,,,,,,,,.#', // 27
    '#...........................................,,,,,,,,,,.#', // 28
    '#...........................................,,,,,,,,,,.#', // 29
    '#.,,,,,,,,,.................................,,,,,,,,,,.#', // 30
    '#.,,,,,,,,,.........,,,,,,,,,,,,............,,,,,,,,,,.#', // 31
    '#.,,,,,,,,,.........,,,,,,,,,,,,.......................#', // 32
    '#.,,,,,,,,,.........,,,,,,,,,,,,.......................#', // 33
    '#.,,,,,,,,,.........,,,,,,,,,,,,.......................#', // 34
    '#.,,,,,,,,,.........,,,,,,,,,,,,................RRR.RRR#', // 35
    '#.,,,,,,,,,.........,,,,,,,,,,,,................R......#', // 36
    '#.,,,,,,,,,.........,,,,,,,,,,,,................R......#', // 37
    '#...............................................R......#', // 38
    '#.......o.......................................R......#', // 39
    '#...............................................R......#', // 40
    '########################################################', // 41
  ],

  objetos: [
    { tipo: 'terreiro',    tx: 8,  ty: 4,  larg: 7, alt: 5 },              // porta (11,8)
    { tipo: 'portao',      tx: 8,  ty: 12, larg: 7, terreiro: 'sombra' },
    { tipo: 'loja',        tx: 38, ty: 5,  larg: 5, alt: 4 },              // porta (40,8)
    { tipo: 'benzimento',  tx: 45, ty: 5,  larg: 5, alt: 4 },              // porta (47,8)
    { tipo: 'casa',        tx: 38, ty: 23, larg: 5, alt: 4 },              // porta (40,26), a Cartomante
    { tipo: 'casa',        tx: 15, ty: 23, larg: 5, alt: 4, trancada: true },
    { tipo: 'placa', tx: 16, ty: 12,
      placa: 'TERREIRO DO BREU, da Morgana. A guia abre com cinco contas acesas.' },
    { tipo: 'placa', tx: 25, ty: 22,
      placa: 'BAIRRO DA CUCA. Leste: Rua do Breu. Norte: Beco das Rondas. Oeste: o Casarão.' },
    { tipo: 'placa', tx: 26, ty: 2,
      placa: 'BECO DAS RONDAS. Os vigias olham para onde andam. Os nichos no muro escondem quem espera.' },
    { tipo: 'placa', tx: 43, ty: 26,
      placa: 'CARTOMANTE. Leio a sorte de quem acerta as minhas cartas.' },
    /* a tranca do Zeca, pela sétima vez: o caminho do Casarão */
    { tipo: 'barreira', tx: 0, ty: 20, larg: 1, seNao: 'venceu_zeca7' },
    { tipo: 'barreira', tx: 0, ty: 21, larg: 1, seNao: 'venceu_zeca7' },

    /* bolso do Dom Visão Noturna no canto sudeste */
    { tipo: 'veu', tx: 51, ty: 35, larg: 1, seNao: 'dom_visao' },
    { tipo: 'achado', tx: 53, ty: 39, solido: false, placa: 'ESCONDERIJO', se: 'achou_esconderijo_bairro', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 53, ty: 39, solido: false, placa: 'ESCONDERIJO', seNao: 'achou_esconderijo_bairro',
      falas: [{ liga: 'achou_esconderijo_bairro', da: { item: 'agua_benta', n: 2 }, linhas: [
        'Atrás do véu, duas cabaças lacradas: ÁGUA BENTA.',
        'Ninguém enxergava esse canto antes do Dom Visão Noturna.'] }] },
  ],

  npcs: [
    {
      id: 'zeca7', nome: 'ZECA', estilo: 'zeca',
      tx: 1, ty: 19, dir: 'baixo',
      treinador: {
        classe: 'MOLEQUE DA VILA', visao: 4, premio: 3400, liga: 'conta_zeca7',
        time: [{ especie: 'lobisomem', nivel: 57 }, { especie: 'minhocao', nivel: 57 },
               { especie: 'relampo', nivel: 58 }, { especie: 'saci', nivel: 58 },
               { especie: 'curupira', nivel: 59 }],
        falaInicio: 'Sete, {crianca}. Sete regiões. E dessa vez eu não durmo antes de ganhar.',
        falaDerrota: 'Sete a zero. Eu... vou dormir. Mas amanhã eu volto, pode ter certeza.',
        esperta: true, itens: { garrafada_forte: 2, erva_doce: 1, agua_benta: 1 },
      },
      falas: [
        { se: 'venceu_zeca7', linhas: [
          'O Casarão é logo ali. Tem uma Cuca no sótão, e eu não subo lá nem pago.'] },
        { batalha: true, linhas: [
          'O Casarão é a oeste, e o caminho passa por mim. Como sempre.'] },
      ],
    },
    {
      id: 'velha_retratos', nome: 'VELHA DO BAIRRO', estilo: 'firmina',
      tx: 18, ty: 28, dir: 'baixo',
      falas: [
        { se: 'servico_retratos', linhas: [
          'Os três retratos estão na parede de novo. Obrigada, {crianca}. E cuidado com o telhado do Casarão.'] },
        { se: 'item:retrato>=3', pede: { item: 'retrato', n: 3 }, liga: 'servico_retratos',
          paga: 4500, da: { item: 'patua_mestre', n: 3 }, linhas: [
          'Os TRÊS! Minha mãe, meu avô e... esse eu nunca soube quem era.',
          'Toma, é o que eu guardei a vida inteira. E escuta:',
          'quem junta os três retratos, a Pisadeira vem espiar. Olha no telhado do Casarão.'] },
        { linhas: [
          'Três retratos da minha família sumiram: um na Rua do Breu, um no Casarão, um no Beco.',
          'O do Beco eu sei que está num nicho do muro, lá no canto de cima. Me traz os três?'] },
      ],
    },
  ],

  inicio: { tx: 54, ty: 20, dir: 'esq' },

  saidas: [
    { tx: 55, ty: 20, para: 'ruaDoBreu',         destino: { tx: 1,  ty: 20, dir: 'dir' } },
    { tx: 55, ty: 21, para: 'ruaDoBreu',         destino: { tx: 1,  ty: 21, dir: 'dir' } },
    { tx: 27, ty: 0,  para: 'becoDasRondas',     destino: { tx: 29, ty: 37, dir: 'cima' } },
    { tx: 28, ty: 0,  para: 'becoDasRondas',     destino: { tx: 30, ty: 37, dir: 'cima' } },
    { tx: 0,  ty: 20, para: 'casaraoAssombrado', destino: { tx: 46, ty: 17, dir: 'esq' } },
    { tx: 0,  ty: 21, para: 'casaraoAssombrado', destino: { tx: 46, ty: 18, dir: 'esq' } },
    { tx: 11, ty: 8,  para: 'terreiroBreu',      destino: { tx: 14, ty: 21, dir: 'cima' } },
    { tx: 40, ty: 8,  para: 'lojaCuca',          destino: { tx: 7,  ty: 8,  dir: 'cima' } },
    { tx: 47, ty: 8,  para: 'benzimentoCuca',    destino: { tx: 7,  ty: 8,  dir: 'cima' } },
    { tx: 40, ty: 26, para: 'casaCartomante',    destino: { tx: 7,  ty: 8,  dir: 'cima' } },
  ],

  cenario: 'cidade',
  passosPorEncontro: 12,
  encontros: [
    { especie: 'lobinho', min: 55, max: 57, peso: 50 },
    { especie: 'corpoSeco', min: 55, max: 57, peso: 30 },
    { especie: 'matinta', min: 55, max: 57, peso: 20 },
  ],
};
