import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const network = { host: true, port: 5173, strictPort: true, allowedHosts: true };

export default defineConfig({
    plugins: [react()],
    base: './', // makes the build work from any static folder
    server: network,  // npm run dev
    preview: network, // npm run preview (serves the production build)
});