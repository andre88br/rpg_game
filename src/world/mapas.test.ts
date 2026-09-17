/* =========================================================================
   Coerência dos mapas.

   Erro de grade não aparece no `tsc`: um caractere a mais numa linha, uma casa
   plantada em cima da única moita, uma porta que leva para dentro de uma
   parede — tudo isso compila. Estes testes leem os mapas de verdade e andam
   por eles, que é a única forma de pegar esse tipo de engano antes do jogador.
   ========================================================================= */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mapa, type ContextoMapa, type DefMapa } from './tilemap.ts';
import { Mundo } from './mundo.ts';
import { MAPAS, MAPA_INICIAL } from '../data/mapas/index.ts';
import { ESPECIES } from '../data/creatures.ts';
import { ITENS } from '../data/items.ts';
import { CONTAS, type Fala } from '../game/quests.ts';
import { CONTAS_NA_GUIA } from '../art/tiles.ts';

/* A região com TODOS os serviços feitos: a tranca do Zeca caiu, a guia se
   abriu. É neste mundo que tudo precisa ser alcançável — no mundo recém-
   começado, ficar barrado é justamente o ponto. */
const ABERTO: ContextoMapa = { contas: CONTAS_NA_GUIA, nadar: false, ligada: () => true };
/* e a região como ela está no primeiro minuto de jogo */
const FECHADO: ContextoMapa = { contas: 0, nadar: false, ligada: () => false };

const entradas = Object.entries(MAPAS);
const assados = new Map<string, Mapa>(entradas.map(([id, d]) => [id, new Mapa(d, ABERTO)]));
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

/* ------------------------------------------------------- falas e serviços */

test('todo NPC tem uma fala sem condição, para nunca ficar mudo', () => {
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      const solta = n.falas.some((f) => f.se === undefined && f.seNao === undefined);
      assert.ok(solta, `${id}: ${n.id} pode ficar sem nada a dizer`);
    }
  }
});

test('toda fala cita item que existe', () => {
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      for (const f of n.falas) {
        if (f.da) assert.ok(ITENS[f.da.item], `${id}/${n.id}: dá item desconhecido "${f.da.item}"`);
        if (f.pede) assert.ok(ITENS[f.pede.item], `${id}/${n.id}: pede item desconhecido "${f.pede.item}"`);
        assert.ok(f.linhas.length > 0, `${id}/${n.id}: fala sem nenhuma linha`);
      }
    }
  }
});

test('todo treinador tem time de espécies que existem', () => {
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      const t = n.treinador;
      if (!t) continue;
      assert.ok(t.time.length > 0, `${id}: ${n.id} desafia com o time vazio`);
      for (const c of t.time) {
        assert.ok(ESPECIES[c.especie], `${id}/${n.id}: espécie desconhecida "${c.especie}"`);
        assert.ok(c.nivel >= 1, `${id}/${n.id}: nível inválido`);
      }
      /* quem só conversa não precisa disso, mas quem barra o caminho tem
         que poder ser desafiado de frente, não só à distância */
      const desafia = n.falas.some((f) => f.batalha === true);
      assert.ok(desafia || !t.visao,
                `${id}: ${n.id} enxerga de longe mas não aceita desafio de perto`);
    }
  }
});

