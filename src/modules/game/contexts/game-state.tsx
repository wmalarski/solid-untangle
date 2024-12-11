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
import { createGame } from "../utils/creator";
import { checkForCrossing } from "../utils/geometry";
import type { Connection, Point2D } from "../utils/types";
import { useRealtimeConnection } from "./realtime-connection";

const SYNC_KEY = "sync";
const CONNECTION_MAP = "connections-map";
const CONNECTION_CONFIG_KEY = "connections";
const POSITIONS_MAP = "positions-map";
const DEFAULT_GAME_SIZE = 10;

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

const onDetectIsBoardInitialized = (
	provider: WebrtcProvider,
	callback: (isInitialized: boolean) => void,
) => {
	const onAwarenessChange = (event: { added: number[] }) => {
		if (event.added.length > 0) {
			callback(true);
			clearTimeout(timeout);
		}
	};
	provider.awareness.once("change", onAwarenessChange);
	const timeout = setTimeout(() => callback(false), 1000);
	onCleanup(() => clearTimeout(timeout));
};

type GameStateStore = {
	positions: Record<string, Point2D>;
	connections: Connection[];
};

type CreateGameStateContextArgs = {
	provider: WebrtcProvider;
};

const createGameStateContext = ({ provider }: CreateGameStateContextArgs) => {
	const [hasEnded, setHasEnded] = createSignal(false);

	const [store, setStore] = createStore<GameStateStore>({
		connections: [],
		positions: {},
	});

	const connectionPairs = createMemo(() =>
		getConnectionPairs(store.connections),
	);

	createEffect(() => {
		console.log("STORE");
		console.log(JSON.stringify(store, null, 2));
	});

	const setPosition = (nodeId: string, position: Point2D) => {
		setStore(
			produce((state) => {
				state.positions[nodeId] = position;
			}),
		);
	};

	const confirmPosition = (_nodeId: string, _position: Point2D) => {
		const hasCrossing = detectCrossing(connectionPairs(), store.positions);
		setHasEnded(!hasCrossing);
	};

	// const connectionsMap = provider.doc.getMap(CONNECTION_MAP);
	// const positionsMap = provider.doc.getMap(POSITIONS_MAP);

	const startNewGame = (nodes: number) => {
		setHasEnded(false);
		setStore(createGame(nodes));

		// provider.doc.transact(() => {
		// 	const { connections, positions } = createGame(nodes);
		// 	connectionsMap.set(CONNECTION_CONFIG_KEY, connections);

		// 	for (const [nodeId, position] of Object.entries(positions)) {
		// 		positionsMap.set(nodeId, position);
		// 	}
		// });
	};

	// const connectionsListener = () => {
	// 	const connections = connectionsMap.get(CONNECTION_CONFIG_KEY);
	// 	if (connections) {
	// 		setConnections(connections as Connection[]);
	// 	}
	// };
	// connectionsMap.observe(connectionsListener);
	// onCleanup(() => connectionsMap.unobserve(connectionsListener));

	// const positionsListener = () => {
	// 	setPositions(reconcile(positionsMap.toJSON()));
	// };
	// positionsMap.observe(positionsListener);
	// onCleanup(() => positionsMap.unobserve(positionsListener));

	// onDetectIsBoardInitialized(provider, (isInitialized) => {
	// 	if (isInitialized) {
	// 		connectionsMap.set(SYNC_KEY, nanoid());
	// 		positionsMap.set(SYNC_KEY, nanoid());
	// 	} else {
	// 		startNewGame(DEFAULT_GAME_SIZE);
	// 	}
	// });

	return {
		store,
		setPosition,
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

	const value = createMemo(() =>
		createGameStateContext({ provider: realtimeConnection() }),
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
