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

/* funde as peças com normais LISAS dentro de cada peça: a copa de árvore
   e a moita saem redondas e fofas, como de desenho animado, em vez de
   facetadas */
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

   Os bichos e a gente têm contorno escuro e cor chapada; o mundo em volta
   segue o mesmo jeito. A luz cai em três degraus (sem degradê), e cada
   modelo ganha uma CASCA: a mesma forma, inflada um fio para fora e pintada
   só por dentro (BackSide) da cor do contorno — o contorno grosso do
   desenho, visto de qualquer lado. */

export const COR_CONTORNO = '#191221';

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

/* o material de tudo que tem cor por vértice no mundo */
export function materialDesenho(op: THREE.MeshToonMaterialParameters = {}): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: degrausDeLuz(), ...op });
}

/* o material da casca: só a cor do contorno, só por dentro */
export function materialContorno(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color: COR_CONTORNO, side: THREE.BackSide });
}

/* a casca de um modelo: os vértices empurrados para fora pela normal média
   de cada ponto (as faces de um mesmo canto andam juntas, sem abrir fresta) */
export function casca(geo: THREE.BufferGeometry, espessura = 0.035): THREE.BufferGeometry {
  const so = new THREE.BufferGeometry();
  so.setAttribute('position', geo.getAttribute('position').clone());
  if (geo.index) so.setIndex(geo.index.clone());
  const g = mergeVertices(so);
  so.dispose();
  g.computeVertexNormals();
  const p = g.getAttribute('position'), n = g.getAttribute('normal');
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) + n.getX(i) * espessura, p.getY(i) + n.getY(i) * espessura, p.getZ(i) + n.getZ(i) * espessura);
  }
  p.needsUpdate = true;
  g.deleteAttribute('normal');
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
