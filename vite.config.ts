import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist',
        content: ['papers.js'], // Ensure we don't clobber papers if they were in dist (they aren't)
    },
    server: {
        port: 5000,
        open: true,
    }
});
