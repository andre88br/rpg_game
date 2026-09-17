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
/* so o TIPO: em tempo de execucao quests.ts depende do registro de mapas,
   e importar de volta fecharia um ciclo. `import type` some na compilacao. */
import type { Fala } from '../game/quests.ts';

export const TS = 16;

export interface DefTile {
  desenho: (semente: number) => Buf;
  solido?: boolean;
  encontro?: boolean;     // mato alto: gera encontros com Encantados selvagens
  agua?: boolean;         // so se atravessa com o Dom "Nadar"
  escorrega?: boolean;    // quem pisa segue deslizando na mesma direcao
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
  /* interiores */
  '_': { desenho: T.tilePisoMadeira },
  'W': { desenho: T.tileParedeInterna, solido: true },
  'T': { desenho: T.tileTapete },
  'm': { desenho: T.tileTatame },
  'u': { desenho: T.tilePocaDagua, escorrega: true },
};

export type TipoObjeto =
  | 'casa' | 'loja' | 'benzimento' | 'terreiro'      // construcoes com porta
  | 'farol'                                          // construcao sem porta
  | 'placa' | 'barreira' | 'portao' | 'achado'       // cenario
  | 'balcao' | 'gamela' | 'estante' | 'mesa';        // moveis de interior

/* construcoes tem porta: o tile da porta NAO e solido, e e nele que a saida
   do mapa costuma ficar */
const COM_PORTA: readonly TipoObjeto[] = ['casa', 'loja', 'benzimento', 'terreiro'];

/* construcao inteira vira parede; movel e cenario ocupam so o que desenham */
const BLOCO: readonly TipoObjeto[] = [...COM_PORTA, 'farol'];

/* Movel que da para conversar POR CIMA. Balcao de loja, mesa de cozinha: o
   corpo e parede, mas quem esta do outro lado escuta — e e assim que se fala
   com lojista em qualquer jogo do genero. Sem isso, um NPC posto atras do
   proprio balcao fica inalcancavel. */
const ATRAVESSA_FALA: readonly TipoObjeto[] = ['balcao', 'mesa', 'estante', 'gamela'];

export interface DefObjeto {
  tipo: TipoObjeto;
  tx: number; ty: number;
  larg?: number; alt?: number;
  placa?: string;
  solido?: boolean;
  /* coluna da porta, em tiles, a partir da esquerda da construcao */
  portaCol?: number;
  /* quantas das cinco contas da guia estao acesas (tipo 'portao').
     Sem este campo a guia le o que o jogador ja fez. */
  contas?: number;
  /* construcao sem interior: a porta continua desenhada, mas e parede */
  trancada?: boolean;
  /* achado ja revirado: o desenho muda, e nao ha mais nada dentro */
  vazio?: boolean;
  /* o objeto so existe quando as condicoes valem (vocabulario de quests.ts).
     E o que faz a barreira sumir depois do servico feito. */
  se?: string | readonly string[];
  seNao?: string | readonly string[];
  /* coisa do cenario que responde ao A com fala condicional, e pode entregar
     item ou ligar flag — um pote esquecido, um caixote de rede */
  falas?: readonly Fala[];
}

export interface DefSaida {
  tx: number; ty: number;                 // tile do mapa atual que leva embora
  para: string;                           // id do mapa de destino
  destino: { tx: number; ty: number; dir: Direcao };
  /* porta: basta pisar (padrao). false = precisa apertar A, para beiras
     de mapa em que atravessar sem querer seria irritante */
  aoPisar?: boolean;
}

/* Um NPC que desafia. A vitoria liga a flag `venceu_<id do NPC>`, e e ela
   que faz o treinador parar de barrar o caminho na proxima vez. */
export interface DefTreinador {
  classe: string;                       // "MOLEQUE DA VILA", "PESCADOR"...
  time: readonly { especie: string; nivel: number }[];
  /* bicho, nao gente: a luta e selvagem, entao da para prender num patua —
     e prender vale tanto quanto vencer */
  selvagem?: boolean;
  /* quantos tiles a frente ele enxerga. 0 ou ausente: so conversa */
  visao?: number;
  falaInicio?: string;
  falaDerrota?: string;
  premio?: number;
  /* flags acesas pela vitoria, alem de `venceu_<id>` — e assim que vencer
     o Zeca acende a conta da estrada sem precisar falar com ele de novo */
  liga?: string | readonly string[];
}

export interface DefNPC {
  id: string;
  nome: string;
  estilo: string;              // chave em ESTILOS (src/art/people.ts)
  tx: number; ty: number;
  dir: Direcao;
  /* a primeira fala cujas condicoes batem e a que ele diz */
  falas: readonly Fala[];
  treinador?: DefTreinador;
  /* foge de quem chega perto, ate ficar sem folego ou sem saida. So ai
     escuta o que voce tem a dizer. */
  fujao?: { folego?: number };
  /* so esta no mapa quando as condicoes valem — o Sacizinho some depois de
     largar a rede, o chefe some depois de perder */
  se?: string | readonly string[];
  seNao?: string | readonly string[];
}

