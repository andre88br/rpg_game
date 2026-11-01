/* =========================================================================
   O Saci, esculpido em campo de distância (sdf.ts) — o protótipo do jeito
   "de cinema": rapazote magro de uma perna só, de músculo e osso aparecendo,
   gorro vermelho de pano mole caindo para trás, o cachimbo no canto da boca
   e o sorriso de dente, tanga vermelha de pano amarrada com corda, em cima
   do redemoinho.

   O corpo (com os braços, sem emenda no ombro) e a cabeça são campos
   separados — a cabeça gira no pivô do pescoço. O corpo não muda com a
   pose e fica guardado; a cabeça muda (pálpebra, sobrancelha, boca) e é
   refeita por pose.
   ========================================================================= */
import * as THREE from 'three';
import { fundir } from '../base.ts';
import { esculpir, type Forma, type V3 } from '../sdf.ts';
import { C, esfera, type Kit, type Tinta } from '../escultura.ts';
import { MAT_OLHO, MATERIAIS_REAIS } from '../materiais.ts';
import type { Pose } from '../../../art/creatures.ts';

const PANO = 1, DURO = 2, AR = 3;   // (0 é a pele, o padrão)

/* o grupo de uma parte, no pivô, com a malha deslocada (a geometria é
   guardada e dividida entre os modelos: não se mexe nela) */
function parteReal(nome: string, junta: V3, geo: THREE.BufferGeometry, mats: THREE.Material | THREE.Material[], extra?: THREE.Mesh): THREE.Group {
  const g = new THREE.Group();
  g.name = nome;
  g.position.set(...junta);
  const m = new THREE.Mesh(geo, mats);
  m.position.set(-junta[0], -junta[1], -junta[2]);
  m.castShadow = true;
  g.add(m);
  if (extra) { extra.position.set(-junta[0], -junta[1], -junta[2]); extra.castShadow = true; g.add(extra); }
  return g;
}

/* ----------------------------------------------------------------- o corpo */

