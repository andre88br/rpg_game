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
import { tracoDaEspecie, type Traco } from '../data/tracos.ts';
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
  | { k: 'traco'; lado: Lado; nome: string }   // o traço de quem está nesse lado agiu
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
  /* usou golpe com recarga: perde a próxima vez */
  recarregando: boolean;
  /* fechou o corpo neste turno: o golpe do outro não pega */
  protegido: boolean;
  /* turno do último Fecha-Corpo — dois seguidos, o segundo falha */
  ultimoProtege: number;
}

/* o golpe mira no adversário? (o corpo fechado do outro só barra estes;
   curar a si ou mexer no próprio atributo passa) */
function miraOponente(g: Golpe): boolean {
  const e = g.efeito;
  return g.categoria !== 'estado' || !!e?.status || !!e?.feitico || e?.mod?.alvo === 'oponente';
}

/* trocar de Encantado zera tudo isto: estágios, quebranto, recarga, proteção */
function envolver(e: Encantado): Combatente {
  return { enc: e, estagios: { atq: 0, def: 0, esp: 0, vel: 0 }, feitico: 0,
           recarregando: false, protegido: false, ultimoProtege: -9 };
}

/* --------------------------------------------------------- treinador */

export interface Treinador {
  nome: string;
  classe: string;           // "PESCADOR", "DONA DO TERREIRO"...
  falaInicio?: string;
  falaDerrota?: string;
  premio?: number;
  /* liga a troca e o uso de item da IA — ligado POR TREINADOR, desligado
     por padrão: sem isto, todo treinador de time 2+ (Zeca incluído) já
     trocaria de Encantado, e as regiões 1 e 2 não podiam mudar de
     comportamento. Ausente ou falso = a IA de sempre, só escolhe golpe. */
  esperta?: boolean;
}

export interface OpcoesBatalha {
  time: Encantado[];               // referências vivas do time do jogador
  oponentes: Encantado[];
  treinador?: Treinador | null;    // ausente = batalha selvagem
  mochila?: Mochila;
  /* o bolso do TREINADOR inimigo — nunca a mochila do jogador. Sem isto (ou
     vazio), a IA nunca usa item: é o que segura os 88 testes de hoje, que
     não passam nada aqui, sem tocar um único `if`. */
  itensIA?: Mochila;
  semente?: number;
  podeFugir?: boolean;
  /* é de noite? (a Lua Cheia e as Fases da Lua leem isto) */
  noite?: boolean;
}

/* abaixo desta fração de HP a IA considera curar; acima, nunca gasta item */
const LIMIAR_CURA_IA = 0.35;
/* mesmo podendo, a IA não usa item nem troca toda vez — senão fica previsível */
const CHANCE_ITEM_IA = 70;
const CHANCE_TROCA_IA = 55;

/* ===================================================================== */

