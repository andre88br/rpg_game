/* =========================================================================
   Qual tema toca onde: no mapa em que se anda e na batalha que começa.

   No mapa: o breu tem tema próprio, o terreiro (e a arena) também; dentro
   de casa toca a modinha; ao ar livre, o tema da região. Um mapa pode
   pedir outro tema no próprio dado (`musica` em DefMapa) — é o caso da
   praça do Círculo, que fica na região do Sol mas não é a Cidade do Sol.

   Na batalha: o bicho do mato tem a corrida curta; o treinador comum, a
   dele; e o chefe — dono de terreiro, rival, guardião, campeão, revanche,
   e os bichos-chefe que esperam no mapa — a mais pesada.

   Puro. Teste em temas.test.ts.
   ========================================================================= */
import type { Tipo } from '../art/palette.ts';
import type { DefMapa, DefTreinador } from '../world/tilemap.ts';
import { regiaoDoMapa } from '../data/mundo.ts';
import type { IdMusica } from './musicas.ts';

const DA_REGIAO: Record<Tipo, IdMusica> = {
  agua: 'mundoFoz', planta: 'mundoMata', fogo: 'mundoSerra', vento: 'mundoCampo',
  raio: 'mundoTupa', terra: 'mundoMinas', sombra: 'mundoCuca', luz: 'mundoSol',
};

export function temaDoMapa(def: DefMapa): IdMusica {
  if (def.musica) return def.musica;
  if (def.escuro) return 'breu';
  if (def.id.startsWith('terreiro') || def.zeraAoEntrar) return 'terreiro';
  if (def.interior) return 'casa';
  const r = regiaoDoMapa(def.id);
  return r ? DA_REGIAO[r.tipo] : 'mundoCirculo';
}

/* As classes de quem é chefe começam assim. MOLEQUE DA VILA é o Zeca,
   rival de sempre, nas sete primeiras lutas. "GUARDA DO ..." (os guardas
   dos terreiros) fica de fora de propósito: GUARDI só pega GUARDIÃ/GUARDIÃO.
   Os bichos-chefe que esperam no mapa (o do farol, o da cumeeira, o dono
   da cava...) entram pela classe também: DONO, DONA, BICHO, GUARDIÃO. */
const CHEFE = /^(DON[OA] |REVANCHE|RIVAL|MOLEQUE DA VILA|GUARDI|CAMPE|BICHO|CHEFE)/;

/* `null` é o bicho do mato alto */
export function temaDaBatalha(t: Pick<DefTreinador, 'classe' | 'selvagem'> | null): IdMusica {
  if (t && CHEFE.test(t.classe)) return 'batalhaChefe';
  // bicho sem ser chefe (o Sacizinho da rede, a Caiporinha da muda) é luta de mato
  if (!t || t.selvagem) return 'batalhaSelvagem';
  return 'batalhaTreinador';
}
