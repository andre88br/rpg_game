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
import { SERVICOS_OPCIONAIS, TERREIROS, type Fala } from '../game/quests.ts';
import { CONTAS_NA_GUIA } from '../art/tiles.ts';
import { temSolucao } from './pedras.ts';

/* A região com TODOS os serviços feitos: a tranca do Zeca caiu, a guia se
   abriu, e o Dom "Nadar" já foi conquistado — é ele que abre a travessia
   para a Mata do Curupira. É neste mundo que tudo precisa ser alcançável —
   no mundo recém-começado, ficar barrado é justamente o ponto. */
const ABERTO: ContextoMapa = { contas: () => CONTAS_NA_GUIA, nadar: true, ligada: () => true };
/* e a região como ela está no primeiro minuto de jogo */
const FECHADO: ContextoMapa = { contas: () => 0, nadar: false, ligada: () => false };

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
  const conhecidos = new Set('.,=af~p#oR_WTmuvcnLSsgVDECB'.split(''));
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

      /* NPC é sólido (overworld.ts, `livre`): um que exista SEMPRE e esteja
         plantado no único vizinho andável da porta tranca a saída para
         valer, mesmo depois de vencido — foi o que aconteceu com a
         Sopradora do Fole, parada em (8,1), o único acesso à porta (8,0) do
         campo de escória. Quem tem `se`/`seNao` some em algum momento, e
         por isso não conta como bloqueio permanente. */
      const fixos = def.npcs.filter((n) => n.se === undefined && n.seNao === undefined);
      const vizinhos = [[0, -1], [0, 1], [-1, 0], [1, 0]]
        .map(([dx, dy]) => ({ tx: s.tx + dx!, ty: s.ty + dy! }))
        .filter((v) => !m.solido(v.tx, v.ty));
      const livres = vizinhos.filter(
        (v) => !fixos.some((n) => n.tx === v.tx && n.ty === v.ty));
      assert.ok(vizinhos.length === 0 || livres.length > 0,
                `${onde}: todo acesso à porta tem NPC fixo em cima — ` +
                `o jogador não consegue chegar nela`);
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
    // toda pedra de partida prova que a flag da cova dela pode mesmo acender
    // — quem tapa a cova é o empurrão, em código, não fala nenhuma
    for (const p of def.pedras ?? []) acendiveis.add(p.cova);
    if (def.pedrasConta) acendiveis.add(def.pedrasConta);
    // os ladrilhos de memória acendem a flag deles em código (overworld.ts)
    if (def.sequencia) acendiveis.add(def.sequencia.flag);
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
    const ctx: ContextoMapa = { contas: () => n, nadar: false, ligada: () => false };
    const m = new Mapa(MAPAS['portoIara']!, ctx);
    const passa = alcance(m, inicio.tx, inicio.ty).has(`${porta.tx},${porta.ty}`);
    assert.equal(passa, n >= CONTAS_NA_GUIA,
                 `com ${n} contas, entrar no terreiro devia ser ${n >= CONTAS_NA_GUIA}`);
    assert.equal(m.solido(guia.tx, guia.ty), n < CONTAS_NA_GUIA);
  }
});

test('a guia da Mata do Curupira é um terreiro à parte: cada contagem é a sua', () => {
  const porta = MAPAS['mataDoCurupira']!.saidas!.find((s) => s.para === 'terreiroCurupira')!;
  const inicio = MAPAS['mataDoCurupira']!.inicio;

  for (let n = 0; n <= CONTAS_NA_GUIA; n++) {
    // contas() só responde por 'planta'; qualquer outro terreiro fica em zero,
    // e é isso que prova que as duas guias não se misturam
    const ctx: ContextoMapa = {
      contas: (t) => (t === 'planta' ? n : 0), nadar: false, ligada: () => false,
    };
    const m = new Mapa(MAPAS['mataDoCurupira']!, ctx);
    const passa = alcance(m, inicio.tx, inicio.ty).has(`${porta.tx},${porta.ty}`);
    assert.equal(passa, n >= CONTAS_NA_GUIA,
                 `com ${n} contas de planta, entrar no terreiro devia ser ${n >= CONTAS_NA_GUIA}`);
  }

  // e com a guia de água toda aberta mas a de planta ainda em zero, continua fechada
  const cruzado: ContextoMapa = {
    contas: (t) => (t === 'agua' ? CONTAS_NA_GUIA : 0), nadar: false, ligada: () => false,
  };
  const m = new Mapa(MAPAS['mataDoCurupira']!, cruzado);
  assert.ok(!alcance(m, inicio.tx, inicio.ty).has(`${porta.tx},${porta.ty}`),
            'a guia de água aberta não devia abrir a de planta');
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

/* ---------------------------------------------- o salão que empurra raiz */

test('o quebra-cabeça do Terreiro de Raiz tem solução', () => {
  const def = MAPAS['terreiroCurupira']!;
  const m = mapa('terreiroCurupira');
  const tie = def.npcs.find((n) => n.id === 'tie')!;
  const daPorta = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);

  const vizinhos = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dx, dy]) => `${tie.tx + dx!},${tie.ty + dy!}`);
  assert.ok(vizinhos.some((v) => daPorta.has(v)),
            'o campo de raízes não tem caminho até a Tiê');
});

test('e ninguém fica preso no meio das raízes', () => {
  const def = MAPAS['terreiroCurupira']!;
  const m = mapa('terreiroCurupira');
  const entrada = `${def.inicio.tx},${def.inicio.ty}`;
  for (const lugar of alcanceDeslizando(m, def.inicio.tx, def.inicio.ty)) {
    const [x, y] = lugar.split(',').map(Number) as [number, number];
    assert.ok(alcanceDeslizando(m, x, y).has(entrada),
              `quem chega em (${lugar}) não consegue mais voltar para a porta`);
  }
});

test('o Terreiro de Raiz é mesmo um quebra-cabeça, não um corredor', () => {
  const def = MAPAS['terreiroCurupira']!;
  const m = mapa('terreiroCurupira');
  const raizes = def.chao.join('').split('').filter((c) => c === 'v').length;
  assert.ok(raizes > 35, `o campo tem só ${raizes} tiles de raiz viva`);

  const tie = def.npcs.find((n) => n.id === 'tie')!;
  const escorregando = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);
  const aPe = alcance(m, def.inicio.tx, def.inicio.ty);
  assert.ok(aPe.has(`${tie.tx - 1},${tie.ty}`),
            'sem escorregar o salão devia ser um corredor reto');
  assert.ok(escorregando.size < aPe.size,
            'a raiz devia tirar lugares de alcance, não deixar tudo igual');
});

test('o campo de raízes não se resolve segurando uma direção só', () => {
  /* se um pillar sozinho já não bastasse, esse é o teste que provaria: uma
     tecla segurada até bater em alguma coisa não pode encostar do lado da
     Tiê — senão o "quebra-cabeça" era só um corredor disfarçado */
  const def = MAPAS['terreiroCurupira']!;
  const m = mapa('terreiroCurupira');
  const tie = def.npcs.find((n) => n.id === 'tie')!;

  function segurar(dx: number, dy: number): [number, number] {
    let x = def.inicio.tx, y = def.inicio.ty;
    for (let i = 0; i < 30; i++) {
      let nx = x + dx, ny = y + dy;
      if (m.solido(nx, ny)) break;
      while (m.escorrega(nx, ny)) {
        const ax = nx + dx, ay = ny + dy;
        if (m.solido(ax, ay)) break;
        nx = ax; ny = ay;
      }
      if (nx === x && ny === y) break;
      x = nx; y = ny;
    }
    return [x, y];
  }

  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
    const [x, y] = segurar(dx, dy);
    const chegou = [[0, 1], [0, -1], [1, 0], [-1, 0]]
      .some(([ax, ay]) => x === tie.tx + ax! && y === tie.ty + ay!);
    assert.ok(!chegou, `segurando só uma direção (${dx},${dy}) não devia chegar do lado da Tiê`);
  }
});

/* ------------------------------------------- o Campo do Saci: correntes

   As duas piscinas de vento (a Ventania Funda, obrigatória no caminho, e o
   Terreiro do Rodamoinho, o salão do Pererê) foram achadas por busca larga
   do mesmo jeito que os dois salões acima: solução garantida, ninguém fica
   preso, e segurar uma direção só nunca resolve. Aqui a busca larga entra
   de novo, generalizada (não hard-coded a um dos dois lugares), exatamente
   o ponto do risco #1 da Serra: todo BFS de quebra-cabeça tem que partir da
   entrada de verdade — nunca de um ponto do meio. */

/* segurar uma direção só, do início até onde ela empacar — a mesma checagem
   já usada no campo de raízes do Curupira, agora reaproveitável para
   qualquer sala com correntes/escorregões */
function segurarUmaDirecao(
  m: Mapa, ix: number, iy: number, dx: number, dy: number, passos = 60,
): [number, number] {
  let x = ix, y = iy;
  for (let i = 0; i < passos; i++) {
    let nx = x + dx, ny = y + dy;
    if (m.solido(nx, ny)) break;
    while (m.escorrega(nx, ny)) {
      const ax = nx + dx, ay = ny + dy;
      if (m.solido(ax, ay)) break;
      nx = ax; ny = ay;
    }
    if (nx === x && ny === y) break;
    x = nx; y = ny;
  }
  return [x, y];
}

test('a Ventania Funda tem solução, partindo da entrada de verdade', () => {
  const def = MAPAS['ventaniaFunda']!;
  const m = mapa('ventaniaFunda');
  const saidaSul = (def.saidas ?? []).find((s) => s.para === 'aldeiaCatavento')!;

  const desliz = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);
  assert.ok(desliz.has(`${saidaSul.tx},${saidaSul.ty}`),
            'a ventania devia ter caminho escorregando até a saída sul');
});

