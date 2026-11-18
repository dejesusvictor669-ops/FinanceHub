console.log("carregou: temas.js");

const TEMAS = [
    { id: "oceano",    nome: "Azul",      cor: "#2F7BFF" },
    { id: "ciano",     nome: "Ciano",     cor: "#06B6D4" },
    { id: "esmeralda", nome: "Esmeralda", cor: "#10B981" },
    { id: "laranja",   nome: "Laranja",   cor: "#F97316" },
    { id: "vermelho",  nome: "Vermelho",  cor: "#EF4444" },
    { id: "ambar",     nome: "Âmbar",     cor: "#F59E0B" }
];

function aplicarTema(temaId, claro) {
    document.documentElement.setAttribute("data-tema", temaId || "oceano");
    if (claro) {
        document.body.classList.add("tema-claro");
    } else {
        document.body.classList.remove("tema-claro");
    }
    localStorage.setItem("renda_tema", temaId || "oceano");
    localStorage.setItem("renda_claro", claro ? "1" : "0");
}

// Nova identidade visual (v3, liquid glass): escuro + Esmeralda como padrão, uma única vez
function migrarDesignV3() {
    if (!localStorage.getItem("renda_design_v3")) {
        localStorage.setItem("renda_claro", "0");
        localStorage.setItem("renda_design_v3", "1");
    }
    // v4: azul vira a cor padrão (quem já escolheu outra cor mantém)
    if (!localStorage.getItem("renda_design_v4")) {
        const atual = localStorage.getItem("renda_tema");
        if (!atual || atual === "esmeralda" || atual === "floresta") localStorage.setItem("renda_tema", "oceano");
        localStorage.setItem("renda_design_v4", "1");
    }
}

// Cores dos gráficos conforme o tema ativo
function coresGrafico() {
    const claro = document.body.classList.contains("tema-claro");
    return claro
        ? { texto: "#0B1F33", suave: "#4F6479", grade: "rgba(11,31,51,0.08)", fundo: "#FFFFFF" }
        : { texto: "#F5F9FF", suave: "#9DB0C7", grade: "rgba(255,255,255,0.09)", fundo: "#0E1E30" };
}

function iniciarTema() {
    migrarDesignV3();
    const temaId = localStorage.getItem("renda_tema") || "oceano";
    const claro = localStorage.getItem("renda_claro") === "1";
    aplicarTema(temaId, claro);
    atualizarIconeTema(claro);
}

function atualizarIconeTema(claro) {
    const botao = document.getElementById("botaoTema");
    if (!botao) return;
    botao.innerHTML = claro
        ? `<i class="fa-solid fa-moon"></i>`
        : `<i class="fa-solid fa-palette"></i>`;
}

function abrirSeletorTema() {
    const existing = document.getElementById("seletorTema");
    if (existing) {
        existing.remove();
        return;
    }

    const temaAtual = localStorage.getItem("renda_tema") || "oceano";
    const claro = localStorage.getItem("renda_claro") === "1";

    const seletor = document.createElement("div");
    seletor.id = "seletorTema";
    seletor.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 20px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 20px;
        z-index: 9999;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        min-width: 230px;
    `;

    seletor.innerHTML = `
        <p style="font-size:12px;color:var(--gray);margin-bottom:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
            <i class="fa-solid fa-palette"></i> Escolha seu tema
        </p>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:15px;">
            ${TEMAS.map(t => `
                <button
                    onclick="selecionarTema('${t.id}')"
                    title="${t.nome}"
                    style="
                        width:38px;height:38px;border-radius:50%;
                        background:${t.cor};
                        border:3px solid ${t.id === temaAtual ? 'white' : 'transparent'};
                        cursor:pointer;transition:.2s;
                        box-shadow:${t.id === temaAtual ? '0 0 0 2px ' + t.cor : 'none'};
                    "
                ></button>
            `).join("")}
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);">
            <span style="font-size:13px;color:var(--gray);"><i class="fa-solid fa-sun"></i> Tema claro</span>
            <div onclick="toggleClaro()" style="
                width:46px;height:26px;border-radius:999px;
                background:${claro ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
                position:relative;cursor:pointer;transition:.3s;
                border:1px solid var(--border);
            ">
                <div style="
                    position:absolute;top:3px;
                    left:${claro ? '23px' : '3px'};
                    width:20px;height:20px;border-radius:50%;
                    background:white;transition:.3s;
                "></div>
            </div>
        </div>
    `;

    document.body.appendChild(seletor);

    setTimeout(() => {
        document.addEventListener("click", function fechar(e) {
            const sel = document.getElementById("seletorTema");
            const btn = document.getElementById("botaoTema");
            if (sel && !sel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                sel.remove();
                document.removeEventListener("click", fechar);
            }
        });
    }, 150);
}

function selecionarTema(temaId) {
    const claro = localStorage.getItem("renda_claro") === "1";
    aplicarTema(temaId, claro);
    document.getElementById("seletorTema")?.remove();
    if (typeof toastSucesso === "function") toastSucesso("Tema aplicado!");
}

function toggleClaro() {
    const claro = localStorage.getItem("renda_claro") !== "1";
    const temaId = localStorage.getItem("renda_tema") || "oceano";
    aplicarTema(temaId, claro);
    atualizarIconeTema(claro);
    document.getElementById("seletorTema")?.remove();
}