/* Os bichos da mata e do campo: Curupirá, Anhangá, os Sacis, as Caiporas e
   as cabras. */
import * as THREE from 'three';
import { fundir, lisa, peca } from '../base.ts';
import {
  C, cone, cor, corpo, corpoComprido, escala, esfera, fogueira, olho, parte, pernas4, rosto, tubo,
  type Escultura, type Kit, type V3,
} from '../escultura.ts';
import { curupinho } from './iniciais.ts';
import { calota, fechar, pessoaBicho } from './gente.ts';

/* o Curupirá: o Curupinho crescido, de lança comprida e cabelo maior */
const curupira: Escultura = (k) => escala(curupinho(k.t, k.mat, k.pose), 1.05);

/* ------------------------------------------------------------------ Anhangá

   O veado branco de olho de fogo, guardião dos bichos: pernas finas, pescoço
   alto, a galhada de ponta verde. */
const anhanga: Escultura = (k) => {
  const B = k.t('#f4f0e8'), BD = k.t('#c8c0b0'), G = k.t('#8a6a48');
  const pecas: THREE.BufferGeometry[] = [
    esfera(0.18, B, [0, 0.5, -0.02], [0.82, 0.8, 1.5]),
    esfera(0.13, BD, [0, 0.43, 0.0], [0.75, 0.55, 1.3]),
    esfera(0.05, B, [0, 0.6, -0.28], [0.7, 1, 0.8]),
    tubo(0.07, 0.09, 0.28, B, [0, 0.68, 0.2], { x: 0.45 }),
  ];
  for (const x of [-0.08, 0.08]) {
    for (const z of [-0.17, 0.17]) {
      pecas.push(tubo(0.035, 0.022, 0.42, B, [x, 0.23, z]));
      pecas.push(esfera(0.026, G, [x, 0.02, z + 0.01], [1, 0.8, 1.3]));
    }
  }
  const CY = 0.86, CZ = 0.28;
  const cab: THREE.BufferGeometry[] = [
    esfera(0.09, B, [0, CY, CZ], [0.85, 0.9, 1.1]),
    esfera(0.055, B, [0, CY - 0.03, CZ + 0.1], [0.85, 0.75, 1.2]),
    esfera(0.018, '#2a2024', [0, CY - 0.02, CZ + 0.17]),
  ];
  for (const s of [-1, 1]) {
    olho(cab, [s * 0.058, CY + 0.02, CZ + 0.05], 0.022, new THREE.Vector3(s * 0.7, 0, 0.7), k.t(C.fogoV!), B, k.pose);
    cab.push(esfera(0.05, B, [s * 0.1, CY + 0.06, CZ - 0.03], [0.4, 1, 0.25], { z: s * 1.0 }));
    // a galhada: o tronco do chifre e três pontas, a de cima verde de broto
    const base: V3 = [s * 0.04, CY + 0.07, CZ - 0.02];
    cab.push(tubo(0.012, 0.016, 0.18, G, [base[0] + s * 0.03, base[1] + 0.08, base[2] - 0.02], { z: -s * 0.35 }));
    for (let i = 0; i < 3; i++) {
      const y = base[1] + 0.06 + i * 0.05, x = base[0] + s * (0.05 + i * 0.03);
      cab.push(tubo(0.006, 0.01, 0.08, i === 2 ? k.t(C.cur!) : G, [x + s * 0.02, y + 0.03, base[2] + 0.01], { z: -s * (0.9 - i * 0.3) }));
    }
  }
  return [corpo(k, pecas), parte('cabeca', [0, CY - 0.1, CZ - 0.08], fundir(cab), k.mat)];
};

/* ------------------------------------------------------------------- Sacis */

