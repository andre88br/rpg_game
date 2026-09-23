/* Campina dos Raios — a entrada da Aldeia Tupã, pelo vão que se abre na
   parede LESTE do Topo do Redemoinho quando o Pererê cai.

   Primeira região que cresce para os lados e não só para baixo: 64 colunas,
   quase o dobro das 34 que toda região anterior usava. Quatro cercas de
   pau-a-pique correm de norte a sul e partem a campina em cinco trechos;
   cada cerca tem UM vão, e os vãos se alternam entre o alto e o baixo do
   mapa — atravessar é andar em zigue-zague de ponta a ponta, oeste → leste.
   Em cada vão, um tocador de tambor (o último é o Chefe dos Tambores) e uma
   `barreira` que só some com a vitória dele, a mesma receita dos catadores
   do Campo Aberto. É a primeira conta da guia de raio: `conta_tambores`.

   No trecho do meio, um bolso fechado por uma pedra rachada guarda um
   esconderijo que só o Dom Faísca abre — nunca no caminho obrigatório.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore/cerca (parede)   .  grama (chão)
     ,  mato alto (encontro)    o  pedra (obstáculo solto)
     c  chão chamuscado pelo raio (só paisagem)   R  rocha            */
import type { DefMapa } from '../../world/tilemap.ts';

