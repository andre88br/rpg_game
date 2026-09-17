/* Terreiro de Água — o salão de Dona Mariana.
   O chão de tatame é cercado de poças: na Etapa 3 pisar numa poça escorrega o
   jogador até a próxima parede, e é esse o quebra-cabeça do terreiro. Por ora
   as poças são só piso molhado.                                              */
import type { DefMapa } from '../../world/tilemap.ts';

export const terreiroPortoIara: DefMapa = {
  id: 'terreiroPortoIara',
  nome: 'TERREIRO DE ÁGUA',
  interior: true,

  chao: [
    'WWWWWWWWWWWWWWWWW',
    'W_______________W',
    'W__mmmmmmmmmmm__W',
    'W__m_________m__W',
    'W__m_uu___uu_m__W',
    'W__m_________m__W',
    'W__m__uu_uu__m__W',
    'W__m_________m__W',
    'W__m_uu___uu_m__W',
    'W__m_________m__W',
    'W__mmmmmmmmmmm__W',
    'W_______________W',
    'W_______________W',
    'W_______T_______W',
    'WWWWWWWWWWWWWWWWW',
  ],

  objetos: [],

  npcs: [
    {
      id: 'mariana', nome: 'DONA MARIANA', estilo: 'mariana',
      tx: 8, ty: 1, dir: 'baixo',
      falas: [
        'Então a guia se abriu. Quer dizer que a região inteira já confia em você.',
        'Descanse um instante. Quando estiver pronta, a água responde.',
      ],
    },
  ],

  inicio: { tx: 8, ty: 12, dir: 'cima' },

  saidas: [
    { tx: 8, ty: 13, para: 'portoIara', destino: { tx: 16, ty: 18, dir: 'baixo' } },
  ],
};
