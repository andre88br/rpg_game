/* Os bichos do ar: as Matintas (corujas), os Uirapurus, os vagalumes de
   raio e o Arco-da-Velha. Quase todos voam (o corpo sobe e desce sozinho). */
import * as THREE from 'three';
import { fundir, lisa, peca } from '../base.ts';
import { P } from '../../../art/palette.ts';
import {
  C, asa, cone, corpo, esfera, facetada, olho, parte, rosto, tubo,
  type Escultura, type Kit, type V3,
} from '../escultura.ts';

/* as asas, cada uma no seu pivô (a animação bate as duas) */
function asas(k: Kit, ombro: V3, comprido: number, largo: number, corH: string, ponta: string, penas = 6, abre = 0.3): THREE.Group[] {
  return [-1, 1].map((s) => {
    const g = asa(comprido, largo, corH, ponta, penas, s < 0);
    g.rotateZ(s * abre);
    return parte(s < 0 ? 'asaE' : 'asaD', [ombro[0] * s, ombro[1], ombro[2]], (g.translate(ombro[0] * s, ombro[1], ombro[2]), g), k.mat);
  });
}

/* um raio em zigue-zague, chato */
function raio(corH: string, p: V3, tam: number, giro = {}): THREE.BufferGeometry {
  const r = new THREE.Shape();
  r.moveTo(0, 0); r.lineTo(0.05, 0.12); r.lineTo(0.02, 0.12); r.lineTo(0.06, 0.24); r.lineTo(-0.02, 0.1); r.lineTo(0.01, 0.1); r.lineTo(-0.03, 0);
  return facetada(new THREE.ExtrudeGeometry(r, { depth: 0.02, bevelEnabled: false }), corH, p, giro, [tam, tam, 1]);
}

/* ------------------------------------------------------------------ corujas */

function coruja(k: Kit, bruxa: boolean): THREE.Group[] {
  const t = k.t;
  const B = bruxa ? t('#4a3a5e') : t('#5e4e74'), BD = bruxa ? t('#2e2440') : t('#3e3252');
  const BL = bruxa ? t('#7a6a92') : t('#8a7aa2'), DISCO = t('#d8cce8'), BICO = t('#e8a03a');
  const pecas: THREE.BufferGeometry[] = [
    esfera(0.22, B, [0, 0.38, 0], [1, 1.05, 0.9]),
    esfera(0.17, BL, [0, 0.32, 0.07], [0.9, 0.95, 0.75]),
  ];
  // as penas do peito: escamas em fileiras
  for (let i = 0; i < 10; i++) {
    const x = ((i % 4) - 1.5) * 0.06, y = 0.22 + Math.floor(i / 4) * 0.07;
    pecas.push(esfera(0.022, BD, [x, y, 0.2 - Math.abs(x) * 0.3], [1, 0.5, 0.4]));
  }
  // os pés, de garra laranja
  for (const s of [-1, 1]) for (let d = -1; d <= 1; d++) pecas.push(esfera(0.016, BICO, [s * 0.07 + d * 0.018, 0.17, 0.12], [0.8, 0.6, 1.6]));
  if (bruxa) {
    // o xale vermelho cruzado no peito
    pecas.push(lisa(peca(new THREE.ConeGeometry(0.2, 0.2, 24, 1, true), t('#b8303a'), 0, 0.42, 0.02, { x: Math.PI }, [1.05, 1, 0.85])));
  }
  const CY = 0.6;
  const cab: THREE.BufferGeometry[] = [
    esfera(0.17, B, [0, CY, 0], [1.1, 0.95, 0.9]),
    // o disco da cara, claro, e as orelhas de pena
    esfera(0.15, DISCO, [0, CY - 0.01, 0.06], [1.1, 0.85, 0.55]),
    cone(0.04, 0.1, BD, [-0.12, CY + 0.14, 0], { z: 0.4 }),
    cone(0.04, 0.1, BD, [0.12, CY + 0.14, 0], { z: -0.4 }),
    cone(0.022, 0.05, BICO, [0, CY - 0.04, 0.15], { x: Math.PI / 2 + 0.6 }),
  ];
  for (const s of [-1, 1]) olho(cab, [s * 0.065, CY + 0.02, 0.12], 0.045, new THREE.Vector3(s * 0.12, 0, 1), '#e8a03a', DISCO, k.pose);
  if (bruxa) {
    // o chapéu de bruxa, torto, de aba larga
    cab.push(tubo(0.2, 0.2, 0.015, BD, [0, CY + 0.13, -0.01], { z: 0.12 }));
    cab.push(cone(0.1, 0.22, BD, [0.02, CY + 0.25, -0.02], { z: 0.25, x: -0.2 }));
    cab.push(tubo(0.1, 0.1, 0.025, t('#b8303a'), [0, CY + 0.15, -0.01], { z: 0.12 }));
  }
  const base: THREE.Group[] = [corpo(k, pecas), parte('cabeca', [0, CY - 0.12, 0], fundir(cab), k.mat)];
  return [...base, ...asas(k, [0.19, 0.48, -0.03], 0.26, 0.24, B, BD, 6, -1.25)];
}

