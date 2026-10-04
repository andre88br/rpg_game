/* Ferramenta de revisão (só no `npm run dev`): cada Encantado em uma linha,
   o desenho 2D ao lado do modelo 3D de frente, em três quartos, de costas e
   de lado. ?de=0&ate=9 escolhe as espécies, ?raro=1 mostra o raro, e
   ?num=1 numera as peças do desenho (para os ajustes de bichos.ts). */
import * as THREE from 'three';
import { ARTE_CRIATURAS } from '../src/art/creatures.ts';
import { variante } from '../src/art/raro.ts';
import { ESPECIES, ESPECIES_ORDEM } from '../src/data/creatures.ts';
import { encantado3D, animarEncantado } from '../src/render3d/modelos/encantado3d.ts';
import { fundirPixels, gravar } from '../src/render3d/modelos/desenho3d.ts';

const q = new URLSearchParams(location.search);
const de = Number(q.get('de') ?? 0), ate = Number(q.get('ate') ?? ESPECIES_ORDEM.length - 1);
const raro = q.get('raro') === '1', num = q.get('num') === '1';
const TAM = 180;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(TAM, TAM);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
const cena = new THREE.Scene();
cena.background = new THREE.Color('#efe9dc');
cena.add(new THREE.HemisphereLight('#e8f4ff', '#7a6a4a', 1.4));
const sol = new THREE.DirectionalLight('#fff0d0', 2.4);
sol.position.set(-3, 6, 5);
cena.add(sol);
const chao = new THREE.Mesh(new THREE.CircleGeometry(1.2, 24), new THREE.MeshLambertMaterial({ color: '#c9bfa8' }));
chao.rotation.x = -Math.PI / 2;
cena.add(chao);
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

function foto(modelo: THREE.Object3D, giro: number, alto: number): HTMLCanvasElement {
  const caixa = new THREE.Box3().setFromObject(modelo);
  const meio = caixa.getCenter(new THREE.Vector3());
  const raio = caixa.getSize(new THREE.Vector3()).length() / 2;
  const dist = raio / Math.sin(THREE.MathUtils.degToRad(15)) * 1.05;
  camera.position.set(meio.x + Math.sin(giro) * dist, meio.y + alto * dist, meio.z + Math.cos(giro) * dist);
  camera.lookAt(meio);
  renderer.render(cena, camera);
  const c = document.createElement('canvas');
  c.width = c.height = TAM;
  c.getContext('2d')!.drawImage(renderer.domElement, 0, 0);
  return c;
}

const folha = document.getElementById('folha')!;
for (const id of ESPECIES_ORDEM.slice(de, ate + 1)) {
  const linha = document.createElement('div');
  linha.className = 'linha';
  const nome = document.createElement('div');
  nome.className = 'nome';
  nome.textContent = id;
  linha.append(nome);

  // o desenho 2D, grande
  const arte = ARTE_CRIATURAS[ESPECIES[id]!.arte]!;
  const b = raro ? variante(arte(), id) : arte();
  const c2 = document.createElement('canvas');
  c2.width = c2.height = TAM;
  const ctx = c2.getContext('2d')!;
  const k = Math.floor(TAM / b.w);
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
    const cor = b.get(x, y);
    if (cor) { ctx.fillStyle = cor; ctx.fillRect(x * k, y * k, k, k); }
  }
  if (num) {
    ctx.font = '9px monospace';
    fundirPixels(gravar(arte).ops).forEach((o, i) => {
      const [x, y] = o.k === 'e' ? [o.cx, o.cy] : o.k === 'r' ? [o.x + o.w / 2, o.y + o.h / 2]
        : o.k === 't' ? [(o.p[0] + o.p[2] + o.p[4]) / 3, (o.p[1] + o.p[3] + o.p[5]) / 3]
        : o.k === 'l' ? [(o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2] : [o.x, o.y];
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x * k - 1, y * k - 7, String(i).length * 6 + 2, 9);
      ctx.fillStyle = '#c00000'; ctx.fillText(String(i), x * k, y * k);
    });
  }
  linha.append(c2);

  const modelo = encantado3D(id, raro);
  animarEncantado(modelo, 'parado', 0, 0);
  cena.add(modelo);
  for (const [giro, alto] of [[0, 0.12], [0.75, 0.3], [Math.PI, 0.2], [Math.PI / 2, 0.05]] as const) {
    linha.append(foto(modelo, giro, alto));
  }
  cena.remove(modelo);
  folha.append(linha);
}
document.title = 'pronto';
