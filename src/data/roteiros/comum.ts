/* =========================================================================
   Peças de roteiro que mais de uma região usa. Ficam aqui, e não em
   cutscenes.ts, porque é ele quem importa os roteiros de cada região: se
   eles importassem valores de lá, a importação seria circular.
   ========================================================================= */
import type { Ator } from '../cutscenes.ts';

/* as medalhas em arco, acendendo uma depois da outra */
const ORDEM_MEDALHAS = ['mare', 'raiz', 'brasa', 'rodamoinho', 'trovao', 'pedra', 'breu', 'aurora'];
export const arcoMedalhas: Ator[] = ORDEM_MEDALHAS.map((id, i) => {
  const a = Math.PI * (0.92 - (i / 7) * 0.84);
  return {
    figura: { medalha: id, tam: 16 },
    x: Math.round(120 + Math.cos(a) * 92 - 8),
    y: Math.round(66 - Math.sin(a) * 44 - 8),
    aparece: 0.8 + i * 0.45,
    balanco: { amp: 1, periodo: 2.4, fase: i * 0.7 },
  };
});

