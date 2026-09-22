/* =========================================================================
   Terreiro do Trovão — o salão do Guaraci, e o fim da Aldeia Tupã.

   O primeiro terreiro mais largo que alto: 29 colunas. Entra-se por baixo,
   em (14,21), num saguão com a primeira guarda; sobe-se para um casarão de
   seis salas, três por duas, com DUAS chaves de para-raio (a mesma mecânica
   do Charco Relampejante, em sala fechada); do canto nordeste, a segunda
   guarda libera o corredor do alto, onde a terceira guarda fica entre ele e
   a câmara do Guaraci, na ponta oeste.

       sala 0 ─── sala 1 ─!1─ sala 2 ─(guarda 2)→ corredor do alto
         │1        │!2        │!1
       sala 3 ─2── sala 4 ─1── sala 5
       (entra)
     chave 1 na sala 3, chave 2 na sala 4.
     ─X─ : a cerca abre quando a chave X está ligada; !X, quando desligada

   A solução mais curta pede quatro toques de chave. As cercas somem de vez
   quando o Guaraci cai (`venceu_guaraci`), para a saída ficar livre.
   As guardas usam a receita da Sopradora do Fole e das guardas do
   Rodamoinho: ficam AO LADO do vão, e quem tranca é uma `barreira`.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroTrovao: DefMapa = {
  id: 'terreiroTrovao',
  nome: 'TERREIRO DO TROVÃO',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 0
    'W_____________W_____________W', // 1
    'W___________________________W', // 2
    'W_____________W_____________W', // 3
    'WWWWWWWWWWWWWWWWWWWWWWW_WWWWW', // 4
    'W________W________W_________W', // 5
    'W___________________________W', // 6
    'W________W________W_________W', // 7
    'W________W________W_________W', // 8
    'WWWW_WWWWWWWWW_WWWWWWWW_WWWWW', // 9
    'W________W________W_________W', // 10
    'W___________________________W', // 11
    'W________W________W_________W', // 12
    'W________W________W_________W', // 13
    'WWWW_WWWWWWWWWWWWWWWWWWWWWWWW', // 14
    'W___________________________W', // 15
    'W___________________________W', // 16
    'W___________________________W', // 17
    'W___________TTTTT___________W', // 18
    'W___________TTTTT___________W', // 19
    'W___________TTTTT___________W', // 20
    'W___________________________W', // 21
    'WWWWWWWWWWWWWW_WWWWWWWWWWWWWW', // 22
  ],

  objetos: [
    { tipo: 'placa', tx: 20, ty: 16,
      placa: 'TERREIRO DO TROVÃO. Duas chaves, seis salas, três guardas. O Guaraci espera a oeste do alto.' },

    { tipo: 'barreira', tx: 4,  ty: 14, larg: 1, seNao: 'venceu_guarda_faisca' },
    { tipo: 'barreira', tx: 23, ty: 4,  larg: 1, seNao: 'venceu_guarda_relampago' },
    { tipo: 'barreira', tx: 14, ty: 2,  larg: 1, seNao: 'venceu_guarda_trovoada' },

    /* as seis cercas (a sala 0 → 1 não tem nenhuma) */
    // sala 1 → 2: abre com a chave 1 desligada
    { tipo: 'cercaRaio', tx: 18, ty: 6,  larg: 1, se: 'chave_tupa_1', seNao: 'venceu_guaraci' },
    // sala 3 → 4: abre com a chave 2 ligada
    { tipo: 'cercaRaio', tx: 9,  ty: 11, larg: 1, seNao: ['chave_tupa_2', 'venceu_guaraci'] },
    // sala 4 → 5: abre com a chave 1 ligada
    { tipo: 'cercaRaio', tx: 18, ty: 11, larg: 1, seNao: ['chave_tupa_1', 'venceu_guaraci'] },
    // sala 0 → 3: abre com a chave 1 ligada
    { tipo: 'cercaRaio', tx: 4,  ty: 9,  larg: 1, seNao: ['chave_tupa_1', 'venceu_guaraci'] },
    // sala 1 → 4: abre com a chave 2 desligada
    { tipo: 'cercaRaio', tx: 14, ty: 9,  larg: 1, se: 'chave_tupa_2', seNao: 'venceu_guaraci' },
    // sala 2 → 5: abre com a chave 1 desligada
    { tipo: 'cercaRaio', tx: 23, ty: 9,  larg: 1, se: 'chave_tupa_1', seNao: 'venceu_guaraci' },

    { tipo: 'paraRaio', tx: 2, ty: 12, larg: 1, placa: 'CHAVE 1', se: 'chave_tupa_1',
      falas: [{ desliga: 'chave_tupa_1', linhas: [
        'Você baixa a CHAVE 1. Três cercas se calam, e outras três voltam a estalar.'] }] },
    { tipo: 'paraRaio', tx: 2, ty: 12, larg: 1, placa: 'CHAVE 1', seNao: 'chave_tupa_1', vazio: true,
      falas: [{ liga: 'chave_tupa_1', linhas: [
        'Você ergue a CHAVE 1. Três cercas se calam, e outras três voltam a estalar.'] }] },
    { tipo: 'paraRaio', tx: 12, ty: 13, larg: 1, placa: 'CHAVE 2', se: 'chave_tupa_2',
      falas: [{ desliga: 'chave_tupa_2', linhas: [
        'Você baixa a CHAVE 2. Uma cerca se cala, e outra volta a estalar.'] }] },
    { tipo: 'paraRaio', tx: 12, ty: 13, larg: 1, placa: 'CHAVE 2', seNao: 'chave_tupa_2', vazio: true,
      falas: [{ liga: 'chave_tupa_2', linhas: [
        'Você ergue a CHAVE 2. Uma cerca se cala, e outra volta a estalar.'] }] },
  ],

  npcs: [
    {
      id: 'guarda_faisca', nome: 'GUARDA DA FAÍSCA', estilo: 'aldeao',
      tx: 3, ty: 15, dir: 'dir',
      treinador: {
        classe: 'GUARDA DA FAÍSCA', visao: 3, premio: 2000,
        esperta: true, itens: { garrafada: 1 },
        time: [{ especie: 'faisquinha', nivel: 47 }, { especie: 'tatuTrovao', nivel: 48 },
               { especie: 'relampo', nivel: 48 }],
        falaInicio: 'Antes das chaves, a guarda. É assim que o Guaraci gosta.',
        falaDerrota: 'Passa. Lá em cima, pensa antes de mexer em chave — cada uma fecha alguma coisa.',
      },
      falas: [
        { se: 'venceu_guarda_faisca', linhas: [
          'Se as cercas te prenderem, é só mexer nas chaves de novo. Ninguém fica preso lá dentro.'] },
        { batalha: true, linhas: [
          'A primeira faísca é minha. Vem.'] },
      ],
    },
    {
      id: 'guarda_relampago', nome: 'GUARDA DO RELÂMPAGO', estilo: 'aldeao',
      tx: 22, ty: 5, dir: 'dir',
      treinador: {
        classe: 'GUARDA DO RELÂMPAGO', visao: 3, premio: 2400,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'relampo', nivel: 49 }, { especie: 'saci', nivel: 49 },
               { especie: 'tatuTrovao', nivel: 49 }, { especie: 'cabraCabriola', nivel: 50 }],
        falaInicio: 'Chegou na última sala? Então as chaves você entendeu. Agora é comigo.',
        falaDerrota: 'Entendeu as chaves e entendeu a luta. Sobe.',
      },
      falas: [
        { se: 'venceu_guarda_relampago', linhas: [
          'A Trovoada é a última. Depois dela, o Guaraci.'] },
        { batalha: true, linhas: [
          'O relâmpago vem antes do trovão. E eu venho antes da Trovoada.'] },
      ],
    },
    {
      id: 'guarda_trovoada', nome: 'GUARDA DA TROVOADA', estilo: 'aldeao',
      tx: 15, ty: 1, dir: 'dir',
      treinador: {
        classe: 'GUARDA DA TROVOADA', visao: 3, premio: 2800,
        esperta: true, itens: { garrafada_forte: 1, erva_doce: 1 },
        time: [{ especie: 'relampo', nivel: 50 }, { especie: 'matinta', nivel: 50 },
               { especie: 'tatuTrovao', nivel: 50 }, { especie: 'relampo', nivel: 51 }],
        falaInicio: 'Última guarda antes do Guaraci. Se eu deixar passar quem não aguenta, o trovão me cobra.',
        falaDerrota: 'Liberado. O Guaraci já ouviu o estrondo daqui.',
      },
      falas: [
        { se: 'venceu_guarda_trovoada', linhas: [
          'A câmara dele fica a oeste. Boa sorte — e não pisca, que ele é rápido.'] },
        { batalha: true, linhas: [
          'A Trovoada não abaixa a cabeça pra ninguém que não prove o próprio raio.'] },
      ],
    },
    {
      id: 'guaraci', nome: 'GUARACI', estilo: 'tie',
      tx: 3, ty: 2, dir: 'dir',
      treinador: {
        classe: 'DONO DO TERREIRO', premio: 5000,
        esperta: true, itens: { garrafada_forte: 2, erva_doce: 1, agua_benta: 1 },
        time: [{ especie: 'relampo', nivel: 51 }, { especie: 'tatuTrovao', nivel: 51 },
               { especie: 'saci', nivel: 52 }, { especie: 'tatuTrovao', nivel: 52 },
               { especie: 'relampo', nivel: 53 }],
        /* o sexto Encantado, escolhido contra o inicial de quem chegou até
           aqui — a mesma regra do trunfo do Brás */
        trunfo: {
          boitatinha: { especie: 'iaraMae', nivel: 52 },
          iarinha: { especie: 'curupira', nivel: 52 },
          curupinho: { especie: 'boitatao', nivel: 52 },
        },
        falaInicio: 'Três estradas, seis salas, três guardas. Você andou a região inteira de lado. Agora aguenta o raio.',
        falaDerrota: 'O raio escolheu você. Não sou eu quem vai discutir com ele.',
      },
      falas: [
        { se: 'medalha:trovao', linhas: [
          'A Medalha Trovão é sua, e o Dom Faísca com ela. Pedra rachada nenhuma segura mais você.'] },
        { se: 'venceu_guaraci', medalha: 'trovao', dom: 'faisca', linhas: [
          'Ganhou limpo. Toma a Medalha Trovão — e o Dom Faísca, que parte a pedra que o raio rachou.'] },
        { batalha: true, linhas: [
          'Seis Encantados, um céu só. Vamos ver quem troveja por último.'] },
      ],
    },
  ],

  inicio: { tx: 14, ty: 21, dir: 'cima' },

  saidas: [
    { tx: 14, ty: 22, para: 'aldeiaTupa', destino: { tx: 11, ty: 9, dir: 'baixo' } },
  ],
};
