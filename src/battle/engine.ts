/* =========================================================================
   Motor de batalha: a máquina de turnos.

   O motor NÃO desenha nada e não sabe quanto tempo uma animação demora. Ele
   recebe a ação do jogador, resolve o turno inteiro e devolve uma FILA DE
   EVENTOS na ordem em que aconteceram. A cena de batalha consome essa fila
   no ritmo dela.

   Essa separação é o que permite testar uma batalha inteira num teste de
   texto, sem canvas, e é o que deixa a cena ser só apresentação.
   ========================================================================= */
import { Aleatorio } from '../core/rng.ts';
import type { Tipo } from '../art/palette.ts';
import { golpe as fichaGolpe, type Golpe, type ChaveStat } from '../data/moves.ts';
import { item as fichaItem, consumir, type Mochila } from '../data/items.ts';
import {
  atributos, curar, desmaiado, ficha, ganharXP, hpMaximo, nome, reviver,
  semPP, tipos, xpPorDerrotar, evoluir, type Encantado,
} from './encantado.ts';
import {
  aplicarEstagio, calcularDano, acertou, temAfinidade,
  ESTAGIO_MAX, ESTAGIO_MIN,
} from './damage.ts';
import { eficacia, fraseEficacia } from './typechart.ts';
import { tentarCaptura } from './capture.ts';
import {
  CHANCE_AUTO_GOLPE, CHANCE_TRAVAR_PARALISADO, DANO_POR_TURNO,
  FATOR_ATAQUE_QUEIMADO, FATOR_VELOCIDADE_PARALISADO, POTENCIA_AUTO_GOLPE,
  STATUS, TURNOS_FEITICO, TURNOS_SONO, type Status,
} from './status.ts';

export type Lado = 'aliado' | 'inimigo';

/* ------------------------------------------------------------- eventos */

export type Evento =
  | { k: 'texto'; t: string }
  | { k: 'golpe'; lado: Lado; golpe: string }
  | { k: 'errou'; lado: Lado }
  | { k: 'dano'; lado: Lado; de: number; para: number; critico: boolean; eficacia: number }
  | { k: 'cura'; lado: Lado; de: number; para: number }
  | { k: 'status'; lado: Lado; status: Status | null }
  | { k: 'quebranto'; lado: Lado; ativo: boolean }
  | { k: 'estagio'; lado: Lado; stat: ChaveStat; passos: number }
  | { k: 'desmaio'; lado: Lado }
  | { k: 'entrar'; lado: Lado; indice: number }
  | { k: 'sair'; lado: Lado }
  | { k: 'patua'; balancos: number; capturado: boolean }
  | { k: 'xp'; ganho: number }
  | { k: 'nivel'; nivel: number }
  | { k: 'evoluir'; de: string; para: string }
  | { k: 'aprender'; golpe: string }
  | { k: 'esquecer'; golpe: string }        // precisa de escolha do jogador
  | { k: 'trocarForcado' }                  // seu Encantado caiu: escolha outro
  | { k: 'fim'; resultado: Resultado };

export type Resultado = 'vitoria' | 'derrota' | 'fuga' | 'captura';

/* -------------------------------------------------------------- ações */

export type AcaoJogador =
  | { tipo: 'golpe'; indice: number }
  | { tipo: 'item'; item: string; alvo?: number }
  | { tipo: 'trocar'; indice: number }
  | { tipo: 'fugir' };

type AcaoInterna =
  | { tipo: 'golpe'; indice: number; lado: Lado }
  | { tipo: 'item'; item: string; alvo?: number; lado: Lado }
  | { tipo: 'trocar'; indice: number; lado: Lado }
  | { tipo: 'fugir'; lado: Lado };

/* --------------------------------------------------------- combatente */

export interface Estagios { atq: number; def: number; esp: number; vel: number }

export interface Combatente {
  enc: Encantado;
  estagios: Estagios;
  feitico: number;          // turnos restantes de enfeitiçado (0 = são)
}

function envolver(e: Encantado): Combatente {
  return { enc: e, estagios: { atq: 0, def: 0, esp: 0, vel: 0 }, feitico: 0 };
}

