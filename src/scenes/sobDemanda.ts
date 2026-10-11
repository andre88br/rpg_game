/* =========================================================================
   As cutscenes vêm num pacote à parte.

   Os roteiros, os fundos pintados e o tocador são o maior pedaço de arte
   do jogo, e só servem de vez em quando. Ficando fora do pacote principal,
   o título abre mais depressa. O `main.ts` pede o pacote logo depois de o
   jogo subir (a pré-carga), então na hora da primeira cutscene ele quase
   sempre já chegou. Se ainda não chegou, uma tela preta segura o lugar por
   alguns quadros. O service worker guarda este pacote junto com o resto,
   então offline também funciona.
   ========================================================================= */
import type { Cena } from '../core/scene.ts';
import type { Renderizador } from '../core/renderer.ts';
import type { Roteiro } from '../data/cutscenes.ts';
import type { CenaCutscene } from './cutscene.ts';

export interface PacoteCutscenes {
  CUTSCENES: Record<string, Roteiro>;
  CenaCutscene: typeof CenaCutscene;
}

let pedido: Promise<PacoteCutscenes> | null = null;
let chegou: PacoteCutscenes | null = null;

/* o pacote, se ele já chegou — aí a cutscene entra direto, sem tela preta */
export function cutscenesProntas(): PacoteCutscenes | null { return chegou; }

export function carregarCutscenes(): Promise<PacoteCutscenes> {
  if (!pedido) {
    pedido = Promise.all([import('../data/cutscenes.ts'), import('./cutscene.ts')])
      .then(([d, c]) => (chegou = { CUTSCENES: d.CUTSCENES, CenaCutscene: c.CenaCutscene }));
    // falhou (sem internet e sem cache): a próxima cutscene tenta de novo
    pedido.catch(() => { pedido = null; });
  }
  return pedido;
}

/* A tela preta enquanto o pacote não chega. Quem segue em frente é ela,
   no próprio atualizar — o gerenciador de cenas ignora uma troca pedida no
   meio de outra, e o pacote pode chegar ainda durante o escurecer. */
export class CenaEspera implements Cena {
  private seguir: (() => void) | null = null;

  constructor(aoChegar: (p: PacoteCutscenes) => void, aoFalhar: () => void) {
    carregarCutscenes().then((p) => { this.seguir = () => aoChegar(p); },
                             () => { this.seguir = aoFalhar; });
  }

  atualizar(): void {
    const f = this.seguir;
    if (f) { this.seguir = null; f(); }
  }

  desenhar(r: Renderizador): void { r.limpar('#000000'); }
}
