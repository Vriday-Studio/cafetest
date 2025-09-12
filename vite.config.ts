import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://n8n.srv954455.hstgr.cloud", // your n8n server
        changeOrigin: true,
        secure: false, // allow self-signed SSL if needed
      },
    },
  },
});
