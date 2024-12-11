import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	createSignal,
	useContext,
} from "solid-js";
import { useGameConfig } from "./game-config";

const createSelectionState = (_playerId: string) => {
	const [selectedId, setSelectedId] = createSignal<null | string>(null);

	const select = (selectionId: null | string) => {
		setSelectedId(selectionId);
	};

	const clear = () => {
		setSelectedId(null);
	};

	return { clear, select, selectedId };
};

const SelectionStateContext = createContext<
	Accessor<ReturnType<typeof createSelectionState>>
>(() => {
	throw new Error("SelectionStateContext is not defined");
});

export const SelectionStateProvider: Component<ParentProps> = (props) => {
	const config = useGameConfig();

	const value = createMemo(() => createSelectionState(config().player.id));

	return (
		<SelectionStateContext.Provider value={value}>
			{props.children}
		</SelectionStateContext.Provider>
	);
};

export const useSelectionState = () => {
	return useContext(SelectionStateContext);
};
