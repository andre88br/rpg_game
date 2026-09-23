/* =========================================================================
   Atores: jogador e NPCs. O movimento e preso a grade — um passo leva o
   personagem de um tile ao seguinte e so aceita novo comando ao chegar.
   E isso que da a cadencia caracteristica do genero.
   ========================================================================= */
import { assarSuave, larguraDe, alturaDe, type Assado, type Buf } from '../core/buf.ts';
import { folhaPersonagem, type Direcao, type OpcoesPessoa } from '../art/people.ts';
import { TS, type Mapa } from './tilemap.ts';
import { multiplicadorVelocidade } from '../game/config.ts';

export type FolhaAssada = Record<Direcao, [Assado, Assado, Assado]>;

export function assarFolha(op: OpcoesPessoa): FolhaAssada {
  const crua = folhaPersonagem(op);
  const saida = {} as FolhaAssada;
  for (const d of ['baixo', 'cima', 'esq', 'dir'] as Direcao[]) {
    saida[d] = [assarSuave(crua[d][0]), assarSuave(crua[d][1]), assarSuave(crua[d][2])];
  }
  return saida;
}

/* Um Encantado andando pelo mapa, com a arte de batalha mesmo. Ele nao tem
   doze poses como gente tem: e o mesmo desenho nos quatro lados, e o sprite
   e maior que o tile — quem desenha acerta os pes pela altura da imagem. */
export function assarBicho(arte: Buf): FolhaAssada {
  const img = assarSuave(arte);
  const trio: [Assado, Assado, Assado] = [img, img, img];
  const saida = {} as FolhaAssada;
  for (const d of ['baixo', 'cima', 'esq', 'dir'] as Direcao[]) saida[d] = trio;
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

  /* onde desenhar o quadro atual para os pes encostarem na base do tile.
     Gente tem 16x20 e sobra 4px por cima; bicho tem 32x32 e sobra bem mais. */
  /* pelo tamanho NA TELA, nunca pelo width cru: a imagem assada suave tem
     mais pixels do que ocupa, e medir por ela jogava o personagem meio corpo
     para cima e meio sprite para o lado — em cima da casa, fora do vão */
  get desenhoX(): number { return this.px + (TS - larguraDe(this.quadro())) / 2; }
  get desenhoY(): number { return this.py + TS - alturaDe(this.quadro()); }

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
    this.duracao = (correr ? VEL_CORRER : VEL_ANDAR) / multiplicadorVelocidade();
    this.movendo = true;
  }

  /* Passo sem pedir licença ao mapa: é assim que o escoltado vai para o
     tile que o jogador acabou de deixar. Se ainda estava no meio do passo
     anterior, termina ele na hora; se o alvo não é vizinho (o jogador
     atravessou uma porta), aparece lá direto. */
  andarPara(tx: number, ty: number, correr: boolean): void {
    if (this.movendo) { this.movendo = false; this.deX = this.tx; this.deY = this.ty; }
    const dx = tx - this.tx, dy = ty - this.ty;
    if (dx === 0 && dy === 0) return;
    if (Math.abs(dx) + Math.abs(dy) !== 1) { this.teleportar(tx, ty); return; }
    this.dir = direcaoDe(dx, dy) ?? this.dir;
    this.deX = this.tx; this.deY = this.ty;
    this.tx = tx; this.ty = ty;
    this.progresso = 0;
    this.duracao = (correr ? VEL_CORRER : VEL_ANDAR) / multiplicadorVelocidade();
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