test('e ninguém fica preso dentro da Ventania Funda', () => {
  const def = MAPAS['ventaniaFunda']!;
  const m = mapa('ventaniaFunda');
  const entrada = `${def.inicio.tx},${def.inicio.ty}`;
  for (const lugar of alcanceDeslizando(m, def.inicio.tx, def.inicio.ty)) {
    const [x, y] = lugar.split(',').map(Number) as [number, number];
    assert.ok(alcanceDeslizando(m, x, y).has(entrada),
              `quem chega em (${lugar}) na ventania não consegue mais voltar até a entrada`);
  }
});

test('a Ventania Funda não se resolve segurando uma direção só', () => {
  const def = MAPAS['ventaniaFunda']!;
  const m = mapa('ventaniaFunda');
  const saidaSul = (def.saidas ?? []).find((s) => s.para === 'aldeiaCatavento')!;
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
    const [x, y] = segurarUmaDirecao(m, def.inicio.tx, def.inicio.ty, dx, dy);
    assert.ok(!(x === saidaSul.tx && y === saidaSul.ty) && !(x === saidaSul.tx + 1 && y === saidaSul.ty),
              `segurando só uma direção (${dx},${dy}) não devia atravessar a ventania inteira`);
  }
});

test('conta_ventania é alcançável sem nenhum Dom — o trecho é obrigatório, não opcional', () => {
  /* risco #4 do plano: o Dom Rajada só pode abrir bônus, nunca o caminho
     principal. A travessia acende sozinha (a placa do fim), sem depender
     de flag nenhuma de Dom. */
  const def = MAPAS['ventaniaFunda']!;
  const semDomNenhum = new Mapa(def, FECHADO);
  const saidaSul = (def.saidas ?? []).find((s) => s.para === 'aldeiaCatavento')!;
  const desliz = alcanceDeslizando(semDomNenhum, def.inicio.tx, def.inicio.ty);
  assert.ok(desliz.has(`${saidaSul.tx},${saidaSul.ty}`),
            'sem Dom nenhum, a ventania ainda tem que ter solução');
});

test('o Terreiro do Rodamoinho tem solução, partindo da porta de verdade', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const perere = def.npcs.find((n) => n.id === 'perere')!;
  const daPorta = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);

  const vizinhos = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dx, dy]) => `${perere.tx + dx!},${perere.ty + dy!}`);
  assert.ok(vizinhos.some((v) => daPorta.has(v)),
            'o salão do Pererê não tem caminho até ele, partindo da entrada de verdade');
});

/* Diferente dos outros salões de corrente, o Rodamoinho é de mão única de
   propósito: quem erra uma forquilha não anda de volta até a porta (a
   corrente não deixa) — pisa numa saída disfarçada de chão, que devolve
   pro início do salão. As seis saídas abaixo são exatamente as seis
   forquilhas erradas das três correntes; se uma pedra se mover e abrir um
   jeito de voltar andando por engano, os testes abaixo pegam isso. */
test('as seis saídas disfarçadas do Rodamoinho devolvem pro início, e ficam na corrente', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const disfarcadas = (def.saidas ?? []).filter((s) => s.para === 'terreiroRodamoinho');
  assert.equal(disfarcadas.length, 6,
    'esperava seis saídas disfarçadas — uma por forquilha errada, em três correntes');
  for (const s of disfarcadas) {
    assert.equal(s.destino.tx, def.inicio.tx, `saída (${s.tx},${s.ty}): destino.tx devia ser o início`);
    assert.equal(s.destino.ty, def.inicio.ty, `saída (${s.tx},${s.ty}): destino.ty devia ser o início`);
    assert.ok(m.escorrega(s.tx, s.ty),
      `a saída disfarçada em (${s.tx},${s.ty}) devia ficar numa corrente de vento`);
  }
});

test('em cada uma das seis forquilhas, o lado errado pisa numa saída disfarçada', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const disfarcadas = new Set(
    (def.saidas ?? []).filter((s) => s.para === 'terreiroRodamoinho').map((s) => `${s.tx},${s.ty}`));

  // cada forquilha: onde ela trava (parada pela pedra central) e qual lado
  // é o CERTO — o outro lado tem que cair exatamente numa saída disfarçada
  const forquilhas: [number, number, 'esquerda' | 'direita'][] = [
    [7, 35, 'esquerda'],  // 1ª corrente (a mais perto da porta)
    [7, 28, 'direita'],   // 2ª corrente, forquilha de baixo
    [7, 24, 'esquerda'],  // 2ª corrente, forquilha de cima
    [7, 17, 'esquerda'],  // 3ª corrente, forquilha de baixo
    [7, 13, 'direita'],   // 3ª corrente, forquilha do meio
    [7, 9,  'esquerda'],  // 3ª corrente, forquilha de cima (a mais perto do Pererê)
  ];

  for (const [tx, ty, certo] of forquilhas) {
    const [dx] = certo === 'esquerda' ? [-1] : [1];
    const [px, py] = passo(m, tx, ty, dx, 0);
    assert.ok(!(px === tx && py === ty),
      `forquilha (${tx},${ty}): o lado certo (${certo}) devia mover o jogador`);

    const errado = -dx;
    const [ex, ey] = passo(m, tx, ty, errado, 0);
    assert.ok(disfarcadas.has(`${ex},${ey}`),
      `forquilha (${tx},${ty}): o lado errado parou em (${ex},${ey}), que não é saída disfarçada`);
  }
});

test('cada guarda do Rodamoinho tranca e destranca a corrente seguinte', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const guardas: [string, number, number][] = [
    ['venceu_guarda_correnteza', 7, 30],
    ['venceu_guarda_remoinho',   7, 19],
    ['venceu_guarda_tormenta',   7, 4],
  ];
  for (const [flag, tx, ty] of guardas) {
    const fechado = new Mapa(def, FECHADO);
    const aberto = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    assert.ok(fechado.solido(tx, ty),
      `a barreira em (${tx},${ty}) devia estar trancada antes de ${flag}`);
    assert.ok(!aberto.solido(tx, ty),
      `a barreira em (${tx},${ty}) devia abrir depois de ${flag}`);
  }
});

test('o Terreiro do Rodamoinho é mesmo um quebra-cabeça, não um corredor', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const ventos = def.chao.join('').split('').filter((c) => c === 'V').length;
  assert.ok(ventos > 40, `o salão tem só ${ventos} tiles de corrente`);

  const perere = def.npcs.find((n) => n.id === 'perere')!;
  const escorregando = alcanceDeslizando(m, def.inicio.tx, def.inicio.ty);
  const aPe = alcance(m, def.inicio.tx, def.inicio.ty);
  const vizinhos = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dx, dy]) => `${perere.tx + dx!},${perere.ty + dy!}`);
  assert.ok(vizinhos.some((v) => aPe.has(v)),
            'sem escorregar o salão devia ser um corredor reto');
  assert.ok(escorregando.size < aPe.size,
            'a corrente devia tirar lugares de alcance, não deixar tudo igual');
});

test('o Terreiro do Rodamoinho não se resolve segurando uma direção só', () => {
  const def = MAPAS['terreiroRodamoinho']!;
  const m = mapa('terreiroRodamoinho');
  const perere = def.npcs.find((n) => n.id === 'perere')!;
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
    const [x, y] = segurarUmaDirecao(m, def.inicio.tx, def.inicio.ty, dx, dy);
    const chegou = [[0, 1], [0, -1], [1, 0], [-1, 0]]
      .some(([ax, ay]) => x === perere.tx + ax! && y === perere.ty + ay!);
    assert.ok(!chegou, `segurando só uma direção (${dx},${dy}) não devia chegar do lado do Pererê`);
  }
});

test('o monte de folhas do Topo do Redemoinho só some com o Dom Rajada', () => {
  const def = MAPAS['topoDoRedemoinho']!;
  const semRajada = new Mapa(def, FECHADO);
  const comRajada = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === 'dom_rajada' });
  const esconderijo = def.objetos.find(
    (o) => o.tipo === 'achado' && o.placa === 'ESCONDERIJO' && o.se === undefined)!;
  const alvo = `${esconderijo.tx},${esconderijo.ty}`;

  assert.ok(!alcance(semRajada, def.inicio.tx, def.inicio.ty).has(alvo),
            'sem o Dom Rajada o esconderijo devia continuar fechado');
  assert.ok(alcance(comRajada, def.inicio.tx, def.inicio.ty).has(alvo),
            'com o Dom Rajada o esconderijo devia abrir');
});

test('os três capins dourados existem, espalhados por três mapas diferentes', () => {
  const mapasComCapim = entradas
    .filter(([, def]) => def.objetos.some(
      (o) => o.tipo === 'achado' && o.falas?.some((f) => f.da?.item === 'capim_dourado')))
    .map(([id]) => id);
  assert.equal(mapasComCapim.length, 3,
    `esperava capim dourado em 3 mapas, achou em: ${mapasComCapim.join(', ')}`);
});

/* --------------------------------------------- o Dom e as cinco contas */

test('a segunda tranca do Zeca, no igarapé, fecha e abre de verdade', () => {
  const fechado = new Mapa(MAPAS['igarapeCurupira']!, FECHADO);
  const aberto = new Mapa(MAPAS['igarapeCurupira']!, ABERTO);
  const saida = MAPAS['igarapeCurupira']!.saidas!.find((s) => s.para === 'mataDoCurupira')!;
  const inicio = MAPAS['igarapeCurupira']!.inicio;

  assert.ok(!alcance(fechado, inicio.tx, inicio.ty).has(`${saida.tx},${saida.ty}`),
            'sem vencer o Zeca de novo, o igarapé para a Mata devia estar trancado');
  assert.ok(alcance(aberto, inicio.tx, inicio.ty).has(`${saida.tx},${saida.ty}`),
            'vencido o Zeca de novo, o igarapé devia abrir');
});

