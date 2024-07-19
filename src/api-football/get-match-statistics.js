import { MatchStatisticsTypeEnum } from "./constants.js";
import { httpClient } from "./http-client.js";

export const getMatchStatistics = async ({ fixtureId, home }) => {
  const { data } = await httpClient.get("fixtures/statistics", {
    params: { fixture: fixtureId },
  });

  const teams = data.response;

  if (!teams.length) {
    return;
  }

  const { away: _away, home: _home } = getHomeAndAway({ home, teams });

  return {
    home: {
      id: _home.team.id,
      name: _home.team.name,
      ...getStatistics(_home.statistics),
    },
    away: {
      id: _away.team.id,
      name: _away.team.name,
      ...getStatistics(_away.statistics),
    },
  };
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

const getStatistics = (statistics) => {
  const totalShots = statistics.find(
    ({ type }) => type === MatchStatisticsTypeEnum.TOTAL_SHOTS
  );
  const onShots = statistics.find(
    ({ type }) => type === MatchStatisticsTypeEnum.SHOTS_ON_GOAL
  );
  const corners = statistics.find(
    ({ type }) => type === MatchStatisticsTypeEnum.CORNER_KICKS
  );
  const yellowCards = statistics.find(
    ({ type }) => type === MatchStatisticsTypeEnum.YELLOW_CARDS
  );
  const redCards = statistics.find(
    ({ type }) => type === MatchStatisticsTypeEnum.RED_CARDS
  );
  const fouls = statistics.find(
    ({ type }) => type === MatchStatisticsTypeEnum.FOULS
  );
  const ballPossession = statistics.find(
    ({ type }) => type === MatchStatisticsTypeEnum.BALL_POSSESSION
  );

  return {
    shots: {
      total: totalShots?.value ?? 0,
      on: onShots?.value ?? 0,
    },
    corners: corners?.value ?? 0,
    yellowCards: yellowCards?.value ?? 0,
    redCards: redCards?.value ?? 0,
    fouls: fouls?.value ?? 0,
    ballPossession: ballPossession.value,
  };
};
