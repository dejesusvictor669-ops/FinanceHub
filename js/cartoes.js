console.log("carregou: app.js");
// ======================================
// PÁGINA: CARTÕES
// ======================================

function renderizarCartoes() {
    const dados = carregarDados();
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
            <div style="display:flex; align-items:center; gap:15px;">
                <strong>${formatarMoeda(compra.valor)}</strong>
                <button class="excluir" data-id="${compra.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        lista.appendChild(item);
    });

    document.querySelectorAll("#listaCartoes .excluir").forEach((botao) => {
        botao.addEventListener("click", () => {
            excluirCartao(botao.getAttribute("data-id"));
        });
    });
}

function excluirCartao(id) {
    const dados = carregarDados();
    dados.cartoes = dados.cartoes.filter((c) => c.id !== id);
    salvarDados(dados);

    renderizarCartoes();
}

document.getElementById("formCartao").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const descricao = document.getElementById("cartaoDescricao").value.trim();
    const valor = parseFloat(document.getElementById("cartaoValor").value);
    const parcelas = parseInt(document.getElementById("cartaoParcelas").value);
    const nome = document.getElementById("cartaoNome").value.trim();

    if (!descricao || !nome || isNaN(valor) || valor <= 0 || isNaN(parcelas) || parcelas <= 0) {
        return;
    }

    const dados = carregarDados();

    dados.cartoes.push({
        id: gerarId(),
        descricao: descricao,
        valor: valor,
        parcelas: parcelas,
        nome: nome,
        data: hojeISO()
    });

    salvarDados(dados);

    document.getElementById("formCartao").reset();

    renderizarCartoes();
});