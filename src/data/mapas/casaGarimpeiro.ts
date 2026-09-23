/* Casa do Velho Garimpeiro — as CHARADAS, um dos tipos de tarefa novos das
   Minas. Três perguntas em cadeia, uma por conversa: cada acerto liga a
   flag da próxima (`charada1_ok`, `charada2_ok`), e a terceira acende
   `conta_charadas`. Errar QUALQUER uma apaga o progresso e manda recomeçar
   da primeira. A pergunta é uma `Fala.pergunta` (game/quests.ts): a última
   página fica na tela e uma caixinha de opções abre ao lado. */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaGarimpeiro: DefMapa = {
  id: 'casaGarimpeiro',
  nome: 'CASA DO VELHO GARIMPEIRO',
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
      id: 'velho_garimpeiro', nome: 'VELHO GARIMPEIRO', estilo: 'garimpeiro',
      tx: 7, ty: 1, dir: 'baixo',
      falas: [
        { se: 'conta_charadas', linhas: [
          'Três de três. Cabeça boa vale mais que bateia cheia, {crianca}.'] },
        { se: 'charada2_ok', liga: 'conta_charadas', paga: 800, linhas: [
          'Última, e a mais difícil. O que é, o que é: anda com os pés na cabeça?'],
          pergunta: {
            opcoes: ['O PIOLHO', 'O CHAPÉU', 'O GARIMPEIRO'], certa: 0,
            acertou: ['O piolho! Hahaha! Três de três. Acendi uma conta da sua guia, e toma um trocado.'],
            errou: { linhas: ['Errou! E charada errada apaga as outras. Começa tudo de novo.'],
                     desliga: ['charada1_ok', 'charada2_ok'] },
          } },
        { se: 'charada1_ok', liga: 'charada2_ok', linhas: [
          'Segunda. O que é, o que é: tem cabeça, tem dente, tem barba, não é bicho nem é gente?'],
          pergunta: {
            opcoes: ['O MILHO', 'O ALHO', 'A CEBOLA'], certa: 1,
            acertou: ['O alho! Fala comigo de novo pra última.'],
            errou: { linhas: ['Errou! E charada errada apaga as outras. Começa tudo de novo.'],
                     desliga: 'charada1_ok' },
          } },
        { liga: 'charada1_ok', linhas: [
          'Quer uma conta da guia? Aqui se paga com a cabeça. Três charadas, sem errar nenhuma.',
          'Primeira. O que é, o que é: quanto mais se tira, maior fica?'],
          pergunta: {
            opcoes: ['A PEDRA', 'O BURACO', 'O RIO'], certa: 1,
            acertou: ['O buraco! Garimpeiro sabe disso melhor que ninguém. Fala comigo de novo.'],
            errou: { linhas: ['Não é isso. Pensa de novo e volta a falar comigo.'] },
          } },
      ],
    },
  ],

  inicio: { tx: 7, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 9, para: 'arraialCaipora', destino: { tx: 40, ty: 27, dir: 'baixo' } },
  ],
};
