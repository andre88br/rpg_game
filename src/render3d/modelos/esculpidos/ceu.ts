/* Os bichos do céu: as estrelas, o Fogo-Fátuo, a lua (Jaci) e o Eclipse.
   Todos flutuam. */
import * as THREE from 'three';
import { C, cone, cor, corpo, esfera, estrela, pintar, rosto, torneado, type Escultura, type Kit } from '../escultura.ts';

/* a estrela gorda de cinco pontas, de cara; a d'Alva com a cauda de cometa */
function estrelaViva(k: Kit, cometa: boolean): THREE.Group[] {
  const t = k.t, A = t('#f6d23a'), AL = t('#fff2a0'), AD = t('#d8a820');
  const g = estrela(5, 0.34, 0.16, 0.16, A, [0, 0.42, 0]);
  const a = cor(A), al = cor(AL), ad = cor(AD);
  // o miolo mais claro e as pontas mais escuras
  pintar(g, (p) => {
    const r = Math.hypot(p.x, p.y - 0.42);
    return r < 0.1 ? al : r > 0.28 ? ad : a;
  });
  // o brilho na ponta de cima
  const pecas: THREE.BufferGeometry[] = [g, esfera(0.04, AL, [-0.05, 0.6, 0.075], [1, 1.6, 0.3], { z: 0.3 })];
  rosto(pecas, k, { centro: [0, 0.45, 0.085], sep: 0.11, r: 0.03, iris: '#2a1a10', pele: A, boca: { cor: t(C.bocaF!), dy: 0.06, larg: 0.05 } });
  if (cometa) {
    // a cauda azul de cometa, saindo de trás para baixo
    const B = t('#8ac8f0'), BL = t('#d0ecff');
    for (let i = 0; i < 3; i++) {
      pecas.push(torneado([[0.001, 0], [0.04, 0.06], [0.05, 0.2], [0.03, 0.42], [0.001, 0.55]], i === 1 ? BL : B,
        [-0.18 - i * 0.05, 0.42, -0.08 - i * 0.03], undefined, { z: 2.0 + i * 0.12 }));
    }
  }
  return [corpo(k, pecas)];
}

const luzeiro: Escultura = (k) => estrelaViva(k, false);
const estrelaDalva: Escultura = (k) => estrelaViva(k, true);

/* o Fogo-Fátuo: a chama azul que vaga, de pontas para cima, com cara */
const fogoFatuo: Escultura = (k) => {
  const t = k.t, A = t('#3a7ad8'), AL = t('#7ab8f4'), AC = t('#d0ecff');
  const corpoChama = torneado([[0.001, 0.08], [0.14, 0.12], [0.22, 0.26], [0.22, 0.4], [0.17, 0.52], [0.08, 0.64], [0.001, 0.72]], A);
  const a = cor(A), al = cor(AL), ac = cor(AC);
  pintar(corpoChama, (p) => {
    const dentro = 1 - Math.hypot(p.x, p.z) / 0.22;
    // o miolo claro aparece na frente, embaixo; a ponta é do azul forte
    const c = p.z > 0.05 && p.y < 0.45 ? ac.clone().lerp(al, (p.y - 0.15) / 0.3) : al.clone().lerp(a, Math.min(1, (p.y - 0.2) / 0.4));
    return c.multiplyScalar(1.25 + dentro * 0.2);
  });
  const pecas: THREE.BufferGeometry[] = [corpoChama];
  for (const s of [-1, 1]) pecas.push(cone(0.06, 0.2, s < 0 ? A : AL, [s * 0.15, 0.6, -0.02], { z: -s * 0.5 }));
  rosto(pecas, k, { centro: [0, 0.34, 0.2], sep: 0.12, r: 0.04, iris: '#1a2a4a', pele: AC });
  return [corpo(k, pecas)];
};

/* Jaci: a lua cheia pela metade — um lado claro, o outro na sombra roxa */
const jaci: Escultura = (k) => {
  const t = k.t, CL = t('#f2e8c8'), ES = t('#4a3a6a'), CR = t('#c8bc98');
  const g = esfera(0.34, CL, [0, 0.46, 0], [0.85, 1.05, 0.7], {}, 32);
  const cl = cor(CL), es = cor(ES), cr = cor(CR);
  pintar(g, (p) => {
    if (p.x > -0.04 + Math.sin(p.y * 6) * 0.03) return es;
    // as crateras no lado claro
    return Math.sin(p.x * 40) * Math.sin(p.y * 37) > 0.75 ? cr : cl;
  });
  const pecas: THREE.BufferGeometry[] = [g];
  rosto(pecas, k, { centro: [0, 0.48, 0.235], sep: 0.14, r: 0.035, iris: '#2a1a3a', pele: CL,
    boca: { cor: t(C.bocaF!), dy: 0.08, larg: 0.07 } });
  return [corpo(k, pecas)];
};

/* o Eclipse: a lua escura na frente do sol, a coroa de raios de ouro atrás */
const eclipse: Escultura = (k) => {
  const t = k.t, E = t('#2a2040'), O = t('#f6c83a'), OL = t('#fff2a0');
  const pecas: THREE.BufferGeometry[] = [esfera(0.27, E, [0, 0.46, 0], [1, 1, 0.75], {}, 28)];
  // a coroa: o anel de luz e os raios
  pecas.push(esfera(0.31, O, [0, 0.46, -0.04], [1, 1, 0.3]));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    pecas.push(cone(0.05, i % 2 ? 0.12 : 0.18, i % 2 ? OL : O, [Math.cos(a) * 0.36, 0.46 + Math.sin(a) * 0.36, -0.04], { z: a - Math.PI / 2 }, [1, 1, 0.35]));
  }
  rosto(pecas, k, { centro: [0, 0.48, 0.2], sep: 0.14, r: 0.04, iris: O, pele: E, boca: { cor: O, dy: 0.08, larg: 0.08 } });
  return [corpo(k, pecas)];
};

export const CEU: Record<string, Escultura> = { luzeiro, estrelaDalva, fogoFatuo, jaci, eclipse };
