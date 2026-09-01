console.log("carregou: gastos.js");

let _salvandoGasto = false;
let _editandoGastoId = null;

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
        info.textContent = `${gasto.categoria} • ${formatarData(gasto.data)}${gasto.recorrente ? " • 🔁 Recorrente" : ""}`;

        const infoDiv = document.createElement("div");
        infoDiv.className = "info";
        infoDiv.appendChild(descricao);
        infoDiv.appendChild(info);

        const valor = document.createElement("strong");
        valor.textContent = formatarMoeda(gasto.valor);

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "acao-btn editar";
        botaoEditar.title = "Editar gasto";
        botaoEditar.innerHTML = `<i class="fa-solid fa-pen"></i>`;
        botaoEditar.addEventListener("click", () => iniciarEdicaoGasto(gasto));

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "acao-btn excluir";
        botaoExcluir.title = "Excluir gasto";
        botaoExcluir.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        botaoExcluir.addEventListener("click", () => excluirGasto(gasto.id));

        const acoes = document.createElement("div");
        acoes.style.cssText = "display:flex;align-items:center;gap:10px;";
        acoes.appendChild(valor);
        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);

        item.appendChild(infoDiv);
        item.appendChild(acoes);
        lista.appendChild(item);
    });
}

function iniciarEdicaoGasto(gasto) {
    _editandoGastoId = gasto.id;

    document.getElementById("gastoDescricao").value = gasto.descricao;
    document.getElementById("gastoValor").value = gasto.valor;
    document.getElementById("gastoCategoria").value = gasto.categoria;
    document.getElementById("gastoData").value = gasto.data;
    document.getElementById("gastoRecorrente").checked = !!gasto.recorrente;

    const form = document.getElementById("formGasto");
    const btn = form.querySelector("button[type='submit']");
    btn.textContent = "Salvar edição";
    btn.style.background = "var(--warning)";

    const btnCancelar = document.getElementById("btnCancelarEdicaoGasto");
    if (btnCancelar) btnCancelar.classList.remove("hidden");

    document.getElementById("gastoDescricao").focus();
    form.scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicaoGasto() {
    _editandoGastoId = null;
    document.getElementById("formGasto").reset();
    const btn = document.querySelector("#formGasto button[type='submit']");
    btn.textContent = "Adicionar";
    btn.style.background = "";

    const btnCancelar = document.getElementById("btnCancelarEdicaoGasto");
    if (btnCancelar) btnCancelar.classList.add("hidden");
}

async function excluirGasto(id) {
    const dados = await carregarDados();
    dados.gastos = dados.gastos.filter((g) => g.id !== id);
    await salvarDados(dados);
    await renderizarGastos();
    await renderizarDashboard();
    toastSucesso("Gasto excluído!");
}

document.getElementById("formGasto").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (_salvandoGasto) return;
    _salvandoGasto = true;

    const btn = evento.target.querySelector("button");
    const textoOriginal = btn.textContent;
    btn.textContent = "Salvando...";
    btn.disabled = true;

    try {
        const descricao = document.getElementById("gastoDescricao").value.trim();
        const valor = parseFloat(document.getElementById("gastoValor").value);
        const categoria = document.getElementById("gastoCategoria").value.toLowerCase();
        const data = validarData(document.getElementById("gastoData").value);
        const recorrente = document.getElementById("gastoRecorrente").checked;

        if (!descricao || descricao.length > 200 || isNaN(valor) || valor <= 0 || valor > 9999999) {
            toastErro("Preencha os campos corretamente.");
            return;
        }

        const dados = await carregarDados();

        if (_editandoGastoId) {
            const idx = dados.gastos.findIndex(g => g.id === _editandoGastoId);
            if (idx !== -1) {
                dados.gastos[idx] = { ...dados.gastos[idx], descricao, valor, categoria, data, recorrente };
            }
            _editandoGastoId = null;
            toastSucesso("Gasto atualizado!");
        } else {
            dados.gastos.push({ id: gerarId(), descricao, valor, categoria, data, recorrente });
            toastSucesso("Gasto adicionado!");
        }

        await salvarDados(dados);
        document.getElementById("formGasto").reset();
        btn.style.background = "";
        cancelarEdicaoGasto();
        await renderizarGastos();
        await renderizarDashboard();

    } catch (err) {
        toastErro("Erro ao salvar gasto.");
        console.error(err);
    } finally {
        _salvandoGasto = false;
        btn.textContent = "Adicionar";
        btn.disabled = false;
        const btnCancelar = document.getElementById("btnCancelarEdicaoGasto");
        if (btnCancelar) btnCancelar.classList.add("hidden");
    }
});