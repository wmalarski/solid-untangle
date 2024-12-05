import { createSignal, Show, Suspense, type Component } from "solid-js";
import type { Player } from "~/modules/player/server/server";
import { CursorsStateProvider } from "../contexts/cursors-state";
import { GameStateProvider } from "../contexts/game-state";
import { PresenceStateProvider } from "../contexts/presence-state";
import { SelectionStateProvider } from "../contexts/selection-state";
import { PixiStage } from "../pixi/pixi-stage";
import type { Connection, Point2D } from "../utils/types";
import { InfoBar } from "./info-bar";
import { ReloadDialog } from "./reload-dialog";
import { SuccessConfetti } from "./success-confetti";
import { TopBar } from "./top-bar";

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
	onGameReload: (nodes: number) => void;
	player: Player;
	gameId: string;
};

export const GameBoard: Component<GameBoardProps> = (props) => {
	return (
		<PresenceStateProvider gameId={props.gameId} player={props.player}>
			<CursorsStateProvider playerId={props.player.id}>
				<SelectionStateProvider playerId={props.player.id}>
					<GameStateProvider
						connections={props.connections}
						initialPositions={props.initialPositions}
						onGameReload={props.onGameReload}
					>
						<ClientBoard />
						<InfoBar />
						<TopBar />
						<SuccessConfetti />
						<ReloadDialog />
					</GameStateProvider>
				</SelectionStateProvider>
			</CursorsStateProvider>
		</PresenceStateProvider>
	);
};
