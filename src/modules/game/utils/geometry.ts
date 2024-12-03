import type { Point2D } from "./types";

export const subtractPoint = (point: Point2D, other: Point2D) => {
	return { x: point.x - other.x, y: point.y - other.y };
};

export const getDistance = (point: Point2D, other: Point2D) => {
	return Math.sqrt((point.x - other.x) ** 2 + (point.y - other.y) ** 2);
};

export const scaleBy = (point: Point2D, other: Point2D) => {
	return { x: point.x * other.x, y: point.y * other.y };
};

export const getMinMaxFromPoints = (points: Point2D[]) => {
	const xSorted = points.sort((a, b) => a.x - b.x);
	const ySorted = points.sort((a, b) => a.y - b.y);
	return {
		max: { x: xSorted[xSorted.length - 1].x, y: ySorted[ySorted.length - 1].y },
		min: { x: xSorted[0].x, y: ySorted[0].y },
	};
};

export const getCenterFromPoints = (points: Point2D[]) => {
	let sumX = 0;
	let sumY = 0;

	for (const { x, y } of points) {
		sumX += x;
		sumY += y;
	}

	return { x: sumX / points.length, y: sumY / points.length };
};
