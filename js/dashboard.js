// ======================================
// RENDERIZAÇÃO DA VISÃO GERAL (DASHBOARD)
// ======================================

function calcularTotais() {
    const dados = carregarDados();

    const totalGastos = dados.gastos.reduce((soma, g) => soma + g.valor, 0);

    const totalCartoesMensal = dados.cartoes.reduce((soma, c) => soma + (c.valor / c.parcelas), 0);

    const totalInvestimentos = dados.investimentos
        .filter(i => i.tipo !== "reserva")
        .reduce((soma, i) => soma + i.valor, 0);

    const totalReserva = dados.investimentos
        .filter(i => i.tipo === "reserva")
        .reduce((soma, i) => soma + i.valor, 0);

    const lazer = dados.lazerMensal || 0;

    const saldo = dados.salario - totalGastos - totalCartoesMensal - totalInvestimentos - totalReserva - lazer;

    return {
        dados,
        saldo,
        totalGastos,
        totalCartoesMensal,
        totalInvestimentos,
        totalReserva,
        lazer
    };
}

function renderizarDashboard() {
    const t = calcularTotais();

    document.getElementById("saldo").innerHTML = formatarMoeda(t.saldo);
    document.getElementById("investimentos").innerHTML = formatarMoeda(t.totalInvestimentos);
    document.getElementById("reserva").innerHTML = formatarMoeda(t.totalReserva);
    document.getElementById("lazer").innerHTML = formatarMoeda(t.lazer);

    const metaReserva = t.dados.metaReserva > 0 ? t.dados.metaReserva : 1;
    const porcentagem = Math.min((t.totalReserva / metaReserva) * 100, 100);
    document.getElementById("barraReserva").style.width = porcentagem + "%";

    renderizarResumoMes(t);
    preencherFormularioConfig(t.dados);
}

function renderizarResumoMes(t) {
    const resumo = document.getElementById("resumoMes");

    resumo.innerHTML = `
        <li class="item-linha">
            <span>💼 Salário / renda</span>
            <strong style="color:var(--success)">${formatarMoeda(t.dados.salario)}</strong>
        </li>
        <li class="item-linha">
            <span>🧾 Gastos lançados</span>
            <strong style="color:var(--danger)">− ${formatarMoeda(t.totalGastos)}</strong>
        </li>
        <li class="item-linha">
            <span>💳 Parcelas do cartão</span>
            <strong style="color:var(--danger)">− ${formatarMoeda(t.totalCartoesMensal)}</strong>
        </li>
        <li class="item-linha">
            <span>📈 Investimentos</span>
            <strong style="color:var(--warning)">− ${formatarMoeda(t.totalInvestimentos)}</strong>
        </li>
        <li class="item-linha">
            <span>🛡️ Reserva</span>
            <strong style="color:var(--warning)">− ${formatarMoeda(t.totalReserva)}</strong>
        </li>
        <li class="item-linha">
            <span>🍔 Orçamento lazer</span>
            <strong style="color:var(--warning)">− ${formatarMoeda(t.lazer)}</strong>
        </li>
        <li class="item-linha" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top:14px; margin-top:4px;">
            <span><strong>💰 Saldo disponível</strong></span>
            <strong style="color:${t.saldo >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatarMoeda(t.saldo)}</strong>
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

    formConfig.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const salario = parseFloat(document.getElementById("configSalario").value);
        const lazerMensal = parseFloat(document.getElementById("configLazer").value);
        const metaReserva = parseFloat(document.getElementById("configMetaReserva").value) || 0;

        if (isNaN(salario) || isNaN(lazerMensal)) {
            alert("Preencha salário e lazer corretamente.");
            return;
        }

        const dados = carregarDados();
        dados.salario = salario;
        dados.lazerMensal = lazerMensal;
        dados.metaReserva = metaReserva;
        salvarDados(dados);

        renderizarDashboard();
        alert("Configurações salvas!");
    });
}

iniciarListenerConfig();