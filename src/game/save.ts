/* =========================================================================
   Gravar e retomar a partida.

   O save é um JSON no localStorage. Ele atravessa publicações do jogo, então
   o que ele diz NÃO é confiável: uma espécie pode ter sumido do jogo, um
   golpe pode ter mudado de nome, um mapa pode não existir mais. Por isso
   `restaurar()` confere tudo contra os dados atuais e descarta o que não
   reconhece, em vez de estourar uma exceção na cara de quem só queria
   continuar jogando.

   A parte pura — serializar e restaurar — não toca em localStorage, e é por
   isso que ela tem teste em save.test.ts.
   ========================================================================= */
import { ESPECIES, especie as fichaEspecie } from '../data/creatures.ts';
import { GOLPES, golpe as fichaGolpe } from '../data/moves.ts';
import { ITENS } from '../data/items.ts';
import { STATUS, type Status } from '../battle/status.ts';
import { hpMaximo, xpDoNivel, NIVEL_MAX, MAX_GOLPES, type Encantado } from '../battle/encantado.ts';
import { MAPAS, MAPA_INICIAL } from '../data/mapas/index.ts';
import type { Direcao } from '../art/people.ts';
import { TAMANHO_TIME, type EstadoJogo, type Lugar } from './state.ts';

export const CHAVE = 'encantados:save:v1';
export const VERSAO = 1;

export interface SaveJogo {
  v: number;
  quando: number;          // milissegundos, só para mostrar no título
  jogo: EstadoJogo;
}

/* ------------------------------------------------------------- serializar

   O estado já é dado puro: Encantado não tem método e a mochila é um
   Record. Um JSON.parse(JSON.stringify()) basta, e de quebra garante que
   nada com referência viva (a cena, o motor) escapou para dentro do save. */
export function serializar(e: EstadoJogo): SaveJogo {
  return { v: VERSAO, quando: Date.now(), jogo: JSON.parse(JSON.stringify(e)) as EstadoJogo };
}

/* -------------------------------------------------------------- restaurar */

function texto(v: unknown, padrao: string): string {
  return typeof v === 'string' && v.length > 0 ? v : padrao;
}

function inteiro(v: unknown, padrao: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : padrao;
  return Math.max(min, Math.min(max, n));
}

function listaDeTexto(v: unknown, valido: (s: string) => boolean): string[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.filter((s): s is string => typeof s === 'string' && valido(s)))];
}

const DIRECOES: readonly string[] = ['cima', 'baixo', 'esq', 'dir'];

function lugar(v: unknown, padrao: Lugar): Lugar {
  const o = (v ?? {}) as Record<string, unknown>;
  /* mapa que não existe mais leva o resto junto: as coordenadas dele não
     querem dizer nada aqui, e cairiam dentro de uma parede qualquer */
  if (typeof o['mapa'] !== 'string' || !MAPAS[o['mapa']]) return { ...padrao };
  const id = o['mapa'];
  const def = MAPAS[id]!;
  const largura = def.chao[0]?.length ?? 1;
  const tx = inteiro(o['tx'], def.inicio.tx, 0, largura - 1);
  const ty = inteiro(o['ty'], def.inicio.ty, 0, def.chao.length - 1);
  const dir = (typeof o['dir'] === 'string' && DIRECOES.includes(o['dir'])
    ? o['dir'] : def.inicio.dir) as Direcao;
  return { mapa: id, tx, ty, dir };
}

/* Um bicho do save só entra no time se a espécie ainda existir. Nível, XP e
   HP são recalculados dentro dos limites de hoje: se a tabela de atributos
   mudou entre duas publicações, ninguém volta com vida acima do máximo. */
function bicho(v: unknown): Encantado | null {
  const o = (v ?? {}) as Record<string, unknown>;
  const id = typeof o['especie'] === 'string' ? o['especie'] : '';
  if (!ESPECIES[id]) return null;

  const nivel = inteiro(o['nivel'], 5, 1, NIVEL_MAX);
  const golpes = (Array.isArray(o['golpes']) ? o['golpes'] : [])
    .map((g) => (g ?? {}) as Record<string, unknown>)
    .filter((g) => typeof g['id'] === 'string' && GOLPES[g['id']])
    .slice(0, MAX_GOLPES)
    .map((g) => {
      const idGolpe = g['id'] as string;
      const ppMax = inteiro(g['ppMax'], fichaGolpe(idGolpe).pp, 1, 99);
      return { id: idGolpe, ppMax, pp: inteiro(g['pp'], ppMax, 0, ppMax) };
    });
  /* sem nenhum golpe reconhecido o bicho ficaria mudo em batalha */
  if (golpes.length === 0) {
    const primeiro = fichaEspecie(id).aprende[0];
    if (!primeiro) return null;
    const f = fichaGolpe(primeiro.golpe);
    golpes.push({ id: primeiro.golpe, pp: f.pp, ppMax: f.pp });
  }

  const status = typeof o['status'] === 'string' && o['status'] in STATUS
    ? (o['status'] as Status) : null;

  const e: Encantado = {
    especie: id,
    apelido: typeof o['apelido'] === 'string' ? o['apelido'] : null,
    nivel,
    xp: inteiro(o['xp'], xpDoNivel(nivel, fichaEspecie(id).crescimento), 0),
    hp: 0,
    status,
    turnosStatus: inteiro(o['turnosStatus'], 0, 0, 9),
    golpes,
    selvagem: false,
  };
  e.hp = inteiro(o['hp'], hpMaximo(e), 0, hpMaximo(e));
  return e;
}

