import { createWritableMemo } from "@solid-primitives/memo";
import { createAsync, useParams, type RouteDefinition } from "@solidjs/router";
import {
	createEffect,
	createSignal,
	onMount,
	Show,
	Suspense,
	type Component,
} from "solid-js";
import { GameBoard } from "~/modules/game/components/game-board";
import { createGame } from "~/modules/game/utils/creator";
import { getPlayerLoader } from "~/modules/player/server/client";
import type { Player } from "~/modules/player/server/server";

export const route = {
	load: async () => {
		await getPlayerLoader();
	},
} satisfies RouteDefinition;

type GameSectionProps = {
	player: Player;
};

const MountedGameSection: Component<GameSectionProps> = (props) => {
	const params = useParams();

	const [game, setGame] = createWritableMemo(() => createGame(10));

	const onGameReload = (nodes: number) => {
		setGame(createGame(nodes));
	};

	return (
		<GameBoard
			gameId={params.gameId}
			connections={game().connections}
			initialPositions={game().positions}
			player={props.player}
			onGameReload={onGameReload}
		/>
	);
};

const GameSection: Component<GameSectionProps> = (props) => {
	const [isMounted, setIsMounted] = createSignal(false);

	onMount(() => {
		setIsMounted(true);
	});

	return (
		<Show when={isMounted()}>
			<MountedGameSection player={props.player} />
		</Show>
	);
};

export default function GamePage() {
	const player = createAsync(() => getPlayerLoader());

	createEffect(() => {
		console.log("player()", player());
	});

	return (
		<main>
			<Suspense>
				<Show when={player()}>
					{(player) => <GameSection player={player()} />}
				</Show>
			</Suspense>
		</main>
	);
}
