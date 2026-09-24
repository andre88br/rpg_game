/* =========================================================================
   Casas e terreiros com a cara de cada região.

   Um desenho por tipo de região, no lugar da casinha de telhado vermelho
   que era igual no mundo inteiro:
     água    vila de pescador: cal, barrado azul, azulejo, concha e gota
     planta  taipa e palha; o terreiro é uma oca de troncos
     fogo    pedra e ardósia; o terreiro é de pedra escura, com brasa
     vento   gameleira: raízes aéreas balançando no vento, lanternas
     raio    ocas do Xingu; o terreiro tem o totem da ave do trovão
     terra   adobe; o terreiro é esculpido no penhasco vermelho
     sombra  sobrado torto; o terreiro é um casarão de torre e lua
     luz     cal e ouro; o terreiro é um templo de colunas e sol

   Cada desenho se ajusta à largura e altura (em tiles) que o mapa pede, e a
   porta cai sempre no tile da `colunaPorta` — é por ela que se entra, e o
   mapa conta com isso. Chaminé, cúpula, copa e totem passam do alto da
   construção: o desenho tem SOBRA pixels a mais em cima, e o mapa o sobe
   esse tanto (`deslocY` negativo).

   Puro (só Buf). Teste em predios.test.ts.
   ========================================================================= */
import { Buf } from '../core/buf.ts';
import { P, type Tipo } from './palette.ts';
import { texto, larguraTexto } from './font.ts';
import { TS, colunaPorta } from './tiles.ts';

export const SOBRA = 24;

type C3 = { l: string; m: string; d: string };
const INK = P.ink!;

/* ------------------------------------------------------------ peças */

function duasAguas(b: Buf, x: number, w: number, y0: number, alt: number, c: C3, incl = 0.55): void {
  for (let y = 0; y < alt; y++) {
    const i = Math.floor((alt - y) * incl);
    b.rect(x + i, y0 + y, w - i * 2, 1, y < 3 ? c.l : c.m);
    b.set(x + i, y0 + y, c.d); b.set(x + w - i - 1, y0 + y, c.d);
  }
  b.rect(x, y0 + alt - 3, w, 3, c.d); b.rect(x, y0 + alt - 3, w, 1, c.l);
}

function palha(b: Buf, x: number, w: number, y0: number, alt: number, c: C3, redondo = false): void {
  for (let y = 0; y < alt; y++) {
    const t = y / alt;
    const i = redondo ? Math.floor((w / 2) * (1 - Math.sqrt(1 - (1 - t) * (1 - t)))) : Math.floor((alt - y) * 0.6);
    b.rect(x + i, y0 + y, w - i * 2, 1, c.m);
    for (let k = x + i; k < x + w - i; k++) {
      if ((k * 7 + y * 3) % 5 === 0) b.set(k, y0 + y, c.d);
      else if ((k * 3 + y) % 7 === 0) b.set(k, y0 + y, c.l);
    }
  }
  for (let k = x - 1; k < x + w + 1; k++) { const f = Math.abs(k * 5) % 3; b.rect(k, y0 + alt - 1, 1, 1 + f, f === 0 ? c.d : c.m); }
}

function paredeCal(b: Buf, x: number, y: number, w: number, h: number, base: string, sombra: string): void {
  b.rect(x, y, w, h, base); b.rect(x, y, 2, h, sombra); b.rect(x + w - 2, y, 2, h, sombra);
}

function pedras(b: Buf, x: number, y: number, w: number, h: number, c: C3, rejunte: string): void {
  b.rect(x, y, w, h, rejunte);
  for (let j = 0, yy = y; yy < y + h; j++, yy += 5) {
    for (let xx = x - (j % 2 ? 3 : 0); xx < x + w; xx += 7) {
      const x0 = Math.max(x, xx + 1), x1 = Math.min(x + w, xx + 7), y1 = Math.min(y + h, yy + 4);
      if (x1 <= x0 || y1 <= yy + 1) continue;
      b.rect(x0, yy + 1, x1 - x0, y1 - yy - 1, ((xx * 13 + j * 7) % 3) === 0 ? c.d : c.m);
      b.rect(x0, yy + 1, x1 - x0, 1, c.l);
    }
  }
}

function tabuas(b: Buf, x: number, y: number, w: number, h: number, c: C3): void {
  b.rect(x, y, w, h, c.m);
  for (let xx = x + 3; xx < x + w; xx += 4) { b.rect(xx, y, 1, h, c.d); b.set(xx - 2, y + ((xx * 5) % Math.max(1, h)), c.l); }
}

function taipa(b: Buf, x: number, y: number, w: number, h: number): void {
  b.rect(x, y, w, h, '#b07a4a');
  for (let k = 0; k < (w * h) / 9; k++) b.set(x + ((k * 37) % w), y + ((k * 53) % h), k % 3 ? '#c8905a' : '#8e5e36');
  for (let xx = x + 5; xx < x + w - 2; xx += 9) b.rect(xx, y, 1, h, '#7a4e2c');
  b.rect(x, y, w, 1, '#6d4726');
}

type Cores = { d: string; m: string; l: string };
const MADEIRA: Cores = { d: P.doorD!, m: P.door!, l: '#9a6236' };

