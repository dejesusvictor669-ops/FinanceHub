console.log("carregou: compras.js");

async function renderizarCompras() {
    const dados = await carregarDados();
    const container = document.getElementById("containerListas");
    container.innerHTML = "";

    const listas = dados.listasCompras || [];

    if (listas.length === 0) {
        container.innerHTML = `<div class="item-linha"><span>Nenhuma lista criada ainda.</span></div>`;
        return;
    }

    const abertas = listas.filter(l => l.status === "aberta");
    const finalizadas = listas.filter(l => l.status === "finalizada");

    if (abertas.length > 0) {
        const titulo = document.createElement("h3");
        titulo.style.cssText = "margin-bottom:15px; color:var(--gray);";
        titulo.textContent = "📂 Listas abertas";
        container.appendChild(titulo);
        abertas.forEach(l => container.appendChild(montarCartaoLista(l)));
    }

    if (finalizadas.length > 0) {
        const titulo = document.createElement("h3");
        titulo.style.cssText = "margin:25px 0 15px; color:var(--gray);";
        titulo.textContent = "✅ Listas finalizadas";
        container.appendChild(titulo);
        finalizadas.forEach(l => container.appendChild(montarCartaoLista(l)));
    }
}

function montarCartaoLista(lista) {
    const total = lista.itens.length;
    const checked = lista.itens.filter(i => i.checked).length;
    const progresso = total > 0 ? Math.round((checked / total) * 100) : 0;
    const finalizada = lista.status === "finalizada";

    const div = document.createElement("div");
    div.className = "card";
    div.style.marginBottom = "20px";

    const nomeEl = document.createElement("h3");
    nomeEl.style.cssText = "color:var(--text); font-size:18px;";
    nomeEl.textContent = lista.nome;

    const infoEl = document.createElement("small");
    infoEl.style.color = "var(--gray)";
    infoEl.textContent = `${formatarData(lista.data)} • ${checked}/${total} itens`;

    const headerInfo = document.createElement("div");
    headerInfo.appendChild(nomeEl);
    headerInfo.appendChild(infoEl);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.className = "excluir";
    botaoExcluir.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    botaoExcluir.addEventListener("click", () => excluirLista(lista.id));

    const header = document.createElement("div");
    header.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;";
    header.appendChild(headerInfo);
    header.appendChild(botaoExcluir);

    div.appendChild(header);

    if (total > 0) {
        const progressBar = document.createElement("div");
        progressBar.className = "progress";
        progressBar.style.marginBottom = "15px";
        const progressSpan = document.createElement("span");
        progressSpan.style.width = `${progresso}%`;
        progressBar.appendChild(progressSpan);
        div.appendChild(progressBar);
    }

    const ul = document.createElement("ul");
    ul.style.cssText = "display:flex; flex-direction:column; gap:10px; margin-bottom:15px;";

    lista.itens.forEach(item => {
        const li = document.createElement("li");
        li.style.cssText = `display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--bg); border-radius:10px; ${item.checked ? 'opacity:0.5;' : ''}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.disabled = finalizada;
        checkbox.style.cssText = "width:18px; height:18px; cursor:pointer; accent-color:var(--primary);";
        checkbox.addEventListener("change", () => toggleItem(lista.id, item.id));

        const nomeItem = document.createElement("span");
        nomeItem.textContent = item.nome;
        if (item.checked) nomeItem.style.textDecoration = "line-through";

        li.appendChild(checkbox);
        li.appendChild(nomeItem);

        if (!finalizada) {
            const botaoRemover = document.createElement("button");
            botaoRemover.style.cssText = "margin-left:auto; background:none; color:var(--danger); cursor:pointer; font-size:14px;";
            botaoRemover.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
            botaoRemover.addEventListener("click", () => removerItem(lista.id, item.id));
            li.appendChild(botaoRemover);
        }

        ul.appendChild(li);
    });

    div.appendChild(ul);

    if (!finalizada) {
        const inputItem = document.createElement("input");
        inputItem.type = "text";
        inputItem.placeholder = "Adicionar item...";
        inputItem.style.cssText = "flex:1; min-width:140px; padding:10px 14px; border-radius:10px; background:var(--bg); color:var(--text);";
        inputItem.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); adicionarItemLista(lista.id, inputItem); } });

        const btnItem = document.createElement("button");
        btnItem.className = "btn";
        btnItem.textContent = "+ Item";
        btnItem.addEventListener("click", () => adicionarItemLista(lista.id, inputItem));

        const btnFinalizar = document.createElement("button");
        btnFinalizar.className = "btn";
        btnFinalizar.style.background = "var(--success)";
        btnFinalizar.textContent = "✅ Finalizar";
        btnFinalizar.addEventListener("click", () => finalizarLista(lista.id));

        const acoes = document.createElement("div");
        acoes.style.cssText = "display:flex; gap:10px; flex-wrap:wrap;";
        acoes.appendChild(inputItem);
        acoes.appendChild(btnItem);
        acoes.appendChild(btnFinalizar);
        div.appendChild(acoes);
    } else {
        const concluido = document.createElement("div");
        concluido.style.cssText = "display:flex; align-items:center; gap:10px; color:var(--success);";
        concluido.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
        const texto = document.createElement("strong");
        texto.textContent = `Gasto registrado: ${formatarMoeda(lista.valorGasto || 0)}`;
        concluido.appendChild(texto);
        div.appendChild(concluido);
    }

    return div;
}

async function adicionarItemLista(listaId, input) {
    const nome = input.value.trim();
    if (!nome) return;

    const dados = await carregarDados();
    const lista = dados.listasCompras.find(l => l.id === listaId);
    if (!lista) return;

    lista.itens.push({ id: gerarId(), nome, checked: false });
    await salvarDados(dados);
    input.value = "";
    await renderizarCompras();
}

async function removerItem(listaId, itemId) {
    const dados = await carregarDados();
    const lista = dados.listasCompras.find(l => l.id === listaId);
    if (!lista) return;
    lista.itens = lista.itens.filter(i => i.id !== itemId);
    await salvarDados(dados);
    await renderizarCompras();
}

async function toggleItem(listaId, itemId) {
    const dados = await carregarDados();
    const lista = dados.listasCompras.find(l => l.id === listaId);
    if (!lista) return;
    const item = lista.itens.find(i => i.id === itemId);
    if (item) item.checked = !item.checked;
    await salvarDados(dados);
    await renderizarCompras();
}

async function finalizarLista(listaId) {
    const valorStr = prompt("Quanto você gastou nessa compra? (R$)");
    if (valorStr === null) return;

    const valor = parseFloat(valorStr.replace(",", "."));
    if (isNaN(valor) || valor < 0) {
        toastErro("Valor inválido.");
        return;
    }

    const dados = await carregarDados();
    const lista = dados.listasCompras.find(l => l.id === listaId);
    if (!lista) return;

    lista.status = "finalizada";
    lista.valorGasto = valor;

    if (valor > 0) {
        dados.gastos.push({
            id: gerarId(),
            descricao: `🛒 ${lista.nome}`,
            valor,
            categoria: "mercado",
            data: hojeISO()
        });
    }

    await salvarDados(dados);
    await renderizarCompras();
    await renderizarDashboard();
    toastSucesso(`Lista finalizada! ${formatarMoeda(valor)} descontado do saldo.`);
}

async function excluirLista(listaId) {
    if (!confirm("Excluir esta lista?")) return;
    const dados = await carregarDados();
    dados.listasCompras = dados.listasCompras.filter(l => l.id !== listaId);
    await salvarDados(dados);
    await renderizarCompras();
    toastSucesso("Lista excluída!");
}

document.getElementById("formNovaLista").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const nome = document.getElementById("nomeLista").value.trim();
    if (!nome) return;

    const dados = await carregarDados();
    dados.listasCompras.push({
        id: gerarId(),
        nome,
        itens: [],
        status: "aberta",
        valorGasto: 0,
        data: hojeISO()
    });

    await salvarDados(dados);
    document.getElementById("formNovaLista").reset();
    await renderizarCompras();
    toastSucesso("Lista criada!");
});