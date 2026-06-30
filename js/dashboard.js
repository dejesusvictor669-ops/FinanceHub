console.log("carregou: app.js");
// ======================================
// RENDERIZAÇÃO DA VISÃO GERAL (DASHBOARD)
// ======================================

function renderizarDashboard() {
    const dados = carregarDados();

    const totalGastos = dados.gastos.reduce((soma, g) => soma + g.valor, 0);
    const totalInvestimentos = dados.investimentos.reduce((soma, i) => soma + i.valor, 0);

    const saldo = dados.salario - totalGastos;

    document.getElementById("saldo").innerHTML = formatarMoeda(saldo);
    document.getElementById("investimentos").innerHTML = formatarMoeda(totalInvestimentos);
    document.getElementById("reserva").innerHTML = formatarMoeda(totalInvestimentos);
    document.getElementById("lazer").innerHTML = formatarMoeda(dados.lazerMensal);

    const metaReserva = dados.metaReserva > 0 ? dados.metaReserva : 1;
    const porcentagem = Math.min((totalInvestimentos / metaReserva) * 100, 100);
    document.getElementById("barraReserva").style.width = porcentagem + "%";

    preencherFormularioConfig(dados);
}

function preencherFormularioConfig(dados) {
    document.getElementById("configSalario").value = dados.salario > 0 ? dados.salario : "";
    document.getElementById("configLazer").value = dados.lazerMensal > 0 ? dados.lazerMensal : "";
}

function iniciarListenerConfig() {
    const formConfig = document.getElementById("formConfig");

    if (!formConfig) {
        console.error("formConfig não encontrado no HTML.");
        return;
    }

    formConfig.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const salario = parseFloat(document.getElementById("configSalario").value);
        const lazerMensal = parseFloat(document.getElementById("configLazer").value);

        if (isNaN(salario) || isNaN(lazerMensal)) {
            alert("Preencha os campos de configuração corretamente.");
            return;
        }

        const dados = carregarDados();

        dados.salario = salario;
        dados.lazerMensal = lazerMensal;

        salvarDados(dados);

        renderizarDashboard();

        alert("Configurações salvas!");
    });
}

iniciarListenerConfig();