function porta(b: Buf, x: number, base: number, w: number, h: number, c: Cores, arco = false, macaneta = P.gold!): void {
  const y = base - h;
  b.rect(x, y, w, h, c.d); b.rect(x + 1, y + 1, w - 2, h - 1, c.m); b.rect(x + 1, y + 1, w - 2, 2, c.l);
  if (arco) {
    const r = Math.floor(w / 2);
    b.ellipse(x + r - 0.5, y, r, r * 0.7, c.d); b.ellipse(x + r - 0.5, y + 1, r - 1, r * 0.7 - 1, c.m);
  }
  b.rect(x + Math.floor(w / 2), y + 2, 1, h - 2, c.d);
  b.set(x + w - 4, y + Math.floor(h / 2) + 1, macaneta);
}

type TipoJanela = 'cruz' | 'veneziana' | 'redonda' | 'arco' | 'luz';
function janela(b: Buf, x: number, y: number, w: number, h: number, vidro: string, moldura: string,
                tipo: TipoJanela = 'cruz', brilho = '#b8e6fb'): void {
  if (tipo === 'redonda') {
    b.circle(x + w / 2 - 0.5, y + h / 2 - 0.5, w / 2, moldura);
    b.circle(x + w / 2 - 0.5, y + h / 2 - 0.5, w / 2 - 1.5, vidro);
    b.set(x + 2, y + 2, brilho); b.rect(x + w / 2 - 1, y + 1, 1, h - 2, moldura);
    return;
  }
  const a = tipo === 'arco' ? 2 : 0;
  if (a) { b.ellipse(x + w / 2 - 0.5, y + 2, w / 2, 3, moldura); b.ellipse(x + w / 2 - 0.5, y + 2, w / 2 - 1, 2, vidro); }
  b.rect(x, y + a, w, h - a, moldura);
  b.rect(x + 1, y + 1 + (a ? 1 : 0), w - 2, h - 2 - (a ? 1 : 0), vidro);
  if (tipo === 'veneziana') { for (let yy = y + 2; yy < y + h - 1; yy += 2) b.rect(x + 1, yy, w - 2, 1, moldura); return; }
  if (tipo === 'luz') { b.rect(x + 1, y + 1, w - 2, 2, brilho); b.rect(x + Math.floor(w / 2), y, 1, h, moldura); return; }
  b.rect(x + 1, y + 1, w - 2, 2, brilho);
  b.rect(x + Math.floor(w / 2) - 1, y, 2, h, moldura);
  b.rect(x, y + Math.floor(h / 2) - 1, w, 2, moldura);
}

function placa(b: Buf, txt: string, cx: number, y: number, fundo: string): void {
  const sw = larguraTexto(txt) + 8, sx = Math.floor(cx - sw / 2);
  b.rect(sx, y, sw, 13, INK); b.rect(sx + 1, y + 1, sw - 2, 11, fundo); b.rect(sx + 1, y + 1, sw - 2, 2, '#ffffff');
  texto(b, txt, sx + 4, y + 3, INK);
}

/* copa de bolotas, empurrada pelo vento */
function copa(b: Buf, cx: number, cy: number, rx: number, ry: number, c: C3, vento = 3): void {
  const bolas: [number, number, number][] = [];
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    bolas.push([cx + Math.cos(a) * rx * 0.62 + vento, cy + Math.sin(a) * ry * 0.55, Math.min(rx, ry) * 0.5]);
  }
  bolas.push([cx + vento, cy, Math.min(rx, ry) * 0.7]);
  for (const [x, y, r] of bolas) b.circle(x, y + 1, r + 1, c.d);
  for (const [x, y, r] of bolas) b.circle(x, y, r, c.m);
  for (const [x, y, r] of bolas) { b.circle(x - r * 0.35, y - r * 0.45, r * 0.22, c.l); b.set(Math.round(x + r * 0.2), Math.round(y - r * 0.6), c.l); }
  for (let k = 0; k < 20; k++) b.set(Math.round(cx - rx + ((k * 37) % (rx * 2))), Math.round(cy - ry * 0.6 + ((k * 23) % (ry * 1.2))), c.d);
}

function tronco(b: Buf, cx: number, topo: number, base: number, meiaBase: number, meiaTopo: number): void {
  for (let y = topo; y < base; y++) {
    const t = (y - topo) / (base - topo), meia = Math.round(meiaTopo + (meiaBase - meiaTopo) * t * t);
    b.rect(cx - meia, y, meia * 2, 1, '#7a5230'); b.set(cx - meia, y, '#523418'); b.set(cx + meia - 1, y, '#523418');
    if (y % 5 === 0) b.rect(cx - meia + 2 + (y % 3), y, 3, 1, '#5e3c1e');
  }
}

function raizesAereas(b: Buf, x0: number, x1: number, topo: number, base: number, vento = 3): void {
  for (let x = x0; x <= x1; x += 3) {
    const comp = base - topo - ((x * 7) % 5);
    for (let k = 0; k < comp; k++) {
      const t = k / comp;
      b.set(Math.round(x + Math.sin(t * Math.PI) * vento * t), topo + k, (x + k) % 9 === 0 ? '#946a40' : '#6e4a2a');
    }
  }
}