/* --------------------------------------------------------- treinador */

export interface Treinador {
  nome: string;
  classe: string;           // "PESCADOR", "DONA DO TERREIRO"...
  falaInicio?: string;
  falaDerrota?: string;
  premio?: number;
}

export interface OpcoesBatalha {
  time: Encantado[];               // referências vivas do time do jogador
  oponentes: Encantado[];
  treinador?: Treinador | null;    // ausente = batalha selvagem
  mochila?: Mochila;
  semente?: number;
  podeFugir?: boolean;
}

/* ===================================================================== */

export class Batalha {
  readonly time: Encantado[];
  readonly oponentes: Encantado[];
  readonly treinador: Treinador | null;
  readonly selvagem: boolean;
  readonly mochila: Mochila;
  readonly rnd: Aleatorio;
  readonly podeFugir: boolean;

  aliado: Combatente;
  inimigo: Combatente;
  iAliado = 0;
  iInimigo = 0;

  resultado: Resultado | null = null;
  aguardandoTroca = false;         // seu Encantado caiu e falta escolher outro
  turno = 0;
  private tentativasFuga = 0;
  /* golpes que subiram de nível mas não couberam nos quatro espaços */
  pendentesAprender: { indice: number; golpe: string }[] = [];

  constructor(op: OpcoesBatalha) {
    this.time = op.time;
    this.oponentes = op.oponentes;
    this.treinador = op.treinador ?? null;
    this.selvagem = !this.treinador;
    this.mochila = op.mochila ?? {};
    this.rnd = new Aleatorio(op.semente);
    this.podeFugir = op.podeFugir ?? this.selvagem;

    this.iAliado = this.time.findIndex((e) => !desmaiado(e));
    if (this.iAliado < 0) this.iAliado = 0;
    this.aliado = envolver(this.time[this.iAliado]!);
    this.inimigo = envolver(this.oponentes[0]!);
  }

  /* ---------------------------------------------------------- consultas */

  get terminou(): boolean { return this.resultado !== null; }

  lado(l: Lado): Combatente { return l === 'aliado' ? this.aliado : this.inimigo; }
  oposto(l: Lado): Lado { return l === 'aliado' ? 'inimigo' : 'aliado'; }

  /* golpe que o índice do menu representa, já contando o Esforço */
  golpeDe(c: Combatente, indice: number): Golpe {
    if (semPP(c.enc)) return fichaGolpe('esforco');
    const g = c.enc.golpes[indice];
    if (!g || g.pp <= 0) return fichaGolpe('esforco');
    return fichaGolpe(g.id);
  }

  /* quem do time ainda pode lutar */
  disponiveis(): number[] {
    return this.time.map((e, i) => (!desmaiado(e) && i !== this.iAliado ? i : -1))
                    .filter((i) => i >= 0);
  }

  /* ----------------------------------------------------- abertura da luta */

  abrir(): Evento[] {
    const ev: Evento[] = [];
    if (this.selvagem) {
      ev.push({ k: 'texto', t: `Um ${nome(this.inimigo.enc)} selvagem apareceu!` });
    } else {
      const t = this.treinador!;
      ev.push({ k: 'texto', t: `${t.classe} ${t.nome} quer lutar!` });
      if (t.falaInicio) ev.push({ k: 'texto', t: t.falaInicio });
      ev.push({ k: 'texto', t: `${t.nome} mandou ${nome(this.inimigo.enc)}!` });
    }
    ev.push({ k: 'texto', t: `Vai lá, ${nome(this.aliado.enc)}!` });
    return ev;
  }

  /* ===================================================================
     TURNO
     =================================================================== */

