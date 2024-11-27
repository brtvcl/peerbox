import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    include: ["peerjs"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    outDir: "dist",
    assetsDir: "assets",
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        entryFileNames: "bundle.[hash].js",
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: "assets/[name].[hash][extname]",
      },
    },
  },
  css: {
    postcss: {
      plugins: [postcssImport(), tailwindcss(), autoprefixer()],
    },
  },
  server: {
    port: 3000,
    hmr: true,
    historyApiFallback: true,
  },
});
