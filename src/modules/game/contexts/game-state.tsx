import {} from "@liveblocks/client";
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
import { createStore } from "solid-js/store";
import type { WebrtcProvider } from "y-webrtc";
import type {} from "yjs";
import { createLiveGame } from "../utils/creator";
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

// const getConnectionPairs = (connections: Connection[]) => {
// 	return connections.flatMap((connection, index) => {
// 		const nodes = new Set([connection.end, connection.start]);
// 		return connections
// 			.slice(index + 1)
// 			.filter((entry) => !nodes.has(entry.end) && !nodes.has(entry.start))
// 			.map((entry) => [connection, entry] as const);
// 	});
// };

// const detectCrossing = (
// 	connectionPairs: (readonly [Connection, Connection])[],
// 	positions: Record<string, Point2D>,
// ) => {
// 	return connectionPairs.some(([first, second]) => {
// 		return checkForCrossing(
// 			{ start: positions[first.start], end: positions[first.end] },
// 			{ start: positions[second.start], end: positions[second.end] },
// 		);
// 	});
// };

// const onDetectIsBoardInitialized = (
// 	provider: WebrtcProvider,
// 	callback: (isInitialized: boolean) => void,
// ) => {
// 	const onAwarenessChange = (event: { added: number[] }) => {
// 		if (event.added.length > 0) {
// 			callback(true);
// 			clearTimeout(timeout);
// 		}
// 	};
// 	provider.awareness.once("change", onAwarenessChange);
// 	const timeout = setTimeout(() => callback(false), 1000);
// 	onCleanup(() => clearTimeout(timeout));
// };

type GameStateStore = {
	positions: Record<string, Point2D>;
	connections: Connection[];
};

export type SetPositionPayload = Point2D & {
	nodeId: string | null;
};

type CreateGameStateContextArgs = {
	provider: WebrtcProvider;
	room: LiveblocksConnection["room"];
};

const createGameStateContext = ({ room }: CreateGameStateContextArgs) => {
	const [hasEnded, setHasEnded] = createSignal(false);

	const [store] = createStore<GameStateStore>({
		connections: [],
		positions: {},
	});

	// const connectionPairs = createMemo(() =>
	// 	getConnectionPairs(store.connections),
	// );

	const setPosition = (_payload: SetPositionPayload) => {
		// setStore(
		// 	produce((state) => {
		// 		state.positions[payload.nodeId] = payload;
		// 	}),
		// );
	};

	const setPositions = (_payloads: SetPositionPayload[]) => {
		// setStore(
		// 	produce((state) => {
		// 		for (const payload of payloads) {
		// 			state.positions[payload.nodeId] = payload;
		// 		}
		// 	}),
		// );
	};

	// const connectionsArray = provider.doc.getArray<Connection>(CONNECTION_KEY);
	// const positionsMap = provider.doc.getMap<Point2D>(POSITIONS_KEY);

	// const checkForEnding = () => {
	// 	const pairs = connectionPairs();
	// 	if (pairs.length > 0) {
	// 		const hasCrossing = detectCrossing(pairs, store.positions);
	// 		setHasEnded(!hasCrossing);
	// 	}
	// };

	const confirmPosition = (_nodeId: string, _position: Point2D) => {
		// positionsMap.set(nodeId, position);
		// checkForEnding();
	};

	const startNewGame = async (nodes: number) => {
		setHasEnded(false);

		const storage = await room.getStorage();

		room.batch(() => {
			const { connections, positions } = createLiveGame(nodes);

			// const liveConnections = storage.root.get("connections");
			// const livePositions = storage.root.get("positions");
			// liveConnections.clear();
			// livePositions.clear();

			// for (const connection of connections) {
			// 	liveConnections.push(connection)
			// }

			// for (const )

			storage.root.set("connections", connections);
			storage.root.set(POSITIONS_KEY, positions);
		});

		// provider.doc.transact(() => {
		// 	connectionsArray.delete(0, connectionsArray.length);
		// 	connectionsArray.push(connections);

		// 	positionsMap.clear();
		// 	for (const [nodeId, position] of Object.entries(positions)) {
		// 		positionsMap.set(nodeId, position);
		// 	}
		// });
	};

	// const onDocUpdate = () => {
	// 	setStore(
	// 		reconcile({
	// 			connections: connectionsArray.toArray(),
	// 			positions: positionsMap.toJSON(),
	// 		}),
	// 	);
	// 	checkForEnding();
	// };
	// provider.doc.on("updateV2", onDocUpdate);
	// onCleanup(() => provider.doc.off("updateV2", onDocUpdate));

	// onDetectIsBoardInitialized(provider, async (isInitialized) => {
	// 	if (isInitialized) {
	// 		provider.doc.getText(SYNC_KEY).setAttribute(SYNC_KEY, nanoid());
	// 		return;
	// 	}
	// 	await startNewGame(DEFAULT_GAME_SIZE);
	// });

	const storage = createAsync(() => room.getStorage());

	createEffect(() => {
		console.log("storage", storage());
	});

	const connectionsMemo = createMemo(() => {
		const root = storage()?.root;

		if (!root) {
			return () => [];
		}

		const [connections, setConnection] = createSignal(
			root.get("connections").toArray(),
		);

		const unsubscribe = room.subscribe(root, (node) => {
			setConnection(node.get("connections").toArray());
		});

		onCleanup(() => unsubscribe());

		return connections;
	});
	const connections = createMemo(() => connectionsMemo()());

	// room.getStorageSnapshot()?.get()

	// createMemo(() => {
	// 	// const snapshot = room.getStorageSnapshot()?.get("connections");
	// 	// const [connections, setConnections] =
	// })

	createEffect(() => {
		console.log("connections", JSON.stringify(connections(), null, 2));
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
