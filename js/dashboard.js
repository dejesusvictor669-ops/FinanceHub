console.log("carregou: dashboard.js");

async function calcularTotais() {
    const dados = await carregarDados();

    const totalRendaExtra = (dados.rendasExtras || []).reduce((soma, r) => soma + r.valor, 0);
    const rendaTotal = dados.salario + totalRendaExtra;

    const gastosNormais = dados.gastos
        .filter(g => String(g.categoria || "").toLowerCase() !== "lazer")
        .reduce((soma, g) => soma + (Number(g.valor) || 0), 0);

    const gastosLazer = dados.gastos
        .filter(g => String(g.categoria || "").toLowerCase() === "lazer")
        .reduce((soma, g) => soma + (Number(g.valor) || 0), 0);

    const totalCartoesMensal = dados.cartoes
        .reduce((soma, c) => {
            const parcelas = calcularParcelasCartao(c);
            return soma + (parcelas.parcelasRestantes > 0 ? parcelas.valorParcela : 0);
        }, 0);

    const totalInvestimentos = dados.investimentos
        .filter(i => i.tipo !== "reserva")
        .reduce((soma, i) => soma + i.valor, 0);

    const totalReserva = dados.investimentos
        .filter(i => i.tipo === "reserva")
        .reduce((soma, i) => soma + i.valor, 0);

    const lazerOrcamento = dados.lazerMensal || 0;
    const lazerRestante = lazerOrcamento - gastosLazer;

    const saldo = rendaTotal - gastosNormais - totalCartoesMensal - totalInvestimentos - totalReserva - lazerOrcamento;

    return {
        dados, rendaTotal, totalRendaExtra, saldo,
        gastosNormais, gastosLazer, totalCartoesMensal,
        totalInvestimentos, totalReserva, lazerOrcamento, lazerRestante
    };
}

async function renderizarDashboard() {
    const t = await calcularTotais();

    document.getElementById("saldo").innerHTML = formatarMoeda(t.saldo);
    document.getElementById("investimentos").innerHTML = formatarMoeda(t.totalInvestimentos);
    document.getElementById("reserva").innerHTML = formatarMoeda(t.totalReserva);

    const lazerEl = document.getElementById("lazer");
    lazerEl.innerHTML = formatarMoeda(t.lazerRestante);
    lazerEl.style.color = t.lazerRestante < 0 ? "var(--danger)" : "var(--text)";

    const metaReserva = t.dados.metaReserva > 0 ? t.dados.metaReserva : 1;
    const porcentagem = Math.min((t.totalReserva / metaReserva) * 100, 100);
    document.getElementById("barraReserva").style.width = porcentagem + "%";

    renderizarResumoMes(t);
    preencherFormularioConfig(t.dados);
}

function renderizarResumoMes(t) {
    const resumo = document.getElementById("resumoMes");
    resumo.innerHTML = `
        <li class="item-linha"><span><i class="fa-solid fa-briefcase"></i> Salário base</span><strong style="color:var(--success)">${formatarMoeda(t.dados.salario)}</strong></li>
        <li class="item-linha"><span><i class="fa-solid fa-money-bill-wave"></i> Rendas extras</span><strong style="color:var(--success)">+ ${formatarMoeda(t.totalRendaExtra)}</strong></li>
        <li class="item-linha" style="border-top:1px solid rgba(255,255,255,0.05);padding-top:12px;margin-top:4px;">
            <span><i class="fa-solid fa-receipt"></i> Gastos lançados</span><strong style="color:var(--danger)">− ${formatarMoeda(t.gastosNormais)}</strong>
        </li>
        <li class="item-linha"><span><i class="fa-solid fa-credit-card"></i> Parcelas do cartão (mês)</span><strong style="color:var(--danger)">− ${formatarMoeda(t.totalCartoesMensal)}</strong></li>
        <li class="item-linha"><span><i class="fa-solid fa-chart-line"></i> Investimentos registrados</span><strong style="color:var(--warning)">− ${formatarMoeda(t.totalInvestimentos)}</strong></li>
        <li class="item-linha"><span><i class="fa-solid fa-shield-halved"></i> Reserva registrada</span><strong style="color:var(--warning)">− ${formatarMoeda(t.totalReserva)}</strong></li>
        <li class="item-linha"><span><i class="fa-solid fa-champagne-glasses"></i> Orçamento de lazer</span><strong style="color:var(--warning)">− ${formatarMoeda(t.lazerOrcamento)}</strong></li>
        <li class="item-linha" style="border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;margin-top:4px;">
            <span><strong><i class="fa-solid fa-wallet"></i> Saldo disponível</strong></span>
            <strong style="color:${t.saldo >= 0 ? 'var(--success)' : 'var(--danger)'};font-size:18px;">${formatarMoeda(t.saldo)}</strong>
        </li>
        <li class="item-linha" style="margin-top:4px;">
            <span><strong><i class="fa-solid fa-champagne-glasses"></i> Lazer restante</strong></span>
            <strong style="color:${t.lazerRestante >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatarMoeda(t.lazerRestante)}</strong>
        </li>
    `;
}

function preencherFormularioConfig(dados) {
    document.getElementById("configSalario").value = dados.salario > 0 ? dados.salario : "";
    document.getElementById("configLazer").value = dados.lazerMensal > 0 ? dados.lazerMensal : "";
    document.getElementById("configMetaReserva").value = dados.metaReserva > 0 ? dados.metaReserva : "";
}

