import fs from "node:fs";
import path from "node:path";

const jsOrder = [
  "supabase.js",
  "utils.js",
  "storage.js",
  "toast.js",
  "calculadora.js",
  "tema.js",
  "perfis.js",
  "dashboard.js",
  "gastos.js",
  "cartoes.js",
  "investimentos.js",
  "metas.js",
  "compras.js",
  "rendas.js",
  "graficos.js",
  "relatorios.js",
  "doacao.js",
  "notificacoes.js",
  "app.js"
];

const legacyId = "\0financehub-legacy";

export default function financeHubLegacyPlugin() {
  return {
    name: "financehub-legacy-bundle",

    resolveId(id) {
      if (id === "virtual:financehub-legacy") {
        return legacyId;
      }
    },

    load(id) {
      if (id !== legacyId) return;

      const root = process.cwd();

      const code = jsOrder.map((file) => {
        const filePath = path.join(root, "js", file);

        if (!fs.existsSync(filePath)) {
          throw new Error(`FinanceHub: arquivo não encontrado: ${filePath}`);
        }

        return `\n// ===== ${file} =====\n` +
          fs.readFileSync(filePath, "utf8");
      }).join("\n");

      return code;
    }
  };
}
