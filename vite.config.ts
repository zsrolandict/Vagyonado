import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: false,
    configure(proxy) {
      // Keep the browser's actual host for the API's same-origin check.
      proxy.on('proxyReq', (outgoing, incoming) => {
        if (incoming.headers.host) outgoing.setHeader('host', incoming.headers.host);
      });
    },
  } } },
});
