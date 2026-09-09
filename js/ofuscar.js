const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const path = require("path");

const arquivos = [
    "js/app.js",
    "js/storage.js",
    "js/supabase.js",
    "js/utils.js",
    "js/dashboard.js",
    "js/gastos.js",
    "js/cartoes.js",
    "js/investimentos.js",
    "js/metas.js",
    "js/rendas.js",
    "js/compras.js",
    "js/graficos.js",
    "js/relatorios.js",
    "js/toast.js",
    "js/tema.js",
    "js/perfis.js",
    "js/doacao.js",
    "js/notificacoes.js",
    "js/calculadora.js"
];

const opcoes = {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: false,
    selfDefending: false,
    stringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.75,
    transformObjectKeys: false,
    unicodeEscapeSequence: false
};

let ok = 0;
let erro = 0;

arquivos.forEach((arquivo) => {
    const caminho = path.join(__dirname, arquivo);

    if (!fs.existsSync(caminho)) {
        console.log(`⚠️  Não encontrado: ${arquivo}`);
        return;
    }

    try {
        const codigo = fs.readFileSync(caminho, "utf8");
        const resultado = JavaScriptObfuscator.obfuscate(codigo, opcoes);
        fs.writeFileSync(caminho, resultado.getObfuscatedCode(), "utf8");
        console.log(`✅ ${arquivo}`);
        ok++;
    } catch (e) {
        console.log(`❌ ${arquivo} — ${e.message}`);
        erro++;
    }
});

console.log(`\nPronto! ${ok} ofuscados, ${erro} erros.`);