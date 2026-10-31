/* =========================================================================
   Gente em 3D: uma pessoa de umas 1,4 tile de altura, montada com as
   MESMAS cores do estilo do desenho plano (art/people.ts: pele, cabelo,
   roupa, calça, sapato, chapéu de palha, boné ou coroa, cabelo longo).

   Braços e pernas são peças separadas, com o pivô na junta (ombro e
   quadril), para a caminhada balançar de verdade. A vista monta um modelo
   por estilo e cada ator usa um clone (geometria e material divididos).
   ========================================================================= */
import * as THREE from 'three';
import { P } from '../../art/palette.ts';
import type { OpcoesPessoa } from '../../art/people.ts';
import type { Direcao } from '../../art/people.ts';
import { fundir, lisa, peca } from './base.ts';

function normalizar(op: OpcoesPessoa): Required<OpcoesPessoa> {
  return {
    pele: P.skin!, peleEsc: P.skinD!,
    cabelo: P.hair!, cabeloL: P.hairL!,
    roupa: '#d9463f', roupaL: '#f06a5e',
    calca: '#3a5a9a', sapato: '#4a3020',
    chapeu: null, chapeuCor: '#e0c070', chapeuCorL: '#f5e0a0',
    cabeloLongo: false,
    ...op,
  } as Required<OpcoesPessoa>;
}

/* uma parte que gira na junta: o grupo fica na junta, a malha pendurada */
function membro(geo: THREE.BufferGeometry, mat: THREE.Material, nome: string,
                junta: [number, number, number]): THREE.Group {
  const g = new THREE.Group();
  g.name = nome;
  g.position.set(...junta);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  g.add(m);
  return g;
}

export const ESCALA_PESSOA = 1.3;

type Giro = { x?: number; y?: number; z?: number };
/* o perfil do tronco (raio, altura), de baixo para cima */
const TRONCO: readonly [number, number][] = [
  [0.001, 0.6], [0.117, 0.6], [0.118, 0.66], [0.128, 0.74], [0.148, 0.82], [0.152, 0.86],
  [0.14, 0.895], [0.1, 0.92], [0.05, 0.935], [0.001, 0.94],
];
/* atalhos: cada peça já sai lisa (normal por vértice), pronta para `fundir` */
const esfera = (r: number, cor: string, x: number, y: number, z: number, esc?: [number, number, number], giro: Giro = {}) =>
  lisa(peca(new THREE.SphereGeometry(r, 14, 10), cor, x, y, z, giro, esc));
const tubo = (rT: number, rB: number, h: number, cor: string, x: number, y: number, z: number, esc?: [number, number, number], giro: Giro = {}) =>
  lisa(peca(new THREE.CylinderGeometry(rT, rB, h, 12, 2), cor, x, y, z, giro, esc));
