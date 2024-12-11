import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	useContext,
} from "solid-js";
import type { Player } from "../utils/player";

type CreateGameConfigArgs = {
	player: Player;
	gameId: string;
};

const createGameConfig = ({ player, gameId }: CreateGameConfigArgs) => {
	return { gameId, player };
};

const GameConfigContext = createContext<
	Accessor<ReturnType<typeof createGameConfig>>
>(() => {
	throw new Error("GameConfigContext not defined");
});

type GameConfigProviderProps = ParentProps<{
	player: Player;
	gameId: string;
}>;

export const GameConfigProvider: Component<GameConfigProviderProps> = (
	props,
) => {
	const value = createMemo(() =>
		createGameConfig({ player: props.player, gameId: props.gameId }),
	);

	return (
		<GameConfigContext.Provider value={value}>
			{props.children}
		</GameConfigContext.Provider>
	);
};

export const useGameConfig = () => {
	return useContext(GameConfigContext);
};
