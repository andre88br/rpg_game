/* Os bichos de fogo: as cobras de fogo crescidas, a Mula e a Mulinha de
   cabeça de chama, os lagartos da Salamanca, e o ouro que voa e que brilha. */
import * as THREE from 'three';
import { fundir, lisa, peca, sorte } from '../base.ts';
import {
  C, chama, cor, corpo, corpoComprido, escala, esfera, facetada, fogueira, olho, parte, rosto, torneado, tubo,
  type Escultura, type Kit, type V3,
} from '../escultura.ts';

/* ------------------------------------------------------- cobras de fogo */

interface Cobra {
  pontos: V3[];
  raio: (u: number) => number;
  cabeca: V3;            // o centro do crânio
  tam: number;           // tamanho da cabeça
  iris: string;
  coroa: number;         // altura das chamas da coroa
  rabo: number;          // altura da chama do rabo
}

function cobraDeFogo(k: Kit, o: Cobra): THREE.Group[] {
  const t = k.t;
  const verde = cor(t(C.boi!)), escuro = cor(t(C.boiD!)), claro = cor(t(C.boiL!));
  const amarelo = cor(t(C.boiB!)), placa = cor(t(C.boiBD!));
  const pecas = [corpoComprido(o.pontos, o.raio, (u, a, barriga) => {
    if (barriga > 0.35) return Math.sin(u * 190) > 0.55 ? placa : amarelo;
    const losango = Math.abs(((u * 30) % 1) - 0.5) * 2 + Math.abs(Math.sin(a)) * 0.9;
    return losango < 0.55 ? escuro : barriga < -0.8 && losango > 1.1 ? claro : verde;
  }, 18, 110)];
  const fim = o.pontos[0]!;
  fogueira(pecas, k, [fim[0], fim[1], fim[2]], o.rabo, 3, -0.3);

  const [X, Y, Z] = o.cabeca, s = o.tam;
  const cab = [
    esfera(0.1 * s, t(C.boi!), [X, Y, Z], [1, 0.72, 1.25]),
    esfera(0.075 * s, t(C.boi!), [X, Y - 0.005 * s, Z + 0.09 * s], [1, 0.62, 1.1]),
    esfera(0.08 * s, t(C.boiB!), [X, Y - 0.035 * s, Z + 0.055 * s], [0.95, 0.4, 1.25]),
    esfera(0.075 * s, t(C.bocaF!), [X, Y - 0.02 * s, Z + 0.07 * s], [1.0, k.pose === 'ataque' ? 0.25 : 0.06, 1.2]),
    esfera(0.005 * s, '#1a1210', [X - 0.022 * s, Y + 0.012 * s, Z + 0.175 * s], [1, 0.6, 1]),
    esfera(0.005 * s, '#1a1210', [X + 0.022 * s, Y + 0.012 * s, Z + 0.175 * s], [1, 0.6, 1]),
  ];
  if (k.pose !== 'desmaio') {
    cab.push(tubo(0.006 * s, 0.006 * s, 0.08 * s, t(C.lingua!), [X, Y - 0.03 * s, Z + 0.2 * s], { x: Math.PI / 2 + 0.3 }));
    for (const l of [-1, 1]) cab.push(tubo(0.004 * s, 0.005 * s, 0.04 * s, t(C.lingua!), [X + l * 0.01 * s, Y - 0.045 * s, Z + 0.25 * s], { x: Math.PI / 2 + 0.3, z: -l * 0.5 }));
  }
  for (const l of [-1, 1]) {
    olho(cab, [X + l * 0.062 * s, Y + 0.03 * s, Z + 0.08 * s], 0.032 * s, new THREE.Vector3(l * 0.85, 0.15, 0.55), o.iris, t(C.boi!), k.pose, true);
  }
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.035 * s, alto = o.coroa * (1 - Math.abs(i - 2) * 0.17);
    cab.push(chama(alto, 0.045 * s, [X + x, Y + 0.045 * s, Z - 0.02 * s - Math.abs(i - 2) * 0.01 * s], { x: -0.45 + sorte(i, 1) * 0.15, z: -x * 2.5 / s }, t));
  }
  return [corpo(k, pecas), parte('cabeca', [X, Y - 0.05 * s, Z - 0.04 * s], fundirTudo(cab), k.mat)];
}

