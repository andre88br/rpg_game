/* =========================================================================
   O céu por cima de tudo: a cor da hora e o tempo que faz.

   Desenhado por cima do mundo (plano ou 3D) e da batalha, sempre na tela
   inteira de 240×160. Nada aqui sorteia por quadro: a chuva, a neblina e o
   clarão saem só do `tempo` que passa, então o desenho não treme e um mesmo
   instante sai sempre igual.
   ========================================================================= */
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Clima, Periodo } from '../game/tempo.ts';

/* cor e força do filtro de cada período; `leve` é o da batalha */
const FILTRO: Record<Periodo, { cor: string; alfa: number } | null> = {
  manha: { cor: '#ffd890', alfa: 0.08 },
  dia: null,
  tarde: { cor: '#ff8a3c', alfa: 0.16 },
  noite: { cor: '#0c1440', alfa: 0.45 },
};

export function tingir(r: Renderizador, p: Periodo, leve = false): void {
  const f = FILTRO[p];
  if (!f) return;
  r.ctx.globalAlpha = leve ? f.alfa * 0.6 : f.alfa;
  r.retangulo(0, 0, LARGURA, ALTURA, f.cor);
  r.ctx.globalAlpha = 1;
}

/* um número de 0 a 1 que só depende de `i` — a posição de cada gota */
function ruido(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function riscos(r: Renderizador, n: number, tempo: number, vel: number,
                dx: number, dy: number, cor: string, alfa: number): void {
  r.ctx.globalAlpha = alfa;
  r.ctx.strokeStyle = cor;
  r.ctx.lineWidth = 1;
  r.ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x0 = ruido(i) * (LARGURA + 40) - 20;
    const fase = (ruido(i + 500) + tempo * vel * (0.8 + ruido(i + 900) * 0.4)) % 1;
    const y = fase * (ALTURA + 20) - 10;
    const x = x0 + (dx / Math.max(1, dy)) * y;
    const xx = ((x % (LARGURA + 40)) + LARGURA + 40) % (LARGURA + 40) - 20;
    r.ctx.moveTo(Math.round(xx) + 0.5, Math.round(y));
    r.ctx.lineTo(Math.round(xx + dx) + 0.5, Math.round(y + dy));
  }
  r.ctx.stroke();
  r.ctx.globalAlpha = 1;
}

/* vento: riscos deitados que atravessam a tela, e umas folhinhas */
function ventania(r: Renderizador, tempo: number): void {
  r.ctx.globalAlpha = 0.35;
  for (let i = 0; i < 18; i++) {
    const y = Math.floor(ruido(i) * ALTURA);
    const fase = (ruido(i + 40) + tempo * (0.6 + ruido(i + 80) * 0.5)) % 1;
    const x = Math.floor(fase * (LARGURA + 60)) - 30;
    r.retangulo(x, y, 10 + Math.floor(ruido(i + 7) * 12), 1, '#f4f4e8');
  }
  r.ctx.globalAlpha = 0.9;
  for (let i = 0; i < 6; i++) {
    const fase = (ruido(i + 200) + tempo * 0.35) % 1;
    const x = Math.floor(fase * (LARGURA + 20)) - 10;
    const y = Math.floor(ruido(i + 300) * ALTURA + Math.sin(tempo * 3 + i) * 6);
    r.retangulo(x, y, 2, 2, i % 2 ? '#7aa83c' : '#c8a040');
  }
  r.ctx.globalAlpha = 1;
}

/* neblina: faixas largas, de borda esfumada, que derivam devagar */
function neblina(r: Renderizador, tempo: number): void {
  const ctx = r.ctx;
  ctx.globalAlpha = 0.16;
  r.retangulo(0, 0, LARGURA, ALTURA, '#c8ccd8');
  for (let i = 0; i < 6; i++) {
    const alt = 26 + Math.floor(ruido(i) * 20);
    const y = Math.floor(((ruido(i + 60) + tempo * 0.012 * (1 + i % 3)) % 1) * (ALTURA + alt)) - alt;
    const g = ctx.createLinearGradient(0, y, 0, y + alt);
    g.addColorStop(0, 'rgba(220,224,236,0)');
    g.addColorStop(0.5, 'rgba(220,224,236,1)');
    g.addColorStop(1, 'rgba(220,224,236,0)');
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = g;
    ctx.fillRect(0, y, LARGURA, alt);
  }
  ctx.globalAlpha = 1;
}

/* o clarão da tempestade: aceso por um instante a cada ~6 segundos */
export function clarao(tempo: number): number {
  const ciclo = tempo % 6.3;
  if (ciclo < 0.08) return 0.55;
  if (ciclo > 0.16 && ciclo < 0.22) return 0.35;
  return 0;
}

export function desenharClima(r: Renderizador, c: Clima, tempo: number): void {
  switch (c) {
    case 'chuva':
      r.ctx.globalAlpha = 0.1;
      r.retangulo(0, 0, LARGURA, ALTURA, '#203048');
      r.ctx.globalAlpha = 1;
      riscos(r, 70, tempo, 1.6, -3, 7, '#b8d0f0', 0.55);
      break;
    case 'tempestade': {
      r.ctx.globalAlpha = 0.2;
      r.retangulo(0, 0, LARGURA, ALTURA, '#101828');
      r.ctx.globalAlpha = 1;
      riscos(r, 110, tempo, 2.2, -5, 9, '#c8d8f8', 0.6);
      const luz = clarao(tempo);
      if (luz > 0) {
        r.ctx.globalAlpha = luz;
        r.retangulo(0, 0, LARGURA, ALTURA, '#f0f4ff');
        r.ctx.globalAlpha = 1;
      }
      break;
    }
    case 'ventania': ventania(r, tempo); break;
    case 'neblina': neblina(r, tempo); break;
    default: break;
  }
}
