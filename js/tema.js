console.log("carregou: temas.js");

const TEMAS = [
    { id: "indigo",   nome: "Índigo",   cor: "#6366F1" },
    { id: "roxo",     nome: "Roxo",     cor: "#7C3AED" },
    { id: "verde",    nome: "Verde",    cor: "#059669" },
    { id: "laranja",  nome: "Laranja",  cor: "#EA580C" },
    { id: "rosa",     nome: "Rosa",     cor: "#DB2777" },
    { id: "vermelho", nome: "Vermelho", cor: "#DC2626" },
    { id: "ambar",    nome: "Âmbar",    cor: "#D97706" }
];

function aplicarTema(temaId, claro) {
    document.documentElement.setAttribute("data-tema", temaId || "indigo");
    if (claro) {
        document.body.classList.add("tema-claro");
    } else {
        document.body.classList.remove("tema-claro");
    }
    localStorage.setItem("renda_tema", temaId || "indigo");
    localStorage.setItem("renda_claro", claro ? "1" : "0");
}

function iniciarTema() {
    const temaId = localStorage.getItem("renda_tema") || "indigo";
    const claro = localStorage.getItem("renda_claro") === "1";
    aplicarTema(temaId, claro);
    atualizarBotaoTema(claro);
}

function atualizarBotaoTema(claro) {
    const botao = document.getElementById("botaoTema");
    if (botao) {
        botao.innerHTML = claro
            ? `<i class="fa-solid fa-moon"></i>`
            : `<i class="fa-solid fa-sun"></i>`;
    }
}

function abrirSeletorTema() {
    const existing = document.getElementById("seletorTema");
    if (existing) { existing.remove(); return; }

    const temaAtual = localStorage.getItem("renda_tema") || "indigo";
    const claro = localStorage.getItem("renda_claro") === "1";

    const seletor = document.createElement("div");
    seletor.id = "seletorTema";
    seletor.style.cssText = `
        position: fixed; bottom: 80px; left: 20px;
        background: var(--card); border: 1px solid var(--border);
        border-radius: 18px; padding: 20px; z-index: 9999;
        box-shadow: var(--shadow); min-width: 240px;
    `;

    seletor.innerHTML = `
        <p style="font-size:13px; color:var(--gray); margin-bottom:15px; font-weight:600;">🎨 Escolha seu tema</p>
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:15px;">
            ${TEMAS.map(t => `
                <button onclick="selecionarTema('${t.id}')"
                    title="${t.nome}"
                    style="width:38px;height:38px;border-radius:50%;background:${t.cor};border:3px solid ${t.id === temaAtual ? 'white' : 'transparent'};cursor:pointer;transition:.2s;"></button>
            `).join("")}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);">
            <span style="font-size:13px;color:var(--gray);">Tema claro</span>
            <button onclick="toggleClaro()" style="
                width:44px;height:24px;border-radius:999px;border:none;cursor:pointer;
                background:${claro ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
                position:relative;transition:.3s;
            ">
                <span style="
                    position:absolute;top:2px;
                    left:${claro ? '22px' : '2px'};
                    width:20px;height:20px;border-radius:50%;
                    background:white;transition:.3s;
                "></span>
            </button>
        </div>
    `;

    document.body.appendChild(seletor);

    setTimeout(() => {
        document.addEventListener("click", function fechar(e) {
            if (!seletor.contains(e.target) && e.target.id !== "botaoTema") {
                seletor.remove();
                document.removeEventListener("click", fechar);
            }
        });
    }, 100);
}

function selecionarTema(temaId) {
    const claro = localStorage.getItem("renda_claro") === "1";
    aplicarTema(temaId, claro);
    document.getElementById("seletorTema")?.remove();
}

function toggleClaro() {
    const claro = localStorage.getItem("renda_claro") !== "1";
    const temaId = localStorage.getItem("renda_tema") || "indigo";
    aplicarTema(temaId, claro);
    atualizarBotaoTema(claro);
    document.getElementById("seletorTema")?.remove();
}