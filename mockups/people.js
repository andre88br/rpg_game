/* Personagens humanos. Um mesmo molde 16x20 serve para o jogador e todos os
   NPCs; muda-se cabelo, roupa e acessorio. Contorno aplicado no fim. */
import { Buf } from './engine.js';
import { P } from './palette.js';

const MOLDE = [
  '................', //  0
  '................', //  1
  '................', //  2
  '................', //  3
  '................', //  4
  '...CCCCCCCCCC...', //  5 cabelo topo
  '..CCCCCCCCCCCC..', //  6
  '..CCkkkkkkkkCC..', //  7 testa
  '..CCkookkookCC..', //  8 olhos
  '..CCkkkkkkkkCC..', //  9
  '...Ckkkmmkkkk...', // 10 boca
  '....kkkkkkkk....', // 11 queixo
  '......kkkk......', // 12 pescoco
  '...RRRRRRRRRR...', // 13 ombros
  '..kRRRRRRRRRRk..', // 14 bracos
  '..kRRRRRRRRRRk..', // 15
  '...RRRRRRRRRR...', // 16
  '...PPPPPPPPPP...', // 17 calca
  '...PPP....PPP...', // 18 pernas
  '..BBBB....BBBB..', // 19 pes
];

/* desenha uma pessoa 16x20.
   op: { pele, peleEsc, cabelo, cabeloL, roupa, roupaL, calca, sapato,
         chapeu: 'palha'|'bone'|null, chapeuCor, chapeuCorL, cabeloLongo } */
export function pessoa(op = {}) {
  const o = {
    pele: P.skin, peleEsc: P.skinD,
    cabelo: P.hair, cabeloL: P.hairL,
    roupa: '#d9463f', roupaL: '#f06a5e',
    calca: '#3a5a9a', sapato: '#4a3020',
    chapeu: null, chapeuCor: '#e0c070', chapeuCorL: '#f5e0a0',
    cabeloLongo: false,
    ...op,
  };
  const pal = { C: o.cabelo, k: o.pele, o: P.ink, m: o.peleEsc, R: o.roupa, P: o.calca, B: o.sapato };
  const b = new Buf(16, 20);
  b.art(MOLDE, pal, 0, 0);

  // brilho no cabelo e na roupa
  for (let x = 4; x < 12; x++) if (b.get(x, 5)) b.set(x, 5, o.cabeloL);
  for (let x = 4; x < 12; x++) if (b.get(x, 13) === o.roupa) b.set(x, 13, o.roupaL);

  if (o.cabeloLongo) { // cabelo descendo pelos ombros
    for (const x of [2, 3, 12, 13]) for (let y = 10; y <= 16; y++) b.set(x, y, o.cabelo);
    for (const x of [3, 12]) b.set(x, 10, o.cabeloL);
  }

  if (o.chapeu === 'palha') {
    b.rect(4, 1, 8, 1, o.chapeuCor);
    b.rect(3, 2, 10, 2, o.chapeuCorL);
    b.rect(2, 4, 12, 2, o.chapeuCor);   // aba
    b.rect(1, 5, 14, 1, o.chapeuCor);
    b.rect(4, 2, 8, 1, o.chapeuCorL);
  } else if (o.chapeu === 'bone') {
    b.rect(3, 2, 10, 4, o.chapeuCor);
    b.rect(3, 2, 10, 1, o.chapeuCorL);
    b.rect(2, 5, 12, 1, o.chapeuCor);
    b.rect(9, 6, 6, 1, o.chapeuCor);    // pala
  } else if (o.chapeu === 'coroa') {
    b.rect(4, 2, 8, 3, P.gold);
    b.set(4, 1, P.gold); b.set(8, 0, P.gold); b.set(11, 1, P.gold);
    b.rect(4, 4, 8, 1, P.goldD);
  }
  return b.outline(P.ink);
}

/* elenco */
export const CAST = {
  taina:   () => pessoa({ chapeu: 'palha', cabelo: '#2c1b14', cabeloLongo: true,
                          roupa: '#d9463f', roupaL: '#f06a5e', calca: '#2f4f8f' }),
  bento:   () => pessoa({ chapeu: 'bone', chapeuCor: '#2f7f5f', chapeuCorL: '#4aa77f',
                          cabelo: '#1f1410', roupa: '#e8e0d0', roupaL: '#ffffff', calca: '#3a3f55' }),
  zeca:    () => pessoa({ cabelo: '#6b4a1f', cabeloL: '#8f6a30', pele: P.skin,
                          roupa: '#6a3fa8', roupaL: '#8f62d0', calca: '#2b2436' }),
  firmina: () => pessoa({ cabelo: '#d8d4cc', cabeloL: '#f2f0ea', cabeloLongo: true,
                          pele: P.skin2, peleEsc: P.skin2D,
                          roupa: '#5f8f4f', roupaL: '#7fb06a', calca: '#4a6a3f', chapeu: null }),
  mariana: () => pessoa({ cabelo: '#1b3a5c', cabeloL: '#2f5f8f', cabeloLongo: true,
                          pele: P.skin2, peleEsc: P.skin2D,
                          roupa: '#2f8fbf', roupaL: '#5fc0e0', calca: '#1b5f8f' }),
  tie:     () => pessoa({ cabelo: '#1f1a14', cabeloL: '#3a3020',
                          pele: P.skin2, peleEsc: P.skin2D,
                          roupa: '#4a9f3f', roupaL: '#6fc45f', calca: '#6d4726' }),
  pescador:() => pessoa({ chapeu: 'palha', chapeuCor: '#c9a86a', cabelo: '#3a2f22',
                          pele: P.skin2, peleEsc: P.skin2D,
                          roupa: '#4a7fbf', roupaL: '#6fa3d9', calca: '#5a5f6a' }),
  guarda:  () => pessoa({ chapeu: 'bone', chapeuCor: '#2b3f6a', chapeuCorL: '#44608f',
                          cabelo: '#2c1b14', roupa: '#3a5a9a', roupaL: '#5f82c4', calca: '#2b3145' }),
  anhanga: () => pessoa({ cabelo: '#15101f', cabeloL: '#2f2447', cabeloLongo: true,
                          pele: '#8f7fa8', peleEsc: '#5f4f7a',
                          roupa: '#2f2447', roupaL: '#4a3a6b', calca: '#15101f', chapeu: 'coroa' }),
};
