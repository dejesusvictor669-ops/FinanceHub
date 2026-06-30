// ======================================
// PÁGINA: METAS
// ======================================

function montarHtmlMeta(meta) {
    const porcentagem = Math.min((meta.valorAtual / meta.valorAlvo) * 100, 100);

    return `
        <li class="meta-linha">
            <div class="topo">
                <span>${meta.nome}</span>
                <button class="excluir" data-id="${meta.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="progress">
                <span style="width:${porcentagem}%"></span>
            </div>
            <small>${formatarMoeda(meta.valorAtual)} de ${formatarMoeda(meta.valorAlvo)} (${porcentagem.toFixed(0)}%)</small>
        </li>
    `;
}

function renderizarMetas() {
    const dados = carregarDados();

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

    document.querySelectorAll(".excluir[data-id]").forEach((botao) => {
        const idMeta = botao.getAttribute("data-id");
        const ehMeta = dados.metas.some((m) => m.id === idMeta);

        if (ehMeta) {
            botao.addEventListener("click", () => {
                excluirMeta(idMeta);
            });
        }
    });
}

function excluirMeta(id) {
    const dados = carregarDados();
    dados.metas = dados.metas.filter((m) => m.id !== id);
    salvarDados(dados);

    renderizarMetas();
}

document.getElementById("formMeta").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("metaNome").value.trim();
    const valorAlvo = parseFloat(document.getElementById("metaValorAlvo").value);
    const valorAtual = parseFloat(document.getElementById("metaValorAtual").value) || 0;

    if (!nome || isNaN(valorAlvo) || valorAlvo <= 0) {
        return;
    }

    const dados = carregarDados();

    dados.metas.push({
        id: gerarId(),
        nome: nome,
        valorAlvo: valorAlvo,
        valorAtual: valorAtual
    });

    salvarDados(dados);

    document.getElementById("formMeta").reset();

    renderizarMetas();
});