test('a touceira de cipó só cede para quem tem o Dom "Cortar Cipó"', () => {
  /* é o teste do Dom desta região: sem "Cortar Cipó", o bolso além da
     touceira seria cenário inalcançável — um prêmio que ninguém pega */
  const def = MAPAS['mataDoCurupira']!;
  const cipo = def.objetos.find((o) => o.tipo === 'barreira')!;
  const semDom: ContextoMapa = { ...ABERTO, ligada: (c) => c !== 'dom_cortarCipo' };
  const comDom: ContextoMapa = ABERTO;
  const m1 = new Mapa(def, semDom);
  const m2 = new Mapa(def, comDom);
  const inicio = def.inicio;
  const bolso = `${cipo.tx + 1},${cipo.ty + 1}`;   // o outro tile do vão, além da placa

  assert.ok(m1.solido(cipo.tx, cipo.ty), 'sem o Dom, a touceira devia barrar a passagem');
  assert.ok(!m2.solido(cipo.tx, cipo.ty), 'com o Dom, a touceira devia ceder');
  assert.ok(!alcance(m1, inicio.tx, inicio.ty).has(bolso),
            'sem o Dom, o bolso além da touceira devia ser inalcançável');
  assert.ok(alcance(m2, inicio.tx, inicio.ty).has(bolso),
            'com o Dom, o bolso além da touceira devia abrir');
});

test('a Medalha Raiz tem quem a entregue, com o Dom junto', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  const premio = falas.find((f) => f.medalha === 'raiz');
  assert.ok(premio, 'ninguém entrega a Medalha Raiz');
  assert.equal(premio!.dom, 'cortarCipo', 'a Raiz tem que vir com o Dom de cortar cipó');
});

test('a ilhota do açude só existe para quem sabe nadar', () => {
  /* é o teste do Dom: se a Medalha Maré não abrisse a água, o pote seria
     cenário inalcançável — e um prêmio que ninguém pega não é prêmio */
  const def = MAPAS['rotaFoz']!;
  const pote = def.objetos.find((o) => o.tipo === 'achado' && o.placa !== 'MAPA')!;
  const aPe = new Mapa(def, { ...ABERTO, nadar: false });
  const nadando = new Mapa(def, ABERTO);
  const alvo = `${pote.tx},${pote.ty}`;

  assert.ok(!alcance(aPe, def.inicio.tx, def.inicio.ty).has(alvo),
            'a pé a ilhota devia ser inalcançável');
  assert.ok(alcance(nadando, def.inicio.tx, def.inicio.ty).has(alvo),
            'com o Dom "Nadar" a ilhota devia abrir');
});

test('as cinco contas de cada guia podem mesmo ser acesas jogando', () => {
  /* Cada guia é o portão de uma fase. Se uma conta não tiver ninguém que a
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
    // a conta de uma sala de pedras acende em código (world/pedras.ts +
    // overworld.ts), quando a última cova é tapada — não em fala nenhuma
    if (def.pedrasConta) acesas.add(def.pedrasConta);
    if (def.sequencia) acesas.add(def.sequencia.flag);
  }
  for (const lista of Object.values(TERREIROS)) {
    for (const c of lista) {
      assert.ok(acesas.has(c.flag), `ninguém acende a conta "${c.servico}" (${c.flag})`);
    }
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

/* ----------------------------------------- Caverna do Boitatá: as pedras */

test('o campo de escória da Caverna do Boitatá tem solução', () => {
  const def = MAPAS['cavernaBoitata']!;
  // FECHADO, não a `m` compartilhada (ABERTO): sob ABERTO toda cova já
  // conta como tapada (o `entulho` fica ativo no lugar dela), e a busca
  // não estaria testando um sólido de verdade nenhum
  const m = new Mapa(def, FECHADO);
  const pedras = (def.pedras ?? []).map((p) => ({ tx: p.tx, ty: p.ty }));
  const covas = def.objetos
    .filter((o) => o.tipo === 'cova')
    .map((o) => ({ tx: o.tx, ty: o.ty, flag: o.seNao as string }));
  assert.equal(covas.length, 3, 'a câmara devia ter as três covas');
  // a partir da boca da própria câmara, não da entrada do mapa inteiro, e
  // com o vaguear do jogador preso à própria câmara: o resto da caverna é
  // uma sala grande e aberta que só infla o espaço de estados sem ter nada
  // a ver com o quebra-cabeça das pedras. O objetivo é só chegar perto do
  // portão (16,24) — se ele de fato ABRE com as três tapadas é o próximo
  // teste, que reconstrói o mapa com as flags ligadas (a trava, sendo uma
  // `barreira`, não muda de sólida sozinha só porque a busca preencheu a
  // cova; ela só passa a valer no mapa assado de novo, fora do BFS puro) */
  assert.ok(temSolucao(m, { tx: 16, ty: 18 }, pedras, covas, { tx: 16, ty: 24 },
                        { x0: 1, y0: 17, x1: 30, y1: 25 }),
            'as três pedras deviam poder chegar às três covas, com saída livre depois');
});

test('as três covas da Caverna do Boitatá abrem a passagem para a Cumeeira', () => {
  const def = MAPAS['cavernaBoitata']!;
  const fechado = new Mapa(def, { contas: () => 0, nadar: false, ligada: () => false });
  const aberto = new Mapa(def, {
    contas: () => 0, nadar: false,
    ligada: (c) => c === 'cova_breu_a' || c === 'cova_breu_b' || c === 'cova_breu_c',
  });
  assert.ok(!alcance(fechado, def.inicio.tx, def.inicio.ty).has('16,37'),
            'sem as três covas tapadas a Cumeeira devia continuar trancada');
  assert.ok(alcance(aberto, def.inicio.tx, def.inicio.ty).has('16,37'),
            'com as três covas tapadas a passagem devia abrir');
});

/* -------------------------------------------- o Terreiro de Brasa em 4 salas */

test('o caminho até o Brás passa por quatro salas e três guardas', () => {
  const salas = ['terreiroBrasaPatio', 'terreiroBrasaEscoria',
                 'terreiroBrasaBreu', 'terreiroBrasaSalao'];
  const guardas = ['venceu_zelador_brasa', 'venceu_sopradora', 'venceu_guarda_breu'];

  for (const id of salas) assert.ok(MAPAS[id], `falta a sala ${id}`);

  // cada emenda entre uma sala e a seguinte tem uma tranca própria, e é ela
  // que faz o caminho ser longo de verdade em vez de quatro portas seguidas
  for (let i = 0; i < 3; i++) {
    const def = MAPAS[salas[i]!]!;
    const paraProxima = (def.saidas ?? []).find((s) => s.para === salas[i + 1]);
    assert.ok(paraProxima, `${salas[i]}: não leva a ${salas[i + 1]}`);
    const tranca = def.objetos.find(
      (o) => o.tipo === 'barreira' && o.seNao === guardas[i]
             && o.tx === paraProxima!.tx && o.ty === paraProxima!.ty);
    assert.ok(tranca, `${salas[i]}: a saída para ${salas[i + 1]} não é trancada por ${guardas[i]}`);
  }

  // e a porta do terreiro, na vila, entra pela PRIMEIRA sala — não pela última
  const vila = MAPAS['vilaFornalha']!;
  assert.ok((vila.saidas ?? []).some((s) => s.para === 'terreiroBrasaPatio'),
            'a porta do terreiro na vila devia levar ao pátio');
});

test('cada tranca do Terreiro de Brasa fecha e abre de verdade', () => {
  /* a sala, a flag que destranca, e para ONDE a porta trancada leva — a
     porta de volta, que fica aberta sempre, não entra nesta conta */
  const salas: [string, string, string][] = [
    ['terreiroBrasaPatio', 'venceu_zelador_brasa', 'terreiroBrasaEscoria'],
    ['terreiroBrasaEscoria', 'venceu_sopradora', 'terreiroBrasaBreu'],
    ['terreiroBrasaBreu', 'venceu_guarda_breu', 'terreiroBrasaSalao'],
  ];
  for (const [id, flag, proxima] of salas) {
    const def = MAPAS[id]!;
    const fechado = new Mapa(def, FECHADO);
    const aberto = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    const saida = (def.saidas ?? []).find((s) => s.para === proxima)!;
    assert.ok(fechado.solido(saida.tx, saida.ty),
              `${id}: a saída devia estar trancada antes de vencer o guarda`);
    assert.ok(!aberto.solido(saida.tx, saida.ty),
              `${id}: a saída devia abrir depois de vencer o guarda`);
  }
});

test('cada tranca do Campo Aberto fecha e abre de verdade, uma de cada vez', () => {
  /* pegou um bug de verdade: a terceira tranca estava condicionada a
     `venceu_chefe_catadores`, e o chefe mora do OUTRO lado dela — um laço
     sem saída que o usuário bateu de frente. Este teste confere elo por
     elo, não só que "a saída final abre com tudo vencido" (isso o teste
     geral sob ABERTO já mascarava, porque ali toda condição vale). */
  const def = MAPAS['campoAberto']!;
  const elos: [string, number, number][] = [
    ['venceu_catador1', 8, 9],
    ['venceu_catador2', 22, 17],
    ['venceu_catador3', 8, 25],
    ['venceu_chefe_catadores', 14, 33],
  ];
  const fechado = new Mapa(def, FECHADO);
  for (const [, tx, ty] of elos) {
    assert.ok(fechado.solido(tx, ty), `campoAberto: a tranca em (${tx},${ty}) devia começar fechada`);
  }
  for (const [flag, tx, ty] of elos) {
    const aberto = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    assert.ok(!aberto.solido(tx, ty),
              `campoAberto: a tranca em (${tx},${ty}) devia abrir com "${flag}" ligada`);
    // e nenhuma OUTRA continua trancada por engano com essa flag sozinha
    for (const [, ox, oy] of elos) {
      if (ox === tx && oy === ty) continue;
      assert.ok(aberto.solido(ox, oy),
                `campoAberto: "${flag}" sozinha não devia abrir a tranca em (${ox},${oy})`);
    }
  }
});

test('cada tranca da Trilha da Brasa fecha e abre de verdade, uma de cada vez', () => {
  const def = MAPAS['trilhaDaBrasa']!;
  const elos: [string, number, number][] = [
    ['venceu_tropeiro1', 6, 10],
    ['venceu_tropeiro2', 22, 17],
    ['venceu_tropeiro3', 6, 24],
    ['venceu_chefe_tropa', 4, 31],
  ];
  const fechado = new Mapa(def, FECHADO);
  for (const [, tx, ty] of elos) {
    assert.ok(fechado.solido(tx, ty), `trilhaDaBrasa: a tranca em (${tx},${ty}) devia começar fechada`);
  }
  for (const [flag, tx, ty] of elos) {
    const aberto = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    assert.ok(!aberto.solido(tx, ty),
              `trilhaDaBrasa: a tranca em (${tx},${ty}) devia abrir com "${flag}" ligada`);
    for (const [, ox, oy] of elos) {
      if (ox === tx && oy === ty) continue;
      assert.ok(aberto.solido(ox, oy),
                `trilhaDaBrasa: "${flag}" sozinha não devia abrir a tranca em (${ox},${oy})`);
    }
  }
});

test('os campos de pedra do Terreiro de Brasa têm solução a partir da porta', () => {
  /* Este teste já existiu errado, e deixou passar duas salas impossíveis:
     partia de (8,1) — a faixa NORTE, do outro lado do quebra-cabeça — e
     pedia para chegar em (5,7), ao sul. Ou seja, resolvia a sala de trás
     para a frente, de um tile onde o jogador só consegue pisar DEPOIS de
     resolvê-la. Com a pedra acima da cova, quem subia do salão batia na
     cova (que é sólida) antes de alcançar a pedra, e a partida travava sem
     saída.

     Por isso agora o começo é `def.inicio` — a porta por onde o jogador
     entra de verdade — e o objetivo é (8,1), a faixa norte onde ficam o
     guarda e a porta seguinte. É o percurso real, no sentido real. */
  for (const id of ['terreiroBrasaEscoria', 'terreiroBrasaBreu']) {
    const def = MAPAS[id]!;
    const m = new Mapa(def, FECHADO);
    const pedras = (def.pedras ?? []).map((p) => ({ tx: p.tx, ty: p.ty }));
    const covas = def.objetos
      .filter((o) => o.tipo === 'cova')
      .map((o) => ({ tx: o.tx, ty: o.ty, flag: o.seNao as string }));
    assert.equal(pedras.length, 2, `${id}: devia ter duas pedras`);
    assert.equal(covas.length, 2, `${id}: devia ter duas covas`);

    /* subindo cada corredor a partir do salão, a PEDRA tem que vir antes da
       cova — senão a cova (sólida) barra o caminho e a pedra fica do lado
       de lá, inalcançável. É a checagem que falta ao BFS dizer em voz alta */
    for (const p of def.pedras ?? []) {
      const cova = covas.find((c) => c.flag === p.cova)!;
      assert.equal(cova.tx, p.tx, `${id}: pedra e cova de ${p.cova} em corredores diferentes`);
      assert.ok(cova.ty < p.ty,
                `${id}: a cova de ${p.cova} está ABAIXO da pedra — quem sobe do salão ` +
                `bate nela antes de alcançar a pedra e trava a sala`);
    }

    // o percurso de verdade: da porta de entrada até a faixa norte
    assert.ok(temSolucao(m, { tx: def.inicio.tx, ty: def.inicio.ty }, pedras, covas,
                         { tx: 8, ty: 1 }),
              `${id}: não dá para chegar ao guarda entrando pela porta`);
  }
});

test('nas salas de pedra, os DOIS corredores chegam à porta', () => {
  /* Cada sala tem dois corredores de largura 1, e resolver UM já devia
     bastar. Mas NPC é sólido: a Sopradora, parada na antessala de uma linha
     só, virava parede para quem subia por um dos lados — quem resolvesse o
     corredor "errado" chegava lá em cima e não passava. O BFS do mapa todo
     não pega isso, porque no cenário "tudo aberto" ele sempre acha o outro
     corredor. Então aqui se testa cada boca de corredor por vez. */
  const VIZ = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
  for (const id of ['terreiroBrasaEscoria', 'terreiroBrasaBreu']) {
    const def = MAPAS[id]!;
    const m = mapa(id);
    const porta = (def.saidas ?? []).find((x) => x.ty === 0)!;
    const fixos = new Set(def.npcs.filter((n) => n.se === undefined && n.seNao === undefined)
                                  .map((n) => `${n.tx},${n.ty}`));
    const livre = (x: number, y: number) => !m.solido(x, y) && !fixos.has(`${x},${y}`);

    for (const p of def.pedras ?? []) {
      /* de onde a pedra encaixada deixa o jogador sair: logo acima da cova
         daquele corredor, já na faixa de cima */
      const cova = def.objetos.find((o) => o.tipo === 'cova' && o.seNao === p.cova)!;
      const saidaDoCorredor = { tx: cova.tx, ty: cova.ty - 1 };
      assert.ok(livre(saidaDoCorredor.tx, saidaDoCorredor.ty),
                `${id}: acima da cova de ${p.cova} não é chão livre`);

      const vistos = new Set([`${saidaDoCorredor.tx},${saidaDoCorredor.ty}`]);
      const fila = [[saidaDoCorredor.tx, saidaDoCorredor.ty]];
      while (fila.length) {
        const [x, y] = fila.shift() as [number, number];
        for (const [dx, dy] of VIZ) {
          const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
          if (vistos.has(k) || !livre(nx, ny)) continue;
          vistos.add(k); fila.push([nx, ny]);
        }
      }
      assert.ok(vistos.has(`${porta.tx},${porta.ty}`),
                `${id}: quem resolve o corredor de ${p.cova} sobe e não alcança a porta ` +
                `(${porta.tx},${porta.ty}) — tem NPC fixo no caminho`);
    }
  }
});

test('a Medalha Brasa tem quem a entregue, com o Dom junto', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  const premio = falas.find((f) => f.medalha === 'brasa');
  assert.ok(premio, 'ninguém entrega a Medalha Brasa');
  assert.equal(premio!.dom, 'tocha', 'a Brasa tem que vir com o Dom de Tocha');
});

test('o trunfo do Brás cobre os três iniciais, e nenhum some em save antigo', () => {
  const bras = MAPAS['terreiroBrasaSalao']!.npcs.find((n) => n.id === 'bras')!;
  const trunfo = bras.treinador?.trunfo;
  assert.ok(trunfo, 'o Brás devia ter trunfo');
  for (const inicial of ['boitatinha', 'iarinha', 'curupinho']) {
    assert.ok(trunfo![inicial], `falta trunfo contra ${inicial}`);
    assert.ok(ESPECIES[trunfo![inicial]!.especie],
              `trunfo contra ${inicial} usa espécie desconhecida`);
  }
  // sem nenhuma flag `inicial_*` (save de antes dela existir) o jogo cai no
  // primeiro par do objeto — por isso ele nunca pode estar vazio
  assert.ok(Object.values(trunfo!).length > 0);
});

/* --------------------------------------- os dois serviços opcionais da Serra */

test('os dois serviços opcionais têm quem os acenda', () => {
  /* o teste das contas só olha TERREIROS; estes dois ficam de fora dela de
     propósito (não travam guia nenhuma), então precisam da própria rede */
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
    }
  }
  for (const s of SERVICOS_OPCIONAIS) {
    assert.ok(acesas.has(s.flag), `ninguém acende o serviço "${s.servico}" (${s.flag})`);
  }
});

