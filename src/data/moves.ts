/* =========================================================================
   Golpes.

   Cada golpe é só um punhado de números; toda a interpretação deles fica em
   battle/damage.ts e battle/engine.ts. Assim dá para balancear o jogo inteiro
   mexendo só neste arquivo.

   categoria  fisico   usa ATQ do atacante contra DEF do alvo
              especial usa ESP do atacante contra ESP do alvo
              estado   não tira HP: só aplica efeito

   precisao   0 significa "nunca erra"
   ========================================================================= */
import type { TipoGolpe } from '../art/palette.ts';
import type { Status } from '../battle/status.ts';

export type Categoria = 'fisico' | 'especial' | 'estado';
export type ChaveStat = 'atq' | 'def' | 'esp' | 'vel';

export interface ModStat {
  alvo: 'proprio' | 'oponente';
  stat: ChaveStat;
  passos: number;       // -2 a +2
  chance?: number;      // % ; ausente = sempre (golpes de estado)
}

export interface Efeito {
  status?: Status;
  chanceStatus?: number;   // % ; ausente num golpe de estado = 100
  feitico?: number;        // % de deixar enfeitiçado
  mod?: ModStat;
  dreno?: number;          // fração do dano causado que vira cura
  recuo?: number;          // fração do dano causado que volta como dano
  curar?: number;          // fração do HP máximo curada em si mesmo
  critico?: number;        // pontos percentuais somados à chance de crítico
}

export interface Golpe {
  id: string;
  nome: string;
  tipo: TipoGolpe;
  categoria: Categoria;
  pot: number;
  precisao: number;
  pp: number;
  prioridade?: number;
  efeito?: Efeito;
  descricao: string;
}

function g(
  id: string, nome: string, tipo: TipoGolpe, categoria: Categoria,
  pot: number, precisao: number, pp: number, descricao: string,
  extra: Partial<Golpe> = {},
): Golpe {
  return { id, nome, tipo, categoria, pot, precisao, pp, descricao, ...extra };
}

