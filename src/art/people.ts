/* =========================================================================
   Personagens humanos: 16x20, quatro direcoes e tres quadros de caminhada.
   Um unico molde parametrizado serve para o jogador e todos os NPCs — muda
   cabelo, roupa e acessorio. O contorno automatico entra no fim.
   ========================================================================= */
import { Buf } from '../core/buf.ts';
import { P } from './palette.ts';

export type Direcao = 'baixo' | 'cima' | 'esq' | 'dir';
export type Quadro = 0 | 1 | 2;   // 0 parado, 1 e 2 os passos

export interface OpcoesPessoa {
  pele?: string; peleEsc?: string;
  cabelo?: string; cabeloL?: string;
  roupa?: string; roupaL?: string;
  calca?: string; sapato?: string;
  chapeu?: 'palha' | 'bone' | 'coroa' | null;
  chapeuCor?: string; chapeuCorL?: string;
  cabeloLongo?: boolean;
}

interface Estilo extends Required<OpcoesPessoa> {}

function normalizar(op: OpcoesPessoa): Estilo {
  return {
    pele: P.skin!, peleEsc: P.skinD!,
    cabelo: P.hair!, cabeloL: P.hairL!,
    roupa: '#d9463f', roupaL: '#f06a5e',
    calca: '#3a5a9a', sapato: '#4a3020',
    chapeu: null, chapeuCor: '#e0c070', chapeuCorL: '#f5e0a0',
    cabeloLongo: false,
    ...op,
  } as Estilo;
}

/* ---- pernas: o que muda entre os quadros da caminhada ---- */
function pernas(b: Buf, o: Estilo, dir: Direcao, quadro: Quadro): void {
  const lado = dir === 'esq' || dir === 'dir';

  if (!lado) {
    // de frente ou de costas: as pernas alternam de altura
    const [altE, altD] = quadro === 0 ? [3, 3] : quadro === 1 ? [3, 2] : [2, 3];
    b.rect(4, 17, 3, altE, o.calca);
    b.rect(9, 17, 3, altD, o.calca);
    b.rect(3, 17 + altE - 1, 4, 1, o.sapato);
    b.rect(9, 17 + altD - 1, 4, 1, o.sapato);
  } else {
    // de perfil: as pernas abrem em tesoura
    if (quadro === 0) {
      b.rect(6, 17, 4, 3, o.calca);
      b.rect(5, 19, 6, 1, o.sapato);
    } else {
      const frente = quadro === 1 ? 1 : -1;
      b.rect(6 + frente * 2, 17, 3, 3, o.calca);   // perna da frente
      b.rect(6 - frente, 17, 3, 2, o.calca);       // perna de tras
      b.rect(5 + frente * 2, 19, 4, 1, o.sapato);
      b.rect(6 - frente, 18, 4, 1, o.sapato);
    }
  }
}

/* ---- chapeus ---- */
function chapeu(b: Buf, o: Estilo, dir: Direcao): void {
  if (o.chapeu === 'palha') {
    b.rect(4, 1, 8, 1, o.chapeuCor);
    b.rect(3, 2, 10, 2, o.chapeuCorL);
    b.rect(2, 4, 12, 2, o.chapeuCor);
    b.rect(1, 5, 14, 1, o.chapeuCor);
    b.rect(4, 2, 8, 1, o.chapeuCorL);
  } else if (o.chapeu === 'bone') {
    b.rect(3, 2, 10, 4, o.chapeuCor);
    b.rect(3, 2, 10, 1, o.chapeuCorL);
    b.rect(2, 5, 12, 1, o.chapeuCor);
    // a pala aponta para onde a pessoa olha
    if (dir === 'baixo') b.rect(4, 6, 8, 1, o.chapeuCor);
    else if (dir !== 'cima') b.rect(10, 6, 5, 1, o.chapeuCor);
  } else if (o.chapeu === 'coroa') {
    b.rect(4, 2, 8, 3, P.gold!);
    b.set(4, 1, P.gold!); b.set(8, 0, P.gold!); b.set(11, 1, P.gold!);
    b.rect(4, 4, 8, 1, P.goldD!);
  }
}

/* ---- sprite completo ---- */
export function spritePessoa(op: OpcoesPessoa = {}, dir: Direcao = 'baixo', quadro: Quadro = 0): Buf {
  const o = normalizar(op);
  const b = new Buf(16, 20);
  const perfil = dir === 'esq' || dir === 'dir';

  pernas(b, o, dir, quadro);

  if (!perfil) {
    // ----- tronco de frente/costas -----
    b.rect(3, 13, 10, 4, o.roupa);
    b.rect(4, 13, 8, 1, o.roupaL);
    b.rect(2, 14, 1, 2, o.pele);          // bracos
    b.rect(13, 14, 1, 2, o.pele);
    b.rect(6, 12, 4, 1, o.pele);          // pescoco

    // ----- cabeca -----
    b.rect(2, 5, 12, 8, o.cabelo);
    if (dir === 'baixo') {
      b.rect(4, 7, 8, 5, o.pele);         // rosto
      b.set(5, 8, P.ink!); b.set(6, 8, P.ink!);
      b.set(9, 8, P.ink!); b.set(10, 8, P.ink!);
      b.rect(7, 10, 2, 1, o.peleEsc);     // boca
    } else {
      // de costas: so cabelo, com um brilho para nao virar mancha chapada
      b.rect(4, 6, 8, 2, o.cabeloL);
      b.rect(5, 11, 6, 1, o.cabeloL);
    }
    b.rect(4, 5, 8, 1, o.cabeloL);
    if (o.cabeloLongo) {
      for (const x of [2, 3, 12, 13]) b.rect(x, 10, 1, 6, o.cabelo);
      b.set(3, 10, o.cabeloL); b.set(12, 10, o.cabeloL);
    }
  } else {
    // ----- perfil (desenhado virado para a direita; 'esq' espelha depois) -----
    b.rect(4, 13, 8, 4, o.roupa);
    b.rect(5, 13, 6, 1, o.roupaL);
    b.rect(8, 14, 2, 3, o.pele);          // braco da frente balancando
    b.rect(6, 12, 4, 1, o.pele);

    b.rect(3, 5, 10, 8, o.cabelo);
    b.rect(7, 7, 6, 5, o.pele);           // rosto de perfil
    b.set(13, 9, o.pele);                 // nariz
    b.set(10, 8, P.ink!); b.set(11, 8, P.ink!);
    b.rect(10, 10, 2, 1, o.peleEsc);
    b.rect(4, 5, 8, 1, o.cabeloL);
    if (o.cabeloLongo) { b.rect(3, 10, 2, 6, o.cabelo); b.set(3, 10, o.cabeloL); }
  }

  chapeu(b, o, dir);
  b.outline(P.ink!);
  return dir === 'esq' ? espelhar(b) : b;
}

