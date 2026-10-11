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
    /* o maior pacote é o próprio three.js (~520 kB minificado, uns 130 kB
       com gzip), que não dá para partir; o resto fica bem abaixo disto */
    chunkSizeWarningLimit: 540,
    target: 'es2022',
    rollupOptions: {
      input: {
        principal: resolve(__dirname, 'index.html'),
        esbocos: resolve(__dirname, 'esbocos.html'),
      },
      output: {
        /* Pacotes que mudam pouco ficam à parte, com hash próprio: uma
           publicação que só mexe no código do jogo não faz o celular baixar
           de novo o three.js (o motor 3D) nem as grades dos mapas — o service
           worker e o navegador reaproveitam o que já têm. */
        manualChunks(id: string) {
          if (id.includes('/node_modules/three/')) return 'three';
          if (id.includes('/src/data/mapas/')) return 'mapas';
          return undefined;
        },
      },
    },
  },
  plugins: [serviceWorker()],
  server: { host: true },   // acessivel pela rede local, para testar no celular
});
