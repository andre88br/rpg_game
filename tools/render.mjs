/* Gera os PNGs dos esboços em mockups/img/ */
import { writeFileSync, mkdirSync } from 'node:fs';
import { bufToPNG } from './png.mjs';
import * as S from '../mockups/scenes.js';
import * as CR from '../mockups/creatures.js';
import { CAST } from '../mockups/people.js';
import { medalha, MEDALHAS } from '../mockups/badges.js';
import { Buf, escalar } from '../mockups/engine.js';
import { text, textWidth } from '../mockups/font.js';
import { P } from '../mockups/palette.js';
import * as T from '../mockups/tiles.js';
import * as UI from '../mockups/ui.js';

mkdirSync(new URL('../mockups/img/', import.meta.url), { recursive: true });
const out = (nome, buf, escala = 3, fundo = null) => {
  const url = new URL(`../mockups/img/${nome}.png`, import.meta.url);
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
  const itens = [['GRAMA', T.tileGrass(1)], ['MATO ALTO', T.tileTallGrass(2)], ['ÁGUA', T.tileWater(3)],
                 ['AREIA', T.tileShore(4)], ['CAMINHO', T.tilePath(5)], ['ÁRVORE', T.tileTree(6)],
                 ['FLORES', T.tileFlower(7)], ['PEDRA', T.tileRock(8)], ['ROCHA', T.tileCliff(9)]];
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
console.log('pronto.');
