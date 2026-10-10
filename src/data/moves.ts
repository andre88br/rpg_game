/* =========================================================================
   Golpes.

   Cada golpe é só um punhado de números; toda a interpretação deles fica em
   battle/damage.ts e battle/engine.ts. Assim dá para balancear o jogo inteiro
   mexendo só neste arquivo.

   categoria  fisico   usa ATQ do atacante contra DEF do alvo
              especial usa ESP do atacante contra ESP do alvo
              estado   não tira HP: só aplica efeito

   precisao   0 significa "nunca erra"

   Os golpes próprios (Fogo de Mboitatá, Abraço do Fundo, Uivo da Lua Cheia...)
   moram na seção do tipo deles; quem pode aprender cada um é o teste de
   moves.test.ts que confere (PROPRIOS).
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
  /* bate várias vezes no mesmo turno: sorteia entre min e max (2 a 5);
     cada pancada rola o próprio dano e o próprio crítico */
  multi?: readonly [number, number];
  /* depois de acertar, quem usou perde a vez seguinte recuperando o fôlego */
  recarga?: boolean;
  /* fecha o corpo: o golpe do adversário neste turno não pega. Usado dois
     turnos seguidos, falha. Vem com prioridade alta, para sair antes. */
  protege?: boolean;
  /* tira sempre o mesmo tanto, sem tipo e sem crítico: 'nivel' = o nível
     de quem usou */
  danoFixo?: 'nivel';
  /* potência dobrada se o alvo já estiver com estado alterado */
  dobraSeStatus?: boolean;
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
    'Passa as unhas de raspão. Pega mais fácil no ponto fraco.',
    { efeito: { critico: 12 } }),
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

  g('fecha_corpo', 'Fecha-Corpo', 'neutro', 'estado', 0, 0, 10,
    'Reza que fecha o corpo: o golpe do outro não pega. Seguido, falha.',
    { prioridade: 4, efeito: { protege: true } }),
  g('bicadas', 'Bicadas', 'neutro', 'fisico', 18, 100, 20,
    'Bica de duas a cinco vezes sem parar.',
    { efeito: { multi: [2, 5] } }),
  g('pisao', 'Pisão', 'neutro', 'fisico', 80, 100, 15,
    'Pisa com todo o peso em cima do oponente.'),
  g('grito', 'Grito de Guerra', 'neutro', 'estado', 0, 0, 15,
    'Solta um grito que dá coragem e força dobrada.',
    { efeito: { mod: { alvo: 'proprio', stat: 'atq', passos: 2 } } }),
  g('pilao', 'Pilão', 'neutro', 'fisico', 100, 100, 10,
    'Desce como mão de pilão: forte, mas sempre por último.',
    { prioridade: -1 }),
  g('arremetida', 'Arremetida', 'neutro', 'fisico', 120, 90, 5,
    'Se joga com tudo e depois precisa de um turno para levantar.',
    { efeito: { recarga: true } }),

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

  g('coice_brasa', 'Coice de Brasa', 'fogo', 'fisico', 55, 100, 20,
    'Um coice com o casco em brasa.',
    { efeito: { status: 'queimado', chanceStatus: 10 } }),
  g('fornalha', 'Fornalha', 'fogo', 'estado', 0, 0, 15,
    'Atiça o fogo de dentro até a mágica ferver.',
    { efeito: { mod: { alvo: 'proprio', stat: 'esp', passos: 2 } } }),
  g('brasa_viva', 'Brasa Viva', 'fogo', 'especial', 50, 100, 15,
    'Brasa que pega mais em quem já está mal: dobra contra estado alterado.',
    { efeito: { dobraSeStatus: true } }),
  g('chuva_brasas', 'Chuva de Brasas', 'fogo', 'especial', 20, 95, 20,
    'Cai brasa de duas a cinco vezes.',
    { efeito: { multi: [2, 5] } }),
  g('fogo_mboitata', 'Fogo de Mboitatá', 'fogo', 'especial', 130, 90, 5,
    'A grande cobra de fogo em pessoa. O tranco devolve um pouco do golpe.',
    { efeito: { recuo: 0.25, status: 'queimado', chanceStatus: 20 } }),
  g('coice_mula', 'Coice da Mula', 'fogo', 'fisico', 110, 90, 5,
    'O coice em chamas da Mula-sem-Cabeça; o tranco volta um pouco.',
    { efeito: { recuo: 0.25, status: 'queimado', chanceStatus: 20 } }),
  g('cidade_ouro', 'Cidade de Ouro', 'fogo', 'especial', 110, 95, 5,
    'O brilho do Eldorado inteiro de uma vez, ouro em fogo.',
    { efeito: { mod: { alvo: 'proprio', stat: 'esp', passos: 1, chance: 30 } } }),

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

  g('cachoeira', 'Cachoeira', 'agua', 'fisico', 80, 100, 15,
    'Despenca como queda d\'água; quem leva fica zonzo.',
    { efeito: { feitico: 20 } }),
  g('agua_cheiro', 'Água de Cheiro', 'agua', 'estado', 0, 0, 10,
    'Banho de ervas cheirosas que fecha metade das feridas.',
    { efeito: { curar: 0.5 } }),
  g('correnteza', 'Correnteza', 'agua', 'especial', 60, 100, 15,
    'Puxa o oponente rio abaixo e ele perde o passo.',
    { efeito: { mod: { alvo: 'oponente', stat: 'vel', passos: -1, chance: 30 } } }),
  g('pingos', 'Pingos', 'agua', 'especial', 20, 100, 20,
    'Gotas certeiras, de duas a cinco.',
    { efeito: { multi: [2, 5] } }),
  g('abraco_fundo', 'Abraço do Fundo', 'agua', 'fisico', 100, 90, 5,
    'O Ipupiara puxa para o fundo e bebe o fôlego de quem afunda.',
    { efeito: { dreno: 0.35 } }),

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

  g('espinhos', 'Espinhos', 'planta', 'fisico', 25, 100, 20,
    'Atira espinhos de duas a cinco vezes.',
    { efeito: { multi: [2, 5] } }),
  g('seiva_amarga', 'Seiva Amarga', 'planta', 'especial', 55, 100, 15,
    'Seiva que arde em ferida aberta: dobra contra estado alterado.',
    { efeito: { dobraSeStatus: true } }),
  g('polen', 'Pólen', 'planta', 'estado', 0, 75, 10,
    'Uma nuvem de pólen que dá sono pesado.',
    { efeito: { status: 'dormindo' } }),
  g('tronco', 'Tronco', 'planta', 'fisico', 85, 95, 10,
    'Derruba um tronco inteiro em cima do oponente.'),
  g('furia_anhanga', 'Fúria do Anhangá', 'planta', 'especial', 120, 90, 5,
    'O protetor da caça em fúria. O tranco devolve um pouco do golpe.',
    { efeito: { recuo: 0.25 } }),

  /* ---------------- terra ---------------- */
  g('pedrada', 'Pedrada', 'terra', 'fisico', 45, 95, 25,
    'Atira uma pedra bem escolhida.'),
  g('areia', 'Areia nos Olhos', 'terra', 'estado', 0, 100, 20,
    'Joga terra na cara e bagunça a defesa.',
    { efeito: { mod: { alvo: 'oponente', stat: 'def', passos: -1 } } }),
  g('tremor', 'Tremor', 'terra', 'especial', 70, 100, 10,
    'Faz o chão inteiro estremecer.'),
  g('desmoronamento', 'Desmoronamento', 'terra', 'fisico', 90, 85, 5,
    'Derruba o barranco em cima do oponente. Às vezes amassa a defesa dele.',
    { efeito: { mod: { alvo: 'oponente', stat: 'def', passos: -1, chance: 30 } } }),

  g('pedrinhas', 'Chuva de Pedrinhas', 'terra', 'fisico', 25, 95, 20,
    'Pedrinhas atiradas de duas a cinco vezes.',
    { efeito: { multi: [2, 5] } }),
  g('entocar', 'Entocar', 'terra', 'estado', 0, 0, 15,
    'Se enfia na toca e endurece o couro.',
    { efeito: { mod: { alvo: 'proprio', stat: 'def', passos: 2 } } }),
  g('terremoto', 'Terremoto', 'terra', 'fisico', 100, 100, 10,
    'O chão inteiro se abre debaixo do oponente.'),
  g('bocarra', 'Bocarra', 'terra', 'fisico', 120, 90, 5,
    'A boca na barriga do Mapinguari se abre. O tranco devolve um pouco do golpe.',
    { efeito: { recuo: 0.25 } }),

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

  g('penas', 'Penas', 'vento', 'especial', 20, 100, 20,
    'Penas afiadas no vento, de duas a cinco.',
    { efeito: { multi: [2, 5] } }),
  g('assobio', 'Assobio', 'vento', 'estado', 0, 0, 15,
    'Assobia e o vento empurra pelas costas.',
    { efeito: { mod: { alvo: 'proprio', stat: 'vel', passos: 2 } } }),
  g('furacao', 'Furacão', 'vento', 'especial', 110, 70, 5,
    'Um furacão inteiro, difícil de mirar.'),
  g('rasante', 'Rasante', 'vento', 'fisico', 75, 100, 15,
    'Desce rente ao chão e acerta onde dói.',
    { efeito: { critico: 8 } }),
  g('rodamoinho_saci', 'Rodamoinho do Saci', 'vento', 'especial', 100, 95, 5,
    'O Saci vira redemoinho e passa por cima: quem sai, sai tonto.',
    { efeito: { feitico: 30 } }),
  g('canto_uirapuru', 'Canto do Uirapuru', 'vento', 'especial', 95, 100, 5,
    'Quando o Uirapuru canta, a mata para para ouvir — e ele bebe o encanto.',
    { efeito: { dreno: 0.5 } }),

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
  g('raio_tupa', 'Raio de Tupã', 'raio', 'especial', 95, 90, 10,
    'Chama o raio do céu, como manda a lenda.',
    { efeito: { status: 'paralisado', chanceStatus: 20 } }),

  g('faiscas', 'Faíscas', 'raio', 'especial', 20, 100, 20,
    'Faíscas pulando de duas a cinco vezes.',
    { efeito: { multi: [2, 5] } }),
  g('carregar', 'Carregar', 'raio', 'estado', 0, 0, 15,
    'Junta a carga da tempestade no corpo.',
    { efeito: { mod: { alvo: 'proprio', stat: 'esp', passos: 2 } } }),
  g('risco', 'Risco', 'raio', 'fisico', 40, 100, 30,
    'Um risco de luz: sai antes de todo mundo.',
    { prioridade: 1 }),
  g('trovao_seco', 'Trovão Seco', 'raio', 'especial', 85, 100, 10,
    'Estala sem chuva, direto na cabeça.',
    { efeito: { status: 'paralisado', chanceStatus: 10 } }),
  g('boiuna_eletrica', 'Boiúna Elétrica', 'raio', 'especial', 120, 90, 5,
    'A cobra grande do rio, carregada de raio. O tranco devolve um pouco do golpe.',
    { efeito: { recuo: 0.25, status: 'paralisado', chanceStatus: 20 } }),

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

  g('assombracao', 'Assombração', 'sombra', 'especial', 0, 100, 15,
    'Aparece de repente: tira sempre o tanto do nível de quem assombra.',
    { efeito: { danoFixo: 'nivel' } }),
  g('mau_sonho', 'Mau Sonho', 'sombra', 'especial', 60, 100, 15,
    'Entra no sonho de quem já está mal: dobra contra estado alterado.',
    { efeito: { dobraSeStatus: true } }),
  g('arrepio', 'Arrepio', 'sombra', 'estado', 0, 100, 15,
    'Um frio na espinha que derruba a guarda inteira.',
    { efeito: { mod: { alvo: 'oponente', stat: 'def', passos: -2 } } }),
  g('unhas_noite', 'Unhas da Noite', 'sombra', 'fisico', 20, 100, 20,
    'Unhadas no escuro, de duas a cinco.',
    { efeito: { multi: [2, 5] } }),
  g('uivo_lua', 'Uivo da Lua Cheia', 'sombra', 'fisico', 120, 90, 5,
    'Na lua cheia o Lobisomem não se segura. O tranco devolve um pouco do golpe.',
    { efeito: { recuo: 0.25 } }),
  g('acalanto_cuca', 'Acalanto da Cuca', 'sombra', 'especial', 80, 100, 5,
    '"Dorme, neném, que a Cuca vem pegar." E vem mesmo.',
    { efeito: { status: 'dormindo', chanceStatus: 30 } }),

  /* ---------------- luz ---------------- */
  g('clarao', 'Clarão', 'luz', 'especial', 45, 100, 25,
    'Um brilho súbito na cara do oponente.'),
  g('benzecao', 'Benzeção', 'luz', 'estado', 0, 0, 10,
    'Reza de benzedeira: fecha metade das feridas.',
    { efeito: { curar: 0.5 } }),
  g('lampejo', 'Lampejo', 'luz', 'especial', 70, 95, 15,
    'Um facho que ofusca e atrapalha a mágica do oponente.',
    { efeito: { mod: { alvo: 'oponente', stat: 'esp', passos: -1, chance: 15 } } }),
  g('aurora', 'Aurora', 'luz', 'especial', 95, 100, 10,
    'O nascer do sol condensado num golpe só.'),

  g('raios_sol', 'Raios de Sol', 'luz', 'especial', 20, 100, 20,
    'Raios curtos, de dois a cinco.',
    { efeito: { multi: [2, 5] } }),
  g('prece', 'Prece', 'luz', 'estado', 0, 0, 15,
    'Uma reza baixinha que fecha a guarda.',
    { efeito: { mod: { alvo: 'proprio', stat: 'def', passos: 2 } } }),
  g('feixe', 'Feixe', 'luz', 'especial', 80, 100, 15,
    'Um feixe reto de luz pura.'),
  g('sol_a_pino', 'Sol a Pino', 'luz', 'especial', 120, 80, 5,
    'O sol do meio-dia num golpe só; difícil de mirar.'),
  g('eclipse_total', 'Eclipse Total', 'luz', 'especial', 130, 90, 5,
    'Sol e lua no mesmo lugar do céu. O tranco devolve um pouco do golpe.',
    { efeito: { recuo: 0.25 } }),

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
