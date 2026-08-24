console.log("carregou: metas.js");

function montarHtmlMeta(meta) {
    const porcentagem = Math.min((meta.valorAtual / meta.valorAlvo) * 100, 100);
    const metaId = sanitizarId(meta.id);
    return `
        <li class="meta-linha">
            <div class="topo">
                <span>${sanitizar(meta.nome)}</span>
                <button class="excluir-meta" data-id="${metaId}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="progress">
                <span style="width:${porcentagem}%"></span>
            </div>
            <small>${formatarMoeda(meta.valorAtual)} de ${formatarMoeda(meta.valorAlvo)} (${porcentagem.toFixed(0)}%)</small>
            <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
                <input type="number" id="aporte-${metaId}" placeholder="Adicionar valor (R$)" step="0.01"
                    style="flex:1; min-width:140px; padding:10px 14px; border-radius:10px; background:var(--bg); color:var(--text);">
                <button class="btn adicionar-meta" data-id="${metaId}" style="padding:10px 16px;">
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
        toastErro("Digite um valor válido.");
        return;
    }

    const dados = await carregarDados();
    const meta = dados.metas.find(m => m.id === id);
    if (!meta) return;

    meta.valorAtual = Math.min(meta.valorAtual + valor, meta.valorAlvo);
    await salvarDados(dados);
    await renderizarMetas();

    if (meta.valorAtual >= meta.valorAlvo) {
        toastSucesso(`🎉 Meta "${meta.nome}" concluída!`);
    } else {
        toastSucesso("Valor adicionado à meta!");
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
    document.querySelectorAll(".adicionar-meta").forEach((botao) => {
        botao.addEventListener("click", () => adicionarValorMeta(botao.getAttribute("data-id")));
    });
}

async function excluirMeta(id) {
    const dados = await carregarDados();
    dados.metas = dados.metas.filter((m) => m.id !== id);
    await salvarDados(dados);
    await renderizarMetas();
    toastSucesso("Meta excluída!");
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
    toastSucesso("Meta criada!");
});