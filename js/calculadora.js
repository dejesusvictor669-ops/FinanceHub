console.log("carregou: calculadora.js");

function abrirCalculadora() {
    const existente = document.getElementById("modalCalculadora");
    if (existente) {
        existente.remove();
        return;
    }

    const modal = document.createElement("div");
    modal.id = "modalCalculadora";
    modal.innerHTML = `
        <div class="calculadora-overlay">
            <section class="calculadora" role="dialog" aria-modal="true" aria-labelledby="tituloCalculadora">
                <div class="calculadora-topo">
                    <h2 id="tituloCalculadora"><i class="fa-solid fa-calculator"></i> Calculadora</h2>
                    <button type="button" class="calculadora-fechar" aria-label="Fechar calculadora" title="Fechar">&times;</button>
                </div>
                <input id="calculadoraVisor" class="calculadora-visor" type="text" value="0" readonly aria-label="Resultado da calculadora">
                <div class="calculadora-botoes">
                    <button type="button" data-calculadora="clear" class="calculadora-funcao">C</button>
                    <button type="button" data-calculadora="backspace" class="calculadora-funcao">DEL</button>
                    <button type="button" data-calculadora="operator" data-value="/">/</button>
                    <button type="button" data-calculadora="operator" data-value="*">x</button>
                    <button type="button" data-calculadora="number" data-value="7">7</button>
                    <button type="button" data-calculadora="number" data-value="8">8</button>
                    <button type="button" data-calculadora="number" data-value="9">9</button>
                    <button type="button" data-calculadora="operator" data-value="-">-</button>
                    <button type="button" data-calculadora="number" data-value="4">4</button>
                    <button type="button" data-calculadora="number" data-value="5">5</button>
                    <button type="button" data-calculadora="number" data-value="6">6</button>
                    <button type="button" data-calculadora="operator" data-value="+">+</button>
                    <button type="button" data-calculadora="number" data-value="1">1</button>
                    <button type="button" data-calculadora="number" data-value="2">2</button>
                    <button type="button" data-calculadora="number" data-value="3">3</button>
                    <button type="button" data-calculadora="equals" class="calculadora-igual">=</button>
                    <button type="button" data-calculadora="number" data-value="0" class="calculadora-zero">0</button>
                    <button type="button" data-calculadora="decimal" data-value=",">,</button>
                </div>
            </section>
        </div>
    `;
    document.body.appendChild(modal);

    const visor = modal.querySelector("#calculadoraVisor");
    let expressao = "";
    let resultadoExibido = false;

    function atualizarVisor(valor) {
        visor.value = valor || "0";
    }

    function calcular() {
        const tokens = expressao.match(/(?:\d+(?:\.\d*)?|\.\d+)|[+*/-]/g);
        if (!tokens || tokens.join("") !== expressao || tokens.length === 0) throw new Error("expressao invalida");
        const valores = [];
        const operadores = [];
        const precedencia = { "+": 1, "-": 1, "*": 2, "/": 2 };
        const aplicar = () => {
            const operador = operadores.pop();
            const direito = valores.pop();
            const esquerdo = valores.pop();
            if (operador === "/" && direito === 0) throw new Error("divisao por zero");
            valores.push(operador === "+" ? esquerdo + direito : operador === "-" ? esquerdo - direito : operador === "*" ? esquerdo * direito : esquerdo / direito);
        };
        tokens.forEach(token => {
            if (/^[+*/-]$/.test(token)) {
                while (operadores.length && precedencia[operadores[operadores.length - 1]] >= precedencia[token]) aplicar();
                operadores.push(token);
            } else {
                valores.push(Number(token));
            }
        });
        while (operadores.length) aplicar();
        if (!Number.isFinite(valores[0])) throw new Error("resultado invalido");
        return Number(valores[0].toFixed(10));
    }

    modal.querySelectorAll("[data-calculadora]").forEach(botao => {
        botao.addEventListener("click", () => {
            const tipo = botao.dataset.calculadora;
            const valor = botao.dataset.value || "";
            if (tipo === "clear") {
                expressao = "";
                resultadoExibido = false;
                atualizarVisor("0");
            } else if (tipo === "backspace") {
                expressao = expressao.slice(0, -1);
                atualizarVisor(expressao.replaceAll(".", ","));
            } else if (tipo === "number") {
                if (resultadoExibido) expressao = "";
                resultadoExibido = false;
                expressao += valor;
                atualizarVisor(expressao.replaceAll(".", ","));
            } else if (tipo === "decimal") {
                const numeroAtual = expressao.split(/[+*/-]/).pop();
                if (!numeroAtual.includes(".")) {
                    expressao += numeroAtual ? "." : "0.";
                    atualizarVisor(expressao.replaceAll(".", ","));
                }
            } else if (tipo === "operator") {
                if (!expressao && valor !== "-") return;
                if (/[+*/-]$/.test(expressao)) expressao = expressao.slice(0, -1);
                expressao += valor;
                resultadoExibido = false;
                atualizarVisor(expressao.replaceAll(".", ","));
            } else if (tipo === "equals") {
                try {
                    expressao = String(calcular());
                    resultadoExibido = true;
                    atualizarVisor(expressao.replaceAll(".", ","));
                } catch (error) {
                    expressao = "";
                    atualizarVisor("Erro");
                }
            }
        });
    });

    const fechar = () => modal.remove();
    modal.querySelector(".calculadora-fechar").addEventListener("click", fechar);
    modal.querySelector(".calculadora-overlay").addEventListener("click", event => {
        if (event.target === event.currentTarget) fechar();
    });
}