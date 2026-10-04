/* =========================================================================
   Os Encantados em 3D: cada um é o PRÓPRIO desenho 2D, peça por peça,
   virado sólido (desenho3d.ts), com os ajustes da espécie (bichos.ts).

   O modelo é um grupo `corpo` (que a animação move inteiro) com o contorno
   escuro por fora, como o contorno do desenho, e as partes que mexem
   sozinhas — asas, cauda, braços, cabeça — penduradas no pivô delas.

   O tamanho vem da linha de evolução: o filhote é menor, a forma de cima é
   maior, e o lendário é o maior de todos.
   ========================================================================= */
import * as THREE from 'three';
import { ESPECIES, ESPECIES_ORDEM, especie } from '../../data/creatures.ts';
import { ARTE_CRIATURAS } from '../../art/creatures.ts';
import { P } from '../../art/palette.ts';
import { desenho3D, type ParteMovel } from './desenho3d.ts';
import { AJUSTES } from './bichos.ts';

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

/* o contorno: as peças um tico maiores, pintadas por dentro, na cor do traço */
const MAT_CONTORNO = new THREE.MeshBasicMaterial({ color: P.ink!, side: THREE.BackSide });

/* o material dos bichos: a cor do vértice, com um fio de luz própria — o
   desenho 2D é chapado e vivo, e o bicho escuro (a Matinta, o Lobisomem)
   não pode virar uma mancha preta na sombra */
export const MAT_BICHO = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
MAT_BICHO.onBeforeCompile = (sh) => {
  sh.fragmentShader = sh.fragmentShader.replace(
    '#include <emissivemap_fragment>',
    '#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * 0.28;');
};

/* monta o Encantado da espécie (o raro com as cores do desenho raro) */
export function encantado3D(id: string, raro: boolean, mat: THREE.Material = MAT_BICHO): THREE.Group {
  const ficha = ESPECIES[id];
  const arte = ficha ? ARTE_CRIATURAS[ficha.arte] : undefined;
  const raiz = new THREE.Group();
  const g = new THREE.Group();
  g.name = 'corpo';
  raiz.add(g);
  if (!arte) return raiz;
  const d = desenho3D(arte, id, AJUSTES[id], raro);
  for (const [nome, p] of d.partes) {
    const alvo = nome === 'corpo' ? g : new THREE.Group();
    if (alvo !== g) {
      alvo.name = nome;
      alvo.position.copy(p.pivo);
      g.add(alvo);
    }
    const m = new THREE.Mesh(p.cor, mat);
    m.castShadow = true;
    if (nome === 'corpo') m.position.copy(p.pivo);
    alvo.add(m);
    if (p.contorno) {
      const c = new THREE.Mesh(p.contorno, MAT_CONTORNO);
      if (nome === 'corpo') c.position.copy(p.pivo);
      alvo.add(c);
    }
  }
  g.userData['flutua'] = d.flutua;
  g.userData['altura'] = d.altura;
  raiz.scale.setScalar(tamanhoDe(id));
  return raiz;
}

/* as partes que mexem sozinhas, no quadro */
function mexerPartes(g: THREE.Object3D, acao: AcaoEncantado, t: number, relogio: number): void {
  const parte = (n: ParteMovel) => g.getObjectByName(n);
  const bate = Math.sin(relogio * (acao === 'andar' ? 14 : 5));
  const ae = parte('asaE'), ad = parte('asaD');
  if (ae) ae.rotation.z = -bate * 0.35;
  if (ad) ad.rotation.z = bate * 0.35;
  const cauda = parte('cauda');
  if (cauda) cauda.rotation.y = Math.sin(relogio * 3) * 0.25;
  const golpe = acao === 'atacar' ? Math.sin(Math.min(1, t / 0.45) * Math.PI) : 0;
  const be = parte('bracoE'), bd = parte('bracoD');
  if (be) be.rotation.x = -golpe * 1.2 + Math.sin(relogio * 2.2) * 0.05;
  if (bd) bd.rotation.x = -golpe * 1.2 - Math.sin(relogio * 2.2) * 0.05;
  const cab = parte('cabeca');
  if (cab) cab.rotation.x = acao === 'dano' && t < 0.4 ? -0.3 : Math.sin(relogio * 1.6) * 0.04 + golpe * 0.2;
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
  mexerPartes(g, acao, t, relogio);
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
