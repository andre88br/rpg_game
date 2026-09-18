/* =========================================================================
   Pedras que se empurram.

   Puro de propósito, como quests.ts: nada de canvas, nada de Ator — só o
   estado (onde cada pedra está) e a regra de empurrar, para dar pra testar
   sem navegador e pra reaproveitar exatamente a mesma lógica no jogo de
   verdade (scenes/overworld.ts) e no teste de coerência dos mapas.

   A pedra vive na CENA, nunca no mapa assado: sair da sala e voltar
   devolve toda pedra ao lugar de origem. Só a cova TAPADA é permanente —
   ela mora numa flag do jogo, não aqui. Por isso cada pedra de partida
   carrega o nome da cova que, ao ser tapada, a consome: uma cova já tapada
   não bota pedra nova na sala na próxima entrada.

   IMPORTANTE: cada pedra anda sempre num corredor de largura 1 (a regra de
   toda sala deste jogo). Alargar isso multiplica o espaço de estados do
   `temSolucao` — o teto de estados existe para falhar com mensagem clara em
   vez de travar o `npm test`, mas o design tem que continuar respeitando a
   regra, não o teto.
   ========================================================================= */
import type { Mapa } from './tilemap.ts';

export interface Pedra { tx: number; ty: number }

/* uma pedra de partida: onde nasce, e qual cova ela tapa quando encaixada */
export interface DefPedra { tx: number; ty: number; cova: string }

/* toda cova aberta da sala: onde fica, e o nome da flag que ela acende */
export interface Cova { tx: number; ty: number; flag: string }

/* as pedras cujas covas ainda não foram tapadas — chamado ao montar o mapa */
export function posicoesIniciais(
  pedras: readonly DefPedra[] | undefined,
  ligada: (flag: string) => boolean,
): Pedra[] {
  return (pedras ?? []).filter((p) => !ligada(p.cova)).map((p) => ({ tx: p.tx, ty: p.ty }));
}

export function ocupadaPorPedra(pedras: readonly Pedra[], tx: number, ty: number): boolean {
  return pedras.some((p) => p.tx === tx && p.ty === ty);
}

export interface ResultadoEmpurrao { moveu: boolean; encaixou: string | null }

/* tenta empurrar a pedra que está na frente do jogador (jx,jy) na direção
   (dx,dy). `livre` diz se o tile ALÉM da pedra pode recebê-la — sem sólido,
   sem outra pedra, sem NPC: quem chama decide o que conta como ocupado. */
export function empurrar(
  pedras: Pedra[], jx: number, jy: number, dx: number, dy: number,
  livre: (tx: number, ty: number) => boolean,
  covas: readonly Cova[],
): ResultadoEmpurrao {
  const px = jx + dx, py = jy + dy;
  const i = pedras.findIndex((p) => p.tx === px && p.ty === py);
  if (i < 0) return { moveu: false, encaixou: null };

  const nx = px + dx, ny = py + dy;
  if (!livre(nx, ny)) return { moveu: false, encaixou: null };

  const cova = covas.find((c) => c.tx === nx && c.ty === ny);
  if (cova) {
    pedras.splice(i, 1);                 // a pedra se funde na cova: some da sala
    return { moveu: true, encaixou: cova.flag };
  }
  pedras[i] = { tx: nx, ty: ny };
  return { moveu: true, encaixou: null };
}