  executar(acao: AcaoJogador): Evento[] {
    if (this.terminou || this.aguardandoTroca) return [];
    this.turno++;
    const ev: Evento[] = [];

    const minha: AcaoInterna = { ...acao, lado: 'aliado' } as AcaoInterna;
    const dele: AcaoInterna = { ...this.decidirIA(), lado: 'inimigo' } as AcaoInterna;

    for (const a of this.ordenar(minha, dele)) {
      if (this.terminou || this.aguardandoTroca) break;
      if (desmaiado(this.lado(a.lado).enc)) continue;
      this.executarAcao(a, ev);
    }

    if (!this.terminou && !this.aguardandoTroca) this.fimDeTurno(ev);
    return ev;
  }

  /* ------------------------------------------------------------- ordem
     Trocar, usar item e fugir vêm antes de qualquer golpe. Entre golpes
     manda a prioridade; empatou, manda a velocidade; empatou de novo, o
     acaso decide. */
  private ordenar(a: AcaoInterna, b: AcaoInterna): AcaoInterna[] {
    const pri = (x: AcaoInterna): number =>
      x.tipo === 'golpe' ? (this.golpeDe(this.lado(x.lado), x.indice).prioridade ?? 0) : 6;

    const pa = pri(a), pb = pri(b);
    if (pa !== pb) return pa > pb ? [a, b] : [b, a];

    const va = this.velocidade(this.lado(a.lado));
    const vb = this.velocidade(this.lado(b.lado));
    if (va !== vb) return va > vb ? [a, b] : [b, a];
    return this.rnd.chance(50) ? [a, b] : [b, a];
  }

  private velocidade(c: Combatente): number {
    let v = aplicarEstagio(atributos(c.enc).vel, c.estagios.vel);
    if (c.enc.status === 'paralisado') v = Math.floor(v * FATOR_VELOCIDADE_PARALISADO);
    return v;
  }

  /* ------------------------------------------------------- uma ação só */

  private executarAcao(a: AcaoInterna, ev: Evento[]): void {
    switch (a.tipo) {
      case 'trocar': return this.acaoTrocar(a.lado, a.indice, ev);
      case 'item':   return this.acaoItem(a.lado, a.item, a.alvo, ev);
      case 'fugir':  return this.acaoFugir(a.lado, ev);
      case 'golpe':  return this.acaoGolpe(a.lado, a.indice, ev);
    }
  }

  /* ---------------------------------------------------------- trocar */

  private acaoTrocar(lado: Lado, indice: number, ev: Evento[]): void {
    if (lado !== 'aliado') return;              // a IA desta fase não troca
    const alvo = this.time[indice];
    if (!alvo || desmaiado(alvo) || indice === this.iAliado) return;
    ev.push({ k: 'texto', t: `Volta, ${nome(this.aliado.enc)}!` });
    ev.push({ k: 'sair', lado: 'aliado' });
    ev.push({ k: 'quebranto', lado: 'aliado', ativo: false });
    this.iAliado = indice;
    this.aliado = envolver(alvo);               // estágios zeram ao trocar
    ev.push({ k: 'entrar', lado: 'aliado', indice });
    ev.push({ k: 'texto', t: `Vai lá, ${nome(alvo)}!` });
  }

  /* troca obrigatória depois que o seu Encantado desmaia */
  trocarApos(indice: number): Evento[] {
    if (!this.aguardandoTroca) return [];
    const alvo = this.time[indice];
    if (!alvo || desmaiado(alvo)) return [];
    this.aguardandoTroca = false;
    this.iAliado = indice;
    this.aliado = envolver(alvo);
    return [
      { k: 'entrar', lado: 'aliado', indice },
      { k: 'texto', t: `Vai lá, ${nome(alvo)}!` },
    ];
  }

  /* ------------------------------------------------------------ item */