function corpoDoSaci(t: Tinta): Forma[] {
  const P = t(C.saci!), PD = t('#6e452f'), G = t(C.gorro!), GD = t(C.gorroD!), CORDA = t('#a8885a');
  const f: Forma[] = [
    // a bacia e a barriga chupada, o tórax de costela e o peito
    { tipo: 'elipsoide', a: [0, 0.47, 0], raios: [0.082, 0.07, 0.06], r: 0, cor: P },
    { tipo: 'elipsoide', a: [0, 0.56, 0.008], raios: [0.07, 0.08, 0.052], r: 0, cor: P, junta: 0.04 },
    { tipo: 'elipsoide', a: [0, 0.655, 0.0], raios: [0.098, 0.085, 0.064], r: 0, cor: P, junta: 0.05 },
    { tipo: 'elipsoide', a: [-0.043, 0.665, 0.042], raios: [0.044, 0.03, 0.024], r: 0, cor: P, junta: 0.03, giro: [0, 0, 0.2] },
    { tipo: 'elipsoide', a: [0.043, 0.665, 0.042], raios: [0.044, 0.03, 0.024], r: 0, cor: P, junta: 0.03, giro: [0, 0, -0.2] },
    // a cintura de ombro (trapézio) e o pescoço
    { tipo: 'capsula', a: [-0.088, 0.722, -0.008], b: [0.088, 0.722, -0.008], r: 0.034, cor: P, junta: 0.045 },
    { tipo: 'capsula', a: [0, 0.73, -0.005], b: [0, 0.8, 0.012], r: 0.032, r2: 0.028, cor: P, junta: 0.03 },
    { tipo: 'bola', a: [-0.112, 0.705, 0], r: 0.04, cor: P, junta: 0.03 },
    { tipo: 'bola', a: [0.112, 0.705, 0], r: 0.04, cor: P, junta: 0.03 },
    // a perna só: coxa, joelho, canela, panturrilha e o pé
    { tipo: 'capsula', a: [0.03, 0.46, 0.0], b: [0.036, 0.27, 0.02], r: 0.056, r2: 0.04, cor: P, junta: 0.04 },
    { tipo: 'bola', a: [0.036, 0.27, 0.028], r: 0.036, cor: P, junta: 0.025 },
    { tipo: 'capsula', a: [0.036, 0.27, 0.02], b: [0.036, 0.06, 0.0], r: 0.038, r2: 0.026, cor: P, junta: 0.03 },
    { tipo: 'elipsoide', a: [0.036, 0.19, -0.012], raios: [0.033, 0.06, 0.034], r: 0, cor: P, junta: 0.03 },
    { tipo: 'elipsoide', a: [0.036, 0.026, 0.035], raios: [0.034, 0.022, 0.072], r: 0, cor: PD, junta: 0.025 },
    // o umbigo e o rego do peito: cavados de leve
    { tipo: 'bola', a: [0, 0.535, 0.058], r: 0.007, cor: PD, tira: true, junta: 0.006 },
    { tipo: 'capsula', a: [0, 0.63, 0.06], b: [0, 0.7, 0.064], r: 0.005, cor: PD, tira: true, junta: 0.012 },
    // a tanga: o pano em volta do quadril, a aba da frente e a de trás
    { tipo: 'elipsoide', a: [0, 0.455, 0], raios: [0.094, 0.07, 0.072], r: 0, cor: G, mat: PANO, junta: 0.008, ruga: { amp: 0.003, freq: 45 } },
    { tipo: 'caixa', a: [0.005, 0.37, 0.058], raios: [0.075, 0.09, 0.013], r: 0.01, cor: G, mat: PANO, junta: 0.012, giro: [0.18, 0, 0.05], ruga: { amp: 0.004, freq: 35 } },
    { tipo: 'caixa', a: [0.0, 0.38, -0.055], raios: [0.075, 0.08, 0.013], r: 0.01, cor: GD, mat: PANO, junta: 0.012, giro: [-0.25, 0, 0], ruga: { amp: 0.004, freq: 35 } },
    // a ponta solta, esvoaçando para o lado
    { tipo: 'caixa', a: [-0.1, 0.4, -0.02], raios: [0.013, 0.075, 0.03], r: 0.01, cor: GD, mat: PANO, junta: 0.01, giro: [0.1, 0, -0.55], ruga: { amp: 0.004, freq: 30 } },
  ];
  // a corda da cintura, em gomos
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2, b = ((i + 1) / 16) * Math.PI * 2;
    f.push({ tipo: 'capsula', a: [Math.sin(a) * 0.09, 0.508, Math.cos(a) * 0.07], b: [Math.sin(b) * 0.09, 0.508, Math.cos(b) * 0.07],
      r: 0.0105, cor: CORDA, mat: PANO, junta: 0.003, ruga: { amp: 0.002, freq: 120 } });
  }
  // os braços, no mesmo campo: sem emenda no ombro
  for (const s of [-1, 1]) for (const forma of bracoDoSaci(t, s)) f.push({ ...forma, junta: forma.junta ?? 0.03 });
  return f;
}

/* ---------------------------------------------------------------- os braços */

function bracoDoSaci(t: Tinta, s: number): Forma[] {
  const P = t(C.saci!), PD = t('#6e452f');
  const x = (v: number) => s * v;
  const f: Forma[] = [
    { tipo: 'capsula', a: [x(0.118), 0.705, 0], b: [x(0.152), 0.57, 0.012], r: 0.032, r2: 0.025, cor: P, junta: 0.03 },
    { tipo: 'elipsoide', a: [x(0.132), 0.64, 0.016], raios: [0.027, 0.044, 0.027], r: 0, cor: P, junta: 0.02 },
    { tipo: 'capsula', a: [x(0.152), 0.57, 0.012], b: [x(0.17), 0.455, 0.05], r: 0.025, r2: 0.019, cor: P, junta: 0.02 },
    // a mão aberta: a palma e os dedos compridos, um pouco curvos
    { tipo: 'elipsoide', a: [x(0.176), 0.425, 0.058], raios: [0.013, 0.028, 0.024], r: 0, cor: P, junta: 0.015, giro: [0.3, 0, x(0.15)] },
  ];
  for (let d = 0; d < 4; d++) {
    const z = 0.047 + d * 0.011, comp = d === 1 || d === 2 ? 0.046 : 0.038;
    f.push({ tipo: 'capsula', a: [x(0.178), 0.402, z], b: [x(0.186), 0.402 - comp, z + 0.012], r: 0.0062, r2: 0.0048, cor: P, junta: 0.006 });
  }
  f.push({ tipo: 'capsula', a: [x(0.17), 0.42, 0.079], b: [x(0.16), 0.39, 0.104], r: 0.0068, r2: 0.0052, cor: P, junta: 0.008 });
  // as unhas mais claras
  for (let d = 0; d < 4; d++) f.push({ tipo: 'bola', a: [x(0.188), 0.402 - (d === 1 || d === 2 ? 0.046 : 0.038), 0.059 + d * 0.011 + 0.004], r: 0.0042, cor: PD, junta: 0.002 });
  return f;
}

