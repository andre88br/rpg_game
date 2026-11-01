/* =========================================================================
   O kit de escultura dos Encantados (esculpidos/*.ts): formas lisas de cor
   por vértice, corpo varrido por curva, fogo, olho de verdade, estrela,
   manto, asa, nadadeira e o rosto inteiro. Cada espécie monta o bicho com
   estas peças e devolve as partes que a animação conhece.
   ========================================================================= */
import * as THREE from 'three';
import { fundir, lisa, peca } from './base.ts';
import { C, type Pose } from '../../art/creatures.ts';

export type Tinta = (c: string) => string;
export type Giro = { x?: number; y?: number; z?: number };
export type V3 = [number, number, number];
/* o que toda espécie recebe: a tinta (troca as cores do raro), o material e a pose */
export interface Kit { t: Tinta; mat: THREE.Material; pose: Pose; chave: string }   // chave: espécie e raro
export type Escultura = (k: Kit) => THREE.Group[];

/* ------------------------------------------------------------ ferramentas */

export const esfera = (r: number, cor: string, p: V3, esc?: V3, giro: Giro = {}, seg = 18) =>
  lisa(peca(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), cor, ...p, giro, esc));
export const tubo = (rT: number, rB: number, h: number, cor: string, p: V3, giro: Giro = {}, esc?: V3) =>
  lisa(peca(new THREE.CylinderGeometry(rT, rB, h, 12, 2), cor, ...p, giro, esc));