  private acaoItem(lado: Lado, id: string, alvo: number | undefined, ev: Evento[]): void {
    if (lado !== 'aliado') return;
    const it = fichaItem(id);
    if (!consumir(this.mochila, id)) return;
    ev.push({ k: 'texto', t: `Você usou ${it.nome}.` });
    const ef = it.efeito;

    if (ef.k === 'patua') {
      if (!this.selvagem) {
        ev.push({ k: 'texto', t: 'Não se prende o Encantado dos outros!' });
        return;
      }
      const r = tentarCaptura(this.inimigo.enc, ef.bonus, this.rnd);
      ev.push({ k: 'patua', balancos: r.balancos, capturado: r.capturado });
      if (r.capturado) {
        ev.push({ k: 'texto', t: `${nome(this.inimigo.enc)} foi preso no patuá!` });
        this.inimigo.enc.selvagem = false;
        this.resultado = 'captura';
        ev.push({ k: 'fim', resultado: 'captura' });
      } else {
        ev.push({ k: 'texto', t: 'Ah! Escapou por pouco!' });
      }
      return;
    }

    const destino = this.time[alvo ?? this.iAliado];
    if (!destino) return;

    if (ef.k === 'cura') {
      if (desmaiado(destino)) { ev.push({ k: 'texto', t: 'Não adiantou nada.' }); return; }
      const antes = destino.hp;
      const ganho = curar(destino, ef.hp);
      if (destino === this.aliado.enc) {
        ev.push({ k: 'cura', lado: 'aliado', de: antes, para: destino.hp });
      }
      ev.push({ k: 'texto', t: `${nome(destino)} recuperou ${ganho} de fôlego.` });
    } else if (ef.k === 'limpar') {
      if (!destino.status) { ev.push({ k: 'texto', t: 'Não adiantou nada.' }); return; }
      destino.status = null;
      destino.turnosStatus = 0;
      if (destino === this.aliado.enc) ev.push({ k: 'status', lado: 'aliado', status: null });
      ev.push({ k: 'texto', t: `${nome(destino)} se sente bem melhor.` });
    } else if (ef.k === 'reviver') {
      if (!desmaiado(destino)) { ev.push({ k: 'texto', t: 'Não adiantou nada.' }); return; }
      reviver(destino, ef.fracao);
      ev.push({ k: 'texto', t: `${nome(destino)} voltou a si!` });
    }
  }

  /* ------------------------------------------------------------ fugir */

  private acaoFugir(lado: Lado, ev: Evento[]): void {
    if (lado !== 'aliado') return;
    if (!this.podeFugir) {
      ev.push({ k: 'texto', t: 'Não dá pra fugir de uma luta marcada!' });
      return;
    }
    this.tentativasFuga++;
    const meu = this.velocidade(this.aliado);
    const dele = Math.max(1, this.velocidade(this.inimigo));
    // mais rápido foge quase sempre; mais lento melhora a cada tentativa
    const chance = Math.min(95, (meu / dele) * 50 + 20 * this.tentativasFuga);
    if (this.rnd.chance(chance)) {
      ev.push({ k: 'texto', t: 'Você escapou!' });
      this.resultado = 'fuga';
      ev.push({ k: 'fim', resultado: 'fuga' });
    } else {
      ev.push({ k: 'texto', t: 'Não deu pra escapar!' });
    }
  }

  /* ------------------------------------------------------------ golpe */

  private acaoGolpe(lado: Lado, indice: number, ev: Evento[]): void {
    const eu = this.lado(lado);
    const alvoLado = this.oposto(lado);
    const alvo = this.lado(alvoLado);

    if (!this.podeAgir(lado, eu, ev)) return;

    const g = this.golpeDe(eu, indice);
    // gasta PP do golpe escolhido (Esforço não sai da lista, logo não gasta)
    const aprendido = eu.enc.golpes[indice];
    if (aprendido && aprendido.id === g.id && aprendido.pp > 0) aprendido.pp--;

    ev.push({ k: 'golpe', lado, golpe: g.id });
    ev.push({ k: 'texto', t: `${nome(eu.enc)} usou ${g.nome}!` });

    if (!acertou(g.precisao, this.rnd)) {
      ev.push({ k: 'errou', lado });
      ev.push({ k: 'texto', t: 'Mas errou!' });
      return;
    }

    let causado = 0;
    if (g.categoria !== 'estado') {
      causado = this.aplicarGolpe(g, eu, alvoLado, alvo, ev);
    }

    if (g.efeito) this.aplicarEfeito(g, lado, eu, alvoLado, alvo, causado, ev);

    if (desmaiado(alvo.enc)) this.derrubar(alvoLado, ev);
    else if (desmaiado(eu.enc)) this.derrubar(lado, ev);
  }

