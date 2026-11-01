/* Os bichos da terra: os tatus de raio, as minhocas, os gigantes peludos de
   um olho (Mapinguari, Juma) e os lobos. */
import * as THREE from 'three';
import { fundir, lisa, peca, sorte } from '../base.ts';
import { P } from '../../../art/palette.ts';
import {
  C, cone, cor, corpo, corpoComprido, escala, esfera, olho, parte, pernas4, pintar, rosto, tubo,
  type Escultura, type Kit,
} from '../escultura.ts';
import { fechar, pessoaBicho } from './gente.ts';

/* -------------------------------------------------------------------- tatus */

function tatu(k: Kit, grande: boolean): THREE.Group[] {
  const t = k.t;
  const CA = grande ? t('#6e5a46') : t('#8a7058'), CD = grande ? t('#44362a') : t('#5e4a38');
  const CL = grande ? t('#8e7660') : t('#a88a6e'), PE = grande ? t('#d8a080') : t('#e0b090');
  const pecas: THREE.BufferGeometry[] = [];
  // a carapaça: a meia-bola das costas, cortada em cintas
  const casco = esfera(0.26, CA, [0, 0.22, -0.02], [0.95, 0.85, 1.3]);
  const ca = cor(CA), cd = cor(CD), cl = cor(CL);
  pintar(casco, (p) => {
    const cinta = Math.sin(p.z * 34);
    if (cinta > 0.82) return cd;
    // as escamas miúdas de cada cinta
    return Math.sin(p.x * 70) * Math.sin(p.z * 70) > 0.6 ? cl : ca;
  });
  pecas.push(casco);
  pecas.push(esfera(0.2, PE, [0, 0.14, 0.0], [1.0, 0.5, 1.25]));
  // os raios amarelos riscados nas cintas
  for (let i = 0; i < (grande ? 4 : 3); i++) {
    const z = -0.12 + i * 0.09;
    for (const s of [-1, 1]) {
      pecas.push(lisa(peca(new THREE.BoxGeometry(0.012, 0.09, 0.018), t(P.bolt!), s * 0.2, 0.3, z, { z: s * 0.6, x: 0.3 })));
    }
  }
  if (grande) {
    // as pontas escuras do lombo do Tatuaçu
    for (let i = 0; i < 5; i++) pecas.push(cone(0.035, 0.12, CD, [0, 0.43 - Math.abs(i - 2) * 0.02, -0.22 + i * 0.11], { x: (i - 2) * 0.15 }));
  }
  pernas4(pecas, PE, CD, 0.15, 0.18, -0.18, 0.08, 0.04);
  // o rabo, de cintas também
  pecas.push(corpoComprido([[0, 0.16, -0.32], [0, 0.1, -0.44], [0.04, 0.05, -0.54]], (u) => 0.04 * (1 - u * 0.7),
    (u) => (Math.sin(u * 40) > 0.6 ? cd : ca), 10, 30));
  const CY = 0.26, CZ = 0.32;
  const cab: THREE.BufferGeometry[] = [
    esfera(0.11, PE, [0, CY, CZ], [0.95, 0.9, 1.05]),
    esfera(0.06, CA, [0, CY + 0.06, CZ - 0.01], [1.2, 0.5, 1.1]),          // o capacete da testa
    tubo(0.03, 0.055, 0.14, PE, [0, CY - 0.03, CZ + 0.14], { x: Math.PI / 2 + 0.25 }),
    esfera(0.03, t('#c87a6a'), [0, CY - 0.05, CZ + 0.21], [1, 0.8, 0.5]),
  ];
  for (const s of [-1, 1]) {
    cab.push(esfera(0.06, PE, [s * 0.07, CY + 0.1, CZ - 0.04], [0.45, 1, 0.25], { z: s * 0.3 }));
    olho(cab, [s * 0.055, CY + 0.03, CZ + 0.07], 0.025, new THREE.Vector3(s * 0.6, 0.1, 0.8), '#2a1a10', PE, k.pose);
  }
  return [corpo(k, pecas), parte('cabeca', [0, CY - 0.04, CZ - 0.08], fundir(cab), k.mat)];
}

const tatuTrovao: Escultura = (k) => tatu(k, false);
const tatuacu: Escultura = (k) => escala(tatu(k, true), 1.05);

/* ----------------------------------------------------------------- minhocas */

