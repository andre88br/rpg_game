/* =========================================================================
   Terreiro da Pedra — o salão do Ubirajara, e o fim das Minas da Caipora.

   Juntos, os tipos de tarefa novos da região num salão só:
   1. saguão de entrada, com a GUARDA DO CASCALHO (batalha) ao lado da porta
      para a plataforma A;
   2. na plataforma A, uma alavanca e um trilho: sem a alavanca, o desvio
      manda o vagonete de volta para o saguão; com ela, leva à plataforma B;
   3. na plataforma B, a GUARDA DA CHARADA não luta: pergunta. Acertar liga
      `passou_charada_pedra`, que tira a barreira da passagem para cima;
      errar só faz ela perguntar de novo;
   4. na sala de cima, a GUARDA DA ROCHA (batalha) guarda a porta da câmara;
   5. o Ubirajara, na ponta oeste da câmara.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroPedra: DefMapa = {
  id: 'terreiroPedra',
  nome: 'TERREIRO DA PEDRA',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 0
    'W___________________________W', // 1
    'W___________________________W', // 2
    'W___________________________W', // 3
    'WWWWWWWWWWWWWWWW_WWWWWWWWWWWW', // 4
    'WWWWWWWWWWWWWWW_____________W', // 5
    'WWWWWWWWWWWWWWW_____________W', // 6
    'WWWWWWWWWWWWWWW_____________W', // 7
    'WWWWWWWWWWWWWWW_____________W', // 8
    'WWWWWWWWWWWWWWW_____________W', // 9
    'WWWWWWWWWWWWWWWWWWWWWWWWW_WWW', // 10
    'WWWWWWWWWWWWWWWWWWWWWWWWW_WWW', // 11
    'W_____WWWWWWWWWWWWWWWWW_____W', // 12
    'W_____WWWWWWWWWWWWWWWWW_____W', // 13
    'W_____BDDDDDDDDDDDDDDDD_____W', // 14
    'W_____BWWWWWWWWWWWWWWWW_____W', // 15
    'W_____BWWWWWWWWWWWWWWWW_____W', // 16
    'WWW_WWBWWWWWWWWWWWWWWWWWWWWWW', // 17
    'W___________________________W', // 18
    'W___________TTTTT___________W', // 19
    'W___________TTTTT___________W', // 20
    'W___________________________W', // 21
    'WWWWWWWWWWWWWW_WWWWWWWWWWWWWW', // 22
  ],

  objetos: [
    { tipo: 'placa', tx: 20, ty: 18,
      placa: 'TERREIRO DA PEDRA. Uma alavanca, uma charada, três guardas. O Ubirajara espera no alto.' },

    { tipo: 'barreira', tx: 3,  ty: 17, larg: 1, seNao: 'venceu_guarda_cascalho' },
    { tipo: 'barreira', tx: 25, ty: 11, larg: 1, seNao: 'passou_charada_pedra' },
    { tipo: 'barreira', tx: 16, ty: 4,  larg: 1, seNao: 'venceu_guarda_rocha' },

    /* o desvio da plataforma A: com a alavanca, o trilho vai para B */
    { tipo: 'desvio', tx: 6, ty: 14, dir: 'dir', se: 'alavanca_terreiro_pedra' },
    { tipo: 'alavanca', tx: 1, ty: 12, larg: 1, placa: 'ALAVANCA', se: 'alavanca_terreiro_pedra',
      falas: [{ desliga: 'alavanca_terreiro_pedra', linhas: [
        'Você puxa a alavanca de volta. O desvio vira: o trilho desce pro saguão.'] }] },
    { tipo: 'alavanca', tx: 1, ty: 12, larg: 1, placa: 'ALAVANCA', seNao: 'alavanca_terreiro_pedra', vazio: true,
      falas: [{ liga: 'alavanca_terreiro_pedra', linhas: [
        'Você empurra a alavanca. O desvio vira: o trilho segue reto, pro outro lado do salão.'] }] },
  ],

  npcs: [
    {
      id: 'guarda_cascalho', nome: 'GUARDA DO CASCALHO', estilo: 'garimpeiro',
      tx: 4, ty: 18, dir: 'esq',
      treinador: {
        classe: 'GUARDA DO CASCALHO', visao: 3, premio: 2600,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'minhocao', nivel: 55 }, { especie: 'salamanca', nivel: 55 },
               { especie: 'tatuTrovao', nivel: 56 }],
        falaInicio: 'Antes do trilho, a guarda. O Ubirajara não recebe quem cai no primeiro cascalho.',
        falaDerrota: 'Passa. E olha a alavanca antes de subir no trilho.',
      },
      falas: [
        { se: 'venceu_guarda_cascalho', linhas: ['Se o trilho te trouxer de volta pra cá, foi a alavanca.'] },
        { batalha: true, linhas: ['O cascalho é o começo de toda pedra. Vem.'] },
      ],
    },
    {
      id: 'guarda_charada', nome: 'GUARDA DA CHARADA', estilo: 'garimpeiro',
      tx: 24, ty: 12, dir: 'baixo',
      falas: [
        { se: 'passou_charada_pedra', linhas: [
          'Acertou, então passa. O Ubirajara gosta de quem pensa antes de bater.'] },
        { liga: 'passou_charada_pedra', linhas: [
          'Aqui ninguém luta comigo. Aqui se responde.',
          'O que é, o que é: cai em pé e corre deitado?'],
          pergunta: {
            opcoes: ['A PEDRA', 'A CHUVA', 'O VAGONETE'], certa: 1,
            acertou: ['A chuva! Cai em pé e corre deitada. Pode subir.'],
            errou: { linhas: ['Não é isso. Pensa com calma e fala comigo de novo.'] },
          } },
      ],
    },
    {
      id: 'guarda_rocha', nome: 'GUARDA DA ROCHA', estilo: 'garimpeiro',
      tx: 17, ty: 5, dir: 'esq',
      treinador: {
        classe: 'GUARDA DA ROCHA', visao: 3, premio: 3200,
        esperta: true, itens: { garrafada_forte: 2 },
        time: [{ especie: 'mapinguari', nivel: 56 }, { especie: 'minhocao', nivel: 57 },
               { especie: 'cabraCabriola', nivel: 57 }, { especie: 'relampo', nivel: 57 }],
        falaInicio: 'Última guarda. A rocha não se mexe — e eu também não.',
        falaDerrota: 'Se mexeu. O Ubirajara já ouviu, pode entrar.',
      },
      falas: [
        { se: 'venceu_guarda_rocha', linhas: ['A câmara dele é logo ali. Pé firme.'] },
        { batalha: true, linhas: ['Ninguém chega na câmara sem passar pela rocha.'] },
      ],
    },
    {
      id: 'ubirajara', nome: 'UBIRAJARA', estilo: 'guarda',
      tx: 3, ty: 2, dir: 'dir',
      treinador: {
        classe: 'DONO DO TERREIRO', premio: 6000,
        esperta: true, itens: { garrafada_forte: 3, erva_doce: 1, agua_benta: 1 },
        time: [{ especie: 'minhocao', nivel: 57 }, { especie: 'mapinguari', nivel: 57 },
               { especie: 'cabraCabriola', nivel: 58 }, { especie: 'salamanca', nivel: 58 },
               { especie: 'minhocao', nivel: 59 }],
        /* o sexto Encantado, escolhido contra o inicial — a regra do Brás */
        trunfo: {
          boitatinha: { especie: 'iaraMae', nivel: 58 },
          iarinha: { especie: 'curupira', nivel: 58 },
          curupinho: { especie: 'boitatao', nivel: 58 },
        },
        falaInicio: 'Cavou, respondeu, escoltou e desceu a cava. Agora aguenta o peso da pedra.',
        falaDerrota: 'A pedra cedeu. Pouca gente consegue isso comigo.',
      },
      falas: [
        { se: 'medalha:pedra', linhas: [
          'A Medalha Pedra é sua, e o Dom Escavar com ela. Terra desmoronada não segura mais você.'] },
        { se: 'venceu_ubirajara', medalha: 'pedra', dom: 'escavar', linhas: [
          'Ganhou limpo. Toma a Medalha Pedra — e o Dom Escavar, que abre a terra que desmoronou.'] },
        { batalha: true, linhas: [
          'Seis Encantados, uma montanha só. Vamos ver quem desmorona primeiro.'] },
      ],
    },
  ],

  inicio: { tx: 14, ty: 21, dir: 'cima' },

  saidas: [
    { tx: 14, ty: 22, para: 'arraialCaipora', destino: { tx: 11, ty: 9, dir: 'baixo' } },
  ],
};
