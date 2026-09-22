/* =========================================================================
   Charco Relampejante — o braço leste da Aldeia Tupã, e a mecânica nova da
   região: as CHAVES DE PARA-RAIO.

   A metade oeste é brejo aberto, com mato, poças e dois treinadores. A
   metade leste é o casarão dos para-raios: seis salas, três por duas,
   separadas por cercas de raio. Cada uma das três chaves (A, B e C) liga
   umas cercas e DESLIGA outras — não existe chave que só abra. O para-raio
   mestre, na sala do canto sudeste, acende a quarta conta da guia:
   `conta_para_raios`. Com ela acesa, todas as cercas se calam de vez.

   Nenhum código novo de motor: cada chave é um par de objetos `paraRaio`
   (um por estado, `se`/`seNao` na flag da chave, o mesmo molde do
   `achado`), e cada cerca é um `cercaRaio` condicionado às mesmas flags —
   quem remonta o mapa depois da fala é o mesmo `atualizarCenario()` que já
   fazia a barreira sumir depois do serviço.

       sala 0 ─A─ sala 1 ─C─ sala 2          (entra-se na sala 0 pelo oeste)
         │!C       │!A       │!C            ─X─ : a cerca abre quando X está
       sala 3 ─!B─ sala 4 ─B─ sala 5 (mestre)      ligada; !X, quando desligada
     chave A na sala 2, chave B na sala 3, chave C na sala 1.

   A solução mais curta pede SEIS toques de chave, e nenhum estado deixa
   ninguém preso: `mapas.test.ts` busca em largura sobre posição × chaves e
   prova as duas coisas a cada execução.

   Atrás do casarão, só alcançável pela cerca final (que some com a conta),
   mora o Arco-da-Velha — o Encantado exclusivo da região.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore (parede)   .  grama   ,  mato alto   ~  poça   a  lama/areia
     R  rocha (muro do casarão)   o  pedra   c  chão chamuscado
   ========================================================================= */
import type { DefMapa } from '../../world/tilemap.ts';

