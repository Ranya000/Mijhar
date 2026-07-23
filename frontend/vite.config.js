import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// أثناء التطوير: يمرّر طلبات /api إلى خادم الباكند
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
