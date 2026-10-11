/* =========================================================================
   Entrada unificada: teclado e toque alimentam o mesmo conjunto de acoes,
   entao nenhuma cena precisa saber de qual origem veio o comando.
   ========================================================================= */

export type Acao = 'cima' | 'baixo' | 'esq' | 'dir' | 'a' | 'b' | 'menu';

/* Uma tecla vira qual ação: a tecla própria de quem joga (das opções) ganha
   de qualquer outra; depois, as de sempre. */
export function acaoDaTecla(codigo: string, proprias: Partial<Record<Acao, string>>): Acao | null {
  for (const [acao, c] of Object.entries(proprias)) if (c === codigo) return acao as Acao;
  return MAPA_TECLAS[codigo] ?? null;
}

/* Controle de videogame no mapeamento padrão do navegador: A embaixo, B à
   direita, Start e Select abrem o menu, a cruz e o analógico esquerdo andam. */
export function acoesDoControle(botoes: readonly boolean[], eixos: readonly number[]): Set<Acao> {
  const s = new Set<Acao>();
  if (botoes[0]) s.add('a');
  if (botoes[1] || botoes[2]) s.add('b');
  if (botoes[3] || botoes[8] || botoes[9]) s.add('menu');
  const ex = eixos[0] ?? 0, ey = eixos[1] ?? 0;
  if (botoes[12] || ey < -0.5) s.add('cima');
  if (botoes[13] || ey > 0.5) s.add('baixo');
  if (botoes[14] || ex < -0.5) s.add('esq');
  if (botoes[15] || ex > 0.5) s.add('dir');
  return s;
}

const MAPA_TECLAS: Record<string, Acao> = {
  ArrowUp: 'cima', KeyW: 'cima',
  ArrowDown: 'baixo', KeyS: 'baixo',
  ArrowLeft: 'esq', KeyA: 'esq',
  ArrowRight: 'dir', KeyD: 'dir',
  KeyZ: 'a', Enter: 'a', Space: 'a',
  KeyX: 'b', ShiftLeft: 'b', ShiftRight: 'b', Backspace: 'b',
  Escape: 'menu', Tab: 'menu',
};

/* Uma tecla vira texto? Letras (com acento, que o navegador já entrega
   composto) em maiúscula; Backspace apaga, Enter confirma. O resto (setas,
   Esc) segue sendo ação. */
export function teclaDeTexto(key: string): string | null {
  if (key === 'Backspace') return '\b';
  if (key === 'Enter') return '\n';
  if (key.length === 1 && /\p{L}/u.test(key)) return key.toLocaleUpperCase('pt-BR');
  return null;
}

/* Para onde aponta um toque no direcional, pelo deslocamento (dx, dy) em
   relação ao centro e o raio da peça: o eixo que mais se afastou ganha, e
   um miolo pequeno no meio não aponta para lugar nenhum. Longe demais (o
   dedo escorregou para fora) continua valendo: é o mais perdoável. */
export function direcaoDoToque(dx: number, dy: number, raio: number): Acao | null {
  if (Math.hypot(dx, dy) < raio * 0.18) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'esq' : 'dir';
  return dy < 0 ? 'cima' : 'baixo';
}

export class Entrada {
  private ativas = new Set<Acao>();
  private novas = new Set<Acao>();      // apertadas neste quadro
  private consumidas = new Set<Acao>();
  /* digitando um nome: as letras do teclado viram texto, não ação (o W, o
     A, o S, o D, o Z e o X andariam e confirmariam no meio da palavra).
     Quem liga é a tela do nome; '\b' apaga e '\n' confirma. */
  modoTexto = false;
  private digitado: string[] = [];
  /* as teclas próprias (opções → TECLAS) */
  proprias: Partial<Record<Acao, string>> = {};
  /* esperando a próxima tecla para gravar como própria */
  private captura: ((codigo: string) => void) | null = null;
  /* o que o controle de videogame está segurando agora */
  private doControle = new Set<Acao>();

