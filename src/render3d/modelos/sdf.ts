/* =========================================================================
   Escultura por campo de distância: o bicho é descrito como um monte de
   formas (bola, elipsoide, cápsula de dois raios, caixa redonda) que se
   FUNDEM com uma junta macia — como massinha alisada com o dedo. Do campo
   sai a superfície (surface nets), com a normal tirada do próprio campo,
   lisa em todo canto: ombro, cotovelo, dedo, queixo.

   Cada forma tem a sua cor e o seu material (pele, pano, ...); a cor do
   vértice é a da forma mais perto, e a malha sai com um grupo por material.
   Puro, sem DOM: roda no node.
   ========================================================================= */
import * as THREE from 'three';

export type V3 = readonly [number, number, number];

export interface Forma {
  tipo: 'bola' | 'elipsoide' | 'capsula' | 'caixa';
  a: V3;                 // o centro (ou a ponta de baixo da cápsula)
  b?: V3;                // a outra ponta da cápsula
  r: number;             // o raio (na cápsula, o da ponta `a`)
  r2?: number;           // o raio da ponta `b`
  raios?: V3;            // elipsoide e caixa: os semi-eixos
  giro?: V3;             // elipsoide e caixa: o giro (x, y, z)
  cor: string;
  mat?: number;          // índice do material (0 = o primeiro)
  junta?: number;        // quanto ela se funde com as anteriores (0 = nada)
  tira?: boolean;        // cava em vez de somar
  ruga?: { amp: number; freq: number };  // relevo de ruído (pano, casca)
}

/* ------------------------------------------------------------ distâncias */

function ruido(x: number, y: number, z: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const h = (a: number, b: number, c: number) => {
    const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return l(l(l(h(ix, iy, iz), h(ix + 1, iy, iz), u), l(h(ix, iy + 1, iz), h(ix + 1, iy + 1, iz), u), v),
           l(l(h(ix, iy, iz + 1), h(ix + 1, iy, iz + 1), u), l(h(ix, iy + 1, iz + 1), h(ix + 1, iy + 1, iz + 1), u), v), w) * 2 - 1;
}

interface Pronta extends Forma {
  inv?: THREE.Matrix3;   // o giro desfeito (para levar o ponto ao espaço da forma)
  min: V3; max: V3;      // a caixa que interessa
}

function preparar(f: Forma): Pronta {
  const p: Pronta = { ...f, min: [0, 0, 0], max: [0, 0, 0] };
  if (f.giro) {
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...f.giro));
    p.inv = new THREE.Matrix3().setFromMatrix4(m).transpose();
  }
  const folga = (f.junta ?? 0) + (f.ruga?.amp ?? 0) + 0.02;
  let lo: [number, number, number], hi: [number, number, number];
  if (f.tipo === 'capsula') {
    const b = f.b!, r = Math.max(f.r, f.r2 ?? f.r);
    lo = [Math.min(f.a[0], b[0]) - r, Math.min(f.a[1], b[1]) - r, Math.min(f.a[2], b[2]) - r];
    hi = [Math.max(f.a[0], b[0]) + r, Math.max(f.a[1], b[1]) + r, Math.max(f.a[2], b[2]) + r];
  } else {
    const e = f.raios ?? [f.r, f.r, f.r];
    const m = f.tipo === 'caixa' ? Math.hypot(...e) : Math.max(...e);
    lo = [f.a[0] - m, f.a[1] - m, f.a[2] - m];
    hi = [f.a[0] + m, f.a[1] + m, f.a[2] + m];
  }
  p.min = [lo[0] - folga, lo[1] - folga, lo[2] - folga];
  p.max = [hi[0] + folga, hi[1] + folga, hi[2] + folga];
  return p;
}

const _v = new THREE.Vector3();
function distancia(f: Pronta, x: number, y: number, z: number): number {
  let d: number;
  if (f.tipo === 'capsula') {
    // a cápsula de dois raios (round cone)
    const a = f.a, b = f.b!, r1 = f.r, r2 = f.r2 ?? f.r;
    const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
    const pax = x - a[0], pay = y - a[1], paz = z - a[2];
    const l2 = bax * bax + bay * bay + baz * baz;
    let h = (pax * bax + pay * bay + paz * baz) / l2;
    h = Math.min(1, Math.max(0, h));
    const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
    d = Math.sqrt(dx * dx + dy * dy + dz * dz) - (r1 + (r2 - r1) * h);
  } else {
    _v.set(x - f.a[0], y - f.a[1], z - f.a[2]);
    if (f.inv) _v.applyMatrix3(f.inv);
    if (f.tipo === 'bola') {
      d = _v.length() - f.r;
    } else if (f.tipo === 'elipsoide') {
      const [rx, ry, rz] = f.raios!;
      const k0 = Math.hypot(_v.x / rx, _v.y / ry, _v.z / rz);
      const k1 = Math.hypot(_v.x / (rx * rx), _v.y / (ry * ry), _v.z / (rz * rz));
      d = k1 > 0 ? (k0 * (k0 - 1)) / k1 : -Math.min(rx, ry, rz);
    } else {
      const [rx, ry, rz] = f.raios!;
      const qx = Math.abs(_v.x) - rx + f.r, qy = Math.abs(_v.y) - ry + f.r, qz = Math.abs(_v.z) - rz + f.r;
      d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - f.r;
    }
  }
  if (f.ruga) d += f.ruga.amp * ruido(x * f.ruga.freq, y * f.ruga.freq, z * f.ruga.freq);
  return d;
}

