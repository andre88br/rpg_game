/* =========================================================================
   Círculo Dourado — a praça do torneio, no meio do continente.

   A arena fica no alto da praça; dentro dela, seis lutas seguidas
   (arenaDourada.ts). Na praça: benzimento e loja — os últimos antes do
   torneio —, o balão que leva e traz da Cidade do Sol, e, depois de o
   jogador virar campeão, os oito donos de terreiro esperando revanche.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore   .  grama   =  pátio   f  flores                           */
import type { DefMapa } from '../../world/tilemap.ts';

export const circuloDourado: DefMapa = {
  id: 'circuloDourado',
  nome: 'CÍRCULO DOURADO',

  chao: [
    '############################################', // 0
    '#..........................................#', // 1
    '#.##....................................##.#', // 2
    '#...........#.................#............#', // 3
    '#..........................................#', // 4
    '#..........................................#', // 5
    '#..........................................#', // 6
    '#..........................................#', // 7
    '#..........................................#', // 8
    '#..........................................#', // 9
    '#....................==....................#', // 10
    '#...........ffffffff.==.ffffffff...........#', // 11
    '#...........ffffffff.==.ffffffff...........#', // 12
    '#...........ffffffff.==.ffffffff...........#', // 13
    '#....................==....................#', // 14
    '#.....=..............==..............=.....#', // 15
    '#.....================================.....#', // 16
    '#===========================================', // 17
    '#===========================================', // 18
    '#....................==....................#', // 19
    '#.#..................==....................#', // 20
    '#...........ffffffff.==.ffffffff.........#.#', // 21
    '#...........ffffffff.==.ffffffff...........#', // 22
    '#...........ffffffff.==.ffffffff...........#', // 23
    '#....................==....................#', // 24
    '#....................==....................#', // 25
    '#....................==....................#', // 26
    '#....................==....................#', // 27
    '#....................==....................#', // 28
    '#....................==....................#', // 29
    '#....................==....................#', // 30
    '#..........................................#', // 31
    '#.##....................................##.#', // 32
    '#..........................................#', // 33
    '#..........................................#', // 34
    '############################################', // 35
  ],

  objetos: [
    { tipo: 'arena',      tx: 15, ty: 2,  larg: 13, alt: 8 },            // porta (21,9)
    { tipo: 'benzimento', tx: 4,  ty: 11, larg: 5, alt: 4 },             // porta (6,14)
    { tipo: 'loja',       tx: 35, ty: 11, larg: 5, alt: 4 },             // porta (37,14)
    { tipo: 'balao',      tx: 5,  ty: 24, larg: 3, alt: 3, placa: 'BALÃO',
      falas: [{ linhas: ['Um balão listrado, preso por quatro cordas. Quem pilota é o Baloeiro, ali do lado.'] }] },
    { tipo: 'placa', tx: 24, ty: 10,
      placa: 'CÍRCULO DOURADO. Seis lutas seguidas, sem benzimento entre elas. Perdeu, recomeça do primeiro.' },
    { tipo: 'placa', tx: 40, ty: 16,
      placa: 'A leste, a Estrada Dourada e a Aldeia Catavento.' },
  ],

  npcs: [
    {
      id: 'baloeiro_circulo', nome: 'BALOEIRO', estilo: 'aldeao',
      tx: 9, ty: 26, dir: 'esq',
      falas: [
        { leva: { mapa: 'cidadeDoSol', tx: 8, ty: 25, dir: 'cima' }, linhas: [
          'Pra Cidade do Sol? Segura no cesto, que o vento daqui pra lá é bom.'] },
      ],
    },
    {
      id: 'porteiro_circulo', nome: 'PORTEIRO', estilo: 'guarda',
      tx: 23, ty: 10, dir: 'baixo',
      falas: [
        { se: 'campeao', linhas: [
          'A arena está aberta para o campeão sempre que quiser. Os Guardiões ficaram mais fortes depois de você.'] },
        { linhas: [
          'Lá dentro: quatro Guardiões, o seu rival e o campeão, o Anhangá. Uma câmara depois da outra.',
          'A porta de cada câmara só abre para a frente, e ninguém benze ninguém. Se cair, recomeça do primeiro.'] },
      ],
    },
    {
      id: 'revanche_mariana', nome: 'DONA MARIANA', estilo: 'mariana',
      tx: 11, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'iaraMae', nivel: 60 }, { especie: 'piragua', nivel: 60 }, { especie: 'caipora', nivel: 60 }, { especie: 'iaraMae', nivel: 60 }, { especie: 'relampo', nivel: 60 }, { especie: 'estrelaDalva', nivel: 60 }],
        falaInicio: 'A Maré voltou mais alta. Vamos ver se você ainda nada nela.',
        falaDerrota: 'Campeão é campeão. Volta quando quiser.',
      },
      falas: [
        { se: 'venceu_revanche_mariana', linhas: ['Foi bonita essa. A gente se vê na próxima volta da trilha.'] },
        { batalha: true, linhas: ['Vim ao Círculo só para a revanche. Seis contra seis, sem pena.'] },
      ],
    },
    {
      id: 'revanche_tie', nome: 'TIÊ', estilo: 'tie',
      tx: 14, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'curupira', nivel: 60 }, { especie: 'caipora', nivel: 60 }, { especie: 'curupira', nivel: 60 }, { especie: 'mapinguari', nivel: 60 }, { especie: 'pisadeira', nivel: 60 }, { especie: 'lamparina', nivel: 60 }],
        falaInicio: 'A mata cresceu desde a Raiz. Eu também.',
        falaDerrota: 'Campeão é campeão. Volta quando quiser.',
      },
      falas: [
        { se: 'venceu_revanche_tie', linhas: ['Foi bonita essa. A gente se vê na próxima volta da trilha.'] },
        { batalha: true, linhas: ['Vim ao Círculo só para a revanche. Seis contra seis, sem pena.'] },
      ],
    },
    {
      id: 'revanche_bras', nome: 'BRÁS', estilo: 'aldeao',
      tx: 17, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'boitatao', nivel: 60 }, { especie: 'mulaSemCabeca', nivel: 60 }, { especie: 'salamanca', nivel: 60 }, { especie: 'maeDoOuro', nivel: 60 }, { especie: 'cabraCabriola', nivel: 60 }, { especie: 'lamparina', nivel: 60 }],
        falaInicio: 'A forja ficou mais quente. Aguenta?',
        falaDerrota: 'Campeão é campeão. Volta quando quiser.',
      },
      falas: [
        { se: 'venceu_revanche_bras', linhas: ['Foi bonita essa. A gente se vê na próxima volta da trilha.'] },
        { batalha: true, linhas: ['Vim ao Círculo só para a revanche. Seis contra seis, sem pena.'] },
      ],
    },
    {
      id: 'revanche_perere', nome: 'PERERÊ', estilo: 'mariana',
      tx: 26, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'saci', nivel: 60 }, { especie: 'uirapuru', nivel: 60 }, { especie: 'matinta', nivel: 60 }, { especie: 'pisadeira', nivel: 60 }, { especie: 'relampo', nivel: 60 }, { especie: 'saci', nivel: 60 }],
        falaInicio: 'O redemoinho gira pro outro lado agora.',
        falaDerrota: 'Campeão é campeão. Volta quando quiser.',
      },
      falas: [
        { se: 'venceu_revanche_perere', linhas: ['Foi bonita essa. A gente se vê na próxima volta da trilha.'] },
        { batalha: true, linhas: ['Vim ao Círculo só para a revanche. Seis contra seis, sem pena.'] },
      ],
    },
    {
      id: 'revanche_guaraci', nome: 'GUARACI', estilo: 'tie',
      tx: 29, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'relampo', nivel: 60 }, { especie: 'tatuTrovao', nivel: 60 }, { especie: 'arcoDaVelha', nivel: 60 }, { especie: 'relampo', nivel: 60 }, { especie: 'uirapuru', nivel: 60 }, { especie: 'minhocao', nivel: 60 }],
        falaInicio: 'O trovão aprendeu uns truques novos.',
        falaDerrota: 'Campeão é campeão. Volta quando quiser.',
      },
      falas: [
        { se: 'venceu_revanche_guaraci', linhas: ['Foi bonita essa. A gente se vê na próxima volta da trilha.'] },
        { batalha: true, linhas: ['Vim ao Círculo só para a revanche. Seis contra seis, sem pena.'] },
      ],
    },
    {
      id: 'revanche_ubirajara', nome: 'UBIRAJARA', estilo: 'guarda',
      tx: 32, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'mapinguari', nivel: 60 }, { especie: 'minhocao', nivel: 60 }, { especie: 'tatuTrovao', nivel: 60 }, { especie: 'corpoSeco', nivel: 60 }, { especie: 'caipora', nivel: 60 }, { especie: 'cabraCabriola', nivel: 60 }],
        falaInicio: 'A pedra não esquece quem passou por ela.',
        falaDerrota: 'Campeão é campeão. Volta quando quiser.',
      },
      falas: [
        { se: 'venceu_revanche_ubirajara', linhas: ['Foi bonita essa. A gente se vê na próxima volta da trilha.'] },
        { batalha: true, linhas: ['Vim ao Círculo só para a revanche. Seis contra seis, sem pena.'] },
      ],
    },
    {
      id: 'revanche_morgana', nome: 'MORGANA', estilo: 'anhanga',
      tx: 26, ty: 27, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'cuca', nivel: 60 }, { especie: 'lobisomem', nivel: 60 }, { especie: 'pisadeira', nivel: 60 }, { especie: 'corpoSeco', nivel: 60 }, { especie: 'jaci', nivel: 60 }, { especie: 'lobisomem', nivel: 60 }],
        falaInicio: 'No breu eu te vi chegar. Agora eu te vejo voltar.',
        falaDerrota: 'Campeão é campeão. Volta quando quiser.',
      },
      falas: [
        { se: 'venceu_revanche_morgana', linhas: ['Foi bonita essa. A gente se vê na próxima volta da trilha.'] },
        { batalha: true, linhas: ['Vim ao Círculo só para a revanche. Seis contra seis, sem pena.'] },
      ],
    },
    {
      id: 'revanche_solano', nome: 'SOLANO', estilo: 'guarda',
      tx: 29, ty: 27, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'estrelaDalva', nivel: 60 }, { especie: 'jaci', nivel: 60 }, { especie: 'maeDoOuro', nivel: 60 }, { especie: 'arcoDaVelha', nivel: 60 }, { especie: 'lamparina', nivel: 60 }, { especie: 'estrelaDalva', nivel: 60 }],
        falaInicio: 'O sol nasceu de novo. A luta também.',
        falaDerrota: 'Campeão é campeão. Volta quando quiser.',
      },
      falas: [
        { se: 'venceu_revanche_solano', linhas: ['Foi bonita essa. A gente se vê na próxima volta da trilha.'] },
        { batalha: true, linhas: ['Vim ao Círculo só para a revanche. Seis contra seis, sem pena.'] },
      ],
    },
  ],

  inicio: { tx: 40, ty: 17, dir: 'esq' },

  saidas: [
    { tx: 43, ty: 17, para: 'estradaDourada',   destino: { tx: 1,  ty: 11, dir: 'dir' } },
    { tx: 43, ty: 18, para: 'estradaDourada',   destino: { tx: 1,  ty: 12, dir: 'dir' } },
    { tx: 21, ty: 9,  para: 'arenaDourada',     destino: { tx: 7,  ty: 45, dir: 'cima' } },
    { tx: 6,  ty: 14, para: 'benzimentoCirculo', destino: { tx: 7, ty: 8,  dir: 'cima' } },
    { tx: 37, ty: 14, para: 'lojaCirculo',      destino: { tx: 7,  ty: 8,  dir: 'cima' } },
  ],

  cenario: 'cidade',
};
