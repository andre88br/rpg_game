/* =========================================================================
   O mapa do mundo.

   Cada lugar ao ar livre tem uma casinha numa grade, e as linhas entre elas
   saem das próprias saídas dos mapas — ninguém desenha estrada à mão. A
   grade corre da esquerda para a direita, na ordem em que o jogo avança; da
   Aldeia Tupã em diante, a trilha desce, porque as regiões passaram a se
   abrir para os lados.

   Interior (casa, loja, terreiro) não tem casinha: conta como o lugar ao ar
   livre de onde se entra nele (`lugarNoMundo`).

   Cada região tem o seu mapa escondido nela mesma (um item `mapa_<tipo>`);
   sem ele, o mapa do mundo mostra onde os lugares ficam, mas não a planta
   de cada um.

   Puro. Teste em mundo.test.ts.
   ========================================================================= */
import type { Tipo } from '../art/palette.ts';
import type { DefMapa } from '../world/tilemap.ts';

export interface Regiao {
  tipo: Tipo;
  nome: string;
  medalha: string;
  mapas: readonly string[];      // todos os mapas da região, de dentro e de fora
}

export const REGIOES: readonly Regiao[] = [
  { tipo: 'agua', nome: 'REGIÃO DA FOZ', medalha: 'mare',
    mapas: ['vilaAurora', 'casaTaina', 'casaFirmina', 'rotaFoz', 'portoIara', 'lojaPortoIara',
            'benzimentoPortoIara', 'terreiroPortoIara'] },
  { tipo: 'planta', nome: 'MATA DO CURUPIRA', medalha: 'raiz',
    mapas: ['igarapeCurupira', 'mataDoCurupira', 'casaEncruzilhada', 'terreiroCurupira'] },
  { tipo: 'fogo', nome: 'SERRA BOITATÁ', medalha: 'brasa',
    mapas: ['trilhaDaBrasa', 'vilaFornalha', 'lojaFornalha', 'benzimentoFornalha', 'forjaFornalha',
            'cavernaBoitata', 'cumeeiraBoitata', 'terreiroBrasaPatio', 'terreiroBrasaEscoria',
            'terreiroBrasaBreu', 'terreiroBrasaSalao'] },
  { tipo: 'vento', nome: 'CAMPO DO SACI', medalha: 'rodamoinho',
    mapas: ['campoAberto', 'ventaniaFunda', 'aldeiaCatavento', 'lojaCatavento', 'benzimentoCatavento',
            'moinhoCatavento', 'topoDoRedemoinho', 'terreiroRodamoinho'] },
  { tipo: 'raio', nome: 'ALDEIA TUPÃ', medalha: 'trovao',
    mapas: ['campinaDosRaios', 'aldeiaTupa', 'lojaTupa', 'benzimentoTupa', 'casaPaje',
            'charcoRelampejante', 'morroDoTrovao', 'terreiroTrovao'] },
  { tipo: 'terra', nome: 'MINAS DA CAIPORA', medalha: 'pedra',
    mapas: ['bocaDaMina', 'arraialCaipora', 'lojaCaipora', 'benzimentoCaipora', 'casaGarimpeiro',
            'galeriasDaMina', 'cavaFunda', 'terreiroPedra'] },
  { tipo: 'sombra', nome: 'BAIRRO DA CUCA', medalha: 'breu',
    mapas: ['ruaDoBreu', 'bairroDaCuca', 'lojaCuca', 'benzimentoCuca', 'casaCartomante',
            'becoDasRondas', 'casaraoAssombrado', 'terreiroBreu'] },
  { tipo: 'luz', nome: 'CIDADE DO SOL', medalha: 'aurora',
    mapas: ['caminhoAurora', 'cidadeDoSol', 'lojaSol', 'benzimentoSol', 'casaOraculo',
            'jardimEspelhos', 'picoAurora', 'terreiroAurora',
            // o Círculo Dourado: o torneio das oito medalhas, no meio do mundo
            'estradaDourada', 'circuloDourado', 'lojaCirculo', 'benzimentoCirculo', 'arenaDourada'] },
];

