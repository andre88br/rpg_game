/* =========================================================================
   Gravar e retomar a partida — em 6 slots.

   O save é um JSON no localStorage, um por slot. Ele atravessa publicações
   do jogo, então o que ele diz NÃO é confiável: uma espécie pode ter sumido
   do jogo, um golpe pode ter mudado de nome, um mapa pode não existir mais.
   Por isso `restaurar()` confere tudo contra os dados atuais e descarta o
   que não reconhece, em vez de estourar uma exceção na cara de quem só
   queria continuar jogando.

   A partida sabe em qual slot está — `slotAtivo()` — e é nele que as
   gravações automáticas (curar, trocar de mapa, acender uma conta...) caem
   sem perguntar nada. Escolher UM slot entre os seis, e perguntar antes de
   sobrescrever um que já tem gente dentro, é trabalho de tela — de
   `scenes/slots.ts`, não deste arquivo.

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

/* chave do formato ANTIGO, de um save só — só existe para migrar quem já
   jogava antes dos slots. Nunca mais é escrita. */
const CHAVE_ANTIGA = 'encantados:save:v1';

export const NUM_SLOTS = 6;
export const VERSAO = 1;

function chaveSlot(slot: number): string { return `encantados:save:v1:${slot}`; }

export interface SaveJogo {
  v: number;
  quando: number;          // milissegundos, só para mostrar na tela
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

  /* time vazio é estado legítimo: quem gravou antes de escolher o inicial na
     mesa da Dona Firmina volta exatamente ali */
  const time = (Array.isArray(j['time']) ? j['time'] : [])
    .map(bicho).filter((c): c is Encantado => c !== null).slice(0, TAMANHO_TIME);

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
    if (ls) { ls.getItem(chaveSlot(0)); armazem = ls; } else { armazem = null; }
  } catch { armazem = null; }
  return armazem;
}

/* usado pelos testes: troca o armazém por um de mentira */
export function usarArmazem(a: Armazem | null): void { armazem = a; }

/* --------------------------------------------------------------- os slots

   Seis gavetas independentes. Cada uma vive na sua própria chave — trocar
   de slot nunca risca o vizinho, e apagar um não mexe nos outros cinco. */

export function salvarEmSlot(e: EstadoJogo, slot: number): boolean {
  const ls = loja();
  if (!ls) return false;
  try { ls.setItem(chaveSlot(slot), JSON.stringify(serializar(e))); return true; }
  catch { return false; }        // cota estourada, modo privado do Safari...
}

export function carregarDeSlot(slot: number): EstadoJogo | null {
  const ls = loja();
  if (!ls) return null;
  try {
    const cru = ls.getItem(chaveSlot(slot));
    if (!cru) return null;
    return restaurar(JSON.parse(cru));
  } catch { return null; }
}

export function temSaveEmSlot(slot: number): boolean {
  const ls = loja();
  if (!ls) return false;
  try { return ls.getItem(chaveSlot(slot)) !== null; } catch { return false; }
}

export function apagarSlot(slot: number): void {
  const ls = loja();
  if (!ls) return;
  try { ls.removeItem(chaveSlot(slot)); } catch { /* nada a fazer */ }
}

export function algumSlotOcupado(): boolean {
  for (let i = 0; i < NUM_SLOTS; i++) if (temSaveEmSlot(i)) return true;
  return false;
}

/* o primeiro slot livre, para "novo jogo" não precisar perguntar nada
   quando ainda sobra uma gaveta vazia */
export function primeiroSlotVazio(): number | null {
  for (let i = 0; i < NUM_SLOTS; i++) if (!temSaveEmSlot(i)) return i;
  return null;
}

function formatarData(ms: number): string {
  const d = new Date(ms);
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

/* O que a tela de slots mostra de cada gaveta, sem precisar montar a
   partida inteira toda vez que redesenha. */
export interface ResumoSlot {
  slot: number;
  nome: string;
  quando: string | null;
  nivel: number;          // maior nível do time; 0 se ainda não tem ninguém
  mapa: string;
  medalhas: number;
}

export function resumoSlot(slot: number): ResumoSlot | null {
  const ls = loja();
  if (!ls) return null;
  let cru: string | null;
  try { cru = ls.getItem(chaveSlot(slot)); } catch { return null; }
  if (!cru) return null;

  let bruto: unknown;
  try { bruto = JSON.parse(cru); } catch { return null; }
  const jogo = restaurar(bruto);
  if (!jogo) return null;

  const quandoMs = (bruto as Record<string, unknown>)['quando'];
  return {
    slot,
    nome: jogo.nome,
    quando: typeof quandoMs === 'number' ? formatarData(quandoMs) : null,
    nivel: jogo.time.reduce((max, c) => Math.max(max, c.nivel), 0),
    mapa: MAPAS[jogo.posicao.mapa]?.nome ?? '???',
    medalhas: jogo.medalhas.length,
  };
}

export function resumoTodos(): (ResumoSlot | null)[] {
  return Array.from({ length: NUM_SLOTS }, (_, i) => resumoSlot(i));
}

/* --------------------------------------------------------- o slot ativo

   Qual das seis gavetas a sessão atual está jogando — é nela que caem as
   gravações automáticas, sem perguntar nada a cada uma. Só muda quando o
   jogador escolhe outro slot de propósito: ao CONTINUAR, ou ao gravar num
   slot diferente pela tela SALVAR. */
let slotAtivo = 0;

export function obterSlotAtivo(): number { return slotAtivo; }

export function definirSlotAtivo(slot: number): void {
  slotAtivo = Math.max(0, Math.min(NUM_SLOTS - 1, Math.floor(slot)));
}

/* Quem jogava antes dos seis slots tinha UM save, numa chave sem número.
   Essa chave nunca mais é escrita; só é lida aqui, uma vez, para o slot 1
   de quem já jogava não amanhecer vazio. */
export function migrarSaveAntigo(): void {
  const ls = loja();
  if (!ls) return;
  try {
    const antigo = ls.getItem(CHAVE_ANTIGA);
    if (!antigo) return;
    if (ls.getItem(chaveSlot(0)) === null) ls.setItem(chaveSlot(0), antigo);
    ls.removeItem(CHAVE_ANTIGA);
  } catch { /* nada a fazer */ }
}

/* ------------------------------------------------------- atalhos do slot ativo

   Os pontos de gravação automática espalhados pelo jogo (curar, trocar de
   mapa, acender uma conta, vencer um treinador...) não sabem de slot — só
   chamam `salvar(estado)`, como sempre chamaram. Por baixo, cai sempre no
   slot ativo da sessão. */
export function salvar(e: EstadoJogo): boolean { return salvarEmSlot(e, slotAtivo); }
export function carregar(): EstadoJogo | null { return carregarDeSlot(slotAtivo); }
export function temSave(): boolean { return temSaveEmSlot(slotAtivo); }
export function apagar(): void { apagarSlot(slotAtivo); }

/* Quando o slot ativo foi gravado, em palavras curtas. */
export function quandoSalvou(): string | null { return resumoSlot(slotAtivo)?.quando ?? null; }
