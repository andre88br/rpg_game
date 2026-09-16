/* Telas completas do jogo, 240x160 (mesma proporcao que vai rodar no
   navegador, ampliada por um numero inteiro). */
import { Buf, escalar } from '../core/buf.ts';
import { P, TIPOS } from '../art/palette.ts';
import type { Tipo } from '../art/palette.ts';
import { texto, larguraTexto, quebrar } from '../art/font.ts';
import * as T from '../art/tiles.ts';
import { ELENCO } from '../art/people.ts';
import * as CR from '../art/creatures.ts';
import * as UI from '../art/ui.ts';
import { medalha, fileiraMedalhas, MEDALHAS } from '../art/badges.ts';

export const W = 240, H = 160, TS = 16;

/* ---------- cenario base de PORTO IARA (15 x 10 tiles) ---------- */
export function mapaPortoIara(): Buf {
  const b = new Buf(W, H);
  const put = (tile: Buf, tx: number, ty: number) => b.blit(tile, tx * TS, ty * TS);

  // grama em tudo, com variacao por tile para nao ficar repetitivo
  for (let ty = 0; ty < 10; ty++)
    for (let tx = 0; tx < 15; tx++) put(T.tileGrama(tx * 31 + ty * 17 + 3), tx, ty);

  // agua nas duas ultimas fileiras + faixa de areia
  for (let tx = 0; tx < 15; tx++) {
    put(T.tileAreia(tx * 5 + 2), tx, 8);
    put(T.tileAgua(tx * 13 + 7), tx, 9);
  }
  // recorte de areia/agua: a agua sobe em degrau no meio
  for (let tx = 9; tx < 15; tx++) put(T.tileAgua(tx * 9 + 1), tx, 8);

  // caminho de terra: desce do topo e vira para o ginasio
  for (let ty = 0; ty < 6; ty++) put(T.tileCaminho(ty * 7 + 1), 7, ty);
  for (let tx = 3; tx < 12; tx++) put(T.tileCaminho(tx * 3 + 9), tx, 4);

  // arvores nas bordas
  for (let tx = 0; tx < 15; tx++) if (tx !== 7) put(T.tileArvore(tx * 11), tx, 0);
  for (const [tx, ty] of [[0, 1], [0, 2], [14, 1], [14, 2], [0, 6], [14, 6], [13, 2]])
    put(T.tileArvore(tx * 7 + ty * 3), tx, ty);

  // mato alto: onde aparecem os Encantados selvagens
  for (const [tx, ty] of [[1, 5], [2, 5], [3, 5], [1, 6], [2, 6], [3, 6], [2, 7], [1, 7]])
    put(T.tileMatoAlto(tx * 5 + ty * 13), tx, ty);

  // flores e pedras decorativas
  put(T.tileFlores(3, '#f2d24b'), 5, 2);
  put(T.tileFlores(9, '#e07ab0'), 11, 6);
  put(T.tilePedra(4), 12, 5);

  // casa do pescador e mercado
  const casa = T.construcao(3, 2, { roof: P.roof!, roofD: P.roofD!, roofL: P.roofL! });
  b.blit(casa, 2 * TS, 1 * TS + 4);
  const loja = T.construcao(3, 2, { roof: '#3f8f6f', roofD: '#2b6b52', roofL: '#5fb894' });
  b.blit(loja, 10 * TS, 1 * TS + 4);

  // GINASIO DE PORTO IARA: maior, telhado azul, fica de frente para o mar
  const gin = T.construcao(4, 3, {
    roof: P.gymRoof!, roofD: P.gymRoofD!, roofL: P.gymRoofL!,
    sign: 'GINÁSIO', signColor: P.uiAcc!,
  });
  const gx = 5 * TS, gy = 5 * TS - 4;
  // mastro e bandeira acima da cumeeira, fora do telhado
  b.rect(gx + 12, gy - 20, 1, 22, P.ink!);
  b.tri(gx + 13, gy - 20, gx + 27, gy - 15, gx + 13, gy - 10, P.water!);
  b.tri(gx + 13, gy - 18, gx + 23, gy - 15, gx + 13, gy - 12, P.waterL!);
  b.blit(gin, gx, gy);

  // pier de madeira entrando no mar
  b.rect(7 * TS, 8 * TS + 6, 18, 26, '#8a5c32');
  for (let y = 0; y < 26; y += 4) b.rect(7 * TS, 8 * TS + 6 + y, 18, 1, '#6d4726');
  b.rect(7 * TS - 1, 8 * TS + 6, 1, 26, P.trunkD!);
  b.rect(7 * TS + 18, 8 * TS + 6, 1, 26, P.trunkD!);

  return b;
}

