/* As 8 medalhas. Cada uma tem silhueta propria, entao dao para distinguir
   mesmo no tamanho de 16x16 da mochila. */
import { Buf } from './engine.js';
import { P, TYPES } from './palette.js';

function moldura(b, c, cD) { b.outline(cD); return b; }

export const MEDALHAS = [
  { id: 'mare',        nome: 'MARÉ',        cidade: 'PORTO IARA',        tipo: 'agua',   lider: 'MARIANA',    dom: 'NADAR' },
  { id: 'raiz',        nome: 'RAIZ',        cidade: 'MATA DO CURUPIRA',  tipo: 'planta', lider: 'TIÊ',        dom: 'CORTAR CIPÓ' },
  { id: 'brasa',       nome: 'BRASA',       cidade: 'SERRA BOITATÁ',     tipo: 'fogo',   lider: 'BRÁS',       dom: 'TOCHA' },
  { id: 'rodamoinho',  nome: 'RODAMOINHO',  cidade: 'CAMPO DO SACI',     tipo: 'vento',  lider: 'PERERÊ',     dom: 'RAJADA' },
  { id: 'trovao',      nome: 'TROVÃO',      cidade: 'ALDEIA TUPÃ',       tipo: 'raio',   lider: 'GUARACI',    dom: 'FAÍSCA' },
  { id: 'pedra',       nome: 'PEDRA',       cidade: 'MINAS DA CAIPORA',  tipo: 'terra',  lider: 'UBIRAJARA',  dom: 'ESCAVAR' },
  { id: 'breu',        nome: 'BREU',        cidade: 'BAIRRO DA CUCA',    tipo: 'sombra', lider: 'MORGANA',    dom: 'VISÃO NOTURNA' },
  { id: 'aurora',      nome: 'AURORA',      cidade: 'CIDADE DO SOL',     tipo: 'luz',    lider: 'SOLANO',     dom: 'PRISMA' },
];

export function medalha(id, size = 16) {
  const b = new Buf(size, size);
  const m = MEDALHAS.find(x => x.id === id);
  const t = TYPES[m.tipo];
  const c = t.cor, cD = t.corD, cL = P.white;
  const h = size / 2;

  switch (id) {
    case 'mare': // gota d'agua
      b.ellipse(h, h + 2, 6, 5, c);
      b.tri(h - 5, h + 1, h, h - 7, h + 5, h + 1, c);
      b.ellipse(h - 2, h + 1, 2, 2, cL);
      break;
    case 'raiz': { // folha com ponta e nervuras claras
      const veia = '#8fd06f';
      b.ellipse(h, h + 2, 5, 5, c);
      b.tri(h - 5, h + 1, h, 1, h + 5, h + 1, c);
      b.line(h, 2, h, size - 3, veia);
      for (let i = 0; i < 3; i++) {
        const y = 5 + i * 3;
        b.line(h, y, h - 4, y + 3, veia);
        b.line(h, y, h + 4, y + 3, veia);
      }
      break;
    }
    case 'brasa': // chama
      b.tri(h - 6, size - 3, h, 2, h + 6, size - 3, c);
      b.tri(h - 3, size - 4, h + 1, h - 2, h + 3, size - 4, P.fireL);
      break;
    case 'rodamoinho': // tres rajadas de vento com gancho na ponta
      [[3, 9, 1], [7, 11, 0], [11, 7, 2]].forEach(([y, len, x0]) => {
        b.line(x0 + 1, y, x0 + len, y, c);
        b.line(x0 + 1, y + 1, x0 + len, y + 1, cD);
        b.line(x0 + len, y, x0 + len + 2, y - 2, c);
        b.set(x0 + len + 2, y - 3, c);
      });
      break;
    case 'trovao': // raio
      b.tri(h + 2, 2, h - 5, h + 2, h + 1, h + 2, c);
      b.tri(h - 2, size - 2, h + 5, h - 2, h - 1, h - 2, c);
      break;
    case 'pedra': // hexagono de rocha
      b.tri(h - 6, h, h, 2, h + 6, h, c);
      b.tri(h - 6, h, h, size - 2, h + 6, h, c);
      b.line(h - 6, h, h + 6, h, cD);
      b.ellipse(h - 2, h - 2, 1, 1, cL);
      break;
    case 'breu': { // lua minguante com borda iluminada
      b.circle(h, h, 7, c);
      // recorte bem generoso, senao a lua vira so um circulo escuro
      b.apagarElipse(h + 5, h - 2, 7, 7);
      // fio de luz na borda externa do crescente
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        if (b.get(x, y) !== c) continue;
        if (b.get(x - 1, y) == null) { b.set(x, y, '#b8a8e0'); }
      }
      // estrelinhas no vazio
      b.set(h + 4, h + 4, P.white); b.set(h + 6, h + 1, P.white);
      break;
    }
    case 'aurora': // sol
      b.circle(h, h, 4, c);
      for (let a = 0; a < 8; a++) {
        const ang = a * Math.PI / 4;
        b.line(h + Math.cos(ang) * 5, h + Math.sin(ang) * 5,
               h + Math.cos(ang) * 7, h + Math.sin(ang) * 7, c);
      }
      b.ellipse(h - 1, h - 1, 1, 1, cL);
      break;
  }
  return moldura(b, c, cD);
}

/* fileira das 8 medalhas com as conquistadas acesas */
export function fileiraMedalhas(conquistadas = 3, size = 16, gap = 3) {
  const b = new Buf(MEDALHAS.length * (size + gap) - gap, size);
  MEDALHAS.forEach((m, i) => {
    const x = i * (size + gap);
    if (i < conquistadas) b.blit(medalha(m.id, size), x, 0);
    else { // slot vazio: circulo apagado, para nao parecer erro de desenho
      const h = size / 2;
      b.circle(x + h, h, h - 2, P.uiBg2);
      b.circle(x + h, h, h - 4, P.uiBg3);
    }
  });
  return b;
}