  /* trava do turno: sono, paralisia e feitiço acontecem ANTES do golpe */
  private podeAgir(lado: Lado, c: Combatente, ev: Evento[]): boolean {
    if (c.enc.status === 'dormindo') {
      if (c.enc.turnosStatus > 0) {
        c.enc.turnosStatus--;
        ev.push({ k: 'texto', t: `${nome(c.enc)} está dormindo...` });
        return false;
      }
      c.enc.status = null;
      ev.push({ k: 'status', lado, status: null });
      ev.push({ k: 'texto', t: `${nome(c.enc)} ${STATUS.dormindo.aoSair}` });
    }

    if (c.feitico > 0) {
      c.feitico--;
      if (c.feitico === 0) {
        ev.push({ k: 'quebranto', lado, ativo: false });
        ev.push({ k: 'texto', t: `${nome(c.enc)} se livrou do quebranto.` });
      } else {
        ev.push({ k: 'texto', t: `${nome(c.enc)} está com quebranto...` });
        if (this.rnd.chance(CHANCE_AUTO_GOLPE)) {
          const st = atributos(c.enc);
          const r = calcularDano({
            nivel: c.enc.nivel,
            ataque: aplicarEstagio(st.atq, c.estagios.atq),
            defesa: aplicarEstagio(st.def, c.estagios.def),
            potencia: POTENCIA_AUTO_GOLPE,
            afinidade: false, eficacia: 1,
          }, this.rnd);
          const antes = c.enc.hp;
          c.enc.hp = Math.max(0, c.enc.hp - r.dano);
          ev.push({ k: 'dano', lado, de: antes, para: c.enc.hp, critico: false, eficacia: 1 });
          ev.push({ k: 'texto', t: 'E se acertou sozinho na confusão!' });
          if (desmaiado(c.enc)) this.derrubar(lado, ev);
          return false;
        }
      }
    }

    if (c.enc.status === 'paralisado' && this.rnd.chance(CHANCE_TRAVAR_PARALISADO)) {
      ev.push({ k: 'texto', t: `${nome(c.enc)} travou de paralisia!` });
      return false;
    }
    return true;
  }

  /* tira o HP e devolve quanto tirou (drenar e recuo precisam desse número) */
  private aplicarGolpe(g: Golpe, eu: Combatente,
                       alvoLado: Lado, alvo: Combatente, ev: Evento[]): number {
    const stEu = atributos(eu.enc);
    const stAlvo = atributos(alvo.enc);
    const fisico = g.categoria === 'fisico';

    let ataque = fisico
      ? aplicarEstagio(stEu.atq, eu.estagios.atq)
      : aplicarEstagio(stEu.esp, eu.estagios.esp);
    if (fisico && eu.enc.status === 'queimado') {
      ataque = Math.max(1, Math.floor(ataque * FATOR_ATAQUE_QUEIMADO));
    }
    const defesa = fisico
      ? aplicarEstagio(stAlvo.def, alvo.estagios.def)
      : aplicarEstagio(stAlvo.esp, alvo.estagios.esp);

    const efic = eficacia(g.tipo, tipos(alvo.enc));
    const r = calcularDano({
      nivel: eu.enc.nivel, ataque, defesa,
      potencia: g.pot,
      afinidade: temAfinidade(g.tipo, tipos(eu.enc)),
      eficacia: efic,
      bonusCritico: g.efeito?.critico ?? 0,
    }, this.rnd);

    const antes = alvo.enc.hp;
    alvo.enc.hp = Math.max(0, alvo.enc.hp - r.dano);
    ev.push({ k: 'dano', lado: alvoLado, de: antes, para: alvo.enc.hp,
              critico: r.critico, eficacia: efic });
    if (r.critico) ev.push({ k: 'texto', t: 'Acertou em cheio!' });
    const frase = fraseEficacia(efic);
    if (frase) ev.push({ k: 'texto', t: frase });
    return r.dano;
  }

