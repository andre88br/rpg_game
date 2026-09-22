/* =========================================================================
   Falas condicionais e os serviços da região.

   Um NPC não tem "a" fala: tem uma lista de falas, e a primeira cujas
   condições batem é a que ele diz. É isso que faz o mundo lembrar de você —
   a Dona Firmina que te manda levar a carta é a mesma que depois agradece,
   sem nenhum código de cena no meio.

   Este arquivo é PURO: nada de canvas, nada de DOM, nada de Encantado sendo
   sorteado. Por isso ele tem teste de verdade em quests.test.ts.
   ========================================================================= */
import { quantidade } from '../data/items.ts';
import { curarTime, guardar, pronomeDe, type EstadoJogo } from './state.ts';
import { criar } from '../battle/encantado.ts';

/* -------------------------------------------------------------- condições

   Uma condição é uma string curta, para o conteúdo do jogo continuar sendo
   dado e não código. O vocabulário inteiro cabe aqui:

     'falou_firmina'     uma flag ligada
     '!falou_firmina'    a mesma flag desligada
     'item:carta'        tem pelo menos um desse item na mochila
     'item:patua>=3'     tem pelo menos três
     'vistos>=4'         já encontrou quatro espécies
     'capturados>=2'     já prendeu duas
     'contas>=5'         a guia do Terreiro de Água tem cinco contas acesas
     'contas:planta>=3'  o mesmo, mas na guia de outro terreiro
     'medalha:mare'      já tem essa medalha
     'dinheiro>=200'     tem esse tanto no bolso
*/
export function ligada(e: EstadoJogo, cond: string): boolean {
  if (cond.startsWith('!')) return !ligada(e, cond.slice(1));

  const corte = cond.indexOf('>=');
  const chave = corte < 0 ? cond : cond.slice(0, corte);
  const minimo = corte < 0 ? 1 : Number(cond.slice(corte + 2));

  if (chave.startsWith('item:')) return quantidade(e.mochila, chave.slice(5)) >= minimo;
  if (chave.startsWith('medalha:')) return e.medalhas.includes(chave.slice(8));
  if (chave.startsWith('contas:')) return contasAcesasDe(e, chave.slice(7)) >= minimo;
  if (chave === 'vistos') return e.vistos.length >= minimo;
  if (chave === 'capturados') return e.capturados.length >= minimo;
  if (chave === 'contas') return contasAcesas(e) >= minimo;
  if (chave === 'medalhas') return e.medalhas.length >= minimo;
  if (chave === 'dinheiro') return e.dinheiro >= minimo;
  if (chave === 'time') return e.time.length >= minimo;
  return e.flags[chave] === true;
}

function lista(v: string | readonly string[] | undefined): readonly string[] {
  if (v === undefined) return [];
  return typeof v === 'string' ? [v] : v;
}

/* ------------------------------------------------------------------ falas */

export interface Fala {
  /* todas precisam valer */
  se?: string | readonly string[];
  /* nenhuma pode valer — o mesmo que '!x' em `se`, mas lê melhor no dado */
  seNao?: string | readonly string[];
  linhas: readonly string[];
  /* o que acontece quando o jogador fecha a última página */
  liga?: string | readonly string[];
  desliga?: string | readonly string[];
  da?: { item: string; n?: number };
  pede?: { item: string; n?: number };
  paga?: number;            // entra no bolso; negativo sai
  cura?: boolean;           // benzimento
  batalha?: boolean;        // desafia com o treinador do próprio NPC
  loja?: boolean;           // abre o balcão
  escolher?: boolean;       // abre a escolha do Encantado inicial
  caixa?: boolean;          // abre a caixa da benzedeira
  medalha?: string;         // entrega a medalha do terreiro
  dom?: string;             // e o Dom de Campo que vem junto com ela
  /* entrega um Encantado pronto, direto no time (ou na caixa, se não couber) */
  encantado?: { especie: string; nivel: number };
}

export function serve(e: EstadoJogo, f: Fala): boolean {
  for (const c of lista(f.se)) if (!ligada(e, c)) return false;
  for (const c of lista(f.seNao)) if (ligada(e, c)) return false;
  return true;
}

/* a primeira fala que serve. Sem nenhuma, o NPC fica calado — por isso toda
   lista de falas termina com uma sem condição, e o teste dos mapas cobra. */
export function escolherFala(e: EstadoJogo, falas: readonly Fala[]): Fala | null {
  for (const f of falas) if (serve(e, f)) return f;
  return null;
}

/* O que a cena precisa fazer DEPOIS da conversa. A fala mexe no estado
   sozinha; só o que exige tela (batalha, loja, cura) volta daqui. */
export interface EfeitoFala {
  curou: boolean;
  batalha: boolean;
  loja: boolean;
  escolher: boolean;
  caixa: boolean;
  deu: string | null;        // item recebido, para anunciar
  levou: string | null;      // item entregue
  medalha: string | null;    // medalha conquistada agora
  encantado: string | null;  // espécie que acabou de entrar no time/caixa
}