test('os três sinos existem, espalhados por três mapas diferentes', () => {
  const mapasComSino = entradas
    .filter(([, def]) => def.objetos.some(
      (o) => o.tipo === 'achado' && o.falas?.some((f) => f.da?.item === 'sino')))
    .map(([id]) => id);
  assert.equal(mapasComSino.length, 3,
               `os sinos deviam estar em três mapas, estão em ${mapasComSino.join(', ')}`);
});

test('o ramo fundo da caverna só cede para quem tem o Dom Tocha', () => {
  const def = MAPAS['cavernaBoitata']!;
  const semTocha = new Mapa(def, FECHADO);
  const comTocha = new Mapa(def, {
    contas: () => 0, nadar: false, ligada: (c) => c === 'dom_tocha',
  });
  const mae = def.npcs.find((n) => n.id === 'mae_do_ouro')!;
  const deFrente = `${mae.tx + 1},${mae.ty}`;   // de onde se fala com ela

  assert.ok(!alcance(semTocha, def.inicio.tx, def.inicio.ty).has(deFrente),
            'sem o Dom Tocha o bolso da Mãe-do-Ouro devia continuar fechado');
  assert.ok(alcance(comTocha, def.inicio.tx, def.inicio.ty).has(deFrente),
            'com o Dom Tocha o bolso devia abrir');
});

test('a Mãe-do-Ouro só se entrega depois dos sinos E da medalha', () => {
  const mae = MAPAS['cavernaBoitata']!.npcs.find((n) => n.id === 'mae_do_ouro')!;
  const entrega = mae.falas.find((f) => f.encantado);
  assert.ok(entrega, 'a Mãe-do-Ouro devia entregar um Encantado');
  assert.equal(entrega!.encantado!.especie, 'maeDoOuro');
  const exige = [entrega!.se].flat();
  assert.ok(exige.includes('servico_sinos'), 'devia exigir os três sinos');
  assert.ok(exige.includes('medalha:brasa'), 'devia exigir a Medalha Brasa');
});

/* ------------------------------------------- Aldeia Tupã: para os lados */

const MAPAS_REGIAO5_FORA = ['campinaDosRaios', 'aldeiaTupa', 'charcoRelampejante', 'morroDoTrovao'];

