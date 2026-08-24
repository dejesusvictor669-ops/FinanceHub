console.log("carregou: storage.js");

let _usuarioAtual = null;
let _dadosCache = null;

function chavePerfis() {
    return _usuarioAtual ? `financehub_perfis_${_usuarioAtual.id}` : "financehub_perfis";
}

function obterUsuario() {
    return _usuarioAtual;
}

function obterNomeUsuario() {
    return _usuarioAtual ? (_usuarioAtual.user_metadata?.nome || _usuarioAtual.email) : "";
}

// ======================================
// VALIDAÇÃO E SANITIZAÇÃO
// ======================================

function sanitizarTexto(valor, maxLength = 200) {
    return String(valor || "").substring(0, maxLength);
}

function validarDados(dados) {
    if (typeof dados.salario !== "number" || dados.salario < 0 || dados.salario > 9999999) dados.salario = 0;
    if (typeof dados.lazerMensal !== "number" || dados.lazerMensal < 0) dados.lazerMensal = 0;
    if (typeof dados.metaReserva !== "number" || dados.metaReserva < 0) dados.metaReserva = 0;

    if (!Array.isArray(dados.gastos)) dados.gastos = [];
    dados.gastos = dados.gastos.slice(0, 500).map(g => ({
        id: sanitizarTexto(g.id, 50),
        descricao: sanitizarTexto(g.descricao),
        valor: Math.abs(Number(g.valor) || 0),
        categoria: sanitizarTexto(g.categoria, 50),
        data: validarData(g.data),
        recorrente: Boolean(g.recorrente)
    }));

    if (!Array.isArray(dados.perfis) || dados.perfis.length === 0) {
        dados.perfis = [{ id: "principal", nome: "Principal" }];
    }
    dados.perfis = dados.perfis.slice(0, 20).map(perfil => ({
        id: sanitizarTexto(perfil.id, 50),
        nome: sanitizarTexto(perfil.nome, 50) || "Perfil"
    }));
    if (!dados.perfis.some(perfil => perfil.id === dados.perfilAtivo)) {
        dados.perfilAtivo = dados.perfis[0].id;
    }

    if (!Array.isArray(dados.cartoes)) dados.cartoes = [];
    dados.cartoes = dados.cartoes.slice(0, 100).map(c => ({
        id: sanitizarTexto(c.id, 50),
        descricao: sanitizarTexto(c.descricao),
        nome: sanitizarTexto(c.nome, 50),
        valor: Math.abs(Number(c.valor) || 0),
        parcelas: Math.min(Math.max(Number(c.parcelas) || 1, 1), 360),
        data: validarData(c.data)
    }));

    if (!Array.isArray(dados.investimentos)) dados.investimentos = [];
    dados.investimentos = dados.investimentos.slice(0, 200).map(i => ({
        id: sanitizarTexto(i.id, 50),
        descricao: sanitizarTexto(i.descricao),
        banco: sanitizarTexto(i.banco, 100),
        valor: Math.abs(Number(i.valor) || 0),
        tipo: sanitizarTexto(i.tipo, 50),
        data: validarData(i.data)
    }));

    if (!Array.isArray(dados.rendasExtras)) dados.rendasExtras = [];
    dados.rendasExtras = dados.rendasExtras.slice(0, 200).map(r => ({
        id: sanitizarTexto(r.id, 50),
        descricao: sanitizarTexto(r.descricao),
        valor: Math.abs(Number(r.valor) || 0),
        data: validarData(r.data)
    }));

    if (!Array.isArray(dados.metas)) dados.metas = [];
    dados.metas = dados.metas.slice(0, 50).map(m => ({
        id: sanitizarTexto(m.id, 50),
        nome: sanitizarTexto(m.nome, 100),
        valorAlvo: Math.abs(Number(m.valorAlvo) || 0),
        valorAtual: Math.abs(Number(m.valorAtual) || 0)
    }));

    if (!Array.isArray(dados.relatorios)) dados.relatorios = [];
    dados.relatorios = dados.relatorios.slice(0, 120);

    if (!Array.isArray(dados.listasCompras)) dados.listasCompras = [];
    dados.listasCompras = dados.listasCompras.slice(0, 100).map(l => ({
        id: sanitizarTexto(l.id, 50),
        nome: sanitizarTexto(l.nome, 100),
        status: l.status === "finalizada" ? "finalizada" : "aberta",
        valorGasto: Math.abs(Number(l.valorGasto) || 0),
        data: validarData(l.data),
        itens: (Array.isArray(l.itens) ? l.itens : []).slice(0, 200).map(i => ({
            id: sanitizarTexto(i.id, 50),
            nome: sanitizarTexto(i.nome, 100),
            checked: !!i.checked
        }))
    }));

    return dados;
}

// ======================================
// DADOS PADRÃO
// ======================================

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
        listasCompras: [],
        perfis: [{ id: "principal", nome: "Principal" }],
        perfilAtivo: "principal"
    };
}

// ======================================
// CARREGAR DADOS DO SUPABASE
// ======================================

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
        listasCompras: data.listas_compras || [],
        perfis: data.perfis || [{ id: "principal", nome: "Principal" }],
        perfilAtivo: data.perfil_ativo || "principal"
    };

    const perfisLocais = localStorage.getItem(chavePerfis());
    if (perfisLocais) {
        try {
            const perfilData = JSON.parse(perfisLocais);
            _dadosCache.perfis = perfilData.perfis;
            _dadosCache.perfilAtivo = perfilData.perfilAtivo;
        } catch (error) {
            localStorage.removeItem(chavePerfis());
        }
    }

    return _dadosCache;
}

// ======================================
// SALVAR DADOS NO SUPABASE
// ======================================

async function salvarDados(dados) {
    dados = validarDados(dados);
    _dadosCache = null;
    const dadosParaSalvar = { ...dados };
    localStorage.setItem(chavePerfis(), JSON.stringify({
        perfis: dadosParaSalvar.perfis,
        perfilAtivo: dadosParaSalvar.perfilAtivo
    }));

    const { error } = await sb
        .from("dados_financeiros")
        .upsert({
            user_id: _usuarioAtual.id,
            salario: dadosParaSalvar.salario,
            lazer_mensal: dadosParaSalvar.lazerMensal,
            meta_reserva: dadosParaSalvar.metaReserva,
            gastos: dadosParaSalvar.gastos,
            cartoes: dadosParaSalvar.cartoes,
            investimentos: dadosParaSalvar.investimentos,
            rendas_extras: dadosParaSalvar.rendasExtras,
            metas: dadosParaSalvar.metas,
            relatorios: dadosParaSalvar.relatorios,
            listas_compras: dadosParaSalvar.listasCompras,
            updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

    if (error) {
        console.error("Erro ao salvar:", error.message);
        return false;
    } else {
        _dadosCache = dadosParaSalvar;
        return true;
    }
}

// ======================================
// AUTH
// ======================================

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