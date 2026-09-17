/* =========================================================================
   O mundo: o conjunto de mapas e o cache dos que já foram assados.

   Montar um `Mapa` desenha o cenário inteiro num canvas — barato de fazer uma
   vez, caro de refazer toda vez que se atravessa uma porta. Por isso o mundo
   guarda os mapas já prontos e só reconstrói quando alguém pede (é o que a
   Etapa 2 vai usar quando uma flag mudar o cenário, como a guia acendendo).
   ========================================================================= */
import { Mapa, type DefMapa } from './tilemap.ts';

export class Mundo {
  private cache = new Map<string, Mapa>();

  constructor(private readonly registro: Record<string, DefMapa>) {}

  get ids(): string[] { return Object.keys(this.registro); }

  existe(id: string): boolean { return this.registro[id] !== undefined; }

  def(id: string): DefMapa {
    const d = this.registro[id];
    if (!d) throw new Error(`mapa desconhecido: ${id}`);
    return d;
  }

  obter(id: string): Mapa {
    let m = this.cache.get(id);
    if (!m) { m = new Mapa(this.def(id)); this.cache.set(id, m); }
    return m;
  }

  /* joga fora o mapa assado para que ele seja redesenhado na próxima visita */
  invalidar(id?: string): void {
    if (id === undefined) this.cache.clear();
    else this.cache.delete(id);
  }
}
