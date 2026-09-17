/* Tiles 16x16 do cenario. Gerados por codigo com RNG semeado, entao o mesmo
   tile sai identico toda vez e nao dependemos de nenhum asset externo. */
import { Buf, rng } from '../core/buf.ts';
import { P } from './palette.ts';
import { texto, larguraTexto } from './font.ts';

export const TS = 16; // tamanho do tile

function base(color: string): Buf { const b = new Buf(TS, TS); b.rect(0, 0, TS, TS, color); return b; }

export function tileGrama(seed = 1): Buf {
  const b = base(P.grass); const r = rng(seed);
  for (let i = 0; i < 26; i++) b.set(r() * TS, r() * TS, r() < 0.55 ? P.grassD : P.grassL);
  for (let i = 0; i < CONTAS_NA_GUIA; i++) { // tufinhos de 2px
    const x = (r() * (TS - 2)) | 0, y = (r() * (TS - 2)) | 0;
    b.set(x, y, P.grassD); b.set(x + 1, y - 1, P.grassD);
  }
  return b;
}

export function tileMatoAlto(seed = 2): Buf {
  // base propria, bem mais escura que a grama comum: e o contraste que faz o
  // jogador reconhecer de longe onde aparecem os Encantados selvagens
  const b = base(P.tallD); const r = rng(seed * 7 + 1);
  for (let i = 0; i < 20; i++) b.set(r() * TS, r() * TS, P.tall);

  // leques de folhas cobrindo o tile inteiro, em duas alturas
  for (let fila = 0; fila < 2; fila++) {
    const yBase = fila === 0 ? 9 : TS - 1;
    for (let x = 1; x < TS; x += 4) {
      const jitter = ((r() * 2) | 0) - 1;
      const cx = x + jitter;
      const alt = 6 + ((r() * 3) | 0);
      const c = fila === 0 ? P.tall : P.tallL;
      b.line(cx, yBase, cx, yBase - alt, c);
      b.line(cx - 2, yBase, cx - 1, yBase - alt + 2, c);
      b.line(cx + 2, yBase, cx + 1, yBase - alt + 2, c);
      b.set(cx, yBase - alt - 1, P.grassL);
    }
  }
  return b;
}

export function tileAgua(seed = 3, frame = 0): Buf {
  const b = base(P.water); const r = rng(seed);
  // faixas de profundidade: sem elas o mar vira um retangulo azul chapado
  for (let y = 0; y < TS; y++) {
    if ((y + ((seed * 3) % 4)) % 5 === 0) b.rect(0, y, TS, 1, P.waterD);
  }
  for (let i = 0; i < 14; i++) b.set(r() * TS, r() * TS, P.waterD);
  // cristas claras, deslocadas por tile para nao alinharem numa grade obvia
  for (const y of [2, 7, 12]) {
    const off = ((seed * 7 + y * 5 + frame * 4) % TS);
    for (let k = 0; k < 4; k++) b.set((off + k) % TS, y, P.waterL);
    for (let k = 0; k < 2; k++) b.set((off + 8 + k) % TS, y + 1, P.waterL);
  }
  return b;
}

/* espuma desenhada onde a agua encosta na areia */
export function espumaOrla(seed = 1): Buf {
  const b = new Buf(TS, 5); const r = rng(seed);
  b.rect(0, 0, TS, 2, P.foam);
  for (let x = 0; x < TS; x++) if (r() < 0.55) b.set(x, 2, P.foam);
  for (let x = 0; x < TS; x++) if (r() < 0.3) b.set(x, 3, P.waterL);
  return b;
}

export function tileAreia(seed = 4): Buf { // areia encontrando a agua (borda superior)
  const b = base(P.sand); const r = rng(seed);
  for (let i = 0; i < 20; i++) b.set(r() * TS, r() * TS, P.sandD);
  return b;
}

export function tileCaminho(seed = 5): Buf {
  const b = base(P.path); const r = rng(seed);
  for (let i = 0; i < 22; i++) b.set(r() * TS, r() * TS, r() < 0.6 ? P.pathD : P.pathL);
  // pedrinhas de 2px: dao textura de terra batida e separam da areia da praia
  for (let i = 0; i < 4; i++) {
    const x = (r() * (TS - 2)) | 0, y = (r() * (TS - 2)) | 0;
    b.set(x, y, P.pathD); b.set(x + 1, y, P.pathD); b.set(x, y + 1, P.pathD);
  }
  return b;
}

