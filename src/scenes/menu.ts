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
import { item } from '../data/items.ts';
import {
  trocarPosicoes, usarItemForaDeBatalha, usavelForaDeBatalha, type EstadoJogo,
} from '../game/state.ts';
import { obterSlotAtivo, salvarEmSlot, definirSlotAtivo } from '../game/save.ts';
import { TelaSlots } from './slots.ts';
import {
  VELOCIDADES, NOME_VELOCIDADE, obterVelocidade, definirVelocidade,
} from '../game/config.ts';

/* o que a sobreposição devolve a cada quadro */
export type SaidaMenu = 'aberto' | 'fechar' | 'titulo';

type Pagina = 'raiz' | 'time' | 'mochila' | 'mochilaAlvo' | 'medalhas' | 'guia'
            | 'velocidade' | 'slots' | 'sair';

const RAIZ = ['TIME', 'MOCHILA', 'MEDALHAS', 'GUIA', 'VELOCIDADE', 'SALVAR', 'SAIR'] as const;

export interface OpcoesMenu {
  estado: EstadoJogo;
}

export class MenuPausa {
  private op: OpcoesMenu;
  private pagina: Pagina = 'raiz';
  private sel = 0;
  private selLista = 0;
  private recado: string | null = null;
  private tempoRecado = 0;
  /* índice do Encantado "pego" na mão, esperando trocar de lugar com outro */
  private peguei: number | null = null;
  /* item escolhido na mochila, esperando saber em quem vai ser usado */
  private itemUsando: string | null = null;
  private selAlvo = 0;

  private caixaCheia: Assado;
  private caixaRaiz: Assado;
  private medalhinhas = new Map<string, Assado>();
  private slots: TelaSlots;
  private velSel = 0;

  constructor(op: OpcoesMenu) {
    this.op = op;
    this.caixaCheia = assar(UI.caixa(LARGURA - 8, ALTURA - 8));
    this.caixaRaiz = assar(UI.caixa(92, 18 + RAIZ.length * 13));
    this.slots = new TelaSlots();
  }

  abrir(): void {
    this.pagina = 'raiz';
    this.sel = 0;
    this.selLista = 0;
    this.recado = null;
    this.peguei = null;
    this.itemUsando = null;
  }

  /* aberto direto na página do time, com um recado — é como a cena do mundo
     convida a reordenar assim que um Encantado novo entra no grupo. */
  abrirEmTime(recado: string, selecionado = 0): void {
    this.abrir();
    this.pagina = 'time';
    this.selLista = selecionado;
    this.avisar(recado, 3.2);
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
      case 'VELOCIDADE':
        this.pagina = 'velocidade';
        this.velSel = VELOCIDADES.indexOf(obterVelocidade());
        break;
      case 'SALVAR':
        this.pagina = 'slots';
        this.slots.abrir('salvar', (slot) => {
          const ok = salvarEmSlot(this.op.estado, slot);
          if (ok) definirSlotAtivo(slot);
          this.avisar(ok
            ? `PARTIDA GRAVADA NO SLOT ${slot + 1}.`
            : 'ESTE NAVEGADOR NÃO DEIXA GRAVAR.', 2.2);
        }, obterSlotAtivo());
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

    if (this.pagina === 'mochilaAlvo') return this.naMochilaAlvo(entrada);

    if (this.pagina === 'slots') {
      if (this.slots.atualizar(entrada) === 'fechar') this.pagina = 'raiz';
      return 'aberto';
    }

    if (this.pagina === 'velocidade') {
      this.velSel = this.andar(entrada, this.velSel, VELOCIDADES.length);
      if (entrada.apertou('a')) {
        definirVelocidade(VELOCIDADES[this.velSel]!);
        this.avisar(`VELOCIDADE: ${NOME_VELOCIDADE[VELOCIDADES[this.velSel]!]}.`);
      }
      if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'raiz';
      return 'aberto';
    }

    if (this.pagina === 'time') {
      this.selLista = this.andar(entrada, this.selLista, this.op.estado.time.length);
      if (entrada.apertou('a')) this.tocarTime();
      if (entrada.apertou('b') || entrada.apertou('menu')) {
        if (this.peguei !== null) this.peguei = null;
        else this.pagina = 'raiz';
      }
      return 'aberto';
    }

    if (this.pagina === 'mochila') {
      this.selLista = this.andar(entrada, this.selLista, this.itens().length);
      if (entrada.apertou('a')) this.tentarUsarItem();
      if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'raiz';
      return 'aberto';
    }

    if (entrada.apertou('b') || entrada.apertou('menu')) this.pagina = 'raiz';
    return 'aberto';
  }

