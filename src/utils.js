export const getAverageArr = (arr) =>
  Number((arr.reduce((a, b) => a + b, 0) / arr.length ?? 0).toFixed(2));
export const sumArr = (arr) => arr.reduce((a, b) => a + b, 0);
export const getMinArr = (arr) => Math.min(...arr);
export const getMaxArr = (arr) => Math.max(...arr);
