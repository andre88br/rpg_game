/* =========================================================================
   Terreiro do Rodamoinho — o salão do Pererê, e o fim do Campo do Saci.

   Três correntes de vento, uma em cima da outra, cada vez com mais
   forquilhas (uma, depois duas, depois três) — e entre elas, três guardas
   que só deixam passar quem já provou a corrente anterior. Entra-se por
   baixo, em (7,39); sai-se por cima, em (7,3), do lado do Pererê.

   Cada forquilha tem um lado CERTO e um lado ERRADO. O lado certo sempre
   volta pro corredor central e sobe; o lado errado pisa numa saída
   disfarçada de chão — o próprio jogo já usa `saidas` pra trocar de mapa, e
   aqui o "outro mapa" é este mesmo, com destino igual ao `inicio`. Não tem
   meio-termo: errar UMA forquilha, em qualquer das três correntes, manda de
   volta pro começo do caminho inteiro, guardas já vencidos continuam
   vencidos (a flag de cada um persiste), mas a travessia da corrente começa
   do zero. `mapas.test.ts` conta os seis tiles de saída disfarçada e reconfere
   que cada um fica exatamente no lado errado de cada forquilha.

   As guardas usam a mesma receita da Sopradora do Fole, no Terreiro de
   Brasa: ficam ao LADO do corredor de passagem (nunca em cima dele, ou
   travariam a sala pra sempre mesmo depois de perder), e é uma `barreira`
   — não a própria guarda — quem tranca a saída pra corrente seguinte,
   sumindo só com a flag `venceu_<guarda>`.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroRodamoinho: DefMapa = {
  id: 'terreiroRodamoinho',
  nome: 'TERREIRO DO RODAMOINHO',
  interior: true,

  chao: [
    'WWWWWWW_WWWWWWW', // ty0  vão cosmético, sem saída de verdade
    'W_____________W', // ty1  câmara do Pererê
    'W_____________W', // ty2
    'W_____________W', // ty3
    'WWWWWWW_WWWWWWW', // ty4  barreira da GUARDA DA TORMENTA
    'WWWWWW___WWWWWW', // ty5  ela fica ao lado (6,5), o corredor é (6..8)
    'WWWWWWWVWWWWWWW', // ty6  topo da 3ª corrente (porta única)
    'WVVVVVVVWVVVVVW', // ty7  funil: só a ESQUERDA volta pro centro
    'WVVVVVVWVVVVVVW', // ty8  pedra central: trava "segurar cima"
    'WVVVVVVVVVVVVVW', // ty9  forquilha 3: DIREITA sai (13,9)
    'WWWWWWWVWWWWWWW', // ty10 posto entre forquilhas
    'WVVVVVWVVVVVVVW', // ty11 funil: só a DIREITA volta pro centro
    'WVVVVVVWVVVVVVW', // ty12 pedra central
    'WVVVVVVVVVVVVVW', // ty13 forquilha 2: ESQUERDA sai (1,13)
    'WWWWWWWVWWWWWWW', // ty14 posto entre forquilhas
    'WVVVVVVVWVVVVVW', // ty15 funil: só a ESQUERDA volta pro centro
    'WVVVVVVWVVVVVVW', // ty16 pedra central
    'WVVVVVVVVVVVVVW', // ty17 forquilha 1 (a mais perto da entrada): DIREITA sai (13,17)
    'WWWWWWWVWWWWWWW', // ty18 base da 3ª corrente (porta única, vem da guarda 2)
    'WWWWWWW_WWWWWWW', // ty19 barreira da GUARDA DO REMOINHO
    'WWWWWW___WWWWWW', // ty20 ela fica ao lado (8,20)
    'WWWWWWWVWWWWWWW', // ty21 topo da 2ª corrente
    'WVVVVVVVWVVVVVW', // ty22
    'WVVVVVVWVVVVVVW', // ty23
    'WVVVVVVVVVVVVVW', // ty24 forquilha 2: DIREITA sai (13,24)
    'WWWWWWWVWWWWWWW', // ty25
    'WVVVVVWVVVVVVVW', // ty26
    'WVVVVVVWVVVVVVW', // ty27
    'WVVVVVVVVVVVVVW', // ty28 forquilha 1: ESQUERDA sai (1,28)
    'WWWWWWWVWWWWWWW', // ty29 base da 2ª corrente (vem da guarda 1)
    'WWWWWWW_WWWWWWW', // ty30 barreira da GUARDA DA CORRENTEZA
    'WWWWWW___WWWWWW', // ty31 ela fica ao lado (6,31)
    'WWWWWWWVWWWWWWW', // ty32 topo da 1ª corrente, a mais simples: uma forquilha só
    'WVVVVVVVWVVVVVW', // ty33
    'WVVVVVVWVVVVVVW', // ty34
    'WVVVVVVVVVVVVVW', // ty35 forquilha única: DIREITA sai (13,35)
    'WWWWWWWVWWWWWWW', // ty36 base da 1ª corrente (entrada vinda de baixo)
    'W_____________W', // ty37 corredor de chegada
    'W_____________W', // ty38
    'W_____________W', // ty39 início
    'WWWWWWW_WWWWWWW', // ty40 porta pro pátio da aldeia
  ],

  objetos: [
    { tipo: 'placa', tx: 3, ty: 38,
      placa: 'TERREIRO DO RODAMOINHO. Errar a corrente devolve pro começo. Três guardas separam você do Pererê.' },

    { tipo: 'barreira', tx: 7, ty: 30, larg: 1, seNao: 'venceu_guarda_correnteza' },
    { tipo: 'barreira', tx: 7, ty: 19, larg: 1, seNao: 'venceu_guarda_remoinho' },
    { tipo: 'barreira', tx: 7, ty: 4,  larg: 1, seNao: 'venceu_guarda_tormenta' },
  ],

  npcs: [
    {
      id: 'guarda_correnteza', nome: 'GUARDA DA CORRENTEZA', estilo: 'aldeao',
      tx: 6, ty: 31, dir: 'dir',
      treinador: {
        classe: 'GUARDA DA CORRENTEZA', visao: 3, premio: 1200,
        esperta: true, itens: { erva_doce: 1 },
        time: [{ especie: 'sacizinho', nivel: 39 }, { especie: 'cabritinha', nivel: 40 }],
        falaInicio: 'Poucos acertam essa primeira corrente de primeira. Vamos ver se você é dos poucos.',
        falaDerrota: 'Passa. Mas o vento aperta bem mais lá em cima.',
      },
      falas: [
        { se: 'venceu_guarda_correnteza', linhas: [
          'O caminho segue reto daqui. Cuidado com o resto da corrente.'] },
        { batalha: true, linhas: [
          'Ninguém passa da correnteza sem provar a força primeiro.'] },
      ],
    },
    {
      id: 'guarda_remoinho', nome: 'GUARDA DO REMOINHO', estilo: 'aldeao',
      tx: 8, ty: 20, dir: 'esq',
      treinador: {
        classe: 'GUARDA DO REMOINHO', visao: 3, premio: 1600,
        esperta: true, itens: { garrafada: 1 },
        time: [{ especie: 'matinta', nivel: 41 }, { especie: 'saci', nivel: 41 },
               { especie: 'cabraCabriola', nivel: 42 }],
        falaInicio: 'A Correnteza ficou pra trás. Aqui o vento roda mais rápido — e eu também.',
        falaDerrota: 'Rodou direitinho. Suba, mas não relaxe.',
      },
      falas: [
        { se: 'venceu_guarda_remoinho', linhas: [
          'A Tormenta é a última. Se você chegou até aqui, tem chance.'] },
        { batalha: true, linhas: [
          'Ninguém atravessa o remoinho sem rodar comigo antes.'] },
      ],
    },
    {
      id: 'guarda_tormenta', nome: 'GUARDA DA TORMENTA', estilo: 'aldeao',
      tx: 6, ty: 5, dir: 'dir',
      treinador: {
        classe: 'GUARDA DA TORMENTA', visao: 3, premio: 2000,
        esperta: true, itens: { garrafada: 1 },
        time: [{ especie: 'saci', nivel: 43 }, { especie: 'curupira', nivel: 44 },
               { especie: 'cabraCabriola', nivel: 44 }],
        falaInicio: 'Última guarda antes do Pererê. Se eu deixar passar quem não aguenta, a vergonha é minha.',
        falaDerrota: 'Tá liberado. Aposto que o Pererê já sentiu o vento mudar.',
      },
      falas: [
        { se: 'venceu_guarda_tormenta', linhas: [
          'O salão dele é logo ali. Boa sorte — vai precisar de mais que sorte, na verdade.'] },
        { batalha: true, linhas: [
          'A Tormenta não abaixa a cabeça pra ninguém que não prove o próprio vento.'] },
      ],
    },
    {
      id: 'perere', nome: 'PERERÊ', estilo: 'mariana',
      tx: 5, ty: 1, dir: 'baixo',
      treinador: {
        classe: 'DONO DO TERREIRO', premio: 4000,
        esperta: true, itens: { garrafada_forte: 2, erva_doce: 1 },
        time: [{ especie: 'saci', nivel: 45 }, { especie: 'matinta', nivel: 46 },
               { especie: 'cabraCabriola', nivel: 46 }, { especie: 'saci', nivel: 47 },
               { especie: 'matinta', nivel: 48 }],
        falaInicio: 'Três guardas provaram você antes de chegar aqui. Vamos ver quanto sobra depois de mim.',
        falaDerrota: 'Pois é. O vento virou de vez para o seu lado, criança.',
      },
      falas: [
        { se: 'medalha:rodamoinho', linhas: [
          'A Medalha Rodamoinho é sua, e o Dom Rajada com ela. Use os dois com cuidado.',
          'E sobe no Topo de novo: o vento abriu um vão na parede leste. Dali se vê a Aldeia Tupã.'] },
        { se: 'venceu_perere', medalha: 'rodamoinho', dom: 'rajada', linhas: [
          'Ganhou limpo. Toma a Medalha Rodamoinho — e o Dom Rajada, que abre o que o vento tranca.'] },
        { batalha: true, linhas: [
          'Cinco Encantados, um vento só. Vamos ver se o seu aguenta o meu até o fim.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 39, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 40, para: 'aldeiaCatavento', destino: { tx: 16, ty: 8, dir: 'baixo' } },

    /* as seis saídas disfarçadas: o lado errado de cada uma das seis
       forquilhas das três correntes. Pisar em qualquer uma delas devolve
       pro início do salão — guardas já vencidos continuam vencidos, só a
       travessia da corrente começa de novo. */
    { tx: 13, ty: 35, para: 'terreiroRodamoinho', destino: { tx: 7, ty: 39, dir: 'cima' } },
    { tx: 1,  ty: 28, para: 'terreiroRodamoinho', destino: { tx: 7, ty: 39, dir: 'cima' } },
    { tx: 13, ty: 24, para: 'terreiroRodamoinho', destino: { tx: 7, ty: 39, dir: 'cima' } },
    { tx: 13, ty: 17, para: 'terreiroRodamoinho', destino: { tx: 7, ty: 39, dir: 'cima' } },
    { tx: 1,  ty: 13, para: 'terreiroRodamoinho', destino: { tx: 7, ty: 39, dir: 'cima' } },
    { tx: 13, ty: 9,  para: 'terreiroRodamoinho', destino: { tx: 7, ty: 39, dir: 'cima' } },
  ],
};