export const campinaDosRaios: DefMapa = {
  id: 'campinaDosRaios',
  nome: 'CAMPINA DOS RAIOS',

  chao: [
    '################################################################', // 0
    '#............#.............#.............#.............#.......#', // 1
    '#............#.............#.............#.............#.......#', // 2
    '#............#.o...........#...o.........#..........o..#.......#', // 3
    '#...................cc.....#.............#.............#.,,,,,.#', // 4
    '#..........................#...........................#.,,,,,.#', // 5
    '#............#.............#...........................#.,,,,,.#', // 6
    '#............#.............#.............#.............#.,,,,,.#', // 7
    '#...,,,,,,,..#.............#.....cc......#.............#.,,,,,.#', // 8
    '#...,,,,,,,..#..,,,,,,,,...#.....c.......#...,,,,,,,,..#.,,,,,.#', // 9
    '#...,,,,,,,..#..,,,,,,,,...#.............#...,,,,,,,,..#.......#', // 10
    '#...,,,,,,,..#..,,,,,,,,...#..........o..#...,,,,,,,,..#.......#', // 11
    '#............#..,,,,,,,,...#.............#...,,,,,,,,..#.......#', // 12
    '#............#..,,,,,,,,...#.............#.............#...cc..#', // 13
    '#.....cc.....#.............#..,,,,,,,,...#.............#.......#', // 14
    '#.....c......#.............#..,,,,,,,,...#.............#.......#', // 15
    '.............#.............#..,,,,,,,,...#......................', // 16
    '.............#.....o.......#..,,,,,,,,...#.....o................', // 17
    '#............#.............#..,,,,,,,,...#.............#.......#', // 18
    '#............#.............#..,,,,,,,,...#.............#.......#', // 19
    '#..,,,,,,,...#...,,,,,,,,..#.............#.............#..o....#', // 20
    '#..,,,,,,,...#...,,,,,,,,..#.............#..,,,,,,,,...#....o..#', // 21
    '#..,,,,,,,...#...,,,,,,,,..#.............#..,,,,,,,,...#.......#', // 22
    '#..,,,,,,,...#...,,,,,,,,..#.............#..,,,,,,,,...#.......#', // 23
    '#..,,,,,,,...#.............#.,,,,,,......#..,,,,,,,,...#.,,,,,.#', // 24
    '#............#.............#.,,,,,,......#..,,,,,,,,...#.,,,,,.#', // 25
    '#............#.............#.,,,,,,......#..,,,,,,,,...#.,,,,,.#', // 26
    '#............#...............,,,,,,......#.............#.,,,,,.#', // 27
    '#..o.........#.....................RRR.RR#.............#.,,,,,.#', // 28
    '#............#.............#.......R.....#......c......#.......#', // 29
    '#.........o..#..........o..#.......R.....#......cc.....#.......#', // 30
    '#............#.............#.......R.....#.............#.......#', // 31
    '#............#.............#.......R.....#.............#.......#', // 32
    '################################################################', // 33
  ],

  objetos: [
    /* o mapa desta região, escondido num canto — com ele, o Mapa do Mundo
       mostra a planta de cada lugar da região (data/mundo.ts) */
    { tipo: 'achado', tx: 62, ty: 1, solido: false, placa: 'MAPA', se: 'achou_mapa_raio', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 62, ty: 1, solido: false, placa: 'MAPA', seNao: 'achou_mapa_raio',
      falas: [{ liga: 'achou_mapa_raio', da: { item: 'mapa_raio' }, linhas: [
        'Dentro de uma cabaça pendurada no canto da cerca: o MAPA DA ALDEIA TUPÃ.',
        'Agora o Mapa do Mundo mostra a planta de cada lugar desta região.'] }] },
    { tipo: 'placa', tx: 3, ty: 14,
      placa: 'CAMPINA DOS RAIOS. A leste, a Aldeia Tupã. Quatro tambores tocam no caminho.' },
    /* as quatro trancas, uma por cerca: cada uma some quando o tambor dela cai */
    { tipo: 'barreira', tx: 13, ty: 4,  larg: 1, seNao: 'venceu_tambor1' },
    { tipo: 'barreira', tx: 13, ty: 5,  larg: 1, seNao: 'venceu_tambor1' },
    { tipo: 'barreira', tx: 27, ty: 27, larg: 1, seNao: 'venceu_tambor2' },
    { tipo: 'barreira', tx: 27, ty: 28, larg: 1, seNao: 'venceu_tambor2' },
    { tipo: 'barreira', tx: 41, ty: 5,  larg: 1, seNao: 'venceu_tambor3' },
    { tipo: 'barreira', tx: 41, ty: 6,  larg: 1, seNao: 'venceu_tambor3' },
    { tipo: 'barreira', tx: 55, ty: 16, larg: 1, seNao: 'venceu_chefe_tambores' },
    { tipo: 'barreira', tx: 55, ty: 17, larg: 1, seNao: 'venceu_chefe_tambores' },
    { tipo: 'placa', tx: 58, ty: 15,
      placa: 'Siga o caminho a leste. A Aldeia Tupã fica logo depois do último tambor.' },

    /* duas das cinco pedras-de-raio da região, cada uma num canto oposto */
    { tipo: 'achado', tx: 2, ty: 2, solido: false, placa: 'PEDRA-DE-RAIO',
      se: 'achou_pedra_raio_1', vazio: true,
      falas: [{ linhas: ['Só ficou a marca queimada no capim.'] }] },
    { tipo: 'achado', tx: 2, ty: 2, solido: false, placa: 'PEDRA-DE-RAIO',
      seNao: 'achou_pedra_raio_1',
      falas: [{ liga: 'achou_pedra_raio_1', da: { item: 'pedra_raio' }, linhas: [
        'No meio de um círculo de capim queimado, ainda morna: uma PEDRA-DE-RAIO.',
        'O Pajé da aldeia junta essas pedras.'] }] },
    { tipo: 'achado', tx: 61, ty: 32, solido: false, placa: 'PEDRA-DE-RAIO',
      se: 'achou_pedra_raio_2', vazio: true,
      falas: [{ linhas: ['Só ficou a marca queimada no capim.'] }] },
    { tipo: 'achado', tx: 61, ty: 32, solido: false, placa: 'PEDRA-DE-RAIO',
      seNao: 'achou_pedra_raio_2',
      falas: [{ liga: 'achou_pedra_raio_2', da: { item: 'pedra_raio' }, linhas: [
        'Cravada no chão até a metade, lisa como vidro: outra PEDRA-DE-RAIO.'] }] },

    /* bolso do Dom Faísca: a pedra rachada fecha o único vão */
    { tipo: 'pedraRachada', tx: 38, ty: 28, larg: 1, seNao: 'dom_faisca' },
    { tipo: 'achado', tx: 39, ty: 31, solido: false, placa: 'ESCONDERIJO',
      se: 'achou_esconderijo_campina', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 39, ty: 31, solido: false, placa: 'ESCONDERIJO',
      seNao: 'achou_esconderijo_campina',
      falas: [{ liga: 'achou_esconderijo_campina', da: { item: 'patua_mestre' }, linhas: [
        'Atrás da pedra partida, um cesto de palha esquecido: um PATUÁ DE MESTRE.',
        'Ninguém alcançava esse canto antes do Dom Faísca.'] }] },
  ],

  npcs: [
    {
      id: 'tambor1', nome: 'TOCADOR DE TAMBOR', estilo: 'aldeao',
      tx: 12, ty: 4, dir: 'esq',
      treinador: {
        classe: 'TOCADOR DE TAMBOR', visao: 4, premio: 1400, liga: 'conta_tambores_1',
        esperta: true, itens: { garrafada: 1 },
        time: [{ especie: 'faisquinha', nivel: 44 }, { especie: 'tatuTrovao', nivel: 45 }],
        falaInicio: 'Aqui o trovão é tambor, e o tambor é meu. Vamos ver se você acompanha o ritmo.',
        falaDerrota: 'Perdi o compasso. Segue — mas tem mais três tambores até a aldeia.',
      },
      falas: [
        { se: 'venceu_tambor1', linhas: [
          'O próximo tambor fica lá embaixo, no vão da outra cerca.'] },
        { batalha: true, linhas: [
          'Quem chega do Topo prova o trovão primeiro. É o costume.'] },
      ],
    },
    {
      id: 'tambor2', nome: 'TOCADORA DE TAMBOR', estilo: 'aldeao',
      tx: 26, ty: 27, dir: 'cima',
      treinador: {
        classe: 'TOCADORA DE TAMBOR', visao: 4, premio: 1600, liga: 'conta_tambores_2',
        esperta: true, itens: { garrafada: 1 },
        time: [{ especie: 'relampo', nivel: 45 }, { especie: 'faisquinha', nivel: 45 },
               { especie: 'cabraCabriola', nivel: 46 }],
        falaInicio: 'Desceu a campina inteira atrás de mim? Então escuta o tambor de perto.',
        falaDerrota: 'Batida boa a sua. O terceiro fica lá no alto de novo — a campina é assim.',
      },
      falas: [
        { se: 'venceu_tambor2', linhas: [
          'Sobe tudo de novo até o vão do norte. É longe, mas é o único jeito.'] },
        { batalha: true, linhas: [
          'Dois tambores na campina, e o segundo sou eu.'] },
      ],
    },
    {
      id: 'tambor3', nome: 'TOCADOR DE TAMBOR', estilo: 'aldeao',
      tx: 40, ty: 5, dir: 'baixo',
      treinador: {
        classe: 'TOCADOR DE TAMBOR', visao: 5, premio: 1800, liga: 'conta_tambores_3',
        esperta: true, itens: { garrafada: 1, erva_doce: 1 },
        time: [{ especie: 'tatuTrovao', nivel: 46 }, { especie: 'matinta', nivel: 46 },
               { especie: 'relampo', nivel: 47 }],
        falaInicio: 'Três tambores, uma tempestade só. Aguenta o estrondo?',
        falaDerrota: 'Aguentou. O Chefe dos Tambores espera no último vão, bem no meio da cerca.',
      },
      falas: [
        { se: 'venceu_tambor3', linhas: [
          'O chefe toca o tambor grande. Esse você sente no peito.'] },
        { batalha: true, linhas: [
          'Dois tambores já calaram pra você. Vamos ver o terceiro.'] },
      ],
    },
    {
      id: 'chefe_tambores', nome: 'CHEFE DOS TAMBORES', estilo: 'guarda',
      tx: 54, ty: 16, dir: 'esq',
      treinador: {
        classe: 'CHEFE DOS TAMBORES', visao: 5, premio: 2600, liga: 'conta_tambores',
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'relampo', nivel: 47 }, { especie: 'tatuTrovao', nivel: 47 },
               { especie: 'saci', nivel: 48 }, { especie: 'relampo', nivel: 48 }],
        falaInicio: 'Três tambores calaram, e o meu é o maior. Ninguém entra na aldeia sem passar por ele.',
        falaDerrota: 'O tambor grande calou. A Aldeia Tupã é sua, {crianca} — o Guaraci vai querer te ver.',
      },
      falas: [
        { se: 'venceu_chefe_tambores', linhas: [
          'A aldeia fica logo a leste. Diga ao Guaraci que os tambores deixaram você passar.'] },
        { batalha: true, linhas: [
          'Quatro tambores na campina, e o último é o meu. Mostra o que você trouxe do vento.'] },
      ],
    },
  ],

  inicio: { tx: 1, ty: 16, dir: 'dir' },

  saidas: [
    { tx: 0,  ty: 16, para: 'topoDoRedemoinho', destino: { tx: 31, ty: 12, dir: 'esq' } },
    { tx: 0,  ty: 17, para: 'topoDoRedemoinho', destino: { tx: 31, ty: 13, dir: 'esq' } },
    { tx: 63, ty: 16, para: 'aldeiaTupa',       destino: { tx: 1,  ty: 20, dir: 'dir' } },
    { tx: 63, ty: 17, para: 'aldeiaTupa',       destino: { tx: 1,  ty: 21, dir: 'dir' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 10,
  encontros: [
    { especie: 'faisquinha', min: 43, max: 45, peso: 45 },
    { especie: 'tatuTrovao', min: 43, max: 46, peso: 25 },
    { especie: 'cabraCabriola', min: 43, max: 45, peso: 15 },
    { especie: 'matinta', min: 44, max: 46, peso: 15 },
  ],
};
