import { throttle } from "@solid-primitives/scheduled";
import {
	type Accessor,
	type Component,
	createContext,
	createMemo,
	type ParentProps,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { REALTIME_THROTTLE_TIME } from "../utils/constants";

type PlayerCursorState = {
	x: number;
	y: number;
};

type PlayerCursorPayload = {
	playerId: string;
} & PlayerCursorState;

type CursorsState = Record<string, PlayerCursorState | undefined>;

const createCursorsState = (playerId: string) => {
	const [cursors, setCursors] = createStore<CursorsState>({});

	const throttledSend = throttle((payload: PlayerCursorPayload) => {
		console.log("CURSOR-send", payload);
	}, REALTIME_THROTTLE_TIME);

	const send = (state: PlayerCursorState) => {
		throttledSend({ ...state, playerId });
	};

	const leave = (playerIds: string[]) => {
		setCursors(
			produce((state) => {
				for (const playerId of playerIds) {
					state[playerId] = undefined;
				}
			}),
		);
	};

	const setRemoteCursor = (payload: PlayerCursorPayload) => {
		setCursors(
			produce((state) => {
				const player = state[payload.playerId];
				if (player) {
					player.x = payload.x;
					player.y = payload.y;
					return;
				}
				state[payload.playerId] = {
					x: payload.x,
					y: payload.y,
				};
			}),
		);
	};

	return { cursors, leave, send, setRemoteCursor };
};

const CursorsStateContext = createContext<
	Accessor<ReturnType<typeof createCursorsState>>
>(() => {
	throw new Error("CursorsStateContext not defined");
});

type CursorsStateProviderProps = ParentProps<{
	playerId: string;
}>;

export const CursorsStateProvider: Component<CursorsStateProviderProps> = (
	props,
) => {
	const value = createMemo(() => createCursorsState(props.playerId));

	return (
		<CursorsStateContext.Provider value={value}>
			{props.children}
		</CursorsStateContext.Provider>
	);
};

export const useCursorsState = () => {
	return useContext(CursorsStateContext);
};
