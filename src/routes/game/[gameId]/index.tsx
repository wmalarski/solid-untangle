import { useParams } from "@solidjs/router";
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

const GameBoard = lazy(() =>
	import("~/modules/game/components/game-board").then((module) => ({
		default: module.GameBoard,
	})),
);

export default function GamePage() {
	const params = useParams();

	const [isMounted, setIsMounted] = createSignal(false);

	onMount(() => {
		setIsMounted(true);
	});

	return (
		<main>
			<ErrorBoundary fallback={ErrorFallback}>
				<Suspense fallback={<GameLoader />}>
					<Show when={isMounted()} fallback={<GameLoader />}>
						<GameBoard gameId={params.gameId} />
					</Show>
				</Suspense>
			</ErrorBoundary>
		</main>
	);
}
