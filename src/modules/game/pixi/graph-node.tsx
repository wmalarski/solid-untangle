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

	useDragObject({
		displayObject: graphics,
		onDragEnd: () => {
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
	});

	return null;
};
