/* =========================================================================
   A batalha em 3D: dois Encantados low-poly em plataformas, a arena em
   volta (praia com mar, mata, cidade, caverna), a câmera que corta para
   quem ataca, e os golpes como partículas na cor e no jeito do tipo.

   A batalha continua sendo a mesma (scenes/battle.ts): os números que a
   cena já tem para animar os sprites — avanço, tremor, queda, entrada, o
   projétil — chegam aqui no `QuadroBatalha` e viram pose e câmera. A
   interface (painéis, menus, textos, o patuá) fica em 2D, por cima.

   A cena 3D é montada ao entrar na luta e trocada quando muda quem luta.
   Usa o renderer e o canvas da vista do mundo (vista3d.ts).
   ========================================================================= */
import * as THREE from 'three';
import { infoTipo, type TipoGolpe } from '../art/palette.ts';
import type { Cenario } from '../art/battlebg.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import { ESPECIES } from '../data/creatures.ts';
import { CAMERAS, POSTO_3D, arenaDe, focoDaCena, type Arena } from './arena.ts';
import { luzDe, type ClimaLuz, type PeriodoLuz } from './relevo.ts';
import { animarEncantado, encantado3D, tamanhoDe } from './modelos/encantado3d.ts';
import { arvoreDoTile, modeloArvore, modeloPedra } from './modelos/vegetacao.ts';
import { predio3D } from './modelos/casas.ts';
import { AJUSTES } from './modelos/bichos.ts';

export type LadoB = 'aliado' | 'inimigo';

export interface LadoBatalha3D {
  especie: string;
  raro: boolean;
  /* os relógios da cena 2D: contam para baixo até zero */
  avanco: number;      // 0,26 → 0 no ataque
  tremor: number;      // 0,3 → 0 no dano
  caido: boolean;
  queda: number;       // 0,7 → 0 no desmaio
  entrada: number;     // 0 → 1 ao entrar
  preso?: number;      // 0 → 1 encolhendo para dentro do patuá
}

export interface QuadroBatalha {
  cenario: Cenario;
  regiao: string | null;
  periodo: PeriodoLuz;
  clima: ClimaLuz;
  tempo: number;
  aliado: LadoBatalha3D;
  inimigo: LadoBatalha3D;
  projetil: { tipo: TipoGolpe; origem: LadoB; t: number; dur: number } | null;
}

const N_PARTICULAS = 24;

