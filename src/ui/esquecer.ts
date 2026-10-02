/* =========================================================================
   "Esquecer qual golpe?" — a escolha que aparece quando um Encantado de
   quatro golpes vai aprender mais um, fora da batalha: pelo Rezador ou por
   uma Cantiga. Os quatro golpes de agora, mais NÃO APRENDER.

   Só a lista e o cursor; quem chama desenha a moldura (o título diz quem
   quer aprender o quê) e decide o que fazer com a resposta.
   ========================================================================= */
import type { Renderizador } from '../core/renderer.ts';
import type { Entrada } from '../core/input.ts';
import { P, infoTipo } from '../art/palette.ts';
import { golpe as fichaGolpe } from '../data/moves.ts';
import type { Encantado } from '../battle/encantado.ts';
import { etiquetaTipo } from './listas.ts';

/* o índice do golpe que sai; 'desistiu' é NÃO APRENDER ou o B */
export type RespostaEsquecer = { k: 'nada' } | { k: 'desistiu' } | { k: 'esquece'; indice: number };

export class EscolhaEsquecer {
  private sel = 0;

  abrir(): void { this.sel = 0; }

  atualizar(entrada: Entrada, e: Encantado): RespostaEsquecer {
    const total = e.golpes.length + 1;
    if (entrada.apertou('cima')) this.sel = (this.sel - 1 + total) % total;
    if (entrada.apertou('baixo')) this.sel = (this.sel + 1) % total;
    if (entrada.apertou('b')) return { k: 'desistiu' };
    if (!entrada.apertou('a')) return { k: 'nada' };
    return this.sel < e.golpes.length ? { k: 'esquece', indice: this.sel } : { k: 'desistiu' };
  }

  /* a lista começa em `y`; o mesmo desenho da escolha de dentro da batalha */
  desenhar(r: Renderizador, e: Encantado, y0 = 48): void {
    r.texto('ESQUECER QUAL GOLPE?', 14, y0 - 18, P.uiInk!);
    e.golpes.forEach((g, i) => {
      const f = fichaGolpe(g.id);
      const y = y0 + i * 15;
      if (i === this.sel) r.texto('=', 14, y, P.uiAccD!);
      r.texto(f.nome, 24, y, P.uiInk!);
      etiquetaTipo(r, infoTipo(f.tipo), 150, y);
      r.texto(`${g.pp}/${g.ppMax}`, 192, y, P.uiInk!);
    });
    const y = y0 + e.golpes.length * 15;
    if (this.sel === e.golpes.length) r.texto('=', 14, y, P.uiAccD!);
    r.texto('NÃO APRENDER', 24, y, P.uiInk!);
  }
}
