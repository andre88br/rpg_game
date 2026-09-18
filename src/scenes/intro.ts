/* =========================================================================
   A introdução: quatro páginas de texto sobre um céu escuro, antes do
   primeiro "novo jogo" de verdade. Lida como a conversa de qualquer NPC —
   A revela e avança, B pula a introdução inteira — porque quem já jogou
   antes não deveria ter que esperar pela história de novo.

   Só toca uma vez por partida NOVA: CONTINUAR nunca passa por aqui.
   ========================================================================= */
import { Buf, assarSuave, rng, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import { quebrar } from '../art/font.ts';
import { multiplicadorVelocidade } from '../game/config.ts';

const PAGINAS: readonly string[] = [
  'Diz a avó que, antes de tudo, o mato falava.',
  'Cada rio tinha dona. Cada fogo tinha gênio. Cada vento tinha nome — e respondia por ele, se alguém soubesse chamar.',
  'Hoje poucos escutam mais. Mas os Encantados continuam aí: na água do rio, na mata fechada, na brasa do fogão de lenha.',
  'E a Companhia Mata-Seca anda comprando terra e calando rio, região por região. Alguém vai ter que discordar.',
  'Quem souber escutar de novo pode andar a Trilha das Oito Medalhas — terreiro por terreiro, até onde os antigos moram.',
];

const CHARS_POR_SEG = 38;

function fundoIntro(): Buf {
  const b = new Buf(LARGURA, ALTURA);
  for (let y = 0; y < ALTURA; y++) {
    const t = y / ALTURA;
    const canal = (a: number, bb: number) => Math.round(a + (bb - a) * t);
    b.rect(0, y, LARGURA, 1,
      '#' + [canal(0x0d, 0x22), canal(0x09, 0x1a), canal(0x12, 0x33)]
        .map((v) => v.toString(16).padStart(2, '0')).join(''));
  }
  const r = rng(7);
  for (let i = 0; i < 60; i++) {
    b.set((r() * LARGURA) | 0, (r() * (ALTURA - 20)) | 0, i % 6 === 0 ? P.white! : '#a89bd0');
  }
  return b;
}

const LARG_TEXTO = LARGURA - 44;

export class CenaIntro implements Cena {
  private fundo!: Assado;
  private pagina = 0;
  private revelados = 0;
  /* as linhas da página inteira, quebradas UMA vez — revelar caractere a
     caractere sobre um texto parcial (e re-quebrar a cada quadro) faria o
     bloco pular de altura conforme a última palavra decide a linha */
  private linhas: string[] = [];
  private totalChars = 0;
  private aoTerminar: () => void;

  constructor(aoTerminar: () => void) { this.aoTerminar = aoTerminar; }

  entrar(): void {
    this.fundo = assarSuave(fundoIntro());
    this.pagina = 0;
    this.revelados = 0;
    this.prepararPagina();
  }

  private prepararPagina(): void {
    this.linhas = quebrar(PAGINAS[this.pagina] ?? '', LARG_TEXTO);
    this.totalChars = this.linhas.reduce((n, l) => n + l.length, 0) + this.linhas.length - 1;
  }

  atualizar(dt: number, entrada: Entrada): void {
    this.revelados = Math.min(this.totalChars,
      this.revelados + CHARS_POR_SEG * multiplicadorVelocidade() * dt);

    if (entrada.apertou('b')) { this.aoTerminar(); return; }     // pula a introdução inteira
    if (!entrada.apertou('a')) return;

    if (this.revelados < this.totalChars) { this.revelados = this.totalChars; return; }
    this.pagina++;
    this.revelados = 0;
    if (this.pagina >= PAGINAS.length) { this.aoTerminar(); return; }
    this.prepararPagina();
  }

  desenhar(r: Renderizador): void {
    r.limpar('#0d0912');
    r.sprite(this.fundo, 0, 0);

    const alturaBloco = this.linhas.length * 12;
    const y0 = (ALTURA - alturaBloco) / 2 - 8;
    let restantes = Math.floor(this.revelados);
    this.linhas.forEach((linha, i) => {
      if (restantes <= 0) return;
      const visivel = linha.slice(0, restantes);
      restantes -= linha.length + 1;
      r.texto(visivel, (LARGURA - r.larguraTexto(linha)) / 2, y0 + i * 12, P.uiBg!, { sombra: P.ink! });
    });

    const completo = Math.floor(this.revelados) >= this.totalChars;
    if (completo && this.pagina < PAGINAS.length - 1) {
      r.texto('A', LARGURA - 20, ALTURA - 16, P.uiAcc!);
    }
    r.texto('B PULAR', 10, ALTURA - 16, '#7f749c');
  }
}