test('objeto e NPC condicionais só usam condição que alguém liga', () => {
  /* Uma condição escrita errado não acusa em lugar nenhum: o objeto
     simplesmente nunca aparece, ou nunca some, e ninguém percebe até o
     jogador travar. Então: tudo que alguma fala, algum treinador ou alguma
     medalha acende, contra tudo que os mapas cobram. */
  const acendiveis = new Set<string>(['contas', 'escolheu_inicial']);
  const daFala = (f: Fala): void => {
    const liga = f.liga === undefined ? [] : typeof f.liga === 'string' ? [f.liga] : f.liga;
    for (const l of liga) acendiveis.add(l);
    if (f.dom) acendiveis.add(`dom_${f.dom}`);
  };
  for (const [, def] of entradas) {
    for (const o of def.objetos) for (const f of o.falas ?? []) daFala(f);
    for (const n of def.npcs) {
      for (const f of n.falas) daFala(f);
      if (!n.treinador) continue;
      acendiveis.add(`venceu_${n.id}`);
      const liga = n.treinador.liga === undefined ? []
                 : typeof n.treinador.liga === 'string' ? [n.treinador.liga] : n.treinador.liga;
      for (const l of liga) acendiveis.add(l);
    }
  }

  const cobradas = (se?: string | readonly string[], seNao?: string | readonly string[]) =>
    [se, seNao].flat()
      .filter((c): c is string => typeof c === 'string')
      .map((c) => c.replace(/^!/, '').split('>=')[0]!)
      .filter((c) => !c.startsWith('item:') && !c.startsWith('medalha:'));

  for (const [id, def] of entradas) {
    for (const o of def.objetos) {
      for (const c of cobradas(o.se, o.seNao)) {
        assert.ok(acendiveis.has(c),
                  `${id}: objeto em (${o.tx},${o.ty}) depende de "${c}", que ninguém acende`);
      }
    }
    for (const n of def.npcs) {
      for (const c of cobradas(n.se, n.seNao)) {
        assert.ok(acendiveis.has(c),
                  `${id}: ${n.id} depende de "${c}", que ninguém acende`);
      }
    }
  }
});

test('a tranca da estrada fecha e abre de verdade', () => {
  /* é o que prova a cadeia inteira: objeto condicional, impressão do mapa e
     reassar. Sem isso, a tranca ficaria eterna — ou nunca teria existido. */
  const fechado = new Mapa(MAPAS['rotaFoz']!, FECHADO);
  const aberto = new Mapa(MAPAS['rotaFoz']!, ABERTO);
  const saida = MAPAS['rotaFoz']!.saidas!.find((s) => s.para === 'portoIara')!;
  const inicio = MAPAS['rotaFoz']!.inicio;

  assert.ok(!alcance(fechado, inicio.tx, inicio.ty).has(`${saida.tx},${saida.ty}`),
            'sem vencer o Zeca, a estrada para Porto Iara devia estar trancada');
  assert.ok(alcance(aberto, inicio.tx, inicio.ty).has(`${saida.tx},${saida.ty}`),
            'vencido o Zeca, a estrada devia abrir');
});

test('a guia só deixa passar com as cinco contas acesas', () => {
  const guia = MAPAS['portoIara']!.objetos.find((o) => o.tipo === 'portao')!;
  const porta = MAPAS['portoIara']!.saidas!.find((s) => s.para === 'terreiroPortoIara')!;
  const inicio = MAPAS['portoIara']!.inicio;

  for (let n = 0; n <= CONTAS_NA_GUIA; n++) {
    const ctx: ContextoMapa = { contas: n, nadar: false, ligada: () => false };
    const m = new Mapa(MAPAS['portoIara']!, ctx);
    const passa = alcance(m, inicio.tx, inicio.ty).has(`${porta.tx},${porta.ty}`);
    assert.equal(passa, n >= CONTAS_NA_GUIA,
                 `com ${n} contas, entrar no terreiro devia ser ${n >= CONTAS_NA_GUIA}`);
    assert.equal(m.solido(guia.tx, guia.ty), n < CONTAS_NA_GUIA);
  }
});

test('o Mundo reaproveita o mapa, mas não quando a condição muda', () => {
  const regiao = new Mundo(MAPAS);
  const a = regiao.obter('rotaFoz', FECHADO);
  assert.equal(regiao.obter('rotaFoz', FECHADO), a, 'mapa igual devia ser reaproveitado');
  const b = regiao.obter('rotaFoz', ABERTO);
  assert.notEqual(b, a, 'com a tranca fora, o cenário precisa ser remontado');
  assert.equal(regiao.obter('rotaFoz', ABERTO), b);

  // um mapa sem nada condicional é montado uma vez e pronto
  const c = regiao.obter('casaTaina', FECHADO);
  assert.equal(regiao.obter('casaTaina', ABERTO), c);
});

