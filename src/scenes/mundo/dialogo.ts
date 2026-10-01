/* =========================================================================
   A caixa de conversa da cena do mundo: quebra as falas em páginas de três
   linhas, revela o texto como máquina de escrever, e — quando a fala é uma
   charada — mostra a caixinha de opções ao lado.

   Só apresenta. O que uma fala FAZ no mundo quando a última página fecha
   (ligar flag, dar item, chamar batalha) é decisão da cena: `atualizar`
   devolve a conversa que acabou de fechar, e a cena aplica.

   Genérico no NPC (`N`) só para não importar a cena de volta: a conversa
   carrega quem falou, e a cena sabe o que é isso.
   ========================================================================= */
import { assar, type Assado } from '../../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../../core/renderer.ts';
import type { Entrada } from '../../core/input.ts';
import * as UI from '../../art/ui.ts';
import { P } from '../../art/palette.ts';
import { quebrar, larguraTexto } from '../../art/font.ts';
import { empaginar } from '../../ui/paginas.ts';
import { preencher, type Fala } from '../../game/quests.ts';
import type { EstadoJogo } from '../../game/state.ts';
import { multiplicadorVelocidade } from '../../game/config.ts';

const LARG_DIALOGO = LARGURA - 12;
const CHARS_POR_SEG = 48;
const LINHAS_POR_PAGINA = 3;

export interface Conversa<N> {
  falante: string;
  linhas: string[];
  indice: number;
  revelados: number;
  /* o que acontece quando a última página fecha */
  fala: Fala | null;
  npc: N | null;
}

/* charada aberta: a pergunta já foi lida, falta escolher a resposta */
export interface Pergunta<N> {
  fala: Fala;
  npc: N | null;
  falante: string;
  linhas: string[];
  sel: number;
}

/* o que a caixinha de opções devolve neste quadro */
export type Escolha<N> = { k: 'nada' } | { k: 'desistiu' } | { k: 'respondeu'; pergunta: Pergunta<N> };

export class Dialogo<N> {
  conversa: Conversa<N> | null = null;
  pergunta: Pergunta<N> | null = null;
  private readonly caixa: Assado;
  private readonly etiquetas = new Map<string, Assado>();

  constructor(private readonly estado: EstadoJogo) {
    this.caixa = assar(UI.caixa(LARG_DIALOGO, 14 + 3 * 10));
  }

  abrir(falante: string, falas: readonly string[], fala: Fala | null = null, npc: N | null = null): void {
    // cada frase quebrada em linhas; a que não cabe no resto da página vai
    // inteira para a seguinte (ui/paginas.ts)
    const frases = falas.map((f) => this.quebrar(f).join('\n').split('\n'));
    const linhas = empaginar(frases);
    this.conversa = { falante, linhas, indice: 0, revelados: 0, fala, npc };
  }

  /* a conversa terminou numa charada: a última frase fica na tela — a
     própria pergunta — e a caixinha de opções abre ao lado */
  perguntar(c: Conversa<N>): void {
    const fala = c.fala!;
    const frase = fala.linhas[fala.linhas.length - 1] ?? '';
    const ultima = this.quebrar(frase).slice(-LINHAS_POR_PAGINA);
    this.pergunta = { fala, npc: c.npc, falante: c.falante, linhas: ultima, sel: 0 };
  }

  /* Revela a página e vira com A; B pula tudo. Devolve a conversa que
     acabou de fechar neste quadro (null enquanto continua aberta). */
  atualizar(dt: number, entrada: Entrada): Conversa<N> | null {
    const c = this.conversa;
    if (!c) return null;
    const total = this.textoDaPagina().length;
    c.revelados = Math.min(total, c.revelados + CHARS_POR_SEG * multiplicadorVelocidade() * dt);
    if (entrada.apertou('a')) {
      if (c.revelados < total) {
        c.revelados = total;                       // primeiro A: revela tudo
      } else {
        c.indice += LINHAS_POR_PAGINA;             // segundo A: próxima página
        c.revelados = 0;
        if (c.indice >= c.linhas.length) { this.conversa = null; return c; }
      }
    } else if (entrada.apertou('b')) {
      c.indice = c.linhas.length;
      this.conversa = null;
      return c;
    }
    return null;
  }

