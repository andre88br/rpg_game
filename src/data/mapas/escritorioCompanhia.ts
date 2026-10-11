/* Escritório da Companhia — o ato final da trilha, na praça baixa da Cidade
   do Sol. A visão do Oráculo (`conta_oraculo`) diz onde fica a sala: antes
   dela, o Doutor Ferraz só manda a visita embora. Depois, ele luta, e
   vencido toca a cutscene `ferraz` — o mapa de X rasgado e a Companhia
   recolhendo as estacas. O Baloeiro só sobe para o Círculo com
   `venceu_ferraz`. */
import type { DefMapa } from '../../world/tilemap.ts';

export const escritorioCompanhia: DefMapa = {
  id: 'escritorioCompanhia',
  nome: 'ESCRITÓRIO DA COMPANHIA',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWWWW',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_____TTTTT_____W',
    'W_____TTTTT_____W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______T_______W',
    'WWWWWWWWWWWWWWWWW',
  ],

  objetos: [
    { tipo: 'estante', tx: 1,  ty: 1, larg: 4 },
    { tipo: 'estante', tx: 12, ty: 1, larg: 4 },
    { tipo: 'mesa',    tx: 6,  ty: 2, larg: 5 },
  ],

  npcs: [
    {
      id: 'ferraz', nome: 'DOUTOR FERRAZ', estilo: 'ferraz',
      /* atrás da mesa, com o mapa dos X aberto em cima dela. Vencido, a
         cutscene `ferraz` mostra o mapa rasgado, e ele some da sala */
      tx: 8, ty: 1, dir: 'baixo', seNao: 'venceu_ferraz',
      treinador: {
        classe: 'GERENTE DA COMPANHIA', premio: 6000, liga: 'companhia_luz',
        cutscene: 'ferraz', esperta: true,
        itens: { garrafada_forte: 2, garrafada_santa: 1 },
        time: [{ especie: 'minhoquinha', nivel: 65 }, { especie: 'mulinha', nivel: 65 },
               { especie: 'lobinho', nivel: 66 }, { especie: 'corpoSeco', nivel: 66 },
               { especie: 'mapinguari', nivel: 67 }],
        falaInicio: 'Papel carimbado vale mais que lenda de avó. Vou te mostrar quanto vale.',
        falaDerrota: '...Não pode. Eu tenho o papel. Eu tenho o carimbo...',
      },
      falas: [
        { seNao: 'conta_oraculo', linhas: [
          'Escritório fechado pra visita, {crianca}. Volta quando tiver papel carimbado.'] },
        { batalha: true, linhas: [
          'Então foi você que andou desmanchando o meu serviço, região por região.',
          'Estaca arrancada, X lavado, forno apagado, draga parada... Meus homens voltam de mão vazia.',
          'Mas o mapa ainda é meu. Cada X aqui é terra comprada.'] },
      ],
    },
    {
      id: 'escrivao', nome: 'ESCRIVÃO', estilo: 'aldeao',
      tx: 14, ty: 6, dir: 'esq',
      falas: [
        { se: 'venceu_ferraz', linhas: [
          'O Doutor foi embora de lancha, sem levar nem o chapéu.',
          'Vou devolver as escrituras uma por uma. A Companhia acabou por aqui.'] },
        { se: 'conta_oraculo', linhas: [
          'Eu só carimbo o que me mandam. Mas cada carimbo desse é um rio a menos...'] },
        { linhas: ['A Companhia Mata-Seca não atende sem hora marcada.'] },
      ],
    },
  ],

  inicio: { tx: 8, ty: 9, dir: 'cima' },

  saidas: [
    { tx: 8, ty: 10, para: 'cidadeDoSol', destino: { tx: 33, ty: 37, dir: 'baixo' } },
  ],
};