  private aplicarEfeito(g: Golpe, lado: Lado, eu: Combatente,
                        alvoLado: Lado, alvo: Combatente,
                        causado: number, ev: Evento[]): void {
    const e = g.efeito!;
    const estado = g.categoria === 'estado';

    // cura em si mesmo
    if (e.curar) {
      const max = hpMaximo(eu.enc);
      if (eu.enc.hp >= max) { ev.push({ k: 'texto', t: 'Mas não adiantou nada.' }); return; }
      const antes = eu.enc.hp;
      curar(eu.enc, Math.floor(max * e.curar));
      ev.push({ k: 'cura', lado, de: antes, para: eu.enc.hp });
      ev.push({ k: 'texto', t: `${nome(eu.enc)} recuperou o fôlego.` });
    }

    // drenar / recuo dependem do dano que acabou de sair
    if (e.dreno && causado > 0) {
      const antes = eu.enc.hp;
      curar(eu.enc, Math.max(1, Math.floor(causado * e.dreno)));
      ev.push({ k: 'cura', lado, de: antes, para: eu.enc.hp });
      ev.push({ k: 'texto', t: `${nome(eu.enc)} sugou energia!` });
    }
    if (e.recuo && causado > 0) {
      const antes = eu.enc.hp;
      eu.enc.hp = Math.max(0, eu.enc.hp - Math.max(1, Math.floor(causado * e.recuo)));
      ev.push({ k: 'dano', lado, de: antes, para: eu.enc.hp, critico: false, eficacia: 1 });
      ev.push({ k: 'texto', t: `${nome(eu.enc)} se machucou com o esforço!` });
    }

    // estado alterado
    if (e.status) {
      const chance = e.chanceStatus ?? 100;
      if (!desmaiado(alvo.enc) && this.rnd.chance(chance)) {
        this.aplicarStatus(alvoLado, alvo, e.status, ev);
      } else if (estado) {
        ev.push({ k: 'texto', t: 'Mas não adiantou nada.' });
      }
    }

    // enfeitiçar
    if (e.feitico && !desmaiado(alvo.enc) && this.rnd.chance(e.feitico)) {
      if (alvo.feitico > 0) {
        if (estado) ev.push({ k: 'texto', t: 'Mas não adiantou nada.' });
      } else {
        alvo.feitico = this.rnd.inteiro(TURNOS_FEITICO[0], TURNOS_FEITICO[1]);
        ev.push({ k: 'quebranto', lado: alvoLado, ativo: true });
        ev.push({ k: 'texto', t: `${nome(alvo.enc)} pegou quebranto!` });
      }
    }

    // mexer em atributo
    if (e.mod) {
      const chance = e.mod.chance ?? 100;
      if (this.rnd.chance(chance)) {
        const proprio = e.mod.alvo === 'proprio';
        const destLado = proprio ? lado : alvoLado;
        const dest = proprio ? eu : alvo;
        if (!proprio && desmaiado(dest.enc)) return;
        this.mexerEstagio(destLado, dest, e.mod.stat, e.mod.passos, ev);
      }
    }
  }

  private aplicarStatus(lado: Lado, c: Combatente, s: Status, ev: Evento[]): void {
    if (c.enc.status) {
      ev.push({ k: 'texto', t: `${nome(c.enc)} já está ${STATUS[c.enc.status].nome}.` });
      return;
    }
    // ninguém queima um Encantado de Fogo nem eletrocuta um de Raio
    const imune = (s === 'queimado' && tipos(c.enc).includes('fogo' as Tipo))
               || (s === 'paralisado' && tipos(c.enc).includes('raio' as Tipo));
    if (imune) { ev.push({ k: 'texto', t: 'Mas não adiantou nada.' }); return; }

    c.enc.status = s;
    c.enc.turnosStatus = s === 'dormindo'
      ? this.rnd.inteiro(TURNOS_SONO[0], TURNOS_SONO[1]) : 0;
    ev.push({ k: 'status', lado, status: s });
    ev.push({ k: 'texto', t: `${nome(c.enc)} ${STATUS[s].aoReceber}` });
  }

