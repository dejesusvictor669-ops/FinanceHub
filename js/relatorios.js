console.log("carregou: relatorios.js");

const MESES = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

let graficoRelatorioInstance = null;
let graficoComparacaoInstance = null;

async function fecharMes() {
    const dados = await carregarDados();
    if (!dados.relatorios) dados.relatorios = [];

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    const jaExiste = dados.relatorios.find(r => r.ano === ano && r.mes === mes);
    if (jaExiste) {
        alert("Este mês já foi fechado.");
        return;
    }

    const t = await calcularTotais();

    dados.relatorios.push({
        ano, mes,
        fechadoEm: hoje.toLocaleDateString("pt-BR"),
        salario: t.dados.salario,
        rendaExtra: t.totalRendaExtra,
        receita: t.rendaTotal,
        gastosNormais: t.gastosNormais,
        gastosLazer: t.gastosLazer,
        cartoes: t.totalCartoesMensal,
        investimentos: t.totalInvestimentos,
        reserva: t.totalReserva,
        lazerOrcamento: t.lazerOrcamento,
        saldo: t.saldo,
        qtdGastos: t.dados.gastos.length,
        qtdCartoes: t.dados.cartoes.length,
        qtdInvestimentos: t.dados.investimentos.length,
        qtdRendas: t.dados.rendasExtras.length,
        qtdMetas: t.dados.metas.length
    });

    await salvarDados(dados);
    alert(`${MESES[mes]} ${ano} fechado com sucesso!`);
    await carregarRelatorios();
}

// ======================================
// REABRIR MÊS
// ======================================

async function reabrirMes(ano, mes) {
    if (!confirm(`Reabrir ${MESES[mes]} ${ano}?`)) return;

    const dados = await carregarDados();
    dados.relatorios = dados.relatorios.filter(r => !(r.ano === ano && r.mes === mes));
    await salvarDados(dados);

    document.getElementById("dashboardHistorico").innerHTML = "";
    await carregarRelatorios();
    alert("Mês reaberto.");
}

// ======================================
// CALENDÁRIO
// ======================================

async function carregarRelatorios() {
    const dados = await carregarDados();
    if (!dados.relatorios) dados.relatorios = [];

    const calendario = document.getElementById("calendarioRelatorios");
    if (!calendario) return;

    const anoSelect = document.getElementById("anoRelatorio");
    if (anoSelect && anoSelect.options.length === 0) {
        const anoAtual = new Date().getFullYear();
        for (let a = anoAtual - 3; a <= anoAtual + 2; a++) {
            anoSelect.innerHTML += `<option value="${a}">${a}</option>`;
        }
        anoSelect.value = anoAtual;
    }

    const ano = anoSelect ? Number(anoSelect.value) : new Date().getFullYear();

    calendario.innerHTML = "";

    for (let i = 0; i < 12; i++) {
        const rel = dados.relatorios.find(r => r.ano === ano && r.mes === i);
        const fechado = !!rel;

        calendario.innerHTML += `
            <div class="mes-relatorio ${fechado ? 'mes-fechado' : 'mes-aberto'}"
                 onclick="abrirRelatorio(${ano}, ${i})">
                <h4>${MESES[i]}</h4>
                <p>${fechado ? '<i class="fa-solid fa-circle-check"></i> Fechado' : '<i class="fa-solid fa-folder-open"></i> Em aberto'}</p>
                ${fechado ? `<small>${sanitizar(rel.fechadoEm)}</small>` : ''}
            </div>
        `;
    }

    await renderizarGraficoComparacao(dados.relatorios, ano);
}

// ======================================
// ABRIR RELATÓRIO
// ======================================

