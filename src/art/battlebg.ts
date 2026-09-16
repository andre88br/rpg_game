/* =========================================================================
   Cenário de fundo da batalha.

   O fundo é assado UMA vez quando a batalha começa e depois só é copiado
   para a tela a cada quadro — desenhar estes milhares de pixels 60 vezes por
   segundo seria jogar processamento fora.
   ========================================================================= */
import { Buf } from '../core/buf.ts';
import { P } from './palette.ts';
import { LARGURA as W, ALTURA as H } from '../core/renderer.ts';

export type Cenario = 'praia' | 'mata' | 'cidade' | 'caverna';

/* linha do horizonte: acima é céu, abaixo é chão */
const HORIZONTE = 66;

export function fundoBatalha(cenario: Cenario = 'praia'): Buf {
  const b = new Buf(W, H);
  ceu(b, cenario);
  chao(b, cenario);
  // plataformas: o disco onde cada combatente pisa, para não parecer flutuando
  plataforma(b, 182, 76, 36, 7, cenario);
  plataforma(b, 58, 104, 42, 8, cenario);
  return b;
}

function ceu(b: Buf, c: Cenario): void {
  if (c === 'caverna') {
    for (let y = 0; y < HORIZONTE; y++) {
      b.rect(0, y, W, 1, y < 20 ? '#1b1526' : y < 42 ? '#2a2038' : '#3a2d4a');
    }
    // estalactites
    for (let x = 4; x < W; x += 17) {
      const h = 8 + ((x * 7) % 14);
      b.tri(x - 5, 0, x, h, x + 5, 0, '#241c33');
    }
    return;
  }
  const faixas = c === 'mata'
    ? ['#9fd8c6', '#b4e2d0', '#c6ecda', '#d8f3e6']
    : ['#8fd0f0', '#a3daf5', '#b8e4f8', '#cdeefb'];
  for (let i = 0; i < 4; i++) b.rect(0, i * 8, W, 8, faixas[i]!);
  b.rect(0, 32, W, 20, c === 'mata' ? '#e2f6ec' : '#d8f0fb');

  if (c === 'praia') {
    // mar ao fundo, com a linha de espuma
    b.rect(0, 52, W, 14, P.waterL!);
    for (let x = 0; x < W; x += 7) b.rect(x, 56, 4, 1, P.foam!);
    b.rect(0, 62, W, 6, P.water!);
  } else if (c === 'mata') {
    // fileira de copas de árvore no horizonte
    for (let x = -4; x < W + 8; x += 11) {
      const h = 10 + ((x * 13) % 9);
      b.ellipse(x, 58 - h / 2, 8, h, P.treeD!);
      b.ellipse(x - 2, 56 - h / 2, 5, h - 3, P.tree!);
    }
  } else {
    // telhados ao longe
    for (let x = -6; x < W + 8; x += 26) {
      b.rect(x, 50, 22, 16, P.wallD!);
      b.tri(x - 2, 50, x + 11, 40, x + 24, 50, P.roofD!);
    }
  }
}

function chao(b: Buf, c: Cenario): void {
  const base = c === 'praia' ? P.sand! : c === 'mata' ? P.grass!
             : c === 'cidade' ? P.path! : '#4a4054';
  const grao = c === 'praia' ? P.sandD! : c === 'mata' ? P.grassD!
             : c === 'cidade' ? P.pathD! : '#3a3244';
  b.rect(0, HORIZONTE, W, H - HORIZONTE, base);
  // textura esparsa: dá granulado sem virar ruído
  for (let i = 0; i < 260; i++) {
    b.set((i * 97) % W, HORIZONTE + 2 + ((i * 53) % (H - HORIZONTE - 2)), grao);
  }
}

export function plataforma(b: Buf, cx: number, cy: number, rx: number, ry: number,
                           c: Cenario = 'praia'): void {
  const aro = c === 'mata' ? '#2d6027' : c === 'cidade' ? '#a3804f'
            : c === 'caverna' ? '#2f2a3d' : '#b59a63';
  const meio = c === 'mata' ? '#5aa347' : c === 'cidade' ? '#d9bd8c'
             : c === 'caverna' ? '#57506b' : '#e0caa0';
  const topo = c === 'mata' ? '#74bf5e' : c === 'cidade' ? '#e8d5ad'
             : c === 'caverna' ? '#6d6584' : '#f2e3bd';
  b.ellipse(cx, cy + 1, rx, ry, aro);
  b.ellipse(cx, cy, rx - 1, ry - 1, meio);
  b.ellipse(cx, cy - 1, rx - 4, ry - 2, topo);
  for (let i = 0; i < 14; i++) {
    b.set(cx - rx + ((i * 37) % (rx * 2)), cy + ((i * 13) % 3) - 1, aro);
  }
}

/* onde cada combatente fica plantado (canto superior esquerdo do sprite) */
export const POSTO_INIMIGO = { cx: 182, base: 76 };
export const POSTO_ALIADO = { cx: 58, base: 104 };
