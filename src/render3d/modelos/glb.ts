/* =========================================================================
   Encantados de arquivo: o modelo pronto (.glb, feito em ferramenta de arte
   ou gerado por IA) em `public/modelos/<espécie>.glb`. Se a espécie está em
   MODELOS_GLB e o arquivo já baixou, ele vale no lugar do esculpido; senão,
   fica o esculpido de sempre.

   O modelo é acertado na chegada: de pé no chão (y = 0), no meio, virado
   para +z e com a altura dos esculpidos. Se o arquivo tem esqueleto feito
   à mão (esqueleto.ts), a malha ganha os ossos e mexe braço, cabeça, perna;
   sem ele, o bicho respira, pula e avança inteiro.
   ========================================================================= */
import * as THREE from 'three';
import { clone as clonarComOssos } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ESQUELETOS, armar } from './esqueleto.ts';

/* as espécies que têm arquivo, e o nome do arquivo (o Saci crescido usa o
   mesmo do Sacizinho: o tamanho da espécie já o deixa maior) */
export const MODELOS_GLB: Readonly<Record<string, string>> = {};

/* a altura que o modelo ganha (a mesma dos esculpidos, antes do tamanho da espécie) */
const ALTURA = 0.95;

const prontos = new Map<string, THREE.Group>();
let pedido: Promise<void> | null = null;

/* baixa os arquivos (uma vez); quem chama não precisa esperar */
export function carregarModelosGlb(base: string): Promise<void> {
  const arquivos = [...new Set(Object.values(MODELOS_GLB))];
  if (pedido || arquivos.length === 0) return pedido ?? Promise.resolve();
  pedido = import('three/examples/jsm/loaders/GLTFLoader.js').then(async ({ GLTFLoader }) => {
    const loader = new GLTFLoader();
    await Promise.all(arquivos.map(async (nome) => {
      try {
        const gltf = await loader.loadAsync(`${base}modelos/${nome}.glb`);
        const modelo = acertar(gltf.scene, nome);
        for (const [id, arq] of Object.entries(MODELOS_GLB)) if (arq === nome) prontos.set(id, modelo);
      } catch {
        // sem o arquivo, fica o esculpido
      }
    }));
  });
  return pedido;
}

/* põe o modelo de pé, no meio, do tamanho certo */
function acertar(cena: THREE.Object3D, nome: string): THREE.Group {
  const caixa = new THREE.Box3().setFromObject(cena);
  const alto = Math.max(0.001, caixa.max.y - caixa.min.y);
  const s = ALTURA / alto;
  const meio = caixa.getCenter(new THREE.Vector3());
  cena.position.set(-meio.x * s, -caixa.min.y * s, -meio.z * s);
  cena.scale.setScalar(s);
  cena.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = true; m.receiveShadow = true;
    // o material que vem do gerador é chapado: um tico de brilho de pele
    const mat = m.material as THREE.MeshStandardMaterial;
    if (mat.isMeshStandardMaterial) { mat.roughness = 0.62; mat.metalness = 0; mat.envMapIntensity = 0.5; }
  });
  const g = new THREE.Group();
  g.add(cena);
  const esq = ESQUELETOS[nome];
  if (!esq) return g;
  // com esqueleto: a malha vai para o lugar final (sem escala nem
  // deslocamento) e troca por uma de ossos
  g.updateMatrixWorld(true);
  const armado = new THREE.Group();
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const geo = m.geometry.clone().applyMatrix4(m.matrixWorld);
    armado.add(armar(geo, m.material as THREE.Material, esq));
  });
  return armado;
}

/* uma cópia do modelo da espécie, se ele já chegou */
export function modeloGlb(id: string): THREE.Group | null {
  const m = prontos.get(id);
  return m ? (clonarComOssos(m) as THREE.Group) : null;
}
