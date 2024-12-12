import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
	server: {
		preset: "cloudflare-pages-static",
		rollupConfig: {
			external: ["node:async_hooks"],
		},
	},
	vite: {
		ssr: {
			noExternal: ["@kobalte/core"],
		},
	},
});