export function tileArvore(seed = 6): Buf {
  const b = tileGrama(seed + 40);
  b.rect(6, 10, 4, 6, P.trunkD); b.rect(7, 10, 2, 6, P.trunk);
  b.ellipse(8, 7, 7, 6, P.tree);
  b.ellipse(6, 5, 4, 3, P.treeL);
  b.ellipse(11, 9, 3, 2, P.treeD);
  b.ellipse(4, 9, 3, 2, P.treeD);
  return b;
}

export function tileFlores(seed = 7, color = '#f2d24b'): Buf {
  const b = tileGrama(seed + 12);
  for (const [fx, fy] of [[4, 6], [11, 10]]) {
    b.set(fx, fy - 1, color); b.set(fx - 1, fy, color); b.set(fx + 1, fy, color);
    b.set(fx, fy + 1, color); b.set(fx, fy, '#ffffff');
  }
  return b;
}

export function tilePedra(seed = 8): Buf {
  const b = tileGrama(seed + 21);
  b.ellipse(8, 10, 6, 4, P.rock);
  b.ellipse(6, 8, 3, 2, '#b5aca3');
  b.ellipse(11, 12, 2, 1, P.rockD);
  return b;
}

export function tileRocha(seed = 9): Buf { // parede de pedra / desnivel
  const b = base(P.rockD); const r = rng(seed);
  b.rect(0, 0, TS, 3, P.rock);
  for (let i = 0; i < 22; i++) b.set(r() * TS, 3 + r() * (TS - 3), r() < 0.5 ? '#5b524c' : '#83786f');
  return b;
}

export function tilePisoMadeira(_seed = 10): Buf { // piso interno do terreiro
  const b = base('#c99a5e');
  for (let y = 0; y < TS; y += 4) for (let x = 0; x < TS; x++) b.set(x, y, '#a87c45');
  for (let y = 0; y < TS; y += 4) b.set((y * 5) % TS, y + 2, '#a87c45');
  return b;
}

/* ---- construcoes: desenhadas como blocos, nao como tiles soltos ---- */

/* casa simples w x h em TILES; telhado colorido e porta centralizada */
export interface OpcoesConstrucao {
  roof?: string; roofD?: string; roofL?: string;
  sign?: string | null; signColor?: string;
  /* coluna (em TILES, a partir da esquerda da construcao) onde fica a porta.
     Precisa ser um tile inteiro: e nele que o jogador pisa para entrar. */
  portaCol?: number;
}

/* Onde cai a porta de uma construcao de `wTiles` de largura.
   O mapa usa isto para nao marcar o tile da porta como solido e para casar a
   saida com o desenho — antes a porta era centralizada em PIXELS e ficava a
   cavalo entre dois tiles, sem tile nenhum batendo com o vao. */
export function colunaPorta(wTiles: number, portaCol?: number): number {
  const c = portaCol ?? Math.floor(wTiles / 2);
  return Math.max(0, Math.min(wTiles - 1, c));
}

export function construcao(wTiles: number, hTiles: number, opt: OpcoesConstrucao = {}): Buf {
  const { roof = P.roof, roofD = P.roofD, roofL = P.roofL, sign = null, signColor = P.gold } = opt;
  const w = wTiles * TS, h = hTiles * TS;
  const b = new Buf(w, h);
  const roofH = Math.floor(h * 0.42);

  // corpo
  b.rect(2, roofH - 2, w - 4, h - roofH + 2, P.wall);
  b.rect(2, roofH - 2, 3, h - roofH + 2, P.wallD);
  b.rect(w - 5, roofH - 2, 3, h - roofH + 2, P.wallD);

  // telhado em duas aguas
  for (let y = 0; y < roofH; y++) {
    const inset = Math.floor((roofH - y) * 0.55);
    b.rect(inset, y, w - inset * 2, 1, y < 3 ? roofL : roof);
    b.set(inset, y, roofD); b.set(w - inset - 1, y, roofD);
  }
  b.rect(0, roofH - 3, w, 3, roofD);
  b.rect(0, roofH - 3, w, 1, roofL);

  // porta, encostada no meio do tile da coluna escolhida
  const dw = 12;
  const dx = colunaPorta(wTiles, opt.portaCol) * TS + (((TS - dw) / 2) | 0);
  const dy = h - 18;
  b.rect(dx, dy, dw, 18, P.doorD);
  b.rect(dx + 1, dy + 1, dw - 2, 17, P.door);
  b.rect(dx + 1, dy + 1, dw - 2, 3, '#9a6236');
  b.set(dx + dw - 4, dy + 10, P.gold);

  // janelas
  const wy = roofH + 4;
  for (const wx of [6, w - 16]) {
    b.rect(wx, wy, 10, 9, P.winD);
    b.rect(wx + 1, wy + 1, 8, 7, P.win);
    b.rect(wx + 1, wy + 1, 8, 3, '#b8e6fb');
    b.rect(wx + 4, wy, 2, 9, P.wallD);
    b.rect(wx, wy + 3, 10, 2, P.wallD);
  }

  // placa sobre a fachada
  if (sign) {
    const sw = larguraTexto(sign) + 8;
    const sx = ((w - sw) / 2) | 0, sy = roofH;
    b.rect(sx, sy, sw, 13, P.ink);
    b.rect(sx + 1, sy + 1, sw - 2, 11, signColor);
    b.rect(sx + 1, sy + 1, sw - 2, 3, '#ffffff');
    texto(b, sign, sx + 4, sy + 3, P.ink);
  }
  return b;
}

