import { LiveMap, type LiveObject } from "@liveblocks/client";
import { createAsync } from "@solidjs/router";
import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { WebrtcProvider } from "y-webrtc";
import type {} from "yjs";
import { createLiveGame } from "../utils/creator";
import { checkForCrossing } from "../utils/geometry";
import type { Connection, Point2D } from "../utils/types";
import {
	type LiveblocksConnection,
	useLiveblocksConnection,
} from "./liveblocks-connection";
import { useRealtimeConnection } from "./realtime-connection";

// const SYNC_KEY = "sync";
// const CONNECTION_KEY = "connections";
const POSITIONS_KEY = "positions";
// const DEFAULT_GAME_SIZE = 10;

const getConnectionPairs = (connections: Connection[]) => {
	return connections.flatMap((connection, index) => {
		const nodes = new Set([connection.end, connection.start]);
		return connections
			.slice(index + 1)
			.filter((entry) => !nodes.has(entry.end) && !nodes.has(entry.start))
			.map((entry) => [connection, entry] as const);
	});
};

const detectCrossing = (
	connectionPairs: (readonly [Connection, Connection])[],
	positions: Record<string, Point2D>,
) => {
	return connectionPairs.some(([first, second]) => {
		return checkForCrossing(
			{ start: positions[first.start], end: positions[first.end] },
			{ start: positions[second.start], end: positions[second.end] },
		);
	});
};

type GameStateStore = {
	positions: Record<string, Point2D>;
	connections: Connection[];
};

export type SetPositionPayload = Point2D & {
	nodeId: string;
};

type CreateGameStateContextArgs = {
	provider: WebrtcProvider;
	room: LiveblocksConnection["room"];
};

const createGameStateContext = ({ room }: CreateGameStateContextArgs) => {
	const [hasEnded, setHasEnded] = createSignal(false);

	const [livePositions, setLivePositions] = createSignal({
		positions: new LiveMap<string, LiveObject<Point2D>>(),
		unsubscribe: [() => {}],
	});
	const [store, setStore] = createStore<GameStateStore>({
		connections: [],
		positions: {},
	});

	const connectionPairs = createMemo(() =>
		getConnectionPairs(store.connections),
	);

	const setPosition = (payload: SetPositionPayload) => {
		setStore(
			produce((state) => {
				state.positions[payload.nodeId] = payload;
			}),
		);
	};

	const setPositions = (payloads: SetPositionPayload[]) => {
		setStore(
			produce((state) => {
				for (const payload of payloads) {
					state.positions[payload.nodeId] = payload;
				}
			}),
		);
	};

	const checkForEnding = () => {
		const pairs = connectionPairs();
		if (pairs.length > 0) {
			const hasCrossing = detectCrossing(pairs, store.positions);
			setHasEnded(!hasCrossing);
		}
	};

	const confirmPosition = (nodeId: string, position: Point2D) => {
		room.batch(() => {
			livePositions().positions.get(nodeId)?.set("x", position.x);
			livePositions().positions.get(nodeId)?.set("y", position.y);
		});

		checkForEnding();
	};

	const startNewGame = async (nodes: number) => {
		setHasEnded(false);

		const storage = await room.getStorage();

		room.batch(() => {
			const { connections, positions } = createLiveGame(nodes);
			storage.root.set("connections", connections);
			storage.root.set(POSITIONS_KEY, positions);
		});
	};

	const storage = createAsync(() => room.getStorage());

	createEffect(() => {
		const root = storage()?.root;

		if (!root) {
			return;
		}

		const unsubscribe = room.subscribe(root, (node) => {
			const positions = node.get("positions");
			setStore({
				connections: node.get("connections").toArray(),
				positions: Object.fromEntries(
					Array.from(positions.entries()).map(([nodeId, livePosition]) => [
						nodeId,
						livePosition.toObject(),
					]),
				),
			});

			for (const callback of livePositions().unsubscribe) {
				callback();
			}

			const unsubscribe: (() => void)[] = [];
			positions.forEach((value, key) => {
				unsubscribe.push(
					room.subscribe(value, (node) =>
						setStore("positions", key, node.toObject()),
					),
				);
			});

			setLivePositions({ positions, unsubscribe });
		});

		onCleanup(() => unsubscribe());
	});

	return {
		store,
		setPosition,
		setPositions,
		confirmPosition,
		hasEnded,
		startNewGame,
	};
};

const GameStateContext = createContext<
	Accessor<ReturnType<typeof createGameStateContext>>
>(() => {
	throw new Error("GameStateContext is not defined");
});

export const GameStateProvider: Component<ParentProps> = (props) => {
	const realtimeConnection = useRealtimeConnection();
	const liveblocks = useLiveblocksConnection();

	const value = createMemo(() =>
		createGameStateContext({
			provider: realtimeConnection(),
			room: liveblocks().room,
		}),
	);

	return (
		<GameStateContext.Provider value={value}>
			{props.children}
		</GameStateContext.Provider>
	);
};

export const useGameState = () => {
	return useContext(GameStateContext);
};
