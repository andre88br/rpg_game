/* Casa da Dona Firmina — é aqui que se escolhe o inicial, entre os três
   patuás em cima da mesa comprida, e é daqui que sai a carta que acende a
   primeira conta da guia. */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaFirmina: DefMapa = {
  id: 'casaFirmina',
  nome: 'CASA DA DONA FIRMINA',
  interior: true,

  chao: [
    'WWWWWWWWWWWWW',
    'W___________W',
    'W___________W',
    'W___________W',
    'W__TTTTTTT__W',
    'W__TTTTTTT__W',
    'W__TTTTTTT__W',
    'W___________W',
    'W___________W',
    'W_____T_____W',
    'WWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'estante', tx: 1, ty: 1, larg: 3 },
    { tipo: 'estante', tx: 9, ty: 1, larg: 3 },
    { tipo: 'mesa',    tx: 4, ty: 2, larg: 5 },
    /* os três patuás da escolha, pousados na mesa até o jogador escolher */
    { tipo: 'patuas',  tx: 4, ty: 2, larg: 5, solido: false, seNao: 'escolheu_inicial' },
  ],

  npcs: [
    {
      id: 'firmina', nome: 'DONA FIRMINA', estilo: 'firmina',
      tx: 6, ty: 1, dir: 'baixo',
      falas: [
        /* nada antes do patuá: é ele que abre o jogo */
        { seNao: 'escolheu_inicial', escolher: true, linhas: [
          'Chegou na hora, criança. Três patuás em cima da mesa, e um deles é seu.',
          'Curupinho é teimoso de raiz, Boitatinha não esfria nunca, e Iarinha tem a água do rio inteiro.',
          'Chegue perto e escolha com calma. Escolha de patuá não se desfaz.'] },
        { se: 'conta_recado_mata', linhas: [
          'Fiquei sabendo que a carta chegou às mãos da Tiê. A Mata do Curupira já deve confiar em você.',
          'Vá com cuidado por lá, {crianca}. Mata funda tem dono, e o dono é de pé atrás.'] },
        { se: ['medalha:mare', 'item:carta_tie'], linhas: [
          'Essa carta ainda está na sua mochila, {crianca}? A Tiê deve estar esperando.',
          'Atravesse a água a nado e não pare no meio do caminho.'] },
        { se: 'medalha:mare', seNao: 'deu_carta_tie', liga: 'deu_carta_tie',
          da: { item: 'carta_tie' }, linhas: [
          'A Medalha Maré no peito e a Dona Mariana falando bem de você por aí.',
          'Mas a Região da Foz é só o começo, {crianca}. Do outro lado da água tem mata, e na mata tem gente.',
          'Uma amiga minha, a Tiê, cuida do Terreiro de Raiz por lá. Leve esta carta a ela.',
          'Agora vá: com o Dom de Nadar, a água não é mais parede nenhuma para você.'] },
        { se: 'medalha:mare', linhas: [
          'A Foz inteira é sua conhecida agora, {nome}. Vá em frente, que a mata está esperando.'] },
        { se: 'contas>=5', linhas: [
          'As cinco contas acesas! Então vá: a Dona Mariana está esperando no terreiro.'] },
        { se: 'conta_recado', linhas: [
          'O Mestre do Porto mandou agradecer. Disse que a carta chegou seca, apesar da maré.',
          'Uma conta acesa. Faltam quatro, e nenhuma delas se acende de graça.'] },
        { se: 'item:carta', linhas: [
          'A carta é para o MESTRE DO PORTO, lá no cais de Porto Iara.',
          'E não abra no caminho. Carta molhada e carta lida dão no mesmo: não servem.'] },
        { seNao: 'falou_firmina', liga: ['falou_firmina', 'tem_recado'],
          da: { item: 'carta' }, linhas: [
          'Agora um serviço, para o bicho aprender o caminho junto com você.',
          'Leve esta carta ao Mestre do Porto, em Porto Iara. É coisa de gente grande.',
          'Desce a Rota da Foz e não sai da estrada. O resto a gente resolve depois.'] },
        { linhas: [
          'A carta some no caminho? Pois então volte aqui que eu escrevo outra.',
          'Mas não me faça escrever duas vezes a mesma coisa, criança.'] },
      ],
    },
  ],

  inicio: { tx: 6, ty: 8, dir: 'cima' },

  saidas: [
    { tx: 6, ty: 9, para: 'vilaAurora', destino: { tx: 14, ty: 6, dir: 'baixo' } },
  ],
};
