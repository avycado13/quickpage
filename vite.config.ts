import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
		tailwindcss(),
		cloudflare(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["vite.svg"],
			manifest: {
				name: "quickpage",
				short_name: "quickpage",
				description: "Your Google productivity dashboard",
				theme_color: "#1a1a1a",
				background_color: "#1a1a1a",
				display: "standalone",
				start_url: "/",
				icons: [
					{
						src: "/vite.svg",
						sizes: "any",
						type: "image/svg+xml",
						purpose: "any",
					},
				],
			},
			workbox: {
				navigateFallback: "/index.html",
				globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
				// Don't precache the privacy/terms standalone pages.
				navigateFallbackDenylist: [/^\/privacy\.html$/, /^\/terms\.html$/],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		minify: "terser",
		terserOptions: {
			compress: {
				// Drop noisy debug logging in production, keep warn/error.
				drop_debugger: true,
				pure_funcs: ["console.log", "console.debug", "console.info"],
			},
		},
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						// Keep the React runtime in one chunk — react/react-dom/scheduler
						// always load together, and splitting them invites
						// init-order errors from their circular references.
						if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
							return "vendor-react";
						}
						const pkg = id.match(/node_modules\/([^/]+)/)?.[1];
						if (pkg) return `vendor-${pkg}`;
					}
				},
			},
		},
	},
});
