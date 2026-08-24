console.log("carregou: perfis.js");

async function carregarPerfis() {
    const dados = await carregarDados();
    if (!dados.perfis) dados.perfis = [{ id: "principal", nome: "Principal" }];
    if (!dados.perfilAtivo) dados.perfilAtivo = "principal";
    return dados;
}

async function renderizarSeletorPerfil() {
    const dados = await carregarPerfis();
    const container = document.getElementById("seletorPerfil");
    if (!container) return;

    container.innerHTML = `
        <div style="padding:0 0 15px; border-bottom:1px solid var(--border); margin-bottom:15px;">
            <p style="font-size:11px; color:var(--gray); font-weight:600; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px;">Perfis</p>
            ${dados.perfis.map(p => `
                <div onclick="ativarPerfil('${p.id}')" style="
                    display:flex; align-items:center; gap:10px;
                    padding:10px 12px; border-radius:10px; cursor:pointer;
                    background:${p.id === dados.perfilAtivo ? 'rgba(99,102,241,0.15)' : 'none'};
                    border:1px solid ${p.id === dados.perfilAtivo ? 'rgba(99,102,241,0.3)' : 'transparent'};
                    margin-bottom:5px; transition:.2s;
                ">
                    <div style="
                        width:32px;height:32px;border-radius:50%;
                        background:linear-gradient(135deg,var(--primary),#EC4899);
                        display:flex;align-items:center;justify-content:center;
                        font-size:14px;font-weight:700;
                    ">${p.nome.charAt(0).toUpperCase()}</div>
                    <span style="font-size:14px;flex:1;">${p.nome}</span>
                    ${p.id === dados.perfilAtivo ? '<i class="fa-solid fa-check" style="color:var(--primary);font-size:12px;"></i>' : ''}
                </div>
            `).join("")}
            <button onclick="criarPerfil()" style="
                width:100%; padding:8px; border-radius:10px; border:1px dashed var(--border);
                background:none; color:var(--gray); font-size:13px; cursor:pointer;
                font-family:inherit; margin-top:5px; transition:.2s;
            ">
                <i class="fa-solid fa-plus"></i> Novo perfil
            </button>
        </div>
    `;
}

async function ativarPerfil(id) {
    const dados = await carregarDados();
    dados.perfilAtivo = id;
    await salvarDados(dados);
    location.reload();
}

async function criarPerfil() {
    const nome = prompt("Nome do novo perfil (ex: Casal, Casa, Filhos):");
    if (!nome || !nome.trim()) return;

    const dados = await carregarDados();
    if (!dados.perfis) dados.perfis = [];

    const novoId = "perfil_" + gerarId();
    dados.perfis.push({ id: novoId, nome: nome.trim() });
    dados.perfilAtivo = novoId;
    await salvarDados(dados);

    toastSucesso(`Perfil "${nome}" criado!`);
    location.reload();
}