/* =========================================================================
   Estado da partida: o que é SEU e atravessa cenas, mapas e batalhas.

   A cena de mundo e a de batalha mexem nas MESMAS referências de Encantado,
   então o HP perdido numa luta continua perdido ao voltar para o mapa — sem
   nenhum trabalho de sincronização.
   ========================================================================= */
import { curar, curarTudo, desmaiado, nome, reviver, type Encantado } from '../battle/encantado.ts';
import { adicionar, consumir, item, type Mochila } from '../data/items.ts';
import type { Direcao } from '../art/people.ts';
import { MAPAS, MAPA_INICIAL } from '../data/mapas/index.ts';

export const TAMANHO_TIME = 6;

/* Os dois protagonistas — a mesma escolha que abre um jogo novo, em
   scenes/personagem.ts. O pronome mora aqui, não lá, porque é dado que
   quests.ts também precisa (para {crianca}/{caida} no recheio das falas) e
   quests.ts não pode importar de scenes/. */
export interface Protagonista { id: string; nome: string; pronome: 'ele' | 'ela' }

export const PROTAGONISTAS: readonly Protagonista[] = [
  { id: 'taina', nome: 'TAINÁ', pronome: 'ela' },
  { id: 'bento', nome: 'BENTO', pronome: 'ele' },
];

export function pronomeDe(e: EstadoJogo): 'ele' | 'ela' {
  return PROTAGONISTAS.find((p) => p.id === e.personagem)?.pronome ?? 'ela';
}

/* onde o jogador está, ou onde ele acorda depois de apagar */
export interface Lugar { mapa: string; tx: number; ty: number; dir: Direcao }

export interface EstadoJogo {
  nome: string;
  /* chave em ESTILOS (art/people.ts) — qual dos dois protagonistas anda o
     mapa; escolhido junto com o nome, antes do primeiro passo */
  personagem: string;
  posicao: Lugar;
  refugio: Lugar;
  time: Encantado[];
  caixa: Encantado[];               // o que não coube no time
  mochila: Mochila;
  dinheiro: number;
  medalhas: string[];
  flags: Record<string, boolean>;
  vistos: string[];                 // espécies já encontradas
  capturados: string[];             // espécies já presas num patuá
}

/* A partida começa SEM Encantado nenhum: o primeiro é escolhido na mesa da
   Dona Firmina, em Vila Aurora. Até lá o mato alto não gera encontro e nenhum
   treinador desafia — as duas coisas checam se há alguém de pé. */
export function novoJogo(nome = 'TAINÁ', personagem = 'taina'): EstadoJogo {
  const inicio = MAPAS[MAPA_INICIAL]!.inicio;
  const lugar = (): Lugar => ({ mapa: MAPA_INICIAL, ...inicio });
  const est: EstadoJogo = {
    nome,
    personagem,
    posicao: lugar(),
    refugio: lugar(),
    time: [],
    caixa: [],
    mochila: {},
    dinheiro: 3000,
    medalhas: [],
    flags: {},
    vistos: [],
    capturados: [],
  };
  adicionar(est.mochila, 'patua', 10);
  adicionar(est.mochila, 'garrafada', 5);
  adicionar(est.mochila, 'erva_doce', 2);
  return est;
}

export function timeEmPe(e: EstadoJogo): Encantado[] {
  return e.time.filter((c) => !desmaiado(c));
}

export function temTimeEmPe(e: EstadoJogo): boolean {
  return e.time.some((c) => !desmaiado(c));
}

export function curarTime(e: EstadoJogo): void {
  for (const c of e.time) curarTudo(c);
}

/* Entra no time se houver vaga; senão vai para a caixa.
   Devolve true quando entrou no time. */
export function guardar(e: EstadoJogo, bicho: Encantado): boolean {
  registrar(e, bicho.especie, true);
  if (e.time.length < TAMANHO_TIME) { e.time.push(bicho); return true; }
  e.caixa.push(bicho);
  return false;
}

export function registrar(e: EstadoJogo, especie: string, capturado = false): void {
  if (!e.vistos.includes(especie)) e.vistos.push(especie);
  if (capturado && !e.capturados.includes(especie)) e.capturados.push(especie);
}

export function ligar(e: EstadoJogo, flag: string): void { e.flags[flag] = true; }
export function tem(e: EstadoJogo, flag: string): boolean { return e.flags[flag] === true; }

/* troca dois Encantados de posição no time — é a ordem que decide quem entra
   em campo primeiro numa batalha. */
export function trocarPosicoes(e: EstadoJogo, i: number, j: number): void {
  const t = e.time;
  if (!t[i] || !t[j] || i === j) return;
  [t[i], t[j]] = [t[j], t[i]];
}

/* Patuá prende, e prender só faz sentido dentro de uma luta: os outros três
   sabores de item (garrafada, erva-doce, água benta) não precisam de
   adversário nenhum, então não há razão para trancá-los na batalha. */
export function usavelForaDeBatalha(id: string): boolean {
  const k = item(id).efeito.k;
  return k === 'cura' || k === 'limpar' || k === 'reviver';
}

/* Usa um item de cura fora de batalha, no Encantado do índice dado.
   Espelha o que battle/engine.ts faz dentro da luta: só consome o item
   quando ele de fato ajuda, para não gastar uma garrafada num time já são. */
export function usarItemForaDeBatalha(e: EstadoJogo, id: string,
                                      indice: number): { msg: string; usou: boolean } {
  const destino = e.time[indice];
  if (!destino) return { msg: 'Não tem ninguém aí.', usou: false };
  const ef = item(id).efeito;

  if (ef.k === 'cura') {
    if (desmaiado(destino)) return { msg: 'Não adiantou nada.', usou: false };
    if (!consumir(e.mochila, id)) return { msg: 'Acabou.', usou: false };
    const ganho = curar(destino, ef.hp);
    return { msg: `${nome(destino)} recuperou ${ganho} de fôlego.`, usou: true };
  }
  if (ef.k === 'limpar') {
    if (!destino.status) return { msg: 'Não adiantou nada.', usou: false };
    if (!consumir(e.mochila, id)) return { msg: 'Acabou.', usou: false };
    destino.status = null;
    destino.turnosStatus = 0;
    return { msg: `${nome(destino)} se sente bem melhor.`, usou: true };
  }
  if (ef.k === 'reviver') {
    if (!desmaiado(destino)) return { msg: 'Não adiantou nada.', usou: false };
    if (!consumir(e.mochila, id)) return { msg: 'Acabou.', usou: false };
    reviver(destino, ef.fracao);
    return { msg: `${nome(destino)} voltou a si!`, usou: true };
  }
  return { msg: 'Isso não se usa assim.', usou: false };
}
