import { httpClient } from "./http-client.js";

export const getMatchPlayersStatistics = async ({
  fixtureId,
  teamId,
  mainPlayers,
}) => {
  const { data } = await httpClient.get("fixtures/players", {
    params: { fixture: fixtureId },
  });

  const { scorers, shooters, yellowCards, redCards, fouls } = mainPlayers;

  const teams = data.response;
  const team = getMatchTeam({ teamId, teams });

  const mainScorersMatchPerformance = getMainScorersMatchGoals(team, scorers);
  const mainShootersMatchPerformance = getMainShootersMatchShots(
    team,
    shooters
  );
  const mainYellowCardsMatchPerformance = getMainYellowCardsMatchYellowCards(
    team,
    yellowCards
  );
  const mainRedCardsMatchPerformance = getMainRedCardsMatchRedCards(
    team,
    redCards
  );
  const mainFoulsMatchPerformance = getMainFoulsMatchFouls(team, fouls);

  return {
    team,
    mainPlayers: {
      scorers: mainScorersMatchPerformance,
      shooters: mainShootersMatchPerformance,
      yellowCards: mainYellowCardsMatchPerformance,
      redCards: mainRedCardsMatchPerformance,
      fouls: mainFoulsMatchPerformance,
    },
  };
};

const getMatchTeam = ({ teamId, teams }) => {
  const [team1, team2] = teams;

  if (teamId === team1.team.id) {
    return team1;
  }

  return team2;
};

const getMainScorersMatchGoals = (team, mainScorers) => {
  const { players } = team;
  const mainScorersIds = mainScorers.map(({ playerId }) => playerId);

  return players
    .filter(({ player }) => mainScorersIds.includes(player.id))
    .map(({ player, statistics }) => {
      const { id: playerId, name } = player;
      const [stats] = statistics;
      const goals = stats.goals;

      return {
        playerId,
        name,
        goals: goals.total ?? 0,
      };
    });
};

const getMainShootersMatchShots = (team, mainShooters) => {
  const { players } = team;
  const mainShootersIds = mainShooters.map(({ playerId }) => playerId);

  return players
    .filter(({ player }) => mainShootersIds.includes(player.id))
    .map(({ player, statistics }) => {
      const { id: playerId, name } = player;
      const [stats] = statistics;
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

const getMainYellowCardsMatchYellowCards = (team, mainYellowCards) => {
  const { players } = team;
  const mainYellowCardsIds = mainYellowCards.map(({ playerId }) => playerId);

  return players
    .filter(({ player }) => mainYellowCardsIds.includes(player.id))
    .map(({ player, statistics }) => {
      const { id: playerId, name } = player;
      const [stats] = statistics;
      const cards = stats.cards;

      return {
        playerId,
        name,
        cards: cards.yellow ?? 0,
      };
    });
};

const getMainRedCardsMatchRedCards = (team, mainRedCards) => {
  const { players } = team;
  const mainRedCardsIds = mainRedCards.map(({ playerId }) => playerId);

  return players
    .filter(({ player }) => mainRedCardsIds.includes(player.id))
    .map(({ player, statistics }) => {
      const { id: playerId, name } = player;
      const [stats] = statistics;
      const cards = stats.cards;

      return {
        playerId,
        name,
        cards: cards.red ?? 0,
      };
    });
};

const getMainFoulsMatchFouls = (team, mainFouls) => {
  const { players } = team;
  const mainFoulsIds = mainFouls.map(({ playerId }) => playerId);

  return players
    .filter(({ player }) => mainFoulsIds.includes(player.id))
    .map(({ player, statistics }) => {
      const { id: playerId, name } = player;
      const [stats] = statistics;
      const fouls = stats.fouls;

      return {
        playerId,
        name,
        fouls: fouls.committed ?? 0,
      };
    });
};
