/* =========================================================================
   O desenho do mundo plano: o cenário, o feixe de luz, quem anda (nadando
   ou no mato alto) e as pedras de empurrar — e o breu com o disco de luz
   em volta do jogador, que vale também por cima da vista 3D.

   Guarda os recursos que só o desenho usa, assados uma vez na partida: o
   mato que se abre, a onda do nado, a pedra e as máscaras de luz.
   ========================================================================= */
import { assar, assarSuave, larguraDe, type Assado } from '../../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../../core/renderer.ts';
import { TS, type Mapa } from '../../world/tilemap.ts';
import type { Camera } from '../../world/camera.ts';
import type { Ator } from '../../world/actor.ts';
import type { Pedra } from '../../world/pedras.ts';
import * as T from '../../art/tiles.ts';

/* quanto do sprite (de 20px de altura) fica visível nadando — corta bem no
   pescoço, água na altura do peito. O resto de baixo nem se desenha: quem
   mostra que é água ali é o próprio tile por baixo. */
const ALTURA_NADANDO = 14;

export interface CenaPlana {
  mapa: Mapa;
  camera: Camera;
  /* todos que andam pelo mapa agora, jogador incluso */
  atores: readonly Ator[];
  pedras: readonly Pedra[];
  /* os tiles por onde passa o feixe de luz */
  feixe: readonly (readonly [number, number])[];
  tempo: number;
}

export class PintorMundo {
  private readonly rocadas: Assado[];
  private readonly ondas: Assado[];
  private pedraImg: Assado | null = null;
  private readonly mascarasLuz = new Map<number, Assado>();

  constructor() {
    this.rocadas = [assarSuave(T.rocada(0)), assarSuave(T.rocada(1)), assarSuave(T.rocada(2))];
    this.ondas = [assarSuave(T.ondaNado(0)), assarSuave(T.ondaNado(1))];
  }

  plano(r: Renderizador, c: CenaPlana): void {
    const { mapa, camera } = c;
    mapa.desenhar(r.ctx, camera.x, camera.y, LARGURA, ALTURA);

    // o feixe de luz, por cima do chão e por baixo de quem anda
    for (const [fx, fy] of c.feixe) {
      const px = fx * TS - camera.x, py = fy * TS - camera.y;
      r.retangulo(px + 5, py + 5, 6, 6, '#ffe860');
      r.retangulo(px + 7, py + 7, 2, 2, '#ffffff');
    }

    // atores e pedras, juntos, ordenados pela base: quem está mais abaixo
    // passa na frente — senão uma pedra numa fileira de baixo tampava
    // indevidamente quem andasse por cima dela na fileira de cima
    const itens: { py: number; desenhar: () => void }[] = c.atores.map((a) => ({
      py: a.py,
      desenhar: () => {
        const x = a.desenhoX - camera.x, y = a.desenhoY - camera.y;
        if (mapa.agua(a.tx, a.ty)) {
          // nadando: só a cabeça de fora. O corpo nem se desenha — é a água
          // do próprio tile, já pintada por baixo, que faz o resto do trabalho
          const img = a.quadro();
          r.recorte(img, 0, 0, larguraDe(img), ALTURA_NADANDO, x, y);
          const q = Math.floor(c.tempo * 2) % 2;
          r.sprite(this.ondas[q]!, a.px - camera.x, y + ALTURA_NADANDO - 3);
        } else {
          r.sprite(a.quadro(), x, y);
        }
        if (mapa.temEncontro(a.tx, a.ty)) {
          const q = a.movendo ? 1 + (Math.floor(c.tempo * 12) % 2) : 0;
          r.sprite(this.rocadas[q]!, a.px - camera.x, a.py + 8 - camera.y);
        }
      },
    }));
    if (c.pedras.length > 0) {
      if (!this.pedraImg) this.pedraImg = assar(T.pedraRolante());
      const img = this.pedraImg;
      for (const p of c.pedras) {
        itens.push({
          py: p.ty * TS,
          desenhar: () => r.sprite(img, p.tx * TS - camera.x, p.ty * TS - camera.y),
        });
      }
    }
    itens.sort((a, b) => a.py - b.py);
    for (const it of itens) it.desenhar();
  }

  /* breu com um disco de luz de raio `raio` centrado em (cx, cy) na tela */
  escuridao(r: Renderizador, raio: number, cx: number, cy: number): void {
    let mascara = this.mascarasLuz.get(raio);
    if (!mascara) {
      mascara = assar(T.mascaraLuz(raio));
      this.mascarasLuz.set(raio, mascara);
    }
    r.escuridao(mascara, cx, cy);
  }
}
