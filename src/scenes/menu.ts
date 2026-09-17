/* =========================================================================
   Menu de pausa — TIME, MOCHILA, MEDALHAS, SALVAR, SAIR.

   Não é uma Cena: é uma SOBREPOSIÇÃO. Trocar de cena apagaria o mapa atrás,
   e o menu ficaria boiando no preto; assim o mundo continua desenhado por
   baixo e a pausa parece uma janela aberta em cima dele, como no gênero.
   ========================================================================= */
import { assar, assarSuave, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import { MEDALHAS, medalha } from '../art/badges.ts';
import { ficha, nome, type Encantado } from '../battle/encantado.ts';
import * as L from '../ui/listas.ts';
import { CONTAS, contasAcesas } from '../game/quests.ts';
import type { EstadoJogo } from '../game/state.ts';

/* o que a sobreposição devolve a cada quadro */
export type SaidaMenu = 'aberto' | 'fechar' | 'titulo';

type Pagina = 'raiz' | 'time' | 'mochila' | 'medalhas' | 'guia' | 'sair';

const RAIZ = ['TIME', 'MOCHILA', 'MEDALHAS', 'GUIA', 'SALVAR', 'SAIR'] as const;

export interface OpcoesMenu {
  estado: EstadoJogo;
  /* devolve false quando o navegador não deixou gravar (aba privada) */
  aoSalvar: () => boolean;
}

export class MenuPausa {
  private op: OpcoesMenu;
  private pagina: Pagina = 'raiz';
  private sel = 0;
  private selLista = 0;
  private recado: string | null = null;
  private tempoRecado = 0;

  private caixaCheia: Assado;
  private caixaRaiz: Assado;
  private medalhinhas = new Map<string, Assado>();

  constructor(op: OpcoesMenu) {
    this.op = op;
    this.caixaCheia = assar(UI.caixa(LARGURA - 8, ALTURA - 8));
    this.caixaRaiz = assar(UI.caixa(92, 18 + RAIZ.length * 13));
  }

  abrir(): void {
    this.pagina = 'raiz';
    this.sel = 0;
    this.selLista = 0;
    this.recado = null;
  }

  /* ------------------------------------------------------------ entrada */

  atualizar(dt: number, entrada: Entrada): SaidaMenu {
    if (this.tempoRecado > 0) {
      this.tempoRecado -= dt;
      if (this.tempoRecado <= 0) this.recado = null;
    }
    if (this.pagina === 'raiz') return this.naRaiz(entrada);
    return this.naPagina(entrada);
  }

  private andar(entrada: Entrada, atual: number, total: number): number {
    if (total <= 0) return 0;
    if (entrada.apertou('cima')) return (atual - 1 + total) % total;
    if (entrada.apertou('baixo')) return (atual + 1) % total;
    return atual;
  }

  private naRaiz(entrada: Entrada): SaidaMenu {
    this.sel = this.andar(entrada, this.sel, RAIZ.length);
    if (entrada.apertou('b') || entrada.apertou('menu')) return 'fechar';
    if (!entrada.apertou('a')) return 'aberto';

    switch (RAIZ[this.sel]) {
      case 'TIME': this.pagina = 'time'; this.selLista = 0; break;
      case 'MOCHILA': this.pagina = 'mochila'; this.selLista = 0; break;
      case 'MEDALHAS': this.pagina = 'medalhas'; break;
      case 'GUIA': this.pagina = 'guia'; break;
      case 'SALVAR':
        this.avisar(this.op.aoSalvar()
          ? 'PARTIDA GRAVADA.'
          : 'ESTE NAVEGADOR NÃO DEIXA GRAVAR.');
        break;
      /* o cursor começa no NÃO: largar a partida não pode ser um A distraído */
      case 'SAIR': this.pagina = 'sair'; this.sel = 1; break;
    }
    return 'aberto';
  }

  private naPagina(entrada: Entrada): SaidaMenu {
    if (this.pagina === 'sair') {
      this.sel = this.andar(entrada, this.sel, 2);
      if (entrada.apertou('b')) { this.pagina = 'raiz'; this.sel = 0; return 'aberto'; }
      if (entrada.apertou('a')) {
        if (this.sel === 0) return 'titulo';
        this.pagina = 'raiz'; this.sel = 0;
      }
      return 'aberto';
    }

    if (this.pagina === 'time') {
      this.selLista = this.andar(entrada, this.selLista, this.op.estado.time.length);
    } else if (this.pagina === 'mochila') {
      this.selLista = this.andar(entrada, this.selLista, this.itens().length);
    }
    if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'raiz';
    return 'aberto';
  }

  private avisar(s: string): void { this.recado = s; this.tempoRecado = 1.6; }

  private itens(): string[] { return L.itensDaMochila(this.op.estado.mochila); }

  /* ------------------------------------------------------------ desenho */

  desenhar(r: Renderizador): void {
    if (this.pagina === 'raiz' || this.pagina === 'sair') this.desenharRaiz(r);
    else this.desenharPagina(r);
    if (this.recado) {
      const larg = r.larguraTexto(this.recado) + 20;
      r.retangulo((LARGURA - larg) / 2, ALTURA - 40, larg, 16, P.ink!);
      r.texto(this.recado, (LARGURA - r.larguraTexto(this.recado)) / 2, ALTURA - 36, P.gold!);
    }
  }

  private desenharRaiz(r: Renderizador): void {
    const x = LARGURA - 98, y = 6;
    r.sprite(this.caixaRaiz, x, y);
    RAIZ.forEach((item, i) => {
      const iy = y + 9 + i * 13;
      if (i === this.sel && this.pagina === 'raiz') r.texto('=', x + 8, iy, P.uiAccD!);
      r.texto(item, x + 18, iy, P.uiInk!);
    });

    if (this.pagina !== 'sair') return;
    /* a pergunta de sair fica por cima do próprio menu: quem apertou SAIR
       sem querer vê na hora que dá para voltar atrás */
    const larg = 150, alt = 50;
    const px = (LARGURA - larg) / 2, py = (ALTURA - alt) / 2;
    r.retangulo(px - 2, py - 2, larg + 4, alt + 4, P.ink!);
    r.retangulo(px, py, larg, alt, P.uiBg!);
    r.texto('VOLTAR AO TÍTULO?', px + 10, py + 8, P.uiInk!);
    r.texto('O que não foi gravado se perde.', px + 10, py + 20, P.uiBg3!);
    ['SIM', 'NÃO'].forEach((op, i) => {
      const ox = px + 20 + i * 60;
      if (i === this.sel) r.texto('=', ox - 10, py + 34, P.uiAccD!);
      r.texto(op, ox, py + 34, P.uiInk!);
    });
  }

  private desenharPagina(r: Renderizador): void {
    const est = this.op.estado;
    switch (this.pagina) {
      case 'time':
        L.telaCheia(r, this.caixaCheia, 'SEU TIME', 'B VOLTAR');
        L.listaTime(r, est.time, this.selLista);
        this.rodapeTime(r, est.time[this.selLista]);
        break;
      case 'mochila': {
        const ids = this.itens();
        L.telaCheia(r, this.caixaCheia, 'MOCHILA', `B VOLTAR    ${est.dinheiro} RÉIS`);
        L.listaMochila(r, est.mochila, ids, this.selLista);
        L.descricaoItem(r, ids[this.selLista], ALTURA - 42);
        break;
      }
      case 'medalhas':
        L.telaCheia(r, this.caixaCheia, 'MEDALHAS',
                    `B VOLTAR    ${est.medalhas.length} DE ${MEDALHAS.length}`);
        this.desenharMedalhas(r);
        break;
      case 'guia':
        L.telaCheia(r, this.caixaCheia, 'A GUIA DO TERREIRO',
                    `B VOLTAR    ${contasAcesas(est)} DE ${CONTAS.length}`);
        CONTAS.forEach((c, i) => {
          const acesa = est.flags[c.flag] === true;
          const y = 32 + i * 16;
          r.retangulo(16, y + 1, 6, 6, acesa ? P.water! : P.uiBg3!);
          r.texto(acesa ? c.servico.toUpperCase() : '? ? ?', 28, y,
                  acesa ? P.uiInk! : P.uiBg3!);
        });
        break;
      default:
        break;
    }
  }

  private rodapeTime(r: Renderizador, e: Encantado | undefined): void {
    if (!e) return;
    const f = ficha(e);
    r.texto(`${nome(e)} — ${f.nome}`, 14, ALTURA - 32, P.uiBg3!);
  }

  private desenharMedalhas(r: Renderizador): void {
    MEDALHAS.forEach((m, i) => {
      const x = 20 + (i % 4) * 52;
      const y = 34 + Math.floor(i / 4) * 44;
      const tem = this.op.estado.medalhas.includes(m.id);
      if (tem) {
        let img = this.medalhinhas.get(m.id);
        if (!img) { img = assarSuave(medalha(m.id, 20)); this.medalhinhas.set(m.id, img); }
        r.sprite(img, x + 6, y);
        r.texto(m.nome.slice(0, 6), x, y + 24, P.uiInk!);
      } else {
        r.retangulo(x + 8, y + 2, 16, 16, P.uiBg2!);
        r.texto('?', x + 14, y + 6, P.uiBg3!);
        r.texto('- - -', x, y + 24, P.uiBg3!);
      }
    });
  }
}
