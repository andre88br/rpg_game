/* =========================================================================
   A vista 3D do mundo — a Região da Foz fora do papel.

   Não é um jogo à parte: a lógica inteira continua na cena do mundo
   (overworld.ts), andando em grade, conversando, lutando e gravando como
   sempre. Esta vista só troca o DESENHO do mundo: monta o mapa em blocos a
   partir da mesma grade de letras (relevo.ts diz o que cada uma vira), pinta
   o topo com os mesmos tiles do mapa plano, levanta as construções, e põe de
   pé os mesmos sprites de gente e de bicho, como recortes num cenário de
   maquete. Diálogo, menu e o resto da interface continuam por cima, em 2D.

   Renderiza num canvas próprio, na resolução do jogo (240x160 vezes SUAVE),
   e a cena do mundo carimba o resultado no canvas principal: o pixel
   continua grande e nítido, como em todo o resto do jogo.

   Carregada sob demanda (carregar.ts): quem nunca entra na Foz, ou joga no
   mapa plano, não baixa nada disto.
   ========================================================================= */
import * as THREE from 'three';
import { Buf, assar, larguraDe, alturaDe, SUAVE, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA } from '../core/renderer.ts';
import { TILES, objetoAtivo, spriteDoObjeto, type DefObjeto, type Mapa } from '../world/tilemap.ts';
import * as T from '../art/tiles.ts';
import { P } from '../art/palette.ts';
import { texto, larguraTexto } from '../art/font.ts';
import {
  DEITADOS, NIVEL_AGUA, PAREDE_CORTADA, PREDIOS, modeloDe, relevoDe, type Relevo,
} from './relevo.ts';

/* quantos pixels do quadro ficam fora d'água — o mesmo do mapa plano */
const ALTURA_NADANDO = 14;

export interface Ator3D {
  img: Assado;
  /* posição em tiles (px / 16), já interpolada no meio do passo */
  x: number;
  y: number;
  nadando: boolean;
}

export interface Quadro3D {
  mapa: Mapa;
  /* para onde a câmera olha, em tiles */
  alvoX: number;
  alvoY: number;
  atores: readonly Ator3D[];
  tempo: number;
}

const COR_LADO: Record<string, string> = {
  '.': '#6b4a2e', ',': '#6b4a2e', '=': '#6b4a2e', 'f': '#6b4a2e',
  'a': '#c8a870', 'p': '#5a3e24', '~': '#2a5a8a', 'R': '#7a7468',
  'W': '#b89a70', '_': '#5a3e24', 'T': '#5a3e24', 'm': '#5a3e24', 'u': '#5a3e24',
};

