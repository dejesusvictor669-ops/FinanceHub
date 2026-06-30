console.log("carregou: app.js");
// ======================================
// FUNÇÕES AUXILIARES (usadas em todo o sistema)
// ======================================

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function hojeISO() {
    return new Date().toISOString().split("T")[0];
}