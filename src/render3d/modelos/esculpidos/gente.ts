/* O corpo de gente-bicho (Saci, Caipora, Cuca, Pisadeira...): pernas,
   tronco, braços e a cabeça com rosto de verdade. Quem monta veste, penteia
   e põe o que for por cima, e no fim chama `fechar`. */
import * as THREE from 'three';
import { fundir, lisa, peca } from '../base.ts';
import { corpo, esfera, olho, parte, torneado, tubo, type Kit, type V3 } from '../escultura.ts';

export interface Pessoa {
  pele: string;
  peleD: string;
  iris: string;
  boca: string;
  /* a altura do quadril, do ombro e do centro da cabeça */
  quadril?: number;
  ombro?: number;
  cabecaY?: number;
  R?: number;            // raio da cabeça
  largura?: number;      // meia largura dos ombros
  pernas?: 0 | 1 | 2;    // o Saci tem uma; quem anda de manto, nenhuma
  tronco?: string;       // a cor do tronco (camisa); sem, é pele
  calca?: string;        // a cor do quadril e das pernas; sem, é pele
  pe?: string;
  sobrancelha?: string;
  base?: V3;             // desloca a pessoa inteira (a Caipora vai montada)
}

export interface Montagem {
  corpo: THREE.BufferGeometry[];
  cabeca: THREE.BufferGeometry[];
  bracoE: THREE.BufferGeometry[];
  bracoD: THREE.BufferGeometry[];
  o: Required<Omit<Pessoa, 'tronco' | 'calca' | 'pe' | 'sobrancelha' | 'base'>> & Pessoa;
}

export function pessoaBicho(k: Kit, p: Pessoa): Montagem {
  const o = { quadril: 0.3, ombro: 0.54, cabecaY: 0.7, R: 0.12, largura: 0.1, pernas: 2 as const, ...p };
  const m: Montagem = { corpo: [], cabeca: [], bracoE: [], bracoD: [], o };
  const Q = o.quadril, O = o.ombro, L = o.largura;
  const calca = o.calca ?? o.pele, tronco = o.tronco ?? o.pele, pe = o.pe ?? o.peleD;
  // as pernas: coxa, canela e pé
  const xs = o.pernas === 2 ? [-0.045, 0.045] : o.pernas === 1 ? [0] : [];
  for (const x of xs) {
    m.corpo.push(tubo(0.032, 0.027, Q * 0.52, calca, [x, Q * 0.72, 0]));
    m.corpo.push(tubo(0.027, 0.022, Q * 0.5, o.pele, [x, Q * 0.26, 0]));
    m.corpo.push(esfera(0.032, pe, [x, 0.022, 0.025], [0.9, 0.6, 1.5]));
  }
  // o quadril e o tronco torneado
  m.corpo.push(torneado([[0.001, Q - 0.03], [L * 0.75, Q - 0.03], [L * 0.8, Q + 0.05], [L * 0.78, Q + 0.08]], calca, [0, 0, 0], [1, 1, 0.75]));
  m.corpo.push(torneado([[0.001, Q + 0.04], [L * 0.76, Q + 0.04], [L * 0.85, (Q + O) / 2], [L * 0.95, O - 0.03], [L * 0.7, O + 0.02],
    [0.03, O + 0.035], [0.001, O + 0.04]], tronco, [0, 0, 0], [1, 1, 0.74]));
  m.corpo.push(tubo(0.026, 0.03, o.cabecaY - o.R - O + 0.04, o.pele, [0, (O + o.cabecaY - o.R) / 2 + 0.01, 0]));
  // os braços, pendurados no ombro
  const braco = (s: number) => {
    const g: THREE.BufferGeometry[] = [
      tubo(0.025, 0.022, (O - Q) * 0.62, tronco === o.pele ? o.pele : tronco, [s * (L + 0.015), O - (O - Q) * 0.3, 0], { z: s * 0.12 }),
      tubo(0.021, 0.018, (O - Q) * 0.6, o.pele, [s * (L + 0.03), O - (O - Q) * 0.86, 0.02], { z: s * 0.06, x: -0.2 }),
      esfera(0.023, o.pele, [s * (L + 0.035), O - (O - Q) * 1.2, 0.04], [0.8, 1.1, 1]),
    ];
    return g;
  };
  m.bracoE = braco(-1);
  m.bracoD = braco(1);
  // a cabeça com o rosto
  const CY = o.cabecaY, R = o.R;
  m.cabeca.push(
    esfera(R, o.pele, [0, CY, 0], [0.92, 1.04, 0.98]),
    esfera(R * 0.2, o.pele, [-R * 0.9, CY - 0.005, -0.005], [0.5, 1, 0.8]),
    esfera(R * 0.2, o.pele, [R * 0.9, CY - 0.005, -0.005], [0.5, 1, 0.8]),
    lisa(peca(new THREE.ConeGeometry(R * 0.13, R * 0.28, 8), o.peleD, 0, CY - R * 0.15, R * 0.96, { x: Math.PI / 2 - 0.4 })),
    esfera(R * 0.18, o.boca, [0, CY - R * 0.46, R * 0.86], [1, k.pose === 'ataque' ? 0.6 : 0.3, 0.4]),
  );
  for (const s of [-1, 1]) {
    olho(m.cabeca, [s * R * 0.35, CY + R * 0.13, R * 0.8], R * 0.175, new THREE.Vector3(s * 0.15, 0, 1), o.iris, o.pele, k.pose);
    if (o.sobrancelha) {
      m.cabeca.push(lisa(peca(new THREE.BoxGeometry(R * 0.32, R * 0.07, R * 0.08), o.sobrancelha, s * R * 0.35, CY + R * 0.4, R * 0.86,
        { z: -s * (k.pose === 'ataque' ? -0.35 : 0.1) })));
    }
  }
  return m;
}

/* cabelo: a calota que cobre o alto e a nuca */
export function calota(m: Montagem, corH: string, cobre = 0.52, inclina = -0.3): void {
  const { R, cabecaY } = m.o;
  m.cabeca.push(lisa(peca(new THREE.SphereGeometry(R * 1.07, 20, 12, 0, Math.PI * 2, 0, Math.PI * cobre), corH,
    0, cabecaY + 0.005, -0.01, { x: inclina }, [0.96, 1.06, 1.02])));
}

/* fecha a montagem nas partes que a animação conhece */
export function fechar(k: Kit, m: Montagem, resto: THREE.BufferGeometry[] = []): THREE.Group[] {
  const { ombro, largura, cabecaY, R } = m.o;
  const [bx, by, bz] = m.o.base ?? [0, 0, 0];
  const mover = (gs: THREE.BufferGeometry[]) => { for (const g of gs) g.translate(bx, by, bz); return gs; };
  const em = (p: V3): V3 => [p[0] + bx, p[1] + by, p[2] + bz];
  return [
    // `resto` é o que não anda com a pessoa (o porco da Caipora, o redemoinho)
    corpo(k, [...mover(m.corpo), ...resto]),
    parte('cabeca', em([0, cabecaY - R * 0.9, 0]), fundir(mover(m.cabeca)), k.mat),
    parte('bracoE', em([-largura - 0.01, ombro, 0]), fundir(mover(m.bracoE)), k.mat),
    parte('bracoD', em([largura + 0.01, ombro, 0]), fundir(mover(m.bracoD)), k.mat),
  ];
}
