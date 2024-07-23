import { ApiFootball } from "../infra/api-football/api-football";
import { IMatchInjuries, ITeam } from "./domain.types";

export const getMatchInjuries = async ({
  fixtureId,
  home,
}: {
  fixtureId: string;
  home: ITeam;
}): Promise<IMatchInjuries> => {
  const apiFootballClient = new ApiFootball();

  const injuries = await apiFootballClient.getMatchInjuries({
    fixtureId,
  });

  return injuries.reduce(
    (matchInjuries: IMatchInjuries, injury: any) => {
      const { team, player } = injury;

      if (team.id === home.id) {
        return {
          ...matchInjuries,
          home: {
            ...matchInjuries.home,
            players: [
              ...(matchInjuries.home?.players ?? []),
              {
                id: player.id,
                name: player.name,
              },
            ],
          },
        };
      }

      return {
        ...matchInjuries,
        away: {
          ...matchInjuries.away,
          players: [
            ...(matchInjuries.away?.players ?? []),
            {
              id: player.id,
              name: player.name,
            },
          ],
        },
      };
    },
    {
      away: {
        players: [],
      },
      home: {
        players: [],
      },
    }
  );
};
