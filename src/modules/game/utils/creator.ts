const getNeighbors = (
	index: number,
	rows: number,
	columns: number,
	nodes: number,
) => {
	const row = Math.floor(index / columns);
	const all = rows * columns;
	const columnsInRow = row + 1 === rows ? nodes + columns - all : columns;
	const indexShift = row * columns;

	const previousRowIndex = (index - columns + all) % all;
	const previousRowFix =
		previousRowIndex >= nodes ? previousRowIndex - columns : previousRowIndex;

	const nextRowIndex = (index + columns) % all;
	const nextRowFix =
		nextRowIndex >= nodes ? nextRowIndex % (all - columns) : nextRowIndex;

	const neighbors = [
		indexShift + ((index + 1) % columnsInRow),
		indexShift + ((index - 1 + columnsInRow) % columnsInRow),
		nextRowFix,
		previousRowFix,
	];

	const uniqueNeighbors = new Set(neighbors);

	uniqueNeighbors.delete(index);

	return uniqueNeighbors;
};

export const createGame = (nodes: number) => {
	const rows = Math.ceil(Math.sqrt(nodes));
	const columns = Math.ceil(nodes / rows);

	const neighbors = new Map(
		Array.from({ length: nodes }).map((_value, index) => [
			index,
			[...getNeighbors(index, rows, columns, nodes)],
		]),
	);

	return { rows, nodes, columns, neighbors: Object.fromEntries(neighbors) };
};
