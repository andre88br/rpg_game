/* =========================================================================
   O tocador de cutscenes: pega um roteiro (data/cutscenes.ts) e toca tomada
   por tomada — fundo, câmera, quem anda por cima, partículas e a legenda
   escrita letra a letra, como a fala de qualquer NPC.

   A revela a página inteira; com ela inteira, A passa para a próxima página
   ou, na última, para a próxima tomada (com um fade preto entre elas).
   B pula a cutscene inteira — quem já viu não deveria ter que ver de novo.
   ========================================================================= */
import { Buf, assar, assarSuave, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import { quebrar } from '../art/font.ts';
import { spritePessoa, ESTILOS, type Quadro } from '../art/people.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import { medalha } from '../art/badges.ts';
import { fogueira, trator, fagulha } from '../art/cenas.ts';
import { PECAS } from '../art/pecas.ts';
import { multiplicadorVelocidade } from '../game/config.ts';
import { preencher } from '../game/quests.ts';
import { nome as nomeDe } from '../battle/encantado.ts';
import type { EstadoJogo } from '../game/state.ts';
import {
  LARG_LEGENDA, textoDe, type Ator, type Efeito, type Figura, type Roteiro, type Tomada,
} from '../data/cutscenes.ts';
import * as Som from '../audio/som.ts';

const CHARS_POR_SEG = 38;
const FADE = 0.45;                 // o preto entre uma tomada e outra
const FADE_ATOR = 0.6;             // quanto um ator leva para surgir ou sumir
const Y_LEGENDA = 122;             // de onde a faixa da legenda começa
const TEMPO_TITULO = 1.6;          // o letreiro acende nesse tempo

/* os quadros de animação de uma figura, e quantos por segundo */
interface Quadros { imgs: Assado[]; fps: number; soAndando: boolean }

/* sem partida (a abertura, antes de existir alguém), valem estes */
const JOGADOR_PADRAO = 'taina';
const INICIAL_PADRAO = 'iarinha';

function quadrosDe(f: Figura, e: EstadoJogo | null): Quadros {
  if ('jogador' in f) return quadrosDe({ pessoa: e?.personagem ?? JOGADOR_PADRAO, dir: f.dir }, e);
  if ('inicial' in f) return quadrosDe({ criatura: e?.time[0]?.especie ?? INICIAL_PADRAO, flip: f.flip }, e);
  if ('pessoa' in f) {
    const op = ESTILOS[f.pessoa] ?? {};
    const d = f.dir ?? 'baixo';
    const q = (n: Quadro) => assar(spritePessoa(op, d, n));
    const parado = q(0);
    return { imgs: [parado, q(1), parado, q(2)], fps: 7, soAndando: true };
  }
  if ('criatura' in f) {
    const arte = ARTE_CRIATURAS[f.criatura]?.();
    if (!arte) return { imgs: [], fps: 0, soAndando: false };
    const b = f.flip ? new Buf(arte.w, arte.h).blit(arte, 0, 0, { flipX: true }) : arte;
    return { imgs: [assarSuave(b)], fps: 0, soAndando: false };
  }
  if ('medalha' in f) return { imgs: [assar(medalha(f.medalha, f.tam ?? 16))], fps: 0, soAndando: false };
  if (f.peca === 'fogueira') return { imgs: [0, 1, 2].map((i) => assar(fogueira(i))), fps: 8, soAndando: false };
  if (f.peca !== 'trator') return { imgs: [assar(PECAS[f.peca]())], fps: 0, soAndando: false };
  return { imgs: [0, 1].map((i) => assar(trator(i))), fps: 8, soAndando: true };
}

const suave = (t: number) => t * t * (3 - 2 * t);
const limitar = (v: number, a = 0, z = 1) => Math.max(a, Math.min(z, v));

/* onde o ator está no tempo t, e se está andando nesse instante */
function posicao(a: Ator, t: number): { x: number; y: number; andando: boolean } {
  let x = a.x, y = a.y, andando = false;
  if (a.ate) {
    const de = a.ate.de ?? 0;
    let p = (t - de) / a.ate.por;
    if (a.ate.vaiVolta && p > 0) {
      const ciclo = p % 2;
      p = ciclo > 1 ? 2 - ciclo : ciclo;
      andando = true;
    } else {
      andando = p > 0 && p < 1;
      p = limitar(p);
    }
    const k = a.ate.vaiVolta ? suave(p) : p;
    x = a.x + (a.ate.x - a.x) * k;
    y = a.y + (a.ate.y - a.y) * k;
  }
  if (a.balanco) {
    const s = Math.sin(((t / a.balanco.periodo) * Math.PI * 2) + (a.balanco.fase ?? 0));
    y -= a.balanco.salto ? Math.abs(s) * a.balanco.amp : s * a.balanco.amp;
  }
  return { x, y, andando };
}

function opacidade(a: Ator, t: number): number {
  let al = a.alfa ?? 1;
  if (a.aparece !== undefined) al *= limitar((t - a.aparece) / FADE_ATOR);
  if (a.some !== undefined) al *= 1 - limitar((t - a.some) / FADE_ATOR);
  return al;
}

/* o que é preciso de uma tomada já pronto para desenhar */
interface Preparada {
  tomada: Tomada;
  fundo: Assado;
  depois: Assado | null;
  atores: { ator: Ator; q: Quadros }[];
  paginas: { quem: string | null; linhas: string[] }[];   // cada legenda já quebrada
}

export class CenaCutscene implements Cena {
  private prep: Preparada | null = null;
  private indice = 0;
  private t = 0;                // tempo da tomada (anima fundo e atores)
  private fase: 'entra' | 'mostra' | 'sai' = 'entra';
  private tf = 0;               // tempo dentro do fade
  private pagina = 0;
  private revelados = 0;
  private faisca!: Assado;
  private terminou = false;

  /* `estado`: a partida, para as figuras e legendas que dependem de quem
     está jogando. A abertura toca antes de haver partida, e passa null. */
  constructor(private readonly roteiro: Roteiro, private readonly aoTerminar: () => void,
              private readonly estado: EstadoJogo | null = null) {}

  entrar(): void {
    this.faisca = assar(fagulha());
    this.indice = 0;
    this.terminou = false;
    this.preparar();
  }

  private preparar(): void {
    const tomada = this.roteiro[this.indice];
    if (!tomada) { this.fim(); return; }
    if (tomada.musica) Som.musica(tomada.musica);
    this.prep = {
      tomada,
      fundo: assarSuave(tomada.fundo()),
      depois: tomada.depois ? assarSuave(tomada.depois.fundo()) : null,
      atores: (tomada.atores ?? []).map((ator) => ({ ator, q: quadrosDe(ator.figura, this.estado) })),
      paginas: tomada.legendas.map((l) => ({
        quem: typeof l === 'string' ? null : l.quem,
        linhas: quebrar(this.recheio(textoDe(l)), LARG_LEGENDA),
      })),
    };
    this.t = 0;
    this.tf = 0;
    this.fase = 'entra';
    this.pagina = 0;
    this.revelados = 0;
  }

  private recheio(s: string): string {
    const e = this.estado;
    if (!e) return s;
    const bicho = e.time[0];
    return preencher(e, bicho ? s.replaceAll('{inicial}', nomeDe(bicho)) : s);
  }

  private fim(): void {
    if (this.terminou) return;
    this.terminou = true;
    Som.musica(null);             // fora da cutscene, o mundo fica sem música
    this.aoTerminar();
  }

  private get linhas(): string[] { return this.prep?.paginas[this.pagina]?.linhas ?? []; }
  private get totalChars(): number {
    const l = this.linhas;
    return l.length ? l.reduce((n, s) => n + s.length, 0) + l.length - 1 : 0;
  }
  /* a página está inteira na tela (ou a tomada é só letreiro e ele já acendeu) */
  private get pronta(): boolean {
    if (!this.prep) return false;
    if (this.prep.paginas.length === 0) return this.t >= TEMPO_TITULO;
    return this.revelados >= this.totalChars;
  }

  atualizar(dt: number, entrada: Entrada): void {
    if (this.terminou || !this.prep) return;
    const passo = dt * multiplicadorVelocidade();
    this.t += passo;

    if (entrada.apertou('b')) { this.fim(); return; }     // pula a cutscene inteira

    if (this.fase === 'entra') {
      this.tf += dt;
      if (this.tf >= FADE) { this.fase = 'mostra'; this.tf = 0; }
      return;
    }
    if (this.fase === 'sai') {
      this.tf += dt;
      if (this.tf >= FADE) { this.indice++; this.preparar(); }
      return;
    }

    this.revelados = Math.min(this.totalChars, this.revelados + CHARS_POR_SEG * passo);
    if (!entrada.apertou('a')) return;
    if (!this.pronta) {
      // A no meio: revela a página inteira (ou acende o letreiro de vez)
      this.revelados = this.totalChars;
      if (this.prep.paginas.length === 0) this.t = Math.max(this.t, TEMPO_TITULO);
      return;
    }
    if (this.pagina < this.prep.paginas.length - 1) {
      this.pagina++;
      this.revelados = 0;
      return;
    }
    if (this.indice >= this.roteiro.length - 1) { this.fim(); return; }
    this.fase = 'sai';
    this.tf = 0;
  }

  desenhar(r: Renderizador): void {
    r.limpar('#0d0912');
    const p = this.prep;
    if (!p) return;
    const tom = p.tomada;
    const ctx = r.ctx;

    // câmera: só anda se o fundo for mais largo que a tela
    let camX = 0;
    if (tom.camera) {
      const k = suave(limitar((this.t - (tom.camera.inicio ?? 0)) / tom.camera.por));
      camX = Math.round(tom.camera.de + (tom.camera.ate - tom.camera.de) * k);
    }
    r.recorte(p.fundo, camX, 0, LARGURA, ALTURA, 0, 0);
    if (p.depois && tom.depois) {
      const al = limitar((this.t - tom.depois.de) / tom.depois.por);
      if (al > 0) {
        ctx.globalAlpha = al;
        r.recorte(p.depois, camX, 0, LARGURA, ALTURA, 0, 0);
        ctx.globalAlpha = 1;
      }
    }

    // quem está por cima do fundo, de trás (y menor) para a frente
    const vivos = p.atores
      .map(({ ator, q }) => ({ q, al: opacidade(ator, this.t), frente: ator.frente === true, ...posicao(ator, this.t) }))
      .filter((v) => v.al > 0 && v.q.imgs.length > 0)
      // quem tem `frente` passa na frente de todo mundo (o farol tapa o bicho)
      .sort((a, b) => Number(a.frente) - Number(b.frente) || a.y - b.y);
    for (const v of vivos) {
      const anima = v.q.fps > 0 && (!v.q.soAndando || v.andando);
      const img = v.q.imgs[anima ? Math.floor(this.t * v.q.fps) % v.q.imgs.length : 0]!;
      ctx.globalAlpha = v.al;
      r.sprite(img, v.x - camX, v.y);
    }
    ctx.globalAlpha = 1;

    for (const e of tom.efeitos ?? []) {
      // um efeito com `some` vai apagando nos últimos instantes
      const resta = e.some === undefined ? 1 : limitar((e.some - this.t) / FADE_ATOR);
      if (resta > 0) this.desenharEfeito(r, e.tipo, e.x - camX, e.y, this.t - (e.aparece ?? 0), resta);
    }

    if (tom.titulo) this.desenharTitulo(r, tom.titulo);
    if (p.paginas.length) this.desenharLegenda(r);

    if (this.pronta && this.fase === 'mostra' && Math.floor(this.t * 2.5) % 2 === 0) {
      r.texto('A', LARGURA - 14, ALTURA - 13, P.uiAcc!, { sombra: P.ink! });
    }
    r.texto('B PULAR', LARGURA - 50, 5, '#b0a8c8', { sombra: P.ink! });

    const escuro = this.fase === 'entra' ? 1 - this.tf / FADE : this.fase === 'sai' ? this.tf / FADE : 0;
    r.cortina(escuro);
  }

  /* partículas sem estado: cada uma é só uma fase que dá a volta no tempo */
  private desenharEfeito(r: Renderizador, tipo: Efeito['tipo'], x: number, y: number, t: number, resta = 1): void {
    if (t <= 0) return;
    const ctx = r.ctx;
    const entrada = limitar(t / FADE_ATOR) * resta;
    if (tipo === 'poeira') {
      /* o redemoinho do Sacizinho: grãos girando num funil que abre para cima */
      for (let i = 0; i < 30; i++) {
        const f = (t * 0.8 + i / 30) % 1;
        const ang = t * 10 + i * 2.4;
        const raio = 4 + f * 18;
        ctx.globalAlpha = 0.8 * (1 - f * 0.6) * entrada;
        r.retangulo(x + Math.cos(ang) * raio - 1, y - f * 50, 3, 3, i % 3 ? '#d8c8a0' : '#a89878');
      }
      ctx.globalAlpha = 1;
      return;
    }
    if (tipo === 'fagulhas') {
      for (let i = 0; i < 10; i++) {
        const f = (t * 0.55 + i / 10) % 1;
        const dx = Math.sin(i * 7.3 + f * 6) * (3 + f * 6);
        ctx.globalAlpha = (1 - f) * entrada;
        r.sprite(this.faisca, x + dx, y - f * 44);
      }
    } else {
      for (let i = 0; i < 7; i++) {
        const f = (t * 0.18 + i / 7) % 1;
        const tam = Math.round(4 + f * 10);
        ctx.globalAlpha = 0.45 * (1 - f) * entrada;
        r.retangulo(x + Math.sin(i * 3.1 + f * 4) * 6 + f * 14 - tam / 2, y - f * 50 - tam / 2, tam, tam, '#5a4a44');
      }
    }
    ctx.globalAlpha = 1;
  }

  private desenharTitulo(r: Renderizador, linhas: readonly string[]): void {
    const al = limitar((this.t - 0.3) / (TEMPO_TITULO - 0.3));
    if (al <= 0) return;
    r.ctx.globalAlpha = al;
    linhas.forEach((s, i) => {
      const y = 44 + i * 16;
      r.texto(s, (LARGURA - r.larguraTexto(s)) / 2, y, i === 0 ? P.gold! : P.lightD!, { sombra: P.ink! });
    });
    r.ctx.globalAlpha = 1;
  }

  private desenharLegenda(r: Renderizador): void {
    r.ctx.globalAlpha = 0.78;
    r.retangulo(0, Y_LEGENDA, LARGURA, ALTURA - Y_LEGENDA, P.black!);
    r.ctx.globalAlpha = 1;
    r.retangulo(0, Y_LEGENDA, LARGURA, 1, P.uiAccD!);
    if (this.fase !== 'mostra') return;

    // quem fala: uma etiqueta encostada em cima da faixa
    const quem = this.prep?.paginas[this.pagina]?.quem;
    if (quem) {
      const w = r.larguraTexto(quem) + 8;
      r.retangulo(6, Y_LEGENDA - 11, w, 11, P.uiAccD!);
      r.retangulo(7, Y_LEGENDA - 10, w - 2, 10, P.ink!);
      r.texto(quem, 10, Y_LEGENDA - 8, P.gold!);
    }

    let restantes = Math.floor(this.revelados);
    this.linhas.forEach((linha, i) => {
      if (restantes <= 0) return;
      r.texto(linha.slice(0, restantes), 10, Y_LEGENDA + 5 + i * 11, P.uiBg!, { sombra: P.ink! });
      restantes -= linha.length + 1;
    });
  }
}
