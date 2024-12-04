import { createSignal, Show, Suspense, type Component } from "solid-js";
import type { Player } from "~/modules/player/server/server";
import { CursorsStateProvider } from "../contexts/cursors-state";
import { GameStateProvider } from "../contexts/game-state";
import { SelectionStateProvider } from "../contexts/selection-state";
import { PixiStage } from "../pixi/pixi-stage";
import type { Connection, Point2D } from "../utils/types";
import { SuccessConfetti } from "./success-confetti";

const ClientBoard: Component = () => {
	const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();

	return (
		<>
			<canvas class="size-full bg-base-100" ref={setCanvas} />
			<Show when={canvas()}>
				{(canvas) => (
					<Suspense>
						<PixiStage canvas={canvas()} />
					</Suspense>
				)}
			</Show>
		</>
	);
};

type GameBoardProps = {
	connections: Connection[];
	initialPositions: Record<string, Point2D>;
	player: Player;
};

export const GameBoard: Component<GameBoardProps> = (props) => {
	return (
		<CursorsStateProvider playerId={props.player.id}>
			<SelectionStateProvider playerId={props.player.id}>
				<GameStateProvider
					connections={props.connections}
					initialPositions={props.initialPositions}
				>
					<ClientBoard />
					<SuccessConfetti />
				</GameStateProvider>
			</SelectionStateProvider>
		</CursorsStateProvider>
	);
};
