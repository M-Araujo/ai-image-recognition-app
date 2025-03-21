import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom", // ✅ Simulates a browser
    setupFiles: "./vitest.setup.js", // ✅ Ensure this file exists
  },
  base: '/ai-image-recognition-app/',
});

