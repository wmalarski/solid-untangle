import { type RouteDefinition, createAsync, useParams } from "@solidjs/router";
import {
	ErrorBoundary,
	Show,
	Suspense,
	createSignal,
	lazy,
	onMount,
} from "solid-js";
import { ErrorFallback } from "~/modules/common/components/error-fallback";
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
			<ErrorBoundary fallback={ErrorFallback}>
				<Suspense fallback={<GameLoader />}>
					<Show when={isMounted()} fallback={<GameLoader />}>
						<GameBoard gameId={params.gameId} player={player()} />
					</Show>
				</Suspense>
			</ErrorBoundary>
		</main>
	);
}
