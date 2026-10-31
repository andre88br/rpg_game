/* =========================================================================
   O sintetizador: WebAudio puro, no espírito de um console portátil —
   ondas de pulso para a melodia, triângulo para o baixo, ruído para a
   bateria e para os efeitos. A música que pede (`instrumentos`) troca o
   pulso pelos instrumentos de cá: viola caipira, rabeca e pífano, e o
   terno de forró (zabumba, bacalhau, triângulo) no lugar da bateria.

   Nada toca antes do primeiro toque ou tecla (o navegador não deixa); o
   pedido de música feito antes disso fica guardado e começa na hora que o
   áudio destrava.

   A música é agendada um pouco à frente do relógio do áudio (um laço a
   cada 25 ms olha 150 ms adiante), que é o jeito de o ritmo não tremer
   quando o quadro do jogo atrasa.
   ========================================================================= */
import { compilar, duracaoPasso, type Compilada, type Instrumento, type Musica, type Voz, type Batida } from './partitura.ts';

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

/* o volume de cada instrumento, pela voz que ele toca: a viola dedilhando o
   arpejo fica por baixo, a rabeca e o pífano cantam a melodia */
const VOL_INSTRUMENTO: Record<Exclude<Instrumento, 'chip'>, Partial<Record<Voz, number>>> = {
  viola: { melodia: 0.16, contracanto: 0.1, arpejo: 0.07, baixo: 0.2 },
  rabeca: { melodia: 0.12, contracanto: 0.07, arpejo: 0.05, baixo: 0.12 },
  pifano: { melodia: 0.13, contracanto: 0.08, arpejo: 0.05, baixo: 0.1 },
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

  /* ---------------------------------------------- os instrumentos de cá */

  /* viola caipira: corda dobrada (a nota e a oitava, um tico desafinadas
     entre si), dedilhada — o brilho fecha logo e o som morre sozinho */
  private viola(destino: AudioNode, freq: number, t0: number, dur: number, vol: number): void {
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.Q.value = 1.2;
    filtro.frequency.setValueAtTime(Math.min(6000, freq * 9), t0);
    filtro.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.6), t0 + 0.35);
    const g = this.ctx.createGain();
    const soa = Math.max(0.25, Math.min(1.4, dur + 0.35));
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.003);
    g.gain.exponentialRampToValueAtTime(vol * 0.02, t0 + soa);
    filtro.connect(g).connect(destino);
    for (const [mult, peso] of [[1, 1], [1.004, 0.6], [2, 0.35]] as const) {
      const o = this.ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq * mult, t0);
      const p = this.ctx.createGain();
      p.gain.value = peso * 0.5;
      o.connect(p).connect(filtro);
      o.start(t0);
      o.stop(t0 + soa + 0.05);
    }
  }

  /* rabeca e pífano: notas sustentadas, que entram suave e ganham vibrato
     depois do ataque. A rabeca é de arco (serrote, filtrado, áspero); o
     pífano é sopro (quase seno, com um fio de ar no começo). */
  private sustentada(destino: AudioNode, inst: 'rabeca' | 'pifano', freq: number, t0: number,
                     dur: number, vol: number): void {
    const rabeca = inst === 'rabeca';
    const o = this.ctx.createOscillator();
    o.type = rabeca ? 'sawtooth' : 'triangle';
    o.frequency.setValueAtTime(freq, t0);
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = rabeca ? 5.6 : 6.2;
    const prof = this.ctx.createGain();
    prof.gain.setValueAtTime(0, t0);
    prof.gain.linearRampToValueAtTime(freq * (rabeca ? 0.009 : 0.005), t0 + Math.min(0.25, dur * 0.6));
    lfo.connect(prof).connect(o.frequency);
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = rabeca ? 2600 : 3800;
    filtro.Q.value = rabeca ? 2.5 : 0.7;
    const g = this.ctx.createGain();
    const ataque = rabeca ? 0.045 : 0.025;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + ataque);
    g.gain.setTargetAtTime(vol * 0.8, t0 + ataque, 0.12);
    g.gain.setTargetAtTime(0, t0 + Math.max(ataque, dur * 0.92), 0.03);
    o.connect(filtro).connect(g).connect(destino);
    o.start(t0); lfo.start(t0);
    o.stop(t0 + dur + 0.2); lfo.stop(t0 + dur + 0.2);
    // o fio de ar do pífano, e o chiado da crina da rabeca, no ataque
    this.chiado(destino, rabeca
      ? { filtro: 'bandpass', de: Math.min(5000, freq * 3), dur: 0.06, vol: vol * 0.25, q: 3 }
      : { filtro: 'bandpass', de: Math.min(6000, freq * 2), dur: 0.08, vol: vol * 0.35, q: 2 }, t0);
  }

  private tocarNota(destino: AudioNode, voz: Voz, inst: Instrumento | undefined, freq: number,
                    t0: number, dur: number): void {
    const v = VOZES[voz];
    if (!inst || inst === 'chip') { this.nota(destino, v.forma, freq, t0, dur * v.solta, v.vol); return; }
    const vol = VOL_INSTRUMENTO[inst][voz] ?? v.vol;
    if (inst === 'viola') this.viola(destino, freq, t0, dur, vol);
    else this.sustentada(destino, inst, freq, t0, dur * 0.95, vol);
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
      // a zabumba: couro grave e largo, com o toque da baqueta por cima
      case 'zabumba':
        this.nota(destino, 'seno', 118, t0, 0.24, 0.55, 46);
        this.chiado(destino, { filtro: 'lowpass', de: 1400, ate: 300, dur: 0.05, vol: 0.18 }, t0);
        break;
      // o bacalhau: a vareta fina no couro de baixo, seco e estalado
      case 'bacalhau':
        this.chiado(destino, { filtro: 'bandpass', de: 2600, dur: 0.05, vol: 0.16, q: 4 }, t0);
        this.nota(destino, 'triangulo', 520, t0, 0.04, 0.08, 380);
        break;
      // o triângulo: ferro que canta agudo; abafado na mão, quase só o toque
      case 'triangulo': case 'trianguloAberto': {
        const aberto = b === 'trianguloAberto';
        const dur = aberto ? 0.32 : 0.05;
        for (const [f, v] of [[4180, 0.03], [6250, 0.018], [9300, 0.01]] as const) {
          this.nota(destino, 'seno', f, t0, dur, aberto ? v : v * 0.7);
        }
        break;
      }
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
      for (const n of p.notas) this.tocarNota(f.saida, n.voz, f.comp.instrumentos[n.voz], n.freq, t0, n.dur * dp);
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
