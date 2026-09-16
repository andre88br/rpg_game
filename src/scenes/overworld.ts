/* =========================================================================
   Cena do mundo: andar pela cidade, esbarrar no cenario, conversar com NPCs.
   ========================================================================= */
import { assar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import { Mapa, TS, type DefMapa, type DefNPC } from '../world/tilemap.ts';
import { Camera } from '../world/camera.ts';
import { Ator, assarFolha, direcaoDe } from '../world/actor.ts';
import { ESTILOS, type Direcao } from '../art/people.ts';
import * as UI from '../art/ui.ts';
import * as T from '../art/tiles.ts';
import { P } from '../art/palette.ts';
import { quebrar, larguraTexto } from '../art/font.ts';
import { acaso } from '../core/rng.ts';
import { sortearSelvagem, type Encantado } from '../battle/encantado.ts';
import type { Treinador } from '../battle/engine.ts';
import type { Cenario } from '../art/battlebg.ts';
import { curarTime, temTimeEmPe, type EstadoJogo } from '../game/state.ts';

const LARG_DIALOGO = LARGURA - 12;
const CHARS_POR_SEG = 48;

interface Conversa {
  falante: string;
  linhas: string[];
  indice: number;
  revelados: number;
}

/* coisas do cenario que respondem ao botao A */
interface Aviso { nome: string; falas: string[] }

/* o que a cena de mundo precisa saber do resto do jogo */
export interface PedidoBatalha {
  oponentes: Encantado[];
  treinador?: Treinador | null;
  cenario?: Cenario;
}

export interface OpcoesCenaMundo {
  def: DefMapa;
  estado: EstadoJogo;
  aoBatalhar: (p: PedidoBatalha) => void;
}

export class CenaMundo implements Cena {
  private mapa!: Mapa;
  private camera = new Camera();
  private jogador!: Ator;
  private npcs: { ator: Ator; def: DefNPC }[] = [];
  private ocupados = new Set<string>();
  private avisos = new Map<string, Aviso>();

  private conversa: Conversa | null = null;
  private caixaDialogo!: Assado;
  private etiquetas = new Map<string, Assado>();
  private faixaNome!: Assado;
  private tempoFaixa = 0;
  private rocadas: Assado[] = [];
  private tempoAnim = 0;

  private op: OpcoesCenaMundo;
  private def: DefMapa;
  private montado = false;
  /* carência depois de uma batalha: sem isso o jogador volta ao mato e cai
     direto em outra luta, no mesmo passo */
  private carencia = 0;

  constructor(op: OpcoesCenaMundo) {
    this.op = op;
    this.def = op.def;
  }

  entrar(): void {
    // voltando de uma batalha o mapa já está montado: remontar jogaria fora
    // o canvas inteiro do cenário e devolveria o jogador ao ponto de partida
    if (this.montado) { this.tempoFaixa = 0; this.conversa = null; this.carencia = 0.6; return; }
    this.montado = true;
    this.mapa = new Mapa(this.def);

    this.jogador = new Ator(assarFolha(ESTILOS['taina']!),
                            this.def.inicio.tx, this.def.inicio.ty, this.def.inicio.dir);

    this.npcs = this.def.npcs.map((d) => ({
      def: d,
      ator: new Ator(assarFolha(ESTILOS[d.estilo] ?? ESTILOS['aldeao']!), d.tx, d.ty, d.dir),
    }));
    for (const n of this.npcs) this.ocupados.add(`${n.ator.tx},${n.ator.ty}`);

    // objetos do cenario que podem ser lidos
    for (const o of this.def.objetos) {
      if (o.tipo === 'barreira') {
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'BARREIRA',
            falas: ['Uma barreira fecha a entrada do terreiro.'],
          });
        }
      } else if (o.tipo === 'placa' && o.placa) {
        this.avisos.set(`${o.tx},${o.ty}`, { nome: 'PLACA', falas: [o.placa] });
      }
    }

    // recursos visuais assados uma vez
    this.caixaDialogo = assar(UI.caixa(LARG_DIALOGO, 14 + 3 * 10));
    const nome = this.mapa.nome;
    const faixa = UI.caixa(larguraTexto(nome) + 20, 20);
    UI.textoNaCaixa(faixa, nome, 10, 6);
    this.faixaNome = assar(faixa);
    this.tempoFaixa = 2.6;
    this.rocadas = [assar(T.rocada(0)), assar(T.rocada(1)), assar(T.rocada(2))];

    this.camera.seguir(this.jogador.px + TS / 2, this.jogador.py + TS / 2,
                       this.mapa.larguraPx, this.mapa.alturaPx);
  }

  private etiqueta(falante: string): Assado {
    let e = this.etiquetas.get(falante);
    if (e) return e;
    const w = larguraTexto(falante) + 10;
    const tag = UI.caixa(w, 17, { fundo: P.uiAcc, borda2: P.uiAccD });
    UI.textoNaCaixa(tag, falante, 5, 5);
    e = assar(tag);
    this.etiquetas.set(falante, e);
    return e;
  }

  private abrirConversa(falante: string, falas: readonly string[]): void {
    const linhas: string[] = [];
    for (const f of falas) linhas.push(...quebrar(f, LARG_DIALOGO - 18).join('\n').split('\n'));
    // agrupa em paginas de ate 3 linhas
    this.conversa = { falante, linhas, indice: 0, revelados: 0 };
  }

  private paginaAtual(): string[] {
    if (!this.conversa) return [];
    return this.conversa.linhas.slice(this.conversa.indice, this.conversa.indice + 3);
  }

  private textoDaPagina(): string { return this.paginaAtual().join(' '); }

  private interagir(): void {
    const { tx, ty } = this.jogador.frente();

    const npc = this.npcs.find((n) => n.ator.tx === tx && n.ator.ty === ty);
    if (npc) {
      npc.ator.olharPara(this.jogador.tx, this.jogador.ty);
      this.abrirConversa(npc.def.nome, npc.def.falas);
      return;
    }
    const aviso = this.avisos.get(`${tx},${ty}`);
    if (aviso) this.abrirConversa(aviso.nome, aviso.falas);
  }

  atualizar(dt: number, entrada: Entrada): void {
    this.tempoAnim += dt;
    if (this.tempoFaixa > 0) this.tempoFaixa -= dt;

    // ---- conversa em andamento: trava o movimento ----
    if (this.conversa) {
      const total = this.textoDaPagina().length;
      this.conversa.revelados = Math.min(total, this.conversa.revelados + CHARS_POR_SEG * dt);
      if (entrada.apertou('a')) {
        if (this.conversa.revelados < total) {
          this.conversa.revelados = total;            // primeiro A: revela tudo
        } else {
          this.conversa.indice += 3;                  // segundo A: proxima pagina
          this.conversa.revelados = 0;
          if (this.conversa.indice >= this.conversa.linhas.length) this.conversa = null;
        }
      }
      if (entrada.apertou('b')) this.conversa = null;
      return;
    }

    // ---- andar ----
    const { x, y } = entrada.direcao();
    const dir: Direcao | null = direcaoDe(x, y);
    this.jogador.comandar(this.mapa, dir, entrada.segurando('b'),
                          (tx, ty) => this.ocupados.has(`${tx},${ty}`));
    const chegou = this.jogador.atualizar(dt);

    if (this.carencia > 0) this.carencia -= dt;
    if (chegou && this.carencia <= 0
        && this.mapa.temEncontro(this.jogador.tx, this.jogador.ty)) {
      this.talvezEncontro();
    }

    if (entrada.apertou('a')) this.interagir();

    this.camera.seguir(this.jogador.px + TS / 2, this.jogador.py + TS / 2,
                       this.mapa.larguraPx, this.mapa.alturaPx);
  }

  /* um passo no mato alto: às vezes vira encontro */
  private talvezEncontro(): void {
    const tabela = this.def.encontros;
    if (!tabela || tabela.length === 0) return;
    if (!temTimeEmPe(this.op.estado)) return;

    const media = this.def.passosPorEncontro ?? 10;
    if (!acaso.chance(100 / media)) return;

    this.op.aoBatalhar({
      oponentes: [sortearSelvagem(tabela, acaso)],
      cenario: this.def.cenario ?? 'praia',
    });
  }

  /* chamado pelo main quando o jogador perde: o time é curado e o jogador
     acorda de volta no começo do mapa */
  socorrer(): void {
    curarTime(this.op.estado);
    this.jogador.teleportar(this.def.inicio.tx, this.def.inicio.ty, this.def.inicio.dir);
    this.camera.seguir(this.jogador.px + TS / 2, this.jogador.py + TS / 2,
                       this.mapa.larguraPx, this.mapa.alturaPx);
    this.carencia = 1;
    this.abrirConversa('DONA FIRMINA', [
      'Eita, moça, você apagou no meio do mato!',
      'Benzi seus Encantados e te trouxe de volta. Vá com mais juízo.',
    ]);
  }

  desenhar(r: Renderizador): void {
    r.limpar('#101018');
    this.mapa.desenhar(r.ctx, this.camera.x, this.camera.y, LARGURA, ALTURA);

    // atores ordenados pela base: quem está mais abaixo passa na frente
    const todos = [this.jogador, ...this.npcs.map((n) => n.ator)];
    todos.sort((a, b) => a.py - b.py);
    for (const a of todos) {
      r.sprite(a.quadro(), a.px - this.camera.x, a.desenhoY - this.camera.y);
      if (this.mapa.temEncontro(a.tx, a.ty)) {
        const q = a.movendo ? 1 + (Math.floor(this.tempoAnim * 12) % 2) : 0;
        r.sprite(this.rocadas[q]!, a.px - this.camera.x, a.py + 8 - this.camera.y);
      }
    }

    // faixa com o nome da cidade, ao entrar
    if (this.tempoFaixa > 0) {
      const t = Math.min(1, this.tempoFaixa / 0.4);
      r.ctx.globalAlpha = t;
      r.sprite(this.faixaNome, 6, 6);
      r.ctx.globalAlpha = 1;
    }

    if (this.conversa) this.desenharDialogo(r);
  }

  private desenharDialogo(r: Renderizador): void {
    const c = this.conversa!;
    const y = ALTURA - this.caixaDialogo.height - 6;
    r.sprite(this.caixaDialogo, 6, y);
    r.sprite(this.etiqueta(c.falante), 12, y - 11);

    // efeito de maquina de escrever: revela a pagina caractere a caractere
    let restantes = Math.floor(c.revelados);
    this.paginaAtual().forEach((linha, i) => {
      if (restantes <= 0) return;
      const visivel = linha.slice(0, restantes);
      restantes -= linha.length + 1;
      r.texto(visivel, 14, y + 8 + i * 10, P.uiInk!);
    });

    const completo = Math.floor(c.revelados) >= this.textoDaPagina().length;
    if (completo && Math.floor(this.tempoAnim * 3) % 2 === 0) {
      r.texto('v', LARGURA - 20, y + this.caixaDialogo.height - 12, P.uiAccD!);
    }
  }
}
