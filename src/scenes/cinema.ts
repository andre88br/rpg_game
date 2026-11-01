/* =========================================================================
   A película das cutscenes: o que faz a tomada pintada parecer filme.

   - FAIXAS pretas em cima e embaixo (a tela vira 2:1, de cinema); a
     legenda mora na de baixo, centrada, como legenda de filme.
   - A CÂMERA nunca está parada: aproxima ou afasta devagar (uma tomada
     entra, a outra sai) em volta de quem está em cena, e treme um tico,
     como câmera na mão. Com o zoom, o desenho é suavizado.
   - A COR de cada tomada sai do próprio fundo: noite puxa para o azul do
     luar, fogo e entardecer para o dourado, dia claro para o céu frio com
     a pele quente.
   - O BRILHO das luzes vaza em volta (o que é claro acende o ar), a borda
     escurece (vinheta) e um grão fino de película corre por cima.
   - A troca de tomada é uma fusão (uma imagem dissolve na outra), não um
     mergulho no preto.

   Tudo por cima do canvas 2D, sem filtro de canvas (que nem todo
   navegador tem): só composição e imagens pequenas ampliadas.
   ========================================================================= */
import type { Buf } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';

/* a altura de cada faixa preta, e onde a imagem fica entre elas */
export const FAIXA = 20;
export const IMAGEM_Y0 = FAIXA;
export const IMAGEM_Y1 = ALTURA - FAIXA;

/* o mapa de luz passa um pouco da tela, para o zoom não mostrar a borda */
const MARGEM = 24;

const ZOOM_PERTO = 1.1, ZOOM_LONGE = 1.03;
const DURACAO_ZOOM = 14;          // segundos de uma ponta à outra
export const DISSOLVE = 0.9;      // a fusão de uma tomada na outra

export type Tom = 'noite' | 'dourado' | 'dia' | 'escuro';

const suave = (t: number) => t * t * (3 - 2 * t);
const limitar = (v: number, a = 0, z = 1) => Math.max(a, Math.min(z, v));

/* a luz da tomada, pela média de cor do fundo pintado */
export function tomDoFundo(b: Buf): Tom {
  let r = 0, g = 0, bl = 0, n = 0;
  const passoX = Math.max(1, Math.floor(b.w / 40)), passoY = 4;
  for (let y = 0; y < b.h; y += passoY) {
    for (let x = 0; x < b.w; x += passoX) {
      const c = b.get(x, y);
      if (!c || c.length < 7) continue;
      r += parseInt(c.slice(1, 3), 16); g += parseInt(c.slice(3, 5), 16); bl += parseInt(c.slice(5, 7), 16);
      n++;
    }
  }
  if (!n) return 'escuro';
  r /= n * 255; g /= n * 255; bl /= n * 255;
  const luz = r * 0.3 + g * 0.59 + bl * 0.11;
  if (luz < 0.16) return 'escuro';
  if (luz < 0.3 && bl >= r) return 'noite';
  if (r - bl > 0.12) return 'dourado';
  return luz < 0.3 ? 'noite' : 'dia';
}

/* a correção de cor de cada luz: em cima e embaixo (soft-light), e a força */
const GRADE: Record<Tom, { cima: string; baixo: string; forca: number; brilho: number }> = {
  noite: { cima: '#2c5a8c', baixo: '#3a4a7a', forca: 0.55, brilho: 0.55 },
  escuro: { cima: '#3a3060', baixo: '#5a3a30', forca: 0.4, brilho: 0.6 },
  dourado: { cima: '#ffb35a', baixo: '#c8603a', forca: 0.4, brilho: 0.28 },
  dia: { cima: '#5a9ac8', baixo: '#f0a868', forca: 0.36, brilho: 0.16 },
};

