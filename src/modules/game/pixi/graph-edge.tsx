import { Graphics } from "pixi.js";
import { createEffect, onCleanup, type Component } from "solid-js";
import type { Point2D } from "../utils/types";
import { useBoardTheme } from "./board-theme";
import { usePixiContainer } from "./pixi-app";

type GraphEdgeProps = {
	startPosition: Point2D;
	endPosition: Point2D;
};

export const GraphEdge: Component<GraphEdgeProps> = (props) => {
	const container = usePixiContainer();
	const theme = useBoardTheme();

	const graphics = new Graphics();

	container.addChild(graphics);
	onCleanup(() => {
		container.removeChild(graphics);
	});

	createEffect(() => {
		graphics.clear();
		graphics
			.moveTo(props.startPosition.x, props.startPosition.y)
			.lineTo(props.endPosition.x, props.endPosition.y)
			.stroke(theme().nodeColor);
	});

	return null;
};