/* a junta macia (polinomial) */
function smin(a: number, b: number, k: number): number {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
function smax(a: number, b: number, k: number): number { return -smin(-a, -b, k); }

/* ---------------------------------------------------------------- a malha */

export function esculpir(formas: Forma[], passo = 0.012): THREE.BufferGeometry {
  const fs = formas.map(preparar);
  const campo = (x: number, y: number, z: number, perto?: { i: number }) => {
    let d = 1e9, melhor = 1e9;
    for (let i = 0; i < fs.length; i++) {
      const f = fs[i]!;
      if (x < f.min[0] || y < f.min[1] || z < f.min[2] || x > f.max[0] || y > f.max[1] || z > f.max[2]) continue;
      const di = distancia(f, x, y, z);
      if (f.tira) { d = smax(d, -di, f.junta ?? 0); continue; }
      d = smin(d, di, f.junta ?? 0);
      if (perto && di < melhor) { melhor = di; perto.i = i; }
    }
    return d;
  };
  // a grade cobre a caixa de todas as formas
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (const f of fs) if (!f.tira) for (let e = 0; e < 3; e++) { lo[e] = Math.min(lo[e]!, f.min[e]!); hi[e] = Math.max(hi[e]!, f.max[e]!); }
  const n = [0, 1, 2].map((e) => Math.ceil((hi[e]! - lo[e]!) / passo) + 2) as [number, number, number];
  const [nx, ny, nz] = n;
  // primeiro uma grade grossa (de 4 em 4); na fina, só se calcula de
  // verdade perto da superfície — longe dela, basta o valor da grossa
  const G = 4, gx = Math.ceil(nx / G) + 2, gy = Math.ceil(ny / G) + 2, gz = Math.ceil(nz / G) + 2;
  const grossa = new Float32Array(gx * gy * gz);
  for (let k = 0; k < gz; k++) for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
    grossa[i + gx * (j + gy * k)] = campo(lo[0]! + i * G * passo, lo[1]! + j * G * passo, lo[2]! + k * G * passo);
  }
  const faixa = G * passo * 1.8;
  const val = new Float32Array(nx * ny * nz);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const ci = Math.floor(i / G), cj = Math.floor(j / G), ck = Math.floor(k / G);
    const u = i / G - ci, w = j / G - cj, t = k / G - ck;
    const g0 = ci + gx * (cj + gy * ck);
    const l = (a: number, b: number, q: number) => a + (b - a) * q;
    const aprox = l(
      l(l(grossa[g0]!, grossa[g0 + 1]!, u), l(grossa[g0 + gx]!, grossa[g0 + gx + 1]!, u), w),
      l(l(grossa[g0 + gx * gy]!, grossa[g0 + gx * gy + 1]!, u), l(grossa[g0 + gx * gy + gx]!, grossa[g0 + gx * gy + gx + 1]!, u), w), t);
    val[i + nx * (j + ny * k)] = Math.abs(aprox) > faixa ? aprox : campo(lo[0]! + i * passo, lo[1]! + j * passo, lo[2]! + k * passo);
  }
  // surface nets: um vértice por célula que a superfície corta
  const idx = new Int32Array(nx * ny * nz).fill(-1);
  const pos: number[] = [];
  const cantos = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const arestas = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const quads: number[] = [];
  const v = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) {
      const [a, b, e] = cantos[c]!;
      v[c] = val[(i + a!) + nx * ((j + b!) + ny * (k + e!))]!;
      if (v[c]! < 0) mask |= 1 << c;
    }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (const [p, q] of arestas) {
      const vp = v[p!]!, vq = v[q!]!;
      if ((vp < 0) === (vq < 0)) continue;
      const t = vp / (vp - vq);
      const A = cantos[p!]!, B = cantos[q!]!;
      sx += A[0]! + (B[0]! - A[0]!) * t; sy += A[1]! + (B[1]! - A[1]!) * t; sz += A[2]! + (B[2]! - A[2]!) * t;
      cnt++;
    }
    idx[i + nx * (j + ny * k)] = pos.length / 3;
    pos.push(lo[0]! + (i + sx / cnt) * passo, lo[1]! + (j + sy / cnt) * passo, lo[2]! + (k + sz / cnt) * passo);
  }
  // as faces: para cada aresta da grade que a superfície corta, o quadrado
  // das quatro células em volta dela
  const at = (i: number, j: number, k: number) => idx[i + nx * (j + ny * k)]!;
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const d0 = val[i + nx * (j + ny * k)]!;
    const viz = [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as const;
    for (let e = 0; e < 3; e++) {
      const [a, b, c] = viz[e]!;
      if (i + a >= nx || j + b >= ny || k + c >= nz) continue;
      const d1 = val[(i + a) + nx * ((j + b) + ny * (k + c))]!;
      if ((d0 < 0) === (d1 < 0)) continue;
      // as quatro células que dividem esta aresta
      let q: number[];
      if (e === 0) q = [at(i, j, k), at(i, j - 1, k), at(i, j - 1, k - 1), at(i, j, k - 1)];
      else if (e === 1) q = [at(i, j, k), at(i, j, k - 1), at(i - 1, j, k - 1), at(i - 1, j, k)];
      else q = [at(i, j, k), at(i - 1, j, k), at(i - 1, j - 1, k), at(i, j - 1, k)];
      if (q.some((x) => x < 0)) continue;
      if (d0 > 0) q.reverse();
      quads.push(q[0]!, q[1]!, q[2]!, q[0]!, q[2]!, q[3]!);
    }
  }
  // normal pelo gradiente do campo, cor e material da forma mais perto
  const nv = pos.length / 3;
  const nor = new Float32Array(nv * 3), cor = new Float32Array(nv * 3), mats = new Int32Array(nv);
  const e = passo * 0.5, perto = { i: 0 }, c = new THREE.Color();
  const cores = fs.map((f) => new THREE.Color(f.cor));
  for (let t = 0; t < nv; t++) {
    const x = pos[t * 3]!, y = pos[t * 3 + 1]!, z = pos[t * 3 + 2]!;
    const gx = campo(x + e, y, z) - campo(x - e, y, z);
    const gy = campo(x, y + e, z) - campo(x, y - e, z);
    const gz = campo(x, y, z + e) - campo(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1;
    nor[t * 3] = gx / l; nor[t * 3 + 1] = gy / l; nor[t * 3 + 2] = gz / l;
    campo(x, y, z, perto);
    // a cor é a da forma mais perto, misturada de leve com as que estão
    // quase tão perto (a divisa sai macia, sem a serrilha da grade); longe
    // de divisa, a cor é exata
    const dMin = distancia(fs[perto.i]!, x, y, z);
    c.setRGB(0, 0, 0);
    let soma = 0;
    for (let i = 0; i < fs.length; i++) {
      const f = fs[i]!;
      if (f.tira || (f.mat ?? 0) !== (fs[perto.i]!.mat ?? 0)) continue;
      if (x < f.min[0] || y < f.min[1] || z < f.min[2] || x > f.max[0] || y > f.max[1] || z > f.max[2]) continue;
      const dd = distancia(f, x, y, z) - dMin;
      if (dd > passo * 1.5) continue;
      const w = 1 - dd / (passo * 1.5);
      c.r += cores[i]!.r * w; c.g += cores[i]!.g * w; c.b += cores[i]!.b * w; soma += w;
    }
    if (soma > 0) c.multiplyScalar(1 / soma); else c.copy(cores[perto.i]!);
    cor[t * 3] = c.r; cor[t * 3 + 1] = c.g; cor[t * 3 + 2] = c.b;
    mats[t] = fs[perto.i]!.mat ?? 0;
  }
  // os triângulos em ordem de material, um grupo para cada
  const tris: number[][] = [];
  for (let t = 0; t < quads.length; t += 3) {
    const a = quads[t]!, b = quads[t + 1]!, d = quads[t + 2]!;
    const m = mats[a] === mats[b] || mats[a] === mats[d] ? mats[a]! : mats[b]!;
    (tris[m] ??= []).push(a, b, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  const todos: number[] = [];
  tris.forEach((lista, m) => {
    if (!lista?.length) return;
    g.addGroup(todos.length, lista.length, m);
    for (const x of lista) todos.push(x);
  });
  g.setIndex(todos);
  return g;
}
