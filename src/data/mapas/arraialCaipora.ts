/* Arraial da Caipora — o eixo das Minas: estrada para a Boca da Mina (sul),
   para as Galerias (leste) e para a Cava Funda (oeste, trancada pelo Zeca).
   Loja, benzimento (o abrigo da região), a casa do Velho Garimpeiro (as
   CHARADAS, o segundo tipo de tarefa novo), a Dona Luzia — mãe do Tuco, que
   sumiu nas Galerias (a ESCOLTA, o terceiro) — e o Ourives, que compra
   diamante enterrado. O pátio do Terreiro da Pedra é fechado nas laterais
   (colunas 7 e 15, linhas 9-12), como em toda região anterior.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore   .  grama   =  estrada   ,  mato alto   o  pedra   R  rocha */
import type { DefMapa } from '../../world/tilemap.ts';

export const arraialCaipora: DefMapa = {
  id: 'arraialCaipora',
  nome: 'ARRAIAL DA CAIPORA',

  chao: [
    '########################################################', // 0
    '#......................................................#', // 1
    '#......................................................#', // 2
    '#..o...................................................#', // 3
    '#...................,,,,,,.............................#', // 4
    '#...................,,,,,,.............................#', // 5
    '#...................,,,,,,.............................#', // 6
    '#...................,,,,,,.............................#', // 7
    '#...................,,,,,,.............................#', // 8
    '#......#.......#....,,,,,,..............=......=.......#', // 9
    '#......#.......#........................=......=.......#', // 10
    '#......#.......#........................=......=.......#', // 11
    '#......#.......#........................=..,,,,=..,,,,.#', // 12
    '#..........=............................=..,,,,=..,,,,.#', // 13
    '#.,,,,.....=............................=..,,,,=..,,,,.#', // 14
    '#.,,,,.....=............................=..,,,,=..,,,,.#', // 15
    '#.,,,,.....=............................=..,,,,=..,,,,.#', // 16
    '#.,,,,.....=......................o.....=......=.......#', // 17
    '#..........=............................=......=.......#', // 18
    '#..........=............................=......=.......#', // 19
    '.======================================================.', // 20
    '.======================================================.', // 21
    '#..........................==..........................#', // 22
    '#..........................==..........................#', // 23
    '#..........................==..........................#', // 24
    '#..........................==...............,,,,,,,,,,.#', // 25
    '#.....................o....==...............,,,,,,,,,,.#', // 26
    '#..........................==...............,,,,,,,,,,.#', // 27
    '#..........................==...............,,,,,,,,,,.#', // 28
    '#..........................==...............,,,,,,,,,,.#', // 29
    '#.,,,,,,,,,................==...............,,,,,,,,,,.#', // 30
    '#.,,,,,,,,,................==..,,,,,,,,,,...,,,,,,,,,,.#', // 31
    '#.,,,,,,,,,................==..,,,,,,,,,,..............#', // 32
    '#.,,,,,,,,,................==..,,,,,,,,,,..............#', // 33
    '#.,,,,,,,,,................==..,,,,,,,,,,..............#', // 34
    '#.,,,,,,,,,................==..,,,,,,,,,,.......RRR.RRR#', // 35
    '#.,,,,,,,,,................==..,,,,,,,,,,.....o.R......#', // 36
    '#.,,,,,,,,,................==..,,,,,,,,,,.......R......#', // 37
    '#..........................==..,,,,,,,,,,.......R......#', // 38
    '#.......o..................==...................R......#', // 39
    '#..........................==...................R......#', // 40
    '###########################..###########################', // 41
  ],

  objetos: [
    { tipo: 'terreiro',    tx: 8,  ty: 4,  larg: 7, alt: 5 },              // porta (11,8)
    { tipo: 'portao',      tx: 8,  ty: 12, larg: 7, terreiro: 'terra' },
    { tipo: 'loja',        tx: 38, ty: 5,  larg: 5, alt: 4 },              // porta (40,8)
    { tipo: 'benzimento',  tx: 45, ty: 5,  larg: 5, alt: 4 },              // porta (47,8)
    { tipo: 'casa',        tx: 38, ty: 23, larg: 5, alt: 4 },              // porta (40,26), o Velho Garimpeiro
    { tipo: 'casa',        tx: 15, ty: 23, larg: 5, alt: 4, trancada: true }, // casa da Dona Luzia
    { tipo: 'placa', tx: 16, ty: 12,
      placa: 'TERREIRO DA PEDRA, do Ubirajara. A guia abre com cinco contas acesas.' },
    { tipo: 'placa', tx: 25, ty: 22,
      placa: 'ARRAIAL DA CAIPORA. Sul: Boca da Mina. Leste: Galerias. Oeste: Cava Funda.' },
    { tipo: 'placa', tx: 43, ty: 26,
      placa: 'CASA DO VELHO GARIMPEIRO. Quem entra, responde.' },
    /* a tranca do Zeca, pela sexta vez: a estrada da Cava Funda */
    { tipo: 'barreira', tx: 0, ty: 20, larg: 1, seNao: 'venceu_zeca6' },
    { tipo: 'barreira', tx: 0, ty: 21, larg: 1, seNao: 'venceu_zeca6' },

    /* bolso do Dom Escavar no canto sudeste */
    { tipo: 'monteTerra', tx: 51, ty: 35, larg: 1, seNao: 'dom_escavar' },
    { tipo: 'achado', tx: 53, ty: 39, solido: false, placa: 'ESCONDERIJO',
      se: 'achou_esconderijo_arraial', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 53, ty: 39, solido: false, placa: 'ESCONDERIJO',
      seNao: 'achou_esconderijo_arraial',
      falas: [{ liga: 'achou_esconderijo_arraial', da: { item: 'agua_benta' }, linhas: [
        'Atrás da terra desmoronada, uma cabaça lacrada: ÁGUA BENTA.',
        'Ninguém alcançava esse canto antes do Dom Escavar.'] }] },
  ],

  npcs: [
    {
      id: 'zeca6', nome: 'ZECA', estilo: 'zeca',
      tx: 1, ty: 19, dir: 'baixo',
      treinador: {
        classe: 'MOLEQUE DA VILA', visao: 4, premio: 3000,
        time: [{ especie: 'minhocao', nivel: 54 }, { especie: 'relampo', nivel: 55 },
               { especie: 'saci', nivel: 55 }, { especie: 'cabraCabriola', nivel: 55 },
               { especie: 'curupira', nivel: 56 }],
        falaInicio: 'Seis, {crianca}. Seis vezes. Dessa vez eu cavei um time inteiro só pra você.',
        falaDerrota: 'Seis a zero... Tá. A Cava Funda é sua. Eu vou... treinar mais um pouco.',
        esperta: true, itens: { garrafada_forte: 2, erva_doce: 1 },
      },
      falas: [
        { se: 'venceu_zeca6', linhas: [
          'Lá no fundo da Cava tem um bicho de um olho só. Nem eu desço lá.'] },
        { batalha: true, linhas: [
          'A estrada da Cava Funda passa por mim. E eu não saio da frente de graça.'] },
      ],
    },
    {
      id: 'dona_luzia', nome: 'DONA LUZIA', estilo: 'firmina',
      tx: 18, ty: 28, dir: 'baixo',
      falas: [
        { se: 'menino_salvo', linhas: [
          'O Tuco não sai mais do meu lado. Deus te pague, {crianca}. A mina não leva mais ninguém meu.'] },
        { se: 'escoltando_menino', liga: ['conta_menino', 'menino_salvo'], desliga: 'escoltando_menino',
          paga: 1200, linhas: [
          'TUCO! Meu filho! Onde você se meteu, menino?!',
          'Você trouxe ele das Galerias... pelos trilhos e tudo. Nem sei como agradecer.',
          'Toma, é pouco. E a sua guia tem mais uma conta acesa, que eu mesma acendi.'] },
        { linhas: [
          'Meu Tuco entrou nas Galerias atrás de um vagonete e não voltou.',
          'Os trilhos lá dentro só vão pra um lado, e as alavancas mudam tudo. Traz ele pra mim?',
          'Se você cair no caminho, ele se assusta e corre de volta. Cuidado.'] },
      ],
    },
    {
      id: 'tuco_em_casa', nome: 'TUCO', estilo: 'crianca',
      tx: 19, ty: 28, dir: 'baixo', se: 'menino_salvo',
      falas: [
        { linhas: [
          'O vagonete de volta é o mais legal! Desce tudo por baixo e sobe pela parede!'] },
      ],
    },
    {
      id: 'ourives', nome: 'OURIVES', estilo: 'aldeao',
      tx: 32, ty: 24, dir: 'baixo',
      falas: [
        { se: 'servico_diamantes', linhas: [
          'Os três diamantes já estão lapidados. E dizem que a Caipora anda rondando a Cava Funda.'] },
        { se: 'item:diamante>=3', pede: { item: 'diamante', n: 3 }, liga: 'servico_diamantes',
          paga: 4000, da: { item: 'patua_mestre', n: 3 }, linhas: [
          'TRÊS diamantes brutos! Isso é trabalho de uma vida inteira de garimpo.',
          'Toma o que eu tenho de melhor, e o dinheiro. Negócio justo.',
          'E escuta: quem acha três diamantes, a Caipora vem conhecer. Olha no fundo da Cava.'] },
        { linhas: [
          'Três diamantes estão enterrados nas Minas: um no vale da Boca, um nas Galerias, um na Cava Funda.',
          'Com a forquilha você acha. Me traz os três que eu pago bem.'] },
      ],
    },
  ],

  inicio: { tx: 27, ty: 40, dir: 'cima' },

  saidas: [
    { tx: 27, ty: 41, para: 'bocaDaMina',        destino: { tx: 30, ty: 1,  dir: 'baixo' } },
    { tx: 28, ty: 41, para: 'bocaDaMina',        destino: { tx: 31, ty: 1,  dir: 'baixo' } },
    { tx: 55, ty: 20, para: 'galeriasDaMina',    destino: { tx: 1,  ty: 7,  dir: 'dir' } },
    { tx: 55, ty: 21, para: 'galeriasDaMina',    destino: { tx: 1,  ty: 8,  dir: 'dir' } },
    { tx: 0,  ty: 20, para: 'cavaFunda',         destino: { tx: 56, ty: 20, dir: 'esq' } },
    { tx: 0,  ty: 21, para: 'cavaFunda',         destino: { tx: 56, ty: 21, dir: 'esq' } },
    { tx: 11, ty: 8,  para: 'terreiroPedra',     destino: { tx: 14, ty: 21, dir: 'cima' } },
    { tx: 40, ty: 8,  para: 'lojaCaipora',       destino: { tx: 7,  ty: 8,  dir: 'cima' } },
    { tx: 47, ty: 8,  para: 'benzimentoCaipora', destino: { tx: 7,  ty: 8,  dir: 'cima' } },
    { tx: 40, ty: 26, para: 'casaGarimpeiro',    destino: { tx: 7,  ty: 8,  dir: 'cima' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 12,
  encontros: [
    { especie: 'minhoquinha', min: 52, max: 54, peso: 50 },
    { especie: 'cabraCabriola', min: 52, max: 54, peso: 30 },
    { especie: 'faisquinha', min: 52, max: 54, peso: 20 },
  ],
};
