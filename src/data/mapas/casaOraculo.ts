/* Casa do Oráculo — as adivinhas da oitava região: três perguntas em
   cadeia, a mesma `Fala.pergunta` da Cartomante. Cada acerto liga a flag
   da próxima (`oraculo1_ok`, `oraculo2_ok`), a terceira acende
   `conta_oraculo`, e errar apaga tudo de volta ao começo. */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaOraculo: DefMapa = {
  id: 'casaOraculo',
  nome: 'CASA DO ORÁCULO',
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
      id: 'oraculo', nome: 'ORÁCULO', estilo: 'firmina',
      tx: 7, ty: 1, dir: 'baixo',
      falas: [
        { se: 'conta_oraculo', linhas: [
          'O sol já me contou tudo sobre você. O caminho até o Solano está aberto, {crianca}.'] },
        { se: 'oraculo2_ok', liga: 'conta_oraculo', paga: 900, linhas: [
          'Última pergunta. O que é, o que é: nasce grande e morre pequena, e só existe quando tem luz?'],
          pergunta: {
            opcoes: ['A VELA', 'A SOMBRA', 'A LUA'], certa: 1,
            acertou: ['A sombra, que cresce de manhã e encolhe ao meio-dia! Acendi uma conta da sua guia, e toma.'],
            errou: { linhas: ['Errou. A luz se apaga e a gente volta pro começo.'],
                     desliga: ['oraculo1_ok', 'oraculo2_ok'] },
          } },
        { se: 'oraculo1_ok', liga: 'oraculo2_ok', linhas: [
          'Segunda pergunta. O que é, o que é: entra pela janela sem quebrar o vidro?'],
          pergunta: {
            opcoes: ['O VENTO', 'A LUZ', 'O GATO'], certa: 1,
            acertou: ['A luz! Fala comigo de novo pra última.'],
            errou: { linhas: ['Errou. A luz se apaga e a gente volta pro começo.'],
                     desliga: 'oraculo1_ok' },
          } },
        { liga: 'oraculo1_ok', linhas: [
          'O sol me conta tudo, mas eu só conto a quem responde. Três perguntas. Errou uma, apago tudo.',
          'Primeira. O que é, o que é: nasce todo dia de manhã e morre toda tarde, e ninguém chora?'],
          pergunta: {
            opcoes: ['A FLOR', 'O DIA', 'O GALO'], certa: 1,
            acertou: ['O dia! Fala comigo de novo pra segunda.'],
            errou: { linhas: ['Não é isso. O sol espera: volta a falar comigo.'] },
          } },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'cidadeDoSol', destino: { tx: 40, ty: 27, dir: 'baixo' } },
  ],
};
