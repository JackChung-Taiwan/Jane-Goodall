import {defineConfig} from 'vite';
export default defineConfig({
 base:(globalThis as unknown as {process:{env:Record<string,string>}}).process.env.VITE_BASE || './',
 build:{rollupOptions:{output:{manualChunks:{three:['three']}}}}
});
