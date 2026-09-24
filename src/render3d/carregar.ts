/* A vista 3D só é baixada na primeira vez que alguém entra num mapa que a
   tem (com a visão 3D ligada). Enquanto chega — ou se o aparelho não tiver
   WebGL —, o mundo continua sendo desenhado no plano, sem travar nada. */
import type { Vista3D } from './vista3d.ts';

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
