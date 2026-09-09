console.log("carregou: rendas.js");

let _salvandoRenda = false;

async function renderizarRendas() {
    const dados = await carregarDados();
    const lista = document.getElementById("listaRendas");
    lista.innerHTML = "";

    if (dados.rendasExtras.length === 0) {
        lista.innerHTML = `<li class="item-linha"><span>Nenhuma renda extra cadastrada.</span></li>`;
        return;
    }

    const ordenadas = [...dados.rendasExtras].sort((a, b) => new Date(b.data) - new Date(a.data));

    ordenadas.forEach((renda) => {
        const item = document.createElement("li");
        item.className = "item-linha";

        const descricao = document.createElement("span");
        descricao.textContent = renda.descricao;

        const info = document.createElement("small");
        info.style.color = "var(--gray)";
        info.textContent = formatarData(renda.data);

        const infoDiv = document.createElement("div");
        infoDiv.className = "info";
        infoDiv.appendChild(descricao);
        infoDiv.appendChild(info);

        const valor = document.createElement("strong");
        valor.style.color = "var(--success)";
        valor.textContent = formatarMoeda(renda.valor);

        const botao = document.createElement("button");
        botao.className = "excluir";
        botao.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        botao.addEventListener("click", () => excluirRenda(renda.id));

        const acoes = document.createElement("div");
        acoes.style.cssText = "display:flex;align-items:center;gap:15px;";
        acoes.appendChild(valor);
        acoes.appendChild(botao);

        item.appendChild(infoDiv);
        item.appendChild(acoes);
        lista.appendChild(item);
    });
}

async function excluirRenda(id) {
    const dados = await carregarDados();
    dados.rendasExtras = dados.rendasExtras.filter((r) => r.id !== id);
    await salvarDados(dados);
    await renderizarRendas();
    await renderizarDashboard();
    toastSucesso("Renda excluída!");
}

document.getElementById("formRenda").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (_salvandoRenda) return;
    _salvandoRenda = true;

    const btn = evento.target.querySelector("button");
    btn.textContent = "Salvando...";
    btn.disabled = true;

    try {
        const descricao = document.getElementById("rendaDescricao").value.trim();
        const valor = parseFloat(document.getElementById("rendaValor").value);
        const data = validarData(document.getElementById("rendaData").value);

        if (!descricao || isNaN(valor) || valor <= 0) return;

        const dados = await carregarDados();
        dados.rendasExtras.push({ id: gerarId(), descricao, valor, data });
        await salvarDados(dados);

        document.getElementById("formRenda").reset();
        await renderizarRendas();
        await renderizarDashboard();
        toastSucesso("Renda adicionada!");

    } finally {
        _salvandoRenda = false;
        btn.textContent = "Adicionar";
        btn.disabled = false;
    }
});