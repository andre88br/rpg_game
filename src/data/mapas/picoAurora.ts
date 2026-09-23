/* Pico da Aurora — o braço norte da Cidade do Sol, depois do Zeca pela
   oitava vez. Três cristas, cada uma com um vão só, alternando leste e
   oeste. No alto, a Estrela-d'Alva pousa antes do amanhecer — a última conta
   da guia (conta_estrela) — e, num cercado de pedra do canto nordeste, a
   Jaci desce para quem entregou os cristais solares e tem a Medalha Aurora.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore   R  rocha   .  grama   ,  mato   f  flores                  */
import type { DefMapa } from '../../world/tilemap.ts';

export const picoAurora: DefMapa = {
  id: 'picoAurora',
  nome: 'PICO DA AURORA',

  chao: [
    '##########################################################', // 0
    '#...........................................R............#', // 1
    '#.....fffffffff.............................R............#', // 2
    '#.....fffffffff.............................R............#', // 3
    '#.....fffffffff..........................................#', // 4
    '#.....fffffffff.............................R............#', // 5
    '#.....fffffffff.............................R............#', // 6
    '#...........................................RRRRRRRRRRRRR#', // 7
    '#........................................................#', // 8
    '#........................................................#', // 9
    '#RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR..RR#', // 10
    '#........................................................#', // 11
    '#.......,,,,,,,,,........................................#', // 12
    '#.......,,,,,,,,,.............,,,,,,,,,..................#', // 13
    '#.......,,,,,,,,,.............,,,,,,,,,..................#', // 14
    '#.......,,,,,,,,,.............,,,,,,,,,..................#', // 15
    '#.......,,,,,,,,,.............,,,,,,,,,..................#', // 16
    '#.......,,,,,,,,,.............,,,,,,,,,..................#', // 17
    '#.............................,,,,,,,,,..................#', // 18
    '#........................................................#', // 19
    '#R..RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#', // 20
    '#........................................................#', // 21
    '#.........,,,,,,,,,,,....................................#', // 22
    '#.........,,,,,,,,,,,...........,,,,,,,,,,,..............#', // 23
    '#.........,,,,,,,,,,,...........,,,,,,,,,,,..............#', // 24
    '#.........,,,,,,,,,,,...........,,,,,,,,,,,..............#', // 25
    '#.........,,,,,,,,,,,...........,,,,,,,,,,,..............#', // 26
    '#.........,,,,,,,,,,,...........,,,,,,,,,,,..............#', // 27
    '#...............................,,,,,,,,,,,..............#', // 28
    '#........................................................#', // 29
    '#RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR..RR#', // 30
    '#........................................................#', // 31
    '#...................................,,,,,,,,,,,..........#', // 32
    '#.......,,,,,,,,,...................,,,,,,,,,,,..........#', // 33
    '#.......,,,,,,,,,...................,,,,,,,,,,,..........#', // 34
    '#.......,,,,,,,,,...................,,,,,,,,,,,..........#', // 35
    '#.......,,,,,,,,,...................,,,,,,,,,,,..........#', // 36
    '#.......,,,,,,,,,...................,,,,,,,,,,,..........#', // 37
    '#........................................................#', // 38
    '###########################..#############################', // 39
  ],

  objetos: [
    { tipo: 'placa', tx: 25, ty: 37,
      placa: 'PICO DA AURORA. Lá em cima o sol nasce primeiro.' },
    { tipo: 'enterrado', tx: 50, ty: 36, placa: 'BURACO', se: 'cavou_cristal_pico', vazio: true,
      falas: [{ linhas: ['Já se cavou aqui. Só sobrou o buraco.'] }] },
    { tipo: 'enterrado', tx: 50, ty: 36, placa: 'CAVANDO', seNao: 'cavou_cristal_pico',
      falas: [{ se: 'item:forquilha', liga: 'cavou_cristal_pico', da: { item: 'cristal_solar' }, linhas: [
        'A forquilha puxa com força. Você cava com as mãos...',
        'No pé do pico, quente como pedra ao meio-dia: o terceiro CRISTAL SOLAR.'] }] },
  ],

  npcs: [
    {
      id: 'guia_pico1', nome: 'GUIA DO PICO', estilo: 'guarda',
      tx: 51, ty: 31, dir: 'esq',
      treinador: {
        classe: 'GUIA DO PICO', visao: 4, premio: 4000,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'estrelaDalva', nivel: 59 }, { especie: 'cabraCabriola', nivel: 59 },
               { especie: 'lamparina', nivel: 59 }],
        falaInicio: 'Subir o pico sem guia? Então me vence e vira seu próprio guia.',
        falaDerrota: 'Vira. A segunda crista abre do lado oeste.',
      },
      falas: [
        { se: 'venceu_guia_pico1', linhas: ['Cada crista abre do lado contrário da outra.'] },
        { batalha: true, linhas: ['Subir o pico sem guia? Então me vence e vira seu próprio guia.'] },
      ],
    },
    {
      id: 'guia_pico2', nome: 'GUIA DO PICO', estilo: 'guarda',
      tx: 4, ty: 21, dir: 'dir',
      treinador: {
        classe: 'GUIA DO PICO', visao: 4, premio: 4200,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'lobisomem', nivel: 59 }, { especie: 'estrelaDalva', nivel: 60 },
               { especie: 'mapinguari', nivel: 59 }],
        falaInicio: 'Metade do caminho. Daqui pra cima o ar é fino.',
        falaDerrota: 'Fôlego bom. A última crista abre no leste.',
      },
      falas: [
        { se: 'venceu_guia_pico2', linhas: ['A estrela pousa lá em cima antes do sol. Não perde.'] },
        { batalha: true, linhas: ['Metade do caminho. Daqui pra cima o ar é fino.'] },
      ],
    },
    {
      id: 'guia_pico3', nome: 'GUIA DO PICO', estilo: 'guarda',
      tx: 51, ty: 11, dir: 'esq',
      treinador: {
        classe: 'GUIA DO PICO', visao: 4, premio: 4400,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'estrelaDalva', nivel: 60 }, { especie: 'cuca', nivel: 60 },
               { especie: 'relampo', nivel: 60 }],
        falaInicio: 'Última crista antes do cume. Ninguém passa sem provar que merece ver o sol nascer.',
        falaDerrota: 'Merece. O cume é seu.',
      },
      falas: [
        { se: 'venceu_guia_pico3', linhas: ['Lá no cercado do canto, dizem, a lua desce de vez em quando.'] },
        { batalha: true, linhas: ['Última crista antes do cume. Ninguém passa sem provar que merece ver o sol nascer.'] },
      ],
    },
    {
      id: 'estrela_cume', nome: "ESTRELA-D'ALVA", estilo: 'bicho:estrelaDalva',
      tx: 30, ty: 4, dir: 'esq', seNao: 'conta_estrela',
      treinador: {
        classe: 'DONA DO CUME', selvagem: true, visao: 4, liga: 'conta_estrela',
        time: [{ especie: 'estrelaDalva', nivel: 60 }],
        falaInicio: 'O céu clareia antes da hora, e uma estrela desce até a altura dos seus olhos.',
      },
      falas: [
        { batalha: true, linhas: ['A última estrela da noite. Brilha como se não quisesse ir embora.'] },
      ],
    },
    {
      id: 'jaci_cume', nome: 'JACI', estilo: 'bicho:jaci',
      tx: 50, ty: 3, dir: 'baixo', seNao: 'servico_jaci',
      falas: [
        { se: ['servico_cristais', 'medalha:aurora'], liga: 'servico_jaci',
          encantado: { especie: 'jaci', nivel: 45 }, linhas: [
          'O cercado escurece de repente, e a lua desce até tocar a pedra — metade luz, metade sombra.',
          '— Quem guardou a luz do dia em cristal merece a noite também.',
          'A JACI desce do céu e vai com você.'] },
        { se: 'medalha:aurora', linhas: [
          'Uma meia-lua aparece no cercado e some antes de você piscar.',
          'A Joalheira disse: quem guarda a luz do dia, a Jaci vem ver.'] },
        { linhas: [
          'O cercado está claro demais para a hora. Tem alguma coisa esperando a noite aqui.'] },
      ],
    },
  ],

  inicio: { tx: 27, ty: 38, dir: 'cima' },

  saidas: [
    { tx: 27, ty: 39, para: 'cidadeDoSol', destino: { tx: 27, ty: 1, dir: 'baixo' } },
    { tx: 28, ty: 39, para: 'cidadeDoSol', destino: { tx: 28, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 9,
  encontros: [
    { especie: 'luzeiro', min: 58, max: 60, peso: 40 },
    { especie: 'estrelaDalva', min: 58, max: 60, peso: 25 },
    { especie: 'lamparina', min: 58, max: 60, peso: 25 },
    { especie: 'cabraCabriola', min: 58, max: 59, peso: 10 },
  ],
};
