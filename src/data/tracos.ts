/* =========================================================================
   Traços: o jeito de ser de cada espécie, que age sozinho na batalha.

   Cada linha de evolução divide o mesmo traço. Como os golpes, um traço é só
   uma ficha de dados — o motor (battle/engine.ts) lê os campos que existirem
   e age no gancho certo:

     aoEntrar     ao entrar em campo, mexe num atributo do adversário
     forca        multiplica o dano que ELE causa (com condição opcional)
     couro        multiplica o dano que ELE recebe de uma categoria
     absorve      golpe daquele tipo não machuca: cura
     semCritico   não leva acerto em cheio
     criticoExtra acerta em cheio mais vezes
     contato      quem bate nele com golpe físico pode sair castigado
     fimDoTurno   regenera, ou castiga o adversário que dorme
     imune / semQuebranto / semRecuo
     miraTorta    o adversário erra mais
     captura      melhora o patuá enquanto ele está em campo
     fugaCerta    a fuga nunca falha
     achado       vencer um selvagem com ele em campo pode render um item

   "Contato" é golpe físico: o jogo não tem outra marca de contato.
   ========================================================================= */
import type { Tipo, TipoGolpe } from '../art/palette.ts';
import type { ChaveStat } from './moves.ts';
import type { Status } from '../battle/status.ts';

export interface Traco {
  id: string;
  nome: string;
  descricao: string;
  aoEntrar?: { stat: ChaveStat; passos: number };
  forca?: {
    fator: number;
    tipo?: TipoGolpe;
    hpAbaixo?: number;        // fração do HP máximo
    noite?: boolean;          // só à noite
    dia?: boolean;            // só de dia
    alvoDormindo?: boolean;
  }[];
  couro?: { fator: number; categoria: 'fisico' | 'especial' };
  absorve?: { tipo: Tipo; cura: number };
  semCritico?: boolean;
  criticoExtra?: number;      // pontos percentuais somados à chance
  contato?: { chance: number; status?: Status; feitico?: boolean };
  fimDoTurno?: { cura?: number; pesadelo?: number };
  imune?: readonly Status[] | 'todos';
  semQuebranto?: boolean;
  semRecuo?: boolean;
  miraTorta?: number;         // multiplica a precisão de quem mira nele
  captura?: number;
  fugaCerta?: boolean;
  achado?: { chance: number; itens: readonly string[] };
}

const LISTA: readonly Traco[] = [
  { id: 'chama_viva', nome: 'Chama Viva',
    descricao: 'Com o fôlego por um fio, o fogo dele queima 50% mais.',
    forca: [{ fator: 1.5, tipo: 'fogo', hpAbaixo: 1 / 3 }] },
  { id: 'canto_iara', nome: 'Canto da Iara',
    descricao: 'Quem bate nele de perto pode pegar no sono.',
    contato: { chance: 30, status: 'dormindo' } },
  { id: 'pes_trocados', nome: 'Pés Trocados',
    descricao: 'O rastro ao contrário confunde: o adversário erra mais.',
    miraTorta: 0.85 },
  { id: 'agua_funda', nome: 'Água Funda',
    descricao: 'Golpe de água não machuca: mata a sede e cura.',
    absorve: { tipo: 'agua', cura: 1 / 4 } },
  { id: 'rodamoinho', nome: 'Rodamoinho',
    descricao: 'Vencendo um selvagem, às vezes acha um item no redemoinho.',
    achado: { chance: 25, itens: ['garrafada', 'patua', 'erva_doce'] } },
  { id: 'dona_da_mata', nome: 'Dona da Mata',
    descricao: 'Com ele em campo, o bicho do mato aceita o patuá mais fácil.',
    captura: 1.5 },
  { id: 'cabecuda', nome: 'Cabeçuda',
    descricao: 'Bate com tudo e não se machuca com o tranco.',
    semRecuo: true },
  { id: 'sem_cabeca', nome: 'Sem Cabeça',
    descricao: 'Sem cabeça não tem mau-olhado: não pega quebranto.',
    semQuebranto: true },
  { id: 'carbunculo', nome: 'Carbúnculo',
    descricao: 'A pedra da testa mostra o ponto fraco: acerta em cheio mais.',
    criticoExtra: 12 },
  { id: 'pele_de_ouro', nome: 'Pele de Ouro',
    descricao: 'Peçonha escorre no ouro e não entra.',
    imune: ['envenenado'] },
  { id: 'agouro', nome: 'Agouro',
    descricao: 'Ao chegar, o assovio dela baixa o ataque do adversário.',
    aoEntrar: { stat: 'atq', passos: -1 } },
  { id: 'canto_que_cura', nome: 'Canto que Cura',
    descricao: 'Canta no fim de cada turno e recupera um pouco de fôlego.',
    fimDoTurno: { cura: 1 / 16 } },
  { id: 'pele_eletrica', nome: 'Pele Elétrica',
    descricao: 'Quem bate nele de perto pode ficar travado.',
    contato: { chance: 30, status: 'paralisado' } },
  { id: 'carapaca', nome: 'Carapaça',
    descricao: 'O casco não deixa acertar em cheio.',
    semCritico: true },
  { id: 'sete_cores', nome: 'Sete Cores',
    descricao: 'Nenhum estado alterado pega nas sete cores.',
    imune: 'todos' },
  { id: 'cavador', nome: 'Cavador',
    descricao: 'Some num buraco: a fuga nunca falha.',
    fugaCerta: true },
  { id: 'couro_grosso', nome: 'Couro Grosso',
    descricao: 'Pancada física machuca 25% menos.',
    couro: { fator: 0.75, categoria: 'fisico' } },
  { id: 'lua_cheia', nome: 'Lua Cheia',
    descricao: 'À noite, bate 30% mais forte.',
    forca: [{ fator: 1.3, noite: true }] },
  { id: 'assombrado', nome: 'Assombrado',
    descricao: 'Quem bate nele de perto pode pegar quebranto.',
    contato: { chance: 30, feitico: true } },
  { id: 'acalanto', nome: 'Acalanto',
    descricao: 'Bate 50% mais forte em quem está dormindo.',
    forca: [{ fator: 1.5, alvoDormindo: true }] },
  { id: 'peso_no_peito', nome: 'Peso no Peito',
    descricao: 'No fim do turno, o adversário que dorme perde fôlego.',
    fimDoTurno: { pesadelo: 1 / 8 } },
  { id: 'vigia', nome: 'Vigia',
    descricao: 'Fica de vigia a noite toda: não pega no sono.',
    imune: ['dormindo'] },
  { id: 'fogo_brando', nome: 'Fogo Brando',
    descricao: 'Quem bate nele de perto pode se queimar.',
    contato: { chance: 30, status: 'queimado' } },
  { id: 'encanto_do_boto', nome: 'Encanto do Boto',
    descricao: 'Ao chegar, encanta quem está do outro lado: o poder dele cai.',
    aoEntrar: { stat: 'esp', passos: -1 } },
  { id: 'fases_da_lua', nome: 'Fases da Lua',
    descricao: 'De dia, a luz bate 20% mais; à noite, a sombra.',
    forca: [{ fator: 1.2, tipo: 'luz', dia: true }, { fator: 1.2, tipo: 'sombra', noite: true }] },
];

