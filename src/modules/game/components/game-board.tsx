import { createWritableMemo } from "@solid-primitives/memo";
import { type Component, Show, createSignal, lazy } from "solid-js";
import { GameConfigProvider } from "../contexts/game-config";
import { GameStateProvider } from "../contexts/game-state";
import { LiveblocksConnectionProvider } from "../contexts/liveblocks-connection";
import { PresenceStateProvider } from "../contexts/presence-state";
import { SelectionStateProvider } from "../contexts/selection-state";
import { getPlayerCookie } from "../utils/player";
import { InfoBar } from "./info-bar";
import { PlayerDialog } from "./player-dialog";
import { ReloadDialog } from "./reload-dialog";
import { SuccessConfetti } from "./success-confetti";
import { TopBar } from "./top-bar";

const PixiStage = lazy(() =>
	import("../pixi/pixi-stage").then((module) => ({
		default: module.PixiStage,
	})),
);

type GameBoardProps = {
	gameId: string;
};

export const GameBoard: Component<GameBoardProps> = (props) => {
	const [player, setPlayer] = createWritableMemo(() => getPlayerCookie());

	return (
		<GameConfigProvider gameId={props.gameId} player={player()}>
			<LiveblocksConnectionProvider>
				<PresenceStateProvider>
					<SelectionStateProvider>
						<GameStateProvider>
							<ClientBoard />
							<InfoBar />
							<TopBar />
							<ReloadDialog />
							<PlayerDialog onPlayerChange={setPlayer} />
							<SuccessConfetti />
						</GameStateProvider>
					</SelectionStateProvider>
				</PresenceStateProvider>
			</LiveblocksConnectionProvider>
		</GameConfigProvider>
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
