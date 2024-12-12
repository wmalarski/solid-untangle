import { createClient } from "@liveblocks/client";
import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	onCleanup,
	useContext,
} from "solid-js";
import { useGameConfig } from "./game-config";

const createLiveblocksConnection = (gameId: string) => {
	const client = createClient({
		publicApiKey: import.meta.env.VITE_LIVEBLOCK_PUBLIC_KEY,
	});

	const { room, leave } = client.enterRoom(gameId);

	onCleanup(() => {
		leave();
	});

	return { client, room };
};

const LiveblocksConnectionContext = createContext<
	Accessor<ReturnType<typeof createLiveblocksConnection>>
>(() => {
	throw new Error("LiveblocksConnectionContext is not defined");
});

export const LiveblocksConnectionProvider: Component<ParentProps> = (props) => {
	const config = useGameConfig();
	const gameId = createMemo(() => config().gameId);
	const value = createMemo(() => createLiveblocksConnection(gameId()));

	return (
		<LiveblocksConnectionContext.Provider value={value}>
			{props.children}
		</LiveblocksConnectionContext.Provider>
	);
};

export const useLiveblocksConnection = () => {
	return useContext(LiveblocksConnectionContext);
};
