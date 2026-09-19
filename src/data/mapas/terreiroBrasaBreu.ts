/* Terreiro de Brasa — sala 3 de 4, o breu.
   O mesmo quebra-cabeça da escória, cara nova: agora no escuro de
   verdade, com o Guarda do Breu esperando do outro lado. É onde o pedido
   do usuário — um caminho longo até o mestre — e as duas mecânicas da
   região se encontram de vez.

   Vale aqui a mesma ORIENTAÇÃO da escória: entra-se pelo sul, logo a pedra
   fica ABAIXO da cova em cada corredor. Ver o comentário completo em
   terreiroBrasaEscoria.ts. */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroBrasaBreu: DefMapa = {
  id: 'terreiroBrasaBreu',
  nome: 'TERREIRO DE BRASA — BREU',
  interior: true,
  escuro: { raio: 22, fixo: true },

  chao: [
    'WWWWWWWW_WWWWWWWW',
    'W_______________W',
    'WWWWW_WWWWW_WWWWW',
    'WWWWW_WWWWW_WWWWW',
    'WWWWW_WWWWW_WWWWW',
    'WWWWW_WWWWW_WWWWW',
    'WWWWW_WWWWW_WWWWW',
    'WWWWW_WWWWW_WWWWW',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'W_______________W',
    'WWWWWWWW_WWWWWWWW',
  ],

  objetos: [
    { tipo: 'barreira', tx: 8, ty: 0, larg: 1, seNao: 'venceu_guarda_breu' },
    { tipo: 'cova', tx: 5, ty: 3, seNao: 'cova_fundo_a' },
    { tipo: 'entulho', tx: 5, ty: 3, se: 'cova_fundo_a', solido: false },
    { tipo: 'cova', tx: 11, ty: 3, seNao: 'cova_fundo_b' },
    { tipo: 'entulho', tx: 11, ty: 3, se: 'cova_fundo_b', solido: false },
  ],

  pedras: [
    { tx: 5, ty: 6, cova: 'cova_fundo_a' },
    { tx: 11, ty: 6, cova: 'cova_fundo_b' },
  ],

  npcs: [
    {
      id: 'guarda_breu', nome: 'GUARDA DO BREU', estilo: 'aldeao',
      tx: 8, ty: 9, dir: 'baixo',
      treinador: {
        classe: 'GUARDA DO BREU', visao: 4, premio: 1800,
        esperta: true, itens: { garrafada_forte: 1 },
        time: [{ especie: 'mulaSemCabeca', nivel: 32 }, { especie: 'boitatao', nivel: 32 },
               { especie: 'salamanca', nivel: 33 }],
        falaInicio: 'Ninguém enxerga nada aqui, mas eu já não preciso mais.',
        falaDerrota: 'Enxergou o suficiente. O salão do Brás é logo ali.',
      },
      falas: [
        { se: 'venceu_guarda_breu', linhas: [
          'O Brás está esperando. Não demore — ele não gosta disso.'] },
        { batalha: true, linhas: [
          'No escuro, ninguém vê o golpe chegar. Vamos ver se você aguenta.'] },
      ],
    },
  ],

  inicio: { tx: 8, ty: 15, dir: 'cima' },

  saidas: [
    /* cai ao lado da Sopradora, que fica em (7,1) */
    { tx: 8, ty: 16, para: 'terreiroBrasaEscoria', destino: { tx: 9, ty: 1, dir: 'baixo' } },
    { tx: 8, ty: 0,  para: 'terreiroBrasaSalao', destino: { tx: 7, ty: 13, dir: 'cima' } },
  ],
};