export function aplicarFala(e: EstadoJogo, f: Fala, mochila: {
  adicionar: (id: string, n: number) => void;
  consumir: (id: string, n: number) => boolean;
}): EfeitoFala {
  const efeito: EfeitoFala = {
    curou: false, batalha: false, loja: false, escolher: false, caixa: false,
    deu: null, levou: null, medalha: null, encantado: null,
  };

  /* o pedido vem antes da entrega: quem troca uma coisa por outra não pode
     sair ganhando as duas se estiver sem o item */
  if (f.pede) {
    const n = f.pede.n ?? 1;
    if (mochila.consumir(f.pede.item, n)) efeito.levou = f.pede.item;
  }
  if (f.da) {
    const n = f.da.n ?? 1;
    mochila.adicionar(f.da.item, n);
    efeito.deu = f.da.item;
  }
  if (f.paga) e.dinheiro = Math.max(0, e.dinheiro + f.paga);
  for (const flag of lista(f.liga)) e.flags[flag] = true;
  for (const flag of lista(f.desliga)) delete e.flags[flag];
  if (f.cura) { curarTime(e); efeito.curou = true; }
  /* a medalha traz o Dom junto: são a mesma conquista vista de dois lados —
     um selo na caixinha e uma parte do mundo que abre */
  if (f.medalha && !e.medalhas.includes(f.medalha)) {
    e.medalhas.push(f.medalha);
    efeito.medalha = f.medalha;
  }
  if (f.dom) e.flags[`dom_${f.dom}`] = true;
  if (f.encantado) {
    guardar(e, criar(f.encantado.especie, f.encantado.nivel));
    efeito.encantado = f.encantado.especie;
  }
  efeito.batalha = f.batalha === true;
  efeito.loja = f.loja === true;
  efeito.escolher = f.escolher === true;
  efeito.caixa = f.caixa === true;
  return efeito;
}

/* ------------------------------------------------------------- recheio

   Uma fala pode citar o que o jogador fez sem virar codigo de cena:
   'A guia esta com {contas} de cinco contas.' O que nao for reconhecido
   fica como esta, para um `{` solto no texto nao sumir com a frase.
   `{contas:planta}`, `{faltam:planta}` e `{servico:planta}` fazem o mesmo
   para a guia de outro terreiro que nao a de agua. */
export function preencher(e: EstadoJogo, linha: string): string {
  return linha.replace(/\{([\w:]+)\}/g, (inteiro, chave: string) => {
    if (chave.startsWith('contas:')) return String(contasAcesasDe(e, chave.slice(7)));
    if (chave.startsWith('faltam:')) {
      const t = chave.slice(7);
      return String((TERREIROS[t]?.length ?? 0) - contasAcesasDe(e, t));
    }
    if (chave.startsWith('servico:')) return contasFaltandoDe(e, chave.slice(8))[0] ?? 'nada';
    switch (chave) {
      case 'nome': return e.nome;
      case 'contas': return String(contasAcesas(e));
      case 'faltam': return String(CONTAS.length - contasAcesas(e));
      case 'servico': return contasFaltando(e)[0] ?? 'nada';
      case 'vistos': return String(e.vistos.length);
      case 'capturados': return String(e.capturados.length);
      case 'dinheiro': return String(e.dinheiro);
      case 'medalhas': return String(e.medalhas.length);
      /* concordância de gênero: quem escolheu Bento não quer ouvir "menina" */
      case 'crianca': return pronomeDe(e) === 'ele' ? 'menino' : 'menina';
      case 'caida': return pronomeDe(e) === 'ele' ? 'caído' : 'caída';
      default: return inteiro;
    }
  });
}

/* ------------------------------------------------------ as cinco contas

   Cada terreiro tem seu próprio colar de cinco contas — uma por região, na
   chave do próprio tipo ('agua', 'planta', ...). Cada serviço bem feito na
   região acende uma conta do SEU terreiro; com as cinco acesas a guia se
   abre. A ordem de cada lista é a ordem em que as contas aparecem no colar. */
export interface Conta { flag: string; servico: string }

