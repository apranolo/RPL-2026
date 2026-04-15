import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            publicDirectory: 'public',
            buildDirectory: 'build',
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        hmr: {
            host: 'localhost',
            port: 5173,
        },
    },
    build:{
        outDir: 'build',
        emptyOutDir: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor code splitting
                    'vendor-react': ['react', 'react-dom', '@inertiajs/react'],
                    'vendor-ui': ['@radix-ui/react-slot', '@radix-ui/react-select', '@radix-ui/react-popover'],
                    'vendor-charts': ['apexcharts', 'react-apexcharts'],
                    'vendor-utils': ['clsx', 'tailwind-merge'],
                },
            },
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            '@': resolve(__dirname, 'resources/js'),
        },
    },
});