function saci(k: Kit): THREE.Group[] {
  const t = k.t;
  const m = pessoaBicho(k, {
    pele: t(C.saci!), peleD: '#5a3a28', iris: '#2a1810', boca: '#5a2a24', pernas: 1,
    calca: t(C.gorroD!), quadril: 0.36, ombro: 0.58, cabecaY: 0.74, base: [0, 0.06, 0],
  });
  // o gorro vermelho: a barra, a copa alta e a ponta caindo para trás
  const { cabecaY: CY, R } = m.o;
  calota(m, '#1a1210', 0.4);
  m.cabeca.push(tubo(R * 1.04, R * 1.07, 0.045, t(C.gorroD!), [0, CY + R * 0.5, -0.01], { x: -0.2 }));
  m.cabeca.push(cone(R * 1.02, 0.2, t(C.gorro!), [0, CY + R * 0.5 + 0.1, -0.04], { x: -0.45 }, [1, 1, 0.9]));
  m.cabeca.push(cone(R * 0.5, 0.14, t(C.gorroL!), [0, CY + R * 0.5 + 0.17, -0.15], { x: -1.6 }));
  // o cachimbo no canto da boca, soltando fumaça
  m.cabeca.push(tubo(0.006, 0.006, 0.1, t(C.cachimbo!), [0.06, CY - R * 0.5, R * 0.9], { z: Math.PI / 2 - 0.3, y: -0.5 }));
  m.cabeca.push(tubo(0.02, 0.016, 0.04, t(C.cachimbo!), [0.11, CY - R * 0.4, R * 0.95]));
  for (let i = 0; i < 3; i++) m.cabeca.push(esfera(0.014 + i * 0.007, t('#d9d9d9'), [0.14 + i * 0.03, CY - R * 0.1 + i * 0.06, R * 0.8 - i * 0.02], [1, 0.8, 1]));
  // o redemoinho embaixo do pé: anéis de vento subindo e abrindo
  const vento: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    vento.push(lisa(peca(new THREE.TorusGeometry(0.09 + i * 0.035, 0.011, 6, 28, Math.PI * 1.6), i % 2 ? t(C.vento!) : t(C.ventoD!),
      0, 0.015 + i * 0.022, 0, { x: Math.PI / 2, z: i * 1.3 })));
  }
  return fechar(k, m, vento);
}

const sacizinho: Escultura = (k) => saci(k);
const saciGrande: Escultura = (k) => escala(saci(k), 1.12);

/* ---------------------------------------------------------------- Caiporas */

function caiporinhaM(k: Kit, base: V3 = [0, 0, 0], sentada = false) {
  const t = k.t;
  const m = pessoaBicho(k, {
    pele: t(C.peleM!), peleD: '#7a4a32', iris: '#2a1810', boca: '#6a3028', pernas: sentada ? 0 : 2, base,
  });
  const { cabecaY: CY, R } = m.o;
  // o cabelão laranja: a calota, a franja e o comprido nas costas
  calota(m, t(C.cabeloC!), 0.55);
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.022;
    m.cabeca.push(esfera(0.019, t(C.cabeloC!), [x, CY + 0.07, R * 0.86 - Math.abs(x) * 0.4], [1.15, 2.1, 0.4], { x: 0.25 }));
  }
  m.cabeca.push(esfera(0.14, t(C.cabeloC!), [0, CY - 0.1, -0.06], [1.05, 1.6, 0.5]));
  // a tiara de palha
  m.cabeca.push(lisa(peca(new THREE.TorusGeometry(R * 1.02, 0.012, 6, 24), t(C.palha!), 0, CY + 0.06, -0.01, { x: Math.PI / 2 - 0.3 })));
  // a saia de folhas
  const Q = m.o.quadril;
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    m.corpo.push(lisa(peca(new THREE.ConeGeometry(0.03, 0.12, 6), i % 2 ? t(C.cur!) : t(C.curD!),
      Math.sin(a) * 0.08, Q + 0.01, Math.cos(a) * 0.065, { x: Math.cos(a) * 0.35 + Math.PI, z: -Math.sin(a) * 0.35, y: a }, [1, 1, 0.3])));
  }
  if (sentada) {
    // as pernas abertas, uma de cada lado do porco
    for (const s of [-1, 1]) {
      m.corpo.push(tubo(0.03, 0.026, 0.16, t(C.peleM!), [s * 0.1, Q - 0.04, 0.03], { z: s * 0.9 }));
      m.corpo.push(tubo(0.026, 0.022, 0.14, t(C.peleM!), [s * 0.17, Q - 0.13, 0.05]));
    }
  }
  return m;
}

const caiporinha: Escultura = (k) => fechar(k, caiporinhaM(k));

