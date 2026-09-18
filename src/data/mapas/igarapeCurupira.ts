/* Igarapé do Curupira — a travessia de água entre Porto Iara e a Mata do
   Curupira. Só existe para quem já tem o Dom "Nadar": a água funda cobre as
   primeiras quatro linhas inteiras, sem cais nenhum — quem chega até aqui
   veio a nado mesmo, direto da barra do farol.
   A gride é editável à mão, um caractere por tile de 16x16:
     ~  água funda (só com o Dom)   a  areia da margem   #  árvore
     ,  mato alto (encontros)      R  rocha (a tranca do Zeca)  f  flores  */
import type { DefMapa } from '../../world/tilemap.ts';

export const igarapeCurupira: DefMapa = {
  id: 'igarapeCurupira',
  nome: 'IGARAPÉ DO CURUPIRA',

  chao: [
    '~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~',
    'aaaaaaaaaaaaaaaaaaaa',
    '#..................#',
    '#....,,,,,....,,,,.#',
    '#....,,,,,....,,,,.#',
    '#....,,,,,....,,,,.#',
    '#..................#',
    '#..f............f..#',
    '#..................#',
    '#....,,,,,....,,,,.#',
    '#....,,,,,....,,,,.#',
    '#....,,,,,....,,,,.#',
    '#..................#',
    '#..................#',
    '#RRRRRRRRR..RRRRRRR#',
    '#..................#',
    '#....,,,,,....,,,,.#',
    '#....,,,,,....,,,,.#',
    '#..................#',
    '#..................#',
    '#########..#########',
  ],

  objetos: [
    { tipo: 'placa', tx: 9, ty: 4,
      placa: 'IGARAPÉ DO CURUPIRA. A correnteza funda só se atravessa a nado.' },
    /* a tranca do Zeca, de novo: some no instante em que ele perde */
    { tipo: 'barreira', tx: 9, ty: 16, larg: 2, seNao: 'venceu_zeca2' },
  ],

  npcs: [
    {
      id: 'cacador', nome: 'CAÇADOR DE RAÍZES', estilo: 'aldeao',
      tx: 4, ty: 5, dir: 'baixo',
      falas: [
        { se: 'venceu_zeca2', linhas: [
          'O moleque atravessou o igarapé a nado só para te barrar de novo? Isso é dedicação.'] },
        { linhas: [
          'Nadar até aqui já é proeza. Mas segue reto e vai dar de cara com o Zeca outra vez.',
          'Perder feio uma vez não ensinou nada pra ele, ao que parece.'] },
      ],
    },
    {
      id: 'zeca2', nome: 'ZECA', estilo: 'zeca',
      tx: 9, ty: 15, dir: 'cima',
      treinador: {
        classe: 'MOLEQUE DA VILA', visao: 5, premio: 1200,
        liga: 'conta_zeca_mata',
        time: [{ especie: 'sacizinho', nivel: 20 }, { especie: 'caiporinha', nivel: 20 },
               { especie: 'curupinho', nivel: 22 }],
        falaInicio: 'Não pensa que eu ia deixar barato depois da estrada, né? Essa rocha aqui é minha.',
        falaDerrota: 'De novo?! Tudo bem, tudo bem. Some com essa rocha daqui, {crianca}.',
      },
      falas: [
        { se: 'venceu_zeca2', linhas: [
          'Vou treinar mais um pouco antes de aparecer de novo. Não conta pros outros que perdi.'] },
        { batalha: true, linhas: [
          'Segui você até aqui a nado, viu? Isso é que é rival de verdade.',
          'A rocha continua minha até você provar que merece passar.'] },
      ],
    },
    {
      id: 'caiporinha_a', nome: 'CAIPORINHA', estilo: 'bicho:caiporinha',
      tx: 7, ty: 6, dir: 'baixo', seNao: 'muda_a', fujao: {},
      falas: [
        { liga: 'muda_a', da: { item: 'muda' }, linhas: [
          'Sem saída no meio do mato, a Caiporinha larga a muda que carregava montada no porco-do-mato.',
          'Depois some rindo, entre as folhas.'] },
      ],
    },
    {
      id: 'caiporinha_b', nome: 'CAIPORINHA', estilo: 'bicho:caiporinha',
      tx: 15, ty: 12, dir: 'esq', seNao: 'muda_b', fujao: {},
      falas: [
        { liga: 'muda_b', da: { item: 'muda' }, linhas: [
          'Encurralada entre as touceiras, a Caiporinha entrega a muda amassada, sem graça.'] },
      ],
    },
    {
      id: 'caiporinha_c', nome: 'CAIPORINHA', estilo: 'bicho:caiporinha',
      tx: 7, ty: 18, dir: 'baixo', seNao: 'muda_c', fujao: {},
      falas: [
        { liga: 'muda_c', da: { item: 'muda' }, linhas: [
          'A última muda cai da mão da Caiporinha, que já vinha sem fôlego havia duas moitas.'] },
      ],
    },
    {
      id: 'menino_mata', nome: 'MENINO DA MATA', estilo: 'crianca',
      tx: 4, ty: 20, dir: 'cima',
      falas: [
        { se: 'item:muda>=1', linhas: [
          'Muda na mão! Foi Caiporinha, né? Elas adoram brincar de esconder o que a gente carrega.'] },
        { linhas: [
          'O Seu Elias, lá na clareira, vive procurando pegada de bicho para o caderno dele.'] },
      ],
    },
  ],

  inicio: { tx: 10, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 9,  ty: 0,  para: 'portoIara', destino: { tx: 24, ty: 35, dir: 'baixo' } },
    { tx: 10, ty: 0,  para: 'portoIara', destino: { tx: 25, ty: 35, dir: 'baixo' } },
    { tx: 9,  ty: 22, para: 'mataDoCurupira', destino: { tx: 10, ty: 1, dir: 'baixo' } },
    { tx: 10, ty: 22, para: 'mataDoCurupira', destino: { tx: 11, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 8,
  encontros: [
    { especie: 'caiporinha', min: 10, max: 14, peso: 55 },
    { especie: 'sacizinho', min: 11, max: 15, peso: 45 },
  ],
};