function lanterna(b: Buf, x: number, y: number): void {
  b.rect(x, y - 4, 1, 4, '#523418'); b.rect(x - 2, y, 5, 5, '#523418'); b.rect(x - 1, y + 1, 3, 3, '#ffcf70');
}

function folhas(b: Buf, pts: readonly [number, number][]): void {
  pts.forEach(([x, y], i) => { b.rect(x, y, 2, 1, i % 2 ? '#5aa44a' : '#3f8a3a'); b.set(x + 2, y - 1, '#3f8a3a'); });
}

function ocaXingu(b: Buf, cx: number, base: number, meiaL: number, alt: number): void {
  for (let yy = 0; yy < alt; yy++) {
    const t = yy / alt, meia = Math.round(meiaL * Math.sqrt(1 - (1 - t) * (1 - t) * 0.92));
    const y = base - alt + yy;
    b.rect(cx - meia, y, meia * 2, 1, '#b89858');
    for (let xx = cx - meia; xx < cx + meia; xx++) {
      if ((xx * 5 + yy * 3) % 7 === 0) b.set(xx, y, '#8a6e38');
      else if ((xx + yy * 5) % 11 === 0) b.set(xx, y, '#d8bc78');
    }
    b.set(cx - meia, y, '#6a5428'); b.set(cx + meia - 1, y, '#6a5428');
  }
  for (let y = base - alt + 8; y < base - 2; y += 7) {
    const t = (y - base + alt) / alt, meia = Math.round(meiaL * Math.sqrt(1 - (1 - t) * (1 - t) * 0.92));
    b.rect(cx - meia + 1, y, meia * 2 - 2, 1, '#6a5428');
  }
}

function portaDeArco(b: Buf, x: number, base: number, w: number, h: number): void {
  b.ellipse(x + w / 2 - 0.5, base - h + w / 2, w / 2 + 1, w / 2 + 1, '#2a1810');
  b.rect(x - 1, base - h + w / 2, w + 2, h - w / 2, '#2a1810');
  b.rect(x + 1, base - 2, w - 2, 2, '#4a2c1a');
}

/* ------------------------------------------------------------ medidas */

/* tudo que um desenho precisa saber da construção */
interface Molde {
  b: Buf;
  W: number; H: number;
  y: number;     // topo da construção no desenho (abaixo da sobra)
  base: number;  // o chão
  cx: number;    // meio
  porta: number; // x do começo do tile da porta
}

function molde(wT: number, hT: number, portaCol?: number): Molde {
  const W = wT * TS, H = hT * TS;
  return { b: new Buf(W, H + SOBRA), W, H, y: SOBRA, base: SOBRA + H, cx: Math.floor(W / 2),
           porta: colunaPorta(wT, portaCol) * TS };
}

/* ------------------------------------------------------------ casas */

function casaAgua(m: Molde): void {
  const { b, W, H, y, base } = m, tel = Math.round(H * 0.44), pc = m.porta + 2;
  paredeCal(b, 3, y + tel - 3, W - 6, H - tel + 3, '#f6f2ea', '#d8d0c0');
  b.rect(3, base - 7, W - 6, 7, P.water!); b.rect(3, base - 7, W - 6, 1, P.waterL!);
  duasAguas(b, 0, W, y, tel, { l: '#e89a6a', m: '#d0733f', d: '#9c4e28' });
  porta(b, pc, base, 12, 18, { d: '#1f4f8a', m: P.water!, l: P.waterL! });
  janela(b, 8, y + tel + 3, 11, 10, P.win!, P.water!, 'veneziana');
  janela(b, W - 17, y + tel + 3, 10, 9, P.win!, P.water!);
  // rede de pesca pendurada e um remo
  if (pc > 30) {
    for (let k = 0; k < 7; k++) b.line(pc - 14 + k, y + tel, pc - 12 + k * 1.2, y + tel + 16, '#8a7a5a');
    for (let yy = y + tel + 2; yy < y + tel + 16; yy += 3) b.line(pc - 14, yy, pc - 4, yy, '#8a7a5a');
  }
  b.rect(W - 5, y + tel + 1, 2, H - tel - 2, '#8a6a3f'); b.ellipse(W - 4, base - 3, 2, 4, '#a07a48');
}

function casaPlanta(m: Molde): void {
  const { b, W, H, y, base } = m, tel = Math.round(H * 0.46), pc = m.porta + 2;
  taipa(b, 4, y + tel - 2, W - 8, H - tel + 2);
  palha(b, -1, W + 2, y + 2, tel, { l: '#e8c870', m: '#c8a048', d: '#8a6a28' });
  porta(b, pc, base, 12, 18, MADEIRA);
  janela(b, 9, y + tel + 5, 10, 8, '#3c5a30', '#6d4726', 'veneziana');
  janela(b, W - 18, y + tel + 5, 10, 8, '#3c5a30', '#6d4726', 'veneziana');
  for (let yy = y + tel - 4; yy < base; yy++) {
    b.set(3 + Math.round(Math.sin(yy / 3) * 1.5), yy, P.tree!);
    if (yy % 4 === 0) b.set(5 + Math.round(Math.sin(yy / 3)), yy, P.grassL!);
  }
  b.rect(pc - 10, base - 5, 6, 5, '#a0522d'); b.circle(pc - 7, base - 7, 3, P.grass!); b.set(pc - 7, base - 9, '#e8583a');
}

