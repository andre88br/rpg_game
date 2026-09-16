/* =========================================================================
   Um Encantado concreto: a criatura que está no seu time, com nível, XP,
   HP atual, estado alterado e os golpes que ela sabe.

   A ficha da espécie (data/creatures.ts) é imutável e compartilhada; o que
   muda de bicho para bicho mora aqui e é exatamente o que vai para o save.
   ========================================================================= */
import { especie, type Atributos, type Crescimento, type Especie } from '../data/creatures.ts';
import { golpe as fichaGolpe } from '../data/moves.ts';
import type { Tipo } from '../art/palette.ts';
import type { Status } from './status.ts';
import { Aleatorio, acaso } from '../core/rng.ts';

export const MAX_GOLPES = 4;
export const NIVEL_MAX = 60;

export interface GolpeAprendido { id: string; pp: number; ppMax: number }

export interface Encantado {
  especie: string;
  apelido: string | null;
  nivel: number;
  xp: number;              // XP total acumulado, não o que falta
  hp: number;
  status: Status | null;
  turnosStatus: number;    // só o sono usa: quantos turnos ainda faltam
  golpes: GolpeAprendido[];
  selvagem: boolean;
}

/* ------------------------------------------------------------------ ficha */

export function ficha(e: Encantado): Especie { return especie(e.especie); }
export function nome(e: Encantado): string { return e.apelido ?? ficha(e).nome; }
export function tipos(e: Encantado): readonly Tipo[] { return ficha(e).tipos; }

/* ----------------------------------------------------------- experiência */

const FATOR: Record<Crescimento, number> = { rapido: 0.8, medio: 1, lento: 1.25 };

/* XP total necessário para ESTAR no nível n */
export function xpDoNivel(n: number, c: Crescimento): number {
  if (n <= 1) return 0;
  return Math.floor(FATOR[c] * n * n * n);
}

/* 0..1 — o quanto da barra de XP do nível atual já foi preenchido */
export function progressoXP(e: Encantado): number {
  const c = ficha(e).crescimento;
  if (e.nivel >= NIVEL_MAX) return 1;
  const base = xpDoNivel(e.nivel, c);
  const proximo = xpDoNivel(e.nivel + 1, c);
  if (proximo <= base) return 1;
  return Math.max(0, Math.min(1, (e.xp - base) / (proximo - base)));
}

/* XP que um oponente vale ao ser derrotado */
export function xpPorDerrotar(alvo: Encantado): number {
  const bruto = Math.floor((ficha(alvo).xpBase * alvo.nivel) / 7);
  return Math.max(1, alvo.selvagem ? bruto : Math.floor(bruto * 1.5));
}

/* ------------------------------------------------------------- atributos */

export function atributos(e: Encantado): Atributos {
  const b = ficha(e).base;
  const nv = e.nivel;
  const outro = (v: number) => Math.floor((v * 2 * nv) / 100) + 5;
  return {
    hp: Math.floor((b.hp * 2 * nv) / 100) + nv + 10,
    atq: outro(b.atq),
    def: outro(b.def),
    esp: outro(b.esp),
    vel: outro(b.vel),
  };
}

export function hpMaximo(e: Encantado): number { return atributos(e).hp; }
export function desmaiado(e: Encantado): boolean { return e.hp <= 0; }

/* ---------------------------------------------------------------- golpes */

/* todos os golpes que a espécie já teria aprendido até este nível,
   mantendo só os quatro últimos (é o que o jogo entrega ao capturar) */
export function golpesAte(idEspecie: string, nivel: number): string[] {
  const aprendidos = especie(idEspecie).aprende
    .filter((a) => a.nv <= nivel)
    .map((a) => a.golpe);
  const unicos = [...new Set(aprendidos)];
  return unicos.slice(-MAX_GOLPES);
}

export function novoGolpe(id: string): GolpeAprendido {
  const pp = fichaGolpe(id).pp;
  return { id, pp, ppMax: pp };
}

export function semPP(e: Encantado): boolean {
  return e.golpes.every((g) => g.pp <= 0);
}

/* ----------------------------------------------------------- construção */

export interface OpcoesCriar {
  apelido?: string | null;
  selvagem?: boolean;
  golpes?: readonly string[];
  xp?: number;
}