/* moita de mato alto isolada, usada fora dos tiles de grade */
export function moita(): Buf {
  const b = new Buf(16, 14);
  b.ellipse(8, 9, 7, 5, P.tall);
  b.ellipse(6, 7, 4, 3, P.tallL);
  b.ellipse(11, 10, 3, 2, P.tallD);
  return b;
}

/* placa de madeira com seta */
export function placa(): Buf {
  const b = new Buf(14, 18);
  b.rect(6, 8, 3, 10, P.trunkD);
  b.rect(1, 3, 12, 8, P.trunk);
  b.rect(1, 3, 12, 2, '#8a5c32');
  b.frame(1, 3, 12, 8, P.trunkD);
  return b;
}

/* cais de madeira sobre a agua */
export function tileCais(seed = 11): Buf {
  const b = base('#8a5c32'); const r = rng(seed);
  for (let y = 0; y < TS; y += 4) b.rect(0, y, TS, 1, '#6d4726');
  for (let i = 0; i < 10; i++) b.set(r() * TS, r() * TS, '#9c6b3e');
  b.rect(0, 0, 1, TS, '#5a3a20'); b.rect(TS - 1, 0, 1, TS, '#5a3a20');
  return b;
}

/* barreira vermelha e branca que fecha a entrada do terreiro */
export function barreira(larguraTiles: number): Buf {
  const w = larguraTiles * TS;
  const b = new Buf(w, 16);
  for (const px of [0, w - 3]) { b.rect(px, 4, 3, 12, P.trunkD); b.rect(px + 1, 4, 1, 12, P.trunk); }
  b.rect(0, 6, w, 3, '#c93f3f');
  b.rect(0, 6, w, 1, '#e86a5a');
  for (let px = 4; px < w - 4; px += 10) b.rect(px, 5, 4, 5, P.uiBg);
  return b.outline(P.ink);
}

/* folhas que balancam na frente dos pes quando se anda no mato alto */
export function rocada(quadro = 0): Buf {
  const b = new Buf(16, 9);
  const inclina = quadro === 0 ? 0 : quadro === 1 ? 1 : -1;
  for (let x = 1; x < 16; x += 3) {
    const alt = 5 + ((x * 7) % 3);
    b.line(x, 8, x + inclina, 8 - alt, P.tall!);
    b.line(x - 1, 8, x - 1 + inclina, 8 - alt + 2, P.tallD!);
    b.set(x + inclina, 8 - alt - 1, P.tallL!);
  }
  return b;
}

/* ======================= interiores =======================
   Os tiles de dentro precisam ler como "dentro" na primeira olhada: madeira
   quente no chao, ripa vertical na parede. Sem isso o jogador atravessa a
   porta e nao percebe que mudou de lugar. */

export function tileParedeInterna(seed = 13): Buf {
  const b = base('#b98a56'); const r = rng(seed);
  for (let x = 0; x < TS; x += 4) b.rect(x, 0, 1, TS, '#96693a');   // ripas
  b.rect(0, 0, TS, 3, '#d3a86f');                                   // luz do teto
  b.rect(0, TS - 2, TS, 2, '#7d5730');                              // rodape
  for (let i = 0; i < 10; i++) b.set(r() * TS, 3 + r() * (TS - 5), '#a97a48');
  return b;
}

