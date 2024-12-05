import { throttle } from "@solid-primitives/scheduled";
import {
	type Accessor,
	type Component,
	createContext,
	createMemo,
	createSignal,
	type ParentProps,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { REALTIME_THROTTLE_TIME } from "../utils/constants";

type SelectionState = Record<string, null | string | undefined>;

type PlayerSelectionPayload = {
	playerId: string;
	selectionId: null | string;
};

const createSelectionState = (_playerId: string) => {
	const [selectedId, setSelectedId] = createSignal<null | string>(null);

	const [selection, setSelection] = createStore<SelectionState>({});

	const fragmentSelection = createMemo(() => {
		return Object.entries(selection).reduce<Record<string, string>>(
			(prev, [playerId, fragmentId]) => {
				if (fragmentId) {
					prev[fragmentId] = playerId;
				}
				return prev;
			},
			{},
		);
	});

	const sendBroadcast = throttle((_selectionId: null | string) => {
		// console.log("SELECTION-SEND", selectionId);
	}, REALTIME_THROTTLE_TIME);

	const select = (selectionId: null | string) => {
		sendBroadcast(selectionId);
		setSelectedId(selectionId);
	};

	const leave = (playerIds: string[]) => {
		setSelection(
			produce((state) => {
				for (const playerId of playerIds) {
					state[playerId] = undefined;
				}
			}),
		);
	};

	const setRemoteSelection = ({
		playerId,
		selectionId,
	}: PlayerSelectionPayload) => {
		setSelection(
			produce((state) => {
				state[playerId] = selectionId;
			}),
		);
	};

	const clear = () => {
		setSelection({});
		setSelectedId(null);
	};

	return {
		clear,
		fragmentSelection,
		leave,
		select,
		selectedId,
		selection,
		setRemoteSelection,
	};
};

const SelectionStateContext = createContext<
	Accessor<ReturnType<typeof createSelectionState>>
>(() => {
	throw new Error("SelectionStateContext is not defined");
});

type SelectionStateProviderProps = ParentProps<{
	playerId: string;
}>;

export const SelectionStateProvider: Component<SelectionStateProviderProps> = (
	props,
) => {
	const value = createMemo(() => createSelectionState(props.playerId));

	return (
		<SelectionStateContext.Provider value={value}>
			{props.children}
		</SelectionStateContext.Provider>
	);
};

export const useSelectionState = () => {
	return useContext(SelectionStateContext);
};
