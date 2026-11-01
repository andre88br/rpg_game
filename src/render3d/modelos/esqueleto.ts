/* =========================================================================
   O esqueleto dos Encantados de arquivo (.glb). O modelo gerado por IA vem
   numa peça só, sem ossos; aqui ele ganha um esqueleto feito à mão: os
   ossos ficam nas juntas (ombro, pescoço, quadril, joelho...) e cada vértice
   escolhe de que osso é pela posição, com a passagem macia entre um e outro.
   Assim braço, cabeça, gorro e perna mexem sozinhos, como nos esculpidos.

   As medidas são no modelo já acertado (de pé, altura 0,95, virado para +z;
   o lado esquerdo do bicho é o +x).
   ========================================================================= */
import * as THREE from 'three';
import type { AcaoEncantado } from './encantado3d.ts';

export type NomeOsso = 'tronco' | 'cabeca' | 'gorro' | 'bracoE' | 'bracoD' | 'perna' | 'joelho';

/* o osso: onde fica a junta e de quem ele é filho */
interface Osso { junta: [number, number, number]; pai: NomeOsso | null }

export interface Esqueleto {
  ossos: Record<NomeOsso, Osso>;
  /* o quanto o vértice (x, y, z) é de cada osso; o que sobra é do tronco */
  pesos(x: number, y: number, z: number): Partial<Record<NomeOsso, number>>;
}