function casaFogo(m: Molde): void {
  const { b, W, H, y, base } = m, tel = Math.round(H * 0.44), pc = m.porta + 2;
  pedras(b, 3, y + tel - 3, W - 6, H - tel + 3, { l: '#b8aca0', m: '#9a8f86', d: '#7d736c' }, '#5a524c');
  const ch = W - 18;
  b.rect(ch, y - 4, 8, 18, '#6d635c'); b.rect(ch, y - 4, 8, 2, '#9a8f86');
  b.circle(ch + 6, y - 9, 3, '#c8c0b8'); b.circle(ch + 9, y - 14, 4, '#d8d2cc'); b.circle(ch + 6, y - 19, 3, '#e8e4e0');
  duasAguas(b, 0, W, y, tel, { l: '#6a6478', m: '#4e485a', d: '#34303e' });
  porta(b, pc, base, 12, 18, { d: '#3a2418', m: '#5a3a24', l: '#7a5234' }, true);
  janela(b, 8, y + tel + 4, 10, 9, '#ffb040', '#3a2418', 'luz', '#ffe080');
  janela(b, W - 17, y + tel + 4, 10, 9, '#ffb040', '#3a2418', 'luz', '#ffe080');
}

function casaVento(m: Molde): void {
  // a cabaninha escondida atrás da cortina de raízes da gameleira
  const { b, W, H, y, base, cx } = m, pc = m.porta + 2, topoCasa = y + Math.round(H * 0.45);
  copa(b, cx, y, cx, 16, { l: '#8ad070', m: '#3f7f38', d: '#1f4c22' }, 3);
  tronco(b, cx, y + 6, topoCasa, 6, 5);
  tabuas(b, 14, topoCasa, W - 28, base - topoCasa, { l: '#c89868', m: '#a87848', d: '#7a5230' });
  porta(b, pc, base, 12, 18, MADEIRA);
  raizesAereas(b, 4, pc - 8, y + 10, base);
  raizesAereas(b, pc + 20, W - 4, y + 10, base);
  lanterna(b, 20, topoCasa + 4); lanterna(b, W - 14, topoCasa + 2);
  folhas(b, [[2, y + 4], [W - 6, y - 2], [W - 2, y + 12]]);
}

function casaRaio(m: Molde): void {
  const { b, W, H, base, cx } = m, pc = m.porta + 2;
  ocaXingu(b, cx, base, cx - 2, Math.min(H + SOBRA - 4, Math.round(H * 0.92)));
  b.ellipse(pc + 6, base - 10, 7, 10, '#2a1810'); b.rect(pc - 1, base - 10, 14, 10, '#2a1810');
  b.rect(pc + 1, base - 2, 10, 2, '#4a2c1a');
  void W;
}

function casaTerra(m: Molde): void {
  // adobe de terra vermelha, com as vigas saindo da parede
  const { b, W, H, y, base } = m, pc = m.porta + 2, topo = y + Math.round(H * 0.25);
  b.rect(4, topo, W - 8, base - topo, '#c86a40');
  b.rect(4, topo, 3, base - topo, '#a85a34'); b.rect(W - 7, topo, 3, base - topo, '#a85a34');
  for (let k = 0; k < 50; k++) b.set(6 + ((k * 23) % (W - 12)), topo + 2 + ((k * 13) % (base - topo - 4)), k % 2 ? '#d88050' : '#a85a34');
  b.rect(2, topo - 2, W - 4, 4, '#a85a34'); b.rect(2, topo - 2, W - 4, 1, '#e09060');
  for (let xx = 8; xx < W - 6; xx += 9) { b.rect(xx, topo, 4, 3, '#6d4726'); b.rect(xx, topo, 4, 1, '#946a40'); }
  b.rect(10, topo - 10, 14, 8, '#c86a40'); b.rect(10, topo - 10, 14, 2, '#e09060');
  porta(b, pc, base, 12, 18, { d: '#3a2418', m: '#5a3a24', l: '#7a5234' });
  janela(b, 10, topo + 12, 9, 9, '#3a2a20', '#6d4726', 'veneziana');
  janela(b, W - 18, topo + 12, 9, 9, '#3a2a20', '#6d4726', 'veneziana');
  b.ellipse(W - 12, base - 3, 3, 3, '#a85a34'); b.ellipse(8, base - 3, 3, 3, '#a85a34');
}

