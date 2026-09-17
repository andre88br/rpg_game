/* =========================================================================
   O registro de mapas da partida.

   `Mapa` desenha o cenário inteiro num canvas ao ser construído; remontar
   isso a cada porta atravessada apareceria como um tranco. Então o Mundo
   guarda o que já montou.

   Só que agora o cenário DEPENDE do que o jogador fez: a guia do terreiro
   acende conta por conta, uma barreira some depois do serviço. Um cache
   burro devolveria para sempre a guia apagada da primeira visita. Por isso
   cada mapa guardado vem com a IMPRESSÃO das condições que o desenharam, e
   só é reaproveitado enquanto essa impressão continuar a mesma.
   ========================================================================= */
import { Mapa, objetoAtivo, contasDo, CTX_VAZIO,
         type ContextoMapa, type DefMapa } from './tilemap.ts';

/* O que, do estado da partida, muda o desenho ou a colisão DESTE mapa.
   Um mapa sem objeto condicional e sem guia tem impressão vazia — ou seja,
   é montado uma vez e nunca mais. */
export function impressao(def: DefMapa, ctx: ContextoMapa): string {
  const partes: string[] = [];
  for (const o of def.objetos) {
    if (o.se !== undefined || o.seNao !== undefined) {
      partes.push(`${o.tx},${o.ty}:${objetoAtivo(o, ctx) ? 1 : 0}`);
    }
    if (o.tipo === 'portao' && o.contas === undefined) {
      partes.push(`guia${o.tx},${o.ty}:${contasDo(o, ctx)}`);
    }
  }
  /* o Dom "Nadar" muda a colisão de TODA a água do mapa, não de um objeto */
  if (ctx.nadar && def.chao.some((l) => l.includes('~'))) partes.push('nadar');
  return partes.join('|');
}

interface Guardado { mapa: Mapa; impressao: string }

export class Mundo {
  private cache = new Map<string, Guardado>();
  private registro: Record<string, DefMapa>;

  constructor(registro: Record<string, DefMapa>) {
    this.registro = registro;
  }

  get ids(): string[] { return Object.keys(this.registro); }

  existe(id: string): boolean { return this.registro[id] !== undefined; }

  def(id: string): DefMapa {
    const d = this.registro[id];
    if (!d) throw new Error(`mapa desconhecido: ${id}`);
    return d;
  }

  obter(id: string, ctx: ContextoMapa = CTX_VAZIO): Mapa {
    const def = this.def(id);
    const marca = impressao(def, ctx);
    const guardado = this.cache.get(id);
    if (guardado && guardado.impressao === marca) return guardado.mapa;
    const mapa = new Mapa(def, ctx);
    this.cache.set(id, { mapa, impressao: marca });
    return mapa;
  }

  invalidar(id?: string): void {
    if (id === undefined) this.cache.clear();
    else this.cache.delete(id);
  }
}
