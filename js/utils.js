console.log("carregou: utils.js");

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