/* ---------- 1. MUNDO: andando por Porto Iara ---------- */
export function telaMundo(opt: { banner?: boolean; guarda?: boolean } = {}): Buf {
  const { banner = true, guarda = true } = opt;
  const b = mapaPortoIara();

  // guarda bloqueando a porta do ginasio (some quando a tarefa termina)
  if (guarda) {
    // barreira de corda atravessando a entrada: le-se na hora que esta fechado
    const bx0 = 5 * TS + 8, bx1 = 5 * TS + 56, by = 5 * TS + 38;
    for (const px of [bx0, bx1]) {
      b.rect(px, by, 3, 12, P.trunkD!);
      b.rect(px + 1, by, 1, 12, P.trunk!);
    }
    b.rect(bx0, by + 2, bx1 - bx0 + 3, 2, '#c93f3f');
    b.rect(bx0, by + 2, bx1 - bx0 + 3, 1, '#e86a5a');
    for (let px = bx0 + 4; px < bx1; px += 8) b.rect(px, by + 1, 3, 4, P.uiBg!);
    b.blit(ELENCO.guarda(), 5 * TS + 24, 5 * TS + 26);
  }

  // pescador perto do pier
  b.blit(ELENCO.pescador(), 9 * TS + 4, 7 * TS + 6);
  // NPC de rua
  b.blit(ELENCO.firmina(), 11 * TS + 2, 3 * TS + 8);

  // jogador no caminho, indo em direcao ao ginasio
  b.blit(ELENCO.taina(), 7 * TS + 4, 4 * TS + 2);

  // moitas soltas e placa
  b.blit(T.placa(), 4 * TS + 2, 4 * TS - 14);

  // faixa com o nome da cidade, como aparece ao entrar
  if (banner) {
    const nome = 'PORTO IARA';
    const cx = UI.caixa(larguraTexto(nome) + 20, 20);
    texto(cx, nome, 10, 6, P.uiInk!);
    b.blit(cx, 6, 6);
    // medalhas conquistadas, no canto oposto
    const fm = fileiraMedalhas(0, 10, 2);
    const cm = UI.caixa(fm.w + 12, 20);
    cm.blit(fm, 6, 5);
    b.blit(cm, W - cm.w - 6, 6);
  }
  return b;
}

/* ---------- 2. DIÁLOGO + TAREFA ---------- */
export function telaDialogo(): Buf {
  const b = mapaPortoIara();
  // os dois ficam no caminho, acima da caixa de dialogo, para nao sumirem
  b.blit(ELENCO.pescador(), 9 * TS + 4, 4 * TS + 2);
  b.blit(ELENCO.taina(), 11 * TS, 4 * TS + 2);

  const linhas = quebrar('Sem as redes ninguém pesca hoje, moça. Dizem que um Encantado levou as três.', 200);
  const cx = UI.caixaDialogo(W - 12, linhas, { falante: 'MESTRE DO PORTO' });
  b.blit(cx, 6, H - cx.h - 6);

  // rastreador de tarefa no canto superior direito
  const tw = 100;
  const t = UI.caixa(tw, 34);
  texto(t, 'TAREFA', 6, 5, P.uiAccD!);
  texto(t, '1/3', tw - 9 - larguraTexto('1/3'), 5, P.uiInk!);
  texto(t, 'REDES PERDIDAS', 6, 15, P.uiInk!);
  t.blit(UI.barra(tw - 14, 4, 1 / 3, P.uiAcc!), 6, 25);
  b.blit(t, W - tw - 6, 6);
  return b;
}

