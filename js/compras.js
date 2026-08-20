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

    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <div>
                <h3 style="color:var(--text); font-size:18px;">${lista.nome}</h3>
                <small style="color:var(--gray);">${formatarData(lista.data)} • ${checked}/${total} itens</small>
            </div>
            <button class="excluir" onclick="excluirLista('${lista.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>

        ${total > 0 ? `
        <div class="progress" style="margin-bottom:15px;">
            <span style="width:${progresso}%"></span>
        </div>` : ''}

        <ul style="display:flex; flex-direction:column; gap:10px; margin-bottom:15px;">
            ${lista.itens.map(item => `
                <li style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--bg); border-radius:10px; ${item.checked ? 'opacity:0.5;' : ''}">
                    <input type="checkbox" ${item.checked ? 'checked' : ''} ${finalizada ? 'disabled' : ''}
                        onchange="toggleItem('${lista.id}', '${item.id}')"
                        style="width:18px; height:18px; cursor:pointer; accent-color:var(--primary);">
                    <span style="${item.checked ? 'text-decoration:line-through;' : ''}">${item.nome}</span>
                    ${!finalizada ? `
                    <button onclick="removerItem('${lista.id}', '${item.id}')"
                        style="margin-left:auto; background:none; color:var(--danger); cursor:pointer; font-size:14px;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>` : ''}
                </li>
            `).join('')}
        </ul>

        ${!finalizada ? `
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <input type="text" id="novoItem-${lista.id}" placeholder="Adicionar item..."
                style="flex:1; min-width:140px; padding:10px 14px; border-radius:10px; background:var(--bg); color:var(--text);"
                onkeydown="if(event.key==='Enter') adicionarItem('${lista.id}')">
            <button class="btn" onclick="adicionarItem('${lista.id}')">+ Item</button>
            <button class="btn" style="background:var(--success);" onclick="finalizarLista('${lista.id}')">
                ✅ Finalizar
            </button>
        </div>
        ` : `
        <div style="display:flex; align-items:center; gap:10px; color:var(--success);">
            <i class="fa-solid fa-circle-check"></i>
            <strong>Gasto registrado: ${formatarMoeda(lista.valorGasto || 0)}</strong>
        </div>`}
    `;

    return div;
}

async function adicionarItem(listaId) {
    const input = document.getElementById(`novoItem-${listaId}`);
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
        alert("Valor inválido.");
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
    alert(`Lista finalizada! ${formatarMoeda(valor)} descontado do saldo.`);
}

async function excluirLista(listaId) {
    if (!confirm("Excluir esta lista?")) return;

    const dados = await carregarDados();
    dados.listasCompras = dados.listasCompras.filter(l => l.id !== listaId);
    await salvarDados(dados);
    await renderizarCompras();
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
});