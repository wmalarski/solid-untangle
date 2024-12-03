import { createSignal, Show, Suspense, type Component } from "solid-js";
import { GameStateProvider } from "../contexts/game-state";
import { PixiStage } from "../pixi/pixi-stage";
import type { Connection, Point2D } from "../utils/types";

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
	initialPositions: Point2D[];
};

export const GameBoard: Component<GameBoardProps> = (props) => {
	return (
		<GameStateProvider
			connections={props.connections}
			initialPositions={props.initialPositions}
		>
			<ClientBoard />
		</GameStateProvider>
	);
};
