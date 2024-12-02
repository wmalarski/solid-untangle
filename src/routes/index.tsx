import type { RouteDefinition } from "@solidjs/router";

export const route = {
	load: async () => {
		await Promise.resolve();
	},
} satisfies RouteDefinition;

export default function Home() {
	return (
		<main>
			<button type="button" class="btn">
				Button
			</button>
		</main>
	);
}
