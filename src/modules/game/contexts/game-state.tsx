import { createWritableMemo } from "@solid-primitives/memo";
import { nanoid } from "nanoid";
import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	createSignal,
	onCleanup,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { WebrtcProvider } from "y-webrtc";
import type { Transaction, YMapEvent } from "yjs";
import { createGame } from "../utils/creator";
import { checkForCrossing } from "../utils/geometry";
import type { Connection, Point2D } from "../utils/types";
import { useRealtimeConnection } from "./realtime-connection";

const CONNECTION_MAP = "connections-map";
const CONNECTION_CONFIG_KEY = "connections";
const CONNECTION_SYNC_KEY = "connections-sync";

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

const createIsInitializedDetection = (
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

type CreateGameStateContextArgs = {
	connections: Connection[];
	initialPositions: Record<string, Point2D>;
	onGameReload: (nodes: number) => void;
	provider: WebrtcProvider;
};

const createGameStateContext = ({
	connections,
	initialPositions,
	provider,
}: CreateGameStateContextArgs) => {
	const [positions, setPositions] = createStore(initialPositions);

	const connectionPairs = getConnectionPairs(connections);

	const [hasEnded, setHasEnded] = createSignal(false);

	const setPosition = (nodeId: string, position: Point2D) => {
		setPositions(
			produce((state) => {
				state[nodeId] = position;
			}),
		);
	};

	const confirmPosition = (_nodeId: string, _position: Point2D) => {
		const hasCrossing = detectCrossing(connectionPairs, positions);
		setHasEnded(!hasCrossing);
	};

	const connectionsMap = provider.doc.getMap(CONNECTION_MAP);

	const startNewGame = (nodes: number) => {
		setHasEnded(false);
		const { connections } = createGame(nodes);
		connectionsMap.set(CONNECTION_CONFIG_KEY, connections);
	};

	const listener = (event: YMapEvent<unknown>, transaction: Transaction) => {
		const connections = connectionsMap.get(CONNECTION_CONFIG_KEY);

		// if (transaction.local) {
		// 	return;
		// }

		// const array = provider.doc.getArray(CONNECTION_CONFIG_KEY);
		// array.delete(0, array.length);
		// const { connections } = createGame(10);
		// array.push(connections);
		// console.log("array.doc.isSynced", provider.doc.isSynced);
		console.log("array-listener", event, connections, transaction);
	};

	connectionsMap.observe(listener);
	onCleanup(() => connectionsMap.unobserve(listener));

	// const connectionListener = () => {
	// 	const initialConnections = connectionsMap.get(CONNECTION_CONFIG_KEY);
	// 	console.log(
	// 		"connectionListener",
	// 		initialConnections,
	// 		connectionsMap.(""),
	// 	);

	// 	if (!initialConnections) {
	// 		startNewGame(10);
	// 	}
	// };

	// connectionsMap.observe()

	// createAsync(async () => {
	// 	console.log("before whenSynced");
	// 	await provider.doc.whenSynced;
	// 	console.log("after whenSynced");
	// 	return true;
	// });

	// provider.on("status", connectionListener);
	// onCleanup(() => provider.off("status", connectionListener));

	// console.log("provider.doc.isSynced", provider.doc.isSynced);

	// const initialConnections = connectionsMap.has(CONNECTION_CONFIG_KEY);
	// console.log(CONNECTION_CONFIG_KEY, initialConnections);

	// if (!initialConnections) {
	// 	startNewGame(10);
	// }

	// connectionsMap.set(CONNECTION_CONFIG_KEY, []);
	// provider.doc.transact((transaction) => {
	// 	transaction.
	// 	transaction.meta.set()
	// })

	createIsInitializedDetection(provider, (isInitialized) => {
		// const connections = connectionsMap.get(CONNECTION_CONFIG_KEY);

		if (isInitialized) {
			connectionsMap.set(CONNECTION_SYNC_KEY, nanoid());
		} else {
			startNewGame(10);
		}

		// if (transaction.local) {
		// 	return;
		// }

		// const array = provider.doc.getArray(CONNECTION_CONFIG_KEY);
		// array.delete(0, array.length);
		// const { connections } = createGame(10);
		// array.push(connections);
		// console.log("array.doc.isSynced", provider.doc.isSynced);
		console.log("createIsInitializedDetection", isInitialized);
	});

	// onCleanup(() => provider.awareness.off("change", onAwarenessChange));
	// console.log("provider.awareness", provider.awareness.states);

	return {
		connections,
		positions,
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

	const [game, setGame] = createWritableMemo(() => createGame(10));

	const onGameReload = (nodes: number) => {
		setGame(createGame(nodes));
	};

	const value = createMemo(() => {
		const { connections, positions: initialPositions } = game();

		return createGameStateContext({
			provider: realtimeConnection(),
			connections,
			initialPositions,
			onGameReload,
		});
	});

	return (
		<GameStateContext.Provider value={value}>
			{props.children}
		</GameStateContext.Provider>
	);
};

export const useGameState = () => {
	return useContext(GameStateContext);
};
