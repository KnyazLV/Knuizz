import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Setup '@' alias to point to the 'src' directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
