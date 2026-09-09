console.log("carregou: metas.js");

let _salvandoMeta = false;

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
                    style="flex:1; min-width:140px; padding:10px 14px; border-radius:10px; background:var(--bg); color:var(--text); border:1px solid var(--border);">
                <button class="btn adicionar-meta" data-id="${metaId}" style="padding:10px 16px;">
                    + Adicionar
                </button>
            </div>
        </li>
    `;
}

async function adicionarValorMeta(id) {
    const input = document.getElementById(`aporte-${id}`);
    if (!input) return;

    const valor = parseFloat(input.value);
    if (isNaN(valor) || valor <= 0) {
        toastErro("Digite um valor válido.");
        return;
    }

    const dados = await carregarDados();
    const meta = dados.metas.find(m => sanitizarId(m.id) === id || m.id === id);
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
        if (listaCompleta) listaCompleta.innerHTML = semMetas;
        if (listaResumo) listaResumo.innerHTML = semMetas;
    } else {
        const html = dados.metas.map(montarHtmlMeta).join("");
        if (listaCompleta) listaCompleta.innerHTML = html;
        if (listaResumo) listaResumo.innerHTML = html;
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
    dados.metas = dados.metas.filter((m) => sanitizarId(m.id) !== id && m.id !== id);
    await salvarDados(dados);
    await renderizarMetas();
    toastSucesso("Meta excluída!");
}

document.getElementById("formMeta").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (_salvandoMeta) return;
    _salvandoMeta = true;

    const btn = evento.target.querySelector("button[type='submit']");
    if (btn) { btn.textContent = "Salvando..."; btn.disabled = true; }

    try {
        const nome = document.getElementById("metaNome").value.trim();
        const valorAlvo = parseFloat(document.getElementById("metaValorAlvo").value);
        const valorAtual = parseFloat(document.getElementById("metaValorAtual").value) || 0;

        if (!nome || isNaN(valorAlvo) || valorAlvo <= 0) {
            toastErro("Preencha o nome e o valor alvo.");
            return;
        }

        const dados = await carregarDados();
        dados.metas.push({ id: gerarId(), nome, valorAlvo, valorAtual });
        await salvarDados(dados);

        document.getElementById("formMeta").reset();
        await renderizarMetas();
        toastSucesso("Meta criada!");

    } catch (err) {
        toastErro("Erro ao criar meta.");
        console.error(err);
    } finally {
        _salvandoMeta = false;
        if (btn) { btn.textContent = "Adicionar"; btn.disabled = false; }
    }
});