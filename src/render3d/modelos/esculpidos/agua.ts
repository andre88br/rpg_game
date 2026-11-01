/* Os bichos d'água: as sereias (Iara-Mãe, Ipupiara), os peixes, os botos e
   as cobras grandes do rio (Boiúna, Cobra Norato). */
import * as THREE from 'three';
import { fundir, lisa, peca } from '../base.ts';
import { P } from '../../../art/palette.ts';
import {
  C, cor, corpo, corpoComprido, escala, esfera, facetada, nadadeira, olho, parte, pintar, rosto, torneado, tubo,
  type Escultura, type Kit, type V3,
} from '../escultura.ts';

/* ----------------------------------------------------------------- sereias */

interface Sereia {
  pele: string; peleD: string; cabelo: string; cabeloL: string;
  cauda: string; caudaL: string; caudaD: string; nadadeira: string;
  iris: string; pintura?: string; coroa?: string; boca: string;
}

function sereia(k: Kit, o: Sereia): THREE.Group[] {
  const esc = cor(o.cauda), escL = cor(o.caudaL), escD = cor(o.caudaD);
  const cauda = corpoComprido([[0, 0.5, 0], [0, 0.34, 0.03], [0, 0.16, 0.08], [0.1, 0.06, 0.12], [0.28, 0.05, 0.06], [0.38, 0.05, -0.08], [0.4, 0.07, -0.2]],
    (u) => 0.12 * (1 - u * 0.72), (u, a, barriga) => {
      const fila = Math.floor(u * 46), coluna = (a / (Math.PI * 2)) * 18 + (fila % 2) * 0.5;
      const borda = Math.abs((coluna % 1) - 0.5) * 2 * 0.6 + ((u * 46) % 1) * 0.6;
      return borda > 0.85 ? escD : barriga > 0.4 ? escL : esc;
    }, 18, 80);
  const pecas: THREE.BufferGeometry[] = [cauda];
  for (const s of [-1, 1]) pecas.push(nadadeira(0.22, 0.12, o.nadadeira, [0.4 + s * 0.08, 0.08, -0.32], { y: s * 0.6, x: Math.PI / 2 - 0.2 }));
  // o tronco, o top de folha e o cabelo comprido pelas costas
  pecas.push(torneado([[0.001, 0.48], [0.115, 0.48], [0.11, 0.56], [0.12, 0.64], [0.134, 0.71], [0.11, 0.75], [0.05, 0.77], [0.001, 0.775]], o.pele, [0, 0, 0], [1, 1, 0.72]));
  pecas.push(tubo(0.038, 0.042, 0.08, o.pele, [0, 0.8, 0]));
  pecas.push(torneado([[0.124, 0.62], [0.138, 0.665], [0.134, 0.71], [0.124, 0.72]], k.t(C.iarL!), [0, 0, 0], [1, 1, 0.76]));
  pecas.push(esfera(0.16, o.cabelo, [0, 0.7, -0.09], [1.05, 1.7, 0.42]));

  const CY = 0.94, R = 0.14;
  const cab: THREE.BufferGeometry[] = [
    esfera(R, o.pele, [0, CY, 0], [0.92, 1.05, 0.98]),
    esfera(0.025, o.pele, [-R * 0.9, CY - 0.01, -0.005], [0.5, 1, 0.8]),
    esfera(0.025, o.pele, [R * 0.9, CY - 0.01, -0.005], [0.5, 1, 0.8]),
    lisa(peca(new THREE.ConeGeometry(0.016, 0.036, 8), o.peleD, 0, CY - 0.02, R * 0.96, { x: Math.PI / 2 - 0.4 })),
    esfera(0.024, o.boca, [0, CY - 0.064, R * 0.86], [1, 0.32, 0.4]),
  ];
  if (o.pintura) {
    cab.push(lisa(peca(new THREE.SphereGeometry(R * 1.008, 24, 3, Math.PI * 0.14, Math.PI * 0.72, Math.PI * 0.53, Math.PI * 0.06),
      o.pintura, 0, CY, 0, {}, [0.92, 1.05, 0.98])));
  }
  for (const s of [-1, 1]) {
    olho(cab, [s * 0.047, CY + 0.02, R * 0.8], 0.024, new THREE.Vector3(s * 0.15, 0, 1), o.iris, o.pele, k.pose);
    cab.push(lisa(peca(new THREE.BoxGeometry(0.042, 0.008, 0.012), o.cabelo, s * 0.047, CY + 0.056, R * 0.86, { z: -s * 0.1 })));
  }
  cab.push(lisa(peca(new THREE.SphereGeometry(R * 1.07, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), o.cabelo,
    0, CY + 0.005, -0.01, { x: -0.3 }, [0.96, 1.06, 1.02])));
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.022;
    cab.push(esfera(0.019, o.cabelo, [x, CY + 0.082, R * 0.87 - Math.abs(x) * 0.4], [1.15, 2.1, 0.4], { x: 0.25 }));
  }
  for (const s of [-1, 1]) cab.push(esfera(0.04, o.cabelo, [s * R * 0.86, CY - 0.07, 0.03], [0.5, 2.4, 0.8]));
  cab.push(esfera(0.035, o.cabeloL, [0.04, CY + 0.138, 0.015], [1.4, 0.18, 0.9], { z: -0.3 }));
  if (o.coroa) {
    cab.push(tubo(0.105, 0.11, 0.035, o.coroa, [0, CY + 0.13, -0.01]));
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + (i - 2) * 0.55;
      cab.push(lisa(peca(new THREE.ConeGeometry(0.022, 0.07, 6), o.coroa, Math.cos(a) * 0.1, CY + 0.18, Math.sin(a) * 0.1 - 0.01)));
    }
  }
  const bracos: THREE.Group[] = [];
  for (const [nome, s] of [['bracoE', -1], ['bracoD', 1]] as const) {
    bracos.push(parte(nome, [s * 0.12, 0.74, 0], fundir([
      tubo(0.03, 0.026, 0.19, o.pele, [s * 0.14, 0.65, 0.0], { z: s * 0.15 }),
      tubo(0.026, 0.021, 0.17, o.pele, [s * 0.16, 0.51, 0.05], { x: -0.6, z: s * 0.1 }),
      esfera(0.026, o.pele, [s * 0.16, 0.43, 0.11], [0.8, 1.1, 1]),
    ]), k.mat));
  }
  return [corpo(k, pecas), parte('cabeca', [0, 0.8, 0], fundir(cab), k.mat), ...bracos];
}

