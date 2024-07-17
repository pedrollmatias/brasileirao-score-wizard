import { httpClient } from "./http-client.js";

export const getTeamPlayersStatistics = async ({
  teamId,
  leagueId,
  season,
}) => {
  const { data } = await httpClient.get("players/squads", {
    params: { team: teamId },
  });

  const [{ players: squad }] = data.response;
  const squadSize = squad.length;
  const pageSize = 20;
  const requestsAmount = Math.ceil(squadSize / pageSize);

  const players = (
    await Promise.all(
      Array.from({ length: requestsAmount }).map(async (_, index) => {
        const page = index + 1;
        const { data } = await httpClient.get("players", {
          params: { league: leagueId, season, team: teamId, page },
        });

        return data.response;
      })
    )
  ).flat();

  const mainScorers = getMainScorers(players);
  const mainShooters = getMainShooters(players);
  const mainYellowCards = getMainYellowCards(players);
  const mainRedCards = getMainRedCards(players);
  const mainFouls = getMainFouls(players);


  return {
    team: {
      id: teamId,
    },
    mainPlayers: {
      scorers: mainScorers,
      shooters: mainShooters,
      yellowCards: mainYellowCards,
      redCards: mainRedCards,
      fouls: mainFouls,
    },
  };
};

const getMainScorers = (players) => {
  return players
    .filter((player) => {
      const [playerStats] = player.statistics;
      const { goals } = playerStats;

      return goals.total > 0;
    })
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
      const { appearences } = playerStats.games;
      const avg = ((goals.total ?? 0) / appearences).toFixed("1");

      return {
        playerId: id,
        name,
        goals: { total: goals.total ?? 0, avg },
      };
    });
};

const getMainShooters = (players) => {
  return players
    .filter((player) => {
      const [playerStats] = player.statistics;
      const { shots } = playerStats;

      return shots.total > 0;
    })
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
      const { appearences } = playerStats.games;
      const avgTotal = ((shots.total ?? 0) / appearences).toFixed("1");
      const avgOn = ((shots.on ?? 0) / appearences).toFixed("1");

      return {
        playerId: id,
        name,
        shots: {
          total: { total: shots.total ?? 0, avg: avgTotal },
          on: { total: shots.on ?? 0, avg: avgOn },
        },
      };
    });
};

const getMainYellowCards = (players) => {
  return players
    .filter((player) => {
      const [playerStats] = player.statistics;
      const { cards } = playerStats;

      return cards.yellow > 0;
    })
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
      const { appearences } = playerStats.games;
      const avg = ((cards.yellow ?? 0) / appearences).toFixed("1");

      return {
        playerId: id,
        name,
        cards: { total: cards.yellow ?? 0, avg },
      };
    });
};

const getMainRedCards = (players) => {
  return players
    .filter((player) => {
      const [playerStats] = player.statistics;
      const { cards } = playerStats;

      return cards.red > 0;
    })
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
      const { appearences } = playerStats.games;
      const avg = ((cards.red ?? 0) / appearences).toFixed("1");

      return {
        playerId: id,
        name,
        cards: { total: cards.red ?? 0, avg },
      };
    });
};

const getMainFouls = (players) => {
  return players
    .filter((player) => {
      const [playerStats] = player.statistics;
      const { fouls } = playerStats;

      return fouls.committed > 0;
    })
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
      const { appearences } = playerStats.games;
      const avg = ((fouls.committed ?? 0) / appearences).toFixed("1");

      return {
        playerId: id,
        name,
        fouls: { total: fouls.committed ?? 0, avg },
      };
    });
};
