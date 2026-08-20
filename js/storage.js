console.log("carregou: storage.js");

let _usuarioAtual = null;
let _dadosCache = null;

function obterUsuario() {
    return _usuarioAtual;
}

function obterNomeUsuario() {
    return _usuarioAtual ? (_usuarioAtual.user_metadata?.nome || _usuarioAtual.email) : "";
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
        metas: [],
        relatorios: [],
        listasCompras: []
    };
}

async function carregarDados() {
    if (_dadosCache) return _dadosCache;

    const { data, error } = await sb
        .from("dados_financeiros")
        .select("*")
        .single();

    if (error || !data) {
        _dadosCache = dadosPadrao();
        return _dadosCache;
    }

    _dadosCache = {
        salario: data.salario || 0,
        metaReserva: data.meta_reserva || 0,
        lazerMensal: data.lazer_mensal || 0,
        gastos: data.gastos || [],
        cartoes: data.cartoes || [],
        investimentos: (data.investimentos || []).map(i => ({
            ...i,
            tipo: i.tipo || "renda-fixa"
        })),
        rendasExtras: data.rendas_extras || [],
        metas: data.metas || [],
        relatorios: data.relatorios || [],
        listasCompras: data.listas_compras || []
    };

    return _dadosCache;
}

async function salvarDados(dados) {
    _dadosCache = dados;

    const { error } = await sb
        .from("dados_financeiros")
        .upsert({
            user_id: _usuarioAtual.id,
            salario: dados.salario,
            lazer_mensal: dados.lazerMensal,
            meta_reserva: dados.metaReserva,
            gastos: dados.gastos,
            cartoes: dados.cartoes,
            investimentos: dados.investimentos,
            rendas_extras: dados.rendasExtras,
            metas: dados.metas,
            relatorios: dados.relatorios,
            listas_compras: dados.listasCompras,
            updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

    if (error) {
        console.error("Erro ao salvar:", error.message);
    }
}

async function loginUsuario(email, senha) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(error.message);
    _usuarioAtual = data.user;
    _dadosCache = null;
    return data.user;
}

async function cadastrarUsuario(nome, email, senha) {
    const { data, error } = await sb.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } }
    });
    if (error) throw new Error(error.message);
    _usuarioAtual = data.user;
    await sb.from("dados_financeiros").insert({
        user_id: data.user.id,
        nome,
        ...dadosPadrao()
    });
    _dadosCache = null;
    return data.user;
}

async function sairUsuario() {
    await sb.auth.signOut();
    _usuarioAtual = null;
    _dadosCache = null;
}

async function verificarSessao() {
    const { data } = await sb.auth.getSession();
    if (data.session) {
        _usuarioAtual = data.session.user;
        return true;
    }
    return false;
}