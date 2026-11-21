console.log("carregou: privacidade.js");

// ======================================
// PRIVACIDADE / LGPD
// - Baixar meus dados (portabilidade e acesso, art. 18 II e V)
// - Apagar meus dados e conta (eliminação, art. 18 VI)
// ======================================

const VERSAO_TERMOS = "2026-11-21";

async function baixarMeusDados() {
    const usuario = obterUsuario();
    if (!usuario) { toastErro("Entre na sua conta para baixar seus dados."); return; }

    const { data, error } = await obterSupabase()
        .from("dados_financeiros")
        .select("*")
        .eq("user_id", usuario.id)
        .maybeSingle();
    if (error) { toastErro("Não consegui buscar seus dados: " + error.message); return; }

    const pacote = {
        exportado_em: new Date().toISOString(),
        conta: {
            email: usuario.email || "",
            nome: usuario.user_metadata?.nome || "",
            criada_em: usuario.created_at || "",
            aceite_termos_em: usuario.user_metadata?.aceite_termos_em || "",
            versao_termos: usuario.user_metadata?.versao_termos || ""
        },
        dados_financeiros: data || {}
    };
    // a chave secreta dos atalhos não faz parte da exportação
    const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "renda-mais-meus-dados-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toastSucesso("Arquivo com seus dados baixado.");
}

function limparDadosLocais() {
    try {
        Object.keys(localStorage)
            .filter((k) => /^(renda_|financehub_)/.test(k) || k.startsWith("perfis_"))
            .forEach((k) => localStorage.removeItem(k));
        sessionStorage.clear();
    } catch (e) { /* ignora */ }
}

async function apagarMinhaConta() {
    const usuario = obterUsuario();
    if (!usuario) { toastErro("Entre na sua conta para continuar."); return; }

    const ok = window.confirm(
        "Isto apaga PARA SEMPRE todos os seus dados do Renda+ (gastos, cartões, investimentos, metas, relatórios) e encerra sua conta.\n\n" +
        "Se quiser uma cópia, cancele e use \"Baixar meus dados\" antes.\n\nDeseja continuar?"
    );
    if (!ok) return;
    const palavra = window.prompt('Para confirmar, digite EXCLUIR (em maiúsculas):');
    if (palavra !== "EXCLUIR") { toastInfo("Exclusão cancelada."); return; }

    const supabase = obterSupabase();
    let contaRemovida = false;

    // 1) tenta remover a conta inteira (função criada por database/excluir_conta.sql)
    const rpc = await supabase.rpc("excluir_minha_conta");
    if (!rpc.error) {
        contaRemovida = true;
    } else {
        // 2) alternativa: apaga ao menos todos os dados financeiros
        const del = await supabase.from("dados_financeiros").delete().eq("user_id", usuario.id);
        if (del.error) {
            toastErro("Não consegui apagar seus dados: " + del.error.message);
            return;
        }
    }

    try { await sairUsuario(); } catch (e) { /* ignora */ }
    limparDadosLocais();
    alert(contaRemovida
        ? "Pronto. Sua conta e todos os seus dados foram apagados."
        : "Seus dados financeiros foram apagados e você saiu da conta.\n\nPara remover também o seu e-mail de acesso, envie o pedido para o contato informado na Política de Privacidade.");
    location.href = "landing.html";
}

document.getElementById("btnBaixarDados")?.addEventListener("click", baixarMeusDados);
document.getElementById("btnApagarConta")?.addEventListener("click", apagarMinhaConta);
