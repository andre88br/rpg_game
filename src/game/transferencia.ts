/* =========================================================================
   Levar a partida para outro aparelho (ou guardar uma cópia fora do
   navegador): o save vira um texto — um arquivo .json para baixar, ou um
   código para copiar e colar — e o texto volta a ser save.

   O código é o mesmo JSON do slot, em UTF-8 (o nome tem acento) e base64,
   com um prefixo que diz o que ele é. Na volta tudo passa por
   `restaurar()`, a mesma porta de entrada de qualquer save: o que não for
   reconhecido é descartado, e lixo não vira partida.

   Puro (só usa btoa/atob e TextEncoder, que o node também tem); a parte do
   navegador — baixar, copiar, escolher arquivo — mora em ui/arquivos.ts.
   ========================================================================= */
import { restaurar, serializar } from './save.ts';
import type { EstadoJogo } from './state.ts';

export const PREFIXO_CODIGO = 'ENCANTADOS1:';

/* o JSON do arquivo baixado, indentado para quem quiser abrir e olhar */
export function jsonDoSave(e: EstadoJogo): string {
  return JSON.stringify(serializar(e), null, 1);
}

export function codigoDoSave(e: EstadoJogo): string {
  const bytes = new TextEncoder().encode(JSON.stringify(serializar(e)));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return PREFIXO_CODIGO + btoa(bin);
}

/* Aceita o código (com o prefixo) ou o JSON cru do arquivo. O colar costuma
   trazer espaço e quebra de linha de brinde: no código, tudo isso some. */
export function saveDoTexto(texto: string): EstadoJogo | null {
  const t = texto.trim();
  let json: string;
  if (t.startsWith('{')) {
    json = t;
  } else {
    const semEspaco = t.replace(/\s+/g, '');
    if (!semEspaco.startsWith(PREFIXO_CODIGO)) return null;
    try {
      const bin = atob(semEspaco.slice(PREFIXO_CODIGO.length));
      json = new TextDecoder('utf-8', { fatal: true })
        .decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    } catch { return null; }
  }
  try { return restaurar(JSON.parse(json)); } catch { return null; }
}

/* encantados-taina-2026-10-02.json — sem acento nem espaço, que tem
   sistema de arquivo que não gosta */
export function nomeDoArquivo(e: EstadoJogo, agora = new Date()): string {
  const nome = e.nome.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'save';
  const dois = (n: number) => String(n).padStart(2, '0');
  const dia = `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`;
  return `encantados-${nome}-${dia}.json`;
}
