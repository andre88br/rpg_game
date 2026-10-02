/* =========================================================================
   Golpes fora do nível: o que o Rezador faz lembrar e o que uma Cantiga
   ensina. Puro — as telas (scenes/rezador.ts e o menu) só mostram e chamam.
   ========================================================================= */
import { ESPECIES, especie } from '../data/creatures.ts';
import { item } from '../data/items.ts';
import { MAX_GOLPES, novoGolpe, substituirGolpe, type Encantado } from '../battle/encantado.ts';

/* quanto o Rezador cobra para fazer lembrar um golpe */
export const PRECO_REZA = 800;

/* a espécie e todas as formas de antes dela (quem evolui para ela, e quem
   evolui para essa...), da mais nova para a mais antiga */
function linhagem(idEspecie: string): string[] {
  const linha = [idEspecie];
  for (let atual = idEspecie; ;) {
    const antes = Object.values(ESPECIES).find((e) => e.evolui?.em === atual);
    if (!antes || linha.includes(antes.id)) return linha;
    linha.push(antes.id);
    atual = antes.id;
  }
}

/* Tudo que ele já teria aprendido até o nível de agora — na forma atual ou
   numa de antes — e não sabe mais. Sem repetir, na ordem do nível. */
export function relembraveis(e: Encantado): string[] {
  const sabe = new Set(e.golpes.map((g) => g.id));
  const achados: { nv: number; golpe: string }[] = [];
  for (const id of linhagem(e.especie)) {
    for (const a of especie(id).aprende) {
      if (a.nv > e.nivel || sabe.has(a.golpe)) continue;
      if (achados.some((x) => x.golpe === a.golpe)) continue;
      achados.push(a);
    }
  }
  return achados.sort((a, b) => a.nv - b.nv).map((a) => a.golpe);
}

export type Compatibilidade = 'pode' | 'nao' | 'ja';

/* `idItem` precisa ser uma cantiga; qualquer outro item dá 'nao' */
export function compatibilidade(e: Encantado, idItem: string): Compatibilidade {
  const ef = item(idItem).efeito;
  if (ef.k !== 'cantiga') return 'nao';
  if (e.golpes.some((g) => g.id === ef.golpe)) return 'ja';
  if (ef.tipos === 'todos') return 'pode';
  const tipos = especie(e.especie).tipos;
  return tipos.some((t) => (ef.tipos as readonly string[]).includes(t)) ? 'pode' : 'nao';
}

/* Ensina `golpe`. Com vaga, entra no fim; sem vaga, toma o lugar do golpe
   no índice `substituir` (sem índice e sem vaga, não ensina). Devolve se
   ensinou. */
export function ensinar(e: Encantado, golpe: string, substituir?: number): boolean {
  if (e.golpes.some((g) => g.id === golpe)) return false;
  if (e.golpes.length < MAX_GOLPES) { e.golpes.push(novoGolpe(golpe)); return true; }
  if (substituir === undefined || substituir < 0 || substituir >= e.golpes.length) return false;
  substituirGolpe(e, substituir, golpe);
  return true;
}