export class CenaBatalha3D {
  readonly cena = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(42, 1.5, 0.1, 200);
  private readonly mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  private readonly descartaveis: { dispose(): void }[] = [];
  private bichos: Record<LadoB, THREE.Group | null> = { aliado: null, inimigo: null };
  private chave = '';
  private readonly sol = new THREE.DirectionalLight('#ffffff', 2);
  private readonly ceu = new THREE.HemisphereLight('#ffffff', '#555555', 1);
  private readonly clarao = new THREE.PointLight('#ffffff', 0, 6);
  private readonly particulas: THREE.InstancedMesh;
  private readonly matParticula = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.95 });
  private olhar = new THREE.Vector3(0, 0.6, 0);
  private ultimoTempo = -1;
  /* o acerto: depois que o projétil chega, uma explosão rápida no alvo */
  private ultimoProjetil: QuadroBatalha['projetil'] = null;
  private acerto: { tipo: TipoGolpe; alvo: LadoB; t: number } | null = null;

  constructor() {
    this.sol.castShadow = true;
    this.sol.shadow.mapSize.set(1024, 1024);
    const sc = this.sol.shadow.camera;
    sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 1; sc.far = 60;
    this.sol.position.set(-6, 12, 8);
    this.cena.add(this.sol, this.sol.target, this.ceu, this.clarao);
    this.particulas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.12, 0), this.matParticula, N_PARTICULAS * 2);
    this.particulas.count = 0;
    this.particulas.frustumCulled = false;
    this.cena.add(this.particulas);
  }

  private guardar<X extends { dispose(): void }>(x: X): X { this.descartaveis.push(x); return x; }

  /* monta a arena e os dois bichos (só quando muda quem luta ou onde) */
  private montar(q: QuadroBatalha): void {
    for (const d of this.descartaveis) d.dispose();
    this.descartaveis.length = 0;
    for (const o of [...this.cena.children]) {
      if (o === this.sol || o === this.sol.target || o === this.ceu || o === this.clarao || o === this.particulas) continue;
      this.cena.remove(o);
    }
    const a = arenaDe(q.cenario, q.regiao);
    this.montarArena(a, q.regiao);
    for (const lado of ['aliado', 'inimigo'] as const) {
      const l = q[lado];
      const arte = ESPECIES[l.especie] ? ARTE_CRIATURAS[ESPECIES[l.especie]!.arte] : undefined;
      if (!arte) { this.bichos[lado] = null; continue; }
      const g = encantado3D(l.especie, l.raro);
      const [x, , z] = POSTO_3D[lado];
      const [ox, , oz] = POSTO_3D[lado === 'aliado' ? 'inimigo' : 'aliado'];
      g.position.set(x, 0.18, z);
      // de frente um para o outro, mas virados um pouco para a câmera: o
      // inimigo quase de frente (como no 2D) e o aliado de costas, em três quartos
      const [cx, , cz] = CAMERAS.geral.pos;
      const paraOutro = Math.atan2(ox - x, oz - z), paraCamera = Math.atan2(cx - x, cz - z);
      let dif = paraCamera - paraOutro;
      while (dif > Math.PI) dif -= Math.PI * 2;
      while (dif < -Math.PI) dif += Math.PI * 2;
      // (quem foi desenhado de perfil mostra mais o lado, que é o desenho dele)
      const deLado = AJUSTES[l.especie]?.perfil !== undefined;
      g.rotation.y = paraOutro + dif * (lado === 'inimigo' ? (deLado ? 0.3 : 0.65) : 0.2);
      // na batalha, todo mundo maior que no mapa: é o palco deles
      g.scale.multiplyScalar(1.6);
      g.userData['tamanho'] = tamanhoDe(l.especie) * 1.6;
      this.bichos[lado] = g;
      this.cena.add(g);
    }
  }

  private montarArena(a: Arena, regiao: string | null): void {
    const mesh = (geo: THREE.BufferGeometry, cor: string, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(this.guardar(geo), this.guardar(new THREE.MeshLambertMaterial({ color: cor, flatShading: true })));
      m.position.set(x, y, z);
      m.receiveShadow = true;
      this.cena.add(m);
      return m;
    };
    // o chão em volta, e as duas plataformas redondas
    const chao = mesh(new THREE.CircleGeometry(30, 24), a.chao, 0, 0, 0);
    chao.rotation.x = -Math.PI / 2;
    for (const lado of ['aliado', 'inimigo'] as const) {
      const [x, , z] = POSTO_3D[lado];
      mesh(new THREE.CylinderGeometry(1.25, 1.4, 0.18, 10), a.plataforma, x, 0.09, z);
      mesh(new THREE.CylinderGeometry(1.42, 1.5, 0.08, 10), a.borda, x, 0.03, z);
    }
    if (a.mar) {
      const mar = mesh(new THREE.PlaneGeometry(80, 40), '#2f7fb8', 0, 0.02, -26);
      mar.rotation.x = -Math.PI / 2;
      (mar.material as THREE.MeshLambertMaterial).transparent = true;
      (mar.material as THREE.MeshLambertMaterial).opacity = 0.92;
    }
    // em volta: árvores da região, rochas, casas — num anel que não tapa a câmera
    const o = new THREE.Object3D();
    const anel = (n: number, raioMin: number, raioMax: number, k: number) => {
      const pos: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        // a abertura (de 20° a 135°, vista do centro) é por onde as câmeras olham
        const ang = Math.PI * 0.75 + (i / n) * Math.PI * 1.36 + Math.sin(i * 7.1 + k) * 0.05;
        const r = raioMin + ((Math.sin(i * 12.9 + k) + 1) / 2) * (raioMax - raioMin);
        pos.push([Math.cos(ang) * r, Math.sin(ang) * r - 3]);
      }
      return pos;
    };
    if (a.arvores) {
      const lugares = anel(26, 7, 13, 1);
      const porModelo = new Map<string, [number, number][]>();
      lugares.forEach(([x, z], i) => {
        const tipo = arvoreDoTile(regiao, i, i * 3, a.mar && i % 2 === 0);
        porModelo.set(tipo, [...(porModelo.get(tipo) ?? []), [x, z]]);
      });
      for (const [tipo, l] of porModelo) {
        const m = new THREE.InstancedMesh(this.guardar(modeloArvore(tipo as Parameters<typeof modeloArvore>[0])), this.mat, l.length);
        l.forEach(([x, z], i) => {
          o.position.set(x, 0, z); o.rotation.set(0, i * 1.7, 0); o.scale.setScalar(1.6 + (i % 3) * 0.3);
          o.updateMatrix(); m.setMatrixAt(i, o.matrix);
        });
        m.castShadow = true;
        this.cena.add(m);
      }
    }
    if (a.rochas) {
      const l = anel(a.interior ? 30 : 10, a.interior ? 6 : 8, a.interior ? 9 : 12, 5);
      const m = new THREE.InstancedMesh(this.guardar(modeloPedra()), this.mat, l.length);
      l.forEach(([x, z], i) => {
        o.position.set(x, 0, z); o.rotation.set(0, i, 0);
        o.scale.set(2 + (i % 3), a.interior ? 3 + (i % 4) : 1.5 + (i % 2), 2 + (i % 2));
        o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      });
      m.castShadow = true;
      this.cena.add(m);
    }
    if (a.casas) {
      for (const [x, z, giro] of [[-6, -8, 0.3], [5, -9, -0.2]] as const) {
        const p = predio3D(regiao, 'casa', 4, 3, undefined);
        const m = new THREE.Mesh(this.guardar(p.geo), this.mat);
        m.position.set(x, 0, z);
        m.rotation.y = giro;
        m.castShadow = m.receiveShadow = true;
        this.cena.add(m);
      }
    }
  }

  private aplicarLuz(q: QuadroBatalha, a: Arena): void {
    const l = luzDe(q.regiao, q.periodo, q.clima, a.interior);
    this.ceu.color.set(l.hemiCima); this.ceu.groundColor.set(l.hemiBaixo); this.ceu.intensity = l.hemi;
    this.sol.color.set(l.sol); this.sol.intensity = l.solForca;
    if (a.interior) {
      this.cena.background = new THREE.Color('#141018');
      this.cena.fog = new THREE.Fog('#141018', 8, 22);
    } else {
      this.cena.background = new THREE.Color(l.ceuBase);
      this.cena.fog = new THREE.Fog(l.nevoa, 14, 34);
    }
  }

  /* um quadro: monta se preciso, põe a luz, posa os bichos, os golpes e a câmera */
  atualizar(q: QuadroBatalha): void {
    const chave = `${q.cenario}|${q.regiao}|${q.aliado.especie}${q.aliado.raro}|${q.inimigo.especie}${q.inimigo.raro}`;
    if (chave !== this.chave) { this.chave = chave; this.montar(q); this.ultimoTempo = -1; }
    const a = arenaDe(q.cenario, q.regiao);
    this.aplicarLuz(q, a);
    const dt = this.ultimoTempo < 0 ? 0 : Math.max(0, Math.min(0.1, q.tempo - this.ultimoTempo));
    this.ultimoTempo = q.tempo;

    for (const lado of ['aliado', 'inimigo'] as const) {
      const g = this.bichos[lado];
      const l = q[lado];
      if (!g) continue;
      const base = (g.userData['tamanho'] as number) ?? 1.6;
      const tam = Math.min(1, l.entrada) * (1 - (l.preso ?? 0));
      g.scale.setScalar(base * Math.max(0.05, tam));
      g.visible = tam > 0.02;
      if (l.caido) animarEncantado(g, 'desmaio', l.queda > 0 ? 0.7 - l.queda : 1, q.tempo);
      else if (l.avanco > 0) animarEncantado(g, 'atacar', ((0.26 - l.avanco) / 0.26) * 0.45, q.tempo);
      else if (l.tremor > 0) animarEncantado(g, 'dano', 0.3 - l.tremor, q.tempo);
      else animarEncantado(g, 'parado', 0, q.tempo + (lado === 'aliado' ? 0 : 1.3));
      // caído de vez: some devagar, como no 2D
      if (l.caido && l.queda <= 0) g.visible = false;
    }

    this.atualizarGolpe(q, dt);
    this.atualizarCamera(q, dt);
  }

  /* onde fica o peito de cada bicho, para o golpe sair e chegar */
  private peito(lado: LadoB): THREE.Vector3 {
    const [x, , z] = POSTO_3D[lado];
    const g = this.bichos[lado];
    const t = (g?.userData['tamanho'] as number) ?? 1.6;
    return new THREE.Vector3(x, 0.18 + 0.55 * t, z);
  }

  private atualizarGolpe(q: QuadroBatalha, dt: number): void {
    const p = q.projetil;
    // o projétil acabou de chegar: começa o acerto no alvo
    if (!p && this.ultimoProjetil) {
      this.acerto = { tipo: this.ultimoProjetil.tipo, alvo: this.ultimoProjetil.origem === 'aliado' ? 'inimigo' : 'aliado', t: 0 };
    }
    this.ultimoProjetil = p ? { ...p } : null;
    const o = new THREE.Object3D();
    let n = 0;
    if (p) {
      const de = this.peito(p.origem), para = this.peito(p.origem === 'aliado' ? 'inimigo' : 'aliado');
      const k = Math.min(1, p.t / p.dur);
      this.matParticula.color.set(infoTipo(p.tipo).cor);
      for (let i = 0; i < N_PARTICULAS; i++) {
        const atraso = i / N_PARTICULAS * 0.35;
        const kk = Math.max(0, Math.min(1, (k - atraso) / (1 - atraso)));
        const ponto = de.clone().lerp(para, kk);
        const off = this.desvio(p.tipo, i, kk, q.tempo);
        ponto.add(off);
        o.position.copy(ponto);
        o.scale.setScalar((1 - atraso) * (p.tipo === 'raio' ? 0.8 : 1.2));
        o.rotation.set(i, i * 2, 0);
        o.updateMatrix();
        this.particulas.setMatrixAt(n++, o.matrix);
      }
      this.clarao.color.set(infoTipo(p.tipo).cor);
      this.clarao.position.copy(de.clone().lerp(para, k));
      this.clarao.intensity = 3;
    } else this.clarao.intensity = 0;

    if (this.acerto) {
      const ac = this.acerto;
      ac.t += dt;
      const centro = this.peito(ac.alvo);
      const k = ac.t / 0.35;
      // a explosão dura 0,35 s; a câmera fica no golpe mais um pouco
      if (ac.t > 0.9) this.acerto = null;
      else if (k < 1) {
        this.matParticula.color.set(infoTipo(ac.tipo).cor);
        for (let i = 0; i < N_PARTICULAS; i++) {
          const a = (i / N_PARTICULAS) * Math.PI * 2, b = (i % 5) * 0.6 - 1.2;
          o.position.set(centro.x + Math.cos(a) * k * 1.1, centro.y + b * k * 0.5 + k * 0.3, centro.z + Math.sin(a) * k * 1.1);
          o.scale.setScalar(1.4 * (1 - k));
          o.updateMatrix();
          this.particulas.setMatrixAt(n++, o.matrix);
        }
        this.clarao.color.set(infoTipo(ac.tipo).cor);
        this.clarao.position.copy(centro);
        this.clarao.intensity = 5 * (1 - k);
      }
    }
    this.particulas.count = n;
    this.particulas.instanceMatrix.needsUpdate = true;
  }

  /* o jeito de cada tipo: brasa sobe, água faz arco, raio ziguezagueia,
     vento gira, sombra se espalha, luz vem reta e fina */
  private desvio(tipo: TipoGolpe, i: number, k: number, t: number): THREE.Vector3 {
    const s = Math.sin(i * 12.9898) * 0.5;
    switch (tipo) {
      case 'fogo': return new THREE.Vector3(s * 0.25, Math.sin(k * Math.PI) * 0.3 + (i % 3) * 0.08, Math.cos(i) * 0.2);
      case 'agua': return new THREE.Vector3(s * 0.15, Math.sin(k * Math.PI) * 0.9, s * 0.1);
      case 'planta': return new THREE.Vector3(Math.sin(t * 8 + i) * 0.25, Math.cos(t * 6 + i) * 0.2, s * 0.2);
      case 'raio': return new THREE.Vector3(((i + Math.floor(k * 10)) % 2 ? 0.3 : -0.3), s * 0.2, ((i % 3) - 1) * 0.15);
      case 'terra': return new THREE.Vector3(s * 0.4, -k * 0.3 + Math.abs(Math.sin(k * 9 + i)) * 0.3, s * 0.3);
      case 'vento': return new THREE.Vector3(Math.cos(k * 12 + i) * 0.35, Math.sin(k * 12 + i) * 0.35, 0);
      case 'sombra': return new THREE.Vector3(s * 0.6 * k, Math.sin(i) * 0.3 * k, Math.cos(i) * 0.6 * k);
      case 'luz': return new THREE.Vector3(s * 0.05, 0, s * 0.05);
      default: return new THREE.Vector3(s * 0.2, Math.sin(i) * 0.15, Math.cos(i) * 0.2);
    }
  }

  private atualizarCamera(q: QuadroBatalha, dt: number): void {
    const foco = focoDaCena({
      avanco: { aliado: q.aliado.avanco, inimigo: q.inimigo.avanco },
      entrada: { aliado: q.aliado.entrada, inimigo: q.inimigo.entrada },
      golpe: q.projetil?.origem ?? (this.acerto ? (this.acerto.alvo === 'aliado' ? 'inimigo' : 'aliado') : null),
    });
    const c = CAMERAS[foco];
    const alvo = new THREE.Vector3(...c.pos), olhaAlvo = new THREE.Vector3(...c.olha);
    if (dt === 0) { this.camera.position.copy(alvo); this.olhar.copy(olhaAlvo); }
    else {
      const k = 1 - Math.exp(-dt * 5);
      this.camera.position.lerp(alvo, k);
      this.olhar.lerp(olhaAlvo, k);
    }
    // o tremido do acerto
    if (this.acerto) {
      const f = Math.max(0, 1 - this.acerto.t / 0.35) * 0.05;
      this.camera.position.x += Math.sin(q.tempo * 80) * f;
      this.camera.position.y += Math.cos(q.tempo * 70) * f;
    }
    this.camera.fov += (c.fov - this.camera.fov) * Math.min(1, dt * 5 || 1);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.olhar);
  }

  /* onde o peito do inimigo cai na tela de 240x160 (o patuá 2D mira nele) */
  projetarInimigo(largura: number, altura: number): { x: number; y: number } {
    const v = this.peito('inimigo').project(this.camera);
    return { x: (v.x + 1) / 2 * largura, y: (1 - v.y) / 2 * altura };
  }
}