test('a região 5 cresce para os lados: todo mapa externo dela é bem mais largo que os antigos', () => {
  /* as quatro regiões anteriores nunca passaram de 34 colunas ao ar livre */
  const antigos = ['vilaAurora', 'rotaFoz', 'portoIara', 'igarapeCurupira', 'mataDoCurupira',
                   'trilhaDaBrasa', 'vilaFornalha', 'cavernaBoitata', 'cumeeiraBoitata',
                   'campoAberto', 'ventaniaFunda', 'aldeiaCatavento', 'topoDoRedemoinho'];
  const maisLargoAntigo = Math.max(...antigos.map((id) => MAPAS[id]!.chao[0]!.length));
  assert.equal(maisLargoAntigo, 34);
  let tiles = 0;
  for (const id of MAPAS_REGIAO5_FORA) {
    const def = MAPAS[id]!;
    const larg = def.chao[0]!.length;
    assert.ok(larg >= 56, `${id}: só ${larg} colunas`);
    assert.ok(def.chao.length >= 34, `${id}: só ${def.chao.length} linhas — devia crescer para baixo também`);
    tiles += larg * def.chao.length;
  }
  // a Serra Boitatá, a maior até então, tinha 4.480 tiles ao ar livre
  assert.ok(tiles >= 2 * 4480, `a região 5 tem ${tiles} tiles ao ar livre`);
});

test('a Aldeia Tupã tem estrada para oeste, leste e norte', () => {
  const def = MAPAS['aldeiaTupa']!;
  const larg = def.chao[0]!.length;
  const para = (s: { tx: number; ty: number }): string =>
    s.tx === 0 ? 'oeste' : s.tx === larg - 1 ? 'leste' : s.ty === 0 ? 'norte' : 'porta';
  const lados = new Map<string, string>();
  for (const s of def.saidas ?? []) lados.set(para(s), s.para);
  assert.equal(lados.get('oeste'), 'campinaDosRaios');
  assert.equal(lados.get('leste'), 'charcoRelampejante');
  assert.equal(lados.get('norte'), 'morroDoTrovao');
});

test('o vão leste do Topo do Redemoinho só abre com a Medalha Rodamoinho', () => {
  const def = MAPAS['topoDoRedemoinho']!;
  const saidas = def.saidas!.filter((s) => s.para === 'campinaDosRaios');
  assert.equal(saidas.length, 2);
  const sem = new Mapa(def, FECHADO);
  const com = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => c === 'medalha:rodamoinho' });
  const pesSem = alcance(sem, def.inicio.tx, def.inicio.ty);
  const pesCom = alcance(com, def.inicio.tx, def.inicio.ty);
  for (const s of saidas) {
    assert.ok(!pesSem.has(`${s.tx},${s.ty}`), 'sem a medalha o vão leste devia estar trancado');
    assert.ok(pesCom.has(`${s.tx},${s.ty}`), 'com a medalha o vão leste devia abrir');
  }
});

test('cada tranca da Campina dos Raios abre com o SEU tambor, e cada tambor fica do lado de cá', () => {
  const def = MAPAS['campinaDosRaios']!;
  const ordem = ['tambor1', 'tambor2', 'tambor3', 'chefe_tambores'];
  const saida = def.saidas!.find((s) => s.para === 'aldeiaTupa')!;
  for (let i = 0; i < ordem.length; i++) {
    const vencidos = new Set(ordem.slice(0, i).map((id) => `venceu_${id}`));
    const m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => vencidos.has(c) });
    const pes = alcance(m, def.inicio.tx, def.inicio.ty);
    const npc = def.npcs.find((n) => n.id === ordem[i])!;
    const deFrente = [[0, -1], [0, 1], [-1, 0], [1, 0]]
      .some(([dx, dy]) => pes.has(`${npc.tx + dx!},${npc.ty + dy!}`));
    assert.ok(deFrente, `${npc.id} devia ser alcançável depois de vencer os anteriores`);
    assert.ok(!pes.has(`${saida.tx},${saida.ty}`),
              `com só ${i} tambores vencidos a saída para a aldeia não devia abrir`);
  }
  const todos = new Set(ordem.map((id) => `venceu_${id}`));
  const m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => todos.has(c) });
  assert.ok(alcance(m, def.inicio.tx, def.inicio.ty).has(`${saida.tx},${saida.ty}`));
});

/* As chaves de para-raio. Cada chave é um par de objetos `paraRaio` com a
   mesma posição; tocar nela (de frente, num vizinho ortogonal) troca a flag.
   A busca é sobre (posição, chaves ligadas): andar custa 0, tocar custa 1,
   e a distância até o alvo é o menor número de toques que resolve a sala.
   Todo movimento aqui é reversível — andar volta pelo mesmo tile, tocar de
   novo desfaz o toque —, então TODO estado alcançável consegue voltar ao
   início e dali seguir para o alvo: ninguém fica preso, desde que nenhuma
   cerca feche em cima de quem está tocando a chave (conferido à parte). */
/* Um passo a pé e, se ele cair num trilho de vagonete, a viagem inteira:
   o trilho leva na direção dele enquanto houver chão à frente (a mesma
   regra de `aoPisarNoTile` em overworld.ts). Sem trilho, é só o passo. */
const DIR_DELTA = { cima: [0, -1], baixo: [0, 1], esq: [-1, 0], dir: [1, 0] } as const;
function passoComTrilho(m: Mapa, x: number, y: number, dx: number, dy: number): [number, number] | null {
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

function resolverChaves(
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

/* ninguém toca uma chave em pé num tile onde uma cerca pode aparecer */
function nenhumaCercaAoLadoDasChaves(def: DefMapa): void {
  const cercas = new Set(def.objetos.filter((o) => o.tipo === 'cercaRaio').map((o) => `${o.tx},${o.ty}`));
  for (const p of def.objetos.filter((o) => o.tipo === 'paraRaio')) {
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
      assert.ok(!cercas.has(`${p.tx + dx},${p.ty + dy}`),
                `${def.id}: a chave em (${p.tx},${p.ty}) tem uma cerca bem do lado`);
    }
  }
}

const CHAVES_CHARCO = ['chave_charco_a', 'chave_charco_b', 'chave_charco_c'];

test('o casarão do Charco tem solução, e pede seis toques de chave', () => {
  const def = MAPAS['charcoRelampejante']!;
  const mestre = def.objetos.find((o) => o.tipo === 'paraRaio' && o.placa === 'PARA-RAIO MESTRE')!;
  const toques = resolverChaves(def, CHAVES_CHARCO, new Set(), def.inicio,
                                { tx: mestre.tx - 1, ty: mestre.ty });
  assert.equal(toques, 6, `o para-raio mestre devia pedir 6 toques, pediu ${toques}`);
  nenhumaCercaAoLadoDasChaves(def);
});

test('conta_para_raios é alcançável sem nenhum Dom novo — o trecho é obrigatório', () => {
  const def = MAPAS['charcoRelampejante']!;
  const mestre = def.objetos.find((o) => o.tipo === 'paraRaio' && o.placa === 'PARA-RAIO MESTRE'
                                        && o.falas?.some((f) => f.liga === 'conta_para_raios'));
  assert.ok(mestre, 'o para-raio mestre devia acender conta_para_raios');
  // sem dom_faisca e sem medalha nenhuma: a busca acima já usa só as chaves
  const toques = resolverChaves(def, CHAVES_CHARCO, new Set(), def.inicio,
                                { tx: mestre!.tx, ty: mestre!.ty - 1 });
  assert.ok(toques !== null);
});

test('com a conta acesa, todas as cercas do Charco se calam, e os fundos abrem', () => {
  const def = MAPAS['charcoRelampejante']!;
  const m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => c === 'conta_para_raios' });
  for (const o of def.objetos.filter((x) => x.tipo === 'cercaRaio')) {
    assert.ok(!m.solido(o.tx, o.ty), `a cerca em (${o.tx},${o.ty}) devia sumir com a conta`);
  }
  const arco = def.npcs.find((n) => n.id === 'arco_da_velha')!;
  const pes = alcance(m, def.inicio.tx, def.inicio.ty);
  assert.ok(pes.has(`${arco.tx - 1},${arco.ty}`), 'o Arco-da-Velha devia ser alcançável depois da conta');
  const semConta = new Mapa(def, FECHADO);
  for (let mask = 0; mask < 8; mask++) {
    const lig = new Set(CHAVES_CHARCO.filter((_, i) => mask & (1 << i)));
    const mm = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => lig.has(c) });
    assert.ok(!alcance(mm, def.inicio.tx, def.inicio.ty).has(`${arco.tx - 1},${arco.ty}`),
              'antes da conta, chave nenhuma devia abrir os fundos do casarão');
  }
  assert.ok(semConta.solido(58, 20));
});

test('o Terreiro do Trovão tem solução: três guardas, duas chaves, quatro toques', () => {
  const def = MAPAS['terreiroTrovao']!;
  const guardas = new Set(['venceu_guarda_faisca', 'venceu_guarda_relampago', 'venceu_guarda_trovoada']);
  const guaraci = def.npcs.find((n) => n.id === 'guaraci')!;
  const toques = resolverChaves(def, ['chave_tupa_1', 'chave_tupa_2'], guardas, def.inicio,
                                { tx: guaraci.tx + 1, ty: guaraci.ty });
  assert.equal(toques, 4, `o Guaraci devia pedir 4 toques de chave, pediu ${toques}`);
  nenhumaCercaAoLadoDasChaves(def);
  // e sem as guardas, chave nenhuma resolve
  const semGuardas = resolverChaves(def, ['chave_tupa_1', 'chave_tupa_2'], new Set(), def.inicio,
                                    { tx: guaraci.tx + 1, ty: guaraci.ty });
  assert.equal(semGuardas, null, 'sem vencer as guardas não devia dar para chegar ao Guaraci');
});

test('cada guarda do Trovão tranca o trecho seguinte, na ordem', () => {
  const def = MAPAS['terreiroTrovao']!;
  const elos: [string, number, number][] = [
    ['venceu_guarda_faisca', 4, 14],
    ['venceu_guarda_relampago', 23, 4],
    ['venceu_guarda_trovoada', 14, 2],
  ];
  for (const [flag, tx, ty] of elos) {
    assert.ok(new Mapa(def, FECHADO).solido(tx, ty), `a tranca em (${tx},${ty}) devia começar fechada`);
    const m = new Mapa(def, { contas: () => 0, nadar: false, ligada: (c) => c === flag });
    assert.ok(!m.solido(tx, ty), `a tranca em (${tx},${ty}) devia abrir com ${flag}`);
  }
});

