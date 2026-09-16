/* =========================================================================
   Aleatoriedade com semente.

   A batalha inteira sorteia por aqui, nunca por Math.random(). Assim um
   teste pode fixar a semente e conferir que o mesmo turno sempre dá o mesmo
   resultado — sem isso não dá para testar dano, captura nem IA.
   ========================================================================= */

/* mulberry32: gerador pequeno, rápido e de período mais que suficiente
   para um jogo de turnos. */
export class Aleatorio {
  private s: number;

  constructor(semente: number = (Date.now() ^ 0x9e3779b9) >>> 0) {
    this.s = semente >>> 0;
  }

  /* número em [0,1) */
  proximo(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /* inteiro em [min, max], inclusivo dos dois lados */
  inteiro(min: number, max: number): number {
    return min + Math.floor(this.proximo() * (max - min + 1));
  }

  /* verdadeiro com a probabilidade dada em PORCENTAGEM (0..100) */
  chance(pct: number): boolean {
    return this.proximo() * 100 < pct;
  }

  escolher<T>(lista: readonly T[]): T {
    return lista[Math.floor(this.proximo() * lista.length)]!;
  }

  /* escolhe respeitando pesos relativos (tabelas de encontro) */
  ponderado<T>(lista: readonly T[], peso: (item: T) => number): T {
    let total = 0;
    for (const it of lista) total += peso(it);
    let r = this.proximo() * total;
    for (const it of lista) {
      r -= peso(it);
      if (r <= 0) return it;
    }
    return lista[lista.length - 1]!;
  }
}

/* instância compartilhada por quem não precisa de semente fixa */
export const acaso = new Aleatorio();