function casaSombra(m: Molde): void {
  const { b, W, y, base } = m, pc = m.porta + 2;
  b.rect(8, y + 6, W - 14, base - y - 6, '#5a4a6a');
  b.rect(8, y + 6, 3, base - y - 6, '#3a2d4a'); b.rect(W - 9, y + 6, 3, base - y - 6, '#3a2d4a');
  for (let k = 0; k < 30; k++) b.set(10 + ((k * 17) % (W - 20)), y + 8 + ((k * 11) % (base - y - 10)), '#4a3a5a');
  duasAguas(b, 4, W - 6, y - 12, 20, { l: '#4a3a5a', m: '#2e2440', d: '#1a1428' }, 0.9);
  b.rect(12, y - 16, 6, 12, '#2e2440'); b.rect(13, y - 18, 5, 2, '#3a2d4a');
  janela(b, 16, y + 12, 10, 12, '#f0d070', '#1a1428', 'arco', '#fff3c4');
  const jx = W - 24;
  janela(b, jx, y + 13, 10, 11, '#2a2238', '#1a1428', 'veneziana');
  b.line(jx - 1, y + 12, jx - 4, y + 24, '#3a2d4a'); b.line(jx, y + 12, jx - 3, y + 24, '#1a1428');
  porta(b, pc, base, 12, 18, { d: '#1a1428', m: '#3a2d4a', l: '#5a4a6a' }, true, P.silverD!);
  b.rect(2, base - 30, 2, 30, '#1a1428'); b.rect(0, base - 34, 6, 5, '#1a1428'); b.rect(1, base - 33, 4, 3, '#f0d070');
}

function casaLuz(m: Molde): void {
  const { b, W, y, base } = m, pc = m.porta + 2;
  paredeCal(b, 3, y + 12, W - 6, base - y - 12, '#fffaf0', '#e8dcc0');
  b.rect(1, y + 8, W - 2, 5, P.gold!); b.rect(1, y + 8, W - 2, 1, P.light!); b.rect(1, y + 12, W - 2, 1, P.goldD!);
  const dx = W - 16;
  b.ellipse(dx, y + 6, 9, 9, P.lightD!); b.ellipse(dx - 2, y + 3, 4, 4, P.light!); b.rect(dx - 9, y + 6, 19, 3, '#fffaf0');
  b.rect(dx - 1, y - 6, 2, 4, P.goldD!);
  porta(b, pc, base, 12, 20, { d: P.goldD!, m: P.gold!, l: P.light! }, true, '#ffffff');
  janela(b, 8, y + 22, 10, 13, P.win!, P.lightD!, 'arco');
  janela(b, W - 17, y + 22, 10, 13, P.win!, P.lightD!, 'arco');
  const sx = pc + 6;
  b.circle(sx, y + 18, 3, P.gold!);
  for (const [ox, oy] of [[5, 0], [-5, 0], [0, -5], [4, -4], [-4, -4]] as const) b.set(sx + ox, y + 18 + oy, P.gold!);
}

/* ------------------------------------------------------------ terreiros */

function terreiroAgua(m: Molde): void {
  const { b, W, H, y, base, cx } = m, pt = m.porta + 1, tel = Math.round(H * 0.35);
  paredeCal(b, 4, y + tel + 2, W - 8, H - tel - 2, '#f6f2ea', '#d8d0c0');
  for (let yy = base - 16; yy < base; yy += 4) {
    for (let xx = 4; xx < W - 4; xx += 4) {
      b.rect(xx, yy, 4, 4, '#ffffff');
      b.set(xx + 1, yy + 1, P.waterD!); b.set(xx + 2, yy + 2, P.waterD!);
      b.set(xx + 1, yy + 2, P.waterL!); b.set(xx + 2, yy + 1, P.waterL!);
    }
  }
  duasAguas(b, 0, W, y + 6, tel, { l: P.waterL!, m: P.water!, d: P.waterD! }, 0.9);
  for (let xx = 18; xx < W - 18; xx += 6) { b.ellipse(xx + 3, y + 7, 3, 2, P.foam!); b.ellipse(xx + 4, y + 8, 2, 1, P.waterL!); }
  b.tri(cx, y - 12, cx - 5, y, cx + 5, y, P.waterL!); b.circle(cx, y + 1, 5, P.water!); b.circle(cx - 2, y, 1.5, P.foam!);
  b.ellipse(cx, y + 20, 9, 6, '#f0c0a8');
  for (let k = -3; k <= 3; k++) b.line(cx, y + 25, cx + k * 3, y + 15, '#d08a70');
  b.rect(cx - 4, y + 25, 9, 2, '#d08a70');
  janela(b, 14, y + tel + 8, 14, 14, P.win!, P.waterD!, 'redonda');
  janela(b, W - 28, y + tel + 8, 14, 14, P.win!, P.waterD!, 'redonda');
  porta(b, pt, base, 14, 26, { d: '#1f4f8a', m: P.water!, l: P.waterL! }, true);
  placa(b, 'TERREIRO', cx, y + tel + 2, '#d3ebff');
}