test('a Medalha Trovão tem quem a entregue, com o Dom Faísca junto', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  const premio = falas.find((f) => f.medalha === 'trovao');
  assert.ok(premio, 'ninguém entrega a Medalha Trovão');
  assert.equal(premio!.dom, 'faisca');
});

test('as pedras rachadas só cedem ao Dom Faísca, e só travam a estrada das Minas', () => {
  let pedras = 0;
  for (const id of MAPAS_REGIAO5_FORA) {
    const def = MAPAS[id]!;
    const rachadas = def.objetos.filter((o) => o.tipo === 'pedraRachada');
    if (rachadas.length === 0) continue;
    pedras += rachadas.length;
    const esconderijo = def.objetos.find(
      (o) => o.tipo === 'achado' && o.placa === 'ESCONDERIJO' && o.seNao !== undefined)!;
    const alvo = `${esconderijo.tx},${esconderijo.ty}`;
    const semDom = new Mapa(def, { ...ABERTO, ligada: (c) => c !== 'dom_faisca' });
    const comDom = new Mapa(def, ABERTO);
    const pesSem = alcance(semDom, def.inicio.tx, def.inicio.ty);
    assert.ok(!pesSem.has(alvo), `${id}: sem o Dom Faísca o esconderijo devia estar fechado`);
    assert.ok(alcance(comDom, def.inicio.tx, def.inicio.ty).has(alvo),
              `${id}: com o Dom Faísca o esconderijo devia abrir`);
    // o resto do mapa não depende do Dom: toda saída continua alcançável sem
    // ele — menos a estrada para as Minas, que é justamente o que o Dom abre
    const pesCom = alcance(comDom, def.inicio.tx, def.inicio.ty);
    for (const s of def.saidas ?? []) {
      const onde = `${s.tx},${s.ty}`;
      if (s.para === 'bocaDaMina') {
        assert.ok(!pesSem.has(onde), `${id}: sem o Dom Faísca a estrada das Minas devia estar fechada`);
        assert.ok(pesCom.has(onde), `${id}: com o Dom Faísca a estrada das Minas devia abrir`);
        continue;
      }
      assert.ok(pesSem.has(onde), `${id}: a pedra rachada trancou a saída (${onde})`);
    }
  }
  // três esconderijos + as duas da estrada das Minas
  assert.equal(pedras, 5);
});

test('as cinco pedras-de-raio estão espalhadas pelos quatro mapas largos', () => {
  const onde: string[] = [];
  for (const [id, def] of entradas) {
    for (const o of def.objetos) {
      if (o.falas?.some((f) => f.da?.item === 'pedra_raio')) onde.push(id);
    }
  }
  assert.equal(onde.length, 5, `esperava 5 pedras-de-raio, achou ${onde.length}`);
  assert.deepEqual([...new Set(onde)].sort(), [...MAPAS_REGIAO5_FORA].sort());
});

test('as três penas de trovão existem, espalhadas por três mapas diferentes', () => {
  const mapasComPena = entradas
    .filter(([, def]) => def.objetos.some(
      (o) => o.tipo === 'achado' && o.falas?.some((f) => f.da?.item === 'pena_trovao')))
    .map(([id]) => id);
  assert.equal(mapasComPena.length, 3, `penas de trovão em: ${mapasComPena.join(', ')}`);
});

test('o Arco-da-Velha só se entrega depois das penas E da medalha', () => {
  const arco = MAPAS['charcoRelampejante']!.npcs.find((n) => n.id === 'arco_da_velha')!;
  const entrega = arco.falas.find((f) => f.encantado);
  assert.ok(entrega);
  assert.equal(entrega!.encantado!.especie, 'arcoDaVelha');
  const exige = [entrega!.se].flat();
  assert.ok(exige.includes('servico_penas_trovao'));
  assert.ok(exige.includes('medalha:trovao'));
});

/* ------------------------------------------ Minas da Caipora: tipos novos */

const MAPAS_REGIAO6_FORA = ['bocaDaMina', 'arraialCaipora', 'galeriasDaMina', 'cavaFunda'];

test('a região 6 também é larga e alta', () => {
  for (const id of MAPAS_REGIAO6_FORA) {
    const def = MAPAS[id]!;
    assert.ok(def.chao[0]!.length >= 56, `${id}: só ${def.chao[0]!.length} colunas`);
    assert.ok(def.chao.length >= 40, `${id}: só ${def.chao.length} linhas`);
  }
});

/* Todos os estados (posição × alavancas) alcançáveis a partir da entrada, e
   quais deles ainda chegam ao alvo. Diferente das chaves de para-raio, o
   trilho só anda para um lado: aqui um movimento NÃO se desfaz sozinho, e
   "ninguém fica preso" precisa ser provado de verdade, com busca reversa. */
function grafoDeTrilhos(
  def: DefMapa, chaves: readonly string[], sempre: ReadonlySet<string>,
  de: { tx: number; ty: number },
): Map<string, string[]> {
  const mapas = new Map<number, Mapa>();
  const mapaDe = (mask: number): Mapa => {
    let m = mapas.get(mask);
    if (!m) {
      const ligadas = new Set(chaves.filter((_, i) => mask & (1 << i)));
      m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => sempre.has(c) || ligadas.has(c) });
      mapas.set(mask, m);
    }
    return m;
  };
  const postes = chaves.map((k) => def.objetos.find((x) => x.tipo === 'alavanca'
    && x.falas?.some((f) => [f.liga, f.desliga].flat().includes(k)))!);
  const grafo = new Map<string, string[]>();
  const fila = [`${de.tx},${de.ty},0`];
  grafo.set(fila[0]!, []);
  while (fila.length) {
    const k = fila.shift()!;
    const [x, y, mask] = k.split(',').map(Number) as [number, number, number];
    const m = mapaDe(mask);
    const saidas: string[] = [];
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
      const onde = passoComTrilho(m, x, y, dx, dy);
      if (onde) saidas.push(`${onde[0]},${onde[1]},${mask}`);
    }
    postes.forEach((p, i) => {
      if (Math.abs(p.tx - x) + Math.abs(p.ty - y) === 1) saidas.push(`${x},${y},${mask ^ (1 << i)}`);
    });
    grafo.set(k, saidas);
    for (const n of saidas) if (!grafo.has(n)) { grafo.set(n, []); fila.push(n); }
  }
  return grafo;
}

function chegamAo(grafo: Map<string, string[]>, alvo: (x: number, y: number) => boolean): Set<string> {
  const reverso = new Map<string, string[]>();
  for (const [a, ns] of grafo) for (const n of ns) (reverso.get(n) ?? reverso.set(n, []).get(n)!).push(a);
  const ok = new Set([...grafo.keys()].filter((k) => { const [x, y] = k.split(',').map(Number); return alvo(x!, y!); }));
  const fila = [...ok];
  while (fila.length) {
    for (const p of reverso.get(fila.shift()!) ?? []) if (!ok.has(p)) { ok.add(p); fila.push(p); }
  }
  return ok;
}

const ALAVANCAS_MINA = ['alavanca_mina_1', 'alavanca_mina_2', 'alavanca_mina_3'];

test('as Galerias têm solução pelos trilhos, e pedem seis alavancadas', () => {
  const def = MAPAS['galeriasDaMina']!;
  const sino = def.objetos.find((o) => o.placa === 'SINO DA MINA')!;
  const toques = resolverChaves(def, ALAVANCAS_MINA, new Set(), def.inicio, { tx: sino.tx - 1, ty: sino.ty });
  assert.equal(toques, 6, `o sino devia pedir 6 alavancadas, pediu ${toques}`);
});

test('nas Galerias ninguém fica preso: todo estado ainda chega ao sino, e do sino se volta', () => {
  const def = MAPAS['galeriasDaMina']!;
  const sino = def.objetos.find((o) => o.placa === 'SINO DA MINA')!;
  const grafo = grafoDeTrilhos(def, ALAVANCAS_MINA, new Set(), def.inicio);
  const aoSino = chegamAo(grafo, (x, y) => Math.abs(x - sino.tx) + Math.abs(y - sino.ty) === 1);
  for (const k of grafo.keys()) assert.ok(aoSino.has(k), `do estado ${k} não se chega mais ao sino`);
  // e a volta com o Tuco: de todo estado ao lado do sino, a entrada da mina
  const aEntrada = chegamAo(grafo, (x, y) => x === def.inicio.tx && y === def.inicio.ty);
  for (const k of grafo.keys()) {
    const [x, y] = k.split(',').map(Number);
    if (Math.abs(x! - sino.tx) + Math.abs(y! - sino.ty) === 1) {
      assert.ok(aEntrada.has(k), `do sino (${k}) não se volta à entrada`);
    }
  }
});

test('um trilho só anda para um lado: voltar por ele devolve para onde se estava', () => {
  const def = MAPAS['galeriasDaMina']!;
  const m = new Mapa(def, ABERTO);
  // o expresso SE → NO: pisar nele em qualquer ponto leva até a plataforma NO
  const fim = passoComTrilho(m, 54, 37, 0, 1);
  assert.deepEqual(fim, [4, 9], 'o expresso devia levar do SE até a plataforma NO');
  // e de dentro da plataforma NO, pisar no fim do expresso devolve para a NO
  assert.deepEqual(passoComTrilho(m, 4, 9, 0, 1), [4, 9]);
});

