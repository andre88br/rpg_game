/* Ponto de entrada: monta o renderizador, a entrada e o laço, e liga os
   botões de toque da página às mesmas ações do teclado. */
import { Renderizador, LARGURA, ALTURA } from './core/renderer.ts';
import { Entrada, type Acao } from './core/input.ts';
import { Laco } from './core/loop.ts';
import { GerenciadorCenas } from './core/scene.ts';
import { CenaTitulo } from './scenes/title.ts';
import { CenaMundo, type PedidoBatalha } from './scenes/overworld.ts';
import { CenaBatalha } from './scenes/battle.ts';
import { portoIara } from './data/mapas/portoIara.ts';
import { novoJogo } from './game/state.ts';

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

/* ---- partida ---- */
const estado = novoJogo();

/* A cena de mundo é criada UMA vez e reaproveitada: voltar de uma batalha
   não pode remontar o mapa nem devolver o jogador ao ponto de partida. */
const mundo = new CenaMundo({
  def: portoIara,
  estado,
  aoBatalhar: (p: PedidoBatalha) => lutar(p),
});

function lutar(p: PedidoBatalha): void {
  cenas.trocar(new CenaBatalha({
    estado,
    oponentes: p.oponentes,
    treinador: p.treinador ?? null,
    cenario: p.cenario ?? 'praia',
    aoTerminar: (resultado) => {
      cenas.trocar(mundo);
      if (resultado === 'derrota') {
        // o socorro só faz sentido depois que a troca de cena terminou
        setTimeout(() => mundo.socorrer(), 260);
      }
    },
  }));
}

cenas.definir(new CenaTitulo(() => cenas.trocar(mundo)));

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
Object.assign(window as unknown as Record<string, unknown>,
              { jogo: { r, entrada, cenas, laco, estado, mundo, lutar, LARGURA, ALTURA } });