function terreiroPlanta(m: Molde): void {
  const { b, W, H, y, base, cx } = m, pt = m.porta + 1, par = Math.round(H * 0.42);
  for (let xx = 6; xx < W - 6; xx += 6) {
    b.rect(xx, y + par, 6, H - par, '#7a5230'); b.rect(xx, y + par, 1, H - par, '#5a3a1e'); b.rect(xx + 4, y + par, 1, H - par, '#946a40');
  }
  for (const [x0, s] of [[8, 1], [Math.round(W * 0.27), -1], [Math.round(W * 0.7), 1], [W - 12, -1]] as const) {
    b.line(x0, base - 10, x0 + s * 8, base, '#5a3a1e'); b.line(x0 + 1, base - 10, x0 + s * 8 + 1, base, '#6d4726');
  }
  palha(b, -2, W + 4, y - 6, par + 8, { l: '#d8c060', m: '#a8903a', d: '#6a5a20' }, true);
  b.ellipse(cx, y + 10, 7, 11, '#3f8a3a'); b.ellipse(cx, y + 10, 5, 9, '#5aa44a'); b.line(cx, y + 1, cx, y + 21, '#2a5e28');
  for (const xx of [Math.round(W * 0.14), Math.round(W * 0.3), Math.round(W * 0.7), Math.round(W * 0.86)]) {
    for (let yy = y + par + 2; yy < y + par + 10 + ((xx * 7) % 12); yy++) { b.set(xx + (yy % 2), yy, P.tree!); if (yy % 5 === 0) b.set(xx + 1, yy, P.grassL!); }
  }
  janela(b, 14, base - Math.round(H * 0.34), 12, 10, '#2a3a20', '#5a3a1e', 'veneziana');
  janela(b, W - 26, base - Math.round(H * 0.34), 12, 10, '#2a3a20', '#5a3a1e', 'veneziana');
  b.rect(pt, base - 26, 14, 26, '#2a1e14');
  for (let xx = pt + 1; xx < pt + 14; xx += 2) b.rect(xx, base - 26, 1, 18 + (xx % 3) * 3, xx % 4 ? '#3f8a3a' : '#5aa44a');
  placa(b, 'TERREIRO', cx, y + par, '#b8e0a0');
}

function terreiroFogo(m: Molde): void {
  const { b, W, H, y, base, cx } = m, pt = m.porta + 1, par = Math.round(H * 0.33);
  pedras(b, 4, y + par, W - 8, H - par, { l: '#5a5058', m: '#443c44', d: '#342e36' }, '#221c24');
  for (let k = 0; k < 16; k++) b.set(8 + ((k * 29) % (W - 16)), y + par + 4 + ((k * 17) % (H - par - 8)), k % 2 ? P.fire! : P.fireL!);
  for (const chx of [14, W - 24]) {
    b.rect(chx, y - 8, 10, 30, '#342e36'); b.rect(chx, y - 8, 10, 2, '#5a5058');
    b.tri(chx + 1, y - 8, chx + 5, y - 20, chx + 9, y - 8, P.fire!); b.tri(chx + 3, y - 8, chx + 5, y - 15, chx + 7, y - 8, P.fireL!);
  }
  duasAguas(b, 0, W, y + 2, par + 2, { l: '#c24a2a', m: '#8a2a1a', d: '#5a180e' }, 0.9);
  for (let xx = 20; xx < W - 20; xx += 9) b.line(xx, y + 16, xx + 4, y + par, '#ff8a3a');
  b.tri(cx - 6, y + 24, cx, y + 10, cx + 6, y + 24, P.fire!); b.tri(cx - 3, y + 24, cx, y + 15, cx + 3, y + 24, P.fireL!);
  janela(b, 16, y + par + 14, 14, 14, '#ff8a2a', '#221c24', 'arco', '#ffe080');
  janela(b, W - 30, y + par + 14, 14, 14, '#ff8a2a', '#221c24', 'arco', '#ffe080');
  porta(b, pt, base, 14, 26, { d: '#221c24', m: P.fireD!, l: P.fire! }, true, P.fireL!);
  b.rect(pt + 3, base - 12, 8, 12, P.fireL!); b.rect(pt + 5, base - 16, 4, 16, '#ffe080');
  placa(b, 'TERREIRO', cx, y + par + 8, '#ffb080');
}

function terreiroVento(m: Molde): void {
  // a gameleira: salão de madeira dentro da cortina de raízes aéreas
  const { b, W, H, y, base, cx } = m, pt = m.porta + 1, sala = y + Math.round(H * 0.37);
  copa(b, cx, y - 4, cx + 2, 24, { l: '#8ad070', m: '#3f7f38', d: '#1f4c22' }, 4);
  tronco(b, cx, y + 8, sala, 12, 9);
  for (const [x1, y1] of [[4, y + 14], [W - 4, y + 12]] as const) { b.line(cx, y + 20, x1, y1, '#523418'); b.line(cx, y + 21, x1, y1 + 1, '#7a5230'); }
  tabuas(b, 18, sala, W - 36, base - sala, { l: '#c89868', m: '#a87848', d: '#7a5230' });
  duasAguas(b, 14, W - 28, sala - 8, 10, { l: '#c8a048', m: '#a8803a', d: '#6a5020' }, 0.8);
  raizesAereas(b, 2, 30, y + 14, base, 4);
  raizesAereas(b, W - 30, W - 2, y + 12, base, 4);
  for (const colx of [36, W - 40]) { b.rect(colx, sala, 4, base - sala, '#6e4a2a'); b.rect(colx, sala, 1, base - sala, '#946a40'); }
  janela(b, 24, sala + 12, 10, 10, '#ffcf70', '#523418', 'luz', '#fff0b0');
  janela(b, W - 34, sala + 12, 10, 10, '#ffcf70', '#523418', 'luz', '#fff0b0');
  lanterna(b, cx - 12, sala + 4); lanterna(b, cx + 12, sala + 4);
  porta(b, pt, base, 14, 24, MADEIRA, true);
  placa(b, 'TERREIRO', cx, sala + 8, '#e8f0c8');
  folhas(b, [[20, y - 14], [W - 16, y - 12], [W - 8, y - 2], [6, y - 4]]);
}

