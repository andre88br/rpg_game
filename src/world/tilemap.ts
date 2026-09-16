/* =========================================================================
   Mapa de tiles.
   O mapa inteiro e desenhado UMA vez num canvas grande na carga; a cada
   quadro so recortamos a janela da camera. Isso troca centenas de drawImage
   por um so, e e o que segura 60 quadros por segundo em celular modesto.
   ========================================================================= */
import { Buf, assar, type Assado } from '../core/buf.ts';
import * as T from '../art/tiles.ts';
import { P } from '../art/palette.ts';
import type { Direcao } from '../art/people.ts';
import type { FaixaEncontro } from '../battle/encantado.ts';
import type { Cenario } from '../art/battlebg.ts';

export const TS = 16;

export interface DefTile {
  desenho: (semente: number) => Buf;
  solido?: boolean;
  encontro?: boolean;     // mato alto: gera encontros com Encantados selvagens
  agua?: boolean;         // exige o Dom "Nadar"
}

export const TILES: Record<string, DefTile> = {
  '.': { desenho: T.tileGrama },
  ',': { desenho: T.tileMatoAlto, encontro: true },
  '=': { desenho: T.tileCaminho },
  'a': { desenho: T.tileAreia },
  'f': { desenho: (s) => T.tileFlores(s) },
  '~': { desenho: T.tileAgua, solido: true, agua: true },
  'p': { desenho: T.tileCais },
  '#': { desenho: T.tileArvore, solido: true },
  'o': { desenho: T.tilePedra, solido: true },
  'R': { desenho: T.tileRocha, solido: true },
};

export type TipoObjeto = 'casa' | 'loja' | 'ginasio' | 'placa' | 'barreira';

export interface DefObjeto {
  tipo: TipoObjeto;
  tx: number; ty: number;
  larg?: number; alt?: number;
  placa?: string;
  solido?: boolean;
}

export interface DefNPC {
  id: string;
  nome: string;
  estilo: string;              // chave em ESTILOS (src/art/people.ts)
  tx: number; ty: number;
  dir: Direcao;
  falas: readonly string[];
}

export interface DefMapa {
  nome: string;
  chao: readonly string[];
  objetos: readonly DefObjeto[];
  npcs: readonly DefNPC[];
  inicio: { tx: number; ty: number; dir: Direcao };
  /* quem aparece no mato alto deste mapa, e com que peso */
  encontros?: readonly FaixaEncontro[];
  /* fundo usado nas batalhas travadas aqui */
  cenario?: Cenario;
  /* passos no mato, em média, entre um encontro e outro */
  passosPorEncontro?: number;
}

export class Mapa {
  readonly nome: string;
  readonly largTiles: number;
  readonly altTiles: number;
  readonly def: DefMapa;
  private grade: string[];
  private solidos: Uint8Array;
  private encontros: Uint8Array;
  private imagem: Assado;

  constructor(def: DefMapa) {
    this.def = def;
    this.nome = def.nome;
    this.grade = def.chao.map((l) => l);
    this.altTiles = def.chao.length;
    this.largTiles = def.chao[0]?.length ?? 0;

    const n = this.largTiles * this.altTiles;
    this.solidos = new Uint8Array(n);
    this.encontros = new Uint8Array(n);

    const buf = new Buf(this.largTiles * TS, this.altTiles * TS);

    // 1) terreno
    for (let ty = 0; ty < this.altTiles; ty++) {
      for (let tx = 0; tx < this.largTiles; tx++) {
        const ch = this.grade[ty]![tx] ?? '.';
        const d = TILES[ch] ?? TILES['.']!;
        // semente derivada da posicao: variacao estavel entre execucoes
        buf.blit(d.desenho(tx * 31 + ty * 17 + 3), tx * TS, ty * TS);
        const i = ty * this.largTiles + tx;
        if (d.solido) this.solidos[i] = 1;
        if (d.encontro) this.encontros[i] = 1;
      }
    }

    // 2) linha d'agua: espuma em todo tile de agua cuja vizinha de cima e seca.
    //    E o que impede o mar de virar um retangulo azul colado na areia.
    for (let ty = 0; ty < this.altTiles; ty++) {
      for (let tx = 0; tx < this.largTiles; tx++) {
        if (this.grade[ty]![tx] !== '~') continue;
        const norte = ty > 0 ? this.grade[ty - 1]![tx] : undefined;
        // espuma so onde o mar encontra terra — nao na ponta do cais
        if (norte === '~' || norte === 'p' || norte === undefined) continue;
        buf.blit(T.espumaOrla(tx * 13 + 5), tx * TS, ty * TS);
      }
    }

    // 3) construcoes e objetos, por cima do terreno
    for (const o of def.objetos) this.desenharObjeto(buf, o);

    this.imagem = assar(buf);
  }

