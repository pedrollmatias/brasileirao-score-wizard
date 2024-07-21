import {
  ApiSofascore,
  SeasonEnum,
  TournamentEnum,
} from "../infra/api-sofascore/api-sofascore";
import { IMatch } from "./domain.types";

export type ICurrentRoundMatch = IMatch;

export const getCurrentRoundMatches = async ({
  tournamentId,
  seasonId,
}: {
  tournamentId: TournamentEnum;
  seasonId: SeasonEnum;
}): Promise<{
  matches: ICurrentRoundMatch[];
  round: number;
}> => {
  const sofascoreClient = new ApiSofascore();

  const tournamentRoundsData = await sofascoreClient.getTournamentRounds({
    tournamentId,
    seasonId,
  });

  const {
    currentRound: { round },
  } = tournamentRoundsData;

  const tournamentEvents = await sofascoreClient.getRoundEvents({
    tournamentId,
    seasonId,
    round,
  });

  const matches = tournamentEvents.map((event: any) => ({
    id: event.id,
    home: {
      id: event.homeTeam.id,
      name: event.homeTeam.name,
    },
    away: {
      id: event.awayTeam.id,
      name: event.awayTeam.name,
    },
  }));

  return { matches, round };
};
