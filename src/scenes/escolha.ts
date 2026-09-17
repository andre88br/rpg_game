/* =========================================================================
   A escolha do Encantado inicial, na mesa da Dona Firmina.

   Sobreposição, como o menu e a loja: a casa continua desenhada atrás. Os
   três patuás ficam lado a lado e o cursor anda entre eles; o do meio é o
   que aparece grande, para a escolha ter cara de escolha e não de lista.
   ========================================================================= */
import { assar, assarSuave, larguraDe, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Entrada } from '../core/input.ts';
import { P, infoTipo } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import { especie } from '../data/creatures.ts';

export type SaidaEscolha = 'aberto' | 'fechar';

/* os três da mesa, na ordem em que estão postos */
export const INICIAIS: readonly string[] = ['curupinho', 'boitatinha', 'iarinha'];

export const NIVEL_INICIAL = 5;

export class EscolhaInicial {
  private sel = 1;                 // começa no do meio
  private confirmando = false;
  private simNao = 1;              // e no NÃO: escolher é para sempre
  private fundo: Assado;
  private retratos = new Map<string, Assado>();
  private escolhido: ((id: string) => void) | null = null;

  constructor() {
    this.fundo = assar(UI.caixa(LARGURA - 8, ALTURA - 8));
  }

  abrir(aoEscolher: (id: string) => void): void {
    this.sel = 1;
    this.confirmando = false;
    this.simNao = 1;
    this.escolhido = aoEscolher;
  }

  private arte(id: string): Assado {
    let a = this.retratos.get(id);
    if (a) return a;
    const desenho = ARTE_CRIATURAS[especie(id).arte];
    a = assarSuave(desenho ? desenho() : UI.caixa(32, 32));
    this.retratos.set(id, a);
    return a;
  }

  atualizar(_dt: number, entrada: Entrada): SaidaEscolha {
    if (this.confirmando) {
      if (entrada.apertou('esq')) this.simNao = 0;
      if (entrada.apertou('dir')) this.simNao = 1;
      if (entrada.apertou('b')) { this.confirmando = false; return 'aberto'; }
      if (!entrada.apertou('a')) return 'aberto';
      if (this.simNao === 1) { this.confirmando = false; return 'aberto'; }
      this.escolhido?.(INICIAIS[this.sel]!);
      return 'fechar';
    }

    if (entrada.apertou('esq')) this.sel = (this.sel - 1 + INICIAIS.length) % INICIAIS.length;
    if (entrada.apertou('dir')) this.sel = (this.sel + 1) % INICIAIS.length;
    /* sem B aqui: a Dona Firmina não deixa ninguém sair da cozinha de mãos
       vazias, e um menu que dá para fechar sem escolher travaria o jogo */
    if (entrada.apertou('a')) { this.confirmando = true; this.simNao = 1; }
    return 'aberto';
  }

  desenhar(r: Renderizador): void {
    r.sprite(this.fundo, 4, 4);
    r.texto('TRÊS PATUÁS NA MESA', 14, 12, P.uiAccD!);
    r.retangulo(12, 23, LARGURA - 24, 1, P.uiBg3!);

    INICIAIS.forEach((id, i) => {
      const f = especie(id);
      const x = 22 + i * 68;
      const escolhido = i === this.sel;
      const img = this.arte(id);
      // o escolhido sobe um pouco e ganha um tapete claro por baixo
      if (escolhido) r.retangulo(x - 6, 30, 60, 54, P.uiBg2!);
      r.sprite(img, x + (48 - larguraDe(img)) / 2 - 4, escolhido ? 30 : 36);
      const nome = f.nome.toUpperCase();
      r.texto(nome, x + (48 - r.larguraTexto(nome)) / 2 - 4, 72,
              escolhido ? P.uiInk! : P.uiBg3!);
    });

    const f = especie(INICIAIS[this.sel]!);
    const info = infoTipo(f.tipos[0]!);
    r.retangulo(14, 88, r.larguraTexto(info.nome) + 8, 11, info.corD);
    r.texto(info.nome, 18, 90, P.uiInk!);
    r.texto(f.categoria.toUpperCase(), 14 + r.larguraTexto(info.nome) + 16, 90, P.uiBg3!);
    this.sobre(r, f.sobre, 104);

    r.texto('< >  ESCOLHER    A  FICAR COM ELE', 14, ALTURA - 18, P.uiBg3!);
    if (this.confirmando) this.desenharConfirmacao(r, f.nome);
  }

  private sobre(r: Renderizador, texto: string, y: number): void {
    const linhas: string[] = [];
    let atual = '';
    for (const palavra of texto.split(' ')) {
      const tenta = atual ? `${atual} ${palavra}` : palavra;
      if (r.larguraTexto(tenta) > LARGURA - 32 && atual) { linhas.push(atual); atual = palavra; }
      else atual = tenta;
    }
    if (atual) linhas.push(atual);
    linhas.slice(0, 3).forEach((l, i) => r.texto(l, 14, y + i * 10, P.uiInk!));
  }

  private desenharConfirmacao(r: Renderizador, nome: string): void {
    const larg = 186, alt = 46;
    const x = (LARGURA - larg) / 2, y = (ALTURA - alt) / 2;
    r.retangulo(x - 2, y - 2, larg + 4, alt + 4, P.ink!);
    r.retangulo(x, y, larg, alt, P.uiBg!);
    const pergunta = `FICAR COM ${nome.toUpperCase()}?`;
    r.texto(pergunta, x + (larg - r.larguraTexto(pergunta)) / 2, y + 8, P.uiInk!);
    r.texto('Escolha de patuá não se desfaz.', x + 10, y + 19, P.uiBg3!);
    ['SIM', 'NÃO'].forEach((op, i) => {
      const ox = x + 46 + i * 70;
      if (i === this.simNao) r.texto('=', ox - 10, y + 32, P.uiAccD!);
      r.texto(op, ox, y + 32, P.uiInk!);
    });
  }
}

/* usado pela cena do mundo e pelo teste: nome bonito do inicial */
export function nomeInicial(id: string): string { return especie(id).nome; }
