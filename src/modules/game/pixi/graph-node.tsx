import { Graphics } from "pixi.js";
import { createEffect, onCleanup, type Component } from "solid-js";
import { useGameState } from "../contexts/game-state";
import type { Point2D } from "../utils/types";
import { useBoardTheme } from "./board-theme";
import { usePixiContainer } from "./pixi-app";
import { useDragObject } from "./use-drag-object";

type GraphNodeProps = {
	nodeId: string;
	position: Point2D;
};

export const GraphNode: Component<GraphNodeProps> = (props) => {
	const store = useGameState();

	const container = usePixiContainer();
	const theme = useBoardTheme();

	const graphics = new Graphics();

	container.addChild(graphics);
	onCleanup(() => {
		container.removeChild(graphics);
	});

	createEffect(() => {
		graphics.clear();
		graphics.circle(0, 0, 10).fill(theme().nodeColor);
	});

	createEffect(() => {
		graphics.x = props.position.x;
		graphics.y = props.position.y;
	});

	// const remotePlayerSelection = createMemo(() => {
	// 	const remotePlayerId =
	// 		selection().fragmentSelection()[props.state.fragmentId];
	// 	if (!remotePlayerId) {
	// 		return null;
	// 	}

	// 	const remotePlayer = presence().players[remotePlayerId];
	// 	if (!remotePlayer) {
	// 		return null;
	// 	}

	// 	return remotePlayer;
	// });

	// createEffect(() => {
	// 	const shouldBeBlocked = props.state.isLocked || remotePlayerSelection();
	// 	fragment.eventMode = shouldBeBlocked ? "none" : "static";
	// });

	// const isCurrentPlayerSelected = createMemo(() => {
	// 	return props.state.fragmentId === selection().selectedId();
	// });

	// createEffect(() => {
	// 	fragment.zIndex = props.state.isLocked
	// 		? theme.fragmentLockedZIndex
	// 		: isCurrentPlayerSelected()
	// 			? theme.fragmentSelectedZIndex
	// 			: remotePlayerSelection()
	// 				? theme.fragmentRemoteZIndex
	// 				: theme.fragmentZIndex;
	// });

	useDragObject({
		displayObject: graphics,
		onDragEnd: () => {
			store().setPosition(props.nodeId, {
				x: graphics.x,
				y: graphics.y,
			});
		},
		onDragMove: () => {
			store().sendPosition(props.nodeId, {
				x: graphics.x,
				y: graphics.y,
			});
		},
	});

	return null;
};
