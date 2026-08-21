console.log("carregou: tema.js");

function aplicarTema(claro) {
    if (claro) {
        document.body.classList.add("tema-claro");
    } else {
        document.body.classList.remove("tema-claro");
    }
    localStorage.setItem("financehub_tema", claro ? "claro" : "escuro");
}

function iniciarTema() {
    const salvo = localStorage.getItem("financehub_tema");
    aplicarTema(salvo === "claro");

    const botao = document.getElementById("botaoTema");
    if (!botao) return;

    botao.addEventListener("click", () => {
        const claro = !document.body.classList.contains("tema-claro");
        aplicarTema(claro);
        botao.innerHTML = claro
            ? `<i class="fa-solid fa-moon"></i>`
            : `<i class="fa-solid fa-sun"></i>`;
    });

    const claro = localStorage.getItem("financehub_tema") === "claro";
    botao.innerHTML = claro
        ? `<i class="fa-solid fa-moon"></i>`
        : `<i class="fa-solid fa-sun"></i>`;
}