const iaraMae: Escultura = (k) => sereia(k, {
  pele: k.t(C.pele!), peleD: k.t(C.peleD!), cabelo: k.t(C.iarH!), cabeloL: k.t(C.iarHL!),
  cauda: k.t(C.iar!), caudaL: k.t(C.iarL!), caudaD: k.t(C.iarD!), nadadeira: k.t(C.iarL!),
  iris: '#3a2618', pintura: k.t(C.pintura!), coroa: k.t(P.gold!), boca: '#a04848',
});

/* a Ipupiara: a sereia do fundo, de pele azulada e cabelo de alga */
const ipupiara: Escultura = (k) => sereia(k, {
  pele: k.t('#7aa4c0'), peleD: k.t('#4a6e88'), cabelo: k.t('#2f7a5a'), cabeloL: k.t('#4a9a72'),
  cauda: k.t('#1f5c8a'), caudaL: k.t('#3a8fd5'), caudaD: k.t('#123a5a'), nadadeira: k.t('#3a8fd5'),
  iris: '#40d8e8', coroa: k.t(P.gold!), boca: '#2a3a5a',
});

/* ------------------------------------------------------------------ peixes */

interface Peixe { costas: string; escuro: string; barriga: string; nadadeira: string; dentes: boolean; comprido: number }

