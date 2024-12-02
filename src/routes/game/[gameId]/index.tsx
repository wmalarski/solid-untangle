import type { RouteDefinition } from "@solidjs/router";
import { Button } from "~/ui/button/button";

export const route = {
	load: async () => {
		await Promise.resolve();
	},
} satisfies RouteDefinition;

export default function Home() {
	return (
		<main>
			<Button>Button</Button>
		</main>
	);
}