function terreiroRaio(m: Molde): void {
  // a oca grande e, ao lado, o totem da ave do trovão
  const { b, W, H, base, cx } = m, pt = m.porta + 1;
  ocaXingu(b, cx + 4, base, cx - 6, Math.min(H + SOBRA - 6, Math.round(H * 0.93)));
  const tt = Math.round(H * 0.78);
  b.rect(4, base - tt, 12, tt, '#7a4a2a'); b.rect(4, base - tt, 2, tt, '#5a3418');
  const faces: [number, string][] = [[base - tt + 8, '#c2493f'], [base - tt + 24, P.water!], [base - tt + 40, P.bolt!]];
  for (const [yy, c] of faces) { b.rect(5, yy, 10, 10, c); b.rect(7, yy + 3, 2, 2, INK); b.rect(11, yy + 3, 2, 2, INK); b.rect(8, yy + 7, 4, 1, INK); }
  const ay = base - tt;
  b.tri(10, ay - 4, -4, ay - 12, 4, ay + 2, '#2e3a5a'); b.tri(10, ay - 4, 24, ay - 12, 16, ay + 2, '#2e3a5a');
  b.tri(10, ay - 10, 6, ay - 2, 14, ay - 2, '#f4f0e8');
  b.set(10, ay - 7, P.bolt!); b.set(9, ay - 5, P.bolt!); b.set(11, ay - 4, P.bolt!);
  portaDeArco(b, pt, base, 14, 26);
  placa(b, 'TERREIRO', cx + 8, base - 40, '#f4e0a0');
  void W;
}

function terreiroTerra(m: Molde): void {
  // templo esculpido no penhasco de rocha vermelha
  const { b, W, H, y, base, cx } = m, pt = m.porta + 1;
  b.rect(0, y - 4, W, H + 4, '#b05a38');
  for (let yy = y - 4; yy < base; yy += 5) b.rect(0, yy, W, 1, '#9a4a2c');
  for (let k = 0; k < 70; k++) b.rect((k * 37) % (W - 4), y - 2 + ((k * 19) % H), 3 + (k % 3), 1, k % 2 ? '#c87050' : '#8a4028');
  for (let xx = 0; xx < W; xx++) {
    const topo = y - 4 + Math.round(Math.abs(Math.sin(xx / 9)) * 10 + Math.sin(xx / 3.3) * 2 + (xx < 12 || xx > W - 12 ? 12 : 0));
    for (let yy = y - 6; yy < topo; yy++) b.apagar(xx, yy);
    b.set(xx, topo, '#e09060'); b.set(xx, topo + 1, '#c87050');
  }
  const f0 = 18, f1 = W - 18, par = y + Math.round(H * 0.25);
  b.rect(f0, par, f1 - f0, base - par, '#c87a58'); b.rect(f0, par, f1 - f0, 2, '#e8a080');
  b.tri(f0 - 4, par, cx, par - 18, f1 + 4, par, '#c87a58'); b.tri(f0 + 2, par - 1, cx, par - 15, f1 - 2, par - 1, '#d88c68');
  for (const colx of [f0 + 4, f0 + 18, f1 - 24, f1 - 10]) {
    b.rect(colx, par + 4, 7, base - par - 4, '#e0a080'); b.rect(colx, par + 4, 1, base - par - 4, '#b06848');
    b.rect(colx + 5, par + 4, 2, base - par - 4, '#c88060');
    b.rect(colx - 1, par + 2, 9, 3, '#b06848'); b.rect(colx - 1, base - 5, 9, 3, '#b06848');
  }
  const cristal = (x: number, yy: number, c: string, r = 3) => { b.tri(x - r, yy + 5, x, yy - 5, x + r, yy + 5, c); b.set(x - 1, yy - 1, '#ffffff'); };
  cristal(cx, par - 7, '#5ad0e0');
  const ny = par + 16;
  b.rect(cx - 9, ny, 18, 14, '#6a3020');
  cristal(cx - 5, ny + 8, '#e05a8a', 2); cristal(cx, ny + 6, '#5ad0e0', 2); cristal(cx + 5, ny + 8, '#f2c43d', 2);
  b.rect(pt - 2, base - 26, 18, 26, '#3a1810'); b.rect(pt - 2, base - 26, 18, 2, '#8a4028');
  porta(b, pt, base, 14, 22, { d: '#2a1008', m: '#4a2414', l: '#6a3420' });
  placa(b, 'TERREIRO', cx, par + 2, '#f4d8c0');
}

