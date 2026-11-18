console.log("carregou: atalhos.js");

// ======================================
// ATALHOS DO IPHONE (links profundos)
// Ex.: https://seu-app/?acao=gasto&valor=25,90&descricao=Padaria
// O app só PREENCHE o formulário. Quem confirma é você, tocando em Adicionar.
// ======================================

const URL_PUBLICA_APP = "https://finance-hub-private.vercel.app";
const CHAVE_ATALHO = "renda_atalho";
const CATEGORIAS_ATALHO = ["moradia", "contas", "mercado", "lazer", "cartao", "outros"];
const TIPOS_APORTE = ["reserva", "investimento"];

const MAPA_ATALHO = {
    gasto:   { pagina: "gastos",        campos: { descricao: "gastoDescricao",  valor: "gastoValor",      categoria: "gastoCategoria" } },
    renda:   { pagina: "entradas",      campos: { descricao: "rendaDescricao",  valor: "rendaValor" } },
    cartao:  { pagina: "cartoes",       campos: { descricao: "cartaoDescricao", valor: "cartaoValor" } },
    aporte:  { pagina: "investimentos", campos: { descricao: "investDescricao", valor: "investValor",     tipo: "investTipo" } },
    meta:    { pagina: "metas",         campos: { descricao: "metaNome",        valor: "metaValorAlvo" } },
    compra:  { pagina: "compras",       campos: { descricao: "nomeLista" } },
    saldo:   { pagina: "visao-geral" },
    relatorios: { pagina: "graficos" },
    calculadora: { pagina: "visao-geral", especial: "calculadora" }
};

const LISTA_ATALHOS = [
    { acao: "gasto",   titulo: "Registrar gasto",    icone: "fa-receipt",        desc: "Abre Gastos com valor, descrição e categoria preenchidos.", extra: "&valor=25,90&descricao=Padaria&categoria=mercado" },
    { acao: "renda",   titulo: "Nova renda extra",   icone: "fa-sack-dollar",    desc: "Abre Entradas pronta para anotar uma renda extra.",         extra: "&valor=150&descricao=Freelance" },
    { acao: "cartao",  titulo: "Compra no cartão",   icone: "fa-credit-card",    desc: "Abre Cartões com a compra preenchida.",                     extra: "&valor=89,90&descricao=Camiseta" },
    { acao: "aporte",  titulo: "Novo aporte",        icone: "fa-seedling",       desc: "Abre Investimentos (tipo: reserva ou investimento).",       extra: "&valor=200&descricao=Tesouro Selic&tipo=reserva" },
    { acao: "meta",    titulo: "Nova meta",          icone: "fa-bullseye",       desc: "Abre Metas com o nome e o valor alvo.",                     extra: "&descricao=Viagem&valor=3000" },
    { acao: "compra",  titulo: "Lista de compras",   icone: "fa-cart-shopping",  desc: "Abre Lista de Compras para criar uma nova lista.",          extra: "&descricao=Mercado da semana" },
    { acao: "saldo",   titulo: "Ver meu saldo",      icone: "fa-wallet",         desc: "Abre a Visão Geral." },
    { acao: "relatorios", titulo: "Relatórios",      icone: "fa-chart-pie",      desc: "Abre os relatórios e gráficos." },
    { acao: "calculadora", titulo: "Calculadora",    icone: "fa-calculator",     desc: "Abre a calculadora do app." }
];

// ----- Chave secreta: só links com a SUA chave salvam sozinhos -----
const CHAVE_SECRETA = "renda_atalho_chave";
const ACOES_AUTOMATICAS = ["gasto", "renda", "cartao", "aporte"];

function obterChaveAtalho() {
    try { return localStorage.getItem(CHAVE_SECRETA) || ""; } catch (e) { return ""; }
}

function gerarChaveAtalho() {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    const chave = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    try { localStorage.setItem(CHAVE_SECRETA, chave); } catch (e) { return ""; }
    return chave;
}

function atalhoTexto(valor) {
    return String(valor ?? "").replace(/[\u0000-\u001F\u007F<>]/g, "").trim().slice(0, 100);
}

