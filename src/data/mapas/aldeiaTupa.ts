/* Aldeia Tupã — o eixo da quinta região, e o primeiro que se abre para os
   TRÊS lados: a Campina dos Raios a oeste, o Charco Relampejante a leste e
   o Morro do Trovão ao norte, cada um por uma estrada. Loja, benzimento (o
   abrigo da região), a casa do Pajé e o pátio do Terreiro do Trovão.
   O Zeca aparece pela quinta vez, agora guardando a subida para o Morro.
   O pátio do terreiro é fechado nas laterais (colunas 7 e 15, linhas 9-12):
   a guia de cinco contas é o único jeito de chegar até a porta, igual em
   toda região anterior.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore (parede)   .  grama (chão)    =  estrada
     ,  mato alto (encontro)    o  pedra    f  flores    R  rocha         */
import type { DefMapa } from '../../world/tilemap.ts';

export const aldeiaTupa: DefMapa = {
  id: 'aldeiaTupa',
  nome: 'ALDEIA TUPÃ',

  chao: [
    '###########################..###########################', // 0
    '#..........................==..........................#', // 1
    '#..........................==..........................#', // 2
    '#..o................ff.....==..........................#', // 3
    '#.....................f....==..,,,,,...................#', // 4
    '#..........................==..,,,,,...................#', // 5
    '#..........................==..,,,,,...................#', // 6
    '#..........................==..,,,,,...................#', // 7
    '#..........................==..,,,,,...................#', // 8
    '#......#.......#...........==..,,,,,....=......=.......#', // 9
    '#......#.......#...........==..,,,,,....=......=.......#', // 10
    '#......#.......#...........==..,,,,,....=......=.......#', // 11
    '#......#.......#...........==...........=.,,,,.=..,,,,.#', // 12
    '#..........=...............==...........=.,,,,.=..,,,,.#', // 13
    '#..........=...............==...........=.,,,,.=..,,,,.#', // 14
    '#.,,,,,....=............ff.==...........=.,,,,.=..,,,,.#', // 15
    '#.,,,,,....=...............==...........=.,,,,.=..,,,,.#', // 16
    '#.,,,,,....=...............==.....o.....=......=.......#', // 17
    '#.,,,,,....=...............==...........=......=.......#', // 18
    '#..........=...............==...........=......=.......#', // 19
    '.======================================================.', // 20
    '.======================================================.', // 21
    '#......................................................#', // 22
    '#......................................................#', // 23
    '#......................................................#', // 24
    '#.....................o.....................,,,,,,,,,,.#', // 25
    '#...........ff....................ff........,,,,,,,,,,.#', // 26
    '#.................................f.........,,,,,,,,,,.#', // 27
    '#...........................................,,,,,,,,,,.#', // 28
    '#...........................................,,,,,,,,,,.#', // 29
    '#.,,,,,,,,,.................................,,,,,,,,,,.#', // 30
    '#.,,,,,,,,,.........,,,,,,,,,,,,............,,,,,,,,,,.#', // 31
    '#.,,,,,,,,,.........,,,,,,,,,,,,.......................#', // 32
    '#.,,,,,,,,,.........,,,,,,,,,,,,.......................#', // 33
    '#.,,,,,,,,,.........,,,,,,,,,,,,.......................#', // 34
    '#.,,,,,,,,,.........,,,,,,,,,,,,................RRR.RRR#', // 35
    '#.,,,,,,,,,.........,,,,,,,,,,,,..............o.R......#', // 36
    '#.,,,,,,,,,.........,,,,,,,,,,,,................R......#', // 37
    '#...............................................R......#', // 38
    '#.......o.......................................R......#', // 39
    '#...............................................R......#', // 40
    '########################################################', // 41
  ],

  objetos: [
    { tipo: 'terreiro',    tx: 8,  ty: 4,  larg: 7, alt: 5 },              // porta (11,8)
    { tipo: 'portao',      tx: 8,  ty: 12, larg: 7, terreiro: 'raio' },
    { tipo: 'loja',        tx: 38, ty: 5,  larg: 5, alt: 4 },              // porta (40,8)
    { tipo: 'benzimento',  tx: 45, ty: 5,  larg: 5, alt: 4 },              // porta (47,8)
    { tipo: 'casa',        tx: 38, ty: 23, larg: 5, alt: 4 },              // porta (40,26), o Pajé
    { tipo: 'casa',        tx: 15, ty: 23, larg: 5, alt: 4, trancada: true },
    { tipo: 'placa', tx: 16, ty: 12,
      placa: 'TERREIRO DO TROVÃO, do Guaraci. A guia abre com cinco contas acesas.' },
    { tipo: 'placa', tx: 25, ty: 22,
      placa: 'ALDEIA TUPÃ. Oeste: Campina dos Raios. Leste: Charco Relampejante. Norte: Morro do Trovão.' },
    { tipo: 'placa', tx: 43, ty: 26,
      placa: 'CASA DO PAJÉ. Quem acha pedra-de-raio traz pra cá.' },
    /* a tranca do Zeca, pela quinta vez: some no instante em que ele perde */
    { tipo: 'barreira', tx: 27, ty: 0, larg: 2, seNao: 'venceu_zeca5' },

    /* a terceira pedra-de-raio, no canto nordeste da aldeia */
    { tipo: 'achado', tx: 53, ty: 2, solido: false, placa: 'PEDRA-DE-RAIO',
      se: 'achou_pedra_raio_3', vazio: true,
      falas: [{ linhas: ['Só ficou a marca queimada no chão.'] }] },
    { tipo: 'achado', tx: 53, ty: 2, solido: false, placa: 'PEDRA-DE-RAIO',
      seNao: 'achou_pedra_raio_3',
      falas: [{ liga: 'achou_pedra_raio_3', da: { item: 'pedra_raio' }, linhas: [
        'Caída do lado de fora do muro, onde o raio bateu na última chuva: uma PEDRA-DE-RAIO.'] }] },

    /* a primeira pena de trovão — serviço opcional da Tecelã */
    { tipo: 'achado', tx: 2, ty: 40, solido: false, placa: 'PENA DE TROVÃO',
      se: 'achou_pena_trovao_aldeia', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 2, ty: 40, solido: false, placa: 'PENA DE TROVÃO',
      seNao: 'achou_pena_trovao_aldeia',
      falas: [{ liga: 'achou_pena_trovao_aldeia', da: { item: 'pena_trovao' }, linhas: [
        'Presa na cerca do canto, arrepiada de tempestade: uma PENA DE TROVÃO.',
        'A Tecelã da aldeia procura as três.'] }] },

    /* bolso do Dom Faísca no canto sudeste */
    { tipo: 'pedraRachada', tx: 51, ty: 35, larg: 1, seNao: 'dom_faisca' },
    { tipo: 'achado', tx: 53, ty: 39, solido: false, placa: 'ESCONDERIJO',
      se: 'achou_esconderijo_aldeia', vazio: true,
      falas: [{ linhas: ['O esconderijo está vazio agora.'] }] },
    { tipo: 'achado', tx: 53, ty: 39, solido: false, placa: 'ESCONDERIJO',
      seNao: 'achou_esconderijo_aldeia',
      falas: [{ liga: 'achou_esconderijo_aldeia', da: { item: 'agua_benta' }, linhas: [
        'Atrás da pedra partida, uma cabaça fechada com cera: ÁGUA BENTA.',
        'Ninguém alcançava esse canto antes do Dom Faísca.'] }] },
  ],

  npcs: [
    {
      id: 'zeca5', nome: 'ZECA', estilo: 'zeca',
      tx: 27, ty: 2, dir: 'baixo',
      treinador: {
        classe: 'MOLEQUE DA VILA', visao: 5, premio: 2600,
        liga: 'conta_zeca5',
        time: [{ especie: 'relampo', nivel: 47 }, { especie: 'saci', nivel: 48 },
               { especie: 'cabraCabriola', nivel: 48 }, { especie: 'tatuTrovao', nivel: 48 },
               { especie: 'curupira', nivel: 49 }],
        falaInicio: 'Cinco regiões, {crianca}. Cinco vezes eu te espero no caminho. Hoje eu trouxe cinco.',
        falaDerrota: 'Cinco a zero. Tá bom, tá bom — o morro é seu. Mas eu volto.',
        esperta: true, itens: { garrafada_forte: 2, erva_doce: 1 },
      },
      falas: [
        { se: 'venceu_zeca5', linhas: [
          'O Morro do Trovão é logo ali em cima. Dizem que no cume mora um Relampo que ninguém prende.'] },
        { batalha: true, linhas: [
          'Foz, mata, serra, campo, e agora aqui. Se eu ganhar uma vez, uma só, já valeu a viagem.'] },
      ],
    },
    {
      id: 'tecela', nome: 'TECELÃ', estilo: 'firmina',
      tx: 30, ty: 25, dir: 'baixo',
      falas: [
        { se: 'servico_penas_trovao', linhas: [
          'A rede de penas ficou pronta. Pendurei no alto da aldeia, pra chamar a chuva certa.'] },
        /* serviço opcional: não trava guia nenhuma, mas paga bem */
        { se: 'item:pena_trovao>=3', pede: { item: 'pena_trovao', n: 3 }, liga: 'servico_penas_trovao',
          paga: 3500, da: { item: 'patua_mestre', n: 3 }, linhas: [
          'As TRÊS penas de trovão! Com elas eu fecho a rede de chamar chuva.',
          'Toma o que eu tenho de melhor guardado, e o dinheiro que a aldeia separou.',
          'E escuta: quando a chuva vier, olha pra trás do casarão do charco. Tem coisa que só aparece depois.'] },
        { linhas: [
          'Três penas de trovão caíram pela região: uma aqui na aldeia, uma no charco, uma lá no morro.',
          'Me traz as três e eu te pago bem. Pena de trovão arrepia sozinha — é fácil de reconhecer.'] },
      ],
    },
    {
      id: 'menino_tupa', nome: 'MENINO', estilo: 'crianca',
      tx: 22, ty: 18, dir: 'dir',
      falas: [
        { se: 'dom_faisca', linhas: [
          'Com o Dom Faísca dá pra partir pedra rachada! Tem uma aqui na aldeia, no canto de baixo.'] },
        { linhas: [
          'Aqui é tão largo que eu nunca fui até o fim da campina. Nem do charco. Nem do morro.',
          'O Pajé diz que o raio escolhe onde cai. Por isso ele junta as pedras que o raio deixa.'] },
      ],
    },
  ],

  inicio: { tx: 1, ty: 20, dir: 'dir' },

  saidas: [
    { tx: 0,  ty: 20, para: 'campinaDosRaios',    destino: { tx: 62, ty: 16, dir: 'esq' } },
    { tx: 0,  ty: 21, para: 'campinaDosRaios',    destino: { tx: 62, ty: 17, dir: 'esq' } },
    { tx: 55, ty: 20, para: 'charcoRelampejante', destino: { tx: 1,  ty: 20, dir: 'dir' } },
    { tx: 55, ty: 21, para: 'charcoRelampejante', destino: { tx: 1,  ty: 21, dir: 'dir' } },
    { tx: 27, ty: 0,  para: 'morroDoTrovao',      destino: { tx: 27, ty: 38, dir: 'cima' } },
    { tx: 28, ty: 0,  para: 'morroDoTrovao',      destino: { tx: 28, ty: 38, dir: 'cima' } },
    { tx: 11, ty: 8,  para: 'terreiroTrovao',     destino: { tx: 14, ty: 21, dir: 'cima' } },
    { tx: 40, ty: 8,  para: 'lojaTupa',           destino: { tx: 7,  ty: 8,  dir: 'cima' } },
    { tx: 47, ty: 8,  para: 'benzimentoTupa',     destino: { tx: 7,  ty: 8,  dir: 'cima' } },
    { tx: 40, ty: 26, para: 'casaPaje',           destino: { tx: 7,  ty: 8,  dir: 'cima' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 12,
  encontros: [
    { especie: 'faisquinha', min: 44, max: 46, peso: 45 },
    { especie: 'tatuTrovao', min: 44, max: 46, peso: 30 },
    { especie: 'saci', min: 44, max: 46, peso: 25 },
  ],
};