/* a cobra crescida, em pé feito naja, mais alta e de rabo mais aceso */
const boitatao: Escultura = (k) => cobraDeFogo(k, {
  pontos: [[0.42, 0.06, -0.26], [0.36, 0.07, 0.02], [0.14, 0.09, 0.18], [-0.14, 0.09, 0.13], [-0.22, 0.09, -0.1],
    [-0.04, 0.12, -0.2], [0.07, 0.26, -0.08], [0.03, 0.48, 0.0], [0.0, 0.66, 0.04], [0.0, 0.78, 0.08]],
  raio: (u) => (u < 0.1 ? 0.014 + (u / 0.1) * 0.055 : u > 0.95 ? 0.088 : 0.07 + Math.min(1, (u - 0.1) / 0.4) * 0.035),
  cabeca: [0, 0.84, 0.12], tam: 1.2, iris: '#e8a020', coroa: 0.24, rabo: 0.3,
});

/* a Mboitatá se arrasta em S, rente ao chão, só a cabeça levantada */
const mboitata: Escultura = (k) => cobraDeFogo(k, {
  pontos: [[-0.5, 0.06, -0.3], [-0.3, 0.07, -0.05], [-0.05, 0.08, -0.22], [0.2, 0.08, -0.02], [0.08, 0.09, 0.2],
    [0.0, 0.2, 0.3], [0.0, 0.34, 0.34]],
  raio: (u) => (u < 0.1 ? 0.016 + (u / 0.1) * 0.06 : 0.08 + Math.min(1, (u - 0.1) / 0.4) * 0.03),
  cabeca: [0, 0.4, 0.4], tam: 1.35, iris: k.t(C.olhoAzul!), coroa: 0.3, rabo: 0.36,
});

/* --------------------------------------------- a Mula e a Mulinha de fogo */

/* a cabeça de chama, com cara: uma labareda grande e o rosto na frente */
function cabecaDeFogo(k: Kit, base: V3, tam: number): THREE.BufferGeometry[] {
  const pecas: THREE.BufferGeometry[] = [chama(tam, tam * 0.42, base, {}, k.t)];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    pecas.push(chama(tam * 0.6, tam * 0.2, [base[0] + Math.cos(a) * tam * 0.2, base[1] + tam * 0.1, base[2] + Math.sin(a) * tam * 0.2],
      { z: -Math.cos(a) * 0.5, x: Math.sin(a) * 0.5 }, k.t));
  }
  rosto(pecas, k, {
    centro: [base[0], base[1] + tam * 0.36, base[2] + tam * 0.36], sep: tam * 0.34, r: tam * 0.1,
    iris: '#3a2210', pele: k.t(C.fogoA!), boca: { cor: k.t(C.bocaF!), dy: tam * 0.17, larg: tam * 0.2 },
  });
  return pecas;
}

