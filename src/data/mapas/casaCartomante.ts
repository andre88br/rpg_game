/* Casa da Cartomante — as cartas da sétima região: três adivinhas em
   cadeia, a mesma `Fala.pergunta` das charadas do Velho Garimpeiro. Cada
   acerto liga a flag da próxima (`carta1_ok`, `carta2_ok`), a terceira
   acende `conta_cartomante`, e errar embaralha tudo de volta ao começo. */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaCartomante: DefMapa = {
  id: 'casaCartomante',
  nome: 'CASA DA CARTOMANTE',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWW',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W____TTTTT____W',
    'W____TTTTT____W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W______T______W',
    'WWWWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'estante', tx: 1,  ty: 1, larg: 3 },
    { tipo: 'estante', tx: 11, ty: 1, larg: 3 },
    { tipo: 'mesa',    tx: 5,  ty: 2, larg: 5 },
  ],

  npcs: [
    {
      id: 'cartomante', nome: 'CARTOMANTE', estilo: 'anhanga',
      tx: 7, ty: 1, dir: 'baixo',
      falas: [
        { se: 'conta_cartomante', linhas: [
          'As cartas já disseram tudo o que tinham pra dizer. A sua sorte é boa, {crianca}.'] },
        { se: 'carta2_ok', liga: 'conta_cartomante', paga: 900, linhas: [
          'Terceira carta, a última. O que é, o que é: tem olho, mas não enxerga?'],
          pergunta: {
            opcoes: ['A CORUJA', 'A AGULHA', 'O CEGO'], certa: 1,
            acertou: ['A agulha! As três cartas certas. Acendi uma conta da sua guia, e toma.'],
            errou: { linhas: ['Carta errada embaralha o baralho inteiro. Começa de novo.'],
                     desliga: ['carta1_ok', 'carta2_ok'] },
          } },
        { se: 'carta1_ok', liga: 'carta2_ok', linhas: [
          'Segunda carta. O que é, o que é: entra na água e não se molha?'],
          pergunta: {
            opcoes: ['O PEIXE', 'A SOMBRA', 'A PEDRA'], certa: 1,
            acertou: ['A sombra! Vira a próxima carta: fala comigo de novo.'],
            errou: { linhas: ['Carta errada embaralha o baralho inteiro. Começa de novo.'],
                     desliga: 'carta1_ok' },
          } },
        { liga: 'carta1_ok', linhas: [
          'Quer a sua sorte lida? Três cartas, três adivinhas. Errou uma, embaralho tudo.',
          'Primeira carta. O que é, o que é: quanto mais cresce, menos se vê?'],
          pergunta: {
            opcoes: ['A ÁRVORE', 'A ESCURIDÃO', 'O RIO'], certa: 1,
            acertou: ['A escuridão! Fala comigo de novo pra virar a segunda.'],
            errou: { linhas: ['Não é isso. As cartas esperam: volta a falar comigo.'] },
          } },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'bairroDaCuca', destino: { tx: 40, ty: 27, dir: 'baixo' } },
  ],
};
