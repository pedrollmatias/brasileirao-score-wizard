import { getUfmgMatchPrediction } from "../infra/ufmg-crawler";
import { IPrediction, ITeam } from "./domain.types";

export const getApiFootballMatchPrediction = async ({
  home,
  away,
}: {
  home: ITeam;
  away: ITeam;
  fixtureId: string;
}): Promise<IPrediction | undefined> => {
  const prediction = await getUfmgMatchPrediction({
    away,
    home,
  });

  if (!prediction) {
    return;
  }

  return prediction;
};
