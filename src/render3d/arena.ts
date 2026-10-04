/* =========================================================================
   A arena da batalha 3D: o que fica em volta (por cenário) e para onde a
   câmera olha (pelo que a cena está mostrando).

   Puro — a vista lê estas tabelas. Teste em arena.test.ts.
   ========================================================================= */
import type { Cenario } from '../art/battlebg.ts';

export interface Arena {
  /* cor do chão em volta e das duas plataformas */
  chao: string;
  plataforma: string;
  borda: string;
  /* o que se vê em volta */
  mar: boolean;
  arvores: boolean;
  casas: boolean;
  rochas: boolean;
  /* caverna: luz de dentro, sem céu */
  interior: boolean;
}

const CENARIOS: Record<Cenario, Omit<Arena, 'chao'> & { chao?: string }> = {
  praia: { chao: '#e2cb8e', plataforma: '#d6bc80', borda: '#b89a5e', mar: true, arvores: true, casas: false, rochas: false, interior: false },
  mata: { plataforma: '#7aa858', borda: '#5a8040', mar: false, arvores: true, casas: false, rochas: true, interior: false },
  cidade: { chao: '#c9b088', plataforma: '#b8a888', borda: '#8a7a60', mar: false, arvores: true, casas: true, rochas: false, interior: false },
  caverna: { chao: '#5a5260', plataforma: '#6c6274', borda: '#4a4252', mar: false, arvores: false, casas: false, rochas: true, interior: true },
};

/* a grama de cada região (a mesma do relevo do mapa) */
const GRAMA: Record<string, string> = {
  agua: '#72b35a', planta: '#5a9c46', fogo: '#8f9a58', vento: '#9cc45e', raio: '#68a852',
  terra: '#bda866', sombra: '#5f7258', luz: '#a6c85c', fora: '#72b35a',
};

export function arenaDe(cenario: Cenario, regiao: string | null): Arena {
  const c = CENARIOS[cenario] ?? CENARIOS.mata;
  return { ...c, chao: c.chao ?? GRAMA[regiao ?? 'fora'] ?? GRAMA['fora']! };
}

export const CENARIOS_3D: readonly Cenario[] = Object.keys(CENARIOS) as Cenario[];

/* ------------------------------------------------------------- câmera

   O aliado fica em (−1,6; 0; 1,4) olhando para o inimigo em (1,6; 0; −1,4).
   A câmera clássica fica atrás e à direita do aliado: ele embaixo à
   esquerda, de costas, e o inimigo em cima à direita, como no 2D. */
export type Foco = 'geral' | 'ataqueAliado' | 'ataqueInimigo' | 'entrada';

export const POSTO_3D = {
  aliado: [-1.6, 0, 1.4] as const,
  inimigo: [1.6, 0, -1.4] as const,
};

export const CAMERAS: Record<Foco, { pos: [number, number, number]; olha: [number, number, number]; fov: number }> = {
  // achadas por busca numérica: os pés de cada um caem onde o sprite 2D
  // fica (POSTO_ALIADO/POSTO_INIMIGO), acima da caixa de texto
  geral: { pos: [1.0, 3.2, 6.2], olha: [-0.74, -0.67, -2.58], fov: 40 },
  ataqueAliado: { pos: [-0.15, 2.2, 6.1], olha: [0.0, -0.52, -3.98], fov: 38 },
  ataqueInimigo: { pos: [0.33, 3.4, 6.8], olha: [0.31, 1.25, 2.03], fov: 40 },
  entrada: { pos: [1.5, 4.4, 7.2], olha: [-0.48, 0.18, -0.67], fov: 46 },
};

export interface EstadoCena {
  avanco: { aliado: number; inimigo: number };
  entrada: { aliado: number; inimigo: number };
  /* quem lançou o golpe que ainda voa ou acaba de acertar (segura a câmera) */
  golpe?: 'aliado' | 'inimigo' | null;
}

/* quem está atacando ganha a câmera; quem está entrando também */
export function focoDaCena(e: EstadoCena): Foco {
  if (e.avanco.aliado > 0 || e.golpe === 'aliado') return 'ataqueAliado';
  if (e.avanco.inimigo > 0 || e.golpe === 'inimigo') return 'ataqueInimigo';
  if (e.entrada.aliado < 1 || e.entrada.inimigo < 1) return 'entrada';
  return 'geral';
}