const DIRECOES: readonly [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
/* teto de estados visitados: acima disso o teste falha com mensagem clara,
   em vez de travar — ver o comentário no topo do arquivo */
const TETO_ESTADOS = 300_000;

interface Estado { jx: number; jy: number; pedras: Pedra[]; tapadas: Set<string> }

function chave(e: Estado): string {
  const ps = e.pedras.map((p) => `${p.tx},${p.ty}`).sort().join(';');
  const cs = [...e.tapadas].sort().join(';');
  return `${e.jx},${e.jy}|${ps}|${cs}`;
}

/* sólido de verdade NESTE ESTADO: a cova ainda aberta continua sólida (não
   se cai lá dentro sem querer), mas uma cova já tapada nesta rota é chão
   comum — exatamente o que `atualizarCenario()` faz no jogo de verdade
   quando a flag acende. Sem isto, andar por CIMA de uma cova que a própria
   busca já tapou ficaria travado para sempre, mesmo a sala tendo solução. */
function solidoAgora(m: Mapa, covas: readonly Cova[], tapadas: Set<string>,
                     tx: number, ty: number): boolean {
  if (!m.solido(tx, ty)) return false;
  const cova = covas.find((c) => c.tx === tx && c.ty === ty);
  return !cova || !tapadas.has(cova.flag);
}

export interface Caixa { x0: number; y0: number; x1: number; y1: number }

/* busca em largura no espaço (posição do jogador, posição de cada pedra,
   quais covas já foram tapadas nesta rota): existe uma sequência de
   passos/empurrões que tapa TODAS as covas e ainda deixa o `objetivo`
   (tipicamente a porta de saída da sala) alcançável? Lança erro se o
   espaço de estados passar do teto — nunca silenciosamente trava o
   `npm test`.

   `caixa`, se dada, prende a exploração livre do jogador (não o empurrão)
   dentro de um retângulo — sem isso, uma sala de pedras encostada num salão
   grande e aberto (o resto da caverna, por exemplo) faz o jogador "vagar"
   por ali dentro da própria busca, multiplicando o espaço de estados por
   uma área que não tem nada a ver com o quebra-cabeça. O `objetivo` fica
   de fora da caixa de propósito: é alcançado pela busca comum em
   `alcancaAPe`, sem pedra nem pesar no teto.

   Atenção: `alcancaAPe` lê o sólido do `Mapa` já assado, que não sabe que
   uma cova foi tapada NESTA rota — por isso `solidoAgora` trata a lista de
   `covas` como exceção manual. Mas uma TRANCA (`barreira`) do lado de fora
   da sala, condicionada à mesma flag, continua sólida neste mapa assado
   até ele ser assado de novo pelo jogo de verdade (`atualizarCenario()`).
   Por isso o `objetivo` tem que ser um ponto que já fica alcançável só de
   tapar as covas — nunca do outro lado de uma trava dessas; se a trava
   abre mesmo com as flags certas é outro teste, com outro `Mapa`. */
export function temSolucao(
  m: Mapa, inicio: { tx: number; ty: number },
  pedrasIniciais: readonly Pedra[], covas: readonly Cova[],
  objetivo: { tx: number; ty: number },
  caixa?: Caixa,
): boolean {
  if (covas.length === 0) return true;
  const dentroDaCaixa = (tx: number, ty: number): boolean =>
    !caixa || (tx >= caixa.x0 && tx <= caixa.x1 && ty >= caixa.y0 && ty <= caixa.y1);

  const inicial: Estado = {
    jx: inicio.tx, jy: inicio.ty,
    pedras: pedrasIniciais.map((p) => ({ ...p })), tapadas: new Set(),
  };
  const vistos = new Set<string>([chave(inicial)]);
  const fila: Estado[] = [inicial];
  let expandidos = 0;

  while (fila.length) {
    const est = fila.shift()!;
    if (est.tapadas.size >= covas.length
        && alcancaAPe(m, covas, est.tapadas, est.jx, est.jy, objetivo.tx, objetivo.ty)) {
      return true;                       // todas as covas tapadas, e dá pra sair
    }

    expandidos++;
    if (expandidos > TETO_ESTADOS) {
      throw new Error(
        `temSolucao: passou de ${TETO_ESTADOS} estados — corredor largo demais para uma pedra?`);
    }

    for (const [dx, dy] of DIRECOES) {
      const nx = est.jx + dx, ny = est.jy + dy;
      const pedraNaFrente = est.pedras.findIndex((p) => p.tx === nx && p.ty === ny);

      if (pedraNaFrente < 0) {
        if (!dentroDaCaixa(nx, ny) || solidoAgora(m, covas, est.tapadas, nx, ny)) continue;
        const prox: Estado = { jx: nx, jy: ny, pedras: est.pedras, tapadas: est.tapadas };
        const k = chave(prox);
        if (vistos.has(k)) continue;
        vistos.add(k);
        fila.push(prox);
        continue;
      }

      const px = nx + dx, py = ny + dy;
      const outraPedra = est.pedras.some((p) => p.tx === px && p.ty === py);
      const cova = covas.find((c) => c.tx === px && c.ty === py);
      /* a cova aberta é sólida para quem anda, mas é exatamente onde a
         pedra tem que ir — por isso o sólido do mapa só bloqueia o
         EMPURRÃO quando não há cova (aberta ou já tapada) ali */
      if ((m.solido(px, py) && !cova) || outraPedra) continue;

      const pedras = est.pedras.filter((_, i) => i !== pedraNaFrente);
      let tapadas = est.tapadas;
      if (cova && !tapadas.has(cova.flag)) {
        tapadas = new Set(tapadas);
        tapadas.add(cova.flag);              // funde: a pedra some (não entra em `pedras`)
      } else {
        pedras.push({ tx: px, ty: py });      // chão comum, cova já tapada, ou sem cova
      }
      const prox: Estado = { jx: nx, jy: ny, pedras, tapadas };
      const k = chave(prox);
      if (vistos.has(k)) continue;
      vistos.add(k);
      fila.push(prox);
    }
  }
  return false;
}

function alcancaAPe(m: Mapa, covas: readonly Cova[], tapadas: Set<string>,
                    jx: number, jy: number, tx: number, ty: number): boolean {
  const vistos = new Set<string>([`${jx},${jy}`]);
  const fila: [number, number][] = [[jx, jy]];
  while (fila.length) {
    const [x, y] = fila.shift()!;
    if (x === tx && y === ty) return true;
    for (const [dx, dy] of DIRECOES) {
      const nx = x + dx, ny = y + dy;
      const k = `${nx},${ny}`;
      if (vistos.has(k) || solidoAgora(m, covas, tapadas, nx, ny)) continue;
      vistos.add(k);
      fila.push([nx, ny]);
    }
  }
  return false;
}
