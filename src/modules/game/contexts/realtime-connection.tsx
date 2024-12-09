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

type RealtimeConnectionProviderProps = ParentProps<{
	gameId: string;
}>;

export const RealtimeConnectionProvider: Component<
	RealtimeConnectionProviderProps
> = (props) => {
	const value = createMemo(() => createRealtimeConnection(props.gameId));

	return (
		<RealtimeConnectionContext.Provider value={value}>
			{props.children}
		</RealtimeConnectionContext.Provider>
	);
};

export const useRealtimeConnection = () => {
	return useContext(RealtimeConnectionContext);
};
