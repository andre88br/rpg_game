/* =========================================================================
   Os Encantados esculpidos: em vez de virar o desenho 2D sólido, o bicho é
   modelado em 3D de verdade — corpo de cobra varrido ao longo de uma curva,
   cauda de peixe com escama, gente-bicho de proporção de criança, olho com
   branco, íris, pupila e brilho, e fogo que acende de dentro.

   As cores são as do desenho (art/creatures.ts), então o bicho continua o
   mesmo; o raro troca as cores pelo mesmo mapa do raro 2D.

   Os 54 estão aqui, por família (esculpidos/*.ts), montados com o kit de
   escultura.ts. Cada modelo devolve as mesmas partes que a animação
   conhece: `corpo`, `cabeca` e, quando tem, `bracoE`/`bracoD`, `asaE`/`asaD`
   e `cauda`. O desenho virado sólido (desenho3d.ts) fica para a espécie
   nova que ainda não foi esculpida.
   ========================================================================= */
import * as THREE from 'three';
import { ARTE_CRIATURAS, type Pose } from '../../art/creatures.ts';
import { especie } from '../../data/creatures.ts';
import { trocaRara } from './desenho3d.ts';
import type { Escultura, Tinta } from './escultura.ts';
import { boitatinha, curupinho, iarinha } from './esculpidos/iniciais.ts';
import { FOGO } from './esculpidos/fogo.ts';
import { AGUA } from './esculpidos/agua.ts';
import { MATA } from './esculpidos/mata.ts';
import { AR } from './esculpidos/ar.ts';
import { TERRA } from './esculpidos/terra.ts';
import { SOMBRA } from './esculpidos/sombra.ts';
import { CEU } from './esculpidos/ceu.ts';

/* ----------------------------------------------------------------- entrada */

const MODELOS: Record<string, Escultura> = {
  boitatinha: (k) => boitatinha(k.t, k.mat, k.pose),
  iarinha: (k) => iarinha(k.t, k.mat, k.pose),
  curupinho: (k) => curupinho(k.t, k.mat, k.pose),
  ...FOGO,
  ...AGUA,
  ...MATA,
  ...AR,
  ...TERRA,
  ...SOMBRA,
  ...CEU,
};

export function temModeloReal(id: string): boolean { return id in MODELOS; }

/* as partes do bicho esculpido; o corpo vem com o nome 'corpo#' (o grupo
   'corpo' de verdade é o de quem chama) */
export function modeloReal(id: string, raro: boolean, mat: THREE.Material, pose: Pose): THREE.Group[] {
  const f = MODELOS[id];
  if (!f) return [];
  const arte = ARTE_CRIATURAS[especie(id).arte]!;
  const t: Tinta = raro ? trocaRara(arte(), id) : (c) => c;
  return f({ t, mat, pose });
}
