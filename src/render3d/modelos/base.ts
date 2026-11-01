/* =========================================================================
   As ferramentas dos modelos low-poly: cada peça é uma geometria simples do
   three.js, pintada com uma cor por vértice, movida para o lugar e fundida
   com as outras numa geometria só (uma chamada de desenho por modelo).

   Puro three.js, sem DOM: os testes montam os modelos no node.
   ========================================================================= */
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface Peca {
  geo: THREE.BufferGeometry;
}

/* uma peça: a geometria sem índice e sem uv, com a cor em todo vértice,
   já girada e posta no lugar */
export function peca(geo: THREE.BufferGeometry, cor: string,
                     x = 0, y = 0, z = 0,
                     giro: { x?: number; y?: number; z?: number } = {},
                     escala?: [number, number, number]): THREE.BufferGeometry {
  let g = geo.index ? geo.toNonIndexed() : geo;
  if (g !== geo) geo.dispose();
  if (g.getAttribute('uv')) g.deleteAttribute('uv');
  if (g.getAttribute('normal')) g.deleteAttribute('normal');
  const n = g.getAttribute('position').count;
  const c = new THREE.Color(cor);
  const cores = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { cores[i * 3] = c.r; cores[i * 3 + 1] = c.g; cores[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  const m = new THREE.Matrix4();
  const e = new THREE.Euler(giro.x ?? 0, giro.y ?? 0, giro.z ?? 0);
  m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(e),
            new THREE.Vector3(...(escala ?? [1, 1, 1])));
  g.applyMatrix4(m);
  return g;
}

/* funde as peças numa geometria só, com normais por face (low-poly) */
export function juntar(pecas: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(pecas, false);
  for (const p of pecas) p.dispose();
  if (!g) throw new Error('modelo sem peças compatíveis');
  g.computeVertexNormals();
  return g;
}

/* funde as peças com normais LISAS dentro de cada peça (a pedra sai
   redonda em vez de facetada) */
export function juntarLiso(pecas: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const lisas = pecas.map((p) => {
    const m = mergeVertices(p);
    p.dispose();
    m.computeVertexNormals();
    return m;
  });
  const g = mergeGeometries(lisas, false);
  for (const p of lisas) p.dispose();
  if (!g) throw new Error('modelo sem peças compatíveis');
  return g;
}

/* ----------------------------------------------- o jeito de desenho animado

   O material dos Encantados que ainda não foram esculpidos em 3D (o
   desenho 2D virado sólido): cor chapada, com a luz em três degraus. */

let degraus: THREE.DataTexture | null = null;

/* a rampa da luz: sombra, meia-luz, luz */
export function degrausDeLuz(): THREE.DataTexture {
  if (degraus) return degraus;
  degraus = new THREE.DataTexture(new Uint8Array([150, 210, 255]), 3, 1, THREE.RedFormat);
  degraus.minFilter = degraus.magFilter = THREE.NearestFilter;
  degraus.generateMipmaps = false;
  degraus.needsUpdate = true;
  return degraus;
}

export function materialDesenho(op: THREE.MeshToonMaterialParameters = {}): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: degrausDeLuz(), ...op });
}

/* ------------------------------------------------------ o jeito realista

   O material do mundo: cor por vértice, luz física (MeshStandardMaterial,
   áspero e sem metal), e um GRÃO feito no próprio shader a partir da
   posição no mundo — duas escalas de ruído, uma fina (a textura da terra,
   da casca, do reboco) e uma larga (manchas de grama mais clara e mais
   escura). Sem imagem nenhuma e sem mapear peça por peça: a arte continua
   toda feita por código. */

/* o ruído em GLSL (também usado pela água e pela onda na areia) */
export const RUIDO_FUNCOES = `
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float ruido3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm3(vec3 p) { return 0.55 * ruido3(p) + 0.3 * ruido3(p * 2.03) + 0.15 * ruido3(p * 4.11); }
`;
const RUIDO_GLSL = 'varying vec3 vPosMundo;\n' + RUIDO_FUNCOES;

/* põe o grão num material de cor por vértice. `grao` é a força do fino,
   `manchas` a das manchas largas. Encadeia com quem já mexia no shader. */
export function comGrao<M extends THREE.Material>(mat: M, grao = 0.22, manchas = 0.12): M {
  const antes = mat.onBeforeCompile;
  const chaveAntes = mat.customProgramCacheKey.bind(mat);
  mat.onBeforeCompile = (s, r) => {
    antes.call(mat, s, r);
    s.vertexShader = 'varying vec3 vPosMundo;\n' + s.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      vec4 pmGrao = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        pmGrao = instanceMatrix * pmGrao;
      #endif
      vPosMundo = (modelMatrix * pmGrao).xyz;`);
    s.fragmentShader = RUIDO_GLSL + s.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float fino = fbm3(vPosMundo * 9.0);
      float largo = fbm3(vPosMundo * 0.45);
      diffuseColor.rgb *= (1.0 - ${grao.toFixed(3)} + ${(grao * 2).toFixed(3)} * fino) * (1.0 - ${manchas.toFixed(3)} + ${(manchas * 2).toFixed(3)} * largo);`);
  };
  mat.customProgramCacheKey = () => `${chaveAntes()}|grao${grao}|${manchas}`;
  return mat;
}

