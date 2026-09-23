/* Rua do Breu — a entrada do Bairro da Cuca, pelo vão que o Dom Escavar
   abre na borda oeste da Cava Funda. Uma rua comprida de leste a oeste, de
   noite, com três moradores que não gostam de visita e o primeiro dos três
   retratos antigos. Um véu de sombra no canto nordeste só se desfaz com o
   Dom Visão Noturna.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore   R  muro   .  grama   =  rua   ,  mato   c  chão batido     */
import type { DefMapa } from '../../world/tilemap.ts';

export const ruaDoBreu: DefMapa = {
  id: 'ruaDoBreu',
  nome: 'RUA DO BREU',

  chao: [
    '############################################################', // 0
    '#...................................................R......#', // 1
    '#...................................................R......#', // 2
    '#..,,,,,,,,,,.......................,,,,,,,,,.......RRR.RRR#', // 3
    '#..,,,,,,,,,,.......,,,,,,,,,.......,,,,,,,,,..............#', // 4
    '#..,,,,,,,,,,.......,,,,,,,,,.......,,,,,,,,,.....,,,,,,,..#', // 5
    '#..,,,,,,,,,,.......,,,,,,,,,.......,,,,,,,,,.....,,,,,,,..#', // 6
    '#..,,,,,,,,,,.......,,,,,,,,,.......,,,,,,,,,.....,,,,,,,..#', // 7
    '#..,,,,,,,,,,.......,,,,,,,,,.......,,,,,,,,,.....,,,,,,,..#', // 8
    '#...................,,,,,,,,,.....................,,,,,,,..#', // 9
    '#.................................................,,,,,,,..#', // 10
    '#..........................................................#', // 11
    '#.ccccccc..................................................#', // 12
    '#.ccccccc.....................ccccc........................#', // 13
    '#.ccccccc.....................ccccc........................#', // 14
    '#.ccccccc.....................ccccc........................#', // 15
    '#.ccccccc.....................ccccc........................#', // 16
    '#..........................................................#', // 17
    '#..........................................................#', // 18
    '#..........................................................#', // 19
    '.==========================================================.', // 20
    '.==========================================================.', // 21
    '#..........................................................#', // 22
    '#..........................................................#', // 23
    '#.............................................ccccccccc....#', // 24
    '#.............................................ccccccccc....#', // 25
    '#.............................................ccccccccc....#', // 26
    '#.............................................ccccccccc....#', // 27
    '#..........................................................#', // 28
    '#.......................................,,,,,,,,,..........#', // 29
    '#.....,,,,,,,,,.........................,,,,,,,,,..........#', // 30
    '#.....,,,,,,,,,.........,,,,,,,,,.......,,,,,,,,,..........#', // 31
    '#.....,,,,,,,,,.........,,,,,,,,,.......,,,,,,,,,..........#', // 32
    '#.....,,,,,,,,,.........,,,,,,,,,.......,,,,,,,,,..........#', // 33
    '#.....,,,,,,,,,.........,,,,,,,,,.......,,,,,,,,,..........#', // 34
    '#.....,,,,,,,,,.........,,,,,,,,,..........................#', // 35
    '#.......................,,,,,,,,,..........................#', // 36
    '#..........................................................#', // 37
    '#..........................................................#', // 38
    '############################################################', // 39
  ],

  objetos: [
    { tipo: 'placa', tx: 56, ty: 18,
      placa: 'RUA DO BREU. A oeste, o Bairro da Cuca. Ninguém anda aqui depois que escurece.' },
    { tipo: 'achado', tx: 57, ty: 37, solido: false, placa: 'RETRATO', se: 'achou_retrato_rua', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 57, ty: 37, solido: false, placa: 'RETRATO', seNao: 'achou_retrato_rua',
      falas: [{ liga: 'achou_retrato_rua', da: { item: 'retrato' }, linhas: [
        'Caído atrás de um banco, a moldura rachada: um RETRATO ANTIGO.',
        'A Velha do bairro procura três destes.'] }] },
    /* bolso do Dom Visão Noturna, no canto nordeste */
    { tipo: 'veu', tx: 55, ty: 3, larg: 1, seNao: 'dom_visao' },
    { tipo: 'achado', tx: 57, ty: 1, solido: false, placa: 'ESCONDERIJO', se: 'achou_esconderijo_rua', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 57, ty: 1, solido: false, placa: 'ESCONDERIJO', seNao: 'achou_esconderijo_rua',
      falas: [{ liga: 'achou_esconderijo_rua', da: { item: 'patua_mestre', n: 2 }, linhas: [
        'Atrás do véu, uma caixa de sapato: dois PATUÁ DE MESTRE.',
        'Ninguém enxergava esse canto antes do Dom Visão Noturna.'] }] },
  ],

  npcs: [
    {
      id: 'morador_rua1', nome: 'MORADOR', estilo: 'guarda',
      tx: 15, ty: 19, dir: 'baixo',
      treinador: {
        classe: 'MORADOR DO BREU', visao: 4, premio: 3000,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'lobinho', nivel: 56 }, { especie: 'corpoSeco', nivel: 56 }, { especie: 'relampo', nivel: 56 }],
        falaInicio: 'Andando na minha rua a essa hora? Vai ter que me mostrar por quê.',
        falaDerrota: 'Tá bom, tá bom. Segue, mas não faz barulho.',
      },
      falas: [
        { se: 'venceu_morador_rua1', linhas: ['O bairro fica a oeste. Não olha nos olhos da Cuca.'] },
        { batalha: true, linhas: ['Andando na minha rua a essa hora? Vai ter que me mostrar por quê.'] },
      ],
    },
    {
      id: 'morador_rua2', nome: 'MORADORA', estilo: 'guarda',
      tx: 35, ty: 22, dir: 'cima',
      treinador: {
        classe: 'MORADORA DO BREU', visao: 4, premio: 3100,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'lobisomem', nivel: 56 }, { especie: 'matinta', nivel: 57 }],
        falaInicio: 'Minha janela dá pra rua, e eu vi você chegando. Vamos ver o que traz.',
        falaDerrota: 'Traz coisa boa. Pode passar.',
      },
      falas: [
        { se: 'venceu_morador_rua2', linhas: ['Se ouvir uivo, não é cachorro.'] },
        { batalha: true, linhas: ['Minha janela dá pra rua, e eu vi você chegando. Vamos ver o que traz.'] },
      ],
    },
    {
      id: 'morador_rua3', nome: 'MORADOR', estilo: 'guarda',
      tx: 48, ty: 19, dir: 'baixo',
      treinador: {
        classe: 'MORADOR DO BREU', visao: 4, premio: 3200,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'corpoSeco', nivel: 57 }, { especie: 'lobisomem', nivel: 57 }, { especie: 'minhocao', nivel: 57 }],
        falaInicio: 'Última casa antes do bairro. Ninguém passa sem conversar comigo.',
        falaDerrota: 'Conversou. Pode ir.',
      },
      falas: [
        { se: 'venceu_morador_rua3', linhas: ['Lá no bairro, a Cartomante lê a sua sorte. Se você acertar as cartas dela.'] },
        { batalha: true, linhas: ['Última casa antes do bairro. Ninguém passa sem conversar comigo.'] },
      ],
    },
  ],

  inicio: { tx: 58, ty: 20, dir: 'esq' },

  saidas: [
    { tx: 59, ty: 20, para: 'cavaFunda',    destino: { tx: 1,  ty: 20, dir: 'dir' } },
    { tx: 59, ty: 21, para: 'cavaFunda',    destino: { tx: 1,  ty: 21, dir: 'dir' } },
    { tx: 0,  ty: 20, para: 'bairroDaCuca', destino: { tx: 54, ty: 20, dir: 'esq' } },
    { tx: 0,  ty: 21, para: 'bairroDaCuca', destino: { tx: 54, ty: 21, dir: 'esq' } },
  ],

  cenario: 'cidade',
  passosPorEncontro: 10,
  encontros: [
    { especie: 'lobinho', min: 55, max: 57, peso: 45 },
    { especie: 'corpoSeco', min: 55, max: 57, peso: 25 },
    { especie: 'matinta', min: 55, max: 57, peso: 20 },
    { especie: 'lobisomem', min: 56, max: 57, peso: 10 },
  ],
};
