/* =========================================================================
   A cor rara: o mesmo desenho do Encantado com o matiz girado.

   Um bicho em 256 nasce de outra cor. Em vez de desenhar tudo de novo, a
   paleta é girada no círculo das cores — o contorno, o branco do olho e o
   preto da pupila (pouco saturados) ficam como estão, então a cara do bicho
   não muda. O giro sai do nome da espécie: o raro de cada um é sempre o
   mesmo, e nunca perto da cor de antes (entre 90° e 270°).
   ========================================================================= */
import { Buf } from '../core/buf.ts';

function hsl(hex: string): [number, number, number, string] | null {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l, m[2] ?? ''];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h, s, l, m[2] ?? ''];
}

function hex(h: number, s: number, l: number, alfa: string): string {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const c = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${c(f(0))}${c(f(8))}${c(f(4))}${alfa}`;
}

/* quanto o matiz gira para esta espécie (90° a 270°) */
export function giroDe(especie: string): number {
  let x = 7;
  for (const ch of especie) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  return 90 + (x % 181);
}

export function corRara(cor: string, giro: number): string {
  const v = hsl(cor);
  if (!v) return cor;
  const [h, s, l, alfa] = v;
  if (s < 0.18 || l < 0.12 || l > 0.93) return cor;   // contorno, olho, brilho
  return hex((h + giro) % 360, s, l, alfa);
}

/* bicho quase sem cor (o Lobinho cinza, o Corpo-Seco) mal mudaria só com o
   giro: nele os cinzas do meio ganham um banho leve da cor nova */
function tingirCinza(cor: string, matiz: number): string {
  const v = hsl(cor);
  if (!v) return cor;
  const [, s, l, alfa] = v;
  if (s >= 0.18 || l < 0.12 || l > 0.93) return cor;
  return hex(matiz, 0.35, l, alfa);
}

export function variante(b: Buf, especie: string): Buf {
  const giro = giroDe(especie);
  const novo = new Buf(b.w, b.h);
  let pintados = 0, mudados = 0;
  for (let i = 0; i < b.d.length; i++) {
    const c = b.d[i];
    if (c == null) { novo.d[i] = c; continue; }
    pintados++;
    const n = corRara(c, giro);
    if (n !== c) mudados++;
    novo.d[i] = n;
  }
  if (mudados < pintados * 0.4) {
    for (let i = 0; i < novo.d.length; i++) {
      const c = novo.d[i];
      if (c != null) novo.d[i] = tingirCinza(c, giro % 360);
    }
  }
  return novo;
}