function peixe(k: Kit, o: Peixe): THREE.Group[] {
  const L = o.comprido, Y = 0.36;
  // o corpo: um fuso comprido, mais alto que largo, de dorso escamado
  const g = esfera(L * 0.3, o.costas, [0, Y, 0], [0.62, 0.8, 1.7], {}, 24);
  const c = cor(o.costas), e = cor(o.escuro), b = cor(o.barriga);
  pintar(g, (p) => {
    const alto = (p.y - Y) / (L * 0.24);
    if (alto < -0.15) return b;
    const fila = Math.floor(p.z * 26), xadrez = Math.sin(p.z * 80 + (fila % 2) * Math.PI) * Math.sin(p.x * 60 + p.y * 30);
    return alto > 0.35 && xadrez > 0.45 ? e : c;
  });
  const pecas: THREE.BufferGeometry[] = [g];
  // a nadadeira do dorso, as dos lados, e a de baixo
  pecas.push(nadadeira(L * 0.42, L * 0.2, o.nadadeira, [0, Y + L * 0.27, -L * 0.05], { x: -0.5, y: Math.PI / 2 }));
  for (const s of [-1, 1]) pecas.push(nadadeira(L * 0.22, L * 0.1, o.nadadeira, [s * L * 0.17, Y - L * 0.08, L * 0.12], { y: s * 0.7, z: s * 0.9 }));
  pecas.push(nadadeira(L * 0.2, L * 0.1, o.nadadeira, [0, Y - L * 0.25, -L * 0.15], { x: 0.6, y: Math.PI / 2 }));
  // os olhos dos lados da cabeça, e a boca na ponta
  for (const s of [-1, 1]) {
    olho(pecas, [s * L * 0.12, Y + L * 0.06, L * 0.32], L * 0.065, new THREE.Vector3(s * 0.85, 0.05, 0.5), '#1a2a3a', o.costas, k.pose);
  }
  const aberta = k.pose === 'ataque' || o.dentes;
  pecas.push(esfera(L * 0.1, k.t(C.bocaF!), [0, Y - L * 0.06, L * 0.47], [1, aberta ? 0.5 : 0.18, 0.35]));
  if (o.dentes) {
    for (let i = 0; i < 6; i++) {
      const x = (i - 2.5) * L * 0.032;
      pecas.push(lisa(peca(new THREE.ConeGeometry(L * 0.016, L * 0.05, 5), '#f4f0e4', x, Y - L * 0.03, L * 0.48 - Math.abs(x) * 0.5, { x: Math.PI })));
    }
  }
  // a cauda: o pedúnculo e os dois lobos abertos em V
  const cauda: THREE.BufferGeometry[] = [esfera(L * 0.1, o.costas, [0, Y, -L * 0.56], [0.5, 0.8, 1.4])];
  for (const s of [-1, 1]) cauda.push(nadadeira(L * 0.36, L * 0.16, o.nadadeira, [0, Y + s * L * 0.13, -L * 0.72], { x: s * 0.7, y: Math.PI / 2 }));
  return [corpo(k, pecas), parte('cauda', [0, Y, -L * 0.5], fundir(cauda), k.mat)];
}

const piragua: Escultura = (k) => peixe(k, {
  costas: k.t('#3a9ad8'), escuro: k.t('#22689e'), barriga: k.t('#d8eef8'), nadadeira: k.t('#7cc4ee'), dentes: false, comprido: 0.7,
});
const piraguacu: Escultura = (k) => peixe(k, {
  costas: k.t('#2a7ec0'), escuro: k.t('#18507e'), barriga: k.t('#d8eef8'), nadadeira: k.t('#6ab4e4'), dentes: true, comprido: 0.85,
});

/* -------------------------------------------------------------------- botos */

/* o boto cor-de-rosa: corpo gordo, testa redonda (o melão), bico comprido */
function corpoDeBoto(k: Kit, pecas: THREE.BufferGeometry[], cauda: THREE.BufferGeometry[]): void {
  const R = k.t('#e890a8'), RD = k.t('#c06a84'), RL = k.t('#f8c0d0');
  pecas.push(esfera(0.22, R, [0, 0.26, -0.05], [0.95, 0.85, 1.6]));
  pecas.push(esfera(0.19, RL, [0, 0.2, 0.0], [0.85, 0.6, 1.4]));
  pecas.push(esfera(0.06, RD, [0, 0.46, -0.1], [0.3, 1, 1.4], { x: -0.4 }));        // a corcova
  for (const s of [-1, 1]) pecas.push(nadadeira(0.2, 0.08, RD, [s * 0.2, 0.15, 0.12], { y: s * 0.5, z: s * 1.1 }));
  cauda.push(esfera(0.12, R, [0, 0.24, -0.42], [0.6, 0.6, 1.4]));
  for (const s of [-1, 1]) cauda.push(nadadeira(0.22, 0.1, RD, [s * 0.1, 0.24, -0.58], { x: Math.PI / 2, z: s * 0.6 }));
}

const boto: Escultura = (k) => escala(botoNatural(k), 1.3);
function botoNatural(k: Kit): THREE.Group[] {
  const R = k.t('#e890a8'), RD = k.t('#c06a84');
  const pecas: THREE.BufferGeometry[] = [], cauda: THREE.BufferGeometry[] = [];
  corpoDeBoto(k, pecas, cauda);
  const cab: THREE.BufferGeometry[] = [
    esfera(0.17, R, [0, 0.38, 0.28], [0.95, 0.95, 1.0]),
    esfera(0.045, RD, [0, 0.3, 0.52], [0.9, 0.7, 2.6]),
  ];
  rosto(cab, k, { centro: [0, 0.42, 0.42], sep: 0.18, r: 0.034, iris: '#2a1a24', pele: R, boca: { cor: k.t(C.bocaF!), dy: 0.1, larg: 0.1 } });
  return [corpo(k, pecas), parte('cabeca', [0, 0.32, 0.2], fundir(cab), k.mat), parte('cauda', [0, 0.24, -0.3], fundir(cauda), k.mat)];
}