/* pinta a geometria vértice a vértice: f recebe a posição e devolve a cor */
export function pintar(g: THREE.BufferGeometry, f: (p: THREE.Vector3, i: number) => THREE.Color): THREE.BufferGeometry {
  const pos = g.getAttribute('position');
  const cor = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const c = f(v.fromBufferAttribute(pos, i), i);
    cor[i * 3] = c.r; cor[i * 3 + 1] = c.g; cor[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  return g;
}

/* Um corpo varrido ao longo de uma curva: anéis de `lados` vértices, com o
   raio `raio(t)` (t de 0 a 1). `cor(t, lado, barriga)` pinta cada vértice:
   `barriga` vai de -1 (costas) a 1 (barriga), pelo rumo `baixo(t)`. As
   pontas fecham em bico. */
export function varrer(pontos: V3[], raio: (t: number) => number, lados: number, aneis: number,
                cor: (t: number, a: number, barriga: number) => THREE.Color,
                baixo: (tg: THREE.Vector3) => THREE.Vector3): THREE.BufferGeometry {
  const curva = new THREE.CatmullRomCurve3(pontos.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const quadros = curva.computeFrenetFrames(aneis, false);
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const n = new THREE.Vector3(), centro = new THREE.Vector3(), b = new THREE.Vector3(), lado = new THREE.Vector3();
  for (let i = 0; i <= aneis; i++) {
    const t = i / aneis;
    curva.getPointAt(t, centro);
    const tg = quadros.tangents[i]!;
    // o rumo da barriga, sem torcer com a curva: o `baixo` projetado no anel
    b.copy(baixo(tg)).addScaledVector(tg, -baixo(tg).dot(tg)).normalize();
    lado.crossVectors(tg, b).normalize();
    const r = raio(t);
    for (let k = 0; k < lados; k++) {
      const a = (k / lados) * Math.PI * 2;
      n.copy(b).multiplyScalar(Math.cos(a)).addScaledVector(lado, Math.sin(a));
      pos.push(centro.x + n.x * r, centro.y + n.y * r, centro.z + n.z * r);
      const c = cor(t, a, Math.cos(a));
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < aneis; i++) {
    for (let k = 0; k < lados; k++) {
      const a = i * lados + k, bb = i * lados + (k + 1) % lados;
      const c = a + lados, d = bb + lados;
      idx.push(a, bb, c, bb, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const solta = g.toNonIndexed();
  g.dispose();
  return solta;
}

/* uma língua de fogo: gota torneada, miolo amarelo embaixo e ponta vermelha;
   a cor passa de 1 (o fogo acende de dentro, mesmo na sombra) */
export function chama(altura: number, largura: number, p: V3, giro: Giro, tinta: Tinta): THREE.BufferGeometry {
  const perfil: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    perfil.push(new THREE.Vector2(Math.max(0.001, largura * Math.sin(Math.PI * Math.pow(t, 0.7)) * (1 - t * 0.55)), t * altura));
  }
  const g = peca(new THREE.LatheGeometry(perfil, 10), '#ffffff', ...p, giro);
  const v = new THREE.Color(tinta(C.fogoV!)), a = new THREE.Color(tinta(C.fogoA!)), m = new THREE.Color(tinta(C.fogoM!));
  // a altura de cada vértice no próprio eixo da chama
  const eixo = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(giro.x ?? 0, giro.y ?? 0, giro.z ?? 0));
  const base = new THREE.Vector3(...p);
  const w = new THREE.Vector3();
  pintar(g, (q) => {
    const t = THREE.MathUtils.clamp(w.copy(q).sub(base).dot(eixo) / altura, 0, 1);
    const c = t < 0.45 ? m.clone().lerp(a, t / 0.45) : a.clone().lerp(v, (t - 0.45) / 0.55);
    return c.multiplyScalar(1.7 - t * 0.5);
  });
  return lisa(g);
}

/* O olho de verdade: o globo branco, a íris colorida, a pupila (redonda ou
   de fenda) e o brilho. `frente` é para onde ele olha. Fechado (piscando,
   apanhando, desmaiado), vira a pálpebra da cor da pele, com o risco. */
export function olho(pecas: THREE.BufferGeometry[], p: V3, r: number, frente: THREE.Vector3, iris: string,
              pele: string, pose: Pose, fenda = false): void {
  // olho de cobra não tem branco: o globo inteiro é da cor da íris
  const branco = fenda ? iris : '#f4efe6';
  const f = frente.clone().normalize();
  const em = (d: number): V3 => [p[0] + f.x * d, p[1] + f.y * d, p[2] + f.z * d];
  const mira = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), f));
  const giro = { x: mira.x, y: mira.y, z: mira.z };
  const fechado = pose === 'pisca' || pose === 'dano' || pose === 'desmaio';
  if (fechado) {
    pecas.push(esfera(r * 1.08, pele, p, undefined, giro));
    pecas.push(esfera(r * 0.95, '#2a1a14', em(r * 0.75), [1, 0.12, 0.3], giro));
    return;
  }
  pecas.push(esfera(r, branco, p, undefined, giro));
  // a íris e a pupila são lentes achatadas, aflorando do globo
  pecas.push(esfera(r * 0.6, iris, em(r * 0.8), [1, 1, 0.38], giro));
  pecas.push(esfera(r * (fenda ? 0.52 : 0.3), '#0c0808', em(r * 0.93), fenda ? [0.26, 1.0, 0.35] : [1, 1, 0.35], giro));
  const brilho = em(r * 1.0);
  pecas.push(esfera(r * 0.13, '#ffffff', [brilho[0] + r * 0.2, brilho[1] + r * 0.24, brilho[2]], undefined, {}, 8));
  // a sobrancelha brava do ataque: a pálpebra de cima desce um pouco
  if (pose === 'ataque') pecas.push(esfera(r * 1.06, pele, [p[0], p[1] + r * 0.45, p[2]], [1, 0.45, 1], giro));
}

/* uma parte que gira na junta: o grupo na junta, a malha pendurada */
export function parte(nome: string, junta: V3, geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.name = nome;
  g.position.set(...junta);
  geo.translate(-junta[0], -junta[1], -junta[2]);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  g.add(m);
  return g;
}

export const cor = (hex: string) => new THREE.Color(hex);


/* ------------------------------------------------------- peças a mais */

export const cone = (r: number, h: number, corH: string, p: V3, giro: Giro = {}, esc?: V3, lados = 10) =>
  lisa(peca(new THREE.ConeGeometry(r, h, lados, 2), corH, ...p, giro, esc));

/* uma peça torneada: o perfil (raio, altura) gira em volta do eixo y */
export const torneado = (perfil: readonly (readonly [number, number])[], corH: string, p: V3 = [0, 0, 0], esc?: V3, giro: Giro = {}, lados = 18) =>
  lisa(peca(new THREE.LatheGeometry(perfil.map(([r, y]) => new THREE.Vector2(Math.max(0.001, r), y)), lados), corH, ...p, giro, esc));

/* o corpo de bicho comprido (cobra, minhoca, cauda): `varrer` com a barriga
   para baixo, ou para a frente onde o corpo fica em pé */
export const corpoComprido = (pontos: V3[], raio: (t: number) => number,
                              pinta: (t: number, a: number, barriga: number) => THREE.Color, lados = 16, aneis = 80) =>
  varrer(pontos, raio, lados, aneis, pinta,
    (tg) => (Math.abs(tg.y) > 0.6 ? new THREE.Vector3(0, -0.2, 1) : new THREE.Vector3(0, -1, 0)));

/* estrela de `pontas` pontas, gorda e de borda arredondada, de frente (+z) */
export function estrela(pontas: number, rFora: number, rDentro: number, espessura: number, corH: string,
                        p: V3, giro: Giro = {}): THREE.BufferGeometry {
  const f = new THREE.Shape();
  for (let i = 0; i < pontas * 2; i++) {
    const a = Math.PI / 2 + (i / (pontas * 2)) * Math.PI * 2;
    const r = i % 2 ? rDentro : rFora;
    if (i === 0) f.moveTo(Math.cos(a) * r, Math.sin(a) * r); else f.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const bisel = espessura * 0.45;
  const g = new THREE.ExtrudeGeometry(f, { depth: espessura - bisel * 2, bevelEnabled: true, bevelThickness: bisel,
    bevelSize: bisel * 0.8, bevelSegments: 4, curveSegments: 4 });
  g.translate(0, 0, -(espessura - bisel * 2) / 2);
  return lisa(peca(g, corH, ...p, giro));
}

/* O manto (fantasma, bruxa, assombração): um cone aberto embaixo, de barra
   em ondas. `ondas` bicos na barra, que caem `fundo` abaixo da base. */
export function manto(rTopo: number, rBase: number, alto: number, corH: string, p: V3,
                      ondas = 7, fundo = 0.06, esc?: V3): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(rTopo, rBase, alto, 36, 8, false);
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (alto / 2 - y) / alto;                    // 0 no alto, 1 na barra
    const a = Math.atan2(pos.getZ(i), pos.getX(i));
    const onda = (0.5 + 0.5 * Math.cos(a * ondas)) * fundo * Math.pow(t, 3);
    // o pano abre um pouco na barra
    const abre = 1 + 0.06 * Math.sin(a * ondas) * t;
    pos.setXYZ(i, pos.getX(i) * abre, y - onda, pos.getZ(i) * abre);
  }
  g.translate(0, alto / 2, 0);
  return lisa(peca(g, corH, ...p, {}, esc));
}