  constructor(alvo: HTMLElement | Window = window) {
    window.addEventListener('keydown', (e) => {
      if (this.captura) {
        e.preventDefault();
        const cb = this.captura;
        this.captura = null;
        cb(e.code);
        return;
      }
      if (this.modoTexto && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const t = teclaDeTexto(e.key);
        if (t !== null) { e.preventDefault(); this.digitado.push(t); return; }
      }
      const acao = acaoDaTecla(e.code, this.proprias);
      if (!acao) return;
      e.preventDefault();
      if (!this.ativas.has(acao)) this.novas.add(acao);
      this.ativas.add(acao);
    });
    window.addEventListener('keyup', (e) => {
      const acao = acaoDaTecla(e.code, this.proprias);
      if (!acao) return;
      e.preventDefault();
      this.ativas.delete(acao);
    });
    // se a aba perde o foco, solta tudo: senao o personagem sai andando sozinho
    window.addEventListener('blur', () => this.ativas.clear());
    void alvo;
  }

  /* O direcional de toque como UMA peça só: a direção sai de onde o dedo
     está em relação ao centro, a cada movimento. Assim dá para deslizar
     da seta de cima para a da esquerda sem levantar o dedo — com um botão
     por seta, o dedo que escorrega para o vizinho soltava tudo. */
  ligarDirecional(el: HTMLElement): void {
    const botoes = new Map<Acao, HTMLElement>();
    for (const b of el.querySelectorAll<HTMLElement>('[data-acao]')) botoes.set(b.dataset['acao'] as Acao, b);
    let atual: Acao | null = null;
    let dedo: number | null = null;
    const trocar = (nova: Acao | null) => {
      if (nova === atual) return;
      if (atual) { this.ativas.delete(atual); botoes.get(atual)?.classList.remove('apertado'); }
      atual = nova;
      if (nova) {
        if (!this.ativas.has(nova)) this.novas.add(nova);
        this.ativas.add(nova);
        botoes.get(nova)?.classList.add('apertado');
      }
    };
    const ler = (e: PointerEvent) => {
      const caixa = el.getBoundingClientRect();
      const dx = e.clientX - (caixa.left + caixa.width / 2);
      const dy = e.clientY - (caixa.top + caixa.height / 2);
      trocar(direcaoDoToque(dx, dy, caixa.width / 2));
    };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dedo = e.pointerId;
      try { el.setPointerCapture(e.pointerId); } catch { /* sem captura, segue */ }
      ler(e);
    });
    el.addEventListener('pointermove', (e) => { if (e.pointerId === dedo) { e.preventDefault(); ler(e); } });
    const soltar = (e: PointerEvent) => {
      if (e.pointerId !== dedo) return;
      dedo = null;
      trocar(null);
    };
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
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

  /* a próxima tecla apertada vai para `cb` em vez de virar ação */
  capturarTecla(cb: ((codigo: string) => void) | null): void { this.captura = cb; }
  get capturando(): boolean { return this.captura !== null; }

  /* lê o controle de videogame (chamado no começo de cada quadro): o que
     começou a ser segurado conta como apertado agora, o que soltou sai */
  lerControle(): void {
    const nav = (globalThis as { navigator?: { getGamepads?: () => (Gamepad | null)[] } }).navigator;
    let agora = new Set<Acao>();
    try {
      for (const pad of nav?.getGamepads?.() ?? []) {
        if (!pad) continue;
        const s = acoesDoControle(pad.buttons.map((b) => b.pressed), pad.axes);
        agora = new Set([...agora, ...s]);
      }
    } catch { /* sem controle */ }
    for (const a of agora) if (!this.doControle.has(a)) { this.novas.add(a); this.ativas.add(a); }
    for (const a of this.doControle) if (!agora.has(a)) this.ativas.delete(a);
    this.doControle = agora;
  }

  /* o que foi digitado desde a última leitura (só no modo texto) */
  lerTexto(): string[] {
    const t = this.digitado;
    this.digitado = [];
    return t;
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

  /* o que alguma cena de fato USOU neste quadro (via apertou) — é daqui
     que sai o clique de interface: tecla apertada que ninguém usou, como o
     A andando pelo mapa sem nada na frente, fica muda */
  usadasNoQuadro(): ReadonlySet<Acao> { return this.consumidas; }

  /* chamado no fim de cada quadro */
  virarQuadro(): void {
    this.novas.clear();
    this.consumidas.clear();
  }
}
