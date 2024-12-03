import {
	type Accessor,
	type Component,
	createContext,
	createMemo,
	type ParentProps,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { Connection, Point2D } from "../utils/types";

type CreateGameStateContextArgs = {
	connections: Connection[];
	initialPositions: Point2D[];
};

const createGameStateContext = ({
	connections,
	initialPositions,
}: CreateGameStateContextArgs) => {
	const initial = Object.fromEntries(
		initialPositions.map((position, index) => [index, position]),
	);
	const [positions, setPositions] = createStore(initial);

	const setPosition = (point: number, position: Point2D) => {
		setPositions(
			produce((state) => {
				state[point] = position;
			}),
		);
	};

	return { connections, positions, setPosition };
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