/* textura com cara de pixel: nada de borrar ao ampliar */
function texturaDe(img: HTMLCanvasElement, repetir = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(img);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* ruído estável por tile, para árvores e tufos não saírem todos iguais */
function sorte(x: number, y: number, k = 0): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

export class Vista3D {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly cena = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(42, LARGURA / ALTURA, 0.1, 200);
  private readonly sol: THREE.DirectionalLight;
  private readonly ceu: THREE.HemisphereLight;

  /* tudo que pertence ao mapa atual; trocado inteiro quando o mapa muda */
  private grupo: THREE.Group | null = null;
  private descartaveis: { dispose(): void }[] = [];
  private mapaAtual: Mapa | null = null;
  private alturas: Float32Array = new Float32Array(0);
  private largura = 0;
  private altura = 0;
  private agua: THREE.Texture | null = null;

  /* os atores reaproveitam sprites e texturas de um quadro para o outro */
  private readonly texturas = new Map<Assado, THREE.SpriteMaterial>();
  private readonly cabecas = new Map<Assado, Assado>();
  private readonly figuras: THREE.Sprite[] = [];
  private readonly sombras: THREE.Mesh[] = [];
  private readonly sombraGeo = new THREE.CircleGeometry(0.3, 14);
  private readonly sombraMat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28, depthWrite: false });

  constructor() {
    const canvas = document.createElement('canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(LARGURA * SUAVE, ALTURA * SUAVE, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.ceu = new THREE.HemisphereLight('#e8f4ff', '#5a7a3a', 0.9);
    this.sol = new THREE.DirectionalLight('#fff0d0', 2.2);
    this.sol.castShadow = true;
    this.sol.shadow.mapSize.set(2048, 2048);
    this.sol.shadow.bias = -0.0008;
    this.cena.add(this.ceu, this.sol, this.sol.target);
  }

  /* desenha o mundo e carimba no canvas do jogo, cobrindo a tela inteira */
  desenhar(ctx: CanvasRenderingContext2D, q: Quadro3D): void {
    if (q.mapa !== this.mapaAtual) this.montar(q.mapa);
    this.posicionarCamera(q);
    this.posicionarAtores(q.atores);
    if (this.agua) this.agua.offset.set((q.tempo * 0.05) % 1, (q.tempo * 0.03) % 1);
    this.renderer.render(this.cena, this.camera);
    ctx.drawImage(this.renderer.domElement, 0, 0, LARGURA, ALTURA);
  }

  /* onde um ponto do mundo (em tiles) cai na tela de 240x160 — para o
     balão de espanto do treinador, que continua desenhado em 2D */
  projetar(x: number, y: number, subir = 0): { x: number; y: number } {
    const v = new THREE.Vector3(x, this.chaoEm(x, y) + subir, y).project(this.camera);
    return { x: (v.x + 1) / 2 * LARGURA, y: (1 - v.y) / 2 * ALTURA };
  }

  /* ------------------------------------------------------------ câmera */

  private posicionarCamera(q: Quadro3D): void {
    const dentro = q.mapa.def.interior === true;
    const alvo = new THREE.Vector3(q.alvoX, this.chaoEm(q.alvoX, q.alvoY) * 0.5, q.alvoY);
    const [sobe, recua] = dentro ? [8.6, 7.6] : [10.5, 10.5];
    this.camera.position.set(alvo.x, alvo.y + sobe, alvo.z + recua);
    this.camera.lookAt(alvo.x, alvo.y, alvo.z - 0.9);
  }

  private chaoEm(x: number, y: number): number {
    const tx = Math.floor(x), ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= this.largura || ty >= this.altura) return 0;
    return this.alturas[ty * this.largura + tx]!;
  }

  /* ------------------------------------------------------------ atores */

  private materialDe(img: Assado): THREE.SpriteMaterial {
    let m = this.texturas.get(img);
    if (!m) {
      m = new THREE.SpriteMaterial({ map: texturaDe(img), alphaTest: 0.5 });
      this.texturas.set(img, m);
    }
    return m;
  }

  /* quem nada mostra só a cabeça, como no mapa plano: o quadro recortado */
  private cabecaDe(img: Assado): Assado {
    let c = this.cabecas.get(img);
    if (!c) {
      c = document.createElement('canvas');
      c.width = img.width;
      c.height = Math.round(img.height * ALTURA_NADANDO / alturaDe(img));
      c.getContext('2d')!.drawImage(img, 0, 0);
      this.cabecas.set(img, c);
    }
    return c;
  }

  private posicionarAtores(atores: readonly Ator3D[]): void {
    while (this.figuras.length < atores.length) {
      const s = new THREE.Sprite();
      s.center.set(0.5, 0);
      const sombra = new THREE.Mesh(this.sombraGeo, this.sombraMat);
      sombra.rotation.x = -Math.PI / 2;
      this.figuras.push(s);
      this.sombras.push(sombra);
      this.cena.add(s, sombra);
    }
    this.figuras.forEach((s, i) => {
      const a = atores[i];
      s.visible = this.sombras[i]!.visible = a !== undefined;
      if (!a) return;
      const img = a.nadando ? this.cabecaDe(a.img) : a.img;
      s.material = this.materialDe(img);
      s.scale.set(larguraDe(a.img) / 16, (a.nadando ? ALTURA_NADANDO : alturaDe(a.img)) / 16, 1);
      const cx = a.x + 0.5, cz = a.y + 0.5;
      const chao = a.nadando ? NIVEL_AGUA - 0.2 : this.chaoEm(cx, cz);
      // um fio para frente: o pé fica na frente de quem está no tile de trás
      s.position.set(cx, chao + 0.01, cz + 0.1);
      this.sombras[i]!.visible = !a.nadando;
      this.sombras[i]!.position.set(cx, chao + 0.02, cz + 0.05);
    });
  }

  /* ------------------------------------------------------------ montagem */

  private montar(mapa: Mapa): void {
    if (this.grupo) this.cena.remove(this.grupo);
    for (const d of this.descartaveis) d.dispose();
    this.descartaveis = [];
    this.agua = null;
    this.mapaAtual = mapa;

    const g = new THREE.Group();
    this.grupo = g;
    this.cena.add(g);
    const def = mapa.def;
    this.largura = mapa.largTiles;
    this.altura = mapa.altTiles;
    const dentro = def.interior === true;

    // relevo de cada tile (a parede de baixo do interior, cortada)
    const rel: Relevo[] = [];
    this.alturas = new Float32Array(this.largura * this.altura);
    for (let y = 0; y < this.altura; y++) {
      for (let x = 0; x < this.largura; x++) {
        const r = { ...(relevoDe(def.chao[y]![x]!) ?? relevoDe('.')!) };
        if (r.enfeite === 'parede' && y === this.altura - 1) r.altura = PAREDE_CORTADA;
        rel.push(r);
        this.alturas[y * this.largura + x] = r.agua ? NIVEL_AGUA : r.altura;
      }
    }

    this.cena.background = new THREE.Color(dentro ? '#101018' : '#9fd3f0');
    this.cena.fog = dentro ? null : new THREE.Fog('#bfe3f5', 22, 42);

    this.montarChao(g, rel);
    if (!dentro) this.montarEntorno(g);
    if (def.chao.some((l) => l.includes('~'))) this.montarAgua(g);
    this.montarEnfeites(g, rel);
    for (const o of def.objetos) if (objetoAtivo(o, mapa.ctx)) this.montarObjeto(g, o, mapa);

    // o sol cobre o mapa todo, e a sombra acompanha
    const cx = this.largura / 2, cz = this.altura / 2, raio = Math.max(this.largura, this.altura) / 2 + 4;
    this.sol.position.set(cx - 14, 26, cz + 16);
    this.sol.target.position.set(cx, 0, cz);
    const sc = this.sol.shadow.camera;
    sc.left = -raio * 1.3; sc.right = raio * 1.3; sc.top = raio * 1.3; sc.bottom = -raio * 1.3;
    sc.near = 1; sc.far = 90;
    sc.updateProjectionMatrix();
    this.ceu.intensity = dentro ? 1.4 : 0.9;
  }

  private guardar<X extends { dispose(): void }>(x: X): X { this.descartaveis.push(x); return x; }

  /* o chão inteiro numa malha só: topo de cada tile, pintado com o mesmo
     desenho do mapa plano, e o barranco onde o vizinho é mais baixo */
  private montarChao(g: THREE.Group, rel: Relevo[]): void {
    const W = this.largura, H = this.altura;
    const atlas = new Buf(W * 16, H * 16);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const piso = rel[y * W + x]!.piso;
        atlas.blit((TILES[piso] ?? TILES['.']!).desenho(x * 31 + y * 17 + 3), x * 16, y * 16);
      }
    }
    const tex = this.guardar(texturaDe(assar(atlas)));

    const pos: number[] = [], uv: number[] = [], nor: number[] = [], cor: number[] = [];
    const idx: number[] = [], idxLado: number[] = [];
    const quad = (v: number[][], n: number[], u: number[][] | null, c: THREE.Color | null, alvo: number[]) => {
      const base = pos.length / 3;
      for (let i = 0; i < 4; i++) {
        pos.push(...v[i]!); nor.push(...n);
        uv.push(...(u ? u[i]! : [0, 0]));
        cor.push(...(c ? [c.r, c.g, c.b] : [1, 1, 1]));
      }
      alvo.push(base, base + 1, base + 2, base, base + 2, base + 3);
    };
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const r = rel[y * W + x]!;
        const h = r.altura;
        const u0 = x / W, u1 = (x + 1) / W, v0 = 1 - y / H, v1 = 1 - (y + 1) / H;
        quad([[x, h, y + 1], [x + 1, h, y + 1], [x + 1, h, y], [x, h, y]], [0, 1, 0],
             [[u0, v1], [u1, v1], [u1, v0], [u0, v0]], null, idx);
        const c = new THREE.Color(COR_LADO[r.piso] ?? '#6b4a2e');
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const nh = rel[ny * W + nx]!.altura;
          if (nh >= h) continue;
          // a face do barranco, voltada para o vizinho mais baixo
          const cc = c.clone().multiplyScalar(dy === 1 ? 1 : dy === -1 ? 0.6 : 0.8);
          if (dy === 1) quad([[x, nh, y + 1], [x + 1, nh, y + 1], [x + 1, h, y + 1], [x, h, y + 1]], [0, 0, 1], null, cc, idxLado);
          if (dy === -1) quad([[x + 1, nh, y], [x, nh, y], [x, h, y], [x + 1, h, y]], [0, 0, -1], null, cc, idxLado);
          if (dx === 1) quad([[x + 1, nh, y + 1], [x + 1, nh, y], [x + 1, h, y], [x + 1, h, y + 1]], [1, 0, 0], null, cc, idxLado);
          if (dx === -1) quad([[x, nh, y], [x, nh, y + 1], [x, h, y + 1], [x, h, y]], [-1, 0, 0], null, cc, idxLado);
        }
      }
    }
    const geo = this.guardar(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
    geo.setIndex([...idx, ...idxLado]);
    geo.addGroup(0, idx.length, 0);
    geo.addGroup(idx.length, idxLado.length, 1);
    const topo = this.guardar(new THREE.MeshLambertMaterial({ map: tex }));
    const lado = this.guardar(new THREE.MeshLambertMaterial({ vertexColors: true }));
    const m = new THREE.Mesh(geo, [topo, lado]);
    m.receiveShadow = true;
    m.castShadow = true;
    g.add(m);
  }

  /* grama além da borda do mapa, para a câmera nunca ver o vazio — menos
     do lado em que a borda é mar */
  private montarEntorno(g: THREE.Group): void {
    const W = this.largura, H = this.altura, M = 30;
    const tex = this.guardar(texturaDe(assar(T.tileGrama(1)), true));
    const lados: [number, number, number, number, string][] = [
      [-M, -M, W + 2 * M, M, this.def().chao[0]!],
      [-M, H, W + 2 * M, M, this.def().chao[H - 1]!],
      [-M, 0, M, H, this.def().chao.map((l) => l[0]).join('')],
      [W, 0, M, H, this.def().chao.map((l) => l[W - 1]).join('')],
    ];
    for (const [x, z, w, d, borda] of lados) {
      const mar = [...borda].filter((c) => c === '~').length > borda.length / 2;
      if (mar) continue;
      const t = tex.clone();
      t.repeat.set(w, d);
      t.needsUpdate = true;
      this.guardar(t);
      const geo = this.guardar(new THREE.PlaneGeometry(w, d));
      const mat = this.guardar(new THREE.MeshLambertMaterial({ map: t, color: '#b8c8a8' }));
      const p = new THREE.Mesh(geo, mat);
      p.rotation.x = -Math.PI / 2;
      p.position.set(x + w / 2, -0.001, z + d / 2);
      p.receiveShadow = true;
      g.add(p);
    }
  }

  private def() { return this.mapaAtual!.def; }

  /* a lâmina d'água: o desenho da água do jogo, repetido e correndo devagar */
  private montarAgua(g: THREE.Group): void {
    const W = this.largura, H = this.altura, M = 40;
    const t = this.guardar(texturaDe(assar(T.tileAgua(3)), true));
    t.repeat.set(W + 2 * M, H + 2 * M);
    this.agua = t;
    const geo = this.guardar(new THREE.PlaneGeometry(W + 2 * M, H + 2 * M));
    const mat = this.guardar(new THREE.MeshLambertMaterial({ map: t, transparent: true, opacity: 0.82, depthWrite: false }));
    const p = new THREE.Mesh(geo, mat);
    p.rotation.x = -Math.PI / 2;
    p.position.set(W / 2, NIVEL_AGUA, H / 2);
    p.receiveShadow = true;
    p.renderOrder = 1;
    g.add(p);
    const fundo = new THREE.Mesh(this.guardar(new THREE.PlaneGeometry(W + 2 * M, H + 2 * M)),
                                 this.guardar(new THREE.MeshBasicMaterial({ color: '#1f4f7a' })));
    fundo.rotation.x = -Math.PI / 2;
    fundo.position.set(W / 2, -1.45, H / 2);
    g.add(fundo);
  }

  /* árvores, pedras, tufos de mato e flores: uma malha repetida por tipo */
  private montarEnfeites(g: THREE.Group, rel: Relevo[]): void {
    const W = this.largura;
    const onde = (e: string) => rel.flatMap((r, i) => (r.enfeite === e ? [[i % W, Math.floor(i / W)] as const] : []));
    const plano = (cor: string) => this.guardar(new THREE.MeshLambertMaterial({ color: cor, flatShading: true }));
    const repetido = (geo: THREE.BufferGeometry, mat: THREE.Material, n: number, sombra = true) => {
      const m = new THREE.InstancedMesh(this.guardar(geo), mat, Math.max(1, n));
      m.count = n;
      m.castShadow = sombra;
      m.receiveShadow = true;
      g.add(m);
      return m;
    };
    const o = new THREE.Object3D();
    const pôr = (m: THREE.InstancedMesh, i: number, x: number, y: number, z: number, s = 1, rot = 0, sy = s) => {
      o.position.set(x, y, z); o.rotation.set(0, rot, 0); o.scale.set(s, sy, s); o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    };

    const arvores = onde('arvore');
    const tronco = repetido(new THREE.BoxGeometry(0.22, 1, 0.22), plano('#6b4a2e'), arvores.length);
    const copas = ['#2f6e32', '#3f8a3a', '#2a5e28'].map((c, k) =>
      repetido(new THREE.ConeGeometry(0.62 - k * 0.14, 0.8, 7), plano(c), arvores.length));
    arvores.forEach(([x, y], i) => {
      const h = 0.8 + sorte(x, y) * 0.5, cx = x + 0.5 + (sorte(x, y, 1) - 0.5) * 0.15, cz = y + 0.5;
      pôr(tronco, i, cx, h / 2, cz, 1, 0, h);
      copas.forEach((c, k) => pôr(c, i, cx, h + 0.2 + k * 0.42, cz, 0.9 + sorte(x, y, 2) * 0.25, sorte(x, y, 3) * 6));
    });

    const pedras = onde('pedra');
    const pedra = repetido(new THREE.DodecahedronGeometry(0.42, 0), plano('#9a9488'), pedras.length);
    pedras.forEach(([x, y], i) => pôr(pedra, i, x + 0.5, 0.25, y + 0.5, 1, sorte(x, y) * 6, 0.8));

    const matos = onde('mato');
    const tufos = [plano('#3f8a3a'), plano('#5aa44a')].map((m) =>
      repetido(new THREE.ConeGeometry(0.09, 0.55, 4), m, matos.length * 3, false));
    matos.forEach(([x, y], i) => {
      for (let k = 0; k < 6; k++) {
        const tx = x + 0.15 + sorte(x, y, k) * 0.7, tz = y + 0.15 + sorte(x, y, k + 9) * 0.7;
        pôr(tufos[k % 2]!, i * 3 + (k >> 1), tx, 0.26, tz, 1, 0, 0.8 + sorte(x, y, k + 4) * 0.5);
      }
    });

    const flores = onde('flores');
    const cores = ['#f2d24b', '#e8583a', '#f4f0e8', '#c25d8f'];
    const petalas = repetido(new THREE.SphereGeometry(0.07, 6, 4), this.guardar(new THREE.MeshLambertMaterial()), flores.length * 4, false);
    flores.forEach(([x, y], i) => {
      for (let k = 0; k < 4; k++) {
        pôr(petalas, i * 4 + k, x + 0.2 + sorte(x, y, k) * 0.6, 0.1, y + 0.2 + sorte(x, y, k + 5) * 0.6);
        petalas.setColorAt(i * 4 + k, new THREE.Color(cores[k]!));
      }
    });
  }

  /* ------------------------------------------------------------ objetos */

  private montarObjeto(g: THREE.Group, o: DefObjeto, mapa: Mapa): void {
    const modelo = modeloDe(o.tipo);
    if (modelo === 'predio') { this.predio(g, o); return; }
    if (modelo === 'farol') { this.farol(g, o); return; }
    const { sprite, deslocY } = spriteDoObjeto(o, mapa.ctx);
    if (!sprite) return;
    const w = sprite.w / 16, h = sprite.h / 16;
    const tex = this.guardar(texturaDe(assar(sprite)));
    const chao = this.chaoEm(o.tx + 0.5, o.ty + 0.5);

    if (DEITADOS.has(o.tipo)) {
      // móvel baixo (mesa, balcão, gamela): um bloco com o desenho no tampo;
      // o que é chão (buraco, ladrilho) fica rente ao piso
      const movel = o.tipo === 'mesa' || o.tipo === 'balcao' || o.tipo === 'gamela' || o.tipo === 'patuas';
      const alto = o.tipo === 'gamela' ? 0.3 : movel ? 0.5 : 0.02;
      const lado = this.guardar(new THREE.MeshLambertMaterial({ color: '#7a5a3a' }));
      const topo = this.guardar(new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.3 }));
      const geo = this.guardar(new THREE.BoxGeometry(w, alto, h));
      const caixa = new THREE.Mesh(geo, movel ? [lado, lado, topo, lado, lado, lado] : [lado, lado, topo, lado, lado, lado]);
      const sobre = o.tipo === 'patuas' ? 0.52 : 0;
      caixa.position.set(o.tx + w / 2, chao + sobre + alto / 2, o.ty + deslocY / 16 + h / 2);
      if (!movel) caixa.material = [topo, topo, topo, topo, topo, topo];
      caixa.castShadow = movel;
      caixa.receiveShadow = true;
      g.add(caixa);
      return;
    }

    // recorte de pé: o próprio desenho do jogo, com a base no chão da última
    // fileira que ele ocupa
    const base = o.ty + (sprite.h + deslocY) / 16;
    const geo = this.guardar(new THREE.PlaneGeometry(w, h));
    const mat = this.guardar(new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    const p = new THREE.Mesh(geo, mat);
    p.position.set(o.tx + w / 2, chao + h / 2, base - 0.5);
    p.castShadow = true;
    p.receiveShadow = true;
    p.customDepthMaterial = this.guardar(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 }));
    g.add(p);
  }

  private letreiro(txt: string, cor: string): THREE.CanvasTexture {
    const b = new Buf(larguraTexto(txt) + 8, 11);
    b.rect(0, 0, b.w, b.h, '#5a3e24');
    b.rect(1, 1, b.w - 2, b.h - 2, '#f4ead0');
    texto(b, txt, 4, 2, cor);
    return this.guardar(texturaDe(assar(b)));
  }

  private predio(g: THREE.Group, o: DefObjeto): void {
    const cfg = PREDIOS[o.tipo]!;
    const w = o.larg ?? 4, alt = o.alt ?? 3;
    const d = alt - 0.45, h = o.tipo === 'terreiro' ? 2.5 : 1.8;
    const cx = o.tx + w / 2, cz = o.ty + 0.05 + d / 2;
    const frente = cz + d / 2;
    const mat = (c: string) => this.guardar(new THREE.MeshLambertMaterial({ color: c }));
    const caixa = (bw: number, bh: number, bd: number, m: THREE.Material, x: number, y: number, z: number, sombra = true) => {
      const b = new THREE.Mesh(this.guardar(new THREE.BoxGeometry(bw, bh, bd)), m);
      b.position.set(x, y, z);
      b.castShadow = sombra;
      b.receiveShadow = true;
      g.add(b);
      return b;
    };

    caixa(w - 0.1, h, d, mat('#efe4c8'), cx, h / 2, cz);
    caixa(w + 0.1, 0.22, d + 0.1, mat('#8a6a4a'), cx, 0.11, cz);

    // telhado de duas águas, de frente para a câmera
    const f = new THREE.Shape();
    f.moveTo(-d / 2 - 0.35, 0); f.lineTo(0, h * 0.6); f.lineTo(d / 2 + 0.35, 0); f.lineTo(-d / 2 - 0.35, 0);
    const tg = this.guardar(new THREE.ExtrudeGeometry(f, { depth: w + 0.4, bevelEnabled: false }));
    const telhado = new THREE.Mesh(tg, [
      this.guardar(new THREE.MeshLambertMaterial({ color: cfg.escuro, flatShading: true })),
      this.guardar(new THREE.MeshLambertMaterial({ color: cfg.telhado, flatShading: true })),
    ]);
    telhado.rotation.y = Math.PI / 2;
    telhado.position.set(cx - w / 2 - 0.2, h, cz);
    telhado.castShadow = telhado.receiveShadow = true;
    g.add(telhado);

    // porta na mesma coluna do mapa plano; janelas longe dela
    const col = T.colunaPorta(w, o.portaCol);
    const px = o.tx + col + 0.5, largPorta = o.tipo === 'terreiro' ? 1.1 : 0.75;
    caixa(largPorta, 1.15, 0.06, mat(o.trancada ? '#5a3e24' : '#6b4a2e'), px, 0.6, frente + 0.02, false);
    for (let i = 0; i < w; i++) {
      if (Math.abs(i - col) < 1.5 || i === 0 || i === w - 1) continue;
      caixa(0.55, 0.5, 0.05, mat('#7ec8e8'), o.tx + i + 0.5, 1.05, frente + 0.02, false);
    }
    if (w >= 4) for (const s of [0.55, w - 0.55]) caixa(0.5, 0.5, 0.05, mat('#7ec8e8'), o.tx + s, 1.05, frente + 0.02, false);

    if (cfg.letreiro) {
      const t = this.letreiro(cfg.letreiro, cfg.escuro);
      const lw = Math.min(w - 0.5, (larguraTexto(cfg.letreiro) + 8) / 16 * 1.4);
      const placa = new THREE.Mesh(this.guardar(new THREE.PlaneGeometry(lw, lw * 11 / (larguraTexto(cfg.letreiro) + 8))),
                                   this.guardar(new THREE.MeshLambertMaterial({ map: t })));
      placa.position.set(cx, h - 0.32, frente + 0.06);
      g.add(placa);
    }

    // o mastro com a bandeira do terreiro, como no mapa plano
    if (o.tipo === 'terreiro') {
      caixa(0.06, 1.6, 0.06, mat(P.ink!), o.tx + 0.9, h + 0.3, cz, true);
      const bf = new THREE.Shape();
      bf.moveTo(0, 0); bf.lineTo(0.9, -0.25); bf.lineTo(0, -0.5);
      const bandeira = new THREE.Mesh(this.guardar(new THREE.ShapeGeometry(bf)),
        this.guardar(new THREE.MeshLambertMaterial({ color: P.water!, side: THREE.DoubleSide })));
      bandeira.position.set(o.tx + 0.93, h + 1.05, cz);
      bandeira.castShadow = true;
      g.add(bandeira);
    }
  }

  private farol(g: THREE.Group, o: DefObjeto): void {
    const w = o.larg ?? 3, alt = o.alt ?? 7;
    const cx = o.tx + w / 2, cz = o.ty + alt - 1;
    const mat = (c: string, e?: string) => this.guardar(new THREE.MeshLambertMaterial({ color: c, emissive: e ?? '#000000' }));
    const peca = (geo: THREE.BufferGeometry, m: THREE.Material, y: number) => {
      const p = new THREE.Mesh(this.guardar(geo), m);
      p.position.set(cx, y, cz);
      p.castShadow = p.receiveShadow = true;
      g.add(p);
    };
    peca(new THREE.BoxGeometry(w + 0.2, 0.6, 2.4), mat('#8a8478'), -0.15);
    // baixo o bastante para não tampar a praia quando a câmera passa por ela
    for (let i = 0; i < 5; i++) {
      peca(new THREE.CylinderGeometry(0.8 - i * 0.07, 0.86 - i * 0.07, 0.7, 14), mat(i % 2 ? '#c2493f' : '#f4f0e8'), 0.5 + i * 0.7);
    }
    peca(new THREE.CylinderGeometry(0.42, 0.42, 0.55, 12), mat('#ffe89a', '#c89020'), 4.05);
    peca(new THREE.ConeGeometry(0.62, 0.6, 12), mat('#93312c'), 4.6);
  }
}
