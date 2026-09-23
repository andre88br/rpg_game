/* Boca da Mina — a entrada das Minas da Caipora, pelo vão que o Dom Faísca
   abre no alto do Morro do Trovão.

   É aqui que começa a CAÇA AO TESOURO, o primeiro tipo de tarefa novo da
   região: a Garimpeira dá a forquilha de radiestesia, e três pepitas estão
   enterradas no vale — sem nada no chão que as denuncie. Usar a forquilha
   na mochila diz QUENTE, MORNO, FRIO ou GELADO (game/tesouro.ts); de frente
   para o tile certo, o A cava (objeto `enterrado`, que não se desenha).
   Com as três, a Garimpeira acende `conta_pepitas`.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore   R  rocha   .  grama   ,  mato alto   n  capim seco
     =  estrada  ~  riacho  p  ponte                                      */
import type { DefMapa } from '../../world/tilemap.ts';

export const bocaDaMina: DefMapa = {
  id: 'bocaDaMina',
  nome: 'BOCA DA MINA',

  chao: [
    '##############################..############################', // 0
    '#.............................==...................R.......#', // 1
    '#.,,,,,,......................==..................,R.......#', // 2
    '#.,,,,,,....,,,,,,,,,.........==..................,R.......#', // 3
    '#.,,,,,,....,,,,,,,,,.........==........RRRR......,R.......#', // 4
    '#...........,,,,,,,,,.........==........RRRR......,R.......#', // 5
    '#.....RRRR..,,,,,,,,,.........==........RRRR.......RRRR.RRR#', // 6
    '#.....RRRR..,,,,,,,,,.........==...........................#', // 7
    '#.....RRRR............nnnnnn..==...........................#', // 8
    '#.....................nnnnnn..==...,,,,,,,,................#', // 9
    '#.....................nnnnnn..==...,,,,,,,,................#', // 10
    '#.....................nnnnnn..==...,,,,,,,,................#', // 11
    '#.......RRR...........nnnnnn..==...,,,,,,,,...RRR..........#', // 12
    '#.......RRR...................==...,,,,,,,,...RRR..........#', // 13
    '#.............................==..............RRR..........#', // 14
    '#.............................==..............RRR..........#', // 15
    '#.............................==...........................#', // 16
    '#.............................pp...........................#', // 17
    '#~~~~~~~................~~~~~~pp................~~~~~~~~...#', // 18
    '#~~~~~~~~~~~~~~~........~~~~~~pp~~~~~~~~........~~~~~~~~~~~#', // 19
    '#.......~~~~~~~~~~~~~~~~......pp~~~~~~~~~~~~~~~~........~~~#', // 20
    '#...............~~~~~~~~......pp........~~~~~~~~...........#', // 21
    '#.............................pp...........................#', // 22
    '#.............................==...........................#', // 23
    '#..nnnnnnnn............,,,,,,.==......,,,,,,,,,............#', // 24
    '#..nnnnnnnn............,,,,,,.==......,,,,,,,,,............#', // 25
    '#..nnnnnnnn...RRRR.....,,,,,,.==......,,,,,,,,,..RRRR......#', // 26
    '#..nnnnnnnn...RRRR.....,,,,,,.==......,,,,,,,,,..RRRR......#', // 27
    '#..nnnnnnnn...RRRR.....,,,,,,.==......,,,,,,,,,..RRRR......#', // 28
    '#..nnnnnnnn...................==......,,,,,,,,,............#', // 29
    '#...................============.....................,,,,,.#', // 30
    '#...................============.....................,,,,,.#', // 31
    '#...................==...............................,,,,,.#', // 32
    '#..,,,,,,,,,,.......==......................nnnnnnn..,,,,,.#', // 33
    '#..,,,,,,,,,,.......==..............RRRR....nnnnnnn..,,,,,.#', // 34
    '#..,,,,,,,,,,.......==..............RRRR....nnnnnnn..,,,,,.#', // 35
    '#..,,,,,,,,,,.......==......................nnnnnnn........#', // 36
    '#..,,,,,,,,,,.......==......................nnnnnnn........#', // 37
    '#...................==.....................................#', // 38
    '####################..######################################', // 39
  ],

  objetos: [
    { tipo: 'placa', tx: 18, ty: 37,
      placa: 'BOCA DA MINA. Ao norte, o Arraial da Caipora. O vale inteiro é chão de garimpo.' },
    { tipo: 'placa', tx: 33, ty: 1,
      placa: 'Arraial da Caipora, logo acima. Quem cava sem forquilha só acha terra.' },

    /* as três pepitas da Garimpeira: nada no chão mostra onde estão */
    { tipo: 'enterrado', tx: 4, ty: 6, placa: 'BURACO', se: 'cavou_pepita_1', vazio: true,
      falas: [{ linhas: ['Já se cavou aqui. Só sobrou o buraco.'] }] },
    { tipo: 'enterrado', tx: 4, ty: 6, placa: 'CAVANDO', seNao: 'cavou_pepita_1',
      falas: [{ se: 'item:forquilha', liga: 'cavou_pepita_1', da: { item: 'pepita' }, linhas: [
        'A forquilha puxa com força. Você cava com as mãos...',
        'Uma PEPITA DE OURO, do tamanho de um feijão!'] }] },
    { tipo: 'enterrado', tx: 57, ty: 12, placa: 'BURACO', se: 'cavou_pepita_2', vazio: true,
      falas: [{ linhas: ['Já se cavou aqui. Só sobrou o buraco.'] }] },
    { tipo: 'enterrado', tx: 57, ty: 12, placa: 'CAVANDO', seNao: 'cavou_pepita_2',
      falas: [{ se: 'item:forquilha', liga: 'cavou_pepita_2', da: { item: 'pepita' }, linhas: [
        'A forquilha puxa com força. Você cava com as mãos...',
        'Outra PEPITA DE OURO, brilhando no meio do barro!'] }] },
    { tipo: 'enterrado', tx: 9, ty: 31, placa: 'BURACO', se: 'cavou_pepita_3', vazio: true,
      falas: [{ linhas: ['Já se cavou aqui. Só sobrou o buraco.'] }] },
    { tipo: 'enterrado', tx: 9, ty: 31, placa: 'CAVANDO', seNao: 'cavou_pepita_3',
      falas: [{ se: 'item:forquilha', liga: 'cavou_pepita_3', da: { item: 'pepita' }, linhas: [
        'A forquilha puxa com força. Você cava com as mãos...',
        'A terceira PEPITA DE OURO, fria e pesada.'] }] },

    /* o primeiro diamante do Ourives — serviço opcional */
    { tipo: 'enterrado', tx: 44, ty: 22, placa: 'BURACO', se: 'cavou_diamante_boca', vazio: true,
      falas: [{ linhas: ['Já se cavou aqui. Só sobrou o buraco.'] }] },
    { tipo: 'enterrado', tx: 44, ty: 22, placa: 'CAVANDO', seNao: 'cavou_diamante_boca',
      falas: [{ se: 'item:forquilha', liga: 'cavou_diamante_boca', da: { item: 'diamante' }, linhas: [
        'A forquilha puxa com força. Você cava com as mãos...',
        'Uma pedra fosca e dura demais pra ser pedra comum: um DIAMANTE BRUTO.'] }] },

    /* bolso do Dom Escavar, no canto nordeste */
    { tipo: 'monteTerra', tx: 55, ty: 6, larg: 1, seNao: 'dom_escavar' },
    { tipo: 'achado', tx: 57, ty: 2, solido: false, placa: 'ESCONDERIJO',
      se: 'achou_esconderijo_boca', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 57, ty: 2, solido: false, placa: 'ESCONDERIJO',
      seNao: 'achou_esconderijo_boca',
      falas: [{ liga: 'achou_esconderijo_boca', da: { item: 'patua_mestre', n: 2 }, linhas: [
        'Atrás da terra desmoronada, um caixote de garimpeiro: dois PATUÁ DE MESTRE.',
        'Ninguém alcançava esse canto antes do Dom Escavar.'] }] },
  ],

  npcs: [
    {
      id: 'garimpeira', nome: 'GARIMPEIRA', estilo: 'garimpeiro',
      tx: 23, ty: 36, dir: 'esq',
      falas: [
        { se: 'conta_pepitas', linhas: [
          'As três pepitas pagaram a semana inteira do arraial. A forquilha é sua, fica com ela.',
          'Dizem que o Ourives procura diamante enterrado. A forquilha acha isso também.'] },
        { se: 'item:pepita>=3', pede: { item: 'pepita', n: 3 }, liga: 'conta_pepitas', paga: 900, linhas: [
          'As TRÊS! E nenhuma lascada. Você tem mão de garimpeiro, {crianca}.',
          'Acendi uma conta da sua guia. E toma, a parte que te cabe.'] },
        { se: 'tem_forquilha', linhas: [
          'Usa a forquilha na mochila. QUENTE, você está em cima. GELADO, está longe.',
          'Uma perto das pedras do noroeste, uma no leste depois do rochedo, uma no sudoeste.',
          'Quando estiver QUENTE, vire pro chão em volta e aperte A pra cavar.'] },
        { liga: 'tem_forquilha', da: { item: 'forquilha' }, linhas: [
          'Chegou gente nova no vale! Três pepitas minhas estão enterradas por aqui, e eu não acho.',
          'Toma esta FORQUILHA. Usa ela na mochila: ela diz se o ouro está quente ou frio.',
          'Me traz as três e eu acendo uma conta da sua guia.'] },
      ],
    },
    {
      id: 'garimpeiro_boca1', nome: 'GARIMPEIRO', estilo: 'garimpeiro',
      tx: 12, ty: 21, dir: 'dir',
      treinador: {
        classe: 'GARIMPEIRO', visao: 4, premio: 2200,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'minhoquinha', nivel: 52 }, { especie: 'cabraCabriola', nivel: 53 },
               { especie: 'tatuTrovao', nivel: 53 }],
        falaInicio: 'Esse pedaço do riacho é meu. Se quer bateia aqui, bate comigo primeiro.',
        falaDerrota: 'Tá bom, o riacho é de todo mundo. Por hoje.',
      },
      falas: [
        { se: 'venceu_garimpeiro_boca1', linhas: ['Ouro de riacho é miúdo. O bom está enterrado.'] },
        { batalha: true, linhas: ['Bateia na mão, Encantado no pé. Vem.'] },
      ],
    },
    {
      id: 'garimpeiro_boca2', nome: 'GARIMPEIRA', estilo: 'garimpeiro',
      tx: 40, ty: 25, dir: 'esq',
      treinador: {
        classe: 'GARIMPEIRA', visao: 4, premio: 2300,
        esperta: true, itens: { garrafada: 2 },
        time: [{ especie: 'minhocao', nivel: 53 }, { especie: 'salamanca', nivel: 53 }],
        falaInicio: 'Anda no meu mato sem pedir licença? Então prova que merece.',
        falaDerrota: 'Merece. Vai com Deus e com a forquilha.',
      },
      falas: [
        { se: 'venceu_garimpeiro_boca2', linhas: ['Forquilha que esquenta é sinal bom. Cava sem medo.'] },
        { batalha: true, linhas: ['Quem cava no vale, briga no vale.'] },
      ],
    },
    {
      id: 'garimpeiro_boca3', nome: 'GARIMPEIRO', estilo: 'garimpeiro',
      tx: 35, ty: 7, dir: 'baixo',
      treinador: {
        classe: 'GARIMPEIRO', visao: 5, premio: 2500,
        esperta: true, itens: { garrafada_forte: 1, erva_doce: 1 },
        time: [{ especie: 'tatuTrovao', nivel: 53 }, { especie: 'minhocao', nivel: 54 },
               { especie: 'mulaSemCabeca', nivel: 54 }],
        falaInicio: 'Subindo pro arraial? Paga pedágio: uma batalha.',
        falaDerrota: 'Pedágio pago. O arraial é logo ali.',
      },
      falas: [
        { se: 'venceu_garimpeiro_boca3', linhas: ['No arraial tem o Velho Garimpeiro. Ele não dá nada sem charada.'] },
        { batalha: true, linhas: ['Ninguém sobe sem descer um Encantado antes.'] },
      ],
    },
  ],

  inicio: { tx: 20, ty: 38, dir: 'cima' },

  saidas: [
    { tx: 20, ty: 39, para: 'morroDoTrovao',  destino: { tx: 20, ty: 1,  dir: 'baixo' } },
    { tx: 21, ty: 39, para: 'morroDoTrovao',  destino: { tx: 21, ty: 1,  dir: 'baixo' } },
    { tx: 30, ty: 0,  para: 'arraialCaipora', destino: { tx: 27, ty: 40, dir: 'cima' } },
    { tx: 31, ty: 0,  para: 'arraialCaipora', destino: { tx: 28, ty: 40, dir: 'cima' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 10,
  encontros: [
    { especie: 'minhoquinha', min: 51, max: 53, peso: 45 },
    { especie: 'cabraCabriola', min: 51, max: 53, peso: 25 },
    { especie: 'tatuTrovao', min: 51, max: 53, peso: 20 },
    { especie: 'salamanca', min: 52, max: 53, peso: 10 },
  ],
};
