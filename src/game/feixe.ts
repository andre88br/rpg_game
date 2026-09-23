/* =========================================================================
   O feixe de luz da Cidade do Sol.

   Sai de uma fonte numa direção e anda tile por tile. Espelho "/" ou "\"
   o desvia em ângulo reto; parede (qualquer coisa sólida que não seja
   espelho) o para; o cristal-alvo o recebe. Girar um espelho é trocar a
   flag dele — o mesmo par de objetos das chaves de para-raio.

   Puro. Teste em feixe.test.ts.
   ========================================================================= */
import type { Direcao } from '../art/people.ts';

export type Inclinacao = '/' | '\\';

const DELTA: Record<Direcao, readonly [number, number]> = {
  cima: [0, -1], baixo: [0, 1], esq: [-1, 0], dir: [1, 0],
};
/* "/" : quem vem andando para a direita sai para cima, e assim por diante */
const BARRA: Record<Direcao, Direcao> = { dir: 'cima', cima: 'dir', esq: 'baixo', baixo: 'esq' };
const CONTRA: Record<Direcao, Direcao> = { dir: 'baixo', baixo: 'dir', esq: 'cima', cima: 'esq' };

export function refletir(dir: Direcao, e: Inclinacao): Direcao {
  return e === '/' ? BARRA[dir] : CONTRA[dir];
}

export interface Feixe { caminho: [number, number][]; acertou: boolean }

export function tracarFeixe(origem: { tx: number; ty: number }, dir: Direcao,
                            alvo: { tx: number; ty: number },
                            solido: (x: number, y: number) => boolean,
                            espelhoEm: (x: number, y: number) => Inclinacao | null): Feixe {
  const caminho: [number, number][] = [];
  let x = origem.tx, y = origem.ty, d = dir;
  const vistos = new Set<string>();
  for (let passo = 0; passo < 2000; passo++) {
    const [dx, dy] = DELTA[d];
    x += dx; y += dy;
    if (x === alvo.tx && y === alvo.ty) return { caminho, acertou: true };
    const e = espelhoEm(x, y);
    if (e) {
      const k = `${x},${y},${d}`;
      if (vistos.has(k)) return { caminho, acertou: false };   // laço entre espelhos
      vistos.add(k);
      caminho.push([x, y]);
      d = refletir(d, e);
      continue;
    }
    if (solido(x, y)) return { caminho, acertou: false };
    caminho.push([x, y]);
  }
  return { caminho, acertou: false };
}
