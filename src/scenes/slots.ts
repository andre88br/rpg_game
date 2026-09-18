/* =========================================================================
   A tela de slots: seis gavetas de save, escolhidas do mesmo jeito em três
   lugares diferentes — CONTINUAR e NOVO JOGO no título, SALVAR no menu de
   pausa. Por isso ela é uma sobreposição própria, como a loja ou a escolha
   do inicial, e não um pedaço de nenhuma das telas que a chamam.

   Continuar só aceita slot ocupado — não tem o que continuar num vazio.
   Novo jogo e salvar aceitam qualquer slot, mas um slot ocupado pede
   confirmação antes: escrever ali apaga o que tinha.
   ========================================================================= */
import { assar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import { NUM_SLOTS, resumoTodos, type ResumoSlot } from '../game/save.ts';

export type ModoSlots = 'continuar' | 'novo' | 'salvar';

const TITULOS: Record<ModoSlots, string> = {
  continuar: 'CONTINUAR DE QUAL SLOT?',
  novo: 'COMEÇAR EM QUAL SLOT?',
  salvar: 'GRAVAR EM QUAL SLOT?',
};

const RODAPES: Record<ModoSlots, string> = {
  continuar: 'A CONTINUAR   B VOLTAR',
  novo: 'A COMEÇAR AQUI   B VOLTAR',
  salvar: 'A GRAVAR AQUI   B VOLTAR',
};

export class TelaSlots {
  private modo: ModoSlots = 'novo';
  private sel = 0;
  private confirmando = false;
  private simNao = 1;
  private resumos: (ResumoSlot | null)[] = [];
  private aoEscolher: ((slot: number) => void) | null = null;

  private caixa: Assado;

  constructor() {
    this.caixa = assar(UI.caixa(LARGURA - 16, ALTURA - 16));
  }

  /* @param preferido slot em que o cursor começa — o slot ativo da sessão,
     via de regra, para SALVAR abrir já em cima de onde se está jogando */
  abrir(modo: ModoSlots, aoEscolher: (slot: number) => void, preferido = 0): void {
    this.modo = modo;
    this.aoEscolher = aoEscolher;
    this.resumos = resumoTodos();
    this.confirmando = false;
    this.sel = Math.max(0, Math.min(NUM_SLOTS - 1, preferido));
    /* continuar não pode começar num slot vazio: pula para o primeiro que
       tenha alguma coisa dentro, se houver */
    if (this.modo === 'continuar' && !this.resumos[this.sel]) {
      const i = this.resumos.findIndex((r) => r !== null);
      if (i >= 0) this.sel = i;
    }
  }

  atualizar(entrada: Entrada): 'aberto' | 'fechar' {
    if (this.confirmando) {
      if (entrada.apertou('esq')) this.simNao = 0;
      if (entrada.apertou('dir')) this.simNao = 1;
      if (entrada.apertou('b')) { this.confirmando = false; return 'aberto'; }
      if (!entrada.apertou('a')) return 'aberto';
      if (this.simNao === 1) { this.confirmando = false; return 'aberto'; }
      this.aoEscolher?.(this.sel);
      return 'fechar';
    }

    if (entrada.apertou('cima')) this.sel = (this.sel - 1 + NUM_SLOTS) % NUM_SLOTS;
    if (entrada.apertou('baixo')) this.sel = (this.sel + 1) % NUM_SLOTS;
    if (entrada.apertou('b') || entrada.apertou('menu')) return 'fechar';
    if (!entrada.apertou('a')) return 'aberto';

    const ocupado = this.resumos[this.sel] !== null;
    if (this.modo === 'continuar') {
      if (!ocupado) return 'aberto';      // nada pra continuar num slot vazio
      this.aoEscolher?.(this.sel);
      return 'fechar';
    }
    if (ocupado) { this.confirmando = true; this.simNao = 1; return 'aberto'; }
    this.aoEscolher?.(this.sel);
    return 'fechar';
  }

  desenhar(r: Renderizador): void {
    const x = 8, y = 8;
    r.sprite(this.caixa, x, y);
    r.texto(TITULOS[this.modo], x + 10, y + 8, P.uiAccD!);
    r.retangulo(x + 8, y + 19, this.caixa.width - 16, 1, P.uiBg3!);
    r.texto(RODAPES[this.modo], x + 10, y + this.caixa.height - 12, P.uiBg3!);

    for (let i = 0; i < NUM_SLOTS; i++) {
      this.desenharLinha(r, i, x + 10, y + 26 + i * 16);
    }

    if (this.confirmando) this.desenharConfirmacao(r);
  }

  private desenharLinha(r: Renderizador, slot: number, x: number, y: number): void {
    const resumo = this.resumos[slot];
    const rotulo = `SLOT ${slot + 1}`;
    const cor = resumo ? P.uiInk! : P.uiBg3!;
    if (slot === this.sel) r.texto('=', x - 8, y, P.uiAccD!);
    r.texto(rotulo, x, y, cor);

    if (!resumo) { r.texto('(VAZIO)', x + 54, y, P.uiBg3!); return; }

    const meio = `${resumo.nome.slice(0, 6)}  NV${resumo.nivel || 1}`;
    r.texto(meio, x + 54, y, cor);
    if (resumo.quando) {
      const dt = resumo.quando;
      r.texto(dt, LARGURA - 24 - r.larguraTexto(dt), y, P.uiBg3!);
    }
  }

  private desenharConfirmacao(r: Renderizador): void {
    const larg = 190, alt = 50;
    const x = (LARGURA - larg) / 2, y = (ALTURA - alt) / 2;
    r.retangulo(x - 2, y - 2, larg + 4, alt + 4, P.ink!);
    r.retangulo(x, y, larg, alt, P.uiBg!);
    r.texto(`SOBRESCREVER O SLOT ${this.sel + 1}?`, x + 10, y + 8, P.uiInk!);
    r.texto('A partida gravada ali se perde.', x + 10, y + 20, P.uiBg3!);
    ['SIM', 'NÃO'].forEach((op, i) => {
      const ox = x + 40 + i * 70;
      if (i === this.simNao) r.texto('=', ox - 10, y + 34, P.uiAccD!);
      r.texto(op, ox, y + 34, P.uiInk!);
    });
  }
}
