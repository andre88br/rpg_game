/* =========================================================================
   Cena do mundo: andar pela região, esbarrar no cenário, conversar com NPCs
   e atravessar portas.

   A cena é criada UMA vez e vive a partida inteira: trocar de mapa troca o
   `Mapa` e os NPCs, mas o jogador, a câmera e os recursos assados continuam
   os mesmos. Remontar tudo a cada porta jogaria fora o canvas do cenário e
   apareceria como um tranco na tela.
   ========================================================================= */
import { assar, type Assado } from '../core/buf.ts';
import { LARGURA, ALTURA, type Renderizador } from '../core/renderer.ts';
import type { Cena } from '../core/scene.ts';
import type { Entrada } from '../core/input.ts';
import { Mapa, TS, type DefMapa, type DefNPC, type DefSaida } from '../world/tilemap.ts';
import type { Mundo } from '../world/mundo.ts';
import { colunaPorta } from '../art/tiles.ts';
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
/* meio segundo de escuro entre um mapa e outro: sem isso a troca é um tranco */
const FADE = 0.18;

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
  mundo: Mundo;
  estado: EstadoJogo;
  aoBatalhar: (p: PedidoBatalha) => void;
}

export class CenaMundo implements Cena {
  private mapa!: Mapa;
  private def!: DefMapa;
  private camera = new Camera();
  private jogador!: Ator;
  private npcs: { ator: Ator; def: DefNPC }[] = [];
  private ocupados = new Set<string>();
  private avisos = new Map<string, Aviso>();

  private conversa: Conversa | null = null;
  private caixaDialogo!: Assado;
  private etiquetas = new Map<string, Assado>();
  private faixaNome: Assado | null = null;
  private tempoFaixa = 0;
  private rocadas: Assado[] = [];
  private tempoAnim = 0;

  private op: OpcoesCenaMundo;
  private montado = false;
  /* carência depois de uma batalha: sem isso o jogador volta ao mato e cai
     direto em outra luta, no mesmo passo */
  private carencia = 0;
  /* troca de mapa em andamento: some, troca, volta */
  private indo: DefSaida | null = null;
  private fade = 0;

  constructor(op: OpcoesCenaMundo) {
    this.op = op;
  }

  entrar(): void {
    // voltando de uma batalha o mundo já está montado: remontar jogaria fora
    // o canvas do cenário e devolveria o jogador ao ponto de partida
    if (this.montado) { this.tempoFaixa = 0; this.conversa = null; this.carencia = 0.6; return; }
    this.montado = true;

    // recursos visuais assados uma vez, valem para todos os mapas
    this.caixaDialogo = assar(UI.caixa(LARG_DIALOGO, 14 + 3 * 10));
    this.rocadas = [assar(T.rocada(0)), assar(T.rocada(1)), assar(T.rocada(2))];

    const pos = this.op.estado.posicao;
    this.jogador = new Ator(assarFolha(ESTILOS['taina']!), pos.tx, pos.ty, pos.dir);
    this.montarMapa(pos.mapa);
    this.jogador.teleportar(pos.tx, pos.ty, pos.dir);
    this.centrarCamera();
  }

