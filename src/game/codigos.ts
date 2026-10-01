/* =========================================================================
   Códigos secretos: digitados com os próprios botões do jogo, andando livre
   pelo mundo (não contam em conversa, batalha, loja ou qualquer menu).

   Cada um é conferido contra o fim do mesmo buffer de botões apertados —
   por isso nenhum pode ser sufixo de outro, senão os dois disparariam
   juntos (teste em codigos.test.ts).

   Os oito códigos de pulo levam a partida até o começo de uma região, com
   as medalhas e os Dons de todas as anteriores: é o mesmo pacote para
   todos, só muda até onde ele vai. Puro: a cena só move o jogador.
   ========================================================================= */
import type { Acao } from '../core/input.ts';
import { criar } from '../battle/encantado.ts';
import { adicionar, quantidade } from '../data/items.ts';
import { guardar, NIVEL_INICIAL, type EstadoJogo } from './state.ts';

export type Pulo = 'regiao2' | 'regiao3' | 'regiao4' | 'regiao5' | 'regiao6'
                 | 'regiao7' | 'regiao8' | 'torneio';
export type Codigo = Pulo | 'evoluir' | 'potencia';

export const CODIGOS: Readonly<Record<Codigo, readonly Acao[]>> = {
  regiao2: ['cima', 'cima', 'baixo', 'baixo', 'esq', 'dir', 'esq', 'dir', 'b', 'a'],
  // o da região 3 é o mesmo de cabeça para baixo
  regiao3: ['baixo', 'baixo', 'cima', 'cima', 'dir', 'esq', 'dir', 'esq', 'b', 'a'],
  // o da região 4 gira a bússola inteira duas vezes
  regiao4: ['cima', 'dir', 'baixo', 'esq', 'cima', 'dir', 'baixo', 'esq', 'b', 'a'],
  // o da região 5 vai de um lado para o outro antes de subir e descer
  regiao5: ['esq', 'dir', 'esq', 'dir', 'cima', 'baixo', 'cima', 'baixo', 'b', 'a'],
  // o da região 6 desce e sobe antes de ir de lado
  regiao6: ['baixo', 'cima', 'baixo', 'cima', 'esq', 'dir', 'esq', 'dir', 'b', 'a'],
  // o da região 7 é o da 6 com cada direção trocada pela oposta
  regiao7: ['cima', 'baixo', 'cima', 'baixo', 'dir', 'esq', 'dir', 'esq', 'b', 'a'],
  // o da região 8 gira a bússola ao contrário da 4, duas voltas
  regiao8: ['esq', 'baixo', 'dir', 'cima', 'esq', 'baixo', 'dir', 'cima', 'b', 'a'],
  // o do Círculo Dourado é o da região 5 com cada direção trocada pela oposta
  torneio: ['dir', 'esq', 'dir', 'esq', 'baixo', 'cima', 'baixo', 'cima', 'b', 'a'],
  // os dois de baixo só diferem na direção que repetem — sobe evolui, desce dá poder
  evoluir: ['a', 'b', 'a', 'b', 'cima', 'cima', 'a'],
  potencia: ['a', 'b', 'a', 'b', 'baixo', 'baixo', 'a'],
};

const MAIOR = Math.max(...Object.values(CODIGOS).map((c) => c.length));

/* Guarda os últimos botões apertados e diz quando a cauda bate com algum
   código. Batendo, o buffer zera: o mesmo toque não dispara duas vezes. */
export class LeitorCodigos {
  private buffer: Acao[] = [];

  ler(apertados: readonly Acao[]): Codigo | null {
    if (apertados.length === 0) return null;
    this.buffer.push(...apertados);
    const excesso = this.buffer.length - MAIOR;
    if (excesso > 0) this.buffer.splice(0, excesso);
    for (const [id, codigo] of Object.entries(CODIGOS) as [Codigo, readonly Acao[]][]) {
      if (this.bate(codigo)) { this.buffer = []; return id; }
    }
    return null;
  }

