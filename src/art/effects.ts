/* =========================================================================
   Efeito de golpe: um projétil pequeno que voa do atacante até o alvo.

   A forma muda com o tipo do golpe; a cor é a MESMA de `TIPOS[]` — a cor que
   já aparece na etiqueta de tipo, na medalha, em tudo — então o efeito já
   chega familiar, em vez de inventar uma paleta nova só pra isto. "Neutro"
   usa `INFO_NEUTRO`, a mesma cinza-neutra da etiqueta COMUM.
   ========================================================================= */
import { Buf } from '../core/buf.ts';
import { P } from './palette.ts';
import { infoTipo, type TipoGolpe } from './palette.ts';

export const TAM_EFEITO = 12;
/* cada forma tem até 3 quadros; quem anima escolhe o quadro pelo relógio */
export const QUADROS_EFEITO = 3;

type Forma = (cor: string, corD: string, quadro: number) => Buf;

const novo = (): Buf => new Buf(TAM_EFEITO, TAM_EFEITO);

const chama: Forma = (cor, corD, q) => {
  const b = novo();
  const balanco = q === 1 ? 1 : q === 2 ? -1 : 0;
  b.ellipse(6, 8, 4, 4, corD);
  b.ellipse(6 + balanco, 6, 3, 4, cor);
  b.ellipse(6 + balanco, 4, 2, 3, P.fireL!);
  return b;
};

const gota: Forma = (cor, corD, q) => {
  const b = novo();
  b.ellipse(6, 7, 4, 4, corD);
  b.ellipse(6, 6, 3, 3, cor);
  b.set(5, 4, P.foam!);
  const ang = (q / QUADROS_EFEITO) * Math.PI * 2;
  b.set(6 + Math.round(Math.cos(ang) * 5), 6 + Math.round(Math.sin(ang) * 5), cor);
  return b;
};

const folha: Forma = (cor, corD, q) => {
  const b = novo();
  if (q === 1) {
    b.ellipse(6, 6, 3, 5, corD); b.ellipse(6, 6, 2, 4, cor); b.line(6, 2, 6, 10, P.treeL!);
  } else {
    b.ellipse(6, 6, 5, 3, corD); b.ellipse(6, 6, 4, 2, cor); b.line(2, 6, 10, 6, P.treeL!);
  }
  return b;
};

const pedra: Forma = (cor, corD, q) => {
  const b = novo();
  if (q === 1) { b.tri(6, 1, 1, 9, 11, 9, corD); b.tri(6, 3, 4, 8, 8, 8, cor); }
  else { b.tri(1, 3, 6, 11, 11, 2, corD); b.tri(3, 4, 6, 9, 9, 3, cor); }
  return b;
};

const rajada: Forma = (cor, corD, q) => {
  const b = novo();
  for (let i = 0; i < 3; i++) {
    const y = 2 + i * 4;
    const desloc = (q * 2 + i * 3) % 6;
    b.line(1, y, 5 + desloc, y, i % 2 === 0 ? cor : corD);
    b.line(6 + desloc, y + 1, 11, y + 1, i % 2 === 0 ? corD : cor);
  }
  return b;
};

const zigue: Forma = (cor, corD, q) => {
  const b = novo();
  b.line(7, 0, 4, 5, corD); b.line(4, 5, 7, 5, corD); b.line(7, 5, 3, 11, corD);
  b.line(7, 1, 4, 6, cor);  b.line(4, 6, 7, 6, cor);  b.line(7, 6, 3, 11, cor);
  if (q === 1) { b.set(1, 2, cor); b.set(10, 9, cor); }
  return b;
};

const trevas: Forma = (cor, corD, q) => {
  const b = novo();
  b.ellipse(6, 6, q === 1 ? 5 : 4, 4, corD);
  b.ellipse(6, 6, 2, 2, cor);
  b.set(1, 2, corD); b.set(10, 9, corD);
  return b;
};

const estrela: Forma = (cor, corD, q) => {
  const b = novo();
  const r1 = q === 1 ? 5 : 4;
  b.line(6, 6 - r1, 6, 6 + r1, cor); b.line(6 - r1, 6, 6 + r1, 6, cor);
  const d = r1 - 2;
  b.line(6 - d, 6 - d, 6 + d, 6 + d, corD); b.line(6 - d, 6 + d, 6 + d, 6 - d, corD);
  b.ellipse(6, 6, 2, 2, P.white!);
  return b;
};

const impacto: Forma = (cor, corD, q) => {
  const b = novo();
  const r1 = q === 1 ? 4 : 3;
  b.line(6, 6 - r1, 6, 6 + r1, corD); b.line(6 - r1, 6, 6 + r1, 6, corD);
  b.ellipse(6, 6, 2, 2, cor);
  return b;
};

const FORMAS: Record<TipoGolpe, Forma> = {
  fogo: chama, agua: gota, planta: folha, terra: pedra,
  vento: rajada, raio: zigue, sombra: trevas, luz: estrela, neutro: impacto,
};

export function golpeEfeito(tipo: TipoGolpe, quadro: number): Buf {
  const info = infoTipo(tipo);
  return FORMAS[tipo](info.cor, info.corD, ((quadro % QUADROS_EFEITO) + QUADROS_EFEITO) % QUADROS_EFEITO);
}
