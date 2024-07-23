import { ApiFootball } from "../infra/api-football/api-football";
import { IPrediction, ITeam } from "./domain.types";

export const getApiFootballMatchPrediction = async ({
  home,
  away,
  fixtureId,
}: {
  home: ITeam;
  away: ITeam;
  fixtureId: string;
}): Promise<IPrediction | undefined> => {
  const apiFootballClient = new ApiFootball();

  const response = await apiFootballClient.getMatchPrediction({
    fixtureId,
  });

  if (!response) {
    return;
  }

  const { predictions } = response;
  const { percent, winner } = predictions;

  return {
    comment: winner.comment,
    home: {
      team: home,
      percent: percent.home,
    },
    away: {
      team: away,
      percent: percent.away,
    },
    draw: {
      percent: percent.draw,
    },
  };
};
