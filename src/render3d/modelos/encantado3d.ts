/* =========================================================================
   Os Encantados em low-poly.

   Um construtor por ARQUÉTIPO de corpo (serpente, quadrúpede, ave, peixe,
   humanoide, espírito) e umas poucas partes por espécie (chama, chifres,
   cauda, asas, carapaça, coroa, gorro...). As cores NÃO são pintadas à mão:
   saem do próprio desenho 2D (`coresDoDesenho`), então o bicho 3D é sempre
   o mesmo do Caderno — e o de cor rara usa o desenho raro.

   O tamanho vem da linha de evolução: o filhote é menor, a forma de cima é
   maior, e o lendário é o maior de todos.
   ========================================================================= */
import * as THREE from 'three';
import type { Buf } from '../../core/buf.ts';
import { ESPECIES_ORDEM, especie } from '../../data/creatures.ts';
import { bola, caixa, cilindro, cone, juntar, peca } from './base.ts';

export type Arquetipo = 'serpente' | 'quadrupede' | 'ave' | 'peixe' | 'humanoide' | 'espirito';
export type Parte =
  | 'chama' | 'chifres' | 'cauda' | 'asas' | 'carapaca' | 'coroa' | 'gorro' | 'semCabeca'
  | 'barbatana' | 'umaPerna' | 'sereia' | 'baixo' | 'chapeu' | 'cabeloLongo';

export interface Corpo { a: Arquetipo; p?: readonly Parte[] }

/* o corpo de cada espécie */
export const CORPO_DA_ESPECIE: Record<string, Corpo> = {
  boitatinha: { a: 'serpente', p: ['chama'] }, boitatao: { a: 'serpente', p: ['chama'] },
  mboitata: { a: 'serpente', p: ['chama'] },
  iarinha: { a: 'humanoide', p: ['sereia', 'cabeloLongo'] }, iaraMae: { a: 'humanoide', p: ['sereia', 'cabeloLongo'] },
  ipupiara: { a: 'humanoide', p: ['sereia', 'coroa', 'cabeloLongo'] },
  curupinho: { a: 'humanoide', p: ['chama'] }, curupira: { a: 'humanoide', p: ['chama'] },
  anhanga: { a: 'quadrupede', p: ['chifres'] },
  piragua: { a: 'peixe' }, piraguacu: { a: 'peixe', p: ['barbatana'] },
  sacizinho: { a: 'humanoide', p: ['gorro', 'umaPerna'] }, saci: { a: 'humanoide', p: ['gorro', 'umaPerna'] },
  caiporinha: { a: 'humanoide', p: ['cabeloLongo'] }, caipora: { a: 'humanoide', p: ['cabeloLongo', 'chama'] },
  cabritinha: { a: 'quadrupede', p: ['chifres'] }, cabraCabriola: { a: 'quadrupede', p: ['chifres', 'chama'] },
  mulinha: { a: 'quadrupede', p: ['chama'] }, mulaSemCabeca: { a: 'quadrupede', p: ['semCabeca', 'chama'] },
  salamanca: { a: 'quadrupede', p: ['cauda', 'baixo'] }, teiniagua: { a: 'quadrupede', p: ['cauda', 'baixo', 'coroa'] },
  maeDoOuro: { a: 'espirito', p: ['chama'] }, eldorado: { a: 'espirito', p: ['chama', 'coroa'] },
  matinta: { a: 'ave' }, matintaPerera: { a: 'ave', p: ['cauda'] },
  uirapuru: { a: 'ave' }, uirapuruRei: { a: 'ave', p: ['coroa'] },
  faisquinha: { a: 'espirito' }, relampo: { a: 'espirito', p: ['chifres'] },
  tatuTrovao: { a: 'quadrupede', p: ['carapaca', 'baixo'] }, tatuacu: { a: 'quadrupede', p: ['carapaca'] },
  arcoDaVelha: { a: 'serpente', p: ['coroa'] }, boiuna: { a: 'serpente', p: ['barbatana'] },
  minhoquinha: { a: 'serpente' }, minhocao: { a: 'serpente' },
  mapinguari: { a: 'humanoide' }, juma: { a: 'humanoide', p: ['chifres'] },
  lobinho: { a: 'quadrupede', p: ['cauda'] }, lobisomem: { a: 'humanoide', p: ['cauda'] },
  corpoSeco: { a: 'humanoide' }, almaPenada: { a: 'espirito' },
  cuca: { a: 'humanoide', p: ['cauda', 'cabeloLongo'] }, cucaRainha: { a: 'humanoide', p: ['cauda', 'coroa', 'cabeloLongo'] },
  pisadeira: { a: 'humanoide', p: ['cabeloLongo'] }, pesadelo: { a: 'espirito', p: ['chifres'] },
  luzeiro: { a: 'espirito' }, estrelaDalva: { a: 'espirito', p: ['coroa'] },
  lamparina: { a: 'espirito', p: ['chama'] }, fogoFatuo: { a: 'espirito', p: ['chama'] },
  jaci: { a: 'espirito' }, eclipse: { a: 'espirito', p: ['coroa'] },
  boto: { a: 'peixe' }, botoEncantado: { a: 'humanoide', p: ['chapeu'] },
  cobraNorato: { a: 'serpente' },
};