/* a Mulinha, de pé; a Mula-sem-Cabeça, empinada nas patas de trás */
function mula(k: Kit, empina: boolean): THREE.Group[] {
  const t = k.t, M = t(C.mul!), MD = t(C.mulD!), CASCO = t(C.casco!);
  const pecas: THREE.BufferGeometry[] = [];
  const casco = (p: V3, giro = {}) => {
    pecas.push(esfera(0.045, CASCO, p, [1, 0.7, 1.2], giro));
    fogueira(pecas, k, [p[0], p[1] - 0.02, p[2]], 0.09, 2);
  };
  let pesc: V3;
  if (!empina) {
    pecas.push(esfera(0.2, M, [0, 0.42, 0], [0.85, 0.8, 1.45]));
    pecas.push(esfera(0.16, MD, [0, 0.36, -0.03], [0.85, 0.7, 1.3]));
    for (const x of [-0.1, 0.1]) {
      for (const z of [-0.18, 0.18]) {
        pecas.push(tubo(0.05, 0.035, 0.32, M, [x, 0.19, z]));
        casco([x, 0.03, z + 0.01]);
      }
    }
    pecas.push(tubo(0.08, 0.1, 0.24, M, [0, 0.58, 0.24], { x: 0.5 }));
    fogueira(pecas, k, [0, 0.46, -0.3], 0.22, 3, -0.7);
    pesc = [0, 0.68, 0.3];
  } else {
    // o corpo inclinado, de peito para cima; as patas de trás no chão
    pecas.push(esfera(0.2, M, [0, 0.5, -0.02], [0.85, 0.8, 1.45], { x: -0.6 }));
    pecas.push(esfera(0.16, MD, [0, 0.44, -0.05], [0.85, 0.7, 1.3], { x: -0.6 }));
    for (const x of [-0.1, 0.1]) {
      pecas.push(tubo(0.055, 0.035, 0.36, M, [x, 0.2, -0.2], { x: 0.15 }));
      casco([x, 0.03, -0.17]);
      // as da frente dobradas no ar, cascos para a frente
      pecas.push(tubo(0.045, 0.04, 0.2, M, [x, 0.66, 0.22], { x: -0.9 }));
      pecas.push(tubo(0.04, 0.032, 0.18, M, [x, 0.6, 0.36], { x: 0.5 }));
      casco([x, 0.52, 0.42], { x: 0.5 });
    }
    pecas.push(tubo(0.08, 0.1, 0.24, M, [0, 0.82, 0.16], { x: 0.25 }));
    fogueira(pecas, k, [0, 0.32, -0.3], 0.26, 3, -1.0);
    pesc = [0, 0.92, 0.2];
  }
  // a brasa viva onde o pescoço acaba
  pecas.push(esfera(0.085, t(C.fogoV!), [pesc[0], pesc[1] - 0.02, pesc[2] - 0.01], [1, 0.35, 1]));
  return [corpo(k, pecas), parte('cabeca', pesc, fundirTudo(cabecaDeFogo(k, [pesc[0], pesc[1] + 0.01, pesc[2] + 0.03], 0.3)), k.mat)];
}

const mulinha: Escultura = (k) => escala(mula(k, false), 0.92);
const mulaSemCabeca: Escultura = (k) => escala(mula(k, true), 0.8);

/* --------------------------------------------------- Salamanca, Teiniaguá */

