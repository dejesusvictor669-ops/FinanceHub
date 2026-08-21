console.log("carregou: toast.js");

function mostrarToast(mensagem, tipo = "success", duracao = 3000) {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const icones = {
        success: "fa-circle-check",
        error: "fa-circle-xmark",
        info: "fa-circle-info",
        warning: "fa-triangle-exclamation"
    };

    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <i class="fa-solid ${icones[tipo] || icones.info}"></i>
        <span>${mensagem}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("saindo");
        setTimeout(() => toast.remove(), 300);
    }, duracao);
}

function toastSucesso(msg) { mostrarToast(msg, "success"); }
function toastErro(msg) { mostrarToast(msg, "error"); }
function toastInfo(msg) { mostrarToast(msg, "info"); }
function toastAviso(msg) { mostrarToast(msg, "warning"); }

function mostrarSkeleton(containerId, quantidade = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = Array(quantidade).fill(`
        <div class="skeleton-card" style="margin-bottom:15px;">
            <div class="skeleton" style="width:40%; margin-bottom:12px;"></div>
            <div class="skeleton" style="width:70%; height:30px;"></div>
        </div>
    `).join("");
}