import { Graphics } from "pixi.js";
import { createEffect, createMemo, onCleanup, type Component } from "solid-js";
import { useGameState } from "../contexts/game-state";
import { useSelectionState } from "../contexts/selection-state";
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
	const selection = useSelectionState();

	const container = usePixiContainer();
	const theme = useBoardTheme();

	const graphics = new Graphics();

	container.addChild(graphics);
	onCleanup(() => {
		container.removeChild(graphics);
	});

	const isNodeSelected = createMemo(
		() => props.nodeId === selection().selectedId(),
	);

	createEffect(() => {
		const isSelected = isNodeSelected();
		const { nodeColor, nodeSelectedColor } = theme();

		graphics.clear();
		graphics.circle(0, 0, 20).fill({ color: 0x000000, alpha: 0 });
		graphics
			.circle(0, 0, isSelected ? 11 : 10)
			.fill(isSelected ? nodeSelectedColor : nodeColor);
	});

	createEffect(() => {
		graphics.x = props.position.x;
		graphics.y = props.position.y;
	});

	useDragObject({
		displayObject: graphics,
		onDragEnd: () => {
			selection().select(null);
			store().confirmPosition(props.nodeId, {
				x: graphics.x,
				y: graphics.y,
			});
		},
		onDragMove: () => {
			store().setPosition(props.nodeId, {
				x: graphics.x,
				y: graphics.y,
			});
		},
		onDragStart: () => {
			selection().select(props.nodeId);
		},
	});

	return null;
};
