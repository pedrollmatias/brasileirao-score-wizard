import { httpClient } from "./http-client.js";

export const getTeamPlayersStatistics = async ({
  teamId,
  leagueId,
  season,
}) => {
  const { data } = await httpClient.get("players", {
    params: { league: leagueId, season, team: teamId },
  });
  const players = data.response;

  const topScorers = getTopScorers(players);
  const topShooters = getTopShooters(players);
  const topYellowCards = getTopYellowCards(players);
  const topRedCards = getTopRedCards(players);
  const topFouls = getTopFouls(players);

  return {
    teamId,
    topScorers,
    topShooters,
    topYellowCards,
    topRedCards,
    topFouls,
  };
};

const getTopScorers = (players) => {
  return players
    .sort((player1, player2) => {
      const [player1Stats] = player1.statistics;
      const [player2Stats] = player2.statistics;

      const { goals: player1Goals } = player1Stats;
      const { goals: player2Goals } = player2Stats;

      return player2Goals.total - player1Goals.total;
    })
    .slice(0, 3)
    .map((player) => {
      const { id, name } = player.player;
      const [playerStats] = player.statistics;
      const goals = playerStats.goals;

      return {
        playerId: id,
        name,
        goals: goals.total ?? 0,
      };
    });
};

const getTopShooters = (players) => {
  return players
    .sort((player1, player2) => {
      const [player1Stats] = player1.statistics;
      const [player2Stats] = player2.statistics;

      const { shots: player1Shots } = player1Stats;
      const { shots: player2Shots } = player2Stats;

      return player2Shots.total - player1Shots.total;
    })
    .slice(0, 5)
    .map((player) => {
      const { id, name } = player.player;
      const [playerStats] = player.statistics;
      const shots = playerStats.shots;

      return {
        playerId: id,
        name,
        shots: {
          total: shots.total ?? 0,
          on: shots.on ?? 0,
        },
      };
    });
};

const getTopYellowCards = (players) => {
  return players
    .sort((player1, player2) => {
      const [player1Stats] = player1.statistics;
      const [player2Stats] = player2.statistics;

      const { cards: player1Cards } = player1Stats;
      const { cards: player2Cards } = player2Stats;

      return player2Cards.yellow - player1Cards.yellow;
    })
    .slice(0, 5)
    .map((player) => {
      const { id, name } = player.player;
      const [playerStats] = player.statistics;
      const cards = playerStats.cards;

      return {
        playerId: id,
        name,
        cards: cards.yellow ?? 0,
      };
    });
};

const getTopRedCards = (players) => {
  return players
    .sort((player1, player2) => {
      const [player1Stats] = player1.statistics;
      const [player2Stats] = player2.statistics;

      const { cards: player1Cards } = player1Stats;
      const { cards: player2Cards } = player2Stats;

      return player2Cards.red - player1Cards.red;
    })
    .slice(0, 5)
    .map((player) => {
      const { id, name } = player.player;
      const [playerStats] = player.statistics;
      const cards = playerStats.cards;

      return {
        playerId: id,
        name,
        cards: cards.red ?? 0,
      };
    });
};

const getTopFouls = (players) => {
  return players
    .sort((player1, player2) => {
      const [player1Stats] = player1.statistics;
      const [player2Stats] = player2.statistics;

      const { fouls: player1Fouls } = player1Stats;
      const { fouls: player2Fouls } = player2Stats;

      return player2Fouls.committed - player1Fouls.committed;
    })
    .slice(0, 5)
    .map((player) => {
      const { id, name } = player.player;
      const [playerStats] = player.statistics;
      const fouls = playerStats.fouls;

      return {
        playerId: id,
        name,
        fouls: fouls.committed ?? 0,
      };
    });
};
