console.log("carregou: dashboard.js");

function calcularTotais() {
    const dados = carregarDados();

    const totalRendaExtra = dados.rendasExtras.reduce((soma, r) => soma + r.valor, 0);
    const rendaTotal = dados.salario + totalRendaExtra;

    const gastosNormais = dados.gastos
        .filter(g => g.categoria !== "lazer")
        .reduce((soma, g) => soma + g.valor, 0);

    const gastosLazer = dados.gastos
        .filter(g => g.categoria === "lazer")
        .reduce((soma, g) => soma + g.valor, 0);

    const totalCartoesMensal = dados.cartoes
        .reduce((soma, c) => soma + (c.valor / c.parcelas), 0);

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
        dados,
        rendaTotal,
        totalRendaExtra,
        saldo,
        gastosNormais,
        gastosLazer,
        totalCartoesMensal,
        totalInvestimentos,
        totalReserva,
        lazerOrcamento,
        lazerRestante
    };
}

function renderizarDashboard() {
    const t = calcularTotais();

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
        <li class="item-linha">
            <span>💼 Salário base</span>
            <strong style="color:var(--success)">${formatarMoeda(t.dados.salario)}</strong>
        </li>
        <li class="item-linha">
            <span>💵 Rendas extras</span>
            <strong style="color:var(--success)">+ ${formatarMoeda(t.totalRendaExtra)}</strong>
        </li>
        <li class="item-linha" style="border-top:1px solid rgba(255,255,255,0.05); padding-top:12px; margin-top:4px;">
            <span>🧾 Gastos lançados</span>
            <strong style="color:var(--danger)">− ${formatarMoeda(t.gastosNormais)}</strong>
        </li>
        <li class="item-linha">
            <span>💳 Parcelas do cartão (mês)</span>
            <strong style="color:var(--danger)">− ${formatarMoeda(t.totalCartoesMensal)}</strong>
        </li>
        <li class="item-linha">
            <span>📈 Investimentos</span>
            <strong style="color:var(--warning)">− ${formatarMoeda(t.totalInvestimentos)}</strong>
        </li>
        <li class="item-linha">
            <span>🛡️ Reserva de emergência</span>
            <strong style="color:var(--warning)">− ${formatarMoeda(t.totalReserva)}</strong>
        </li>
        <li class="item-linha">
            <span>🍔 Orçamento de lazer</span>
            <strong style="color:var(--warning)">− ${formatarMoeda(t.lazerOrcamento)}</strong>
        </li>
        <li class="item-linha" style="border-top:1px solid rgba(255,255,255,0.08); padding-top:14px; margin-top:4px;">
            <span><strong>💰 Saldo disponível</strong></span>
            <strong style="color:${t.saldo >= 0 ? 'var(--success)' : 'var(--danger)'}; font-size:18px;">
                ${formatarMoeda(t.saldo)}
            </strong>
        </li>
        <li class="item-linha" style="margin-top:4px;">
            <span><strong>🍔 Lazer restante</strong></span>
            <strong style="color:${t.lazerRestante >= 0 ? 'var(--success)' : 'var(--danger)'};">
                ${formatarMoeda(t.lazerRestante)}
            </strong>
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

        if (isNaN(salario)) {
            alert("Preencha salário  corretamente.");
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