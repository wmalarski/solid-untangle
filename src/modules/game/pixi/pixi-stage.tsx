import type { Component } from "solid-js";
import { ZoomBar } from "../components/zoom-bar";
import { TransformStateProvider } from "../contexts/transform-state";
import { BoardThemeProvider } from "./board-theme";
import { GraphBoard } from "./graph-board";
import { PixiAppProvider } from "./pixi-app";

type PixiStageProps = {
	canvas: HTMLCanvasElement;
};

export const PixiStage: Component<PixiStageProps> = (props) => {
	return (
		<BoardThemeProvider>
			<PixiAppProvider canvas={props.canvas}>
				<TransformStateProvider>
					<GraphBoard />
					<ZoomBar />
				</TransformStateProvider>
			</PixiAppProvider>
		</BoardThemeProvider>
	);
};
