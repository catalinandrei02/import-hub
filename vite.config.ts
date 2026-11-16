import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Served from https://<user>.github.io/import-hub/ on GitHub Pages.
export default defineConfig({
  base: "./",
  plugins: [vue()],
  // firebase (~620 kB, 186 kB gzip) is loaded lazily, only once a Firebase config exists.
  build: { target: "es2022", sourcemap: false, chunkSizeWarningLimit: 700 },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
} as any);
