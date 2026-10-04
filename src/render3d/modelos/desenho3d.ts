/* =========================================================================
   O Encantado 3D sai do PRÓPRIO desenho 2D, peça por peça.

   Cada desenho de art/creatures.ts é feito de primitivas — elipse,
   triângulo, retângulo, linha e pixel solto — numa ordem: o que vem depois
   fica na frente. Aqui a função de desenho roda de novo com o Buf
   "grampeado" (`gravar`), e cada primitiva vira um sólido low-poly:

   - elipse → elipsoide (fundo proporcional ao menor raio);
   - triângulo → prisma; retângulo → caixa; linha → bastão;
   - pixels soltos da mesma cor, um atrás do outro → caixinhas fundidas.

   A ordem do desenho vira profundidade: cada peça encosta a frente um fio
   adiante da frente do que já estava ali (`frenteEm`). O corpo fica no
   meio, a barriga e o rosto ficam por cima dele, o olho por cima do rosto.
   As cores são as mesmas do desenho, então o 3D é o bicho do Caderno.

   O que o desenho não diz (o bicho desenhado de lado, a grossura, o que é
   asa ou cauda) vem de `AJUSTES`, uma linha por espécie.

   Puro three.js, sem DOM: os testes montam todos no node.
   ========================================================================= */
import * as THREE from 'three';
import { Buf } from '../../core/buf.ts';
import { corRara, giroDe, variante } from '../../art/raro.ts';
import { peca, juntar } from './base.ts';

/* ------------------------------------------------------------ gravação */

export type Op =
  | { k: 'e'; cx: number; cy: number; rx: number; ry: number; c: string }
  | { k: 't'; p: [number, number, number, number, number, number]; c: string }
  | { k: 'r'; x: number; y: number; w: number; h: number; c: string }
  | { k: 'l'; x0: number; y0: number; x1: number; y1: number; c: string }
  | { k: 'p'; x: number; y: number; c: string };

export interface Gravacao { ops: Op[]; buf: Buf }

/* Roda a função de desenho anotando as primitivas chamadas por ELA (as que
   uma primitiva chama por dentro — a elipse pinta com set — não contam). */
export function gravar(desenhar: () => Buf): Gravacao {
  const proto = Buf.prototype as unknown as Record<string, (...a: unknown[]) => unknown>;
  const nomes = ['ellipse', 'tri', 'rect', 'line', 'set', 'frame', 'outline'] as const;
  const originais = Object.fromEntries(nomes.map((n) => [n, proto[n]!]));
  const ops: Op[] = [];
  let dentro = 0;
  const anotar = (n: string, a: unknown[]) => {
    const v = a as number[];
    const c = a[a.length - 1] as string;
    if (typeof c !== 'string') return;
    if (n === 'ellipse') ops.push({ k: 'e', cx: v[0]!, cy: v[1]!, rx: v[2]!, ry: v[3]!, c });
    else if (n === 'tri') ops.push({ k: 't', p: [v[0]!, v[1]!, v[2]!, v[3]!, v[4]!, v[5]!], c });
    else if (n === 'rect') ops.push({ k: 'r', x: v[0]!, y: v[1]!, w: v[2]!, h: v[3]!, c });
    else if (n === 'line') ops.push({ k: 'l', x0: v[0]!, y0: v[1]!, x1: v[2]!, y1: v[3]!, c });
    else if (n === 'set') ops.push({ k: 'p', x: v[0]! | 0, y: v[1]! | 0, c });
    else if (n === 'frame') {
      const [x, y, w, h] = v as [number, number, number, number];
      ops.push({ k: 'r', x, y, w, h: 1, c }, { k: 'r', x, y: y + h - 1, w, h: 1, c },
               { k: 'r', x, y, w: 1, h, c }, { k: 'r', x: x + w - 1, y, w: 1, h, c });
    }
  };
  for (const n of nomes) {
    proto[n] = function (this: Buf, ...a: unknown[]) {
      if (dentro === 0 && n !== 'outline') anotar(n, a);
      dentro++;
      try { return originais[n]!.apply(this, a); } finally { dentro--; }
    };
  }
  try {
    const buf = desenhar();
    return { ops, buf };
  } finally {
    for (const n of nomes) proto[n] = originais[n]!;
  }
}