export interface DefMapa {
  /* chave no registro MAPAS; e o que as saidas apontam */
  id: string;
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
  /* para onde cada porta / beira de mapa leva */
  saidas?: readonly DefSaida[];
  /* dentro de uma construcao: sem faixa de cidade e sem céu */
  interior?: boolean;
  /* abrigo: e aqui que o jogador acorda depois de apagar no mato */
  refugio?: boolean;
  /* quem recebe o jogador que apagou, e o que essa pessoa diz */
  socorro?: { quem: string; falas: readonly string[] };
}

/* O que o mundo sabe do jogador na hora de montar um mapa. E so isto: um
   mapa nao le o estado inteiro da partida, le um contexto pequeno — o que
   deixa `Mapa` testavel sem inventar uma partida. */
export interface ContextoMapa {
  contas: number;                         // contas acesas da guia
  nadar: boolean;                         // o Dom da Medalha Mare
  ligada: (cond: string) => boolean;      // condicoes dos objetos
}

export const CTX_VAZIO: ContextoMapa = { contas: 0, nadar: false, ligada: () => false };

/* um objeto condicional so entra no mapa quando as condicoes valem */
export function objetoAtivo(o: DefObjeto, ctx: ContextoMapa): boolean {
  const como = (v: string | readonly string[] | undefined): readonly string[] =>
    v === undefined ? [] : typeof v === 'string' ? [v] : v;
  for (const c of como(o.se)) if (!ctx.ligada(c)) return false;
  for (const c of como(o.seNao)) if (ctx.ligada(c)) return false;
  return true;
}

/* Quantas contas a guia deste objeto mostra. */
export function contasDo(o: DefObjeto, ctx: ContextoMapa): number {
  return o.contas ?? ctx.contas;
}

export class Mapa {
  readonly id: string;
  readonly nome: string;
  readonly largTiles: number;
  readonly altTiles: number;
  readonly def: DefMapa;
  private grade: string[];
  private solidos: Uint8Array;
  private encontros: Uint8Array;
  private escorregas: Uint8Array;
  private balcoes: Uint8Array;
  private saidas = new Map<string, DefSaida>();
  /* o cenário fica em pixels crus até alguém pedir para desenhar. Assar exige
     um <canvas>, e os testes de coerência dos mapas rodam no Node, sem DOM. */
  private cru: Buf | null;
  private imagem: Assado | null = null;

  readonly ctx: ContextoMapa;

