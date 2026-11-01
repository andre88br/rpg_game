/* =========================================================================
   Os materiais dos bichos esculpidos de verdade (sdf.ts): a ordem é o
   índice `mat` das formas.
     0 PELE    — oleosa, de brilho mole, com a luz atravessando a borda
     1 PANO    — áspero, de felpa (sheen) e trama
     2 DURO    — madeira, dente, unha: brilho firme
     3 FUMAÇA  — o que é de ar: fumaça, vento, transparente
   Todos de cor por vértice, todos pegando o ambiente do céu.
   ========================================================================= */
import * as THREE from 'three';
import { comGrao } from './base.ts';

/* a pele: um tico de verniz (o brilho que a referência tem na testa e no
   ombro), a felpa quente na borda e a luz que "atravessa" — na sombra,
   a pele não vai a preto: puxa para o vermelho do sangue embaixo */
function pele(): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.48, metalness: 0,
    clearcoat: 0.12, clearcoatRoughness: 0.45, envMapIntensity: 0.45,
    sheen: 0.12, sheenRoughness: 0.6, sheenColor: new THREE.Color('#7a3a22'),
  });
  comGrao(m, 0.035, 0.05);
  const antes = m.onBeforeCompile;
  m.onBeforeCompile = (s, r) => {
    antes.call(m, s, r);
    s.fragmentShader = s.fragmentShader.replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
      // o espalhamento sob a pele: devolve um pouco de luz avermelhada onde
      // a luz direta não chega, mais na borda (orelha, nariz, dedo)
      float borda = 1.0 - abs(dot(normal, normalize(vViewPosition)));
      reflectedLight.indirectDiffuse += diffuseColor.rgb * vec3(0.22, 0.07, 0.03) * (0.3 + borda * 0.7);`);
  };
  const chave = m.customProgramCacheKey.bind(m);
  m.customProgramCacheKey = () => `${chave()}|pele`;
  return m;
}

function pano(): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.92, metalness: 0, envMapIntensity: 0.5,
    sheen: 0.3, sheenRoughness: 0.8, sheenColor: new THREE.Color('#5a1a14'),
  });
  return comGrao(m, 0.22, 0.12);
}

function duro(): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.35, envMapIntensity: 0.5 });
  return comGrao(m, 0.12, 0.08);
}

function fumaca(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, transparent: true, opacity: 0.45, depthWrite: false });
}

/* o olho: o globo de esmalte e a córnea brilhante */
export const MAT_OLHO = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 0.6 });

export const MATERIAIS_REAIS: THREE.Material[] = [pele(), pano(), duro(), fumaca()];