/* ---------------------------------------------------------------- a cabeça */

function cabecaDoSaci(t: Tinta, pose: Pose): Forma[] {
  const P = t(C.saci!), PD = t('#6e452f'), LABIO = t('#6e3a2c'), G = t(C.gorro!), GD = t(C.gorroD!), GL = t(C.gorroL!);
  const fechado = pose === 'pisca' || pose === 'dano' || pose === 'desmaio';
  const bravo = pose === 'ataque';
  const f: Forma[] = [
    // o crânio, a cara de queixo fino, as maçãs do rosto
    { tipo: 'elipsoide', a: [0, 0.865, -0.006], raios: [0.077, 0.088, 0.087], r: 0, cor: P },
    { tipo: 'elipsoide', a: [0, 0.825, 0.02], raios: [0.064, 0.06, 0.07], r: 0, cor: P, junta: 0.04 },
    { tipo: 'bola', a: [0, 0.787, 0.05], r: 0.027, cor: P, junta: 0.03 },
    { tipo: 'bola', a: [-0.042, 0.842, 0.052], r: 0.024, cor: P, junta: 0.025 },
    { tipo: 'bola', a: [0.042, 0.842, 0.052], r: 0.024, cor: P, junta: 0.025 },
    // o nariz largo e as asas do nariz
    { tipo: 'capsula', a: [0, 0.856, 0.074], b: [0, 0.83, 0.088], r: 0.01, r2: 0.016, cor: P, junta: 0.012 },
    { tipo: 'bola', a: [-0.014, 0.826, 0.081], r: 0.011, cor: P, junta: 0.01 },
    { tipo: 'bola', a: [0.014, 0.826, 0.081], r: 0.011, cor: P, junta: 0.01 },
    { tipo: 'bola', a: [-0.011, 0.822, 0.09], r: 0.004, cor: PD, tira: true, junta: 0.003 },
    { tipo: 'bola', a: [0.011, 0.822, 0.09], r: 0.004, cor: PD, tira: true, junta: 0.003 },
    // a testa e as covas dos olhos
    { tipo: 'capsula', a: [-0.042, 0.876, 0.066], b: [0.042, 0.876, 0.066], r: 0.012, cor: P, junta: 0.02 },
    { tipo: 'bola', a: [-0.03, 0.858, 0.077], r: 0.019, cor: P, tira: true, junta: 0.012 },
    { tipo: 'bola', a: [0.03, 0.858, 0.077], r: 0.019, cor: P, tira: true, junta: 0.012 },
    // as orelhas de abano
    { tipo: 'elipsoide', a: [-0.078, 0.85, 0.0], raios: [0.011, 0.025, 0.018], r: 0, cor: P, junta: 0.01, giro: [0, -0.35, 0] },
    { tipo: 'elipsoide', a: [0.078, 0.85, 0.0], raios: [0.011, 0.025, 0.018], r: 0, cor: P, junta: 0.01, giro: [0, 0.35, 0] },
  ];
  // as pálpebras: aberto, só a de cima, pesada; fechado, cobre o olho
  for (const s of [-1, 1]) {
    if (fechado) f.push({ tipo: 'bola', a: [s * 0.03, 0.857, 0.072], r: 0.0185, cor: P, junta: 0.004 });
    else f.push({ tipo: 'elipsoide', a: [s * 0.03, 0.868, 0.074], raios: [0.019, 0.008, 0.015], r: 0, cor: P, junta: 0.004, giro: [0.2, 0, s * (bravo ? -0.35 : 0.1)] });
    // as sobrancelhas: levantadas no riso, fechadas no ataque
    f.push({ tipo: 'capsula', a: [s * 0.016, 0.884 - (bravo ? 0.006 : 0), 0.079], b: [s * 0.046, 0.888 + (bravo ? 0.006 : 0.003), 0.07], r: 0.0042,
      cor: t('#1a1210'), junta: 0.003 });
  }
  // a boca: os lábios grossos e o riso de dente, de canto a canto
  const riso = bravo ? 0.008 : pose === 'desmaio' ? 0.002 : 0.0055;
  f.push(
    { tipo: 'capsula', a: [-0.024, 0.809, 0.079], b: [0.024, 0.809, 0.079], r: 0.0055, cor: LABIO, junta: 0.008 },
    { tipo: 'capsula', a: [-0.021, 0.797, 0.078], b: [0.021, 0.797, 0.078], r: 0.0065, cor: LABIO, junta: 0.008 },
    // o riso: a fenda puxada para cima nos cantos, e os dentes logo atrás
    { tipo: 'capsula', a: [-0.027, 0.807, 0.09], b: [0.0, 0.802, 0.092], r: riso, cor: LABIO, tira: true, junta: 0.004 },
    { tipo: 'capsula', a: [0.0, 0.802, 0.092], b: [0.027, 0.807, 0.09], r: riso, cor: LABIO, tira: true, junta: 0.004 },
    { tipo: 'capsula', a: [-0.021, 0.805, 0.081], b: [0.021, 0.805, 0.081], r: 0.0058, cor: t('#f4efe4'), mat: DURO, junta: 0.002 },
  );
  // o gorro de pano: a copa, a dobra da barra e a ponta mole caindo para trás
  const ruga = { amp: 0.0025, freq: 34 };
  f.push(
    { tipo: 'elipsoide', a: [0, 0.925, -0.018], raios: [0.085, 0.062, 0.09], r: 0, cor: G, mat: PANO, junta: 0.01, ruga },
    { tipo: 'elipsoide', a: [0, 0.905, -0.014], raios: [0.09, 0.03, 0.095], r: 0, cor: GD, mat: PANO, junta: 0.008, ruga },
    { tipo: 'capsula', a: [0, 0.96, -0.025], b: [0.005, 1.04, -0.065], r: 0.06, r2: 0.045, cor: G, mat: PANO, junta: 0.03, ruga },
    { tipo: 'capsula', a: [0.005, 1.04, -0.065], b: [0.0, 1.08, -0.125], r: 0.045, r2: 0.03, cor: G, mat: PANO, junta: 0.025, ruga },
    { tipo: 'capsula', a: [0.0, 1.08, -0.125], b: [-0.01, 1.06, -0.185], r: 0.03, r2: 0.018, cor: GL, mat: PANO, junta: 0.02, ruga },
  );
  // o cachimbo de madeira no canto da boca
  const MAD = t('#6e4426');
  f.push(
    { tipo: 'capsula', a: [-0.018, 0.803, 0.086], b: [-0.07, 0.79, 0.12], r: 0.0045, cor: MAD, mat: DURO, junta: 0.002 },
    { tipo: 'capsula', a: [-0.07, 0.785, 0.12], b: [-0.072, 0.812, 0.122], r: 0.013, r2: 0.016, cor: MAD, mat: DURO, junta: 0.004 },
    { tipo: 'bola', a: [-0.072, 0.818, 0.122], r: 0.011, cor: t('#2a1a10'), mat: DURO, tira: true, junta: 0.002 },
  );
  return f;
}

