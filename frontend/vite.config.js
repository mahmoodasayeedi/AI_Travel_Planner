import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Builds straight into ../public so Vercel serves it as static files.
// For local dev, run the backend (vercel dev, or uvicorn app:app --port 3000)
// and `npm run dev` here; /api calls are proxied to it.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "../public", emptyOutDir: true },
  server: { proxy: { "/api": "http://localhost:3000" } },
});
