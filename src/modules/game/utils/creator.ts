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

const creationLoop = (nodes: number, neighbors: Map<number, Set<number>>) => {
	const neighborsMap = new Map(neighbors);
	const { clusters, indexToCluster } = getInitialState(nodes);

	const connections: Connection[] = [];

	let queue = shuffle(Array.from(clusters.keys()));
	console.log("queue", queue);

	let counter = 0;

	while (queue.length > 1 && counter < 100) {
		counter += 1;
		const cluster = queue.pop();

		console.log(counter, "LOOP1");
		console.log(
			JSON.stringify(
				{ cluster, clusters: Object.fromEntries(clusters) },
				null,
				2,
			),
		);

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

		console.log(counter, "LOOP2");
		console.log(
			JSON.stringify(
				{
					possibleConnections,
					clusterNodes,
					neighborsMap: Object.fromEntries(
						neighborsMap.entries().map(([index, set]) => [index, [...set]]),
					),
				},
				null,
				2,
			),
		);

		if (possibleConnections.length < 1) {
			continue;
		}

		const connection = getRandomElement(possibleConnections);
		const endCluster = indexToCluster.get(connection.end);

		endCluster === cluster &&
			console.log("!!!!!!MATCH!!!!!", { endCluster, cluster });

		console.log(counter, "LOOP3");
		console.log(JSON.stringify({ connection, endCluster }, null, 2));

		if (!endCluster) {
			continue;
		}

		const endNodes = clusters.get(endCluster);

		console.log(counter, "LOOP4");
		console.log(JSON.stringify({ endNodes }, null, 2));

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

		queue.unshift(newCluster);
		queue = shuffle(queue);

		connections.push(connection);

		for (const index of newNodes) {
			indexToCluster.set(index, newCluster);
		}

		console.log(counter, "LOOP5");
		console.log(JSON.stringify({ newCluster, newNodes }, null, 2));

		console.log(counter, "END");
		console.log(
			JSON.stringify(
				{
					cluster,
					clusters: Object.fromEntries(clusters),
					indexToCluster: Object.fromEntries(indexToCluster),
					queue,
					neighborsMap: Object.fromEntries(
						neighborsMap.entries().map(([index, set]) => [index, [...set]]),
					),
				},
				null,
				2,
			),
		);

		// const cluster = queue[queue.length - 1];

		// console.log(counter, "LOOP1");
		// console.log(JSON.stringify({ queue, cluster }, null, 2));

		// if (!cluster) {
		// 	continue;
		// }

		// const clusterNodes = clusters.get(cluster);

		// console.log(counter, "LOOP2");

		// console.log(
		// 	JSON.stringify(
		// 		{
		// 			clusters: Object.fromEntries(clusters),
		// 			clusterNodes,
		// 		},
		// 		null,
		// 		2,
		// 	),
		// );

		// if (!clusterNodes) {
		// 	continue;
		// }

		// const randomFromNode = getRandomClusterNode(clusterNodes);
		// const possibleToNodes = neighborsMap.get(randomFromNode);

		// console.log(counter, "LOOP3");

		// console.log(
		// 	JSON.stringify(
		// 		{
		// 			randomFromNode,
		// 			possibleToNodes: [...(possibleToNodes ?? [])],
		// 			neighborsMap: Object.fromEntries(
		// 				neighborsMap.entries().map(([index, set]) => [index, [...set]]),
		// 			),
		// 		},
		// 		null,
		// 		2,
		// 	),
		// );

		// if (!possibleToNodes) {
		// 	queue.unshift(cluster);
		// 	continue;
		// }

		// const randomToNode = getRandomClusterNode([...possibleToNodes]);
		// const randomToCluster = indexToCluster.get(randomToNode);

		// console.log(counter, "LOOP4");

		// console.log(
		// 	JSON.stringify(
		// 		{
		// 			randomToNode,
		// 			randomToCluster,
		// 			indexToCluster: Object.fromEntries(indexToCluster.entries()),
		// 		},
		// 		null,
		// 		2,
		// 	),
		// );

		// if (!randomToCluster) {
		// 	queue.unshift(cluster);
		// 	continue;
		// }

		// const randomToIndexes = clusters.get(randomToCluster);

		// if (!randomToIndexes) {
		// 	continue;
		// }

		// const newCluster = nanoid();
		// const newClusterIndexes = [...clusterNodes, ...randomToIndexes];

		// clusters.delete(cluster);
		// clusters.delete(randomToCluster);
		// clusters.set(newCluster, newClusterIndexes);

		// possibleToNodes.delete(randomToNode);
		// neighborsMap.get(randomToNode)?.delete(randomFromNode);

		// queue.unshift(newCluster);
		// connections.push({ start: randomFromNode, end: randomToNode });

		// for (const index of newClusterIndexes) {
		// 	indexToCluster.set(index, newCluster);
		// }

		// console.log(counter, "cluster");

		// console.log(
		// 	JSON.stringify(
		// 		{
		// 			cluster,
		// 			clusterNodes,
		// 			randomFromNode,
		// 			possibleToNodes: [...possibleToNodes],
		// 			randomToNode,
		// 			randomToCluster,
		// 			clusters: Object.fromEntries(clusters),
		// 			indexToCluster: Object.fromEntries(indexToCluster),
		// 			newClusterIndexes,
		// 			newCluster,
		// 			randomToIndexes,
		// 		},
		// 		null,
		// 		2,
		// 	),
		// );
	}

	console.log(counter, "LOOP5");
	console.log(JSON.stringify({ connections }, null, 2));

	return {
		queue,
		clusters: Object.fromEntries(clusters),
		indexToCluster: Object.fromEntries(indexToCluster),
		connections,
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
		neighbors: Object.fromEntries(neighbors),
		loop,
	};
};
