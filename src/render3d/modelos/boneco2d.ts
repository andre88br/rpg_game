/* =========================================================================
   Encantados desenhados: o bicho é a própria ilustração (um PNG com fundo
   transparente em `public/modelos/`), de pé no cenário 3D e sempre virado
   para a câmera, como figura de papel. Para mexer, o desenho não é cortado:
   ele vira uma malha fina presa a ossos (cabeça, gorro, braços, perna) e
   cada ponto da imagem segue o osso mais perto, com passagem macia — o
   desenho entorta de leve na junta, como num boneco articulado.

   As medidas de cada desenho são em pixels da imagem (x para a direita,
   y para baixo); a figura ganha a altura dos esculpidos (0,95).
   ========================================================================= */
import * as THREE from 'three';
import type { AcaoEncantado } from './encantado3d.ts';

export type OssoDoBoneco = 'tronco' | 'cabeca' | 'gorro' | 'bracoE' | 'bracoD' | 'perna';

export interface Boneco {
  arquivo: string;
  largura: number;
  altura: number;
  /* as juntas, em pixels; o tronco gira na cintura */
  juntas: Record<OssoDoBoneco, [number, number]>;
  pais: Partial<Record<OssoDoBoneco, OssoDoBoneco>>;
  /* o quanto o pixel (x, y) é de cada osso; o que sobra é do tronco */
  pesos(x: number, y: number): Partial<Record<OssoDoBoneco, number>>;
}