  private mexerEstagio(lado: Lado, c: Combatente, stat: ChaveStat,
                       passos: number, ev: Evento[]): void {
    const atual = c.estagios[stat];
    const novo = Math.max(ESTAGIO_MIN, Math.min(ESTAGIO_MAX, atual + passos));
    // o artigo vem junto do rótulo: "o ataque" mas "a defesa"
    const rotulo: Record<ChaveStat, string> = {
      atq: 'O ataque', def: 'A defesa', esp: 'O poder', vel: 'A velocidade',
    };
    if (novo === atual) {
      ev.push({ k: 'texto',
                t: `${rotulo[stat]} de ${nome(c.enc)} não muda mais.` });
      return;
    }
    c.estagios[stat] = novo;
    ev.push({ k: 'estagio', lado, stat, passos: novo - atual });
    ev.push({ k: 'texto',
              t: `${rotulo[stat]} de ${nome(c.enc)} ${passos > 0 ? 'subiu!' : 'caiu!'}` });
  }

  /* ------------------------------------------------------- fim de turno */

  private fimDeTurno(ev: Evento[]): void {
    for (const lado of ['aliado', 'inimigo'] as Lado[]) {
      const c = this.lado(lado);
      if (desmaiado(c.enc) || !c.enc.status) continue;
      const fracao = DANO_POR_TURNO[c.enc.status];
      if (!fracao) continue;
      const dano = Math.max(1, Math.floor(hpMaximo(c.enc) * fracao));
      const antes = c.enc.hp;
      c.enc.hp = Math.max(0, c.enc.hp - dano);
      ev.push({ k: 'dano', lado, de: antes, para: c.enc.hp, critico: false, eficacia: 1 });
      ev.push({ k: 'texto', t: `${nome(c.enc)} ${STATUS[c.enc.status].aoSofrer}` });
      if (desmaiado(c.enc)) this.derrubar(lado, ev);
      if (this.terminou || this.aguardandoTroca) return;
    }
  }

  /* ------------------------------------------------------------ desmaio */

  private derrubar(lado: Lado, ev: Evento[]): void {
    const c = this.lado(lado);
    c.enc.status = null;
    c.enc.turnosStatus = 0;
    ev.push({ k: 'desmaio', lado });
    ev.push({ k: 'texto', t: `${nome(c.enc)} desmaiou!` });

    if (lado === 'inimigo') {
      this.premiar(ev);
      const prox = this.oponentes.findIndex((e) => !desmaiado(e));
      if (prox < 0) {
        if (this.treinador) {
          ev.push({ k: 'texto', t: `Você venceu ${this.treinador.nome}!` });
          if (this.treinador.falaDerrota) {
            ev.push({ k: 'texto', t: this.treinador.falaDerrota });
          }
        }
        this.resultado = 'vitoria';
        ev.push({ k: 'fim', resultado: 'vitoria' });
      } else {
        this.iInimigo = prox;
        this.inimigo = envolver(this.oponentes[prox]!);
        ev.push({ k: 'entrar', lado: 'inimigo', indice: prox });
        ev.push({ k: 'texto',
                  t: `${this.treinador!.nome} mandou ${nome(this.inimigo.enc)}!` });
      }
      return;
    }

    // caiu o seu
    if (this.time.some((e) => !desmaiado(e))) {
      this.aguardandoTroca = true;
      ev.push({ k: 'trocarForcado' });
    } else {
      ev.push({ k: 'texto', t: 'Você não tem mais ninguém em pé...' });
      this.resultado = 'derrota';
      ev.push({ k: 'fim', resultado: 'derrota' });
    }
  }

  /* ---------------------------------------------------------------- XP */