const misturar = (a: string, b: string, t: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();

/* Gente de proporção de gente: umas seis cabeças de altura, pescoço, braço e
   perna em duas partes, mão, sapato, e um rosto pequeno de olho, íris,
   sobrancelha, nariz, boca e orelha. As cores são as do estilo do desenho
   plano, então cada pessoa continua reconhecível. */
export function pessoa3D(op: OpcoesPessoa, mat: THREE.Material): THREE.Group {
  const o = normalizar(op);
  const corpo = new THREE.Group();
  corpo.name = 'corpo';
  const sombraPele = misturar(o.pele, o.peleEsc, 0.6);
  const CY = 1.0;          // o centro da cabeça
  const R = 0.105;         // o raio da cabeça

  // tronco, pescoço e cabeça numa malha só (a cabeça não gira sozinha)
  const pecas: THREE.BufferGeometry[] = [
    // a cintura e o quadril, na cor da calça, com o cinto
    tubo(0.115, 0.125, 0.12, o.calca, 0, 0.57, 0, [1, 1, 0.72]),
    tubo(0.128, 0.128, 0.035, misturar(o.sapato, '#000000', 0.3), 0, 0.625, 0, [1, 1, 0.74]),
    // o tronco, torneado numa peça só: cintura, peito, ombro e a base do
    // pescoço; achatado de frente para trás
    lisa(peca(new THREE.LatheGeometry(TRONCO.map(([r, y]) => new THREE.Vector2(r, y)), 16), o.roupa,
      0, 0, 0, {}, [1, 1, 0.66])),
    // os ombros, redondos, onde a manga começa
    esfera(0.052, o.roupaL, -0.15, 0.878, 0, [1, 0.9, 0.95]),
    esfera(0.052, o.roupaL, 0.15, 0.878, 0, [1, 0.9, 0.95]),
    // o pescoço e a gola
    tubo(0.038, 0.044, 0.09, sombraPele, 0, 0.94, 0.005),
    tubo(0.055, 0.06, 0.025, o.roupaL, 0, 0.915, 0.0, [1, 1, 0.85]),
    // a cabeça: oval, mais alta que larga
    esfera(R, o.pele, 0, CY, 0, [0.88, 1.12, 0.98]),
    // as orelhas
    esfera(0.022, o.pele, -R * 0.9, CY, -0.005, [0.5, 1, 0.8]),
    esfera(0.022, o.pele, R * 0.9, CY, -0.005, [0.5, 1, 0.8]),
    // o nariz
    lisa(peca(new THREE.ConeGeometry(0.016, 0.04, 8), sombraPele, 0, CY - 0.012, R * 0.98, { x: Math.PI / 2 - 0.35 })),
  ];
  // os olhos: branco, íris escura com brilho, e a sobrancelha do cabelo
  for (const lado of [-1, 1]) {
    const ex = lado * 0.036;
    pecas.push(esfera(0.017, '#f2ede4', ex, CY + 0.012, R * 0.82, [1, 0.8, 0.6]));
    pecas.push(esfera(0.0095, '#2a1d14', ex, CY + 0.012, R * 0.82 + 0.009));
    pecas.push(esfera(0.003, '#ffffff', ex + 0.004, CY + 0.017, R * 0.82 + 0.017));
    pecas.push(lisa(peca(new THREE.BoxGeometry(0.036, 0.008, 0.01), misturar(o.cabelo, '#000000', 0.2),
      ex, CY + 0.038, R * 0.86, { z: -lado * 0.12 })));
  }
  // a boca: um risco de lábio
  pecas.push(esfera(0.022, misturar(o.peleEsc, '#a04848', 0.35), 0, CY - 0.05, R * 0.88, [1, 0.28, 0.4]));
  // o cabelo: uma calota que cobre o alto e a nuca, mais um topete
  pecas.push(lisa(peca(new THREE.SphereGeometry(R * 1.08, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.56), o.cabelo,
    0, CY + 0.012, -0.008, { x: -0.42 }, [0.94, 1.08, 1.02])));
  pecas.push(esfera(R * 0.55, o.cabeloL, 0.02, CY + 0.085, 0.045, [1.3, 0.45, 0.8]));
  if (o.cabeloLongo) {
    pecas.push(esfera(0.12, o.cabelo, 0, CY - 0.07, -0.07, [1.0, 1.6, 0.5]));
  }
  if (o.chapeu === 'palha') {
    // aba larga e um pouco caída, copa com fita
    pecas.push(tubo(0.25, 0.25, 0.012, o.chapeuCor, 0, CY + 0.085, 0, undefined, { x: 0.12 }));
    pecas.push(tubo(0.1, 0.12, 0.09, o.chapeuCorL, 0, CY + 0.13, -0.008, undefined, { x: 0.12 }));
    pecas.push(tubo(0.121, 0.121, 0.022, misturar(o.chapeuCor, '#5a3a1a', 0.55), 0, CY + 0.1, -0.003, undefined, { x: 0.12 }));
  } else if (o.chapeu === 'bone') {
    pecas.push(lisa(peca(new THREE.SphereGeometry(R * 1.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), o.chapeuCor,
      0, CY + 0.03, -0.005, {}, [0.96, 0.85, 1.02])));
    pecas.push(esfera(0.1, o.chapeuCorL, 0, CY + 0.035, R + 0.04, [0.9, 0.08, 0.7]));
  } else if (o.chapeu === 'coroa') {
    pecas.push(tubo(0.1, 0.1, 0.045, '#c9a227', 0, CY + 0.1, 0));
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      pecas.push(lisa(peca(new THREE.ConeGeometry(0.022, 0.07, 6), '#e8c040', Math.cos(a) * 0.09, CY + 0.15, Math.sin(a) * 0.09)));
    }
  }
  const tronco = new THREE.Mesh(fundir(pecas), mat);
  tronco.name = 'tronco';
  tronco.castShadow = true;
  corpo.add(tronco);

  // braços: manga, antebraço de pele e a mão, um pouco abertos do corpo
  for (const [lado, x] of [['bracoE', -0.165], ['bracoD', 0.165]] as const) {
    const s = Math.sign(x);
    corpo.add(membro(fundir([
      tubo(0.047, 0.04, 0.24, o.roupaL, s * 0.012, -0.11, 0, undefined, { z: s * 0.08 }),
      tubo(0.036, 0.03, 0.2, o.pele, s * 0.026, -0.32, 0.005, undefined, { z: s * 0.05 }),
      esfera(0.034, o.pele, s * 0.032, -0.45, 0.01, [0.75, 1.15, 1]),
    ]), mat, lado, [x, 0.875, 0]));
  }
  // pernas: coxa e canela na calça, e o sapato comprido para a frente
  for (const [lado, x] of [['pernaE', -0.062], ['pernaD', 0.062]] as const) {
    corpo.add(membro(fundir([
      tubo(0.058, 0.048, 0.27, o.calca, 0, -0.135, 0),
      tubo(0.046, 0.038, 0.25, o.calca, 0, -0.39, 0),
      esfera(0.05, o.sapato, 0, -0.525, 0.03, [0.85, 0.55, 1.55]),
    ]), mat, lado, [x, 0.56, 0]));
  }
  const raiz = new THREE.Group();
  raiz.add(corpo);
  // a câmera olha do alto: um pouco maior que a escala do tile, senão só se
  // vê o chapéu
  raiz.scale.setScalar(ESCALA_PESSOA);
  return raiz;
}

