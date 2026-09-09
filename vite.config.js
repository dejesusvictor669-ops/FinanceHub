import { defineConfig } from "vite";
import financeHubLegacyPlugin from "./vite-plugin-financehub.js";

export default defineConfig({
  plugins: [financeHubLegacyPlugin()],
  publicDir: "assets",
  build: { outDir: "dist", emptyOutDir: true }
});