  constructor(def: DefMapa, ctx: ContextoMapa = CTX_VAZIO) {
    this.def = def;
    this.ctx = ctx;
    this.id = def.id;
    this.nome = def.nome;
    for (const s of def.saidas ?? []) this.saidas.set(`${s.tx},${s.ty}`, s);
    this.grade = def.chao.map((l) => l);
    this.altTiles = def.chao.length;
    this.largTiles = def.chao[0]?.length ?? 0;

    const n = this.largTiles * this.altTiles;
    this.solidos = new Uint8Array(n);
    this.encontros = new Uint8Array(n);
    this.escorregas = new Uint8Array(n);
    this.balcoes = new Uint8Array(n);

    const buf = new Buf(this.largTiles * TS, this.altTiles * TS);

    // 1) terreno
    for (let ty = 0; ty < this.altTiles; ty++) {
      for (let tx = 0; tx < this.largTiles; tx++) {
        const ch = this.grade[ty]![tx] ?? '.';
        const d = TILES[ch] ?? TILES['.']!;
        // semente derivada da posicao: variacao estavel entre execucoes
        buf.blit(d.desenho(tx * 31 + ty * 17 + 3), tx * TS, ty * TS);
        const i = ty * this.largTiles + tx;
        // agua e parede ate a Medalha Mare; depois dela, e so agua
        if (d.solido && !(d.agua && ctx.nadar)) this.solidos[i] = 1;
        if (d.encontro) this.encontros[i] = 1;
        if (d.escorrega) this.escorregas[i] = 1;
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
    for (const o of def.objetos) {
      if (objetoAtivo(o, ctx)) this.desenharObjeto(buf, o);
    }

    this.cru = buf;
  }

  private desenharObjeto(buf: Buf, o: DefObjeto): void {
    const larg = o.larg ?? 4, alt = o.alt ?? 3;
    let sprite: Buf | null = null;
    let deslocY = 0;

    switch (o.tipo) {
      case 'benzimento':
        sprite = T.construcao(larg, alt, { roof: '#c25d8f', roofD: '#95406a', roofL: '#e089b4',
                                           sign: 'BENZIMENTO', signColor: '#f0b6d2',
                                           portaCol: o.portaCol });
        break;
      case 'portao':
        sprite = T.guia(larg, contasDo(o, this.ctx));
        break;
      case 'balcao':
        sprite = T.balcao(larg);
        break;
      case 'gamela':
        sprite = T.gamela();     // sempre 2x2 tiles
        break;
      case 'estante':
        sprite = T.estante(larg);
        break;
      case 'mesa':
        sprite = T.mesa(larg);
        break;
      case 'casa':
        sprite = T.construcao(larg, alt, { roof: P.roof, roofD: P.roofD, roofL: P.roofL,
                                           portaCol: o.portaCol });
        break;
      case 'loja':
        sprite = T.construcao(larg, alt, { roof: '#3f8f6f', roofD: '#2b6b52', roofL: '#5fb894',
                                           sign: 'LOJA', signColor: '#7fd9b4',
                                           portaCol: o.portaCol });
        break;
      case 'terreiro':
        sprite = T.construcao(larg, alt, { roof: P.gymRoof, roofD: P.gymRoofD, roofL: P.gymRoofL,
                                           sign: 'TERREIRO', signColor: P.uiAcc,
                                           portaCol: o.portaCol });
        break;
      case 'placa':
        sprite = T.placa();
        deslocY = 2;
        break;
      case 'barreira':
        sprite = T.barreira(larg);
        break;
      case 'farol':
        sprite = T.farol(larg, alt);
        break;
      case 'achado':
        sprite = T.pote(o.vazio === true);
        break;
    }
    if (!sprite) return;
    buf.blit(sprite, o.tx * TS, o.ty * TS + deslocY);

    // mastro e bandeira do terreiro, acima do telhado
    if (o.tipo === 'terreiro') {
      const gx = o.tx * TS + 14, gy = o.ty * TS;
      buf.rect(gx, gy - 20, 1, 22, P.ink!);
      buf.tri(gx + 1, gy - 20, gx + 15, gy - 15, gx + 1, gy - 10, P.water!);
      buf.tri(gx + 1, gy - 18, gx + 11, gy - 15, gx + 1, gy - 12, P.waterL!);
    }
    /* guia com as cinco contas acesas: o colar se abre e o patio libera */
    if (o.tipo === 'portao' && contasDo(o, this.ctx) >= T.CONTAS_NA_GUIA) return;

    if (o.solido === false) return;

    /* quanto do desenho vira parede: a construcao inteira; a gamela, os seus
       2x2; a placa, so o tile do poste; o resto, uma linha na base */
    const marcarL = o.tipo === 'placa' ? 1 : o.tipo === 'gamela' ? 2 : larg;
    const marcarA = o.tipo === 'placa' ? 1
                  : o.tipo === 'gamela' ? 2
                  : BLOCO.includes(o.tipo) ? alt : 1;
    const balcao = ATRAVESSA_FALA.includes(o.tipo);
    for (let j = 0; j < marcarA; j++) {
      for (let i = 0; i < marcarL; i++) {
        this.marcarSolido(o.tx + i, o.ty + j);
        if (balcao) this.marcarBalcao(o.tx + i, o.ty + j);
      }
    }

    // a porta e vao, nao parede: e por ela que se entra
    if (COM_PORTA.includes(o.tipo) && !o.trancada) {
      const col = T.colunaPorta(larg, o.portaCol);
      this.solidos[(o.ty + alt - 1) * this.largTiles + (o.tx + col)] = 0;
    }
  }

  private marcarBalcao(tx: number, ty: number): void {
    if (!this.dentro(tx, ty)) return;
    this.balcoes[ty * this.largTiles + tx] = 1;
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

  saidaEm(tx: number, ty: number): DefSaida | undefined {
    return this.saidas.get(`${tx},${ty}`);
  }

  temEncontro(tx: number, ty: number): boolean {
    if (!this.dentro(tx, ty)) return false;
    return this.encontros[ty * this.largTiles + tx] === 1;
  }

  /* movel que se atravessa com a voz: da para falar com quem esta atras */
  balcao(tx: number, ty: number): boolean {
    if (!this.dentro(tx, ty)) return false;
    return this.balcoes[ty * this.largTiles + tx] === 1;
  }

  /* quem para aqui nao para: segue deslizando na direcao em que entrou */
  escorrega(tx: number, ty: number): boolean {
    if (!this.dentro(tx, ty)) return false;
    return this.escorregas[ty * this.largTiles + tx] === 1;
  }

  /* recorta a janela da camera direto do mapa ja desenhado */
  desenhar(ctx: CanvasRenderingContext2D, camX: number, camY: number,
           larg: number, alt: number): void {
    if (!this.imagem) { this.imagem = assar(this.cru!); this.cru = null; }
    ctx.drawImage(this.imagem, camX, camY, larg, alt, 0, 0, larg, alt);
  }
}
