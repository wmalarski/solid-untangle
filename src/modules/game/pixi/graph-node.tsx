import { createEffect, type Component } from "solid-js";
import type { Point2D } from "../utils/types";

type GraphNodeProps = {
	nodeId: string;
	position: Point2D;
};

export const GraphNode: Component<GraphNodeProps> = (props) => {
	createEffect(() => {
		console.log("GraphNode", props.nodeId, props.position);
	});
	// const store = usePuzzleStore();
	// const selection = usePlayerSelection();
	// const presence = usePlayerPresence();

	// const container = usePixiContainer();
	// const theme = useBoardTheme();

	// const fragment = new Container();

	// onMount(() => {
	// 	container.addChild(fragment);
	// });

	// onCleanup(() => {
	// 	container.removeChild(fragment);
	// });

	// const center = createMemo(() => {
	// 	return getCenterFromPoints(
	// 		props.shape.curvePoints.map((point) => point.to),
	// 	);
	// });

	// onMount(() => {
	// 	const centerValue = center();
	// 	fragment.pivot.set(-centerValue.x, -centerValue.y);
	// });

	// createEffect(() => {
	// 	fragment.x = props.state.isLocked ? props.shape.min.x : props.state.x;
	// });

	// createEffect(() => {
	// 	fragment.y = props.state.isLocked ? props.shape.min.y : props.state.y;
	// });

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

	// useDragObject({
	// 	displayObject: fragment,
	// 	onDragEnd: () => {
	// 		store().setFragmentStateWithLockCheck({
	// 			fragmentId: props.state.fragmentId,
	// 			rotation: props.state.rotation,
	// 			x: fragment.x,
	// 			y: fragment.y,
	// 		});
	// 	},
	// 	onDragMove: () => {
	// 		store().sendFragmentState({
	// 			fragmentId: props.state.fragmentId,
	// 			rotation: props.state.rotation,
	// 			x: fragment.x,
	// 			y: fragment.y,
	// 		});
	// 	},
	// 	onDragStart: () => {
	// 		selection().select(props.state.fragmentId);
	// 	},
	// });

	return null;
};
