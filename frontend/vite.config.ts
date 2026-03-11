import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: ".",
    build: {
      outDir: "dist",
      target: "es2020",
    },
    server: {
      port: 5173,
      allowedHosts: env.VITE_NGROK_HOST ? [env.VITE_NGROK_HOST] : [],
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
