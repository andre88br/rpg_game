/* Caverna do Boitatá — o breu da Serra Boitatá.
   Sem a candeia do Ferreiro (ou o Dom "Tocha", depois da medalha) o raio de
   luz é mínimo: os cinco potes de carvão e os dois treinadores estão todos
   aqui, e a busca no escuro É o desafio, não recado a NPC visível.
   A câmara das três covas (linhas 18-24) só libera a passagem para a
   Cumeeira quando as três pedras tiverem sido empurradas até o fundo de
   cada corredor — três corredores de largura 1, cada um isolado dos outros,
   para o quebra-cabeça caber num teste de busca em largura rápido.
   A gride é editável à mão, um caractere por tile de 16x16:
     S  parede de caverna (sólida)   s  chão de caverna                    */
import type { DefMapa } from '../../world/tilemap.ts';

export const cavernaBoitata: DefMapa = {
  id: 'cavernaBoitata',
  nome: 'CAVERNA DO BOITATÁ',
  escuro: {},

  chao: [
    'SSSSSSSSSSSSSSSSssSSSSSSSSSSSSSS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssggggggS',
    'SssssssssssssssssssssssssggggggS',
    'SssssssssssssssssssssssssggggggS',
    'SssssSssssssssssssssssssssSssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SSSSsssssssssssssssssssssssssssS',
    'SSsssSssssssssssssssssssssSssssS',
    'SSssSssssssssssssssssssssssssssS',
    'SSSSssssssssssssssgggggssssssssS',
    'SsssssssssssssssssgggggssssssssS',
    'SsssssssssssssssssgggggssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SSSSSSSSSSSSSSSssSSSSSSSSSSSSSSS',
    'SssssssssssssssssssssssssssssssS',
    'SSSSSSSSSSsSSSSSsSSSSSsSSSSSSSSS',
    'SSSSSSSSSSsSSSSSsSSSSSsSSSSSSSSS',
    'SSSSSSSSSSsSSSSSsSSSSSsSSSSSSSSS',
    'SSSSSSSSSSsSSSSSsSSSSSsSSSSSSSSS',
    'SSSSSSSSSSsSSSSSsSSSSSsSSSSSSSSS',
    'SssssssssssssssssssssssssssssssS',
    'SSSSSSSSSSSSSSSssSSSSSSSSSSSSSSS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SssssssssssssssssssssssssssssssS',
    'SSSSSSSSSSSSSSSSssSSSSSSSSSSSSSS',
  ],

  objetos: [
    { tipo: 'placa', tx: 19, ty: 1,
      placa: 'CAVERNA DO BOITATÁ. Sem luz de verdade, é fácil se perder no breu.' },
    /* NUNCA em ty:18: é o único corredor de largura 1 que liga os três
       corredores de pedra — uma placa ali partiria o caminho em dois e
       deixaria a cova do meio ou a do leste sem jeito de chegar */
    { tipo: 'placa', tx: 19, ty: 16,
      placa: 'Três corredores, três pedras. Empurre cada uma até o fundo.' },

    /* os cinco potes de carvão — o mesmo par se-vazio/senão-vazio das outras
       regiões, um por espécie de escuridão em que se pode achar um */
    { tipo: 'achado', tx: 8, ty: 3, solido: false, placa: 'POTE DE CARVÃO',
      se: 'achou_carvao_1', vazio: true,
      falas: [{ linhas: ['O pote está vazio agora.'] }] },
    { tipo: 'achado', tx: 8, ty: 3, solido: false, placa: 'POTE DE CARVÃO',
      seNao: 'achou_carvao_1',
      falas: [{ liga: 'achou_carvao_1', da: { item: 'carvao' }, linhas: [
        'Um pote de barro, escondido entre as pedras. Dentro: um CARVÃO ainda quente.'] }] },
    { tipo: 'achado', tx: 23, ty: 3, solido: false, placa: 'POTE DE CARVÃO',
      se: 'achou_carvao_2', vazio: true,
      falas: [{ linhas: ['O pote está vazio agora.'] }] },
    { tipo: 'achado', tx: 23, ty: 3, solido: false, placa: 'POTE DE CARVÃO',
      seNao: 'achou_carvao_2',
      falas: [{ liga: 'achou_carvao_2', da: { item: 'carvao' }, linhas: [
        'Outro pote de barro. Dentro, mais um CARVÃO.'] }] },
    { tipo: 'achado', tx: 15, ty: 9, solido: false, placa: 'POTE DE CARVÃO',
      se: 'achou_carvao_3', vazio: true,
      falas: [{ linhas: ['O pote está vazio agora.'] }] },
    { tipo: 'achado', tx: 15, ty: 9, solido: false, placa: 'POTE DE CARVÃO',
      seNao: 'achou_carvao_3',
      falas: [{ liga: 'achou_carvao_3', da: { item: 'carvao' }, linhas: [
        'No meio do caminho, quase invisível no escuro: um terceiro CARVÃO.'] }] },
    { tipo: 'achado', tx: 3, ty: 14, solido: false, placa: 'POTE DE CARVÃO',
      se: 'achou_carvao_4', vazio: true,
      falas: [{ linhas: ['O pote está vazio agora.'] }] },
    { tipo: 'achado', tx: 3, ty: 14, solido: false, placa: 'POTE DE CARVÃO',
      seNao: 'achou_carvao_4',
      falas: [{ liga: 'achou_carvao_4', da: { item: 'carvao' }, linhas: [
        'Encostado na parede mais funda: o quarto CARVÃO.'] }] },
    { tipo: 'achado', tx: 28, ty: 14, solido: false, placa: 'POTE DE CARVÃO',
      se: 'achou_carvao_5', vazio: true,
      falas: [{ linhas: ['O pote está vazio agora.'] }] },
    { tipo: 'achado', tx: 28, ty: 14, solido: false, placa: 'POTE DE CARVÃO',
      seNao: 'achou_carvao_5',
      falas: [{ liga: 'achou_carvao_5', da: { item: 'carvao' }, linhas: [
        'O quinto e último CARVÃO, bem no canto oposto da caverna.'] }] },

    /* as três covas, cada uma com seu par cova/entulho */
    { tipo: 'cova', tx: 10, ty: 23, seNao: 'cova_breu_a' },
    { tipo: 'entulho', tx: 10, ty: 23, se: 'cova_breu_a', solido: false },
    { tipo: 'cova', tx: 16, ty: 23, seNao: 'cova_breu_b' },
    { tipo: 'entulho', tx: 16, ty: 23, se: 'cova_breu_b', solido: false },
    { tipo: 'cova', tx: 22, ty: 23, seNao: 'cova_breu_c' },
    { tipo: 'entulho', tx: 22, ty: 23, se: 'cova_breu_c', solido: false },

    /* o ramo fundo: um bolso de duas por duas na parede oeste, atrás de uma
       fenda que só quem tem o Dom "Tocha" enxerga — ou seja, só depois da
       Medalha Brasa. É o segundo serviço opcional da região. */
    { tipo: 'barreira', tx: 4, ty: 10, larg: 1, seNao: 'dom_tocha' },

    /* a passagem para a Cumeeira: três trancas empilhadas na mesma porta —
       ela só libera de verdade quando NENHUMA das três estiver mais ativa,
       ou seja, quando as três covas tiverem sido tapadas */
    { tipo: 'barreira', tx: 15, ty: 25, larg: 2, seNao: 'cova_breu_a' },
    { tipo: 'barreira', tx: 15, ty: 25, larg: 2, seNao: 'cova_breu_b' },
    { tipo: 'barreira', tx: 15, ty: 25, larg: 2, seNao: 'cova_breu_c' },
  ],

  pedrasConta: 'conta_breu',
  pedras: [
    { tx: 10, ty: 20, cova: 'cova_breu_a' },
    { tx: 16, ty: 20, cova: 'cova_breu_b' },
    { tx: 22, ty: 20, cova: 'cova_breu_c' },
  ],

  npcs: [
    {
      id: 'mae_do_ouro', nome: 'MÃE-DO-OURO', estilo: 'bicho:maeDoOuro',
      tx: 2, ty: 11, dir: 'dir', seNao: 'servico_maeDoOuro',
      falas: [
        /* precisa dos três sinos E da medalha: é conteúdo de depois do Brás,
           e o único jeito de ter o Encantado exclusivo da região */
        { se: ['servico_sinos', 'medalha:brasa'], liga: 'servico_maeDoOuro',
          encantado: { especie: 'maeDoOuro', nivel: 30 }, linhas: [
          'A luz desce devagar até o chão da gruta e toma forma de gente.',
          '— Três sinos tocaram sem vento, e a serra inteira ouviu. Quem faz isso, eu escuto.',
          'A MÃE-DO-OURO desce do teto da gruta e vai com você.'] },
        { se: 'medalha:brasa', linhas: [
          'Uma luz risca o fundo da gruta e some antes de você chegar perto.',
          'Dizem que ela só desce para quem faz os três sinos da capela tocarem juntos.'] },
        { linhas: [
          'Alguma coisa brilha lá no fundo, alto demais para alcançar.',
          'Não é fogo, não é tocha. É outra coisa, e ela não desce para qualquer um.'] },
      ],
    },
    {
      id: 'mineiro', nome: 'MINEIRO DA SERRA', estilo: 'aldeao',
      tx: 12, ty: 6, dir: 'baixo',
      treinador: {
        classe: 'MINEIRO DA SERRA', visao: 3, premio: 1500,
        time: [{ especie: 'cabritinha', nivel: 29 }, { especie: 'salamanca', nivel: 30 },
               { especie: 'cabraCabriola', nivel: 31 }],
        falaInicio: 'Quem anda no meu breu sem eu ver primeiro leva topada.',
        falaDerrota: 'Boa pontaria, no escuro desse jeito.',
      },
      falas: [
        { batalha: true, linhas: [
          'Ouço passo estranho há um tempo. Deve ser você, {crianca}.'] },
      ],
    },
    {
      id: 'acendedora', nome: 'ACENDEDORA', estilo: 'aldeao',
      tx: 20, ty: 11, dir: 'baixo',
      treinador: {
        classe: 'ACENDEDORA', visao: 3, premio: 1500,
        time: [{ especie: 'mulinha', nivel: 30 }, { especie: 'boitatinha', nivel: 30 },
               { especie: 'salamanca', nivel: 31 }],
        falaInicio: 'Vim atrás de brasa de verdade. Encontrei você em vez disso.',
        falaDerrota: 'Vai atrás dos seus carvões. Eu vou atrás dos meus.',
      },
      falas: [
        { batalha: true, linhas: [
          'Ninguém acende fogo bom sem provar o próprio, {crianca}.'] },
      ],
    },
  ],

  inicio: { tx: 16, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 16, ty: 0,  para: 'vilaFornalha', destino: { tx: 16, ty: 31, dir: 'cima' } },
    { tx: 17, ty: 0,  para: 'vilaFornalha', destino: { tx: 17, ty: 31, dir: 'cima' } },
    { tx: 16, ty: 37, para: 'cumeeiraBoitata', destino: { tx: 16, ty: 1, dir: 'baixo' } },
    { tx: 17, ty: 37, para: 'cumeeiraBoitata', destino: { tx: 17, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'caverna',
  passosPorEncontro: 7,
  encontros: [
    { especie: 'salamanca', min: 26, max: 30, peso: 40 },
    { especie: 'boitatinha', min: 26, max: 29, peso: 25 },
    { especie: 'cabritinha', min: 26, max: 29, peso: 25 },
    { especie: 'mulinha', min: 27, max: 30, peso: 10 },
  ],
};
