/* Gerenciador de cenas com transicao em fade, para trocar mundo <-> batalha
   <-> menu sem que a troca fique brusca. */
import type { Renderizador } from './renderer.ts';
import type { Entrada } from './input.ts';

export interface Cena {
  entrar?(): void | Promise<void>;
  sair?(): void;
  atualizar(dt: number, entrada: Entrada): void;
  desenhar(r: Renderizador): void;
}

export class GerenciadorCenas {
  private atual: Cena | null = null;
  private proxima: Cena | null = null;
  private fase: 'estavel' | 'saindo' | 'entrando' = 'estavel';
  private t = 0;
  private readonly duracao = 0.22;

  get cena(): Cena | null { return this.atual; }

  definir(c: Cena): void {
    this.atual?.sair?.();
    this.atual = c;
    void c.entrar?.();
    this.fase = 'estavel';
    this.t = 0;
  }

  trocar(c: Cena): void {
    if (this.fase !== 'estavel') return;
    this.proxima = c;
    this.fase = 'saindo';
    this.t = 0;
  }

  atualizar(dt: number, entrada: Entrada): void {
    if (this.fase === 'saindo') {
      this.t += dt;
      if (this.t >= this.duracao) {
        this.atual?.sair?.();
        this.atual = this.proxima;
        this.proxima = null;
        void this.atual?.entrar?.();
        this.fase = 'entrando';
        this.t = 0;
      }
      return;                       // durante a troca a cena nao recebe entrada
    }
    if (this.fase === 'entrando') {
      this.t += dt;
      if (this.t >= this.duracao) { this.fase = 'estavel'; this.t = 0; }
    }
    this.atual?.atualizar(dt, entrada);
  }

  desenhar(r: Renderizador): void {
    this.atual?.desenhar(r);
    if (this.fase === 'saindo') r.cortina(this.t / this.duracao);
    else if (this.fase === 'entrando') r.cortina(1 - this.t / this.duracao);
  }
}
