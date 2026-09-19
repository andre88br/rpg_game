/* Campo Aberto — a entrada do Campo do Saci, logo depois do vão que se abre
   na Cumeeira do Boitatá quando o Brás cai.
   Três catadores de vento em fila, cada um trancando o trecho seguinte, e o
   Chefe dos Catadores guardando a saída para a Ventania Funda — a mesma
   receita da Trilha da Brasa (barreira condicionada a `venceu_<id>`, sem
   como contornar porque cada trecho só tem UMA saída, e ela é a tranca do
   próximo). É a primeira conta da guia de vento: `conta_catadores`.
   Um bolso de corrente de vento no canto sudeste é só gosto: não tranca
   nada, é a primeira vez que o jogador pisa numa corrente ao ar livre.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore (parede)      .  grama (chão)
     ,  mato alto (encontro) o  pedra (obstáculo solto)
     V  corrente de vento (escorrega — ver world/tilemap.ts)             */
import type { DefMapa } from '../../world/tilemap.ts';

export const campoAberto: DefMapa = {
  id: 'campoAberto',
  nome: 'CAMPO ABERTO',

  chao: [
    '##############..##################',
    '#...,...............,,.........,.#',
    '#........,...,.,...,,............#',
    '#....,.....,............o........#',
    '#..,,........,...,...............#',
    '#........o........o,.............#',
    '#.....,.........,................#',
    '#..,,.,...............,...,......#',
    '#............,...................#',
    '########..########################',
    '#.........,.......,....,.,,.,....#',
    '#..............................,.#',
    '#....................,..,,.......#',
    '#......,...,...,....,...,.....,..#',
    '#...,...............,............#',
    '#...,......o........o.......o....#',
    '#...........,...,.............,..#',
    '######################..##########',
    '#......,........,................#',
    '#.o.,.,................,..,.,....#',
    '#.....,,...............,.........#',
    '#..,.....,.,..,.............o,...#',
    '#....,.o..,......................#',
    '#........,...,,,.................#',
    '#................,...............#',
    '########..########################',
    '#.o...,.,...,...,,...............#',
    '#.......................,VVVVV...#',
    '#..........,.........,..VVVVVV...#',
    '#......,......,....,....VVVVVV...#',
    '#..,..o.....,.........,.VVVVVV...#',
    '#.............,..........,.......#',
    '#.................,,...,..,......#',
    '##############..##################',
  ],

  objetos: [
    { tipo: 'placa', tx: 17, ty: 1,
      placa: 'CAMPO DO SACI. O Chefe dos Catadores não deixa ninguém passar sem provar o vento.' },
    /* as três trancas: cada uma some quando o catador dela cai */
    { tipo: 'barreira', tx: 8,  ty: 9,  larg: 2, seNao: 'venceu_catador1' },
    { tipo: 'barreira', tx: 22, ty: 17, larg: 2, seNao: 'venceu_catador2' },
    { tipo: 'barreira', tx: 8,  ty: 25, larg: 2, seNao: 'venceu_catador3' },
    { tipo: 'barreira', tx: 14, ty: 33, larg: 2, seNao: 'venceu_chefe_catadores' },
    { tipo: 'placa', tx: 25, ty: 26,
      placa: 'Sente? O capim aqui não para de se mexer. É a primeira corrente — tem mais adiante.' },

    /* cinco penas de vento soltas pelo campo — conta_catavento, no moinho */
    { tipo: 'achado', tx: 3, ty: 3, solido: false, placa: 'PENA DE VENTO',
      se: 'achou_pena_1', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 3, ty: 3, solido: false, placa: 'PENA DE VENTO',
      seNao: 'achou_pena_1',
      falas: [{ liga: 'achou_pena_1', da: { item: 'pena' }, linhas: [
        'Presa numa touceira, boiando sem cair: uma PENA DE VENTO.'] }] },
    { tipo: 'achado', tx: 25, ty: 2, solido: false, placa: 'PENA DE VENTO',
      se: 'achou_pena_2', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 25, ty: 2, solido: false, placa: 'PENA DE VENTO',
      seNao: 'achou_pena_2',
      falas: [{ liga: 'achou_pena_2', da: { item: 'pena' }, linhas: [
        'Rodando devagar sem nunca tocar o chão: outra PENA DE VENTO.'] }] },
    { tipo: 'achado', tx: 5, ty: 11, solido: false, placa: 'PENA DE VENTO',
      se: 'achou_pena_3', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 5, ty: 11, solido: false, placa: 'PENA DE VENTO',
      seNao: 'achou_pena_3',
      falas: [{ liga: 'achou_pena_3', da: { item: 'pena' }, linhas: [
        'Enroscada numa moita baixa: mais uma PENA DE VENTO.'] }] },
    { tipo: 'achado', tx: 30, ty: 14, solido: false, placa: 'PENA DE VENTO',
      se: 'achou_pena_4', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 30, ty: 14, solido: false, placa: 'PENA DE VENTO',
      seNao: 'achou_pena_4',
      falas: [{ liga: 'achou_pena_4', da: { item: 'pena' }, linhas: [
        'Quase invisível de tão leve: a quarta PENA DE VENTO.'] }] },
    { tipo: 'achado', tx: 15, ty: 20, solido: false, placa: 'PENA DE VENTO',
      se: 'achou_pena_5', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 15, ty: 20, solido: false, placa: 'PENA DE VENTO',
      seNao: 'achou_pena_5',
      falas: [{ liga: 'achou_pena_5', da: { item: 'pena' }, linhas: [
        'A quinta e última PENA DE VENTO, presa numa pedra baixa.'] }] },

    /* o segundo capim dourado, escondido no campo — serviço opcional */
    { tipo: 'achado', tx: 20, ty: 31, solido: false, placa: 'CAPIM DOURADO',
      se: 'achou_capim_campo', vazio: true,
      falas: [{ linhas: ['A touceira está murcha agora.'] }] },
    { tipo: 'achado', tx: 20, ty: 31, solido: false, placa: 'CAPIM DOURADO',
      seNao: 'achou_capim_campo',
      falas: [{ liga: 'achou_capim_campo', da: { item: 'capim_dourado' }, linhas: [
        'Crescendo numa touceira que o vento nunca deita: CAPIM DOURADO.',
        'O Capinzeiro da aldeia procura os três até hoje.'] }] },
  ],

  npcs: [
    {
      id: 'catador1', nome: 'CATADOR DE VENTO', estilo: 'aldeao',
      tx: 8, ty: 8, dir: 'cima',
      treinador: {
        classe: 'CATADOR DE VENTO', visao: 4, premio: 1000, liga: 'conta_catadores_1',
        esperta: true,
        time: [{ especie: 'cabritinha', nivel: 37 }, { especie: 'sacizinho', nivel: 38 }],
        falaInicio: 'Ninguém atravessa o campo sem soltar a pipa primeiro. Solta a sua.',
        falaDerrota: 'Vento bom esse seu. Segue reto, mas não é o último.',
      },
      falas: [
        { se: 'venceu_catador1', linhas: [
          'Tem mais dois catadores lá na frente. E o chefe, no fim de tudo.'] },
        { batalha: true, linhas: [
          'Quem entra no Campo do Saci prova o próprio vento primeiro. Vem.'] },
      ],
    },
    {
      id: 'catador2', nome: 'CATADORA DE VENTO', estilo: 'aldeao',
      tx: 22, ty: 16, dir: 'cima',
      treinador: {
        classe: 'CATADORA DE VENTO', visao: 4, premio: 1100, liga: 'conta_catadores_2',
        esperta: true,
        time: [{ especie: 'saci', nivel: 39 }, { especie: 'sacizinho', nivel: 38 },
               { especie: 'cabritinha', nivel: 39 }],
        falaInicio: 'Passou do primeiro? Bom sinal. Vamos ver se o vento muda de lado agora.',
        falaDerrota: 'Mudou mesmo. Só falta o terceiro, e depois o chefe.',
      },
      falas: [
        { se: 'venceu_catador2', linhas: [
          'O terceiro fica logo depois da curva. Não facilita.'] },
        { batalha: true, linhas: [
          'Dois catadores nesse campo já provaram você. Falto eu.'] },
      ],
    },
    {
      id: 'catador3', nome: 'CATADOR DE VENTO', estilo: 'aldeao',
      tx: 8, ty: 24, dir: 'cima',
      treinador: {
        classe: 'CATADOR DE VENTO', visao: 5, premio: 1200, liga: 'conta_catadores_3',
        esperta: true,
        time: [{ especie: 'matinta', nivel: 40 }, { especie: 'saci', nivel: 39 },
               { especie: 'cabritinha', nivel: 40 }],
        falaInicio: 'Três catadores, um vento só. Vamos ver se o seu aguenta o meu.',
        falaDerrota: 'Aguentou. O chefe está logo ali — ele não solta pipa, ele voa.',
      },
      falas: [
        { se: 'venceu_catador3', linhas: [
          'O Chefe dos Catadores guarda a saída para a Ventania Funda. Boa sorte.'] },
        { batalha: true, linhas: [
          'Você já derrubou dois catadores. Vamos ver se derruba três.'] },
      ],
    },
    {
      id: 'chefe_catadores', nome: 'CHEFE DOS CATADORES', estilo: 'aldeao',
      tx: 14, ty: 31, dir: 'cima',
      treinador: {
        classe: 'CHEFE DOS CATADORES', visao: 5, premio: 2200, liga: 'conta_catadores',
        esperta: true, itens: { garrafada: 2 },
        time: [{ especie: 'saci', nivel: 41 }, { especie: 'matinta', nivel: 41 },
               { especie: 'cabritinha', nivel: 42 }, { especie: 'saci', nivel: 43 }],
        falaInicio: 'Três catadores vencidos e ainda de pé? Então prove com o chefe deles.',
        falaDerrota: 'Ninguém tinha chegado tão longe carregando vento tão forte. Pode seguir, {crianca}.',
      },
      falas: [
        { se: 'venceu_chefe_catadores', linhas: [
          'A Ventania Funda é sua agora. Boa sorte lá dentro — ela não avisa antes de soprar.'] },
        { batalha: true, linhas: [
          'Quatro catadores nesse campo, e eu sou o último antes da ventania. Mostra o que você tem.'] },
      ],
    },
  ],

  inicio: { tx: 14, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 14, ty: 0,  para: 'cumeeiraBoitata', destino: { tx: 8, ty: 34, dir: 'cima' } },
    { tx: 15, ty: 0,  para: 'cumeeiraBoitata', destino: { tx: 9, ty: 34, dir: 'cima' } },
    { tx: 14, ty: 33, para: 'ventaniaFunda',   destino: { tx: 9,  ty: 1, dir: 'baixo' } },
    { tx: 15, ty: 33, para: 'ventaniaFunda',   destino: { tx: 10, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 9,
  encontros: [
    { especie: 'sacizinho', min: 37, max: 40, peso: 45 },
    { especie: 'cabritinha', min: 37, max: 40, peso: 30 },
    { especie: 'saci', min: 38, max: 41, peso: 17 },
    { especie: 'matinta', min: 39, max: 42, peso: 8 },
  ],
};
