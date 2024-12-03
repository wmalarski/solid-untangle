import { nanoid } from "nanoid";

type Connection = {
	start: number;
	end: number;
};

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

	return { indexToCluster, clusters };
};

const getPossibleConnections = (
	nodes: number[],
	neighbors: Map<number, Set<number>>,
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

const creationConnections = (
	nodes: number,
	neighbors: Map<number, Set<number>>,
) => {
	const neighborsMap = new Map(neighbors);
	const { clusters, indexToCluster } = getInitialState(nodes);

	const connections: Connection[] = [];

	let queue = shuffle(Array.from(clusters.keys()));

	while (queue.length > 1) {
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

export const createGame = (nodes: number) => {
	const rows = Math.ceil(Math.sqrt(nodes));
	const columns = Math.ceil(nodes / rows);

	const neighbors = new Map(
		Array.from({ length: nodes }).map((_value, index) => [
			index,
			getNeighbors(index, rows, columns, nodes),
		]),
	);

	return creationConnections(nodes, neighbors);
};
