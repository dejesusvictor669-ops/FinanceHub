console.log("carregou: investimentos.js");

async function renderizarInvestimentos() {
    const dados = await carregarDados();
    const lista = document.getElementById("listaInvestimentos");
    lista.innerHTML = "";

    if (dados.investimentos.length === 0) {
        lista.innerHTML = `<li class="item-linha"><span>Nenhum aporte registrado ainda.</span></li>`;
        return;
    }

    const investOrdenados = [...dados.investimentos].sort((a, b) => new Date(b.data) - new Date(a.data));

    investOrdenados.forEach((aporte) => {
        const item = document.createElement("li");
        item.className = "item-linha";
        item.innerHTML = `
            <div class="info">
                <span>${aporte.descricao}</span>
                <small>${aporte.tipo} • ${formatarData(aporte.data)}</small>
            </div>
            <div style="display:flex;align-items:center;gap:15px;">
                <strong>${formatarMoeda(aporte.valor)}</strong>
                <button class="excluir" data-id="${aporte.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        lista.appendChild(item);
    });

    document.querySelectorAll("#listaInvestimentos .excluir").forEach((botao) => {
        botao.addEventListener("click", () => excluirInvestimento(botao.getAttribute("data-id")));
    });
}

async function excluirInvestimento(id) {
    const dados = await carregarDados();
    dados.investimentos = dados.investimentos.filter((i) => i.id !== id);
    await salvarDados(dados);
    await renderizarInvestimentos();
    await renderizarDashboard();
}

document.getElementById("formInvestimento").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const descricao = document.getElementById("investDescricao").value.trim();
    const valor = parseFloat(document.getElementById("investValor").value);
    const tipo = document.getElementById("investTipo").value;

    if (!descricao || isNaN(valor) || valor <= 0) return;

    const dados = await carregarDados();
    dados.investimentos.push({ id: gerarId(), descricao, valor, tipo, data: hojeISO() });
    await salvarDados(dados);

    document.getElementById("formInvestimento").reset();
    await renderizarInvestimentos();
    await renderizarDashboard();
});