/* a casinha de cada lugar ao ar livre: [coluna, linha] numa grade 10×7.
   A Foz desce pela costa oeste, com o mar ao lado do porto; a Mata e a
   Serra atravessam o sul; o Campo do Saci sobe pelo meio; da Aldeia Tupã
   em diante as regiões se espalham para o leste; e a Cidade do Sol fecha a
   ponta sudeste, na última coluna. */
export const POSICOES: Record<string, readonly [number, number]> = {
  vilaAurora: [1, 1], rotaFoz: [1, 2], portoIara: [1, 3],
  igarapeCurupira: [1, 4], mataDoCurupira: [1, 5],
  trilhaDaBrasa: [2, 5], vilaFornalha: [3, 5], cavernaBoitata: [4, 5], cumeeiraBoitata: [5, 5],
  campoAberto: [5, 4], ventaniaFunda: [5, 3], aldeiaCatavento: [5, 2], topoDoRedemoinho: [5, 1],
  campinaDosRaios: [6, 1], aldeiaTupa: [7, 1], charcoRelampejante: [8, 1], morroDoTrovao: [7, 2],
  bocaDaMina: [7, 3], arraialCaipora: [7, 4], galeriasDaMina: [8, 4], cavaFunda: [6, 4],
  ruaDoBreu: [6, 5], bairroDaCuca: [7, 5], becoDasRondas: [7, 6],
  caminhoAurora: [8, 5], cidadeDoSol: [9, 5], picoAurora: [9, 4], jardimEspelhos: [9, 6],
  estradaDourada: [4, 2], circuloDourado: [3, 2],
};
/* onde há cidade (casinha no mapa); o resto é caminho, mata, caverna... */
export const CIDADES: ReadonlySet<string> = new Set([
  'vilaAurora', 'portoIara', 'mataDoCurupira', 'vilaFornalha', 'aldeiaCatavento',
  'aldeiaTupa', 'arraialCaipora', 'bairroDaCuca', 'cidadeDoSol', 'circuloDourado',
]);
export const COLUNAS = 10;
export const LINHAS = 7;

export function regiaoDoMapa(id: string): Regiao | null {
  return REGIOES.find((r) => r.mapas.includes(id)) ?? null;
}

/* o item de mapa de uma região: mapa_agua, mapa_planta... */
export function itemMapaDaRegiao(r: Regiao): string { return `mapa_${r.tipo}`; }

/* o lugar ao ar livre onde um mapa fica: ele mesmo, ou — para casa, loja,
   terreiro de várias salas — o primeiro lugar ao ar livre que se alcança
   seguindo as portas */
export function lugarNoMundo(id: string, mapas: Record<string, DefMapa>): string | null {
  const vistos = new Set([id]);
  const fila = [id];
  while (fila.length) {
    const atual = fila.shift()!;
    if (POSICOES[atual]) return atual;
    for (const s of mapas[atual]?.saidas ?? []) {
      if (!vistos.has(s.para)) { vistos.add(s.para); fila.push(s.para); }
    }
  }
  return null;
}

/* as estradas: pares de lugares ao ar livre ligados por alguma saída */
export function estradas(mapas: Record<string, DefMapa>): [string, string][] {
  const pares = new Set<string>();
  for (const id of Object.keys(POSICOES)) {
    for (const s of mapas[id]?.saidas ?? []) {
      if (!POSICOES[s.para] || s.para === id) continue;
      pares.add([id, s.para].sort().join('|'));
    }
  }
  return [...pares].map((p) => p.split('|') as [string, string]);
}

/* o jogador já conhece este lugar: pisou nele (flag `visitou_<id>`), já
   ganhou a medalha da região dele (save de antes das flags), ou está nele */
export function conhecido(flags: Record<string, boolean>, medalhas: readonly string[],
                          lugarAtual: string | null, id: string): boolean {
  if (id === lugarAtual || flags[`visitou_${id}`] === true) return true;
  const r = regiaoDoMapa(id);
  return r !== null && medalhas.includes(r.medalha);
}
