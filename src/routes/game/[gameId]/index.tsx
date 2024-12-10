import { createAsync, useParams, type RouteDefinition } from "@solidjs/router";
import { createSignal, lazy, onMount, Show, Suspense } from "solid-js";
import { GameLoader } from "~/modules/game/components/game-loader";
import { getPlayerLoader } from "~/modules/player/server/client";

const GameBoard = lazy(() =>
	import("~/modules/game/components/game-board").then((module) => ({
		default: module.GameBoard,
	})),
);

export const route = {
	load: async () => {
		await getPlayerLoader();
	},
} satisfies RouteDefinition;

export default function GamePage() {
	const params = useParams();
	const player = createAsync(() => getPlayerLoader());

	const [isMounted, setIsMounted] = createSignal(false);

	onMount(() => {
		setIsMounted(true);
	});

	return (
		<main>
			<Suspense fallback={<GameLoader />}>
				<Show when={isMounted()} fallback={<GameLoader />}>
					<GameBoard gameId={params.gameId} player={player()} />
				</Show>
			</Suspense>
		</main>
	);
}
