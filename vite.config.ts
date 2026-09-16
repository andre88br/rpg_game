import { defineConfig } from 'vite';
import { resolve } from 'node:path';

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
  server: { host: true },   // acessivel pela rede local, para testar no celular
});
