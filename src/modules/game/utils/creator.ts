import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import type { Connection, Point2D } from "./types";

const getNeighbors = (
	index: number,
	rows: number,
	columns: number,
	nodes: number,
) => {
	const row = Math.floor(index / columns);
	const column = index % columns;
	const all = rows * columns;
	const columnsInRow = row + 1 === rows ? nodes + columns - all : columns;
	const uniqueNeighbors = new Set<number>();

	if (column > 0) {
		uniqueNeighbors.add(index - 1);
	}

	if (column < columnsInRow - 1) {
		uniqueNeighbors.add(index + 1);
	}

	if (row > 0) {
		uniqueNeighbors.add(index - columns);
	}

	if (index + columns < nodes) {
		uniqueNeighbors.add(index + columns);
	}

	return uniqueNeighbors;
};

const mapNeighborsToStringIds = (neighbors: Set<number>[]) => {
	const ids = Array.from({ length: neighbors.length }, nanoid);

	const result = new Map<string, Set<string>>();

	neighbors.forEach((nodes, index) => {
		const nodeId = ids[index];
		const mappedSet = new Set([...nodes].map((index) => ids[index]));
		result.set(nodeId, mappedSet);
	});

	return result;
};

const getInitialState = (neighbors: Map<string, Set<string>>) => {
	const keys = Array.from(neighbors.keys());

	const initialMap = keys.map((node) => ({
		id: nanoid(),
		node,
	}));

	const indexToCluster = new Map(
		initialMap.map((entry) => [entry.node, entry.id]),
	);

	const clusters = new Map(initialMap.map((entry) => [entry.id, [entry.node]]));

	return { indexToCluster, clusters };
};

const getPossibleConnections = (
	nodes: string[],
	neighbors: Map<string, Set<string>>,
) => {
	const connections: Connection[] = [];

	for (const start of nodes) {
		const nodeNeighbors = neighbors.get(start);

		if (nodeNeighbors) {
			for (const end of nodeNeighbors) {
				connections.push({ start, end });
			}
		}
	}

	return connections;
};

const getRandomElement = <T>(clusterNodes: T[]) => {
	const randomIndex = Math.floor(Math.random() * clusterNodes.length);
	return clusterNodes[randomIndex];
};

const shuffle = <T>(list: T[]) => {
	return list
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
};

const getConnections = (neighbors: Map<string, Set<string>>) => {
	const neighborsMap = new Map(neighbors);
	const { clusters, indexToCluster } = getInitialState(neighbors);

	const possibleConnectionsCount = Math.floor(
		neighbors
			.values()
			.map((set) => set.size)
			.reduce((previous, current) => previous + current) / 2,
	);

	const connectionsGoal = possibleConnectionsCount / 1.2;

	const connections: Connection[] = [];

	let queue = shuffle(Array.from(clusters.keys()));

	while (queue.length > 1 || connections.length < connectionsGoal) {
		const cluster = queue.pop();

		if (!cluster) {
			continue;
		}

		const clusterNodes = clusters.get(cluster);

		if (!clusterNodes) {
			continue;
		}

		const possibleConnections = getPossibleConnections(
			clusterNodes,
			neighborsMap,
		);

		if (possibleConnections.length < 1) {
			continue;
		}

		const connection = getRandomElement(possibleConnections);
		const endCluster = indexToCluster.get(connection.end);

		if (!endCluster) {
			continue;
		}

		const endNodes = clusters.get(endCluster);

		if (!endNodes) {
			continue;
		}

		const newCluster = nanoid();
		const newNodes = [...new Set([...clusterNodes, ...endNodes])];

		clusters.delete(cluster);
		clusters.delete(endCluster);
		clusters.set(newCluster, newNodes);

		neighborsMap.get(connection.start)?.delete(connection.end);
		neighborsMap.get(connection.end)?.delete(connection.start);

		queue.push(newCluster);
		queue = shuffle(queue);

		connections.push(connection);

		for (const index of newNodes) {
			indexToCluster.set(index, newCluster);
		}
	}

	return connections;
};

const getPositions = (
	nodeIds: string[],
	width: number,
	height: number,
): Record<string, Point2D> => {
	const padding = 0.1;
	const negativePadding = 1 - 2 * padding;
	return Object.fromEntries(
		nodeIds.map((nodeId) => [
			nodeId,
			{
				x:
					Math.floor(Math.random() * width * negativePadding) + width * padding,
				y:
					Math.floor(Math.random() * height * negativePadding) +
					width * padding,
			},
		]),
	);
};

export const createGame = (nodes: number) => {
	const width = 1000;
	const height = 1000;
	const rows = Math.ceil(Math.sqrt(nodes));
	const columns = Math.ceil(nodes / rows);

	const indexedNeighbors = Array.from({ length: nodes }).map((_value, index) =>
		getNeighbors(index, rows, columns, nodes),
	);

	const neighbors = mapNeighborsToStringIds(indexedNeighbors);

	const connections = getConnections(neighbors);
	const nodeIds = Array.from(neighbors.keys());
	const positions = getPositions(nodeIds, width, height);

	return { connections, positions };
};

export const createLiveGame = (nodes: number) => {
	const game = createGame(nodes);

	const connections = new LiveList(game.connections);
	const positions = new LiveMap(
		Object.entries(game.positions).map(([nodeId, point]) => [
			nodeId,
			new LiveObject(point),
		]),
	);

	return { connections, positions };
};
