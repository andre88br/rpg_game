/* Mata do Curupira — a clareira do Terreiro de Raiz.
   O pátio do terreiro é fechado nas laterais (colunas 2 e 9 da linha 7 e da
   linha 8): a guia é o único jeito de chegar até a porta, e o teste de mapas
   cobra isso, igual em Porto Iara. A Casa da Encruzilhada (loja e benzimento
   sob o mesmo teto, para não abrir mais um prédio) fica encostada nela.
   A gride é editável à mão, um caractere por tile de 16x16:
     .  grama          ,  mato alto (encontros)   #  árvore
   No canto sudoeste, uma touceira de cipó fecha um bolso da mata — só o
   Dom "Cortar Cipó" abre. Do outro lado do bolso, ao sul, começa a Trilha
   da Brasa, e com ela a Serra Boitatá.                                    */
import type { DefMapa } from '../../world/tilemap.ts';

export const mataDoCurupira: DefMapa = {
  id: 'mataDoCurupira',
  nome: 'MATA DO CURUPIRA',

  chao: [
    '##########..##########',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#.#......#...........#',
    '#.#......#...........#',
    '#....................#',
    '#....,,,,,...,,,,,...#',
    '#....,,,,,...,,,,,...#',
    '#....................#',
    '#....................#',
    '##..##################',
    '##..##################',
    '##..##################',
  ],

  objetos: [
    /* o mapa desta região, escondido num canto — com ele, o Mapa do Mundo
       mostra a planta de cada lugar da região (data/mundo.ts) */
    { tipo: 'achado', tx: 20, ty: 13, solido: false, placa: 'MAPA', se: 'achou_mapa_planta', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 20, ty: 13, solido: false, placa: 'MAPA', seNao: 'achou_mapa_planta',
      falas: [{ liga: 'achou_mapa_planta', da: { item: 'mapa_planta' }, linhas: [
        'Preso numa forquilha de galho, enrolado em folha de bananeira: o MAPA DA MATA.',
        'Agora o Mapa do Mundo mostra a planta de cada lugar desta região.'] }] },
    { tipo: 'terreiro', tx: 3,  ty: 3, larg: 6, alt: 4 },              // porta (6,6)
    { tipo: 'posto',    tx: 13, ty: 3, larg: 5, alt: 4 },              // porta (15,6)
    // a guia de cinco contas: o portão da Mata do Curupira
    { tipo: 'portao',   tx: 3,  ty: 8, larg: 6, terreiro: 'planta' },
    { tipo: 'placa',    tx: 11, ty: 6,
      placa: 'TERREIRO DE RAIZ, da Tiê. A guia abre com cinco contas acesas.' },
    { tipo: 'placa',    tx: 10, ty: 2,
      placa: 'MATA DO CURUPIRA. Ao norte, o igarapé leva de volta a Porto Iara.' },
    /* a touceira de cipó: some no instante em que o Dom "Cortar Cipó" chega */
    { tipo: 'barreira', tx: 2, ty: 14, larg: 2, seNao: 'dom_cortarCipo' },
    { tipo: 'placa',    tx: 5, ty: 13,
      placa: 'A trilha segue mata adentro, rumo à Serra Boitatá.' },
  ],

  npcs: [
    {
      id: 'elias', nome: 'SEU ELIAS', estilo: 'aldeao',
      tx: 14, ty: 9, dir: 'baixo',
      falas: [
        { se: ['conta_pegadas', 'conta_mudas'], linhas: [
          'Caderno cheio e viveiro completo, os dois graças a você. A mata inteira agradece, {crianca}.'] },
        /* a entrega da carta vem ANTES de qualquer relatório de muda/pegada,
           não importa o que mais esteja pendente: sem essa prioridade, quem
           trouxesse as três mudas antes de dar a carta ficava preso para
           sempre no relatório de "viveiro completo, caderno não" — essa
           condição continuaria valendo por cima da entrega da carta em
           qualquer visita seguinte, e a carta nunca mais seria aceita */
        { se: 'item:carta_tie', pede: { item: 'carta_tie' },
          liga: ['conta_recado_mata', 'tem_caderno_mata'], linhas: [
          'Carta da Dona Firmina? Ora, passa pra cá que eu levo à Tiê agora mesmo.',
          'Ela vai gostar de saber que a Foz não esqueceu da Mata. Acendi a sua primeira conta aqui.',
          'Já que está aqui: eu anoto pegada de bicho num caderno, e sumiram três mudas do meu viveiro.',
          'Resolva os dois, e eu acendo mais duas contas da sua guia.'] },
        { se: 'item:muda>=3', pede: { item: 'muda', n: 3 }, liga: 'conta_mudas', paga: 500, linhas: [
          'As TRÊS de volta! Eu sabia que era travessura de Caiporinha, e não sumiço de verdade.',
          'Muda gosta de nó no cipó, e Caiporinha gosta de nó em qualquer coisa. Faz sentido agora.',
          'Outra conta acesa por sua conta, {crianca}. E toma pelo trabalho.'] },
        { se: ['tem_caderno_mata', 'vistos>=7'], liga: 'conta_pegadas', paga: 600, linhas: [
          'Deixa eu contar de novo... sete! Sete bichos diferentes, direitinho anotados.',
          'Serviço de mateiro de verdade. Acendi outra conta da guia pra você.'] },
        { se: 'conta_mudas', seNao: 'conta_pegadas', linhas: [
          'O viveiro está completo, mas o caderno ainda não. Você anotou {vistos} bichos de sete.',
          'A mata é funda, {crianca}. Ande devagar pelo mato alto que ela mostra o que tem.'] },
        { se: 'conta_pegadas', seNao: 'conta_mudas', linhas: [
          'O caderno está redondo, mas o viveiro ainda não. Alguma Caiporinha anda com uma muda minha.'] },
        { se: 'tem_caderno_mata', linhas: [
          'Duas coisas em aberto, {crianca}: o caderno, que você mesma enche andando pelo mato,',
          'e as três mudas do viveiro, sumidas com Caiporinhas — uma no igarapé, uma no mato fechado,',
          'e uma mais adiante. Resolva as duas e acendo mais duas contas da guia.'] },
        { linhas: [
          'Sou mateiro desta região há mais anos do que gosto de contar.',
          'Se trouxer alguma carta ou serviço, é comigo mesmo. Ninguém entra na mata sem eu saber.'] },
      ],
    },
    {
      id: 'curupira_grota', nome: 'CURUPIRA', estilo: 'bicho:curupira',
      tx: 15, ty: 11, dir: 'baixo', seNao: 'conta_grota',
      treinador: {
        classe: 'GUARDIÃO DA MATA', selvagem: true, visao: 3, liga: 'conta_grota',
        time: [{ especie: 'curupira', nivel: 23 }],
        falaInicio: 'O mato se fecha atrás de você. Os pés virados pra trás não erram o caminho.',
      },
      falas: [
        { batalha: true, linhas: [
          'De pé numa moita funda, o Curupira observa antes de assobiar uma vez.',
          'Toda a mata em volta parece prestar atenção.'] },
      ],
    },
  ],

  inicio: { tx: 10, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 10, ty: 0, para: 'igarapeCurupira', destino: { tx: 9,  ty: 21, dir: 'cima' } },
    { tx: 11, ty: 0, para: 'igarapeCurupira', destino: { tx: 10, ty: 21, dir: 'cima' } },
    { tx: 6,  ty: 6, para: 'terreiroCurupira', destino: { tx: 6, ty: 12, dir: 'cima' } },
    { tx: 15, ty: 6, para: 'casaEncruzilhada', destino: { tx: 7, ty: 8, dir: 'cima' } },
    { tx: 2,  ty: 16, para: 'trilhaDaBrasa', destino: { tx: 14, ty: 1, dir: 'baixo' } },
    { tx: 3,  ty: 16, para: 'trilhaDaBrasa', destino: { tx: 15, ty: 1, dir: 'baixo' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 9,
  encontros: [
    { especie: 'caiporinha', min: 13, max: 17, peso: 60 },
    { especie: 'sacizinho', min: 14, max: 18, peso: 40 },
  ],
};