/* -------------------------------------------------------- cores do desenho */

export interface Cores { principal: string; secundaria: string; destaque: string }

function hsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1, 7), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

/* As três cores que mais aparecem no desenho, tirando o contorno, o
   brilho e o branco do olho: a principal pinta o corpo, a secundária a
   barriga e os membros, o destaque chama, chifre e crista. */
export function coresDoDesenho(b: Buf): Cores {
  const conta = new Map<string, number>();
  for (const c of b.d) {
    if (!c || !c.startsWith('#') || c.length < 7) continue;
    const [, , l] = hsl(c);
    if (l < 0.13 || l > 0.94) continue;
    const k = c.slice(0, 7).toLowerCase();
    conta.set(k, (conta.get(k) ?? 0) + 1);
  }
  const ordem = [...conta.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  const longe = (a: string, b: string) => {
    const [ha, sa, la] = hsl(a), [hb, sb, lb] = hsl(b);
    const dh = Math.min(Math.abs(ha - hb), 360 - Math.abs(ha - hb)) / 180;
    return dh * Math.max(sa, sb) + Math.abs(la - lb) + Math.abs(sa - sb) * 0.3;
  };
  const principal = ordem[0] ?? '#8a8a8a';
  const secundaria = ordem.find((c) => longe(c, principal) > 0.18) ?? principal;
  // o destaque: a mais saturada entre as que sobram
  const resto = ordem.filter((c) => c !== principal && c !== secundaria);
  const destaque = [...resto].sort((a, b) => hsl(b)[1] - hsl(a)[1])
    .find((c) => longe(c, principal) > 0.25 && longe(c, secundaria) > 0.15) ?? secundaria;
  return { principal, secundaria, destaque };
}

/* ----------------------------------------------------------------- tamanho */

/* filhote 0,8; meio 1,0; forma de cima 1,2; quem não evolui 1,0; lendário 1,4 */
export function tamanhoDe(id: string): number {
  const e = especie(id);
  if (e.lendario) return 1.4;
  const anteriores = ESPECIES_ORDEM.filter((o) => especie(o).evolui?.em === id).length > 0;
  let estagio = 0;
  let atual = id;
  for (let i = 0; i < 4; i++) {
    const pai = ESPECIES_ORDEM.find((o) => especie(o).evolui?.em === atual);
    if (!pai) break;
    estagio++; atual = pai;
  }
  if (!anteriores && !e.evolui) return 1.0;
  const total = estagio + (e.evolui ? (especie(e.evolui.em).evolui ? 2 : 1) : 0);
  return total === 0 ? 1 : 0.8 + (estagio / total) * 0.4;
}

/* ----------------------------------------------------------------- modelos */

const OLHO = '#ffffff', PUPILA = '#191221';

function olhos(x: number, y: number, z: number, r = 0.06, afasta = 0.11): THREE.BufferGeometry[] {
  return [-1, 1].flatMap((s) => [
    peca(bola(r), OLHO, x + s * afasta, y, z),
    peca(bola(r * 0.55), PUPILA, x + s * afasta, y, z + r * 0.6),
  ]);
}

function chama(x: number, y: number, z: number, c: Cores, tam = 1): THREE.BufferGeometry[] {
  return [
    peca(cone(0.16 * tam, 0.4 * tam, 5), '#ff8a2a', x, y + 0.18 * tam, z),
    peca(cone(0.1 * tam, 0.3 * tam, 5), '#ffd84a', x + 0.06 * tam, y + 0.2 * tam, z + 0.04),
    peca(cone(0.08 * tam, 0.22 * tam, 5), c.destaque, x - 0.07 * tam, y + 0.12 * tam, z - 0.03),
  ];
}

function chifres(x: number, y: number, z: number): THREE.BufferGeometry[] {
  return [-1, 1].map((s) => peca(cone(0.05, 0.28, 4), '#e8dcc0', x + s * 0.12, y + 0.12, z, { z: -s * 0.4 }));
}

function coroa(x: number, y: number, z: number): THREE.BufferGeometry[] {
  return [0, 1, 2, 3, 4].map((k) => {
    const a = (k / 5) * Math.PI * 2;
    return peca(cone(0.04, 0.14, 4), '#f0c040', x + Math.cos(a) * 0.12, y, z + Math.sin(a) * 0.12);
  });
}

type Pecas = { corpo: THREE.BufferGeometry[]; asaE?: THREE.BufferGeometry[]; asaD?: THREE.BufferGeometry[] };

const CONSTRUTOR: Record<Arquetipo, (c: Cores, p: ReadonlySet<Parte>) => Pecas> = {
  /* enrolada no chão, com o pescoço erguido e a cabeça olhando para a frente */
  serpente: (c, p) => {
    const g: THREE.BufferGeometry[] = [
      peca(new THREE.TorusGeometry(0.32, 0.13, 5, 10), c.principal, 0, 0.13, -0.05, { x: Math.PI / 2 }),
      peca(new THREE.TorusGeometry(0.2, 0.11, 5, 9), c.secundaria, 0, 0.32, -0.05, { x: Math.PI / 2 }),
      peca(cilindro(0.1, 0.12, 0.45, 6), c.principal, 0, 0.52, 0.05, { x: 0.25 }),
      peca(bola(0.17, 1), c.principal, 0, 0.78, 0.15, {}, [1, 0.85, 1.2]),
      peca(bola(0.1), c.secundaria, 0, 0.73, 0.3, {}, [1, 0.6, 1]),
      ...olhos(0, 0.83, 0.26, 0.05, 0.09),
    ];
    if (p.has('chama')) g.push(...chama(0, 0.92, 0.1, c, 0.9));
    if (p.has('coroa')) g.push(...coroa(0, 0.98, 0.15));
    if (p.has('barbatana')) g.push(peca(cone(0.12, 0.35, 3), c.destaque, 0, 0.62, -0.05, { x: -0.5 }, [0.3, 1, 1]));
    return { corpo: g };
  },
  quadrupede: (c, p) => {
    const baixo = p.has('baixo');
    const y = baixo ? 0.22 : 0.42;
    const g: THREE.BufferGeometry[] = [
      peca(bola(0.3, 1), c.principal, 0, y, 0, {}, [0.9, baixo ? 0.6 : 0.8, 1.35]),
    ];
    for (const [x, z] of [[-0.15, 0.22], [0.15, 0.22], [-0.15, -0.22], [0.15, -0.22]] as const) {
      g.push(peca(cilindro(0.06, 0.05, y, 5), c.secundaria, x, y / 2, z));
    }
    if (p.has('carapaca')) g.push(peca(new THREE.SphereGeometry(0.34, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), c.destaque, 0, y, 0, {}, [0.95, 0.9, 1.4]));
    if (!p.has('semCabeca')) {
      g.push(peca(bola(0.19, 1), c.principal, 0, y + 0.2, 0.42));
      g.push(peca(bola(0.1), c.secundaria, 0, y + 0.13, 0.58, {}, [1, 0.8, 1]));
      g.push(...[-1, 1].map((s) => peca(cone(0.05, 0.15, 4), c.principal, s * 0.11, y + 0.38, 0.38)));
      g.push(...olhos(0, y + 0.26, 0.55, 0.045, 0.09));
      if (p.has('chifres')) g.push(...chifres(0, y + 0.34, 0.4));
      if (p.has('coroa')) g.push(peca(new THREE.OctahedronGeometry(0.06), '#f04a4a', 0, y + 0.34, 0.55));
      if (p.has('chama') && !p.has('chifres')) g.push(...chama(0, y + 0.3, 0.38, c, 0.7));
      if (p.has('chama') && p.has('chifres')) g.push(...chama(0, y + 0.18, -0.3, c, 0.6));
    } else {
      g.push(...chama(0, y + 0.15, 0.36, c, 1.2));
    }
    if (p.has('cauda') || !p.has('carapaca')) g.push(peca(cone(0.07, 0.4, 5), c.principal, 0, y + 0.05, -0.48, { x: -1.2 }));
    return { corpo: g };
  },
  ave: (c, p) => {
    const g: THREE.BufferGeometry[] = [
      peca(bola(0.26, 1), c.principal, 0, 0.5, 0, {}, [1, 1.1, 1.05]),
      peca(bola(0.17, 1), c.secundaria, 0, 0.45, 0.12, {}, [1, 1.1, 0.7]),
      peca(bola(0.18, 1), c.principal, 0, 0.8, 0.06),
      peca(cone(0.06, 0.16, 4), '#e8a030', 0, 0.78, 0.26, { x: Math.PI / 2 }),
      ...olhos(0, 0.84, 0.18, 0.05, 0.08),
      ...[-1, 1].map((s) => peca(cilindro(0.025, 0.025, 0.28, 4), '#e8a030', s * 0.08, 0.14, 0.02)),
      peca(cone(0.12, 0.3, 4), c.destaque, 0, 0.42, -0.3, { x: -2 }, [1.4, 1, 0.4]),
    ];
    if (p.has('coroa')) g.push(...coroa(0, 0.98, 0.06));
    if (p.has('cauda')) g.push(peca(cone(0.08, 0.45, 4), c.destaque, 0, 0.38, -0.45, { x: -2.2 }));
    const asa = (s: number) => [peca(caixa(0.06, 0.32, 0.4), c.destaque, 0, -0.1, 0, { z: s * 0.2 })];
    return { corpo: g, asaE: asa(-1), asaD: asa(1) };
  },
  /* peixe e boto: o corpo comprido de lado, flutuando um pouco */
  peixe: (c, p) => {
    const g: THREE.BufferGeometry[] = [
      peca(bola(0.3, 1), c.principal, 0, 0.45, 0, {}, [0.75, 0.85, 1.5]),
      peca(bola(0.2, 1), c.secundaria, 0, 0.36, 0.08, {}, [0.7, 0.6, 1.3]),
      peca(cone(0.22, 0.3, 4), c.destaque, 0, 0.45, -0.52, { x: -Math.PI / 2 }, [0.25, 1, 1]),
      peca(cone(0.1, 0.25, 3), c.destaque, 0, 0.75, -0.05, {}, [0.3, 1, 1.4]),
      peca(cone(0.07, 0.18, 4), c.secundaria, 0, 0.42, 0.5, { x: Math.PI / 2 }),
      ...olhos(0, 0.52, 0.32, 0.05, 0.16),
    ];
    if (p.has('barbatana')) g.push(...[-1, 1].map((s) => peca(cone(0.1, 0.3, 3), c.destaque, s * 0.22, 0.4, 0.1, { z: s * 1.3 })));
    return { corpo: g };
  },
  /* gente-bicho: cabeça grande, corpo pequeno; saci de uma perna, sereia de cauda */
  humanoide: (c, p) => {
    const sereia = p.has('sereia');
    const g: THREE.BufferGeometry[] = [
      peca(caixa(0.34, 0.36, 0.22), c.principal, 0, 0.6, 0),
      peca(bola(0.24, 1), c.secundaria, 0, 0.98, 0, {}, [1, 1.05, 0.95]),
      ...olhos(0, 1.0, 0.2, 0.055, 0.09),
      ...[-1, 1].map((s) => peca(cilindro(0.05, 0.055, 0.34, 5), c.principal, s * 0.24, 0.6, 0, { z: s * 0.15 })),
    ];
    if (sereia) {
      g.push(peca(cone(0.17, 0.5, 6), c.destaque, 0, 0.25, 0.05, { x: Math.PI }));
      g.push(peca(cone(0.16, 0.18, 3), c.destaque, 0, 0.04, 0.05, {}, [1.6, 1, 0.4]));
    } else if (p.has('umaPerna')) {
      g.push(peca(cilindro(0.06, 0.06, 0.42, 5), c.secundaria, 0, 0.21, 0));
    } else {
      g.push(...[-1, 1].map((s) => peca(cilindro(0.06, 0.06, 0.42, 5), c.secundaria, s * 0.09, 0.21, 0)));
    }
    if (p.has('cabeloLongo')) g.push(peca(caixa(0.36, 0.5, 0.1), c.principal, 0, 0.88, -0.16));
    if (p.has('gorro')) g.push(peca(cone(0.2, 0.42, 6), '#d8382a', 0, 1.28, -0.03, { x: -0.35 }));
    if (p.has('chapeu')) {
      g.push(peca(cilindro(0.34, 0.34, 0.03, 10), '#f4f0e6', 0, 1.18, 0));
      g.push(peca(cilindro(0.16, 0.18, 0.18, 10), '#f4f0e6', 0, 1.27, 0));
    }
    if (p.has('chama')) g.push(...chama(0, 1.12, -0.02, c, 1.1));
    if (p.has('chifres')) g.push(...chifres(0, 1.12, 0));
    if (p.has('coroa')) g.push(...coroa(0, 1.22, 0));
    if (p.has('cauda')) g.push(peca(cone(0.09, 0.5, 5), c.principal, 0, 0.35, -0.3, { x: -1.9 }));
    return { corpo: g };
  },
  /* espírito: um miolo que brilha, flutuando, com pontas em volta */
  espirito: (c, p) => {
    const brilho = (g: THREE.BufferGeometry, f = 2) => {
      const a = g.getAttribute('color') as THREE.BufferAttribute;
      for (let i = 0; i < a.array.length; i++) (a.array as Float32Array)[i]! *= f;
      return g;
    };
    const g: THREE.BufferGeometry[] = [
      brilho(peca(bola(0.3, 1), c.principal, 0, 0.62, 0), 1.6),
      peca(bola(0.2, 1), c.secundaria, 0, 0.62, 0.12, {}, [1, 1, 0.6]),
      ...olhos(0, 0.68, 0.27, 0.055, 0.1),
    ];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      g.push(brilho(peca(cone(0.07, 0.3, 4), c.destaque, Math.cos(a) * 0.33, 0.62 + Math.sin(a) * 0.33, -0.05, { z: a - Math.PI / 2 }), 1.4));
    }
    if (p.has('chama')) g.push(...chama(0, 0.88, 0, c, 1.0));
    if (p.has('coroa')) g.push(...coroa(0, 0.96, 0));
    if (p.has('chifres')) g.push(...chifres(0, 0.85, 0));
    return { corpo: g };
  },
};