const matinta: Escultura = (k) => coruja(k, false);
const matintaPerera: Escultura = (k) => coruja(k, true);

/* --------------------------------------------------------------- Uirapurus */

function uirapuru(k: Kit, rei: boolean): THREE.Group[] {
  const t = k.t;
  const Y = rei ? t('#f2c83a') : t('#f2d03a'), YL = t('#fbe88a');
  const A = rei ? t('#2a6ad0') : t('#3a7ad0'), AD = rei ? t('#1a4088') : t('#24508e'), AL = t('#6aa4ee');
  const pecas: THREE.BufferGeometry[] = [
    esfera(0.2, Y, [0, 0.38, 0], [1, 1.05, 0.95]),
    esfera(0.15, YL, [0, 0.34, 0.07], [0.9, 0.9, 0.8]),
  ];
  // a cauda de penas azuis, em leque para trás
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.25;
    pecas.push(esfera(0.12, i % 2 ? AD : A, [Math.sin(a) * 0.08, 0.26, -0.24], [0.3, 0.1, 1], { y: a, x: 0.5 }));
  }
  for (const s of [-1, 1]) pecas.push(esfera(0.016, t('#e8803a'), [s * 0.06, 0.18, 0.06], [0.8, 0.6, 1.8]));
  const CY = 0.47;
  const cab: THREE.BufferGeometry[] = [
    cone(0.035, 0.09, t('#e8803a'), [0, CY - 0.04, 0.22], { x: Math.PI / 2 }),
  ];
  // o topete azul (e a coroa, no rei)
  for (let i = 0; i < 3; i++) cab.push(cone(0.035, 0.13, i === 1 ? A : AD, [(i - 1) * 0.04, CY + 0.2, -0.02], { x: -0.4, z: (1 - i) * 0.35 }));
  if (rei) {
    cab.push(tubo(0.08, 0.085, 0.04, t(P.gold!), [0, CY + 0.18, 0.0]));
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + (i - 2) * 0.55;
      cab.push(cone(0.016, 0.06, t(P.gold!), [Math.cos(a) * 0.075, CY + 0.23, Math.sin(a) * 0.075 - 0.01]));
    }
  }
  rosto(cab, k, { centro: [0, CY + 0.04, 0.17], sep: 0.12, r: 0.04, iris: '#2a1a10', pele: Y });
  const ombro: V3 = [0.17, 0.44, -0.02];
  return [corpo(k, pecas), parte('cabeca', [0, CY - 0.05, 0], fundir(cab), k.mat),
    ...asas(k, ombro, rei ? 0.36 : 0.3, 0.26, A, rei ? AL : AD, rei ? 8 : 6, -0.2)];
}

const uirapuruP: Escultura = (k) => uirapuru(k, false);
const uirapuruRei: Escultura = (k) => uirapuru(k, true);

/* -------------------------------------------------- vagalumes de raio */

