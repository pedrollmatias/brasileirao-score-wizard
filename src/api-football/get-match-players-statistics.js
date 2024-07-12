import { httpClient } from "./http-client.js";

export const getMatchPlayersStatistics = async ({
  home: {
    teamId: homeTeamId,
    topScorers: homeTopScorers,
    topShooters: homeTopShooters,
    topYellowCards: homeTopYellowCards,
    topRedCards: homeTopRedCards,
    topFouls: homeTopFouls,
  },
  away: {
    teamId: awayTeamId,
    topScorers: awayTopScorers,
    topShooters: awayTopShooters,
    topYellowCards: awayTopYellowCards,
    topRedCards: awayTopRedCards,
    topFouls: awayTopFouls,
  },
  fixtureId,
}) => {
  const { data } = await httpClient.get("fixtures/players", {
    params: { fixture: fixtureId },
  });

  const teams = data.response;
  const { away, home } = getHomeAndAway({ homeTeamId, awayTeamId, teams });

  const homeTopScorers = getTopScorersMatchGoals(home, homeTopScorers);
  const awayTopScorers = getTopScorersMatchGoals(away, awayTopScorers);
  const homeTopShooters = getTopShootersMatchShots(home, homeTopShooters);
  const awayTopShooters = getTopShootersMatchShots(away, awayTopShooters);
  const homeTopYellowCards = getTopYellowCardsMatchYellowCards(
    home,
    homeTopYellowCards
  );
  const awayTopYellowCards = getTopYellowCardsMatchYellowCards(
    away,
    awayTopYellowCards
  );
  const homeTopRedCards = getTopRedCardsMatchRedCards(home, homeTopRedCards);
  const awayTopRedCards = getTopRedCardsMatchRedCards(away, awayTopRedCards);
  const homeTopFouls = getTopFoulsMatchFouls(home, homeTopFouls);
  const awayTopFouls = getTopFoulsMatchFouls(away, awayTopFouls);

  return {
    home: {
      teamId: homeTeamId,
      name: home.team.name,
      topScorers: homeTopScorers,
      topShooters: homeTopShooters,
      topYellowCards: homeTopYellowCards,
      topRedCards: homeTopRedCards,
      topFouls: homeTopFouls,
    },
    away: {
      teamId: awayTeamId,
      name: away.team.name,
      topScorers: awayTopScorers,
      topShooters: awayTopShooters,
      topYellowCards: awayTopYellowCards,
      topRedCards: awayTopRedCards,
      topFouls: awayTopFouls,
    },
  };
};

const getHomeAndAway = ({ homeTeamId, teams }) => {
  const [team1, team2] = teams;

  if (homeTeamId === team1.team.id) {
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

const getTopScorersMatchGoals = (team, topScorers) => {
  const { players } = team;
  const topScorersIds = topScorers.map(({ playerId }) => playerId);

  const topScorers = players
    .filter((player) => topScorersIds.includes(player.id))
    .map((player) => {
      const { id: playerId, name } = player;
      const [stats] = player.statistics;
      const goals = stats.goals;

      return {
        playerId,
        name,
        goals: goals.total ?? 0,
      };
    });
};

const getTopShootersMatchShots = (team, topShooters) => {
  const { players } = team;
  const topShootersIds = topShooters.map(({ playerId }) => playerId);

  const topShooters = players
    .filter((player) => topShootersIds.includes(player.id))
    .map((player) => {
      const { id: playerId, name } = player;
      const [stats] = player.statistics;
      const shots = stats.shots;

      return {
        playerId,
        name,
        shots: {
          total: shots.total ?? 0,
          on: shots.on ?? 0,
        },
      };
    });
};

const getTopYellowCardsMatchYellowCards = (team, topYellowCards) => {
  const { players } = team;
  const topYellowCardsIds = topYellowCards.map(({ playerId }) => playerId);

  const topYellowCards = players
    .filter((player) => topYellowCardsIds.includes(player.id))
    .map((player) => {
      const { id: playerId, name } = player;
      const [stats] = player.statistics;
      const cards = stats.cards;

      return {
        playerId,
        name,
        cards: cards.yellow ?? 0,
      };
    });
};

const getTopRedCardsMatchRedCards = (team, topRedCards) => {
  const { players } = team;
  const topRedCardsIds = topRedCards.map(({ playerId }) => playerId);

  const topRedCards = players
    .filter((player) => topRedCardsIds.includes(player.id))
    .map((player) => {
      const { id: playerId, name } = player;
      const [stats] = player.statistics;
      const cards = stats.cards;

      return {
        playerId,
        name,
        cards: cards.red ?? 0,
      };
    });
};

const getTopFoulsMatchFouls = (team, topFouls) => {
  const { players } = team;
  const topFoulsIds = topFouls.map(({ playerId }) => playerId);

  const topFouls = players
    .filter((player) => topFoulsIds.includes(player.id))
    .map((player) => {
      const { id: playerId, name } = player;
      const [stats] = player.statistics;
      const fouls = stats.fouls;

      return {
        playerId,
        name,
        fouls: fouls.committed ?? 0,
      };
    });
};
