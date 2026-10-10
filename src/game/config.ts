/* =========================================================================
   Preferências do dispositivo — não são a partida, não vivem em slot
   nenhum. A velocidade do jogo (quão rápido o texto se revela e quão
   rápido o personagem anda) e a visão 3D (ligada, a Região da Foz sai do
   papel). Guardadas à parte de qualquer save, porque troca de slot não
   deveria trocar de preferência.
   ========================================================================= */
import type { Armazem } from './save.ts';

export type Velocidade = 'normal' | 'rapida' | 'turbo';

export const VELOCIDADES: readonly Velocidade[] = ['normal', 'rapida', 'turbo'];

export const NOME_VELOCIDADE: Record<Velocidade, string> = {
  normal: 'NORMAL', rapida: 'RÁPIDA', turbo: 'TURBO',
};

const MULTIPLICADORES: Record<Velocidade, number> = { normal: 1, rapida: 1.5, turbo: 2.2 };

const CHAVE = 'encantados:config:v1';

let armazem: Armazem | null | undefined;

function loja(): Armazem | null {
  if (armazem !== undefined) return armazem;
  try {
    const ls = (globalThis as { localStorage?: Armazem }).localStorage ?? null;
    armazem = ls ? (ls.getItem(CHAVE), ls) : null;
  } catch { armazem = null; }
  return armazem;
}

/* usado pelos testes: troca o armazém por um de mentira */
export function usarArmazemConfig(a: Armazem | null): void {
  armazem = a; velocidade = undefined; visao3d = undefined; volumes = {}; qualidade = undefined;
}

let velocidade: Velocidade | undefined;

export function obterVelocidade(): Velocidade {
  if (velocidade !== undefined) return velocidade;
  velocidade = 'normal';
  const ls = loja();
  try {
    const v = ls?.getItem(CHAVE);
    if (v === 'normal' || v === 'rapida' || v === 'turbo') velocidade = v;
  } catch { /* fica no padrão */ }
  return velocidade;
}

export function definirVelocidade(v: Velocidade): void {
  velocidade = v;
  try { loja()?.setItem(CHAVE, v); } catch { /* nada a fazer */ }
}

export function multiplicadorVelocidade(): number { return MULTIPLICADORES[obterVelocidade()]; }

/* A visão 3D vem ligada; quem prefere o mapa plano desliga no menu. */
const CHAVE_VISAO = 'encantados:config:visao3d:v1';
let visao3d: boolean | undefined;

export function obterVisao3D(): boolean {
  if (visao3d !== undefined) return visao3d;
  visao3d = true;
  try { if (loja()?.getItem(CHAVE_VISAO) === 'nao') visao3d = false; } catch { /* fica no padrão */ }
  return visao3d;
}

export function definirVisao3D(v: boolean): void {
  visao3d = v;
  try { loja()?.setItem(CHAVE_VISAO, v ? 'sim' : 'nao'); } catch { /* nada a fazer */ }
}

/* A qualidade do 3D: ALTA (sombras, densidade da tela, água com ondas) ou
   LEVE (sem sombras, resolução menor, água parada) para o celular fraco.
   Sem escolha gravada, o palpite vem do aparelho. */
export type Qualidade = 'alta' | 'leve';
const CHAVE_QUALIDADE = 'encantados:config:qualidade:v1';
let qualidade: Qualidade | undefined;

export interface Aparelho {
  toque: boolean;            // tela de toque
  ladoMenor: number;         // em px CSS
  nucleos?: number;          // navigator.hardwareConcurrency
  memoria?: number;          // navigator.deviceMemory (GB)
}

export function palpiteQualidade(a: Aparelho): Qualidade {
  if (a.toque && a.ladoMenor < 900) return 'leve';
  if (a.nucleos !== undefined && a.nucleos <= 4) return 'leve';
  if (a.memoria !== undefined && a.memoria <= 4) return 'leve';
  return 'alta';
}

function aparelhoAtual(): Aparelho {
  const g = globalThis as { navigator?: { maxTouchPoints?: number; hardwareConcurrency?: number; deviceMemory?: number };
                            screen?: { width: number; height: number } };
  return {
    toque: (g.navigator?.maxTouchPoints ?? 0) > 0,
    ladoMenor: g.screen ? Math.min(g.screen.width, g.screen.height) : 1080,
    nucleos: g.navigator?.hardwareConcurrency,
    memoria: g.navigator?.deviceMemory,
  };
}

export function obterQualidade(): Qualidade {
  if (qualidade !== undefined) return qualidade;
  let lida: Qualidade | null = null;
  try {
    const v = loja()?.getItem(CHAVE_QUALIDADE);
    if (v === 'alta' || v === 'leve') lida = v;
  } catch { /* fica no palpite */ }
  qualidade = lida ?? palpiteQualidade(aparelhoAtual());
  return qualidade;
}

export function definirQualidade(q: Qualidade): void {
  qualidade = q;
  try { loja()?.setItem(CHAVE_QUALIDADE, q); } catch { /* nada a fazer */ }
}

/* Som: a música e os efeitos têm volumes separados, de DESLIGADO a ALTO —
   tem quem jogue com a música baixa e os efeitos altos, e quem jogue no
   ônibus sem som nenhum. Os dois vêm no MÉDIO. */
export type Canal = 'musica' | 'efeitos';
export type Volume = 0 | 1 | 2 | 3;

export const NOME_VOLUME: Record<Volume, string> = { 0: 'DESLIGADO', 1: 'BAIXO', 2: 'MÉDIO', 3: 'ALTO' };

const CHAVE_VOLUME: Record<Canal, string> = {
  musica: 'encantados:config:musica:v1', efeitos: 'encantados:config:efeitos:v1',
};
let volumes: Partial<Record<Canal, Volume>> = {};

export function obterVolume(c: Canal): Volume {
  const v = volumes[c];
  if (v !== undefined) return v;
  let lido: Volume = 2;
  try {
    const n = Number(loja()?.getItem(CHAVE_VOLUME[c]) ?? NaN);
    if (n === 0 || n === 1 || n === 2 || n === 3) lido = n;
  } catch { /* fica no padrão */ }
  volumes[c] = lido;
  return lido;
}

export function definirVolume(c: Canal, v: Volume): void {
  volumes[c] = v;
  try { loja()?.setItem(CHAVE_VOLUME[c], String(v)); } catch { /* nada a fazer */ }
}

/* o próximo volume, dando a volta: ALTO → DESLIGADO */
export function proximoVolume(v: Volume, passo: 1 | -1 = 1): Volume {
  return (((v + passo) % 4 + 4) % 4) as Volume;
}
