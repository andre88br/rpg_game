/* =========================================================================
   O balcão da loja de Porto Iara.

   Sobreposição, como o menu de pausa: o lojista continua atrás do balcão
   enquanto você escolhe. Comprar é de um em um — a esquerda e a direita
   mudam a quantidade antes de confirmar.
   ========================================================================= */
import { assar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import * as L from '../ui/listas.ts';
import {
  ITENS_A_VENDA, adicionar, consumir, item as fichaItem, quantidade,
} from '../data/items.ts';
import { nome, type Encantado } from '../battle/encantado.ts';
import { TAMANHO_TIME, type EstadoJogo } from '../game/state.ts';

export type SaidaLoja = 'aberto' | 'fechar';

type Pagina = 'raiz' | 'comprar' | 'vender' | 'caixa';

const RAIZ = ['COMPRAR', 'VENDER', 'CAIXA', 'SAIR'] as const;

/* Uma linha da tela da caixa: ou um título de seção (não se escolhe), ou um
   Encantado — do time ou da caixa, e de qual índice na lista de origem, para
   saber exatamente o que mover quando A for apertado. */
type LinhaCaixa =
  | { tipo: 'titulo'; texto: string }
  | { tipo: 'time' | 'caixa'; indice: number };

/* linhas visíveis de uma vez na tela da caixa (o resto rola) */
const LINHA_ALT = 10;
const LINHAS_VISIVEIS = 11;
/* o lojista não paga o que cobra: é assim em qualquer feira */
export const FRACAO_DE_VENDA = 0.5;

export function precoDeVenda(id: string): number {
  return Math.floor(fichaItem(id).preco * FRACAO_DE_VENDA);
}

export class Loja {
  private estado: EstadoJogo;
  private pagina: Pagina = 'raiz';
  private sel = 0;
  private selItem = 0;
  private quantos = 1;
  private recado: string | null = null;
  private tempoRecado = 0;

  /* a tela CAIXA: um cursor só, andando por time e caixa como se fossem uma
     lista única, e uma janela que rola para acompanhá-lo */
  private selCaixa = 0;
  private topoJanela = 0;

  private caixaCheia: Assado;
  private caixaRaiz: Assado;

  constructor(estado: EstadoJogo) {
    this.estado = estado;
    this.caixaCheia = assar(UI.caixa(LARGURA - 8, ALTURA - 8));
    this.caixaRaiz = assar(UI.caixa(96, 18 + RAIZ.length * 13));
  }

  abrir(): void {
    this.pagina = 'raiz'; this.sel = 0; this.selItem = 0; this.quantos = 1;
    this.recado = null;
  }

  private aVenda(): readonly string[] { return ITENS_A_VENDA; }
  private aVender(): string[] {
    return L.itensDaMochila(this.estado.mochila).filter((id) => !fichaItem(id).chave);
  }

  private avisar(s: string): void { this.recado = s; this.tempoRecado = 1.6; }

  /* time e caixa como uma lista só, com um título de seção antes de cada
     parte — é isso que faz um cursor e uma tecla A servirem para as duas
     direções (chamar para o time, guardar na caixa) */
  private linhasCaixa(): LinhaCaixa[] {
    const est = this.estado;
    const linhas: LinhaCaixa[] = [{ tipo: 'titulo', texto: `SEU TIME (${est.time.length}/${TAMANHO_TIME})` }];
    est.time.forEach((_, i) => linhas.push({ tipo: 'time', indice: i }));
    linhas.push({ tipo: 'titulo', texto: `CAIXA DA BENZEDEIRA (${est.caixa.length})` });
    est.caixa.forEach((_, i) => linhas.push({ tipo: 'caixa', indice: i }));
    return linhas;
  }

  /* mantém a janela rolando de modo que a linha escolhida nunca saia da tela */
  private ajustarJanela(totalLinhas: number): void {
    if (this.selCaixa < this.topoJanela) this.topoJanela = this.selCaixa;
    if (this.selCaixa >= this.topoJanela + LINHAS_VISIVEIS) {
      this.topoJanela = this.selCaixa - LINHAS_VISIVEIS + 1;
    }
    this.topoJanela = Math.max(0, Math.min(this.topoJanela, Math.max(0, totalLinhas - LINHAS_VISIVEIS)));
  }

  /* A sobre um Encantado do time manda ele pra caixa; A sobre um da caixa
     chama ele pro time. Título de seção não responde a nada. */
  private mexerCaixa(linhas: readonly LinhaCaixa[]): void {
    const l = linhas[this.selCaixa];
    if (!l || l.tipo === 'titulo') return;
    const est = this.estado;

    if (l.tipo === 'time') {
      if (est.time.length <= 1) { this.avisar('PRECISA FICAR COM UM, AO MENOS.'); return; }
      const [bicho] = est.time.splice(l.indice, 1) as [Encantado];
      est.caixa.push(bicho);
      this.avisar(`${nome(bicho).toUpperCase()} FOI PRA CAIXA.`);
    } else {
      if (est.time.length >= TAMANHO_TIME) { this.avisar('O TIME JÁ ESTÁ CHEIO.'); return; }
      const [bicho] = est.caixa.splice(l.indice, 1) as [Encantado];
      est.time.push(bicho);
      this.avisar(`${nome(bicho).toUpperCase()} ENTROU NO TIME.`);
    }
    // a lista muda de tamanho: o cursor não pode sobrar fora dela
    this.selCaixa = Math.min(this.selCaixa, Math.max(0, this.linhasCaixa().length - 1));
  }

  private naCaixa(entrada: Entrada): SaidaLoja {
    const linhas = this.linhasCaixa();
    const escolhiveis = linhas
      .map((l, i) => (l.tipo === 'titulo' ? -1 : i))
      .filter((i) => i >= 0);

    if (escolhiveis.length > 0) {
      let pos = escolhiveis.indexOf(this.selCaixa);
      if (pos < 0) pos = 0;
      if (entrada.apertou('cima')) pos = (pos - 1 + escolhiveis.length) % escolhiveis.length;
      if (entrada.apertou('baixo')) pos = (pos + 1) % escolhiveis.length;
      this.selCaixa = escolhiveis[pos]!;
    }
    this.ajustarJanela(linhas.length);

    if (entrada.apertou('b') || entrada.apertou('menu')) { this.pagina = 'raiz'; return 'aberto'; }
    if (entrada.apertou('a')) this.mexerCaixa(linhas);
    return 'aberto';
  }

  /* ------------------------------------------------------------ entrada */

  atualizar(dt: number, entrada: Entrada): SaidaLoja {
    if (this.tempoRecado > 0) {
      this.tempoRecado -= dt;
      if (this.tempoRecado <= 0) this.recado = null;
    }
    if (this.pagina === 'raiz') {
      if (entrada.apertou('cima')) this.sel = (this.sel - 1 + RAIZ.length) % RAIZ.length;
      if (entrada.apertou('baixo')) this.sel = (this.sel + 1) % RAIZ.length;
      if (entrada.apertou('b') || entrada.apertou('menu')) return 'fechar';
      if (entrada.apertou('a')) {
        const escolha = RAIZ[this.sel];
        if (escolha === 'SAIR') return 'fechar';
        if (escolha === 'CAIXA') {
          this.pagina = 'caixa';
          this.selCaixa = 0;               // naCaixa() já pula pro primeiro escolhível
          this.topoJanela = 0;
        } else {
          this.pagina = escolha === 'COMPRAR' ? 'comprar' : 'vender';
          this.selItem = 0; this.quantos = 1;
        }
      }
      return 'aberto';
    }
    if (this.pagina === 'caixa') return this.naCaixa(entrada);

    const lista = this.pagina === 'comprar' ? this.aVenda() : this.aVender();
    if (lista.length > 0) {
      if (entrada.apertou('cima')) { this.selItem = (this.selItem - 1 + lista.length) % lista.length; this.quantos = 1; }
      if (entrada.apertou('baixo')) { this.selItem = (this.selItem + 1) % lista.length; this.quantos = 1; }
      if (entrada.apertou('esq')) this.quantos = Math.max(1, this.quantos - 1);
      if (entrada.apertou('dir')) this.quantos = Math.min(this.maximo(lista), this.quantos + 1);
    }
    if (entrada.apertou('b') || entrada.apertou('menu')) { this.pagina = 'raiz'; return 'aberto'; }
    if (entrada.apertou('a')) this.confirmar(lista);
    return 'aberto';
  }

  /* quanto ainda cabe: o bolso limita a compra, a mochila limita a venda */
  private maximo(lista: readonly string[]): number {
    const id = lista[this.selItem];
    if (!id) return 1;
    if (this.pagina === 'comprar') {
      const preco = fichaItem(id).preco;
      return Math.max(1, Math.min(99, Math.floor(this.estado.dinheiro / Math.max(1, preco))));
    }
    return Math.max(1, quantidade(this.estado.mochila, id));
  }

  private confirmar(lista: readonly string[]): void {
    const id = lista[this.selItem];
    if (!id) return;
    const it = fichaItem(id);

    if (this.pagina === 'comprar') {
      const custo = it.preco * this.quantos;
      if (custo > this.estado.dinheiro) { this.avisar('RÉIS NÃO DÃO PRA ISSO.'); return; }
      this.estado.dinheiro -= custo;
      adicionar(this.estado.mochila, id, this.quantos);
      this.avisar(`${this.quantos}x ${it.nome.toUpperCase()}. OBRIGADO!`);
    } else {
      if (!consumir(this.estado.mochila, id, this.quantos)) { this.avisar('VOCÊ NÃO TEM TUDO ISSO.'); return; }
      const ganho = precoDeVenda(id) * this.quantos;
      this.estado.dinheiro += ganho;
      this.avisar(`+${ganho} RÉIS.`);
      const resto = this.aVender();
      this.selItem = Math.min(this.selItem, Math.max(0, resto.length - 1));
    }
    this.quantos = 1;
  }

  /* ------------------------------------------------------------ desenho */

  desenhar(r: Renderizador): void {
    if (this.pagina === 'raiz') this.desenharRaiz(r);
    else if (this.pagina === 'caixa') this.desenharCaixa(r);
    else this.desenharPrateleira(r);
    if (this.recado) {
      const larg = r.larguraTexto(this.recado) + 20;
      r.retangulo((LARGURA - larg) / 2, ALTURA - 40, larg, 16, P.ink!);
      r.texto(this.recado, (LARGURA - r.larguraTexto(this.recado)) / 2, ALTURA - 36, P.gold!);
    }
  }

  private desenharRaiz(r: Renderizador): void {
    const x = LARGURA - 102, y = 6;
    r.sprite(this.caixaRaiz, x, y);
    RAIZ.forEach((op, i) => {
      const iy = y + 9 + i * 13;
      if (i === this.sel) r.texto('=', x + 8, iy, P.uiAccD!);
      r.texto(op, x + 18, iy, P.uiInk!);
    });
    const bolso = `${this.estado.dinheiro} RÉIS`;
    r.retangulo(x, y + this.caixaRaiz.height + 2, 96, 14, P.ink!);
    r.texto(bolso, x + 96 - 6 - r.larguraTexto(bolso), y + this.caixaRaiz.height + 5, P.gold!);
  }

  private desenharCaixa(r: Renderizador): void {
    L.telaCheia(r, this.caixaCheia, 'CAIXA DA BENZEDEIRA', 'A CHAMAR/GUARDAR   B VOLTAR');
    const linhas = this.linhasCaixa();
    const est = this.estado;

    for (let i = 0; i < LINHAS_VISIVEIS; i++) {
      const idx = this.topoJanela + i;
      const l = linhas[idx];
      if (!l) break;
      const y = 28 + i * LINHA_ALT;

      if (l.tipo === 'titulo') { r.texto(l.texto, 14, y, P.uiAccD!); continue; }
      const bicho = l.tipo === 'time' ? est.time[l.indice]! : est.caixa[l.indice]!;
      if (idx === this.selCaixa) r.texto('=', 12, y, P.uiAccD!);
      r.texto(nome(bicho), 22, y, P.uiInk!);
      const nv = 'NV' + bicho.nivel;
      r.texto(nv, LARGURA - 20 - r.larguraTexto(nv), y, P.uiBg3!);
    }

    // indicador de que há mais linhas para cada lado, fora da janela visível
    if (this.topoJanela > 0) r.texto('...', LARGURA - 34, 28, P.uiBg3!);
    if (this.topoJanela + LINHAS_VISIVEIS < linhas.length) {
      r.texto('...', LARGURA - 34, 28 + (LINHAS_VISIVEIS - 1) * LINHA_ALT, P.uiBg3!);
    }
  }

  private desenharPrateleira(r: Renderizador): void {
    const comprando = this.pagina === 'comprar';
    const lista = comprando ? this.aVenda() : this.aVender();
    L.telaCheia(r, this.caixaCheia, comprando ? 'COMPRAR' : 'VENDER',
                `B VOLTAR    ${this.estado.dinheiro} RÉIS`);

    if (lista.length === 0) {
      r.texto(comprando ? 'A PRATELEIRA ESTÁ VAZIA.' : 'NADA QUE EU QUEIRA COMPRAR.',
              22, 44, P.uiInk!);
      return;
    }

    lista.forEach((id, i) => {
      const it = fichaItem(id);
      const y = 29 + i * 12;
      if (y > ALTURA - 50) return;
      if (i === this.selItem) r.texto('=', 14, y, P.uiAccD!);
      r.texto(it.nome, 24, y, P.uiInk!);
      const preco = `${comprando ? it.preco : precoDeVenda(id)}`;
      r.texto(preco, LARGURA - 24 - r.larguraTexto(preco), y, P.uiInk!);
      if (!comprando) {
        const q = 'X' + quantidade(this.estado.mochila, id);
        r.texto(q, LARGURA - 66 - r.larguraTexto(q), y, P.uiBg3!);
      }
    });

    const id = lista[this.selItem];
    if (!id) return;
    const total = (comprando ? fichaItem(id).preco : precoDeVenda(id)) * this.quantos;
    r.texto(`< ${this.quantos} >   ${total} RÉIS`, 14, ALTURA - 46, P.uiAccD!);
    L.descricaoItem(r, id, ALTURA - 34, 1);
  }
}
