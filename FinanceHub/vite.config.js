import { defineConfig } from "vite";
import financeHubLegacyPlugin from "./vite-plugin-financehub.js";

export default defineConfig({
  plugins: [financeHubLegacyPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
