/* Tela de título. O fundo é montado uma vez e assado; só o "aperte A" pisca. */
import { Buf, assarSuave, escalar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import { P } from '../art/palette.ts';
import { texto, larguraTexto } from '../art/font.ts';
import * as CR from '../art/creatures.ts';
import { algumSlotOcupado, primeiroSlotVazio, salvarEmSlot } from '../game/save.ts';
import { saveDoTexto } from '../game/transferencia.ts';
import { escolherArquivo, pedirTexto } from '../ui/arquivos.ts';
import { TelaSlots } from './slots.ts';
import * as Som from '../audio/som.ts';

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
  /* a lua crescente: o recorte é pintado com o céu daquela altura — apagado
     (transparente) ele mostrava o quadro anterior do canvas por dentro */
  b.circle(206, 26, 11, '#f5eec0');
  b.ellipse(201, 22, 9, 9, misturar('#1b1338', '#4a2f6b', 22 / ALTURA / 0.55));

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
   a tela de um botão só, que é o que um jogo novo deve parecer — com o MENU
   abrindo o importar, para quem chega de outro aparelho com o save na mão.

   Importar: escolhe a origem (arquivo ou código colado), lê o texto, e só
   então abre os slots. Esperando o arquivo, o B desiste — o seletor do
   navegador nem sempre avisa quando a pessoa fecha sem escolher. */
type Tela = 'aperte' | 'menu' | 'slots' | 'origem' | 'esperando';

export type Comeco = 'novo' | 'continuar';

const ITENS_MENU = ['CONTINUAR', 'NOVO JOGO', 'IMPORTAR SAVE'] as const;
const ITENS_ORIGEM = ['DE UM ARQUIVO', 'COLAR CÓDIGO'] as const;

export class CenaTitulo implements Cena {
  private fundo!: Assado;
  private t = 0;
  private tela: Tela = 'aperte';
  private sel = 0;
  private selOrigem = 0;
  private slots!: TelaSlots;
  private aoComecar: (c: Comeco, slot: number) => void;
  /* recado curto no alto da tela (importou, código inválido...) */
  private recado: string | null = null;
  private tempoRecado = 0;
  /* cada espera de arquivo ganha um número: a resposta de uma espera que
     o B já abandonou chega atrasada e é ignorada */
  private espera = 0;

  constructor(aoComecar: (c: Comeco, slot: number) => void) { this.aoComecar = aoComecar; }

  entrar(): void {
    Som.musica(null);                 // quem volta da partida não traz o tema do mapa
    this.fundo = assarSuave(fundoTitulo());
    this.t = 0;
    this.sel = 0;
    this.slots ??= new TelaSlots();
    this.tela = this.telaInicial();
  }

  // o save pode ter nascido nesta sessão: o título é remontado a cada volta
  private telaInicial(): Tela { return algumSlotOcupado() ? 'menu' : 'aperte'; }

  private avisar(s: string): void { this.recado = s; this.tempoRecado = 3; }

  atualizar(dt: number, entrada: Entrada): void {
    this.t += dt;
    if (this.tempoRecado > 0 && (this.tempoRecado -= dt) <= 0) this.recado = null;
    if (this.t <= 0.3) return;        // engole o A que fechou a tela anterior

    switch (this.tela) {
      case 'aperte':
        if (entrada.apertou('a')) this.aoComecar('novo', primeiroSlotVazio() ?? 0);
        else if (entrada.apertou('menu')) this.abrirOrigem();
        return;
      case 'slots':
        if (this.slots.atualizar(entrada) === 'fechar' && this.tela === 'slots') this.tela = this.telaInicial();
        return;
      case 'origem':
        if (entrada.apertou('cima') || entrada.apertou('baixo')) this.selOrigem = 1 - this.selOrigem;
        if (entrada.apertou('b') || entrada.apertou('menu')) { this.tela = this.telaInicial(); return; }
        if (entrada.apertou('a')) this.lerOrigem();
        return;
      case 'esperando':
        if (entrada.apertou('b') || entrada.apertou('menu')) { this.espera++; this.tela = this.telaInicial(); }
        return;
      case 'menu':
        break;
    }

    if (entrada.apertou('cima')) this.sel = (this.sel - 1 + ITENS_MENU.length) % ITENS_MENU.length;
    if (entrada.apertou('baixo')) this.sel = (this.sel + 1) % ITENS_MENU.length;
    if (!entrada.apertou('a')) return;

    if (ITENS_MENU[this.sel] === 'IMPORTAR SAVE') { this.abrirOrigem(); return; }
    this.tela = 'slots';
    if (this.sel === 0) this.slots.abrir('continuar', (slot) => this.aoComecar('continuar', slot));
    else this.slots.abrir('novo', (slot) => this.aoComecar('novo', slot));
  }

  /* ------------------------------------------------------------- importar */

  private abrirOrigem(): void { this.tela = 'origem'; this.selOrigem = 0; }

  private lerOrigem(): void {
    if (ITENS_ORIGEM[this.selOrigem] === 'COLAR CÓDIGO') {
      const texto = pedirTexto('Cole aqui o código do save (começa com ENCANTADOS1:)');
      if (texto === null) { this.tela = this.telaInicial(); return; }
      this.importar(texto);
      return;
    }
    const minha = ++this.espera;
    this.tela = 'esperando';
    void escolherArquivo().then((texto) => {
      if (minha !== this.espera || this.tela !== 'esperando') return;   // já desistiram
      if (texto === null) { this.tela = this.telaInicial(); return; }
      this.importar(texto);
    });
  }

  private importar(texto: string): void {
    const jogo = saveDoTexto(texto);
    if (!jogo) {
      this.tela = this.telaInicial();
      this.avisar('ISSO NÃO É UM SAVE DO ENCANTADOS.');
      return;
    }
    this.tela = 'slots';
    this.slots.abrir('importar', (slot) => {
      const ok = salvarEmSlot(jogo, slot);
      this.tela = this.telaInicial();
      this.sel = 0;                   // o cursor já fica no CONTINUAR
      this.avisar(ok ? `SAVE DE ${jogo.nome} NO SLOT ${slot + 1}.` : 'ESTE NAVEGADOR NÃO DEIXA GRAVAR.');
    }, primeiroSlotVazio() ?? 0);
  }

  /* -------------------------------------------------------------- desenho */

  desenhar(r: Renderizador): void {
    r.sprite(this.fundo, 0, 0);
    if (this.tela === 'aperte') this.desenharAperte(r);
    else if (this.tela === 'slots') { r.cortina(0.45); this.slots.desenhar(r); }
    else if (this.tela === 'origem') this.desenharLista(r, ITENS_ORIGEM, this.selOrigem, 'IMPORTAR DE ONDE?');
    else if (this.tela === 'esperando') this.desenharLista(r, ['ESCOLHA O ARQUIVO...', 'B DESISTE'], -1);
    else this.desenharLista(r, ITENS_MENU, this.sel);
    if (this.recado) this.desenharRecado(r, this.recado);
  }

  private desenharAperte(r: Renderizador): void {
    const dica = 'MENU: IMPORTAR SAVE';
    r.texto(dica, 6, 6, '#7f749c');
    if (Math.floor(this.t * 1.6) % 2 !== 0) return;
    const msg = 'APERTE   PARA COMEÇAR';
    const mx = (LARGURA - r.larguraTexto(msg)) / 2;
    r.texto(msg, mx, ALTURA - 26, P.white!, { sombra: P.ink! });
    const bx = mx + 36;
    r.ctx.fillStyle = P.uiAcc!;
    r.ctx.beginPath(); r.ctx.arc(bx + 4, ALTURA - 23, 6, 0, Math.PI * 2); r.ctx.fill();
    r.texto('A', bx + 2, ALTURA - 26, P.uiInk!);
  }

  /* o painel encosta no rodapé: assim ele cobre a assinatura assada no
     fundo em vez de escrever por cima dela, e os iniciais continuam
     aparecendo por trás */
  private desenharLista(r: Renderizador, itens: readonly string[], sel: number, titulo?: string): void {
    const larg = 124, alt = 8 + itens.length * 12 + (titulo ? 12 : 0);
    const x = (LARGURA - larg) / 2, y = ALTURA - alt - 2;
    r.retangulo(x - 2, y - 2, larg + 4, alt + 4, P.ink!);
    r.retangulo(x, y, larg, alt, P.uiBg!);
    let iy = y + 6;
    if (titulo) { r.texto(titulo, x + 12, iy, P.uiAccD!); iy += 12; }
    itens.forEach((it, i) => {
      if (i === sel) r.texto('=', x + 12, iy, P.uiAccD!);
      r.texto(it, x + 24, iy, sel < 0 ? P.uiBg3! : P.uiInk!);
      iy += 12;
    });
  }

  private desenharRecado(r: Renderizador, s: string): void {
    const w = r.larguraTexto(s) + 12;
    const x = Math.max(2, (LARGURA - w) / 2), y = 82;
    r.retangulo(x - 1, y - 1, w + 2, 16, P.ink!);
    r.retangulo(x, y, w, 14, P.uiBg!);
    r.texto(s, x + 6, y + 4, P.uiInk!);
  }
}