const LISTA: readonly Golpe[] = [
  /* ---------------- comuns: qualquer Encantado aprende ---------------- */
  g('investida', 'Investida', 'neutro', 'fisico', 40, 100, 30,
    'Corre e joga o corpo em cima do oponente.'),
  g('arranhao', 'Arranhão', 'neutro', 'fisico', 40, 100, 30,
    'Passa as unhas de raspão.'),
  g('bote', 'Bote', 'neutro', 'fisico', 30, 100, 30,
    'Ataque curto e veloz: sempre sai primeiro.',
    { prioridade: 1 }),
  g('encarada', 'Encarada', 'neutro', 'estado', 0, 100, 20,
    'Encara feio até o oponente baixar a guarda.',
    { efeito: { mod: { alvo: 'oponente', stat: 'def', passos: -1 } } }),
  g('folego', 'Tomar Fôlego', 'neutro', 'estado', 0, 0, 10,
    'Respira fundo e recupera metade do fôlego.',
    { efeito: { curar: 0.5 } }),
  g('rosnado', 'Rosnado', 'neutro', 'estado', 0, 100, 20,
    'Rosna para intimidar e enfraquecer a pancada do oponente.',
    { efeito: { mod: { alvo: 'oponente', stat: 'atq', passos: -1 } } }),
  g('afiar', 'Afiar as Garras', 'neutro', 'estado', 0, 0, 20,
    'Amola as garras e bate mais forte.',
    { efeito: { mod: { alvo: 'proprio', stat: 'atq', passos: 1 } } }),

  /* ---------------- fogo ---------------- */
  g('brasa', 'Brasa', 'fogo', 'especial', 40, 100, 25,
    'Cospe uma brasa que às vezes queima.',
    { efeito: { status: 'queimado', chanceStatus: 10 } }),
  g('labareda', 'Labareda', 'fogo', 'especial', 65, 95, 15,
    'Solta uma língua de fogo comprida.',
    { efeito: { status: 'queimado', chanceStatus: 15 } }),
  g('rabo_brasa', 'Rabo de Brasa', 'fogo', 'fisico', 70, 95, 15,
    'Chicoteia com o rabo em chamas.'),
  g('fogo_fatuo', 'Fogo-Fátuo', 'fogo', 'estado', 0, 85, 10,
    'Solta uma chama fria que queima sem falha.',
    { efeito: { status: 'queimado' } }),
  g('clarao_boitata', 'Clarão de Boitatá', 'fogo', 'especial', 95, 90, 5,
    'A cobra de fogo do folclore em pessoa: um facho que cega e queima.',
    { efeito: { status: 'queimado', chanceStatus: 20 } }),

  /* ---------------- água ---------------- */
  g('jato_agua', "Jato d'Água", 'agua', 'especial', 40, 100, 25,
    'Um esguicho certeiro de água doce.'),
  g('bolha', 'Bolha', 'agua', 'especial', 35, 100, 30,
    'Bolhas que estouram e atrapalham o passo.',
    { efeito: { mod: { alvo: 'oponente', stat: 'vel', passos: -1, chance: 20 } } }),
  g('mare_cheia', 'Maré Cheia', 'agua', 'especial', 70, 95, 15,
    'Levanta a maré em cima do oponente.'),
  g('canto_iara', "Canto d'Iara", 'agua', 'estado', 0, 70, 10,
    'O canto da Iara: quem escuta, dorme.',
    { efeito: { status: 'dormindo' } }),
  g('tromba_agua', "Tromba d'Água", 'agua', 'especial', 95, 85, 5,
    'Uma coluna de água que arrasta tudo.'),

  /* ---------------- planta ---------------- */
  g('folha_afiada', 'Folha Afiada', 'planta', 'fisico', 45, 100, 25,
    'Folhas duras cortando de lado.',
    { efeito: { critico: 8 } }),
  g('cipo', 'Chicote de Cipó', 'planta', 'fisico', 45, 100, 25,
    'Estala um cipó como chicote.'),
  g('raiz_sugadora', 'Raiz Sugadora', 'planta', 'especial', 40, 100, 15,
    'Enfia raízes no chão e bebe a energia do oponente.',
    { efeito: { dreno: 0.5 } }),
  g('esporo', 'Esporo do Mato', 'planta', 'estado', 0, 75, 10,
    'Espalha esporos que envenenam devagarinho.',
    { efeito: { status: 'envenenado' } }),
  g('tempestade_verde', 'Tempestade Verde', 'planta', 'especial', 90, 90, 5,
    'A mata inteira se fecha em cima do oponente.'),

  /* ---------------- terra ---------------- */
  g('pedrada', 'Pedrada', 'terra', 'fisico', 45, 95, 25,
    'Atira uma pedra bem escolhida.'),
  g('areia', 'Areia nos Olhos', 'terra', 'estado', 0, 100, 20,
    'Joga terra na cara e bagunça a defesa.',
    { efeito: { mod: { alvo: 'oponente', stat: 'def', passos: -1 } } }),
  g('tremor', 'Tremor', 'terra', 'especial', 70, 100, 10,
    'Faz o chão inteiro estremecer.'),
  g('desmoronamento', 'Desmoronamento', 'terra', 'fisico', 90, 85, 5,
    'Derruba o barranco em cima do oponente.'),

  /* ---------------- vento ---------------- */
  g('rajada', 'Rajada', 'vento', 'especial', 45, 100, 25,
    'Um sopro seco e cortante.'),
  g('pe_de_vento', 'Pé de Vento', 'vento', 'fisico', 40, 100, 30,
    'Passa voando antes que o outro reaja.',
    { prioridade: 1 }),
  g('redemoinho', 'Redemoinho', 'vento', 'especial', 70, 95, 15,
    'O rodamoinho do Saci: quem entra, sai tonto.',
    { efeito: { feitico: 20 } }),
  g('vendaval', 'Vendaval', 'vento', 'especial', 95, 85, 5,
    'Vento de tempestade, daqueles que arrancam telhado.'),

  /* ---------------- raio ---------------- */
  g('faisca', 'Faísca', 'raio', 'especial', 45, 100, 25,
    'Uma fagulha elétrica curta.',
    { efeito: { status: 'paralisado', chanceStatus: 10 } }),
  g('trovoada', 'Trovoada', 'raio', 'especial', 70, 95, 15,
    'Estouro de trovão em cima do oponente.',
    { efeito: { status: 'paralisado', chanceStatus: 15 } }),
  g('teia_eletrica', 'Teia Elétrica', 'raio', 'estado', 0, 90, 15,
    'Prende o oponente numa rede de faíscas.',
    { efeito: { status: 'paralisado' } }),
  g('raio_tupa', 'Raio de Tupã', 'raio', 'especial', 95, 80, 5,
    'Chama o raio do céu, como manda a lenda.',
    { efeito: { status: 'paralisado', chanceStatus: 20 } }),

  /* ---------------- sombra ---------------- */
  g('sombra_fria', 'Sombra Fria', 'sombra', 'especial', 45, 100, 25,
    'A sombra do oponente esfria e morde.'),
  g('mau_olhado', 'Mau-Olhado', 'sombra', 'estado', 0, 85, 10,
    'Olhar carregado que deixa qualquer um enfeitiçado.',
    { efeito: { feitico: 100 } }),
  g('garra_cuca', 'Garra da Cuca', 'sombra', 'fisico', 70, 95, 15,
    'Unhas compridas saindo do escuro.'),
  g('breu', 'Breu Total', 'sombra', 'especial', 95, 85, 5,
    'Apaga toda a luz em volta e ataca no escuro.'),

  /* ---------------- luz ---------------- */
  g('clarao', 'Clarão', 'luz', 'especial', 45, 100, 25,
    'Um brilho súbito na cara do oponente.'),
  g('benzecao', 'Benzeção', 'luz', 'estado', 0, 0, 10,
    'Reza de benzedeira: fecha metade das feridas.',
    { efeito: { curar: 0.5 } }),
  g('lampejo', 'Lampejo', 'luz', 'especial', 70, 95, 15,
    'Um facho que ofusca e atrapalha a mágica do oponente.',
    { efeito: { mod: { alvo: 'oponente', stat: 'esp', passos: -1, chance: 15 } } }),
  g('aurora', 'Aurora', 'luz', 'especial', 95, 85, 5,
    'O nascer do sol condensado num golpe só.'),

  /* Último recurso: entra sozinho quando TODOS os PP acabam. Não está em
     nenhuma lista de aprendizado de propósito. */
  g('esforco', 'Esforço', 'neutro', 'fisico', 50, 100, 1,
    'Ataca com o que sobrou, e se machuca no processo.',
    { efeito: { recuo: 0.25 } }),
];

export const GOLPES: Record<string, Golpe> =
  Object.fromEntries(LISTA.map((m) => [m.id, m]));

export function golpe(id: string): Golpe {
  const m = GOLPES[id];
  if (!m) throw new Error(`golpe desconhecido: ${id}`);
  return m;
}

export const GOLPES_ORDEM: readonly string[] = LISTA.map((m) => m.id);