function terreiroSombra(m: Molde): void {
  const { b, W, H, y, base, cx } = m, pt = m.porta + 1, par = y + Math.round(H * 0.33);
  b.rect(6, par, W - 12, base - par, '#4a3a5a'); b.rect(6, par, 3, base - par, '#2e2440'); b.rect(W - 9, par, 3, base - par, '#2e2440');
  b.rect(cx - 14, y - 6, 28, par - y + 8, '#4a3a5a'); b.rect(cx - 14, y - 6, 2, par - y + 8, '#2e2440');
  b.tri(cx - 18, y - 6, cx, y - 22, cx + 18, y - 6, '#2e2440'); b.tri(cx - 14, y - 6, cx, y - 19, cx + 14, y - 6, '#3a2d4a');
  b.circle(cx, y + 6, 6, P.light!); b.circle(cx + 3, y + 4, 5, '#4a3a5a');
  const telha = { l: '#4a3a5a', m: '#2e2440', d: '#1a1428' };
  duasAguas(b, 0, cx - 12, par - 16, 18, telha, 0.8);
  duasAguas(b, cx + 12, W - cx - 12, par - 16, 18, telha, 0.8);
  for (const wx of [12, W - 21]) {
    b.tri(wx, par + 14, wx + 4, par + 7, wx + 8, par + 14, '#1a1428'); b.rect(wx, par + 14, 9, 14, '#1a1428');
    b.rect(wx + 1, par + 14, 7, 13, '#a070e0'); b.tri(wx + 1, par + 14, wx + 4, par + 9, wx + 7, par + 14, '#a070e0');
    b.rect(wx + 4, par + 9, 1, 18, '#1a1428');
  }
  for (const corvo of [22, W - 24]) { b.rect(corvo, par - 6, 4, 3, INK); b.set(corvo + 4, par - 6, P.uiAcc!); b.rect(corvo - 2, par - 5, 2, 1, INK); }
  porta(b, pt, base, 14, 26, { d: '#1a1428', m: '#2e2440', l: '#4a3a5a' }, true, P.silverD!);
  placa(b, 'TERREIRO', cx, par + 10, '#c8b0e8');
}

function terreiroLuz(m: Molde): void {
  const { b, W, H, y, base, cx } = m, pt = m.porta + 1, par = y + Math.round(H * 0.33);
  b.rect(4, base - 4, W - 8, 4, '#e8dcc0'); b.rect(8, base - 8, W - 16, 4, '#f4ecd8'); b.rect(4, base - 4, W - 8, 1, '#ffffff');
  paredeCal(b, 10, par, W - 20, base - par - 8, '#fffaf0', '#e8dcc0');
  for (const colx of [14, 30, W - 36, W - 20]) {
    b.rect(colx, par + 2, 7, base - par - 10, P.wallL!); b.rect(colx, par + 2, 1, base - par - 10, '#d8c8a8');
    b.rect(colx + 5, par + 2, 2, base - par - 10, '#e8dcc0');
    b.rect(colx - 1, par, 9, 3, P.lightD!); b.rect(colx - 1, base - 11, 9, 3, P.lightD!);
  }
  b.ellipse(cx, y + 2, 16, 14, P.lightD!); b.ellipse(cx - 4, y - 4, 6, 5, P.light!);
  b.rect(cx - 1, y - 18, 2, 8, P.goldD!); b.circle(cx, y - 19, 2, P.light!);
  b.tri(4, par, cx, y + 4, W - 4, par, P.gold!); b.tri(10, par - 1, cx, y + 7, W - 10, par - 1, P.light!);
  b.circle(cx, y + 18, 6, P.gold!);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    b.line(cx + Math.cos(a) * 7, y + 18 + Math.sin(a) * 7, cx + Math.cos(a) * 10, y + 18 + Math.sin(a) * 10, '#e3a020');
  }
  janela(b, cx - 18, par + 18, 9, 14, P.win!, P.lightD!, 'arco');
  janela(b, cx + 10, par + 18, 9, 14, P.win!, P.lightD!, 'arco');
  porta(b, pt, base - 8, 14, 22, { d: P.goldD!, m: P.gold!, l: P.light! }, true, '#ffffff');
  placa(b, 'TERREIRO', cx, par + 3, P.light!);
}

/* ------------------------------------------------------------ entrada */

const CASAS: Record<Tipo, (m: Molde) => void> = {
  agua: casaAgua, planta: casaPlanta, fogo: casaFogo, vento: casaVento,
  raio: casaRaio, terra: casaTerra, sombra: casaSombra, luz: casaLuz,
};
const TERREIROS: Record<Tipo, (m: Molde) => void> = {
  agua: terreiroAgua, planta: terreiroPlanta, fogo: terreiroFogo, vento: terreiroVento,
  raio: terreiroRaio, terra: terreiroTerra, sombra: terreiroSombra, luz: terreiroLuz,
};

/* o desenho tem SOBRA pixels a mais em cima: quem desenha sobe ele esse tanto */
export function casaDaRegiao(tipo: Tipo, wT: number, hT: number, portaCol?: number): Buf {
  const m = molde(wT, hT, portaCol);
  CASAS[tipo](m);
  return m.b;
}

export function terreiroDaRegiao(tipo: Tipo, wT: number, hT: number, portaCol?: number): Buf {
  const m = molde(wT, hT, portaCol);
  TERREIROS[tipo](m);
  return m.b;
}
