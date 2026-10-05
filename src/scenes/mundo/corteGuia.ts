/* =========================================================================
   Corte de câmera para a guia do terreiro: uma conta acabou de acender, a
   tela escurece, mostra a guia (em qualquer mapa da região), diz quantas
   faltam e volta.

   O corte não pode atropelar nada que já esteja na tela — conversa,
   batalha, loja —, então `preparar` só GUARDA o que precisa mostrar; é a
   cena que decide a hora certa de chamar `iniciar`.
   ========================================================================= */
import { LARGURA, ALTURA, type Renderizador } from '../../core/renderer.ts';
import type { Entrada } from '../../core/input.ts';
import { TS, type ContextoMapa, type Mapa } from '../../world/tilemap.ts';
import type { Mundo } from '../../world/mundo.ts';
import { Camera } from '../../world/camera.ts';
import { P } from '../../art/palette.ts';
import { quebrar } from '../../art/font.ts';
import { CONTAS_NA_GUIA } from '../../art/tiles.ts';
import { TERREIROS } from '../../game/quests.ts';
import type { Vista3D } from '../../render3d/vista3d.ts';

/* tempo de entrada/saída do preto, e quanto tempo o recado fica na tela se
   ninguém apertar nada */
const CUT_FADE = 0.35;
const CUT_ESPERA = 3.2;

interface Corte {
  mapa: Mapa;
  cam: Camera;
  t: number;
  fase: 'entra' | 'mostra' | 'sai';
  texto: string;
}

export class CorteDaGuia {
  private pendente: { terreiro: string; faltam: number } | null = null;
  private corte: Corte | null = null;

  get esperando(): boolean { return this.pendente !== null; }
  get ativo(): boolean { return this.corte !== null; }

  preparar(terreiro: string, contasAgora: number): void {
    const total = TERREIROS[terreiro]?.length ?? CONTAS_NA_GUIA;
    this.pendente = { terreiro, faltam: total - contasAgora };
  }

  iniciar(mundo: Mundo, ctx: ContextoMapa): void {
    const pend = this.pendente;
    this.pendente = null;
    const g = pend && encontrarGuia(mundo, pend.terreiro);
    if (!pend || !g) return;

    const mapa = mundo.obter(g.mapaId, ctx);
    const cam = new Camera();
    cam.seguir(g.tx * TS + (g.larg * TS) / 2, g.ty * TS + TS / 2, mapa.larguraPx, mapa.alturaPx);

    const texto = pend.faltam > 0
      ? `Mais uma conta da guia do terreiro acendeu! Faltam ${pend.faltam} para ela se abrir.`
      : 'A guia se abriu! O Terreiro está livre — vá em frente.';
    this.corte = { mapa, cam, t: 0, fase: 'entra', texto };
  }

  atualizar(dt: number, entrada: Entrada): void {
    const c = this.corte!;
    c.t += dt;
    if (c.fase === 'entra' && c.t >= CUT_FADE) { c.t = 0; c.fase = 'mostra'; }
    else if (c.fase === 'mostra'
             && (c.t >= CUT_ESPERA || entrada.apertou('a') || entrada.apertou('b'))) {
      c.t = 0; c.fase = 'sai';
    } else if (c.fase === 'sai' && c.t >= CUT_FADE) { this.corte = null; }
  }

  /* `vista3d` dá a vista 3D, quando ela está ligada e carregada */
  desenhar(r: Renderizador, vista3d: () => Vista3D | null): void {
    const c = this.corte!;
    r.limpar('#101018');
    const vista = vista3d();
    if (vista) {
      vista.desenhar(r.ctx, { mapa: c.mapa, tempo: c.t, atores: [],
                             alvoX: (c.cam.x + LARGURA / 2) / TS, alvoY: (c.cam.y + ALTURA / 2) / TS });
    } else {
      c.mapa.desenhar(r.ctx, c.cam.x, c.cam.y, LARGURA, ALTURA);
    }

    if (c.fase === 'mostra') {
      const larg = LARGURA - 16;
      const linhas = quebrar(c.texto, larg - 12);
      const alt = 8 + linhas.length * 10;
      const y = ALTURA - alt - 10;
      r.retangulo(6, y - 2, larg + 4, alt + 4, P.ink!);
      r.retangulo(8, y, larg, alt, P.uiBg!);
      linhas.forEach((l, i) => r.texto(l, 14, y + 6 + i * 10, P.uiInk!));
    }

    const alfa = c.fase === 'entra' ? 1 - c.t / CUT_FADE : c.fase === 'sai' ? c.t / CUT_FADE : 0;
    if (alfa > 0) {
      r.ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
      r.limpar('#000000');
      r.ctx.globalAlpha = 1;
    }
  }
}

/* acha a guia de UM terreiro específico entre os mapas do registro */
function encontrarGuia(mundo: Mundo, terreiro: string):
    { mapaId: string; tx: number; ty: number; larg: number } | null {
  for (const id of mundo.ids) {
    const o = mundo.def(id).objetos
      .find((x) => x.tipo === 'portao' && (x.terreiro ?? 'agua') === terreiro);
    if (o) return { mapaId: id, tx: o.tx, ty: o.ty, larg: o.larg ?? 4 };
  }
  return null;
}
