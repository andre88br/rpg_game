/* Rota da Foz — a estrada entre Vila Aurora e Porto Iara.
   É o mato alto mais cheio da região e onde o Zeca "Redemoinho" barra a
   passagem (segunda conta da guia, na Etapa 2). O paredão de pedra no sul
   deixa um vão só: quem quiser desviar tem que voltar pelo mato.            */
import type { DefMapa } from '../../world/tilemap.ts';

export const rotaFoz: DefMapa = {
  id: 'rotaFoz',
  nome: 'ROTA DA FOZ',

  chao: [
    '#############==###############',
    '#............==..............#',
    '#..,,,,,..f..==.....,,,,,....#',
    '#..,,,,,.....==.....,,,,,....#',
    '#..,,,,,.....==.....,,,,,....#',
    '#..,,,,,.....==.....,,,,,....#',
    '#............==..............#',
    '#.#..........==...........#..#',
    '#....==========.....f........#',
    '#....=.......==..............#',
    '#....=.......==.....,,,,,,...#',
    '#....=.......==.....,,,,,,...#',
    '#..o.=.......==.....,,,,,,...#',
    '#....=.......==..............#',
    '#....==========..............#',
    '#...~~~~~~...==..........o...#',
    '#..~~~~~~~~..==..............#',
    '#..~~~a~~~~..==.....#........#',
    '#..~~~~~~~~..==..............#',
    '#..~~~~~~~~..==.........f....#',
    '#...~~~~~~...==..............#',
    '#..,,,,,,....==....,,,,,,,...#',
    '#..,,,,,,....==....,,,,,,,...#',
    '#..,,,,,,....==....,,,,,,,...#',
    '#..,,,,,,....==....,,,,,,,...#',
    '#............==..............#',
    '#RRRRRRRRRRRR==RRRRRRRRRRRRRR#',
    '#.....R......==...R..........#',
    '#.....R......==...R..........#',
    '#.#..........==..............#',
    '#........o...==......f.......#',
    '#.....f......==.........#....#',
    '#............==..............#',
    '#############==###############',
  ],

  objetos: [
    { tipo: 'placa', tx: 15, ty: 1,
      placa: 'ROTA DA FOZ. Ao norte, Vila Aurora. Ao sul, Porto Iara.' },
    { tipo: 'placa', tx: 16, ty: 25,
      placa: 'Passagem do paredão. Daqui em diante é porto: cuidado com a maré.' },
    /* a tranca do Zeca: some no instante em que ele perde, e é por isso que
       o cenário do mapa é remontado quando uma flag muda */
    { tipo: 'barreira', tx: 13, ty: 26, larg: 2, seNao: 'venceu_zeca' },
    /* na ilhota do açude, cercada de água: só depois do Dom "Nadar" */
    { tipo: 'achado', tx: 6, ty: 17, solido: false, placa: 'POTE DE BARRO',
      se: 'achou_pote', vazio: true,
      falas: [{ linhas: ['O pote está de boca para baixo, e vazio.'] }] },
    { tipo: 'achado', tx: 6, ty: 17, solido: false, placa: 'POTE DE BARRO',
      seNao: 'achou_pote',
      falas: [{ liga: 'achou_pote', da: { item: 'patua_mestre' },
                linhas: [
        'Um pote de barro lacrado com cera, esquecido na ilhota do açude.',
        'Dentro: um PATUÁ DE MESTRE, benzido três vezes. Quem deixou aqui não voltou.'] }] },
  ],

  npcs: [
    {
      id: 'zeca', nome: 'ZECA', estilo: 'zeca',
      tx: 13, ty: 25, dir: 'cima',
      treinador: {
        classe: 'MOLEQUE DA VILA', visao: 5, premio: 600,
        liga: 'conta_estrada',
        time: [{ especie: 'curupinho', nivel: 6 }, { especie: 'sacizinho', nivel: 7 }],
        falaInicio: 'Parou! Ninguém passa o paredão sem me enfrentar primeiro.',
        falaDerrota: 'Aaah! Tudo bem, tudo bem. Tira essa tranca daí e vai embora.',
      },
      falas: [
        { se: 'venceu_zeca', linhas: [
          'Vai logo, antes que eu mude de ideia e arme a tranca de novo.',
          'Mas que você joga bem, joga. Isso eu não tiro de você.'] },
        /* falar com ele vale o mesmo que ser visto: quem desce pela outra
           faixa da estrada não escapa do desafio por um tile de diferença */
        { batalha: true, linhas: [
          'Ó ela! A vizinha resolveu virar caçadora de Encantado.',
          'Essa estrada é minha. Quer passar? Passa por cima de mim.'] },
      ],
    },
    {
      id: 'caminhante', nome: 'CAMINHANTE', estilo: 'aldeao',
      tx: 15, ty: 14, dir: 'esq',
      falas: [
        { se: 'venceu_zeca', linhas: [
          'O moleque tirou a tranca? Então o paredão está livre. Boa viagem, moça.'] },
        { linhas: [
          'Esse atalho ali do lado não leva a lugar nenhum: é só volta.',
          'Mais pro sul tem um moleque com uma tranca atravessada na estrada.',
          'Se a sua criatura cair, volta pra vila. Apagado no mato não é lugar de ninguém.'] },
      ],
    },
    {
      id: 'saci_mato', nome: 'SACIZINHO', estilo: 'bicho:sacizinho',
      tx: 21, ty: 22, dir: 'baixo', seNao: 'rede_mato', fujao: {},
      falas: [
        { liga: 'rede_mato', da: { item: 'rede' }, linhas: [
          'Sem saída no meio do mato, o Sacizinho para de rir e entrega a rede.',
          'Depois some numa ventania que deixa o capim deitado.'] },
      ],
    },
    {
      id: 'menino2', nome: 'MENINO DA VILA', estilo: 'crianca',
      tx: 19, ty: 22, dir: 'esq',
      falas: [
        { se: 'vistos>=3', linhas: [
          'Você já viu bicho pra caramba. O Contador de Bichos, lá no porto, ia gostar de saber.'] },
        { linhas: ['Perdi de novo. Minha mãe vai me matar se souber que eu desci sozinho.'] },
      ],
    },
  ],

  inicio: { tx: 13, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 13, ty: 0,  para: 'vilaAurora', destino: { tx: 13, ty: 24, dir: 'cima' } },
    { tx: 14, ty: 0,  para: 'vilaAurora', destino: { tx: 14, ty: 24, dir: 'cima' } },
    { tx: 13, ty: 33, para: 'portoIara',  destino: { tx: 16, ty: 1, dir: 'baixo' } },
    { tx: 14, ty: 33, para: 'portoIara',  destino: { tx: 17, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 8,
  encontros: [
    { especie: 'caiporinha', min: 3, max: 6, peso: 40 },
    { especie: 'piragua', min: 3, max: 6, peso: 35 },
    { especie: 'sacizinho', min: 4, max: 7, peso: 25 },
  ],
};