/* monta o Encantado: o grupo `corpo` (que a animação move inteiro) e, na
   ave, as asas separadas para bater */
export function encantado3D(id: string, desenho: Buf, mat: THREE.Material): THREE.Group {
  const corpo = CORPO_DA_ESPECIE[id] ?? { a: 'quadrupede' as const };
  const c = coresDoDesenho(desenho);
  const pecas = CONSTRUTOR[corpo.a](c, new Set(corpo.p ?? []));
  const raiz = new THREE.Group();
  const g = new THREE.Group();
  g.name = 'corpo';
  const m = new THREE.Mesh(juntar(pecas.corpo), mat);
  m.castShadow = true;
  g.add(m);
  for (const [nome, geo, x] of [['asaE', pecas.asaE, -0.27], ['asaD', pecas.asaD, 0.27]] as const) {
    if (!geo) continue;
    const asa = new THREE.Group();
    asa.name = nome;
    asa.position.set(x, 0.58, 0);
    const am = new THREE.Mesh(juntar(geo), mat);
    am.castShadow = true;
    asa.add(am);
    g.add(asa);
  }
  g.userData['flutua'] = corpo.a === 'espirito' || corpo.a === 'peixe' || corpo.a === 'ave';
  raiz.add(g);
  const s = tamanhoDe(id);
  raiz.scale.setScalar(s);
  return raiz;
}

