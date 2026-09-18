/* Terreiro de Brasa — sala 1 de 4, o pátio.
   O Zelador barra a saída norte até ser vencido: é o primeiro dos três
   guardas que separam a porta da vila do próprio Brás — o caminho longo
   que o terreiro pediu. */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroBrasaPatio: DefMapa = {
  id: 'terreiroBrasaPatio',
  nome: 'TERREIRO DE BRASA — PÁTIO',
  interior: true,

  chao: [
    'WWWWWWW_WWWWWWW',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'W_____________W',
    'WWWWWWW_WWWWWWW',
  ],

  objetos: [
    { tipo: 'barreira', tx: 7, ty: 0, larg: 1, seNao: 'venceu_zelador_brasa' },
  ],

  npcs: [
    {
      id: 'zelador_brasa', nome: 'ZELADOR DA BRASA', estilo: 'aldeao',
      tx: 7, ty: 3, dir: 'baixo',
      treinador: {
        classe: 'ZELADOR DA BRASA', visao: 4, premio: 1400,
        time: [{ especie: 'cabritinha', nivel: 30 }, { especie: 'mulinha', nivel: 31 }],
        falaInicio: 'Ninguém vê o Brás sem passar por mim primeiro.',
        falaDerrota: 'Passa. Mas ainda tem gente entre você e ele.',
      },
      falas: [
        { se: 'venceu_zelador_brasa', linhas: [
          'Siga em frente. Os outros dois é que não vão facilitar.'] },
        { batalha: true, linhas: [
          'O pátio é meu de guardar. Prove que merece ir além dele.'] },
      ],
    },
  ],

  inicio: { tx: 7, ty: 11, dir: 'cima' },

  saidas: [
    { tx: 7, ty: 12, para: 'vilaFornalha', destino: { tx: 16, ty: 8, dir: 'baixo' } },
    { tx: 7, ty: 0,  para: 'terreiroBrasaEscoria', destino: { tx: 8, ty: 13, dir: 'cima' } },
  ],
};
