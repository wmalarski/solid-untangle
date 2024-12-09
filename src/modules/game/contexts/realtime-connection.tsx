import {
	type Accessor,
	type Component,
	createContext,
	createMemo,
	type ParentProps,
	useContext,
} from "solid-js";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { useGameConfig } from "./game-config";

const createRealtimeConnection = (gameId: string) => {
	const ydoc = new Y.Doc();
	const provider = new WebrtcProvider(gameId, ydoc, {
		signaling: [
			"ws://localhost:4444",
			// "wss://signaling.yjs.dev",
			// "wss://y-webrtc-signaling-eu.herokuapp.com",
			// "wss://y-webrtc-signaling-us.herokuapp.com",
		],
	});
	return { ydoc, provider };
};

const RealtimeConnectionContext = createContext<
	Accessor<ReturnType<typeof createRealtimeConnection>>
>(() => {
	throw new Error("RealtimeConnectionContext is not defined");
});

export const RealtimeConnectionProvider: Component<ParentProps> = (props) => {
	const config = useGameConfig();
	const value = createMemo(() => createRealtimeConnection(config().gameId));

	return (
		<RealtimeConnectionContext.Provider value={value}>
			{props.children}
		</RealtimeConnectionContext.Provider>
	);
};

export const useRealtimeConnection = () => {
	return useContext(RealtimeConnectionContext);
};
