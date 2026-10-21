/* =========================================================================
   Até onde o pessoal chega — eventos anônimos de progresso no GoatCounter.

   Não manda nome, save, nem nada que identifique quem joga: só o NOME de
   um marco ("chegou à região 3", "ganhou a 5ª medalha", "virou campeão"),
   e cada marco UMA vez por navegador. No painel do GoatCounter isso vira
   uma contagem: quantas pessoas passaram por cada ponto da trilha — e onde
   a maioria para.

   Quem chama é o save: toda gravação (automática ou não) passa por
   `salvarEmSlot`, e é ali que `registrarProgresso` compara o estado com o
   que este navegador já contou. A parte pura — `marcosDe` e `novosMarcos`
   — não toca em rede nem em localStorage, e tem teste em telemetria.test.ts.

   Sem CODIGO_GOATCOUNTER, ou fora do site publicado (vite dev, testes),
   nada sai daqui.
   ========================================================================= */
import { REGIOES, regiaoDoMapa } from '../data/mundo.ts';
import type { EstadoJogo } from './state.ts';
import type { Armazem } from './save.ts';

/* o código do site no GoatCounter: em https://CODIGO.goatcounter.com */
export const CODIGO_GOATCOUNTER = 'encantados';

/* só o site publicado conta — o `vite dev` de quem mexe no jogo, não */
const HOST_PUBLICADO = 'andre88br.github.io';

const CHAVE = 'encantados:telemetria:v1';

/* faixas de espécies capturadas que valem um marco */
const FAIXAS_CAPTURA: readonly number[] = [1, 10, 25, 50, 75, 100];

export interface Marco { caminho: string; titulo: string }

/* ------------------------------------------------------------ os marcos

   Tudo o que o estado diz sobre o progresso, como uma lista de marcos.
   Os caminhos são estáveis (viram linhas no painel); o título é só para
   ler. A ordem das regiões é a de REGIOES — a ordem da trilha. */
export function marcosDe(e: EstadoJogo): Marco[] {
  const marcos: Marco[] = [];

  if (e.time.length > 0 || e.caixa.length > 0) {
    marcos.push({ caminho: 'marco/primeiro-encantado', titulo: 'Escolheu o primeiro Encantado' });
  }

  const r = regiaoDoMapa(e.posicao.mapa);
  if (r) {
    const n = REGIOES.indexOf(r) + 1;
    marcos.push({ caminho: `regiao/${n}-${r.tipo}`, titulo: `Chegou à região ${n}: ${r.nome}` });
  }
  marcos.push({ caminho: `mapa/${e.posicao.mapa}`, titulo: `Entrou em ${e.posicao.mapa}` });

  for (let n = 1; n <= e.medalhas.length; n++) {
    marcos.push({ caminho: `medalhas/${n}`, titulo: `Tem ${n} medalha${n > 1 ? 's' : ''}` });
  }

  for (const f of FAIXAS_CAPTURA) {
    if (e.capturados.length >= f) {
      marcos.push({ caminho: `capturados/${f}`, titulo: `Capturou ${f} espécie${f > 1 ? 's' : ''}` });
    }
  }

  if (e.flags['campeao']) marcos.push({ caminho: 'marco/campeao', titulo: 'Venceu o Anhangá: campeão' });

  return marcos;
}

/* o que ainda não foi contado neste navegador */
export function novosMarcos(e: EstadoJogo, jaContados: ReadonlySet<string>): Marco[] {
  return marcosDe(e).filter((m) => !jaContados.has(m.caminho));
}

/* ------------------------------------------------------------ o armazém */

let armazem: Armazem | null | undefined;
let contados: Set<string> | undefined;

function loja(): Armazem | null {
  if (armazem !== undefined) return armazem;
  try {
    const ls = (globalThis as { localStorage?: Armazem }).localStorage ?? null;
    armazem = ls ? (ls.getItem(CHAVE), ls) : null;
  } catch { armazem = null; }
  return armazem;
}

function jaContados(): Set<string> {
  if (contados) return contados;
  contados = new Set();
  try {
    const cru = loja()?.getItem(CHAVE);
    const lista: unknown = cru ? JSON.parse(cru) : [];
    if (Array.isArray(lista)) for (const s of lista) if (typeof s === 'string') contados.add(s);
  } catch { /* lista estragada: recomeça vazia */ }
  return contados;
}

/* ---------------------------------------------------------------- envio */

function ligado(): boolean {
  if (!CODIGO_GOATCOUNTER) return false;
  const loc = (globalThis as { location?: { hostname?: string } }).location;
  return loc?.hostname === HOST_PUBLICADO;
}

/* o mesmo pixel que o GoatCounter usa sem JavaScript: uma imagem pedida
   com o evento na URL. Sem biblioteca de fora, e se a rede falhar o jogo
   nem fica sabendo. */
function enviar(m: Marco, evento = true): void {
  const q = new URLSearchParams({ p: m.caminho, t: m.titulo, rnd: String(Math.random()).slice(2) });
  if (evento) q.set('e', 'true');
  try {
    const img = new Image();
    img.src = `https://${CODIGO_GOATCOUNTER}.goatcounter.com/count?${q.toString()}`;
  } catch { /* sem rede, sem Image: tanto faz */ }
}

/* chamado a cada gravação: conta o que é novo e lembra que já contou */
export function registrarProgresso(e: EstadoJogo): void {
  if (!ligado()) return;
  const vistos = jaContados();
  const novos = novosMarcos(e, vistos);
  if (novos.length === 0) return;
  for (const m of novos) { enviar(m); vistos.add(m.caminho); }
  try { loja()?.setItem(CHAVE, JSON.stringify([...vistos])); } catch { /* cota, modo privado */ }
}

/* uma visita comum à página: "tem gente abrindo o jogo", com o país e o
   aparelho que o GoatCounter já deduz sozinho */
export function registrarAbertura(): void {
  if (ligado()) enviar({ caminho: '/', titulo: 'Encantados' }, false);
}

/* "começou um jogo novo" — conta toda vez, não só a primeira: quem
   recomeça também é gente jogando */
export function registrarInicio(): void {
  if (ligado()) enviar({ caminho: 'marco/jogo-novo', titulo: 'Começou um jogo novo' });
}
