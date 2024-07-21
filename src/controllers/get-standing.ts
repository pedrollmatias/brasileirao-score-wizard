import {
  ApiSofascore,
  SeasonEnum,
  TournamentEnum,
} from "../infra/api-sofascore/api-sofascore";
import { ITeam } from "./domain.types";

export interface ITeamStanding {
  rank: number;
  team: ITeam;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: {
    for: number;
    against: number;
    difference: number;
  };
  lastMatches?: string[];
  efficiency: number;
}

export const getStanding = async ({
  tournamentId,
  seasonId,
}: {
  tournamentId: TournamentEnum;
  seasonId: SeasonEnum;
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