  /* ↑↓ escolhem, A responde, B desiste sem efeito nenhum (dá para voltar e
     perguntar de novo quando quiser) */
  escolher(entrada: Entrada): Escolha<N> {
    const p = this.pergunta;
    if (!p) return { k: 'nada' };
    const n = p.fala.pergunta!.opcoes.length;
    if (entrada.apertou('cima')) p.sel = (p.sel - 1 + n) % n;
    if (entrada.apertou('baixo')) p.sel = (p.sel + 1) % n;
    if (entrada.apertou('b')) { this.pergunta = null; return { k: 'desistiu' }; }
    if (!entrada.apertou('a')) return { k: 'nada' };
    this.pergunta = null;
    return { k: 'respondeu', pergunta: p };
  }

  desenhar(r: Renderizador, tempoAnim: number): void {
    if (this.conversa) this.desenharConversa(r, this.conversa, tempoAnim);
    if (this.pergunta) this.desenharPergunta(r, this.pergunta);
  }

  /* ------------------------------------------------------------- interno */

  private quebrar(frase: string): string[] {
    return quebrar(preencher(this.estado, frase), LARG_DIALOGO - 18);
  }

  private paginaAtual(): string[] {
    const c = this.conversa;
    return c ? c.linhas.slice(c.indice, c.indice + LINHAS_POR_PAGINA) : [];
  }

  private textoDaPagina(): string { return this.paginaAtual().join(' '); }

  private etiqueta(falante: string): Assado {
    let e = this.etiquetas.get(falante);
    if (e) return e;
    const w = larguraTexto(falante) + 10;
    const tag = UI.caixa(w, 17, { fundo: P.uiAcc, borda2: P.uiAccD });
    UI.textoNaCaixa(tag, falante, 5, 5);
    e = assar(tag);
    this.etiquetas.set(falante, e);
    return e;
  }

  private desenharConversa(r: Renderizador, c: Conversa<N>, tempoAnim: number): void {
    const y = ALTURA - this.caixa.height - 6;
    r.sprite(this.caixa, 6, y);
    r.sprite(this.etiqueta(c.falante), 12, y - 11);

    // efeito de máquina de escrever: revela a página caractere a caractere
    let restantes = Math.floor(c.revelados);
    this.paginaAtual().forEach((linha, i) => {
      if (restantes <= 0) return;
      const visivel = linha.slice(0, restantes);
      restantes -= linha.length + 1;
      r.texto(visivel, 14, y + 8 + i * 10, P.uiInk!);
    });

    const completo = Math.floor(c.revelados) >= this.textoDaPagina().length;
    if (completo && Math.floor(tempoAnim * 3) % 2 === 0) {
      r.texto('v', LARGURA - 20, y + this.caixa.height - 12, P.uiAccD!);
    }
  }

  private desenharPergunta(r: Renderizador, p: Pergunta<N>): void {
    const y = ALTURA - this.caixa.height - 6;
    r.sprite(this.caixa, 6, y);
    r.sprite(this.etiqueta(p.falante), 12, y - 11);
    p.linhas.forEach((l, i) => r.texto(l, 14, y + 8 + i * 10, P.uiInk!));

    const opcoes = p.fala.pergunta!.opcoes;
    const larg = Math.max(...opcoes.map((o) => r.larguraTexto(o))) + 26;
    const alt = 8 + opcoes.length * 12;
    const x = LARGURA - larg - 8, oy = y - alt - 4;
    r.retangulo(x - 2, oy - 2, larg + 4, alt + 4, P.ink!);
    r.retangulo(x, oy, larg, alt, P.uiBg!);
    opcoes.forEach((o, i) => {
      if (i === p.sel) r.texto('=', x + 5, oy + 5 + i * 12, P.uiAccD!);
      r.texto(o, x + 15, oy + 5 + i * 12, P.uiInk!);
    });
  }
}
