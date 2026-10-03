/* =========================================================================
   A vista 3D do mundo — low-poly colorido.

   Não é um jogo à parte: a lógica inteira continua na cena do mundo
   (overworld.ts), andando em grade, conversando, lutando e gravando como
   sempre. Esta vista só troca o DESENHO do mundo, a partir da mesma grade
   de letras (relevo.ts diz o que cada uma vira):

   - o chão é uma malha contínua de triângulos com cor por vértice: os
     cantos de cada tile ficam na média dos vizinhos, o que chanfra todo
     barranco e mistura grama, caminho e areia sem degrau de cor;
   - parede e rocha são blocos, com um tampo chanfrado;
   - a água é um shader: ondas, espuma na margem e um brilho que corre;
   - árvore e mato balançam no vento (no shader, sem custo de CPU);
   - a luz vem da região e da hora (relevo.ts: luzDe), com névoa, céu em
     degradê e tone mapping ACES;
   - a câmera segue o jogador devagar, com ângulo próprio para rua, casa
     e caverna.

   Renderiza num canvas PRÓPRIO, na resolução real da tela (vezes a
   densidade do aparelho, até 2), atrás do canvas do jogo. A interface
   (diálogo, menu, clima) continua em 2D, por cima — a cena do mundo só
   limpa o canvas 2D onde o mundo aparece. Carregada sob demanda
   (carregar.ts): quem nunca entra num mapa 3D não baixa nada disto.
   ========================================================================= */
import * as THREE from 'three';
import { Buf, assar, larguraDe, alturaDe, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA } from '../core/renderer.ts';
import { objetoAtivo, spriteDoObjeto, type DefObjeto, type Mapa } from '../world/tilemap.ts';
import * as T from '../art/tiles.ts';
import { P } from '../art/palette.ts';
import { texto, larguraTexto } from '../art/font.ts';
import {
  DEITADOS, NIVEL_AGUA, PAREDE_CORTADA, PREDIOS, luzDe, modeloDe, relevoDe,
  type ClimaLuz, type PeriodoLuz, type Relevo,
} from './relevo.ts';

/* quantos pixels do quadro ficam fora d'água — o mesmo do mapa plano */
const ALTURA_NADANDO = 14;
/* a densidade máxima: acima disso o celular esquenta e ninguém vê diferença */
const DPR_MAX = 2;

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
  /* a hora, o tempo e a região: a luz sai deles */
  periodo?: PeriodoLuz;
  clima?: ClimaLuz;
  regiao?: string | null;
}

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

/* ruído estável por posição, para nada sair todo igual */
function sorte(x: number, y: number, k = 0): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/* ---------------------------------------------------------- shader d'água */