/* a direção do desenho plano vira o giro em volta do eixo y */
export const GIRO_DA_DIRECAO: Record<Direcao, number> = {
  baixo: 0, dir: Math.PI / 2, cima: Math.PI, esq: -Math.PI / 2,
};

export interface EstadoPessoa {
  dir: Direcao;
  movendo: boolean;
  fasePasso: number;     // 0..2: o passo, e o passo do outro pé
  nadando: boolean;
}

/* Põe o boneco na pose do quadro: vira para a direção (suave), balança
   braço e perna andando, respira parado, e nada só do peito para cima. */
export function animarPessoa(raiz: THREE.Group, e: EstadoPessoa, t: number, dt: number): void {
  const corpo = raiz.getObjectByName('corpo') as THREE.Group;
  const alvo = GIRO_DA_DIRECAO[e.dir];
  let d = alvo - raiz.rotation.y;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  raiz.rotation.y += d * Math.min(1, dt * 14);

  // de 0 a 1 um pé vai à frente; de 1 a 2 o seno fica negativo, e vai o outro
  const balanco = e.movendo ? Math.sin(e.fasePasso * Math.PI) : 0;
  const ang = balanco * 0.7;
  for (const [nome, k] of [['pernaE', 1], ['pernaD', -1], ['bracoE', -0.8], ['bracoD', 0.8]] as const) {
    const m = corpo.getObjectByName(nome);
    if (m) m.rotation.x = ang * k;
  }
  for (const nome of ['pernaE', 'pernaD']) {
    const m = corpo.getObjectByName(nome);
    if (m) m.visible = !e.nadando;
  }
  const respira = Math.sin(t * 2.2) * 0.012;
  corpo.position.y = e.nadando ? -0.7 + Math.sin(t * 2) * 0.03
    : e.movendo ? Math.abs(Math.sin(e.fasePasso * Math.PI)) * 0.05 : respira;
}
