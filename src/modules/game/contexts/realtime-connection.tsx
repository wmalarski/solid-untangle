import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	useContext,
} from "solid-js";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { useGameConfig } from "./game-config";

const createRealtimeConnection = (gameId: string) => {
	const ydoc = new Y.Doc({ autoLoad: true, shouldLoad: true });

	// ydoc.transact()

	const signaling = import.meta.env.VITE_WEBRTC_SIGNALING_URLS.split(",");
	const provider = new WebrtcProvider(gameId, ydoc, { signaling });

	// provider.

	// persistence.

	// provider.connect();
	// ydoc.load();
	// console.log("CONNECT");

	// onCleanup(() => {
	// 	provider.disconnect();
	// 	console.log("DISCONNECT");
	// });

	return provider;
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
