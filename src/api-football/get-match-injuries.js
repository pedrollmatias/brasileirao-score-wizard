import { httpClient } from "./http-client.js";

export const getMatchInjuries = async ({ fixtureId, home, away }) => {
  const { data } = await httpClient.get("injuries", {
    params: { fixture: fixtureId },
  });

  const players = data.response;

  const injuries = players
    .filter((player) => player.player.type === "Missing Fixture")
    .map((player) => ({
      playerId: player.player.id,
      name: player.player.name,
      team: player.team,
      type: player.player.type,
      reason: player.player.reason,
    }))
    .reduce(
      (acc, player) => {
        const isHome = player.team.id === home.id;
        const injuriedPlayer = { playerId: player.playerId, name: player.name };

        const injuriedHome = isHome
          ? [...acc.home.players, injuriedPlayer]
          : acc.home.players;
        const injuriedAway = isHome
          ? acc.away.players
          : [...acc.away.players, injuriedPlayer];

        return {
          home: {
            ...acc.home,
            players: injuriedHome,
          },
          away: {
            ...acc.away,
            players: injuriedAway,
          },
        };
      },
      {
        home: {
          teamId: home.id,
          name: home.name,
          players: [],
        },
        away: {
          teamId: away.id,
          name: away.name,
          players: [],
        },
      }
    );

  return injuries;
};

const getHomeAndAway = ({ home, teams }) => {
  const [team1, team2] = teams;

  if (home.id === team1.team.id) {
    return {
      home: team1,
      away: team2,
    };
  }

  return {
    home: team2,
    away: team1,
  };
};