/* Devolve null quando o blob não é um save desta versão. Qualquer outro
   defeito é corrigido em silêncio — perder a partida inteira por causa de um
   campo torto seria pior do que voltar com um item a menos. */
export function restaurar(bruto: unknown): EstadoJogo | null {
  const s = (bruto ?? {}) as Record<string, unknown>;
  if (s['v'] !== VERSAO) return null;
  const j = (s['jogo'] ?? null) as Record<string, unknown> | null;
  if (!j || typeof j !== 'object') return null;

  const inicial = MAPAS[MAPA_INICIAL]!;
  const padrao: Lugar = { mapa: MAPA_INICIAL, ...inicial.inicio };

  const time = (Array.isArray(j['time']) ? j['time'] : [])
    .map(bicho).filter((c): c is Encantado => c !== null).slice(0, TAMANHO_TIME);
  if (time.length === 0) return null;      // sem time não há partida a retomar

  const mochila: Record<string, number> = {};
  const m = (j['mochila'] ?? {}) as Record<string, unknown>;
  for (const [id, n] of Object.entries(m)) {
    if (!ITENS[id]) continue;
    const q = inteiro(n, 0, 0, 99);
    if (q > 0) mochila[id] = q;
  }

  const flags: Record<string, boolean> = {};
  const f = (j['flags'] ?? {}) as Record<string, unknown>;
  for (const [k, v] of Object.entries(f)) if (v === true) flags[k] = true;

  return {
    nome: texto(j['nome'], 'TAINÁ'),
    posicao: lugar(j['posicao'], padrao),
    refugio: lugar(j['refugio'], padrao),
    time,
    caixa: (Array.isArray(j['caixa']) ? j['caixa'] : [])
      .map(bicho).filter((c): c is Encantado => c !== null),
    mochila,
    dinheiro: inteiro(j['dinheiro'], 0, 0, 999999),
    medalhas: listaDeTexto(j['medalhas'], () => true),
    flags,
    vistos: listaDeTexto(j['vistos'], (s2) => ESPECIES[s2] !== undefined),
    capturados: listaDeTexto(j['capturados'], (s2) => ESPECIES[s2] !== undefined),
  };
}

/* ------------------------------------------------------------ o armazém

   Em aba privada, com cookies bloqueados ou dentro de um iframe, cada
   acesso ao localStorage pode ESTOURAR — não apenas devolver vazio. Tudo
   aqui é embrulhado, e quem chama só precisa olhar o booleano. */
export interface Armazem {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
}

let armazem: Armazem | null | undefined;

function loja(): Armazem | null {
  if (armazem !== undefined) return armazem;
  try {
    const ls = (globalThis as { localStorage?: Armazem }).localStorage ?? null;
    if (ls) { ls.getItem(CHAVE); armazem = ls; } else { armazem = null; }
  } catch { armazem = null; }
  return armazem;
}

/* usado pelos testes: troca o armazém por um de mentira */
export function usarArmazem(a: Armazem | null): void { armazem = a; }

export function salvar(e: EstadoJogo): boolean {
  const ls = loja();
  if (!ls) return false;
  try { ls.setItem(CHAVE, JSON.stringify(serializar(e))); return true; }
  catch { return false; }        // cota estourada, modo privado do Safari...
}

export function carregar(): EstadoJogo | null {
  const ls = loja();
  if (!ls) return null;
  try {
    const cru = ls.getItem(CHAVE);
    if (!cru) return null;
    return restaurar(JSON.parse(cru));
  } catch { return null; }
}

export function temSave(): boolean {
  const ls = loja();
  if (!ls) return false;
  try { return ls.getItem(CHAVE) !== null; } catch { return false; }
}

export function apagar(): void {
  const ls = loja();
  if (!ls) return;
  try { ls.removeItem(CHAVE); } catch { /* nada a fazer */ }
}

/* Quando o save foi gravado, em palavras curtas, para a tela de título. */
export function quandoSalvou(): string | null {
  const ls = loja();
  if (!ls) return null;
  try {
    const cru = ls.getItem(CHAVE);
    if (!cru) return null;
    const q = (JSON.parse(cru) as SaveJogo).quando;
    if (typeof q !== 'number') return null;
    const d = new Date(q);
    const dois = (n: number) => String(n).padStart(2, '0');
    return `${dois(d.getDate())}/${dois(d.getMonth() + 1)} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
  } catch { return null; }
}
