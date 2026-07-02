console.log("carregou: rendas.js");

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
        item.innerHTML = `
            <div class="info">
                <span>${renda.descricao}</span>
                <small>${formatarData(renda.data)}</small>
            </div>
            <div style="display:flex;align-items:center;gap:15px;">
                <strong style="color:var(--success)">${formatarMoeda(renda.valor)}</strong>
                <button class="excluir" data-id="${renda.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        lista.appendChild(item);
    });

    document.querySelectorAll("#listaRendas .excluir").forEach((botao) => {
        botao.addEventListener("click", () => excluirRenda(botao.getAttribute("data-id")));
    });
}

async function excluirRenda(id) {
    const dados = await carregarDados();
    dados.rendasExtras = dados.rendasExtras.filter((r) => r.id !== id);
    await salvarDados(dados);
    await renderizarRendas();
    await renderizarDashboard();
}

document.getElementById("formRenda").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const descricao = document.getElementById("rendaDescricao").value.trim();
    const valor = parseFloat(document.getElementById("rendaValor").value);
    const dataInput = document.getElementById("rendaData").value;
    const data = dataInput || hojeISO();

    if (!descricao || isNaN(valor) || valor <= 0) return;

    const dados = await carregarDados();
    dados.rendasExtras.push({ id: gerarId(), descricao, valor, data });
    await salvarDados(dados);

    document.getElementById("formRenda").reset();
    await renderizarRendas();
    await renderizarDashboard();
});