import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/waterfall-typography/",
  build: { outDir: "build" },
  server: { host: "127.0.0.1", port: 3000 },
  preview: { host: "127.0.0.1" },
  test: { environment: "jsdom" },
});
