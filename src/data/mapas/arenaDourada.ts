/* =========================================================================
   A arena do Círculo Dourado — seis câmaras, uma em cima da outra.

   Entra-se por baixo. Em cada câmara, um adversário vigia o carpete do meio
   (visão de 6 tiles): passar por ele é lutar. A porta da câmara de cima só
   abre com a vitória (duas trancas por porta: uma para a primeira volta,
   outra para a volta de campeão). Não há benzimento lá dentro, e toda vez
   que se entra vindo de fora as vitórias se apagam (`zeraAoEntrar`): quem
   sai para se curar, ou cai e acorda no benzimento da praça, recomeça do
   primeiro Guardião.

   De baixo para cima: IRACEMA (Água/Planta), ITABERÁ (Fogo/Terra), YBYTU
   (Vento/Raio), JACIRA (Sombra/Luz), o ZECA e o ANHANGÁ. Vencer o Anhangá
   acende `campeao` e toca os créditos; depois disso, os mesmos seis voltam
   com times mais fortes (os NPCs `_b`, do outro lado de cada câmara).
     W  parede   _  piso   T  carpete   m  tatame                           */
import type { DefMapa } from '../../world/tilemap.ts';

export const arenaDourada: DefMapa = {
  id: 'arenaDourada',
  nome: 'ARENA DO CÍRCULO',
  interior: true,

  chao: [
    'WWWWWWWTWWWWWWW', // 0
    'W_____TTT_____W', // 1
    'W_____TTT_____W', // 2
    'W_____TTT_____W', // 3
    'W_____TTT_____W', // 4
    'W_____TTT_____W', // 5
    'W_____TTT_____W', // 6
    'WWWWWWWTWWWWWWW', // 7
    'W_____TTT_____W', // 8
    'W_____TTT_____W', // 9
    'W_____TTT_____W', // 10
    'W_____TTT_____W', // 11
    'W_____TTT_____W', // 12
    'W_____TTT_____W', // 13
    'WWWWWWWTWWWWWWW', // 14
    'Wmmm__TTT__mmmW', // 15
    'Wmmm__TTT__mmmW', // 16
    'Wmmm__TTT__mmmW', // 17
    'Wmmm__TTT__mmmW', // 18
    'Wmmm__TTT__mmmW', // 19
    'Wmmm__TTT__mmmW', // 20
    'WWWWWWWTWWWWWWW', // 21
    'Wmmm__TTT__mmmW', // 22
    'Wmmm__TTT__mmmW', // 23
    'Wmmm__TTT__mmmW', // 24
    'Wmmm__TTT__mmmW', // 25
    'Wmmm__TTT__mmmW', // 26
    'Wmmm__TTT__mmmW', // 27
    'WWWWWWWTWWWWWWW', // 28
    'Wmmm__TTT__mmmW', // 29
    'Wmmm__TTT__mmmW', // 30
    'Wmmm__TTT__mmmW', // 31
    'Wmmm__TTT__mmmW', // 32
    'Wmmm__TTT__mmmW', // 33
    'Wmmm__TTT__mmmW', // 34
    'WWWWWWWTWWWWWWW', // 35
    'Wmmm__TTT__mmmW', // 36
    'Wmmm__TTT__mmmW', // 37
    'Wmmm__TTT__mmmW', // 38
    'Wmmm__TTT__mmmW', // 39
    'Wmmm__TTT__mmmW', // 40
    'Wmmm__TTT__mmmW', // 41
    'WWWWWWWTWWWWWWW', // 42
    'W_____TTT_____W', // 43
    'W_____TTT_____W', // 44
    'W_____TTT_____W', // 45
    'WWWWWWWTWWWWWWW', // 46
  ],

  zeraAoEntrar: [
    'venceu_iracema',
    'venceu_iracema_b',
    'venceu_itabera',
    'venceu_itabera_b',
    'venceu_ybytu',
    'venceu_ybytu_b',
    'venceu_jacira',
    'venceu_jacira_b',
    'venceu_zeca9',
    'venceu_zeca9_b',
    'venceu_anhanga',
    'venceu_anhanga_b',
  ],

  objetos: [
    { tipo: 'barreira', tx: 7, ty: 35, larg: 1, seNao: ['venceu_iracema', 'campeao'] },
    { tipo: 'barreira', tx: 7, ty: 35, larg: 1, se: 'campeao', seNao: 'venceu_iracema_b' },
    { tipo: 'barreira', tx: 7, ty: 28, larg: 1, seNao: ['venceu_itabera', 'campeao'] },
    { tipo: 'barreira', tx: 7, ty: 28, larg: 1, se: 'campeao', seNao: 'venceu_itabera_b' },
    { tipo: 'barreira', tx: 7, ty: 21, larg: 1, seNao: ['venceu_ybytu', 'campeao'] },
    { tipo: 'barreira', tx: 7, ty: 21, larg: 1, se: 'campeao', seNao: 'venceu_ybytu_b' },
    { tipo: 'barreira', tx: 7, ty: 14, larg: 1, seNao: ['venceu_jacira', 'campeao'] },
    { tipo: 'barreira', tx: 7, ty: 14, larg: 1, se: 'campeao', seNao: 'venceu_jacira_b' },
    { tipo: 'barreira', tx: 7, ty: 7, larg: 1, seNao: ['venceu_zeca9', 'campeao'] },
    { tipo: 'barreira', tx: 7, ty: 7, larg: 1, se: 'campeao', seNao: 'venceu_zeca9_b' },
  ],

  npcs: [
    {
      id: 'iracema', nome: 'IRACEMA', estilo: 'tie',
      tx: 5, ty: 38, dir: 'dir', seNao: 'campeao',
      treinador: {
        classe: 'GUARDIÃ DAS ÁGUAS E MATAS', visao: 6, premio: 6000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 1, agua_benta: 1 },
        time: [{ especie: 'iaraMae', nivel: 58 }, { especie: 'curupira', nivel: 58 }, { especie: 'caipora', nivel: 59 }, { especie: 'iaraMae', nivel: 59 }, { especie: 'curupira', nivel: 60 }],
        falaInicio: 'Rio e mata, os dois primeiros que você conheceu. Vamos ver se você ainda lembra deles.',
        falaDerrota: 'Aprendeu com a água e com a raiz. Pode seguir.',
      },
      falas: [
        { se: 'venceu_iracema', linhas: ['Aprendeu com a água e com a raiz. Pode seguir.'] },
        { batalha: true, linhas: ['Rio e mata, os dois primeiros que você conheceu. Vamos ver se você ainda lembra deles.'] },
      ],
    },
    {
      id: 'iracema_b', nome: 'IRACEMA', estilo: 'tie',
      tx: 9, ty: 38, dir: 'esq', se: 'campeao',
      treinador: {
        classe: 'GUARDIÃ DAS ÁGUAS E MATAS', visao: 6, premio: 8000, esperta: true,
        itens: { garrafada_forte: 4, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'iaraMae', nivel: 60 }, { especie: 'curupira', nivel: 60 }, { especie: 'caipora', nivel: 60 }, { especie: 'iaraMae', nivel: 60 }, { especie: 'caipora', nivel: 60 }, { especie: 'curupira', nivel: 60 }],
        falaInicio: 'Rio e mata, os dois primeiros que você conheceu. Vamos ver se você ainda lembra deles.',
        falaDerrota: 'Aprendeu com a água e com a raiz. Pode seguir.',
      },
      falas: [
        { se: 'venceu_iracema_b', linhas: ['Aprendeu com a água e com a raiz. Pode seguir.'] },
        { batalha: true, linhas: ['Rio e mata, os dois primeiros que você conheceu. Vamos ver se você ainda lembra deles.'] },
      ],
    },
    {
      id: 'itabera', nome: 'ITABERÁ', estilo: 'guarda',
      tx: 5, ty: 31, dir: 'dir', seNao: 'campeao',
      treinador: {
        classe: 'GUARDIÃO DO FOGO E DA PEDRA', visao: 6, premio: 6500, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 1, agua_benta: 1 },
        time: [{ especie: 'salamanca', nivel: 59 }, { especie: 'cabraCabriola', nivel: 59 }, { especie: 'mulaSemCabeca', nivel: 59 }, { especie: 'mapinguari', nivel: 59 }, { especie: 'boitatao', nivel: 60 }],
        falaInicio: 'Fogo derrete pedra; pedra abafa fogo. Eu uso os dois, e você só tem um time.',
        falaDerrota: 'Nem brasa nem rocha. Segue.',
      },
      falas: [
        { se: 'venceu_itabera', linhas: ['Nem brasa nem rocha. Segue.'] },
        { batalha: true, linhas: ['Fogo derrete pedra; pedra abafa fogo. Eu uso os dois, e você só tem um time.'] },
      ],
    },
    {
      id: 'itabera_b', nome: 'ITABERÁ', estilo: 'guarda',
      tx: 9, ty: 31, dir: 'esq', se: 'campeao',
      treinador: {
        classe: 'GUARDIÃO DO FOGO E DA PEDRA', visao: 6, premio: 8500, esperta: true,
        itens: { garrafada_forte: 4, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'salamanca', nivel: 60 }, { especie: 'cabraCabriola', nivel: 60 }, { especie: 'mulaSemCabeca', nivel: 60 }, { especie: 'mapinguari', nivel: 60 }, { especie: 'boitatao', nivel: 60 }, { especie: 'minhocao', nivel: 60 }],
        falaInicio: 'Fogo derrete pedra; pedra abafa fogo. Eu uso os dois, e você só tem um time.',
        falaDerrota: 'Nem brasa nem rocha. Segue.',
      },
      falas: [
        { se: 'venceu_itabera_b', linhas: ['Nem brasa nem rocha. Segue.'] },
        { batalha: true, linhas: ['Fogo derrete pedra; pedra abafa fogo. Eu uso os dois, e você só tem um time.'] },
      ],
    },
    {
      id: 'ybytu', nome: 'YBYTU', estilo: 'mariana',
      tx: 5, ty: 24, dir: 'dir', seNao: 'campeao',
      treinador: {
        classe: 'GUARDIÃ DO VENTO E DO TROVÃO', visao: 6, premio: 7000, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 1, agua_benta: 1 },
        time: [{ especie: 'saci', nivel: 59 }, { especie: 'relampo', nivel: 59 }, { especie: 'uirapuru', nivel: 60 }, { especie: 'tatuTrovao', nivel: 59 }, { especie: 'arcoDaVelha', nivel: 60 }],
        falaInicio: 'O vento traz a nuvem, a nuvem traz o raio. Eu trago os dois.',
        falaDerrota: 'O céu abriu. Pode passar.',
      },
      falas: [
        { se: 'venceu_ybytu', linhas: ['O céu abriu. Pode passar.'] },
        { batalha: true, linhas: ['O vento traz a nuvem, a nuvem traz o raio. Eu trago os dois.'] },
      ],
    },
    {
      id: 'ybytu_b', nome: 'YBYTU', estilo: 'mariana',
      tx: 9, ty: 24, dir: 'esq', se: 'campeao',
      treinador: {
        classe: 'GUARDIÃ DO VENTO E DO TROVÃO', visao: 6, premio: 9000, esperta: true,
        itens: { garrafada_forte: 4, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'saci', nivel: 60 }, { especie: 'relampo', nivel: 60 }, { especie: 'uirapuru', nivel: 60 }, { especie: 'tatuTrovao', nivel: 60 }, { especie: 'arcoDaVelha', nivel: 60 }, { especie: 'matinta', nivel: 60 }],
        falaInicio: 'O vento traz a nuvem, a nuvem traz o raio. Eu trago os dois.',
        falaDerrota: 'O céu abriu. Pode passar.',
      },
      falas: [
        { se: 'venceu_ybytu_b', linhas: ['O céu abriu. Pode passar.'] },
        { batalha: true, linhas: ['O vento traz a nuvem, a nuvem traz o raio. Eu trago os dois.'] },
      ],
    },
    {
      id: 'jacira', nome: 'JACIRA', estilo: 'anhanga',
      tx: 5, ty: 17, dir: 'dir', seNao: 'campeao',
      treinador: {
        classe: 'GUARDIÃ DA SOMBRA E DA LUZ', visao: 6, premio: 7500, esperta: true,
        itens: { garrafada_forte: 3, erva_doce: 1, agua_benta: 1 },
        time: [{ especie: 'lobisomem', nivel: 60 }, { especie: 'estrelaDalva', nivel: 60 }, { especie: 'cuca', nivel: 60 }, { especie: 'pisadeira', nivel: 60 }, { especie: 'jaci', nivel: 60 }],
        falaInicio: 'Noite e dia. Um cobre o fraco do outro. Achou o fraco de algum?',
        falaDerrota: 'Viu no escuro e no claro. A próxima porta é do seu rival.',
      },
      falas: [
        { se: 'venceu_jacira', linhas: ['Viu no escuro e no claro. A próxima porta é do seu rival.'] },
        { batalha: true, linhas: ['Noite e dia. Um cobre o fraco do outro. Achou o fraco de algum?'] },
      ],
    },
    {
      id: 'jacira_b', nome: 'JACIRA', estilo: 'anhanga',
      tx: 9, ty: 17, dir: 'esq', se: 'campeao',
      treinador: {
        classe: 'GUARDIÃ DA SOMBRA E DA LUZ', visao: 6, premio: 9500, esperta: true,
        itens: { garrafada_forte: 4, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'lobisomem', nivel: 60 }, { especie: 'estrelaDalva', nivel: 60 }, { especie: 'cuca', nivel: 60 }, { especie: 'pisadeira', nivel: 60 }, { especie: 'jaci', nivel: 60 }, { especie: 'maeDoOuro', nivel: 60 }],
        falaInicio: 'Noite e dia. Um cobre o fraco do outro. Achou o fraco de algum?',
        falaDerrota: 'Viu no escuro e no claro. A próxima porta é do seu rival.',
      },
      falas: [
        { se: 'venceu_jacira_b', linhas: ['Viu no escuro e no claro. A próxima porta é do seu rival.'] },
        { batalha: true, linhas: ['Noite e dia. Um cobre o fraco do outro. Achou o fraco de algum?'] },
      ],
    },
    {
      id: 'zeca9', nome: 'ZECA', estilo: 'zeca',
      tx: 5, ty: 10, dir: 'dir', seNao: 'campeao',
      treinador: {
        classe: 'RIVAL DE SEMPRE', visao: 6, premio: 8000, esperta: true,
        itens: { garrafada_forte: 4, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'lobisomem', nivel: 60 }, { especie: 'relampo', nivel: 60 }, { especie: 'saci', nivel: 60 }, { especie: 'minhocao', nivel: 60 }, { especie: 'estrelaDalva', nivel: 60 }],
        falaInicio: 'Oito medalhas cada um. Nove vezes eu te barrei. Essa é a última, e é pra valer!',
        falaDerrota: 'Tá bom. TÁ BOM. Vai lá e ganha do Anhangá, senão eu nunca vou te perdoar.',
        trunfo: {
          boitatinha: { especie: 'iaraMae', nivel: 60 },
          iarinha: { especie: 'curupira', nivel: 60 },
          curupinho: { especie: 'boitatao', nivel: 60 },
        },
      },
      falas: [
        { se: 'venceu_zeca9', linhas: ['Tá bom. TÁ BOM. Vai lá e ganha do Anhangá, senão eu nunca vou te perdoar.'] },
        { batalha: true, linhas: ['Oito medalhas cada um. Nove vezes eu te barrei. Essa é a última, e é pra valer!'] },
      ],
    },
    {
      id: 'zeca9_b', nome: 'ZECA', estilo: 'zeca',
      tx: 9, ty: 10, dir: 'esq', se: 'campeao',
      treinador: {
        classe: 'RIVAL DE SEMPRE', visao: 6, premio: 10000, esperta: true,
        itens: { garrafada_forte: 4, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'lobisomem', nivel: 60 }, { especie: 'relampo', nivel: 60 }, { especie: 'saci', nivel: 60 }, { especie: 'minhocao', nivel: 60 }, { especie: 'estrelaDalva', nivel: 60 }],
        falaInicio: 'Oito medalhas cada um. Nove vezes eu te barrei. Essa é a última, e é pra valer!',
        falaDerrota: 'Tá bom. TÁ BOM. Vai lá e ganha do Anhangá, senão eu nunca vou te perdoar.',
        trunfo: {
          boitatinha: { especie: 'iaraMae', nivel: 60 },
          iarinha: { especie: 'curupira', nivel: 60 },
          curupinho: { especie: 'boitatao', nivel: 60 },
        },
      },
      falas: [
        { se: 'venceu_zeca9_b', linhas: ['Tá bom. TÁ BOM. Vai lá e ganha do Anhangá, senão eu nunca vou te perdoar.'] },
        { batalha: true, linhas: ['Oito medalhas cada um. Nove vezes eu te barrei. Essa é a última, e é pra valer!'] },
      ],
    },
    {
      id: 'anhanga', nome: 'ANHANGÁ', estilo: 'anhanga',
      tx: 5, ty: 3, dir: 'dir', seNao: 'campeao',
      treinador: {
        classe: 'CAMPEÃO DO CÍRCULO', visao: 6, premio: 15000, esperta: true,
        itens: { garrafada_forte: 4, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'cuca', nivel: 60 }, { especie: 'mapinguari', nivel: 60 }, { especie: 'uirapuru', nivel: 60 }, { especie: 'arcoDaVelha', nivel: 60 }, { especie: 'jaci', nivel: 60 }, { especie: 'caipora', nivel: 60 }],
        falaInicio: 'Vinte anos esperando alguém que escutasse o mato de novo. Mostra o que ele te disse.',
        falaDerrota: 'O mato respondeu a você. O Círculo Dourado tem um novo campeão.',
        liga: 'campeao', creditos: true,
        trunfo: {
          boitatinha: { especie: 'iaraMae', nivel: 60 },
          iarinha: { especie: 'curupira', nivel: 60 },
          curupinho: { especie: 'boitatao', nivel: 60 },
        },
      },
      falas: [
        { se: 'venceu_anhanga', linhas: ['Campeão agora é você. Mas o Círculo continua aberto: volta quando quiser, que eu volto mais forte.'] },
        { batalha: true, linhas: ['Vinte anos esperando alguém que escutasse o mato de novo. Mostra o que ele te disse.'] },
      ],
    },
    {
      id: 'anhanga_b', nome: 'ANHANGÁ', estilo: 'anhanga',
      tx: 9, ty: 3, dir: 'esq', se: 'campeao',
      treinador: {
        classe: 'CAMPEÃO DO CÍRCULO', visao: 6, premio: 17000, esperta: true,
        itens: { garrafada_forte: 4, erva_doce: 2, agua_benta: 2 },
        time: [{ especie: 'cuca', nivel: 60 }, { especie: 'mapinguari', nivel: 60 }, { especie: 'uirapuru', nivel: 60 }, { especie: 'arcoDaVelha', nivel: 60 }, { especie: 'jaci', nivel: 60 }, { especie: 'lobisomem', nivel: 60 }],
        falaInicio: 'Vinte anos esperando alguém que escutasse o mato de novo. Mostra o que ele te disse.',
        falaDerrota: 'O mato respondeu a você. O Círculo Dourado tem um novo campeão.',
        trunfo: {
          boitatinha: { especie: 'iaraMae', nivel: 60 },
          iarinha: { especie: 'curupira', nivel: 60 },
          curupinho: { especie: 'boitatao', nivel: 60 },
        },
      },
      falas: [
        { se: 'venceu_anhanga_b', linhas: ['Campeão agora é você. Mas o Círculo continua aberto: volta quando quiser, que eu volto mais forte.'] },
        { batalha: true, linhas: ['Vinte anos esperando alguém que escutasse o mato de novo. Mostra o que ele te disse.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 45, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 46, para: 'circuloDourado', destino: { tx: 21, ty: 10, dir: 'baixo' } },
    { tx: 7, ty: 0,  para: 'circuloDourado', destino: { tx: 21, ty: 10, dir: 'baixo' } },
  ],

  cenario: 'cidade',
};
