/* =========================================================================
   Os créditos: o fim da Trilha das Oito Medalhas.

   Tocam uma vez, logo depois de vencer o Anhangá no Círculo Dourado. Um rolo
   sobe devagar pelo céu da introdução: quem venceu, o time que venceu com
   ela, as oito medalhas e quem as entregou, os Guardiões, o Zeca. A segura
   A para correr; B pula direto para o fim. No fim, A volta para o mundo — a
   partida continua, e o Círculo fica aberto para revanches.
   ========================================================================= */
import { Buf, assar, assarSuave, rng, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import { texto, larguraTexto } from '../art/font.ts';
import { medalha, MEDALHAS } from '../art/badges.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import { ficha } from '../battle/encantado.ts';
import { pronomeDe, type EstadoJogo } from '../game/state.ts';

const VELOCIDADE = 16;          // pixels por segundo
const LARG = LARGURA;

const LIDERES: readonly [string, string][] = [
  ['PORTO IARA', 'DONA MARIANA'], ['MATA DO CURUPIRA', 'TIÊ'], ['SERRA BOITATÁ', 'BRÁS'],
  ['CAMPO DO SACI', 'PERERÊ'], ['ALDEIA TUPÃ', 'GUARACI'], ['MINAS DA CAIPORA', 'UBIRAJARA'],
  ['BAIRRO DA CUCA', 'MORGANA'], ['CIDADE DO SOL', 'SOLANO'],
];

function ceu(): Buf {
  const b = new Buf(LARGURA, ALTURA);
  for (let y = 0; y < ALTURA; y++) {
    const t = y / ALTURA;
    const c = (a: number, z: number) => Math.round(a + (z - a) * t).toString(16).padStart(2, '0');
    b.rect(0, y, LARGURA, 1, '#' + c(0x0d, 0x2a) + c(0x09, 0x1e) + c(0x12, 0x3a));
  }
  const r = rng(11);
  for (let i = 0; i < 70; i++) b.set((r() * LARGURA) | 0, (r() * ALTURA) | 0, i % 5 === 0 ? P.white! : '#a89bd0');
  return b;
}

/* o rolo inteiro, montado uma vez: texto centrado, medalhas e o time */
function rolo(e: EstadoJogo): Buf {
  const itens: ((b: Buf, y: number) => number)[] = [];
  const linha = (s: string, cor = P.uiBg!) => itens.push((b, y) => { texto(b, s, Math.floor((LARG - larguraTexto(s)) / 2), y, cor); return 12; });
  const espaco = (h: number) => itens.push(() => h);

  espaco(ALTURA);
  linha('ENCANTADOS', P.gold!);
  linha('A TRILHA DAS OITO MEDALHAS', P.lightD!);
  espaco(40);
  linha(pronomeDe(e) === 'ele' ? 'CAMPEÃO DO CÍRCULO DOURADO' : 'CAMPEÃ DO CÍRCULO DOURADO', P.gold!);
  linha(e.nome);
  espaco(24);
  linha('O TIME', P.lightD!);
  espaco(4);
  for (const bicho of e.time) {
    const arte = ARTE_CRIATURAS[bicho.especie]?.();
    itens.push((b, y) => {
      if (arte) b.blit(arte, Math.floor((LARG - arte.w) / 2), y);
      const nome = `${ficha(bicho).nome.toUpperCase()}  NV ${bicho.nivel}`;
      texto(b, nome, Math.floor((LARG - larguraTexto(nome)) / 2), y + (arte?.h ?? 0) + 2, P.uiBg!);
      return (arte?.h ?? 0) + 18;
    });
  }
  espaco(24);
  linha('AS OITO MEDALHAS', P.lightD!);
  espaco(4);
  itens.push((b, y) => {
    const n = MEDALHAS.length, w = 20;
    MEDALHAS.forEach((m, i) => b.blit(medalha(m.id, 16), Math.floor((LARG - n * w) / 2) + i * w + 2, y));
    return 24;
  });
  for (const [cidade, quem] of LIDERES) { linha(cidade, P.uiBg3!); linha(quem); espaco(6); }
  espaco(24);
  linha('OS GUARDIÕES DO CÍRCULO', P.lightD!);
  for (const g of ['IRACEMA', 'ITABERÁ', 'YBYTU', 'JACIRA']) linha(g);
  espaco(16);
  linha('E O ZECA, QUE NUNCA DESISTIU', P.lightD!);
  espaco(16);
  linha('E A DONA FIRMINA, QUE DEU O PRIMEIRO PATUÁ', P.lightD!);
  espaco(48);
  linha('OBRIGADO POR JOGAR!', P.gold!);
  espaco(20);
  linha('O CÍRCULO DOURADO CONTINUA ABERTO.', P.uiBg3!);
  linha('OS MESTRES ESPERAM A REVANCHE.', P.uiBg3!);
  espaco(ALTURA / 2);

  // mede, depois desenha
  const altura = itens.reduce((h, f) => h + f(new Buf(1, 1), 0), 0);
  const b = new Buf(LARG, altura);
  let y = 0;
  for (const f of itens) y += f(b, y);
  return b;
}

export class CenaCreditos implements Cena {
  private fundo!: Assado;
  private texto!: Assado;
  private altura = 0;
  private y = 0;

  constructor(private readonly estado: EstadoJogo, private readonly aoTerminar: () => void) {}

  entrar(): void {
    this.fundo = assarSuave(ceu());
    const r = rolo(this.estado);
    this.altura = r.h;
    this.texto = assar(r);
    this.y = 0;
  }

  private get fim(): number { return Math.max(0, this.altura - ALTURA); }

  atualizar(dt: number, entrada: Entrada): void {
    const rapido = entrada.segurando('a') ? 5 : 1;
    this.y = Math.min(this.fim, this.y + VELOCIDADE * rapido * dt);
    if (entrada.apertou('b')) this.y = this.fim;
    if (this.y >= this.fim && entrada.apertou('a')) this.aoTerminar();
  }

  desenhar(r: Renderizador): void {
    r.sprite(this.fundo, 0, 0);
    r.recorte(this.texto, 0, Math.floor(this.y), LARGURA, ALTURA, 0, 0);
    if (this.y >= this.fim) r.texto('A: VOLTAR À TRILHA', LARGURA - 110, ALTURA - 12, P.uiBg3!);
  }
}
