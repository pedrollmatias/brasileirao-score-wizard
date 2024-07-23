import {
  ApiSofascore,
  SofascoreSeasonEnum,
  SofascoreTournamentEnum,
} from "../infra/api-sofascore/api-sofascore";
import { ITeamStanding } from "./domain.types";

export const getStanding = async ({
  tournamentId,
  seasonId,
}: {
  tournamentId: SofascoreTournamentEnum;
  seasonId: SofascoreSeasonEnum;
}): Promise<ITeamStanding[]> => {
  const sofascoreClient = new ApiSofascore();

  const data = await sofascoreClient.getTournamentStanding({
    tournamentId,
    seasonId,
  });

  const [standing] = data.standings;
  const { rows } = standing;

  return rows.map((team: any) => {
    const efficiency = Number(
      ((team.points / (team.matches * 3)) * 100).toFixed(2)
    );

    return {
      team: {
        id: team.team.id,
        name: team.team.name,
        logo: sofascoreClient.getTeamImageUrl({ teamId: team.team.id }),
      },
      rank: team.position,
      points: team.points,
      played: team.matches,
      wins: team.wins,
      losses: team.losses,
      draws: team.draws,
      goals: {
        for: team.scoresFor,
        against: team.scoresAgainst,
        difference: team.scoresFor - team.scoresAgainst,
      },
      efficiency,
    };
  });
};