function lagarto(k: Kit, tam: number, coroa: boolean): THREE.Group[] {
  const t = k.t, S = t(C.sal!), SL = t(C.salL!), SD = t(C.salD!);
  const pecas: THREE.BufferGeometry[] = [];
  // o corpo baixo, a barriga clara, a cauda curvando para o lado
  pecas.push(esfera(0.2 * tam, S, [0, 0.16 * tam, -0.02], [1.1, 0.7, 1.3]));
  pecas.push(esfera(0.17 * tam, SL, [0, 0.12 * tam, 0.04], [0.95, 0.55, 1.15]));
  pecas.push(corpoComprido([[0, 0.14 * tam, -0.2 * tam], [0.05, 0.1 * tam, -0.38 * tam], [0.22 * tam, 0.06, -0.48 * tam], [0.38 * tam, 0.05, -0.4 * tam]],
    (u) => 0.1 * tam * (1 - u * 0.85), (u, a, b) => (b > 0.4 ? cor(SL) : Math.sin(u * 40 + a) > 0.85 ? cor(SD) : cor(S)), 14, 50));
  // as manchas escuras do dorso
  for (let i = 0; i < 5; i++) pecas.push(esfera(0.03 * tam, t(C.esc!), [(sorte(i, 1) - 0.5) * 0.2 * tam, 0.26 * tam, (sorte(i, 2) - 0.5) * 0.3 * tam], [1, 0.3, 1.2]));
  // as quatro patas abertas, de dedos redondos
  for (const [x, z] of [[-0.2, 0.12], [0.2, 0.12], [-0.2, -0.14], [0.2, -0.14]] as const) {
    pecas.push(tubo(0.04 * tam, 0.035 * tam, 0.14 * tam, S, [x * tam, 0.07 * tam, z * tam], { z: Math.sign(x) * 1.0 }));
    for (let d = -1; d <= 1; d++) pecas.push(esfera(0.022 * tam, SL, [x * tam * 1.25 + d * 0.02, 0.015, z * tam + 0.03 + Math.abs(d) * -0.01], [1, 0.6, 1]));
  }
  // a cabeça larga, de boca grande
  const CY = 0.36 * tam, CZ = 0.18 * tam;
  const cab = [
    esfera(0.17 * tam, S, [0, CY, CZ], [1.15, 0.8, 0.95]),
    esfera(0.15 * tam, SL, [0, CY - 0.05 * tam, CZ + 0.04 * tam], [1.1, 0.5, 0.85]),
  ];
  rosto(cab, k, {
    centro: [0, CY + 0.06 * tam, CZ + 0.13 * tam], sep: 0.17 * tam, r: 0.045 * tam, iris: '#c87a1a', pele: S,
    boca: { cor: t(C.bocaF!), dy: 0.1 * tam, larg: 0.16 * tam },
  });
  if (coroa) {
    // o carbúnculo: a pedra vermelha na testa, e a coroa de fogo atrás dela
    cab.push(facetada(new THREE.OctahedronGeometry(0.045 * tam, 0), t('#e0303a'), [0, CY + 0.13 * tam, CZ + 0.06 * tam], { y: 0.4 }, [1, 1.3, 0.7]));
    fogueira(cab, k, [0, CY + 0.12 * tam, CZ - 0.04 * tam], 0.2 * tam, 5, -0.3);
  }
  return [corpo(k, pecas), parte('cabeca', [0, CY - 0.06 * tam, CZ - 0.06 * tam], fundirTudo(cab), k.mat)];
}

const salamanca: Escultura = (k) => lagarto(k, 1.0, false);
const teiniagua: Escultura = (k) => lagarto(k, 1.12, true);

/* ------------------------------------------------- o ouro: cometa e pirâmide */

/* a Mãe-do-Ouro: uma bola de ouro em chama, voando, com o rastro atrás */
const maeDoOuro: Escultura = (k) => {
  const t = k.t, OD = t(C.ourD!), O = t(C.our!), OL = t(C.ourL!);
  const pecas: THREE.BufferGeometry[] = [];
  // o rastro: gotas cada vez menores, para trás e para baixo
  for (let i = 0; i < 6; i++) {
    pecas.push(esfera(0.14 * (1 - i * 0.14), i % 2 ? OD : O, [-0.12 - i * 0.07, 0.38 - i * 0.05, -0.12 - i * 0.07], [1, 0.8, 1.4], { y: 0.8 }));
  }
  const cab = [
    esfera(0.24, OD, [0, 0.48, 0], [1, 1, 0.95]),
    esfera(0.205, OL, [0.02, 0.5, 0.06], [1, 1, 0.9]),
  ];
  // a chama de ouro subindo da bola: três línguas para cima e para trás
  for (let i = 0; i < 3; i++) {
    const u = i - 1;
    cab.push(torneado([[0.11, 0], [0.12, 0.05], [0.09, 0.14], [0.05, 0.22], [0.001, 0.3]], u === 0 ? O : OD,
      [u * 0.12, 0.6 - Math.abs(u) * 0.06, -0.06], undefined, { z: -u * 0.5, x: -0.5 }));
  }
  rosto(cab, k, { centro: [0, 0.52, 0.22], sep: 0.15, r: 0.045, iris: '#3a2a10', pele: OL, boca: { cor: '#7a4a10', dy: 0.08, larg: 0.08 } });
  return [corpo(k, pecas), parte('cabeca', [0, 0.4, 0], fundirTudo(cab), k.mat)];
};

