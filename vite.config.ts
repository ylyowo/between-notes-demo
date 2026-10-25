import { defineConfig } from 'vite';

// CI supplies the repository subpath; relative base also supports local static hosting.
export default defineConfig({ base: process.env.PAGES_BASE_PATH || './' });
