/* Vila Fornalha — o eixo da Serra Boitatá: loja, benzimento (o único abrigo
   da região), forja do Ferreiro, e o pátio do Terreiro de Brasa. O Zeca
   tranca a passagem ao sul, para a Caverna do Boitatá, pela terceira vez.
   O pátio do terreiro é fechado nas laterais (colunas 12 e 20, linhas 8-11):
   a guia de sete contas — cinco obrigatórias, duas de serviço — é o único
   jeito de chegar até a porta, igual em Porto Iara e na Mata do Curupira.
   A gride é editável à mão, um caractere por tile de 16x16:
     c  cinza batida   n  capim seco (encontros)   o  pedra   #  parede do pátio  */
import type { DefMapa } from '../../world/tilemap.ts';

export const vilaFornalha: DefMapa = {
  id: 'vilaFornalha',
  nome: 'VILA FORNALHA',

  chao: [
    'RRRRRRRRRRRRRRRRccRRRRRRRRRRRRRRRR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccoccccccccccccccccccccccccccoccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'Rccccccccccc#ccccccc#ccccccccccccR',
    'Rccccccccccc#ccccccc#ccccccccccccR',
    'Rccccccccccc#ccccccc#ccccccccccccR',
    'Rccccccccccc#ccccccc#ccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccnnnnnnnncccccccccccnnnnnnnncccR',
    'RccnnnnnnnncccccccccccnnnnnnnncccR',
    'RccnnnnnnnncccccccccccnnnnnnnncccR',
    'RccnnnnnnnncccccccccccnnnnnnnncccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccoccccccccccccccccccccccoccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccnnnnnnnncccccccccccnnnnnnnncccR',
    'RccnnnnnnnncccccccccccnnnnnnnncccR',
    'RccnnnnnnnncccccccccccnnnnnnnncccR',
    'RccnnnnnnnncccccccccccnnnnnnnncccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RcccccccoccccccccccccccccocccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccccR',
    'RRRRRRRRRRRRRRRRccRRRRRRRRRRRRRRRR',
  ],

  objetos: [
    { tipo: 'terreiro',    tx: 13, ty: 3,  larg: 7, alt: 5 },              // porta (16,7)
    { tipo: 'portao',      tx: 13, ty: 11, larg: 7, terreiro: 'fogo' },
    { tipo: 'loja',        tx: 3,  ty: 18, larg: 5, alt: 4 },              // porta (5,21)
    { tipo: 'benzimento',  tx: 26, ty: 18, larg: 5, alt: 4 },              // porta (28,21)
    { tipo: 'forja',       tx: 3,  ty: 26, larg: 5, alt: 4 },              // porta (5,29)
    { tipo: 'placa', tx: 19, ty: 1,
      placa: 'VILA FORNALHA. O terreiro fica ao norte; a caverna, ao sul.' },
    { tipo: 'placa', tx: 20, ty: 12,
      placa: 'TERREIRO DE BRASA, do Brás. A guia abre com cinco contas acesas.' },
    /* a tranca do Zeca, pela terceira vez: some no instante em que ele perde */
    { tipo: 'barreira', tx: 16, ty: 33, larg: 2, seNao: 'venceu_zeca3' },
    { tipo: 'placa', tx: 19, ty: 31,
      placa: 'Ao sul, a Caverna do Boitatá. Leve luz — lá dentro não se vê nada.' },

    /* o terceiro sino, no canto do largo — serviço opcional da região */
    { tipo: 'achado', tx: 30, ty: 5, solido: false, placa: 'SINO DE BRONZE',
      se: 'achou_sino_vila', vazio: true,
      falas: [{ linhas: ['O caco de barro está vazio agora.'] }] },
    { tipo: 'achado', tx: 30, ty: 5, solido: false, placa: 'SINO DE BRONZE',
      seNao: 'achou_sino_vila',
      falas: [{ liga: 'achou_sino_vila', da: { item: 'sino' }, linhas: [
        'Atrás de um monte de escória, esquecido: um SINO DE BRONZE, sem badalo.',
        'O sineiro da vila fala dos três sinos até hoje.'] }] },
  ],

  npcs: [
    {
      id: 'zeca3', nome: 'ZECA', estilo: 'zeca',
      tx: 16, ty: 32, dir: 'cima',
      treinador: {
        classe: 'MOLEQUE DA VILA', visao: 5, premio: 1800,
        liga: 'venceu_zeca3',
        time: [{ especie: 'sacizinho', nivel: 28 }, { especie: 'piragua', nivel: 29 },
               { especie: 'caiporinha', nivel: 29 }, { especie: 'curupira', nivel: 30 }],
        falaInicio: 'Te segui até aqui de propósito. A boca da caverna é minha até você provar o contrário.',
        falaDerrota: 'Argh! Desço a serra pra treinar mais um pouco. Nem pensa que acabou.',
        esperta: true, itens: { garrafada: 2 },
      },
      falas: [
        { se: 'venceu_zeca3', linhas: [
          'Vou treinar mais um pouco antes de aparecer de novo. Não conta pros outros que eu perdi.'] },
        { batalha: true, linhas: [
          'Terceira vez, viu? Isso já é perseguição da minha parte. Não que eu vá admitir isso.'] },
      ],
    },
    {
      id: 'mestre_patueiro', nome: 'MESTRE PATUEIRO', estilo: 'aldeao',
      tx: 17, ty: 19, dir: 'baixo',
      falas: [
        { se: 'conta_patua', linhas: [
          'Seis Encantados no patuá, cada um preso na hora certa. Isso é ofício, {crianca}.'] },
        { se: 'capturados>=6', liga: 'conta_patua', paga: 500, linhas: [
          'Seis presos, você me disse? Deixa eu conferir... é verdade!',
          'Ver bicho é fácil. Prender bem é que separa quem treina de quem só passeia.',
          'Acendi uma conta da guia por sua conta.'] },
        { linhas: [
          'Não conto quem você viu: conto quem você prendeu. Já são {capturados} no seu patuá.',
          'Me traga seis Encantados presos, direitinho, e acendo uma conta da sua guia.'] },
      ],
    },
    {
      id: 'sineiro', nome: 'SINEIRO DA CAPELA', estilo: 'aldeao',
      tx: 12, ty: 19, dir: 'baixo',
      falas: [
        { se: 'servico_sinos', linhas: [
          'Os três de volta na torre, tocando juntos. A serra inteira ouviu, {crianca}.',
          'Dizem que a Mãe-do-Ouro também ouve esse som. Se for verdade, ela sabe onde te achar.'] },
        /* serviço opcional: não trava guia nenhuma, mas paga bem */
        { se: 'item:sino>=3', pede: { item: 'sino', n: 3 }, liga: 'servico_sinos',
          paga: 3000, da: { item: 'patua_mestre', n: 3 }, linhas: [
          'Os TRÊS! Eu já tinha me conformado de morrer sem ouvir os três juntos.',
          'Toma o que eu tenho de melhor guardado, e o dinheiro da capela junto.',
          'E fique de olho no fundo da caverna. Sino tocado atrai o que brilha.'] },
        { linhas: [
          'A capela da serra tinha três sinos de bronze. O vento levou os três, cada um pro seu canto.',
          'Um ficou na trilha, um aqui na vila mesmo, e o terceiro lá em cima na cumeeira.',
          'Me traga os três e eu te pago bem — tenho {dinheiro} motivos pra saber que você precisa.'] },
      ],
    },
  ],

  inicio: { tx: 16, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 16, ty: 0,  para: 'trilhaDaBrasa', destino: { tx: 4,  ty: 30, dir: 'cima' } },
    { tx: 17, ty: 0,  para: 'trilhaDaBrasa', destino: { tx: 5,  ty: 30, dir: 'cima' } },
    { tx: 16, ty: 33, para: 'cavernaBoitata', destino: { tx: 16, ty: 1,  dir: 'baixo' } },
    { tx: 17, ty: 33, para: 'cavernaBoitata', destino: { tx: 17, ty: 1,  dir: 'baixo' } },
    { tx: 16, ty: 7,  para: 'terreiroBrasaPatio', destino: { tx: 7, ty: 11, dir: 'cima' } },
    { tx: 5,  ty: 21, para: 'lojaFornalha', destino: { tx: 7, ty: 8, dir: 'cima' } },
    { tx: 28, ty: 21, para: 'benzimentoFornalha', destino: { tx: 7, ty: 8, dir: 'cima' } },
    { tx: 5,  ty: 29, para: 'forjaFornalha', destino: { tx: 7, ty: 8, dir: 'cima' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 12,
  encontros: [
    { especie: 'cabritinha', min: 26, max: 28, peso: 45 },
    { especie: 'mulinha', min: 26, max: 28, peso: 30 },
    { especie: 'boitatinha', min: 26, max: 28, peso: 25 },
  ],
};
