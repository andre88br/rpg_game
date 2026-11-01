/* Os três iniciais: Boitatinha, Iarinha e Curupinho (o protótipo do estilo). */
import * as THREE from 'three';
import { fundir, lisa, peca, sorte } from '../base.ts';
import { C, type Pose } from '../../../art/creatures.ts';
import { chama, cor, esfera, olho, parte, tubo, varrer, type Tinta, type V3 } from '../escultura.ts';

/* -------------------------------------------------------------- Boitatinha

   Filhote de cobra de fogo: o rabo enrolado no chão, o corpo em pé feito
   naja, barriga amarela de placas, costas verdes com losangos escuros, a
   coroa de fogo na cabeça e a pontinha do rabo acesa. */
export function boitatinha(t: Tinta, mat: THREE.Material, pose: Pose): THREE.Group[] {
  const verde = cor(t(C.boi!)), escuro = cor(t(C.boiD!)), claro = cor(t(C.boiL!));
  const amarelo = cor(t(C.boiB!)), placa = cor(t(C.boiBD!));
  const pontos: V3[] = [
    [0.36, 0.05, -0.2], [0.3, 0.06, 0.02], [0.12, 0.08, 0.14], [-0.1, 0.08, 0.1],
    [-0.16, 0.08, -0.08], [-0.02, 0.1, -0.16], [0.06, 0.2, -0.06], [0.03, 0.4, 0.0],
    [0.0, 0.58, 0.03], [0.0, 0.7, 0.07],
  ];
  const raio = (u: number) => u < 0.12 ? 0.012 + (u / 0.12) * 0.05 : u > 0.94 ? 0.08 : 0.062 + Math.min(1, (u - 0.12) / 0.4) * 0.03;
  const corpo = varrer(pontos, raio, 18, 90, (u, a, barriga) => {
    if (barriga > 0.35) {
      // as placas da barriga, em faixas
      return Math.sin(u * 160) > 0.55 ? placa : amarelo;
    }
    // os losangos das costas: escuros no meio do dorso
    const losango = Math.abs(((u * 26) % 1) - 0.5) * 2 + Math.abs(Math.sin(a)) * 0.9;
    const c = losango < 0.55 ? escuro : verde;
    return barriga < -0.8 && losango > 1.1 ? claro : c;
  }, (tg) => (Math.abs(tg.y) > 0.6 ? new THREE.Vector3(0, -0.2, 1) : new THREE.Vector3(0, -1, 0)));

  const pecas: THREE.BufferGeometry[] = [corpo, chama(0.2, 0.05, [0.36, 0.04, -0.21], { x: -0.35, z: -0.25 }, t)];
  // a cabeça: crânio achatado e comprido, focinho redondo, queixo amarelo
  const CY = 0.76, CZ = 0.1;
  const cab: THREE.BufferGeometry[] = [
    esfera(0.1, t(C.boi!), [0, CY, CZ], [1, 0.72, 1.25]),
    esfera(0.075, t(C.boi!), [0, CY - 0.005, CZ + 0.09], [1, 0.62, 1.1]),
    esfera(0.08, t(C.boiB!), [0, CY - 0.035, CZ + 0.055], [0.95, 0.4, 1.25]),
    esfera(0.005, '#1a1210', [-0.022, CY + 0.012, CZ + 0.175], [1, 0.6, 1]),
    esfera(0.005, '#1a1210', [0.022, CY + 0.012, CZ + 0.175], [1, 0.6, 1]),
  ];
  // a boca: um risco escuro em volta do focinho, e a língua bifurcada
  cab.push(esfera(0.075, t(C.bocaF!), [0, CY - 0.02, CZ + 0.07], [1.0, 0.06, 1.2]));
  if (pose !== 'desmaio') {
    cab.push(tubo(0.006, 0.006, 0.08, t(C.lingua!), [0, CY - 0.03, CZ + 0.2], { x: Math.PI / 2 + 0.3 }));
    cab.push(tubo(0.004, 0.005, 0.04, t(C.lingua!), [-0.01, CY - 0.045, CZ + 0.25], { x: Math.PI / 2 + 0.3, z: 0.5 }));
    cab.push(tubo(0.004, 0.005, 0.04, t(C.lingua!), [0.01, CY - 0.045, CZ + 0.25], { x: Math.PI / 2 + 0.3, z: -0.5 }));
  }
  for (const s of [-1, 1]) {
    olho(cab, [s * 0.062, CY + 0.03, CZ + 0.08], 0.032, new THREE.Vector3(s * 0.85, 0.15, 0.55), '#e8a020', t(C.boi!), pose, true);
  }
  // a coroa de fogo: línguas tortas para trás, a do meio mais alta
  for (let k = 0; k < 5; k++) {
    const x = (k - 2) * 0.035, alto = 0.2 - Math.abs(k - 2) * 0.035;
    cab.push(chama(alto, 0.045, [x, CY + 0.045, CZ - 0.02 - Math.abs(k - 2) * 0.01], { x: -0.45 + sorte(k, 1) * 0.15, z: -x * 2.5 }, t));
  }
  return [
    parte('corpo#', [0, 0, 0], fundir(pecas), mat),
    parte('cabeca', [0, CY - 0.05, CZ - 0.04], fundir(cab), mat),
  ];
}

