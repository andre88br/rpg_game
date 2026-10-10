/* Casa da Tainá — o quarto de onde tudo começa.
   Nos interiores: _ piso de madeira · W parede · T tapete (o da porta é a saída) */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaTaina: DefMapa = {
  id: 'casaTaina',
  nome: 'SUA CASA',
  interior: true,
  refugio: true,
  socorro: { quem: 'MÃE', falas: [
    'Eita, criança, você apagou no meio do mato!',
    'Seu Anastácio te trouxe nas costas. Os bichos já estão benzidos — vá com mais juízo.'] },

  chao: [
    'WWWWWWWWWWW',
    'W_________W',
    'W_________W',
    'W_________W',
    'W__TTTTT__W',
    'W__TTTTT__W',
    'W__TTTTT__W',
    'W_________W',
    'W____T____W',
    'WWWWWWWWWWW',
  ],

  /* as boas-vindas: a primeira coisa do jogo, logo depois da abertura —
     controles e para onde ir. Save antigo (que já escolheu o inicial) pula. */
  aoChegar: {
    quem: 'MÃE', seNao: ['viu_boas_vindas', 'escolheu_inicial'], liga: 'viu_boas_vindas',
    linhas: [
      'Acordou, enfim, {nome}! A Dona Firmina mandou te chamar logo cedo.',
      'Pra andar, use as setas ou W A S D. No celular, o direcional.',
      'Pra falar com alguém ou ler uma placa, chegue de frente e aperte A. No teclado, o A é o Z, o Enter ou o Espaço.',
      'Segure B pra correr. No teclado, o B é o X ou o Shift.',
      'O MENU mostra seu time, a mochila, a guia de contas e o mapa. No teclado, é o Esc ou o Tab.',
      'A casa da Dona Firmina é a de telhado grande, logo à direita da nossa. Vai lá, criança.'],
  },

  objetos: [
    { tipo: 'estante', tx: 1, ty: 1, larg: 3 },
    { tipo: 'mesa',    tx: 6, ty: 1, larg: 3 },
  ],

  npcs: [
    {
      id: 'mae', nome: 'MÃE', estilo: 'aldeao',
      tx: 2, ty: 5, dir: 'dir',
      falas: [
        { se: 'medalha:mare', linhas: [
          'Medalha em casa! Deixa eu ver isso de perto, {nome}.',
          'Sua avó dizia que quem tem a Maré no peito não se perde na água.',
          'Descansa hoje. Amanhã você atravessa, e eu finjo que não estou com medo.'] },
        { se: 'contas>=5', linhas: [
          'Cinco contas? Então é hoje que você entra no terreiro da Dona Mariana.',
          'Vai com o time inteiro de pé, criança.'] },
        { se: 'conta_recado', linhas: [
          'A Dona Firmina passou aqui contando da carta. Disse que você não fez feio.',
          'Come alguma coisa antes de descer pro porto de novo, {nome}.'] },
        { se: 'venceu_zeca', linhas: [
          'Soube que o Zeca levou uma lição na estrada. A mãe dele que não fique sabendo por mim.'] },
        { se: 'item:carta', linhas: [
          'Carta pro Mestre do Porto? Porto Iara fica ao sul, na beira do mar.',
          'Sai da vila pela estrada de baixo e segue a Rota da Foz até o fim. O Mestre fica no cais.'] },
        { se: 'escolheu_inicial', linhas: [
          'Deixa eu ver o bicho! ...é bonito. Trate bem dele, que ele trata de você.',
          'Se apagar no mato, alguém te traz de volta. Mas dói o orgulho.'] },
        { linhas: [
          'A Dona Firmina mandou chamar você. A casa dela é a de telhado grande, logo à direita da nossa.',
          'Vai lá, criança. E leva juízo junto com o patuá.'] },
      ],
    },
  ],

  inicio: { tx: 5, ty: 7, dir: 'cima' },

  saidas: [
    { tx: 5, ty: 8, para: 'vilaAurora', destino: { tx: 6, ty: 6, dir: 'baixo' } },
  ],
};