/* ---------- 3. BATALHA ---------- */
function fundoBatalha(): Buf {
  const b = new Buf(W, H);
  // ceu em faixas
  const ceu = ['#8fd0f0', '#a3daf5', '#b8e4f8', '#cdeefb'];
  for (let i = 0; i < 4; i++) b.rect(0, i * 8, W, 8, ceu[i]);
  b.rect(0, 32, W, 30, '#d8f0fb');
  // mar ao fundo
  b.rect(0, 52, W, 14, P.waterL!);
  for (let x = 0; x < W; x += 7) b.rect(x, 56, 4, 1, P.foam!);
  b.rect(0, 62, W, 6, P.water!);
  // areia
  b.rect(0, 66, W, H - 66, P.sand!);
  for (let i = 0; i < 260; i++) b.set((i * 97) % W, 68 + ((i * 53) % (H - 70)), P.sandD!);
  return b;
}

function plataforma(b: Buf, cx: number, cy: number, rx: number, ry: number): void {
  // disco de areia com aro escuro, para o bicho nao parecer flutuando
  b.ellipse(cx, cy + 1, rx, ry, '#b59a63');
  b.ellipse(cx, cy, rx - 1, ry - 1, '#e0caa0');
  b.ellipse(cx, cy - 1, rx - 4, ry - 2, '#f2e3bd');
  for (let i = 0; i < 14; i++) b.set(cx - rx + ((i * 37) % (rx * 2)), cy + ((i * 13) % 3) - 1, '#c9ad76');
}

export function telaBatalha(opt: { modo?: 'comando' | 'golpes' } = {}): Buf {
  const { modo = 'comando' } = opt; // 'comando' | 'golpes'
  const b = fundoBatalha();

  // plataformas
  plataforma(b, 182, 76, 36, 7);
  plataforma(b, 58, 104, 42, 8);

  // combatentes, em dobro do tamanho nativo (32 -> 64), como num GBA
  b.blit(escalar(CR.boitatinha(), 2), 150, 12);
  b.blit(escalar(CR.iarinha(), 2), 26, 40);

  // paineis
  b.blit(UI.painelCombatente('BOITATINHA', 9, 18, 30, { inimigo: true, largura: 104 }), 8, 8);
  b.blit(UI.painelCombatente('IARINHA', 11, 42, 50, { xpPct: 0.55, largura: 104 }), 130, 74);

  if (modo === 'comando') {
    const cx = UI.caixa(146, 50);
    const linhas = quebrar('O que IARINHA vai fazer?', 128);
    linhas.forEach((l, i) => texto(cx, l, 8, 10 + i * 11, P.uiInk!));
    b.blit(cx, 0, H - 50);
    b.blit(UI.menuGrade(['LUTAR', 'PATUÁ', 'TIME', 'FUGIR'], 96, 50, 0), W - 96, H - 50);
  } else {
    // lista de golpes + ficha do golpe selecionado
    b.blit(UI.menuGrade(['JATO D\'ÁGUA', 'INVESTIDA', 'BOLHA', 'CANTO D\'IARA'], 164, 50, 0), 0, H - 50);
    const ficha = UI.caixa(78, 50);
    ficha.blit(UI.etiquetaTipo('ÁGUA', TIPOS.agua.cor, TIPOS.agua.corD), 6, 5);
    texto(ficha, 'PP  15/15', 6, 20, P.uiInk!);
    texto(ficha, 'POT 40', 6, 30, P.uiInk!);
    b.blit(ficha, W - 78, H - 50);
    // aviso de eficacia
    const av = UI.caixa(104, 16, { fundo: P.uiAcc! });
    texto(av, 'É SUPER EFICAZ!', 6, 4, P.uiInk!);
    b.blit(av, 8, H - 68);
  }
  return b;
}