test('o Terreiro da Pedra tem solução: uma alavanca, a charada e três guardas', () => {
  const def = MAPAS['terreiroPedra']!;
  const flags = new Set(['venceu_guarda_cascalho', 'passou_charada_pedra', 'venceu_guarda_rocha']);
  const ubirajara = def.npcs.find((n) => n.id === 'ubirajara')!;
  const alvo = { tx: ubirajara.tx + 1, ty: ubirajara.ty };
  assert.equal(resolverChaves(def, ['alavanca_terreiro_pedra'], flags, def.inicio, alvo), 1);
  // e do Ubirajara se volta à porta, com qualquer posição da alavanca
  const porta = def.saidas![0]!;
  const acima = { tx: porta.tx, ty: porta.ty - 1 };
  for (const extra of [[], ['alavanca_terreiro_pedra']]) {
    const tudo = new Set([...flags, ...extra]);
    assert.equal(resolverChaves(def, [], tudo, alvo, acima), 0,
                 `do Ubirajara devia dar para voltar à porta (alavanca ${extra.length ? 'puxada' : 'solta'})`);
  }
  for (const falta of flags) {
    const sem = new Set([...flags].filter((f) => f !== falta));
    assert.equal(resolverChaves(def, ['alavanca_terreiro_pedra'], sem, def.inicio, alvo), null,
                 `sem "${falta}" não devia dar para chegar ao Ubirajara`);
  }
});

test('toda charada tem resposta certa entre as opções, e cabe na caixinha', () => {
  let perguntas = 0;
  for (const [id, def] of entradas) {
    for (const n of def.npcs) {
      for (const f of n.falas) {
        const p = f.pergunta;
        if (!p) continue;
        perguntas++;
        assert.ok(p.opcoes.length >= 2 && p.opcoes.length <= 4, `${id}/${n.id}: ${p.opcoes.length} opções`);
        assert.ok(p.certa >= 0 && p.certa < p.opcoes.length, `${id}/${n.id}: resposta certa fora das opções`);
        for (const o of p.opcoes) assert.ok(o.length <= 14, `${id}/${n.id}: opção "${o}" larga demais`);
        assert.ok(p.errou.linhas.length > 0);
      }
    }
  }
  assert.equal(perguntas, 7, 'três do Velho Garimpeiro, a da guarda da Pedra e três cartas da Cartomante');
});

test('errar uma charada do Velho Garimpeiro apaga as anteriores', () => {
  const velho = MAPAS['casaGarimpeiro']!.npcs.find((n) => n.id === 'velho_garimpeiro')!;
  const segunda = velho.falas.find((f) => f.se === 'charada1_ok')!;
  const terceira = velho.falas.find((f) => f.se === 'charada2_ok')!;
  assert.deepEqual([segunda.pergunta!.errou.desliga].flat(), ['charada1_ok']);
  assert.deepEqual([terceira.pergunta!.errou.desliga].flat().sort(), ['charada1_ok', 'charada2_ok']);
  assert.equal(terceira.liga, 'conta_charadas');
});

test('a escolta do Tuco começa no fundo da mina e termina com a mãe', () => {
  const tuco = MAPAS['galeriasDaMina']!.npcs.find((n) => n.id === 'tuco')!;
  assert.deepEqual([tuco.seNao].flat().sort(), ['escoltando_menino', 'menino_salvo']);
  assert.ok(tuco.falas.some((f) => f.liga === 'escoltando_menino'));
  const luzia = MAPAS['arraialCaipora']!.npcs.find((n) => n.id === 'dona_luzia')!;
  const entrega = luzia.falas.find((f) => f.se === 'escoltando_menino')!;
  assert.deepEqual([entrega.liga].flat().sort(), ['conta_menino', 'menino_salvo']);
  assert.equal(entrega.desliga, 'escoltando_menino');
});

test('todo tesouro enterrado fica em chão alcançável, e só se cava com a forquilha', () => {
  for (const [id, def] of entradas) {
    const m = mapa(id);
    const pes = alcance(m, def.inicio.tx, def.inicio.ty);
    for (const o of def.objetos) {
      if (o.tipo !== 'enterrado') continue;
      assert.ok(!m.solido(o.tx, o.ty), `${id}: enterrado em (${o.tx},${o.ty}) é parede`);
      const ladoAlcancavel = [[0, -1], [0, 1], [-1, 0], [1, 0]]
        .some(([dx, dy]) => pes.has(`${o.tx + dx!},${o.ty + dy!}`));
      assert.ok(ladoAlcancavel, `${id}: ninguém chega perto do enterrado em (${o.tx},${o.ty})`);
      if (o.vazio !== true) {
        assert.ok(o.falas?.every((f) => f.se === 'item:forquilha'), `${id}: dá para cavar sem forquilha`);
      }
    }
  }
});

test('três pepitas na Boca da Mina, e três diamantes em três mapas', () => {
  const onde = (item: string) => entradas.flatMap(([id, def]) =>
    def.objetos.filter((o) => o.tipo === 'enterrado' && o.falas?.some((f) => f.da?.item === item)).map(() => id));
  assert.deepEqual(onde('pepita'), ['bocaDaMina', 'bocaDaMina', 'bocaDaMina']);
  assert.equal(new Set(onde('diamante')).size, 3);
});

test('a Medalha Pedra vem com o Dom Escavar, e os montes de terra só cedem a ele', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  assert.equal(falas.find((f) => f.medalha === 'pedra')?.dom, 'escavar');
  let montes = 0;
  for (const id of MAPAS_REGIAO6_FORA) {
    const def = MAPAS[id]!;
    if (!def.objetos.some((o) => o.tipo === 'monteTerra')) continue;
    montes++;
    const esconderijo = def.objetos.find(
      (o) => o.tipo === 'achado' && o.placa === 'ESCONDERIJO' && o.seNao !== undefined)!;
    const alvo = `${esconderijo.tx},${esconderijo.ty}`;
    const sem = new Mapa(def, { ...ABERTO, ligada: (c) => c !== 'dom_escavar' });
    assert.ok(!alcance(sem, def.inicio.tx, def.inicio.ty).has(alvo), `${id}: sem o Dom o esconderijo devia fechar`);
    assert.ok(alcance(new Mapa(def, ABERTO), def.inicio.tx, def.inicio.ty).has(alvo), `${id}: com o Dom devia abrir`);
    const pes = alcance(sem, def.inicio.tx, def.inicio.ty);
    const pesCom = alcance(new Mapa(def, ABERTO), def.inicio.tx, def.inicio.ty);
    for (const s of def.saidas ?? []) {
      // a estrada do Bairro da Cuca é justamente o que o Dom Escavar abre
      if (s.para === 'ruaDoBreu') {
        assert.ok(!pes.has(`${s.tx},${s.ty}`), `${id}: sem o Dom a estrada do Bairro devia estar fechada`);
        assert.ok(pesCom.has(`${s.tx},${s.ty}`), `${id}: com o Dom a estrada do Bairro devia abrir`);
        continue;
      }
      assert.ok(pes.has(`${s.tx},${s.ty}`), `${id}: o monte trancou uma saída`);
    }
  }
  assert.equal(montes, 3, 'três mapas com monte de terra (e a Cava tem também o da estrada)');
});

test('a Caipora só se entrega depois dos diamantes E da medalha', () => {
  const c = MAPAS['cavaFunda']!.npcs.find((n) => n.id === 'caipora_fundo')!;
  const entrega = c.falas.find((f) => f.encantado)!;
  assert.equal(entrega.encantado!.especie, 'caipora');
  const exige = [entrega.se].flat();
  assert.ok(exige.includes('servico_diamantes') && exige.includes('medalha:pedra'));
});

/* Pegou de verdade o Terreiro da Pedra: o trilho da plataforma A para a B só
   anda num sentido, e quem subia até o Ubirajara não tinha mais por onde
   voltar à porta. Aqui, para todo mapa, com toda condição valendo: de todo
   tile alcançável (seguindo os trilhos) ainda se chega a alguma saída. As
   Galerias ficam de fora — lá o caminho depende de quais das três alavancas
   estão puxadas, e quem prova a volta é a busca de estados própria delas. */
test('de todo lugar alcançável se volta a alguma saída', () => {
  for (const [id, def] of entradas) {
    if (id === 'galeriasDaMina') continue;
    if (!def.saidas?.length) continue;
    const m = mapa(id);
    const grafo = new Map<string, string[]>();
    const fila = [`${def.inicio.tx},${def.inicio.ty}`];
    grafo.set(fila[0]!, []);
    while (fila.length) {
      const k = fila.shift()!;
      const [x, y] = k.split(',').map(Number) as [number, number];
      const saidas: string[] = [];
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
        const onde = passoComTrilho(m, x, y, dx, dy);
        if (onde) saidas.push(`${onde[0]},${onde[1]}`);
      }
      grafo.set(k, saidas);
      for (const n of saidas) if (!grafo.has(n)) { grafo.set(n, []); fila.push(n); }
    }
    const portas = new Set(def.saidas.map((s) => `${s.tx},${s.ty}`));
    const voltam = chegamAo(new Map([...grafo].map(([k, v]) => [`${k},0`, v.map((n) => `${n},0`)])),
                            (x, y) => portas.has(`${x},${y}`));
    const presos = [...grafo.keys()].filter((k) => !voltam.has(`${k},0`));
    assert.deepEqual(presos.slice(0, 5), [], `${id}: ${presos.length} tiles sem caminho de volta a uma saída`);
  }
});

/* ------------------------------------------- Bairro da Cuca: rondas e ladrilhos */

test('toda ronda é um caminho fechado de tiles vizinhos e andáveis', () => {
  for (const [id, def] of entradas) {
    const m = new Mapa(def, FECHADO);
    for (const n of def.npcs) {
      const r = n.ronda;
      if (!r) continue;
      assert.deepEqual([r.caminho[0]!.tx, r.caminho[0]!.ty], [n.tx, n.ty], `${id}/${n.id}: não começa no próprio lugar`);
      r.caminho.forEach((p, i) => {
        const q = r.caminho[(i + 1) % r.caminho.length]!;
        assert.equal(Math.abs(p.tx - q.tx) + Math.abs(p.ty - q.ty), 1, `${id}/${n.id}: salto em (${p.tx},${p.ty})`);
        assert.ok(!m.solido(p.tx, p.ty), `${id}/${n.id}: passa por parede em (${p.tx},${p.ty})`);
        assert.equal(m.saidaEm(p.tx, p.ty), undefined, `${id}/${n.id}: pisa numa saída`);
      });
      assert.ok(!m.solido(r.volta.tx, r.volta.ty), `${id}/${n.id}: devolve para dentro de parede`);
      assert.ok(n.seNao, `${id}/${n.id}: a ronda devia acabar em algum momento`);
    }
  }
});