function espelhar(src: Buf): Buf {
  const b = new Buf(src.w, src.h);
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) b.set(x, y, src.get(src.w - 1 - x, y));
  return b;
}

/* retrato parado de frente — usado nas folhas de arte e nos menus */
export function pessoa(op: OpcoesPessoa = {}): Buf { return spritePessoa(op, 'baixo', 0); }

/* ---- elenco ---- */
export const ESTILOS: Record<string, OpcoesPessoa> = {
  taina:    { chapeu: 'palha', cabelo: '#2c1b14', cabeloLongo: true,
              roupa: '#d9463f', roupaL: '#f06a5e', calca: '#2f4f8f' },
  bento:    { chapeu: 'bone', chapeuCor: '#2f7f5f', chapeuCorL: '#4aa77f',
              cabelo: '#1f1410', roupa: '#e8e0d0', roupaL: '#ffffff', calca: '#3a3f55' },
  zeca:     { cabelo: '#6b4a1f', cabeloL: '#8f6a30',
              roupa: '#6a3fa8', roupaL: '#8f62d0', calca: '#2b2436' },
  firmina:  { cabelo: '#d8d4cc', cabeloL: '#f2f0ea', cabeloLongo: true,
              pele: P.skin2, peleEsc: P.skin2D,
              roupa: '#5f8f4f', roupaL: '#7fb06a', calca: '#4a6a3f' },
  mariana:  { cabelo: '#1b3a5c', cabeloL: '#2f5f8f', cabeloLongo: true,
              pele: P.skin2, peleEsc: P.skin2D,
              roupa: '#2f8fbf', roupaL: '#5fc0e0', calca: '#1b5f8f' },
  tie:      { cabelo: '#1f1a14', cabeloL: '#3a3020',
              pele: P.skin2, peleEsc: P.skin2D,
              roupa: '#4a9f3f', roupaL: '#6fc45f', calca: '#6d4726' },
  pescador: { chapeu: 'palha', chapeuCor: '#c9a86a', cabelo: '#3a2f22',
              pele: P.skin2, peleEsc: P.skin2D,
              roupa: '#4a7fbf', roupaL: '#6fa3d9', calca: '#5a5f6a' },
  guarda:   { chapeu: 'bone', chapeuCor: '#2b3f6a', chapeuCorL: '#44608f',
              cabelo: '#2c1b14', roupa: '#3a5a9a', roupaL: '#5f82c4', calca: '#2b3145' },
  anhanga:  { cabelo: '#15101f', cabeloL: '#2f2447', cabeloLongo: true,
              pele: '#8f7fa8', peleEsc: '#5f4f7a',
              roupa: '#2f2447', roupaL: '#4a3a6b', calca: '#15101f', chapeu: 'coroa' },
  aldeao:   { cabelo: '#4a3020', roupa: '#c98f3f', roupaL: '#e8b060', calca: '#5a4a3a' },
  crianca:  { cabelo: '#2c1b14', roupa: '#d9a63f', roupaL: '#f0c45e', calca: '#3f6a4a' },
  /* capacete amarelo de mina e roupa cor de barro — as Minas da Caipora */
  garimpeiro: { chapeu: 'bone', chapeuCor: '#d9b23a', chapeuCorL: '#f0d06a', cabelo: '#3a2a1a',
                roupa: '#7a5a3a', roupaL: '#9c7a52', calca: '#4a3a2a' },
};

export const ELENCO: Record<string, () => Buf> =
  Object.fromEntries(Object.entries(ESTILOS).map(([k, v]) => [k, () => pessoa(v)]));

/* todas as 12 poses de um personagem, prontas para o jogo */
export type FolhaPersonagem = Record<Direcao, [Buf, Buf, Buf]>;

export function folhaPersonagem(op: OpcoesPessoa): FolhaPersonagem {
  const dirs: Direcao[] = ['baixo', 'cima', 'esq', 'dir'];
  const folha = {} as FolhaPersonagem;
  for (const d of dirs) {
    folha[d] = [spritePessoa(op, d, 0), spritePessoa(op, d, 1), spritePessoa(op, d, 2)];
  }
  return folha;
}
