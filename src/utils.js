export const getAverageArr = (arr) =>
  Number((arr.reduce((a, b) => a + b, 0) / arr.length ?? 0).toFixed(2));
export const sumArr = (arr) => arr.reduce((a, b) => a + b, 0);
export const getMinArr = (arr) => Math.min(...arr);
export const getMaxArr = (arr) => Math.max(...arr);

export const waitApiFootbalFreeRateLimitToReset = () => {
  console.log(
    "Aguardando restar o tempo de rate limit do API Football para novas requisições..."
  );

  const minute = 1000 * 60; // 1min

  return new Promise((resolve) => setTimeout(resolve, minute));
};