function minhoca(k: Kit, grande: boolean): THREE.Group[] {
  const t = k.t;
  const R = grande ? t('#c87070') : t('#e08a8a'), RD = grande ? t('#985050') : t('#b86060'), RL = grande ? t('#e09a90') : t('#f4b0a8');
  const TERRA = grande ? t('#6a4a30') : t('#7a5a3a'), TL = grande ? t('#8a6a48') : t('#9a7650');
  // o monte de terra de onde ela sai
  const monte = lisa(peca(new THREE.SphereGeometry(0.36, 26, 10, 0, Math.PI * 2, 0, Math.PI / 2), TERRA, 0, 0, 0, {}, [1, 0.32, 0.9]));
  const tc = cor(TERRA), tl = cor(TL);
  pintar(monte, (p) => (Math.sin(p.x * 40 + Math.sin(p.z * 30) * 2) > 0.7 ? tl : tc));
  const pecas: THREE.BufferGeometry[] = [monte];
  for (let i = 0; i < 6; i++) pecas.push(esfera(0.03 + sorte(i, 1) * 0.02, TL, [(sorte(i, 2) - 0.5) * 0.6, 0.06, (sorte(i, 3) - 0.5) * 0.5], [1, 0.6, 1]));
  // o corpo de anéis, subindo do monte
  const alto = grande ? 0.62 : 0.5, r0 = grande ? 0.14 : 0.1;
  const rc = cor(R), rd = cor(RD), rl = cor(RL);
  pecas.push(corpoComprido([[0, 0.02, -0.02], [0, alto * 0.4, 0.0], [0, alto * 0.75, 0.03], [0, alto, 0.05]],
    (u) => r0 * (1 + Math.sin(u * 40) * 0.06), (u, _a, barriga) => (Math.sin(u * 40) > 0.85 ? rd : barriga > 0.5 ? rl : rc), 18, 60));
  if (grande) {
    // o rabo do Minhocão saindo do outro lado do monte
    pecas.push(corpoComprido([[0.2, 0.08, -0.2], [0.3, 0.18, -0.28], [0.38, 0.12, -0.36]], (u) => 0.08 * (1 - u * 0.6),
      (u) => (Math.sin(u * 30) > 0.8 ? rd : rc), 14, 30));
  }
  const CY = alto + r0 * 0.4;
  const cab: THREE.BufferGeometry[] = [esfera(r0 * 1.15, R, [0, CY, 0.06], [1, 0.95, 0.95])];
  rosto(cab, k, { centro: [0, CY + r0 * 0.2, 0.06 + r0], sep: r0 * 0.9, r: r0 * 0.28, iris: '#2a1a1a', pele: R,
    boca: { cor: t(C.bocaF!), dy: r0 * 0.6, larg: r0 * (grande ? 1.0 : 0.5), aberta: grande } });
  if (grande) {
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * r0 * 0.22;
      cab.push(lisa(peca(new THREE.ConeGeometry(r0 * 0.07, r0 * 0.2, 5), '#f4f0e4', x, CY - r0 * 0.48, 0.06 + r0 * 1.06, { x: Math.PI })));
    }
  } else {
    // o capacete de mineiro amarelo, com a lanterna
    cab.push(lisa(peca(new THREE.SphereGeometry(r0 * 1.22, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), t('#e8c03a'), 0, CY + r0 * 0.25, 0.05)));
    cab.push(tubo(r0 * 1.4, r0 * 1.4, 0.012, t('#c89a1a'), [0, CY + r0 * 0.25, 0.05]));
    cab.push(tubo(0.025, 0.025, 0.03, t('#fff2a0'), [0, CY + r0 * 0.9, 0.05 + r0 * 1.0], { x: Math.PI / 2 }));
  }
  return [corpo(k, pecas), parte('cabeca', [0, CY - r0 * 0.8, 0.05], fundir(cab), k.mat)];
}

const minhoquinha: Escultura = (k) => minhoca(k, false);
const minhocao: Escultura = (k) => minhoca(k, true);

/* ------------------------------------------------------- gigantes de um olho */

