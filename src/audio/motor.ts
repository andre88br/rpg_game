/* =========================================================================
   O sintetizador: WebAudio puro, no espírito de um console portátil —
   ondas de pulso para a melodia, triângulo para o baixo, ruído para a
   bateria e para os efeitos.

   Nada toca antes do primeiro toque ou tecla (o navegador não deixa); o
   pedido de música feito antes disso fica guardado e começa na hora que o
   áudio destrava.

   A música é agendada um pouco à frente do relógio do áudio (um laço a
   cada 25 ms olha 150 ms adiante), que é o jeito de o ritmo não tremer
   quando o quadro do jogo atrasa.
   ========================================================================= */
import { compilar, duracaoPasso, type Compilada, type Musica, type Voz, type Batida } from './partitura.ts';

export type Forma = 'pulso12' | 'pulso25' | 'pulso50' | 'triangulo' | 'seno';

export interface Tom {
  forma: Forma;
  de: number;           // Hz no começo
  ate?: number;         // Hz no fim (deslize exponencial)
  dur: number;          // segundos
  vol: number;
  em?: number;          // atraso, em segundos
}

export interface Chiado {
  filtro: BiquadFilterType;
  de: number;           // frequência de corte no começo
  ate?: number;
  dur: number;
  vol: number;
  q?: number;
  em?: number;
}

/* timbre e volume de cada voz da música */
const VOZES: Record<Voz, { forma: Forma; vol: number; solta: number }> = {
  melodia: { forma: 'pulso25', vol: 0.13, solta: 0.9 },
  contracanto: { forma: 'pulso50', vol: 0.07, solta: 0.85 },
  baixo: { forma: 'triangulo', vol: 0.26, solta: 0.92 },
  arpejo: { forma: 'pulso12', vol: 0.045, solta: 0.7 },
};

const ADIANTE = 0.15;
const INTERVALO_MS = 25;

interface Faixa {
  comp: Compilada;
  porPasso: { notas: Compilada['notas']; batidas: Compilada['batidas'] }[];
  saida: GainNode;
  inicio: number;       // tempo de áudio do passo 0 desta volta
  passo: number;        // próximo passo a agendar
  fim?: () => void;
}

export class Motor {
  readonly ctx: AudioContext;
  private mestre: GainNode;
  private busMusica: GainNode;
  private busEfeitos: GainNode;
  private ruido: AudioBuffer;
  private pulsos = new Map<Forma, PeriodicWave>();
  private faixa: Faixa | null = null;
  private relogio: ReturnType<typeof setInterval> | null = null;
  private compiladas = new Map<Musica, Compilada>();

  constructor() {
    const Ctor = window.AudioContext
      ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctor();
    this.mestre = this.ctx.createGain();
    this.mestre.gain.value = 0.8;
    // um compressor manso: efeito em cima de música não estoura o alto-falante
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    this.mestre.connect(comp).connect(this.ctx.destination);
    this.busMusica = this.ctx.createGain();
    this.busEfeitos = this.ctx.createGain();
    this.busMusica.connect(this.mestre);
    this.busEfeitos.connect(this.mestre);

    // um segundo de ruído branco, reaproveitado por toda batida e chiado
    const n = this.ctx.sampleRate;
    this.ruido = this.ctx.createBuffer(1, n, n);
    const d = this.ruido.getChannelData(0);
    let semente = 1;
    for (let i = 0; i < n; i++) {
      semente = (semente * 16807) % 2147483647;
      d[i] = (semente / 2147483647) * 2 - 1;
    }
  }

  get agora(): number { return this.ctx.currentTime; }

  volumes(musica: number, efeitos: number): void {
    const t = this.ctx.currentTime;
    this.busMusica.gain.setTargetAtTime(musica, t, 0.05);
    this.busEfeitos.gain.setTargetAtTime(efeitos, t, 0.05);
  }

  /* ---------------------------------------------------------- timbres */

  /* onda de pulso com o ciclo de trabalho pedido (12,5%, 25%, 50%) — a
     série de Fourier do pulso, cortada no 32º harmônico */
  private onda(forma: Forma): PeriodicWave | null {
    const ciclo = forma === 'pulso12' ? 0.125 : forma === 'pulso25' ? 0.25 : forma === 'pulso50' ? 0.5 : 0;
    if (!ciclo) return null;
    let w = this.pulsos.get(forma);
    if (w) return w;
    const N = 32;
    const re = new Float32Array(N), im = new Float32Array(N);
    for (let k = 1; k < N; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * ciclo);
    w = this.ctx.createPeriodicWave(re, im);
    this.pulsos.set(forma, w);
    return w;
  }

  private oscilador(forma: Forma): OscillatorNode {
    const o = this.ctx.createOscillator();
    const w = this.onda(forma);
    if (w) o.setPeriodicWave(w);
    else o.type = forma === 'triangulo' ? 'triangle' : 'sine';
    return o;
  }

  /* ------------------------------------------------------ notas soltas */

