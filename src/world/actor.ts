/* =========================================================================
   Atores: jogador e NPCs. O movimento e preso a grade — um passo leva o
   personagem de um tile ao seguinte e so aceita novo comando ao chegar.
   E isso que da a cadencia caracteristica do genero.
   ========================================================================= */
import { assar, type Assado } from '../core/buf.ts';
import { folhaPersonagem, type Direcao, type OpcoesPessoa } from '../art/people.ts';
import { TS, type Mapa } from './tilemap.ts';

export type FolhaAssada = Record<Direcao, [Assado, Assado, Assado]>;

export function assarFolha(op: OpcoesPessoa): FolhaAssada {
  const crua = folhaPersonagem(op);
  const saida = {} as FolhaAssada;
  for (const d of ['baixo', 'cima', 'esq', 'dir'] as Direcao[]) {
    saida[d] = [assar(crua[d][0]), assar(crua[d][1]), assar(crua[d][2])];
  }
  return saida;
}

export const VEL_ANDAR = 0.20;   // segundos por tile
export const VEL_CORRER = 0.115;
const ESPERA_VIRADA = 0.07;      // tempo de virar no lugar antes de sair andando

export const DELTAS: Record<Direcao, [number, number]> = {
  cima: [0, -1], baixo: [0, 1], esq: [-1, 0], dir: [1, 0],
};

export function direcaoDe(dx: number, dy: number): Direcao | null {
  if (dx < 0) return 'esq';
  if (dx > 0) return 'dir';
  if (dy < 0) return 'cima';
  if (dy > 0) return 'baixo';
  return null;
}

export class Ator {
  tx: number;
  ty: number;
  dir: Direcao;
  movendo = false;

  private deX = 0; private deY = 0;
  private progresso = 0;
  private duracao = VEL_ANDAR;
  private pe = false;                 // alterna o pe a cada passo
  private esperaVirada = 0;

  constructor(readonly folha: FolhaAssada, tx: number, ty: number, dir: Direcao = 'baixo') {
    this.tx = tx; this.ty = ty; this.dir = dir;
    this.deX = tx; this.deY = ty;
  }

  /* posicao em pixels, interpolada durante o passo */
  get px(): number {
    if (!this.movendo) return this.tx * TS;
    return (this.deX + (this.tx - this.deX) * this.progresso) * TS;
  }
  get py(): number {
    if (!this.movendo) return this.ty * TS;
    return (this.deY + (this.ty - this.deY) * this.progresso) * TS;
  }

  /* o sprite tem 20px de altura num tile de 16: os pes encostam na base */
  get desenhoY(): number { return this.py - 4; }

  /* tile logo a frente, para conversar ou interagir */
  frente(): { tx: number; ty: number } {
    const [dx, dy] = DELTAS[this.dir];
    return { tx: this.tx + dx, ty: this.ty + dy };
  }

  /* põe o ator num tile na marra, sem animação de passo — usado ao entrar
     num mapa e ao acordar depois de perder uma batalha */
  teleportar(tx: number, ty: number, dir: Direcao = this.dir): void {
    this.tx = tx; this.ty = ty; this.dir = dir;
    this.deX = tx; this.deY = ty;
    this.movendo = false;
    this.progresso = 0;
    this.esperaVirada = 0;
  }

  olharPara(alvoTx: number, alvoTy: number): void {
    const dx = alvoTx - this.tx, dy = alvoTy - this.ty;
    const d = Math.abs(dx) >= Math.abs(dy) ? direcaoDe(Math.sign(dx), 0) : direcaoDe(0, Math.sign(dy));
    if (d) this.dir = d;
  }

  /* Tenta dar um passo. Se o ator ainda nao esta virado para la, primeiro
     vira no lugar — tocar de leve numa direcao so gira, como no genero. */
  comandar(mapa: Mapa, dir: Direcao | null, correr: boolean,
           bloqueado?: (tx: number, ty: number) => boolean): void {
    if (this.movendo || dir === null) return;

    if (this.dir !== dir) {
      this.dir = dir;
      this.esperaVirada = ESPERA_VIRADA;
      return;
    }
    if (this.esperaVirada > 0) return;

    const [dx, dy] = DELTAS[dir];
    const ntx = this.tx + dx, nty = this.ty + dy;
    if (mapa.solido(ntx, nty)) return;
    if (bloqueado?.(ntx, nty)) return;

    this.deX = this.tx; this.deY = this.ty;
    this.tx = ntx; this.ty = nty;
    this.progresso = 0;
    this.duracao = correr ? VEL_CORRER : VEL_ANDAR;
    this.movendo = true;
  }

  /* devolve true no quadro em que o ator termina de entrar num tile novo */
  atualizar(dt: number): boolean {
    if (this.esperaVirada > 0) this.esperaVirada = Math.max(0, this.esperaVirada - dt);
    if (!this.movendo) return false;

    this.progresso += dt / this.duracao;
    if (this.progresso < 1) return false;

    this.progresso = 1;
    this.movendo = false;
    this.deX = this.tx; this.deY = this.ty;
    this.pe = !this.pe;
    return true;
  }

  quadro(): Assado {
    const poses = this.folha[this.dir];
    if (!this.movendo) return poses[0];
    // um passo, dois quadros: meio-passo e passo completo
    return this.progresso < 0.5 ? (this.pe ? poses[1] : poses[2]) : poses[0];
  }
}