  /* troca o cenário, os NPCs e os avisos; o jogador continua sendo o mesmo */
  private montarMapa(id: string): void {
    this.mapa = this.op.mundo.obter(id);
    this.def = this.op.mundo.def(id);
    this.conversa = null;

    this.npcs = this.def.npcs.map((d) => ({
      def: d,
      ator: new Ator(assarFolha(ESTILOS[d.estilo] ?? ESTILOS['aldeao']!), d.tx, d.ty, d.dir),
    }));
    this.ocupados = new Set(this.npcs.map((n) => `${n.ator.tx},${n.ator.ty}`));

    // objetos do cenário que podem ser lidos com o A
    this.avisos = new Map();
    for (const o of this.def.objetos) {
      if (o.tipo === 'barreira') {
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'BARREIRA', falas: ['Uma barreira fecha a passagem.'],
          });
        }
      } else if (o.tipo === 'portao') {
        const acesas = o.contas ?? 0;
        for (let i = 0; i < (o.larg ?? 1); i++) {
          this.avisos.set(`${o.tx + i},${o.ty}`, {
            nome: 'GUIA DO TERREIRO',
            falas: acesas === 0
              ? ['Uma guia de cinco contas atravessa o pátio. Todas apagadas.',
                 'Cada serviço bem feito na região acende uma. Com as cinco acesas, a guia se abre.']
              : [`A guia tem ${acesas} de cinco contas acesas.`,
                 'Faltam serviços por fazer nesta região.'],
          });
        }
      } else if (o.tipo === 'placa' && o.placa) {
        this.avisos.set(`${o.tx},${o.ty}`, { nome: 'PLACA', falas: [o.placa] });
      } else if (o.trancada) {
        const col = colunaPorta(o.larg ?? 4, o.portaCol);
        this.avisos.set(`${o.tx + col},${o.ty + (o.alt ?? 3) - 1}`, {
          nome: 'PORTA', falas: ['Está trancada. Não tem ninguém em casa.'],
        });
      }
    }

    // faixa com o nome do lugar — dentro de casa ela só atrapalharia
    if (this.def.interior) {
      this.faixaNome = null;
      this.tempoFaixa = 0;
    } else {
      const faixa = UI.caixa(larguraTexto(this.mapa.nome) + 20, 20);
      UI.textoNaCaixa(faixa, this.mapa.nome, 10, 6);
      this.faixaNome = assar(faixa);
      this.tempoFaixa = 2.6;
    }

    // abrigo: é aqui que se acorda depois de apagar no mato
    if (this.def.refugio) {
      this.op.estado.refugio = { mapa: id, ...this.def.inicio };
    }
    this.op.estado.posicao = { mapa: id, tx: this.jogador.tx, ty: this.jogador.ty,
                               dir: this.jogador.dir };
  }

  private centrarCamera(): void {
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
    // saída que não dispara ao pisar: só com o A, de frente para ela
    const saida = this.mapa.saidaEm(tx, ty);
    if (saida && saida.aoPisar === false) { this.indo = saida; this.fade = 0; return; }

    const aviso = this.avisos.get(`${tx},${ty}`);
    if (aviso) this.abrirConversa(aviso.nome, aviso.falas);
  }

  atualizar(dt: number, entrada: Entrada): void {
    this.tempoAnim += dt;
    if (this.tempoFaixa > 0) this.tempoFaixa -= dt;

    // ---- atravessando uma porta: nada responde enquanto a tela escurece ----
    if (this.indo) { this.atravessar(dt); return; }

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

    if (chegou) {
      const p = this.op.estado.posicao;
      p.mapa = this.def.id; p.tx = this.jogador.tx; p.ty = this.jogador.ty;
      p.dir = this.jogador.dir;

      const saida = this.mapa.saidaEm(this.jogador.tx, this.jogador.ty);
      if (saida && saida.aoPisar !== false) {
        this.indo = saida; this.fade = 0;
      } else if (this.carencia <= 0 && this.mapa.temEncontro(this.jogador.tx, this.jogador.ty)) {
        this.talvezEncontro();
      }
    }

    if (entrada.apertou('a')) this.interagir();

    this.centrarCamera();
  }

  /* a passagem inteira: escurece, troca o mapa na metade, clareia */
  private atravessar(dt: number): void {
    const antes = this.fade;
    this.fade += dt;
    if (antes < FADE && this.fade >= FADE) {
      const s = this.indo!;
      this.jogador.teleportar(s.destino.tx, s.destino.ty, s.destino.dir);
      this.montarMapa(s.para);
      this.carencia = 0.4;
      this.centrarCamera();
    }
    if (this.fade >= FADE * 2) { this.indo = null; this.fade = 0; }
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
     acorda no último abrigo por onde passou */
  socorrer(): void {
    curarTime(this.op.estado);
    const r = this.op.estado.refugio;
    this.jogador.teleportar(r.tx, r.ty, r.dir);
    if (r.mapa !== this.def.id) this.montarMapa(r.mapa);
    this.centrarCamera();
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

    // faixa com o nome do lugar, ao chegar
    if (this.tempoFaixa > 0 && this.faixaNome) {
      const t = Math.min(1, this.tempoFaixa / 0.4);
      r.ctx.globalAlpha = t;
      r.sprite(this.faixaNome, 6, 6);
      r.ctx.globalAlpha = 1;
    }

    if (this.conversa) this.desenharDialogo(r);

    if (this.indo) {
      const t = this.fade <= FADE ? this.fade / FADE : 1 - (this.fade - FADE) / FADE;
      r.ctx.globalAlpha = Math.max(0, Math.min(1, t));
      r.limpar('#000000');
      r.ctx.globalAlpha = 1;
    }
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
