console.log("carregou: cartoes.js");

let _salvandoCartao = false;
let _editandoCartaoId = null;

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

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "acao-btn editar";
        botaoEditar.title = "Editar";
        botaoEditar.setAttribute("aria-label", "Editar compra");
        botaoEditar.innerHTML = `<i class="fa-solid fa-pen"></i>`;
        botaoEditar.addEventListener("click", () => iniciarEdicaoCartao(compra));

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "acao-btn excluir";
        botaoExcluir.title = "Excluir";
        botaoExcluir.setAttribute("aria-label", "Excluir compra");
        botaoExcluir.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        botaoExcluir.addEventListener("click", () => excluirCartao(compra.id));

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

function iniciarEdicaoCartao(compra) {
    _editandoCartaoId = compra.id;

    document.getElementById("cartaoDescricao").value = compra.descricao;
    document.getElementById("cartaoValor").value = compra.valor;
    document.getElementById("cartaoParcelas").value = compra.parcelas;
    document.getElementById("cartaoData").value = compra.data;
    document.getElementById("cartaoNome").value = compra.nome;

    const btn = document.querySelector("#formCartao button[type='submit']");
    if (btn) { btn.textContent = "Salvar edição"; btn.style.background = "var(--warning)"; }

    document.getElementById("btnCancelarEdicaoCartao").classList.remove("hidden");
    document.getElementById("cartaoDescricao").focus();
    document.getElementById("formCartao").scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicaoCartao() {
    _editandoCartaoId = null;
    document.getElementById("formCartao").reset();

    const btn = document.querySelector("#formCartao button[type='submit']");
    if (btn) { btn.textContent = "Adicionar"; btn.style.background = ""; }

    document.getElementById("btnCancelarEdicaoCartao").classList.add("hidden");
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

    const btn = evento.target.querySelector("button[type='submit']");
    if (btn) { btn.textContent = "Salvando..."; btn.disabled = true; }

    try {
        const descricao = document.getElementById("cartaoDescricao").value.trim();
        const valor = parseFloat(document.getElementById("cartaoValor").value);
        const parcelas = parseInt(document.getElementById("cartaoParcelas").value);
        const data = validarData(document.getElementById("cartaoData")?.value || "");
        const nome = document.getElementById("cartaoNome").value.trim();

        if (!descricao || !nome || isNaN(valor) || valor <= 0 || valor > 9999999 || isNaN(parcelas) || parcelas <= 0 || parcelas > 360) {
            toastErro("Preencha todos os campos corretamente.");
            return;
        }

        const dados = await carregarDados();
        if (_editandoCartaoId) {
            const indice = dados.cartoes.findIndex((cartao) => cartao.id === _editandoCartaoId);
            if (indice !== -1) {
                dados.cartoes[indice] = { ...dados.cartoes[indice], descricao, valor, parcelas, nome, data };
            }
        } else {
            dados.cartoes.push({ id: gerarId(), descricao, valor, parcelas, nome, data });
        }

        await salvarDados(dados);

        const estavaEditando = Boolean(_editandoCartaoId);
        cancelarEdicaoCartao();
        await renderizarCartoes();
        await renderizarDashboard();
        toastSucesso(estavaEditando ? "Compra atualizada!" : "Compra adicionada!");

    } catch (err) {
        toastErro("Erro ao salvar compra.");
        console.error(err);
    } finally {
        _salvandoCartao = false;
        if (btn) { btn.textContent = "Adicionar"; btn.disabled = false; }
    }
});

document.getElementById("btnCancelarEdicaoCartao").addEventListener("click", cancelarEdicaoCartao);