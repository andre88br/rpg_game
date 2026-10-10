/* A vista 3D só é baixada na primeira vez que alguém entra num mapa que a
   tem (com a visão 3D ligada). Enquanto chega — ou se o aparelho não tiver
   WebGL —, o mundo continua sendo desenhado no plano, sem travar nada. */
import type { Vista3D } from './vista3d.ts';

/* atalho de depuração (window.jogo.forcar3D): 3D em qualquer mapa, para
   ver as regiões que o jogador ainda vê no plano */
let forcado = false;
export function forcar3D(v: boolean): void { forcado = v; }
export function forcado3D(): boolean { return forcado; }

let estado: 'nada' | 'carregando' | 'pronta' | 'falhou' = 'nada';
let vista: Vista3D | null = null;

export function vista3D(): Vista3D | null {
  if (estado === 'nada') {
    estado = 'carregando';
    import('./vista3d.ts')
      .then((m) => { vista = new m.Vista3D(); estado = 'pronta'; })
      .catch((e: unknown) => { estado = 'falhou'; console.warn('vista 3D indisponível:', e); });
  }
  return vista;
}

/* uma vez por quadro, depois de desenhar a cena: se o mundo 3D não foi
   desenhado neste quadro (batalha, menu de título...), o canvas dele some */
export function fimDoQuadro3D(): void { vista?.fimDoQuadro(); }
