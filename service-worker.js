const CACHE_NAME = "financehub-v10";

const ARQUIVOS = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/utils.js",
    "/js/storage.js",
    "/js/toast.js",
    "/js/calculadora.js",
    "/js/supabase.js",
    "/assets/supabase.js",
    "/assets/chart.umd.min.js",
    "/js/tema.js",
    "/js/perfis.js",
    "/js/dashboard.js",
    "/js/gastos.js",
    "/js/cartoes.js",
    "/js/investimentos.js",
    "/js/metas.js",
    "/js/rendas.js",
    "/js/compras.js",
    "/js/graficos.js",
    "/js/relatorios.js",
    "/js/doacao.js",
    "/js/notificaçoes.js",
    "/js/app.js"
];

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request).catch(() =>
            caches.match(event.request)
        )
    );
});

// ======================================
// NOTIFICAÇÕES PUSH
// ======================================

self.addEventListener("push", (event) => {
    const dados = event.data ? event.data.json() : {};
    event.waitUntil(
        self.registration.showNotification(dados.titulo || "FinanceHub", {
            body: dados.mensagem || ""
        })
    );
});