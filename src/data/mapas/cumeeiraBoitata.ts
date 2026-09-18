/* Cumeeira do Boitatá — o topo da Serra Boitatá.
   Um anel de lava cerca o miolo do platô; quem quer o que está do outro
   lado tem que dar a volta pelo corredor a oeste. É lá, protegido pelo
   próprio anel, que se escondeu um dos três sinos de bronze da capela.
   Mais ao sul, a Mula-sem-Cabeça corre a cumeeira inteira — a quinta e
   última conta da guia de fogo.
   A gride é editável à mão, um caractere por tile de 16x16:
     c  cinza batida   n  capim seco (encontros)   L  lava   o  pedra      */
import type { DefMapa } from '../../world/tilemap.ts';

export const cumeeiraBoitata: DefMapa = {
  id: 'cumeeiraBoitata',
  nome: 'CUMEEIRA DO BOITATÁ',

  chao: [
    'RRRRRRRRRRRRRRRRccRRRRRRRRRRRRRR',
    'RccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccR',
    'RcccoccccccccccccccccccccccocccR',
    'RccccccccccccccLLLcccccccccccccR',
    'RccccccccccccLLcccLLcccccccccccR',
    'RccccccccccccLcccccLcccccccccccR',
    'RcccccccccccccccccccLccccccccccR',
    'RcccccccccccccccccccLccccccccccR',
    'RcccccccccccccccccccLccccccccccR',
    'RccccccccccccLcccccLcccccccccccR',
    'RccccccccccccLLcccLLcccccccccccR',
    'RccccccccccccccLLLcccccccccccccR',
    'RcccoccccccccccccccccccccccocccR',
    'RccccccccccccccccccccccccccccccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccnnnnnnnnccccccccccnnnnnnnnccR',
    'RccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccR',
    'RccccccccccccccccccccccccccccccR',
    'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
  ],

  objetos: [
    { tipo: 'placa', tx: 19, ty: 1,
      placa: 'CUMEEIRA DO BOITATÁ. A serra acaba aqui — o que vem depois é outra história.' },
    { tipo: 'placa', tx: 19, ty: 9,
      placa: 'O anel de lava não se atravessa. A volta é pelo corredor a oeste.' },

    /* o sino escondido atrás do anel de lava — um dos três de servico_sinos */
    { tipo: 'achado', tx: 12, ty: 17, solido: false, placa: 'SINO DE BRONZE',
      se: 'achou_sino_cumeeira', vazio: true,
      falas: [{ linhas: ['O caco de barro está vazio agora.'] }] },
    { tipo: 'achado', tx: 12, ty: 17, solido: false, placa: 'SINO DE BRONZE',
      seNao: 'achou_sino_cumeeira',
      falas: [{ liga: ['achou_sino_cumeeira', 'sino_cumeeira'], da: { item: 'sino' }, linhas: [
        'Escondido bem no meio da volta do anel de lava: um SINO DE BRONZE, sem badalo.',
        'Toca sozinho quando venta forte — dizem que os três juntos tocam sem vento nenhum.'] }] },
  ],

  npcs: [
    {
      id: 'vigia', nome: 'VIGIA DA CUMEEIRA', estilo: 'aldeao',
      tx: 16, ty: 5, dir: 'baixo',
      treinador: {
        classe: 'VIGIA DA CUMEEIRA', visao: 5, premio: 2200,
        esperta: true, itens: { garrafada_forte: 2, erva_doce: 1 },
        time: [{ especie: 'mulaSemCabeca', nivel: 31 }, { especie: 'cabraCabriola', nivel: 31 },
               { especie: 'boitatao', nivel: 32 }],
        falaInicio: 'Ninguém sobe até aqui sem eu ver primeiro. Vamos ver se você é páreo.',
        falaDerrota: 'Suba com cuidado. A dona da cumeeira não é tão gentil quanto eu.',
      },
      falas: [
        { batalha: true, linhas: [
          'A cumeeira inteira é minha de vigiar. E você, {crianca}, eu não conhecia.'] },
      ],
    },
    {
      id: 'mula_cumeeira', nome: 'MULA-SEM-CABEÇA', estilo: 'bicho:mulaSemCabeca',
      tx: 16, ty: 26, dir: 'cima', seNao: 'conta_mula',
      treinador: {
        classe: 'BICHO DA CUMEEIRA', selvagem: true, visao: 4, liga: 'conta_mula',
        time: [{ especie: 'mulaSemCabeca', nivel: 34 }],
        falaInicio: 'O casco de fogo bate na pedra antes mesmo de ela aparecer.',
      },
      falas: [
        { batalha: true, linhas: [
          'Corre a cumeeira inteira numa passada só, sem cabeça nem pescoço.',
          'Só o fogo do pescoço mostra por onde ela vem.'] },
      ],
    },
  ],

  inicio: { tx: 16, ty: 1, dir: 'baixo' },

  saidas: [
    { tx: 16, ty: 0, para: 'cavernaBoitata', destino: { tx: 16, ty: 36, dir: 'cima' } },
    { tx: 17, ty: 0, para: 'cavernaBoitata', destino: { tx: 17, ty: 36, dir: 'cima' } },
  ],

  cenario: 'caverna',
  passosPorEncontro: 8,
  encontros: [
    { especie: 'mulinha', min: 28, max: 31, peso: 30 },
    { especie: 'boitatinha', min: 28, max: 31, peso: 28 },
    { especie: 'salamanca', min: 29, max: 32, peso: 27 },
    { especie: 'cabraCabriola', min: 31, max: 33, peso: 15 },
  ],
};