test('todo abrigo diz quem socorreu o jogador', () => {
  for (const [id, def] of entradas) {
    if (!def.refugio) continue;
    assert.ok(def.socorro, `${id}: é abrigo e não tem ninguém para receber quem apagou`);
    assert.ok(def.socorro!.falas.length > 0, `${id}: socorro sem fala`);
  }
});

/* ------------------------------------------------ o salão que escorrega */

/* Um passo, já com o escorregão: entra no tile e só para quando o chão
   secar ou a parede aparecer. É a mesma regra da cena do mundo. */
function passo(m: Mapa, x: number, y: number, dx: number, dy: number): [number, number] {
  let nx = x + dx, ny = y + dy;
  if (m.solido(nx, ny)) return [x, y];
  while (m.escorrega(nx, ny)) {
    const ax = nx + dx, ay = ny + dy;
    if (m.solido(ax, ay)) break;
    nx = ax; ny = ay;
  }
  return [nx, ny];
}

function alcanceDeslizando(m: Mapa, tx: number, ty: number): Set<string> {
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

test('o quebra-cabeça do terreiro tem solução', () => {
  const def = MAPAS['terreiroPortoIara']!;
  const m = mapa('terreiroPortoIara');
  const mariana = def.npcs.find((n) => n.id === 'mariana')!;
  const daPorta = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);

  // dá para chegar de frente para a Dona Mariana, escorregão a escorregão
  const vizinhos = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dx, dy]) => `${mariana.tx + dx!},${mariana.ty + dy!}`);
  assert.ok(vizinhos.some((v) => daPorta.has(v)),
            'o salão alagado não tem caminho até a Dona Mariana');
});

test('e ninguém fica preso no meio da água', () => {
  const def = MAPAS['terreiroPortoIara']!;
  const m = mapa('terreiroPortoIara');
  const entrada = `${def.inicio.tx},${def.inicio.ty}`;
  // de qualquer lugar que dê para alcançar, tem que dar para voltar
  for (const lugar of alcanceDeslizando(m, def.inicio.tx, def.inicio.ty)) {
    const [x, y] = lugar.split(',').map(Number) as [number, number];
    assert.ok(alcanceDeslizando(m, x, y).has(entrada),
              `quem chega em (${lugar}) não consegue mais voltar para a porta`);
  }
});

test('o salão do terreiro é mesmo um quebra-cabeça, não um corredor', () => {
  /* andando normal (sem escorregar) o caminho seria trivial; é a água que
     torna o salão um problema. Se um dia alguém tirar as poças, este teste
     avisa que o desafio virou corredor. */
  const def = MAPAS['terreiroPortoIara']!;
  const m = mapa('terreiroPortoIara');
  const pocas = def.chao.join('').split('').filter((c) => c === 'u').length;
  assert.ok(pocas > 40, `o salão tem só ${pocas} tiles de água`);

  const mariana = def.npcs.find((n) => n.id === 'mariana')!;
  const escorregando = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);
  const aPe = alcance(m, def.inicio.tx, def.inicio.ty);
  assert.ok(aPe.has(`${mariana.tx - 1},${mariana.ty}`),
            'sem escorregar o salão devia ser um corredor reto');
  assert.ok(escorregando.size < aPe.size,
            'a água devia tirar lugares de alcance, não deixar tudo igual');
});

/* --------------------------------------------- o Dom e as cinco contas */

test('a ilhota do açude só existe para quem sabe nadar', () => {
  /* é o teste do Dom: se a Medalha Maré não abrisse a água, o pote seria
     cenário inalcançável — e um prêmio que ninguém pega não é prêmio */
  const def = MAPAS['rotaFoz']!;
  const pote = def.objetos.find((o) => o.tipo === 'achado')!;
  const aPe = new Mapa(def, ABERTO);
  const nadando = new Mapa(def, { ...ABERTO, nadar: true });
  const alvo = `${pote.tx},${pote.ty}`;

  assert.ok(!alcance(aPe, def.inicio.tx, def.inicio.ty).has(alvo),
            'a pé a ilhota devia ser inalcançável');
  assert.ok(alcance(nadando, def.inicio.tx, def.inicio.ty).has(alvo),
            'com o Dom "Nadar" a ilhota devia abrir');
});