/* a Caipora montada no porco-do-mato */
const caipora: Escultura = (k) => escala(caiporaMontada(k), 0.82);
function caiporaMontada(k: Kit): THREE.Group[] {
  const t = k.t, PO = t(C.porco!), PD = t(C.porcoD!), PL = t(C.porcoL!);
  const porco: THREE.BufferGeometry[] = [
    esfera(0.2, PO, [0, 0.3, 0], [0.9, 0.78, 1.45]),
    esfera(0.15, PD, [0, 0.42, -0.05], [0.55, 0.3, 1.4]),      // a crina escura
    esfera(0.12, PL, [0, 0.24, 0.04], [0.8, 0.55, 1.2]),
    // a cabeça do porco: focinho comprido, presas e orelhas
    esfera(0.11, PO, [0, 0.3, 0.32], [0.9, 0.9, 1.1]),
    tubo(0.05, 0.065, 0.1, PO, [0, 0.27, 0.43], { x: Math.PI / 2 }),
    esfera(0.05, t(C.focinho!), [0, 0.27, 0.48], [1, 0.85, 0.3]),
    esfera(0.035, PD, [-0.07, 0.42, 0.28], [0.5, 1, 0.3], { z: 0.5 }),
    esfera(0.035, PD, [0.07, 0.42, 0.28], [0.5, 1, 0.3], { z: -0.5 }),
  ];
  for (const s of [-1, 1]) {
    porco.push(lisa(peca(new THREE.ConeGeometry(0.01, 0.05, 6), '#f0e8d0', s * 0.04, 0.24, 0.47, { z: s * 0.6 })));
    olho(porco, [s * 0.055, 0.34, 0.39], 0.018, new THREE.Vector3(s * 0.6, 0, 0.8), '#2a1810', PO, k.pose);
  }
  pernas4(porco, PO, PD, 0.1, 0.17, -0.17, 0.16, 0.04);
  porco.push(cone(0.02, 0.08, PD, [0, 0.33, -0.31], { x: -1.0 }));
  const m = caiporinhaM(k, [0, 0.2, -0.03], true);
  return fechar(k, m, porco);
}

/* ------------------------------------------------------------------- cabras */

function cabra(k: Kit, grande: boolean): THREE.Group[] {
  const t = k.t, B = t(C.cab!), BL = t(C.cabL!), BD = t(C.cabD!), CH = t(C.chif!), CHD = t(C.chifD!);
  const pecas: THREE.BufferGeometry[] = [
    esfera(0.19, B, [0, 0.42, -0.02], [0.85, 0.8, 1.35]),
    esfera(0.15, BL, [0, 0.37, 0.02], [0.8, 0.6, 1.2]),
    tubo(0.06, 0.08, 0.2, B, [0, 0.58, 0.18], { x: 0.4 }),
    cone(0.03, 0.1, BD, [0, 0.52, -0.27], { x: -2.2 }),
  ];
  pernas4(pecas, B, CHD, 0.09, 0.15, -0.15, 0.27, 0.035);
  const CY = 0.72, CZ = 0.26;
  const cab: THREE.BufferGeometry[] = [
    esfera(0.1, B, [0, CY, CZ], [0.85, 0.95, 1.05]),
    esfera(0.065, BL, [0, CY - 0.05, CZ + 0.09], [0.85, 0.75, 1.1]),
    esfera(0.025, BD, [0, CY - 0.11, CZ + 0.07], [0.6, 1.4, 0.6]),        // o cavanhaque
  ];
  rosto(cab, k, { centro: [0, CY + 0.02, CZ + 0.09], sep: 0.1, r: 0.025, iris: '#6a4a1a', pele: B, fenda: false,
    boca: { cor: t(grande ? C.bocaF! : C.boca!), dy: 0.08, larg: 0.05, aberta: grande } });
  for (const s of [-1, 1]) {
    cab.push(esfera(0.05, B, [s * 0.1, CY + 0.03, CZ - 0.03], [0.9, 0.35, 0.5], { z: s * 0.4 }));
    if (grande) {
      // o chifre grande, enrolado para trás, com fogo na ponta
      const pts: V3[] = [];
      for (let i = 0; i <= 10; i++) {
        const a = i * 0.5;
        pts.push([s * (0.05 + i * 0.012), CY + 0.08 + Math.sin(a) * (0.04 + i * 0.008), CZ - 0.02 - Math.cos(a) * (0.04 + i * 0.006) + 0.04]);
      }
      cab.push(corpoComprido(pts, (u) => 0.035 * (1 - u * 0.6), (u) => (Math.sin(u * 50) > 0.3 ? cor(CHD) : cor(CH)), 10, 40));
      fogueira(cab, k, [s * 0.17, CY + 0.12, CZ - 0.02], 0.12, 3);
    } else {
      cab.push(cone(0.018, 0.09, CH, [s * 0.035, CY + 0.12, CZ - 0.03], { x: -0.4, z: -s * 0.2 }));
    }
  }
  return [corpo(k, pecas), parte('cabeca', [0, CY - 0.1, CZ - 0.08], fundir(cab), k.mat)];
}

const cabritinha: Escultura = (k) => cabra(k, false);
const cabraCabriola: Escultura = (k) => cabra(k, true);

export const MATA: Record<string, Escultura> = {
  curupira, anhanga, sacizinho, saci: saciGrande, caiporinha, caipora, cabritinha, cabraCabriola,
};
