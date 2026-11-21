import { defineConfig } from "vite";
import financeHubLegacyPlugin from "./vite-plugin-financehub.js";

export default defineConfig({
  plugins: [financeHubLegacyPlugin()],
  publicDir: "assets",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: { input: { main: "index.html", landing: "landing.html", termos: "termos.html", privacidade: "privacidade.html" } }
  }
});
