/* Ferramenta de revisão (só no `npm run dev`): o terreiro de cada região e
   a loja, um por linha, o desenho 2D ao lado do modelo 3D de frente (do
   ângulo da câmera do jogo) e em três quartos. */
import * as THREE from 'three';
import { terreiroDaRegiao } from '../src/art/predios.ts';
import { construcao } from '../src/art/tiles.ts';
import { predio3D } from '../src/render3d/modelos/casas.ts';
import type { Buf } from '../src/core/buf.ts';
import type { TipoObjeto } from '../src/world/tilemap.ts';

const TAM = 300;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(TAM, TAM);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const cena = new THREE.Scene();
cena.background = new THREE.Color('#efe9dc');
cena.add(new THREE.HemisphereLight('#eef6ff', '#5a7a3a', 1.0));
const sol = new THREE.DirectionalLight('#fff2d8', 2.4);
sol.position.set(-4, 10, 8);
cena.add(sol);
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });

function foto(modelo: THREE.Object3D, giro: number, alto: number): HTMLCanvasElement {
  const caixa = new THREE.Box3().setFromObject(modelo);
  const meio = caixa.getCenter(new THREE.Vector3());
  const raio = caixa.getSize(new THREE.Vector3()).length() / 2;
  const dist = raio / Math.sin(THREE.MathUtils.degToRad(15)) * 1.02;
  camera.position.set(meio.x + Math.sin(giro) * dist, meio.y + alto * dist, meio.z + Math.cos(giro) * dist);
  camera.lookAt(meio);
  renderer.render(cena, camera);
  const c = document.createElement('canvas');
  c.width = c.height = TAM;
  c.getContext('2d')!.drawImage(renderer.domElement, 0, 0);
  return c;
}

function desenho(b: Buf): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = TAM;
  const ctx = c.getContext('2d')!;
  const k = Math.floor(TAM / Math.max(b.w, b.h));
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
    const cor = b.get(x, y);
    if (cor) { ctx.fillStyle = cor; ctx.fillRect(x * k, y * k, k, k); }
  }
  return c;
}

const LINHAS: [string, string | null, TipoObjeto, number, number, Buf][] = [
  ...(['agua', 'planta', 'fogo', 'vento', 'raio', 'terra', 'sombra', 'luz'] as const)
    .map((r): [string, string, TipoObjeto, number, number, Buf] => [r, r, 'terreiro', 7, 5, terreiroDaRegiao(r, 7, 5, 3)]),
  ['loja', 'raio', 'loja', 5, 4, construcao(5, 4, { roof: '#3f8f6f', roofD: '#2b6b52', roofL: '#5fb894', sign: 'LOJA', signColor: '#7fd9b4', portaCol: 2 })],
];

const folha = document.getElementById('folha')!;
for (const [nome, regiao, tipo, w, alt, b] of LINHAS) {
  const linha = document.createElement('div');
  linha.className = 'linha';
  const n = document.createElement('div');
  n.className = 'nome';
  n.textContent = nome;
  linha.append(n, desenho(b));
  const p = predio3D(regiao, tipo, w, alt, tipo === 'loja' ? 2 : 3);
  const m = new THREE.Mesh(p.geo, mat);
  cena.add(m);
  for (const [giro, alto] of [[0, 0.9], [0, 0.35], [0.7, 0.5]] as const) linha.append(foto(m, giro, alto));
  cena.remove(m);
  folha.append(linha);
}
document.title = 'pronto';
