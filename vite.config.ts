import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import { resolve, relative, join } from 'node:path';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

/* Escreve dist/sw.js a partir de tools/sw.modelo.js, com a lista de tudo
   que o build produziu (para o jogo abrir sem internet) e uma versão que
   muda junto com essa lista. A página de esboços fica de fora. */
function serviceWorker(): Plugin {
  let cfg: ResolvedConfig;
  return {
    name: 'encantados-service-worker',
    apply: 'build',
    configResolved(c) { cfg = c; },
    closeBundle() {
      const dist = resolve(cfg.root, cfg.build.outDir);
      const todos = (dir: string): string[] => readdirSync(dir).flatMap((n) => {
        const p = join(dir, n);
        return statSync(p).isDirectory() ? todos(p) : [p];
      });
      const arquivos = todos(dist)
        .map((p) => relative(dist, p).split('\\').join('/'))
        .filter((f) => f !== 'sw.js' && !/(^|\/)esbocos[.-]/.test(f))
        .sort();
      const versao = createHash('sha256').update(arquivos.join('\n')).digest('hex').slice(0, 12);
      const modelo = readFileSync(resolve(cfg.root, 'tools/sw.modelo.js'), 'utf8');
      const lista = JSON.stringify(arquivos.map((f) => `./${f}`));
      writeFileSync(join(dist, 'sw.js'), modelo
        .replace("'__VERSAO__'", `'${versao}'`)
        .replace('__ARQUIVOS__;', `${lista};`));
    },
  };
}

export default defineConfig({
  // caminho relativo: o build funciona em qualquer subdiretorio (GitHub Pages incluso)
  base: './',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        principal: resolve(__dirname, 'index.html'),
        esbocos: resolve(__dirname, 'esbocos.html'),
      },
    },
  },
  plugins: [serviceWorker()],
  server: { host: true },   // acessivel pela rede local, para testar no celular
});