export function tileTapete(seed = 14): Buf {
  const b = base('#a8423c'); const r = rng(seed);
  for (let y = 1; y < TS; y += 5) b.rect(0, y, TS, 1, '#d1665c');
  for (let x = 3; x < TS; x += 6) b.rect(x, 0, 1, TS, '#8d322d');
  for (let i = 0; i < 8; i++) b.set(r() * TS, r() * TS, '#c2554d');
  return b;
}

export function tileTatame(seed = 15): Buf {
  // palha trancada: quadrados de 8 alternando o sentido do fio
  const b = base('#cbb271');
  for (let qy = 0; qy < 2; qy++) {
    for (let qx = 0; qx < 2; qx++) {
      const vertical = (qx + qy) % 2 === 0;
      for (let k = 1; k < 8; k += 2) {
        if (vertical) b.rect(qx * 8 + k, qy * 8, 1, 8, '#ab9256');
        else b.rect(qx * 8, qy * 8 + k, 8, 1, '#ab9256');
      }
    }
  }
  b.frame(0, 0, TS, TS, '#8d7742');
  const r = rng(seed);
  for (let i = 0; i < 6; i++) b.set(r() * TS, r() * TS, '#e0ca8d');
  return b;
}

/* poca rasa no piso: o chao do puzzle do terreiro (Etapa 3) */
/* Agua parada por cima da tabua. Cobre o tile INTEIRO de proposito: um campo
   de pocas desenhadas como elipses soltas viraria bolinha; assim um bloco de
   tiles molhados le como um salao alagado, que e o que o quebra-cabeca da
   Dona Mariana precisa mostrar. */
export function tilePocaDagua(seed = 16): Buf {
  const b = tilePisoMadeira(seed); const r = rng(seed * 3 + 1);
  // lamina de agua: a tabua continua aparecendo por baixo
  for (let y = 0; y < TS; y++) {
    for (let x = 0; x < TS; x++) {
      if ((x + y * 3 + seed) % 7 === 0) continue;      // buracos: o fundo
      b.set(x, y, (x + y) % 9 === 0 ? P.waterD! : P.water!);
    }
  }
  // cristas claras, para a lamina nao ficar chapada
  for (const y of [3, 9, 14]) {
    const off = (seed * 5 + y * 3) % TS;
    for (let k = 0; k < 5; k++) b.set((off + k) % TS, y, P.waterL!);
  }
  for (let i = 0; i < 4; i++) b.set(r() * TS, r() * TS, P.foam!);
  return b;
}

/* ---- moveis: desenhados em blocos de tile, como as construcoes ---- */

/* balcao da loja: tampo de madeira com frente de tabua */
export function balcao(wTiles: number): Buf {
  const w = wTiles * TS;
  const b = new Buf(w, TS);
  b.rect(0, 2, w, 5, '#a87c45');
  b.rect(0, 2, w, 2, '#d9ad72');
  b.rect(0, 7, w, TS - 7, '#8a5c32');
  for (let x = 3; x < w; x += 6) b.rect(x, 8, 1, TS - 9, '#6d4726');
  return b.outline(P.ink!);
}

/* gamela de benzimento: a bacia de agua benta que cura o time.
   Duas velas nas pontas e agua parada no meio. */
export function gamela(): Buf {
  const b = new Buf(2 * TS, 2 * TS);
  b.rect(2, 10, 28, 18, P.rockD!);
  b.rect(3, 11, 26, 16, P.rock!);
  b.ellipse(16, 17, 12, 6, P.waterD!);
  b.ellipse(16, 17, 11, 5, P.water!);
  b.ellipse(13, 15, 5, 2, P.waterL!);
  for (const vx of [4, 27]) {                 // velas
    b.rect(vx - 1, 2, 3, 9, P.uiBg!);
    b.rect(vx - 1, 2, 1, 9, P.uiBg2!);
    b.ellipse(vx, 1, 2, 3, P.fireL!);
    b.set(vx, 0, P.white!);
  }
  return b.outline(P.ink!);
}

/* baú da benzedeira: onde ficam os Encantados que não couberam no time.
   Tampa arqueada com reforços de metal e um fecho dourado — pra não se
   confundir de longe com a estante ou com a gamela, que moram no mesmo
   cômodo. */
