/* =========================================================================
   Coerência dos mapas.

   Erro de grade não aparece no `tsc`: um caractere a mais numa linha, uma casa
   plantada em cima da única moita, uma porta que leva para dentro de uma
   parede — tudo isso compila. Estes testes leem os mapas de verdade e andam
   por eles, que é a única forma de pegar esse tipo de engano antes do jogador.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa, type DefMapa } from './tilemap.ts';
import { MAPAS, MAPA_INICIAL } from '../data/mapas/index.ts';
import { ESPECIES } from '../data/creatures.ts';

const entradas = Object.entries(MAPAS);
const assados = new Map<string, Mapa>(entradas.map(([id, d]) => [id, new Mapa(d)]));
const mapa = (id: string): Mapa => {
  const m = assados.get(id);
  assert.ok(m, `mapa desconhecido: ${id}`);
  return m;
};

/* tiles alcançáveis a pé a partir de um ponto, sem atravessar sólido */
function alcance(m: Mapa, tx: number, ty: number): Set<string> {
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

test('a chave do registro é o id do mapa', () => {
  for (const [id, def] of entradas) assert.equal(def.id, id);
});

test('toda linha do chão tem o mesmo comprimento', () => {
  for (const [id, def] of entradas) {
    const larg = def.chao[0]?.length ?? 0;
    assert.ok(larg > 0, `${id}: mapa sem chão`);
    def.chao.forEach((linha, i) => {
      assert.equal(linha.length, larg, `${id}: linha ${i} tem ${linha.length} de ${larg}`);
    });
  }
});

test('todo caractere do chão é um tile conhecido', () => {
  // TILES cai no '.' quando não conhece o caractere, e um erro de digitação
  // viraria grama silenciosamente no meio do mar
  const conhecidos = new Set('.,=af~p#oR_WTmu'.split(''));
  for (const [id, def] of entradas) {
    def.chao.forEach((linha, y) => {
      [...linha].forEach((c, x) => {
        assert.ok(conhecidos.has(c), `${id}: caractere '${c}' em (${x},${y})`);
      });
    });
  }
});

test('todo início de mapa cai em tile andável', () => {
  for (const [id, def] of entradas) {
    const m = mapa(id);
    assert.ok(!m.solido(def.inicio.tx, def.inicio.ty),
              `${id}: início em (${def.inicio.tx},${def.inicio.ty}) é sólido`);
  }
});

test('todo NPC cai em tile andável, e nenhum em cima de outro', () => {
  for (const [id, def] of entradas) {
    const m = mapa(id);
    const ocupados = new Set<string>();
    for (const n of def.npcs) {
      assert.ok(!m.solido(n.tx, n.ty), `${id}: ${n.id} em (${n.tx},${n.ty}) é sólido`);
      const k = `${n.tx},${n.ty}`;
      assert.ok(!ocupados.has(k), `${id}: dois NPCs em ${k}`);
      ocupados.add(k);
      assert.ok(`${def.inicio.tx},${def.inicio.ty}` !== k, `${id}: ${n.id} em cima do início`);
    }
  }
});

test('toda placa e todo portão ficam num tile que dá para ler de frente', () => {
  for (const [id, def] of entradas) {
    const m = mapa(id);
    for (const o of def.objetos) {
      if (o.tipo !== 'placa' && o.tipo !== 'portao') continue;
      const larg = o.tipo === 'placa' ? 1 : (o.larg ?? 1);
      let vizinho = false;
      for (let i = 0; i < larg; i++) {
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
          if (!m.solido(o.tx + i + dx, o.ty + dy)) vizinho = true;
        }
      }
      assert.ok(vizinho, `${id}: ${o.tipo} em (${o.tx},${o.ty}) não tem de onde ser lido`);
    }
  }
});

test('toda saída leva a um mapa que existe, e cai em chão livre', () => {
  for (const [id, def] of entradas) {
    const m = mapa(id);
    for (const s of def.saidas ?? []) {
      const onde = `${id} (${s.tx},${s.ty}) -> ${s.para}`;
      assert.ok(MAPAS[s.para], `${onde}: mapa de destino não existe`);
      assert.ok(!m.solido(s.tx, s.ty), `${onde}: o tile da saída é sólido`);

      const destino = mapa(s.para);
      assert.ok(destino.dentro(s.destino.tx, s.destino.ty), `${onde}: destino fora do mapa`);
      assert.ok(!destino.solido(s.destino.tx, s.destino.ty), `${onde}: destino é sólido`);
      // cair em cima de outra saída jogaria o jogador de volta na hora
      assert.equal(destino.saidaEm(s.destino.tx, s.destino.ty), undefined,
                   `${onde}: o destino é outra saída — isso faz laço de porta`);
      assert.ok(!MAPAS[s.para]!.npcs.some((n) => n.tx === s.destino.tx && n.ty === s.destino.ty),
                `${onde}: tem um NPC parado em cima do destino`);
    }
  }
});

test('toda saída é alcançável a pé de dentro do próprio mapa', () => {
  for (const [id, def] of entradas) {
    const m = mapa(id);
    const pes = alcance(m, def.inicio.tx, def.inicio.ty);
    for (const s of def.saidas ?? []) {
      assert.ok(pes.has(`${s.tx},${s.ty}`),
                `${id}: a saída (${s.tx},${s.ty}) não tem caminho a partir do início`);
    }
  }
});

test('todo mato alto é alcançável a pé', () => {
  // foi o que deixou passar a casa plantada em cima da única moita de Porto Iara
  for (const [id, def] of entradas) {
    const m = mapa(id);
    const pes = alcance(m, def.inicio.tx, def.inicio.ty);
    let mato = 0, presos = 0;
    for (let ty = 0; ty < def.chao.length; ty++) {
      for (let tx = 0; tx < def.chao[ty]!.length; tx++) {
        if (!m.temEncontro(tx, ty)) continue;
        mato++;
        if (!pes.has(`${tx},${ty}`)) presos++;
      }
    }
    assert.equal(presos, 0, `${id}: ${presos} de ${mato} tiles de mato alto sem caminho`);
    if (def.encontros?.length) assert.ok(mato > 0, `${id}: tem tabela de encontro e nenhum mato`);
  }
});

test('toda tabela de encontro cita espécie que existe', () => {
  for (const [id, def] of entradas) {
    for (const f of def.encontros ?? []) {
      assert.ok(ESPECIES[f.especie], `${id}: espécie desconhecida "${f.especie}"`);
      assert.ok(f.min <= f.max, `${id}: ${f.especie} com min acima do max`);
      assert.ok(f.peso > 0, `${id}: ${f.especie} com peso zero`);
    }
  }
});

test('todo mapa é alcançável a partir do mapa inicial', () => {
  const vistos = new Set<string>([MAPA_INICIAL]);
  const fila = [MAPA_INICIAL];
  while (fila.length) {
    const id = fila.shift()!;
    for (const s of (MAPAS[id] as DefMapa).saidas ?? []) {
      if (vistos.has(s.para)) continue;
      vistos.add(s.para);
      fila.push(s.para);
    }
  }
  const orfaos = Object.keys(MAPAS).filter((id) => !vistos.has(id));
  assert.deepEqual(orfaos, [], `mapas sem caminho a partir de ${MAPA_INICIAL}`);
});
