/* As assombrações: o Corpo-Seco, a Alma-Penada, as Cucas, a Pisadeira e o
   Pesadelo. */
import * as THREE from 'three';
import { fundir, lisa, peca } from '../base.ts';
import { P } from '../../../art/palette.ts';
import {
  C, chama, cone, cor, corpo, corpoComprido, esfera, manto, olho, parte, pintar, rosto, tubo,
  type Escultura, type Kit,
} from '../escultura.ts';
import { calota, fechar, pessoaBicho } from './gente.ts';

/* o Corpo-Seco: magro, de pele seca enrolada em tiras, com o cajado de galho */
const corpoSeco: Escultura = (k) => {
  const t = k.t, PE = t('#9a8a6a'), PD = t('#5a4e44'), G = t('#4a3a2a');
  const m = pessoaBicho(k, {
    pele: PE, peleD: PD, iris: t('#f2d23a'), boca: '#2a2018', quadril: 0.32, ombro: 0.58, cabecaY: 0.76, R: 0.115, largura: 0.09,
    tronco: t('#6a5e48'),
  });
  // as tiras de pele seca: anéis escuros no tronco e nas pernas
  for (let i = 0; i < 4; i++) m.corpo.push(tubo(0.085 - i * 0.004, 0.09 - i * 0.004, 0.012, PD, [0, 0.38 + i * 0.05, 0], {}, [1, 1, 0.75]));
  // a cabeça seca e pontuda, de olho aceso e sem boca de gente
  m.cabeca.length = 0;
  const CY = m.o.cabecaY;
  m.cabeca.push(esfera(0.115, PE, [0, CY, 0], [0.9, 1.05, 0.95]), cone(0.07, 0.12, PE, [0, CY + 0.14, -0.01], { x: -0.2 }));
  const cab = m.cabeca;
  for (const s of [-1, 1]) olho(cab, [s * 0.04, CY + 0.01, 0.09], 0.024, new THREE.Vector3(s * 0.15, 0, 1), t('#f2d23a'), PE, k.pose, true);
  cab.push(esfera(0.03, PD, [0, CY - 0.06, 0.1], [1.2, 0.2, 0.4]));
  for (let i = 0; i < 3; i++) cab.push(tubo(0.118, 0.118, 0.01, PD, [0, CY - 0.04 + i * 0.05, 0], { x: 0.1 * i }, [0.9, 1, 0.96]));
  // o cajado de galho seco, na mão direita
  m.bracoD.push(tubo(0.016, 0.022, 0.86, G, [0.15, 0.42, 0.06]));
  m.bracoD.push(tubo(0.008, 0.012, 0.16, G, [0.2, 0.86, 0.06], { z: -0.7 }));
  m.bracoD.push(tubo(0.006, 0.01, 0.12, G, [0.12, 0.84, 0.06], { z: 0.6 }));
  return fechar(k, m);
};

/* a Alma-Penada: o lençol branco que flutua, segurando a vela acesa */
const almaPenada: Escultura = (k) => {
  const t = k.t, B = t('#e8eef8'), BS = t('#b0bcd8');
  const pecas: THREE.BufferGeometry[] = [manto(0.15, 0.27, 0.48, B, [0, 0.06, 0], 8, 0.08)];
  const cab: THREE.BufferGeometry[] = [esfera(0.17, B, [0, 0.56, 0], [1, 1.05, 0.95])];
  rosto(cab, k, { centro: [0, 0.58, 0.15], sep: 0.11, r: 0.035, iris: '#1a1a2a', pele: B, boca: { cor: t(C.bocaF!), dy: 0.08, larg: 0.05, aberta: true } });
  // as lágrimas azuladas descendo
  for (const s of [-1, 1]) cab.push(esfera(0.012, BS, [s * 0.06, 0.5, 0.155], [0.8, 2.2, 0.5]));
  const vela = [
    tubo(0.022, 0.022, 0.1, t('#f2e8c8'), [0.26, 0.42, 0.08]),
    esfera(0.05, B, [0.24, 0.36, 0.08], [1.1, 0.7, 1]),
    chama(0.08, 0.025, [0.26, 0.47, 0.08], {}, t),
    esfera(0.012, t(C.fogoV!), [0.26, 0.47, 0.08]),
  ];
  return [corpo(k, pecas), parte('cabeca', [0, 0.42, 0], fundir(cab), k.mat), parte('bracoD', [0.18, 0.4, 0], fundir(vela), k.mat)];
};

/* ------------------------------------------------------------------- Cucas */

