/* =========================================================================
   Beco das Rondas — o braço norte do Bairro da Cuca, e a primeira tarefa
   de FURTIVIDADE do jogo.

   Uma grade de becos entre quarteirões de pedra. Sete vigias da Cuca dão a
   volta cada um no seu quarteirão, um passo por vez, olhando para onde
   andam (até 5 tiles, e a parede corta a visão — game/ronda.ts). Se algum
   enxergar o jogador, manda de volta para a entrada, e as rondas recomeçam
   do ponto de partida. Cada quarteirão tem um nicho: uma reentrância de um
   tile no muro, onde quem espera fica fora da linha de qualquer vigia.

   Chegar ao portão do cemitério, no alto (29,0), acende `conta_rondas` — e
   aí os vigias largam a ronda, para a volta ser tranquila.

   As rondas saíram de simulação (tempo em passos, o vigia a meio passo do
   jogador): o caminho sem vigia tem 36 passos, e o mais curto que ninguém
   vê tem 72 — tem que esperar nos nichos. `mapas.test.ts` refaz a mesma
   simulação sobre este mapa a cada execução.
   A gride é editável à mão, um caractere por tile de 16x16:
     R  muro de pedra   =  beco   .  nicho
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const becoDasRondas: DefMapa = {
  id: 'becoDasRondas',
  nome: 'BECO DAS RONDAS',

  chao: [
    'RRRRRRRRRRRRRRRRRRRRRRRRRRRRR=RRRRRRRRRRRRRRRRRRRRRRRRRRRRR', // 0
    'R=========================================================R', // 1
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRR.RR=RRRR.RR=RRRRRRR=RRRRRRR=R', // 2
    'R=.RRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRR.=RRRRRRR=R', // 3
    'R=RRRRRRR=RRRRRRR=.RRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRR.=R', // 4
    'R=RRRRRRR=.RRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 5
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 6
    'R=========================================================R', // 7
    'R=RRRRRRR=R.RRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 8
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=.RRRRRR=R', // 9
    'R=RRRRRRR=RRRRRRR=RRRRRRR=.RRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 10
    'R=RRRRRRR=RRRRRRR=.RRRRRR=RRRRRRR=RRRRRRR=.RRRRRR=RRRRRRR=R', // 11
    'R=RRRRR.R=RRRRRRR=RRRRRRR=RRRRRRR=RRRR.RR=RRRRRRR=RRRRRRR=R', // 12
    'R=========================================================R', // 13
    'R=RRRRRRR=RRRR.RR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 14
    'R=RRRRRRR=RRRRRRR=RRRRRRR=.RRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 15
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRR.=R', // 16
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRR.=RRRRRR.=RRRRRRR=R', // 17
    'R=RRRR.RR=RRRRRRR=RR.RRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 18
    'R=========================================================R', // 19
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRR.RR=RRRR.RR=RRRRRRR=R', // 20
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRR.=R', // 21
    'R=RRRRRRR=RRRRRR.=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 22
    'R=RRRRRRR=RRRRRRR=.RRRRRR=RRRRRR.=RRRRRRR=RRRRRRR=RRRRRRR=R', // 23
    'R=RRR.RRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 24
    'R=========================================================R', // 25
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RR.RRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 26
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 27
    'R=RRRRRRR=RRRRRR.=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRR.=.RRRRRR=R', // 28
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 29
    'R=RRR.RRR=RRRRRRR=RRRRR.R=RRRRRRR=RR.RRRR=RRRRRRR=RRRRRRR=R', // 30
    'R=========================================================R', // 31
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRR.RRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 32
    'R=.RRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 33
    'R=RRRRRRR=RRRRRRR=.RRRRRR=RRRRRRR=RRRRRRR=.RRRRRR=RRRRRR.=R', // 34
    'R=RRRRRRR=RRRRRR.=RRRRRRR=RRRRRRR=.RRRRRR=RRRRRRR=RRRRRRR=R', // 35
    'R=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=RRRRRRR=R', // 36
    'R=========================================================R', // 37
    'RRRRRRRRRRRRRRRRRRRRRRRRRRRRR==RRRRRRRRRRRRRRRRRRRRRRRRRRRR', // 38
  ],

  objetos: [
    /* o fim do beco: o portão do cemitério velho */
    { tipo: 'achado', tx: 29, ty: 0, larg: 1, placa: 'PORTÃO DO CEMITÉRIO', se: 'conta_rondas', vazio: true,
      falas: [{ linhas: ['O portão rangeu uma vez e nunca mais. Os vigias foram embora.'] }] },
    { tipo: 'achado', tx: 29, ty: 0, larg: 1, placa: 'PORTÃO DO CEMITÉRIO', seNao: 'conta_rondas',
      falas: [{ liga: 'conta_rondas', linhas: [
        'Você encosta no portão do cemitério velho sem que nenhum vigia tenha visto.',
        'Lá atrás, um apito comprido: a ronda acabou por esta noite.'] }] },

    /* o terceiro retrato, escondido num nicho do canto */
    { tipo: 'achado', tx: 2, ty: 3, solido: false, placa: 'RETRATO', se: 'achou_retrato_beco', vazio: true,
      falas: [{ linhas: ['Não sobrou nada no nicho.'] }] },
    { tipo: 'achado', tx: 2, ty: 3, solido: false, placa: 'RETRATO', seNao: 'achou_retrato_beco',
      falas: [{ liga: 'achou_retrato_beco', da: { item: 'retrato' }, linhas: [
        'Enfiado no nicho do muro, virado pra parede: um RETRATO ANTIGO.'] }] },
  ],

  npcs: [
    {
      id: 'vigia_beco1', nome: 'VIGIA DA CUCA', estilo: 'guarda',
      tx: 9, ty: 31, dir: 'esq', seNao: 'conta_rondas',
      ronda: {
        visao: 5, volta: { tx: 29, ty: 37, dir: 'cima' },
        fala: 'Ei! Criança na rua a essa hora? Volta pro começo do beco, e já!',
        caminho: [{ tx: 9, ty: 31 }, { tx: 8, ty: 31 }, { tx: 7, ty: 31 }, { tx: 6, ty: 31 }, { tx: 5, ty: 31 }, { tx: 4, ty: 31 }, { tx: 3, ty: 31 }, { tx: 2, ty: 31 }, { tx: 1, ty: 31 }, { tx: 1, ty: 30 }, { tx: 1, ty: 29 }, { tx: 1, ty: 28 }, { tx: 1, ty: 27 }, { tx: 1, ty: 26 }, { tx: 1, ty: 25 }, { tx: 2, ty: 25 }, { tx: 3, ty: 25 }, { tx: 4, ty: 25 }, { tx: 5, ty: 25 }, { tx: 6, ty: 25 }, { tx: 7, ty: 25 }, { tx: 8, ty: 25 }, { tx: 9, ty: 25 }, { tx: 9, ty: 26 }, { tx: 9, ty: 27 }, { tx: 9, ty: 28 }, { tx: 9, ty: 29 }, { tx: 9, ty: 30 }],
      },
      falas: [{ linhas: ['Ronda da Cuca. Ninguém passa sem ser visto.'] }],
    },
    {
      id: 'vigia_beco2', nome: 'VIGIA DA CUCA', estilo: 'guarda',
      tx: 33, ty: 4, dir: 'cima', seNao: 'conta_rondas',
      ronda: {
        visao: 5, volta: { tx: 29, ty: 37, dir: 'cima' },
        fala: 'Ei! Criança na rua a essa hora? Volta pro começo do beco, e já!',
        caminho: [{ tx: 33, ty: 4 }, { tx: 33, ty: 3 }, { tx: 33, ty: 2 }, { tx: 33, ty: 1 }, { tx: 32, ty: 1 }, { tx: 31, ty: 1 }, { tx: 30, ty: 1 }, { tx: 29, ty: 1 }, { tx: 28, ty: 1 }, { tx: 27, ty: 1 }, { tx: 26, ty: 1 }, { tx: 25, ty: 1 }, { tx: 25, ty: 2 }, { tx: 25, ty: 3 }, { tx: 25, ty: 4 }, { tx: 25, ty: 5 }, { tx: 25, ty: 6 }, { tx: 25, ty: 7 }, { tx: 26, ty: 7 }, { tx: 27, ty: 7 }, { tx: 28, ty: 7 }, { tx: 29, ty: 7 }, { tx: 30, ty: 7 }, { tx: 31, ty: 7 }, { tx: 32, ty: 7 }, { tx: 33, ty: 7 }, { tx: 33, ty: 6 }, { tx: 33, ty: 5 }],
      },
      falas: [{ linhas: ['Ronda da Cuca. Ninguém passa sem ser visto.'] }],
    },
    {
      id: 'vigia_beco3', nome: 'VIGIA DA CUCA', estilo: 'guarda',
      tx: 25, ty: 15, dir: 'cima', seNao: 'conta_rondas',
      ronda: {
        visao: 5, volta: { tx: 29, ty: 37, dir: 'cima' },
        fala: 'Ei! Criança na rua a essa hora? Volta pro começo do beco, e já!',
        caminho: [{ tx: 25, ty: 15 }, { tx: 25, ty: 14 }, { tx: 25, ty: 13 }, { tx: 26, ty: 13 }, { tx: 27, ty: 13 }, { tx: 28, ty: 13 }, { tx: 29, ty: 13 }, { tx: 30, ty: 13 }, { tx: 31, ty: 13 }, { tx: 32, ty: 13 }, { tx: 33, ty: 13 }, { tx: 33, ty: 14 }, { tx: 33, ty: 15 }, { tx: 33, ty: 16 }, { tx: 33, ty: 17 }, { tx: 33, ty: 18 }, { tx: 33, ty: 19 }, { tx: 32, ty: 19 }, { tx: 31, ty: 19 }, { tx: 30, ty: 19 }, { tx: 29, ty: 19 }, { tx: 28, ty: 19 }, { tx: 27, ty: 19 }, { tx: 26, ty: 19 }, { tx: 25, ty: 19 }, { tx: 25, ty: 18 }, { tx: 25, ty: 17 }, { tx: 25, ty: 16 }],
      },
      falas: [{ linhas: ['Ronda da Cuca. Ninguém passa sem ser visto.'] }],
    },
    {
      id: 'vigia_beco4', nome: 'VIGIA DA CUCA', estilo: 'guarda',
      tx: 17, ty: 25, dir: 'dir', seNao: 'conta_rondas',
      ronda: {
        visao: 5, volta: { tx: 29, ty: 37, dir: 'cima' },
        fala: 'Ei! Criança na rua a essa hora? Volta pro começo do beco, e já!',
        caminho: [{ tx: 17, ty: 25 }, { tx: 18, ty: 25 }, { tx: 19, ty: 25 }, { tx: 20, ty: 25 }, { tx: 21, ty: 25 }, { tx: 22, ty: 25 }, { tx: 23, ty: 25 }, { tx: 24, ty: 25 }, { tx: 25, ty: 25 }, { tx: 25, ty: 26 }, { tx: 25, ty: 27 }, { tx: 25, ty: 28 }, { tx: 25, ty: 29 }, { tx: 25, ty: 30 }, { tx: 25, ty: 31 }, { tx: 24, ty: 31 }, { tx: 23, ty: 31 }, { tx: 22, ty: 31 }, { tx: 21, ty: 31 }, { tx: 20, ty: 31 }, { tx: 19, ty: 31 }, { tx: 18, ty: 31 }, { tx: 17, ty: 31 }, { tx: 17, ty: 30 }, { tx: 17, ty: 29 }, { tx: 17, ty: 28 }, { tx: 17, ty: 27 }, { tx: 17, ty: 26 }],
      },
      falas: [{ linhas: ['Ronda da Cuca. Ninguém passa sem ser visto.'] }],
    },
    {
      id: 'vigia_beco5', nome: 'VIGIA DA CUCA', estilo: 'guarda',
      tx: 24, ty: 13, dir: 'esq', seNao: 'conta_rondas',
      ronda: {
        visao: 5, volta: { tx: 29, ty: 37, dir: 'cima' },
        fala: 'Ei! Criança na rua a essa hora? Volta pro começo do beco, e já!',
        caminho: [{ tx: 24, ty: 13 }, { tx: 23, ty: 13 }, { tx: 22, ty: 13 }, { tx: 21, ty: 13 }, { tx: 20, ty: 13 }, { tx: 19, ty: 13 }, { tx: 18, ty: 13 }, { tx: 17, ty: 13 }, { tx: 17, ty: 14 }, { tx: 17, ty: 15 }, { tx: 17, ty: 16 }, { tx: 17, ty: 17 }, { tx: 17, ty: 18 }, { tx: 17, ty: 19 }, { tx: 18, ty: 19 }, { tx: 19, ty: 19 }, { tx: 20, ty: 19 }, { tx: 21, ty: 19 }, { tx: 22, ty: 19 }, { tx: 23, ty: 19 }, { tx: 24, ty: 19 }, { tx: 25, ty: 19 }, { tx: 25, ty: 18 }, { tx: 25, ty: 17 }, { tx: 25, ty: 16 }, { tx: 25, ty: 15 }, { tx: 25, ty: 14 }, { tx: 25, ty: 13 }],
      },
      falas: [{ linhas: ['Ronda da Cuca. Ninguém passa sem ser visto.'] }],
    },
    {
      id: 'vigia_beco6', nome: 'VIGIA DA CUCA', estilo: 'guarda',
      tx: 49, ty: 19, dir: 'cima', seNao: 'conta_rondas',
      ronda: {
        visao: 5, volta: { tx: 29, ty: 37, dir: 'cima' },
        fala: 'Ei! Criança na rua a essa hora? Volta pro começo do beco, e já!',
        caminho: [{ tx: 49, ty: 19 }, { tx: 49, ty: 18 }, { tx: 49, ty: 17 }, { tx: 49, ty: 16 }, { tx: 49, ty: 15 }, { tx: 49, ty: 14 }, { tx: 49, ty: 13 }, { tx: 50, ty: 13 }, { tx: 51, ty: 13 }, { tx: 52, ty: 13 }, { tx: 53, ty: 13 }, { tx: 54, ty: 13 }, { tx: 55, ty: 13 }, { tx: 56, ty: 13 }, { tx: 57, ty: 13 }, { tx: 57, ty: 14 }, { tx: 57, ty: 15 }, { tx: 57, ty: 16 }, { tx: 57, ty: 17 }, { tx: 57, ty: 18 }, { tx: 57, ty: 19 }, { tx: 56, ty: 19 }, { tx: 55, ty: 19 }, { tx: 54, ty: 19 }, { tx: 53, ty: 19 }, { tx: 52, ty: 19 }, { tx: 51, ty: 19 }, { tx: 50, ty: 19 }],
      },
      falas: [{ linhas: ['Ronda da Cuca. Ninguém passa sem ser visto.'] }],
    },
    {
      id: 'vigia_beco7', nome: 'VIGIA DA CUCA', estilo: 'guarda',
      tx: 47, ty: 13, dir: 'esq', seNao: 'conta_rondas',
      ronda: {
        visao: 5, volta: { tx: 29, ty: 37, dir: 'cima' },
        fala: 'Ei! Criança na rua a essa hora? Volta pro começo do beco, e já!',
        caminho: [{ tx: 47, ty: 13 }, { tx: 46, ty: 13 }, { tx: 45, ty: 13 }, { tx: 44, ty: 13 }, { tx: 43, ty: 13 }, { tx: 42, ty: 13 }, { tx: 41, ty: 13 }, { tx: 41, ty: 14 }, { tx: 41, ty: 15 }, { tx: 41, ty: 16 }, { tx: 41, ty: 17 }, { tx: 41, ty: 18 }, { tx: 41, ty: 19 }, { tx: 42, ty: 19 }, { tx: 43, ty: 19 }, { tx: 44, ty: 19 }, { tx: 45, ty: 19 }, { tx: 46, ty: 19 }, { tx: 47, ty: 19 }, { tx: 48, ty: 19 }, { tx: 49, ty: 19 }, { tx: 49, ty: 18 }, { tx: 49, ty: 17 }, { tx: 49, ty: 16 }, { tx: 49, ty: 15 }, { tx: 49, ty: 14 }, { tx: 49, ty: 13 }, { tx: 48, ty: 13 }],
      },
      falas: [{ linhas: ['Ronda da Cuca. Ninguém passa sem ser visto.'] }],
    },
  ],

  inicio: { tx: 29, ty: 37, dir: 'cima' },

  saidas: [
    { tx: 29, ty: 38, para: 'bairroDaCuca', destino: { tx: 27, ty: 1, dir: 'baixo' } },
    { tx: 30, ty: 38, para: 'bairroDaCuca', destino: { tx: 28, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'cidade',
};