export function bau(): Buf {
  const w = 2 * TS;
  const b = new Buf(w, TS);
  b.rect(1, 8, w - 2, TS - 9, P.trunkD!);
  b.rect(2, 9, w - 4, TS - 11, P.trunk!);
  b.rect(2, 3, w - 4, 6, P.trunkD!);
  b.rect(3, 4, w - 6, 4, '#8a5c32');
  for (const x of [4, w / 2 - 1, w - 6]) b.rect(x, 3, 2, TS - 6, '#c9a227');
  b.rect(w / 2 - 3, 7, 6, 4, P.gold!);
  b.set(w / 2 - 1, 8, P.goldD!);
  return b.outline(P.ink!);
}

/* estante de potes e garrafadas */
export function estante(wTiles: number): Buf {
  const w = wTiles * TS;
  const b = new Buf(w, TS);
  b.rect(0, 0, w, TS, '#7d5730');
  b.rect(1, 1, w - 2, TS - 2, '#96693a');
  for (const y of [6, 13]) b.rect(1, y, w - 2, 2, '#6d4726');
  const r = rng(w * 7 + 3);
  for (let x = 3; x < w - 3; x += 5) {
    const cor = [P.fireL, P.tall, P.water, P.gold][(r() * 4) | 0] ?? P.gold!;
    b.rect(x, 2, 3, 4, cor); b.set(x + 1, 1, P.trunkD!);
    b.rect(x, 9, 3, 4, cor); b.set(x + 1, 8, P.trunkD!);
  }
  return b.outline(P.ink!);
}

/* mesa comprida */
export function mesa(wTiles: number): Buf {
  const w = wTiles * TS;
  const b = new Buf(w, TS);
  b.rect(0, 3, w, 5, '#b98a56');
  b.rect(0, 3, w, 2, '#e0bb85');
  b.rect(2, 8, 3, TS - 8, '#8a5c32');
  b.rect(w - 5, 8, 3, TS - 8, '#8a5c32');
  return b.outline(P.ink!);
}

/* Os três patuás em cima da mesa da Dona Firmina, esperando a escolha do
   inicial — nas mesmas cores dos tipos deles, na mesma ordem de INICIAIS em
   escolha.ts: Curupinho (planta), Boitatinha (fogo), Iarinha (água). Some do
   mapa assim que a escolha é feita (o objeto tem `seNao: 'escolheu_inicial'`
   no mapa, não aqui: este desenho não sabe nada do estado da partida). */
export function patuasNaMesa(wTiles: number): Buf {
  const w = wTiles * TS;
  const b = new Buf(w, TS);
  const meio = w / 2;
  const cores: readonly [string, string][] = [
    [P.tall!, P.tallD!], [P.fire!, P.fireD!], [P.water!, P.waterD!],
  ];
  cores.forEach(([cor, corD], i) => {
    const x = Math.round(meio + (i - 1) * 15);
    // saquinho amarrado: corpo arredondado pousado na mesa, cordao no colo
    b.ellipse(x, 5, 4, 4, corD);
    b.ellipse(x, 4, 4, 4, cor);
    b.rect(x - 3, 2, 6, 2, '#e8dcc0');
    b.set(x, 1, '#e8dcc0');
  });
  return b.outline(P.ink!);
}

/* Pote de barro esquecido: o que sobra numa ilhota, num canto de praia.
   Um tile so, e sempre com alguma coisa dentro na primeira vez. */
export function pote(vazio = false): Buf {
  const b = new Buf(TS, TS);
  const barro = vazio ? '#7a6250' : '#a8724a';
  const barroD = vazio ? '#54443a' : '#7a4c2e';
  b.ellipse(8, 12, 6, 4, barroD);
  b.ellipse(8, 10, 6, 5, barro);
  b.ellipse(6, 8, 2, 2, '#c99a6e');
  b.rect(4, 4, 8, 2, barroD);
  b.rect(5, 3, 6, 2, barro);
  if (!vazio) { b.rect(6, 5, 4, 2, P.ink2!); b.set(7, 5, P.gold!); }
  return b.outline(P.ink!);
}

/* ---- o farol da barra ----
   Torre listrada de vermelho e branco com a lanterna acesa no alto. E o fim
   do cais e o fim da Fase 1: o bicho que mora nela e o ultimo servico da
   regiao. Desenhada de baixo para cima em tiles, como as construcoes. */