function cuca(k: Kit, rainha: boolean): THREE.Group[] {
  const t = k.t, V = t(C.cuca!), VL = t(C.cucaL!), B = t(C.cucaB!), BD = t(C.cucaBD!), LO = t(C.loiro!), LOL = t(C.loiroL!);
  const pecas: THREE.BufferGeometry[] = [];
  // em pé, de barriga clara em placas, rabo grosso apoiado no chão
  const tronco = esfera(0.2, V, [0, 0.38, 0], [1, 1.25, 0.85]);
  const vc = cor(V), vl = cor(VL);
  pintar(tronco, (p) => (Math.sin(p.x * 60) * Math.sin(p.y * 60) > 0.5 ? vl : vc));
  pecas.push(tronco);
  const barriga = esfera(0.15, B, [0, 0.34, 0.08], [0.95, 1.2, 0.6]);
  const bc = cor(B), bd = cor(BD);
  pintar(barriga, (p) => (Math.sin(p.y * 70) > 0.75 ? bd : bc));
  pecas.push(barriga);
  pecas.push(corpoComprido([[0, 0.2, -0.12], [0.05, 0.08, -0.3], [0.2, 0.05, -0.42], [0.36, 0.05, -0.4]], (u) => 0.1 * (1 - u * 0.8),
    (u, a) => (Math.sin(u * 50 + a) > 0.8 ? vl : vc), 14, 40));
  for (const s of [-1, 1]) {
    pecas.push(tubo(0.06, 0.05, 0.14, V, [s * 0.1, 0.1, 0.02]));
    for (let d = -1; d <= 1; d++) pecas.push(esfera(0.02, V, [s * 0.1 + d * 0.025, 0.02, 0.09], [0.8, 0.6, 1.4]));
  }
  if (rainha) {
    // o manto roxo de rainha, caindo das costas até o chão
    pecas.push(manto(0.14, 0.3, 0.6, t(C.manto!), [0, 0.02, -0.06], 9, 0.04, [1, 1, 0.75]));
    pecas.push(esfera(0.12, t(C.mantoL!), [0, 0.62, -0.06], [1.6, 0.4, 0.8]));
  }
  // a cabeça de jacaré: o focinho comprido e a cabeleira loira
  const CY = 0.7;
  const cab: THREE.BufferGeometry[] = [
    esfera(0.14, V, [0, CY, 0.02], [1, 0.85, 1]),
    esfera(0.09, V, [0, CY - 0.03, 0.18], [0.95, 0.55, 1.6]),
    esfera(0.08, B, [0, CY - 0.07, 0.17], [0.9, 0.35, 1.5]),
  ];
  for (let i = 0; i < 7; i++) {
    const z = 0.1 + i * 0.03;
    for (const s of [-1, 1]) cab.push(lisa(peca(new THREE.ConeGeometry(0.008, 0.025, 5), '#f4f0e4', s * (0.065 - i * 0.004), CY - 0.06, z, { x: Math.PI })));
  }
  for (const s of [-1, 1]) cab.push(esfera(0.007, '#1a1210', [s * 0.025, CY - 0.0, 0.32]));
  for (const s of [-1, 1]) olho(cab, [s * 0.065, CY + 0.07, 0.08], 0.034, new THREE.Vector3(s * 0.3, 0.2, 1), t('#e8a020'), V, k.pose, true);
  // a cabeleira: a calota loira e as mechas caindo nas costas
  cab.push(lisa(peca(new THREE.SphereGeometry(0.155, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), LO, 0, CY + 0.02, -0.03, { x: -0.6 })));
  for (let i = 0; i < 7; i++) {
    const a = -1.2 + i * 0.4;
    cab.push(esfera(0.05, i % 2 ? LO : LOL, [Math.sin(a) * 0.13, CY - 0.1, Math.cos(a) * -0.08 - 0.04], [0.6, 2.4, 0.6]));
  }
  if (rainha) {
    cab.push(tubo(0.09, 0.095, 0.04, t(P.gold!), [0, CY + 0.15, -0.02]));
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + (i - 2) * 0.55;
      cab.push(cone(0.018, 0.07, t(P.gold!), [Math.cos(a) * 0.085, CY + 0.2, Math.sin(a) * 0.085 - 0.02]));
    }
  }
  const braco = (s: number) => fundir([
    tubo(0.045, 0.04, 0.2, V, [s * 0.22, 0.42, 0.04], { z: s * 0.5 }),
    ...[-1, 0, 1].map((d) => cone(0.01, 0.04, '#f0e8d0', [s * 0.28 + d * 0.02, 0.33, 0.07], { x: Math.PI })),
  ]);
  return [corpo(k, pecas), parte('cabeca', [0, CY - 0.12, 0], fundir(cab), k.mat),
    parte('bracoE', [-0.17, 0.5, 0.02], braco(-1), k.mat), parte('bracoD', [0.17, 0.5, 0.02], braco(1), k.mat)];
}