function gigante(k: Kit, pelo: string, escuro: string, claro: string, perna: string): THREE.Group[] {
  const t = k.t, PE = t(pelo), PD = t(escuro), PL = t(claro), PN = t(perna);
  // o corpanzil peludo: a bola e os tufos de pelo em volta
  const bola = esfera(0.32, PE, [0, 0.42, 0], [1.05, 1.0, 0.85], {}, 28);
  const pc = cor(PE), pd = cor(PD), pl = cor(PL);
  pintar(bola, (p) => {
    const fio = Math.sin(p.x * 90 + Math.sin(p.y * 40) * 3) * Math.sin(p.y * 70);
    return fio > 0.55 ? pd : fio < -0.7 ? pl : pc;
  });
  const pecas: THREE.BufferGeometry[] = [bola];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    pecas.push(cone(0.06, 0.14, i % 3 ? PE : PD, [Math.cos(a) * 0.3, 0.42 + Math.sin(a) * 0.3, -0.02], { z: a - Math.PI / 2 }, [1, 1, 0.7]));
  }
  // as pernas curtas e os pés de garra
  for (const s of [-1, 1]) {
    pecas.push(tubo(0.08, 0.07, 0.14, PN, [s * 0.15, 0.08, 0.02]));
    for (let d = -1; d <= 1; d++) pecas.push(cone(0.015, 0.05, t(C.garra!), [s * 0.15 + d * 0.035, 0.02, 0.12], { x: Math.PI / 2 }));
  }
  // a boca enorme de dentes, embaixo do olho
  const aberta = k.pose === 'ataque' ? 1.4 : 1;
  pecas.push(esfera(0.13, t(C.bocaF!), [0, 0.32, 0.25], [1.2, 0.42 * aberta, 0.35]));
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.035;
    pecas.push(lisa(peca(new THREE.ConeGeometry(0.014, 0.045, 5), t(C.garra!), x, 0.36, 0.28 - Math.abs(x) * 0.25, { x: Math.PI })));
    pecas.push(lisa(peca(new THREE.ConeGeometry(0.012, 0.035, 5), t(C.garra!), x, 0.27, 0.28 - Math.abs(x) * 0.25)));
  }
  pecas.push(esfera(0.03, t(C.linguaL!), [0, 0.3, 0.27], [1.2, 0.4, 0.5]));
  // o olho só, grande, no meio da testa; os chifrinhos
  const cab: THREE.BufferGeometry[] = [];
  olho(cab, [0, 0.55, 0.24], 0.07, new THREE.Vector3(0, 0, 1), '#3a2010', PE, k.pose);
  for (const s of [-1, 1]) cab.push(cone(0.04, 0.14, PN, [s * 0.18, 0.72, 0.0], { z: -s * 0.5 }));
  // os braços, de garras
  const braco = (s: number) => fundir([
    tubo(0.06, 0.05, 0.22, PE, [s * 0.36, 0.4, 0.04], { z: s * 0.4 }),
    ...[-1, 0, 1].map((d) => cone(0.014, 0.06, t(C.garra!), [s * 0.42 + d * 0.02, 0.28, 0.08], { x: Math.PI })),
  ]);
  return [corpo(k, pecas), parte('cabeca', [0, 0.55, 0], fundir(cab), k.mat),
    parte('bracoE', [-0.3, 0.48, 0.02], braco(-1), k.mat), parte('bracoD', [0.3, 0.48, 0.02], braco(1), k.mat)];
}

const mapinguari: Escultura = (k) => gigante(k, '#6e4a32', '#4a3020', '#8e664a', '#4a3020');
const juma: Escultura = (k) => gigante(k, '#e8e0cc', '#b8ae98', '#f8f4e8', '#8a7a64');

/* -------------------------------------------------------------------- lobos */

/* o Lobo-Guará: sentado, de pernas pretas compridas e orelhão */
const lobinho: Escultura = (k) => {
  const t = k.t, L = t(C.guara!), B = t(C.guaraB!), PR = t(C.guaraP!), CL = t(C.guaraC!);
  const pecas: THREE.BufferGeometry[] = [
    esfera(0.16, L, [0, 0.3, -0.06], [0.95, 1.1, 1.0], { x: -0.4 }),
    esfera(0.11, B, [0, 0.34, 0.06], [0.85, 1.15, 0.6], { x: -0.3 }),
    // as patas de trás dobradas e as da frente retas, pretas
    esfera(0.09, L, [-0.12, 0.13, -0.08], [0.7, 0.9, 1.2]), esfera(0.09, L, [0.12, 0.13, -0.08], [0.7, 0.9, 1.2]),
  ];
  for (const s of [-1, 1]) {
    pecas.push(tubo(0.03, 0.025, 0.28, PR, [s * 0.06, 0.15, 0.08]));
    pecas.push(esfera(0.035, PR, [s * 0.06, 0.02, 0.1], [1, 0.6, 1.4]));
    pecas.push(esfera(0.035, PR, [s * 0.13, 0.02, 0.0], [1, 0.6, 1.4]));
  }
  // o rabo peludo de ponta branca
  pecas.push(corpoComprido([[0, 0.12, -0.2], [0.12, 0.06, -0.3], [0.26, 0.06, -0.24]], (u) => 0.06 * (1 - u * 0.3) * (u > 0.85 ? (1 - u) * 6 : 1),
    (u) => cor(u > 0.75 ? B : L), 12, 30));
  const CY = 0.56, CZ = 0.06;
  const cab: THREE.BufferGeometry[] = [
    esfera(0.11, L, [0, CY, CZ], [1, 0.95, 0.95]),
    esfera(0.07, CL, [0, CY - 0.04, CZ + 0.08], [0.95, 0.7, 1.05]),
    tubo(0.03, 0.05, 0.1, CL, [0, CY - 0.04, CZ + 0.13], { x: Math.PI / 2 }),
    esfera(0.02, PR, [0, CY - 0.03, CZ + 0.19]),
  ];
  for (const s of [-1, 1]) {
    cab.push(cone(0.06, 0.18, L, [s * 0.07, CY + 0.13, CZ - 0.02], { z: -s * 0.3 }, [1, 1, 0.4]));
    cab.push(cone(0.035, 0.12, B, [s * 0.07, CY + 0.12, CZ - 0.005], { z: -s * 0.3 }, [1, 1, 0.3]));
  }
  rosto(cab, k, { centro: [0, CY + 0.02, CZ + 0.1], sep: 0.09, r: 0.026, iris: '#7a4a1a', pele: L });
  return [corpo(k, pecas), parte('cabeca', [0, CY - 0.1, CZ - 0.02], fundir(cab), k.mat)];
};

