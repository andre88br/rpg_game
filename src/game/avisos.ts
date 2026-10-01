/* =========================================================================
   Avisos: o que as coisas do cenário dizem quando o jogador aperta A de
   frente para elas — a placa, a tranca, a guia do terreiro, a porta
   trancada, o caixote com fala própria.

   As falas são condicionais como as de NPC (game/quests.ts): é o que deixa
   um caixote entregar item e acender flag. Puro: a cena só procura o tile
   da frente neste mapa e abre a conversa.
   ========================================================================= */
import type { ContextoMapa, DefMapa } from '../world/tilemap.ts';
import { colunaPorta, CONTAS_NA_GUIA } from '../art/tiles.ts';
import { contasFaltandoDe, serve, type Fala } from './quests.ts';
import type { EstadoJogo } from './state.ts';

export interface Aviso { nome: string; falas: readonly Fala[] }

const diz = (...linhas: string[]): readonly Fala[] => [{ linhas }];

/* obstáculos de uma fileira: o recado vale em cada tile da largura */
const OBSTACULOS: Partial<Record<string, Aviso>> = {
  barreira: { nome: 'TRANCA', falas: diz('Uma tranca atravessada fecha a passagem.') },
  monteFolhas: { nome: 'MONTE DE FOLHAS', falas: diz('O vento ainda não abriu caminho aqui.') },
  cercaRaio: { nome: 'CERCA DE RAIO',
               falas: diz('A cerca estala de faísca. Alguma chave de para-raio a mantém ligada.') },
  cortinaLuz: { nome: 'CORTINA DE LUZ',
                falas: diz('Um clarão tão forte que o olho fecha sozinho. Falta o que desfaça a luz.') },
  veu: { nome: 'VÉU DE SOMBRA', falas: diz('Um breu grosso como pano. A mão atravessa, o corpo não.') },
  monteTerra: { nome: 'MONTE DE TERRA', falas: diz('Terra desmoronada tapa a passagem. Só cavando.') },
  pedraRachada: { nome: 'PEDRA RACHADA',
                  falas: diz('Uma rachadura atravessa a pedra. Falta a faísca que a parta.') },
};

/* chave "tx,ty" → o aviso daquele tile, para o mapa como ele está agora */
export function montarAvisos(def: DefMapa, e: EstadoJogo, ctx: ContextoMapa): Map<string, Aviso> {
  const avisos = new Map<string, Aviso>();
  for (const o of def.objetos) {
    // objeto que saiu do mapa também não responde ao A
    if (!serve(e, o)) continue;
    const larg = o.larg ?? 1;
    const fileira = (aviso: Aviso) => {
      for (let i = 0; i < larg; i++) avisos.set(`${o.tx + i},${o.ty}`, aviso);
    };
    const obstaculo = OBSTACULOS[o.tipo];

    /* objeto com fala própria manda em tudo: é o caixote, o pote, a brasa */
    if (o.falas) {
      for (let j = 0; j < (o.alt ?? 1); j++) {
        for (let i = 0; i < larg; i++) {
          avisos.set(`${o.tx + i},${o.ty + j}`, { nome: o.placa ?? 'ACHADO', falas: o.falas });
        }
      }
    } else if (obstaculo) {
      fileira(obstaculo);
    } else if (o.tipo === 'portao') {
      const terreiro = o.terreiro ?? 'agua';
      const acesas = o.contas ?? ctx.contas(terreiro);
      const faltando = contasFaltandoDe(e, terreiro);
      fileira({
        nome: 'GUIA DO TERREIRO',
        falas: acesas >= CONTAS_NA_GUIA
          ? diz('As cinco contas brilham, e a guia se abre sozinha ao seu passo.')
          : acesas === 0
            ? diz('Uma guia de cinco contas atravessa o pátio. Todas apagadas.',
                  'Cada serviço bem feito na região acende uma. Com as cinco acesas, a guia se abre.')
            : diz(`A guia tem ${acesas} de ${CONTAS_NA_GUIA} contas acesas.`,
                  `Ainda falta: ${faltando[0] ?? 'nada'}.`),
      });
    } else if (o.tipo === 'placa' && o.placa) {
      avisos.set(`${o.tx},${o.ty}`, { nome: 'PLACA', falas: diz(o.placa) });
    } else if (o.trancada) {
      const col = colunaPorta(o.larg ?? 4, o.portaCol);
      avisos.set(`${o.tx + col},${o.ty + (o.alt ?? 3) - 1}`, {
        nome: 'PORTA', falas: diz('Está trancada. Não tem ninguém em casa.'),
      });
    }
  }
  return avisos;
}
