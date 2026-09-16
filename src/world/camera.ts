/* Camera presa ao jogador e limitada as bordas do mapa, para nunca mostrar
   o vazio fora do cenario. */
import { LARGURA, ALTURA } from '../core/renderer.ts';

export class Camera {
  x = 0;
  y = 0;

  seguir(alvoX: number, alvoY: number, mapaLarg: number, mapaAlt: number): void {
    const desejadoX = alvoX - LARGURA / 2;
    const desejadoY = alvoY - ALTURA / 2;
    this.x = mapaLarg <= LARGURA ? (mapaLarg - LARGURA) / 2
                                 : Math.max(0, Math.min(desejadoX, mapaLarg - LARGURA));
    this.y = mapaAlt <= ALTURA ? (mapaAlt - ALTURA) / 2
                               : Math.max(0, Math.min(desejadoY, mapaAlt - ALTURA));
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
  }
}
