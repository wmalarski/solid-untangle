import { createWritableMemo } from "@solid-primitives/memo";
import {
	type Accessor,
	type Component,
	createContext,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	type ParentProps,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { WebrtcProvider } from "y-webrtc";
import type { Transaction, YMapEvent } from "yjs";
import { createGame } from "../utils/creator";
import { checkForCrossing } from "../utils/geometry";
import type { Connection, Point2D } from "../utils/types";
import { useRealtimeConnection } from "./realtime-connection";

const CONNECTION_CONFIG_KEY = "connections";

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

type CreateGameStateContextArgs = {
	connections: Connection[];
	initialPositions: Record<string, Point2D>;
	onGameReload: (nodes: number) => void;
	provider: WebrtcProvider;
};

const createGameStateContext = ({
	connections,
	initialPositions,
	onGameReload,
	provider,
}: CreateGameStateContextArgs) => {
	// const connectionArray = provider.doc.getArray(CONNECTION_CONFIG_KEY);

	// console.log("connectionArray1", connectionArray.toArray());

	// if (connectionArray.length === 0) {
	// 	const { connections } = createGame(10);
	// 	connectionArray.delete(0, connectionArray.length);
	// 	connectionArray.push(connections);
	// }

	// console.log("connectionArray2", connectionArray.toArray());

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

	const startNewGame = (nodes: number) => {
		setHasEnded(false);
		onGameReload(nodes);

		const map = provider.doc.getMap();
		const { connections } = createGame(10);
		map.set(CONNECTION_CONFIG_KEY, connections);
	};

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

	// createEffect(() => {
	// 	const provider = realtimeConnection();

	// 	const listener = ({ connected }: { connected: boolean }) => {
	// 		console.log("status-listener", connected);

	// 		if (!connected) {
	// 			return;
	// 		}

	// 		const array = provider.doc.getArray(CONNECTION_CONFIG_KEY);
	// 		console.log("ARRAY", array.toArray());

	// 		if (array.length !== 0) {
	// 			return;
	// 		}

	// 		const { connections } = createGame(10);
	// 		array.delete(0, array.length);
	// 		array.push(connections);
	// 	};

	// 	provider.on("status", listener);

	// 	onCleanup(() => {
	// 		provider.off("status", listener);
	// 	});
	// });

	createEffect(() => {
		const provider = realtimeConnection();

		const map = provider.doc.getMap();

		const listener = (event: YMapEvent<unknown>, transaction: Transaction) => {
			const connections = map.get(CONNECTION_CONFIG_KEY);

			// const array = provider.doc.getArray(CONNECTION_CONFIG_KEY);
			// array.delete(0, array.length);
			// const { connections } = createGame(10);
			// array.push(connections);

			console.log("array-listener", event, connections, transaction);
		};

		map.observe(listener);

		onCleanup(() => {
			map.unobserve(listener);
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