/* o Eldorado: a pirâmide de ouro de faces lisas, com cara e fogo no alto */
const eldorado: Escultura = (k) => {
  const t = k.t, OD = t(C.ourD!), O = t(C.our!), OL = t(C.ourL!);
  const pecas: THREE.BufferGeometry[] = [
    facetada(new THREE.ConeGeometry(0.46, 0.8, 4, 1), O, [0, 0.4, 0], { y: Math.PI / 4 }),
    facetada(new THREE.BoxGeometry(0.66, 0.06, 0.66), OD, [0, 0.03, 0]),
  ];
  // os degraus da pirâmide: faixas mais escuras
  for (let i = 1; i < 4; i++) {
    const y = i * 0.17, r = 0.46 * (1 - y / 0.8) + 0.004;
    pecas.push(facetada(new THREE.CylinderGeometry(r * 0.985, r, 0.025, 4, 1, true), OD, [0, y, 0], { y: Math.PI / 4 }));
  }
  rosto(pecas, k, { centro: [0, 0.32, 0.25], sep: 0.18, r: 0.045, iris: '#3a2a10', pele: OL, frente: new THREE.Vector3(0, 0.5, 1),
    boca: { cor: t(C.bocaF!), dy: 0.1, larg: 0.1 } });
  fogueira(pecas, k, [0, 0.76, 0], 0.22, 5);
  return [corpo(k, pecas)];
};

/* a Lamparina: lamparina de lata, de bico e alça, com a chama no pavio */
const lamparina: Escultura = (k) => {
  const t = k.t, L = t('#9aa0a8'), LD = t('#6a7078'), LL = t('#c8ccd2');
  const pecas: THREE.BufferGeometry[] = [
    torneado([[0.0, 0], [0.3, 0], [0.33, 0.04], [0.32, 0.14], [0.26, 0.26], [0.12, 0.31], [0.0, 0.32]], L),
    torneado([[0.31, 0], [0.34, 0.02], [0.33, 0.05], [0.3, 0.05]], LD),
    tubo(0.05, 0.06, 0.12, LD, [0, 0.36, 0]),
    // o bico, para a frente, e a alça atrás
    tubo(0.03, 0.06, 0.24, L, [0, 0.2, 0.33], { x: 1.2 }),
    toro(0.11, 0.022, LD, [0, 0.18, -0.34]),
    esfera(0.12, LL, [-0.12, 0.24, 0.12], [1, 0.4, 0.6]),
  ];
  rosto(pecas, k, { centro: [0, 0.17, 0.32], sep: 0.16, r: 0.04, iris: '#2a2a30', pele: L, boca: { cor: t(C.boca!), dy: 0.07, larg: 0.07 } });
  const cab: THREE.BufferGeometry[] = [];
  fogueira(cab, k, [0, 0.42, 0], 0.3, 3);
  return [corpo(k, pecas), parte('cabeca', [0, 0.42, 0], fundirTudo(cab), k.mat)];
};

/* ---------------------------------------------------------------- miúdos */

const fundirTudo = (p: THREE.BufferGeometry[]) => fundir(p);
const toro = (r: number, tr: number, corH: string, p: V3) => lisa(peca(new THREE.TorusGeometry(r, tr, 8, 18), corH, ...p, { y: Math.PI / 2 }));

export const FOGO: Record<string, Escultura> = {
  boitatao, mboitata, mulinha, mulaSemCabeca, salamanca, teiniagua, maeDoOuro, eldorado, lamparina,
};
