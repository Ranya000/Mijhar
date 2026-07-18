import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // بروكسي للتطوير: أي طلب لـ /api يروح للباكند على 3000 بدون مشاكل CORS.
    // بهذا تقدر تترك VITE_API_URL فاضياً محلياً وتستخدم مسار نسبي.
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