export const charcoRelampejante: DefMapa = {
  id: 'charcoRelampejante',
  nome: 'CHARCO RELAMPEJANTE',

  chao: [
    '##############################################################', // 0
    '#............................................................#', // 1
    '#.............,,,,,,,.........o..............................#', // 2
    '#.............,,,,,,,..............,,,,,,,,,,,,,,,,,,,,,.....#', // 3
    '#.............,,,,,,,.~~~~~........,,,,,,,,,,,,,,,,,,,,,.....#', // 4
    '#.,,,,,,,.....,,,,,,,.~~~~~........,,,,,,,,,,,,,,,,,,,,,.....#', // 5
    '#.,,,,,,,.aaa.,,,,,,,.~~~~~........,,,,,,,,,,,,,,,,,,,,,.....#', // 6
    '#.,,,,,,,.aaa................................................#', // 7
    '#.,,,,,,,.aaa................................................#', // 8
    '#.,,,,,,,.aaa..................RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#', // 9
    '#.................o....,,,,,,..R........R........R........R..#', // 10
    '#......................,,,,,,..R........R........R........R..#', // 11
    '#...~~~~~~.............,,,,,,.............................R..#', // 12
    '#...~~~~~~.............,,,,,,..R........R........R........R..#', // 13
    '#...~~~~~~..,,,,,,,,,..,,,,,,..R........R........R........R..#', // 14
    '#...~~~~~~..,,,,,,,,,..,,,,,,..R........R........R........R..#', // 15
    '#...........,,,,,,,,,..........RRRR.RRRRRRRR.RRRRRRRR.RRRRR..#', // 16
    '#.aaaaa.....,,,,,,,,,..........R........R........R........R..#', // 17
    '#.aaaaa.....,,,,,,,,,.....c....R........R........R........R..#', // 18
    '#.aaaaa.....,,,,,,,,,..........R........R........R........R..#', // 19
    '........................aaaaa..R.............................#', // 20
    '........................aaaaa..R........R........R........R~~#', // 21
    '#............cc.........aaaaa..R........R........R........R~~#', // 22
    '#........o..............aaaaa..RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#', // 23
    '#..,,,,,,,,.............aaaaa................................#', // 24
    '#..,,,,,,,,...~~~~~~.........................................#', // 25
    '#..,,,,,,,,...~~~~~~.............,,,,,,,,,,,,..,,,,,,,,,,,...#', // 26
    '#..,,,,,,,,...~~~~~~.............,,,,,,,,,,,,..,,,,,,,,,,,...#', // 27
    '#..,,,,,,,,...~~~~~~.........cc..,,,,,,,,,,,,..,,,,,,,,,,,...#', // 28
    '#..,,,,,,,,......................,,,,,,,,,,,,..,,,,,,,,,,,...#', // 29
    '#....................,,,,,,,,....,,,,,,,,,,,,..,,,,,,,,,,,...#', // 30
    '#....................,,,,,,,,....,,,,,,,,,,,,..,,,,,,,,,,,...#', // 31
    '#.....~~~~~~.........,,,,,,,,....,,,,,,,,,,,,................#', // 32
    '#.....~~~~~~....aaaa.,,,,,,,,....,,,,,,,,,,,,................#', // 33
    '#.....~~~~~~....aaaa.,,,,,,,,.............................c..#', // 34
    '#.....~~~~~~....aaaa.,,,,,,,,................cc.....o........#', // 35
    '#...............aaaa.......o............o....................#', // 36
    '#..c............aaaa.........................................#', // 37
    '#............................................................#', // 38
    '##############################################################', // 39
  ],

  objetos: [
    { tipo: 'placa', tx: 3, ty: 22,
      placa: 'CHARCO RELAMPEJANTE. O casarão dos para-raios fica a leste.' },
    { tipo: 'placa', tx: 29, ty: 11,
      placa: 'CASARÃO DOS PARA-RAIOS. Cada chave liga uma cerca e desliga outra. O mestre fica no fundo.' },

    /* as sete cercas entre as salas. Cada uma existe (e tranca) enquanto a
       condição dela para abrir NÃO vale, e nenhuma existe mais depois da
       conta — é isso que devolve o casarão inteiro para quem já resolveu */
    // sala 0 → 1: abre com A ligada
    { tipo: 'cercaRaio', tx: 40, ty: 12, larg: 1, seNao: ['chave_charco_a', 'conta_para_raios'] },
    // sala 1 → 2: abre com C ligada
    { tipo: 'cercaRaio', tx: 49, ty: 12, larg: 1, seNao: ['chave_charco_c', 'conta_para_raios'] },
    // sala 3 → 4: abre com B desligada
    { tipo: 'cercaRaio', tx: 40, ty: 20, larg: 1, se: 'chave_charco_b', seNao: 'conta_para_raios' },
    // sala 4 → 5: abre com B ligada
    { tipo: 'cercaRaio', tx: 49, ty: 20, larg: 1, seNao: ['chave_charco_b', 'conta_para_raios'] },
    // sala 0 → 3: abre com C desligada
    { tipo: 'cercaRaio', tx: 35, ty: 16, larg: 1, se: 'chave_charco_c', seNao: 'conta_para_raios' },
    // sala 1 → 4: abre com A desligada
    { tipo: 'cercaRaio', tx: 44, ty: 16, larg: 1, se: 'chave_charco_a', seNao: 'conta_para_raios' },
    // sala 2 → 5: abre com C desligada
    { tipo: 'cercaRaio', tx: 53, ty: 16, larg: 1, se: 'chave_charco_c', seNao: 'conta_para_raios' },
    // sala 5 → fundos do casarão: só depois do para-raio mestre
    { tipo: 'cercaRaio', tx: 58, ty: 20, larg: 1, seNao: 'conta_para_raios' },

    /* as três chaves: um objeto por estado, a fala troca a flag */
    { tipo: 'paraRaio', tx: 56, ty: 11, larg: 1, placa: 'CHAVE A', se: 'chave_charco_a',
      falas: [{ desliga: 'chave_charco_a', linhas: [
        'Você baixa a CHAVE A. A ponta do para-raio apaga.',
        'Em algum lugar do casarão, uma cerca se cala e outra volta a estalar.'] }] },
    { tipo: 'paraRaio', tx: 56, ty: 11, larg: 1, placa: 'CHAVE A', seNao: 'chave_charco_a', vazio: true,
      falas: [{ liga: 'chave_charco_a', linhas: [
        'Você ergue a CHAVE A. A ponta do para-raio acende amarela.',
        'Em algum lugar do casarão, uma cerca se cala e outra volta a estalar.'] }] },
    { tipo: 'paraRaio', tx: 33, ty: 21, larg: 1, placa: 'CHAVE B', se: 'chave_charco_b',
      falas: [{ desliga: 'chave_charco_b', linhas: [
        'Você baixa a CHAVE B. A ponta do para-raio apaga.',
        'Em algum lugar do casarão, uma cerca se cala e outra volta a estalar.'] }] },
    { tipo: 'paraRaio', tx: 33, ty: 21, larg: 1, placa: 'CHAVE B', seNao: 'chave_charco_b', vazio: true,
      falas: [{ liga: 'chave_charco_b', linhas: [
        'Você ergue a CHAVE B. A ponta do para-raio acende amarela.',
        'Em algum lugar do casarão, uma cerca se cala e outra volta a estalar.'] }] },
    { tipo: 'paraRaio', tx: 46, ty: 11, larg: 1, placa: 'CHAVE C', se: 'chave_charco_c',
      falas: [{ desliga: 'chave_charco_c', linhas: [
        'Você baixa a CHAVE C. A ponta do para-raio apaga.',
        'Em algum lugar do casarão, duas cercas se calam e outra volta a estalar.'] }] },
    { tipo: 'paraRaio', tx: 46, ty: 11, larg: 1, placa: 'CHAVE C', seNao: 'chave_charco_c', vazio: true,
      falas: [{ liga: 'chave_charco_c', linhas: [
        'Você ergue a CHAVE C. A ponta do para-raio acende amarela.',
        'Em algum lugar do casarão, uma cerca se cala e outras duas voltam a estalar.'] }] },

    /* o para-raio mestre: a quarta conta da guia */
    { tipo: 'paraRaio', tx: 55, ty: 18, larg: 1, placa: 'PARA-RAIO MESTRE', se: 'conta_para_raios',
      falas: [{ linhas: [
        'O para-raio mestre brilha sozinho. As cercas do casarão estão todas caladas.'] }] },
    { tipo: 'paraRaio', tx: 55, ty: 18, larg: 1, placa: 'PARA-RAIO MESTRE', seNao: 'conta_para_raios',
      vazio: true,
      falas: [{ liga: 'conta_para_raios', linhas: [
        'Você encosta a mão no para-raio mestre. Um estalo corre o casarão inteiro,',
        'de sala em sala, e todas as cercas se calam de uma vez.',
        'Lá fora, o céu responde com um trovão comprido.'] }] },

    /* a quarta pedra-de-raio e a segunda pena de trovão */
    { tipo: 'achado', tx: 3, ty: 3, solido: false, placa: 'PEDRA-DE-RAIO',
      se: 'achou_pedra_raio_4', vazio: true,
      falas: [{ linhas: ['Só ficou a marca queimada na lama.'] }] },
    { tipo: 'achado', tx: 3, ty: 3, solido: false, placa: 'PEDRA-DE-RAIO',
      seNao: 'achou_pedra_raio_4',
      falas: [{ liga: 'achou_pedra_raio_4', da: { item: 'pedra_raio' }, linhas: [
        'Meio afundada na lama do canto, ainda chiando: uma PEDRA-DE-RAIO.'] }] },
    { tipo: 'achado', tx: 59, ty: 37, solido: false, placa: 'PENA DE TROVÃO',
      se: 'achou_pena_trovao_charco', vazio: true,
      falas: [{ linhas: ['Não sobrou nada aqui.'] }] },
    { tipo: 'achado', tx: 59, ty: 37, solido: false, placa: 'PENA DE TROVÃO',
      seNao: 'achou_pena_trovao_charco',
      falas: [{ liga: 'achou_pena_trovao_charco', da: { item: 'pena_trovao' }, linhas: [
        'Boiando numa poça rasa sem se molhar: uma PENA DE TROVÃO.'] }] },
  ],

  npcs: [
    {
      id: 'raizeiro_charco', nome: 'RAIZEIRO', estilo: 'pescador',
      tx: 12, ty: 8, dir: 'baixo',
      treinador: {
        classe: 'RAIZEIRO DO CHARCO', visao: 4, premio: 1800,
        esperta: true, itens: { garrafada: 2 },
        time: [{ especie: 'piragua', nivel: 46 }, { especie: 'faisquinha', nivel: 46 },
               { especie: 'tatuTrovao', nivel: 47 }],
        falaInicio: 'Anda no charco sem pisar em poça? Então anda na minha frente também.',
        falaDerrota: 'Pisou firme. O casarão fica a leste — lá dentro o chão não muda, mas as cercas sim.',
      },
      falas: [
        { se: 'venceu_raizeiro_charco', linhas: [
          'Dica de graça: cada chave do casarão liga uma cerca e desliga outra. Nunca só abre.'] },
        { batalha: true, linhas: [
          'O charco é meu de colher raiz. Quem passa por aqui me paga uma batalha.'] },
      ],
    },
    {
      id: 'pescadora_charco', nome: 'PESCADORA', estilo: 'pescador',
      tx: 20, ty: 31, dir: 'cima',
      treinador: {
        classe: 'PESCADORA DE RAIO', visao: 4, premio: 2000,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'iaraMae', nivel: 47 }, { especie: 'relampo', nivel: 47 },
               { especie: 'piragua', nivel: 47 }, { especie: 'relampo', nivel: 48 }],
        falaInicio: 'Pesco com linha de cobre em noite de tempestade. Quer ver o que sobe?',
        falaDerrota: 'Linha partida. O charco ainda tem uma pena de trovão lá pro sudeste, sabia?',
      },
      falas: [
        { se: 'venceu_pescadora_charco', linhas: [
          'Chuva boa essa de hoje. Os Relampos gostam.'] },
        { batalha: true, linhas: [
          'Água e raio, os dois no mesmo anzol. Vem.'] },
      ],
    },
    {
      id: 'arco_da_velha', nome: 'ARCO-DA-VELHA', estilo: 'bicho:arcoDaVelha',
      tx: 60, ty: 11, dir: 'baixo', seNao: 'servico_arco',
      falas: [
        /* precisa das três penas de trovão E da medalha: é conteúdo de
           depois do Guaraci, e o único jeito de ter o Encantado exclusivo */
        { se: ['servico_penas_trovao', 'medalha:trovao'], liga: 'servico_arco',
          encantado: { especie: 'arcoDaVelha', nivel: 35 }, linhas: [
          'A chuva para de repente, e as duas pontas de um arco-íris descem até a poça atrás do casarão.',
          '— A rede de penas chamou a chuva certa. Quem faz isso, eu acompanho.',
          'O ARCO-DA-VELHA se enrosca no seu patuá e vai com você.'] },
        { se: 'medalha:trovao', linhas: [
          'Uma ponta de arco-íris toca a poça e some antes de você chegar perto.',
          'Dizem que ele só desce quando a Tecelã fecha a rede de chamar chuva.'] },
        { linhas: [
          'Um brilho de sete cores treme em cima da poça, fraco demais pra ter forma.',
          'Não é reflexo. É alguma coisa esperando a chuva certa.'] },
      ],
    },
  ],

  inicio: { tx: 1, ty: 20, dir: 'dir' },

  saidas: [
    { tx: 0, ty: 20, para: 'aldeiaTupa', destino: { tx: 54, ty: 20, dir: 'esq' } },
    { tx: 0, ty: 21, para: 'aldeiaTupa', destino: { tx: 54, ty: 21, dir: 'esq' } },
  ],

  cenario: 'praia',
  passosPorEncontro: 9,
  encontros: [
    { especie: 'faisquinha', min: 45, max: 47, peso: 35 },
    { especie: 'tatuTrovao', min: 45, max: 48, peso: 20 },
    { especie: 'piragua', min: 45, max: 47, peso: 25 },
    { especie: 'relampo', min: 46, max: 48, peso: 20 },
  ],
};
