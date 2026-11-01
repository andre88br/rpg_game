/* =========================================================================
   Encantados de arquivo: o modelo pronto (.glb, feito em ferramenta de arte
   ou gerado por IA) em `public/modelos/<espécie>.glb`. Se a espécie está em
   MODELOS_GLB e o arquivo já baixou, ele vale no lugar do esculpido; senão,
   fica o esculpido de sempre.

   O modelo é acertado na chegada: de pé no chão (y = 0), no meio, virado
   para +z e com a altura dos esculpidos. Partes que a animação conhece
   (`cabeca`, `bracoE`...) valem se o arquivo tiver nós com esses nomes;
   sem elas, o bicho respira, pula e avança inteiro.
   ========================================================================= */
import * as THREE from 'three';

/* as espécies que têm arquivo (vazio até chegar o primeiro) */
export const MODELOS_GLB: readonly string[] = [];

/* a altura que o modelo ganha (a mesma dos esculpidos, antes do tamanho da espécie) */
const ALTURA = 0.95;

const prontos = new Map<string, THREE.Group>();
let pedido: Promise<void> | null = null;

/* baixa os arquivos (uma vez); quem chama não precisa esperar */
export function carregarModelosGlb(base: string): Promise<void> {
  if (pedido || MODELOS_GLB.length === 0) return pedido ?? Promise.resolve();
  pedido = import('three/examples/jsm/loaders/GLTFLoader.js').then(async ({ GLTFLoader }) => {
    const loader = new GLTFLoader();
    await Promise.all(MODELOS_GLB.map(async (id) => {
      try {
        const gltf = await loader.loadAsync(`${base}modelos/${id}.glb`);
        prontos.set(id, acertar(gltf.scene));
      } catch {
        // sem o arquivo, fica o esculpido
      }
    }));
  });
  return pedido;
}

/* põe o modelo de pé, no meio, do tamanho certo */
function acertar(cena: THREE.Object3D): THREE.Group {
  const caixa = new THREE.Box3().setFromObject(cena);
  const alto = Math.max(0.001, caixa.max.y - caixa.min.y);
  const s = ALTURA / alto;
  const meio = caixa.getCenter(new THREE.Vector3());
  cena.position.set(-meio.x * s, -caixa.min.y * s, -meio.z * s);
  cena.scale.setScalar(s);
  cena.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
  });
  const g = new THREE.Group();
  g.add(cena);
  return g;
}

/* uma cópia do modelo da espécie, se ele já chegou */
export function modeloGlb(id: string): THREE.Group | null {
  const m = prontos.get(id);
  return m ? m.clone(true) : null;
}