const cucaP: Escultura = (k) => cuca(k, false);
const cucaRainha: Escultura = (k) => cuca(k, true);

/* a Pisadeira: a mulher magra de vestido escuro, de pé em cima da colcha
   vermelha, com os dedos compridos abertos */
const pisadeira: Escultura = (k) => {
  const t = k.t, V = t('#1a1424'), VL = t('#3a2a4a'), PE = t('#d8d0dc'), CO = t('#a8483a');
  const m = pessoaBicho(k, {
    pele: PE, peleD: t('#b0a4b8'), iris: '#7a1a24', boca: '#5a1a24', pernas: 0, tronco: V,
    quadril: 0.34, ombro: 0.6, cabecaY: 0.77, R: 0.12, largura: 0.09, base: [0, 0.04, 0],
  });
  // o vestido comprido até o chão, de barra em bicos
  m.corpo.push(manto(0.09, 0.24, 0.42, V, [0, -0.02, 0], 10, 0.05, [1, 1, 0.8]));
  m.corpo.push(manto(0.06, 0.15, 0.3, VL, [0, 0.08, 0.02], 6, 0.03, [1, 1, 0.6]));
  // o cabelo preto liso, comprido
  calota(m, t('#1a1424'), 0.55);
  m.cabeca.push(esfera(0.13, t('#1a1424'), [0, m.o.cabecaY - 0.12, -0.05], [1.05, 1.6, 0.5]));
  // os dedos compridos das duas mãos
  for (const [lista, s] of [[m.bracoE, -1], [m.bracoD, 1]] as const) {
    for (let d = 0; d < 4; d++) lista.push(tubo(0.006, 0.004, 0.07, PE, [s * (0.15 + d * 0.006), 0.27, 0.05 + (d - 1.5) * 0.012], { x: 0.3 }));
  }
  // a colcha vermelha embaixo
  const colcha = [lisa(peca(new THREE.CylinderGeometry(0.4, 0.42, 0.04, 36), CO, 0, 0.02, 0, {}, [1, 1, 0.6])),
    lisa(peca(new THREE.TorusGeometry(0.4, 0.012, 6, 36), t('#7a3028'), 0, 0.04, 0, { x: Math.PI / 2 }, [1, 0.6, 1]))];
  return fechar(k, m, colcha);
};

/* o Pesadelo: o manto aberto, escuro, de orelhas pontudas e olho vermelho,
   com a lua no peito e as mãos de garra para cima */
const pesadelo: Escultura = (k) => {
  const t = k.t, E = t('#2e2240'), EL = t('#4a3a62'), LUA = t('#f2e8b8');
  const pecas: THREE.BufferGeometry[] = [
    manto(0.12, 0.36, 0.5, E, [0, 0.1, 0], 7, 0.1, [1, 1, 0.8]),
    manto(0.08, 0.22, 0.36, EL, [0, 0.16, 0.04], 5, 0.06, [1, 1, 0.55]),
  ];
  // a lua minguante no peito
  pecas.push(lisa(peca(new THREE.TorusGeometry(0.045, 0.013, 8, 20, Math.PI * 1.2), LUA, 0, 0.38, 0.17, { z: 1.0 })));
  const CY = 0.7;
  const cab: THREE.BufferGeometry[] = [
    esfera(0.15, E, [0, CY, 0], [1.05, 0.95, 0.95]),
    cone(0.05, 0.13, E, [-0.1, CY + 0.15, -0.01], { z: 0.35 }),
    cone(0.05, 0.13, E, [0.1, CY + 0.15, -0.01], { z: -0.35 }),
  ];
  rosto(cab, k, { centro: [0, CY + 0.02, 0.13], sep: 0.11, r: 0.035, iris: t('#d03040'), pele: E,
    boca: { cor: t('#f0e8f0'), dy: 0.07, larg: 0.07 } });
  const braco = (s: number) => fundir([
    tubo(0.04, 0.05, 0.24, E, [s * 0.26, 0.5, 0.02], { z: s * 1.0 }),
    esfera(0.04, EL, [s * 0.36, 0.58, 0.03]),
    ...[-1, 0, 1].map((d) => cone(0.01, 0.06, t('#f0e8f0'), [s * 0.37 + d * 0.025, 0.64, 0.03], { z: -d * 0.3 })),
  ]);
  return [corpo(k, pecas), parte('cabeca', [0, CY - 0.12, 0], fundir(cab), k.mat),
    parte('bracoE', [-0.14, 0.46, 0.02], braco(-1), k.mat), parte('bracoD', [0.14, 0.46, 0.02], braco(1), k.mat)];
};

export const SOMBRA: Record<string, Escultura> = {
  corpoSeco, almaPenada, cuca: cucaP, cucaRainha, pisadeira, pesadelo,
};
