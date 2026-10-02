/* =========================================================================
   A ponte com o navegador para levar o save para fora e trazer de volta:
   baixar um arquivo, copiar um texto, escolher um arquivo, colar um texto.

   O jogo é todo desenhado num canvas e não tem campo de texto; aqui usamos
   o que o próprio navegador oferece (o seletor de arquivo, a caixinha do
   `prompt`). Baixar, copiar e abrir o seletor exigem um gesto de quem joga:
   as teclas são lidas no laço do jogo poucos milissegundos depois do toque,
   ainda dentro da janela que o navegador concede.

   Só no navegador — nada aqui roda nos testes do node.
   ========================================================================= */

export function baixar(nome: string, texto: string): boolean {
  try {
    const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return true;
  } catch { return false; }
}

/* Copia para a área de transferência. Sem permissão (ou sem a API, como em
   página fora de https), mostra o texto numa caixinha para copiar à mão.
   Devolve se COPIOU de fato. */
export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    window.prompt('Copie o código abaixo:', texto);
    return false;
  }
}

/* Abre o seletor de arquivo e devolve o texto do arquivo escolhido, ou null
   se a pessoa desistiu. O `cancel` não existe em todo navegador: sem ele,
   a promessa simplesmente nunca resolve, e o jogo segue esperando o A. */
export function escolherArquivo(): Promise<string | null> {
  return new Promise((resolver) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt,application/json,text/plain';
    input.addEventListener('change', () => {
      const f = input.files?.[0];
      if (!f) { resolver(null); return; }
      f.text().then(resolver, () => resolver(null));
    });
    input.addEventListener('cancel', () => resolver(null));
    input.click();
  });
}

export function pedirTexto(mensagem: string): string | null {
  try { return window.prompt(mensagem); } catch { return null; }
}
