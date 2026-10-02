/* =========================================================================
   A porta de entrada do som: as cenas só pedem "toque a música tal",
   "toque o efeito tal" — sem saber de WebAudio, de volume, nem de se o
   áudio já destravou.

   Música: uma de cada vez, repetindo — o tema do mapa, o da batalha, ou o
   que cada tomada de cutscene pede (quem escolhe os do mapa e da batalha é
   audio/temas.ts); a troca entre temas é um fade, não um corte. Vinheta (cura, medalha, item...):
   interrompe a música, toca uma vez, e a música pedida volta do começo.
   Efeito: por cima de tudo, no canal dos efeitos.

   Sem navegador (os testes rodam no node), tudo aqui vira nada.
   ========================================================================= */
import { Motor, type Tom, type Chiado } from './motor.ts';
import { MUSICAS, type IdMusica } from './musicas.ts';
import { obterVolume, type Volume } from '../game/config.ts';
import type { TipoGolpe } from '../art/palette.ts';

const GANHO: Record<Volume, number> = { 0: 0, 1: 0.3, 2: 0.6, 3: 1 };

let motor: Motor | null = null;
let desejada: IdMusica | null = null;     // a que deveria estar tocando
let tocando: IdMusica | null = null;      // a que está de fato
let vinhetaAtual = 0;                     // conta vinhetas: a que acaba velha não manda
let emVinheta = false;

/* Chamado de dentro de um toque ou tecla — só aí o navegador libera o
   áudio. Da primeira vez cria o motor; das outras só garante que ele
   está acordado. */
export function destravar(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!motor) {
      motor = new Motor();
      aplicarVolumes();
      document.addEventListener('visibilitychange', () => {
        // aba escondida não toca: nem música de fundo esquecida, nem bateria
        if (document.hidden) void motor?.ctx.suspend();
        else void motor?.ctx.resume();
      });
    }
    if (motor.ctx.state === 'suspended' && !document.hidden) void motor.ctx.resume();
    if (desejada && !tocando && !emVinheta) comecar(desejada);
  } catch {
    motor = null;          // navegador sem WebAudio: o jogo segue mudo
  }
}

export function aplicarVolumes(): void {
  motor?.volumes(GANHO[obterVolume('musica')], GANHO[obterVolume('efeitos')]);
}

function comecar(id: IdMusica, fade = 0.12): void {
  tocando = id;
  motor!.tocar(MUSICAS[id], undefined, fade);
}

/* a música de fundo; null para o silêncio. Pedir a que já toca não a
   reinicia — entrar e sair de casa na mesma região não volta a melodia. */
export function musica(id: IdMusica | null): void {
  desejada = id;
  if (!motor || emVinheta || tocando === id) return;
  // um tema cedendo lugar a outro no meio da cena: fade de trilha de cinema
  if (id) comecar(id, tocando ? 0.6 : 0.12);
  else { tocando = null; motor.calar(0.6); }
}

/* o tema pedido agora (o que toca, ou vai tocar quando o áudio destravar) —
   para a depuração no navegador; o jogo nunca precisa perguntar */
export function tocandoAgora(): IdMusica | null { return desejada; }

export function vinheta(id: IdMusica): void {
  if (!motor || obterVolume('musica') === 0) return;
  const minha = ++vinhetaAtual;
  emVinheta = true;
  tocando = null;
  motor.tocar(MUSICAS[id], () => {
    if (minha !== vinhetaAtual) return;
    emVinheta = false;
    if (desejada) comecar(desejada);
  });
}

/* ------------------------------------------------------------ efeitos */

function tons(...t: Tom[]): void { for (const x of t) motor!.tom(x); }
function chiados(...c: Chiado[]): void { for (const x of c) motor!.som(x); }