/* a passagem macia de 0 (antes de a) para 1 (depois de b); vale b < a */
function passa(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/* o Saci: a imagem de 600 × 844, de frente, braços abertos, uma perna;
   o gorro cai do lado esquerdo da imagem (o direito dele) */
export const SACI_DESENHADO: Boneco = {
  arquivo: 'saci.png',
  largura: 600,
  altura: 844,
  juntas: {
    tronco: [295, 470],
    cabeca: [305, 222],
    gorro: [240, 95],
    bracoD: [200, 250],
    bracoE: [392, 252],
    perna: [285, 575],
  },
  pais: { cabeca: 'tronco', gorro: 'cabeca', bracoD: 'tronco', bracoE: 'tronco' },
  pesos(x, y) {
    // a beirada do tronco, que desce estreitando do ombro à cintura
    const esq = 196 + Math.max(0, y - 250) * 0.15;
    const dir = 392 - Math.max(0, y - 250) * 0.2;
    // ao lado do calção, só é braço o que está longe dele (a mão)
    const baixo = 1 - passa(368, 392, y);
    const bracoD = passa(esq + 8, esq - 22, x) * passa(200, 232, y) * Math.max(baixo, passa(195, 165, x));
    const bracoE = passa(dir - 8, dir + 22, x) * passa(200, 232, y) * Math.max(baixo, passa(434, 446, x));
    // a cabeça, do pescoço para cima (o queixo e a cara inteiros)
    const cab = passa(238, 205, y);
    // a ponta do gorro, caída do lado da cabeça
    const ponta = cab * passa(262, 236, x) * passa(70, 110, y);
    // a perna, da barra do calção para baixo (o toco do outro lado fica)
    const perna = passa(570, 600, y) * passa(350, 335, x);
    return { bracoD, bracoE, cabeca: cab - ponta, gorro: ponta, perna };
  },
};

/* os Encantados que são desenho */
export const BONECOS: Readonly<Record<string, Boneco>> = {
  sacizinho: SACI_DESENHADO,
  saci: SACI_DESENHADO,
};

/* a câmera para onde os desenhos viram (a vista e a luta põem a sua) */
export const OLHO: { camera: THREE.Camera | null } = { camera: null };

let base = '/';
export function prepararBonecos(b: string): void { base = b; }

const ALTURA = 0.95;
const nomeDoOsso = (n: OssoDoBoneco) => `boneco:${n}`;
const materiais = new Map<string, THREE.Material>();

/* o raro: o mesmo desenho num banho dourado */
const TOM_RARO = '#ffd27a';

function materialDe(b: Boneco, raro: boolean): THREE.Material {
  const chave = b.arquivo + (raro ? '*' : '');
  let m = materiais.get(chave);
  if (m) return m;
  const mat = new THREE.MeshStandardMaterial({
    roughness: 1, metalness: 0, side: THREE.DoubleSide, alphaTest: 0.5,
    emissive: raro ? TOM_RARO : '#ffffff', emissiveIntensity: 0.3,
    color: raro ? TOM_RARO : '#ffffff',
  });
  // a imagem só existe no navegador (os testes rodam sem ela)
  if (typeof document !== 'undefined') {
    const tex = new THREE.TextureLoader().load(`${base}modelos/${b.arquivo}`);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    mat.map = tex;
    // a cor própria do desenho: na sombra ele não vira mancha
    mat.emissiveMap = tex;
  }
  materiais.set(chave, mat);
  m = mat;
  return m;
}

/* monta o desenho: a malha presa aos ossos, de pé no chão, centrada */
export function montarBoneco(b: Boneco, raro = false): THREE.SkinnedMesh {
  const k = ALTURA / b.altura;
  const px = (x: number, y: number): [number, number] => [(x - b.largura / 2) * k, (b.altura - y) * k];
  const geo = new THREE.PlaneGeometry(b.largura * k, ALTURA, 60, 84);
  geo.translate(0, ALTURA / 2, 0);

  const nomes = Object.keys(b.juntas) as OssoDoBoneco[];
  const ossos = new Map<OssoDoBoneco, THREE.Bone>();
  for (const n of nomes) { const o = new THREE.Bone(); o.name = nomeDoOsso(n); ossos.set(n, o); }
  for (const n of nomes) {
    const [x, y] = px(...b.juntas[n]);
    const pai = b.pais[n];
    const [x0, y0] = pai ? px(...b.juntas[pai]) : [0, 0];
    ossos.get(n)!.position.set(x - x0, y - y0, 0);
    if (pai) ossos.get(pai)!.add(ossos.get(n)!);
  }
  const lista = nomes.map((n) => ossos.get(n)!);
  const indice = new Map(nomes.map((n, i) => [n, i]));

  const pos = geo.getAttribute('position');
  const idx = new Uint16Array(pos.count * 4);
  const pes = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / k + b.largura / 2, y = b.altura - pos.getY(i) / k;
    const p = b.pesos(x, y);
    let resto = 1;
    const par: [number, number][] = [];
    for (const n of nomes) {
      if (n === 'tronco') continue;
      const w = Math.max(0, Math.min(resto, p[n] ?? 0));
      if (w > 0.001) { par.push([indice.get(n)!, w]); resto -= w; }
    }
    if (resto > 0.001) par.push([indice.get('tronco')!, resto]);
    par.sort((a, c) => c[1] - a[1]);
    const quatro = par.slice(0, 4);
    const soma = quatro.reduce((s, q) => s + q[1], 0) || 1;
    quatro.forEach(([o, w], j) => { idx[i * 4 + j] = o; pes[i * 4 + j] = w / soma; });
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(idx, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(pes, 4));

  const m = new THREE.SkinnedMesh(geo, materialDe(b, raro));
  // os ossos sem pai (tronco, perna) ficam presos na malha
  for (const n of nomes) if (!b.pais[n]) m.add(ossos.get(n)!);
  m.updateMatrixWorld(true);
  m.bind(new THREE.Skeleton(lista));
  m.castShadow = true;
  m.frustumCulled = false;
  m.userData['boneco'] = true;
  return m;
}

/* mexe o desenho no quadro: vira para a câmera e anima os ossos */
export function animarBoneco(g: THREE.Object3D, acao: AcaoEncantado, t: number, relogio: number): void {
  const osso = (n: OssoDoBoneco) => g.getObjectByName(nomeDoOsso(n));
  const tronco = osso('tronco');
  if (!tronco) return;
  const cab = osso('cabeca'), gorro = osso('gorro'), be = osso('bracoE'), bd = osso('bracoD'), perna = osso('perna');

  // de frente para a câmera, girando só em pé (a queda continua de lado)
  const pai = g.parent;
  if (OLHO.camera && pai) {
    const onde = pai.getWorldPosition(new THREE.Vector3());
    const cam = OLHO.camera.getWorldPosition(new THREE.Vector3());
    const giroPai = new THREE.Euler().setFromQuaternion(pai.getWorldQuaternion(new THREE.Quaternion()), 'YXZ').y;
    g.rotation.y = Math.atan2(cam.x - onde.x, cam.z - onde.z) - giroPai;
  }

  // o pulinho de uma perna: estica no ar, amassa ao cair (o desenho é
  // chato, então o pulo se vê no corpo inteiro e não no joelho)
  const andando = acao === 'andar';
  const f = relogio * (andando ? 10 : 4.2);
  const s = Math.sin(f);
  const ar = acao === 'parado' || andando ? Math.max(0, s) : 0;
  const chao = acao === 'parado' || andando ? Math.max(0, -s) : 0;
  if (acao === 'parado') g.position.y += ar * 0.05;
  if (acao !== 'desmaio') g.scale.set(1 + chao * 0.05 - ar * 0.02, 1 - chao * 0.07 + ar * 0.04, 1);

  // os braços abrem para equilibrar no ar; balançam de leve no chão
  const balanco = Math.sin(relogio * 1.3) * 0.06;
  if (bd) bd.rotation.z = -ar * 0.25 + balanco;
  if (be) be.rotation.z = ar * 0.25 + balanco;
  // a cabeça pende de banda, sapeca; o gorro vem atrasado, sacudindo
  if (cab) cab.rotation.z = Math.sin(relogio * 0.9) * 0.07;
  if (gorro) gorro.rotation.z = Math.cos(f - 0.7) * 0.12 + Math.sin(relogio * 0.9 - 0.6) * 0.08;
  tronco.rotation.z = Math.sin(relogio * 0.7) * 0.025;
  if (perna) perna.rotation.z = Math.sin(f) * 0.03;

  switch (acao) {
    case 'atacar': {
      // os dois braços sobem para o bote, o corpo encolhe e salta
      const k = Math.sin(Math.min(1, t / 0.45) * Math.PI);
      if (bd) bd.rotation.z = -k * 0.7;
      if (be) be.rotation.z = k * 0.7;
      if (cab) cab.rotation.z = k * 0.12;
      if (gorro) gorro.rotation.z = -k * 0.3;
      tronco.rotation.z = -k * 0.08;
      g.scale.set(1 - k * 0.04, 1 + k * 0.08, 1);
      break;
    }
    case 'dano':
      if (t < 0.4) {
        const k = Math.sin((t / 0.4) * Math.PI);
        if (cab) cab.rotation.z = -0.2 * k;
        if (bd) bd.rotation.z = -0.6 * k;
        if (be) be.rotation.z = 0.6 * k;
        if (gorro) gorro.rotation.z = 0.35 * k;
        g.scale.set(1 + 0.06 * k, 1 - 0.08 * k, 1);
      }
      break;
    case 'desmaio': {
      const k = Math.min(1, t / 0.6);
      if (bd) bd.rotation.z = 0.5 * k;
      if (be) be.rotation.z = -0.5 * k;
      if (cab) cab.rotation.z = -0.25 * k;
      if (gorro) gorro.rotation.z = 0;
      tronco.rotation.z = 0;
      break;
    }
    default:
      break;
  }
}