/* A travessia sem ser visto, simulada em passos: o jogador anda um tile ou
   espera a cada passo, o vigia anda um tile a cada dois (no jogo ele é
   ainda mais lento). Por segurança o vigia conta nos dois tiles — onde está
   e para onde vai —, olhando para onde anda. Devolve o número de passos da
   travessia mais curta sem ser visto, ou null. */
function travessiaSemSerVisto(def: DefMapa, flags: ReadonlySet<string>,
                              de: { tx: number; ty: number }, alvo: { tx: number; ty: number },
                              comVigias = true): number | null {
  const m = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => flags.has(c) });
  const parados = new Set(def.npcs.filter((n) => !n.ronda).map((n) => `${n.tx},${n.ty}`));
  const livre = (x: number, y: number): boolean => !m.solido(x, y) && !parados.has(`${x},${y}`);
  const rondas = comVigias ? def.npcs.filter((n) => n.ronda).map((n) => n.ronda!) : [];
  const L = rondas.reduce((a, r) => (a * r.caminho.length) / mdc(a, r.caminho.length), 1);
  const P = 2 * L;
  const visto = (x: number, y: number, t: number): boolean => rondas.some((r) => {
    const n = r.caminho.length;
    for (const k of [Math.floor(t / 2) % n, (Math.floor(t / 2) + 1) % n]) {
      const a = r.caminho[(k - 1 + n) % n]!, b = r.caminho[k]!;
      if (b.tx === x && b.ty === y) return true;
      const dx = b.tx - a.tx, dy = b.ty - a.ty;
      let vx = b.tx, vy = b.ty;
      for (let i = 0; i < r.visao; i++) {
        vx += dx; vy += dy;
        if (m.solido(vx, vy)) break;
        if (vx === x && vy === y) return true;
      }
    }
    return false;
  });
  if (visto(de.tx, de.ty, 0)) return null;
  const seen = new Set([`${de.tx},${de.ty},0`]);
  let fila: [number, number][] = [[de.tx, de.ty]];
  for (let t = 0; fila.length && t < 20 * P; t++) {
    const prox: [number, number][] = [];
    for (const [x, y] of fila) {
      if (x === alvo.tx && y === alvo.ty) return t;
      for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = x + dx, ny = y + dy, k = `${nx},${ny},${(t + 1) % P}`;
        if (!livre(nx, ny) || seen.has(k) || visto(nx, ny, t + 1)) continue;
        seen.add(k); prox.push([nx, ny]);
      }
    }
    fila = prox;
  }
  return null;
}
function mdc(a: number, b: number): number { return b === 0 ? a : mdc(b, a % b); }

test('o Beco das Rondas se atravessa sem ser visto, mas não de graça', () => {
  const def = MAPAS['becoDasRondas']!;
  const portao = def.objetos.find((o) => o.placa === 'PORTÃO DO CEMITÉRIO')!;
  const alvo = { tx: portao.tx, ty: portao.ty + 1 };
  const semVigia = travessiaSemSerVisto(def, new Set(), def.inicio, alvo, false);
  const comVigia = travessiaSemSerVisto(def, new Set(), def.inicio, alvo);
  assert.ok(comVigia !== null, 'nenhuma travessia escapa de todos os vigias');
  assert.ok(comVigia! >= semVigia! + 10, `os vigias quase não atrapalham (${semVigia} → ${comVigia})`);
  assert.equal(def.npcs.filter((n) => n.ronda).length, 7);
});

test('no Terreiro do Breu se passa pelos vultos até a primeira guarda', () => {
  const def = MAPAS['terreiroBreu']!;
  const guarda = def.npcs.find((n) => n.id === 'guarda_sombra1')!;
  const alvo = { tx: guarda.tx + 1, ty: guarda.ty };
  const t = travessiaSemSerVisto(def, new Set(), def.inicio, alvo);
  assert.ok(t !== null, 'os vultos veem qualquer caminho até a guarda');
  const semVulto = travessiaSemSerVisto(def, new Set(), def.inicio, alvo, false)!;
  assert.ok(t! > semVulto, 'os vultos deviam obrigar a esperar');
  // vencida a Morgana, os vultos somem e a saída fica livre
  const depois = new Mapa(def, ABERTO);
  const morgana = def.npcs.find((n) => n.id === 'morgana')!;
  assert.ok(alcance(depois, morgana.tx + 1, morgana.ty).has(`${def.saidas![0]!.tx},${def.saidas![0]!.ty}`));
});

test('os ladrilhos do Casarão: a ordem existe no chão, e só ela abre a ala oeste', () => {
  const def = MAPAS['casaraoAssombrado']!;
  const seq = def.sequencia!;
  const simbolos = def.objetos.filter((o) => o.tipo === 'ladrilho').map((o) => o.simbolo);
  for (const s of seq.ordem) assert.equal(simbolos.filter((x) => x === s).length, 1, `símbolo "${s}" devia aparecer uma vez`);
  assert.ok(simbolos.length > seq.ordem.length, 'devia haver ladrilhos de sobra, para confundir');
  assert.equal(def.objetos.filter((o) => o.tipo === 'placa' && o.placa?.startsWith('QUADRO')).length, seq.ordem.length,
               'um quadro de pista para cada símbolo da ordem');
  const pes = alcance(new Mapa(def, FECHADO), def.inicio.tx, def.inicio.ty);
  for (const o of def.objetos.filter((x) => x.tipo === 'ladrilho')) {
    assert.ok(pes.has(`${o.tx},${o.ty}`), `ladrilho em (${o.tx},${o.ty}) inalcançável`);
  }
  const cuca = def.npcs.find((n) => n.id === 'cuca_sotao')!;
  const perto = `${cuca.tx - 1},${cuca.ty}`;
  assert.ok(!pes.has(perto), 'sem os ladrilhos a Cuca devia estar fora de alcance');
  const depois = new Mapa(def, { contas: () => 0, nadar: true, ligada: (c) => c === seq.flag });
  assert.ok(alcance(depois, def.inicio.tx, def.inicio.ty).has(perto), 'com os ladrilhos a Cuca devia ser alcançável');
});

test('a Medalha Breu vem com o Dom Visão Noturna, e os véus só caem com ele', () => {
  const falas = entradas.flatMap(([, def]) => def.npcs.flatMap((n) => n.falas));
  assert.equal(falas.find((f) => f.medalha === 'breu')?.dom, 'visao');
  let veus = 0;
  for (const [id, def] of entradas) {
    if (!def.objetos.some((o) => o.tipo === 'veu')) continue;
    veus++;
    const esconderijo = def.objetos.find(
      (o) => o.tipo === 'achado' && o.placa === 'ESCONDERIJO' && o.seNao !== undefined)!;
    const alvo = `${esconderijo.tx},${esconderijo.ty}`;
    const sem = new Mapa(def, { ...ABERTO, ligada: (c) => c !== 'dom_visao' });
    const pes = alcance(sem, def.inicio.tx, def.inicio.ty);
    assert.ok(!pes.has(alvo), `${id}: sem o Dom o esconderijo devia fechar`);
    assert.ok(alcance(new Mapa(def, ABERTO), def.inicio.tx, def.inicio.ty).has(alvo), `${id}: com o Dom devia abrir`);
    for (const s of def.saidas ?? []) assert.ok(pes.has(`${s.tx},${s.ty}`), `${id}: o véu trancou uma saída`);
  }
  assert.equal(veus, 2);
});

test('três retratos em três mapas, e a Pisadeira só depois deles E da medalha', () => {
  const onde = entradas.filter(([, def]) => def.objetos.some((o) => o.falas?.some((f) => f.da?.item === 'retrato')))
    .map(([id]) => id);
  assert.equal(onde.length, 3);
  const p = MAPAS['casaraoAssombrado']!.npcs.find((n) => n.id === 'pisadeira_telhado')!;
  const entrega = p.falas.find((f) => f.encantado)!;
  assert.equal(entrega.encantado!.especie, 'pisadeira');
  const exige = [entrega.se].flat();
  assert.ok(exige.includes('servico_retratos') && exige.includes('medalha:breu'));
});

test('a região 7 também é larga', () => {
  for (const id of ['ruaDoBreu', 'bairroDaCuca', 'becoDasRondas']) {
    assert.ok(MAPAS[id]!.chao[0]!.length >= 56, `${id}: estreito demais`);
  }
});

test('o mapa de cada região está escondido nela mesma, e se acha sem Dom nenhum', async () => {
  const { REGIOES, itemMapaDaRegiao } = await import('../data/mundo.ts');
  for (const r of REGIOES) {
    const item = itemMapaDaRegiao(r);
    const onde = entradas.flatMap(([id, def]) =>
      def.objetos.filter((o) => o.falas?.some((f) => f.da?.item === item)).map((o) => ({ id, def, o })));
    assert.equal(onde.length, 1, `${item}: devia estar em um lugar só`);
    const { id, def, o } = onde[0]!;
    assert.ok(r.mapas.includes(id), `${item} está fora da própria região (${id})`);
    assert.ok(!def.interior, `${item} devia ficar ao ar livre`);
    const semDom = new Mapa(def, { contas: () => 5, nadar: false, ligada: (c) => !c.startsWith('dom_') });
    assert.ok(alcance(semDom, def.inicio.tx, def.inicio.ty).has(`${o.tx},${o.ty}`),
              `${item} em (${o.tx},${o.ty}) exige algum Dom`);
  }
});
