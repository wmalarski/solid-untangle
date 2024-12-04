import {
	type Accessor,
	type Component,
	createContext,
	createMemo,
	type ParentProps,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { checkForCrossing } from "../utils/geometry";
import type { Connection, Point2D } from "../utils/types";

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
};

const createGameStateContext = ({
	connections,
	initialPositions,
}: CreateGameStateContextArgs) => {
	const [positions, setPositions] = createStore(initialPositions);
	const connectionPairs = getConnectionPairs(connections);

	const setPosition = (nodeId: string, position: Point2D) => {
		setPositions(
			produce((state) => {
				state[nodeId] = position;
			}),
		);
	};

	const confirmPosition = (_nodeId: string, _position: Point2D) => {
		const hasCrossing = detectCrossing(connectionPairs, positions);

		console.log("hasCrossing", hasCrossing);
		// send
		// console.log("SEND POSITION", nodeId, position);
	};

	return { connections, positions, setPosition, confirmPosition };
};

const GameStateContext = createContext<
	Accessor<ReturnType<typeof createGameStateContext>>
>(() => {
	throw new Error("GameStateContext is not defined");
});

type GameStateProviderProps = ParentProps<CreateGameStateContextArgs>;

export const GameStateProvider: Component<GameStateProviderProps> = (props) => {
	const value = createMemo(() =>
		createGameStateContext({
			connections: props.connections,
			initialPositions: props.initialPositions,
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