/* ---------------------------------------------------------------- Iarinha

   Menina do rio: tronco de criança, cabelo preto liso até a cintura com
   franja reta, a pintura vermelha atravessando o rosto, o top de folha, e a
   cauda de peixe escamada enrolando no chão, com a nadadeira aberta. */
export function iarinha(t: Tinta, mat: THREE.Material, pose: Pose): THREE.Group[] {
  const esc = cor(t(C.iar!)), escL = cor(t(C.iarL!)), escD = cor(t(C.iarD!));
  const pontos: V3[] = [
    [0, 0.44, 0.0], [0, 0.3, 0.02], [0.0, 0.14, 0.06], [0.08, 0.06, 0.1], [0.22, 0.05, 0.06], [0.3, 0.05, -0.06], [0.32, 0.06, -0.16],
  ];
  const cauda = varrer(pontos, (u) => 0.1 * (1 - u * 0.72) + (u < 0.1 ? 0 : 0), 16, 70, (u, a, barriga) => {
    // escama: um xadrez de meia-lua, mais escuro na borda de cada uma
    const fila = Math.floor(u * 40), coluna = (a / (Math.PI * 2)) * 16 + (fila % 2) * 0.5;
    const borda = Math.abs((coluna % 1) - 0.5) * 2 * 0.6 + ((u * 40) % 1) * 0.6;
    const base = barriga > 0.4 ? escL : esc;
    return borda > 0.85 ? escD : base;
  }, (tg) => (Math.abs(tg.y) > 0.6 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, -1, 0)));
  const pecas: THREE.BufferGeometry[] = [cauda];
  // a nadadeira: dois lobos finos, abertos
  for (const s of [-1, 1]) {
    pecas.push(esfera(0.09, t(C.iarL!), [0.32 + s * 0.06, 0.06, -0.26], [0.55, 0.12, 1], { y: s * 0.6 }));
  }
  pecas.push(esfera(0.03, t(C.iar!), [0.32, 0.06, -0.18], [1, 0.8, 1.4]));
  // o tronco de criança, o pescoço e o top de folha
  const PELE = t(C.pele!), PELE_D = t(C.peleD!);
  pecas.push(lisa(peca(new THREE.LatheGeometry([
    [0.001, 0.4], [0.098, 0.4], [0.092, 0.47], [0.1, 0.54], [0.112, 0.6], [0.09, 0.635], [0.04, 0.65], [0.001, 0.655],
  ].map(([r, y]) => new THREE.Vector2(r!, y!)), 16), PELE, 0, 0, 0, {}, [1, 1, 0.72])));
  pecas.push(tubo(0.032, 0.036, 0.07, PELE, [0, 0.67, 0]));
  pecas.push(lisa(peca(new THREE.LatheGeometry([
    [0.104, 0.52], [0.116, 0.56], [0.112, 0.6], [0.104, 0.61],
  ].map(([r, y]) => new THREE.Vector2(r!, y!)), 16), t(C.iarL!), 0, 0, 0, {}, [1, 1, 0.76])));
  for (let k = 0; k < 6; k++) {
    const a = -0.9 + k * 0.36;
    pecas.push(esfera(0.03, k % 2 ? t(C.iarL!) : t(C.iar!), [Math.sin(a) * 0.1, 0.515, Math.cos(a) * 0.075], [0.6, 1.3, 0.25], { y: a }));
  }
  // o cabelo comprido pelas costas
  pecas.push(esfera(0.13, t(C.iarH!), [0, 0.6, -0.07], [1.05, 1.55, 0.42]));

  // a cabeça
  const CY = 0.8, R = 0.12;
  const cab: THREE.BufferGeometry[] = [
    esfera(R, PELE, [0, CY, 0], [0.92, 1.05, 0.98]),
    esfera(0.022, PELE, [-R * 0.9, CY - 0.01, -0.005], [0.5, 1, 0.8]),
    esfera(0.022, PELE, [R * 0.9, CY - 0.01, -0.005], [0.5, 1, 0.8]),
    lisa(peca(new THREE.ConeGeometry(0.014, 0.032, 8), PELE_D, 0, CY - 0.018, R * 0.96, { x: Math.PI / 2 - 0.4 })),
    esfera(0.02, '#a04848', [0, CY - 0.055, R * 0.86], [1, 0.32, 0.4]),
  ];
  // a pintura vermelha: uma faixa de um lado a outro, na altura do nariz
  cab.push(lisa(peca(new THREE.SphereGeometry(R * 1.008, 24, 3, Math.PI * 0.14, Math.PI * 0.72, Math.PI * 0.53, Math.PI * 0.06),
    t(C.pintura!), 0, CY, 0, {}, [0.92, 1.05, 0.98])));
  for (const s of [-1, 1]) {
    olho(cab, [s * 0.04, CY + 0.018, R * 0.8], 0.02, new THREE.Vector3(s * 0.15, 0, 1), '#3a2618', PELE, pose);
    cab.push(lisa(peca(new THREE.BoxGeometry(0.036, 0.007, 0.01), t(C.iarH!), s * 0.04, CY + 0.048, R * 0.86, { z: -s * 0.1 })));
  }
  // o cabelo: a calota, a franja reta e as mechas que descem do lado do rosto
  cab.push(lisa(peca(new THREE.SphereGeometry(R * 1.07, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), t(C.iarH!),
    0, CY + 0.005, -0.01, { x: -0.3 }, [0.96, 1.06, 1.02])));
  // a franja reta: mechas lado a lado, caindo na testa até a sobrancelha
  for (let k = 0; k < 9; k++) {
    const x = (k - 4) * 0.019;
    cab.push(esfera(0.016, t(C.iarH!), [x, CY + 0.07, R * 0.87 - Math.abs(x) * 0.4], [1.15, 2.1, 0.4], { x: 0.25 }));
  }
  for (const s of [-1, 1]) cab.push(esfera(0.035, t(C.iarH!), [s * R * 0.86, CY - 0.06, 0.03], [0.5, 2.3, 0.8]));
  cab.push(esfera(0.03, t(C.iarHL!), [0.035, CY + 0.118, 0.015], [1.4, 0.18, 0.9], { z: -0.3 }));

  const bracos: THREE.Group[] = [];
  for (const [nome, s] of [['bracoE', -1], ['bracoD', 1]] as const) {
    bracos.push(parte(nome, [s * 0.1, 0.62, 0], fundir([
      tubo(0.026, 0.023, 0.16, PELE, [s * 0.115, 0.54, 0.0], { z: s * 0.15 }),
      tubo(0.022, 0.018, 0.14, PELE, [s * 0.13, 0.42, 0.04], { x: -0.6, z: s * 0.1 }),
      esfera(0.022, PELE, [s * 0.13, 0.36, 0.09], [0.8, 1.1, 1]),
    ]), mat));
  }
  return [
    parte('corpo#', [0, 0, 0], fundir(pecas), mat),
    parte('cabeca', [0, 0.68, 0], fundir(cab), mat),
    ...bracos,
  ];
}

