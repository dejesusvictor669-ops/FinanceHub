console.log("carregou: app.js");

const telaLogin = document.getElementById("telaLogin");
const appContainer = document.getElementById("appContainer");

// ======================================
// VERIFICAR SESSÃO AO CARREGAR
// ======================================

async function inicializar() {
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
// FORMULÁRIO DE LOGIN / CADASTRO
// ======================================

const formLogin = document.getElementById("formLogin");
const formCadastro = document.getElementById("formCadastro");
const linkParaCadastro = document.getElementById("linkParaCadastro");
const linkParaLogin = document.getElementById("linkParaLogin");

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
        alert("Erro ao entrar: " + err.message);
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

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    btn.textContent = "Criando conta...";
    btn.disabled = true;

    try {
        await cadastrarUsuario(nome, email, senha);
        mostrarApp();
    } catch (err) {
        alert("Erro ao criar conta: " + err.message);
        btn.textContent = "Criar conta";
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

   if (nomePagina === "graficos") {
        setTimeout(async () => {
            await renderizarGraficos();
            await carregarRelatorios();
        }, 100);
    }
}

links.forEach((link) => {
    link.addEventListener("click", () => {
        mostrarPagina(link.getAttribute("data-page"));
        fecharMenu();
    });
});

// ======================================
// INICIAR APP APÓS LOGIN
// ======================================

async function iniciarApp() {
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    const nome = obterNomeUsuario();

    document.getElementById("saudacao").innerHTML = `${saudacao}, ${nome} 👋`;

    const hoje = new Date();
    document.getElementById("dataAtual").innerHTML =
        hoje.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    await renderizarDashboard();
    await renderizarCompras();
    await renderizarRendas();
    await renderizarCartoes();
    await renderizarInvestimentos();
    await renderizarMetas();
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

inicializar();