/* ---------- 4. TELA DE TÍTULO ---------- */
export function telaTitulo(): Buf {
  const b = new Buf(W, H);
  // ceu noturno com estrelas e lua
  for (let y = 0; y < H; y++) {
    const t = y / H;
    b.rect(0, y, W, 1, t < 0.55 ? mistura('#1b1338', '#4a2f6b', t / 0.55) : mistura('#4a2f6b', '#a05a4a', (t - 0.55) / 0.45));
  }
  for (let i = 0; i < 70; i++) {
    const x = (i * 71) % W, y = (i * 37) % 80;
    b.set(x, y, i % 5 === 0 ? P.white! : '#cdbff0');
  }
  b.circle(206, 26, 11, '#f5eec0');

  // silhueta de mata no horizonte
  for (let x = 0; x < W; x += 9) {
    const h = 20 + ((x * 13) % 16);
    b.tri(x - 6, H - 34, x + 2, H - 34 - h, x + 10, H - 34, '#16221c');
    b.ellipse(x + 2, H - 34 - h / 2, 7, h / 2, '#1b2b22');
  }
  b.rect(0, H - 36, W, 36, '#101a14');

  // logotipo
  const t1 = new Buf(11 * 6, 9);
  texto(t1, 'ENCANTADOS', 0, 1, P.gold!);
  const logo = escalar(t1, 3);
  logo.outline(P.ink!);
  b.blit(logo, (W - logo.w) / 2, 26);

  const t2 = new Buf(30 * 6, 9);
  texto(t2, 'A TRILHA DAS OITO MEDALHAS', 0, 1, '#f0e6c8');
  const sub = escalar(t2, 1);
  b.blit(sub, (W - larguraTexto('A TRILHA DAS OITO MEDALHAS')) / 2, 62);

  // os tres iniciais enfileirados na frente da mata
  b.blit(CR.curupinho(), 24, H - 66);
  b.blit(CR.boitatinha(), 104, H - 70);
  b.blit(CR.iarinha(), 184, H - 66);

  // chamada
  const msg = 'APERTE   PARA COMEÇAR';
  const mx = (W - larguraTexto(msg)) / 2;
  texto(b, msg, mx, H - 26, P.white!, { sombra: P.ink! });
  // botao A desenhado no meio da frase
  const bx = mx + 6 * 6;
  b.circle(bx + 4, H - 23, 6, P.uiAcc!);
  b.circle(bx + 4, H - 23, 5, '#f0d878');
  texto(b, 'A', bx + 2, H - 26, P.uiInk!);

  const rod = 'ENCANTADOS 2026';
  texto(b, rod, (W - larguraTexto(rod)) / 2, H - 11, '#7f749c');
  return b;
}

function mistura(a: string, b2: string, t: number): string {
  t = Math.max(0, Math.min(1, t));
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b2.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
  return '#' + [r, g, bl].map(v => v.toString(16).padStart(2, '0')).join('');
}

