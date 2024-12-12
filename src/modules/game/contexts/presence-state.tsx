import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createEffect,
	createMemo,
	onCleanup,
	useContext,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { useGameConfig } from "./game-config";
import {
	type LiveblocksConnection,
	useLiveblocksConnection,
} from "./liveblocks-connection";

type CreatePresenceStateArgs = {
	room: LiveblocksConnection["room"];
};

const createPresenceState = ({ room }: CreatePresenceStateArgs) => {
	const [others, setOthers] = createStore(room.getOthers());

	const unsubscribeOthers = room.subscribe("others", (updatedOthers) => {
		setOthers(reconcile(updatedOthers));
	});

	onCleanup(() => {
		unsubscribeOthers();
	});

	return others;
};

const PresenceStateContext = createContext<
	Accessor<ReturnType<typeof createPresenceState>>
>(() => {
	throw new Error("PresenceStateContext not defined");
});

export const PresenceStateProvider: Component<ParentProps> = (props) => {
	const config = useGameConfig();
	const liveblocks = useLiveblocksConnection();

	const value = createMemo(() =>
		createPresenceState({ room: liveblocks().room }),
	);

	createEffect(() => {
		liveblocks().room.updatePresence({ player: config().player });
	});

	return (
		<PresenceStateContext.Provider value={value}>
			{props.children}
		</PresenceStateContext.Provider>
	);
};

export const usePresenceState = () => {
	return useContext(PresenceStateContext);
};
