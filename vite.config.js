import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'LiquidGlass',
            fileName: (format) => `liquid-glass.${format}.js`,
        },
        rollupOptions: {
            // Ensure external dependencies are not bundled
            external: [],
            output: {
                globals: {},
            },
        },
    },
});