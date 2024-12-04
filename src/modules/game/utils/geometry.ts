import type { LineSection, Point2D } from "./types";

export const subtractPoint = (point: Point2D, other: Point2D) => {
	return { x: point.x - other.x, y: point.y - other.y };
};

export const checkForCrossing = (first: LineSection, second: LineSection) => {
	const det =
		(first.end.x - first.start.x) * (second.end.y - second.start.y) -
		(second.end.x - second.start.x) * (first.end.y - first.start.y);

	if (det === 0) {
		return false;
	}

	const lambda =
		((second.end.y - second.start.y) * (second.end.x - first.start.x) +
			(second.start.x - second.end.x) * (second.end.y - first.start.y)) /
		det;

	const gamma =
		((first.start.y - first.end.y) * (second.end.x - first.start.x) +
			(first.end.x - first.start.x) * (second.end.y - first.start.y)) /
		det;

	return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
};