/* o material de tudo que tem cor por vértice no mundo realista */
export function materialReal(op: THREE.MeshStandardMaterialParameters = {}, grao = 0.22, manchas = 0.12): THREE.MeshStandardMaterial {
  return comGrao(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, ...op }), grao, manchas);
}

/* ------------------------------------------------- o jeito realista

   Folhagem de verdade não é bola: é um monte de tufos irregulares, escuros
   por dentro e por baixo, mais claros onde o sol bate. A normal de cada
   vértice puxa para fora do centro da copa (e não da bolinha), então a luz
   cai na copa inteira como num volume só, sem cara de cacho de uva. */

/* ruído de valor 3D, estável, para entortar os tufos */
function ruido(x: number, y: number, z: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const h = (a: number, b: number, c: number) => sorte(a + c * 57.3, b - c * 13.1, 5);
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return l(
    l(l(h(ix, iy, iz), h(ix + 1, iy, iz), u), l(h(ix, iy + 1, iz), h(ix + 1, iy + 1, iz), u), v),
    l(l(h(ix, iy, iz + 1), h(ix + 1, iy, iz + 1), u), l(h(ix, iy + 1, iz + 1), h(ix + 1, iy + 1, iz + 1), u), v),
    w);
}

/* uma peça de normais lisas, já sem índice (para fundir com `fundir`) */
export function lisa(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const m = mergeVertices(geo);
  geo.dispose();
  m.computeVertexNormals();
  const g = m.toNonIndexed();
  m.dispose();
  return g;
}

/* funde peças que já têm normal e cor (sem recalcular nada) */
export function fundir(pecas: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(pecas, false);
  for (const p of pecas) p.dispose();
  if (!g) throw new Error('modelo sem peças compatíveis');
  return g;
}

export interface OpcoesFolhagem {
  tufos?: number;        // quantos tufos na copa
  achatar?: number;      // < 1 deixa a copa mais larga que alta
  sol?: string;          // a cor das pontas de cima, onde bate sol
  sombra?: string;       // a cor de dentro e de baixo
  semente?: number;
  detalhe?: number;      // a subdivisão de cada tufo (0 na qualidade LEVE)
}

/* a copa: tufos entortados pelo ruído, cor do miolo escuro à ponta clara */
export function folhagem(cx: number, cy: number, cz: number, r: number, cor: string,
                         op: OpcoesFolhagem = {}): THREE.BufferGeometry {
  const n = op.tufos ?? 8, ach = op.achatar ?? 0.8, sd = op.semente ?? 1;
  const base = new THREE.Color(cor);
  const sol = new THREE.Color(op.sol ?? cor).lerp(new THREE.Color('#fff6c8'), op.sol ? 0 : 0.25);
  const escuro = new THREE.Color(op.sombra ?? cor).multiplyScalar(op.sombra ? 1 : 0.4);
  const centro = new THREE.Vector3(cx, cy, cz);
  const pecas: THREE.BufferGeometry[] = [];
  for (let k = 0; k < n; k++) {
    // o primeiro tufo é o miolo; os outros se espalham na casca da copa
    const a = sorte(sd, k, 1) * Math.PI * 2, e = (sorte(sd, k, 2) - 0.35) * 1.6;
    const d = k === 0 ? 0 : r * (0.45 + sorte(sd, k, 3) * 0.2);
    const rr = r * (k === 0 ? 0.62 : 0.36 + sorte(sd, k, 4) * 0.18);
    const px = cx + Math.cos(a) * Math.cos(e) * d;
    const py = cy + Math.sin(e) * d * ach;
    const pz = cz + Math.sin(a) * Math.cos(e) * d;
    const g = mergeVertices(new THREE.IcosahedronGeometry(rr, op.detalhe ?? 1));
    if (g.getAttribute('uv')) g.deleteAttribute('uv');
    const pos = g.getAttribute('position');
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t = ruido(v.x * 7 + sd * 3.1 + k, v.y * 7, v.z * 7) * 0.5 + ruido(v.x * 15, v.y * 15 + k, v.z * 15) * 0.25;
      v.multiplyScalar(1 + (t - 0.35) * 0.55);
      v.y *= ach;
      pos.setXYZ(i, v.x + px, v.y + py, v.z + pz);
    }
    const nI = pos.count;
    const cores = new Float32Array(nI * 3);
    const nor = new Float32Array(nI * 3);
    const c = new THREE.Color(), w = new THREE.Vector3();
    for (let i = 0; i < nI; i++) {
      w.fromBufferAttribute(pos, i).sub(centro);
      const dist = Math.min(1, w.length() / (r * 1.05));
      const alto = THREE.MathUtils.clamp((w.y / (r * ach) + 1) / 2, 0, 1);
      // fora e no alto: luz; dentro e embaixo: sombra (oclusão de mentira)
      const luz = THREE.MathUtils.clamp(dist * 0.6 + alto * 0.5 - 0.15, 0, 1);
      c.copy(escuro).lerp(base, Math.min(1, luz * 1.6)).lerp(sol, Math.max(0, luz - 0.62) * 1.8);
      const j = 0.88 + sorte(i, k + sd, 9) * 0.24;
      cores[i * 3] = c.r * j; cores[i * 3 + 1] = c.g * j; cores[i * 3 + 2] = c.b * (0.9 + 0.1 * j);
      w.normalize();
      nor[i * 3] = w.x; nor[i * 3 + 1] = w.y; nor[i * 3 + 2] = w.z;
    }
    g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
    // a normal: metade da copa inteira, metade do tufo
    g.computeVertexNormals();
    const gn = g.getAttribute('normal');
    for (let i = 0; i < nI; i++) {
      w.set(nor[i * 3]! * 0.65 + gn.getX(i) * 0.35, nor[i * 3 + 1]! * 0.65 + gn.getY(i) * 0.35, nor[i * 3 + 2]! * 0.65 + gn.getZ(i) * 0.35).normalize();
      gn.setXYZ(i, w.x, w.y, w.z);
    }
    const solta = g.toNonIndexed();
    g.dispose();
    pecas.push(solta);
  }
  return fundir(pecas);
}