const POR_ID = new Map(LISTA.map((t) => [t.id, t]));

export function traco(id: string): Traco {
  const t = POR_ID.get(id);
  if (!t) throw new Error(`traço desconhecido: ${id}`);
  return t;
}

export const TRACOS_ORDEM: readonly string[] = LISTA.map((t) => t.id);

/* o traço de cada espécie (as linhas de evolução dividem o mesmo). Mora
   aqui, e não na ficha da espécie, para o traço ficar todo num lugar só. */
export const TRACO_DA_ESPECIE: Readonly<Record<string, string>> = {
  boitatinha: 'chama_viva', boitatao: 'chama_viva', mboitata: 'chama_viva',
  iarinha: 'canto_iara', iaraMae: 'canto_iara', ipupiara: 'canto_iara',
  curupinho: 'pes_trocados', curupira: 'pes_trocados', anhanga: 'pes_trocados',
  piragua: 'agua_funda', piraguacu: 'agua_funda',
  sacizinho: 'rodamoinho', saci: 'rodamoinho',
  caiporinha: 'dona_da_mata', caipora: 'dona_da_mata',
  cabritinha: 'cabecuda', cabraCabriola: 'cabecuda',
  mulinha: 'sem_cabeca', mulaSemCabeca: 'sem_cabeca',
  salamanca: 'carbunculo', teiniagua: 'carbunculo',
  maeDoOuro: 'pele_de_ouro', eldorado: 'pele_de_ouro',
  matinta: 'agouro', matintaPerera: 'agouro',
  uirapuru: 'canto_que_cura', uirapuruRei: 'canto_que_cura',
  faisquinha: 'pele_eletrica', relampo: 'pele_eletrica',
  tatuTrovao: 'carapaca', tatuacu: 'carapaca',
  arcoDaVelha: 'sete_cores', boiuna: 'sete_cores',
  minhoquinha: 'cavador', minhocao: 'cavador',
  mapinguari: 'couro_grosso', juma: 'couro_grosso',
  lobinho: 'lua_cheia', lobisomem: 'lua_cheia',
  corpoSeco: 'assombrado', almaPenada: 'assombrado',
  cuca: 'acalanto', cucaRainha: 'acalanto',
  pisadeira: 'peso_no_peito', pesadelo: 'peso_no_peito',
  luzeiro: 'vigia', estrelaDalva: 'vigia',
  lamparina: 'fogo_brando', fogoFatuo: 'fogo_brando',
  jaci: 'fases_da_lua', eclipse: 'fases_da_lua',
  boto: 'encanto_do_boto', botoEncantado: 'encanto_do_boto',
};

export function tracoDaEspecie(especie: string): Traco {
  const id = TRACO_DA_ESPECIE[especie];
  if (!id) throw new Error(`espécie sem traço: ${especie}`);
  return traco(id);
}
