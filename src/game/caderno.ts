/* =========================================================================
   Onde achar cada espécie — a terceira aba do Caderno de Bichos.

   Tudo sai dos dados: as tabelas de encontro dos mapas (com a hora e o
   tempo que pedem), os bichos-chefe que se prendem no patuá, os presentes
   dos serviços, os três patuás da Firmina e de quem cada um evolui. Nada
   aqui é escrito à mão, então um mapa novo já aparece no caderno sozinho.
   ========================================================================= */
import { MAPAS } from '../data/mapas/index.ts';
import { REGIOES } from '../data/mundo.ts';
import { ESPECIES, especie } from '../data/creatures.ts';

export interface Onde {
  /* mapas onde aparece no mato, na ordem da trilha; `quando` só se for
     exclusivo de um período ou de um tempo */
  mato: { mapa: string; quando?: string }[];
  /* bicho-chefe: está parado num lugar, e luta como selvagem */
  chefe: string[];
  /* entregue por alguém, num serviço */
  presente: string[];
  inicial: boolean;
  evoluiDe: { especie: string; nv: number } | null;
}

const INICIAIS = ['curupinho', 'boitatinha', 'iarinha'];

/* os mapas na ordem da trilha: região por região, na ordem da lista */
const ORDEM: readonly string[] = REGIOES.flatMap((r) => r.mapas);

const NOME_CLIMA: Record<string, string> = {
  limpo: 'TEMPO LIMPO', chuva: 'CHUVA', ventania: 'VENTANIA', tempestade: 'TEMPESTADE', neblina: 'NEBLINA',
};

export function ondeAchar(id: string): Onde {
  const mato: Onde['mato'] = [];
  const chefe: string[] = [];
  const presente: string[] = [];
  for (const mapa of ORDEM) {
    const def = MAPAS[mapa];
    if (!def) continue;
    const faixas = (def.encontros ?? []).filter((f) => f.especie === id);
    if (faixas.length) {
      // se alguma faixa não pede nada, o bicho aparece sempre ali
      const livre = faixas.some((f) => !f.quando && !f.clima);
      const f = faixas[0]!;
      const quando = livre ? undefined
        : f.quando === 'noite' ? 'DE NOITE' : f.quando === 'dia' ? 'DE DIA'
        : f.clima ? `COM ${NOME_CLIMA[f.clima] ?? f.clima.toUpperCase()}` : undefined;
      mato.push(quando ? { mapa, quando } : { mapa });
    }
    for (const n of def.npcs) {
      if (n.treinador?.selvagem && n.treinador.time.some((t) => t.especie === id) && !chefe.includes(mapa)) chefe.push(mapa);
      if (n.falas.some((fala) => fala.encantado?.especie === id) && !presente.includes(mapa)) presente.push(mapa);
    }
  }
  let evoluiDe: Onde['evoluiDe'] = null;
  for (const e of Object.values(ESPECIES)) {
    if (e.evolui?.em === id) evoluiDe = { especie: e.id, nv: e.evolui.nv };
  }
  return { mato, chefe, presente, inicial: INICIAIS.includes(id), evoluiDe };
}

const nomeMapa = (id: string): string => MAPAS[id]?.nome ?? id;

/* As frases da aba, curtas: no máximo três lugares por linha, o resto
   vira "E MAIS N" — a aba tem cinco linhas estreitas. */
export function textoOnde(id: string): string {
  const o = ondeAchar(id);
  const partes: string[] = [];
  if (o.mato.length) {
    const nomes = o.mato.slice(0, 3).map((m) => nomeMapa(m.mapa) + (m.quando ? ` (${m.quando})` : ''));
    const resto = o.mato.length - 3;
    partes.push(`No mato: ${nomes.join(', ')}${resto > 0 ? ` e mais ${resto}` : ''}.`);
  }
  if (o.chefe.length) partes.push(`Mora em ${o.chefe.map(nomeMapa).join(', ')}.`);
  if (o.presente.length) partes.push(`Presente de um serviço em ${o.presente.map(nomeMapa).join(', ')}.`);
  if (o.inicial) partes.push('Um dos três patuás da Dona Firmina.');
  if (o.evoluiDe) partes.push(`Evolui de ${especie(o.evoluiDe.especie).nome} no nível ${o.evoluiDe.nv}.`);
  return partes.length ? partes.join(' ') : 'Ninguém sabe onde mora.';
}
