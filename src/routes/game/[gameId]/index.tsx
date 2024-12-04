import type { RouteDefinition } from "@solidjs/router";
import {
	type Component,
	createMemo,
	createSignal,
	onMount,
	Show,
} from "solid-js";
import { GameBoard } from "~/modules/game/components/game-board";
import { createGame } from "~/modules/game/utils/creator";
import { Button } from "~/ui/button/button";

export const route = {
	load: async () => {
		await Promise.resolve();
	},
} satisfies RouteDefinition;

const MountedGameSection: Component = () => {
	const game = createMemo(() => createGame(15, 1000, 1000));

	return (
		<GameBoard
			connections={game().connections}
			initialPositions={game().positions}
			player={{ id: "123" }}
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
			<Button onClick={() => console.log(createGame(15, 100, 100))}>AA</Button>
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
