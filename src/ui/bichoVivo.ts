/* =========================================================================
   Um Encantado vivo fora da luta (menu do time, caderno, escolha do
   inicial): respira com o pé no chão, boia se flutua e pisca de vez em
   quando. Cada pose é assada uma vez e guardada.
   ========================================================================= */
import { assarSuave, type Assado } from '../core/buf.ts';
import type { Renderizador } from '../core/renderer.ts';
import { ARTE_CRIATURAS, naPose, piscando, type Pose } from '../art/creatures.ts';
import { AJUSTES } from '../render3d/modelos/bichos.ts';

export class BichosVivos {
  private readonly assados = new Map<string, { img: Assado; pe: number }>();

  private assado(arte: string, pose: Pose): { img: Assado; pe: number } | null {
    const chave = arte + '|' + pose;
    let a = this.assados.get(chave);
    if (a) return a;
    const desenho = ARTE_CRIATURAS[arte];
    if (!desenho) return null;
    const b = naPose(desenho, pose);
    // o pé: a última linha com pixel de verdade (o desenho pode sobrar embaixo)
    let pe = b.h;
    for (let y = b.h - 1; y >= 0; y--) {
      let tem = false;
      for (let x = 0; x < b.w && !tem; x++) tem = b.get(x, y) != null;
      if (tem) { pe = y + 1; break; }
    }
    a = { img: assarSuave(b), pe };
    this.assados.set(chave, a);
    return a;
  }

  /* desenha a arte (chave em ARTE_CRIATURAS) com o canto em (x, y);
     `fase` desencontra bichos lado a lado */
  desenhar(r: Renderizador, arte: string, x: number, y: number, tempo: number, fase = 0): void {
    const t = tempo + fase;
    const a = this.assado(arte, piscando(t) ? 'pisca' : 'normal');
    if (!a) return;
    if (AJUSTES[arte]?.flutua) {
      r.sprite(a.img, x, y + Math.round(Math.sin(t * 2.4) * 2));
      return;
    }
    const k = Math.sin(t * 2.2);
    r.spriteEsticado(a.img, Math.round(x), Math.round(y), 1 - k * 0.015, 1 + k * 0.035, a.pe);
  }
}
