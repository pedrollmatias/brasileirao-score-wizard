import { IPreviousRound } from "./controllers/domain.types";

export interface IRoundGroup {
  [key: string]: IPreviousRound[];
}

export const groupRounds = (matches: IPreviousRound[]): IRoundGroup => {
  const initialValue: IRoundGroup = {};

  return matches.reduce((groups, match) => {
    const { round } = match;

    return {
      ...groups,
      [round]: [...(groups[round] || []), match],
    };
  }, initialValue);
};

export const getAverageArr = (arr: number[], fractionDigits: number = 2) =>
  Number(
    (arr.reduce((a, b) => a + b, 0) / arr.length ?? 0).toFixed(fractionDigits)
  );
export const sumArr = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
export const getMinArr = (arr: number[]) => Math.min(...arr);
export const getMaxArr = (arr: number[]) => Math.max(...arr);
