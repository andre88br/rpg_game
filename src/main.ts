/* Ponto de entrada: monta o renderizador, a entrada e o laço, e liga os
   botões de toque da página às mesmas ações do teclado. */
import { Renderizador, LARGURA, ALTURA } from './core/renderer.ts';
import { Entrada, type Acao } from './core/input.ts';
import { Laco } from './core/loop.ts';
import { GerenciadorCenas } from './core/scene.ts';
import { CenaTitulo, type Comeco } from './scenes/title.ts';
import { CenaMundo, type PedidoBatalha } from './scenes/overworld.ts';
import { CenaBatalha } from './scenes/battle.ts';
import { MAPAS } from './data/mapas/index.ts';
import { Mundo } from './world/mundo.ts';
import { novoJogo, type EstadoJogo } from './game/state.ts';
import { carregar } from './game/save.ts';

const canvas = document.getElementById('jogo') as HTMLCanvasElement | null;
const palco = document.getElementById('palco');
if (!canvas || !palco) throw new Error('elementos do jogo não encontrados na página');

const r = new Renderizador(canvas);
const entrada = new Entrada();
const cenas = new GerenciadorCenas();

/* ---- botões de toque ---- */
for (const el of document.querySelectorAll<HTMLElement>('[data-acao]')) {
  entrada.ligarBotao(el, el.dataset['acao'] as Acao);
}

/* ---- ampliação: sempre por fator inteiro ---- */
function ajustar(): void {
  const cx = palco!.getBoundingClientRect();
  r.ajustar(cx.width, cx.height);
}
window.addEventListener('resize', ajustar);
window.addEventListener('orientationchange', () => setTimeout(ajustar, 120));
ajustar();

/* ---- partida ----

   A partida só nasce DEPOIS da escolha no título: CONTINUAR devolve o que
   estava gravado, NOVO JOGO começa do zero. Por isso nada disso é criado
   aqui em cima — e por isso voltar ao título larga a partida inteira,
   inclusive o mundo, para a próxima começar limpa. */
const regiao = new Mundo(MAPAS);

let estado: EstadoJogo | null = null;
let mundo: CenaMundo | null = null;

function lutar(p: PedidoBatalha): void {
  const est = estado!;
  const cena = mundo!;
  cenas.trocar(new CenaBatalha({
    estado: est,
    oponentes: p.oponentes,
    treinador: p.treinador ?? null,
    cenario: p.cenario ?? 'praia',
    aoTerminar: (resultado) => {
      // a cena do mundo aplica o resultado quando volta a ser a cena da vez
      cena.voltouDaBatalha(resultado);
      cenas.trocar(cena);
    },
  }));
}

function aoTitulo(): void {
  estado = null;
  mundo = null;
  regiao.invalidar();          // o próximo jogo remonta os mapas do zero
  cenas.trocar(new CenaTitulo(comecar));
}

function comecar(modo: Comeco): void {
  estado = (modo === 'continuar' ? carregar() : null) ?? novoJogo();
  /* A cena de mundo é criada UMA vez por partida e reaproveitada: voltar de
     uma batalha não pode remontar o mapa nem devolver o jogador ao ponto de
     partida. */
  mundo = new CenaMundo({
    mundo: regiao,
    estado,
    aoBatalhar: lutar,
    aoSair: aoTitulo,
  });
  cenas.trocar(mundo);
}

cenas.definir(new CenaTitulo(comecar));

/* ---- laço ---- */
const laco = new Laco((dt) => {
  cenas.atualizar(dt, entrada);
  cenas.desenhar(r);
  entrada.virarQuadro();
});
laco.iniciar();

/* O jogo subiu: libera a rede de segurança do index.html para uma próxima
   publicação. Só aqui, porque só aqui sabemos que deu certo de verdade. */
try { sessionStorage.removeItem('encantados:recarga'); } catch { /* aba privada */ }

// atalho de depuração, útil no navegador
Object.assign(window as unknown as Record<string, unknown>, {
  jogo: {
    r, entrada, cenas, laco, regiao, lutar, LARGURA, ALTURA,
    get estado() { return estado; },
    get mundo() { return mundo; },
  },
});
