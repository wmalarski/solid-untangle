import {
	Container,
	type FederatedPointerEvent,
	Graphics,
	Text,
	TextStyle,
} from "pixi.js";
import {
	type Component,
	For,
	Show,
	createEffect,
	onCleanup,
	onMount,
} from "solid-js";
import { useLiveblocksConnection } from "../contexts/liveblocks-connection";
import { usePresenceState } from "../contexts/presence-state";
import { useSelectionState } from "../contexts/selection-state";
import { useTransformState } from "../contexts/transform-state";
import { getTextColor } from "../utils/colors";
import { useBoardTheme } from "./board-theme";
import { usePixiApp, usePixiContainer } from "./pixi-app";

const CURSOR_SIZE = 20;
const LABEL_PADDING = 5;
const LABEL_SHIFT = CURSOR_SIZE * 1.2;

type CursorGraphicsProps = {
	color?: string;
	cursorsContainer: Container;
	name?: string;
	x: number;
	y: number;
};

const CursorGraphics: Component<CursorGraphicsProps> = (props) => {
	const theme = useBoardTheme();

	const graphics = new Graphics({ zIndex: theme().cursorGraphicsZIndex });
	const style = new TextStyle({ fontSize: 16 });
	const text = new Text({ style, zIndex: theme().cursorTextZIndex });

	createEffect(() => {
		if (!props.name || !props.color) {
			return;
		}

		graphics
			.moveTo(0, 0)
			.lineTo(CURSOR_SIZE / 5, CURSOR_SIZE)
			.lineTo(CURSOR_SIZE / 2.2, CURSOR_SIZE / 1.8)
			.lineTo(CURSOR_SIZE / 1.1, CURSOR_SIZE / 2)
			.lineTo(0, 0)
			.fill({ color: props.color })
			.stroke({ color: theme().cursorStrokeColor });

		text.text = props.name;
		text.style.fill = getTextColor(props.color);

		graphics
			.rect(
				LABEL_SHIFT - LABEL_PADDING,
				LABEL_SHIFT - LABEL_PADDING,
				text.width + 2 * LABEL_PADDING,
				text.height + 2 * LABEL_PADDING,
			)
			.fill({ color: props.color });
	});

	createEffect(() => {
		graphics.x = props.x;
		text.x = props.x + LABEL_SHIFT;
	});

	createEffect(() => {
		graphics.y = props.y;
		text.y = props.y + LABEL_SHIFT;
	});

	onMount(() => {
		props.cursorsContainer.addChild(graphics);
		props.cursorsContainer.addChild(text);
	});

	onCleanup(() => {
		props.cursorsContainer.removeChild(graphics);
		props.cursorsContainer.removeChild(text);

		graphics.destroy();
		text.destroy();
	});

	return null;
};

const usePlayerCursor = () => {
	const container = usePixiContainer();
	const selection = useSelectionState();
	const liveblocks = useLiveblocksConnection();

	const onPointerMove = (event: FederatedPointerEvent) => {
		const transform = container.worldTransform;
		const inverted = transform.applyInverse(event.global);

		liveblocks().room.updatePresence({
			cursor: {
				x: inverted.x,
				y: inverted.y,
				nodeId: selection().selectedId(),
			},
		});
	};

	onMount(() => {
		container.on("pointermove", onPointerMove);
	});

	onCleanup(() => {
		container.off("pointermove", onPointerMove);
	});
};

export const RemoteCursors: Component = () => {
	const app = usePixiApp();
	const theme = useBoardTheme();

	const cursorsContainer = new Container({
		zIndex: theme().cursorContainerZIndex,
	});

	const presence = usePresenceState();
	const transform = useTransformState();

	onMount(() => {
		app.stage.addChild(cursorsContainer);
	});

	onCleanup(() => {
		app.stage.removeChild(cursorsContainer);
	});

	usePlayerCursor();

	return (
		<For each={presence()}>
			{(other) => (
				<Show when={other.presence.cursor}>
					{(cursor) => (
						<CursorGraphics
							color={other.presence.player?.color}
							cursorsContainer={cursorsContainer}
							name={other.presence.player?.name}
							x={transform().x() + cursor().x * transform().scale()}
							y={transform().y() + cursor().y * transform().scale()}
						/>
					)}
				</Show>
			)}
		</For>
	);
};