export class Batalha {
  readonly time: Encantado[];
  readonly oponentes: Encantado[];
  readonly treinador: Treinador | null;
  readonly selvagem: boolean;
  readonly mochila: Mochila;
  /* clonado do treinador: consumir aqui nunca esvazia o bolso da FICHA do
     treinador, que é o mesmo objeto reaproveitado em toda luta futura com ele */
  readonly itensIA: Mochila;
  readonly rnd: Aleatorio;
  readonly podeFugir: boolean;
  readonly noite: boolean;

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
    this.itensIA = { ...(op.itensIA ?? {}) };
    this.rnd = new Aleatorio(op.semente);
    this.podeFugir = op.podeFugir ?? this.selvagem;
    this.noite = op.noite ?? false;

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
    this.aoEntrar('aliado', ev);
    this.aoEntrar('inimigo', ev);
    return ev;
  }

  /* ===================================================================
     TRAÇOS
     =================================================================== */

  traco(c: Combatente): Traco { return tracoDaEspecie(c.enc.especie); }

  /* a faixa com o nome do traço, e a frase que explica o que ele fez */
  private anunciar(lado: Lado, t: string, ev: Evento[]): void {
    ev.push({ k: 'traco', lado, nome: this.traco(this.lado(lado)).nome });
    ev.push({ k: 'texto', t });
  }

  /* chegou em campo: o Agouro baixa o ataque do outro lado */
  private aoEntrar(lado: Lado, ev: Evento[]): void {
    const c = this.lado(lado);
    const t = this.traco(c);
    const outro = this.lado(this.oposto(lado));
    if (!t.aoEntrar || desmaiado(c.enc) || desmaiado(outro.enc)) return;
    this.anunciar(lado, `${t.nome} de ${nome(c.enc)}!`, ev);
    this.mexerEstagio(this.oposto(lado), outro, t.aoEntrar.stat, t.aoEntrar.passos, ev);
  }

  /* quanto o traço dos dois lados muda o dano deste golpe: a força de quem
     bate vezes o couro de quem apanha. A IA usa a mesma conta. */
  fatorTraco(g: Golpe, eu: Combatente, alvo: Combatente): number {
    let f = 1;
    for (const c of this.traco(eu).forca ?? []) {
      if (c.tipo && c.tipo !== g.tipo) continue;
      if (c.hpAbaixo !== undefined && eu.enc.hp > hpMaximo(eu.enc) * c.hpAbaixo) continue;
      if (c.noite && !this.noite) continue;
      if (c.dia && this.noite) continue;
      if (c.alvoDormindo && alvo.enc.status !== 'dormindo') continue;
      f *= c.fator;
    }
    const couro = this.traco(alvo).couro;
    if (couro && couro.categoria === g.categoria) f *= couro.fator;
    return f;
  }

  /* ninguém queima um Encantado de Fogo nem trava um de Raio */
  private imunePorTipo(c: Combatente, s: Status): boolean {
    return (s === 'queimado' && tipos(c.enc).includes('fogo' as Tipo))
        || (s === 'paralisado' && tipos(c.enc).includes('raio' as Tipo));
  }

  /* o traço de quem recebe barra este estado? */
  private imuneAoStatus(c: Combatente, s: Status): boolean {
    const im = this.traco(c).imune;
    return im === 'todos' || (!!im && im.includes(s));
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
    const time = lado === 'aliado' ? this.time : this.oponentes;
    const iAtual = lado === 'aliado' ? this.iAliado : this.iInimigo;
    const alvo = time[indice];
    if (!alvo || desmaiado(alvo) || indice === iAtual) return;

    const atual = this.lado(lado).enc;
    ev.push({ k: 'texto',
              t: lado === 'aliado' ? `Volta, ${nome(atual)}!`
                                    : `${this.treinador!.nome} recolheu ${nome(atual)}!` });
    ev.push({ k: 'sair', lado });
    ev.push({ k: 'quebranto', lado, ativo: false });
    const combatente = envolver(alvo);           // estágios zeram ao trocar
    if (lado === 'aliado') { this.iAliado = indice; this.aliado = combatente; }
    else { this.iInimigo = indice; this.inimigo = combatente; }
    ev.push({ k: 'entrar', lado, indice });
    ev.push({ k: 'texto',
              t: lado === 'aliado' ? `Vai lá, ${nome(alvo)}!`
                                    : `${this.treinador!.nome} mandou ${nome(alvo)}!` });
    this.aoEntrar(lado, ev);
  }

  /* troca obrigatória depois que o seu Encantado desmaia */
  trocarApos(indice: number): Evento[] {
    if (!this.aguardandoTroca) return [];
    const alvo = this.time[indice];
    if (!alvo || desmaiado(alvo)) return [];
    this.aguardandoTroca = false;
    this.iAliado = indice;
    this.aliado = envolver(alvo);
    const ev: Evento[] = [
      { k: 'entrar', lado: 'aliado', indice },
      { k: 'texto', t: `Vai lá, ${nome(alvo)}!` },
    ];
    this.aoEntrar('aliado', ev);
    return ev;
  }

  /* ------------------------------------------------------------ item */

  private acaoItem(lado: Lado, id: string, alvo: number | undefined, ev: Evento[]): void {
    if (lado === 'inimigo') return this.acaoItemIA(id, ev);

    const it = fichaItem(id);
    if (!consumir(this.mochila, id)) return;
    ev.push({ k: 'texto', t: `Você usou ${it.nome}.` });
    const ef = it.efeito;

    if (ef.k === 'patua') {
      if (!this.selvagem) {
        ev.push({ k: 'texto', t: 'Não se prende o Encantado dos outros!' });
        return;
      }
      const r = tentarCaptura(this.inimigo.enc, ef.bonus * (this.traco(this.aliado).captura ?? 1), this.rnd);
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

  /* o treinador inimigo usa item do PRÓPRIO bolso (itensIA), sempre no
     Encantado que está em campo — nunca na mochila nem no time do jogador */
  private acaoItemIA(id: string, ev: Evento[]): void {
    const it = fichaItem(id);
    if (!consumir(this.itensIA, id)) return;
    const destino = this.inimigo.enc;
    const nomeQuem = this.treinador?.nome ?? '???';
    ev.push({ k: 'texto', t: `${nomeQuem} usou ${it.nome} em ${nome(destino)}!` });
    const ef = it.efeito;

    if (ef.k === 'cura') {
      const antes = destino.hp;
      const ganho = curar(destino, ef.hp);
      ev.push({ k: 'cura', lado: 'inimigo', de: antes, para: destino.hp });
      ev.push({ k: 'texto', t: `${nome(destino)} recuperou ${ganho} de fôlego.` });
    } else if (ef.k === 'limpar') {
      destino.status = null;
      destino.turnosStatus = 0;
      ev.push({ k: 'status', lado: 'inimigo', status: null });
      ev.push({ k: 'texto', t: `${nome(destino)} se sente bem melhor.` });
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
    if (this.traco(this.aliado).fugaCerta) {
      this.anunciar('aliado', `${nome(this.aliado.enc)} cavou um buraco e sumiu!`, ev);
      this.resultado = 'fuga';
      ev.push({ k: 'fim', resultado: 'fuga' });
      return;
    }
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

    // o golpe forte do turno passado cobra agora: a vez se perde
    if (eu.recarregando) {
      eu.recarregando = false;
      ev.push({ k: 'texto', t: `${nome(eu.enc)} precisa recuperar o fôlego!` });
      return;
    }

    if (!this.podeAgir(lado, eu, ev)) return;

    const g = this.golpeDe(eu, indice);
    // gasta PP do golpe escolhido (Esforço não sai da lista, logo não gasta)
    const aprendido = eu.enc.golpes[indice];
    if (aprendido && aprendido.id === g.id && aprendido.pp > 0) aprendido.pp--;

    ev.push({ k: 'golpe', lado, golpe: g.id });
    ev.push({ k: 'texto', t: `${nome(eu.enc)} usou ${g.nome}!` });

    // Pés Trocados: quem mira nele erra mais (golpe que nunca erra continua)
    const mira = miraOponente(g) && g.precisao > 0 ? this.traco(alvo).miraTorta ?? 1 : 1;
    if (!acertou(g.precisao * mira, this.rnd)) {
      ev.push({ k: 'errou', lado });
      ev.push({ k: 'texto', t: 'Mas errou!' });
      return;
    }

    // Fecha-Corpo: só pega se não tiver sido usado no turno anterior
    if (g.efeito?.protege) {
      if (eu.ultimoProtege === this.turno - 1) {
        eu.ultimoProtege = -9;
        ev.push({ k: 'texto', t: 'Mas não adiantou nada.' });
        return;
      }
      eu.protegido = true;
      eu.ultimoProtege = this.turno;
      ev.push({ k: 'texto', t: `${nome(eu.enc)} fechou o corpo!` });
      return;
    }

    // corpo fechado do outro lado: nada que mire nele pega
    if (alvo.protegido && miraOponente(g)) {
      ev.push({ k: 'texto', t: `${nome(alvo.enc)} se protegeu!` });
      return;
    }

    // Água Funda: golpe daquele tipo vira cura
    const absorve = this.traco(alvo).absorve;
    if (absorve && absorve.tipo === g.tipo && g.categoria !== 'estado' && !desmaiado(alvo.enc)) {
      const antes = alvo.enc.hp;
      curar(alvo.enc, Math.max(1, Math.floor(hpMaximo(alvo.enc) * absorve.cura)));
      this.anunciar(alvoLado, `${nome(alvo.enc)} bebeu o golpe!`, ev);
      if (alvo.enc.hp > antes) ev.push({ k: 'cura', lado: alvoLado, de: antes, para: alvo.enc.hp });
      return;
    }

    let causado = 0;
    if (g.categoria !== 'estado') {
      const multi = g.efeito?.multi;
      if (multi) {
        const vezes = this.rnd.inteiro(multi[0], multi[1]);
        let acertos = 0;
        for (let i = 0; i < vezes && !desmaiado(alvo.enc); i++) {
          causado += this.aplicarGolpe(g, eu, alvoLado, alvo, ev, i === vezes - 1);
          acertos++;
        }
        ev.push({ k: 'texto', t: acertos === 1 ? 'Acertou uma vez!' : `Acertou ${acertos} vezes!` });
      } else {
        causado = this.aplicarGolpe(g, eu, alvoLado, alvo, ev);
      }
      if (g.efeito?.recarga) eu.recarregando = true;
    }

    if (g.efeito) this.aplicarEfeito(g, lado, eu, alvoLado, alvo, causado, ev);
    if (g.categoria === 'fisico' && causado > 0) this.contato(lado, eu, alvoLado, alvo, ev);

    if (desmaiado(alvo.enc)) this.derrubar(alvoLado, ev);
    else if (desmaiado(eu.enc)) this.derrubar(lado, ev);
  }

  /* bateu de perto: o traço de quem apanhou pode castigar quem bateu */
  private contato(lado: Lado, eu: Combatente, alvoLado: Lado, alvo: Combatente, ev: Evento[]): void {
    const c = this.traco(alvo).contato;
    if (!c || desmaiado(eu.enc)) return;
    if (c.status && (eu.enc.status || this.imuneAoStatus(eu, c.status))) return;
    if (c.feitico && (eu.feitico > 0 || this.traco(eu).semQuebranto)) return;
    if (!this.rnd.chance(c.chance)) return;
    ev.push({ k: 'traco', lado: alvoLado, nome: this.traco(alvo).nome });
    if (c.status) this.aplicarStatus(lado, eu, c.status, ev);
    else {
      eu.feitico = this.rnd.inteiro(TURNOS_FEITICO[0], TURNOS_FEITICO[1]);
      ev.push({ k: 'quebranto', lado, ativo: true });
      ev.push({ k: 'texto', t: `${nome(eu.enc)} pegou quebranto!` });
    }
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

  /* tira o HP e devolve quanto tirou (drenar e recuo precisam desse número).
     `comFrase` falso cala o "é super eficaz" — numa sequência de pancadas
     ele sai uma vez só, na última. */
  private aplicarGolpe(g: Golpe, eu: Combatente,
                       alvoLado: Lado, alvo: Combatente, ev: Evento[], comFrase = true): number {
    if (g.efeito?.danoFixo) {
      const antes = alvo.enc.hp;
      alvo.enc.hp = Math.max(0, alvo.enc.hp - eu.enc.nivel);
      ev.push({ k: 'dano', lado: alvoLado, de: antes, para: alvo.enc.hp, critico: false, eficacia: 1 });
      return antes - alvo.enc.hp;
    }
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
    const potencia = g.efeito?.dobraSeStatus && alvo.enc.status ? g.pot * 2 : g.pot;
    const r = calcularDano({
      nivel: eu.enc.nivel, ataque, defesa,
      potencia,
      afinidade: temAfinidade(g.tipo, tipos(eu.enc)),
      eficacia: efic,
      bonusCritico: (g.efeito?.critico ?? 0) + (this.traco(eu).criticoExtra ?? 0),
      fator: this.fatorTraco(g, eu, alvo),
      semCritico: this.traco(alvo).semCritico,
    }, this.rnd);

    const antes = alvo.enc.hp;
    alvo.enc.hp = Math.max(0, alvo.enc.hp - r.dano);
    ev.push({ k: 'dano', lado: alvoLado, de: antes, para: alvo.enc.hp,
              critico: r.critico, eficacia: efic });
    if (r.critico) ev.push({ k: 'texto', t: 'Acertou em cheio!' });
    const frase = comFrase ? fraseEficacia(efic) : null;
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
    if (e.recuo && causado > 0 && !this.traco(eu).semRecuo) {
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
      if (this.traco(alvo).semQuebranto) {
        this.anunciar(alvoLado, `${nome(alvo.enc)} não pega quebranto!`, ev);
      } else if (alvo.feitico > 0) {
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
    if (this.imunePorTipo(c, s)) { ev.push({ k: 'texto', t: 'Mas não adiantou nada.' }); return; }
    if (this.imuneAoStatus(c, s)) {
      this.anunciar(lado, `${nome(c.enc)} não ficou ${STATUS[s].nome}!`, ev);
      return;
    }

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
    // o corpo fechado vale só para o turno em que foi fechado
    this.aliado.protegido = false;
    this.inimigo.protegido = false;
    for (const lado of ['aliado', 'inimigo'] as Lado[]) {
      this.tracoFimDeTurno(lado, ev);
      if (this.terminou || this.aguardandoTroca) return;
    }
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

  /* Canto que Cura regenera; Peso no Peito castiga o outro que dorme */
  private tracoFimDeTurno(lado: Lado, ev: Evento[]): void {
    const c = this.lado(lado);
    const f = this.traco(c).fimDoTurno;
    if (!f || desmaiado(c.enc)) return;
    if (f.cura && c.enc.hp < hpMaximo(c.enc)) {
      const antes = c.enc.hp;
      curar(c.enc, Math.max(1, Math.floor(hpMaximo(c.enc) * f.cura)));
      this.anunciar(lado, `${nome(c.enc)} cantou e recuperou fôlego.`, ev);
      ev.push({ k: 'cura', lado, de: antes, para: c.enc.hp });
    }
    const outroLado = this.oposto(lado);
    const outro = this.lado(outroLado);
    if (f.pesadelo && !desmaiado(outro.enc) && outro.enc.status === 'dormindo') {
      const antes = outro.enc.hp;
      outro.enc.hp = Math.max(0, antes - Math.max(1, Math.floor(hpMaximo(outro.enc) * f.pesadelo)));
      this.anunciar(lado, `${nome(c.enc)} sentou no peito de ${nome(outro.enc)}!`, ev);
      ev.push({ k: 'dano', lado: outroLado, de: antes, para: outro.enc.hp, critico: false, eficacia: 1 });
      if (desmaiado(outro.enc)) this.derrubar(outroLado, ev);
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
        if (this.selvagem) this.achar(ev);
        this.resultado = 'vitoria';
        ev.push({ k: 'fim', resultado: 'vitoria' });
      } else {
        this.iInimigo = prox;
        this.inimigo = envolver(this.oponentes[prox]!);
        ev.push({ k: 'entrar', lado: 'inimigo', indice: prox });
        ev.push({ k: 'texto',
                  t: `${this.treinador!.nome} mandou ${nome(this.inimigo.enc)}!` });
        this.aoEntrar('inimigo', ev);
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

  /* Rodamoinho: venceu um selvagem com ele em campo, às vezes acha um item */
  private achar(ev: Evento[]): void {
    const a = this.traco(this.aliado).achado;
    if (!a || desmaiado(this.aliado.enc) || !this.rnd.chance(a.chance)) return;
    const id = this.rnd.escolher(a.itens);
    this.mochila[id] = (this.mochila[id] ?? 0) + 1;
    this.anunciar('aliado', `${nome(this.aliado.enc)} achou ${fichaItem(id).nome} no rodamoinho!`, ev);
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
    const item = this.itemDaIA();
    if (item) return { tipo: 'item', item };
    const troca = this.trocaDaIA();
    if (troca >= 0) return { tipo: 'trocar', indice: troca };

    const eu = this.inimigo, alvo = this.aliado;
    const notas = eu.enc.golpes.map((_, i) => this.notaGolpe(i, eu, alvo));
    if (notas.length === 0) return { tipo: 'golpe', indice: 0 };

    const melhor = Math.max(...notas);
    // selvagem escolhe entre tudo que chega perto; treinador é mais certeiro
    const corte = this.selvagem ? melhor * 0.6 : melhor * 0.9;
    const bons = notas.map((n, i) => (n >= corte ? i : -1)).filter((i) => i >= 0);
    return { tipo: 'golpe', indice: this.rnd.escolher(bons.length ? bons : [0]) };
  }

  /* usa item do próprio bolso quando está mal — nunca sem bolso, e nunca
     fora de um treinador `esperta`: o que mantém intacta toda batalha de
     hoje (nenhuma delas passa `itensIA` nem `esperta`) */
  private itemDaIA(): string | null {
    if (this.selvagem || !this.treinador?.esperta) return null;
    if (Object.keys(this.itensIA).length === 0) return null;

    const frac = this.inimigo.enc.hp / hpMaximo(this.inimigo.enc);
    if (frac > LIMIAR_CURA_IA) {
      if ((this.itensIA['erva_doce'] ?? 0) > 0 && this.inimigo.enc.status
          && this.rnd.chance(CHANCE_ITEM_IA)) return 'erva_doce';
      return null;
    }
    for (const id of ['garrafada_forte', 'garrafada']) {
      if ((this.itensIA[id] ?? 0) > 0 && this.rnd.chance(CHANCE_ITEM_IA)) return id;
    }
    return null;
  }

  /* troca quando o ativo leva 2x de algum golpe do jogador ou cairia neste
     turno, tem para onde ir, não está prestes a derrubar o jogador agora e
     não acumulou força (+2 de ataque e poder somados). Vai para a reserva de
     MENOR perigo que não leve 2x — com os traços na conta: quem bebe o golpe
     do jogador tem perigo zero. Só para treinador `esperta` — todo o resto
     do jogo (regiões 1 e 2 incluídas) continua com a IA que nunca troca. */
  private trocaDaIA(): number {
    if (this.selvagem || !this.treinador?.esperta) return -1;
    const reservas = this.oponentes
      .map((e, i) => (i !== this.iInimigo && !desmaiado(e) ? i : -1))
      .filter((i) => i >= 0);
    if (reservas.length === 0) return -1;

    const leva2x = (e: Encantado): boolean => this.aliado.enc.golpes
      .some((g) => fichaGolpe(g.id).categoria !== 'estado'
                   && eficacia(fichaGolpe(g.id).tipo, tipos(e)) >= 2);
    const perigoAgora = this.perigo(this.inimigo);
    if (!leva2x(this.inimigo.enc) && perigoAgora < 1) return -1;

    const melhor = Math.max(...this.inimigo.enc.golpes
      .map((_, i) => this.notaGolpe(i, this.inimigo, this.aliado)));
    if (melhor >= this.aliado.enc.hp) return -1;   // pode derrubar agora: fica
    if (this.inimigo.estagios.atq + this.inimigo.estagios.esp >= 2) return -1;

    const opcoes = reservas
      .filter((i) => !leva2x(this.oponentes[i]!))
      .map((i) => ({ i, p: this.perigo(envolver(this.oponentes[i]!)) }))
      .filter((o) => o.p < perigoAgora)
      .sort((a, b) => a.p - b.p);
    if (opcoes.length === 0) return -1;
    return this.rnd.chance(CHANCE_TROCA_IA) ? opcoes[0]!.i : -1;
  }

  /* o golpe de melhor nota para o lado do jogador, com a mesma conta da IA —
     é o que a simulação de equilíbrio dos testes usa para jogar sozinha */
  melhorGolpeDoAliado(): number {
    const notas = this.aliado.enc.golpes.map((_, i) => this.notaGolpe(i, this.aliado, this.inimigo));
    const melhor = Math.max(0, ...notas);
    return Math.max(0, notas.indexOf(melhor));
  }

  /* quanto um golpe de dano tiraria, sem sorteio nem precisão: tipo,
     afinidade, estágios, queimado, várias pancadas, dano fixo e traço */
  private danoEstimado(g: Golpe, eu: Combatente, alvo: Combatente): number {
    if (g.categoria === 'estado') return 0;
    const ef = g.efeito;
    if (this.traco(alvo).absorve?.tipo === g.tipo) return 0;
    if (ef?.danoFixo) return eu.enc.nivel;
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
    const pot = ef?.dobraSeStatus && alvo.enc.status ? g.pot * 2 : g.pot;
    const bruto = Math.floor(
      (Math.floor((2 * eu.enc.nivel) / 5 + 2) * pot * (ataque / Math.max(1, defesa))) / 50,
    ) + 2;
    const efic = eficacia(g.tipo, tipos(alvo.enc));
    const afin = temAfinidade(g.tipo, tipos(eu.enc)) ? 1.5 : 1;
    // várias pancadas: conta a média (três e pouco)
    const vezes = ef?.multi ? (ef.multi[0] + ef.multi[1]) / 2 : 1;
    return bruto * efic * afin * vezes * this.fatorTraco(g, eu, alvo);
  }

  /* o maior dano que `de` tira de `contra` com os golpes que ainda têm PP */
  private ameaca(de: Combatente, contra: Combatente): number {
    const usaveis = de.enc.golpes.filter((g) => g.pp > 0);
    const golpes = usaveis.length ? usaveis.map((g) => fichaGolpe(g.id)) : [fichaGolpe('esforco')];
    return Math.max(0, ...golpes.map((g) => this.danoEstimado(g, de, contra)));
  }

  /* fração da vida que o jogador tira deste Encantado num golpe (1 = cai) */
  private perigo(c: Combatente): number {
    return this.ameaca(this.aliado, c) / Math.max(1, c.enc.hp);
  }

  /* o golpe sai antes do adversário? a mesma regra do `ordenar`, sem o
     sorteio do empate: prioridade, e depois velocidade */
  private ageAntes(g: Golpe, eu: Combatente, alvo: Combatente): boolean {
    const pri = g.prioridade ?? 0;
    if (pri !== 0) return pri > 0;
    return this.velocidade(eu) > this.velocidade(alvo);
  }

  private notaGolpe(indice: number, eu: Combatente, alvo: Combatente): number {
    const aprendido = eu.enc.golpes[indice];
    if (!aprendido || aprendido.pp <= 0) return 0;
    const g = fichaGolpe(aprendido.id);
    const mira = miraOponente(g) ? this.traco(alvo).miraTorta ?? 1 : 1;
    const precisao = g.precisao <= 0 ? 1 : Math.min(1, (g.precisao * mira) / 100);
    // golpe que o traço do outro bebe não vale nada
    if (g.categoria !== 'estado' && this.traco(alvo).absorve?.tipo === g.tipo) return 0;
    // treinador pensa um pouco mais; o bicho do mato escolhe como sempre
    const esperto = !this.selvagem && eu === this.inimigo;

    if (g.categoria === 'estado') {
      const nota = esperto ? this.notaEstadoEsperta(g, eu, alvo) : this.notaEstado(g, eu, alvo);
      return nota * precisao;
    }

    const dano = this.danoEstimado(g, eu, alvo) * precisao;
    // derrubar agora vale mais que qualquer outra consideração — e derrubar
    // ANTES de ser derrubado vale ainda mais
    if (dano >= alvo.enc.hp) {
      if (!esperto) return dano * 3;
      // para o treinador, todo golpe que derruba vale o mesmo (o que sobra
      // de dano não importa), pesado só pela precisão e por quem age antes
      const certo = alvo.enc.hp * precisao;
      return this.ageAntes(g, eu, alvo) && this.ameaca(alvo, eu) >= eu.enc.hp ? certo * 5 : certo * 3;
    }
    // o golpe que cobra um turno de fôlego só compensa quando derruba
    return g.efeito?.recarga ? dano * 0.6 : dano;
  }

  /* a nota de sempre de um golpe de estado (o bicho selvagem usa esta) */
  private notaEstado(g: Golpe, eu: Combatente, alvo: Combatente): number {
    const ef = g.efeito;
    // fechar o corpo só aperta quando a vida já está curta — e nunca seguido
    if (ef?.protege) return eu.ultimoProtege === this.turno ? 0 : eu.enc.hp < hpMaximo(eu.enc) * 0.35 ? 20 : 3;
    if (ef?.curar) return eu.enc.hp < hpMaximo(eu.enc) * 0.5 ? 45 : 2;
    if (ef?.status) return alvo.enc.status || this.imuneAoStatus(alvo, ef.status) ? 1 : 30;
    if (ef?.feitico) return alvo.feitico > 0 || this.traco(alvo).semQuebranto ? 1 : 26;
    if (ef?.mod) return 18;
    return 12;
  }

  /* a do treinador: golpe que não teria efeito vale zero, e nada de golpe de
     estado quando o jogador derruba ele neste turno */
  private notaEstadoEsperta(g: Golpe, eu: Combatente, alvo: Combatente): number {
    const ef = g.efeito;
    if (ef?.protege) return this.notaEstado(g, eu, alvo);
    if (this.ameaca(alvo, eu) >= eu.enc.hp) return 0;
    if (ef?.curar) {
      const max = hpMaximo(eu.enc);
      return eu.enc.hp >= max ? 0 : eu.enc.hp < max * 0.5 ? 45 : 2;
    }
    if (ef?.status) {
      const inutil = alvo.enc.status || this.imunePorTipo(alvo, ef.status) || this.imuneAoStatus(alvo, ef.status);
      return inutil ? 0 : 30;
    }
    if (ef?.feitico) return alvo.feitico > 0 || this.traco(alvo).semQuebranto ? 0 : 26;
    if (ef?.mod) {
      const proprio = ef.mod.alvo === 'proprio';
      const atual = (proprio ? eu : alvo).estagios[ef.mod.stat];
      const novo = atual + ef.mod.passos;
      if (novo > ESTAGIO_MAX && atual >= ESTAGIO_MAX) return 0;
      if (novo < ESTAGIO_MIN && atual <= ESTAGIO_MIN) return 0;
      // já forte o bastante: fortalecer mais rende pouco
      return proprio && ef.mod.passos > 0 && atual >= 2 ? 9 : 18;
    }
    return 12;
  }
}
