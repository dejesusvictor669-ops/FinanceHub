// ======================================
// LOGIN (sem backend, salvo no localStorage)
// ======================================

const telaLogin = document.getElementById("telaLogin");
const appContainer = document.getElementById("appContainer");

function verificarLogin() {
    const nomeUsuario = obterUsuario();

    if (nomeUsuario) {
        telaLogin.classList.add("hidden");
        appContainer.classList.remove("hidden");
        iniciarApp();
    } else {
        telaLogin.classList.remove("hidden");
        appContainer.classList.add("hidden");
    }
}

document.getElementById("formLogin").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("loginNome").value.trim();

    if (!nome) {
        return;
    }

    salvarUsuario(nome);
    verificarLogin();
});

// ======================================
// CONTROLADOR DE NAVEGAÇÃO
// ======================================

const links = document.querySelectorAll("nav a[data-page]");
const paginas = document.querySelectorAll(".page");

function mostrarPagina(nomePagina) {
    paginas.forEach((pagina) => {
        pagina.classList.add("hidden");
    });

    const paginaAtiva = document.getElementById("page-" + nomePagina);
    if (paginaAtiva) {
        paginaAtiva.classList.remove("hidden");
    }

    links.forEach((link) => {
        link.classList.remove("active");
    });

    const linkAtivo = document.querySelector(`nav a[data-page="${nomePagina}"]`);
    if (linkAtivo) {
        linkAtivo.classList.add("active");
    }
}

links.forEach((link) => {
    link.addEventListener("click", () => {
        const pagina = link.getAttribute("data-page");
        mostrarPagina(pagina);
        fecharMenu();
    });
});

// ======================================
// SAUDAÇÃO E DATA
// ======================================

function iniciarApp() {
    const hora = new Date().getHours();
    let saudacao = "";

    if (hora < 12) {
        saudacao = "Bom dia";
    } else if (hora < 18) {
        saudacao = "Boa tarde";
    } else {
        saudacao = "Boa noite";
    }

    const nomeUsuario = obterUsuario();
    document.getElementById("saudacao").innerHTML = `${saudacao}, ${nomeUsuario} 👋`;

    const hoje = new Date();
    document.getElementById("dataAtual").innerHTML =
        hoje.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    renderizarDashboard();
    renderizarGastos();
    renderizarCartoes();
    renderizarInvestimentos();
    renderizarMetas();
}

// ======================================
// MENU MOBILE (sidebar retrátil)
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

if (botaoMenu) {
    botaoMenu.addEventListener("click", abrirMenu);
}

if (overlayMenu) {
    overlayMenu.addEventListener("click", fecharMenu);
}

// ======================================
// BOTÃO SAIR
// ======================================

document.getElementById("botaoSair").addEventListener("click", () => {
    sairUsuario();
    location.reload();
});

// ======================================
// INICIALIZAÇÃO
// ======================================

verificarLogin();