/* a fumaça e o redemoinho: bolinhas de ar, fora do campo */
function fumaca(t: Tinta): THREE.BufferGeometry {
  const p: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) p.push(esfera(0.008 + i * 0.005, t('#d9d9d9'), [-0.085 - i * 0.022 - Math.sin(i * 1.7) * 0.01, 0.83 + i * 0.03, 0.12 - i * 0.022]));
  return fundir(p);
}
function redemoinho(t: Tinta): THREE.BufferGeometry {
  const p: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 26; i++) {
    const u = i / 25, a = u * Math.PI * 7;
    const r = 0.05 + u * 0.16;
    p.push(esfera(0.012 + u * 0.008, i % 2 ? t(C.vento!) : t(C.ventoD!), [0.036 + Math.cos(a) * r, 0.006 + u * 0.05, Math.sin(a) * r * 0.8], [1.6, 0.5, 1]));
  }
  return fundir(p);
}

/* O olho de gente: o branco quase não aparece (a pálpebra cobre), a íris
   grande de dois tons de castanho, a pupila e o brilho da córnea. */
function olhoDeGente(p: THREE.BufferGeometry[], c: V3, r: number, dir: THREE.Vector3): void {
  const d = dir.clone().normalize();
  const em = (k: number): [number, number, number] => [c[0] + d.x * r * k, c[1] + d.y * r * k, c[2] + d.z * r * k];
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
  const e = new THREE.Euler().setFromQuaternion(q);
  const giro = { x: e.x, y: e.y, z: e.z };
  p.push(esfera(r, '#e8ddd0', [...c], undefined, giro));
  p.push(esfera(r * 0.66, '#1e120a', em(0.84), [1, 1, 0.3], giro));
  p.push(esfera(r * 0.58, '#5a3418', em(0.88), [1, 1, 0.3], giro));
  p.push(esfera(r * 0.27, '#060404', em(0.97), [1, 1, 0.25], giro));
  const b = em(1.05);
  p.push(esfera(r * 0.11, '#ffffff', [b[0] + r * 0.22, b[1] + r * 0.25, b[2]], undefined, {}, 8));
}

