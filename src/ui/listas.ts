/* =========================================================================
   As listas que aparecem nos DOIS lados do jogo.

   O time e a mochila são desenhados na batalha e no menu de pausa. Enquanto
   isso morava dentro de battle.ts, qualquer conserto (o estado alterado que
   não aparecia, a barra de vida encostada no número) precisava ser feito
   duas vezes — e a segunda sempre ficava para depois. Agora é um desenho só,
   e quem chama decide o rodapé.
   ========================================================================= */
import type { Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import { P, TIPOS } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import { STATUS } from '../battle/status.ts';
import { desmaiado, ficha, hpMaximo, nome, type Encantado } from '../battle/encantado.ts';
import { ITENS_ORDEM, item as fichaItem, type Mochila } from '../data/items.ts';

/* moldura de tela cheia: título em cima, rodapé com os botões embaixo */
export function telaCheia(r: Renderizador, caixa: Assado, titulo: string, rodape: string): void {
  r.sprite(caixa, 4, 4);
  r.texto(titulo, 14, 12, P.uiAccD!);
  r.retangulo(12, 23, LARGURA - 24, 1, P.uiBg3!);
  r.texto(rodape, 14, ALTURA - 18, P.uiBg3!);
}

export interface OpcoesListaTime {
  /* índice de quem está no campo de batalha; -1 fora de batalha */
  emCampo?: number;
  /* índice de quem foi "pego" na mão, esperando trocar de lugar com outro */
  peguei?: number;
}

export function listaTime(r: Renderizador, time: readonly Encantado[], sel: number,
                          opt: OpcoesListaTime = {}): void {
  const { emCampo = -1, peguei } = opt;
  time.forEach((e, i) => {
    const y = 28 + i * 21;
    const caido = desmaiado(e);
    // quem foi pego fica com uma tarja clara atrás, esperando o novo lugar
    if (i === peguei) r.retangulo(10, y - 1, LARGURA - 20, 19, P.uiBg2!);
    if (i === sel) r.texto('=', 12, y + 3, P.uiAccD!);
    r.texto(nome(e), 22, y, caido ? P.hpRed! : P.uiInk!);
    r.texto('NV' + e.nivel, 110, y, P.uiInk!);

    const max = hpMaximo(e);
    const pct = Math.max(0, e.hp / max);
    r.retangulo(134, y + 1, 50, 5, P.uiInk!);
    r.retangulo(135, y + 2, 48, 3, P.barBack!);
    if (pct > 0) r.retangulo(135, y + 2, Math.round(48 * pct), 3, UI.corHP(pct));
    const hp = `${e.hp}/${max}`;
    r.texto(hp, LARGURA - 20 - r.larguraTexto(hp), y, P.uiInk!);

    const tipo = ficha(e).tipos[0]!;
    r.retangulo(22, y + 9, 26, 8, TIPOS[tipo].corD);
    r.texto(TIPOS[tipo].nome.slice(0, 4), 24, y + 10, P.uiInk!);
    if (caido) r.texto('CAÍDO', 56, y + 10, P.hpRed!);
    else if (i === emCampo) r.texto('EM CAMPO', 56, y + 10, P.uiAccD!);
    else if (e.status) r.texto(STATUS[e.status].sigla, 56, y + 10, UI.statusCor(STATUS[e.status].sigla));
  });
}

/* o que a mochila mostra agora. Na batalha só o que serve em batalha; no
   menu de pausa tudo, inclusive a carta que não se usa em lugar nenhum. */
export function itensDaMochila(m: Mochila, opt: { emBatalha?: boolean } = {}): string[] {
  return ITENS_ORDEM.filter((id) => (m[id] ?? 0) > 0
    && (opt.emBatalha !== true || fichaItem(id).emBatalha));
}

export function listaMochila(r: Renderizador, m: Mochila, ids: readonly string[],
                             sel: number): void {
  if (ids.length === 0) { r.texto('NADA AQUI DENTRO...', 22, 40, P.uiInk!); return; }
  ids.forEach((id, i) => {
    const it = fichaItem(id);
    const y = 30 + i * 14;
    if (y > ALTURA - 26) return;
    if (i === sel) r.texto('=', 14, y, P.uiAccD!);
    r.texto(it.nome, 24, y, it.chave ? P.gold! : P.uiInk!);
    const q = it.chave ? '--' : 'X' + (m[id] ?? 0);
    r.texto(q, LARGURA - 20 - r.larguraTexto(q), y, P.uiInk!);
  });
}

/* Texto corrido quebrado em linhas curtas, com reticências quando sobra
   mais do que o chamador tem espaço para mostrar. */
export function paragrafo(r: Renderizador, texto: string, x: number, y: number,
                          largura: number, maxLinhas: number, cor: string): void {
  const linhas = quebrarCurto(texto, largura);
  const mostradas = linhas.slice(0, maxLinhas);
  // frase cortada no meio parece defeito; as reticências dizem que tem mais
  if (linhas.length > mostradas.length && mostradas.length > 0) {
    mostradas[mostradas.length - 1] += '...';
  }
  mostradas.forEach((l, i) => r.texto(l, x, y + i * 10, cor));
}

/* Descrição do item apontado. O limite de linhas é de quem chama: na loja
   só cabe uma antes do rodapé, e duas escreveriam por cima dele. */
export function descricaoItem(r: Renderizador, id: string | undefined, y: number,
                              maxLinhas = 2): void {
  if (!id) return;
  paragrafo(r, fichaItem(id).descricao, 14, y, LARGURA - 32, maxLinhas, P.uiBg3!);
}

function quebrarCurto(s: string, larg: number): string[] {
  const fora: string[] = [];
  let atual = '';
  for (const palavra of s.split(' ')) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (tentativa.length * 6 > larg && atual) { fora.push(atual); atual = palavra; }
    else atual = tentativa;
  }
  if (atual) fora.push(atual);
  return fora;
}
