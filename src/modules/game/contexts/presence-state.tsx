import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import type { Player } from "~/modules/player/server/server";

type PresenceState = Record<string, Player | undefined>;

const createPresenceState = (player: Player, gameId: string) => {
	const [players] = createStore<PresenceState>({});
	return { players, gameId, player };
};

const PresenceStateContext = createContext<
	Accessor<ReturnType<typeof createPresenceState>>
>(() => {
	throw new Error("PresenceStateContext not defined");
});

type PresenceStateProviderProps = ParentProps<{
	player: Player;
	gameId: string;
}>;

export const PresenceStateProvider: Component<PresenceStateProviderProps> = (
	props,
) => {
	const value = createMemo(() =>
		createPresenceState(props.player, props.gameId),
	);

	return (
		<PresenceStateContext.Provider value={value}>
			{props.children}
		</PresenceStateContext.Provider>
	);
};

export const usePresenceState = () => {
	return useContext(PresenceStateContext);
};
