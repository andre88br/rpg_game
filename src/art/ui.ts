/* Componentes de interface: caixas, barras de HP/XP, paineis de combatente.
   Tudo em pixel, no mesmo grid da arte. */
import { Buf } from '../core/buf.ts';
import { P } from './palette.ts';
import { texto, larguraTexto } from './font.ts';

/* caixa de dialogo / painel, com borda dupla estilo cartucho */
export interface OpcoesCaixa { fundo?: string; borda?: string; borda2?: string; sombra?: boolean }

export function caixa(w: number, h: number, opt: OpcoesCaixa = {}): Buf {
  const { fundo = P.uiBg, borda = P.uiInk, borda2 = P.uiAcc, sombra = true } = opt;
  const b = new Buf(w, h);
  if (sombra) { b.rect(2, 2, w - 2, h - 2, P.ink2); }
  b.rect(0, 0, w - 2, h - 2, borda);
  b.rect(1, 1, w - 4, h - 4, borda2);
  b.rect(2, 2, w - 6, h - 6, fundo);
  // cantinhos chanfrados
  for (const [x, y] of [[0, 0], [w - 3, 0], [0, h - 3], [w - 3, h - 3]]) b.apagar(x, y);
  return b;
}

/* barra generica com moldura */
export function barra(w: number, h: number, pct: number, cor: string, fundo: string = P.barBack!): Buf {
  const b = new Buf(w, h);
  b.rect(0, 0, w, h, P.uiInk);
  b.rect(1, 1, w - 2, h - 2, fundo);
  const fill = Math.max(0, Math.min(w - 2, Math.round((w - 2) * pct)));
  if (fill > 0) {
    b.rect(1, 1, fill, h - 2, cor);
    b.rect(1, 1, fill, 1, clarear(cor));
  }
  return b;
}

function clarear(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + 50);
  const g = Math.min(255, ((n >> 8) & 255) + 50);
  const bl = Math.min(255, (n & 255) + 50);
  return '#' + [r, g, bl].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function corHP(pct: number): string {
  return pct > 0.5 ? P.hpGreen : pct > 0.2 ? P.hpYellow : P.hpRed;
}

/* painel do combatente. lado 'inimigo' nao mostra XP nem numeros de HP. */
export interface OpcoesPainel {
  inimigo?: boolean; xpPct?: number; largura?: number; status?: string | null;
}

export function painelCombatente(nome: string, nivel: number, hpAtual: number,
                                 hpMax: number, opt: OpcoesPainel = {}): Buf {
  const { inimigo = false, xpPct = 0, largura = 100, status = null } = opt;
  const h = inimigo ? 24 : 33;
  const b = caixa(largura, h);
  const pct = hpAtual / hpMax;

  // linha 1: nome + nivel
  texto(b, nome, 6, 5, P.uiInk);
  const lvl = 'NV' + nivel;
  texto(b, lvl, largura - 8 - larguraTexto(lvl), 5, P.uiInk);

  // linha 2: HP
  texto(b, 'HP', 6, 14, P.uiAccD);
  b.blit(barra(largura - 28, 5, pct, corHP(pct)), 20, 14);

  if (!inimigo) {
    // linha 3: XP a esquerda, numeros de HP a direita
    texto(b, 'XP', 6, 22, P.xp);
    b.blit(barra(28, 3, xpPct, P.xp), 20, 23);
    const s = `${hpAtual}/${hpMax}`;
    texto(b, s, largura - 8 - larguraTexto(s), 22, P.uiInk);
  }
  if (status) { // etiqueta de estado alterado, no canto inferior esquerdo
    const sw = larguraTexto(status) + 4;
    b.rect(5, h - 12, sw + 2, 11, P.uiInk);
    b.rect(6, h - 11, sw, 9, statusCor(status));
    texto(b, status, 8, h - 10, P.uiInk);
  }
  return b;
}

export function statusCor(s: string): string {
  return ({ 'QMD': P.fire, 'PAR': P.bolt, 'DRM': P.dark, 'ENC': '#d060c0', 'ENV': '#7fbf3f' } as Record<string, string>)[s] || P.uiAccD!;
}

/* menu de comandos em grade 2x2 com cursor */
export function menuGrade(itens: readonly string[], larg: number, alt: number,
                          sel = 0, opt: { cols?: number } = {}): Buf {
  const { cols = 2 } = opt;
  const b = caixa(larg, alt);
  const cw = (larg - 12) / cols;
  const rows = Math.ceil(itens.length / cols);
  const rh = (alt - 12) / rows;
  itens.forEach((it, i) => {
    const cx = 8 + (i % cols) * cw;
    const cy = 7 + Math.floor(i / cols) * rh;
    if (i === sel) texto(b, '=', cx - 6, cy, P.uiAccD);   // cursor seta
    texto(b, it, cx, cy, P.uiInk);
  });
  return b;
}

/* etiqueta de tipo colorida */
export function etiquetaTipo(nome: string, cor: string, corD: string): Buf {
  const w = larguraTexto(nome) + 8;
  const b = new Buf(w, 11);
  b.rect(0, 0, w, 11, corD);
  b.rect(1, 1, w - 2, 9, cor);
  b.rect(1, 1, w - 2, 3, clarear(cor));
  texto(b, nome, 4, 2, P.uiInk);
  return b;
}

/* caixa de dialogo com texto ja quebrado e indicador de continuar */
export interface OpcoesDialogo { falante?: string | null; seta?: boolean }

export function caixaDialogo(larg: number, linhas: readonly string[],
                             opt: OpcoesDialogo = {}): Buf {
  const { falante = null, seta = true } = opt;
  const altCaixa = 14 + linhas.length * 10;
  const topo = falante ? 11 : 0;            // espaco reservado para a etiqueta
  const b = new Buf(larg, altCaixa + topo);

  const cx = caixa(larg, altCaixa);
  linhas.forEach((l, i) => texto(cx, l, 8, 8 + i * 10, P.uiInk));
  if (seta) texto(cx, 'v', larg - 14, altCaixa - 12, P.uiAccD);
  b.blit(cx, 0, topo);

  if (falante) {  // etiqueta com o nome, encaixada na borda de cima
    const w = larguraTexto(falante) + 10;
    const tag = caixa(w, 17, { fundo: P.uiAcc, borda2: P.uiAccD });
    texto(tag, falante, 5, 5, P.uiInk);
    b.blit(tag, 6, 0);
  }
  return b;
}

/* atalho para escrever direto numa caixa ja montada */
export function textoNaCaixa(b: Buf, s: string, x: number, y: number, cor: string = P.uiInk!): void {
  texto(b, s, x, y, cor);
}
