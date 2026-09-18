/* Porto Iara — a cidade do Terreiro de Água, e o fim da Fase 1.
   O terreiro fica no meio do largo, e a guia de cinco contas atravessa o pátio
   na frente da porta: enquanto as cinco contas não acenderem, ninguém entra.
   O pátio é fechado dos dois lados de propósito — a guia só barra alguma coisa
   se ela for o ÚNICO caminho até a porta, e o teste de mapas cobra isso.
   A grade é editável à mão, um caractere por tile de 16x16:
     .  grama          ,  mato alto (encontros)   =  caminho de terra
     a  areia          ~  água (intransponível)   p  cais de madeira
     #  árvore         o  pedra                   f  flores                  */
import type { DefMapa } from '../../world/tilemap.ts';

export const portoIara: DefMapa = {
  id: 'portoIara',
  nome: 'PORTO IARA',

  chao: [
    '################==################',
    '#...............==...............#',
    '#...............==...............#',
    '#.#.............==.............#.#',
    '#...............==...............#',
    '#...............==...............#',
    '#...............==...............#',
    '#...............==...............#',
    '#.#.........f...==..f..........#.#',
    '#........=......==.....=.........#',
    '#.==============================.#',
    '#.==============================.#',
    '#........==............==........#',
    '#.,,,,,.o==............==..,,,,,.#',
    '#.,,,,,..==............==..,,,,,.#',
    '#.,,,,,..==...........o==..,,,,,.#',
    '#.,,,,,.f==o...........==f.,,,,,.#',
    '#.,,,,,..==............==..,,,,,.#',
    '#........==##=======###==........#',
    '#........==##=======##.==........#',
    '#.#.....==================.....#.#',
    '#.......==================.......#',
    '#......o==================.......#',
    '#...........==========...........#',
    '#.,,,,,.f...==========....f.,,,,.#',
    '#.,,,,,.....==========......,,,,.#',
    '#.,,,,,..f..==========....f.,,,,.#',
    '#.,,,,,.....==========.....o,,,,.#',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '~~~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~pp~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~ppppppp~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~ppppppp~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~ppppppp~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],

  objetos: [
    { tipo: 'casa',       tx: 2,  ty: 5,  larg: 4, alt: 3, trancada: true },
    { tipo: 'benzimento', tx: 7,  ty: 5,  larg: 5, alt: 4 },   // porta (9,8)
    { tipo: 'loja',       tx: 21, ty: 5,  larg: 5, alt: 4 },   // porta (23,8)
    { tipo: 'casa',       tx: 28, ty: 5,  larg: 4, alt: 3, trancada: true },
    { tipo: 'terreiro',   tx: 13, ty: 13, larg: 7, alt: 5 },   // porta (16,17)
    // a guia de cinco contas: o portão da Fase 1
    { tipo: 'portao',     tx: 13, ty: 19, larg: 7 },
    { tipo: 'placa',      tx: 22, ty: 19,
      placa: 'TERREIRO DE ÁGUA, de Dona Mariana. A guia abre com cinco contas acesas.' },
    { tipo: 'placa',      tx: 11, ty: 22,
      placa: 'Ao sul: a praia e o cais. Ao norte: a Rota da Foz.' },
    /* a torre nasce do mar e encosta a base na plataforma do cais */
    { tipo: 'farol',      tx: 13, ty: 29, larg: 3, alt: 7 },
    { tipo: 'placa',      tx: 18, ty: 33,
      placa: 'FAROL DA BARRA. Porta emperrada há anos. De noite ele acende sozinho.' },
  ],

  npcs: [
    {
      id: 'guarda', nome: 'GUARDA DO LARGO', estilo: 'guarda',
      tx: 12, ty: 20, dir: 'dir',
      falas: [
        { se: 'medalha:mare', linhas: [
          'A Dona Mariana entregou a Maré. Pois então o largo é seu, {nome}.',
          'E dizem que agora você atravessa a barra a nado. Isso eu preciso ver.'] },
        { se: 'contas>=5', linhas: [
          'Cinco contas. Nunca vi ninguém acender as cinco tão depressa.',
          'Pode entrar, {nome}. A Dona Mariana já sabe que você vem.'] },
        { se: 'contas>=1', linhas: [
          'A guia está com {contas} de cinco contas acesas. Faltam {faltam}.',
          'Ainda falta: {servico}.'] },
        { linhas: [
          'A guia tem cinco contas, e todas apagadas. Assim ninguém passa.',
          'Cada serviço bem feito nesta região acende uma. Pergunte por aí quem precisa de ajuda.'] },
      ],
    },
    {
      id: 'pescador', nome: 'MESTRE DO PORTO', estilo: 'pescador',
      tx: 17, ty: 29, dir: 'cima',
      falas: [
        { se: 'item:carta', pede: { item: 'carta' }, liga: 'conta_recado', paga: 800, linhas: [
          'Carta da Dona Firmina? Passa pra cá, {crianca}.',
          'Chegou seca, apesar da maré. Toma aqui pelo incômodo — e mandei acender sua primeira conta.',
          'Agora o meu problema: sumiram três redes minhas. Dizem que foi bicho, não gente.'] },
        { se: 'item:rede>=3', pede: { item: 'rede', n: 3 }, liga: 'conta_redes',
          paga: 700, linhas: [
          'As TRÊS! Eu sabia que era bicho, e ninguém acreditava em mim.',
          'Sacizinho gosta de nó, e rede é nó que não acaba. Agora entendo o sumiço.',
          'Outra conta acesa por sua conta, {crianca}. E toma pelo trabalho.'] },
        { se: 'conta_redes', seNao: 'conta_farol', linhas: [
          'Com as redes de volta eu pesco. Sair da barra é que não dá.',
          'Tem bicho morando no farol, e de noite o mar ali ferve. Isso ninguém resolve.'] },
        { se: 'conta_recado', seNao: 'conta_redes', linhas: [
          'Sumiram três redes. Dizem que foi bicho, e não gente.',
          'Vi um Sacizinho no cais, outro na praia e um terceiro subindo a estrada.',
          'Quem me trouxer as três de volta acende outra conta da guia.'] },
        { se: 'tem_recado', linhas: [
          'A Dona Firmina mandou carta e você não trouxe? Volta lá, {crianca}.'] },
        { linhas: ['Sem as redes ninguém pesca hoje, {crianca}. Nem eu, nem ninguém.'] },
      ],
    },
    {
      id: 'contador', nome: 'CONTADOR DE BICHOS', estilo: 'aldeao',
      tx: 24, ty: 21, dir: 'esq',
      falas: [
        { se: 'conta_caderno', linhas: [
          'Quatro bichos anotados com a sua letra. O caderno agradece, {crianca}.'] },
        { se: ['tem_caderno', 'vistos>=4'], liga: 'conta_caderno', paga: 500, linhas: [
          'Deixa eu ver... um, dois, três, QUATRO. Os quatro da região, todos anotados.',
          'Serviço é serviço: acendi uma conta da guia pra você. E toma um trocado.'] },
        { se: 'tem_caderno', linhas: [
          'Ainda faltam bichos no caderno. Você anotou {vistos} de quatro.',
          'Anda pelo mato alto, {crianca}. Bicho não vem até a praça.'] },
        { liga: 'tem_caderno', da: { item: 'caderno' }, linhas: [
          'Eu anoto num caderno todo Encantado que aparece por aqui. São quatro na região.',
          'Toma o caderno. Encontre os quatro e eu mesmo acendo uma conta pra você.'] },
      ],
    },
    {
      id: 'crianca', nome: 'MENINO DO CAIS', estilo: 'crianca',
      tx: 6, ty: 21, dir: 'baixo',
      falas: [
        { se: 'conta_farol', linhas: [
          'Você encarou o bicho do farol e voltou inteira? Quando eu crescer eu faço igual.'] },
        { se: 'item:rede>=1', linhas: [
          'Rede na mão! Foi Sacizinho, né? Eles gostam de nó. Tem mais um lá na praia.'] },
        { se: 'contas>=3', linhas: [
          'Três contas acesas! Só falta o bicho do farol. Esse ninguém encara.'] },
        { linhas: ['Tem um bicho de fogo morando no farol. De noite dá pra ver os olhos dele.'] },
      ],
    },
    {
      id: 'saci_cais', nome: 'SACIZINHO', estilo: 'bicho:sacizinho',
      tx: 17, ty: 30, dir: 'baixo', seNao: 'rede_cais', fujao: {},
      falas: [
        { liga: 'rede_cais', da: { item: 'rede' }, linhas: [
          'O Sacizinho senta no tabuado, sem fôlego, e larga a rede enrolada no pé.',
          'Some num redemoinho de poeira antes de você agradecer.'] },
      ],
    },
    {
      id: 'saci_praia', nome: 'SACIZINHO', estilo: 'bicho:sacizinho',
      tx: 25, ty: 28, dir: 'esq', seNao: 'rede_praia', fujao: {},
      falas: [
        { liga: 'rede_praia', da: { item: 'rede' }, linhas: [
          'Encurralado na areia, o Sacizinho joga a rede na sua cara e ri.',
          'Depois vira vento e sobe a praia.'] },
      ],
    },
    {
      id: 'boitata', nome: 'BOITATÁ', estilo: 'bicho:boitatao',
      tx: 17, ty: 35, dir: 'cima', seNao: 'conta_farol',
      treinador: {
        classe: 'BICHO DO FAROL', selvagem: true, visao: 4, liga: 'conta_farol',
        time: [{ especie: 'boitatao', nivel: 18 }],
        falaInicio: 'O mar clareia de uma vez. A cobra de fogo desenrola do farol e vem.',
      },
      falas: [
        { batalha: true, linhas: [
          'Enrolado na base do farol, o bicho abre os olhos de brasa.',
          'A água do cais chia só de ele respirar.'] },
      ],
    },
    {
      id: 'aldea', nome: 'MOÇA DA VILA', estilo: 'aldeao',
      tx: 26, ty: 12, dir: 'esq',
      falas: [
        { se: 'item:patua>=1', linhas: [
          'Patuá na mochila, bicho cansado na frente: é assim que se prende Encantado.'] },
        { linhas: ['A loja vende patuás. Sem patuá não dá para capturar Encantado nenhum.'] },
      ],
    },
  ],

  inicio: { tx: 16, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 16, ty: 0,  para: 'rotaFoz',              destino: { tx: 13, ty: 32, dir: 'cima' } },
    { tx: 17, ty: 0,  para: 'rotaFoz',              destino: { tx: 14, ty: 32, dir: 'cima' } },
    { tx: 9,  ty: 8,  para: 'benzimentoPortoIara',  destino: { tx: 7, ty: 8, dir: 'cima' } },
    { tx: 23, ty: 8,  para: 'lojaPortoIara',        destino: { tx: 7, ty: 8, dir: 'cima' } },
    { tx: 16, ty: 17, para: 'terreiroPortoIara',    destino: { tx: 8, ty: 12, dir: 'cima' } },
  ],

  cenario: 'praia',
  passosPorEncontro: 8,
  /* O mato de Porto Iara é beira de rio: Piraguá é o que mais aparece, o
     Sacizinho passa correndo de vez em quando e a Caiporinha vem do mato
     mais fechado do fundo. */
  encontros: [
    { especie: 'piragua', min: 4, max: 7, peso: 55 },
    { especie: 'caiporinha', min: 4, max: 6, peso: 30 },
    { especie: 'sacizinho', min: 5, max: 7, peso: 15 },
  ],
};
