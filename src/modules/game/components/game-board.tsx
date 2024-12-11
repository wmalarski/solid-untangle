import { type Component, Show, createSignal } from "solid-js";
import type { Player } from "~/modules/player/server/server";
import { CursorsStateProvider } from "../contexts/cursors-state";
import { GameConfigProvider } from "../contexts/game-config";
import { GameStateProvider } from "../contexts/game-state";
import { PresenceStateProvider } from "../contexts/presence-state";
import { RealtimeConnectionProvider } from "../contexts/realtime-connection";
import { SelectionStateProvider } from "../contexts/selection-state";
import { PixiStage } from "../pixi/pixi-stage";
import { InfoBar } from "./info-bar";
import { PlayerDialog } from "./player-dialog";
import { ReloadDialog } from "./reload-dialog";
import { SuccessConfetti } from "./success-confetti";
import { TopBar } from "./top-bar";

type GameBoardProps = {
	player?: Player;
	gameId: string;
};

export const GameBoard: Component<GameBoardProps> = (props) => {
	return (
		<Show when={props.player}>
			{(player) => (
				<GameConfigProvider gameId={props.gameId} player={player()}>
					<RealtimeConnectionProvider>
						<PresenceStateProvider>
							<SelectionStateProvider>
								<GameStateProvider>
									<CursorsStateProvider>
										<ClientBoard />
										<InfoBar />
										<TopBar />
										<ReloadDialog />
										<PlayerDialog />
										<SuccessConfetti />
									</CursorsStateProvider>
								</GameStateProvider>
							</SelectionStateProvider>
						</PresenceStateProvider>
					</RealtimeConnectionProvider>
				</GameConfigProvider>
			)}
		</Show>
	);
};

const ClientBoard: Component = () => {
	const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();

	return (
		<>
			<canvas class="size-full bg-base-100" ref={setCanvas} />
			<Show when={canvas()}>{(canvas) => <PixiStage canvas={canvas()} />}</Show>
		</>
	);
};
