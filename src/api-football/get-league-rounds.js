import { httpClient } from "./http-client.js";

export const getLeagueRounds = async ({ leagueId, season }) => {
  const { data: dataRounds } = await httpClient.get("fixtures/rounds", {
    params: { league: leagueId, season, current: true },
  });
  const [roundStr] = dataRounds.response;
  const round = roundToNumber(roundStr);

  const { data } = await httpClient.get("fixtures", {
    params: { league: leagueId, season },
  });

  const { response: matches } = data;

  const previousRounds = matches
    .filter((match) => roundToNumber(match.league.round) < round)
    .map((match) => ({
      fixtureId: match.fixture.id,
      round: roundToNumber(match.league.round),
      home: match.teams.home,
      away: match.teams.away,
      winner: match.teams.home.winner
        ? match.teams.home.name
        : match.teams.away.winner
        ? match.teams.away.name
        : "N/A",
      score: {
        home: match.goals.home ?? 0,
        away: match.goals.away ?? 0,
      },
    }))
    .sort((a, b) => a.round - b.round)
    .reduce((acc, match) => {
      const { round } = match;

      return {
        ...acc,
        [round]: [...(acc[round] || []), match],
      };
    }, {});

  const nextRound = matches
    .filter((match) => roundToNumber(match.league.round) === round)
    .map((match) => ({
      fixtureId: match.fixture.id,
      home: {
        id: match.teams.home.id,
        name: match.teams.home.name,
      },
      away: {
        id: match.teams.away.id,
        name: match.teams.away.name,
      },
    }));

  return {
    round,
    previousRounds,
    nextRound,
  };
};

const roundToNumber = (round) => {
  const roundMap = {
    "Regular Season - 1": 1,
    "Regular Season - 2": 2,
    "Regular Season - 3": 3,
    "Regular Season - 4": 4,
    "Regular Season - 5": 5,
    "Regular Season - 6": 6,
    "Regular Season - 7": 7,
    "Regular Season - 8": 8,
    "Regular Season - 9": 9,
    "Regular Season - 10": 10,
    "Regular Season - 11": 11,
    "Regular Season - 12": 12,
    "Regular Season - 13": 13,
    "Regular Season - 14": 14,
    "Regular Season - 15": 15,
    "Regular Season - 16": 16,
    "Regular Season - 17": 17,
    "Regular Season - 18": 18,
    "Regular Season - 19": 19,
    "Regular Season - 20": 20,
    "Regular Season - 21": 21,
    "Regular Season - 22": 22,
    "Regular Season - 23": 23,
    "Regular Season - 24": 24,
    "Regular Season - 25": 25,
    "Regular Season - 26": 26,
    "Regular Season - 27": 27,
    "Regular Season - 28": 28,
    "Regular Season - 29": 29,
    "Regular Season - 30": 30,
    "Regular Season - 31": 31,
    "Regular Season - 32": 32,
    "Regular Season - 33": 33,
    "Regular Season - 34": 34,
    "Regular Season - 35": 35,
    "Regular Season - 36": 36,
    "Regular Season - 37": 37,
    "Regular Season - 38": 38,
  };

  return roundMap[round];
};
