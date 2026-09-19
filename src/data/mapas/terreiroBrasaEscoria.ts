/* Terreiro de Brasa — sala 2 de 4, o campo de escória.
   Dois corredores de largura 1, cada um com sua pedra e sua cova — resolver
   qualquer um dos dois abre caminho para o norte, onde a Sopradora do Fole
   guarda a porta seguinte.

   A faixa de cima tem DUAS linhas (1 e 2), não uma: a Sopradora fica ao
   lado da porta, em (7,1), e NPC é sólido — numa faixa de uma linha só ela
   viraria parede para quem sobe pelo corredor da esquerda. Com a linha 2
   aberta, os dois corredores chegam à porta, e a visão dela pega o jogador
   em (8,1) de qualquer um dos dois lados.

   ORIENTAÇÃO (já saiu errada uma vez e travou a sala): aqui se ENTRA PELO
   SUL, em `inicio`, e se sobe. Então, subindo o corredor, a PEDRA tem que
   vir antes da COVA — a pedra em ty maior, a cova em ty menor. A cova aberta
   é sólida: se ela ficar abaixo da pedra, quem sobe do salão esbarra nela e
   nunca alcança a pedra, e a sala fica impossível. (Na Caverna do Boitatá é
   o contrário justamente porque lá se entra pelo norte.) `mapas.test.ts`
   confere isso partindo de `inicio`, no sentido real. */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroBrasaEscoria: DefMapa = {
  id: 'terreiroBrasaEscoria',
  nome: 'TERREIRO DE BRASA — ESCÓRIA',
  interior: true,

  chao: [
    'WWWWWWWW_WWWWWWWW',
    'W_______________W',
    'W_______________W',
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
    'WWWWWWWW_WWWWWWWW',
  ],

  objetos: [
    { tipo: 'barreira', tx: 8, ty: 0, larg: 1, seNao: 'venceu_sopradora' },
    { tipo: 'cova', tx: 5, ty: 3, seNao: 'cova_forja_a' },
    { tipo: 'entulho', tx: 5, ty: 3, se: 'cova_forja_a', solido: false },
    { tipo: 'cova', tx: 11, ty: 3, seNao: 'cova_forja_b' },
    { tipo: 'entulho', tx: 11, ty: 3, se: 'cova_forja_b', solido: false },
  ],

  pedras: [
    { tx: 5, ty: 6, cova: 'cova_forja_a' },
    { tx: 11, ty: 6, cova: 'cova_forja_b' },
  ],

  npcs: [
    {
      /* (7,1), NÃO (8,1): a porta para o breu é (8,0), e (8,1) é o único
         vizinho andável dela — NPC é sólido, então quem ficasse ali
         trancaria a saída para sempre, mesmo depois de perder a batalha.
         Daqui, de olho na direita, ela continua cobrindo a faixa inteira
         com a visão, e a tranca de verdade é a barreira em (8,0). */
      id: 'sopradora', nome: 'SOPRADORA DO FOLE', estilo: 'aldeao',
      tx: 7, ty: 1, dir: 'dir',
      treinador: {
        classe: 'SOPRADORA DO FOLE', visao: 4, premio: 1600,
        esperta: true, itens: { garrafada: 1 },
        time: [{ especie: 'salamanca', nivel: 31 }, { especie: 'cabraCabriola', nivel: 32 }],
        falaInicio: 'Passou pela escória? Bom sinal. Agora prove que passa por mim.',
        falaDerrota: 'O breu vem depois de mim. Vai precisar de mais que sorte lá.',
      },
      falas: [
        { se: 'venceu_sopradora', linhas: [
          'O breu fica logo depois dessa porta. Leve luz.'] },
        { batalha: true, linhas: [
          'Ninguém sopra fogo bom sem antes provar o próprio.'] },
      ],
    },
  ],

  inicio: { tx: 8, ty: 13, dir: 'cima' },

  saidas: [
    { tx: 8, ty: 14, para: 'terreiroBrasaPatio', destino: { tx: 7, ty: 1, dir: 'baixo' } },
    { tx: 8, ty: 0,  para: 'terreiroBrasaBreu', destino: { tx: 8, ty: 15, dir: 'cima' } },
  ],
};
