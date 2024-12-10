/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
	readonly VITE_WEBRTC_SIGNALING_URLS: string;
}

// biome-ignore lint/correctness/noUnusedVariables: Needed
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
