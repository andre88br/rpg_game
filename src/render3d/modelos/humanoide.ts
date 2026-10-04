/* =========================================================================
   Gente em low-poly: um boneco de umas 1,1 tile de altura, montado com as
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
import { bola, caixa, cilindro, cone, juntar, peca } from './base.ts';

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

export function pessoa3D(op: OpcoesPessoa, mat: THREE.Material): THREE.Group {
  const o = normalizar(op);
  const corpo = new THREE.Group();
  corpo.name = 'corpo';

  // tronco e cabeça numa malha só (a cabeça não gira sozinha)
  const cabeca: THREE.BufferGeometry[] = [
    peca(caixa(0.36, 0.38, 0.22), o.roupa, 0, 0.62, 0),                  // tronco
    peca(caixa(0.38, 0.08, 0.24), o.roupaL, 0, 0.78, 0),                 // ombros
    peca(caixa(0.36, 0.08, 0.22), o.calca, 0, 0.45, 0),                  // cintura
    peca(bola(0.2, 1), o.pele, 0, 0.98, 0, {}, [1, 1.05, 0.95]),        // cabeça
    peca(caixa(0.05, 0.06, 0.02), '#191221', -0.075, 0.99, 0.18),        // olhos
    peca(caixa(0.05, 0.06, 0.02), '#191221', 0.075, 0.99, 0.18),
    peca(bola(0.205, 1), o.cabelo, 0, 1.04, -0.03, {}, [1.02, 0.85, 1.0]), // cabelo
  ];
  if (o.cabeloLongo) cabeca.push(peca(caixa(0.34, 0.42, 0.1), o.cabelo, 0, 0.82, -0.14));
  if (o.chapeu === 'palha') {
    cabeca.push(peca(cilindro(0.38, 0.38, 0.03, 10), o.chapeuCor, 0, 1.12, 0));
    cabeca.push(peca(cilindro(0.17, 0.2, 0.14, 10), o.chapeuCorL, 0, 1.2, 0));
  } else if (o.chapeu === 'bone') {
    cabeca.push(peca(new THREE.SphereGeometry(0.21, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), o.chapeuCor, 0, 1.06, 0));
    cabeca.push(peca(caixa(0.26, 0.03, 0.18), o.chapeuCorL, 0, 1.07, 0.2));
  } else if (o.chapeu === 'coroa') {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      cabeca.push(peca(cone(0.05, 0.16, 4), '#e8c040', Math.cos(a) * 0.15, 1.2, Math.sin(a) * 0.15));
    }
    cabeca.push(peca(cilindro(0.18, 0.18, 0.06, 10), '#c9a227', 0, 1.13, 0));
  }
  const tronco = new THREE.Mesh(juntar(cabeca), mat);
  tronco.name = 'tronco';
  tronco.castShadow = true;
  corpo.add(tronco);

  // braços: manga da roupa e a mão
  for (const [lado, x] of [['bracoE', -0.24], ['bracoD', 0.24]] as const) {
    corpo.add(membro(juntar([
      peca(caixa(0.11, 0.3, 0.12), o.roupaL, 0, -0.15, 0),
      peca(bola(0.06), o.pele, 0, -0.33, 0),
    ]), mat, lado, [x, 0.78, 0]));
  }
  // pernas: calça e sapato
  for (const [lado, x] of [['pernaE', -0.09], ['pernaD', 0.09]] as const) {
    corpo.add(membro(juntar([
      peca(caixa(0.13, 0.34, 0.14), o.calca, 0, -0.17, 0),
      peca(caixa(0.14, 0.08, 0.2), o.sapato, 0, -0.37, 0.03),
    ]), mat, lado, [x, 0.41, 0]));
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
  corpo.position.y = e.nadando ? -0.62 + Math.sin(t * 2) * 0.03
    : e.movendo ? Math.abs(Math.sin(e.fasePasso * Math.PI)) * 0.05 : respira;
}