test('as cinco contas da guia podem mesmo ser acesas jogando', () => {
  /* A guia é o portão da fase inteira. Se uma conta não tiver ninguém que a
     acenda, o jogo fica sem fim — e nada no `tsc` diria isso. */
  const acesas = new Set<string>();
  for (const [, def] of entradas) {
    for (const o of def.objetos) {
      for (const f of o.falas ?? []) {
        for (const l of [f.liga].flat()) if (typeof l === 'string') acesas.add(l);
      }
    }
    for (const n of def.npcs) {
      for (const f of n.falas) {
        for (const l of [f.liga].flat()) if (typeof l === 'string') acesas.add(l);
      }
      for (const l of [n.treinador?.liga].flat()) if (typeof l === 'string') acesas.add(l);
    }
  }
  for (const c of CONTAS) {
    assert.ok(acesas.has(c.flag), `ninguém acende a conta "${c.servico}" (${c.flag})`);
  }
});

test('a Medalha Maré tem quem a entregue, com o Dom junto', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  const premio = falas.find((f) => f.medalha === 'mare');
  assert.ok(premio, 'ninguém entrega a Medalha Maré');
  assert.equal(premio!.dom, 'nadar', 'a Maré tem que vir com o Dom de nadar');
});

test('todo bicho desenhado no mapa é espécie que existe', () => {
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      if (!n.estilo.startsWith('bicho:')) continue;
      const arte = n.estilo.slice(6);
      assert.ok(Object.values(ESPECIES).some((e) => e.arte === arte),
                `${id}: ${n.id} usa a arte "${arte}", que não é de nenhuma espécie`);
    }
  }
});

test('quem foge tem o que entregar quando for encurralado', () => {
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      if (!n.fujao) continue;
      const solta = n.falas.find((f) => f.se === undefined && f.seNao === undefined);
      assert.ok(solta?.da || solta?.liga,
                `${id}: ${n.id} foge e, quando pego, não entrega nada`);
      assert.ok(n.seNao, `${id}: ${n.id} continuaria no mapa depois de entregar`);
    }
  }
});

/* ------------------------------------------------- dá para falar com eles?

   Tile andável não quer dizer nada: a Dona Firmina ficou uma versão inteira
   cercada por duas estantes e a própria mesa, com a fileira dela sem nenhuma
   entrada. Andável ela estava; alcançável, não. Este teste procura, para cada
   NPC, um lugar de onde o botão A chegue nele — de frente, ou por cima de um
   balcão — e exige que esse lugar tenha caminho a pé desde o início do mapa. */
test('dá para conversar com todo NPC sem atravessar parede', () => {
  const LADOS = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
  for (const [id, def] of entradas) {
    const m = mapa(id);
    const pes = alcance(m, def.inicio.tx, def.inicio.ty);
    for (const n of def.npcs) {
      const lugares: string[] = [];
      for (const [dx, dy] of LADOS) {
        // de frente para ele
        const x = n.tx - dx, y = n.ty - dy;
        if (!m.solido(x, y)) lugares.push(`${x},${y}`);
        // ou do outro lado de um balcão
        if (m.balcao(x, y) && !m.solido(n.tx - dx * 2, n.ty - dy * 2)) {
          lugares.push(`${n.tx - dx * 2},${n.ty - dy * 2}`);
        }
      }
      assert.ok(lugares.length > 0, `${id}: ${n.id} não tem de onde ser abordado`);
      assert.ok(lugares.some((l) => pes.has(l)),
                `${id}: ${n.id} está cercado — nenhum lugar de onde falar com ele tem caminho`);
    }
  }
});
