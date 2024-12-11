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
import { useGameConfig } from "./game-config";
import { useRealtimeConnection } from "./realtime-connection";

type PlayerCursorState = {
	x: number;
	y: number;
};

type PlayerCursorPayload = {
	playerId: string;
} & PlayerCursorState;

type CursorsState = Record<string, PlayerCursorState | undefined>;

type CreateCursorsStateArgs = {
	playerId: string;
	provider: WebrtcProvider;
};

const createCursorsState = ({ playerId, provider }: CreateCursorsStateArgs) => {
	const [cursors, setCursors] = createStore<CursorsState>({});

	const onChange = () => {
		const newCursors = Object.fromEntries(
			Array.from(provider.awareness.getStates().values())
				.filter((value) => value.cursor && value.cursor.playerId !== playerId)
				.map((value) => [value.cursor.playerId, value.cursor]),
		);
		setCursors(reconcile(newCursors));
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
