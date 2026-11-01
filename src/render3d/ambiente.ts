/* =========================================================================
   A luz do céu como ambiente (environment map): um céu de mentira — o
   degradê do topo ao horizonte, o chão embaixo e o sol — virado mapa de
   reflexo pelo PMREM. Com ele, todo material de luz física pega a cor do
   céu na sombra e reflete o céu no brilho (pele, olho, água parada, verniz),
   que é o que mais separa "boneco" de "coisa de verdade".
   Um por combinação de cores, guardado.
   ========================================================================= */
import * as THREE from 'three';

const guardados = new Map<string, THREE.Texture>();

export function ambienteDoCeu(renderer: THREE.WebGLRenderer, topo: string, base: string, chao: string,
                              sol: THREE.Vector3): THREE.Texture {
  const chave = `${topo}|${base}|${chao}|${sol.x.toFixed(1)},${sol.y.toFixed(1)},${sol.z.toFixed(1)}`;
  const ja = guardados.get(chave);
  if (ja) return ja;
  if (guardados.size > 12) { for (const t of guardados.values()) t.dispose(); guardados.clear(); }
  const cena = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTopo: { value: new THREE.Color(topo) }, uBase: { value: new THREE.Color(base) },
      uChao: { value: new THREE.Color(chao) }, uSol: { value: sol.clone().normalize() },
    },
    vertexShader: 'varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform vec3 uTopo; uniform vec3 uBase; uniform vec3 uChao; uniform vec3 uSol;
      varying vec3 vDir;
      void main() {
        float y = vDir.y;
        vec3 c = y > 0.0 ? mix(uBase, uTopo, pow(y, 0.55)) : mix(uBase, uChao * 0.8, smoothstep(0.0, 0.25, -y));
        // o sol e o brilho em volta dele
        float s = max(dot(normalize(vDir), uSol), 0.0);
        c += vec3(1.0, 0.95, 0.85) * (pow(s, 600.0) * 30.0 + pow(s, 12.0) * 0.6);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  cena.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), mat));
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(cena, 0.02).texture;
  pmrem.dispose();
  mat.dispose();
  guardados.set(chave, tex);
  return tex;
}
