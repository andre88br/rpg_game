/* =========================================================================
   Jardim dos Espelhos — o braço leste da Cidade do Sol, e a outra tarefa
   nova da região: o FEIXE DE LUZ (game/feixe.ts).

   Dentro da cerca viva, um disco de pedra na cerca oeste solta um feixe
   para a direita. Nove espelhos, cada um virado "/" ou "\\"; o A gira
   (o mesmo par de objetos das chaves de para-raio). O feixe anda em linha
   reta, dobra nos espelhos e para na pedra ou na cerca; chegando ao cristal
   da cerca leste, acende `conta_espelhos`.

   Achado por construção e conferido por força bruta sobre as 512
   combinações (mapas.test.ts refaz a busca a cada execução): a solução
   mais curta gira QUATRO espelhos, é a única desse tamanho, e os outros
   cinco espelhos são só para confundir.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const jardimEspelhos: DefMapa = {
  id: 'jardimEspelhos',
  nome: 'JARDIM DOS ESPELHOS',

  chao: [
    '############################################################', // 0
    '#..........................................................#', // 1
    '#..........................................................#', // 2
    '#..,,,,,,,,,,.................................,,,,,,,,,,,..#', // 3
    '#..,,,,,,,,,,.................................,,,,,,,,,,,..#', // 4
    '#..,,,,,,,,,,.................................,,,,,,,,,,,..#', // 5
    '#..,,,,,,,,,,.................................,,,,,,,,,,,..#', // 6
    '#..,,,,,,,,,,.................................,,,,,,,,,,,..#', // 7
    '#..,,,,,,,,,,.................................,,,,,,,,,,,..#', // 8
    '#.............................................,,,,,,,,,,,..#', // 9
    '#..........................................................#', // 10
    '#...............############################...............#', // 11
    '#.fffffff.......#..........................#....RRRR.RRRRRR#', // 12
    '#.fffffff.......#................o.........#....R..........#', // 13
    '#.fffffff.......#..........................#....R..........#', // 14
    '#.fffffff.......#...............................R..........#', // 15
    '#.fffffff.......#..o..........o............#....R..........#', // 16
    '#.fffffff.......#.........o................#....RRRRRRRRRRR#', // 17
    '#.fffffff.......#.......................o..#...............#', // 18
    '#...............#..........................#...............#', // 19
    '..................................o........#...............#', // 20
    '................#..........................#...............#', // 21
    '#...............#..............o...........#...............#', // 22
    '#...............#......o...................#...............#', // 23
    '#...............#........................o.#...............#', // 24
    '#...............#..........................#...............#', // 25
    '#...............#.......o.............o....#...............#', // 26
    '#...............#..........................#...............#', // 27
    '#...............#############..#############...............#', // 28
    '#..........................................................#', // 29
    '#..........................................................#', // 30
    '#..,,,,,,,,,,,,.............................,,,,,,,,,,,,,..#', // 31
    '#..,,,,,,,,,,,,.............................,,,,,,,,,,,,,..#', // 32
    '#..,,,,,,,,,,,,.............................,,,,,,,,,,,,,..#', // 33
    '#..,,,,,,,,,,,,.............................,,,,,,,,,,,,,..#', // 34
    '#..,,,,,,,,,,,,.............................,,,,,,,,,,,,,..#', // 35
    '#..,,,,,,,,,,,,.............................,,,,,,,,,,,,,..#', // 36
    '#..,,,,,,,,,,,,.............................,,,,,,,,,,,,,..#', // 37
    '#..........................................................#', // 38
    '############################################################', // 39
  ],

  feixe: { flag: 'conta_espelhos' },

  objetos: [
    { tipo: 'placa', tx: 28, ty: 29,
      placa: 'JARDIM DOS ESPELHOS. Gire os espelhos até o feixe do sol chegar ao cristal.' },
    { tipo: 'fonteLuz', tx: 16, ty: 20, larg: 1, dir: 'dir' },
    { tipo: 'cristal', tx: 43, ty: 15, larg: 1, placa: 'CRISTAL', se: 'conta_espelhos',
      falas: [{ linhas: ['O cristal brilha de dentro para fora, cheio de sol.'] }] },
    { tipo: 'cristal', tx: 43, ty: 15, larg: 1, placa: 'CRISTAL', seNao: 'conta_espelhos', vazio: true,
      falas: [{ linhas: ['Um cristal fosco, esperando luz.'] }] },
    { tipo: 'espelho', tx: 21, ty: 20, larg: 1, placa: 'ESPELHO', inclinacao: '\\', seNao: 'espelho_1',
      falas: [{ liga: 'espelho_1', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 21, ty: 20, larg: 1, placa: 'ESPELHO', inclinacao: '/', se: 'espelho_1',
      falas: [{ desliga: 'espelho_1', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 21, ty: 14, larg: 1, placa: 'ESPELHO', inclinacao: '\\', seNao: 'espelho_2',
      falas: [{ liga: 'espelho_2', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 21, ty: 14, larg: 1, placa: 'ESPELHO', inclinacao: '/', se: 'espelho_2',
      falas: [{ desliga: 'espelho_2', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 28, ty: 14, larg: 1, placa: 'ESPELHO', inclinacao: '/', seNao: 'espelho_3',
      falas: [{ liga: 'espelho_3', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 28, ty: 14, larg: 1, placa: 'ESPELHO', inclinacao: '\\', se: 'espelho_3',
      falas: [{ desliga: 'espelho_3', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 28, ty: 24, larg: 1, placa: 'ESPELHO', inclinacao: '\\', seNao: 'espelho_4',
      falas: [{ liga: 'espelho_4', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 28, ty: 24, larg: 1, placa: 'ESPELHO', inclinacao: '/', se: 'espelho_4',
      falas: [{ desliga: 'espelho_4', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 36, ty: 24, larg: 1, placa: 'ESPELHO', inclinacao: '\\', seNao: 'espelho_5',
      falas: [{ liga: 'espelho_5', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 36, ty: 24, larg: 1, placa: 'ESPELHO', inclinacao: '/', se: 'espelho_5',
      falas: [{ desliga: 'espelho_5', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 36, ty: 15, larg: 1, placa: 'ESPELHO', inclinacao: '/', seNao: 'espelho_6',
      falas: [{ liga: 'espelho_6', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 36, ty: 15, larg: 1, placa: 'ESPELHO', inclinacao: '\\', se: 'espelho_6',
      falas: [{ desliga: 'espelho_6', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 25, ty: 20, larg: 1, placa: 'ESPELHO', inclinacao: '/', seNao: 'espelho_7',
      falas: [{ liga: 'espelho_7', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 25, ty: 20, larg: 1, placa: 'ESPELHO', inclinacao: '\\', se: 'espelho_7',
      falas: [{ desliga: 'espelho_7', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 32, ty: 18, larg: 1, placa: 'ESPELHO', inclinacao: '\\', seNao: 'espelho_8',
      falas: [{ liga: 'espelho_8', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 32, ty: 18, larg: 1, placa: 'ESPELHO', inclinacao: '/', se: 'espelho_8',
      falas: [{ desliga: 'espelho_8', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 39, ty: 21, larg: 1, placa: 'ESPELHO', inclinacao: '/', seNao: 'espelho_9',
      falas: [{ liga: 'espelho_9', linhas: ['Você gira o espelho. O feixe muda de caminho.'] }] },
    { tipo: 'espelho', tx: 39, ty: 21, larg: 1, placa: 'ESPELHO', inclinacao: '\\', se: 'espelho_9',
      falas: [{ desliga: 'espelho_9', linhas: ['Você gira o espelho de volta. O feixe muda de caminho.'] }] },

    { tipo: 'enterrado', tx: 5, ty: 25, placa: 'BURACO', se: 'cavou_cristal_jardim', vazio: true,
      falas: [{ linhas: ['Já se cavou aqui. Só sobrou o buraco.'] }] },
    { tipo: 'enterrado', tx: 5, ty: 25, placa: 'CAVANDO', seNao: 'cavou_cristal_jardim',
      falas: [{ se: 'item:forquilha', liga: 'cavou_cristal_jardim', da: { item: 'cristal_solar' }, linhas: [
        'A forquilha puxa com força. Você cava com as mãos...',
        'Entre as raízes das flores, ainda quente: um CRISTAL SOLAR.'] }] },
    /* bolso do Dom Prisma */
    { tipo: 'cortinaLuz', tx: 52, ty: 12, larg: 1, seNao: 'dom_prisma' },
    { tipo: 'achado', tx: 56, ty: 14, solido: false, placa: 'ESCONDERIJO', se: 'achou_esconderijo_jardim', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 56, ty: 14, solido: false, placa: 'ESCONDERIJO', seNao: 'achou_esconderijo_jardim',
      falas: [{ liga: 'achou_esconderijo_jardim', da: { item: 'patua_mestre', n: 2 }, linhas: [
        'Atrás da cortina de luz, um estojo de vidro: dois PATUÁ DE MESTRE.',
        'Ninguém atravessava aquela luz antes do Dom Prisma.'] }] },
  ],

  npcs: [
    {
      id: 'jardineiro1', nome: 'JARDINEIRO', estilo: 'aldeao',
      tx: 10, ty: 21, dir: 'dir',
      treinador: {
        classe: 'JARDINEIRO DO SOL', visao: 4, premio: 3800,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'lamparina', nivel: 58 }, { especie: 'curupira', nivel: 58 }, { especie: 'estrelaDalva', nivel: 59 }],
        falaInicio: 'Mexeu nos meus espelhos? Então mexe comigo também.',
        falaDerrota: 'Tá bom. Mas deixa os espelhos do jeito que achou... ou não.',
      },
      falas: [
        { se: 'venceu_jardineiro1', linhas: ['O feixe sempre dobra em ângulo reto. Pensa de trás pra frente, do cristal até a fonte.'] },
        { batalha: true, linhas: ['Mexeu nos meus espelhos? Então mexe comigo também.'] },
      ],
    },
    {
      id: 'jardineira2', nome: 'JARDINEIRA', estilo: 'aldeao',
      tx: 50, ty: 24, dir: 'esq',
      treinador: {
        classe: 'JARDINEIRA DO SOL', visao: 4, premio: 4000,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'estrelaDalva', nivel: 59 }, { especie: 'arcoDaVelha', nivel: 58 }, { especie: 'lamparina', nivel: 59 }],
        falaInicio: 'O jardim fecha quando o sol se põe. Até lá, eu cuido dele.',
        falaDerrota: 'Cuida bem, então. Pode ficar.',
      },
      falas: [
        { se: 'venceu_jardineira2', linhas: ['Tem espelho aí que não serve pra nada. Nem todo espelho é caminho.'] },
        { batalha: true, linhas: ['O jardim fecha quando o sol se põe. Até lá, eu cuido dele.'] },
      ],
    },
  ],

  inicio: { tx: 1, ty: 20, dir: 'dir' },

  saidas: [
    { tx: 0, ty: 20, para: 'cidadeDoSol', destino: { tx: 54, ty: 20, dir: 'esq' } },
    { tx: 0, ty: 21, para: 'cidadeDoSol', destino: { tx: 54, ty: 21, dir: 'esq' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 11,
  encontros: [
    { especie: 'luzeiro', min: 58, max: 59, peso: 50 },
    { especie: 'lamparina', min: 58, max: 59, peso: 30 },
    { especie: 'estrelaDalva', min: 58, max: 59, peso: 20 },
  ],
};