/* o Boto-Encantado: o moço de terno branco e chapéu, de cabeça de boto */
const botoEncantado: Escultura = (k) => {
  const T = k.t('#f4f0e8'), TL = k.t('#f8f6f0'), TD = k.t('#c8c0b0'), R = k.t('#e890a8'), RL = k.t('#f8c0d0');
  const pecas: THREE.BufferGeometry[] = [
    // as pernas de calça branca e o sapato escuro
    tubo(0.06, 0.05, 0.36, T, [-0.07, 0.2, 0]), tubo(0.06, 0.05, 0.36, T, [0.07, 0.2, 0]),
    esfera(0.05, k.t(C.guaraP!), [-0.07, 0.03, 0.03], [1, 0.6, 1.5]), esfera(0.05, k.t(C.guaraP!), [0.07, 0.03, 0.03], [1, 0.6, 1.5]),
    // o paletó: tronco torneado, as abas e a gola
    torneado([[0.001, 0.36], [0.15, 0.36], [0.16, 0.45], [0.17, 0.6], [0.165, 0.68], [0.1, 0.72], [0.001, 0.73]], TL, [0, 0, 0], [1, 1, 0.75]),
    esfera(0.07, TD, [-0.05, 0.62, 0.11], [0.5, 1.2, 0.2], { z: 0.3 }),
    esfera(0.07, TD, [0.05, 0.62, 0.11], [0.5, 1.2, 0.2], { z: -0.3 }),
    tubo(0.004, 0.004, 0.28, TD, [0, 0.5, 0.125]),
    // a flor vermelha na lapela
    esfera(0.022, k.t('#d8343a'), [-0.08, 0.6, 0.13]),
  ];
  const cab: THREE.BufferGeometry[] = [
    esfera(0.14, R, [0, 0.86, 0.0], [0.95, 1.0, 1.0]),
    esfera(0.1, RL, [0, 0.82, 0.05], [0.9, 0.7, 0.9]),
    esfera(0.04, R, [0, 0.8, 0.2], [0.85, 0.7, 2.0]),
    // o chapéu branco de fita escura
    tubo(0.2, 0.2, 0.012, T, [0, 0.96, -0.01], { x: 0.08 }),
    tubo(0.1, 0.11, 0.12, T, [0, 1.03, -0.02], { x: 0.08 }),
    tubo(0.112, 0.112, 0.03, k.t('#2a2a30'), [0, 0.99, -0.015], { x: 0.08 }),
  ];
  rosto(cab, k, { centro: [0, 0.88, 0.125], sep: 0.12, r: 0.03, iris: '#2a1a24', pele: R, boca: { cor: k.t(C.bocaF!), dy: 0.07, larg: 0.07 } });
  const bracos: THREE.Group[] = [];
  for (const [nome, s] of [['bracoE', -1], ['bracoD', 1]] as const) {
    bracos.push(parte(nome, [s * 0.16, 0.66, 0], fundir([
      tubo(0.045, 0.04, 0.3, TL, [s * 0.19, 0.52, 0], { z: s * 0.15 }),
      esfera(0.035, R, [s * 0.215, 0.35, 0.01]),
    ]), k.mat));
  }
  return [corpo(k, pecas), parte('cabeca', [0, 0.72, 0], fundir(cab), k.mat), ...bracos];
};

/* -------------------------------------------------------- cobras grandes */

interface Cobra { costas: string; escuro: string; barriga: string; placa: string; iris: string; pontos: V3[]; raio: (u: number) => number; cabeca: V3; tam: number }

function cobraGrande(k: Kit, o: Cobra, extra: (cab: THREE.BufferGeometry[], pecas: THREE.BufferGeometry[]) => void): THREE.Group[] {
  const c = cor(o.costas), e = cor(o.escuro), b = cor(o.barriga), pl = cor(o.placa);
  const pecas = [corpoComprido(o.pontos, o.raio, (u, a, barriga) => {
    if (barriga > 0.35) return Math.sin(u * 220) > 0.6 ? pl : b;
    return Math.sin(u * 60 + Math.sin(a * 2) * 2) > 0.6 ? e : c;
  }, 18, 140)];
  const [X, Y, Z] = o.cabeca, s = o.tam;
  const cab = [
    esfera(0.11 * s, o.costas, [X, Y, Z], [1.05, 0.75, 1.2]),
    esfera(0.085 * s, o.costas, [X, Y - 0.01 * s, Z + 0.09 * s], [1, 0.62, 1.05]),
    esfera(0.085 * s, o.barriga, [X, Y - 0.04 * s, Z + 0.06 * s], [0.95, 0.38, 1.2]),
    esfera(0.08 * s, k.t(C.bocaF!), [X, Y - 0.025 * s, Z + 0.07 * s], [1.0, k.pose === 'ataque' ? 0.25 : 0.06, 1.2]),
  ];
  for (const l of [-1, 1]) olho(cab, [X + l * 0.065 * s, Y + 0.035 * s, Z + 0.07 * s], 0.036 * s, new THREE.Vector3(l * 0.6, 0.15, 0.8), o.iris, o.costas, k.pose, true);
  extra(cab, pecas);
  return [corpo(k, pecas), parte('cabeca', [X, Y - 0.05 * s, Z - 0.04 * s], fundir(cab), k.mat)];
}