/* ------------------------------------------------------------- montagem */

const guardado = new Map<string, THREE.BufferGeometry>();
function uma(chave: string, faz: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = guardado.get(chave);
  if (!g) { g = faz(); guardado.set(chave, g); }
  return g;
}

export function saciReal(k: Kit, chave: string): THREE.Group[] {
  const t = k.t, mats = k.mat instanceof THREE.MeshLambertMaterial ? k.mat : MATERIAIS_REAIS;
  const corpoGeo = uma(`${chave}|corpo`, () => esculpir(corpoDoSaci(t), 0.005));
  const vento = new THREE.Mesh(uma(`${chave}|vento`, () => redemoinho(t)), mats instanceof THREE.Material ? mats : MATERIAIS_REAIS[AR]!);
  const cabGeo = uma(`${chave}|cabeca|${k.pose}`, () => esculpir(cabecaDoSaci(t, k.pose), 0.0045));
  // os olhos: globo, íris castanha, pupila e brilho, no material de esmalte
  const olhos = uma(`${chave}|olhos|${k.pose}`, () => {
    const p: THREE.BufferGeometry[] = [];
    if (k.pose !== 'pisca' && k.pose !== 'dano' && k.pose !== 'desmaio') {
      for (const s of [-1, 1]) olhoDeGente(p, [s * 0.03, 0.857, 0.066], 0.0155, new THREE.Vector3(s * 0.1, 0.03, 1));
    } else p.push(esfera(0.001, '#000000', [0, 0.86, 0]));
    return fundir(p);
  });
  const fum = new THREE.Mesh(uma(`${chave}|fumaca`, () => fumaca(t)), mats instanceof THREE.Material ? mats : MATERIAIS_REAIS[AR]!);
  const cab = parteReal('cabeca', [0, 0.78, 0], cabGeo, mats, new THREE.Mesh(olhos, mats instanceof THREE.Material ? mats : MAT_OLHO));
  const fm = cab.children[0]!; fm.add(fum);
  const corpoG = parteReal('corpo#', [0, 0, 0], corpoGeo, mats);
  corpoG.add(vento);
  return [corpoG, cab];
}

