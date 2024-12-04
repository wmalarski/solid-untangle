import type { FederatedPointerEvent } from "pixi.js";
import { type Component, For, onCleanup, onMount, Show } from "solid-js";
import { useGameState } from "../contexts/game-state";
import { useSelectionState } from "../contexts/selection-state";
import { RIGHT_BUTTON } from "../utils/constants";
import { GraphNode } from "./graph-node";
import { usePixiContainer } from "./pixi-app";
import { usePreventMenu } from "./use-prevent-menu";
import { useStageTransform } from "./use-stage-transform";

const useStageDeselect = () => {
	const container = usePixiContainer();
	const selection = useSelectionState();

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
						{(position) => <GraphNode nodeId={nodeId} position={position()} />}
					</Show>
				)}
			</For>
			{/* <RemoteCursors /> */}
		</>
	);
};
