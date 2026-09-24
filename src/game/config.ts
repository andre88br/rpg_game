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
  armazem = a; velocidade = undefined; visao3d = undefined;
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
