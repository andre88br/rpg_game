/* =========================================================================
   Caça ao tesouro.

   Nas Minas da Caipora há coisas enterradas: objetos `enterrado`, que não
   se desenham e não são parede — só se acha cavando (A de frente para o
   tile certo). A forquilha de radiestesia, usada na mochila, não aponta o
   lugar: diz se o tesouro mais perto está QUENTE, MORNO, FRIO ou GELADO,
   pela distância em passos. Achar é andar e sondar de novo.

   Puro: recebe o mapa e quem está ativo, devolve o texto. Teste em
   tesouro.test.ts.
   ========================================================================= */
import type { DefMapa, DefObjeto } from '../world/tilemap.ts';

export type Temperatura = 'quente' | 'morno' | 'frio' | 'gelado' | 'nada';

export interface Sondagem { temperatura: Temperatura; distancia: number | null; texto: string }

/* até quantos passos cada temperatura vale */
export const QUENTE = 2;
export const MORNO = 6;
export const FRIO = 12;

/* enterrado que ainda tem o que dar: ativo agora e não cavado */
function aindaEnterrado(o: DefObjeto, ativo: (o: DefObjeto) => boolean): boolean {
  return o.tipo === 'enterrado' && o.vazio !== true && ativo(o);
}

export function sondarTesouro(def: DefMapa, ativo: (o: DefObjeto) => boolean,
                              tx: number, ty: number): Sondagem {
  let perto: number | null = null;
  for (const o of def.objetos) {
    if (!aindaEnterrado(o, ativo)) continue;
    const d = Math.abs(o.tx - tx) + Math.abs(o.ty - ty);
    if (perto === null || d < perto) perto = d;
  }
  if (perto === null) {
    return { temperatura: 'nada', distancia: null,
             texto: 'A forquilha fica parada. Não tem mais nada enterrado por aqui.' };
  }
  if (perto <= QUENTE) {
    return { temperatura: 'quente', distancia: perto,
             texto: 'QUENTE! A forquilha puxa pro chão. Cave aqui em volta.' };
  }
  if (perto <= MORNO) {
    return { temperatura: 'morno', distancia: perto, texto: 'MORNO. A forquilha treme de leve. Está perto.' };
  }
  if (perto <= FRIO) {
    return { temperatura: 'frio', distancia: perto, texto: 'FRIO. A forquilha mal se mexe. Ainda falta andar.' };
  }
  return { temperatura: 'gelado', distancia: perto,
           texto: 'GELADO. A forquilha nem liga. O tesouro deste lugar está longe daqui.' };
}