export function criar(idEspecie: string, nivel: number, op: OpcoesCriar = {}): Encantado {
  const nv = Math.max(1, Math.min(NIVEL_MAX, Math.floor(nivel)));
  const ids = op.golpes ? [...op.golpes].slice(0, MAX_GOLPES) : golpesAte(idEspecie, nv);
  const e: Encantado = {
    especie: idEspecie,
    apelido: op.apelido ?? null,
    nivel: nv,
    xp: op.xp ?? xpDoNivel(nv, especie(idEspecie).crescimento),
    hp: 0,
    status: null,
    turnosStatus: 0,
    golpes: ids.map(novoGolpe),
    selvagem: op.selvagem ?? false,
  };
  e.hp = hpMaximo(e);
  return e;
}

/* ------------------------------------------------------------ progressão */

export interface SubidaNivel {
  nivel: number;
  aprendeu: string[];          // golpes que entraram sozinhos (havia vaga)
  naoCoube: string[];          // golpes que precisam substituir algum
  evoluiEm: string | null;     // espécie para a qual deve evoluir
}

/* Soma XP e devolve UMA entrada por nível ganho. Quem chama decide como
   mostrar isso (a cena de batalha enfileira as mensagens). */
export function ganharXP(e: Encantado, quanto: number): SubidaNivel[] {
  const c = ficha(e).crescimento;
  e.xp += Math.max(0, Math.floor(quanto));
  const subidas: SubidaNivel[] = [];

  while (e.nivel < NIVEL_MAX && e.xp >= xpDoNivel(e.nivel + 1, c)) {
    const hpAntes = hpMaximo(e);
    e.nivel += 1;
    // subir de nível aumenta o HP máximo; o ganho entra como HP de verdade
    e.hp += hpMaximo(e) - hpAntes;

    const aprendeu: string[] = [];
    const naoCoube: string[] = [];
    for (const a of ficha(e).aprende) {
      if (a.nv !== e.nivel) continue;
      if (e.golpes.some((g) => g.id === a.golpe)) continue;
      if (e.golpes.length < MAX_GOLPES) { e.golpes.push(novoGolpe(a.golpe)); aprendeu.push(a.golpe); }
      else naoCoube.push(a.golpe);
    }

    const ev = ficha(e).evolui;
    subidas.push({
      nivel: e.nivel,
      aprendeu, naoCoube,
      evoluiEm: ev && e.nivel >= ev.nv ? ev.em : null,
    });
  }
  return subidas;
}

/* Troca a espécie mantendo nível, XP e golpes. O HP máximo sobe, e o ganho
   entra como HP atual — evoluir nunca deixa o bicho pior do que estava. */
export function evoluir(e: Encantado, idNovo: string): void {
  const antes = hpMaximo(e);
  e.especie = idNovo;
  e.hp = Math.max(1, e.hp + (hpMaximo(e) - antes));
}

export function substituirGolpe(e: Encantado, indice: number, idNovo: string): void {
  if (indice < 0 || indice >= e.golpes.length) return;
  e.golpes[indice] = novoGolpe(idNovo);
}

/* ------------------------------------------------------------------ cura */

export function curar(e: Encantado, quanto: number): number {
  const max = hpMaximo(e);
  const antes = e.hp;
  e.hp = Math.max(0, Math.min(max, e.hp + Math.floor(quanto)));
  return e.hp - antes;
}

export function curarTudo(e: Encantado): void {
  e.hp = hpMaximo(e);
  e.status = null;
  e.turnosStatus = 0;
  for (const g of e.golpes) g.pp = g.ppMax;
}

export function reviver(e: Encantado, fracao = 0.5): void {
  if (!desmaiado(e)) return;
  e.hp = Math.max(1, Math.floor(hpMaximo(e) * fracao));
  e.status = null;
  e.turnosStatus = 0;
}

/* ------------------------------------------------------- encontro no mato */

export interface FaixaEncontro { especie: string; min: number; max: number; peso: number }

export function sortearSelvagem(tabela: readonly FaixaEncontro[],
                                rnd: Aleatorio = acaso): Encantado {
  const f = rnd.ponderado(tabela, (t) => t.peso);
  return criar(f.especie, rnd.inteiro(f.min, f.max), { selvagem: true });
}