/* a passagem macia de 0 (antes de a) para 1 (depois de b); vale b < a */
function passa(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/* o Saci: de uma perna só, braços abertos, o gorro caído para a direita */
const MEIO = -0.01;
export const ESQUELETO_SACI: Esqueleto = {
  ossos: {
    tronco: { junta: [MEIO, 0.38, 0.02], pai: null },
    cabeca: { junta: [MEIO, 0.7, -0.01], pai: 'tronco' },
    gorro: { junta: [-0.08, 0.84, -0.04], pai: 'cabeca' },
    bracoE: { junta: [0.1, 0.61, -0.01], pai: 'tronco' },
    bracoD: { junta: [-0.12, 0.61, -0.01], pai: 'tronco' },
    perna: { junta: [-0.02, 0.33, 0.03], pai: null },
    joelho: { junta: [-0.02, 0.17, 0.05], pai: 'perna' },
  },
  pesos(x, y) {
    const d = x - MEIO;
    // o braço: longe do meio, entre a cintura e o pescoço (a mão desce até
    // 0,37; o toco da perna cortada, embaixo, fica com o corpo)
    const altura = Math.max(passa(0.355, 0.375, y), passa(0.2, 0.23, Math.abs(d))) * (1 - passa(0.66, 0.7, y));
    // no ombro o braço sai rente ao peito; mais embaixo, ao lado do calção,
    // só é braço o que está bem longe do meio
    const dentro = 0.15 - 0.075 * passa(0.5, 0.6, y);
    const bracoE = passa(dentro, dentro + 0.04, d) * altura;
    const bracoD = passa(dentro, dentro + 0.04, -d) * altura;
    // a cabeça, do pescoço para cima; a ponta do gorro, caída do lado
    const cab = passa(0.685, 0.725, y);
    const ponta = passa(-0.085, -0.11, x) * (1 - passa(0.78, 0.83, y));
    // a perna, abaixo do calção (sem o toco do outro lado)
    const perna = (1 - passa(0.29, 0.33, y)) * (1 - passa(0.035, 0.06, x));
    const joelho = 1 - passa(0.15, 0.19, y);
    return {
      bracoE, bracoD,
      cabeca: cab * (1 - ponta), gorro: cab * ponta,
      perna: perna * (1 - joelho), joelho: perna * joelho,
    };
  },
};

/* o esqueleto de cada arquivo */
export const ESQUELETOS: Readonly<Record<string, Esqueleto>> = { sacizinho: ESQUELETO_SACI };

const nomeDoOsso = (n: NomeOsso) => `osso:${n}`;

/* troca a malha parada por uma de ossos (a geometria já no lugar final) */
export function armar(geo: THREE.BufferGeometry, mat: THREE.Material, esq: Esqueleto): THREE.SkinnedMesh {
  const nomes = Object.keys(esq.ossos) as NomeOsso[];
  const ossos = new Map<NomeOsso, THREE.Bone>();
  for (const n of nomes) {
    const b = new THREE.Bone();
    b.name = nomeDoOsso(n);
    ossos.set(n, b);
  }
  const raiz = new THREE.Bone();
  raiz.name = 'osso:raiz';
  for (const n of nomes) {
    const o = esq.ossos[n];
    const pai = o.pai ? esq.ossos[o.pai].junta : [0, 0, 0];
    const b = ossos.get(n)!;
    b.position.set(o.junta[0] - pai[0], o.junta[1] - pai[1], o.junta[2] - pai[2]);
    (o.pai ? ossos.get(o.pai)! : raiz).add(b);
  }
  const lista = [raiz, ...nomes.map((n) => ossos.get(n)!)];
  const indice = new Map<string, number>(lista.map((b, i) => [b.name, i]));

  const pos = geo.getAttribute('position');
  const idx = new Uint16Array(pos.count * 4);
  const pes = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const p = esq.pesos(pos.getX(i), pos.getY(i), pos.getZ(i));
    let resto = 1;
    const par: [number, number][] = [];
    for (const n of nomes) {
      const w = Math.max(0, Math.min(resto, p[n] ?? 0));
      if (w > 0.001) { par.push([indice.get(nomeDoOsso(n))!, w]); resto -= w; }
    }
    if (resto > 0.001) par.push([indice.get(nomeDoOsso('tronco'))!, resto]);
    par.sort((a, b) => b[1] - a[1]);
    const quatro = par.slice(0, 4);
    const soma = quatro.reduce((s, q) => s + q[1], 0) || 1;
    quatro.forEach(([o, w], k) => { idx[i * 4 + k] = o; pes[i * 4 + k] = w / soma; });
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(idx, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(pes, 4));

  const m = new THREE.SkinnedMesh(geo, mat);
  m.add(raiz);
  m.updateMatrixWorld(true);
  m.bind(new THREE.Skeleton(lista));
  m.castShadow = true; m.receiveShadow = true;
  // os ossos mexem a malha além da caixa parada: sem recorte por caixa
  m.frustumCulled = false;
  return m;
}

/* mexe os ossos no quadro (nada, se o modelo não tem esqueleto); a
   mesma ação e o mesmo tempo da animação do corpo inteiro */
export function animarEsqueleto(g: THREE.Object3D, acao: AcaoEncantado, t: number, relogio: number): void {
  const osso = (n: NomeOsso) => g.getObjectByName(nomeDoOsso(n));
  const tronco = osso('tronco');
  if (!tronco) return;
  const cab = osso('cabeca'), gorro = osso('gorro'), be = osso('bracoE'), bd = osso('bracoD');
  const perna = osso('perna'), joelho = osso('joelho');
  for (const o of [tronco, cab, gorro, be, bd, perna, joelho]) o?.rotation.set(0, 0, 0);

  // o pulinho de uma perna: no ar, o joelho dobra e os braços sobem para
  // equilibrar; no chão, a perna estica
  const andando = acao === 'andar';
  const f = relogio * (andando ? 10 : 4.2);
  const ar = acao === 'parado' || andando ? Math.max(0, Math.sin(f)) : 0;
  if (acao === 'parado') g.position.y += ar * 0.05;
  if (perna) perna.rotation.x = -ar * 0.3;
  if (joelho) joelho.rotation.x = ar * 0.6;
  const balanco = Math.sin(relogio * 1.3) * 0.06;
  if (be) { be.rotation.z = ar * 0.3 + balanco; be.rotation.y = Math.sin(relogio * 1.1) * 0.15; }
  if (bd) { bd.rotation.z = -ar * 0.3 + balanco; bd.rotation.y = Math.sin(relogio * 1.1 + 1) * 0.15; }
  // a cabeça olha em volta, de banda, sapeca
  if (cab) {
    cab.rotation.y = Math.sin(relogio * 0.7) * 0.35;
    cab.rotation.z = Math.sin(relogio * 0.9) * 0.1;
    cab.rotation.x = -ar * 0.08;
  }
  // o gorro vem atrasado, sacudindo com o pulo
  if (gorro) { gorro.rotation.x = Math.cos(f - 0.6) * 0.2; gorro.rotation.z = Math.sin(relogio * 0.9 - 0.7) * 0.25; }
  tronco.rotation.z = Math.sin(f) * 0.03;
  tronco.rotation.y = Math.sin(relogio * 0.7) * 0.1;

  switch (acao) {
    case 'atacar': {
      // os dois braços vêm para a frente agarrar, o corpo dá o bote e a
      // perna chuta para trás
      const k = Math.sin(Math.min(1, t / 0.45) * Math.PI);
      if (be) { be.rotation.y = -k * 1.2; be.rotation.z = -k * 0.2; }
      if (bd) { bd.rotation.y = k * 1.2; bd.rotation.z = k * 0.2; }
      tronco.rotation.x = k * 0.25;
      if (cab) cab.rotation.set(-k * 0.2, 0, 0);
      if (joelho) joelho.rotation.x = k * 0.9;
      if (perna) perna.rotation.x = k * 0.2;
      if (gorro) gorro.rotation.x = -k * 0.5;
      break;
    }
    case 'dano':
      if (t < 0.4) {
        const k = Math.sin((t / 0.4) * Math.PI);
        if (cab) cab.rotation.set(-0.45 * k, 0, 0.15 * k);
        if (be) be.rotation.z = 0.7 * k;
        if (bd) bd.rotation.z = -0.7 * k;
        if (gorro) gorro.rotation.x = 0.6 * k;
        tronco.rotation.x = -0.2 * k;
      }
      break;
    case 'desmaio': {
      const k = Math.min(1, t / 0.6);
      if (be) be.rotation.set(0, 0, -0.8 * k);
      if (bd) bd.rotation.set(0, 0, 0.8 * k);
      if (cab) cab.rotation.set(0.4 * k, 0, 0);
      if (gorro) gorro.rotation.set(0, 0, 0);
      tronco.rotation.set(0, 0, 0);
      break;
    }
    default:
      break;
  }
}