  private nota(destino: AudioNode, forma: Forma, freq: number, t0: number, dur: number,
               vol: number, ate?: number): void {
    const o = this.oscilador(forma);
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(freq, t0);
    if (ate !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(20, ate), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.004);
    g.gain.setTargetAtTime(vol * 0.7, t0 + 0.01, 0.08);
    g.gain.setTargetAtTime(0, t0 + dur * 0.85, 0.015);
    o.connect(g).connect(destino);
    o.start(t0);
    o.stop(t0 + dur + 0.08);
  }

  private chiado(destino: AudioNode, c: Chiado, t0: number): void {
    const src = this.ctx.createBufferSource();
    src.buffer = this.ruido;
    const f = this.ctx.createBiquadFilter();
    f.type = c.filtro;
    f.Q.value = c.q ?? 1;
    f.frequency.setValueAtTime(c.de, t0);
    if (c.ate !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(20, c.ate), t0 + c.dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(c.vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + c.dur);
    src.connect(f).connect(g).connect(destino);
    // começa num ponto qualquer do ruído, para duas batidas não soarem iguais
    src.start(t0, Math.random() * 0.5, c.dur + 0.05);
  }

  private batida(destino: AudioNode, b: Batida, t0: number): void {
    switch (b) {
      case 'bumbo': this.nota(destino, 'seno', 150, t0, 0.14, 0.5, 42); break;
      case 'caixa':
        this.chiado(destino, { filtro: 'highpass', de: 1200, dur: 0.12, vol: 0.2 }, t0);
        this.nota(destino, 'triangulo', 220, t0, 0.06, 0.15, 140);
        break;
      case 'chimbal': this.chiado(destino, { filtro: 'highpass', de: 7000, dur: 0.035, vol: 0.07 }, t0); break;
      case 'aberto': this.chiado(destino, { filtro: 'highpass', de: 6000, dur: 0.12, vol: 0.06 }, t0); break;
    }
  }

  /* ---------------------------------------------------------- efeitos */

  tom(t: Tom): void {
    this.nota(this.busEfeitos, t.forma, t.de, this.agora + (t.em ?? 0), t.dur, t.vol, t.ate);
  }

  som(c: Chiado): void {
    this.chiado(this.busEfeitos, c, this.agora + (c.em ?? 0));
  }

  /* ----------------------------------------------------------- música */

  private compilada(m: Musica): Compilada {
    let c = this.compiladas.get(m);
    if (!c) { c = compilar(m); this.compiladas.set(m, c); }
    return c;
  }

  /* Troca a música: a que toca some num fade curto, a nova entra logo
     depois. `fim` é chamado quando uma vinheta acaba. */
  tocar(m: Musica | null, fim?: () => void, fade = 0.12): void {
    this.calar(fade);
    if (!m) return;
    const comp = this.compilada(m);
    const porPasso = Array.from({ length: comp.passos }, () => ({
      notas: [] as Compilada['notas'], batidas: [] as Compilada['batidas'],
    }));
    for (const n of comp.notas) porPasso[n.passo]!.notas.push(n);
    for (const b of comp.batidas) porPasso[b.passo]!.batidas.push(b);
    const saida = this.ctx.createGain();
    saida.gain.value = m.ganho ?? 1;
    saida.connect(this.busMusica);
    this.faixa = { comp, porPasso, saida, inicio: this.agora + Math.min(fade, 0.3) + 0.02, passo: 0, fim };
    this.relogio ??= setInterval(() => this.agendar(), INTERVALO_MS);
    this.agendar();
  }

  /* silencia a faixa atual (fade de `fade` segundos) */
  calar(fade = 0.12): void {
    const f = this.faixa;
    this.faixa = null;
    if (!f) return;
    const t = this.agora;
    f.saida.gain.setValueAtTime(f.saida.gain.value, t);
    f.saida.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => f.saida.disconnect(), (fade + 1.5) * 1000);
  }

  private agendar(): void {
    const f = this.faixa;
    if (!f) return;
    const dp = duracaoPasso(f.comp.bpm);
    const limite = this.agora + ADIANTE;
    // aba que dormiu muito: não tenta tocar de uma vez tudo que perdeu
    if (f.inicio + f.passo * dp < this.agora - 0.5) {
      f.inicio = this.agora + 0.05 - f.passo * dp;
    }
    while (f.inicio + f.passo * dp < limite) {
      const t0 = f.inicio + f.passo * dp;
      const p = f.porPasso[f.passo]!;
      for (const n of p.notas) {
        const v = VOZES[n.voz];
        this.nota(f.saida, v.forma, n.freq, t0, n.dur * dp * v.solta, v.vol);
      }
      for (const b of p.batidas) this.batida(f.saida, b.batida, t0);
      f.passo++;
      if (f.passo >= f.comp.passos) {
        if (f.comp.vinheta) {
          this.faixa = null;
          const resto = (t0 - this.agora + dp * 2) * 1000;
          const fim = f.fim;
          setTimeout(() => { f.saida.disconnect(); fim?.(); }, Math.max(0, resto) + 400);
          return;
        }
        f.inicio += f.comp.passos * dp;
        f.passo = 0;
      }
    }
  }
}