/* ---------- 5. MAPA DA JORNADA ---------- */
export function telaMapa(): Buf {
  const MH = 292;
  const b = new Buf(W, MH);
  b.rect(0, 0, W, MH, '#e8d8b0');
  for (let i = 0; i < 900; i++) b.set((i * 131) % W, (i * 73) % MH, '#dcc99c'); // pergaminho
  b.frame(2, 2, W - 4, MH - 4, '#a8874f');
  b.frame(4, 4, W - 8, MH - 8, '#c9a870');

  const titulo = 'A TRILHA DAS OITO MEDALHAS';
  texto(b, titulo, (W - larguraTexto(titulo)) / 2, 12, '#6b4a22');

  const cidades: { n: string; t: Tipo | null; dom: string }[] = [
    { n: 'VILA AURORA',       t: null,     dom: '(INÍCIO - SEM GINÁSIO)' },
    { n: 'PORTO IARA',        t: 'agua',   dom: 'NADAR' },
    { n: 'MATA DO CURUPIRA',  t: 'planta', dom: 'CORTAR CIPÓ' },
    { n: 'SERRA BOITATÁ',     t: 'fogo',   dom: 'TOCHA' },
    { n: 'CAMPO DO SACI',     t: 'vento',  dom: 'RAJADA' },
    { n: 'ALDEIA TUPÃ',       t: 'raio',   dom: 'FAÍSCA' },
    { n: 'MINAS DA CAIPORA',  t: 'terra',  dom: 'ESCAVAR' },
    { n: 'BAIRRO DA CUCA',    t: 'sombra', dom: 'VISÃO NOTURNA' },
    { n: 'CIDADE DO SOL',     t: 'luz',    dom: 'PRISMA' },
  ];

  const dy = 23, y0 = MH - 26, x0 = 22;
  const xDe = (i: number) => x0 + (i % 2 === 0 ? 0 : 7);

  // trilha ligando as cidades, serpenteando de baixo para cima
  for (let i = 0; i < cidades.length - 1; i++) {
    const y = y0 - i * dy, x = xDe(i), nx = xDe(i + 1);
    for (let k = 0; k < dy; k++) {
      const px = Math.round(x + (nx - x) * (k / dy));
      b.set(px, y - k, '#8f7140'); b.set(px + 1, y - k, '#c9a870');
    }
  }

  cidades.forEach((c, i) => {
    const y = y0 - i * dy, x = xDe(i);
    const cor = c.t ? TIPOS[c.t].cor : '#b0a48c';
    const corD = c.t ? TIPOS[c.t].corD : '#7f745f';

    b.circle(x, y, 5, corD); b.circle(x, y, 4, cor); b.set(x - 1, y - 2, P.white!);

    texto(b, c.n, x + 13, y - 8, '#3a2a14');
    if (c.t) {
      b.blit(UI.etiquetaTipo(TIPOS[c.t].nome, cor, corD), x + 15 + larguraTexto(c.n), y - 10);
      b.blit(medalha(MEDALHAS[i - 1].id, 14), W - 24, y - 7);
      texto(b, 'DOM: ' + c.dom, x + 13, y + 2, '#7a5f38');
    } else {
      texto(b, c.dom, x + 13, y + 2, '#7a5f38');
    }
  });

  // torneio final, acima da ultima cidade
  const topoTrilha = y0 - 8 * dy;
  const bw = 184, bx = (W - bw) / 2, by = topoTrilha - 44;
  for (let k = 0; k < 18; k++) { // trecho de trilha ate o torneio
    b.set(xDe(8), topoTrilha - 8 - k, '#8f7140');
    b.set(xDe(8) + 1, topoTrilha - 8 - k, '#c9a870');
  }
  const cxT = UI.caixa(bw, 32, { fundo: P.gold!, borda2: P.goldD! });
  texto(cxT, 'TORNEIO CÍRCULO DOURADO', 8, 6, P.uiInk!);
  texto(cxT, '6 ADVERSÁRIOS SEGUIDOS', 8, 17, '#6b5210');
  b.blit(cxT, bx, by);
  b.blit(medalha('aurora', 14), bx - 18, by + 9);
  return b;
}

/* ---------- 6. CELULAR (retrato) com controles de toque ---------- */
function retanguloArredondado(b: Buf, x: number, y: number, w: number, h: number, r: number, cor: string): void {
  b.rect(x + r, y, w - r * 2, h, cor);
  b.rect(x, y + r, w, h - r * 2, cor);
  for (const [cx, cy] of [[x + r, y + r], [x + w - r - 1, y + r],
                          [x + r, y + h - r - 1], [x + w - r - 1, y + h - r - 1]])
    b.circle(cx, cy, r, cor);
}

function botao(b: Buf, cx: number, cy: number, r: number, rotulo: string, cor: string, corD: string): void {
  b.circle(cx, cy + 2, r, '#0c0a12');       // sombra
  b.circle(cx, cy, r, corD);
  b.circle(cx, cy - 1, r - 2, cor);
  b.ellipse(cx, cy - r / 2, r - 4, 2, clarearHex(cor));
  texto(b, rotulo, cx - 2, cy - 3, P.ink!);
}