/* pixels soltos seguidos da mesma cor viram retângulos (colunas fundidas) */
export function fundirPixels(ops: readonly Op[]): Op[] {
  const saida: Op[] = [];
  let i = 0;
  while (i < ops.length) {
    const o = ops[i]!;
    if (o.k !== 'p') { saida.push(o); i++; continue; }
    const pts = new Set<string>();
    let j = i;
    while (j < ops.length && ops[j]!.k === 'p' && ops[j]!.c === o.c) {
      const p = ops[j] as Extract<Op, { k: 'p' }>;
      pts.add(`${p.x},${p.y}`);
      j++;
    }
    // colunas verticais, depois junta colunas vizinhas de mesma altura
    const lista = [...pts].map((s) => s.split(',').map(Number) as [number, number])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const colunas: { x: number; y: number; h: number }[] = [];
    for (const [x, y] of lista) {
      const u = colunas[colunas.length - 1];
      if (u && u.x === x && u.y + u.h === y) u.h++;
      else colunas.push({ x, y, h: 1 });
    }
    const rets: { x: number; y: number; w: number; h: number }[] = [];
    for (const c of colunas) {
      const r = rets.find((q) => q.y === c.y && q.h === c.h && q.x + q.w === c.x);
      if (r) r.w++;
      else rets.push({ x: c.x, y: c.y, w: 1, h: c.h });
    }
    for (const r of rets) saida.push({ k: 'r', ...r, c: o.c });
    i = j;
  }
  return saida;
}

/* --------------------------------------------------------------- ajustes */

export interface Ajuste {
  /* desenhado de lado: a cabeça aponta para +1 (direita) ou −1 (esquerda);
     o modelo gira para olhar para a frente e os detalhes viram dos dois lados */
  perfil?: 1 | -1;
  /* multiplica o fundo de toda peça (1 = redondo como uma bola) */
  fundo?: number;
  /* flutua (espírito, ave, peixe): sobe e desce parado */
  flutua?: boolean;
  /* peças (pelo índice na gravação) que somem — sujeira 2D sem sentido em 3D */
  sem?: readonly number[];
  /* peças que vão para trás do corpo (cauda, cajado, orelha de trás...) */
  atras?: readonly number[];
  /* peças com fundo próprio, em pixels */
  fundoDe?: Readonly<Record<number, number>>;
  /* partes que mexem: nome → índices das peças (com pivô no meio delas) */
  partes?: Readonly<Partial<Record<ParteMovel, readonly number[]>>>;
  /* sem contorno escuro (bicho de luz, que é só brilho) */
  semContorno?: boolean;
  /* peças que existem em par, uma de cada lado (pernas de quem está de
     perfil): ficam a `parZ` pixels do meio, para cada lado */
  pares?: readonly number[];
  parZ?: number;
  /* peças repetidas nas costas (cabelo, casco, asa): o espelho em z */
  costas?: readonly number[];
  /* peças que o desenho de frente não mostra (o cabelo atrás da cabeça),
     em pixels do desenho; com `atras`, ficam atrás do que está ali */
  extras?: readonly (Op & { atras?: boolean })[];
}

export type ParteMovel = 'asaE' | 'asaD' | 'cauda' | 'cabeca' | 'bracoE' | 'bracoD';

/* --------------------------------------------------------------- sólidos */

interface Solido {
  i: number;                 // índice na gravação
  geo: () => THREE.BufferGeometry;      // em pixels: x para a direita, y para baixo
  contorno: (() => THREE.BufferGeometry) | null;
  c: string;
  cx: number; cy: number;    // centro, em pixels
  d: number;                 // meio fundo (z), em pixels
  z: number;                 // centro em z
  frente: (x: number, y: number) => number;  // z da frente nesse ponto, ou −∞
  /* para o perfil: peça que encosta na frente de outra vira dos dois lados */
  detalhe: boolean;
}

const SEM = -Infinity;
const FOLGA = 0.35;

function dentroTri(p: number[], x: number, y: number): boolean {
  const [x0, y0, x1, y1, x2, y2] = p as [number, number, number, number, number, number];
  const a = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
  if (a === 0) return false;
  const w0 = ((x1 - x0) * (y - y0) - (x - x0) * (y1 - y0)) / a;
  const w1 = ((x2 - x1) * (y - y1) - (x - x1) * (y2 - y1)) / a;
  const w2 = ((x0 - x2) * (y - y2) - (x - x2) * (y0 - y2)) / a;
  return w0 >= -0.05 && w1 >= -0.05 && w2 >= -0.05;
}

/* o triângulo inflado: os três cantos no plano e uma ponta para a frente
   e outra para trás, no meio — seis faces, cada uma virada para fora */