/* Uma asa aberta, saindo do ombro para +x (a da esquerda é espelhada):
   o braço da asa e as penas em leque, da cor `corH` até `ponta`. */
export function asa(comprido: number, largo: number, corH: string, ponta: string, penas = 6, espelho = false): THREE.BufferGeometry {
  const s = espelho ? -1 : 1;
  const pecas: THREE.BufferGeometry[] = [esfera(largo * 0.35, corH, [s * comprido * 0.25, 0, 0], [comprido * 1.6 / largo, 0.55, 0.3])];
  for (let k = 0; k < penas; k++) {
    const u = k / (penas - 1);
    const a = (-0.25 - u * 1.0);                        // as penas abrem para baixo
    const l = comprido * (0.55 + 0.45 * (1 - Math.abs(u - 0.3)));
    const x = s * comprido * (0.25 + 0.55 * (1 - u * 0.5)), y = -u * largo * 0.25;
    pecas.push(esfera(l * 0.5, u < 0.5 ? corH : ponta, [x + s * Math.cos(a) * l * 0.35, y + Math.sin(a) * l * 0.35, -0.01 * k],
      [1, 0.2, 0.07 / l], { z: s * a }));
  }
  return fundir(pecas);
}

/* nadadeira: uma lâmina fina em gota */
export const nadadeira = (comprido: number, largo: number, corH: string, p: V3, giro: Giro = {}) =>
  esfera(comprido * 0.5, corH, p, [largo / comprido, 1, 0.12], giro);

/* O rosto: dois olhos (olhando para a frente, um tico para fora), a boca
   e, se quiser, sobrancelha, nariz e bochecha. `centro` é o meio entre os
   olhos, na superfície da cara; `frente`, para onde a cara olha. */
