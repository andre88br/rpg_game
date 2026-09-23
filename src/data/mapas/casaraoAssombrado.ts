/* =========================================================================
   Casarão Assombrado — o braço oeste do Bairro da Cuca, depois do Zeca.

   No breu (o raio da luz é o de quem entra: Tocha, ou a Visão Noturna
   depois da Medalha Breu). A tarefa nova daqui são os LADRILHOS DE MEMÓRIA:
   na sala do sul, seis ladrilhos com símbolos (lua, coruja, gato, vela,
   chave e caveira). Pisar em quatro deles na ordem certa acende
   `conta_ladrilhos` e tira a barreira da passagem para a ala oeste; fora da
   ordem, tudo se apaga e recomeça (game/sequencia.ts). A ordem não está
   escrita em lugar nenhum: está nos quatro QUADROS do salão dos retratos,
   em forma de adivinha. A ala oeste sobe ao sótão, onde mora a Cuca.
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const casaraoAssombrado: DefMapa = {
  id: 'casaraoAssombrado',
  nome: 'CASARÃO ASSOMBRADO',
  interior: true,
  escuro: {},

  chao: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 0
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 1
    'WWWWWWWWWWWWWWWWWWWW_____________________WWWWWWW', // 2
    'WWWWWWWWWWWWWWWWWWWW_____________________WWWWWWW', // 3
    'WWWW____________WWWW__________________________WW', // 4
    'WWWW____________WWWW__________________________WW', // 5
    'WWWW__________________________________________WW', // 6
    'WWWW__________________________________________WW', // 7
    'WWWW____________WWWW_____________________WWWWWWW', // 8
    'WWWW____________WWWW_____________________WWWWWWW', // 9
    'WWWW____________WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 10
    'WWWW____________WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 11
    'WWWW____________WWWW________WWWWWWWWWWWWWWWWWWWW', // 12
    'WWWW____________WWWW________WWWWWWWWWWWWWWWWWWWW', // 13
    'WWWW____________WWWW________WWWWWWWWWWWWWWWWWWWW', // 14
    'WWWW____________WWWW________WWWWWWWWWW_________W', // 15
    'WWWW____________WWWW________WWWWWWWWWW_________W', // 16
    'WWWW____________WWWW____________________________', // 17
    'WWWW____________WWWW____________________________', // 18
    'WWWW____________WWWW________WWWWWWWWWW_________W', // 19
    'WWWW____________WWWW________WWWWWWWWWW_________W', // 20
    'WWWW____________WWWW________WWWWWWWWWWWWWWWWWWWW', // 21
    'WWWW____________WWWW________WWWWWWWWWWWWWWWWWWWW', // 22
    'WWWW____________WWWW________WWWWWWWWWWWWWWWWWWWW', // 23
    'WWWWWWWWWWWW__WWWWWWWW__WWWWWWWWWWWWWWWWWWWWWWWW', // 24
    'WWWWWWWWWWWW__WWWWWWWW__WWWWWWWWWWWWWWWWWWWWWWWW', // 25
    'WWWWWWWWWWWW__WWWWWWWW__WWWWWWWWWWWWWWWWWWWWWWWW', // 26
    'WWWWWWWWWWWW__WWWWWWWW__WWWWWWWWWWWWWWWWWWWWWWWW', // 27
    'WWWWWWWWWWWW______________________WWWWWWWWWWWWWW', // 28
    'WWWWWWWWWWWW______________________WWWWWWWWWWWWWW', // 29
    'WWWWWWWWWWWW______________________WWWWWWWWWWWWWW', // 30
    'WWWWWWWWWWWW____________TTTTTTTT__WWWWWWWWWWWWWW', // 31
    'WWWWWWWWWWWW____________TTTTTTTT__WWWWWWWWWWWWWW', // 32
    'WWWWWWWWWWWW____________TTTTTTTT__WWWWWWWWWWWWWW', // 33
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 34
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 35
  ],

  sequencia: { ordem: ['lua', 'coruja', 'gato', 'vela'], flag: 'conta_ladrilhos' },

  objetos: [
    { tipo: 'placa', tx: 40, ty: 15,
      placa: 'Nesta casa, quem não sabe a ordem das coisas não passa da sala de baixo.' },
    /* as pistas, penduradas no salão dos retratos */
    { tipo: 'placa', tx: 21, ty: 13,
      placa: 'QUADRO 1. Primeiro, o que clareia a noite sem nunca queimar.' },
    { tipo: 'placa', tx: 26, ty: 13,
      placa: 'QUADRO 2. Depois, quem vigia a noite inteira de olhos abertos.' },
    { tipo: 'placa', tx: 21, ty: 22,
      placa: 'QUADRO 3. Então, quem tem sete vidas e nenhuma pressa.' },
    { tipo: 'placa', tx: 26, ty: 22,
      placa: 'QUADRO 4. Por fim, o que se apaga com um sopro.' },
    /* os seis ladrilhos da sala do sul */
    { tipo: 'ladrilho', tx: 15, ty: 29, simbolo: 'gato' },
    { tipo: 'ladrilho', tx: 18, ty: 31, simbolo: 'lua' },
    { tipo: 'ladrilho', tx: 21, ty: 29, simbolo: 'caveira' },
    { tipo: 'ladrilho', tx: 27, ty: 29, simbolo: 'vela' },
    { tipo: 'ladrilho', tx: 30, ty: 31, simbolo: 'coruja' },
    { tipo: 'ladrilho', tx: 15, ty: 32, simbolo: 'chave' },
    /* a passagem da sala dos ladrilhos para a ala oeste */
    { tipo: 'barreira', tx: 12, ty: 24, larg: 2, seNao: 'conta_ladrilhos' },

    /* o segundo retrato, na ala oeste */
    { tipo: 'achado', tx: 5, ty: 5, solido: false, placa: 'RETRATO', se: 'achou_retrato_casarao', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 5, ty: 5, solido: false, placa: 'RETRATO', seNao: 'achou_retrato_casarao',
      falas: [{ liga: 'achou_retrato_casarao', da: { item: 'retrato' }, linhas: [
        'Pendurado torto na parede da ala oeste, coberto de pó: um RETRATO ANTIGO.',
        'A Velha do bairro procura três destes.'] }] },
  ],

  npcs: [
    {
      id: 'cuca_sotao', nome: 'CUCA', estilo: 'bicho:cuca',
      tx: 30, ty: 5, dir: 'esq', seNao: 'conta_cuca',
      treinador: {
        classe: 'DONA DO SÓTÃO', selvagem: true, visao: 4, liga: 'conta_cuca',
        time: [{ especie: 'cuca', nivel: 58 }],
        falaInicio: 'Uma cantiga de ninar começa baixinho, e o focinho de jacaré aparece antes da voz de velha.',
      },
      falas: [
        { batalha: true, linhas: [
          '"Dorme, neném, que a Cuca vem pegar..." — e ela vem.'] },
      ],
    },
    {
      id: 'pisadeira_telhado', nome: 'PISADEIRA', estilo: 'bicho:pisadeira',
      tx: 44, ty: 5, dir: 'esq', seNao: 'servico_pisadeira',
      falas: [
        { se: ['servico_retratos', 'medalha:breu'], liga: 'servico_pisadeira',
          encantado: { especie: 'pisadeira', nivel: 40 }, linhas: [
          'Um vulto magro desce pela beira do telhado, sem fazer barulho nenhum.',
          '— Os três retratos de volta na parede. Quem cuida dos mortos assim, eu acompanho.',
          'A PISADEIRA desce do telhado e vai com você.'] },
        { se: 'medalha:breu', linhas: [
          'Umas unhas compridas raspam o telhado e somem.',
          'A Velha do bairro disse: quem junta os três retratos, a Pisadeira vem espiar.'] },
        { linhas: [
          'Alguma coisa anda no telhado, bem em cima da sua cabeça.',
          'Para quando você para. Anda quando você anda.'] },
      ],
    },
  ],

  inicio: { tx: 46, ty: 17, dir: 'esq' },

  saidas: [
    { tx: 47, ty: 17, para: 'bairroDaCuca', destino: { tx: 1, ty: 20, dir: 'dir' } },
    { tx: 47, ty: 18, para: 'bairroDaCuca', destino: { tx: 1, ty: 21, dir: 'dir' } },
  ],

  cenario: 'caverna',
};
