/* =========================================================================
   Entrada unificada: teclado e toque alimentam o mesmo conjunto de acoes,
   entao nenhuma cena precisa saber de qual origem veio o comando.
   ========================================================================= */

export type Acao = 'cima' | 'baixo' | 'esq' | 'dir' | 'a' | 'b' | 'menu';

const MAPA_TECLAS: Record<string, Acao> = {
  ArrowUp: 'cima', KeyW: 'cima',
  ArrowDown: 'baixo', KeyS: 'baixo',
  ArrowLeft: 'esq', KeyA: 'esq',
  ArrowRight: 'dir', KeyD: 'dir',
  KeyZ: 'a', Enter: 'a', Space: 'a',
  KeyX: 'b', ShiftLeft: 'b', ShiftRight: 'b', Backspace: 'b',
  Escape: 'menu', Tab: 'menu',
};

export class Entrada {
  private ativas = new Set<Acao>();
  private novas = new Set<Acao>();      // apertadas neste quadro
  private consumidas = new Set<Acao>();

  constructor(alvo: HTMLElement | Window = window) {
    window.addEventListener('keydown', (e) => {
      const acao = MAPA_TECLAS[e.code];
      if (!acao) return;
      e.preventDefault();
      if (!this.ativas.has(acao)) this.novas.add(acao);
      this.ativas.add(acao);
    });
    window.addEventListener('keyup', (e) => {
      const acao = MAPA_TECLAS[e.code];
      if (!acao) return;
      e.preventDefault();
      this.ativas.delete(acao);
    });
    // se a aba perde o foco, solta tudo: senao o personagem sai andando sozinho
    window.addEventListener('blur', () => this.ativas.clear());
    void alvo;
  }

  /* liga um elemento da pagina a uma acao (botoes de toque) */
  ligarBotao(el: HTMLElement, acao: Acao): void {
    const apertar = (e: Event) => {
      e.preventDefault();
      if (!this.ativas.has(acao)) this.novas.add(acao);
      this.ativas.add(acao);
      el.classList.add('apertado');
    };
    const soltar = (e: Event) => {
      e.preventDefault();
      this.ativas.delete(acao);
      el.classList.remove('apertado');
    };
    el.addEventListener('pointerdown', apertar);
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    el.addEventListener('pointerleave', soltar);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  segurando(a: Acao): boolean { return this.ativas.has(a); }

  /* como apertou(), mas sem consumir: pra quem só quer ESPIAR o que foi
     apertado neste quadro sem atrapalhar quem decide o movimento com o
     mesmo botão (o código secreto lê as setas sem roubá-las do andar) */
  apertouAgora(a: Acao): boolean { return this.novas.has(a); }

  /* verdadeiro so no quadro em que a acao foi apertada */
  apertou(a: Acao): boolean {
    if (!this.novas.has(a) || this.consumidas.has(a)) return false;
    this.consumidas.add(a);
    return true;
  }

  /* direcao atual como vetor de -1/0/1; prioriza o eixo vertical no diagonal */
  direcao(): { x: number; y: number } {
    let x = 0, y = 0;
    if (this.segurando('esq')) x -= 1;
    if (this.segurando('dir')) x += 1;
    if (this.segurando('cima')) y -= 1;
    if (this.segurando('baixo')) y += 1;
    if (x !== 0 && y !== 0) x = 0;   // nada de andar na diagonal
    return { x, y };
  }

  /* chamado no fim de cada quadro */
  virarQuadro(): void {
    this.novas.clear();
    this.consumidas.clear();
  }
}
