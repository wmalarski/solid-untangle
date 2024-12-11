import { Graphics } from "pixi.js";
import { type Component, createEffect, createMemo, onCleanup } from "solid-js";
import { useSelectionState } from "../contexts/selection-state";
import type { Connection, Point2D } from "../utils/types";
import { useBoardTheme } from "./board-theme";
import { usePixiContainer } from "./pixi-app";

type GraphEdgeProps = {
	connection: Connection;
	startPosition: Point2D;
	endPosition: Point2D;
};

export const GraphEdge: Component<GraphEdgeProps> = (props) => {
	const selection = useSelectionState();

	const container = usePixiContainer();
	const theme = useBoardTheme();

	const graphics = new Graphics();

	container.addChild(graphics);
	onCleanup(() => {
		container.removeChild(graphics);
	});

	const isEdgeSelected = createMemo(
		() =>
			props.connection.start === selection().selectedId() ||
			props.connection.end === selection().selectedId(),
	);

	createEffect(() => {
		const isSelected = isEdgeSelected();
		const { nodeColor, nodeSelectedColor } = theme();

		graphics.clear();
		graphics
			.moveTo(props.startPosition.x, props.startPosition.y)
			.lineTo(props.endPosition.x, props.endPosition.y)
			.stroke({
				color: isSelected ? nodeSelectedColor : nodeColor,
				width: isSelected ? 2 : 1,
			});
	});

	return null;
};
