/* =========================================================================
   Os treinadores do mapa: quem avista o jogador e com que time ele luta.

   Contas puras, sem cena: a cena do mundo pergunta "este vigia viu?" e
   "com quem ele vem?" e cuida do resto (o "!", a caminhada, a conversa).
   ========================================================================= */
import { DELTAS } from '../../world/direcao.ts';
import type { Direcao } from '../../art/people.ts';
import type { DefTreinador } from '../../world/tilemap.ts';
import { criar, type Encantado } from '../../battle/encantado.ts';
import type { Treinador } from '../../battle/engine.ts';
import { formaNoNivel, nivelEscalado } from '../../game/escala.ts';
import { adicionar } from '../../data/items.ts';
import type { EstadoJogo } from '../../game/state.ts';

export interface Vigia { tx: number; ty: number; dir: Direcao; visao: number }

/* O vigia olha reto para onde está virado, até `visao` tiles: uma parede
   corta a vista, e outro NPC no caminho também. */
export function avistou(v: Vigia, alvo: { tx: number; ty: number },
                        solido: (x: number, y: number) => boolean,
                        ocupado: (x: number, y: number) => boolean): boolean {
  const [dx, dy] = DELTAS[v.dir];
  for (let i = 1; i <= v.visao; i++) {
    const x = v.tx + dx * i, y = v.ty + dy * i;
    if (solido(x, y)) return false;
    if (x === alvo.tx && y === alvo.ty) return true;
    if (ocupado(x, y)) return false;
  }
  return false;
}

/* O time de verdade de um treinador, na hora da luta:
   - a revanche que cresce vem no nível do melhor do time do jogador;
   - treinador leva cada bicho na forma que ele teria nesse nível (um
     Cabritinha no 42 já virou Cabra-Cabriola); o bicho-chefe selvagem fica
     como foi desenhado;
   - o trunfo, um sexto membro contra o inicial de quem joga. */
export function timeDoTreinador(t: DefTreinador, e: EstadoJogo): Encantado[] {
  const nv = (c: { nivel: number }) => (t.escala ? nivelEscalado(e, t.escala) : c.nivel);
  const time = t.time.map((c) => {
    const nivel = nv(c);
    return criar(t.selvagem ? c.especie : formaNoNivel(c.especie, nivel), nivel, { selvagem: t.selvagem });
  });
  if (t.trunfo) {
    const chave = Object.keys(t.trunfo).find((esp) => e.flags[`inicial_${esp}`] === true);
    const escolhido = (chave ? t.trunfo[chave] : undefined) ?? Object.values(t.trunfo)[0]!;
    time.push(criar(formaNoNivel(escolhido.especie, escolhido.nivel), escolhido.nivel));
  }
  return time;
}

/* o painel de treinador da batalha; bicho não é treinador (sem painel, e o
   patuá funciona: prender o Boitatá do farol vale tanto quanto vencê-lo) */
export function fichaDoTreinador(nome: string, t: DefTreinador): Treinador | null {
  if (t.selvagem) return null;
  return {
    nome, classe: t.classe,
    falaInicio: t.falaInicio, falaDerrota: t.falaDerrota, premio: t.premio,
    esperta: t.esperta,
  };
}

/* O que vencer (ou prender, se for bicho) dá: `venceu_<id>`, as flags de
   `liga`, o prêmio em réis e o item que ele largava. */
export function premiarVitoria(e: EstadoJogo, id: string, t: DefTreinador): void {
  e.flags[`venceu_${id}`] = true;
  for (const f of t.liga === undefined ? [] : typeof t.liga === 'string' ? [t.liga] : t.liga) e.flags[f] = true;
  if (t.premio) e.dinheiro += t.premio;
  if (t.da) adicionar(e.mochila, t.da.item, t.da.n ?? 1);
}
