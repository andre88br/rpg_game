/* =========================================================================
   As ferramentas dos modelos low-poly: cada peça é uma geometria simples do
   three.js, pintada com uma cor por vértice, movida para o lugar e fundida
   com as outras numa geometria só (uma chamada de desenho por modelo).

   Puro three.js, sem DOM: os testes montam os modelos no node.
   ========================================================================= */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
