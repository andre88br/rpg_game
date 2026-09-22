/* Morro do Trovão — o braço norte da Aldeia Tupã, depois da tranca do Zeca.
   Três cristas de rocha atravessam o morro de ponta a ponta, cada uma com
   UM vão, e os vãos se alternam entre a ponta oeste e a ponta leste: subir
   é cruzar o mapa inteiro de lado quatro vezes, 58 colunas de cada vez.
   Três vigias ficam ao pé dos vãos. No cume, do lado leste, o Relampo que
   mora no ninho do raio é a quinta e última conta da guia: `conta_trovao`.
   Um bolso fechado por pedra rachada, no trecho do meio, só abre com o Dom
   Faísca.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore (parede)   R  rocha (crista)   .  grama   ,  mato alto
     o  pedra   c  chão chamuscado pelo raio                             */
import type { DefMapa } from '../../world/tilemap.ts';

export const morroDoTrovao: DefMapa = {
  id: 'morroDoTrovao',
  nome: 'MORRO DO TROVÃO',

  chao: [
    '##########################################################', // 0
    '#........................................................#', // 1
    '#.................................,,,,,,,.....R..........#', // 2
    '#.........,,,,,,,...........o.....,,,,,,,.....R..........#', // 3
    '#.........,,,,,,,.................,,,,,,,................#', // 4
    '#.........,,,,,,,.................,,,,,,,................#', // 5
    '#.........,,,,,,,.....,,,,,,,,,...............R..........#', // 6
    '#.........,,,,,,,.....,,,,,,,,,...............R..........#', // 7
    '#.....................,,,,,,,,,.............ccc..........#', // 8
    '#......o............cc,,,,,,,,,..........................#', // 9
    '#.....................,,,,,,,,,..........................#', // 10
    '#...................................................o....#', // 11
    '#........................................................#', // 12
    '#R..RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#', // 13
    '#.............................o..................R.......#', // 14
    '#.......,,,,,,,.........................,,,,,,,..R.......#', // 15
    '#.......,,,,,,,...o.....,,,,,,,,,,......,,,,,,,..R.......#', // 16
    '#.......,,,,,,,.........,,,,,,,,,,......,,,,,,,..R.......#', // 17
    '#.......,,,,,,,.........,,,,,,,,,,..cc..,,,,,,,..R.......#', // 18
    '#.......,,,,,,,.........,,,,,,,,,,...............RRR.RRRR#', // 19
    '#.......................,,,,,,,,,,.......................#', // 20
    '#........................................................#', // 21
    '#RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR..RR#', // 22
    '#........................................................#', // 23
    '#.........,,,,,,,,,,......o.................,,,,,,,......#', // 24
    '#.........,,,,,,,,,,..........,,,,,,,,,.....,,,,,,,......#', // 25
    '#.........,,,,,,,,,,..........,,,,,,,,,.....,,,,,,,......#', // 26
    '#.........,,,,,,,,,,..........,,,,,,,,,.o...,,,,,,,......#', // 27
    '#.........,,,,,,,,,,..........,,,,,,,,,..................#', // 28
    '#.............................,,,,,,,,,.......cc.........#', // 29
    '#........................................................#', // 30
    '#R..RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#', // 31
    '#........................................................#', // 32
    '#.......,,,,,,,,........o.........................o......#', // 33
    '#.......,,,,,,,,..................,,,,,,,,,,,............#', // 34
    '#.......,,,,,,,,....cc............,,,,,,,,,,,............#', // 35
    '#....o..,,,,,,,,..................,,,,,,,,,,,............#', // 36
    '#.................................,,,,,,,,,,,............#', // 37
    '#........................................................#', // 38
    '###########################..#############################', // 39
  ],

  objetos: [
    { tipo: 'placa', tx: 25, ty: 37,
      placa: 'MORRO DO TROVÃO. A subida é de lado: cada crista só tem um vão.' },
    { tipo: 'placa', tx: 44, ty: 4,
      placa: 'O ninho do raio fica logo à frente. O chão em volta é todo queimado.' },

    /* a quinta pedra-de-raio, no canto sudeste do pé do morro */
    { tipo: 'achado', tx: 55, ty: 37, solido: false, placa: 'PEDRA-DE-RAIO',
      se: 'achou_pedra_raio_5', vazio: true,
      falas: [{ linhas: ['Só ficou a marca queimada na rocha.'] }] },
    { tipo: 'achado', tx: 55, ty: 37, solido: false, placa: 'PEDRA-DE-RAIO',
      seNao: 'achou_pedra_raio_5',
      falas: [{ liga: 'achou_pedra_raio_5', da: { item: 'pedra_raio' }, linhas: [
        'No pé da encosta, onde o raio sempre bate primeiro: uma PEDRA-DE-RAIO.'] }] },

    /* a terceira pena de trovão, no canto noroeste do cume */
    { tipo: 'achado', tx: 2, ty: 2, solido: false, placa: 'PENA DE TROVÃO',
      se: 'achou_pena_trovao_morro', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 2, ty: 2, solido: false, placa: 'PENA DE TROVÃO',
      seNao: 'achou_pena_trovao_morro',
      falas: [{ liga: 'achou_pena_trovao_morro', da: { item: 'pena_trovao' }, linhas: [
        'No ponto mais alto do cume, presa numa fresta: a terceira PENA DE TROVÃO.'] }] },

    /* bolso do Dom Faísca, no trecho do meio */
    { tipo: 'pedraRachada', tx: 52, ty: 19, larg: 1, seNao: 'dom_faisca' },
    { tipo: 'achado', tx: 55, ty: 15, solido: false, placa: 'ESCONDERIJO',
      se: 'achou_esconderijo_morro', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 55, ty: 15, solido: false, placa: 'ESCONDERIJO',
      seNao: 'achou_esconderijo_morro',
      falas: [{ liga: 'achou_esconderijo_morro', da: { item: 'patua_mestre', n: 2 }, linhas: [
        'Atrás da pedra partida, um oco seco na rocha: dois PATUÁ DE MESTRE.',
        'Ninguém alcançava esse canto antes do Dom Faísca.'] }] },
  ],

  npcs: [
    {
      id: 'vigia_trovao1', nome: 'VIGIA DO TROVÃO', estilo: 'guarda',
      tx: 4, ty: 32, dir: 'dir',
      treinador: {
        classe: 'VIGIA DO TROVÃO', visao: 5, premio: 2000,
        esperta: true, itens: { garrafada: 2 },
        time: [{ especie: 'tatuTrovao', nivel: 47 }, { especie: 'relampo', nivel: 47 },
               { especie: 'cabraCabriola', nivel: 48 }],
        falaInicio: 'Primeira crista. Daqui pra cima o morro não perdoa quem sobe sem time.',
        falaDerrota: 'Sobe. A segunda crista tem o vão lá do outro lado — é longe.',
      },
      falas: [
        { se: 'venceu_vigia_trovao1', linhas: [
          'Cada crista tem um vão só, sempre na ponta contrária da anterior.'] },
        { batalha: true, linhas: [
          'O vão é aqui do meu lado. Pra passar, passa por mim.'] },
      ],
    },
    {
      id: 'vigia_trovao2', nome: 'VIGIA DO TROVÃO', estilo: 'guarda',
      tx: 52, ty: 23, dir: 'esq',
      treinador: {
        classe: 'VIGIA DO TROVÃO', visao: 5, premio: 2200,
        esperta: true, itens: { garrafada: 1, erva_doce: 1 },
        time: [{ especie: 'relampo', nivel: 48 }, { especie: 'saci', nivel: 48 },
               { especie: 'tatuTrovao', nivel: 48 }, { especie: 'matinta', nivel: 48 }],
        falaInicio: 'Atravessou o morro inteiro de lado pra chegar aqui? Então tem fôlego pra mais.',
        falaDerrota: 'Tem fôlego mesmo. A terceira crista abre do lado oeste de novo.',
      },
      falas: [
        { se: 'venceu_vigia_trovao2', linhas: [
          'O cume fica depois da terceira crista. O Relampo de lá não é bicho de ninguém.'] },
        { batalha: true, linhas: [
          'Segunda crista, segundo vigia. Vem.'] },
      ],
    },
    {
      id: 'vigia_trovao3', nome: 'VIGIA DO TROVÃO', estilo: 'guarda',
      tx: 4, ty: 14, dir: 'dir',
      treinador: {
        classe: 'VIGIA DO TROVÃO', visao: 5, premio: 2400,
        esperta: true, itens: { garrafada_forte: 1, erva_doce: 1 },
        time: [{ especie: 'relampo', nivel: 49 }, { especie: 'curupira', nivel: 48 },
               { especie: 'tatuTrovao', nivel: 49 }, { especie: 'relampo', nivel: 49 }],
        falaInicio: 'Última crista antes do cume. Se eu deixar passar quem não aguenta, o raio me cobra.',
        falaDerrota: 'Aguenta. O ninho do raio fica do lado leste do cume. Vai com cuidado.',
      },
      falas: [
        { se: 'venceu_vigia_trovao3', linhas: [
          'Lá em cima o céu ronca sozinho. É o Relampo, dando voltas no ninho.'] },
        { batalha: true, linhas: [
          'Ninguém chega no cume sem passar pela terceira crista. E pela terceira crista, só comigo.'] },
      ],
    },
    {
      id: 'relampo_cume', nome: 'RELAMPO', estilo: 'bicho:relampo',
      tx: 50, ty: 4, dir: 'esq', seNao: 'conta_trovao',
      treinador: {
        classe: 'DONO DO CUME', selvagem: true, visao: 4, liga: 'conta_trovao',
        time: [{ especie: 'relampo', nivel: 50 }],
        falaInicio: 'O céu clareia de uma vez, e o trovão chega depois — junto com ele.',
      },
      falas: [
        { batalha: true, linhas: [
          'Dá voltas no ninho mais rápido que o olho acompanha. Só o rastro amarelo fica no ar.'] },
      ],
    },
  ],

  inicio: { tx: 27, ty: 38, dir: 'cima' },

  saidas: [
    { tx: 27, ty: 39, para: 'aldeiaTupa', destino: { tx: 27, ty: 1, dir: 'baixo' } },
    { tx: 28, ty: 39, para: 'aldeiaTupa', destino: { tx: 28, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'caverna',
  passosPorEncontro: 8,
  encontros: [
    { especie: 'tatuTrovao', min: 46, max: 48, peso: 30 },
    { especie: 'relampo', min: 46, max: 49, peso: 25 },
    { especie: 'cabraCabriola', min: 46, max: 48, peso: 20 },
    { especie: 'faisquinha', min: 46, max: 48, peso: 25 },
  ],
};
