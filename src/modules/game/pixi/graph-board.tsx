import type { FederatedPointerEvent } from "pixi.js";
import { type Component, For, onCleanup, onMount, Show } from "solid-js";
import { usePlayerSelection } from "../../DataProviders/SelectionProvider";
import { RIGHT_BUTTON } from "../constants";
import { useGameState } from "../contexts/game-state";
import { usePixiContainer } from "../PixiApp";
import { usePreventMenu } from "../usePreventMenu";
import { useStageTransform } from "../useStageTransform";
import { PuzzleFragment } from "./PuzzleFragment";
import { RemoteCursors } from "./remote-cursors";

const useStageDeselect = () => {
	const container = usePixiContainer();
	const selection = usePlayerSelection();

	const onPointerDown = (event: FederatedPointerEvent) => {
		if (event.target === container && event.button !== RIGHT_BUTTON) {
			selection().select(null);
		}
	};

	onMount(() => {
		container.on("pointerdown", onPointerDown);
	});

	onCleanup(() => {
		container.off("pointerdown", onPointerDown);
	});
};

export const GraphBoard: Component = () => {
	useStageTransform();
	usePreventMenu();
	useStageDeselect();

	const store = useGameState();

	return (
		<>
			<For each={Object.keys(store().positions)}>
				{(nodeId) => (
					<Show when={store().positions[nodeId]}>
						{(position) => (
							<Show when={store().fragments[fragmentId]}>
								{(state) => <PuzzleFragment shape={shape()} state={state()} />}
							</Show>
						)}
					</Show>
				)}
			</For>
			<RemoteCursors />
		</>
	);
};
