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
                    ">${sanitizar(p.nome.charAt(0).toUpperCase())}</div>
                    <span style="font-size:14px;flex:1;">${sanitizar(p.nome)}</span>
                    ${p.id === dados.perfilAtivo ? '<i class="fa-solid fa-check" style="color:var(--primary);font-size:12px;"></i>' : ''}
                    ${p.id !== "principal" ? '<button type="button" onclick="event.stopPropagation(); apagarPerfil(\'' + p.id + '\')" title="Apagar perfil" aria-label="Apagar perfil" style="border:0;background:transparent;color:var(--gray);cursor:pointer;padding:5px;font-size:12px;"><i class="fa-solid fa-trash"></i></button>' : ''}
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

async function apagarPerfil(id) {
    if (id === "principal") return;

    const dados = await carregarDados();
    const perfil = dados.perfis.find(item => item.id === id);
    if (!perfil || !confirm(`Apagar o perfil "${perfil.nome}"?`)) return;

    dados.perfis = dados.perfis.filter(item => item.id !== id);
    if (dados.perfilAtivo === id) dados.perfilAtivo = "principal";
    await salvarDados(dados);
    toastSucesso(`Perfil "${perfil.nome}" apagado.`);
    location.reload();
}

async function criarPerfil() {
    const modal = document.createElement("div");
    modal.id = "modalNovoPerfil";
    modal.innerHTML = `
        <div style="position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:20px;z-index:10000;">
            <form style="width:min(100%,380px);background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.35);">
                <h3 style="margin:0 0 8px;">Novo perfil</h3>
                <p style="color:var(--gray);font-size:13px;margin:0 0 18px;">Crie um espaço separado para seus dados.</p>
                <input id="novoPerfilNome" type="text" maxlength="50" placeholder="Ex: Casa, Casal ou Filhos" required autofocus style="width:100%;box-sizing:border-box;">
                <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px;">
                    <button type="button" id="cancelarNovoPerfil" style="padding:10px 16px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text);cursor:pointer;font-family:inherit;">Cancelar</button>
                    <button type="submit" class="btn">Criar perfil</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    const form = modal.querySelector("form");
    const fechar = () => modal.remove();
    modal.querySelector("#cancelarNovoPerfil").addEventListener("click", fechar);
    modal.querySelector("div").addEventListener("click", (event) => {
        if (event.target === event.currentTarget) fechar();
    });
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const nome = modal.querySelector("#novoPerfilNome").value.trim();
        if (!nome) return;

        const dados = await carregarDados();
        if (!dados.perfis) dados.perfis = [];

        const novoId = "perfil_" + gerarId();
        dados.perfis.push({ id: novoId, nome });
        dados.perfilAtivo = novoId;
        const salvo = await salvarDados(dados);

        fechar();
        if (!salvo) {
            toastAviso(`Perfil "${nome}" foi criado neste dispositivo, mas os demais dados não foram salvos na nuvem.`);
        } else {
            toastSucesso(`Perfil "${nome}" criado!`);
        }
        location.reload();
    });
}