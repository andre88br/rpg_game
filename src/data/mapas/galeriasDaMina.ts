/* =========================================================================
   Galerias da Mina — a mecânica de caminho da região: TRILHOS DE VAGONETE.

   Nove plataformas, três por três, ligadas por corredores. Alguns se andam
   a pé; outros são trilho (tiles D/E/C/B, a letra diz para onde levam) e só
   vão num sentido — quem pisa é levado sozinho até a outra ponta, pelo
   mesmo `deslizando` do escorregão. O primeiro tile de cada trilho é um
   DESVIO: com a alavanca certa, aponta para a frente; sem ela, devolve para
   a plataforma de onde se saiu. Três alavancas, em três plataformas.

       NO ──── N ──── NE        ────  corredor a pé, nos dois sentidos
       ↓1      ↓2     ↑3 solta  ↓ → ↑ trilho: só nesse sentido, e só com a
       O ──── CENTRO ── L             alavanca do número PUXADA (ou solta,
       │       ↑3                     quando está escrito)
       SO ──3→ S ──2 solta→ SE  (o sino e o Tuco)
       e o expresso de volta, SE → NO, sempre aberto
     alavanca 1 no S · alavanca 2 no N · alavanca 3 no O

   A solução mais curta pede SEIS alavancadas (achada por busca e provada em
   mapas.test.ts, que também prova que ninguém fica preso: de todo estado
   alcançável ainda se chega ao sino). No SE, o sino acende
   `conta_trilhos`; o Tuco espera ali para ser escoltado (conta_menino,
   no arraial). O expresso SE → NO leva os dois de volta de uma vez.
   A gride é editável à mão, um caractere por tile de 16x16:
     S  parede de mina   s  chão de mina   g  cascalho (encontro)
     D E C B  trilho para a direita, esquerda, cima, baixo
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const galeriasDaMina: DefMapa = {
  id: 'galeriasDaMina',
  nome: 'GALERIAS DA MINA',

  chao: [
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 0
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 1
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 2
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 3
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 4
    'SSSsssssggSSSSSSSSSSSSSSSSSsssssggSSSSSSSSSSSSSSSSSsssssggSSSS', // 5
    'SSSsssssssSSSSSSSSSSSSSSSSSsssssssSSSSSSSSSSSSSSSSSsssssssSSSS', // 6
    'ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssSSSS', // 7
    'ssssssssssSSSSSSSSSSSSSSSSSsssssssSSSSSSSSSSSSSSSSSsssssssSSSS', // 8
    'SSSgssssssSSSSSSSSSSSSSSSSSgssssssSSSSSSSSSSSSSSSSSgssssssSSSS', // 9
    'SSSSCSCSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSS', // 10
    'SSSSCSBSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSS', // 11
    'SDDDCSBSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSS', // 12
    'SCSSSSBSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSS', // 13
    'SCSSSSBSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSS', // 14
    'SCSSSSBSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSS', // 15
    'SCSSSSBSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSS', // 16
    'SCSSSSBSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSS', // 17
    'SCSSSSBSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSS', // 18
    'SCSsssssggSSSSSSSSSSSSSSSSSsssssggSSSSSSSSSSSSSSSSSsssssggSSSS', // 19
    'SCSsssssssSSSSSSSSSSSSSSSSSsssssssSSSSSSSSSSSSSSSSSsssssssSSSS', // 20
    'SCSsssssssssssssssssssssssssssssssssssssssssssssssssssssssSSSS', // 21
    'SCSsssssssSSSSSSSSSSSSSSSSSsssssssSSSSSSSSSSSSSSSSSsssssssSSSS', // 22
    'SCSgssssssSSSSSSSSSSSSSSSSSgssssssSSSSSSSSSSSSSSSSSgssssssSSSS', // 23
    'SCSSSSsSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 24
    'SCSSSSsSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 25
    'SCSSSSsSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 26
    'SCSSSSsSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 27
    'SCSSSSsSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 28
    'SCSSSSsSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 29
    'SCSSSSsSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 30
    'SCSSSSsSSSSSSSSSSSSSSSSSSSSSSSCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 31
    'SCSSSSsSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 32
    'SCSsssssggSSSSSSSSSSSSSSSSSsssssggSSSSSSSSSSSSSSSSSsssssggSSSS', // 33
    'SCSsssssssSSSSSSSSSSSSSSSSSsssssssSSSSSSSSSSSSSSSSSsssssssSSSS', // 34
    'SCSsssssssEDDDDDDDDDDDDDDDDsssssssEDDDDDDDDDDDDDDDDsssssssSSSS', // 35
    'SCSsssssssSSSSSSSSSSSSSSSSSsssssssSSSSSSSSSSSSSSSSSsssssssSSSS', // 36
    'SCSgssssssSSSSSSSSSSSSSSSSSgssssssSSSSSSSSSSSSSSSSSgssssssSSSS', // 37
    'SCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSS', // 38
    'SCSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSBSSSSSSS', // 39
    'SCEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESSSSSSS', // 40
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 41
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 42
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', // 43
  ],

  objetos: [
    { tipo: 'placa', tx: 3, ty: 5,
      placa: 'GALERIAS. Trilho só anda pra um lado. As alavancas trocam os desvios.' },

    /* os seis desvios, um no começo de cada trilho */
    // NO → O: abre com a alavanca 1 puxada
    { tipo: 'desvio', tx: 6, ty: 10, dir: 'baixo', se: 'alavanca_mina_1' },
    // N → CENTRO: abre com a alavanca 2 puxada
    { tipo: 'desvio', tx: 30, ty: 10, dir: 'baixo', se: 'alavanca_mina_2' },
    // L → NE: abre com a alavanca 3 solta
    { tipo: 'desvio', tx: 54, ty: 18, dir: 'cima', seNao: 'alavanca_mina_3' },
    // S → CENTRO: abre com a alavanca 3 puxada
    { tipo: 'desvio', tx: 30, ty: 32, dir: 'cima', se: 'alavanca_mina_3' },
    // SO → S: abre com a alavanca 3 puxada
    { tipo: 'desvio', tx: 10, ty: 35, dir: 'dir', se: 'alavanca_mina_3' },
    // S → SE: abre com a alavanca 2 solta
    { tipo: 'desvio', tx: 34, ty: 35, dir: 'dir', seNao: 'alavanca_mina_2' },

    /* as três alavancas */
    { tipo: 'alavanca', tx: 28, ty: 34, larg: 1, placa: 'ALAVANCA 1', se: 'alavanca_mina_1',
      falas: [{ desliga: 'alavanca_mina_1', linhas: [
        'Você puxa a ALAVANCA 1 de volta. Lá longe, um desvio de trilho estala e muda de lado.'] }] },
    { tipo: 'alavanca', tx: 28, ty: 34, larg: 1, placa: 'ALAVANCA 1', seNao: 'alavanca_mina_1', vazio: true,
      falas: [{ liga: 'alavanca_mina_1', linhas: [
        'Você empurra a ALAVANCA 1. Lá longe, um desvio de trilho estala e muda de lado.'] }] },
    { tipo: 'alavanca', tx: 28, ty: 6, larg: 1, placa: 'ALAVANCA 2', se: 'alavanca_mina_2',
      falas: [{ desliga: 'alavanca_mina_2', linhas: [
        'Você puxa a ALAVANCA 2 de volta. Lá longe, um desvio de trilho estala e muda de lado.'] }] },
    { tipo: 'alavanca', tx: 28, ty: 6, larg: 1, placa: 'ALAVANCA 2', seNao: 'alavanca_mina_2', vazio: true,
      falas: [{ liga: 'alavanca_mina_2', linhas: [
        'Você empurra a ALAVANCA 2. Lá longe, um desvio de trilho estala e muda de lado.'] }] },
    { tipo: 'alavanca', tx: 4, ty: 20, larg: 1, placa: 'ALAVANCA 3', se: 'alavanca_mina_3',
      falas: [{ desliga: 'alavanca_mina_3', linhas: [
        'Você puxa a ALAVANCA 3 de volta. Lá longe, um desvio de trilho estala e muda de lado.'] }] },
    { tipo: 'alavanca', tx: 4, ty: 20, larg: 1, placa: 'ALAVANCA 3', seNao: 'alavanca_mina_3', vazio: true,
      falas: [{ liga: 'alavanca_mina_3', linhas: [
        'Você empurra a ALAVANCA 3. Lá longe, um desvio de trilho estala e muda de lado.'] }] },

    /* o sino do fundo da mina: a terceira conta */
    { tipo: 'achado', tx: 52, ty: 34, larg: 1, placa: 'SINO DA MINA', se: 'conta_trilhos', vazio: true,
      falas: [{ linhas: ['O sino ainda vibra baixinho. Todo o arraial já ouviu.'] }] },
    { tipo: 'achado', tx: 52, ty: 34, larg: 1, placa: 'SINO DA MINA', seNao: 'conta_trilhos',
      falas: [{ liga: 'conta_trilhos', linhas: [
        'Você puxa a corda do sino velho. O som corre as galerias inteiras,',
        'de trilho em trilho, até sair pela boca da mina.'] }] },

    /* o segundo diamante do Ourives */
    { tipo: 'enterrado', tx: 28, ty: 22, placa: 'BURACO', se: 'cavou_diamante_galerias', vazio: true,
      falas: [{ linhas: ['Já se cavou aqui. Só sobrou o buraco.'] }] },
    { tipo: 'enterrado', tx: 28, ty: 22, placa: 'CAVANDO', seNao: 'cavou_diamante_galerias',
      falas: [{ se: 'item:forquilha', liga: 'cavou_diamante_galerias', da: { item: 'diamante' }, linhas: [
        'A forquilha puxa com força. Você cava com as mãos...',
        'Encravado na parede da plataforma do centro: um DIAMANTE BRUTO.'] }] },
  ],

  npcs: [
    {
      id: 'tuco', nome: 'TUCO', estilo: 'crianca',
      tx: 56, ty: 35, dir: 'esq', seNao: ['escoltando_menino', 'menino_salvo'],
      falas: [
        { se: 'conta_trilhos', liga: 'escoltando_menino', linhas: [
          'Você chegou! Eu vim atrás de um vagonete e os trilhos não deixavam voltar!',
          'Me leva pra minha mãe? Eu vou atrás de você, prometo que não solto.',
          'Tem um trilho de volta ali embaixo. Ele leva direto pra entrada!'] },
        { linhas: [
          'Toca o sino primeiro? Assim o arraial sabe que alguém achou a gente.'] },
      ],
    },
    {
      id: 'garimpeiro_galeria1', nome: 'GARIMPEIRO', estilo: 'garimpeiro',
      tx: 56, ty: 6, dir: 'baixo',
      treinador: {
        classe: 'GARIMPEIRO DE GALERIA', visao: 3, premio: 2600,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'minhocao', nivel: 54 }, { especie: 'salamanca', nivel: 54 },
               { especie: 'cabraCabriola', nivel: 55 }],
        falaInicio: 'Chegou até aqui pelos trilhos? Então sabe mexer em alavanca. Mas e em Encantado?',
        falaDerrota: 'Sabe. A alavanca 3 fica lá na plataforma do oeste, se quer saber.',
      },
      falas: [
        { se: 'venceu_garimpeiro_galeria1', linhas: ['Dica de graça: o trilho do leste só sobe com a alavanca 3 solta.'] },
        { batalha: true, linhas: ['Fundo de mina é lugar de gente dura.'] },
      ],
    },
    {
      id: 'garimpeiro_galeria2', nome: 'GARIMPEIRA', estilo: 'garimpeiro',
      tx: 8, ty: 34, dir: 'cima',
      treinador: {
        classe: 'GARIMPEIRA DE GALERIA', visao: 3, premio: 2600,
        esperta: true, itens: { garrafada: 2 },
        time: [{ especie: 'tatuTrovao', nivel: 54 }, { especie: 'minhocao', nivel: 55 },
               { especie: 'mulaSemCabeca', nivel: 55 }],
        falaInicio: 'Desceu até a plataforma mais funda do oeste? Coragem. Vamos ver a força.',
        falaDerrota: 'Força tem. O trilho daqui pra plataforma S só anda com a alavanca 3 puxada.',
      },
      falas: [
        { se: 'venceu_garimpeiro_galeria2', linhas: ['Se o trilho te devolver, é o desvio. Volta e mexe na alavanca.'] },
        { batalha: true, linhas: ['Aqui embaixo quem manda é o cascalho. E eu.'] },
      ],
    },
  ],

  inicio: { tx: 1, ty: 7, dir: 'dir' },

  saidas: [
    { tx: 0, ty: 7, para: 'arraialCaipora', destino: { tx: 54, ty: 20, dir: 'esq' } },
    { tx: 0, ty: 8, para: 'arraialCaipora', destino: { tx: 54, ty: 21, dir: 'esq' } },
  ],

  cenario: 'caverna',
  passosPorEncontro: 7,
  encontros: [
    { especie: 'minhoquinha', min: 53, max: 55, peso: 40 },
    { especie: 'minhocao', min: 53, max: 55, peso: 15 },
    { especie: 'salamanca', min: 53, max: 55, peso: 25 },
    { especie: 'tatuTrovao', min: 53, max: 55, peso: 20 },
  ],
};
