/* Cava Funda — o braço oeste do Arraial, depois da tranca do Zeca.
   Uma cava de garimpo em espiral: três anéis de rocha, um dentro do outro,
   cada um com um vão só, alternando lado — oeste, leste, oeste. Descer até
   o fundo é dar a volta inteira na cava três vezes, de ponta a ponta.
   No fundo mora o Mapinguari, a quinta conta da guia (`conta_mapinguari`),
   e, para quem entregou os três diamantes ao Ourives E tem a Medalha Pedra,
   aparece a Caipora — o Encantado exclusivo da região.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore   R  rocha (anel)   .  chão   ,  mato   n  capim seco
     c  chão pisado   o  pedra                                            */
import type { DefMapa } from '../../world/tilemap.ts';

export const cavaFunda: DefMapa = {
  id: 'cavaFunda',
  nome: 'CAVA FUNDA',

  chao: [
    '##########################################################', // 0
    '#.......nnnnnnnnnnnnn....................................#', // 1
    '#.......nnnnnnnnnnnnn...o................................#', // 2
    '#........................................................#', // 3
    '#...RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR...#', // 4
    '#...R................................................R...#', // 5
    '#...R.,,,,,,,,,......................................R...#', // 6
    '#...R.,,,,,,,,,......................................R...#', // 7
    '#...R................................................R...#', // 8
    '#...R.....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.....R...#', // 9
    '#...R.....R....................................R.....R...#', // 10
    '#...R.....R.nnnnnnnnn....o.....................R.....R...#', // 11
    '#...R.....R.nnnnnnnnn..........................R.....R...#', // 12
    '#...R.....R....................................R.....R...#', // 13
    '#...R.....R.....RRRRRRRRRRRRRRRRRRRRRRRRRR.....R.....R...#', // 14
    '#...R..o..R.....R........................R.....R.....R...#', // 15
    '#...R.....R.....R...ccccccc..............R.....R.....R...#', // 16
    '#...R.....R.....R...ccccccc..............R..o..R.....R...#', // 17
    '#...R.....R.....R...ccccccc..............R.....R.....R...#', // 18
    '#.........R..............................R...........R...#', // 19
    '#.........R..............................R...........R....', // 20
    '#...R.....R.....R.............ccccccc....R.....R.....R....', // 21
    '#...R.....R..o..R.............ccccccc....R.....R.....R...#', // 22
    '#...R.....R.....R.............ccccccc....R.....R.....R...#', // 23
    '#...R.....R.....R........................R.....R..o..R...#', // 24
    '#...R.....R.....RRRRRRRRRRRRRRRRRRRRRRRRRR.....R.....R...#', // 25
    '#...R.....R....................................R.....R...#', // 26
    '#...R.....R...................,,,,,,,,,,,......R.....R...#', // 27
    '#...R.....R...................,,,,,,,,,,,......R.....R...#', // 28
    '#...R.....R...................o................R.....R...#', // 29
    '#...R.....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.....R...#', // 30
    '#...R.............................,,,,,,,,,,,........R...#', // 31
    '#...R.............................,,,,,,,,,,,........R...#', // 32
    '#...R.............................,,,,,,,,,,,........R...#', // 33
    '#...R................................................R...#', // 34
    '#...RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#', // 35
    '#.............................nnnnnnnnnnnnnnn....R.......#', // 36
    '#.............................nnnnnnnnnnnnnnn.o..........#', // 37
    '#.............................nnnnnnnnnnnnnnn....R.......#', // 38
    '##########################################################', // 39
  ],

  objetos: [
    { tipo: 'placa', tx: 55, ty: 18,
      placa: 'CAVA FUNDA. Cada anel tem um vão só, e nunca do mesmo lado do anterior.' },

    /* o terceiro diamante do Ourives, no fundo da cava */
    { tipo: 'enterrado', tx: 25, ty: 21, placa: 'BURACO', se: 'cavou_diamante_cava', vazio: true,
      falas: [{ linhas: ['Já se cavou aqui. Só sobrou o buraco.'] }] },
    { tipo: 'enterrado', tx: 25, ty: 21, placa: 'CAVANDO', seNao: 'cavou_diamante_cava',
      falas: [{ se: 'item:forquilha', liga: 'cavou_diamante_cava', da: { item: 'diamante' }, linhas: [
        'A forquilha puxa com força. Você cava com as mãos...',
        'No barro do fundo da cava, ainda frio: o terceiro DIAMANTE BRUTO.'] }] },

    /* bolso do Dom Escavar, no canto sudeste da faixa de fora */
    { tipo: 'monteTerra', tx: 49, ty: 37, larg: 1, seNao: 'dom_escavar' },
    { tipo: 'achado', tx: 55, ty: 37, solido: false, placa: 'ESCONDERIJO',
      se: 'achou_esconderijo_cava', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 55, ty: 37, solido: false, placa: 'ESCONDERIJO',
      seNao: 'achou_esconderijo_cava',
      falas: [{ liga: 'achou_esconderijo_cava', da: { item: 'patua_mestre', n: 2 }, linhas: [
        'Atrás da terra desmoronada, uma lata enferrujada: dois PATUÁ DE MESTRE.',
        'Ninguém alcançava esse canto antes do Dom Escavar.'] }] },
  ],

  npcs: [
    {
      id: 'garimpeiro_cava1', nome: 'GARIMPEIRO', estilo: 'garimpeiro',
      tx: 30, ty: 2, dir: 'baixo',
      treinador: {
        classe: 'GARIMPEIRO DA CAVA', visao: 4, premio: 2800,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'minhocao', nivel: 55 }, { especie: 'cabraCabriola', nivel: 55 },
               { especie: 'relampo', nivel: 55 }],
        falaInicio: 'A borda da cava é minha. Quer descer, desce me derrubando.',
        falaDerrota: 'Desce. O vão do primeiro anel é lá no oeste.',
      },
      falas: [
        { se: 'venceu_garimpeiro_cava1', linhas: ['O primeiro anel abre no oeste. O segundo, no leste. Adivinha o terceiro.'] },
        { batalha: true, linhas: ['Borda de cava é lugar de gente firme.'] },
      ],
    },
    {
      id: 'garimpeiro_cava2', nome: 'GARIMPEIRA', estilo: 'garimpeiro',
      tx: 7, ty: 28, dir: 'cima',
      treinador: {
        classe: 'GARIMPEIRA DA CAVA', visao: 4, premio: 3000,
        esperta: true, itens: { garrafada_forte: 1, erva_doce: 1 },
        time: [{ especie: 'mapinguari', nivel: 55 }, { especie: 'salamanca', nivel: 56 },
               { especie: 'tatuTrovao', nivel: 56 }],
        falaInicio: 'Tá descendo a cava? Eu já vi o Mapinguari de longe. Você não aguenta nem a mim.',
        falaDerrota: 'Aguenta. Então vai, mas não olha no olho dele.',
      },
      falas: [
        { se: 'venceu_garimpeiro_cava2', linhas: ['O Mapinguari tem um olho só e a boca na barriga. Não é conversa de garimpeiro.'] },
        { batalha: true, linhas: ['Segundo anel. Segunda luta.'] },
      ],
    },
    {
      id: 'garimpeiro_cava3', nome: 'GARIMPEIRO', estilo: 'garimpeiro',
      tx: 44, ty: 12, dir: 'baixo',
      treinador: {
        classe: 'GARIMPEIRO DA CAVA', visao: 4, premio: 3200,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'minhocao', nivel: 56 }, { especie: 'mapinguari', nivel: 56 },
               { especie: 'relampo', nivel: 56 }, { especie: 'cabraCabriola', nivel: 56 }],
        falaInicio: 'Último anel antes do fundo. Daqui pra baixo, só quem me vence.',
        falaDerrota: 'Vence. O vão do último anel é no oeste. O resto é com você.',
      },
      falas: [
        { se: 'venceu_garimpeiro_cava3', linhas: ['Ouviu o chão tremer? É ele, lá no fundo.'] },
        { batalha: true, linhas: ['O fundo da cava tem dono. E antes dele, tem eu.'] },
      ],
    },
    {
      id: 'mapinguari_fundo', nome: 'MAPINGUARI', estilo: 'bicho:mapinguari',
      tx: 38, ty: 19, dir: 'esq', seNao: 'conta_mapinguari',
      treinador: {
        classe: 'DONO DA CAVA', selvagem: true, visao: 4, liga: 'conta_mapinguari',
        time: [{ especie: 'mapinguari', nivel: 57 }],
        falaInicio: 'O chão afunda de um lado, depois do outro. Um olho só se abre no meio da testa.',
      },
      falas: [
        { batalha: true, linhas: [
          'Respira pela boca da barriga, um ronco fundo que faz a cava inteira tremer.'] },
      ],
    },
    {
      id: 'caipora_fundo', nome: 'CAIPORA', estilo: 'bicho:caipora',
      tx: 20, ty: 23, dir: 'dir', seNao: 'servico_caipora',
      falas: [
        { se: ['servico_diamantes', 'medalha:pedra'], liga: 'servico_caipora',
          encantado: { especie: 'caipora', nivel: 40 }, linhas: [
          'Um assobio fino, e um porco-do-mato sai de trás da pedra com alguém montado nele.',
          '— Três diamantes achados sem derrubar uma árvore. Quem garimpa assim, eu acompanho.',
          'A CAIPORA desce do porco e vai com você.'] },
        { se: 'medalha:pedra', linhas: [
          'Um cabelo de fogo some atrás da pedra antes de você chegar perto.',
          'O Ourives disse: quem acha os três diamantes, a Caipora vem conhecer.'] },
        { linhas: [
          'Um assobio fino corta o fundo da cava. Não tem ninguém à vista.',
          'Alguém está olhando. E ainda não decidiu se gosta de você.'] },
      ],
    },
  ],

  inicio: { tx: 56, ty: 20, dir: 'esq' },

  saidas: [
    { tx: 57, ty: 20, para: 'arraialCaipora', destino: { tx: 1, ty: 20, dir: 'dir' } },
    { tx: 57, ty: 21, para: 'arraialCaipora', destino: { tx: 1, ty: 21, dir: 'dir' } },
  ],

  cenario: 'caverna',
  passosPorEncontro: 9,
  encontros: [
    { especie: 'minhoquinha', min: 54, max: 56, peso: 35 },
    { especie: 'minhocao', min: 54, max: 56, peso: 20 },
    { especie: 'cabraCabriola', min: 54, max: 56, peso: 25 },
    { especie: 'mapinguari', min: 55, max: 56, peso: 5 },
    { especie: 'salamanca', min: 54, max: 56, peso: 15 },
  ],
};
