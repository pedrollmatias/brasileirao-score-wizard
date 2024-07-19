import { httpClient } from "./http-client.js";

export const getMatchPlayersStatistics = async ({
  fixtureId,
  teamId,
  mainPlayers,
  injuries,
}) => {
  const { data } = await httpClient.get("fixtures/players", {
    params: { fixture: fixtureId },
  });

  const { scorers, shooters, yellowCards, redCards, fouls } = mainPlayers;

  const teams = data.response;
  const team = getMatchTeam({ teamId, teams });
  const injuriedPlayersIds = injuries.map(({ playerId }) => playerId);

  const mainScorersMatchPerformance = getMainScorersMatchGoals({
    team,
    injuriedPlayersIds: injuriedPlayersIds,
    mainPlayers: scorers,
  });
  const mainShootersMatchPerformance = getMainShootersMatchShots({
    team,
    injuriedPlayersIds: injuriedPlayersIds,
    mainPlayers: shooters,
  });
  const mainYellowCardsMatchPerformance = getMainYellowCardsMatchYellowCards({
    team,
    injuriedPlayersIds: injuriedPlayersIds,
    mainPlayers: yellowCards,
  });
  const mainRedCardsMatchPerformance = getMainRedCardsMatchRedCards({
    team,
    injuriedPlayersIds: injuriedPlayersIds,
    mainPlayers: redCards,
  });
  const mainFoulsMatchPerformance = getMainFoulsMatchFouls({
    team,
    injuriedPlayersIds: injuriedPlayersIds,
    mainPlayers: fouls,
  });

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

const getMainScorersMatchGoals = ({
  team,
  injuriedPlayersIds,
  mainPlayers,
}) => {
  const { players } = team;
  const mainScorersIds = mainPlayers.map(({ playerId }) => playerId);

  return players
    .filter(
      ({ player }) =>
        mainScorersIds.includes(player.id) &&
        !injuriedPlayersIds.includes(player.id)
    )
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

const getMainShootersMatchShots = ({
  team,
  injuriedPlayersIds,
  mainPlayers,
}) => {
  const { players } = team;
  const mainShootersIds = mainPlayers.map(({ playerId }) => playerId);

  return players
    .filter(
      ({ player }) =>
        mainShootersIds.includes(player.id) &&
        !injuriedPlayersIds.includes(player.id)
    )
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

const getMainYellowCardsMatchYellowCards = ({
  team,
  injuriedPlayersIds,
  mainPlayers,
}) => {
  const { players } = team;
  const mainYellowCardsIds = mainPlayers.map(({ playerId }) => playerId);

  return players
    .filter(
      ({ player }) =>
        mainYellowCardsIds.includes(player.id) &&
        !injuriedPlayersIds.includes(player.id)
    )
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

const getMainRedCardsMatchRedCards = ({
  team,
  injuriedPlayersIds,
  mainPlayers,
}) => {
  const { players } = team;
  const mainRedCardsIds = mainPlayers.map(({ playerId }) => playerId);

  return players
    .filter(
      ({ player }) =>
        mainRedCardsIds.includes(player.id) &&
        !injuriedPlayersIds.includes(player.id)
    )
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

const getMainFoulsMatchFouls = ({ team, injuriedPlayersIds, mainPlayers }) => {
  const { players } = team;
  const mainFoulsIds = mainPlayers.map(({ playerId }) => playerId);

  return players
    .filter(
      ({ player }) =>
        mainFoulsIds.includes(player.id) &&
        !injuriedPlayersIds.includes(player.id)
    )
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
