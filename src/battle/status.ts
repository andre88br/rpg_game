/* =========================================================================
   Estados alterados.

   Um Encantado carrega no máximo UM estado persistente (queimado, paralisado,
   dormindo ou envenenado) — ele só sai com item, cura ou evolução. Além dele
   pode carregar o "enfeitiçado", que é passageiro: conta os turnos e some
   sozinho, e por isso não ocupa a vaga do estado persistente.
   ========================================================================= */

export type Status = 'queimado' | 'paralisado' | 'dormindo' | 'envenenado';

export interface InfoStatus {
  sigla: string;       // etiqueta de 3 letras mostrada no painel de HP
  nome: string;
  aoReceber: string;   // "{nome} " + isto
  aoSofrer: string | null;   // mensagem do dano por turno, ou null
  aoSair: string;
}

/* As siglas são a etiqueta de três letras que aparece no painel, no lugar do
   rótulo VIDA. Vêm do vocabulário do folclore: brasa, peçonha (veneno de
   bicho), travado, sono e quebranto (o mau-olhado). */
export const STATUS: Record<Status, InfoStatus> = {
  queimado: {
    sigla: 'BRA', nome: 'em brasa',
    aoReceber: 'se queimou!',
    aoSofrer: 'sofre com a brasa!',
    aoSair: 'apagou a brasa.',
  },
  paralisado: {
    sigla: 'TRA', nome: 'travado',
    aoReceber: 'ficou travado!',
    aoSofrer: null,
    aoSair: 'se destravou.',
  },
  dormindo: {
    sigla: 'SON', nome: 'no sono',
    aoReceber: 'pegou no sono!',
    aoSofrer: null,
    aoSair: 'acordou!',
  },
  envenenado: {
    sigla: 'PEÇ', nome: 'com peçonha',
    aoReceber: 'tomou peçonha!',
    aoSofrer: 'sofre com a peçonha!',
    aoSair: 'botou a peçonha pra fora.',
  },
};

/* O quebranto (o "enfeitiçado") é passageiro e não ocupa a vaga dos outros,
   então mora fora da tabela — mas usa a mesma etiqueta no painel. */
export const SIGLA_QUEBRANTO = 'QUE';

/* dano de fim de turno, em fração do HP máximo */
export const DANO_POR_TURNO: Partial<Record<Status, number>> = {
  queimado: 1 / 16,
  envenenado: 1 / 16,
};

/* queimadura também enfraquece a pancada física */
export const FATOR_ATAQUE_QUEIMADO = 0.5;
/* paralisia deixa lento e às vezes trava o turno */
export const FATOR_VELOCIDADE_PARALISADO = 0.5;
export const CHANCE_TRAVAR_PARALISADO = 25;
/* enfeitiçado: chance de se acertar sozinho, e potência dessa pancada */
export const CHANCE_AUTO_GOLPE = 50;
export const POTENCIA_AUTO_GOLPE = 40;

export const TURNOS_SONO: [number, number] = [1, 3];
export const TURNOS_FEITICO: [number, number] = [2, 4];
