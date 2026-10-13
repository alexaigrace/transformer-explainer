export const reshapeArray = (arr: number[], dimensions: readonly number[]): number[][] => {
	// Ignore only the batch dimension, retaining both attention matrix dimensions.
	const matrixDimensions =
		dimensions.length === 3 && dimensions[0] === 1 ? dimensions.slice(1) : dimensions;
	const [rowCount, columnCount] = matrixDimensions;

	if (matrixDimensions.length !== 2 || rowCount === undefined || columnCount === undefined) {
		throw new Error('Expected an attention tensor with two matrix dimensions.');
	}

	return Array.from({ length: rowCount }, () => arr.splice(0, columnCount));
};

export const findArrayDepth = (arr: unknown): number =>
	Array.isArray(arr)
		? 1 + arr.reduce((max: number, item: unknown) => Math.max(max, findArrayDepth(item)), 0)
		: 0;

export const splitArray = (doubleArray: number[][], x: number) => {
	const splitArrays = doubleArray.map((subArray) => {
		const length = Math.ceil(subArray.length / x);
		return Array.from({ length: x }, (_, i) => subArray.slice(i * length, i * length + length));
	});

	return Array.from({ length: x }, (_, index) =>
		splitArrays.map((subArray) => subArray[index] || [])
	);
};

export const maskArray = (data: AttentionMatrixData): AttentionMatrixData => {
	return data.map((array, index) => {
		const newArray = new Array<number | null>(array.length).fill(-Infinity);
		for (let i = 0; i <= index && i < array.length; i++) {
			newArray[i] = array[i];
		}
		return newArray;
	});
};
