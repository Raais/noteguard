import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => ({
	server: {
		port: 5172,
		headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
	},
	base: '/noteguard/',
	plugins: [
		nodePolyfills(),
		tsconfigPaths(),
		react(),
	],
	optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
	},
	build: {
    commonjsOptions: { transformMixedEsModules: true },
  }
}))
