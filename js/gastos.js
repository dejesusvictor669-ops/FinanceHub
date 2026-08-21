console.log("carregou: gastos.js");

let _salvandoGasto = false;

async function renderizarGastos() {
    const dados = await carregarDados();
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

        const descricao = document.createElement("span");
        descricao.textContent = gasto.descricao;

        const info = document.createElement("small");
        info.style.color = "var(--gray)";
        info.textContent = `${gasto.categoria} • ${formatarData(gasto.data)}`;

        const infoDiv = document.createElement("div");
        infoDiv.className = "info";
        infoDiv.appendChild(descricao);
        infoDiv.appendChild(info);

        const valor = document.createElement("strong");
        valor.textContent = formatarMoeda(gasto.valor);

        const botao = document.createElement("button");
        botao.className = "excluir";
        botao.dataset.id = gasto.id;
        botao.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        botao.addEventListener("click", () => excluirGasto(gasto.id));

        const acoes = document.createElement("div");
        acoes.style.cssText = "display:flex;align-items:center;gap:15px;";
        acoes.appendChild(valor);
        acoes.appendChild(botao);

        item.appendChild(infoDiv);
        item.appendChild(acoes);
        lista.appendChild(item);
    });
}

async function excluirGasto(id) {
    const dados = await carregarDados();
    dados.gastos = dados.gastos.filter((g) => g.id !== id);
    await salvarDados(dados);
    await renderizarGastos();
    await renderizarDashboard();
}

document.getElementById("formGasto").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (_salvandoGasto) return;
    _salvandoGasto = true;

    const btn = evento.target.querySelector("button");
    btn.textContent = "Salvando...";
    btn.disabled = true;

    try {
        const descricao = document.getElementById("gastoDescricao").value.trim();
        const valor = parseFloat(document.getElementById("gastoValor").value);
        const categoria = document.getElementById("gastoCategoria").value;
        const data = validarData(document.getElementById("gastoData").value);

        if (!descricao || descricao.length > 200 || isNaN(valor) || valor <= 0 || valor > 9999999) return;

        const dados = await carregarDados();
        dados.gastos.push({
            id: gerarId(),
            descricao,
            valor,
            categoria,
            data
        });

        await salvarDados(dados);
        document.getElementById("formGasto").reset();
        await renderizarGastos();
        await renderizarDashboard();

    } finally {
        _salvandoGasto = false;
        btn.textContent = "Adicionar";
        btn.disabled = false;
    }
});