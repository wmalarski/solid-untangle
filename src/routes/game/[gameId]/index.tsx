import { createWritableMemo } from "@solid-primitives/memo";
import type { RouteDefinition } from "@solidjs/router";
import { type Component, createSignal, onMount, Show } from "solid-js";
import { GameBoard } from "~/modules/game/components/game-board";
import { createGame } from "~/modules/game/utils/creator";

export const route = {
	load: async () => {
		await Promise.resolve();
	},
} satisfies RouteDefinition;

const MountedGameSection: Component = () => {
	const [game, setGame] = createWritableMemo(() => createGame(10));

	const onGameReload = (nodes: number) => {
		setGame(createGame(nodes));
	};

	return (
		<GameBoard
			connections={game().connections}
			initialPositions={game().positions}
			player={{ id: "123" }}
			onGameReload={onGameReload}
		/>
	);
};

const GameSection: Component = () => {
	const [isMounted, setIsMounted] = createSignal(false);

	onMount(() => {
		setIsMounted(true);
	});

	return (
		<Show when={isMounted()}>
			<MountedGameSection />
		</Show>
	);
};

export default function GamePage() {
	return (
		<main>
			<GameSection />
		</main>
	);
}