async function abrirRelatorio(ano, mes) {
    const dados = await carregarDados();
    const r = dados.relatorios ? dados.relatorios.find(x => x.ano === ano && x.mes === mes) : null;

    const painel = document.getElementById("dashboardHistorico");
    if (!painel) return;

    if (!r) {
        painel.innerHTML = `
            <div class="cardResumo">
                <h3><i class="fa-solid fa-folder-open"></i> ${MESES[mes]} ${ano}</h3>
                <p>Este mês ainda não foi fechado.</p>
            </div>
        `;
        return;
    }

    const linha = (emoji, label, valor, cor) => `
        <div class="cardResumo">
            <h3>${emoji} ${label}</h3>
            <h2 style="color:${cor || 'var(--text)'}">${formatarMoeda(valor)}</h2>
        </div>
    `;

    painel.innerHTML = `
        <div class="cardResumo" style="grid-column:1/-1;">
            <h2><i class="fa-solid fa-clipboard-list"></i> ${MESES[r.mes]} ${r.ano}</h2>
            <p style="color:var(--gray)">Fechado em ${r.fechadoEm}</p>
        </div>

        ${linha('<i class="fa-solid fa-briefcase"></i>', 'Salário base', r.salario, 'var(--success)')}
        ${linha('<i class="fa-solid fa-money-bill-wave"></i>', 'Rendas extras', r.rendaExtra, 'var(--success)')}
        ${linha('<i class="fa-solid fa-receipt"></i>', 'Gastos normais', r.gastosNormais, 'var(--danger)')}
        ${linha('<i class="fa-solid fa-gamepad"></i>', 'Gastos de lazer', r.gastosLazer, 'var(--danger)')}
        ${linha('<i class="fa-solid fa-credit-card"></i>', 'Parcelas cartão', r.cartoes, 'var(--danger)')}
        ${linha('<i class="fa-solid fa-chart-line"></i>', 'Investimentos', r.investimentos, 'var(--warning)')}
        ${linha('<i class="fa-solid fa-shield-halved"></i>', 'Reserva', r.reserva, 'var(--warning)')}
        ${linha('<i class="fa-solid fa-champagne-glasses"></i>', 'Orçamento lazer', r.lazerOrcamento, 'var(--warning)')}
        ${linha('<i class="fa-solid fa-wallet"></i>', 'Saldo final', r.saldo, r.saldo >= 0 ? 'var(--success)' : 'var(--danger)')}

        <div class="cardResumo">
            <h3><i class="fa-solid fa-chart-pie"></i> Quantidades</h3>
            <p><i class="fa-solid fa-receipt"></i> ${r.qtdGastos} gastos</p>
            <p><i class="fa-solid fa-credit-card"></i> ${r.qtdCartoes} compras no cartão</p>
            <p><i class="fa-solid fa-chart-line"></i> ${r.qtdInvestimentos} aportes</p>
            <p><i class="fa-solid fa-money-bill-wave"></i> ${r.qtdRendas} rendas extras</p>
            <p><i class="fa-solid fa-bullseye"></i> ${r.qtdMetas} metas</p>
        </div>

        <div class="cardResumo" style="grid-column:1/-1;">
            <h3><i class="fa-solid fa-chart-pie"></i> Distribuição do mês</h3>
            <canvas id="graficoRelatorio" height="100"></canvas>
        </div>

        <div class="cardResumo">
            <h3><i class="fa-solid fa-gear"></i> Ações</h3>
            <button class="btn" onclick="reabrirMes(${r.ano}, ${r.mes})">
                <i class="fa-solid fa-lock-open"></i> Reabrir este mês
            </button>
        </div>
    `;

    renderizarGraficoRelatorio(r);
}

// ======================================
// GRÁFICO DE PIZZA — distribuição do mês
// ======================================

function renderizarGraficoRelatorio(r) {
    const ctx = document.getElementById("graficoRelatorio");
    if (!ctx) return;

    if (graficoRelatorioInstance) {
        graficoRelatorioInstance.destroy();
    }

    const labels = ["Gastos", "Lazer", "Cartões", "Investimentos", "Reserva", "Saldo"];
    const valores = [
        r.gastosNormais,
        r.gastosLazer,
        r.cartoes,
        r.investimentos,
        r.reserva,
        Math.max(r.saldo, 0)
    ];
    const cores = ["#EF4444","#F59E0B","#F97316","#2563EB","#06B6D4","#22C55E"];

    graficoRelatorioInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: cores,
                borderColor: coresGrafico().fundo,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: coresGrafico().texto, padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                            return ` ${formatarMoeda(ctx.raw)} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ======================================
// GRÁFICO DE BARRAS — comparação anual
// ======================================

async function renderizarGraficoComparacao(relatorios, ano) {
    const ctx = document.getElementById("graficoComparacao");
    if (!ctx) return;

    if (graficoComparacaoInstance) {
        graficoComparacaoInstance.destroy();
    }

    const relDoAno = relatorios
        .filter(r => r.ano === ano)
        .sort((a, b) => a.mes - b.mes);

    //const card = document.getElementById("cardComparacao");

    const card = document.getElementById("cardComparacao");

    if (relDoAno.length === 0) {
        if (card) card.style.display = "none";
        return;
    }

    if (card) card.style.display = "block";

    const labels = relDoAno.map(r => MESES[r.mes].substring(0, 3));
    const receitas = relDoAno.map(r => r.receita);
    const gastos = relDoAno.map(r => r.gastosNormais + r.gastosLazer + r.cartoes);
    const saldos = relDoAno.map(r => r.saldo);

    graficoComparacaoInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Receita",
                    data: receitas,
                    backgroundColor: "rgba(34, 197, 94, 0.7)",
                    borderColor: "#22C55E",
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: "Gastos totais",
                    data: gastos,
                    backgroundColor: "rgba(239, 68, 68, 0.7)",
                    borderColor: "#EF4444",
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: "Saldo final",
                    data: saldos,
                    backgroundColor: "rgba(37, 99, 235, 0.7)",
                    borderColor: "#2563EB",
                    borderWidth: 2,
                    borderRadius: 6,
                    type: "line"
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: coresGrafico().texto } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${formatarMoeda(ctx.raw)}`
                    }
                }
            },
            scales: {
                x: { ticks: { color: coresGrafico().suave }, grid: { color: coresGrafico().grade } },
                y: {
                    ticks: { color: coresGrafico().suave, callback: (v) => "R$ " + v.toFixed(0) },
                    grid: { color: coresGrafico().grade }
                }
            }
        }
    });
}