const AGUA_VERTICE = /* glsl */`
  uniform float uTempo;
  varying vec2 vMundo;
  varying float vDist;
  varying float vOnda;
  void main() {
    vec4 m = modelMatrix * vec4(position, 1.0);
    float o = sin(m.x * 1.3 + uTempo * 1.6) * 0.5 + sin(m.z * 1.7 - uTempo * 1.2) * 0.5;
    m.y += o * 0.035;
    vOnda = o;
    vMundo = m.xz;
    vec4 mv = viewMatrix * m;
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const AGUA_FRAGMENTO = /* glsl */`
  uniform float uTempo;
  uniform vec3 uRaso;
  uniform vec3 uFundo;
  uniform vec3 uEspuma;
  uniform vec3 uLuz;
  uniform vec3 uNevoa;
  uniform float uPerto;
  uniform float uLonge;
  uniform sampler2D uMargem;
  uniform vec2 uTam;
  varying vec2 vMundo;
  varying float vDist;
  varying float vOnda;
  void main() {
    // a textura tem uma borda de mar aberto em volta: fora do mapa, margem zero
    float marg = texture2D(uMargem, (vMundo + 1.0) / (uTam + 2.0)).r;
    float risco = sin(vMundo.x * 4.0 + uTempo * 2.0) * sin(vMundo.y * 3.0 - uTempo * 1.5);
    // a espuma é uma linha: só onde a margem passa (entre a terra e a água)
    float m = marg + 0.06 * risco;
    float espuma = smoothstep(0.6, 0.72, m) * (1.0 - smoothstep(0.8, 0.9, m)) * 0.85;
    vec3 cor = mix(uFundo, uRaso, clamp(marg * 1.5 + vOnda * 0.08, 0.0, 1.0));
    float brilho = pow(max(0.0, sin(vMundo.x * 2.1 + uTempo) * sin(vMundo.y * 2.7 - uTempo * 1.3)), 14.0) * 0.4;
    cor = cor * uLuz + espuma * uEspuma * uLuz + brilho * uLuz;
    cor = mix(cor, uNevoa, smoothstep(uPerto, uLonge, vDist));
    gl_FragColor = vec4(cor, 0.86 + espuma * 0.14);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export class Vista3D {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly cena = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, LARGURA / ALTURA, 0.1, 300);
  private readonly sol: THREE.DirectionalLight;
  private readonly ceu: THREE.HemisphereLight;
  private larguraTela = 0;
  private alturaTela = 0;
  /* desenhada neste quadro? se não, o canvas some (carregar.ts) */
  private usada = false;

  /* tudo que pertence ao mapa atual; trocado inteiro quando o mapa muda */
  private grupo: THREE.Group | null = null;
  private descartaveis: { dispose(): void }[] = [];
  private mapaAtual: Mapa | null = null;
  private alturas: Float32Array = new Float32Array(0);
  private largura = 0;
  private altura = 0;
  private aguaMat: THREE.ShaderMaterial | null = null;

  /* a luz de agora (só recalcula quando a chave muda) */
  private chaveLuz = '';
  private fundo: THREE.CanvasTexture | null = null;
  /* o tempo do vento, compartilhado por todo material que balança */
  private readonly vento = { value: 0 };

  /* a câmera persegue este ponto, devagar */
  private readonly olhar = new THREE.Vector3();
  private ultimoTempo = -1;

  /* os atores reaproveitam sprites e texturas de um quadro para o outro */
  private readonly texturas = new Map<Assado, THREE.SpriteMaterial>();
  private readonly cabecas = new Map<Assado, Assado>();
  private readonly figuras: THREE.Sprite[] = [];
  private readonly sombras: THREE.Mesh[] = [];
  private readonly sombraGeo = new THREE.CircleGeometry(0.3, 14);
  private readonly sombraMat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28, depthWrite: false });

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'mundo3d';
    this.canvas.style.display = 'none';
    const jogo = document.getElementById('jogo');
    if (jogo?.parentElement) jogo.parentElement.insertBefore(this.canvas, jogo);
    else document.body.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.ceu = new THREE.HemisphereLight('#e8f4ff', '#5a7a3a', 1);
    this.sol = new THREE.DirectionalLight('#fff0d0', 2.2);
    this.sol.castShadow = true;
    this.sol.shadow.mapSize.set(2048, 2048);
    this.sol.shadow.bias = -0.0006;
    this.sol.shadow.normalBias = 0.02;
    this.cena.add(this.ceu, this.sol, this.sol.target);
  }

  /* desenha o mundo no canvas de trás e abre o buraco no canvas do jogo */
  desenhar(ctx: CanvasRenderingContext2D, q: Quadro3D): void {
    this.usada = true;
    this.canvas.style.display = 'block';
    this.ajustarTamanho();
    ctx.clearRect(0, 0, LARGURA, ALTURA);
    const novo = q.mapa !== this.mapaAtual;
    if (novo) this.montar(q.mapa);
    this.aplicarLuz(q);
    this.posicionarCamera(q, novo);
    this.posicionarAtores(q.atores);
    this.vento.value = q.tempo;
    if (this.aguaMat) this.aguaMat.uniforms['uTempo']!.value = q.tempo;
    this.renderer.render(this.cena, this.camera);
  }

  /* chamado uma vez por quadro (carregar.ts): quem não desenhou, some */
  fimDoQuadro(): void {
    if (!this.usada) this.canvas.style.display = 'none';
    this.usada = false;
  }

  /* o canvas de trás acompanha o tamanho do canvas do jogo, na resolução real */
  private ajustarTamanho(): void {
    const ref = document.getElementById('jogo');
    const w = ref?.clientWidth || LARGURA * 3, h = ref?.clientHeight || ALTURA * 3;
    if (w === this.larguraTela && h === this.alturaTela) return;
    this.larguraTela = w; this.alturaTela = h;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.renderer.setPixelRatio(Math.min(DPR_MAX, window.devicePixelRatio || 1));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /* onde um ponto do mundo (em tiles) cai na tela de 240x160 — para o
     balão de espanto do treinador, que continua desenhado em 2D */
  projetar(x: number, y: number, subir = 0): { x: number; y: number } {
    const v = new THREE.Vector3(x, this.chaoEm(x, y) + subir, y).project(this.camera);
    return { x: (v.x + 1) / 2 * LARGURA, y: (1 - v.y) / 2 * ALTURA };
  }

  /* ------------------------------------------------------------- luz */

  private aplicarLuz(q: Quadro3D): void {
    const def = q.mapa.def;
    const dentro = def.interior === true;
    const chave = `${def.id}|${q.periodo ?? 'dia'}|${q.clima ?? 'limpo'}|${q.regiao ?? ''}`;
    if (chave === this.chaveLuz) return;
    this.chaveLuz = chave;
    const l = luzDe(q.regiao ?? null, q.periodo ?? 'dia', q.clima ?? 'limpo', dentro);
    this.ceu.color.set(l.hemiCima);
    this.ceu.groundColor.set(l.hemiBaixo);
    this.ceu.intensity = l.hemi;
    this.sol.color.set(l.sol);
    this.sol.intensity = l.solForca;
    const cx = this.largura / 2, cz = this.altura / 2, raio = Math.max(this.largura, this.altura) / 2 + 4;
    const dist = 30;
    this.sol.position.set(cx + Math.cos(l.solAngulo) * dist, 8 + l.solAltura * 22, cz + Math.sin(l.solAngulo) * dist * 0.6 + 8);
    this.sol.target.position.set(cx, 0, cz);
    const sc = this.sol.shadow.camera;
    sc.left = -raio * 1.4; sc.right = raio * 1.4; sc.top = raio * 1.4; sc.bottom = -raio * 1.4;
    sc.near = 1; sc.far = 120;
    sc.updateProjectionMatrix();

    this.cena.fog = dentro ? null : new THREE.Fog(l.nevoa, l.nevoaPerto, l.nevoaLonge);
    this.fundo?.dispose();
    this.fundo = this.degrade(l.ceuTopo, l.ceuBase);
    this.cena.background = this.fundo;

    if (this.aguaMat) {
      const u = this.aguaMat.uniforms;
      const luz = new THREE.Color(l.hemiCima).multiplyScalar(l.hemi * 0.45)
        .add(new THREE.Color(l.sol).multiplyScalar(l.solForca * 0.14));
      u['uLuz']!.value = luz;
      u['uNevoa']!.value = new THREE.Color(l.nevoa);
      u['uPerto']!.value = dentro ? 999 : l.nevoaPerto;
      u['uLonge']!.value = dentro ? 1000 : l.nevoaLonge;
    }
  }

  /* o céu: um degradê vertical, de cima para o horizonte */
  private degrade(topo: string, base: string): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 2; c.height = 128;
    const g = c.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, topo);
    gr.addColorStop(1, base);
    g.fillStyle = gr;
    g.fillRect(0, 0, 2, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /* ------------------------------------------------------------ câmera */

  private posicionarCamera(q: Quadro3D, novo: boolean): void {
    const def = q.mapa.def;
    const caverna = def.escuro !== undefined;
    const dentro = def.interior === true;
    const alvo = new THREE.Vector3(q.alvoX, this.chaoEm(q.alvoX, q.alvoY) * 0.5, q.alvoY);
    // segue devagar; salta quando o mapa muda ou o jogador some de um lado a outro
    const dt = this.ultimoTempo < 0 ? 0 : Math.max(0, Math.min(0.1, q.tempo - this.ultimoTempo));
    this.ultimoTempo = q.tempo;
    if (novo || dt === 0 || this.olhar.distanceTo(alvo) > 6) this.olhar.copy(alvo);
    else this.olhar.lerp(alvo, 1 - Math.exp(-dt * 7));
    const [sobe, recua, fov] = caverna ? [8.2, 7.2, 40] : dentro ? [8.8, 7.6, 40] : [11, 10.2, 40];
    if (this.camera.fov !== fov) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
    const o = this.olhar;
    this.camera.position.set(o.x, o.y + sobe, o.z + recua);
    this.camera.lookAt(o.x, o.y, o.z - 0.6);
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
    this.aguaMat = null;
    this.mapaAtual = mapa;
    this.chaveLuz = '';

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
        if (r.bloco && dentro && y === this.altura - 1) r.altura = PAREDE_CORTADA;
        rel.push(r);
        this.alturas[y * this.largura + x] = r.agua ? NIVEL_AGUA : r.altura;
      }
    }

    this.montarChao(g, rel);
    this.montarBlocos(g, rel);
    const fora = dentro ? [] : this.montarEntorno(g, rel);
    if (rel.some((r) => r.agua)) this.montarAgua(g, rel);
    this.montarEnfeites(g, rel, fora);
    for (const o of def.objetos) if (objetoAtivo(o, mapa.ctx)) this.montarObjeto(g, o, mapa);
  }

  private guardar<X extends { dispose(): void }>(x: X): X { this.descartaveis.push(x); return x; }

  /* material que balança no vento: o topo anda mais que a base */
  private balancando(mat: THREE.Material, forca: number): THREE.Material {
    mat.onBeforeCompile = (s) => {
      s.uniforms['uTempo'] = this.vento;
      s.vertexShader = 'uniform float uTempo;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 baseV = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        #else
          vec3 baseV = vec3(0.0);
        #endif
        float balanco = sin(uTempo * 1.7 + baseV.x * 0.8 + baseV.z * 0.6) * ${forca.toFixed(3)} * max(position.y + 0.5, 0.0);
        transformed.x += balanco;
        transformed.z += balanco * 0.4;`);
    };
    return mat;
  }

  /* O chão inteiro numa malha só. Cada tile vira quatro triângulos em
     volta do centro: o centro fica na altura do tile (é onde se pisa), os
     cantos na média dos vizinhos — o barranco vira rampa chanfrada, e a cor
     do canto, a mistura das cores em volta. */
  private montarChao(g: THREE.Group, rel: Relevo[]): void {
    const W = this.largura, H = this.altura;
    // dentro de casa o piso não se mistura: tapete é tapete, tábua é tábua
    const misturar = this.mapaAtual!.def.interior !== true;
    const cantoH = new Float32Array((W + 1) * (H + 1));
    const cantoC: THREE.Color[] = [];
    const corDe = (r: Relevo) => new THREE.Color(r.cor);
    for (let cy = 0; cy <= H; cy++) {
      for (let cx = 0; cx <= W; cx++) {
        let soma = 0, n = 0;
        const c = new THREE.Color(0, 0, 0);
        for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]] as const) {
          const x = cx + dx, y = cy + dy;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const r = rel[y * W + x]!;
          if (r.bloco) continue;
          // o fundo d'água puxa o canto só até a metade: margem em rampa, não em poço
          soma += r.agua ? NIVEL_AGUA - 0.25 : r.altura; n++;
          c.add(corDe(r));
        }
        if (n === 0) { cantoH[cy * (W + 1) + cx] = 0; cantoC.push(new THREE.Color('#5a5048')); continue; }
        cantoH[cy * (W + 1) + cx] = soma / n;
        // um pouco de variação por canto: o low-poly respira
        cantoC.push(c.multiplyScalar(1 / n).multiplyScalar(0.94 + sorte(cx, cy) * 0.12));
      }
    }

    const pos: number[] = [], cor: number[] = [];
    const v = (x: number, y: number, z: number, c: THREE.Color) => { pos.push(x, y, z); cor.push(c.r, c.g, c.b); };
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const r = rel[y * W + x]!;
        if (r.bloco) continue;
        const h = r.altura;
        const cc = corDe(r).multiplyScalar(0.96 + sorte(x, y, 7) * 0.08);
        const k = (cx: number, cy: number) => cy * (W + 1) + cx;
        const cantos: [number, number][] = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
        // os quatro triângulos em leque, na ordem que deixa a face para cima
        for (let i = 0; i < 4; i++) {
          const [ax, ay] = cantos[(i + 1) % 4]!;
          const [bx, by] = cantos[i]!;
          v(x + 0.5, h, y + 0.5, cc);
          v(ax, cantoH[k(ax, ay)]!, ay, misturar ? cantoC[k(ax, ay)]! : cc);
          v(bx, cantoH[k(bx, by)]!, by, misturar ? cantoC[k(bx, by)]! : cc);
        }
      }
    }
    const geo = this.guardar(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
    geo.computeVertexNormals();
    const mat = this.guardar(new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    const m = new THREE.Mesh(geo, mat);
    m.receiveShadow = true;
    g.add(m);

    // lava: um véu que brilha sozinho por cima do chão
    const lavas = rel.flatMap((r, i) => (r.brilha ? [i] : []));
    if (lavas.length) {
      const brilho = new THREE.InstancedMesh(this.guardar(new THREE.PlaneGeometry(1, 1)),
        this.guardar(new THREE.MeshBasicMaterial({ color: '#ff8a2a' })), lavas.length);
      const o = new THREE.Object3D();
      lavas.forEach((i, n) => {
        o.position.set(i % W + 0.5, rel[i]!.altura + 0.02, Math.floor(i / W) + 0.5);
        o.rotation.set(-Math.PI / 2, 0, 0);
        o.updateMatrix();
        brilho.setMatrixAt(n, o.matrix);
      });
      g.add(brilho);
    }
  }

  /* parede, rocha e paredão: um bloco que desce até o fundo, e um tampo
     menor e mais claro em cima — o chanfro que tira a cara de caixote */
  private montarBlocos(g: THREE.Group, rel: Relevo[]): void {
    const W = this.largura;
    const blocos = rel.flatMap((r, i) => (r.bloco ? [i] : []));
    if (!blocos.length) return;
    const corpo = new THREE.InstancedMesh(this.guardar(new THREE.BoxGeometry(1, 1, 1)),
      this.guardar(new THREE.MeshLambertMaterial({ flatShading: true })), blocos.length);
    const tampo = new THREE.InstancedMesh(this.guardar(new THREE.BoxGeometry(0.84, 0.14, 0.84)),
      this.guardar(new THREE.MeshLambertMaterial({ flatShading: true })), blocos.length);
    corpo.castShadow = corpo.receiveShadow = tampo.castShadow = tampo.receiveShadow = true;
    const o = new THREE.Object3D();
    blocos.forEach((i, n) => {
      const r = rel[i]!;
      const x = i % W, y = Math.floor(i / W);
      const h = r.altura + (r.enfeite === 'rocha' ? (sorte(x, y) - 0.5) * 0.3 : 0);
      o.position.set(x + 0.5, (h - 1.2) / 2, y + 0.5);
      o.scale.set(1, h + 1.2, 1);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      corpo.setMatrixAt(n, o.matrix);
      corpo.setColorAt(n, new THREE.Color(r.cor).multiplyScalar(0.88 + sorte(x, y, 3) * 0.1));
      o.position.set(x + 0.5, h + 0.07, y + 0.5);
      o.scale.set(1, 1, 1);
      o.rotation.set(0, r.enfeite === 'rocha' ? sorte(x, y, 5) * 0.4 : 0, 0);
      o.updateMatrix();
      tampo.setMatrixAt(n, o.matrix);
      tampo.setColorAt(n, new THREE.Color(r.cor).multiplyScalar(1.12));
    });
    g.add(corpo, tampo);
  }

  /* O que fica além da borda: chão com a cor da borda, e — onde não é
     mar — uma faixa de mata que vai rareando, e morros ao longe. A câmera
     nunca vê o vazio, e o mapa deixa de parecer um tabuleiro recortado.
     Devolve onde pôr as árvores de fora (montadas junto com as de dentro). */
  private montarEntorno(g: THREE.Group, rel: Relevo[]): [number, number][] {
    const W = this.largura, H = this.altura, M = 40;
    const def = this.mapaAtual!.def;
    const lados: { x: number; z: number; w: number; d: number; borda: string; arvore: (k: number) => [number, number] }[] = [
      { x: -M, z: -M, w: W + 2 * M, d: M, borda: def.chao[0]!, arvore: (k) => [sorte(k, 1) * (W + 16) - 8, -1 - sorte(k, 2) ** 2 * 9] },
      { x: -M, z: H, w: W + 2 * M, d: M, borda: def.chao[H - 1]!, arvore: (k) => [sorte(k, 3) * (W + 16) - 8, H + 1 + sorte(k, 4) ** 2 * 9] },
      { x: -M, z: 0, w: M, d: H, borda: def.chao.map((l) => l[0]).join(''), arvore: (k) => [-1 - sorte(k, 5) ** 2 * 9, sorte(k, 6) * H] },
      { x: W, z: 0, w: M, d: H, borda: def.chao.map((l) => l[W - 1]).join(''), arvore: (k) => [W + 1 + sorte(k, 7) ** 2 * 9, sorte(k, 8) * H] },
    ];
    const arvores: [number, number][] = [];
    const morros = new THREE.InstancedMesh(this.guardar(new THREE.ConeGeometry(1, 1, 6)),
      this.guardar(new THREE.MeshLambertMaterial({ flatShading: true })), 60);
    let nMorros = 0;
    const o = new THREE.Object3D();
    lados.forEach((l, li) => {
      const mar = [...l.borda].filter((c) => c === '~').length > l.borda.length / 2;
      if (mar) return;
      const corBorda = new THREE.Color(0, 0, 0);
      let n = 0;
      for (const c of l.borda) { const r = relevoDe(c); if (r && !r.agua) { corBorda.add(new THREE.Color(r.bloco ? '#5e9e4c' : r.cor)); n++; } }
      corBorda.multiplyScalar(1 / Math.max(1, n)).multiplyScalar(0.92);
      const p = new THREE.Mesh(this.guardar(new THREE.PlaneGeometry(l.w, l.d)),
        this.guardar(new THREE.MeshLambertMaterial({ color: corBorda })));
      p.rotation.x = -Math.PI / 2;
      p.position.set(l.x + l.w / 2, -0.01, l.z + l.d / 2);
      p.receiveShadow = true;
      g.add(p);
      const comprimento = li < 2 ? W : H;
      for (let k = 0; k < Math.round(comprimento * 1.6); k++) arvores.push(l.arvore(k + li * 1000));
      // morros ao longe, que a névoa apaga devagar
      for (let k = 0; k < 12 && nMorros < 60; k++, nMorros++) {
        const [ax, az] = l.arvore(k + li * 500 + 77);
        const longe = 14 + sorte(k, li, 9) * 10;
        const px = li === 2 ? ax - longe : li === 3 ? ax + longe : ax;
        const pz = li === 0 ? az - longe : li === 1 ? az + longe : az;
        const r = 4 + sorte(k, li, 11) * 5;
        o.position.set(px, r * 0.35, pz);
        o.scale.set(r, r * 0.7 + 1.5, r);
        o.rotation.set(0, sorte(k, li) * 3, 0);
        o.updateMatrix();
        morros.setMatrixAt(nMorros, o.matrix);
        morros.setColorAt(nMorros, new THREE.Color('#4f7f44').multiplyScalar(0.8 + sorte(k, li, 13) * 0.3));
      }
    });
    morros.count = nMorros;
    morros.receiveShadow = true;
    g.add(morros);
    void rel;
    return arvores;
  }

  /* a lâmina d'água: um shader com ondas, espuma rente à margem e brilho */
  private montarAgua(g: THREE.Group, rel: Relevo[]): void {
    const W = this.largura, H = this.altura, M = 40;
    // a textura da margem: forte na água colada em terra, fraca logo depois
    const dados = new Uint8Array((W + 2) * (H + 2) * 4);
    const agua = (x: number, y: number) => x < 0 || y < 0 || x >= W || y >= H || rel[y * W + x]!.agua;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let v = 0;
        if (agua(x, y)) {
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (!agua(x + dx, y + dy)) v = Math.max(v, Math.max(Math.abs(dx), Math.abs(dy)) === 1 ? 140 : 50);
            }
          }
        } else v = 255;
        const i = ((y + 1) * (W + 2) + x + 1) * 4;
        dados[i] = dados[i + 1] = dados[i + 2] = v; dados[i + 3] = 255;
      }
    }
    const margem = this.guardar(new THREE.DataTexture(dados, W + 2, H + 2, THREE.RGBAFormat));
    margem.magFilter = margem.minFilter = THREE.LinearFilter;
    margem.wrapS = margem.wrapT = THREE.ClampToEdgeWrapping;
    margem.needsUpdate = true;

    const mat = this.guardar(new THREE.ShaderMaterial({
      vertexShader: AGUA_VERTICE,
      fragmentShader: AGUA_FRAGMENTO,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTempo: { value: 0 },
        uRaso: { value: new THREE.Color('#3a9ccc') },
        uFundo: { value: new THREE.Color('#1f5f9a') },
        uEspuma: { value: new THREE.Color('#e8f6ff') },
        uLuz: { value: new THREE.Color(1, 1, 1) },
        uNevoa: { value: new THREE.Color('#bfe3f5') },
        uPerto: { value: 26 },
        uLonge: { value: 52 },
        uMargem: { value: margem },
        uTam: { value: new THREE.Vector2(W, H) },
      },
    }));
    this.aguaMat = mat;
    const seg = Math.min(220, W + 2 * M);
    const geo = this.guardar(new THREE.PlaneGeometry(W + 2 * M, H + 2 * M, seg, Math.min(220, H + 2 * M)));
    const p = new THREE.Mesh(geo, mat);
    p.rotation.x = -Math.PI / 2;
    p.position.set(W / 2, NIVEL_AGUA, H / 2);
    p.renderOrder = 1;
    g.add(p);
    const fundo = new THREE.Mesh(this.guardar(new THREE.PlaneGeometry(W + 2 * M, H + 2 * M)),
                                 this.guardar(new THREE.MeshLambertMaterial({ color: '#1a4a72' })));
    fundo.rotation.x = -Math.PI / 2;
    fundo.position.set(W / 2, -1.5, H / 2);
    g.add(fundo);
  }

  /* árvores, pedras, tufos de mato, capim, cascalho, trilhos e flores: uma
     malha repetida por tipo, e o vento nas copas e no mato */
  private montarEnfeites(g: THREE.Group, rel: Relevo[], fora: [number, number][]): void {
    const W = this.largura;
    const onde = (e: string) => rel.flatMap((r, i) => (r.enfeite === e ? [[i % W, Math.floor(i / W)] as [number, number]] : []));
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

    // árvore: tronco e três copas de icosaedro, em tons de verde diferentes
    const dentro = onde('arvore').map(([x, y]) => [x + 0.5 + (sorte(x, y, 1) - 0.5) * 0.15, y + 0.5] as [number, number]);
    const todas = [...dentro, ...fora];
    const tronco = repetido(new THREE.CylinderGeometry(0.09, 0.14, 1, 6), plano('#6b4a2e'), todas.length);
    const copa = repetido(new THREE.IcosahedronGeometry(0.5, 0), this.balancando(
      this.guardar(new THREE.MeshLambertMaterial({ flatShading: true })), 0.05), todas.length * 2);
    const verdes = ['#2f7a36', '#3f8f3e', '#2a6a30', '#4f9a40'];
    todas.forEach(([x, z], i) => {
      const h = 0.75 + sorte(x, z) * 0.55;
      const s = 0.95 + sorte(x, z, 2) * 0.35;
      pôr(tronco, i, x, h / 2, z, 1, 0, h);
      pôr(copa, i * 2, x, h + 0.25, z, s, sorte(x, z, 3) * 6, s * 1.05);
      pôr(copa, i * 2 + 1, x + (sorte(x, z, 4) - 0.5) * 0.3, h + 0.75, z + (sorte(x, z, 5) - 0.5) * 0.3, s * 0.72, sorte(x, z, 6) * 6);
      copa.setColorAt(i * 2, new THREE.Color(verdes[Math.floor(sorte(x, z, 7) * 4)]!));
      copa.setColorAt(i * 2 + 1, new THREE.Color(verdes[Math.floor(sorte(x, z, 8) * 4)]!).multiplyScalar(1.12));
    });

    const pedras = onde('pedra');
    const pedra = repetido(new THREE.DodecahedronGeometry(0.42, 0), plano('#9a9488'), pedras.length);
    pedras.forEach(([x, y], i) => pôr(pedra, i, x + 0.5, 0.25, y + 0.5, 1, sorte(x, y) * 6, 0.8));

    // mato e capim: tufos finos que balançam
    for (const [qual, cores] of [['mato', ['#3f8a3a', '#5aa44a']], ['capim', ['#c8a84a', '#e0c060']]] as const) {
      const lugares = onde(qual);
      if (!lugares.length) continue;
      const tufos = cores.map((c) => repetido(new THREE.ConeGeometry(0.08, 0.55, 4),
        this.balancando(plano(c), 0.12), lugares.length * 3, false));
      lugares.forEach(([x, y], i) => {
        for (let k = 0; k < 6; k++) {
          const tx = x + 0.15 + sorte(x, y, k) * 0.7, tz = y + 0.15 + sorte(x, y, k + 9) * 0.7;
          pôr(tufos[k % 2]!, i * 3 + (k >> 1), tx, 0.26, tz, 1, 0, 0.8 + sorte(x, y, k + 4) * 0.5);
        }
      });
    }

    const cascalhos = onde('cascalho');
    if (cascalhos.length) {
      const seixo = repetido(new THREE.DodecahedronGeometry(0.1, 0), plano('#8a8290'), cascalhos.length * 4, false);
      cascalhos.forEach(([x, y], i) => {
        for (let k = 0; k < 4; k++) pôr(seixo, i * 4 + k, x + 0.2 + sorte(x, y, k) * 0.6, 0.04, y + 0.2 + sorte(x, y, k + 3) * 0.6, 0.7 + sorte(x, y, k + 6) * 0.6, sorte(x, y, k + 8) * 6);
      });
    }

    const trilhos = onde('trilho');
    if (trilhos.length) {
      const trilho = repetido(new THREE.BoxGeometry(0.08, 0.06, 1), plano('#5a5258'), trilhos.length * 2, false);
      const dorm = repetido(new THREE.BoxGeometry(0.7, 0.04, 0.14), plano('#6b4a2e'), trilhos.length * 2, false);
      trilhos.forEach(([x, y], i) => {
        const ch = this.mapaAtual!.def.chao[y]![x]!;
        const deitado = ch === 'D' || ch === 'E';
        const rot = deitado ? Math.PI / 2 : 0;
        for (const k of [0, 1]) {
          const d = k === 0 ? -0.22 : 0.22;
          pôr(trilho, i * 2 + k, x + 0.5 + (deitado ? 0 : d), 0.03, y + 0.5 + (deitado ? d : 0), 1, rot);
          const e = k === 0 ? -0.25 : 0.25;
          pôr(dorm, i * 2 + k, x + 0.5 + (deitado ? e : 0), 0.02, y + 0.5 + (deitado ? 0 : e), 1, rot);
        }
      });
    }

    const flores = onde('flores');
    const cores = ['#f2d24b', '#e8583a', '#f4f0e8', '#c25d8f'];
    const petalas = repetido(new THREE.IcosahedronGeometry(0.07, 0), this.guardar(new THREE.MeshLambertMaterial({ flatShading: true })), flores.length * 4, false);
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
      const caixa = new THREE.Mesh(geo, [lado, lado, topo, lado, lado, lado]);
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
    const d = alt - 0.45, h = o.tipo === 'terreiro' || o.tipo === 'arena' ? 2.5 : 1.8;
    const cx = o.tx + w / 2, cz = o.ty + 0.05 + d / 2;
    const frente = cz + d / 2;
    const mat = (c: string) => this.guardar(new THREE.MeshLambertMaterial({ color: c, flatShading: true }));
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
        this.balancando(this.guardar(new THREE.MeshLambertMaterial({ color: P.water!, side: THREE.DoubleSide })), 0.15));
      bandeira.position.set(o.tx + 0.93, h + 1.05, cz);
      bandeira.castShadow = true;
      g.add(bandeira);
    }
  }

  private farol(g: THREE.Group, o: DefObjeto): void {
    const w = o.larg ?? 3, alt = o.alt ?? 7;
    const cx = o.tx + w / 2, cz = o.ty + alt - 1;
    const mat = (c: string, e?: string) => this.guardar(new THREE.MeshLambertMaterial({ color: c, emissive: e ?? '#000000', flatShading: true }));
    const peca = (geo: THREE.BufferGeometry, m: THREE.Material, y: number) => {
      const p = new THREE.Mesh(this.guardar(geo), m);
      p.position.set(cx, y, cz);
      p.castShadow = p.receiveShadow = true;
      g.add(p);
    };
    peca(new THREE.BoxGeometry(w + 0.2, 0.6, 2.4), mat('#8a8478'), -0.15);
    // baixo o bastante para não tampar a praia quando a câmera passa por ela
    for (let i = 0; i < 5; i++) {
      peca(new THREE.CylinderGeometry(0.8 - i * 0.07, 0.86 - i * 0.07, 0.7, 10), mat(i % 2 ? '#c2493f' : '#f4f0e8'), 0.5 + i * 0.7);
    }
    peca(new THREE.CylinderGeometry(0.42, 0.42, 0.55, 10), mat('#ffe89a', '#c89020'), 4.05);
    peca(new THREE.ConeGeometry(0.62, 0.6, 10), mat('#93312c'), 4.6);
  }
}
