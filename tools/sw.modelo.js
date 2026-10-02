/* =========================================================================
   Service worker do Encantados — gerado no build a partir deste modelo
   (plugin `serviceWorker` em vite.config.ts). __ARQUIVOS__ vira a lista do
   que foi para dist/, e __VERSAO__ um hash dessa lista: cada publicação
   ganha um cache novo, e o da anterior é apagado ao ativar.

   - A página (navegação) vem da REDE primeiro, sem o cache HTTP do Pages
     (que guarda o index.html por dez minutos e apontaria para .js que já
     não existem); sem internet, cai na cópia guardada.
   - Todo o resto tem hash no nome e nunca muda: vem do cache, que foi
     enchido inteiro na instalação — inclusive a vista 3D. Assim o jogo
     abre offline depois da primeira visita.
   ========================================================================= */
const VERSAO = '__VERSAO__';
const CACHE = `encantados-${VERSAO}`;
const ARQUIVOS = __ARQUIVOS__;

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', ...ARQUIVOS])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes
        .filter((n) => n.startsWith('encantados-') && n !== CACHE)
        .map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // só a página do jogo é guardada: a de esboços não pode tomar o lugar dela
    const doJogo = /\/(index\.html)?$/.test(new URL(req.url).pathname);
    ev.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((resp) => {
          if (resp.ok && doJogo) {
            const copia = resp.clone();
            void caches.open(CACHE).then((c) => c.put('./', copia));
          }
          return resp;
        })
        .catch(() => caches.match('./').then((r) => r ?? Response.error())),
    );
    return;
  }

  ev.respondWith(caches.match(req).then((r) => r ?? fetch(req)));
});
