/* =========================================================================
   Cena de batalha.

   O motor (battle/engine.ts) resolve o turno inteiro de uma vez e devolve uma
   fila de eventos. Esta cena é só o apresentador: consome a fila no ritmo das
   animações, desenha as barras andando, e entre um turno e outro devolve o
   controle ao jogador.

   Custo por quadro: um drawImage do fundo já assado, dois dos combatentes,
   dois dos painéis, e texto (que usa o atlas de glifos do renderizador).
   Nada aqui redesenha pixel a pixel durante o jogo.
   ========================================================================= */
import { Buf, assar, escalar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import { P, TIPOS, infoTipo } from '../art/palette.ts';
import * as UI from '../art/ui.ts';
import { quebrar, larguraTexto } from '../art/font.ts';
import { ARTE_CRIATURAS } from '../art/creatures.ts';
import { fundoBatalha, POSTO_ALIADO, POSTO_INIMIGO, type Cenario } from '../art/battlebg.ts';
import { Batalha, type AcaoJogador, type Evento, type Lado, type Resultado, type Treinador } from '../battle/engine.ts';
import {
  desmaiado, ficha, hpMaximo, nome, progressoXP, substituirGolpe,
  type Encantado,
} from '../battle/encantado.ts';
import { STATUS } from '../battle/status.ts';
import { golpe as fichaGolpe } from '../data/moves.ts';
import { ITENS_ORDEM, item as fichaItem } from '../data/items.ts';
import { guardar, registrar, type EstadoJogo } from '../game/state.ts';

/* ------------------------------------------------------------ constantes */

const CHARS_POR_SEG = 56;
const PAUSA_TEXTO = 0.45;          // respiro depois que a frase termina
const PAINEL_W = 104;
/* A etiqueta de estado (QMD, PAR...) ocupa o lugar do rótulo "HP", à esquerda
   da barra: é o único canto do painel que sempre sobra, e assim o estado fica
   visível sem tapar número nenhum. */
const HPB = { x: 32, y: 14, w: PAINEL_W - 40, h: 5 };
const XPB = { x: 6, y: 28, w: PAINEL_W - 12, h: 3 };
const PAINEL_INI = { x: 8, y: 8, h: 28 };
const PAINEL_ALI = { x: LARGURA - PAINEL_W - 6, y: 74, h: 36 };
const BARRA_Y = ALTURA - 50;

type Tela = 'comando' | 'golpes' | 'mochila' | 'time' | 'esquecer' | 'rodando';

export interface OpcoesCenaBatalha {
  estado: EstadoJogo;
  oponentes: Encantado[];
  treinador?: Treinador | null;
  cenario?: Cenario;
  aoTerminar: (r: Resultado) => void;
}

export class CenaBatalha implements Cena {
  private op: OpcoesCenaBatalha;
  private b!: Batalha;

  /* recursos assados uma vez */
  private fundo!: Assado;
  private sprites = new Map<string, { img: Assado; alt: number }>();
  private painel = new Map<string, Assado>();
  private caixaMsg!: Assado;
  private caixaPergunta!: Assado;
  private caixaComandos!: Assado;
  private caixaGolpes!: Assado;
  private caixaFicha!: Assado;
  private caixaCheia!: Assado;

  /* fila de eventos e o que está sendo mostrado agora */
  private fila: Evento[] = [];
  private linha: string | null = null;
  private linhas: string[] = [];
  private revelados = 0;
  private pausa = 0;
  private espera = 0;
  private tela: Tela = 'rodando';
  private trocaForcada = false;
  private encerrando = false;
  private despediu = false;

  /* animação */
  private mostraHP: Record<Lado, number> = { aliado: 0, inimigo: 0 };
  private mostraXP = 0;
  private tremor: Record<Lado, number> = { aliado: 0, inimigo: 0 };
  private avanco: Record<Lado, number> = { aliado: 0, inimigo: 0 };
  private queda: Record<Lado, number> = { aliado: 0, inimigo: 0 };
  private entradaSprite: Record<Lado, number> = { aliado: 1, inimigo: 1 };
  private brilho = 0;
  private patuaAnim = -1;
  private patuaBalancos = 0;
  private relogio = 0;

  /* cursores dos menus */
  private sel = 0;
  private selGolpe = 0;
  private selItem = 0;
  private selTime = 0;
  private selEsquecer = 0;
  private itensUsaveis: string[] = [];

  constructor(op: OpcoesCenaBatalha) { this.op = op; }

  /* ===================================================================== */

  entrar(): void {
    const est = this.op.estado;
    this.b = new Batalha({
      time: est.time,
      oponentes: this.op.oponentes,
      treinador: this.op.treinador ?? null,
      mochila: est.mochila,
    });
    for (const o of this.op.oponentes) registrar(est, o.especie);

    this.fundo = assar(fundoBatalha(this.op.cenario ?? 'praia'));
    this.caixaMsg = assar(UI.caixa(LARGURA, 50));
    this.caixaPergunta = assar(UI.caixa(146, 50));
    this.caixaComandos = assar(UI.caixa(96, 50));
    this.caixaGolpes = assar(UI.caixa(164, 50));
    this.caixaFicha = assar(UI.caixa(78, 50));
    this.caixaCheia = assar(UI.caixa(LARGURA - 8, ALTURA - 8));

    this.mostraHP.aliado = this.b.aliado.enc.hp;
    this.mostraHP.inimigo = this.b.inimigo.enc.hp;
    this.mostraXP = progressoXP(this.b.aliado.enc);
    this.entradaSprite = { aliado: 0, inimigo: 0 };

    this.enfileirar(this.b.abrir());
  }

  /* ------------------------------------------------------- recursos ---- */

  /* O sprite é assado em dobro (32x32 vira 64x64, como num GBA) e junto vem
     a altura ÚTIL — a última linha com pixel de verdade. Sem isso um bicho
     com espaço vazio embaixo do desenho fica boiando acima da plataforma.
     O lado inimigo usa a versão espelhada, para os dois se encararem. */
  private sprite(e: Encantado, espelhar: boolean): { img: Assado; alt: number } {
    const chave = ficha(e).arte + (espelhar ? '<' : '>');
    let a = this.sprites.get(chave);
    if (a) return a;

    const desenho = ARTE_CRIATURAS[ficha(e).arte];
    if (!desenho) throw new Error(`sem arte para ${ficha(e).arte}`);
    let cru = desenho();
    if (espelhar) {
      const virado = new Buf(cru.w, cru.h);
      virado.blit(cru, 0, 0, { flipX: true });
      cru = virado;
    }
    let base = 0;
    for (let y = cru.h - 1; y >= 0 && base === 0; y--) {
      for (let x = 0; x < cru.w; x++) if (cru.get(x, y) != null) { base = y + 1; break; }
    }
    a = { img: assar(escalar(cru, 2)), alt: base * 2 };
    this.sprites.set(chave, a);
    return a;
  }

  /* a moldura do painel (nome, nível, rótulos e os trilhos das barras) muda
     pouco: só ao trocar de Encantado ou ao subir de nível. */
  private molduraPainel(e: Encantado, inimigo: boolean): Assado {
    const chave = `${inimigo ? 'i' : 'a'}|${nome(e)}|${e.nivel}`;
    let a = this.painel.get(chave);
    if (a) return a;
    const alt = inimigo ? PAINEL_INI.h : PAINEL_ALI.h;
    const b = UI.caixa(PAINEL_W, alt);
    UI.textoNaCaixa(b, nome(e), 6, 5);
    const nv = 'NV' + e.nivel;
    UI.textoNaCaixa(b, nv, PAINEL_W - 8 - larguraTexto(nv), 5);
    b.rect(HPB.x, HPB.y, HPB.w, HPB.h, P.uiInk!);
    b.rect(HPB.x + 1, HPB.y + 1, HPB.w - 2, HPB.h - 2, P.barBack!);
    if (!inimigo) {
      // trilho fino da XP, colado na base do painel: não precisa de rótulo,
      // a cor azul já o distingue da barra de HP
      b.rect(XPB.x, XPB.y, XPB.w, XPB.h, P.uiInk!);
      b.rect(XPB.x + 1, XPB.y + 1, XPB.w - 2, XPB.h - 2, P.barBack!);
    }
    a = assar(b);
    this.painel.set(chave, a);
    return a;
  }

  /* ===================================================================
     Fila de eventos
     =================================================================== */

  private enfileirar(ev: readonly Evento[]): void {
    this.fila.push(...ev);
    this.tela = 'rodando';
  }

  private falar(t: string): void {
    this.linha = t;
    this.linhas = quebrar(t, LARGURA - 28);
    this.revelados = 0;
    this.pausa = PAUSA_TEXTO;
  }

  private barrasOcupadas(): boolean {
    return Math.abs(this.mostraHP.aliado - this.b.aliado.enc.hp) > 0.5
        || Math.abs(this.mostraHP.inimigo - this.b.inimigo.enc.hp) > 0.5
        || Math.abs(this.mostraXP - progressoXP(this.b.aliado.enc)) > 0.01;
  }

  private aplicar(e: Evento): void {
    switch (e.k) {
      case 'texto': this.falar(e.t); break;
      case 'golpe': this.avanco[e.lado] = 0.26; this.espera = 0.22; break;
      case 'errou': this.espera = 0.12; break;
      case 'dano':
        this.tremor[e.lado] = e.para < e.de ? 0.3 : 0;
        this.espera = 0.1;
        break;
      case 'cura': this.espera = 0.1; break;
      case 'status': this.espera = 0.08; break;
      case 'estagio': this.espera = 0.08; break;
      case 'desmaio': this.queda[e.lado] = 0.7; this.espera = 0.75; break;
      case 'sair': this.entradaSprite.aliado = 0; this.espera = 0.2; break;
      case 'entrar':
        this.queda[e.lado] = 0;
        this.entradaSprite[e.lado] = 0;
        this.mostraHP[e.lado] = this.b.lado(e.lado).enc.hp;
        if (e.lado === 'aliado') this.mostraXP = progressoXP(this.b.aliado.enc);
        this.espera = 0.35;
        break;
      case 'patua':
        this.patuaAnim = 0;
        this.patuaBalancos = e.balancos;
        this.espera = 0.45 + 0.35 * e.balancos;
        break;
      case 'evoluir': this.brilho = 1.1; this.espera = 1.15; break;
      case 'xp': case 'nivel': case 'aprender': case 'esquecer':
      case 'trocarForcado': case 'fim':
        this.espera = 0.05; break;
    }
  }

  /* chamado quando a fila esvazia: decide o que pedir ao jogador */
  private aoEsvaziar(): void {
    if (this.b.pendentesAprender.length > 0) {
      this.selEsquecer = 0;
      this.tela = 'esquecer';
      return;
    }
    if (this.b.aguardandoTroca) {
      this.trocaForcada = true;
      this.selTime = this.b.disponiveis()[0] ?? 0;
      this.tela = 'time';
      return;
    }
    if (this.b.resultado) {
      // a primeira passagem por aqui ainda pode enfileirar falas (o bicho
      // capturado entrando no time); só depois disso a cena se despede
      if (!this.encerrando) {
        this.encerrando = true;
        this.recolherCaptura();
        if (this.fila.length > 0) return;
      }
      // a troca de cena leva alguns quadros com fade; sem esta trava o aviso
      // de fim seria disparado uma vez por quadro até a cena sumir
      if (this.despediu) return;
      this.despediu = true;
      this.op.aoTerminar(this.b.resultado);
      return;
    }
    this.sel = 0;
    this.tela = 'comando';
  }

  private recolherCaptura(): void {
    if (this.b.resultado !== 'captura') return;
    const preso = this.b.inimigo.enc;
    const noTime = guardar(this.op.estado, preso);
    this.fila.push({ k: 'texto', t: noTime
      ? `${nome(preso)} entrou no seu time!`
      : `${nome(preso)} foi para a caixa da benzedeira.` });
  }

  /* ===================================================================
     Atualização
     =================================================================== */

  atualizar(dt: number, entrada: Entrada): void {
    this.relogio += dt;
    this.animar(dt);

    switch (this.tela) {
      case 'rodando': this.rodarFila(dt, entrada); break;
      case 'comando': this.navegarComando(entrada); break;
      case 'golpes': this.navegarGolpes(entrada); break;
      case 'mochila': this.navegarMochila(entrada); break;
      case 'time': this.navegarTime(entrada); break;
      case 'esquecer': this.navegarEsquecer(entrada); break;
    }
  }

  private animar(dt: number): void {
    for (const lado of ['aliado', 'inimigo'] as Lado[]) {
      // a barra de HP anda numa velocidade proporcional ao tamanho dela,
      // então tanto um bichinho quanto um chefe esvaziam em tempo parecido
      const alvo = this.b.lado(lado).enc.hp;
      const vel = Math.max(12, hpMaximo(this.b.lado(lado).enc) / 1.1);
      const d = alvo - this.mostraHP[lado];
      this.mostraHP[lado] += Math.sign(d) * Math.min(Math.abs(d), vel * dt);

      this.tremor[lado] = Math.max(0, this.tremor[lado] - dt);
      this.avanco[lado] = Math.max(0, this.avanco[lado] - dt);
      this.queda[lado] = Math.max(0, this.queda[lado] - dt);
      this.entradaSprite[lado] = Math.min(1, this.entradaSprite[lado] + dt / 0.3);
    }
    const alvoXP = progressoXP(this.b.aliado.enc);
    const dxp = alvoXP - this.mostraXP;
    this.mostraXP += Math.sign(dxp) * Math.min(Math.abs(dxp), 0.9 * dt);

    this.brilho = Math.max(0, this.brilho - dt);
    if (this.patuaAnim >= 0) {
      this.patuaAnim += dt;
      if (this.patuaAnim > 0.45 + 0.35 * this.patuaBalancos + 0.3) this.patuaAnim = -1;
    }
  }

  private rodarFila(dt: number, entrada: Entrada): void {
    // 1. frase em digitação
    if (this.linha !== null) {
      const total = this.linha.length;
      this.revelados = Math.min(total, this.revelados + CHARS_POR_SEG * dt);
      if (entrada.apertou('a')) {
        if (this.revelados < total) { this.revelados = total; return; }
        this.pausa = 0;
      }
      if (this.revelados >= total) {
        this.pausa -= dt;
        if (this.pausa <= 0) this.linha = null;
      }
      return;
    }
    // 2. animação em curso
    if (this.espera > 0) { this.espera -= dt; return; }
    if (this.barrasOcupadas()) return;

    // 3. próximo evento
    const e = this.fila.shift();
    if (!e) { this.aoEsvaziar(); return; }
    this.aplicar(e);
  }

  /* ------------------------------------------------------- navegação --- */

  private mover(entrada: Entrada, atual: number, total: number, cols: number): number {
    let i = atual;
    if (entrada.apertou('esq')) i -= 1;
    if (entrada.apertou('dir')) i += 1;
    if (entrada.apertou('cima')) i -= cols;
    if (entrada.apertou('baixo')) i += cols;
    if (total <= 0) return 0;
    return ((i % total) + total) % total;
  }

  private navegarComando(entrada: Entrada): void {
    this.sel = this.mover(entrada, this.sel, 4, 2);
    if (!entrada.apertou('a')) return;
    switch (this.sel) {
      case 0: this.selGolpe = 0; this.tela = 'golpes'; break;
      case 1: this.abrirMochila(); break;
      case 2: this.trocaForcada = false; this.selTime = 0; this.tela = 'time'; break;
      case 3: this.agir({ tipo: 'fugir' }); break;
    }
  }

  private navegarGolpes(entrada: Entrada): void {
    const n = Math.max(1, this.b.aliado.enc.golpes.length);
    this.selGolpe = this.mover(entrada, this.selGolpe, n, 2);
    if (entrada.apertou('b')) { this.tela = 'comando'; return; }
    if (!entrada.apertou('a')) return;
    const g = this.b.aliado.enc.golpes[this.selGolpe];
    if (g && g.pp <= 0) return;                 // sem PP: o cursor não obedece
    this.agir({ tipo: 'golpe', indice: this.selGolpe });
  }

  private abrirMochila(): void {
    this.itensUsaveis = ITENS_ORDEM.filter(
      (id) => fichaItem(id).emBatalha && (this.op.estado.mochila[id] ?? 0) > 0);
    this.selItem = 0;
    this.tela = 'mochila';
  }

  private navegarMochila(entrada: Entrada): void {
    this.selItem = this.mover(entrada, this.selItem, Math.max(1, this.itensUsaveis.length), 1);
    if (entrada.apertou('b')) { this.tela = 'comando'; return; }
    if (!entrada.apertou('a')) return;
    const id = this.itensUsaveis[this.selItem];
    if (!id) return;
    this.agir({ tipo: 'item', item: id });
  }

  private navegarTime(entrada: Entrada): void {
    const time = this.op.estado.time;
    this.selTime = this.mover(entrada, this.selTime, Math.max(1, time.length), 1);
    if (entrada.apertou('b') && !this.trocaForcada) { this.tela = 'comando'; return; }
    if (!entrada.apertou('a')) return;

    const alvo = time[this.selTime];
    if (!alvo || desmaiado(alvo) || this.selTime === this.b.iAliado) return;

    if (this.trocaForcada) {
      this.trocaForcada = false;
      this.enfileirar(this.b.trocarApos(this.selTime));
    } else {
      this.agir({ tipo: 'trocar', indice: this.selTime });
    }
  }

  private navegarEsquecer(entrada: Entrada): void {
    const pend = this.b.pendentesAprender[0];
    if (!pend) { this.tela = 'rodando'; return; }
    const alvo = this.op.estado.time[pend.indice];
    if (!alvo) { this.b.pendentesAprender.shift(); return; }

    // 4 golpes atuais + a opção de desistir do novo
    this.selEsquecer = this.mover(entrada, this.selEsquecer, alvo.golpes.length + 1, 1);
    if (!entrada.apertou('a')) return;

    if (this.selEsquecer < alvo.golpes.length) {
      const velho = fichaGolpe(alvo.golpes[this.selEsquecer]!.id).nome;
      substituirGolpe(alvo, this.selEsquecer, pend.golpe);
      this.fila.push({ k: 'texto', t: `${nome(alvo)} esqueceu ${velho}...` });
      this.fila.push({ k: 'texto', t: `...e aprendeu ${fichaGolpe(pend.golpe).nome}!` });
    } else {
      this.fila.push({ k: 'texto',
                       t: `${nome(alvo)} não aprendeu ${fichaGolpe(pend.golpe).nome}.` });
    }
    this.b.pendentesAprender.shift();
    this.painel.clear();
    this.tela = 'rodando';
  }

  private agir(a: AcaoJogador): void {
    this.painel.clear();          // nível/nome podem mudar no meio do turno
    this.enfileirar(this.b.executar(a));
  }

  /* ===================================================================
     Desenho
     =================================================================== */

  desenhar(r: Renderizador): void {
    r.sprite(this.fundo, 0, 0);
    this.desenharCombatente(r, 'inimigo');
    this.desenharCombatente(r, 'aliado');
    this.desenharPainel(r, 'inimigo');
    this.desenharPainel(r, 'aliado');

    if (this.brilho > 0) {          // clarão da evolução
      r.ctx.globalAlpha = Math.min(1, this.brilho);
      r.retangulo(0, 0, LARGURA, ALTURA, P.white!);
      r.ctx.globalAlpha = 1;
    }

    switch (this.tela) {
      case 'comando': this.desenharComando(r); break;
      case 'golpes': this.desenharGolpes(r); break;
      case 'mochila': this.desenharMochila(r); break;
      case 'time': this.desenharTime(r); break;
      case 'esquecer': this.desenharEsquecer(r); break;
      case 'rodando': this.desenharMensagem(r); break;
    }
  }

  private desenharCombatente(r: Renderizador, lado: Lado): void {
    const c = this.b.lado(lado);
    const inimigo = lado === 'inimigo';
    const { img, alt } = this.sprite(c.enc, inimigo);
    const posto = inimigo ? POSTO_INIMIGO : POSTO_ALIADO;
    let x = posto.cx - img.width / 2;
    let y = posto.base - alt;

    // entrada deslizando pela lateral
    const t = this.entradaSprite[lado];
    if (t < 1) x += (1 - t) * (lado === 'inimigo' ? 90 : -90);
    // tremida ao levar dano
    if (this.tremor[lado] > 0) x += Math.sin(this.relogio * 70) * 2;
    // avanço ao atacar
    if (this.avanco[lado] > 0) {
      const a = Math.sin((1 - this.avanco[lado] / 0.26) * Math.PI) * 7;
      x += lado === 'aliado' ? a : -a;
      y -= a * 0.3;
    }

    if (this.queda[lado] > 0 || desmaiado(c.enc)) {
      const q = this.queda[lado] > 0 ? 1 - this.queda[lado] / 0.7 : 1;
      r.ctx.globalAlpha = Math.max(0, 1 - q);
      y += q * 18;
    }
    r.sprite(img, x, y);
    r.ctx.globalAlpha = 1;

    if (this.patuaAnim >= 0 && lado === 'inimigo') this.desenharPatua(r, posto);
  }

  /* o patuá subindo, balançando e (talvez) abrindo */
  private desenharPatua(r: Renderizador, posto: { cx: number; base: number }): void {
    const t = this.patuaAnim;
    const voo = Math.min(1, t / 0.4);
    const x = 70 + (posto.cx - 70) * voo;
    const y = 96 - Math.sin(voo * Math.PI) * 45 - (posto.base - 96) * voo;
    const balanco = t > 0.45
      ? Math.sin((t - 0.45) * 14) * Math.max(0, this.patuaBalancos - (t - 0.45) / 0.35) * 1.2
      : 0;
    r.retangulo(x - 4 + balanco, y - 4, 8, 8, '#8d6f16');
    r.retangulo(x - 3 + balanco, y - 3, 6, 6, P.uiAcc!);
    r.retangulo(x - 2 + balanco, y - 3, 4, 1, '#f7e79a');
    r.retangulo(x - 1 + balanco, y - 5, 2, 2, '#c9553f');
  }

  private desenharPainel(r: Renderizador, lado: Lado): void {
    const c = this.b.lado(lado);
    const inimigo = lado === 'inimigo';
    const p = inimigo ? PAINEL_INI : PAINEL_ALI;
    r.sprite(this.molduraPainel(c.enc, inimigo), p.x, p.y);

    const max = hpMaximo(c.enc);
    const hp = Math.max(0, Math.round(this.mostraHP[lado]));
    const pct = Math.max(0, Math.min(1, hp / max));
    const larg = Math.round((HPB.w - 2) * pct);
    if (larg > 0) {
      const cor = UI.corHP(pct);
      r.retangulo(p.x + HPB.x + 1, p.y + HPB.y + 1, larg, HPB.h - 2, cor);
      r.retangulo(p.x + HPB.x + 1, p.y + HPB.y + 1, larg, 1, P.white!);
    }

    if (!inimigo) {
      const lx = Math.round((XPB.w - 2) * Math.max(0, Math.min(1, this.mostraXP)));
      if (lx > 0) r.retangulo(p.x + XPB.x + 1, p.y + XPB.y + 1, lx, XPB.h - 2, P.xp!);
      const s = `${hp}/${max}`;
      r.texto(s, p.x + PAINEL_W - 8 - larguraTexto(s), p.y + 21, P.uiInk!);
    }

    // à esquerda da barra: ou o rótulo HP, ou a etiqueta do estado alterado
    const st = c.enc.status;
    const sigla = st ? STATUS[st].sigla : c.feitico > 0 ? 'ENC' : null;
    if (!sigla) { r.texto('HP', p.x + 8, p.y + 14, P.uiAccD!); return; }
    const w = larguraTexto(sigla) + 6;
    r.retangulo(p.x + 4, p.y + 12, w + 2, 11, P.uiInk!);
    r.retangulo(p.x + 5, p.y + 13, w, 9, UI.statusCor(sigla));
    r.texto(sigla, p.x + 8, p.y + 14, P.uiInk!);
  }

  /* ------------------------------------------------------- caixa baixa - */

  private desenharMensagem(r: Renderizador): void {
    r.sprite(this.caixaMsg, 0, BARRA_Y);
    if (this.linha === null) return;
    let restantes = Math.floor(this.revelados);
    this.linhas.forEach((l, i) => {
      if (restantes <= 0) return;
      r.texto(l.slice(0, restantes), 14, BARRA_Y + 12 + i * 12, P.uiInk!);
      restantes -= l.length + 1;
    });
  }

  private desenharComando(r: Renderizador): void {
    r.sprite(this.caixaPergunta, 0, BARRA_Y);
    const pergunta = `O que ${nome(this.b.aliado.enc)} vai fazer?`;
    quebrar(pergunta, 126).forEach((l, i) => r.texto(l, 12, BARRA_Y + 14 + i * 12, P.uiInk!));

    r.sprite(this.caixaComandos, LARGURA - 96, BARRA_Y);
    const itens = ['LUTAR', 'PATUÁ', 'TIME', 'FUGIR'];
    itens.forEach((it, i) => {
      const x = LARGURA - 96 + 14 + (i % 2) * 42;
      const y = BARRA_Y + 13 + Math.floor(i / 2) * 17;
      if (i === this.sel) r.texto('=', x - 7, y, P.uiAccD!);
      r.texto(it, x, y, P.uiInk!);
    });
  }

  private desenharGolpes(r: Renderizador): void {
    const enc = this.b.aliado.enc;
    r.sprite(this.caixaGolpes, 0, BARRA_Y);
    enc.golpes.forEach((g, i) => {
      const f = fichaGolpe(g.id);
      const x = 16 + (i % 2) * 78;
      const y = BARRA_Y + 13 + Math.floor(i / 2) * 17;
      if (i === this.selGolpe) r.texto('=', x - 8, y, P.uiAccD!);
      r.texto(f.nome, x, y, g.pp > 0 ? P.uiInk! : P.uiBg3!);
    });

    r.sprite(this.caixaFicha, LARGURA - 78, BARRA_Y);
    const g = enc.golpes[this.selGolpe];
    if (!g) return;
    const f = fichaGolpe(g.id);
    const info = infoTipo(f.tipo);
    const fx = LARGURA - 78;
    r.retangulo(fx + 7, BARRA_Y + 6, larguraTexto(info.nome) + 8, 11, info.corD);
    r.retangulo(fx + 8, BARRA_Y + 7, larguraTexto(info.nome) + 6, 9, info.cor);
    r.texto(info.nome, fx + 11, BARRA_Y + 8, P.uiInk!);
    r.texto(`PP ${g.pp}/${g.ppMax}`, fx + 7, BARRA_Y + 22, g.pp > 0 ? P.uiInk! : P.hpRed!);
    r.texto(f.pot > 0 ? `POT ${f.pot}` : 'EFEITO', fx + 7, BARRA_Y + 34, P.uiInk!);
  }

  /* ------------------------------------------------------- telas cheias */

  private telaCheia(r: Renderizador, titulo: string, rodape: string): void {
    r.sprite(this.caixaCheia, 4, 4);
    r.texto(titulo, 14, 12, P.uiAccD!);
    r.retangulo(12, 23, LARGURA - 24, 1, P.uiBg3!);
    r.texto(rodape, 14, ALTURA - 18, P.uiBg3!);
  }

  private desenharMochila(r: Renderizador): void {
    this.telaCheia(r, 'MOCHILA', 'A USAR   B VOLTAR');
    if (this.itensUsaveis.length === 0) {
      r.texto('NADA AQUI DENTRO...', 22, 40, P.uiInk!);
      return;
    }
    this.itensUsaveis.forEach((id, i) => {
      const it = fichaItem(id);
      const y = 30 + i * 14;
      if (y > ALTURA - 26) return;
      if (i === this.selItem) r.texto('=', 14, y, P.uiAccD!);
      r.texto(it.nome, 24, y, P.uiInk!);
      const q = 'X' + (this.op.estado.mochila[id] ?? 0);
      r.texto(q, LARGURA - 20 - larguraTexto(q), y, P.uiInk!);
    });
  }

  private desenharTime(r: Renderizador): void {
    this.telaCheia(r, 'SEU TIME',
                   this.trocaForcada ? 'A ESCOLHER' : 'A TROCAR   B VOLTAR');
    this.op.estado.time.forEach((e, i) => {
      const y = 28 + i * 21;
      const caido = desmaiado(e);
      const emCampo = i === this.b.iAliado;
      if (i === this.selTime) r.texto('=', 12, y + 3, P.uiAccD!);
      r.texto(nome(e), 22, y, caido ? P.hpRed! : P.uiInk!);
      r.texto('NV' + e.nivel, 110, y, P.uiInk!);

      const max = hpMaximo(e);
      const pct = Math.max(0, e.hp / max);
      r.retangulo(134, y + 1, 50, 5, P.uiInk!);
      r.retangulo(135, y + 2, 48, 3, P.barBack!);
      if (pct > 0) r.retangulo(135, y + 2, Math.round(48 * pct), 3, UI.corHP(pct));
      const hp = `${e.hp}/${max}`;
      r.texto(hp, LARGURA - 20 - larguraTexto(hp), y, P.uiInk!);

      const tipo = ficha(e).tipos[0]!;
      r.retangulo(22, y + 9, 26, 8, TIPOS[tipo].corD);
      r.texto(TIPOS[tipo].nome.slice(0, 4), 24, y + 10, P.uiInk!);
      if (caido) r.texto('CAÍDO', 56, y + 10, P.hpRed!);
      else if (emCampo) r.texto('EM CAMPO', 56, y + 10, P.uiAccD!);
      else if (e.status) r.texto(STATUS[e.status].sigla, 56, y + 10, UI.statusCor(STATUS[e.status].sigla));
    });
  }

  private desenharEsquecer(r: Renderizador): void {
    const pend = this.b.pendentesAprender[0];
    if (!pend) return;
    const alvo = this.op.estado.time[pend.indice];
    if (!alvo) return;
    this.telaCheia(r, `${nome(alvo)} QUER APRENDER ${fichaGolpe(pend.golpe).nome}`,
                   'A CONFIRMAR');
    r.texto('ESQUECER QUAL GOLPE?', 14, 30, P.uiInk!);
    alvo.golpes.forEach((g, i) => {
      const f = fichaGolpe(g.id);
      const y = 48 + i * 15;
      if (i === this.selEsquecer) r.texto('=', 14, y, P.uiAccD!);
      r.texto(f.nome, 24, y, P.uiInk!);
      const info = infoTipo(f.tipo);
      r.retangulo(150, y - 1, 34, 9, info.corD);
      r.texto(info.nome.slice(0, 5), 152, y, P.uiInk!);
      r.texto(`${g.pp}/${g.ppMax}`, 192, y, P.uiInk!);
    });
    const y = 48 + alvo.golpes.length * 15;
    if (this.selEsquecer === alvo.golpes.length) r.texto('=', 14, y, P.uiAccD!);
    r.texto('NÃO APRENDER', 24, y, P.uiInk!);
  }
}
