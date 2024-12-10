import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	onCleanup,
	useContext,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import type { WebrtcProvider } from "y-webrtc";
import type { Player } from "~/modules/player/server/server";
import { useGameConfig } from "./game-config";
import { useRealtimeConnection } from "./realtime-connection";

type PresenceState = Record<string, Player | undefined>;

type CreatePresenceStateArgs = {
	player: Player;
	provider: WebrtcProvider;
};

const createPresenceState = ({ player, provider }: CreatePresenceStateArgs) => {
	const [players, setPlayers] = createStore<PresenceState>({});

	const onChange = () => {
		const newPlayers = Object.fromEntries(
			Array.from(provider.awareness.getStates().values()).map((value) => [
				value.user.id,
				value.user,
			]),
		);

		setPlayers(reconcile(newPlayers));
	};

	provider.awareness.on("change", onChange);
	onCleanup(() => {
		provider.awareness.off("change", onChange);
	});

	provider.awareness.setLocalStateField("user", player);

	return { players };
};

const PresenceStateContext = createContext<
	Accessor<ReturnType<typeof createPresenceState>>
>(() => {
	throw new Error("PresenceStateContext not defined");
});

export const PresenceStateProvider: Component<ParentProps> = (props) => {
	const config = useGameConfig();
	const realtimeConnection = useRealtimeConnection();

	const value = createMemo(() =>
		createPresenceState({
			player: config().player,
			provider: realtimeConnection(),
		}),
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
