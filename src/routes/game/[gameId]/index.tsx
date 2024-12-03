import type { RouteDefinition } from "@solidjs/router";
import { createGame } from "~/modules/game/utils/creator";
import { Button } from "~/ui/button/button";

export const route = {
	load: async () => {
		await Promise.resolve();
	},
} satisfies RouteDefinition;

export default function Home() {
	return (
		<main>
			<Button
				onClick={() => {
					console.log(createGame(15));
				}}
			>
				Button
			</Button>
			{/* <ul>
				<Index each={new Array(10)}>
					{(_index, index) => (
						<pre>
							{JSON.stringify(
								{
									index: index + 4,
									game: createGame(index + 4),
								},
								null,
								2,
							)}
						</pre>
					)}
				</Index>
			</ul> */}
		</main>
	);
}