function iniciarListenerConfig() {
    const formConfig = document.getElementById("formConfig");
    if (!formConfig) return;

    formConfig.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const salario = parseFloat(document.getElementById("configSalario").value);
        const lazerMensal = parseFloat(document.getElementById("configLazer").value);
        const metaReserva = parseFloat(document.getElementById("configMetaReserva").value) || 0;

        const dados = await carregarDados();

        if (!isNaN(salario) && salario >= 0) dados.salario = salario;
        if (!isNaN(lazerMensal) && lazerMensal >= 0) dados.lazerMensal = lazerMensal;
        if (!isNaN(metaReserva) && metaReserva >= 0) dados.metaReserva = metaReserva;

        await salvarDados(dados);
        await renderizarDashboard();
        toastSucesso("Configurações salvas!");
    });
}

iniciarListenerConfig();
// ======================================
// CARDS NAVEGÁVEIS, AÇÕES RÁPIDAS E DESTAQUE
// ======================================

const DESTINOS_MENU = {
    saldo: {
        titulo: "Saldo disponível",
        sub: "Para onde você quer ir?",
        itens: [
            { pagina: "entradas", icone: "fa-arrow-right-to-bracket", titulo: "Entradas", desc: "Salário e rendas extras", foco: "configSalario" },
            { pagina: "gastos", icone: "fa-money-bill-wave", titulo: "Gastos", desc: "Lançar e acompanhar gastos", foco: "gastoDescricao" },
            { pagina: "cartoes", icone: "fa-credit-card", titulo: "Cartões", desc: "Parcelas e compras no cartão" },
            { pagina: "investimentos", icone: "fa-chart-line", titulo: "Investimentos", desc: "Aportes e reserva de emergência" },
            { pagina: "graficos", icone: "fa-chart-pie", titulo: "Relatórios", desc: "Histórico e gráficos do mês" }
        ]
    },
    lazer: {
        titulo: "Lazer restante",
        sub: "O que você quer fazer?",
        itens: [
            { pagina: "gastos", icone: "fa-champagne-glasses", titulo: "Lançar gasto de lazer", desc: "Registrar um novo gasto", foco: "gastoDescricao" },
            { pagina: "entradas", icone: "fa-sliders", titulo: "Ajustar orçamento de lazer", desc: "Definir quanto pode gastar", foco: "configLazer" },
            { pagina: "graficos", icone: "fa-chart-pie", titulo: "Ver relatórios", desc: "Gastos por categoria" }
        ]
    }
};

let _destinoFocoAnterior = null;

function irParaPagina(pagina, focoId) {
    mostrarPagina(pagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // No celular não foca o campo (evita abrir o teclado sem querer)
    if (focoId && window.matchMedia("(hover: hover)").matches) {
        setTimeout(() => document.getElementById(focoId)?.focus({ preventScroll: true }), 420);
    }
}

function fecharMenuDestinos() {
    const overlay = document.getElementById("menuDestinos");
    if (!overlay) return;
    overlay.classList.add("saindo");
    setTimeout(() => overlay.remove(), 180);
    _destinoFocoAnterior?.focus?.();
}

function abrirMenuDestinos(chave) {
    const cfg = DESTINOS_MENU[chave];
    if (!cfg || document.getElementById("menuDestinos")) return;
    _destinoFocoAnterior = document.activeElement;

    const overlay = document.createElement("div");
    overlay.id = "menuDestinos";
    overlay.className = "destinos-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", cfg.titulo);
    overlay.innerHTML = `
        <div class="destinos-sheet">
            <div class="destinos-topo">
                <div>
                    <h3>${cfg.titulo}</h3>
                    <p>${cfg.sub}</p>
                </div>
                <button type="button" class="destinos-fechar" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="destinos-lista">
                ${cfg.itens.map((it, i) => `
                    <button type="button" class="destino" data-i="${i}">
                        <span class="destino-ico"><i class="fa-solid ${it.icone}"></i></span>
                        <span class="destino-txt"><strong>${it.titulo}</strong><small>${it.desc}</small></span>
                        <i class="fa-solid fa-chevron-right destino-seta"></i>
                    </button>`).join("")}
            </div>
        </div>`;

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target.closest(".destinos-fechar")) { fecharMenuDestinos(); return; }
        const botao = e.target.closest(".destino");
        if (!botao) return;
        const item = cfg.itens[Number(botao.dataset.i)];
        overlay.remove();
        irParaPagina(item.pagina, item.foco);
    });
    document.body.appendChild(overlay);
    overlay.querySelector(".destino")?.focus();
}

function iniciarCardsInterativos() {
    // Cards clicáveis da Visão Geral
    document.querySelectorAll(".card-link").forEach((card) => {
        const acionar = () => {
            const destino = card.dataset.destino || "";
            if (destino.startsWith("menu:")) abrirMenuDestinos(destino.slice(5));
            else irParaPagina(destino);
        };
        card.addEventListener("click", acionar);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); acionar(); }
        });
    });

    // Ações rápidas
    document.querySelectorAll(".acao-rapida").forEach((b) => {
        b.addEventListener("click", () => irParaPagina(b.dataset.ir, b.dataset.foco));
    });

    // Esc fecha o seletor
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") fecharMenuDestinos();
    });

    // Destaque que acompanha o mouse dentro do card
    document.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const card = e.target.closest?.(".card");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
}

iniciarCardsInterativos();
