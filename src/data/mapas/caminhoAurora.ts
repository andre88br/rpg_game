/* Caminho da Aurora — a entrada da Cidade do Sol, pelo véu de sombra que o
   Dom Visão Noturna desfaz na saída sul do Bairro da Cuca. Uma estrada que
   desce e vira para leste, entre flores e mato, com três andarilhos, o
   primeiro cristal solar enterrado e o mapa da região num canto.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore   .  grama   =  estrada   ,  mato   f  flores   o  pedra      */
import type { DefMapa } from '../../world/tilemap.ts';

export const caminhoAurora: DefMapa = {
  id: 'caminhoAurora',
  nome: 'CAMINHO DA AURORA',

  chao: [
    '#############################..#############################', // 0
    '#............................==............................#', // 1
    '#............................==............................#', // 2
    '#..,,,,,,,,,,................==.........fffffffffffff......#', // 3
    '#..,,,,,,,,,,................==.........fffffffffffff......#', // 4
    '#..,,,,,,,,,,................==.........fffffffffffff......#', // 5
    '#..,,,,,,,,,,................==.........fffffffffffff......#', // 6
    '#..,,,,,,,,,,................==.........fffffffffffff......#', // 7
    '#..,,,,,,,,,,............o...==.........fffffffffffff......#', // 8
    '#..,,,,,,,,,,................==.........fffffffffffff......#', // 9
    '#............................==............................#', // 10
    '#............................==............................#', // 11
    '#.............,,,,,,,,,......==.......,,,,,,,,,............#', // 12
    '#.............,,,,,,,,,......==.......,,,,,,,,,............#', // 13
    '#.............,,,,,,,,,......==.......,,,,,,,,,............#', // 14
    '#.......o.....,,,,,,,,,......==.......,,,,,,,,,............#', // 15
    '#.............,,,,,,,,,......==.......,,,,,,,,,............#', // 16
    '#.............,,,,,,,,,......==.......,,,,,,,,,............#', // 17
    '#.............,,,,,,,,,......==............................#', // 18
    '#............................==............................#', // 19
    '#............................==============================.', // 20
    '#............................==============================.', // 21
    '#...........o.....................................o........#', // 22
    '#..........................................................#', // 23
    '#..........................................................#', // 24
    '#...................................o......................#', // 25
    '#....,,,,,,,,,,,,..........................................#', // 26
    '#....,,,,,,,,,,,,..........................................#', // 27
    '#....,,,,,,,,,,,,...........................fffffffffff....#', // 28
    '#....,,,,,,,,,,,,...........................fffffffffff....#', // 29
    '#....,,,,,,,,,,,,...,,,,,,,,,,,,,,,.........fffffffffff....#', // 30
    '#....,,,,,,,,,,,,...,,,,,,,,,,,,,,,.........fffffffffff....#', // 31
    '#....,,,,,,,,,,,,...,,,,,,,,,,,,,,,.........fffffffffff....#', // 32
    '#....,,,,,,,,,,,,...,,,,,,,,,,,,,,,.........fffffffffff....#', // 33
    '#....,,,,,,,,,,,,...,,,,,,,,,,,,,,,.........fffffffffff....#', // 34
    '#...................,,,,,,,,,,,,,,,.........fffffffffff....#', // 35
    '#...................,,,,,,,,,,,,,,,........................#', // 36
    '#..........................................................#', // 37
    '#..........................................................#', // 38
    '############################################################', // 39
  ],

  objetos: [
    { tipo: 'placa', tx: 31, ty: 2,
      placa: 'CAMINHO DA AURORA. A leste, a Cidade do Sol. Aqui já não escurece de verdade.' },
    { tipo: 'achado', tx: 57, ty: 37, solido: false, placa: 'MAPA', se: 'achou_mapa_luz', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 57, ty: 37, solido: false, placa: 'MAPA', seNao: 'achou_mapa_luz',
      falas: [{ liga: 'achou_mapa_luz', da: { item: 'mapa_luz' }, linhas: [
        'Dobrado dentro de um relicário esquecido no canto: o MAPA DA CIDADE DO SOL.',
        'Agora o Mapa do Mundo mostra a planta de cada lugar desta região.'] }] },
    { tipo: 'enterrado', tx: 10, ty: 30, placa: 'BURACO', se: 'cavou_cristal_caminho', vazio: true,
      falas: [{ linhas: ['Já se cavou aqui. Só sobrou o buraco.'] }] },
    { tipo: 'enterrado', tx: 10, ty: 30, placa: 'CAVANDO', seNao: 'cavou_cristal_caminho',
      falas: [{ se: 'item:forquilha', liga: 'cavou_cristal_caminho', da: { item: 'cristal_solar' }, linhas: [
        'A forquilha puxa com força. Você cava com as mãos...',
        'Brilhando mesmo debaixo da terra: um CRISTAL SOLAR.'] }] },
  ],

  npcs: [
    {
      id: 'andarilho1', nome: 'ANDARILHO', estilo: 'aldeao',
      tx: 30, ty: 10, dir: 'baixo',
      treinador: {
        classe: 'ANDARILHO DA AURORA', visao: 4, premio: 3600,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'luzeiro', nivel: 57 }, { especie: 'lobisomem', nivel: 58 }, { especie: 'relampo', nivel: 58 }],
        falaInicio: 'Saindo do escuro, é? Então prova que aguenta a claridade.',
        falaDerrota: 'Aguenta. A cidade fica a leste.',
      },
      falas: [
        { se: 'venceu_andarilho1', linhas: ['Na Cidade do Sol ninguém dorme antes de acender os lampiões.'] },
        { batalha: true, linhas: ['Saindo do escuro, é? Então prova que aguenta a claridade.'] },
      ],
    },
    {
      id: 'andarilho2', nome: 'ANDARILHA', estilo: 'aldeao',
      tx: 42, ty: 22, dir: 'esq',
      treinador: {
        classe: 'ANDARILHA DA AURORA', visao: 4, premio: 3700,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'lamparina', nivel: 58 }, { especie: 'estrelaDalva', nivel: 58 }],
        falaInicio: 'Anda nessa estrada sem chapéu? O sol daqui queima Encantado.',
        falaDerrota: 'Queima pouco. Pode seguir.',
      },
      falas: [
        { se: 'venceu_andarilho2', linhas: ['O Oráculo pergunta antes de responder. Pensa bem.'] },
        { batalha: true, linhas: ['Anda nessa estrada sem chapéu? O sol daqui queima Encantado.'] },
      ],
    },
    {
      id: 'andarilho3', nome: 'ANDARILHO', estilo: 'aldeao',
      tx: 53, ty: 19, dir: 'baixo',
      treinador: {
        classe: 'ANDARILHO DA AURORA', visao: 4, premio: 3800,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'estrelaDalva', nivel: 58 }, { especie: 'minhocao', nivel: 58 }, { especie: 'cuca', nivel: 59 }],
        falaInicio: 'Última curva antes da cidade. Última luta também.',
        falaDerrota: 'Tá liberado. Bem-vindo à Cidade do Sol.',
      },
      falas: [
        { se: 'venceu_andarilho3', linhas: ['A Joalheira da cidade procura cristais solares. A sua forquilha acha.'] },
        { batalha: true, linhas: ['Última curva antes da cidade. Última luta também.'] },
      ],
    },
  ],

  inicio: { tx: 29, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 29, ty: 0,  para: 'bairroDaCuca', destino: { tx: 27, ty: 40, dir: 'cima' } },
    { tx: 30, ty: 0,  para: 'bairroDaCuca', destino: { tx: 28, ty: 40, dir: 'cima' } },
    { tx: 59, ty: 20, para: 'cidadeDoSol',  destino: { tx: 1,  ty: 20, dir: 'dir' } },
    { tx: 59, ty: 21, para: 'cidadeDoSol',  destino: { tx: 1,  ty: 21, dir: 'dir' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 10,
  encontros: [
    { especie: 'luzeiro', min: 57, max: 59, peso: 45 },
    { especie: 'lamparina', min: 57, max: 59, peso: 25 },
    { especie: 'lobisomem', min: 57, max: 58, peso: 15 },
    { especie: 'uirapuru', min: 57, max: 58, peso: 5 },
    { especie: 'relampo', min: 57, max: 59, peso: 10 },
  ],
};