export const TERREIROS: Record<string, readonly Conta[]> = {
  agua: [
    { flag: 'conta_recado', servico: 'o recado da Dona Firmina' },
    { flag: 'conta_estrada', servico: 'o desafio do Zeca, na estrada' },
    { flag: 'conta_caderno', servico: 'o caderno do Contador de Bichos' },
    { flag: 'conta_redes', servico: 'as redes do Mestre do Porto' },
    { flag: 'conta_farol', servico: 'o bicho que mora no farol' },
  ],
  planta: [
    { flag: 'conta_recado_mata', servico: 'a carta da Dona Firmina para a Tiê' },
    { flag: 'conta_zeca_mata', servico: 'o Zeca, de novo, no igarapé' },
    { flag: 'conta_pegadas', servico: 'o caderno de pegadas do Seu Elias' },
    { flag: 'conta_mudas', servico: 'as mudas do viveiro, sumidas com as Caiporinhas' },
    { flag: 'conta_grota', servico: 'o Curupira que mora na grota funda' },
  ],
  fogo: [
    { flag: 'conta_tropa', servico: 'os quatro tropeiros da Trilha da Brasa' },
    { flag: 'conta_fole', servico: 'os cinco carvões da Caverna do Boitatá, para o Ferreiro' },
    { flag: 'conta_patua', servico: 'seis Encantados presos em patuá, para o Mestre Patueiro' },
    { flag: 'conta_breu', servico: 'o desmoronamento no breu da caverna' },
    { flag: 'conta_mula', servico: 'a Mula-sem-Cabeça que corre a cumeeira' },
  ],
  vento: [
    { flag: 'conta_catadores', servico: 'os quatro catadores de vento do Campo Aberto' },
    { flag: 'conta_ventania', servico: 'a travessia da Ventania Funda' },
    { flag: 'conta_penas', servico: 'seis Encantados presos, para a Prendedora de Ventos' },
    { flag: 'conta_catavento', servico: 'as cinco penas de vento, para o Moleiro' },
    { flag: 'conta_redemoinho', servico: 'a Matinta que mora no olho do redemoinho' },
  ],
  raio: [
    { flag: 'conta_tambores', servico: 'os quatro tocadores de tambor da Campina dos Raios' },
    { flag: 'conta_zeca5', servico: 'o Zeca, pela quinta vez, na subida do Morro do Trovão' },
    { flag: 'conta_pedras_raio', servico: 'as cinco pedras-de-raio, para o Pajé' },
    { flag: 'conta_para_raios', servico: 'as chaves de para-raio do Charco Relampejante' },
    { flag: 'conta_trovao', servico: 'o Relampo que mora no cume do Morro do Trovão' },
  ],
};

/* os dois serviços da Serra Boitatá que NÃO seguram a guia: rendem item raro
   e (o segundo) um Encantado exclusivo, mas o terreiro abre sem eles */
export interface ServicoOpcional { flag: string; servico: string }
export const SERVICOS_OPCIONAIS: readonly ServicoOpcional[] = [
  { flag: 'servico_sinos', servico: 'os três sinos de bronze da capela da serra' },
  { flag: 'servico_maeDoOuro', servico: 'a Mãe-do-Ouro, no fundo do breu' },
  { flag: 'servico_capim', servico: 'os três punhados de capim dourado do Campo do Saci' },
  { flag: 'servico_uirapuru', servico: 'o Uirapuru, no moinho' },
  { flag: 'servico_penas_trovao', servico: 'as três penas de trovão, para a Tecelã da Aldeia Tupã' },
  { flag: 'servico_arco', servico: 'o Arco-da-Velha, atrás do casarão do Charco' },
];

/* compatibilidade: o terreiro de água foi o primeiro, e boa parte do
   conteúdo da Região da Foz cita CONTAS/contasAcesas/contasFaltando direto,
   sem passar terreiro — sempre falando da guia de água. */
export const CONTAS: readonly Conta[] = TERREIROS['agua']!;

export function contasAcesasDe(e: EstadoJogo, terreiro: string): number {
  return (TERREIROS[terreiro] ?? []).filter((c) => e.flags[c.flag] === true).length;
}

export function contasFaltandoDe(e: EstadoJogo, terreiro: string): string[] {
  return (TERREIROS[terreiro] ?? []).filter((c) => e.flags[c.flag] !== true).map((c) => c.servico);
}

export function contasAcesas(e: EstadoJogo): number { return contasAcesasDe(e, 'agua'); }

/* o que ainda falta, em palavras, para a guia e para o guarda do largo */
export function contasFaltando(e: EstadoJogo): string[] { return contasFaltandoDe(e, 'agua'); }

/* qual terreiro mostrar no menu de pausa: o primeiro cuja guia ainda não
   abriu. Com todos abertos, o último — a tela sempre tem algo pra mostrar. */
export function terreiroEmAberto(e: EstadoJogo): string {
  const ids = Object.keys(TERREIROS);
  return ids.find((id) => contasAcesasDe(e, id) < (TERREIROS[id]?.length ?? 0))
      ?? ids[ids.length - 1]!;
}

/* de qual terreiro é uma conta, pela flag que ela acende — é assim que a
   cena do mundo descobre qual guia cortar a câmera para mostrar, sem
   precisar comparar contagem de antes/depois (que quebraria com dois
   terreiros abertos ao mesmo tempo). */
export function terreiroDaConta(flag: string): string | null {
  for (const [id, lista] of Object.entries(TERREIROS)) {
    if (lista.some((c) => c.flag === flag)) return id;
  }
  return null;
}