function atalhoValor(bruto) {
    let s = String(bruto ?? "").replace(/R\$|\s/gi, "");
    if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "");
    s = s.replace(",", ".");
    const n = parseFloat(s);
    if (!Number.isFinite(n) || n <= 0 || n >= 1e9) return "";
    return String(Math.round(n * 100) / 100);
}

// Lê ?acao=... da URL, guarda e limpa só os nossos parâmetros
function capturarAtalhoDaURL() {
    try {
        const p = new URLSearchParams(location.search);
        const acao = p.get("acao");
        if (!acao || !MAPA_ATALHO[acao]) return;
        const dados = { acao, t: Date.now() };
        for (const k of ["valor", "descricao", "categoria", "tipo", "chave"]) {
            if (p.has(k)) dados[k] = p.get(k);
        }
        sessionStorage.setItem(CHAVE_ATALHO, JSON.stringify(dados));
        ["acao", "valor", "descricao", "categoria", "tipo", "chave"].forEach((k) => p.delete(k));
        const resto = p.toString();
        history.replaceState(null, "", location.pathname + (resto ? "?" + resto : "") + location.hash);
    } catch (e) {
        // sem sessionStorage: o atalho simplesmente não é aplicado
    }
}

async function aplicarAtalhoPendente() {
    let dados = null;
    try { dados = JSON.parse(sessionStorage.getItem(CHAVE_ATALHO) || "null"); } catch (e) { dados = null; }
    try { sessionStorage.removeItem(CHAVE_ATALHO); } catch (e) { /* ignora */ }
    if (!dados || Date.now() - dados.t > 15 * 60 * 1000) return;

    const cfg = MAPA_ATALHO[dados.acao];
    if (!cfg) return;

    mostrarPagina(cfg.pagina);
    if (cfg.especial === "calculadora") {
        setTimeout(() => abrirCalculadora(), 350);
        return;
    }
    if (!cfg.campos) return;

    // espera a página terminar de renderizar antes de preencher
    await new Promise((r) => setTimeout(r, 550));

    let preenchidos = 0;
    let primeiroVazio = null;
    for (const [param, id] of Object.entries(cfg.campos)) {
        const campo = document.getElementById(id);
        if (!campo) continue;
        let valor = "";
        if (dados[param] !== undefined) {
            if (param === "valor") valor = atalhoValor(dados[param]);
            else if (param === "categoria") valor = CATEGORIAS_ATALHO.includes(dados[param]) ? dados[param] : "";
            else if (param === "tipo") valor = TIPOS_APORTE.includes(dados[param]) ? dados[param] : "";
            else valor = atalhoTexto(dados[param]);
        }
        if (valor) {
            campo.value = valor;
            campo.dispatchEvent(new Event("input", { bubbles: true }));
            preenchidos++;
        } else if (!primeiroVazio && campo.tagName !== "SELECT") {
            primeiroVazio = campo;
        }
    }

    const formulario = document.getElementById(Object.values(cfg.campos)[0])?.closest("form");
    const cartao = formulario?.closest(".card");
    formulario?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (cartao) {
        cartao.classList.add("atalho-destaque");
        setTimeout(() => cartao.classList.remove("atalho-destaque"), 3000);
    }
    // Modo automático: chave correta + ação de registro + valor e descrição presentes
    const minhaChave = obterChaveAtalho();
    const chaveOk = !!dados.chave && !!minhaChave && dados.chave === minhaChave;
    const completo = cfg.campos.descricao && cfg.campos.valor &&
        document.getElementById(cfg.campos.descricao)?.value &&
        document.getElementById(cfg.campos.valor)?.value;
    if (chaveOk && ACOES_AUTOMATICAS.includes(dados.acao) && completo && formulario) {
        formulario.requestSubmit();
        if (typeof toastSucesso === "function") toastSucesso("Registrado automaticamente pelo atalho.");
        return;
    }
    if (dados.chave && !chaveOk && typeof toastErro === "function") {
        toastErro("Chave do atalho inválida. Copie o link de novo na página Atalhos.");
    }
    primeiroVazio?.focus({ preventScroll: true });

    if (typeof toastInfo === "function" && !(dados.chave && !chaveOk)) {
        toastInfo(preenchidos > 0
            ? "Atalho aplicado: confira os dados e toque em Adicionar."
            : "Atalho aberto: preencha os dados e toque em Adicionar.");
    }
}