function vagalume(k: Kit, grande: boolean): THREE.Group[] {
  const t = k.t;
  const N = grande ? t('#24306a') : t('#2e3a6e'), NL = grande ? t('#3e4e96') : t('#4a5a9a');
  const Y = t('#f6d23a'), YL = t('#fff2a0');
  // o abdômen que acende: a cor passa de 1, brilha até na sombra
  const luz = esfera(grande ? 0.2 : 0.16, Y, [0, 0.24, -0.04], [1, 1, 1.05]);
  const brilho = esfera(grande ? 0.15 : 0.12, YL, [0, 0.22, 0.03], [1, 1, 1]);
  const pecas: THREE.BufferGeometry[] = [luz, brilho];
  for (let i = 0; i < 3; i++) pecas.push(tubo(0.15 - i * 0.03, 0.15 - i * 0.03, 0.02, N, [0, 0.32 + i * 0.07, -0.04], {}, [1, 1, 0.95]));
  pecas.push(esfera(0.13, N, [0, 0.46, 0.0], [1, 0.9, 0.95]));
  const CY = 0.58;
  const cab: THREE.BufferGeometry[] = [esfera(0.13, N, [0, CY, 0.03], [1.05, 0.95, 0.95]), esfera(0.07, NL, [0, CY - 0.04, 0.1], [1.1, 0.6, 0.6])];
  rosto(cab, k, { centro: [0, CY + 0.01, 0.14], sep: 0.11, r: 0.04, iris: '#1a1a3a', pele: N, boca: { cor: t(C.bocaF!), dy: 0.06, larg: 0.05 } });
  for (const s of [-1, 1]) {
    cab.push(tubo(0.006, 0.006, 0.14, N, [s * 0.05, CY + 0.17, 0.0], { z: -s * 0.4 }));
    if (grande) cab.push(raio(t(P.bolt!), [s * 0.08 - 0.02, CY + 0.22, 0], 0.5, { z: -s * 0.3 }));
    else cab.push(esfera(0.025, Y, [s * 0.08, CY + 0.24, 0.0]));
  }
  // as asas: de vidro claro no pequeno, de raio amarelo no grande
  const ombro: V3 = [0.1, 0.48, -0.05];
  const asaCor = grande ? t(P.bolt!) : t('#d8eefa'), asaPonta = grande ? YL : t('#d8eefa');
  return [corpo(k, pecas), parte('cabeca', [0, CY - 0.08, 0], fundir(cab), k.mat),
    ...asas(k, ombro, grande ? 0.34 : 0.24, 0.2, asaCor, asaPonta, 4, -0.5)];
}

const faisquinha: Escultura = (k) => vagalume(k, false);
const relampo: Escultura = (k) => vagalume(k, true);

/* ------------------------------------------------------------ Arco-da-Velha

   O arco-íris que bebe água: o arco das sete cores, de uma cabeça vermelha
   em cada ponta, cada uma metendo a boca no rio. */
const arcoDaVelha: Escultura = (k) => {
  const t = k.t;
  const cores = ['#e0524a', '#f09a3a', '#f2d23a', '#5fbf6a', '#4a9fd0', '#8a6ad0'];
  const pecas: THREE.BufferGeometry[] = [];
  cores.forEach((c, i) => {
    const r = 0.44 - i * 0.045;
    pecas.push(lisa(peca(new THREE.TorusGeometry(r, 0.026, 10, 40, Math.PI), t(c), 0, 0.12, 0, {}, [1, 1.05, 2.0])));
  });
  // o rio embaixo das duas pontas
  pecas.push(lisa(peca(new THREE.CylinderGeometry(0.6, 0.62, 0.05, 40), t(P.waterD!), 0, 0.025, 0, {}, [1, 1, 0.5])));
  pecas.push(lisa(peca(new THREE.TorusGeometry(0.48, 0.012, 6, 40), t(P.water!), 0, 0.055, 0, { x: Math.PI / 2 }, [1, 0.5, 1])));
  pecas.push(raio(t(P.bolt!), [-0.02, 0.6, 0], 0.7));
  // as duas cabeças vermelhas, uma em cada ponta, de cara para fora
  for (const s of [-1, 1]) {
    const X = s * 0.33;
    pecas.push(esfera(0.1, t('#e0524a'), [X, 0.13, 0.04], [1, 0.85, 1]));
    rosto(pecas, k, { centro: [X + s * 0.02, 0.15, 0.13], sep: 0.08, r: 0.026, iris: '#2a1010', pele: t('#e0524a'),
      boca: { cor: t(C.bocaF!), dy: 0.05, larg: 0.05 } });
  }
  return [corpo(k, pecas)];
};

export const AR: Record<string, Escultura> = {
  matinta, matintaPerera, uirapuru: uirapuruP, uirapuruRei, faisquinha, relampo, arcoDaVelha,
};