  private desenharObjeto(buf: Buf, o: DefObjeto): void {
    const larg = o.larg ?? 4, alt = o.alt ?? 3;
    let sprite: Buf | null = null;
    let deslocY = 0;

    switch (o.tipo) {
      case 'casa':
        sprite = T.construcao(larg, alt, { roof: P.roof, roofD: P.roofD, roofL: P.roofL });
        break;
      case 'loja':
        sprite = T.construcao(larg, alt, { roof: '#3f8f6f', roofD: '#2b6b52', roofL: '#5fb894',
                                           sign: 'LOJA', signColor: '#7fd9b4' });
        break;
      case 'ginasio':
        sprite = T.construcao(larg, alt, { roof: P.gymRoof, roofD: P.gymRoofD, roofL: P.gymRoofL,
                                           sign: 'GINÁSIO', signColor: P.uiAcc });
        break;
      case 'placa':
        sprite = T.placa();
        deslocY = 2;
        break;
      case 'barreira':
        sprite = T.barreira(larg);
        break;
    }
    if (!sprite) return;
    buf.blit(sprite, o.tx * TS, o.ty * TS + deslocY);

    // mastro e bandeira do ginasio, acima do telhado
    if (o.tipo === 'ginasio') {
      const gx = o.tx * TS + 14, gy = o.ty * TS;
      buf.rect(gx, gy - 20, 1, 22, P.ink!);
      buf.tri(gx + 1, gy - 20, gx + 15, gy - 15, gx + 1, gy - 10, P.water!);
      buf.tri(gx + 1, gy - 18, gx + 11, gy - 15, gx + 1, gy - 12, P.waterL!);
    }
    // marca a area ocupada como solida
    const marcarL = o.tipo === 'placa' ? 1 : larg;
    const marcarA = o.tipo === 'placa' ? 1 : o.tipo === 'barreira' ? 1 : alt;
    if (o.solido === false) return;
    for (let j = 0; j < marcarA; j++)
      for (let i = 0; i < marcarL; i++) this.marcarSolido(o.tx + i, o.ty + j);
  }

  private marcarSolido(tx: number, ty: number): void {
    if (tx < 0 || ty < 0 || tx >= this.largTiles || ty >= this.altTiles) return;
    this.solidos[ty * this.largTiles + tx] = 1;
  }

  get larguraPx(): number { return this.largTiles * TS; }
  get alturaPx(): number { return this.altTiles * TS; }

  dentro(tx: number, ty: number): boolean {
    return tx >= 0 && ty >= 0 && tx < this.largTiles && ty < this.altTiles;
  }

  solido(tx: number, ty: number): boolean {
    if (!this.dentro(tx, ty)) return true;     // fora do mapa e parede
    return this.solidos[ty * this.largTiles + tx] === 1;
  }

  temEncontro(tx: number, ty: number): boolean {
    if (!this.dentro(tx, ty)) return false;
    return this.encontros[ty * this.largTiles + tx] === 1;
  }

  /* recorta a janela da camera direto do mapa ja desenhado */
  desenhar(ctx: CanvasRenderingContext2D, camX: number, camY: number,
           larg: number, alt: number): void {
    ctx.drawImage(this.imagem, camX, camY, larg, alt, 0, 0, larg, alt);
  }
}
