/* =========================================================================
   Remanso da Norato — a gruta alagada a oeste do Círculo Dourado, aberta só
   depois do campeonato.

   No breu, com um véu (que só a Visão Noturna atravessa) e uma cortina de
   luz (que só o Prisma desfaz) no caminho. No fundo, enrolada na pedra, a
   Cobra Norato: um só no mundo, e enquanto não for presa ela volta para o
   mesmo lugar.
     S parede de caverna   s chão de caverna   ~ água                 */
import type { DefMapa } from '../../world/tilemap.ts';

export const remansoNorato: DefMapa = {
  id: 'remansoNorato',
  nome: 'REMANSO DA NORATO',
  interior: true,
  escuro: {},
  musica: 'breu',

  chao: [
    'SSSSSSSSSSSSSSSSSSSSSSSS', // 0
    'SS~~~~~SSSSSSSSSSSSSSSSS', // 1
    'SS~ssss~SSSSSSSSSSSSSSSS', // 2
    'SS~ssss~SSSSSSSSSSSSSSSS', // 3
    'SS~sssssssssssssSSSSSSSS', // 4
    'SS~~~~~SSSSSSSSsSSSSSSSS', // 5
    'SSSSSSSSSSSSSSSsSSSSSSSS', // 6
    'SSSSSSSSSSSSSSSsssssssss', // 7
    'SSSSSSSSSSSSSSSSSSSSSSSS', // 8
  ],

  /* a água do remanso fica fechada na pedra: nem a nado se contorna o véu */
  objetos: [
    { tipo: 'veu',        tx: 15, ty: 6, larg: 1, seNao: 'dom_visao' },
    { tipo: 'cortinaLuz', tx: 10, ty: 4, larg: 1, seNao: 'dom_prisma' },
  ],

  npcs: [
    {
      id: 'cobra_norato', nome: 'COBRA NORATO', estilo: 'bicho:cobraNorato',
      tx: 4, ty: 3, dir: 'dir', seNao: 'capturado:cobraNorato',
      treinador: {
        classe: 'BICHO DO REMANSO', selvagem: true, repete: true,
        time: [{ especie: 'cobraNorato', nivel: 72 }],
        falaInicio: 'O rio inteiro se enrola e levanta a cabeça.',
      },
      falas: [
        { batalha: true, linhas: [
          'No barranco, uma pele de cobra do tamanho de uma canoa, largada como roupa velha.',
          'A água do remanso para de correr. Alguém muito grande abre um olho amarelo.'] },
      ],
    },
  ],

  inicio: { tx: 22, ty: 7, dir: 'esq' },

  saidas: [
    { tx: 23, ty: 7, para: 'circuloDourado', destino: { tx: 1, ty: 33, dir: 'dir' } },
  ],
};
