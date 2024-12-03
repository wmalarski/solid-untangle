import { nanoid } from "nanoid";

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

const getInitialState = (nodes: number) => {
	const initialMap = Array.from({ length: nodes }).map((_value, index) => ({
		id: nanoid(),
		index,
	}));

	const indexToCluster = new Map(
		initialMap.map((entry) => [entry.index, entry.id]),
	);

	const clusters = new Map(
		initialMap.map((entry) => [entry.id, [entry.index]]),
	);

	return { initialMap, indexToCluster, clusters };
};

const getRandomClusterNode = (clusterNodes: number[]) => {
	const randomIndex = Math.floor(Math.random() * clusterNodes.length);
	return clusterNodes[randomIndex];
};

const creationLoop = (nodes: number, neighbors: Map<number, Set<number>>) => {
	const neighborsMap = new Map(neighbors);
	const { clusters, indexToCluster, initialMap } = getInitialState(nodes);

	const queue = Array.from(clusters.keys());
	console.log("queue", queue);

	while (queue.length > 0) {
		const cluster = queue.pop();

		if (!cluster) {
			continue;
		}

		const clusterNodes = clusters.get(cluster);

		if (!clusterNodes) {
			continue;
		}

		const randomFromNode = getRandomClusterNode(clusterNodes);
		const possibleToNodes = neighborsMap.get(randomFromNode);

		if (!possibleToNodes) {
			continue;
		}

		console.log("cluster", {
			cluster,
			clusterNodes,
			randomFromNode,
			possibleToNodes,
		});
	}

	return {
		queue,
		clusters: Object.fromEntries(clusters),
		indexToCluster: Object.fromEntries(indexToCluster),
	};
};

export const createGame = (nodes: number) => {
	const rows = Math.ceil(Math.sqrt(nodes));
	const columns = Math.ceil(nodes / rows);

	console.log("NODES", nodes);

	const neighbors = new Map(
		Array.from({ length: nodes }).map((_value, index) => [
			index,
			getNeighbors(index, rows, columns, nodes),
		]),
	);

	const loop = creationLoop(nodes, neighbors);

	return {
		rows,
		nodes,
		columns,
		neighbors: Object.fromEntries(
			neighbors.entries().map(([index, set]) => [index, [...set]]),
		),
		loop,
	};
};
