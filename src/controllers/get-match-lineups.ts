import { ApiSofascore } from "../infra/api-sofascore/api-sofascore";
import { ILineup, ITeam } from "./domain.types";

export const getMatchLineups = async ({ eventId }: { eventId: string }) => {
  const sofascoreClient = new ApiSofascore();

  const lineups = await sofascoreClient.getEventLineups({ eventId });

  if (!lineups) {
    return;
  }

  const { home, away } = lineups;

  const homeLineupPlayers = home.players
    .filter(({ substitute }: any) => !substitute)
    .map(({ player }: any) => ({
      id: player.id,
      name: player.name,
      position: player.position,
    }));

  const awayLineupPlayers = away.players
    .filter(({ substitute }: any) => !substitute)
    .map(({ player }: any) => ({
      id: player.id,
      name: player.name,
      position: player.position,
    }));

  const homeLineup: ILineup = {
    players: homeLineupPlayers,
    formation: home.formation,
  };
  const awayLineup: ILineup = {
    players: awayLineupPlayers,
    formation: away.formation,
  };

  return {
    home: homeLineup,
    away: awayLineup,
  };
};
