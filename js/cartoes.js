console.log("carregou: cartoes.js");

let _salvandoCartao = false;

document.getElementById("cartaoData").value = hojeISO();

async function renderizarCartoes() {
    const dados = await carregarDados();
    const lista = document.getElementById("listaCartoes");
    lista.innerHTML = "";

    if (dados.cartoes.length === 0) {
        lista.innerHTML = `<li class="item-linha"><span>Nenhuma compra cadastrada ainda.</span></li>`;
        return;
    }

    const cartoesOrdenados = [...dados.cartoes].sort((a, b) => new Date(b.data) - new Date(a.data));

    cartoesOrdenados.forEach((compra) => {
        const parcelas = calcularParcelasCartao(compra);
        const item = document.createElement("li");
        item.className = "item-linha";

        const descricao = document.createElement("span");
        descricao.textContent = compra.descricao;

        const info = document.createElement("small");
        info.style.color = "var(--gray)";
        info.textContent = `${compra.nome} • ${compra.parcelas}x de ${formatarMoeda(parcelas.valorParcela)} • ${formatarData(compra.data)} • ${parcelas.parcelasPagas} pagas, ${parcelas.parcelasRestantes} restantes`;

        const infoDiv = document.createElement("div");
        infoDiv.className = "info";
        infoDiv.appendChild(descricao);
        infoDiv.appendChild(info);

        const valor = document.createElement("strong");
        valor.textContent = formatarMoeda(compra.valor);

        const botao = document.createElement("button");
        botao.className = "excluir";
        botao.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        botao.addEventListener("click", () => excluirCartao(compra.id));

        const acoes = document.createElement("div");
        acoes.style.cssText = "display:flex;align-items:center;gap:15px;";
        acoes.appendChild(valor);
        acoes.appendChild(botao);

        item.appendChild(infoDiv);
        item.appendChild(acoes);
        lista.appendChild(item);
    });
}

async function excluirCartao(id) {
    const dados = await carregarDados();
    dados.cartoes = dados.cartoes.filter((c) => c.id !== id);
    await salvarDados(dados);
    await renderizarCartoes();
    await renderizarDashboard();
    toastSucesso("Compra excluída!");
}

document.getElementById("formCartao").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (_salvandoCartao) return;
    _salvandoCartao = true;

    const btn = evento.target.querySelector("button");
    btn.textContent = "Salvando...";
    btn.disabled = true;

    try {
        const descricao = document.getElementById("cartaoDescricao").value.trim();
        const valor = parseFloat(document.getElementById("cartaoValor").value);
        const parcelas = parseInt(document.getElementById("cartaoParcelas").value);
        const data = document.getElementById("cartaoData").value;
        const nome = document.getElementById("cartaoNome").value.trim();

        if (!descricao || !nome || !data || isNaN(valor) || valor <= 0 || isNaN(parcelas) || parcelas <= 0) return;

        const dados = await carregarDados();
        dados.cartoes.push({ id: gerarId(), descricao, valor, parcelas, nome, data });
        await salvarDados(dados);

        document.getElementById("formCartao").reset();
        await renderizarCartoes();
        await renderizarDashboard();
        toastSucesso("Compra adicionada!");

    } finally {
        _salvandoCartao = false;
        btn.textContent = "Adicionar";
        btn.disabled = false;
    }
});