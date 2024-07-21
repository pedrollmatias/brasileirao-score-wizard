import {
  TournamentEnum,
  SeasonEnum,
  ApiSofascore,
} from "../infra/api-sofascore/api-sofascore";
import { IPreviousRound, ITeam } from "./domain.types";

export const getPreviousRoundMatches = async ({
  currentRound,
  away,
  home,
  tournamentId,
  seasonId,
}: {
  currentRound: number;
  away: ITeam;
  home: ITeam;
  tournamentId: TournamentEnum;
  seasonId: SeasonEnum;
}): Promise<IPreviousRound[]> => {
  const sofascoreClient = new ApiSofascore();

  const data = await sofascoreClient.getTournamentEvents({
    tournamentId,
    seasonId,
  });

  return data
    .filter((event) => {
      const eventRound = event.roundInfo.round;
      const isPreviousRoundNumber = currentRound > eventRound;
      const isHomePresent = [event.homeTeam.id, event.awayTeam.id].includes(
        home.id
      );
      const isAwayPresent = [event.homeTeam.id, event.awayTeam.id].includes(
        away.id
      );

      return isPreviousRoundNumber && (isHomePresent || isAwayPresent);
    })
    .map((event: any) => {
      const round = event.roundInfo.round;
      const home: ITeam = {
        id: event.homeTeam.id,
        name: event.homeTeam.name,
      };
      const away: ITeam = {
        id: event.awayTeam.id,
        name: event.awayTeam.name,
      };
      const winner = getMatchResult({
        away,
        home,
        winnerCode: event.winnerCode,
      });
      const score = {
        home: event.homeScore.normaltime,
        away: event.awayScore.normaltime,
      };

      return {
        id: event.id,
        home,
        away,
        winner,
        round,
        score,
      };
    });
};

const getMatchResult = ({
  winnerCode,
  home,
  away,
}: {
  winnerCode: 1 | 2 | 3;
  home: ITeam;
  away: ITeam;
}): ITeam | undefined => {
  switch (winnerCode) {
    case 1:
      return home;
    case 2:
      return away;
    case 3:
    default:
      return;
  }
};