export interface Rosto {
  centro: V3;
  sep: number;            // distância entre os olhos
  r: number;              // raio do olho
  iris: string;
  pele: string;
  frente?: THREE.Vector3;
  fenda?: boolean;
  boca?: { cor: string; dy: number; larg: number; aberta?: boolean };
  sobrancelha?: string;
  nariz?: string;
}
export function rosto(pecas: THREE.BufferGeometry[], k: Kit, o: Rosto): void {
  const f = (o.frente ?? new THREE.Vector3(0, 0, 1)).clone().normalize();
  const lado = new THREE.Vector3(0, 1, 0).cross(f).normalize().negate();   // +x quando olha para +z
  for (const s of [-1, 1]) {
    const p: V3 = [o.centro[0] + lado.x * s * o.sep / 2, o.centro[1], o.centro[2] + lado.z * s * o.sep / 2];
    const mira = f.clone().addScaledVector(lado, s * 0.18).normalize();
    olho(pecas, p, o.r, mira, o.iris, o.pele, k.pose, o.fenda);
    if (o.sobrancelha) {
      const bravo = k.pose === 'ataque' ? -0.4 : 0.12;
      pecas.push(esfera(o.r * 0.9, o.sobrancelha, [p[0], p[1] + o.r * 1.35, p[2] + f.z * o.r * 0.2],
        [1, 0.22, 0.35], { z: -s * bravo, y: Math.atan2(f.x, f.z) }));
    }
  }
  if (o.nariz) pecas.push(esfera(o.r * 0.55, o.nariz, [o.centro[0] + f.x * o.r * 0.6, o.centro[1] - o.r * 1.1, o.centro[2] + f.z * o.r * 0.6], [1, 0.8, 1]));
  if (o.boca) {
    const b = o.boca;
    const aberta = b.aberta || k.pose === 'ataque' || k.pose === 'dano';
    pecas.push(esfera(b.larg / 2, b.cor, [o.centro[0] + f.x * o.r * 0.3, o.centro[1] - b.dy, o.centro[2] + f.z * o.r * 0.3],
      [1, aberta ? 0.55 : 0.22, 0.4], { y: Math.atan2(f.x, f.z) }));
  }
}

/* o grupo do corpo, já pronto */
export const corpo = (k: Kit, pecas: THREE.BufferGeometry[]) => parte('corpo#', [0, 0, 0], fundir(pecas), k.mat);

/* fogo de três línguas e tons, para coroa, rabo e pavio */
export function fogueira(pecas: THREE.BufferGeometry[], k: Kit, p: V3, tamanho: number, linguas = 5, inclina = 0): void {
  for (let i = 0; i < linguas; i++) {
    const u = linguas === 1 ? 0 : i / (linguas - 1) - 0.5;
    const alto = tamanho * (1 - Math.abs(u) * 0.7);
    pecas.push(chama(alto, tamanho * 0.28, [p[0] + u * tamanho * 0.6, p[1], p[2] - Math.abs(u) * tamanho * 0.1],
      { z: -u * 0.8, x: inclina }, k.t));
  }
}

export { C };

/* peça de faces chapadas (pirâmide, cristal, pedra lapidada) */
export function facetada(geo: THREE.BufferGeometry, corH: string, p: V3, giro: Giro = {}, esc?: V3): THREE.BufferGeometry {
  const g = peca(geo, corH, ...p, giro, esc);
  g.computeVertexNormals();
  return g;
}

/* quatro pernas de bicho: de `alto` até o chão, com casco ou pata no pé */
export function pernas4(pecas: THREE.BufferGeometry[], corH: string, pe: string, meiaLarg: number,
                        zFrente: number, zTras: number, alto: number, r: number): void {
  for (const x of [-meiaLarg, meiaLarg]) {
    for (const z of [zFrente, zTras]) {
      pecas.push(tubo(r, r * 0.75, alto, corH, [x, alto / 2 + r * 0.6, z]));
      pecas.push(esfera(r * 1.05, pe, [x, r * 0.6, z + r * 0.25], [1, 0.75, 1.25]));
    }
  }
}

/* muda o tamanho do bicho inteiro (as partes andam junto com o pivô) */
export function escala(grupos: THREE.Group[], s: number): THREE.Group[] {
  for (const g of grupos) {
    if (g.name === 'corpo#') {
      for (const c of g.children) { c.position.multiplyScalar(s); c.scale.multiplyScalar(s); }
    } else { g.position.multiplyScalar(s); g.scale.multiplyScalar(s); }
  }
  return grupos;
}
