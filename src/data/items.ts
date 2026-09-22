/* =========================================================================
   Itens da mochila.

   Patuás são os "objetos de captura" do jogo: saquinhos de reza que prendem
   o Encantado. Quanto melhor o patuá, maior o bônus na conta de captura.
   ========================================================================= */
import type { Status } from '../battle/status.ts';

export type EfeitoItem =
  | { k: 'nenhum' }                    // item de recado: vale pelo que destrava
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
  /* item de serviço: não se compra, não se vende, não se usa à toa */
  chave?: boolean;
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

  /* ---- itens de serviço ---- */
  { id: 'carta', nome: 'Carta da Firmina', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Dobrada em quatro e lacrada com cera. É para o Mestre do Porto.' },
  { id: 'caderno', nome: 'Caderno de Bichos', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Onde o Contador anota cada Encantado que aparece na Foz.' },
  { id: 'rede', nome: 'Rede de Pesca', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Rede do Mestre do Porto, surrupiada por mão pequena e rápida.' },
  { id: 'carta_tie', nome: 'Carta para a Tiê', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Dobrada em quatro, lacrada com cera. A Dona Firmina escreveu para a Tiê.' },
  { id: 'muda', nome: 'Muda de Árvore', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Muda do viveiro do Seu Elias, escondida por uma Caiporinha arteira.' },
  { id: 'carvao', nome: 'Carvão da Mina', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Pedaço de carvão ainda quente, achado no breu da Caverna do Boitatá.' },
  { id: 'sino', nome: 'Sino de Bronze', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Um dos três sinos da capela da serra. Toca sozinho quando venta forte.' },
  { id: 'candeia', nome: 'Candeia', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Candeia de querosene do Ferreiro. Clareia um pouco mais que nada.' },
  { id: 'pena', nome: 'Pena de Vento', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Pena leve que não cai: fica boiando até alguém fechar a mão nela.' },
  { id: 'capim_dourado', nome: 'Capim Dourado', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Capim que só cresce onde bate vento o ano inteiro. Não murcha, não apaga.' },
  { id: 'pedra_raio', nome: 'Pedra-de-Raio', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Pedra lisa que o raio deixa onde cai. Ainda formiga na palma da mão.' },
  { id: 'pena_trovao', nome: 'Pena de Trovão', preco: 0, emBatalha: false, chave: true,
    efeito: { k: 'nenhum' },
    descricao: 'Pena grande e escura que arrepia sozinha quando vem tempestade.' },
];

export const ITENS: Record<string, Item> =
  Object.fromEntries(LISTA.map((i) => [i.id, i]));

export function item(id: string): Item {
  const i = ITENS[id];
  if (!i) throw new Error(`item desconhecido: ${id}`);
  return i;
}

export const ITENS_ORDEM: readonly string[] = LISTA.map((i) => i.id);

/* o que a loja de Porto Iara põe na prateleira */
export const ITENS_A_VENDA: readonly string[] =
  LISTA.filter((i) => !i.chave && i.preco > 0).map((i) => i.id);

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
