console.log("carregou: cartoes.js");

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
        const valorParcela = compra.valor / compra.parcelas;
        const item = document.createElement("li");
        item.className = "item-linha";
        item.innerHTML = `
            <div class="info">
                <span>${compra.descricao}</span>
                <small>${compra.nome} • ${compra.parcelas}x de ${formatarMoeda(valorParcela)} • ${formatarData(compra.data)}</small>
            </div>
            <div style="display:flex;align-items:center;gap:15px;">
                <strong>${formatarMoeda(compra.valor)}</strong>
                <button class="excluir" data-id="${compra.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        lista.appendChild(item);
    });

    document.querySelectorAll("#listaCartoes .excluir").forEach((botao) => {
        botao.addEventListener("click", () => excluirCartao(botao.getAttribute("data-id")));
    });
}

async function excluirCartao(id) {
    const dados = await carregarDados();
    dados.cartoes = dados.cartoes.filter((c) => c.id !== id);
    await salvarDados(dados);
    await renderizarCartoes();
    await renderizarDashboard();
}

document.getElementById("formCartao").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const descricao = document.getElementById("cartaoDescricao").value.trim();
    const valor = parseFloat(document.getElementById("cartaoValor").value);
    const parcelas = parseInt(document.getElementById("cartaoParcelas").value);
    const nome = document.getElementById("cartaoNome").value.trim();

    if (!descricao || !nome || isNaN(valor) || valor <= 0 || isNaN(parcelas) || parcelas <= 0) return;

    const dados = await carregarDados();
    dados.cartoes.push({ id: gerarId(), descricao, valor, parcelas, nome, data: hojeISO() });
    await salvarDados(dados);

    document.getElementById("formCartao").reset();
    await renderizarCartoes();
    await renderizarDashboard();
});