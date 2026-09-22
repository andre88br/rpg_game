/* Topo do Redemoinho — o alto da Serra... do Campo do Saci. Sem saída ao
   sul: quem sobe até aqui só tem um motivo, e ele mora no meio do redemoinho
   de vento que gira sozinho perto do fim do platô. Depois do Pererê, um vão
   se abre na parede LESTE (linhas 12-13) para a Campina dos Raios — a
   entrada da Aldeia Tupã, a primeira região que cresce para os lados. A Sentinela do Vento
   guarda a subida; a Matinta que mora no olho do redemoinho é a quinta e
   última conta da guia — `conta_redemoinho`.
   As correntes ('V') em volta do redemoinho são só paisagem: não travam
   nada, o corredor central (colunas 16-17) fica sempre limpo.
   A gride é editável à mão, um caractere por tile de 16x16:
     #  árvore/pedra (parede)   .  grama (chão)
     ,  mato alto (encontro)    o  pedra (obstáculo solto)
     V  corrente de vento (decorativa aqui — ver world/tilemap.ts)        */
import type { DefMapa } from '../../world/tilemap.ts';

export const topoDoRedemoinho: DefMapa = {
  id: 'topoDoRedemoinho',
  nome: 'TOPO DO REDEMOINHO',

  chao: [
    '################..###############',
    '#.........,.....................#',
    '#.o.......,.....,,......,.......#',
    '#..o.....,.......oo......,...,..#',
    '#.....,........,.....,..,..,....#',
    '#...............................#',
    '#.....,.......,....,........,...#',
    '#.......,.....,...,..........,..#',
    '#..,.................o.,........#',
    '#.,.,..................,......,.#',
    '#...........,....,..,...........#',
    '#...............................#',
    '#...........o.,.......,..........',
    '#....,,...........o..............',
    '#......,...,.,.......,...,......#',
    '#.............o.,............,,.#',
    '#.o..,.............,.,..........#',
    '#.....,,........................#',
    '#...,,,.....o.........,.....,...#',
    '#..,.......................,....#',
    '#...........,.,.................#',
    '#...............................#',
    '#............,..................#',
    '#......,......................,.#',
    '#.............................o.#',
    '#...........VV,V..VVV...........#',
    '#...,,......VVVo..VVV..####..,..#',
    '#.......,...VVVV..V,V..#..#,....#',
    '#...........VV,V..VVV..#..#.,...#',
    '#........,..VVV,..V,V..#..#.....#',
    '#..........,VVVV..VVV...........#',
    '#......o........................#',
    '#........,..............,,..o,..#',
    '#################################',
  ],

  objetos: [
    { tipo: 'placa', tx: 19, ty: 1,
      placa: 'TOPO DO REDEMOINHO. O vento aqui em cima gira sozinho, e não para nunca.' },
    /* o vão leste: só abre para quem já tem a Medalha Rodamoinho */
    { tipo: 'barreira', tx: 32, ty: 12, larg: 1, seNao: 'medalha:rodamoinho' },
    { tipo: 'barreira', tx: 32, ty: 13, larg: 1, seNao: 'medalha:rodamoinho' },
    { tipo: 'placa', tx: 30, ty: 10,
      placa: 'A leste, a Campina dos Raios e a Aldeia Tupã. Só passa quem traz a Medalha Rodamoinho.' },
    { tipo: 'placa', tx: 19, ty: 24,
      placa: 'O olho do redemoinho fica logo à frente. Alguma coisa mora nele.' },

    /* o terceiro e último capim dourado — serviço opcional da região */
    { tipo: 'achado', tx: 25, ty: 6, solido: false, placa: 'CAPIM DOURADO',
      se: 'achou_capim_topo', vazio: true,
      falas: [{ linhas: ['A touceira está murcha agora.'] }] },
    { tipo: 'achado', tx: 25, ty: 6, solido: false, placa: 'CAPIM DOURADO',
      seNao: 'achou_capim_topo',
      falas: [{ liga: 'achou_capim_topo', da: { item: 'capim_dourado' }, linhas: [
        'No ponto mais alto e mais batido pelo vento: o terceiro CAPIM DOURADO.',
        'Os três juntos, dizem, atraem o que ninguém nunca viu.'] }] },

    /* bolso opcional, sem nada a ver com a guia: o Dom Rajada sopra o
       monte de folhas e libera um canto que ninguém alcançava antes dele */
    { tipo: 'monteFolhas', tx: 24, ty: 29, larg: 2, seNao: 'dom_rajada' },
    { tipo: 'achado', tx: 24, ty: 27, solido: false, placa: 'ESCONDERIJO',
      se: 'achou_esconderijo_topo', vazio: true,
      falas: [{ linhas: ['O canto está vazio agora.'] }] },
    { tipo: 'achado', tx: 24, ty: 27, solido: false, placa: 'ESCONDERIJO',
      seNao: 'achou_esconderijo_topo',
      falas: [{ liga: 'achou_esconderijo_topo', da: { item: 'patua_bom', n: 2 }, linhas: [
        'Atrás do monte de folhas, escondido do vento: um canto seco com dois PATUÁ BOM.',
        'Ninguém alcançava esse canto antes do Dom Rajada.'] }] },
  ],

  npcs: [
    {
      id: 'sentinela_topo', nome: 'SENTINELA DO VENTO', estilo: 'aldeao',
      tx: 16, ty: 11, dir: 'baixo',
      treinador: {
        classe: 'SENTINELA DO VENTO', visao: 5, premio: 2400,
        esperta: true, itens: { garrafada_forte: 2, erva_doce: 1 },
        time: [{ especie: 'saci', nivel: 43 }, { especie: 'cabraCabriola', nivel: 43 },
               { especie: 'matinta', nivel: 44 }],
        falaInicio: 'Ninguém chega perto do redemoinho sem eu ver primeiro. Vamos ver se você é páreo.',
        falaDerrota: 'Suba com cuidado. O que mora no olho do vento não é tão gentil quanto eu.',
      },
      falas: [
        { batalha: true, linhas: [
          'O topo inteiro é meu de vigiar. E você, {crianca}, eu não conhecia.'] },
      ],
    },
    {
      id: 'matinta_topo', nome: 'MATINTA', estilo: 'bicho:matinta',
      tx: 16, ty: 27, dir: 'baixo', seNao: 'conta_redemoinho',
      treinador: {
        classe: 'DONA DO REDEMOINHO', selvagem: true, visao: 4, liga: 'conta_redemoinho',
        time: [{ especie: 'matinta', nivel: 45 }],
        falaInicio: 'No meio do redemoinho, os olhos amarelos abrem antes do resto do corpo aparecer.',
      },
      falas: [
        { batalha: true, linhas: [
          'Gira a vida inteira sem sair do lugar. Só o vento em volta prova que ela está ali.'] },
      ],
    },
  ],

  inicio: { tx: 16, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 16, ty: 0, para: 'aldeiaCatavento', destino: { tx: 16, ty: 31, dir: 'cima' } },
    { tx: 17, ty: 0, para: 'aldeiaCatavento', destino: { tx: 17, ty: 31, dir: 'cima' } },
    { tx: 32, ty: 12, para: 'campinaDosRaios', destino: { tx: 1, ty: 16, dir: 'dir' } },
    { tx: 32, ty: 13, para: 'campinaDosRaios', destino: { tx: 1, ty: 17, dir: 'dir' } },
  ],

  cenario: 'mata',
  passosPorEncontro: 8,
  encontros: [
    { especie: 'saci', min: 42, max: 45, peso: 40 },
    { especie: 'matinta', min: 42, max: 45, peso: 30 },
    { especie: 'cabraCabriola', min: 41, max: 44, peso: 20 },
    { especie: 'cabritinha', min: 40, max: 43, peso: 10 },
  ],
};
