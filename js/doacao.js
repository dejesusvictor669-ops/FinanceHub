console.log("carregou: doacao.js");

const PIX_CHAVE = "d417af6a-e36e-4738-9a69-3b65f7f2c03c";
const PIX_NOME = "Victor de Jesus";
const PIX_CIDADE = "SAO PAULO";
const PIX_TXID = "kX423wLpLe";

function campo(id, valor) {
    const tam = String(valor.length).padStart(2, "0");
    return `${id}${tam}${valor}`;
}

function calcularCRC16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
}

function gerarPayloadPix(valor) {
    const gui = campo("00", "BR.GOV.BCB.PIX") + campo("01", PIX_CHAVE);
    const merchantInfo = campo("26", gui);
    const nomeLimitado = PIX_NOME.substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cidadeLimitada = PIX_CIDADE.substring(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const payload = campo("00", "01") + merchantInfo + campo("52", "0000") + campo("53", "986") +
        (valor ? campo("54", parseFloat(valor).toFixed(2)) : "") + campo("58", "BR") +
        campo("59", nomeLimitado) + campo("60", cidadeLimitada) + campo("62", campo("05", PIX_TXID)) + "6304";
    return payload + calcularCRC16(payload);
}

function renderizarQRCode(containerId, valor) {
    const container = document.getElementById(containerId);
    if (!container || typeof QRCode === "undefined") return;

    const payload = gerarPayloadPix(valor);
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="canvas-${containerId}" style="border-radius:12px;"></canvas>
            <p style="font-size:12px;color:var(--gray);margin-top:10px;">Escaneie com qualquer banco</p>
            <button onclick="copiarPix('${containerId}')" class="btn" style="margin-top:12px;width:100%;font-size:13px;padding:10px;">
                <i class="fa-regular fa-copy"></i> Copiar código PIX
            </button>
        </div>`;

    QRCode.toCanvas(document.getElementById(`canvas-${containerId}`), payload, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" }
    });
    container.setAttribute("data-payload", payload);
}

function copiarPix(containerId) {
    const container = document.getElementById(containerId);
    const payload = container && container.getAttribute("data-payload");
    if (!payload) return;
    navigator.clipboard.writeText(payload).then(() => toastSucesso("Código PIX copiado!"))
        .catch(() => toastErro("Não foi possível copiar."));
}

function verificarModalDoacao() {
    const hoje = new Date().toISOString().split("T")[0];
    const chave = "renda_doacao_" + hoje;
    if (localStorage.getItem(chave)) return;
    localStorage.setItem(chave, "1");
    setTimeout(() => abrirModalDoacao(), 2000);
}

function abrirModalDoacao() {
    const modal = document.createElement("div");
    modal.id = "modalDoacao";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px;";
    modal.innerHTML = `
        <div style="background:var(--card);border:1px solid var(--border);border-radius:24px;padding:35px 30px;max-width:380px;width:100%;text-align:center;position:relative;">
            <button onclick="fecharModalDoacao()" style="position:absolute;top:15px;right:15px;background:none;border:none;color:var(--gray);font-size:20px;cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
            <div style="font-size:40px;margin-bottom:15px;">☕</div>
            <h2 style="font-size:20px;margin-bottom:10px;">Gostou do Renda+?</h2>
            <p style="color:var(--gray);font-size:14px;line-height:1.6;margin-bottom:20px;">Este sistema é <strong style="color:var(--text)">100% gratuito</strong>. Se ele está te ajudando, considere fazer uma doação!</p>
            <div id="qr-modal-doacao" style="margin-bottom:15px;"></div>
            <button onclick="fecharModalDoacao()" style="margin-top:15px;width:100%;padding:12px;border-radius:12px;background:none;border:1px solid var(--border);color:var(--gray);font-size:13px;cursor:pointer;">Continuar sem doar</button>
        </div>`;
    document.body.appendChild(modal);
    renderizarQRCode("qr-modal-doacao", null);
}

function fecharModalDoacao() {
    const modal = document.getElementById("modalDoacao");
    if (modal) modal.remove();
}

function renderizarPaginaDoacao() {
    const valores = [5, 10, 20, 50];
    renderizarQRCode("qr-pagina-doacao", null);
    const botoesContainer = document.getElementById("botoesValorDoacao");
    if (!botoesContainer) return;
    botoesContainer.innerHTML = valores.map(valor => `
        <button onclick="selecionarValorDoacao(${valor}, this)" class="btn" style="flex:1;min-width:60px;background:rgba(255,255,255,.05);border:1px solid var(--border);color:var(--text);padding:10px;font-size:14px;">R$ ${valor}</button>
    `).join("");
}

function selecionarValorDoacao(valor, botao) {
    renderizarQRCode("qr-pagina-doacao", valor);
    document.querySelectorAll("#botoesValorDoacao .btn").forEach(item => {
        item.style.background = "rgba(255,255,255,0.05)";
        item.style.borderColor = "var(--border)";
        item.style.color = "var(--text)";
    });
    botao.style.background = "var(--primary)";
    botao.style.borderColor = "var(--primary)";
    botao.style.color = "white";
}