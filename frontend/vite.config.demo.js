import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// بناء «ملف عرض للمحكمين»: كل شيء (JS + CSS) مدمج داخل ملف HTML واحد يفتح
// بمجرد الضغط عليه بأي متصفح — بلا خادم ولا تنصيب. يستخدم البيانات النموذجية
// المدمجة (VITE_DEMO=1) فيشتغل حتى بدون إنترنت.
// البناء:  npm run build:demo
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  define: { "import.meta.env.VITE_DEMO": JSON.stringify("1") },
  build: {
    outDir: "dist-demo",
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
});
