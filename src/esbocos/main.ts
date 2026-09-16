/* Galeria de esboços: renderiza no navegador as telas de src/esbocos/telas.ts */
import * as S from './telas.ts';
import * as CR from '../art/creatures.ts';
import { ELENCO } from '../art/people.ts';
import { medalha, MEDALHAS } from '../art/badges.ts';
import { Buf, assar } from '../core/buf.ts';
import { texto, larguraTexto } from '../art/font.ts';
import { P } from '../art/palette.ts';
import * as T from '../art/tiles.ts';

const main = document.getElementById('main')!;

function secao(titulo: string, nota: string): HTMLElement {
  const s = document.createElement('section');
  s.innerHTML = `<h2>${titulo}</h2><p class="nota">${nota}</p>`;
  const wrap = document.createElement('div');
  wrap.className = 'telas';
  s.appendChild(wrap);
  main.appendChild(s);
  return wrap;
}

function tela(onde: HTMLElement, buf: Buf, legenda: string, escala = 2): void {
  const assado = assar(buf);
  const cv = document.createElement('canvas');
  cv.width = buf.w * escala; cv.height = buf.h * escala;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(assado, 0, 0, cv.width, cv.height);
  const f = document.createElement('figure');
  f.appendChild(cv);
  const c = document.createElement('figcaption');
  c.textContent = legenda;
  f.appendChild(c);
  onde.appendChild(f);
}

const a = secao('1. Abertura', 'Tela de título com os três iniciais.');
tela(a, S.telaTitulo(), '240×160 — tela de título');

const b = secao('2. Andando pelo mundo',
  'Porto Iara. O terreiro está fechado por uma barreira até a tarefa da cidade terminar. ' +
  'A mancha verde-escura à esquerda é mato alto: é onde aparecem os Encantados selvagens.');
tela(b, S.telaMundo(), '240×160 — mundo');
tela(b, S.telaDialogo(), '240×160 — diálogo e tarefa');

const c = secao('3. Batalha por turnos',
  'Painéis de HP, menu de comando e lista de golpes com tipo, PP e potência.');
tela(c, S.telaBatalha({ modo: 'comando' }), '240×160 — menu de comando');
tela(c, S.telaBatalha({ modo: 'golpes' }), '240×160 — escolha de golpe');

const d = secao('4. No celular',
  'Retrato, com direcional e botões A/B na tela. O canvas é ampliado por número inteiro, ' +
  'então o pixel nunca borra.');
tela(d, S.telaCelular(), '268×486 — layout de celular', 1.4);

const e = secao('5. A jornada completa',
  'As nove cidades, os oito terreiros, o Dom de Campo de cada medalha e o torneio final.');
tela(e, S.telaMapa(), '240×292 — mapa da jornada');

function folhaCriaturas(): Buf {
  const linhas = [
    { base: CR.boitatinha(), evo: CR.boitatao(), nomes: ['BOITATINHA', 'BOITATÃO'], tipo: 'FOGO', cor: P.fire! },
    { base: CR.iarinha(), evo: CR.iaraMae(), nomes: ['IARINHA', 'IARA-MÃE'], tipo: 'ÁGUA', cor: P.water! },
    { base: CR.curupinho(), evo: CR.curupira(), nomes: ['CURUPINHO', 'CURUPIRÁ'], tipo: 'PLANTA', cor: P.tree! },
  ];
  const bf = new Buf(200, 24 + 72 * linhas.length + 8);
  bf.rect(0, 0, bf.w, bf.h, P.uiBg!);
  texto(bf, 'OS TRÊS INICIAIS', 8, 6, P.uiInk!);
  linhas.forEach((l, i) => {
    const y = 24 + i * 72;
    bf.rect(6, y - 4, bf.w - 12, 68, P.uiBg2!);
    bf.rect(6, y - 4, 3, 68, l.cor);
    texto(bf, l.nomes[0]!, 14, y, P.uiInk!);
    texto(bf, l.nomes[1]!, 96, y, P.uiInk!);
    texto(bf, l.tipo, bf.w - 12 - larguraTexto(l.tipo), y, l.cor);
    bf.blit(l.base, 18, y + 20);
    bf.blit(l.evo, 96, y + 14);
    texto(bf, '>', 82, y + 34, P.uiAccD!);
  });
  return bf;
}