  /* A pega um Encantado da lista; A de novo, em outra linha, troca os dois de
     lugar. É a ordem do time que decide quem entra em campo primeiro. */
  private tocarTime(): void {
    const time = this.op.estado.time;
    if (time.length < 2) return;
    if (this.peguei === null) { this.peguei = this.selLista; return; }
    if (this.peguei !== this.selLista) trocarPosicoes(this.op.estado, this.peguei, this.selLista);
    this.peguei = null;
  }

  private tentarUsarItem(): void {
    const id = this.itens()[this.selLista];
    if (!id) return;
    if (!usavelForaDeBatalha(id)) { this.avisar('Isso não se usa fora de batalha.'); return; }
    if (this.op.estado.time.length === 0) {
      this.avisar('Você ainda não tem nenhum Encantado.');
      return;
    }
    this.itemUsando = id;
    this.selAlvo = 0;
    this.pagina = 'mochilaAlvo';
  }

  private naMochilaAlvo(entrada: Entrada): SaidaMenu {
    this.selAlvo = this.andar(entrada, this.selAlvo, this.op.estado.time.length);
    if (entrada.apertou('b')) { this.pagina = 'mochila'; return 'aberto'; }
    if (entrada.apertou('a')) {
      const r = usarItemForaDeBatalha(this.op.estado, this.itemUsando!, this.selAlvo);
      this.avisar(r.msg);
      if (r.usou) salvarEmSlot(this.op.estado, obterSlotAtivo());
      this.pagina = 'mochila';
      this.selLista = Math.min(this.selLista, Math.max(0, this.itens().length - 1));
    }
    return 'aberto';
  }

  private avisar(s: string, duracao = 1.6): void { this.recado = s; this.tempoRecado = duracao; }

  private itens(): string[] { return L.itensDaMochila(this.op.estado.mochila); }

  /* ------------------------------------------------------------ desenho */

  desenhar(r: Renderizador): void {
    if (this.pagina === 'raiz' || this.pagina === 'sair') this.desenharRaiz(r);
    else if (this.pagina === 'slots') this.slots.desenhar(r);
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
        L.telaCheia(r, this.caixaCheia, 'SEU TIME',
                   this.peguei !== null ? 'A TROCAR AQUI   B CANCELAR' : 'A PEGAR   B VOLTAR');
        L.listaTime(r, est.time, this.selLista, { peguei: this.peguei ?? undefined });
        this.rodapeTime(r, est.time[this.selLista]);
        break;
      case 'mochila': {
        const ids = this.itens();
        L.telaCheia(r, this.caixaCheia, 'MOCHILA', `A USAR   B VOLTAR   ${est.dinheiro} RÉIS`);
        L.listaMochila(r, est.mochila, ids, this.selLista);
        L.descricaoItem(r, ids[this.selLista], ALTURA - 42);
        break;
      }
      case 'mochilaAlvo': {
        const nomeItem = item(this.itemUsando!).nome.toUpperCase();
        L.telaCheia(r, this.caixaCheia, `USAR ${nomeItem} EM QUEM?`, 'A USAR   B VOLTAR');
        L.listaTime(r, est.time, this.selAlvo);
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
      case 'velocidade': {
        L.telaCheia(r, this.caixaCheia, 'VELOCIDADE DO JOGO', 'A ESCOLHER   B VOLTAR');
        const atual = obterVelocidade();
        VELOCIDADES.forEach((v, i) => {
          const y = 32 + i * 16;
          if (i === this.velSel) r.texto('=', 16, y, P.uiAccD!);
          r.texto(NOME_VELOCIDADE[v], 28, y, v === atual ? P.uiAccD! : P.uiInk!);
          if (v === atual) r.texto('(ATUAL)', 100, y, P.uiBg3!);
        });
        break;
      }
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