function tela(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export interface Camera { zoom: number; fx: number; fy: number; ox: number; oy: number }

export class Pelicula {
  private readonly graos: HTMLCanvasElement[] = [];
  private readonly brilho1 = tela(80, 54);
  private readonly brilho2 = tela(40, 27);
  private readonly vinheta: HTMLCanvasElement;
  private foto: HTMLCanvasElement | null = null;
  private readonly mapaLuz = tela((LARGURA + 2 * MARGEM) * 2, (ALTURA + 2 * MARGEM) * 2);

  constructor() {
    // quatro quadros de grão, em resolução cheia do canvas
    for (let k = 0; k < 4; k++) {
      const c = tela(LARGURA * 2, ALTURA * 2);
      const cx = c.getContext('2d')!;
      const img = cx.createImageData(c.width, c.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 128 + (Math.random() + Math.random() + Math.random() - 1.5) * 70;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      cx.putImageData(img, 0, 0);
      this.graos.push(c);
    }
    // a vinheta: o meio limpo, a borda escura, mais embaixo que em cima
    this.vinheta = tela(LARGURA * 2, ALTURA * 2);
    const v = this.vinheta.getContext('2d')!;
    v.scale(2, 2);
    const g = v.createRadialGradient(LARGURA / 2, ALTURA * 0.46, ALTURA * 0.3, LARGURA / 2, ALTURA * 0.5, LARGURA * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.6, 'rgba(0,0,0,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0.7)');
    v.fillStyle = g;
    v.fillRect(0, 0, LARGURA, ALTURA);
  }

  /* onde a câmera está em `t` na tomada `indice`, olhando para (fx, fy) */
  camera(t: number, indice: number, fx: number, fy: number): Camera {
    const k = suave(limitar(t / DURACAO_ZOOM));
    const entra = indice % 2 === 0;
    const zoom = entra ? ZOOM_LONGE + (ZOOM_PERTO - ZOOM_LONGE) * k : ZOOM_PERTO - (ZOOM_PERTO - ZOOM_LONGE) * k;
    // a mão de quem segura: dois senos lentos, menos de um pixel
    const ox = Math.sin(t * 0.63 + indice) * 0.55 + Math.sin(t * 1.37) * 0.25;
    const oy = Math.sin(t * 0.81 + indice * 2) * 0.4 + Math.cos(t * 1.11) * 0.2;
    return { zoom, fx: limitar(fx, 70, LARGURA - 70), fy: limitar(fy, 50, ALTURA - 50), ox, oy };
  }

  /* começa a camada da cena (fundo, atores, efeitos): zoom e suavização */
  abrirCena(r: Renderizador, c: Camera): void {
    const ctx = r.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(c.fx + c.ox, c.fy + c.oy);
    ctx.scale(c.zoom, c.zoom);
    ctx.translate(-c.fx, -c.fy);
  }

  fecharCena(r: Renderizador): void {
    r.ctx.restore();
    r.ctx.imageSmoothingEnabled = false;
  }

  /* a cor, o brilho que vaza, a vinheta e o grão — sobre a cena pronta */
  revelar(r: Renderizador, tom: Tom, t: number): void {
    const ctx = r.ctx;
    const gr = GRADE[tom];
    ctx.save();

    // o brilho: a tela miúda, multiplicada por ela mesma (só o claro
    // sobra), ampliada de volta e somada como luz
    const b1 = this.brilho1.getContext('2d')!, b2 = this.brilho2.getContext('2d')!;
    b1.globalCompositeOperation = 'source-over';
    b1.imageSmoothingEnabled = true;
    b1.drawImage(r.canvas, 0, 0, 80, 54);
    b1.globalCompositeOperation = 'multiply';
    b1.drawImage(this.brilho1, 0, 0);
    b1.drawImage(this.brilho1, 0, 0);
    b2.imageSmoothingEnabled = true;
    b2.clearRect(0, 0, 40, 27);
    b2.drawImage(this.brilho1, 0, 0, 40, 27);
    ctx.imageSmoothingEnabled = true;
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = gr.brilho;
    ctx.drawImage(this.brilho2, 0, 0, LARGURA, ALTURA);
    ctx.globalAlpha = gr.brilho * 0.6;
    ctx.drawImage(this.brilho1, 0, 0, LARGURA, ALTURA);

    // a cor da luz: céu de um jeito, chão de outro
    const g = ctx.createLinearGradient(0, IMAGEM_Y0, 0, IMAGEM_Y1);
    g.addColorStop(0, gr.cima);
    g.addColorStop(1, gr.baixo);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = gr.forca;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    // um contraste a mais (o preto mais fundo, o claro mais aceso)
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(this.vinheta, 0, 0, LARGURA, ALTURA);

    // o grão da película: 24 quadros por segundo, como o filme
    const q = Math.floor(t * 24);
    const grao = this.graos[q % this.graos.length]!;
    const dx = (q * 37) % 13, dy = (q * 23) % 9;
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.16;
    ctx.drawImage(grao, -dx, -dy, LARGURA + 13, ALTURA + 9);
    // e a luz do projetor, que respira um tico
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.025 * (0.5 + 0.5 * Math.sin(t * 17) * Math.sin(t * 5.3));
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    ctx.restore();
    ctx.imageSmoothingEnabled = false;
  }

  /* o clarão de lente de uma luz forte (fogo, farol): o risco deitado */
  clarao(r: Renderizador, x: number, y: number, t: number, forca = 1): void {
    const ctx = r.ctx;
    const pisca = (0.8 + 0.2 * Math.sin(t * 9) * Math.sin(t * 3.7)) * forca;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 34);
    halo.addColorStop(0, `rgba(255,190,110,${0.38 * pisca})`);
    halo.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(x - 34, y - 34, 68, 68);
    const risco = ctx.createLinearGradient(x - 110, 0, x + 110, 0);
    risco.addColorStop(0, 'rgba(255,150,80,0)');
    risco.addColorStop(0.5, `rgba(255,200,140,${0.42 * pisca})`);
    risco.addColorStop(1, 'rgba(255,150,80,0)');
    ctx.fillStyle = risco;
    ctx.fillRect(x - 110, y - 0.6, 220, 1.2);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x - 70, y - 1.5, 140, 3);
    ctx.restore();
  }

  /* a luz de verdade, dentro da camada da cena: de noite, o escuro cobre
     tudo menos a roda de cada fogo (que treme); de dia, raios de sol
     entram de viés, com poeira boiando neles */
  iluminar(r: Renderizador, tom: Tom, luzes: readonly { x: number; y: number }[], t: number): void {
    const ctx = r.ctx;
    if (luzes.length && (tom === 'noite' || tom === 'escuro')) {
      const m = this.mapaLuz.getContext('2d')!;
      m.setTransform(1, 0, 0, 1, 0, 0);
      m.globalCompositeOperation = 'source-over';
      m.fillStyle = tom === 'noite' ? '#4a4a72' : '#3a3046';
      m.fillRect(0, 0, this.mapaLuz.width, this.mapaLuz.height);
      m.setTransform(2, 0, 0, 2, 2 * MARGEM, 2 * MARGEM);
      m.globalCompositeOperation = 'lighter';
      for (const [i, l] of luzes.entries()) {
        const treme = 1 + Math.sin(t * 11 + i) * 0.04 + Math.sin(t * 23.7 + i * 3) * 0.03;
        const raio = 78 * treme;
        const g = m.createRadialGradient(l.x, l.y, 4, l.x, l.y, raio);
        g.addColorStop(0, '#ffe2b0');
        g.addColorStop(0.35, '#d89a60');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        m.fillStyle = g;
        m.fillRect(l.x - raio, l.y - raio, raio * 2, raio * 2);
      }
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(this.mapaLuz, -MARGEM, -MARGEM, LARGURA + 2 * MARGEM, ALTURA + 2 * MARGEM);
      ctx.restore();
      return;
    }
    if (tom !== 'dia' && tom !== 'dourado') return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const cor = tom === 'dia' ? '255,246,220' : '255,200,130';
    for (let i = 0; i < 5; i++) {
      const x = 20 + i * 46 + Math.sin(t * 0.21 + i * 1.7) * 10;
      const larg = 12 + (i % 3) * 9;
      const forca = 0.07 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.37 + i * 2.3));
      const g = ctx.createLinearGradient(0, 0, 0, ALTURA);
      g.addColorStop(0, `rgba(${cor},${forca})`);
      g.addColorStop(1, `rgba(${cor},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, -10); ctx.lineTo(x + larg, -10);
      ctx.lineTo(x + larg + 70, ALTURA); ctx.lineTo(x + 70, ALTURA);
      ctx.closePath();
      ctx.fill();
    }
    // a poeira que boia na luz
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const f = (t * 0.03 + i * 0.137) % 1;
      const x = ((i * 53.7) % LARGURA) + Math.sin(t * 0.5 + i) * 6 + f * 20;
      const y = 30 + ((i * 31.3) % 90) - f * 24;
      ctx.globalAlpha = 0.55 * Math.sin(f * Math.PI);
      ctx.fillStyle = `rgb(${cor})`;
      ctx.fillRect(x, y, 0.8, 0.8);
    }
    ctx.restore();
  }

  /* as faixas pretas; `k` de 0 a 1 é o quanto já fecharam */
  faixas(r: Renderizador, k: number): void {
    const h = Math.round(FAIXA * suave(limitar(k)));
    if (h <= 0) return;
    r.retangulo(0, 0, LARGURA, h, '#000000');
    r.retangulo(0, ALTURA - h, LARGURA, h, '#000000');
  }

  /* guarda o último quadro, para a próxima tomada dissolver por cima dele */
  fotografar(r: Renderizador): void {
    const c = r.canvas;
    if (!this.foto || this.foto.width !== c.width || this.foto.height !== c.height) this.foto = tela(c.width, c.height);
    const f = this.foto.getContext('2d')!;
    f.clearRect(0, 0, c.width, c.height);
    f.drawImage(c, 0, 0);
  }

  temFoto(): boolean { return this.foto !== null; }

  /* a foto da tomada de antes por cima, sumindo */
  dissolver(r: Renderizador, alfa: number): void {
    if (!this.foto || alfa <= 0) return;
    const ctx = r.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = suave(limitar(alfa));
    ctx.drawImage(this.foto, 0, 0);
    ctx.restore();
  }
}
