// ======================================
// PÁGINA: RELATÓRIOS / GRÁFICOS
// ======================================

let graficoMensalInstance = null;
let graficoCategoriaInstance = null;

function renderizarGraficos() {
    const dados = carregarDados();

    renderizarGraficoMensal(dados);
    renderizarGraficoCategoria(dados);
}

function renderizarGraficoMensal(dados) {
    const ctx = document.getElementById("graficoMensal").getContext("2d");

    const gastosPorMes = {};

    dados.gastos.forEach((g) => {
        const mes = g.data ? g.data.substring(0, 7) : "sem data";
        gastosPorMes[mes] = (gastosPorMes[mes] || 0) + g.valor;
    });

    dados.cartoes.forEach((c) => {
        const mes = c.data ? c.data.substring(0, 7) : "sem data";
        const parcela = c.valor / c.parcelas;
        gastosPorMes[mes] = (gastosPorMes[mes] || 0) + parcela;
    });

    const mesesOrdenados = Object.keys(gastosPorMes).sort();

    const labels = mesesOrdenados.map((m) => {
        if (m === "sem data") return "Sem data";
        const [ano, mes] = m.split("-");
        const nomes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        return `${nomes[parseInt(mes) - 1]}/${ano.substring(2)}`;
    });

    const valores = mesesOrdenados.map((m) => gastosPorMes[m]);

    if (graficoMensalInstance) {
        graficoMensalInstance.destroy();
    }

    graficoMensalInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels.length > 0 ? labels : ["Nenhum dado"],
            datasets: [{
                label: "Gastos + Parcelas (R$)",
                data: valores.length > 0 ? valores : [0],
                backgroundColor: "rgba(37, 99, 235, 0.7)",
                borderColor: "#2563EB",
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: "#F8FAFC" } }
            },
            scales: {
                x: { ticks: { color: "#94A3B8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                y: { ticks: { color: "#94A3B8", callback: (v) => "R$ " + v.toFixed(0) }, grid: { color: "rgba(255,255,255,0.05)" } }
            }
        }
    });
}

function renderizarGraficoCategoria(dados) {
    const ctx = document.getElementById("graficoCategoria").getContext("2d");

    const gastosPorCategoria = {};

    dados.gastos.forEach((g) => {
        gastosPorCategoria[g.categoria] = (gastosPorCategoria[g.categoria] || 0) + g.valor;
    });

    const emojis = {
        moradia: "🏠 Moradia",
        contas: "💡 Contas",
        mercado: "🛒 Mercado",
        lazer: "🎮 Lazer",
        cartao: "💳 Cartão",
        outros: "📦 Outros"
    };

    const labels = Object.keys(gastosPorCategoria).map((k) => emojis[k] || k);
    const valores = Object.values(gastosPorCategoria);

    const cores = ["#2563EB","#22C55E","#F59E0B","#EF4444","#8B5CF6","#EC4899"];

    if (graficoCategoriaInstance) {
        graficoCategoriaInstance.destroy();
    }

    graficoCategoriaInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels.length > 0 ? labels : ["Nenhum dado"],
            datasets: [{
                data: valores.length > 0 ? valores : [1],
                backgroundColor: cores,
                borderColor: "#1E293B",
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#F8FAFC", padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.raw / total) * 100).toFixed(1);
                            return ` R$ ${ctx.raw.toFixed(2)} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}