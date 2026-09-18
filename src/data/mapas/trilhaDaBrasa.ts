/* Trilha da Brasa — a subida da Mata do Curupira até a Vila Fornalha.
   Quatro tropeiros em fila, cada um trancando o trecho seguinte com uma
   tranca própria: não dá para contornar nenhum, porque cada banda da trilha
   só tem UMA saída, e ela é a tranca do próximo. É a primeira conta da guia
   de fogo: vencer os quatro, sem benzimento nenhum no caminho.
   A gride é editável à mão, um caractere por tile de 16x16:
     R  rocha (parede e tranca)   c  cinza batida (chão)
     n  capim seco (encontros)    o  pedra (obstáculo solto)                */
import type { DefMapa } from '../../world/tilemap.ts';

export const trilhaDaBrasa: DefMapa = {
  id: 'trilhaDaBrasa',
  nome: 'TRILHA DA BRASA',

  chao: [
    'RRRRRRRRRRRRRRccRRRRRRRRRRRRRR',
    'RccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccR',
    'RccoccccccnnnnnnnnnncccccccccR',
    'RcccccccccnnnnnnnnnncccccccccR',
    'RcccccccccnnnnnnnnnnccccccoccR',
    'RcccccccccnnnnnnnnnncccccccccR',
    'RccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccR',
    'RRRRRRccRRRRRRRRRRRRRRRRRRRRRR',
    'RccccccccccccccccccccccccccccR',
    'RcccnnnnnnnncccccccccccccccccR',
    'RcccnnnnonnncccccccccccccccccR',
    'RcccnnnnnnnnccccccccccccoccccR',
    'RcccnnnnnnnncccccccccccccccccR',
    'RccccccccccccccccccccccccccccR',
    'RRRRRRRRRRRRRRRRRRRRRRccRRRRRR',
    'RccccccccccccccccccccccccccccR',
    'RcccccccccccccccnnnnnnnnnncccR',
    'RcccocccccccccccnnnnnnnnnncccR',
    'RcccccccccccccccnnnnonnnnncccR',
    'RcccccccccccccccnnnnnnnnnncccR',
    'RccccccccccccccccccccccccccccR',
    'RRRRRRccRRRRRRRRRRRRRRRRRRRRRR',
    'RccccccccccccccccccccccccccccR',
    'RcccccccccnnnnnnnnnncccccccccR',
    'RcccccccccnnnonnnnnncccccccccR',
    'RcccccccccnnnnnnnnnncccccocccR',
    'RcccccccccnnnnnnnnnncccccccccR',
    'RccccccccccccccccccccccccccccR',
    'RRRRccRRRRRRRRRRRRRRRRRRRRRRRR',
  ],

  objetos: [
    { tipo: 'placa', tx: 17, ty: 1,
      placa: 'TRILHA DA BRASA. A subida da mata para a Serra Boitatá.' },
    /* as quatro trancas: cada uma some quando o tropeiro dela cai */
    { tipo: 'barreira', tx: 6,  ty: 10, larg: 2, seNao: 'venceu_tropeiro1' },
    { tipo: 'barreira', tx: 22, ty: 17, larg: 2, seNao: 'venceu_tropeiro2' },
    { tipo: 'barreira', tx: 6,  ty: 24, larg: 2, seNao: 'venceu_tropeiro3' },
    { tipo: 'barreira', tx: 4,  ty: 31, larg: 2, seNao: 'venceu_chefe_tropa' },
    { tipo: 'placa', tx: 8, ty: 29,
      placa: 'Sem benzimento por aqui: quem apagar volta pra Mata do Curupira.' },

    /* um dos três sinos de bronze da capela — serviço opcional da região */
    { tipo: 'achado', tx: 26, ty: 12, solido: false, placa: 'SINO DE BRONZE',
      se: 'achou_sino_trilha', vazio: true,
      falas: [{ linhas: ['O caco de barro está vazio agora.'] }] },
    { tipo: 'achado', tx: 26, ty: 12, solido: false, placa: 'SINO DE BRONZE',
      seNao: 'achou_sino_trilha',
      falas: [{ liga: 'achou_sino_trilha', da: { item: 'sino' }, linhas: [
        'Meio enterrado na cinza da trilha: um SINO DE BRONZE, sem badalo.',
        'A capela da serra tinha três. Este é um deles.'] }] },
  ],

  npcs: [
    {
      id: 'tropeiro1', nome: 'TROPEIRO', estilo: 'aldeao',
      tx: 6, ty: 9, dir: 'cima',
      treinador: {
        classe: 'TROPEIRO', visao: 4, premio: 900, liga: 'conta_tropa_1',
        time: [{ especie: 'cabritinha', nivel: 24 }, { especie: 'sacizinho', nivel: 25 }],
        falaInicio: 'Ninguém sobe essa trilha sem provar que aguenta a subida.',
        falaDerrota: 'Tá bom, tá bom! Passa, mas não conta pros outros que eu caí fácil.',
      },
      falas: [
        { se: 'venceu_tropeiro1', linhas: [
          'Segue reto que os outros três estão te esperando lá na frente.'] },
        { batalha: true, linhas: [
          'Ó a pequena que quer subir a serra! Prova comigo primeiro.'] },
      ],
    },
    {
      id: 'tropeiro2', nome: 'ALMOCREVE', estilo: 'aldeao',
      tx: 22, ty: 16, dir: 'cima',
      treinador: {
        classe: 'ALMOCREVE', visao: 4, premio: 1000, liga: 'conta_tropa_2',
        time: [{ especie: 'mulinha', nivel: 26 }, { especie: 'caiporinha', nivel: 25 },
               { especie: 'cabritinha', nivel: 26 }],
        falaInicio: 'Passou do primeiro? Bom. Eu carrego carga mais pesada que time fraco.',
        falaDerrota: 'Carga entregue, discussão perdida. Vai andando.',
      },
      falas: [
        { se: 'venceu_tropeiro2', linhas: [
          'O terceiro fica bem depois da curva. Boa sorte com ele.'] },
        { batalha: true, linhas: [
          'Meio caminho da trilha, meio caminho da minha paciência. Vamos nessa.'] },
      ],
    },
    {
      id: 'tropeiro3', nome: 'TROPEIRA', estilo: 'aldeao',
      tx: 6, ty: 23, dir: 'cima',
      treinador: {
        classe: 'TROPEIRA', visao: 5, premio: 1100, liga: 'conta_tropa_3',
        time: [{ especie: 'boitatinha', nivel: 27 }, { especie: 'mulinha', nivel: 27 },
               { especie: 'cabritinha', nivel: 28 }],
        falaInicio: 'Três provaram a subida e nenhum me disse que eu era fraca. Sua vez.',
        falaDerrota: 'Bem jogado. O chefe da tropa está guardando a saída lá na frente — esse é osso duro.',
      },
      falas: [
        { se: 'venceu_tropeiro3', linhas: [
          'Só falta o chefe agora, no fim da trilha. Ele não facilita para ninguém.'] },
        { batalha: true, linhas: [
          'Você já derrubou dois. Vamos ver se derruba três.'] },
      ],
    },
    {
      id: 'chefe_tropa', nome: 'CHEFE DA TROPA', estilo: 'aldeao',
      tx: 4, ty: 29, dir: 'cima',
      treinador: {
        classe: 'CHEFE DA TROPA', visao: 5, premio: 2000, liga: 'conta_tropa',
        time: [{ especie: 'cabritinha', nivel: 29 }, { especie: 'mulinha', nivel: 29 },
               { especie: 'boitatinha', nivel: 29 }, { especie: 'boitatao', nivel: 31 }],
        falaInicio: 'Três tropeiros vencidos e ainda de pé? Então prove com o chefe da tropa.',
        falaDerrota: 'Ninguém tinha chegado tão longe. Pode subir pra Vila Fornalha, {crianca}.',
        esperta: true, itens: { garrafada_forte: 2 },
      },
      falas: [
        { se: 'venceu_chefe_tropa', linhas: [
          'A trilha é sua, {nome}. A Vila Fornalha fica bem ali na frente.'] },
        { batalha: true, linhas: [
          'Quatro tropeiros nessa trilha, e eu sou o último. Mostra o que você tem.'] },
      ],
    },
  ],

  inicio: { tx: 14, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 14, ty: 0, para: 'mataDoCurupira', destino: { tx: 2, ty: 15, dir: 'cima' } },
    { tx: 15, ty: 0, para: 'mataDoCurupira', destino: { tx: 3, ty: 15, dir: 'cima' } },
    { tx: 4,  ty: 31, para: 'vilaFornalha', destino: { tx: 16, ty: 1, dir: 'baixo' } },
    { tx: 5,  ty: 31, para: 'vilaFornalha', destino: { tx: 17, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 9,
  encontros: [
    { especie: 'cabritinha', min: 24, max: 27, peso: 50 },
    { especie: 'boitatinha', min: 24, max: 26, peso: 20 },
    { especie: 'sacizinho', min: 25, max: 27, peso: 18 },
    { especie: 'mulinha', min: 25, max: 27, peso: 12 },
  ],
};
