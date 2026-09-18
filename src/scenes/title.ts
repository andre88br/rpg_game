/* Tela de título. O fundo é montado uma vez e assado; só o "aperte A" pisca. */
import { Buf, assarSuave, escalar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import { texto, larguraTexto } from '../art/font.ts';
import * as CR from '../art/creatures.ts';
import { algumSlotOcupado, primeiroSlotVazio } from '../game/save.ts';
import { TelaSlots } from './slots.ts';

function misturar(a: string, b: string, t: number): string {
  t = Math.max(0, Math.min(1, t));
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const canal = (desl: number) =>
    Math.round(((pa >> desl) & 255) * (1 - t) + ((pb >> desl) & 255) * t);
  return '#' + [canal(16), canal(8), canal(0)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function fundoTitulo(): Buf {
  const b = new Buf(LARGURA, ALTURA);
  for (let y = 0; y < ALTURA; y++) {
    const t = y / ALTURA;
    b.rect(0, y, LARGURA, 1,
      t < 0.55 ? misturar('#1b1338', '#4a2f6b', t / 0.55)
               : misturar('#4a2f6b', '#a05a4a', (t - 0.55) / 0.45));
  }
  for (let i = 0; i < 70; i++) {
    b.set((i * 71) % LARGURA, (i * 37) % 80, i % 5 === 0 ? P.white! : '#cdbff0');
  }
  b.circle(206, 26, 11, '#f5eec0');
  b.apagarElipse(201, 22, 9, 9);

  // silhueta da mata no horizonte
  for (let x = 0; x < LARGURA; x += 9) {
    const h = 20 + ((x * 13) % 16);
    b.tri(x - 6, ALTURA - 34, x + 2, ALTURA - 34 - h, x + 10, ALTURA - 34, '#16221c');
    b.ellipse(x + 2, ALTURA - 34 - h / 2, 7, h / 2, '#1b2b22');
  }
  b.rect(0, ALTURA - 36, LARGURA, 36, '#101a14');

  // logotipo
  const alvo = new Buf(11 * 6, 9);
  texto(alvo, 'ENCANTADOS', 0, 1, P.gold!);
  const logo = escalar(alvo, 3).outline(P.ink!);
  b.blit(logo, (LARGURA - logo.w) / 2, 26);

  const sub = 'A TRILHA DAS OITO MEDALHAS';
  texto(b, sub, (LARGURA - larguraTexto(sub)) / 2, 62, '#f0e6c8');

  // os três iniciais na frente da mata
  b.blit(CR.curupinho(), 24, ALTURA - 66);
  b.blit(CR.boitatinha(), 104, ALTURA - 70);
  b.blit(CR.iarinha(), 184, ALTURA - 66);

  const rod = 'ENCANTADOS 2026';
  texto(b, rod, (LARGURA - larguraTexto(rod)) / 2, ALTURA - 11, '#7f749c');
  return b;
}

/* Com alguma partida gravada o título vira menu; sem nenhuma continua sendo
   a tela de um botão só, que é o que um jogo novo deve parecer. */
type Tela = 'aperte' | 'menu' | 'slots';

export type Comeco = 'novo' | 'continuar';

export class CenaTitulo implements Cena {
  private fundo!: Assado;
  private t = 0;
  private tela: Tela = 'aperte';
  private sel = 0;
  private slots!: TelaSlots;
  private aoComecar: (c: Comeco, slot: number) => void;

  constructor(aoComecar: (c: Comeco, slot: number) => void) { this.aoComecar = aoComecar; }

  entrar(): void {
    this.fundo = assarSuave(fundoTitulo());
    this.t = 0;
    this.sel = 0;
    this.slots ??= new TelaSlots();
    // o save pode ter nascido nesta sessão: o título é remontado a cada volta
    this.tela = algumSlotOcupado() ? 'menu' : 'aperte';
  }

  atualizar(dt: number, entrada: Entrada): void {
    this.t += dt;
    if (this.t <= 0.3) return;        // engole o A que fechou a tela anterior

    if (this.tela === 'aperte') {
      if (entrada.apertou('a') || entrada.apertou('menu')) {
        this.aoComecar('novo', primeiroSlotVazio() ?? 0);
      }
      return;
    }

    if (this.tela === 'slots') {
      if (this.slots.atualizar(entrada) === 'fechar') this.tela = 'menu';
      return;
    }

    // 'menu': CONTINUAR ou NOVO JOGO
    if (entrada.apertou('cima')) this.sel = (this.sel - 1 + 2) % 2;
    if (entrada.apertou('baixo')) this.sel = (this.sel + 1) % 2;
    if (!entrada.apertou('a')) return;

    this.tela = 'slots';
    if (this.sel === 0) this.slots.abrir('continuar', (slot) => this.aoComecar('continuar', slot));
    else this.slots.abrir('novo', (slot) => this.aoComecar('novo', slot));
  }

  desenhar(r: Renderizador): void {
    r.sprite(this.fundo, 0, 0);
    if (this.tela === 'aperte') { this.desenharAperte(r); return; }
    if (this.tela === 'slots') { r.cortina(0.45); this.slots.desenhar(r); return; }
    this.desenharMenu(r);
  }

  private desenharAperte(r: Renderizador): void {
    if (Math.floor(this.t * 1.6) % 2 !== 0) return;
    const msg = 'APERTE   PARA COMEÇAR';
    const mx = (LARGURA - r.larguraTexto(msg)) / 2;
    r.texto(msg, mx, ALTURA - 26, P.white!, { sombra: P.ink! });
    const bx = mx + 36;
    r.ctx.fillStyle = P.uiAcc!;
    r.ctx.beginPath(); r.ctx.arc(bx + 4, ALTURA - 23, 6, 0, Math.PI * 2); r.ctx.fill();
    r.texto('A', bx + 2, ALTURA - 26, P.uiInk!);
  }

  private desenharMenu(r: Renderizador): void {
    const itens = ['CONTINUAR', 'NOVO JOGO'];
    /* o painel encosta no rodapé: assim ele cobre a assinatura assada no
       fundo em vez de escrever por cima dela, e os iniciais continuam
       aparecendo por trás */
    const larg = 124, alt = 32;
    const x = (LARGURA - larg) / 2, y = ALTURA - alt - 2;
    r.retangulo(x - 2, y - 2, larg + 4, alt + 4, P.ink!);
    r.retangulo(x, y, larg, alt, P.uiBg!);
    itens.forEach((it, i) => {
      const iy = y + 6 + i * 12;
      if (i === this.sel) r.texto('=', x + 12, iy, P.uiAccD!);
      r.texto(it, x + 24, iy, P.uiInk!);
    });
  }
}
