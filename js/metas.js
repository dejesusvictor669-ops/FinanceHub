console.log("carregou: metas.js");

function montarHtmlMeta(meta) {
    const porcentagem = Math.min((meta.valorAtual / meta.valorAlvo) * 100, 100);
    return `
        <li class="meta-linha">
            <div class="topo">
                <span>${meta.nome}</span>
                <button class="excluir-meta" data-id="${meta.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="progress">
                <span style="width:${porcentagem}%"></span>
            </div>
            <small>${formatarMoeda(meta.valorAtual)} de ${formatarMoeda(meta.valorAlvo)} (${porcentagem.toFixed(0)}%)</small>
            <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
                <input type="number" id="aporte-${meta.id}" placeholder="Adicionar valor (R$)" step="0.01"
                    style="flex:1; min-width:140px; padding:10px 14px; border-radius:10px; background:var(--bg); color:var(--text);">
                <button class="btn" style="padding:10px 16px;" onclick="adicionarValorMeta('${meta.id}')">
                    + Adicionar
                </button>
            </div>
        </li>
    `;
}

async function adicionarValorMeta(id) {
    const input = document.getElementById(`aporte-${id}`);
    const valor = parseFloat(input.value);

    if (isNaN(valor) || valor <= 0) {
        alert("Digite um valor válido.");
        return;
    }

    const dados = await carregarDados();
    const meta = dados.metas.find(m => m.id === id);
    if (!meta) return;

    meta.valorAtual = Math.min(meta.valorAtual + valor, meta.valorAlvo);
    await salvarDados(dados);
    await renderizarMetas();

    if (meta.valorAtual >= meta.valorAlvo) {
        alert(`🎉 Meta "${meta.nome}" concluída!`);
    }
}

async function renderizarMetas() {
    const dados = await carregarDados();

    const listaCompleta = document.getElementById("listaMetas");
    const listaResumo = document.getElementById("listaMetasResumo");
    const semMetas = `<li class="item-linha"><span>Nenhuma meta cadastrada ainda.</span></li>`;

    if (dados.metas.length === 0) {
        listaCompleta.innerHTML = semMetas;
        listaResumo.innerHTML = semMetas;
    } else {
        const html = dados.metas.map(montarHtmlMeta).join("");
        listaCompleta.innerHTML = html;
        listaResumo.innerHTML = html;
    }

    document.querySelectorAll(".excluir-meta").forEach((botao) => {
        botao.addEventListener("click", () => excluirMeta(botao.getAttribute("data-id")));
    });
}

async function excluirMeta(id) {
    const dados = await carregarDados();
    dados.metas = dados.metas.filter((m) => m.id !== id);
    await salvarDados(dados);
    await renderizarMetas();
}

document.getElementById("formMeta").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("metaNome").value.trim();
    const valorAlvo = parseFloat(document.getElementById("metaValorAlvo").value);
    const valorAtual = parseFloat(document.getElementById("metaValorAtual").value) || 0;

    if (!nome || isNaN(valorAlvo) || valorAlvo <= 0) return;

    const dados = await carregarDados();
    dados.metas.push({ id: gerarId(), nome, valorAlvo, valorAtual });
    await salvarDados(dados);

    document.getElementById("formMeta").reset();
    await renderizarMetas();
});