export function farol(largTiles = 3, altTiles = 5): Buf {
  const w = largTiles * TS, h = altTiles * TS;
  const b = new Buf(w, h);
  const meio = w / 2;

  // corpo: mais estreito no alto, para a torre nao virar caixa
  const larguraEm = (y: number): number => {
    const t = y / h;                       // 0 no topo, 1 na base
    return Math.round(w * (0.42 + 0.28 * t));
  };
  const faixa = Math.max(5, Math.round(h / 9));
  for (let y = TS; y < h; y++) {
    const lw = larguraEm(y);
    const x0 = Math.round(meio - lw / 2);
    const vermelha = Math.floor((y - TS) / faixa) % 2 === 1;
    b.rect(x0, y, lw, 1, vermelha ? '#c4443a' : '#efe7d6');
    b.set(x0, y, vermelha ? '#8f2f28' : '#c8bfa8');            // sombra da beirada
    b.set(x0 + lw - 1, y, vermelha ? '#8f2f28' : '#c8bfa8');
  }

  // sacada e lanterna
  const sacadaW = larguraEm(TS) + 6;
  b.rect(Math.round(meio - sacadaW / 2), TS - 3, sacadaW, 3, P.ink2!);
  const lw = larguraEm(TS) - 2;
  b.rect(Math.round(meio - lw / 2), 4, lw, TS - 7, '#3a3346');
  b.rect(Math.round(meio - lw / 2) + 1, 6, lw - 2, TS - 11, P.gold!);
  b.ellipse(meio, 9, 4, 3, '#fff3b0');
  b.tri(Math.round(meio - lw / 2) - 1, 4, meio, 0, Math.round(meio + lw / 2) + 1, 4, '#8f2f28');

  // porta emperrada na base
  const dw = 10;
  b.rect(Math.round(meio - dw / 2), h - 14, dw, 14, P.trunkD!);
  b.rect(Math.round(meio - dw / 2) + 1, h - 13, dw - 2, 13, P.trunk!);
  b.set(Math.round(meio + dw / 2) - 3, h - 7, P.gold!);
  return b.outline(P.ink!);
}

/* Quantas contas a guia tem. Mora aqui porque e o desenho que manda: o
   colar tem cinco bolinhas, e a regra do jogo (cinco servicos) segue o
   desenho, nao o contrario. */
export const CONTAS_NA_GUIA = 5;

/* ---- o portao do terreiro: a guia de cinco contas ----
   Uma guia esticada de poste a poste. Cada desafio da regiao acende uma conta;
   com as cinco acesas a guia se abre. Desenhar as cinco desde o comeco e o que
   diz ao jogador, sem uma linha de texto, quanto falta. */
export function guia(larguraTiles: number, acesas = 0): Buf {
  const w = larguraTiles * TS;
  const b = new Buf(w, TS);

  for (const px of [0, w - 4]) {                 // postes
    b.rect(px, 2, 4, TS - 2, P.trunkD!);
    b.rect(px + 1, 2, 2, TS - 2, P.trunk!);
  }
  // o cordao cai um pouco no meio, como corda de verdade
  const meio = w / 2;
  const alturaEm = (x: number): number => {
    const t = (x - meio) / meio;
    return 6 + Math.round(2 * (1 - t * t));
  };
  for (let x = 4; x < w - 4; x++) {
    const y = alturaEm(x);
    b.set(x, y, '#e8dcc0');
    b.set(x, y + 1, '#b6a887');
  }
  // cinco contas igualmente espacadas ao longo do cordao
  for (let i = 0; i < CONTAS_NA_GUIA; i++) {
    const x = Math.round(4 + ((w - 8) * (i + 0.5)) / CONTAS_NA_GUIA);
    const y = alturaEm(x) + 1;
    if (i < acesas) {
      b.ellipse(x, y, 4, 4, P.waterL!);      // brilho da conta acesa
      b.ellipse(x, y, 3, 3, P.waterD!);
      b.ellipse(x, y, 2, 2, P.water!);
      b.set(x - 1, y - 1, P.foam!);
    } else {
      b.ellipse(x, y, 3, 3, P.ink2!);
      b.ellipse(x, y, 2, 2, '#4a4258');
    }
  }
  return b;
}
