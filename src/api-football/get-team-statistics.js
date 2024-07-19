import { getAverageArr, getMaxArr } from "../utils.js";
import { httpClient } from "./http-client.js";

export const getTeamStatistics = async ({ teamId, leagueId, season }) => {
  const { data } = await httpClient.get("teams/statistics", {
    params: { league: leagueId, season, team: teamId },
  });
  const statistics = data.response;

  if (!statistics) {
    return;
  }

  const {
    goals,
    cards,
    form,
    biggest,
    clean_sheet,
    failed_to_score,
    penalty,
    lineups,
  } = statistics;

  const goalsStatistics = {
    for: {
      total: {
        home: goals.for.total.home,
        away: goals.for.total.away,
        total: goals.for.total.total,
      },
      avg: {
        home: goals.for.average.home,
        away: goals.for.average.away,
        total: goals.for.average.total,
      },
      max: {
        home: biggest.goals.for.home,
        away: biggest.goals.for.away,
        total: getMaxArr([biggest.goals.for.home, biggest.goals.for.away]),
      },
    },
    against: {
      total: {
        home: goals.against.total.home,
        away: goals.against.total.away,
        total: goals.against.total.total,
      },
      avg: {
        home: goals.against.average.home,
        away: goals.against.average.away,
        total: goals.against.average.total,
      },
      max: {
        home: biggest.goals.against.home,
        away: biggest.goals.against.away,
        total: biggest.goals.against.total,
      },
    },
  };

  const totalYellowCards = Object.values(cards.yellow).map(
    ({ total }) => total
  );
  const averageYellowCards = getAverageArr(totalYellowCards);

  const totalRedCards = Object.values(cards.red).map(({ total }) => total);
  const averageRedCards = getAverageArr(totalRedCards);

  return {
    goals: goalsStatistics,
    form: form.split("").reverse(),
    yellowCards: {
      total: totalYellowCards,
      avg: averageYellowCards,
    },
    redCards: {
      total: totalRedCards,
      avg: averageRedCards,
    },
    cleanSheet: clean_sheet,
    failedToScore: failed_to_score,
  };
};
