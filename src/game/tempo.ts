/* =========================================================================
   A hora do dia e o tempo que faz.

   O período vem do relógio do aparelho; o clima é sorteado ao chegar numa
   região (Foz e Mata chovem, o Campo venta, Tupã troveja, o Bairro tem
   neblina). Os dois mexem em quem aparece no mato e, um pouco, na força dos
   golpes. Tudo aqui é puro: os testes passam a data e o sorteio.
   ========================================================================= */
import type { Aleatorio } from '../core/rng.ts';
import type { Tipo, TipoGolpe } from '../art/palette.ts';
import type { FaixaEncontro } from '../battle/encantado.ts';

export type Periodo = 'manha' | 'dia' | 'tarde' | 'noite';
export type Clima = 'limpo' | 'chuva' | 'ventania' | 'tempestade' | 'neblina';

/* deslocamento de teste: `jogo.hora(22)` no navegador faz a noite chegar */
let horaFixa: number | null = null;
export function fixarHora(h: number | null): void { horaFixa = h; }

export function periodo(d: Date = new Date()): Periodo {
  const h = horaFixa ?? d.getHours();
  if (h >= 6 && h < 10) return 'manha';
  if (h >= 10 && h < 16) return 'dia';
  if (h >= 16 && h < 18) return 'tarde';
  return 'noite';
}

export function ehNoite(d: Date = new Date()): boolean { return periodo(d) === 'noite'; }

export const NOME_PERIODO: Record<Periodo, string> = {
  manha: 'MANHÃ', dia: 'DIA', tarde: 'TARDE', noite: 'NOITE',
};
export const NOME_CLIMA: Record<Clima, string> = {
  limpo: 'CÉU LIMPO', chuva: 'CHUVA', ventania: 'VENTANIA', tempestade: 'TEMPESTADE', neblina: 'NEBLINA',
};

/* ------------------------------------------------------------------ clima */

/* o tempo possível de cada região (pelo tipo dela) e a chance de virar */
export const CLIMA_DA_REGIAO: Partial<Record<Tipo, { clima: Clima; chance: number }>> = {
  agua: { clima: 'chuva', chance: 30 },
  planta: { clima: 'chuva', chance: 35 },
  vento: { clima: 'ventania', chance: 35 },
  raio: { clima: 'tempestade', chance: 35 },
  sombra: { clima: 'neblina', chance: 40 },
};

export function sortearClima(tipoRegiao: Tipo | null, rnd: Aleatorio): Clima {
  const c = tipoRegiao ? CLIMA_DA_REGIAO[tipoRegiao] : undefined;
  return c && rnd.chance(c.chance) ? c.clima : 'limpo';
}

/* a frase da abertura da luta */
export const FRASE_CLIMA: Record<Clima, string | null> = {
  limpo: null,
  chuva: 'Está chovendo.',
  ventania: 'Venta forte.',
  tempestade: 'Uma tempestade ronca no céu.',
  neblina: 'A neblina cobre tudo.',
};

/* o clima na força do golpe: a chuva molha a brasa, o trovão carrega o raio */
export function fatorClima(tipo: TipoGolpe, clima: Clima): number {
  switch (clima) {
    case 'chuva': return tipo === 'agua' ? 1.2 : tipo === 'fogo' ? 0.8 : 1;
    case 'tempestade': return tipo === 'raio' ? 1.2 : tipo === 'agua' ? 1.1 : 1;
    case 'ventania': return tipo === 'vento' ? 1.2 : 1;
    case 'neblina': return tipo === 'sombra' ? 1.2 : 1;
    default: return 1;
  }
}

/* -------------------------------------------------------------- encontros */

/* quem sai de noite e quem só aparece com sol */
export const HORARIO: Readonly<Record<string, 'dia' | 'noite'>> = {
  lobinho: 'noite', lobisomem: 'noite', matinta: 'noite', matintaPerera: 'noite',
  cuca: 'noite', corpoSeco: 'noite', almaPenada: 'noite', pisadeira: 'noite',
  lamparina: 'noite',
  luzeiro: 'dia', estrelaDalva: 'dia', uirapuru: 'dia', maeDoOuro: 'dia',
};

/* quem gosta de cada tempo */
export const CLIMA_FAVORITO: Readonly<Record<string, Clima>> = {
  iarinha: 'chuva', piragua: 'chuva', minhoquinha: 'chuva',
  sacizinho: 'ventania', matinta: 'ventania',
  faisquinha: 'tempestade', tatuTrovao: 'tempestade',
  pisadeira: 'neblina', cuca: 'neblina',
};

export const FORA_DE_HORA = 0.2;
export const NA_HORA = 3;
export const NO_CLIMA = 2;

/* a tabela do mato com os pesos do momento. Fora de hora pesa pouco, mas
   nunca zero: nenhum mapa fica sem encontro e nenhuma conta fica impossível.
   O `quando`/`clima` da própria faixa vence a tabela por espécie. */
export function tabelaDoMomento(tabela: readonly FaixaEncontro[], p: Periodo,
                                clima: Clima): FaixaEncontro[] {
  const noite = p === 'noite';
  return tabela.map((f) => {
    let peso = f.peso;
    const quando = f.quando ?? HORARIO[f.especie];
    if (quando) peso *= (quando === 'noite') === noite ? NA_HORA : FORA_DE_HORA;
    const gosta = f.clima ?? CLIMA_FAVORITO[f.especie];
    if (gosta && gosta === clima) peso *= NO_CLIMA;
    return { ...f, peso };
  });
}
