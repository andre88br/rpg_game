/* =========================================================================
   Estrada Dourada — o caminho do Círculo Dourado, no meio do continente.
   Sai da borda oeste da Aldeia Catavento. No meio dela, uma fileira de
   árvores com um portão só: o Guarda do Círculo só abre para quem traz as
   oito medalhas. Do lado de cá, dois aspirantes treinam; do lado de lá,
   mais dois, já no nível de quem vai enfrentar os Guardiões.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore   .  grama   =  estrada   ,  mato   f  flores   o  pedra      */
import type { DefMapa } from '../../world/tilemap.ts';

export const estradaDourada: DefMapa = {
  id: 'estradaDourada',
  nome: 'ESTRADA DOURADA',

  chao: [
    '################################################', // 0
    '#.......................#......................#', // 1
    '#.......................#......................#', // 2
    '#..,,,,,,,,,............#.....,,,,,,,,,,,......#', // 3
    '#..,,,,,,,,,...fff......#.....,,,,,,,,,,,......#', // 4
    '#..,,,,,,,,,............#.....,,,,,,,,,,,...ff.#', // 5
    '#..,,,,,,,,,............#.....,,,,,,,,,,,......#', // 6
    '#..,,,,,,,,,............#.....,,,,,,,,,,,......#', // 7
    '#..,,,,,,,,,............#.....,,,,,,,,,,,......#', // 8
    '#.................ff....#......................#', // 9
    '#........o..............#..........o...........#', // 10
    '================================================', // 11
    '================================================', // 12
    '#.......................#.................o....#', // 13
    '#.............o.........#..ff..................#', // 14
    '#...,,,,,,,,,,..........#....f...,,,,,,,,,,,...#', // 15
    '#...,,,,,,,,,,..........#........,,,,,,,,,,,...#', // 16
    '#...,,,,,,,,,,..........#........,,,,,,,,,,,...#', // 17
    '#...,,,,,,,,,,..........#........,,,,,,,,,,,...#', // 18
    '#...,,,,,,,,,,......ff..#........,,,,,,,,,,,...#', // 19
    '#...,,,,,,,,,,..........#........,,,,,,,,,,,...#', // 20
    '#.......................#......................#', // 21
    '#.......................#......................#', // 22
    '################################################', // 23
  ],

  objetos: [
    /* o portão do Círculo: some com a oitava medalha */
    { tipo: 'barreira', tx: 24, ty: 11, larg: 1, seNao: 'medalha:aurora' },
    { tipo: 'barreira', tx: 24, ty: 12, larg: 1, seNao: 'medalha:aurora' },
    { tipo: 'placa', tx: 27, ty: 10,
      placa: 'CÍRCULO DOURADO, a oeste. Só entra quem traz as oito medalhas.' },
    { tipo: 'placa', tx: 44, ty: 13,
      placa: 'ESTRADA DOURADA. A leste, a Aldeia Catavento.' },
  ],

  npcs: [
    {
      id: 'guarda_circulo', nome: 'GUARDA DO CÍRCULO', estilo: 'guarda',
      tx: 25, ty: 13, dir: 'cima',
      falas: [
        { se: 'medalha:aurora', linhas: [
          'Oito medalhas. O portão está aberto, {crianca}: o Círculo Dourado fica logo ali.',
          'Lá dentro são seis lutas seguidas, e ninguém benze ninguém entre uma e outra. Leve garrafadas.'] },
        { linhas: [
          'Daqui em diante é o Círculo Dourado, o torneio dos que já têm as oito medalhas.',
          'Você tem {medalhas}. Volte quando tiver todas.'] },
      ],
    },
    {
      id: 'aspirante1', nome: 'ASPIRANTE', estilo: 'aldeao',
      tx: 36, ty: 13, dir: 'esq',
      treinador: {
        classe: 'ASPIRANTE AO CÍRCULO', visao: 4, premio: 4000, esperta: true,
        itens: { garrafada_forte: 2 },
        time: [{ especie: 'saci', nivel: 57 }, { especie: 'estrelaDalva', nivel: 57 }, { especie: 'minhocao', nivel: 58 }],
        falaInicio: 'Um dia eu entro no Círculo. Hoje eu treino com você.',
        falaDerrota: 'Tá pronta pro Círculo. Eu ainda não.',
      },
      falas: [
        { se: 'venceu_aspirante1', linhas: ['Os Guardiões lutam com dois tipos cada. Pensa bem no time.'] },
        { batalha: true, linhas: ['Mais uma?'] },
      ],
    },
    {
      id: 'aspirante2', nome: 'ASPIRANTE', estilo: 'crianca',
      tx: 30, ty: 10, dir: 'baixo',
      treinador: {
        classe: 'ASPIRANTE AO CÍRCULO', visao: 3, premio: 4200, esperta: true,
        itens: { garrafada_forte: 2 },
        time: [{ especie: 'uirapuru', nivel: 58 }, { especie: 'lamparina', nivel: 58 }, { especie: 'corpoSeco', nivel: 58 }],
        falaInicio: 'O Guarda não me deixa passar. Então eu não deixo você!',
        falaDerrota: 'Tá, pode passar. Ah, não sou eu que abro...',
      },
      falas: [
        { se: 'venceu_aspirante2', linhas: ['Oito medalhas... eu tenho três.'] },
        { batalha: true, linhas: ['De novo!'] },
      ],
    },
    {
      id: 'aspirante3', nome: 'VETERANA', estilo: 'mariana',
      tx: 12, ty: 13, dir: 'cima',
      treinador: {
        classe: 'VETERANA DO CÍRCULO', visao: 4, premio: 5000, esperta: true,
        itens: { garrafada_forte: 2, erva_doce: 1 },
        time: [{ especie: 'iaraMae', nivel: 59 }, { especie: 'relampo', nivel: 59 }, { especie: 'cuca', nivel: 59 }, { especie: 'mapinguari', nivel: 59 }],
        falaInicio: 'Já perdi para os quatro Guardiões. Deixa eu ver se você passa do primeiro.',
        falaDerrota: 'Passa, sim. Guarda as garrafadas para o Anhangá.',
      },
      falas: [
        { se: 'venceu_aspirante3', linhas: ['O Anhangá é o campeão faz vinte anos. Ninguém sabe o time inteiro dele.'] },
        { batalha: true, linhas: ['Revanche?'] },
      ],
    },
    {
      id: 'aspirante4', nome: 'VETERANO', estilo: 'guarda',
      tx: 6, ty: 10, dir: 'baixo',
      treinador: {
        classe: 'VETERANO DO CÍRCULO', visao: 3, premio: 5200, esperta: true,
        itens: { garrafada_forte: 2, agua_benta: 1 },
        time: [{ especie: 'lobisomem', nivel: 60 }, { especie: 'arcoDaVelha', nivel: 59 }, { especie: 'caipora', nivel: 59 }, { especie: 'mulaSemCabeca', nivel: 60 }],
        falaInicio: 'O último treino antes do Círculo. Vale como se fosse de verdade.',
        falaDerrota: 'Vai. E não olha para trás lá dentro: a porta só abre para a frente.',
      },
      falas: [
        { se: 'venceu_aspirante4', linhas: ['Perdeu lá dentro? Volta pra entrada, e o Círculo recomeça do primeiro Guardião.'] },
        { batalha: true, linhas: ['Mais uma rodada?'] },
      ],
    },
  ],

  inicio: { tx: 45, ty: 11, dir: 'esq' },

  saidas: [
    { tx: 47, ty: 11, para: 'aldeiaCatavento', destino: { tx: 1, ty: 30, dir: 'dir' } },
    { tx: 47, ty: 12, para: 'aldeiaCatavento', destino: { tx: 1, ty: 31, dir: 'dir' } },
    { tx: 0,  ty: 11, para: 'circuloDourado',  destino: { tx: 42, ty: 17, dir: 'esq' } },
    { tx: 0,  ty: 12, para: 'circuloDourado',  destino: { tx: 42, ty: 18, dir: 'esq' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 12,
  encontros: [
    { especie: 'estrelaDalva', min: 57, max: 59, peso: 30 },
    { especie: 'saci', min: 57, max: 59, peso: 25 },
    { especie: 'uirapuru', min: 57, max: 58, peso: 15 },
    { especie: 'mapinguari', min: 58, max: 59, peso: 15 },
    { especie: 'cuca', min: 58, max: 59, peso: 15 },
  ],
};