const EFEITOS = {
  /* interface */
  cursor: () => tons({ forma: 'pulso50', de: 1320, dur: 0.03, vol: 0.08 }),
  confirmar: () => tons({ forma: 'pulso50', de: 880, dur: 0.04, vol: 0.09 },
                        { forma: 'pulso50', de: 1320, dur: 0.06, vol: 0.09, em: 0.04 }),
  voltar: () => tons({ forma: 'pulso50', de: 660, dur: 0.04, vol: 0.08 },
                     { forma: 'pulso50', de: 440, dur: 0.06, vol: 0.08, em: 0.04 }),
  menu: () => tons({ forma: 'pulso25', de: 523, dur: 0.04, vol: 0.09 },
                   { forma: 'pulso25', de: 784, dur: 0.04, vol: 0.09, em: 0.04 },
                   { forma: 'pulso25', de: 1046, dur: 0.06, vol: 0.09, em: 0.08 }),
  salvar: () => tons({ forma: 'pulso12', de: 1318, dur: 0.09, vol: 0.1 },
                     { forma: 'pulso12', de: 1760, dur: 0.16, vol: 0.1, em: 0.09 }),

  /* mundo */
  porta: () => { chiados({ filtro: 'lowpass', de: 300, ate: 1400, dur: 0.22, vol: 0.28 });
                 tons({ forma: 'triangulo', de: 200, ate: 90, dur: 0.12, vol: 0.25 }); },
  parede: () => tons({ forma: 'triangulo', de: 120, ate: 70, dur: 0.08, vol: 0.3 }),
  encontro: () => {
    for (let i = 0; i < 4; i++) tons({ forma: 'pulso25', de: 300, ate: 1300, dur: 0.12, vol: 0.09, em: i * 0.11 });
  },

  /* batalha */
  dano: () => { chiados({ filtro: 'lowpass', de: 3000, ate: 250, dur: 0.16, vol: 0.4 });
                tons({ forma: 'pulso50', de: 220, ate: 60, dur: 0.1, vol: 0.1 }); },
  critico: () => { EFEITOS.dano();
                   chiados({ filtro: 'highpass', de: 4000, dur: 0.1, vol: 0.2, em: 0.03 });
                   tons({ forma: 'pulso25', de: 1500, ate: 400, dur: 0.12, vol: 0.08, em: 0.02 }); },
  superEficaz: () => { EFEITOS.dano();
                       chiados({ filtro: 'lowpass', de: 4000, ate: 300, dur: 0.18, vol: 0.4, em: 0.09 }); },
  poucoEficaz: () => chiados({ filtro: 'lowpass', de: 900, ate: 200, dur: 0.12, vol: 0.25 }),
  errou: () => chiados({ filtro: 'bandpass', de: 2400, ate: 500, dur: 0.22, vol: 0.2, q: 2 }),
  curar: () => tons({ forma: 'triangulo', de: 440, ate: 880, dur: 0.3, vol: 0.2 },
                    { forma: 'pulso12', de: 1046, dur: 0.06, vol: 0.06, em: 0.1 },
                    { forma: 'pulso12', de: 1318, dur: 0.06, vol: 0.06, em: 0.17 },
                    { forma: 'pulso12', de: 1568, dur: 0.1, vol: 0.06, em: 0.24 }),
  status: () => { for (let i = 0; i < 4; i++) tons({ forma: 'pulso50', de: i % 2 ? 500 : 620, dur: 0.05, vol: 0.07, em: i * 0.055 }); },
  subir: () => tons({ forma: 'pulso25', de: 300, ate: 1000, dur: 0.25, vol: 0.09 }),
  descer: () => tons({ forma: 'pulso25', de: 1000, ate: 280, dur: 0.25, vol: 0.09 }),
  desmaio: () => tons({ forma: 'pulso50', de: 620, ate: 70, dur: 0.6, vol: 0.12 }),
  entrar: () => { chiados({ filtro: 'highpass', de: 3000, dur: 0.12, vol: 0.15 });
                  tons({ forma: 'pulso25', de: 400, ate: 1100, dur: 0.12, vol: 0.09 }); },
  patuaJogar: () => tons({ forma: 'triangulo', de: 350, ate: 1100, dur: 0.18, vol: 0.2 }),
  patuaBalanco: () => tons({ forma: 'triangulo', de: 260, dur: 0.05, vol: 0.25 },
                           { forma: 'triangulo', de: 180, dur: 0.06, vol: 0.25, em: 0.06 }),
  patuaSolta: () => { chiados({ filtro: 'bandpass', de: 1500, ate: 400, dur: 0.25, vol: 0.3 });
                      tons({ forma: 'pulso25', de: 900, ate: 250, dur: 0.2, vol: 0.09 }); },
  evoluir: () => {
    const escala = [523, 659, 784, 1046, 1318, 1568, 2093];
    escala.forEach((f, i) => tons({ forma: 'pulso12', de: f, dur: 0.12, vol: 0.08, em: i * 0.1 }));
    chiados({ filtro: 'highpass', de: 5000, dur: 0.9, vol: 0.05 });
  },
  fuga: () => { for (let i = 0; i < 3; i++) chiados({ filtro: 'bandpass', de: 900, dur: 0.06, vol: 0.2, q: 3, em: i * 0.1 }); },
} satisfies Record<string, () => void>;

export type Efeito = keyof typeof EFEITOS;

export function efeito(nome: Efeito): void {
  if (!motor || obterVolume('efeitos') === 0) return;
  EFEITOS[nome]();
}

/* o golpe voando: cada tipo tem o seu barulho */
const GOLPES: Record<TipoGolpe, () => void> = {
  neutro: () => chiados({ filtro: 'bandpass', de: 900, ate: 3000, dur: 0.12, vol: 0.2, q: 1.5 }),
  agua: () => { for (let i = 0; i < 4; i++) tons({ forma: 'seno', de: 380 + i * 110, ate: 900 + i * 150, dur: 0.07, vol: 0.18, em: i * 0.05 }); },
  planta: () => { chiados({ filtro: 'highpass', de: 2500, dur: 0.25, vol: 0.12 });
                  tons({ forma: 'triangulo', de: 500, ate: 950, dur: 0.18, vol: 0.14 }); },
  fogo: () => chiados({ filtro: 'lowpass', de: 1800, ate: 350, dur: 0.38, vol: 0.35 }),
  vento: () => chiados({ filtro: 'bandpass', de: 400, ate: 2600, dur: 0.4, vol: 0.28, q: 3 }),
  raio: () => { tons({ forma: 'pulso50', de: 1800, ate: 180, dur: 0.2, vol: 0.09 },
                     { forma: 'pulso50', de: 1400, ate: 150, dur: 0.15, vol: 0.07, em: 0.06 });
                chiados({ filtro: 'highpass', de: 3000, dur: 0.18, vol: 0.18 }); },
  terra: () => { tons({ forma: 'triangulo', de: 95, ate: 40, dur: 0.35, vol: 0.45 });
                 chiados({ filtro: 'lowpass', de: 350, dur: 0.3, vol: 0.35 }); },
  sombra: () => tons({ forma: 'pulso25', de: 420, ate: 140, dur: 0.4, vol: 0.08 },
                     { forma: 'pulso25', de: 431, ate: 133, dur: 0.4, vol: 0.08 }),
  luz: () => { [1046, 1318, 1568, 2093].forEach((f, i) => tons({ forma: 'pulso12', de: f, dur: 0.06, vol: 0.08, em: i * 0.045 })); },
};

export function golpe(tipo: TipoGolpe): void {
  if (!motor || obterVolume('efeitos') === 0) return;
  GOLPES[tipo]();
}
