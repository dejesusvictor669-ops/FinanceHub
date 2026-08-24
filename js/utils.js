console.log("carregou: utils.js");

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "";
    const partes = String(data).split("-").map(Number);
    if (partes.length === 3 && partes.every(Number.isFinite)) {
        return new Date(partes[0], partes[1] - 1, partes[2]).toLocaleDateString("pt-BR");
    }
    return new Date(data).toLocaleDateString("pt-BR");
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function hojeISO() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

function sanitizar(texto) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(String(texto || "")));
    return div.innerHTML;
}

function validarData(data) {
    if (!data) return hojeISO();
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) return hojeISO();
    const d = new Date(data);
    if (isNaN(d.getTime())) return hojeISO();
    return data;
}

function calcularParcelasCartao(compra, hoje = new Date()) {
    const [ano, mes] = validarData(compra.data).split("-").map(Number);
    const diferencaMeses = (hoje.getFullYear() - ano) * 12 + hoje.getMonth() + 1 - mes;
    const parcelasPagas = Math.min(Math.max(diferencaMeses, 0), compra.parcelas);
    return {
        parcelasPagas,
        parcelasRestantes: compra.parcelas - parcelasPagas,
        valorParcela: compra.valor / compra.parcelas
    };
}