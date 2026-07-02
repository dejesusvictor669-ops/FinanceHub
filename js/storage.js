console.log("carregou: storage.js");

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

function chaveStorageAtual() {
    const nome = obterUsuario() || "convidado";
    return "financehub_dados_" + nome.trim().toLowerCase().replace(/\s+/g, "-");
}

function dadosPadrao() {
    return {
        salario: 0,
        metaReserva: 0,
        lazerMensal: 0,
        gastos: [],
        cartoes: [],
        investimentos: [],
        rendasExtras: [],
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

    const dados = JSON.parse(salvo);

    if (!dados.rendasExtras) dados.rendasExtras = [];

    dados.investimentos = dados.investimentos.map(i => ({
        ...i,
        tipo: i.tipo || "renda-fixa"
    }));

    return dados;
}

function salvarDados(dados) {
    localStorage.setItem(chaveStorageAtual(), JSON.stringify(dados));
}