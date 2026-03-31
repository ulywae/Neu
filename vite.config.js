import { defineConfig } from "vite";

export default defineConfig({
  root: ".", 
  base: "/", 
  build: {
    outDir: "dist", 
    emptyOutDir: true, 
    rollupOptions: {
      plugins: [], 
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: {
      "@app": "/src/core",
      "@pages": "/src/pages",
    },
  },
});
