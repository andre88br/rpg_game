/* Ponto de entrada: monta o renderizador, a entrada e o laço, e liga os
   botões de toque da página às mesmas ações do teclado. */
import { fimDoQuadro3D, forcar3D, vista3D } from './render3d/carregar.ts';
import { fixarHora, type Clima } from './game/tempo.ts';
import { Renderizador, LARGURA, ALTURA } from './core/renderer.ts';
import { Entrada, type Acao } from './core/input.ts';
import { Laco } from './core/loop.ts';
import { GerenciadorCenas } from './core/scene.ts';
import { CenaTitulo, type Comeco } from './scenes/title.ts';
import { CenaCutscene } from './scenes/cutscene.ts';
import { CUTSCENES } from './data/cutscenes.ts';
import { CenaPersonagem } from './scenes/personagem.ts';
import { CenaMundo, type PedidoBatalha } from './scenes/overworld.ts';
import { CenaBatalha } from './scenes/battle.ts';
import { CenaCreditos } from './scenes/creditos.ts';
import { MAPAS } from './data/mapas/index.ts';
import { Mundo } from './world/mundo.ts';
import { novoJogo, type EstadoJogo } from './game/state.ts';
import { carregarDeSlot, definirSlotAtivo, migrarSaveAntigo } from './game/save.ts';
import * as Som from './audio/som.ts';

// quem jogava antes dos seis slots tinha um save só: essa migração acontece
// uma vez, aqui, antes de qualquer tela olhar para os slots
migrarSaveAntigo();

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

/* ---- som ----
   O navegador só libera o áudio dentro de um gesto de quem joga: todo
   toque e toda tecla tentam destravar (depois da primeira, é de graça). */
for (const ev of ['keydown', 'pointerdown', 'touchend'] as const) {
  window.addEventListener(ev, () => Som.destravar(), { capture: true });
}

/* o clique de interface: um por quadro, pelo que a cena de fato usou */
function somDeInterface(): void {
  const usadas = entrada.usadasNoQuadro();
  if (usadas.size === 0) return;
  if (usadas.has('a')) Som.efeito('confirmar');
  else if (usadas.has('b')) Som.efeito('voltar');
  else if (usadas.has('menu')) Som.efeito('menu');
  else Som.efeito('cursor');
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
  Som.efeito('encontro');
  Som.musica(p.musica ?? 'batalhaSelvagem');
  cenas.trocar(new CenaBatalha({
    estado: est,
    oponentes: p.oponentes,
    treinador: p.treinador ?? null,
    itensIA: p.itensIA,
    cenario: p.cenario ?? 'praia',
    clima: p.clima,
    podePrender: p.podePrender,
    aoTerminar: (resultado, entrouNoTime) => {
      // a cena do mundo aplica o resultado quando volta a ser a cena da vez
      cena.voltouDaBatalha(resultado, entrouNoTime);
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

function iniciarMundo(): void {
  /* A cena de mundo é criada UMA vez por partida e reaproveitada: voltar de
     uma batalha não pode remontar o mapa nem devolver o jogador ao ponto de
     partida. */
  mundo = new CenaMundo({
    mundo: regiao,
    estado: estado!,
    aoBatalhar: lutar,
    aoSair: aoTitulo,
    // os créditos, e depois a partida segue de onde estava
    aoCreditos: () => { const cena = mundo!; cenas.trocar(new CenaCreditos(estado!, () => cenas.trocar(cena))); },
    // uma cutscene da história, e depois o mundo volta de onde estava
    aoCutscene: (id) => {
      const cena = mundo!;
      const roteiro = CUTSCENES[id];
      if (roteiro) cenas.trocar(new CenaCutscene(roteiro, () => cenas.trocar(cena), estado));
    },
  });
  cenas.trocar(mundo);
}

function comecar(modo: Comeco, slot: number): void {
  definirSlotAtivo(slot);
  if (modo === 'continuar') {
    estado = carregarDeSlot(slot) ?? novoJogo();
    iniciarMundo();
    return;
  }
  // jogo novo: a cutscene de abertura toca, depois a escolha de quem vai andar a
  // trilha — só então o mundo existe de verdade
  cenas.trocar(new CenaCutscene(CUTSCENES['intro']!, () => {
    cenas.trocar(new CenaPersonagem((personagem, nome, desafio) => {
      estado = novoJogo(nome, personagem);
      if (desafio) estado.flags['desafio'] = true;
      iniciarMundo();
    }));
  }));
}

cenas.definir(new CenaTitulo(comecar));

/* ---- laço ---- */
const laco = new Laco((dt) => {
  cenas.atualizar(dt, entrada);
  somDeInterface();
  cenas.desenhar(r);
  fimDoQuadro3D();
  entrada.virarQuadro();
});
laco.iniciar();

/* O jogo subiu: libera a rede de segurança do index.html para uma próxima
   publicação. Só aqui, porque só aqui sabemos que deu certo de verdade. */
try { sessionStorage.removeItem('encantados:recarga'); } catch { /* aba privada */ }

/* O service worker (gerado no build, ver vite.config.ts) guarda o jogo
   para abrir sem internet e deixa instalar no celular. Só no build de
   produção: no `npm run dev` ele serviria arquivos velhos do cache. */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e: unknown) => {
      console.warn('service worker indisponível:', e);
    });
  });
}

// atalho de depuração, útil no navegador
Object.assign(window as unknown as Record<string, unknown>, {
  jogo: {
    r, entrada, cenas, laco, regiao, lutar, LARGURA, ALTURA,
    musica: () => Som.tocandoAgora(),
    hora: (h: number | null) => fixarHora(h),
    forcar3D: (v: boolean) => forcar3D(v),
    info3D: () => vista3D()?.info() ?? null,
    clima: (c: Clima) => mundo?.forcarClima(c),
    get estado() { return estado; },
    get mundo() { return mundo; },
  },
});
