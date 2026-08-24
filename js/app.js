console.log("carregou: app.js");

const telaLogin = document.getElementById("telaLogin");
const appContainer = document.getElementById("appContainer");

async function inicializar() {
    iniciarTema();
    const logado = await verificarSessao();
    if (logado) {
        mostrarApp();
    } else {
        mostrarTelaLogin();
    }
}

function mostrarTelaLogin() {
    telaLogin.classList.remove("hidden");
    appContainer.classList.add("hidden");
}

function mostrarApp() {
    telaLogin.classList.add("hidden");
    appContainer.classList.remove("hidden");
    iniciarApp();
}

// ======================================
// AUTH
// ======================================

const formLogin = document.getElementById("formLogin");
const formCadastro = document.getElementById("formCadastro");
const linkParaCadastro = document.getElementById("linkParaCadastro");
const linkParaLogin = document.getElementById("linkParaLogin");
const linkEsqueceuSenha = document.getElementById("linkEsqueceuSenha");

linkParaCadastro.addEventListener("click", (e) => {
    e.preventDefault();
    formLogin.classList.add("hidden");
    formCadastro.classList.remove("hidden");
});

linkParaLogin.addEventListener("click", (e) => {
    e.preventDefault();
    formCadastro.classList.add("hidden");
    formLogin.classList.remove("hidden");
});

linkEsqueceuSenha.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    if (!email) { toastAviso("Digite seu email primeiro."); return; }
    try {
        const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });
        if (error) throw error;
        toastSucesso("Email de recuperação enviado!");
    } catch (err) {
        toastErro("Erro: " + err.message);
    }
});

formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginSenha").value;
    const btn = formLogin.querySelector("button");
    btn.textContent = "Entrando...";
    btn.disabled = true;
    try {
        await loginUsuario(email, senha);
        mostrarApp();
    } catch (err) {
        toastErro("Erro ao entrar: " + err.message);
    } finally {
        btn.textContent = "Entrar";
        btn.disabled = false;
    }
});

formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("cadastroNome").value.trim();
    const email = document.getElementById("cadastroEmail").value.trim();
    const senha = document.getElementById("cadastroSenha").value;
    const btn = formCadastro.querySelector("button");
    if (senha.length < 6) { toastErro("Senha precisa ter pelo menos 6 caracteres."); return; }
    btn.textContent = "Criando conta...";
    btn.disabled = true;
    try {
        await cadastrarUsuario(nome, email, senha);
        mostrarApp();
    } catch (err) {
        toastErro("Erro ao criar conta: " + err.message);
        btn.textContent = "Criar conta grátis";
        btn.disabled = false;
    }
});

// ======================================
// NAVEGAÇÃO
// ======================================

const links = document.querySelectorAll("nav a[data-page]");
const paginas = document.querySelectorAll(".page");

function mostrarPagina(nomePagina) {
    paginas.forEach((p) => p.classList.add("hidden"));
    const paginaAtiva = document.getElementById("page-" + nomePagina);
    if (paginaAtiva) paginaAtiva.classList.remove("hidden");

    links.forEach((l) => l.classList.remove("active"));
    const linkAtivo = document.querySelector(`nav a[data-page="${nomePagina}"]`);
    if (linkAtivo) linkAtivo.classList.add("active");

    setTimeout(async () => {
        if (nomePagina === "visao-geral") await renderizarDashboard();
        if (nomePagina === "gastos") await renderizarGastos();
        if (nomePagina === "cartoes") await renderizarCartoes();
        if (nomePagina === "investimentos") await renderizarInvestimentos();
        if (nomePagina === "metas") await renderizarMetas();
        if (nomePagina === "rendas") await renderizarRendas();
        if (nomePagina === "compras") await renderizarCompras();
        if (nomePagina === "graficos") {
            await renderizarGraficos();
            await carregarRelatorios();
        }
    }, 100);
}

links.forEach((link) => {
    link.addEventListener("click", () => {
        mostrarPagina(link.getAttribute("data-page"));
        fecharMenu();
    });
});

// ======================================
// GASTOS RECORRENTES
// ======================================

async function aplicarGastosRecorrentes() {
    const dados = await carregarDados();
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
    const chaveAplicado = `renda_recorrente_${mesAtual}`;
    if (localStorage.getItem(chaveAplicado)) return;

    const recorrentes = dados.gastos.filter(g => g.recorrente);
    if (recorrentes.length === 0) return;

    recorrentes.forEach(g => {
        const jaExiste = dados.gastos.some(x =>
            x.descricao === g.descricao &&
            x.data && x.data.startsWith(mesAtual) &&
            x.id !== g.id
        );
        if (!jaExiste) {
            dados.gastos.push({
                id: gerarId(),
                descricao: g.descricao,
                valor: g.valor,
                categoria: g.categoria,
                data: hojeISO(),
                recorrente: false
            });
        }
    });

    await salvarDados(dados);
    localStorage.setItem(chaveAplicado, "1");
    toastInfo(`🔁 ${recorrentes.length} gasto(s) recorrente(s) aplicado(s).`);
}

// ======================================
// INICIAR APP
// ======================================

async function iniciarApp() {
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    const nome = obterNomeUsuario();

    document.getElementById("saudacao").innerHTML = `${saudacao}, ${nome} 👋`;
    document.getElementById("dataAtual").innerHTML = new Date().toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    mostrarSkeleton("resumoMes", 4);

    await renderizarSeletorPerfil();
    await aplicarGastosRecorrentes();
    await renderizarDashboard();
    await renderizarCompras();
    await renderizarRendas();
    await renderizarGastos();
    await renderizarCartoes();
    await renderizarInvestimentos();
    await renderizarMetas();

    await pedirPermissaoNotificacao();
    await verificarAlertas();
}

// ======================================
// MENU MOBILE
// ======================================

const botaoMenu = document.getElementById("botaoMenu");
const sidebar = document.getElementById("sidebar");
const overlayMenu = document.getElementById("overlayMenu");

function abrirMenu() {
    if (sidebar) sidebar.classList.add("aberta");
    if (overlayMenu) overlayMenu.classList.add("ativo");
}

function fecharMenu() {
    if (sidebar) sidebar.classList.remove("aberta");
    if (overlayMenu) overlayMenu.classList.remove("ativo");
}

if (botaoMenu) botaoMenu.addEventListener("click", abrirMenu);
if (overlayMenu) overlayMenu.addEventListener("click", fecharMenu);

// ======================================
// BOTÃO SAIR
// ======================================

document.getElementById("botaoSair").addEventListener("click", async () => {
    await sairUsuario();
    location.reload();
});

// ======================================
// INICIALIZAÇÃO
// ======================================

if (typeof registrarServiceWorker === "function") {
    registrarServiceWorker();
}

inicializar();