/* a Boiúna: a cobra-grande saindo do rio em corcovas, de raio no lombo */
const boiuna: Escultura = (k) => cobraGrande(k, {
  costas: k.t('#24505e'), escuro: k.t('#3e7486'), barriga: k.t('#9ad0d8'), placa: k.t('#6aa4b0'), iris: '#e8d040',
  pontos: [[-0.55, 0.08, -0.1], [-0.42, 0.24, -0.05], [-0.3, 0.08, 0.0], [-0.16, 0.24, 0.02], [-0.04, 0.08, 0.04],
    [0.08, 0.2, 0.06], [0.12, 0.46, 0.08], [0.1, 0.7, 0.12]],
  raio: (u) => 0.03 + Math.min(1, u * 3) * 0.06, cabeca: [0.1, 0.76, 0.16], tam: 1.3,
}, (_cab, pecas) => {
  // o rio: uma lâmina d'água em volta, mais escura no fundo
  pecas.push(lisa(peca(new THREE.CylinderGeometry(0.62, 0.66, 0.1, 40), k.t(P.waterD!), -0.15, 0.05, 0, {}, [1, 1, 0.65])));
  pecas.push(lisa(peca(new THREE.TorusGeometry(0.5, 0.012, 6, 40), k.t(P.water!), -0.15, 0.1, 0, { x: Math.PI / 2 }, [1, 0.65, 1])));
  // o raio amarelo, riscando o ar ao lado
  const r = new THREE.Shape();
  r.moveTo(0, 0); r.lineTo(0.05, 0.12); r.lineTo(0.02, 0.12); r.lineTo(0.06, 0.24); r.lineTo(-0.02, 0.1); r.lineTo(0.01, 0.1); r.lineTo(-0.03, 0);
  pecas.push(facetada(new THREE.ExtrudeGeometry(r, { depth: 0.02, bevelEnabled: false }), k.t(P.bolt!), [-0.48, 0.5, 0.0], {}, [1.4, 1.4, 1]));
});

/* a Cobra Norato: a cobra verde enrolada em espiral, de chapéu de palha */
const cobraNorato: Escultura = (k) => {
  // do rabo, no meio da rodilha, para fora; da volta de fora o pescoço sobe
  const corpoPts: V3[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = i * 0.68 + 2.2, r = 0.05 + i * 0.026;
    corpoPts.push([Math.cos(a) * r, 0.075, Math.sin(a) * r]);
  }
  corpoPts.push([0.1, 0.16, 0.3], [0.04, 0.36, 0.16], [0.0, 0.56, 0.12]);
  return cobraGrande(k, {
    costas: k.t('#2e6a4a'), escuro: k.t('#1a4a30'), barriga: k.t('#d8d090'), placa: k.t('#aaa060'), iris: '#e8c040',
    pontos: corpoPts, raio: (u) => 0.025 + Math.min(1, u * 4) * 0.07, cabeca: [0, 0.64, 0.16], tam: 1.3,
  }, (cab) => {
    const H = k.t('#e0c070'), HD = k.t('#a8883a');
    cab.push(tubo(0.24, 0.24, 0.012, H, [0, 0.74, 0.12], { x: 0.15 }));
    cab.push(tubo(0.09, 0.12, 0.09, H, [0, 0.79, 0.11], { x: 0.15 }));
    cab.push(tubo(0.122, 0.122, 0.02, HD, [0, 0.765, 0.115], { x: 0.15 }));
    // o verde mais claro do lombo da cabeça
    cab.push(esfera(0.06, k.t('#4a8e66'), [0, 0.7, 0.2], [1.2, 0.3, 1.2]));
  });
};

export const AGUA: Record<string, Escultura> = {
  iaraMae, ipupiara, piragua, piraguacu, boto, botoEncantado, boiuna, cobraNorato,
};