/* tronco ou galho de casca escura em baixo, com veio de ruído na cor */
export function galho(rTopo: number, rBase: number, h: number, cor: string,
                      x: number, y: number, z: number, giro: { x?: number; y?: number; z?: number } = {}): THREE.BufferGeometry {
  const g = peca(new THREE.CylinderGeometry(rTopo, rBase, h, 8, 3), cor, x, y, z, giro);
  const pos = g.getAttribute('position'), col = g.getAttribute('color');
  const base = new THREE.Color(cor);
  for (let i = 0; i < pos.count; i++) {
    const t = 0.75 + ruido(pos.getX(i) * 20, pos.getY(i) * 3, pos.getZ(i) * 20) * 0.45;
    col.setXYZ(i, base.r * t, base.g * t, base.b * t);
  }
  return lisa(g);
}

/* um tufo de capim: folhas finas e tortas, de pé no chão (y = 0). A cor por
   vértice é só luz (escuro no pé, claro na ponta): o verde vem da cor da
   instância, que é a do chão do tile. A normal aponta para cima, como no
   chão, para o capim não brilhar diferente da grama em volta. */
export function tufoDeCapim(folhas = 7): THREE.BufferGeometry {
  const pos: number[] = [], cor: number[] = [], nor: number[] = [];
  for (let k = 0; k < folhas; k++) {
    const a = sorte(k, 3, 80) * Math.PI * 2, d = sorte(k, 4, 81) * 0.12;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    const h = 0.14 + sorte(k, 5, 82) * 0.16, larg = 0.028;
    const giro = sorte(k, 6, 83) * Math.PI;
    const ox = Math.cos(giro) * larg, oz = Math.sin(giro) * larg;
    const tomba = (sorte(k, 7, 84) - 0.5) * 0.16;
    const px = x + Math.cos(a) * tomba, pz = z + Math.sin(a) * tomba;
    // as duas faces, cada uma com a normal para cima (com DoubleSide a de
    // trás viraria a normal para baixo e sairia preta)
    pos.push(x - ox, 0, z - oz, x + ox, 0, z + oz, px, h, pz);
    pos.push(x + ox, 0, z + oz, x - ox, 0, z - oz, px, h, pz);
    const pe = 0.6, ponta = 1.35 + sorte(k, 8, 85) * 0.2;
    for (let f = 0; f < 2; f++) {
      cor.push(pe, pe, pe, pe, pe, pe, ponta, ponta, ponta * 0.9);
      nor.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}

/* atalhos das formas que mais aparecem */
export const caixa = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const cilindro = (rTopo: number, rBase: number, h: number, lados = 6) =>
  new THREE.CylinderGeometry(rTopo, rBase, h, lados);
export const cone = (r: number, h: number, lados = 6) => new THREE.ConeGeometry(r, h, lados);
export const bola = (r: number, det = 0) => new THREE.IcosahedronGeometry(r, det);
export const pedra = (r: number) => new THREE.DodecahedronGeometry(r, 0);

/* prisma de telhado de duas águas, de cumeeira paralela ao eixo x */
export function prismaTelhado(w: number, d: number, alto: number, beiral = 0.3): THREE.BufferGeometry {
  const f = new THREE.Shape();
  f.moveTo(-d / 2 - beiral, 0); f.lineTo(0, alto); f.lineTo(d / 2 + beiral, 0); f.lineTo(-d / 2 - beiral, 0);
  const g = new THREE.ExtrudeGeometry(f, { depth: w + beiral * 2, bevelEnabled: false });
  g.rotateY(Math.PI / 2);
  g.translate(-(w + beiral * 2) / 2, 0, 0);
  return g;
}

/* ruído estável por posição, o mesmo da vista */
export function sorte(x: number, y: number, k = 0): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
