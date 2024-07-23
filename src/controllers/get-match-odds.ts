import { ApiFootball } from "../infra/api-football/api-football";
import { IMatchOdd } from "./domain.types";

export const getMatchOdds = async ({
  fixtureId,
  bookmakerId,
}: {
  fixtureId: string;
  bookmakerId: string | number;
}): Promise<IMatchOdd[] | undefined> => {
  const apiFootballClient = new ApiFootball();

  const odds = await apiFootballClient.getMatchOdds({
    bookmakerId,
    fixtureId,
  });

  if (!odds) {
    return;
  }

  const { bets } = odds;

  return bets;
};
