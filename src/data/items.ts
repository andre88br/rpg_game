/* =========================================================================
   Itens da mochila.

   Patuás são os "objetos de captura" do jogo: saquinhos de reza que prendem
   o Encantado. Quanto melhor o patuá, maior o bônus na conta de captura.
   ========================================================================= */
import type { Status } from '../battle/status.ts';

export type EfeitoItem =
  | { k: 'patua'; bonus: number }
  | { k: 'cura'; hp: number }
  | { k: 'limpar'; status: readonly Status[] | 'todos' }
  | { k: 'reviver'; fracao: number };

export interface Item {
  id: string;
  nome: string;
  efeito: EfeitoItem;
  preco: number;
  emBatalha: boolean;
  descricao: string;
}

const LISTA: readonly Item[] = [
  { id: 'patua', nome: 'Patuá', preco: 200, emBatalha: true,
    efeito: { k: 'patua', bonus: 1 },
    descricao: 'Saquinho de reza comum. Prende Encantado fraco ou machucado.' },
  { id: 'patua_bom', nome: 'Patuá Bom', preco: 600, emBatalha: true,
    efeito: { k: 'patua', bonus: 1.5 },
    descricao: 'Costurado com fita do Bonfim. Prende melhor que o comum.' },
  { id: 'patua_mestre', nome: 'Patuá de Mestre', preco: 1200, emBatalha: true,
    efeito: { k: 'patua', bonus: 2.5 },
    descricao: 'Benzido três vezes. Segura quase qualquer Encantado.' },

  { id: 'garrafada', nome: 'Garrafada', preco: 300, emBatalha: true,
    efeito: { k: 'cura', hp: 20 },
    descricao: 'Remédio de raiz. Devolve 20 de fôlego.' },
  { id: 'garrafada_forte', nome: 'Garrafada Forte', preco: 700, emBatalha: true,
    efeito: { k: 'cura', hp: 50 },
    descricao: 'A mesma receita, mas da mão da benzedeira. Devolve 50.' },
  { id: 'erva_doce', nome: 'Erva-Doce', preco: 250, emBatalha: true,
    efeito: { k: 'limpar', status: 'todos' },
    descricao: 'Chá que corta qualquer mau-jeito: queimadura, sono, veneno.' },
  { id: 'agua_benta', nome: 'Água Benta', preco: 1500, emBatalha: true,
    efeito: { k: 'reviver', fracao: 0.5 },
    descricao: 'Levanta um Encantado desmaiado com metade do fôlego.' },
];

export const ITENS: Record<string, Item> =
  Object.fromEntries(LISTA.map((i) => [i.id, i]));

export function item(id: string): Item {
  const i = ITENS[id];
  if (!i) throw new Error(`item desconhecido: ${id}`);
  return i;
}

export const ITENS_ORDEM: readonly string[] = LISTA.map((i) => i.id);

/* ------------------------------------------------------------- mochila */

export type Mochila = Record<string, number>;

export function quantidade(m: Mochila, id: string): number { return m[id] ?? 0; }

export function adicionar(m: Mochila, id: string, n = 1): void {
  m[id] = quantidade(m, id) + n;
}

export function consumir(m: Mochila, id: string, n = 1): boolean {
  if (quantidade(m, id) < n) return false;
  m[id] = quantidade(m, id) - n;
  if (m[id]! <= 0) delete m[id];
  return true;
}
