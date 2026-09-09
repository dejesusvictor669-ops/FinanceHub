const CACHE_NAME = "rendamais-v2";

const ARQUIVOS = [
    "/",
    "/index.html",
    "/landing.html",
    "/css/style.css",
    "/js/utils.js",
    "/js/storage.js",
    "/js/supabase.js",
    "/js/dashboard.js",
    "/js/gastos.js",
    "/js/cartoes.js",
    "/js/investimentos.js",
    "/js/metas.js",
    "/js/rendas.js",
    "/js/compras.js",
    "/js/graficos.js",
    "/js/relatorios.js",
    "/js/toast.js",
    "/js/tema.js",
    "/js/perfis.js",
    "/js/doacao.js",
    "/js/notificacoes.js",
    "/js/app.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ARQUIVOS).catch((err) => {
                console.warn("Cache parcial:", err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Deixa passar direto: Supabase, Google Fonts, CDNs externas
    if (
        url.hostname.includes("supabase.co") ||
        url.hostname.includes("googleapis.com") ||
        url.hostname.includes("gstatic.com") ||
        url.hostname.includes("cloudflare.com") ||
        url.hostname.includes("jsdelivr.net")
    ) {
        return;
    }

    // Cache first para arquivos locais
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).catch(() => cached);
        })
    );
});