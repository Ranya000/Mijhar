import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// تطبيق مستقل — واجهة "ظِلّ" (Shadow Agent)
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { port: 5174 },
});
