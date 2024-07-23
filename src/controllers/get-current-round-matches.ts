import {
  ApiSofascore,
  SofascoreSeasonEnum,
  SofascoreTournamentEnum,
} from "../infra/api-sofascore/api-sofascore";
import { IMatch, ITeam } from "./domain.types";

export const getCurrentRoundMatches = async ({
  round,
  tournamentId,
  seasonId,
}: {
  round: number;
  tournamentId: SofascoreTournamentEnum;
  seasonId: SofascoreSeasonEnum;
}): Promise<{
  matches: IMatch[];
  round: number;
}> => {
  const sofascoreClient = new ApiSofascore();

  const tournamentEvents = await sofascoreClient.getRoundEvents({
    tournamentId,
    seasonId,
    round: round,
  });

  const matches = tournamentEvents.map((event: any) => {
    const homeLogo = sofascoreClient.getTeamImageUrl({
      teamId: event.homeTeam.id,
    });
    const awayLogo = sofascoreClient.getTeamImageUrl({
      teamId: event.awayTeam.id,
    });

    const home: ITeam = {
      id: event.homeTeam.id,
      name: event.homeTeam.name,
      code: event.homeTeam.nameCode,
      logo: homeLogo,
    };

    const away: ITeam = {
      id: event.awayTeam.id,
      name: event.awayTeam.name,
      code: event.awayTeam.nameCode,
      logo: awayLogo,
    };

    return {
      id: event.id,
      home,
      away,
    };
  });

  return { matches, round };
};
