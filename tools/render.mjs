/* Gera os PNGs dos esboços em mockups/img/ */
import { writeFileSync, mkdirSync } from 'node:fs';
import { bufToPNG } from './png.mjs';
import * as S from '../src/esbocos/telas.ts';
import * as CR from '../src/art/creatures.ts';
import { ELENCO as CAST, ESTILOS, folhaPersonagem } from '../src/art/people.ts';
import { medalha, MEDALHAS } from '../src/art/badges.ts';
import { Buf, escalar } from '../src/core/buf.ts';
import { texto as text, larguraTexto as textWidth } from '../src/art/font.ts';
import { P } from '../src/art/palette.ts';
import * as T from '../src/art/tiles.ts';
import * as UI from '../src/art/ui.ts';

mkdirSync(new URL('../esbocos/img/', import.meta.url), { recursive: true });
const out = (nome, buf, escala = 3, fundo = null) => {
  const url = new URL(`../esbocos/img/${nome}.png`, import.meta.url);
  writeFileSync(url, bufToPNG(buf, escala, fundo));
  console.log(`  ${nome}.png  ${buf.w * escala}x${buf.h * escala}`);
};

/* folha das criaturas com nome e linha evolutiva */
function folhaCriaturas() {
  const linhas = [
    { base: CR.boitatinha(), evo: CR.boitatao(), nomes: ['BOITATINHA', 'BOITATÃO'], tipo: 'FOGO', cor: P.fire },
    { base: CR.iarinha(),    evo: CR.iaraMae(),  nomes: ['IARINHA', 'IARA-MÃE'],    tipo: 'ÁGUA', cor: P.water },
    { base: CR.curupinho(),  evo: CR.curupira(), nomes: ['CURUPINHO', 'CURUPIRÁ'],  tipo: 'PLANTA', cor: P.tree },
  ];
  const b = new Buf(200, 24 + 72 * linhas.length + 8);
  b.rect(0, 0, b.w, b.h, P.uiBg);
  text(b, 'OS TRÊS INICIAIS', 8, 6, P.uiInk);
  linhas.forEach((l, i) => {
    const y = 24 + i * 72;
    b.rect(6, y - 4, b.w - 12, 68, P.uiBg2);
    b.rect(6, y - 4, 3, 68, l.cor);
    // nomes na faixa de cima, sprites abaixo — senao o sprite cobre o texto
    text(b, l.nomes[0], 14, y, P.uiInk);
    text(b, l.nomes[1], 96, y, P.uiInk);
    text(b, l.tipo, b.w - 12 - textWidth(l.tipo), y, l.cor);
    b.blit(l.base, 18, y + 20);
    b.blit(l.evo, 96, y + 14);
    text(b, '>', 82, y + 34, P.uiAccD);
  });
  return b;
}

/* folha das 8 medalhas */
function folhaMedalhas() {
  const b = new Buf(240, 30 + MEDALHAS.length * 22);
  b.rect(0, 0, b.w, b.h, P.uiBg);
  text(b, 'AS OITO MEDALHAS', 8, 8, P.uiInk);
  MEDALHAS.forEach((m, i) => {
    const y = 26 + i * 22;
    b.rect(6, y, b.w - 12, 20, i % 2 ? P.uiBg2 : P.uiBg);
    b.blit(medalha(m.id, 16), 10, y + 2);
    text(b, m.nome, 32, y + 2, P.uiInk);
    text(b, m.cidade, 100, y + 2, P.uiInk);
    text(b, 'LÍDER ' + m.lider, 32, y + 11, '#7a6f58');
    text(b, 'DOM: ' + m.dom, 132, y + 11, '#7a6f58');
  });
  return b;
}

/* folha do elenco */
function folhaElenco() {
  const nomes = [['taina','TAINÁ'],['bento','BENTO'],['zeca','ZECA'],['firmina','FIRMINA'],
                 ['mariana','MARIANA'],['tie','TIÊ'],['pescador','PESCADOR'],['anhanga','ANHANGÁ']];
  const CW = 58;
  const b = new Buf(nomes.length * CW, 56);
  b.rect(0, 0, b.w, b.h, P.uiBg);
  nomes.forEach(([k, n], i) => {
    if (i % 2) b.rect(i * CW, 0, CW, 56, P.uiBg2);
    b.blit(escalar(CAST[k](), 1), i * CW + (CW - 16) / 2, 8);
    text(b, n, i * CW + (CW - textWidth(n)) / 2, 40, P.uiInk);
  });
  return b;
}

/* folha de tiles do cenario */
function folhaTiles() {
  const itens = [['GRAMA', T.tileGrama(1)], ['MATO ALTO', T.tileMatoAlto(2)], ['ÁGUA', T.tileAgua(3)],
                 ['AREIA', T.tileAreia(4)], ['CAMINHO', T.tileCaminho(5)], ['ÁRVORE', T.tileArvore(6)],
                 ['FLORES', T.tileFlores(7)], ['PEDRA', T.tilePedra(8)], ['ROCHA', T.tileRocha(9)]];
  const CW = 60;
  const b = new Buf(itens.length * CW, 44);
  b.rect(0, 0, b.w, b.h, P.uiBg);
  itens.forEach(([n, t], i) => {
    if (i % 2) b.rect(i * CW, 0, CW, 44, P.uiBg2);
    b.blit(t, i * CW + (CW - 16) / 2, 5);
    b.frame(i * CW + (CW - 16) / 2 - 1, 4, 18, 18, P.uiBg3);
    text(b, n, i * CW + (CW - textWidth(n)) / 2, 28, P.uiInk);
  });
  return b;
}

console.log('gerando esboços...');
out('01-titulo',        S.telaTitulo());
out('02-mundo',         S.telaMundo());
out('03-dialogo',       S.telaDialogo());
out('04-batalha',       S.telaBatalha({ modo: 'comando' }));
out('05-batalha-golpes',S.telaBatalha({ modo: 'golpes' }));
out('06-mapa',          S.telaMapa(), 3, P.uiBg);
out('11-celular',      S.telaCelular(), 2, '#0a0810');
out('07-criaturas',     folhaCriaturas(), 3);
out('08-medalhas',      folhaMedalhas(), 3);
out('09-elenco',        folhaElenco(), 3);
out('10-tiles',         folhaTiles(), 3);

/* folha das poses do jogador: quatro direções x três quadros */
function folhaPoses() {
  const dirs = ['baixo', 'cima', 'esq', 'dir'];
  const CEL = 22;
  const b = new Buf(64 + dirs.length * 3 * CEL, 18 + 30);
  b.rect(0, 0, b.w, b.h, P.uiBg);
  text(b, 'TAINÁ', 6, 20, P.uiInk);
  dirs.forEach((d, i) => text(b, d, 64 + i * 3 * CEL + 8, 5, P.uiAccD));
  const f = folhaPersonagem(ESTILOS.taina);
  dirs.forEach((d, i) => f[d].forEach((buf, q) => {
    const x = 64 + (i * 3 + q) * CEL + 3;
    b.rect(x - 3, 16, 20, 24, (i + q) % 2 ? P.uiBg2 : P.uiBg3);
    b.blit(buf, x, 18);
  }));
  return b;
}
out('12-poses', folhaPoses(), 3);
console.log('pronto.');
