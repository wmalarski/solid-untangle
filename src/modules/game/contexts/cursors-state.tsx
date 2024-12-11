import { throttle } from "@solid-primitives/scheduled";
import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	onCleanup,
	useContext,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import type { WebrtcProvider } from "y-webrtc";
import { REALTIME_THROTTLE_TIME } from "../utils/constants";
import type { Point2D } from "../utils/types";
import { useGameConfig } from "./game-config";
import { useGameState } from "./game-state";
import { useRealtimeConnection } from "./realtime-connection";

type PlayerCursorState = Point2D & {
	nodeId: string | null;
};

type PlayerCursorPayload = PlayerCursorState & {
	playerId: string;
};

type CursorsState = Record<string, PlayerCursorState | undefined>;

type CreateCursorsStateArgs = {
	playerId: string;
	provider: WebrtcProvider;
};

const createCursorsState = ({ playerId, provider }: CreateCursorsStateArgs) => {
	const [cursors, setCursors] = createStore<CursorsState>({});
	const game = useGameState();

	const onChange = () => {
		const cursorsArray = Array.from(provider.awareness.getStates().values())
			.filter((value) => value.cursor && value.cursor.playerId !== playerId)
			.map((value) => value.cursor as PlayerCursorPayload);

		const newCursors = Object.fromEntries(
			cursorsArray.map((cursor) => [cursor.playerId, cursor]),
		);

		setCursors(reconcile(newCursors));

		const cursorsWithNodes = cursorsArray.flatMap((cursor) =>
			cursor.nodeId ? [{ ...cursor, nodeId: cursor.nodeId }] : [],
		);
		game().setPositions(cursorsWithNodes);
	};

	provider.awareness.on("change", onChange);
	onCleanup(() => {
		provider.awareness.off("change", onChange);
	});

	const throttledSend = throttle((payload: PlayerCursorPayload) => {
		provider.awareness.setLocalStateField("cursor", payload);
	}, REALTIME_THROTTLE_TIME);

	const send = (state: PlayerCursorState) => {
		throttledSend({ ...state, playerId });
	};

	return { cursors, send };
};

const CursorsStateContext = createContext<
	Accessor<ReturnType<typeof createCursorsState>>
>(() => {
	throw new Error("CursorsStateContext not defined");
});

export const CursorsStateProvider: Component<ParentProps> = (props) => {
	const realtimeConnection = useRealtimeConnection();
	const config = useGameConfig();

	const value = createMemo(() =>
		createCursorsState({
			playerId: config().player.id,
			provider: realtimeConnection(),
		}),
	);

	return (
		<CursorsStateContext.Provider value={value}>
			{props.children}
		</CursorsStateContext.Provider>
	);
};

export const useCursorsState = () => {
	return useContext(CursorsStateContext);
};
