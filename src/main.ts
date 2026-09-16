/* Ponto de entrada: monta o renderizador, a entrada e o laço, e liga os
   botões de toque da página às mesmas ações do teclado. */
import { Renderizador, LARGURA, ALTURA } from './core/renderer.ts';
import { Entrada, type Acao } from './core/input.ts';
import { Laco } from './core/loop.ts';
import { GerenciadorCenas } from './core/scene.ts';
import { CenaTitulo } from './scenes/title.ts';
import { CenaMundo } from './scenes/overworld.ts';
import { portoIara } from './data/mapas/portoIara.ts';

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

/* ---- cenas ---- */
function irParaMundo(): void { cenas.trocar(new CenaMundo(portoIara)); }
cenas.definir(new CenaTitulo(irParaMundo));

/* ---- laço ---- */
const laco = new Laco((dt) => {
  cenas.atualizar(dt, entrada);
  cenas.desenhar(r);
  entrada.virarQuadro();
});
laco.iniciar();

// atalho de depuração, útil no navegador
Object.assign(window as unknown as Record<string, unknown>,
              { jogo: { r, entrada, cenas, laco, LARGURA, ALTURA } });