  private bate(codigo: readonly Acao[]): boolean {
    if (this.buffer.length < codigo.length) return false;
    const cauda = this.buffer.slice(this.buffer.length - codigo.length);
    return codigo.every((a, i) => cauda[i] === a);
  }
}

/* as medalhas e os Dons na ordem da trilha: o Dom de cada medalha é o que
   abre a estrada para a região seguinte */
export const MEDALHAS = ['mare', 'raiz', 'brasa', 'rodamoinho', 'trovao', 'pedra', 'breu', 'aurora'] as const;
export const DONS = ['nadar', 'cortarCipo', 'tocha', 'rajada', 'faisca', 'escavar', 'visao', 'prisma'] as const;

export interface DefPulo {
  /* quantas medalhas (e Dons) da trilha o pulo entrega */
  medalhas: number;
  destino: string;
  aviso: string;
}

export const PULOS: Readonly<Record<Pulo, DefPulo>> = {
  regiao2: { medalhas: 1, destino: 'mataDoCurupira',
             aviso: 'Código aceito. A travessia para a Mata do Curupira se abre.' },
  regiao3: { medalhas: 2, destino: 'trilhaDaBrasa',
             aviso: 'Código aceito. A subida para a Serra Boitatá se abre.' },
  regiao4: { medalhas: 3, destino: 'campoAberto',
             aviso: 'Código aceito. A entrada para o Campo do Saci se abre.' },
  regiao5: { medalhas: 4, destino: 'campinaDosRaios',
             aviso: 'Código aceito. A estrada para a Aldeia Tupã se abre.' },
  regiao6: { medalhas: 5, destino: 'bocaDaMina',
             aviso: 'Código aceito. A estrada para as Minas da Caipora se abre.' },
  regiao7: { medalhas: 6, destino: 'ruaDoBreu',
             aviso: 'Código aceito. A estrada para o Bairro da Cuca se abre.' },
  // o véu da saída sul do bairro só cede ao Dom Visão Noturna
  regiao8: { medalhas: 7, destino: 'caminhoAurora',
             aviso: 'Código aceito. O véu se abre, e o caminho da Cidade do Sol aparece.' },
  // o time não muda — para chegar forte, o código de poder existe
  torneio: { medalhas: 8, destino: 'circuloDourado',
             aviso: 'Código aceito. O Círculo Dourado espera, no meio do mundo.' },
};

/* Entrega o pacote do pulo: as medalhas e os Dons das regiões anteriores,
   um Curupinho se o time estiver vazio (para nenhum encontro ou treinador
   travar a partida) e, dali em diante, cinco patuás bons — sem eles a conta
   do Mestre Patueiro (seis Encantados presos) ficaria impossível para quem
   pulou a economia das primeiras regiões.

   Na Mata vai junto a carta da Dona Firmina para a Tiê: sem ela o Seu
   Elias não aceita nada e a primeira conta da guia fica impossível, já que
   quem daria a carta (a própria Firmina) ficou para trás no pulo. */
export function aplicarPulo(e: EstadoJogo, pulo: Pulo): DefPulo {
  const def = PULOS[pulo];
  for (const m of MEDALHAS.slice(0, def.medalhas)) if (!e.medalhas.includes(m)) e.medalhas.push(m);
  for (const d of DONS.slice(0, def.medalhas)) e.flags[`dom_${d}`] = true;
  e.flags['escolheu_inicial'] = true;
  if (e.time.length === 0) {
    guardar(e, criar('curupinho', NIVEL_INICIAL));
    e.flags['inicial_curupinho'] = true;
  }
  if (pulo === 'regiao2') {
    if (!e.flags['deu_carta_tie'] && !e.flags['conta_recado_mata']) {
      e.flags['deu_carta_tie'] = true;
      adicionar(e.mochila, 'carta_tie');
    }
  } else if (quantidade(e.mochila, 'patua_bom') < 5) {
    adicionar(e.mochila, 'patua_bom', 5);
  }
  return def;
}