/* o Lobisomem: em pé, de camisa rasgada, garra de fora */
const lobisomem: Escultura = (k) => {
  const t = k.t, L = t(C.lobi!), LL = t(C.lobiL!);
  const m = pessoaBicho(k, {
    pele: L, peleD: t(C.lobiL!), iris: '#e8b020', boca: t(C.bocaF!), tronco: t(C.camisa!), calca: t(C.calcao!),
    pe: L, quadril: 0.32, ombro: 0.6, cabecaY: 0.78, R: 0.13, largura: 0.13,
  });
  // a camisa rasgada: tiras soltas na barra
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    m.corpo.push(cone(0.03, 0.08, t(C.camisaD!), [Math.sin(a) * 0.1, 0.34, Math.cos(a) * 0.075], { x: Math.PI }, [1, 1, 0.3]));
  }
  // troca a cabeça de gente pela de lobo
  m.cabeca.length = 0;
  const CY = m.o.cabecaY;
  m.cabeca.push(
    esfera(0.13, L, [0, CY, 0], [1, 0.95, 0.95]),
    esfera(0.08, LL, [0, CY - 0.05, 0.1], [1, 0.7, 1.1]),
    tubo(0.04, 0.065, 0.12, LL, [0, CY - 0.05, 0.16], { x: Math.PI / 2 }),
    esfera(0.025, '#1a1210', [0, CY - 0.03, 0.23]),
    esfera(0.05, t(C.bocaF!), [0, CY - 0.1, 0.17], [1, k.pose === 'ataque' ? 0.7 : 0.35, 0.8]),
  );
  for (const s of [-1, 1]) {
    m.cabeca.push(cone(0.05, 0.13, L, [s * 0.08, CY + 0.13, -0.02], { z: -s * 0.35 }, [1, 1, 0.5]));
    m.cabeca.push(lisa(peca(new THREE.ConeGeometry(0.01, 0.035, 5), t(C.garra!), s * 0.025, CY - 0.09, 0.2, { x: Math.PI })));
    olho(m.cabeca, [s * 0.05, CY + 0.03, 0.1], 0.024, new THREE.Vector3(s * 0.3, 0.05, 1), '#e8b020', L, k.pose);
    m.cabeca.push(esfera(0.02, '#2a1a10', [s * 0.05, CY + 0.065, 0.11], [1.4, 0.3, 0.5], { z: -s * 0.4 }));
  }
  // a juba em volta do pescoço e as garras das mãos
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    m.cabeca.push(cone(0.04, 0.12, L, [Math.sin(a) * 0.12, CY - 0.11, Math.cos(a) * 0.09 - 0.02], { z: -Math.sin(a) * 1.3, x: Math.cos(a) * 1.3 }));
  }
  for (const [lista, s] of [[m.bracoE, -1], [m.bracoD, 1]] as const) {
    for (let d = -1; d <= 1; d++) lista.push(cone(0.008, 0.04, t(C.garra!), [s * 0.17 + d * 0.012, 0.26, 0.06], { x: Math.PI }));
  }
  // o rabo
  m.corpo.push(corpoComprido([[0, 0.32, -0.08], [0, 0.22, -0.2], [0.06, 0.18, -0.32]], (u) => 0.05 * (1 - u * 0.5), () => cor(L), 12, 24));
  return fechar(k, m);
};

export const TERRA: Record<string, Escultura> = {
  tatuTrovao, tatuacu, minhoquinha, minhocao, mapinguari, juma, lobinho, lobisomem,
};