export type AcaoEncantado = 'parado' | 'andar' | 'atacar' | 'dano' | 'desmaio';

/* a pose do quadro; `t` é o tempo dentro da ação (o ataque dura ~0,45 s,
   o dano ~0,4 s, e o desmaio fica deitado depois de ~0,6 s) */
export function animarEncantado(raiz: THREE.Group, acao: AcaoEncantado, t: number, relogio: number): void {
  const g = raiz.getObjectByName('corpo') as THREE.Group;
  const flutua = g.userData['flutua'] === true;
  g.position.set(0, flutua ? 0.12 + Math.sin(relogio * 2.4) * 0.06 : 0, 0);
  g.rotation.set(0, 0, 0);
  g.scale.set(1, 1 + Math.sin(relogio * 2.2) * 0.025, 1);
  for (const [nome, s] of [['asaE', 1], ['asaD', -1]] as const) {
    const a = g.getObjectByName(nome);
    if (a) a.rotation.z = s * (0.3 + Math.sin(relogio * (acao === 'andar' ? 14 : 6)) * 0.4);
  }
  switch (acao) {
    case 'andar':
      g.position.y += Math.abs(Math.sin(relogio * 10)) * 0.06;
      break;
    case 'atacar': {
      const k = Math.sin(Math.min(1, t / 0.45) * Math.PI);
      g.position.z += k * 0.55;
      g.rotation.x = k * 0.25;
      break;
    }
    case 'dano':
      g.position.x += t < 0.4 ? Math.sin(t * 70) * 0.08 : 0;
      g.rotation.z = t < 0.4 ? Math.sin(t * 40) * 0.08 : 0;
      break;
    case 'desmaio': {
      const k = Math.min(1, t / 0.6);
      g.rotation.z = k * Math.PI / 2;
      g.position.y = -k * 0.15;
      g.scale.set(1, 1, 1);
      break;
    }
    default:
      break;
  }
}
