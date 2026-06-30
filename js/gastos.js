// ======================================
// PÁGINA: GASTOS
// ======================================

function renderizarGastos() {
    const dados = carregarDados();
    const lista = document.getElementById("listaGastos");

    lista.innerHTML = "";

    if (dados.gastos.length === 0) {
        lista.innerHTML = `<li class="item-linha"><span>Nenhum gasto lançado ainda.</span></li>`;
        return;
    }

    const gastosOrdenados = [...dados.gastos].sort((a, b) => new Date(b.data) - new Date(a.data));

    gastosOrdenados.forEach((gasto) => {
        const item = document.createElement("li");
        item.className = "item-linha";

        item.innerHTML = `
            <div class="info">
                <span>${gasto.descricao}</span>
                <small>${gasto.categoria} • ${formatarData(gasto.data)}</small>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <strong>${formatarMoeda(gasto.valor)}</strong>
                <button class="excluir" data-id="${gasto.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        lista.appendChild(item);
    });

    document.querySelectorAll("#listaGastos .excluir").forEach((botao) => {
        botao.addEventListener("click", () => {
            excluirGasto(botao.getAttribute("data-id"));
        });
    });
}

function excluirGasto(id) {
    const dados = carregarDados();
    dados.gastos = dados.gastos.filter((g) => g.id !== id);
    salvarDados(dados);

    renderizarGastos();
    renderizarDashboard();
}

document.getElementById("formGasto").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const descricao = document.getElementById("gastoDescricao").value.trim();
    const valor = parseFloat(document.getElementById("gastoValor").value);
    const categoria = document.getElementById("gastoCategoria").value;

    if (!descricao || isNaN(valor) || valor <= 0) {
        return;
    }

    const dados = carregarDados();

    dados.gastos.push({
        id: gerarId(),
        descricao: descricao,
        valor: valor,
        categoria: categoria,
        data: hojeISO()
    });

    salvarDados(dados);

    document.getElementById("formGasto").reset();

    renderizarGastos();
    renderizarDashboard();
});