  private premiar(ev: Evento[]): void {
    const vivo = this.aliado.enc;
    if (desmaiado(vivo)) return;
    const ganho = xpPorDerrotar(this.inimigo.enc);
    ev.push({ k: 'xp', ganho });
    ev.push({ k: 'texto', t: `${nome(vivo)} ganhou ${ganho} de experiência!` });

    for (const s of ganharXP(vivo, ganho)) {
      ev.push({ k: 'nivel', nivel: s.nivel });
      ev.push({ k: 'texto', t: `${nome(vivo)} chegou ao nível ${s.nivel}!` });
      for (const g of s.aprendeu) {
        ev.push({ k: 'aprender', golpe: g });
        ev.push({ k: 'texto', t: `${nome(vivo)} aprendeu ${fichaGolpe(g).nome}!` });
      }
      for (const g of s.naoCoube) {
        this.pendentesAprender.push({ indice: this.iAliado, golpe: g });
        ev.push({ k: 'esquecer', golpe: g });
      }
      if (s.evoluiEm) {
        const de = ficha(vivo).nome;
        evoluir(vivo, s.evoluiEm);
        ev.push({ k: 'evoluir', de: ficha(vivo).id, para: s.evoluiEm });
        ev.push({ k: 'texto', t: `${de} virou ${ficha(vivo).nome}!` });
      }
    }
  }

  /* ===================================================================
     IA do oponente

     Pontua cada golpe pelo dano que ele faria de verdade (tipo, afinidade,
     estágios e tudo), e escolhe entre os melhores com um pouco de acaso —
     uma IA perfeita seria chata, e uma aleatória seria boba demais.
     =================================================================== */

  private decidirIA(): AcaoJogador {
    const eu = this.inimigo, alvo = this.aliado;
    const notas = eu.enc.golpes.map((_, i) => this.notaGolpe(i, eu, alvo));
    if (notas.length === 0) return { tipo: 'golpe', indice: 0 };

    const melhor = Math.max(...notas);
    // selvagem escolhe entre tudo que chega perto; treinador é mais certeiro
    const corte = this.selvagem ? melhor * 0.6 : melhor * 0.9;
    const bons = notas.map((n, i) => (n >= corte ? i : -1)).filter((i) => i >= 0);
    return { tipo: 'golpe', indice: this.rnd.escolher(bons.length ? bons : [0]) };
  }

  private notaGolpe(indice: number, eu: Combatente, alvo: Combatente): number {
    const aprendido = eu.enc.golpes[indice];
    if (!aprendido || aprendido.pp <= 0) return 0;
    const g = fichaGolpe(aprendido.id);
    const precisao = g.precisao <= 0 ? 1 : g.precisao / 100;

    if (g.categoria === 'estado') {
      // golpe de estado só vale quando ainda tem efeito a aplicar
      const ef = g.efeito;
      let nota = 12;
      if (ef?.curar) nota = eu.enc.hp < hpMaximo(eu.enc) * 0.5 ? 45 : 2;
      else if (ef?.status) nota = alvo.enc.status ? 1 : 30;
      else if (ef?.feitico) nota = alvo.feitico > 0 ? 1 : 26;
      else if (ef?.mod) nota = 18;
      return nota * precisao;
    }

    const stEu = atributos(eu.enc);
    const stAlvo = atributos(alvo.enc);
    const fisico = g.categoria === 'fisico';
    let ataque = fisico
      ? aplicarEstagio(stEu.atq, eu.estagios.atq)
      : aplicarEstagio(stEu.esp, eu.estagios.esp);
    if (fisico && eu.enc.status === 'queimado') ataque = Math.floor(ataque * FATOR_ATAQUE_QUEIMADO);
    const defesa = fisico
      ? aplicarEstagio(stAlvo.def, alvo.estagios.def)
      : aplicarEstagio(stAlvo.esp, alvo.estagios.esp);

    const bruto = Math.floor(
      (Math.floor((2 * eu.enc.nivel) / 5 + 2) * g.pot * (ataque / Math.max(1, defesa))) / 50,
    ) + 2;
    const efic = eficacia(g.tipo, tipos(alvo.enc));
    const afin = temAfinidade(g.tipo, tipos(eu.enc)) ? 1.5 : 1;
    const dano = bruto * efic * afin * precisao;

    // derrubar agora vale mais que qualquer outra consideração
    return dano >= alvo.enc.hp ? dano * 3 : dano;
  }
}