// ----- Página "Atalhos": lista de links prontos -----

function baseUrlAtalhos() {
    return /^(localhost|127\.|\[::1\])/.test(location.hostname) ? URL_PUBLICA_APP : location.origin;
}

async function copiarTexto(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch (e) {
        const area = document.createElement("textarea");
        area.value = texto;
        area.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(area);
        area.select();
        let ok = false;
        try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
        area.remove();
        return ok;
    }
}

function renderizarAtalhos() {
    const lista = document.getElementById("listaAtalhos");
    if (!lista) return;
    const base = baseUrlAtalhos();
    lista.textContent = "";

    const chave = obterChaveAtalho() || gerarChaveAtalho();

    const aviso = document.createElement("div");
    aviso.className = "atalho-dica";
    aviso.style.gridColumn = "1 / -1";
    aviso.style.margin = "0";
    const avisoIco = document.createElement("i");
    avisoIco.className = "fa-solid fa-key";
    const avisoTxt = document.createElement("div");
    avisoTxt.innerHTML = "<strong>Modo automático:</strong> os links de gasto, renda, cartão e aporte já levam sua chave secreta e <em>salvam sozinhos</em>, sem tocar em Adicionar. " +
        "Não compartilhe esses links. Abra esta página no mesmo navegador em que o atalho abre o app (Safari). ";
    const novaChave = document.createElement("button");
    novaChave.type = "button";
    novaChave.className = "btn btn-secundario atalho-btn";
    novaChave.style.marginTop = "10px";
    novaChave.innerHTML = '<i class="fa-solid fa-rotate"></i> Gerar nova chave';
    novaChave.addEventListener("click", () => {
        gerarChaveAtalho();
        renderizarAtalhos();
        toastSucesso("Nova chave gerada. Copie os links de novo no atalho.");
    });
    avisoTxt.appendChild(novaChave);
    aviso.append(avisoIco, avisoTxt);
    lista.appendChild(aviso);

    LISTA_ATALHOS.forEach((a) => {
        const linkBasico = `${base}/?acao=${a.acao}`;
        const sufixoChave = ACOES_AUTOMATICAS.includes(a.acao) ? `&chave=${chave}` : "";
        const linkExemplo = linkBasico + (a.extra || "") + sufixoChave;

        const item = document.createElement("div");
        item.className = "atalho-item";

        const topo = document.createElement("div");
        topo.className = "atalho-topo";
        const ico = document.createElement("span");
        ico.className = "destino-ico";
        const i = document.createElement("i");
        i.className = "fa-solid " + a.icone;
        ico.appendChild(i);
        const txt = document.createElement("div");
        txt.className = "atalho-txt";
        const t = document.createElement("strong");
        t.textContent = a.titulo;
        const d = document.createElement("small");
        d.textContent = a.desc;
        txt.append(t, d);
        topo.append(ico, txt);

        const codigo = document.createElement("code");
        codigo.className = "atalho-link";
        codigo.textContent = linkExemplo;

        const acoes = document.createElement("div");
        acoes.className = "atalho-acoes";

        const copiar = document.createElement("button");
        copiar.type = "button";
        copiar.className = "btn btn-secundario atalho-btn";
        copiar.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar link';
        copiar.addEventListener("click", async () => {
            const ok = await copiarTexto(linkExemplo);
            if (ok) toastSucesso("Link copiado!");
            else toastErro("Não consegui copiar. Segure sobre o link e copie.");
        });

        const testar = document.createElement("button");
        testar.type = "button";
        testar.className = "btn atalho-btn";
        testar.innerHTML = '<i class="fa-solid fa-play"></i> Testar agora';
        testar.addEventListener("click", () => {
            location.href = `${location.pathname}?acao=${a.acao}${a.extra || ""}`;
        });

        acoes.append(copiar, testar);
        item.append(topo, codigo, acoes);
        lista.appendChild(item);
    });
}

capturarAtalhoDaURL();