function folhaMedalhas(): Buf {
  const bf = new Buf(240, 30 + MEDALHAS.length * 22);
  bf.rect(0, 0, bf.w, bf.h, P.uiBg!);
  texto(bf, 'AS OITO MEDALHAS', 8, 8, P.uiInk!);
  MEDALHAS.forEach((m, i) => {
    const y = 26 + i * 22;
    bf.rect(6, y, bf.w - 12, 20, i % 2 ? P.uiBg2! : P.uiBg!);
    bf.blit(medalha(m.id, 16), 10, y + 2);
    texto(bf, m.nome, 32, y + 2, P.uiInk!);
    texto(bf, m.cidade, 100, y + 2, P.uiInk!);
    texto(bf, 'LÍDER ' + m.lider, 32, y + 11, '#7a6f58');
    texto(bf, 'DOM: ' + m.dom, 132, y + 11, '#7a6f58');
  });
  return bf;
}

function folhaElenco(): Buf {
  const nomes: [string, string][] = [['taina', 'TAINÁ'], ['bento', 'BENTO'], ['zeca', 'ZECA'],
    ['firmina', 'FIRMINA'], ['mariana', 'MARIANA'], ['tie', 'TIÊ'], ['pescador', 'PESCADOR'],
    ['anhanga', 'ANHANGÁ']];
  const CW = 58;
  const bf = new Buf(nomes.length * CW, 56);
  bf.rect(0, 0, bf.w, bf.h, P.uiBg!);
  nomes.forEach(([k, n], i) => {
    if (i % 2) bf.rect(i * CW, 0, CW, 56, P.uiBg2!);
    bf.blit(ELENCO[k]!(), i * CW + (CW - 16) / 2, 8);
    texto(bf, n, i * CW + (CW - larguraTexto(n)) / 2, 40, P.uiInk!);
  });
  return bf;
}

function folhaTiles(): Buf {
  const itens: [string, Buf][] = [['GRAMA', T.tileGrama(1)], ['MATO ALTO', T.tileMatoAlto(2)],
    ['ÁGUA', T.tileAgua(3)], ['AREIA', T.tileAreia(4)], ['CAMINHO', T.tileCaminho(5)],
    ['ÁRVORE', T.tileArvore(6)], ['FLORES', T.tileFlores(7)], ['PEDRA', T.tilePedra(8)],
    ['CAIS', T.tileCais(11)]];
  const CW = 60;
  const bf = new Buf(itens.length * CW, 44);
  bf.rect(0, 0, bf.w, bf.h, P.uiBg!);
  itens.forEach(([n, t], i) => {
    if (i % 2) bf.rect(i * CW, 0, CW, 44, P.uiBg2!);
    bf.blit(t, i * CW + (CW - 16) / 2, 5);
    bf.frame(i * CW + (CW - 16) / 2 - 1, 4, 18, 18, P.uiBg3!);
    texto(bf, n, i * CW + (CW - larguraTexto(n)) / 2, 28, P.uiInk!);
  });
  return bf;
}

const f = secao('6. Os Encantados', 'Os três iniciais e suas evoluções finais.');
tela(f, folhaCriaturas(), 'linhas evolutivas');
const g = secao('7. Medalhas e elenco', 'Cada medalha tem silhueta própria para ser reconhecida em 16 pixels.');
tela(g, folhaMedalhas(), 'as oito medalhas');
tela(g, folhaElenco(), 'personagens');
const h = secao('8. Peças do cenário', 'Todos os tiles são gerados por código com semente fixa.');
tela(h, folhaTiles(), 'tiles 16×16');