function clarearHex(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map(v => Math.min(255, v + 45).toString(16).padStart(2, '0')).join('');
}

export function telaCelular(): Buf {
  const CW = 268, CH = 486;
  const b = new Buf(CW, CH);

  // corpo do aparelho
  retanguloArredondado(b, 0, 0, CW, CH, 18, '#2b2733');
  retanguloArredondado(b, 3, 3, CW - 6, CH - 6, 16, '#15121c');
  // alto-falante
  b.rect(CW / 2 - 16, 13, 32, 4, '#2b2733');
  b.circle(CW / 2 + 28, 15, 2, '#2b2733');

  // tela
  retanguloArredondado(b, 10, 24, CW - 20, CH - 48, 8, '#07060b');

  // o jogo, 240x160, encaixado no topo da tela
  const jogo = telaMundo({ banner: true });
  b.blit(jogo, 14, 40);
  b.frame(13, 39, 242, 162, '#3a3547');

  // barra de estado do jogo, logo abaixo do quadro
  const barraY = 210;
  const cxInfo = UI.caixa(240, 22);
  texto(cxInfo, 'TAINÁ', 6, 7, P.uiInk!);
  texto(cxInfo, 'PORTO IARA', 78, 7, P.uiInk!);
  cxInfo.blit(fileiraMedalhas(0, 9, 2), 146, 6);
  b.blit(cxInfo, 14, barraY);

  // ---- controles de toque ----
  const areaY = 250;
  texto(b, 'CONTROLES DE TOQUE', (CW - larguraTexto('CONTROLES DE TOQUE')) / 2, areaY, '#5f5870');

  // direcional: cruz de 3x3 com almofadas de 34px
  const dx = 74, dy = 340, pad = 34;
  const setas: [number, number, string][] = [[0, -1, '^'], [0, 1, 'v'], [-1, 0, '<'], [1, 0, '>']];
  retanguloArredondado(b, dx - pad * 1.5, dy - pad / 2, pad * 3, pad, 6, '#221e2c');
  retanguloArredondado(b, dx - pad / 2, dy - pad * 1.5, pad, pad * 3, 6, '#221e2c');
  for (const [ox, oy, seta] of setas) {
    const px = dx + ox * pad, py = dy + oy * pad;
    retanguloArredondado(b, px - pad / 2 + 2, py - pad / 2 + 2, pad - 4, pad - 4, 5, '#3a3547');
    retanguloArredondado(b, px - pad / 2 + 2, py - pad / 2 + 2, pad - 4, pad - 6, 5, '#4d4661');
    // triangulo da seta
    if (seta === '^') b.tri(px - 6, py + 4, px, py - 5, px + 6, py + 4, '#cdc6de');
    if (seta === 'v') b.tri(px - 6, py - 4, px, py + 5, px + 6, py - 4, '#cdc6de');
    if (seta === '<') b.tri(px + 4, py - 6, px - 5, py, px + 4, py + 6, '#cdc6de');
    if (seta === '>') b.tri(px - 4, py - 6, px + 5, py, px - 4, py + 6, '#cdc6de');
  }
  retanguloArredondado(b, dx - 8, dy - 8, 16, 16, 4, '#3a3547');

  // botoes A e B
  botao(b, 214, 318, 22, 'B', '#9a6fd0', '#6a4a9a');
  botao(b, 178, 358, 22, 'A', P.uiAcc!, P.uiAccD!);
  texto(b, 'A = FALAR / CONFIRMAR', 14, 404, '#7f7794');
  texto(b, 'B = CORRER / VOLTAR', 14, 416, '#7f7794');

  // botao de menu
  retanguloArredondado(b, CW - 66, 404, 52, 22, 6, '#3a3547');
  texto(b, 'MENU', CW - 58, 411, '#cdc6de');

  // barra inferior do aparelho
  b.rect(CW / 2 - 34, CH - 18, 68, 4, '#3a3547');
  return b;
}
