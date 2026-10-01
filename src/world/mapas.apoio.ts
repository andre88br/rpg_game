/* =========================================================================
   Apoio dos testes de coerência dos mapas (mapas*.test.ts): o mundo com
   tudo aberto e com tudo fechado, e os jeitos de andar por ele — a pé,
   deslizando, pelos trilhos — que vários testes de região reaproveitam.
   ========================================================================= */
import assert from 'node:assert/strict';
import { Mapa, type ContextoMapa, type DefMapa } from './tilemap.ts';
import { MAPAS } from '../data/mapas/index.ts';
import { CONTAS_NA_GUIA } from '../art/tiles.ts';

/* segundos por tile, os mesmos de world/actor.ts (que não carrega no node:
   usa propriedade de parâmetro, fora do modo só-tipos) */
export const VEL_ANDAR = 0.20, VEL_CORRER = 0.115;

/* A região com TODOS os serviços feitos: a tranca do Zeca caiu, a guia se
   abriu, e o Dom "Nadar" já foi conquistado — é ele que abre a travessia
   para a Mata do Curupira. É neste mundo que tudo precisa ser alcançável —
   no mundo recém-começado, ficar barrado é justamente o ponto. */
export const ABERTO: ContextoMapa = { contas: () => CONTAS_NA_GUIA, nadar: true, ligada: () => true };
/* e a região como ela está no primeiro minuto de jogo */
export const FECHADO: ContextoMapa = { contas: () => 0, nadar: false, ligada: () => false };

export const entradas = Object.entries(MAPAS);
export const assados = new Map<string, Mapa>(entradas.map(([id, d]) => [id, new Mapa(d, ABERTO)]));
export const mapa = (id: string): Mapa => {
  const m = assados.get(id);
  assert.ok(m, `mapa desconhecido: ${id}`);
  return m;
};

/* tiles alcançáveis a pé a partir de um ponto, sem atravessar sólido */
export function alcance(m: Mapa, tx: number, ty: number): Set<string> {
  const vistos = new Set<string>([`${tx},${ty}`]);
  const fila: [number, number][] = [[tx, ty]];
  while (fila.length) {
    const [x, y] = fila.shift()!;
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
      const nx = x + dx, ny = y + dy;
      const k = `${nx},${ny}`;
      if (vistos.has(k) || m.solido(nx, ny)) continue;
      vistos.add(k);
      fila.push([nx, ny]);
    }
  }
  return vistos;
}

/* Um passo, já com o escorregão: entra no tile e só para quando o chão
   secar ou a parede aparecer. É a mesma regra da cena do mundo. */
export function passo(m: Mapa, x: number, y: number, dx: number, dy: number): [number, number] {
  let nx = x + dx, ny = y + dy;
  if (m.solido(nx, ny)) return [x, y];
  while (m.escorrega(nx, ny)) {
    const ax = nx + dx, ay = ny + dy;
    if (m.solido(ax, ay)) break;
    nx = ax; ny = ay;
  }
  return [nx, ny];
}

export function alcanceDeslizando(m: Mapa, tx: number, ty: number): Set<string> {
  const vistos = new Set<string>([`${tx},${ty}`]);
  const fila: [number, number][] = [[tx, ty]];
  while (fila.length) {
    const [x, y] = fila.shift()!;
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
      const [nx, ny] = passo(m, x, y, dx, dy);
      const k = `${nx},${ny}`;
      if (vistos.has(k)) continue;
      vistos.add(k);
      fila.push([nx, ny]);
    }
  }
  return vistos;
}

/* Um passo a pé e, se ele cair num trilho de vagonete, a viagem inteira:
   o trilho leva na direção dele enquanto houver chão à frente (a mesma
   regra de `aoPisarNoTile` em overworld.ts). Sem trilho, é só o passo. */
export const DIR_DELTA = { cima: [0, -1], baixo: [0, 1], esq: [-1, 0], dir: [1, 0] } as const;
export function passoComTrilho(m: Mapa, x: number, y: number, dx: number, dy: number): [number, number] | null {
  let nx = x + dx, ny = y + dy;
  if (m.solido(nx, ny)) return null;
  for (let guarda = 0; guarda < 500; guarda++) {
    const t = m.trilho(nx, ny);
    if (!t) break;
    const [tx, ty] = DIR_DELTA[t];
    if (m.solido(nx + tx, ny + ty)) break;
    nx += tx; ny += ty;
  }
  return [nx, ny];
}

/* As chaves de para-raio. Cada chave é um par de objetos `paraRaio` com a
   mesma posição; tocar nela (de frente, num vizinho ortogonal) troca a flag.
   A busca é sobre (posição, chaves ligadas): andar custa 0, tocar custa 1,
   e a distância até o alvo é o menor número de toques que resolve a sala.
   Todo movimento aqui é reversível — andar volta pelo mesmo tile, tocar de
   novo desfaz o toque —, então TODO estado alcançável consegue voltar ao
   início e dali seguir para o alvo: ninguém fica preso, desde que nenhuma
   cerca feche em cima de quem está tocando a chave (conferido à parte). */
export function resolverChaves(
  def: DefMapa, chaves: readonly string[], sempre: ReadonlySet<string>,
  de: { tx: number; ty: number }, alvo: { tx: number; ty: number },
): number | null {
  const mapas = new Map<number, Mapa>();
  const mapaDe = (mask: number): Mapa => {
    let m = mapas.get(mask);
    if (!m) {
      const ligadas = new Set(chaves.filter((_, i) => mask & (1 << i)));
      m = new Mapa(def, { contas: () => 0, nadar: true,
                          ligada: (c) => sempre.has(c) || ligadas.has(c) });
      mapas.set(mask, m);
    }
    return m;
  };
  const postes = chaves.map((k) => {
    const o = def.objetos.find((x) => (x.tipo === 'paraRaio' || x.tipo === 'alavanca')
      && x.falas?.some((f) => [f.liga, f.desliga].flat().includes(k)));
    assert.ok(o, `${def.id}: a chave "${k}" não tem poste`);
    return o!;
  });
  const LADOS = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
  const chave = (x: number, y: number, mask: number): string => `${x},${y},${mask}`;
  const dist = new Map<string, number>([[chave(de.tx, de.ty, 0), 0]]);
  const fila: [number, number, number][] = [[de.tx, de.ty, 0]];
  while (fila.length) {
    const [x, y, mask] = fila.shift()!;
    const d = dist.get(chave(x, y, mask))!;
    if (x === alvo.tx && y === alvo.ty) return d;
    const m = mapaDe(mask);
    for (const [dx, dy] of LADOS) {
      const onde = passoComTrilho(m, x, y, dx, dy);
      if (!onde) continue;
      const [nx, ny] = onde, k = chave(nx, ny, mask);
      if ((dist.get(k) ?? Infinity) <= d) continue;
      dist.set(k, d);
      fila.unshift([nx, ny, mask]);
    }
    postes.forEach((p, i) => {
      if (Math.abs(p.tx - x) + Math.abs(p.ty - y) !== 1) return;
      const nmask = mask ^ (1 << i), k = chave(x, y, nmask);
      if ((dist.get(k) ?? Infinity) <= d + 1) return;
      dist.set(k, d + 1);
      fila.push([x, y, nmask]);
    });
  }
  return null;
}
