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
  musica: 'mundoCirculo',

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
    '...........................................#', // 33
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
    { tipo: 'casa', tx: 34, ty: 27, larg: 5, alt: 4, placa: 'ROMARIA' },     // porta (36,30)
    /* a oeste, a gruta da Cobra Norato: fechada até o campeonato */
    { tipo: 'barreira', tx: 1, ty: 33, seNao: 'campeao' },
    { tipo: 'placa', tx: 2, ty: 34,
      placa: 'A oeste, o Remanso. Dizem que mora lá uma cobra que é o rio inteiro.' },
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
          'A arena está aberta para {g:a campeã|o campeão} sempre que quiser. Os Guardiões ficaram mais fortes depois de você.',
          'E chegou recado da Vila do Sossego: a sua mãe mandou dizer que a janta está esperando.'] },
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
        escala: { piso: 70, mais: 3 }, repete: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'iaraMae', nivel: 60 }, { especie: 'piragua', nivel: 60 }, { especie: 'caipora', nivel: 60 }, { especie: 'iaraMae', nivel: 60 }, { especie: 'relampo', nivel: 60 }, { especie: 'estrelaDalva', nivel: 60 }],
        falaInicio: 'Perdi pra você e ganhei o rio de volta. Já saí pescando três vezes, sabia? Agora, a revanche.',
        falaDerrota: 'Tá bom, tá bom. Mas não conta pro Brás que eu perdi duas vezes.',
      },
      falas: [
        { se: 'venceu_revanche_mariana', batalha: true, linhas: ['De novo? O barco espera. Já que o Brás também veio, eu não posso perder feio na frente dele.'] },
        { batalha: true, linhas: ['Vim de barco, com o Mestre do Porto no leme. Ele aposta em você. Eu, em mim.'] },
      ],
    },
    {
      id: 'revanche_tie', nome: 'TIÊ', estilo: 'tie',
      tx: 14, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        escala: { piso: 70, mais: 3 }, repete: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'curupira', nivel: 60 }, { especie: 'caipora', nivel: 60 }, { especie: 'curupira', nivel: 60 }, { especie: 'mapinguari', nivel: 60 }, { especie: 'pisadeira', nivel: 60 }, { especie: 'lamparina', nivel: 60 }],
        falaInicio: 'A Firmina veio me visitar depois do campeonato. Trouxe outra muda. Agora eu quero ver a sua raiz.',
        falaDerrota: 'Raiz funda, a sua. A mata escolheu bem.',
      },
      falas: [
        { se: 'venceu_revanche_tie', batalha: true, linhas: ['Voltou? O jatobá da porta deu flor este ano. Eu dei raiz também. Vem.'] },
        { batalha: true, linhas: ['Saí da mata só pra isso. Não me faça voltar sem uma boa luta.'] },
      ],
    },
    {
      id: 'revanche_bras', nome: 'BRÁS', estilo: 'bras',
      tx: 17, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        escala: { piso: 70, mais: 3 }, repete: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'boitatao', nivel: 60 }, { especie: 'mulaSemCabeca', nivel: 60 }, { especie: 'salamanca', nivel: 60 }, { especie: 'maeDoOuro', nivel: 60 }, { especie: 'cabraCabriola', nivel: 60 }, { especie: 'lamparina', nivel: 60 }],
        falaInicio: 'A forja do Boitatá acendeu de novo, fogo que guarda. E a Mariana veio ver. Não posso perder.',
        falaDerrota: '...Perdi. E a Mariana viu. Agora sim, ela ganhou de mim.',
      },
      falas: [
        { se: 'venceu_revanche_bras', batalha: true, linhas: ['Mais uma? A brasa não apaga com uma derrota só. Nem com duas.'] },
        { batalha: true, linhas: ['Desci a serra com a brasa no bolso. Seis contra seis, e a Mariana de olho.'] },
      ],
    },
    {
      id: 'revanche_perere', nome: 'PERERÊ', estilo: 'perere',
      tx: 26, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        escala: { piso: 70, mais: 3 }, repete: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'saci', nivel: 60 }, { especie: 'uirapuru', nivel: 60 }, { especie: 'matinta', nivel: 60 }, { especie: 'pisadeira', nivel: 60 }, { especie: 'relampo', nivel: 60 }, { especie: 'saci', nivel: 60 }],
        falaInicio: 'Dancei com o primeiro Saci do mundo, sabia? O vento até riu. Agora vamos ver se ele ri de você.',
        falaDerrota: 'Ganhou do vento de novo. Vou contar pro Guaraci, que ele vai trovejar de inveja.',
      },
      falas: [
        { se: 'venceu_revanche_perere', batalha: true, linhas: ['Voltou girando, né? O vento gosta de quem volta.'] },
        { batalha: true, linhas: ['O vento me trouxe até aqui sem eu pedir. Deve ser pra lutar com você.'] },
      ],
    },
    {
      id: 'revanche_guaraci', nome: 'GUARACI', estilo: 'guaraci',
      tx: 29, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        escala: { piso: 70, mais: 3 }, repete: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'relampo', nivel: 60 }, { especie: 'tatuTrovao', nivel: 60 }, { especie: 'arcoDaVelha', nivel: 60 }, { especie: 'relampo', nivel: 60 }, { especie: 'uirapuru', nivel: 60 }, { especie: 'minhocao', nivel: 60 }],
        falaInicio: 'As torres caíram e minha filha tocou o tambor grande na campina. Tupã respondeu. Agora, eu.',
        falaDerrota: 'O raio escolheu você de novo. Discutir com ele, eu não discuto.',
      },
      falas: [
        { se: 'venceu_revanche_guaraci', batalha: true, linhas: ['Trovão de novo? O Pererê disse que vinha, então eu vim primeiro.'] },
        { batalha: true, linhas: ['Os tambores de Tupã me mandaram vir. Quando eles mandam, eu venho.'] },
      ],
    },
    {
      id: 'revanche_ubirajara', nome: 'UBIRAJARA', estilo: 'ubirajara',
      tx: 32, ty: 22, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        escala: { piso: 70, mais: 3 }, repete: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'mapinguari', nivel: 60 }, { especie: 'minhocao', nivel: 60 }, { especie: 'tatuTrovao', nivel: 60 }, { especie: 'corpoSeco', nivel: 60 }, { especie: 'caipora', nivel: 60 }, { especie: 'cabraCabriola', nivel: 60 }],
        falaInicio: 'Meu neto achou a primeira pepita dele com bateia, pedindo licença. Fiquei feliz. Agora fico bravo, que é luta.',
        falaDerrota: 'A pedra cedeu outra vez. Meu neto vai querer ouvir essa.',
      },
      falas: [
        { se: 'venceu_revanche_ubirajara', batalha: true, linhas: ['Voltou? A pedra não esquece. Nem eu.'] },
        { batalha: true, linhas: ['Desci a montanha devagar, que pedra não corre. Mas na luta ela pesa.'] },
      ],
    },
    {
      id: 'revanche_morgana', nome: 'MORGANA', estilo: 'morgana',
      tx: 26, ty: 27, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        escala: { piso: 70, mais: 3 }, repete: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'cuca', nivel: 60 }, { especie: 'lobisomem', nivel: 60 }, { especie: 'pisadeira', nivel: 60 }, { especie: 'corpoSeco', nivel: 60 }, { especie: 'jaci', nivel: 60 }, { especie: 'lobisomem', nivel: 60 }],
        falaInicio: 'O Solano veio me ver. Depois de vinte anos. Ficamos olhando a lua até o sol nascer. Agora é luta.',
        falaDerrota: 'O breu cedeu. O meu irmão vai rir de mim, mas tudo bem: agora ele ri perto.',
      },
      falas: [
        { se: 'venceu_revanche_morgana', batalha: true, linhas: ['De novo? No escuro, eu treinei com a lua. E ela não pega leve.'] },
        { batalha: true, linhas: ['Vim pela noite, que é o meu caminho. E a lua veio junto, pra ver.'] },
      ],
    },
    {
      id: 'revanche_solano', nome: 'SOLANO', estilo: 'solano',
      tx: 29, ty: 27, dir: 'baixo', se: 'campeao',
      treinador: {
        classe: 'REVANCHE DE MESTRE', premio: 8000, esperta: true,
        escala: { piso: 70, mais: 3 }, repete: true,
        itens: { garrafada_forte: 3, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'estrelaDalva', nivel: 60 }, { especie: 'jaci', nivel: 60 }, { especie: 'maeDoOuro', nivel: 60 }, { especie: 'arcoDaVelha', nivel: 60 }, { especie: 'lamparina', nivel: 60 }, { especie: 'estrelaDalva', nivel: 60 }],
        falaInicio: 'Fui ver a Morgana, como prometi. A lua não perguntou mais por mim: eu estava lá. Agora, a luz.',
        falaDerrota: 'Você não piscou de novo. Vou contar pra minha irmã. Ela vai gostar.',
      },
      falas: [
        { se: 'venceu_revanche_solano', batalha: true, linhas: ['Voltou com o sol? Então ele nasceu duas vezes hoje.'] },
        { batalha: true, linhas: ['Desci do pico antes do sol. Quero lutar enquanto a luz ainda é nova.'] },
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
    { tx: 36, ty: 30, para: 'romariaCirculo',   destino: { tx: 8,  ty: 9,  dir: 'cima' } },
    { tx: 0,  ty: 33, para: 'remansoNorato',    destino: { tx: 22, ty: 7,  dir: 'esq' } },
  ],

  cenario: 'cidade',
  /* a primeira chegada à praça, de balão ou a pé: o Porteiro conta do
     Anhangá, e os oito donos de terreiro vieram ver. Uma vez só */
  aoChegar: {
    quem: 'PORTEIRO', se: 'medalha:aurora', seNao: 'viu_cut_circulo', cutscene: 'circulo',
    linhas: ['Oito medalhas! Faz vinte anos que eu não abro este portão pra ninguém.'],
  },
};
