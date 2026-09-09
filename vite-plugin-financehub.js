import fs from "node:fs";
import path from "node:path";

const jsOrder = ["supabase.js", "utils.js", "storage.js", "toast.js", "calculadora.js", "tema.js", "perfis.js", "dashboard.js", "gastos.js", "cartoes.js", "investimentos.js", "metas.js", "compras.js", "rendas.js", "graficos.js", "relatorios.js", "doacao.js", "notificacoes.js", "app.js"];
const browserAssets = ["supabase.js", "chart.umd.min.js", "qrcode.min.js"];
const legacyId = "\0financehub-legacy";

function financeHubLegacyPlugin() {
  return {
    name: "financehub-legacy-bundle",
    resolveId(id) {
      if (id === "virtual:financehub-legacy") return legacyId;
    },
    load(id) {
      if (id !== legacyId) return;
      const root = process.cwd();
      const code = jsOrder.map((file) => {
        const filePath = path.join(root, "js", file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`FinanceHub: arquivo não encontrado: ${filePath}`);
        }
        return `\n// ===== ${file} =====\n` + fs.readFileSync(filePath, "utf8");
      }).join("\n");

      return code + `\n\n// Compatibilidade com chamadas feitas pelo HTML.\nObject.assign(globalThis, { obterSupabase, formatarMoeda, formatarData, gerarId, hojeISO, sanitizar, sanitizarTexto, sanitizarId, validarData, calcularParcelasCartao, chavePerfis, obterUsuario, obterNomeUsuario, validarDados, dadosPadrao, carregarDados, salvarDados, loginUsuario, cadastrarUsuario, sairUsuario, verificarSessao, mostrarToast, toastSucesso, toastErro, toastInfo, toastAviso, mostrarSkeleton, abrirCalculadora, aplicarTema, iniciarTema, atualizarIconeTema, abrirSeletorTema, selecionarTema, toggleClaro, carregarPerfis, renderizarSeletorPerfil, ativarPerfil, apagarPerfil, criarPerfil, calcularTotais, renderizarDashboard, renderizarResumoMes, preencherFormularioConfig, iniciarListenerConfig, renderizarGastos, iniciarEdicaoGasto, cancelarEdicaoGasto, excluirGasto, renderizarCartoes, excluirCartao, renderizarInvestimentos, excluirInvestimento, montarHtmlMeta, adicionarValorMeta, renderizarMetas, excluirMeta, renderizarCompras, montarCartaoLista, adicionarItemLista, removerItem, toggleItem, finalizarLista, excluirLista, renderizarRendas, excluirRenda, renderizarGraficos, renderizarGraficoMensal, renderizarGraficoCategoria, fecharMes, reabrirMes, carregarRelatorios, abrirRelatorio, renderizarGraficoRelatorio, renderizarGraficoComparacao, campo, calcularCRC16, gerarPayloadPix, renderizarQRCode, copiarPix, verificarModalDoacao, abrirModalDoacao, fecharModalDoacao, renderizarPaginaDoacao, selecionarValorDoacao, registrarServiceWorker, pedirPermissaoNotificacao, notificar, verificarAlertas, inicializar, mostrarTelaLogin, mostrarApp, mostrarPagina, aplicarGastosRecorrentes, iniciarApp, abrirMenu, fecharMenu });\n`;
    },
    generateBundle() {
      const root = process.cwd();
      for (const file of browserAssets) {
        const filePath = path.join(root, "assets", file);
        this.emitFile({
          type: "asset",
          fileName: `assets/${file}`,
          source: fs.readFileSync(filePath)
        });
      }

      this.emitFile({
        type: "asset",
        fileName: "service-worker.js",
        source: fs.readFileSync(path.join(root, "service-worker.js"))
      });
    }
  };
}

export default financeHubLegacyPlugin;
