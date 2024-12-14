import { LiveMap, type LiveObject } from "@liveblocks/client";
import { createWritableMemo } from "@solid-primitives/memo";
import { createAsync } from "@solidjs/router";
import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { createLiveGame } from "../utils/creator";
import { checkForCrossing } from "../utils/geometry";
import type { Connection, Point2D } from "../utils/types";
import {
	type LiveblocksConnection,
	useLiveblocksConnection,
} from "./liveblocks-connection";

const getConnectionPairs = (connections: Connection[]) => {
	return connections.flatMap((connection, index) => {
		const nodes = new Set([connection.end, connection.start]);
		return connections
			.slice(index + 1)
			.filter((entry) => !nodes.has(entry.end) && !nodes.has(entry.start))
			.map((entry) => [connection, entry] as const);
	});
};

const detectCrossing = (
	connectionPairs: (readonly [Connection, Connection])[],
	positions: Record<string, Point2D>,
) => {
	return connectionPairs.some(([first, second]) => {
		return checkForCrossing(
			{ start: positions[first.start], end: positions[first.end] },
			{ start: positions[second.start], end: positions[second.end] },
		);
	});
};

type RootLiveObject = Awaited<
	ReturnType<LiveblocksConnection["room"]["getStorage"]>
>["root"];

const getInitialStore = (root?: RootLiveObject): GameStateStore => {
	if (!root) {
		return { connections: [], positions: {} };
	}

	const positions = root.get("positions");
	return {
		connections: root.get("connections").toArray(),
		positions: Object.fromEntries(
			Array.from(positions.entries()).map(([nodeId, livePosition]) => [
				nodeId,
				livePosition.toObject(),
			]),
		),
	};
};

type GameStateStore = {
	positions: Record<string, Point2D>;
	connections: Connection[];
};

export type SetPositionPayload = Point2D & {
	nodeId: string;
};

type CreateGameStateContextArgs = {
	room: LiveblocksConnection["room"];
};

const createGameStateContext = ({ room }: CreateGameStateContextArgs) => {
	const [hasEnded, setHasEnded] = createSignal(false);

	const storage = createAsync(() => room.getStorage());

	const state = createMemo(() => {
		const [store, setStore] = createStore(getInitialStore(storage()?.root));
		return { store, setStore };
	});

	const getInitialLive = (root?: RootLiveObject) => {
		if (!root) {
			return {
				positions: new LiveMap<string, LiveObject<Point2D>>(),
				unsubscribe: () => {},
			};
		}

		const unsubscribes: (() => void)[] = [];
		const positions = root.get("positions");
		positions.forEach((value, nodeId) => {
			unsubscribes.push(
				room.subscribe(value, (node) => {
					setPosition({ nodeId, ...node.toObject() });
					checkForEnding();
				}),
			);
		});

		const unsubscribe = () => {
			for (const callback of unsubscribes) {
				callback();
			}
		};

		return { positions, unsubscribe };
	};

	const [livePositions, setLivePositions] = createWritableMemo<
		ReturnType<typeof getInitialLive>
	>((previous) => {
		previous?.unsubscribe();
		return getInitialLive(storage()?.root);
	});

	const connectionPairs = createMemo(() =>
		getConnectionPairs(state().store.connections),
	);

	const setPosition = (payload: SetPositionPayload) => {
		state().setStore(
			produce((state) => {
				state.positions[payload.nodeId] = payload;
			}),
		);
	};

	const setPositions = (payloads: SetPositionPayload[]) => {
		state().setStore(
			produce((state) => {
				for (const payload of payloads) {
					state.positions[payload.nodeId] = payload;
				}
			}),
		);
	};

	const checkForEnding = () => {
		const pairs = connectionPairs();
		if (pairs.length > 0) {
			const hasCrossing = detectCrossing(pairs, state().store.positions);
			setHasEnded(!hasCrossing);
		}
	};

	const confirmPosition = (nodeId: string, position: Point2D) => {
		room.batch(() => {
			livePositions().positions.get(nodeId)?.set("x", position.x);
			livePositions().positions.get(nodeId)?.set("y", position.y);
		});

		checkForEnding();
	};

	const startNewGame = async (nodes: number) => {
		setHasEnded(false);

		const storage = await room.getStorage();

		room.batch(() => {
			const { connections, positions } = createLiveGame(nodes);
			storage.root.set("connections", connections);
			storage.root.set("positions", positions);
		});
	};

	createEffect(() => {
		const root = storage()?.root;

		if (!root) {
			return;
		}

		const unsubscribe = room.subscribe(root, (node) => {
			livePositions().unsubscribe();
			state().setStore(getInitialStore(node));
			setLivePositions(getInitialLive(node));
			setHasEnded(false);
		});

		onCleanup(() => {
			unsubscribe();
			livePositions().unsubscribe();
		});
	});

	const unsubscribe = room.subscribe("others", (updatedOthers) => {
		for (const other of updatedOthers) {
			const cursor = other.presence.cursor;
			const nodeId = cursor?.nodeId;
			if (nodeId) {
				setPosition({ ...cursor, nodeId });
			}
		}
	});
	onCleanup(() => unsubscribe());

	return {
		get store() {
			return state().store;
		},
		setPosition,
		setPositions,
		confirmPosition,
		hasEnded,
		startNewGame,
	};
};

const GameStateContext = createContext<
	Accessor<ReturnType<typeof createGameStateContext>>
>(() => {
	throw new Error("GameStateContext is not defined");
});

export const GameStateProvider: Component<ParentProps> = (props) => {
	const liveblocks = useLiveblocksConnection();

	const value = createMemo(() =>
		createGameStateContext({ room: liveblocks().room }),
	);

	return (
		<GameStateContext.Provider value={value}>
			{props.children}
		</GameStateContext.Provider>
	);
};

export const useGameState = () => {
	return useContext(GameStateContext);
};