/* --------------------------------------------------------------- Curupinho

   Menino-bicho da mata: pele morena clara, cabelo de fogo espetado para
   trás, saia de folhas, a lança na mão direita e os pés VIRADOS PARA TRÁS,
   o calcanhar na frente e os dedos apontando para trás. */
export function curupinho(t: Tinta, mat: THREE.Material, pose: Pose): THREE.Group[] {
  const PELE = t(C.peleC!), PELE_D = t(C.peleCD!);
  const pecas: THREE.BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    pecas.push(tubo(0.03, 0.026, 0.16, PELE, [s * 0.045, 0.3, 0]));
    pecas.push(tubo(0.026, 0.022, 0.16, PELE, [s * 0.045, 0.15, 0]));
    // o pé ao contrário: o calcanhar (bola) para a frente, os dedos para trás
    pecas.push(esfera(0.03, PELE_D, [s * 0.045, 0.03, 0.02], [1, 0.9, 1]));
    pecas.push(esfera(0.034, PELE, [s * 0.045, 0.025, -0.05], [0.9, 0.55, 1.7]));
    for (let k = 0; k < 4; k++) pecas.push(esfera(0.009, PELE_D, [s * 0.045 + (k - 1.5) * 0.013, 0.02, -0.11], [1, 0.8, 1.3], {}, 8));
  }
  // o tronco pequeno, o pescoço
  pecas.push(lisa(peca(new THREE.LatheGeometry([
    [0.001, 0.36], [0.07, 0.36], [0.075, 0.42], [0.088, 0.5], [0.09, 0.55], [0.07, 0.58], [0.03, 0.59], [0.001, 0.595],
  ].map(([r, y]) => new THREE.Vector2(r!, y!)), 16), PELE, 0, 0, 0, {}, [1, 1, 0.75])));
  pecas.push(tubo(0.028, 0.032, 0.06, PELE, [0, 0.61, 0]));
  // a saia de folhas: lâminas pontudas em volta da cintura, caindo
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    pecas.push(lisa(peca(new THREE.ConeGeometry(0.032, 0.13, 6), k % 3 === 0 ? t(C.curD!) : k % 3 === 1 ? t(C.cur!) : t(C.curL!),
      Math.sin(a) * 0.08, 0.33, Math.cos(a) * 0.065, { x: Math.cos(a) * 0.35 + Math.PI, z: -Math.sin(a) * 0.35, y: a }, [1, 1, 0.3])));
  }
  pecas.push(tubo(0.08, 0.078, 0.03, t(C.curD!), [0, 0.385, 0], {}, [1, 1, 0.78]));

  // a cabeça e o cabelo de fogo
  const CY = 0.73, R = 0.12;
  const cab: THREE.BufferGeometry[] = [
    esfera(R, PELE, [0, CY, 0], [0.92, 1.04, 0.98]),
    esfera(0.024, PELE, [-R * 0.9, CY - 0.005, -0.005], [0.5, 1, 0.8]),
    esfera(0.024, PELE, [R * 0.9, CY - 0.005, -0.005], [0.5, 1, 0.8]),
    lisa(peca(new THREE.ConeGeometry(0.016, 0.034, 8), PELE_D, 0, CY - 0.018, R * 0.96, { x: Math.PI / 2 - 0.4 })),
    esfera(0.022, '#9a4a3a', [0, CY - 0.055, R * 0.85], [1, 0.3, 0.4]),
  ];
  for (const s of [-1, 1]) {
    olho(cab, [s * 0.042, CY + 0.015, R * 0.8], 0.021, new THREE.Vector3(s * 0.15, 0, 1), '#3e6a2a', PELE, pose);
    cab.push(lisa(peca(new THREE.BoxGeometry(0.038, 0.009, 0.01), t(C.cabeloF!), s * 0.042, CY + 0.047, R * 0.86,
      { z: -s * (pose === 'ataque' ? -0.35 : 0.12) })));
  }
  cab.push(lisa(peca(new THREE.SphereGeometry(R * 1.06, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), t(C.cabeloF!),
    0, CY + 0.01, -0.012, { x: -0.35 }, [0.98, 1.04, 1.02])));
  // o cabelo de fogo: mechas grossas saindo da cabeça inteira, todas
  // puxadas para cima e para trás, como labareda; e a franja caindo na testa
  for (let k = 0; k < 22; k++) {
    const u = sorte(k, 7);                       // 0 = testa, 1 = nuca
    const a = (sorte(k, 8) - 0.5) * 2.6;         // de um lado a outro
    const alto = 0.13 + sorte(k, 2) * 0.09;
    const px = Math.sin(a) * R * 0.85 * (1 - u * 0.3), pz = R * (0.55 - u * 1.2);
    const py = CY + 0.05 + Math.cos(a) * 0.04 - u * 0.02;
    cab.push(lisa(peca(new THREE.ConeGeometry(0.042, alto, 7), k % 3 ? t(C.cabeloF!) : t(C.cabeloFL!),
      px, py + alto * 0.3, pz, { x: -0.6 - u * 0.7 - sorte(k, 3) * 0.3, z: -a * 0.5 })));
  }
  for (let k = 0; k < 5; k++) {
    const x = (k - 2) * 0.03;
    cab.push(lisa(peca(new THREE.ConeGeometry(0.02, 0.06, 6), t(C.cabeloF!), x, CY + 0.06, R * 0.82 - Math.abs(x) * 0.3,
      { x: Math.PI - 0.5, z: x * 3 })));
  }

  // os braços; o direito segura a lança
  const bracoE = parte('bracoE', [-0.09, 0.56, 0], fundir([
    tubo(0.024, 0.021, 0.14, PELE, [-0.1, 0.49, 0], { z: -0.15 }),
    tubo(0.02, 0.017, 0.13, PELE, [-0.115, 0.37, 0.01], { z: -0.08 }),
    esfera(0.022, PELE, [-0.12, 0.29, 0.015], [0.8, 1.1, 1]),
  ]), mat);
  const bracoD = parte('bracoD', [0.09, 0.56, 0], fundir([
    tubo(0.024, 0.021, 0.14, PELE, [0.12, 0.5, 0.02], { z: 0.4, x: -0.2 }),
    tubo(0.02, 0.017, 0.13, PELE, [0.16, 0.42, 0.07], { x: -1.0 }),
    esfera(0.024, PELE, [0.165, 0.39, 0.13], [1, 1, 1]),
    tubo(0.011, 0.011, 0.85, t(C.lanca!), [0.165, 0.42, 0.13]),
    tubo(0.014, 0.014, 0.05, t(C.lancaD!), [0.165, 0.83, 0.13]),
    lisa(peca(new THREE.ConeGeometry(0.03, 0.11, 4), t(C.ponta!), 0.165, 0.91, 0.13, {}, [1, 1, 0.35])),
  ]), mat);
  return [
    parte('corpo#', [0, 0, 0], fundir(pecas), mat),
    parte('cabeca', [0, 0.62, 0], fundir(cab), mat),
    bracoE, bracoD,
  ];
}

