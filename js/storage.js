// ======================================
// USUÁRIO (login simples, sem backend)
// ======================================

const CHAVE_USUARIO = "financehub_usuario";

function obterUsuario() {
    return localStorage.getItem(CHAVE_USUARIO);
}

function salvarUsuario(nome) {
    localStorage.setItem(CHAVE_USUARIO, nome);
}

function sairUsuario() {
    localStorage.removeItem(CHAVE_USUARIO);
}

// ======================================
// CAMADA DE ARMAZENAMENTO (localStorage por pessoa)
// ======================================

function chaveStorageAtual() {
    const nome = obterUsuario() || "convidado";
    const nomeNormalizado = nome.trim().toLowerCase().replace(/\s+/g, "-");
    return "financehub_dados_" + nomeNormalizado;
}

function dadosPadrao() {
    return {
        salario: 0,
        metaReserva: 0,
        lazerMensal: 0,
        gastos: [],
        cartoes: [],
        investimentos: [],
        metas: []
    };
}

function carregarDados() {
    const chave = chaveStorageAtual();
    const salvo = localStorage.getItem(chave);

    if (!salvo) {
        const padrao = dadosPadrao();
        salvarDados(padrao);
        return padrao;
    }

    return JSON.parse(salvo);
}

function salvarDados(dados) {
    const chave = chaveStorageAtual();
    localStorage.setItem(chave, JSON.stringify(dados));
}