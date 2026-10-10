/* =========================================================================
   Service worker do Encantados — gerado no build a partir deste modelo
   (plugin `serviceWorker` em vite.config.ts). __ARQUIVOS__ vira a lista do
   que foi para dist/, e __VERSAO__ um hash dessa lista: cada publicação
   ganha um cache novo. Ao ativar, fica também o da publicação anterior
   (uma aba ainda aberta nela pode pedir a vista 3D, que só baixa quando
   se precisa); o resto é apagado.

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

const ORDEM = 'encantados-ordem';

self.addEventListener('install', (ev) => {
  // `reload`: nada de pegar do cache HTTP do Pages um index.html de antes,
  // que apontaria para .js que esta versão não tem (e abriria em tela preta)
  const pedidos = ['./', ...ARQUIVOS].map((u) => new Request(u, { cache: 'reload' }));
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(pedidos)).then(() => self.skipWaiting()));
});

/* a ordem das versões instaladas, guardada num cache à parte */
async function versoes() {
  const r = await (await caches.open(ORDEM)).match('./ordem');
  try { return r ? await r.json() : []; } catch { return []; }
}

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    let lista = await versoes();
    // o primeiro service worker com a lista: o que já estava guardado é a anterior
    if (!lista.length) lista = (await caches.keys()).filter((n) => n.startsWith('encantados-') && n !== ORDEM);
    lista = lista.filter((v) => v !== CACHE);
    lista.push(CACHE);
    const ficam = lista.slice(-2);              // esta e a anterior
    await (await caches.open(ORDEM)).put('./ordem', new Response(JSON.stringify(ficam)));
    const nomes = await caches.keys();
    await Promise.all(nomes
      .filter((n) => n.startsWith('encantados-') && n !== ORDEM && !ficam.includes(n))
      .map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
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
