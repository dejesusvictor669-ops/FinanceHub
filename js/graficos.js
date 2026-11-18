console.log("carregou: graficos.js");

let graficoMensalInstance = null;
let graficoCategoriaInstance = null;

async function renderizarGraficos() {
    const dados = await carregarDados();
    renderizarGraficoMensal(dados);
    renderizarGraficoCategoria(dados);
}

function renderizarGraficoMensal(dados) {
    const ctx = document.getElementById("graficoMensal");
    if (!ctx) return;

    const gastosPorMes = {};

    dados.gastos.forEach((g) => {
        const mes = g.data ? g.data.substring(0, 7) : "sem data";
        gastosPorMes[mes] = (gastosPorMes[mes] || 0) + g.valor;
    });

    dados.cartoes.forEach((c) => {
        const mes = c.data ? c.data.substring(0, 7) : "sem data";
        const parcelas = calcularParcelasCartao(c);
        if (parcelas.parcelasPagas > 0 && parcelas.parcelasRestantes > 0) {
            gastosPorMes[mes] = (gastosPorMes[mes] || 0) + parcelas.valorParcela;
        }
    });

    const mesesOrdenados = Object.keys(gastosPorMes).sort();
    const nomes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

    const labels = mesesOrdenados.map((m) => {
        if (m === "sem data") return "Sem data";
        const [ano, mes] = m.split("-");
        return `${nomes[parseInt(mes) - 1]}/${ano.substring(2)}`;
    });

    const valores = mesesOrdenados.map((m) => gastosPorMes[m]);

    if (graficoMensalInstance) graficoMensalInstance.destroy();

    graficoMensalInstance = new Chart(ctx.getContext("2d"), {
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
            plugins: { legend: { labels: { color: coresGrafico().texto } } },
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

function renderizarGraficoCategoria(dados) {
    const ctx = document.getElementById("graficoCategoria");
    if (!ctx) return;

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
    const cores = ["#2563EB","#22C55E","#F59E0B","#EF4444","#06B6D4","#F97316"];

    if (graficoCategoriaInstance) graficoCategoriaInstance.destroy();

    graficoCategoriaInstance = new Chart(ctx.getContext("2d"), {
        type: "doughnut",
        data: {
            labels: labels.length > 0 ? labels : ["Nenhum dado"],
            datasets: [{
                data: valores.length > 0 ? valores : [1],
                backgroundColor: cores,
                borderColor: coresGrafico().fundo,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom", labels: { color: coresGrafico().texto, padding: 15 } },
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