/* =========================================================================
   Tela do código secreto de poder máximo: escolhe um Encantado do time,
   sobe ele pro nível 60 com o fôlego cheio, e deixa ESCOLHER os quatro
   golpes dele — não o que o jogo escolheria sozinho — dentro de tudo que a
   espécie aprende em algum nível da vida (o conjunto inteiro, não só o que
   caberia até o nível atual).

   Sobreposição, como a caixa e a loja: o mundo continua desenhado atrás.
   ========================================================================= */
import { assar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Entrada } from '../core/input.ts';
import { P, infoTipo } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import * as L from '../ui/listas.ts';
import { golpe as fichaGolpe } from '../data/moves.ts';
import { especie } from '../data/creatures.ts';
import {
  ficha, hpMaximo, nome, novoGolpe, xpDoNivel, NIVEL_MAX, MAX_GOLPES,
  type Encantado,
} from '../battle/encantado.ts';
import type { EstadoJogo } from '../game/state.ts';

export type SaidaPoder = 'aberto' | 'fechar';

export class TelaPoder {
  private estado: EstadoJogo;
  private pagina: 'time' | 'golpes' = 'time';
  private selTime = 0;

  private alvo: Encantado | null = null;
  private pool: string[] = [];
  private slots: string[] = [];
  private cursorSlot = 0;

  private caixaCheia: Assado;

  constructor(estado: EstadoJogo) {
    this.estado = estado;
    this.caixaCheia = assar(UI.caixa(LARGURA - 8, ALTURA - 8));
  }

  abrir(): void {
    this.pagina = 'time';
    this.selTime = 0;
    this.alvo = null;
  }

  /* tudo que a espécie aprende em algum nível, sem repetir — o conjunto
     INTEIRO, diferente de golpesAte() (que corta pelo nível de verdade) */
  private poolDe(idEspecie: string): string[] {
    const vistos = new Set<string>();
    const lista: string[] = [];
    for (const a of especie(idEspecie).aprende) {
      if (vistos.has(a.golpe)) continue;
      vistos.add(a.golpe);
      lista.push(a.golpe);
    }
    return lista;
  }

  /* os quatro golpes que o Encantado já sabe entram primeiro, se ainda
     fizerem parte do conjunto; o resto é completado pelos últimos da lista
     (os mais fortes, em geral) — assim a tela nunca abre vazia */
  private slotsIniciais(alvo: Encantado, pool: readonly string[]): string[] {
    const n = Math.min(MAX_GOLPES, pool.length);
    const escolhidos: string[] = [];
    for (const g of alvo.golpes) {
      if (escolhidos.length >= n) break;
      if (pool.includes(g.id) && !escolhidos.includes(g.id)) escolhidos.push(g.id);
    }
    for (let i = pool.length - 1; i >= 0 && escolhidos.length < n; i--) {
      const id = pool[i]!;
      if (!escolhidos.includes(id)) escolhidos.push(id);
    }
    return escolhidos;
  }

  private escolherTime(): void {
    const alvo = this.estado.time[this.selTime];
    if (!alvo) return;
    this.alvo = alvo;
    this.pool = this.poolDe(alvo.especie);
    this.slots = this.slotsIniciais(alvo, this.pool);
    this.cursorSlot = 0;
    this.pagina = 'golpes';
  }

  /* anda pro próximo golpe do pool que ainda não está em OUTRO slot,
     numa direção; nunca duplica golpe entre os quatro */
  private ciclarSlot(direcao: 1 | -1): void {
    const pool = this.pool;
    if (pool.length === 0) return;
    const atual = pool.indexOf(this.slots[this.cursorSlot]!);
    let i = atual;
    for (let passo = 0; passo < pool.length; passo++) {
      i = (i + direcao + pool.length) % pool.length;
      const candidato = pool[i]!;
      const usadoAlhures = this.slots.some((id, s) => s !== this.cursorSlot && id === candidato);
      if (!usadoAlhures) { this.slots[this.cursorSlot] = candidato; return; }
    }
  }

  private confirmar(): void {
    const alvo = this.alvo;
    if (!alvo) return;
    alvo.nivel = NIVEL_MAX;
    alvo.xp = xpDoNivel(NIVEL_MAX, ficha(alvo).crescimento);
    alvo.status = null;
    alvo.turnosStatus = 0;
    alvo.golpes = this.slots.map(novoGolpe);
    alvo.hp = hpMaximo(alvo);
  }

  atualizar(_dt: number, entrada: Entrada): SaidaPoder {
    if (this.pagina === 'time') {
      const total = this.estado.time.length;
      if (total === 0) return 'fechar';
      if (entrada.apertou('cima')) this.selTime = (this.selTime - 1 + total) % total;
      if (entrada.apertou('baixo')) this.selTime = (this.selTime + 1) % total;
      if (entrada.apertou('b')) return 'fechar';
      if (entrada.apertou('a')) this.escolherTime();
      return 'aberto';
    }

    // ---- página dos golpes ----
    const n = this.slots.length;
    if (entrada.apertou('cima')) this.cursorSlot = (this.cursorSlot - 1 + n) % n;
    if (entrada.apertou('baixo')) this.cursorSlot = (this.cursorSlot + 1) % n;
    if (entrada.apertou('esq')) this.ciclarSlot(-1);
    if (entrada.apertou('dir')) this.ciclarSlot(1);
    if (entrada.apertou('b')) { this.pagina = 'time'; return 'aberto'; }
    if (entrada.apertou('a')) { this.confirmar(); return 'fechar'; }
    return 'aberto';
  }

  desenhar(r: Renderizador): void {
    if (this.pagina === 'time') {
      L.telaCheia(r, this.caixaCheia, 'PODER MÁXIMO: ESCOLHA QUEM',
                  'A ESCOLHER   B CANCELAR');
      L.listaTime(r, this.estado.time, this.selTime);
      return;
    }

    const alvo = this.alvo!;
    L.telaCheia(r, this.caixaCheia, `GOLPES DE ${nome(alvo).toUpperCase()}`,
                '▲▼ LINHA   ◄► GOLPE   A CONFIRMAR   B VOLTAR');

    this.slots.forEach((id, i) => {
      const y = 30 + i * 24;
      const g = fichaGolpe(id);
      const info = infoTipo(g.tipo);
      if (i === this.cursorSlot) r.retangulo(10, y - 2, LARGURA - 20, 21, P.uiBg2!);
      r.texto(`${i + 1}`, 14, y + 4, P.uiAccD!);
      r.texto(g.nome.toUpperCase(), 26, y + 1, P.uiInk!);
      /* moldura escura por fora, miolo claro por dentro: por causa dos golpes
         'neutro' (ink2, quase preto), texto direto em cima de corD some —
         é o mesmo truque do quadro de golpe da batalha (scenes/battle.ts) */
      r.retangulo(26, y + 10, r.larguraTexto(info.nome) + 8, 9, info.corD);
      r.retangulo(27, y + 11, r.larguraTexto(info.nome) + 6, 7, info.cor);
      r.texto(info.nome, 30, y + 12, P.uiInk!);
      const pp = `PP ${g.pp}`;
      r.texto(pp, LARGURA - 20 - r.larguraTexto(pp), y + 11, P.uiBg3!);
    });
  }
}
