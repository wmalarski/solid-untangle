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
import { createStore, produce, reconcile } from "solid-js/store";
import type { WebrtcProvider } from "y-webrtc";
import type {} from "yjs";
import { createGame } from "../utils/creator";
import { checkForCrossing } from "../utils/geometry";
import type { Connection, Point2D } from "../utils/types";
import { useRealtimeConnection } from "./realtime-connection";

const SYNC_KEY = "sync";
const CONNECTION_KEY = "connections";
const POSITIONS_KEY = "positions";
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

	const setPosition = (nodeId: string, position: Point2D) => {
		setStore(
			produce((state) => {
				state.positions[nodeId] = position;
			}),
		);
	};

	const connectionsArray = provider.doc.getArray<Connection>(CONNECTION_KEY);
	const positionsMap = provider.doc.getMap<Point2D>(POSITIONS_KEY);

	const checkForEnding = () => {
		const pairs = connectionPairs();
		if (pairs.length > 0) {
			const hasCrossing = detectCrossing(pairs, store.positions);
			setHasEnded(!hasCrossing);
		}
	};

	const confirmPosition = (nodeId: string, position: Point2D) => {
		positionsMap.set(nodeId, position);
		checkForEnding();
	};

	const startNewGame = (nodes: number) => {
		setHasEnded(false);

		provider.doc.transact(() => {
			const { connections, positions } = createGame(nodes);

			connectionsArray.delete(0, connectionsArray.length);
			connectionsArray.push(connections);

			positionsMap.clear();
			for (const [nodeId, position] of Object.entries(positions)) {
				positionsMap.set(nodeId, position);
			}
		});
	};

	const onDocUpdate = () => {
		setStore(
			reconcile({
				connections: connectionsArray.toArray(),
				positions: positionsMap.toJSON(),
			}),
		);
		checkForEnding();
	};
	provider.doc.on("updateV2", onDocUpdate);
	onCleanup(() => provider.doc.off("updateV2", onDocUpdate));

	onDetectIsBoardInitialized(provider, (isInitialized) => {
		if (isInitialized) {
			provider.doc.getText(SYNC_KEY).setAttribute(SYNC_KEY, nanoid());
			return;
		}
		startNewGame(DEFAULT_GAME_SIZE);
	});

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
