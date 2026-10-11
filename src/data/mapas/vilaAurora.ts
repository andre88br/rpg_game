/* Vila do Sossego — onde a trilha começa.
   Grade editável à mão, um caractere por tile de 16x16:
     .  grama          ,  mato alto (encontros)   =  caminho de terra
     a  areia          ~  água (intransponível)   p  cais de madeira
     #  árvore         o  pedra                   f  flores
     _  piso           W  parede interna          T  tapete                */
import type { DefMapa } from '../../world/tilemap.ts';

export const vilaAurora: DefMapa = {
  id: 'vilaAurora',
  nome: 'VILA DO SOSSEGO',

  chao: [
    '##############################',
    '##############################',
    '#.f........................f.#',
    '#............................#',
    '#............................#',
    '#............................#',
    '#..#..=.......=........=.#...#',
    '#.....=.f.....=....f...=.....#',
    '#.==========================.#',
    '#.==========================.#',
    '#............==..............#',
    '#.,,,,.......==....o.........#',
    '#.,,,,.......==....,,,,,.....#',
    '#.,,,,.......==....,,,,,..o..#',
    '#.,,,,.......==....,,,,,.....#',
    '#.,,,,.......==....,,,,,.....#',
    '#..~~~~~~....==....,,,,,.....#',
    '#.~~~~~~~~...==..............#',
    '#.~~~~~~~~...==..........o...#',
    '#.~~~~~~~~...==..............#',
    '#.~~~~~~~~...==...f..........#',
    '#..~~~~~~....==...........#..#',
    '#.....f......==.........f....#',
    '#...o........==......#.......#',
    '#............==..............#',
    '#############==###############',
  ],

  objetos: [
    // a porta cai sempre no meio de um TILE: é nela que a saída do mapa mora
    { tipo: 'casa', tx: 4,  ty: 3, larg: 4, alt: 3 },                    // porta (6,5)
    { tipo: 'casa', tx: 12, ty: 2, larg: 5, alt: 4 },                    // porta (14,5)
    { tipo: 'casa', tx: 21, ty: 3, larg: 4, alt: 3, trancada: true },    // ninguém em casa
    { tipo: 'placa', tx: 12, ty: 23,
      placa: 'VILA DO SOSSEGO. Ao sul, a Rota da Foz leva a Porto Iara.' },
    { tipo: 'placa', tx: 17, ty: 5,
      placa: 'CASA DA DONA FIRMINA. Quem quer o primeiro patuá, pode entrar.' },
    { tipo: 'placa', tx: 10, ty: 10,
      placa: 'Mato alto: é onde os Encantados se escondem. Ande devagar.' },
  ],

  npcs: [
    {
      id: 'vizinho', nome: 'SEU ANASTÁCIO', estilo: 'aldeao',
      tx: 19, ty: 7, dir: 'baixo',
      falas: [
        { se: 'campeao', linhas: [
          'Eu dizia que ia contar da Medalha Maré até morrer. Agora vou ter que contar do Círculo inteiro!'] },
        { se: 'medalha:mare', linhas: [
          'Vou contar isso até morrer: {crianca} da Vila do Sossego com a Medalha Maré!'] },
        { se: 'item:carta', linhas: [
          'Carta na mão e cara de pressa. Desce a estrada, {crianca}, que o porto não anda até aqui.',
          'A saída da vila é lá embaixo, no fim da estrada do meio. Depois é só seguir a Rota da Foz até o mar.'] },
        { se: 'escolheu_inicial', linhas: [
          'Já pegou o patuá, então. Agora é só não voltar antes de valer a pena.'] },
        { linhas: [
          'A Dona Firmina mora ali no meio, a casa de telhado grande.',
          'Ela é quem entrega o primeiro Encantado da gente. Vai lá falar com ela.'] },
      ],
    },
    {
      id: 'menina', nome: 'MENINA', estilo: 'crianca',
      tx: 8, ty: 11, dir: 'dir',
      falas: [
        { se: 'campeao', linhas: [
          'Meu irmão voltou da Rota da Foz! Disse que viu você passar de balão, lá no alto.'] },
        { se: 'venceu_zeca', linhas: [
          'Então foi você que ganhou do Zeca? Ele vai ficar uma semana sem falar nisso.'] },
        { linhas: ['Meu irmão desceu pra Rota da Foz e não voltou. Aposto que perdeu a luta de novo.'] },
      ],
    },
    {
      id: 'velha', nome: 'DONA BENTA', estilo: 'aldeao',
      tx: 22, ty: 9, dir: 'baixo',
      falas: [
        { se: 'campeao', linhas: [
          'Oito guias, quarenta contas acesas. Nunca pensei que ia ver isso, criança.',
          'Hoje a água entra no terreiro da Dona Mariana sozinha, com a maré. Como no tempo da minha avó.'] },
        { se: 'contas>=5', linhas: [
          'Cinco contas acesas! Então a guia se abriu e a Dona Mariana já está te esperando.'] },
        { se: 'contas>=1', linhas: [
          'Já são {contas} contas acesas, criança. Faltam {faltam}.',
          'A próxima, pelo que me contam: {servico}.'] },
        { linhas: [
          'Em Porto Iara tem terreiro, criança. Mas o portão está fechado com uma guia de cinco contas.',
          'Cada conta acende com um serviço bem feito. Cinco serviços, cinco contas, e o terreiro se abre.'] },
      ],
    },
    /* depois do campeonato, o rival e o pai voltam a morar na vila */
    {
      id: 'zeca_casa', nome: 'ZECA', estilo: 'zeca',
      tx: 16, ty: 11, dir: 'esq', se: 'campeao',
      falas: [
        { linhas: [
          'Nove a zero não é placar, {crianca}: é aviso. No ano que vem eu volto pro Círculo.',
          'Enquanto isso, eu pesco com meu pai de madrugada. O Saci vai junto, e espanta todo peixe.'] },
      ],
    },
    {
      id: 'tonho', nome: 'SEU TONHO', estilo: 'tonho',
      tx: 17, ty: 11, dir: 'esq', se: 'campeao',
      falas: [
        /* o dono do Patuá de Mestre do pote do açude */
        { se: 'achou_pote', linhas: [
          'Achou um pote de barro na ilhota do açude? Era meu! Escondi lá com a idade do Zeca.',
          'Foi no dia que eu desisti da trilha. Pensei que um dia eu voltava pra buscar.',
          'Fica com ele. Patuá parado na lama não prende bicho nenhum.'] },
        { linhas: [
          'Pesco de madrugada com o Mestre do Porto. Peixe pouco, rio vivo, e o moleque do lado.',
          'Ah: se um dia você achar um pote de barro na ilhota do açude, na Rota da Foz, era meu. Pode ficar.'] },
      ],
    },
  ],

  inicio: { tx: 6, ty: 6, dir: 'baixo' },

  saidas: [
    { tx: 6,  ty: 5,  para: 'casaTaina',   destino: { tx: 5, ty: 7, dir: 'cima' } },
    { tx: 14, ty: 5,  para: 'casaFirmina', destino: { tx: 6, ty: 8, dir: 'cima' } },
    { tx: 13, ty: 25, para: 'rotaFoz',     destino: { tx: 13, ty: 1, dir: 'baixo' } },
    { tx: 14, ty: 25, para: 'rotaFoz',     destino: { tx: 14, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  /* a volta para casa, depois do campeonato: a vila em festa, a mãe, a
     Firmina, o Zeca e o Seu Tonho. Uma vez só */
  aoChegar: {
    quem: 'MÃE', se: 'campeao', seNao: 'viu_cut_volta_casa', cutscene: 'volta_casa',
    linhas: ['{nome}! Gente, corre aqui, que chegou!'],
  },
  passosPorEncontro: 10,
  /* o mato da vila é quintal de gente: bicho pequeno e manso, nível baixo */
  encontros: [
    { especie: 'piragua', min: 2, max: 4, peso: 45 },
    { especie: 'caiporinha', min: 2, max: 4, peso: 40 },
    { especie: 'sacizinho', min: 3, max: 4, peso: 15 },
  ],
};
