console.log("carregou: investimentos.js");

let _salvandoInvestimento = false;

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

        const descricao = document.createElement("span");
        descricao.textContent = aporte.descricao;

        const info = document.createElement("small");
        info.style.color = "var(--gray)";
        info.textContent = `${aporte.tipo} • ${formatarData(aporte.data)}`;

        const infoDiv = document.createElement("div");
        infoDiv.className = "info";
        infoDiv.appendChild(descricao);
        infoDiv.appendChild(info);

        const valor = document.createElement("strong");
        valor.textContent = formatarMoeda(aporte.valor);

        const botao = document.createElement("button");
        botao.className = "excluir";
        botao.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        botao.addEventListener("click", () => excluirInvestimento(aporte.id));

        const acoes = document.createElement("div");
        acoes.style.cssText = "display:flex;align-items:center;gap:15px;";
        acoes.appendChild(valor);
        acoes.appendChild(botao);

        item.appendChild(infoDiv);
        item.appendChild(acoes);
        lista.appendChild(item);
    });
}

async function excluirInvestimento(id) {
    const dados = await carregarDados();
    dados.investimentos = dados.investimentos.filter((i) => i.id !== id);
    await salvarDados(dados);
    await renderizarInvestimentos();
    await renderizarDashboard();
    toastSucesso("Aporte excluído!");
}

document.getElementById("formInvestimento").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (_salvandoInvestimento) return;
    _salvandoInvestimento = true;

    const btn = evento.target.querySelector("button");
    btn.textContent = "Salvando...";
    btn.disabled = true;

    try {
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
        toastSucesso("Aporte registrado!");

    } finally {
        _salvandoInvestimento = false;
        btn.textContent = "Adicionar";
        btn.disabled = false;
    }
});