function bipiramide(pts: [number, number][], fundo: number): THREE.BufferGeometry {
  const v = pts.map(([x, y]) => new THREE.Vector3(x, y, 0));
  const pos: number[] = [];
  for (const ponta of [new THREE.Vector3(0, 0, fundo), new THREE.Vector3(0, 0, -fundo)]) {
    for (let k = 0; k < 3; k++) {
      let a = v[k]!, b = v[(k + 1) % 3]!;
      const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(ponta, a));
      const meio = new THREE.Vector3().add(a).add(b).add(ponta).divideScalar(3);
      if (n.dot(meio) < 0) [a, b] = [b, a];
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z, ponta.x, ponta.y, ponta.z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

/* A peça como sólido em pixels, ainda sem z. `fundoMult` vem do ajuste. */
function solidoDe(o: Op, i: number, fundoMult: number, fundoFixo: number | undefined): Omit<Solido, 'z' | 'frente' | 'detalhe'> & { forma: (z: number) => Solido['frente'] } {
  const F = (d: number) => fundoFixo ?? d * fundoMult;
  switch (o.k) {
    case 'e': {
      const rx = o.rx + 0.5, ry = o.ry + 0.5, cx = o.cx + 0.5, cy = o.cy + 0.5;
      const d = F((Math.min(rx, ry) + 0.4 * Math.abs(rx - ry)) * 0.9 + 0.3);
      const seg = Math.max(rx, ry) > 4 ? [12, 8] : [8, 6];
      return {
        i, c: o.c, cx, cy, d,
        geo: () => peca(new THREE.SphereGeometry(1, seg[0], seg[1]), o.c, 0, 0, 0, {}, [rx, ry, d]),
        contorno: Math.min(rx, ry) >= 1.5
          ? () => peca(new THREE.SphereGeometry(1, seg[0], seg[1]), '#000000', 0, 0, 0, {}, [rx + 1, ry + 1, d + 1])
          : null,
        forma: (z) => (x, y) => {
          const u = (x - cx) / rx, v = (y - cy) / ry, q = 1 - u * u - v * v;
          return q < 0 ? SEM : z + d * Math.sqrt(q);
        },
      };
    }
    case 'r': {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      const d = F(Math.min(o.w, o.h) * 0.8 + 0.6) / 2;
      return {
        i, c: o.c, cx, cy, d,
        geo: () => peca(new THREE.BoxGeometry(o.w, o.h, d * 2), o.c),
        contorno: Math.min(o.w, o.h) >= 2 ? () => peca(new THREE.BoxGeometry(o.w + 2, o.h + 2, d * 2 + 2), '#000000') : null,
        forma: (z) => (x, y) => (x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h ? z + d : SEM),
      };
    }
    case 't': {
      const p = o.p.map((v) => v + 0.5);
      const cx = (p[0]! + p[2]! + p[4]!) / 3, cy = (p[1]! + p[3]! + p[5]!) / 3;
      const pts: [number, number][] = [[p[0]! - cx, p[1]! - cy], [p[2]! - cx, p[3]! - cy], [p[4]! - cx, p[5]! - cy]];
      // o raio do círculo de dentro: o quanto o triângulo é "cheio"
      const lados = [0, 1, 2].map((k) => Math.hypot(pts[k]![0] - pts[(k + 1) % 3]![0], pts[k]![1] - pts[(k + 1) % 3]![1]));
      const area = Math.abs((pts[1]![0] - pts[0]![0]) * (pts[2]![1] - pts[0]![1]) - (pts[2]![0] - pts[0]![0]) * (pts[1]![1] - pts[0]![1])) / 2;
      const r = (2 * area) / (lados[0]! + lados[1]! + lados[2]! || 1);
      // inflado: grosso no meio, fino na borda (chama, orelha, chifre, asa)
      const d = F(r * 1.5 + 0.7);
      const maior = (f: number) => pts.map(([x, y]) => [x * f, y * f] as [number, number]);
      return {
        i, c: o.c, cx, cy, d,
        geo: () => peca(bipiramide(pts, d), o.c),
        contorno: r >= 0.8 ? () => peca(bipiramide(maior(1 + 1 / Math.max(r, 0.8)), d + 1), '#000000') : null,
        forma: (z) => (x, y) => {
          if (!dentroTri(p, x, y)) return SEM;
          // a frente cai da ponta do meio até a borda
          const borda = Math.max(0, 1 - Math.hypot(x - cx, y - cy) / (Math.max(...lados) * 0.6));
          return z + d * borda;
        },
      };
    }
    case 'l': {
      const x0 = o.x0 + 0.5, y0 = o.y0 + 0.5, x1 = o.x1 + 0.5, y1 = o.y1 + 0.5;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const len = Math.hypot(x1 - x0, y1 - y0) + 1;
      const ang = Math.atan2(y1 - y0, x1 - x0);
      const d = F(1.1) / 2;
      return {
        i, c: o.c, cx, cy, d,
        geo: () => peca(new THREE.BoxGeometry(len, 1, d * 2), o.c, 0, 0, 0, { z: ang }),
        contorno: null,
        forma: (z) => (x, y) => {
          // distância ao segmento
          const vx = x1 - x0, vy = y1 - y0, L2 = vx * vx + vy * vy || 1;
          const t = Math.max(0, Math.min(1, ((x - x0) * vx + (y - y0) * vy) / L2));
          return Math.hypot(x - (x0 + vx * t), y - (y0 + vy * t)) <= 0.7 ? z + d : SEM;
        },
      };
    }
    case 'p':
      throw new Error('pixel solto: passe por fundirPixels antes');
  }
}

/* ------------------------------------------------------------- montagem */

export interface Desenho3D {
  /* cada parte: as geometrias (cor e contorno) já em unidades do modelo */
  partes: Map<ParteMovel | 'corpo', { cor: THREE.BufferGeometry; contorno: THREE.BufferGeometry | null; pivo: THREE.Vector3 }>;
  altura: number;
  flutua: boolean;
}

/* a troca de cor do raro: a mesma de art/raro.ts, pixel a pixel do desenho */
function trocaRara(original: Buf, especie: string): (c: string) => string {
  const rara = variante(original, especie);
  const mapa = new Map<string, string>();
  for (let k = 0; k < original.d.length; k++) {
    const a = original.d[k], b = rara.d[k];
    if (a && b && !mapa.has(a)) mapa.set(a, b);
  }
  const giro = giroDe(especie);
  return (c) => mapa.get(c) ?? corRara(c, giro);
}

export function desenho3D(desenhar: () => Buf, especie: string, aj: Ajuste = {}, raro = false): Desenho3D {
  const { ops: brutos, buf } = gravar(desenhar);
  const ops = [...fundirPixels(brutos), ...(aj.extras ?? [])];
  const cor = raro ? trocaRara(buf, especie) : (c: string) => c;
  const sem = new Set(aj.sem ?? []);
  const atras = new Set(aj.atras ?? []);
  ops.forEach((o, i) => { if ('atras' in o && o.atras) atras.add(i); });
  const perfil = aj.perfil ?? 0;
  const pares = new Set(aj.pares ?? []);
  const costas = new Set(aj.costas ?? []);

  // empilha: cada peça encosta a frente logo adiante do que já está ali
  const feitos: Solido[] = [];
  ops.forEach((o, i) => {
    if (sem.has(i) || /^#[0-9a-f]{6}00$/i.test(o.c)) return;   // pedido para sumir, ou cor transparente
    const s = solidoDe(o, i, aj.fundo ?? 1, aj.fundoDe?.[i]);
    // a frente do que está embaixo: no centro e em quatro pontos em volta
    let baixo = SEM;
    const r = 1.2;
    for (const [dx, dy] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]] as const) {
      for (const f of feitos) baixo = Math.max(baixo, f.frente(s.cx + dx, s.cy + dy));
    }
    let z = baixo === SEM ? 0 : Math.max(-s.d * 0.2, baixo + FOLGA - s.d);
    if (atras.has(i)) z = -Math.max(0, z) - s.d * 0.6;
    feitos.push({ ...s, c: cor(s.c), z, frente: s.forma(z), detalhe: baixo !== SEM && z > 0.5 });
  });

  // unidades: o desenho de 32 px e o de 40 px ficam do mesmo tamanho (a
  // diferença de porte vem do tamanhoDe); o pé no chão, o meio em x = 0
  let baixoY = 0;
  for (let k = 0; k < buf.d.length; k++) if (buf.d[k]) baixoY = Math.max(baixoY, Math.floor(k / buf.w) + 1);
  let topoY = buf.h;
  for (let k = 0; k < buf.d.length; k++) if (buf.d[k]) { topoY = Math.floor(k / buf.w); break; }
  const U = 1 / (buf.h * 0.875);
  const meioX = buf.w / 2;

  const partes = new Map<ParteMovel | 'corpo', { cor: THREE.BufferGeometry[]; contorno: THREE.BufferGeometry[]; idx: Solido[] }>();
  const parteDe = new Map<number, ParteMovel>();
  for (const [nome, idx] of Object.entries(aj.partes ?? {}) as [ParteMovel, readonly number[]][]) {
    for (const i of idx) parteDe.set(i, nome);
  }
  const por = (nome: ParteMovel | 'corpo') => {
    let p = partes.get(nome);
    if (!p) { p = { cor: [], contorno: [], idx: [] }; partes.set(nome, p); }
    return p;
  };
  const colocar = (g: THREE.BufferGeometry, s: Solido, z: number) => {
    // pixels (y para baixo) → modelo (y para cima), e o perfil gira para a frente
    const m = new THREE.Matrix4().makeTranslation(s.cx - meioX, s.cy, z);
    g.applyMatrix4(m);
    g.applyMatrix4(new THREE.Matrix4().makeScale(U, -U, U));
    g.applyMatrix4(new THREE.Matrix4().makeTranslation(0, baixoY * U, 0));
    if (perfil) g.applyMatrix4(new THREE.Matrix4().makeRotationY(perfil > 0 ? -Math.PI / 2 : Math.PI / 2));
    // o y do desenho cresce para baixo: a troca para cima é um espelho, que
    // vira as faces do avesso — desvira
    return desvirar(g);
  };
  const espelhar = (g: THREE.BufferGeometry) => {
    // espelho em z (antes do giro do perfil): o outro lado do bicho
    g.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, -1));
    return desvirar(g);
  };
  for (const s of feitos) {
    const p = por(parteDe.get(s.i) ?? 'corpo');
    p.idx.push(s);
    const par = pares.has(s.i);
    const lados = (perfil && s.detalhe) || par || costas.has(s.i) ? [1, -1] : [1];
    for (const lado of lados) {
      const fazer = (g: THREE.BufferGeometry) => {
        let x = g;
        if (lado < 0) { x = espelhar(x); }
        return colocar(x, s, par ? (aj.parZ ?? 3) * lado : s.z * lado);
      };
      p.cor.push(fazer(recolorir(s.geo(), s.c)));
      if (s.contorno && !aj.semContorno && !s.detalhe) p.contorno.push(fazer(s.contorno()));
    }
  }

  // nada abaixo do chão (o contorno passa um tico do pé)
  let piso = Infinity;
  for (const p of partes.values()) for (const g of [...p.cor, ...p.contorno]) {
    g.computeBoundingBox();
    piso = Math.min(piso, g.boundingBox!.min.y);
  }
  if (piso < 0) for (const p of partes.values()) for (const g of [...p.cor, ...p.contorno]) g.translate(0, -piso, 0);

  const saida: Desenho3D['partes'] = new Map();
  for (const [nome, p] of partes) {
    if (!p.cor.length) continue;
    // o pivô da parte: o meio das peças dela (asa bate no ombro: o lado de dentro)
    const caixa = new THREE.Box3();
    for (const g of p.cor) { g.computeBoundingBox(); caixa.union(g.boundingBox!); }
    const pivo = caixa.getCenter(new THREE.Vector3());
    if (nome === 'asaE') pivo.x = caixa.max.x;
    if (nome === 'asaD') pivo.x = caixa.min.x;
    if (nome === 'cauda') pivo.copy(perfil ? new THREE.Vector3(pivo.x, pivo.y, caixa.max.z) : pivo);
    const mover = (g: THREE.BufferGeometry) => g.translate(-pivo.x, -pivo.y, -pivo.z);
    saida.set(nome, {
      cor: mover(juntar(p.cor)),
      contorno: p.contorno.length ? mover(juntar(p.contorno)) : null,
      pivo,
    });
  }
  return { partes: saida, altura: (baixoY - topoY) * U, flutua: aj.flutua ?? false };
}

/* troca a ordem dos vértices de cada triângulo (depois de um espelho) */
function desvirar(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const col = g.getAttribute('color') as THREE.BufferAttribute | undefined;
  for (let k = 0; k + 2 < pos.count; k += 3) {
    for (const a of col ? [pos, col] : [pos]) {
      for (let e = 0; e < a.itemSize; e++) {
        const t = a.getComponent(k + 1, e);
        a.setComponent(k + 1, e, a.getComponent(k + 2, e));
        a.setComponent(k + 2, e, t);
      }
    }
  }
  return g;
}

/* troca a cor de todos os vértices (a geometria veio de peca com a cor crua) */
function recolorir(g: THREE.BufferGeometry, cor: string): THREE.BufferGeometry {
  const a = g.getAttribute('color') as THREE.BufferAttribute;
  const c = new THREE.Color(cor);
  for (let k = 0; k < a.count; k++) a.setXYZ(k, c.r, c.g, c.b);
  return g;
}
