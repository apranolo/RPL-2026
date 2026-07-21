import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./resources/js/test-utils/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['resources/js/**/*.{ts,tsx}'],
            exclude: [
                'resources/js/test-utils/**',
                'resources/js/**/*.test.{ts,tsx}',
                'resources/js/**/__tests__/**',
                'resources/js/types/**',
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 70,
                statements: 70,
            },
        },
        include: ['resources/js/**/*.test.{ts,tsx}', 'resources/js/**/__tests__/**/*.{ts,tsx}'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
});
